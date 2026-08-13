import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { shabbatBlock } from "@/lib/shabbat";
import {
  getWhatsAppConfig, sendInvitation, toE164, policyFor,
  rollingWindowUsage, SECONDS_PER_MESSAGE, SEND_CONCURRENCY,
  fetchAccountHealth, warmupCap, recentPeakRecipients, sendGalleryReady,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Hourly sender.
 *
 * Everything else in this system needs a human to press a button, which is why
 * the retry queue sat full and nothing drained it: the only scheduled job was
 * /api/cron/daily, which is dry-run only and refuses to run without
 * CRON_SECRET. A queue nobody drains is a list of guests nobody contacts.
 *
 * It lives under /api/cron rather than /api/admin because Vercel's scheduler
 * has no admin session — the middleware treats /api/cron as public, so the
 * CRON_SECRET check below is the only thing standing in front of it and must
 * not be weakened.
 *
 * Order matters: retries first, because those guests have already been failed
 * once, then first-contact invitations. Both draw on the same window budget.
 */

/* Every event with a future date, its own invitation card, and guests still
   waiting. Hardcoding one event id meant the next paying couple's invitations
   would never go out on their own, no matter how correctly everything else
   behaved. */
const MAX_EVENTS_PER_RUN = 3;

/* Israel is UTC+3 in August. Nothing goes out before 09:00 local — a wedding
   invitation arriving at 04:00 gets reported, and reports are what restricted
   this number in the first place.

   The second run moved from 15:00 to the evening, and the reason is in our own
   analytics: invitations sent at 10:00 are opened in a clear peak at 22:00 —
   51 opens in that hour alone, against single digits through the working day.
   People see the message when it arrives and deal with it at night, so a 15:00
   send spends ten hours decaying before anyone acts on it.

   It is scheduled at 19:00 rather than 20:00 on purpose. Vercel's Hobby cron
   is approximate — this morning's 10:00 run actually fired at 10:51 — so
   aiming at the hour we want lands past it, while aiming an hour early puts a
   typical delay exactly on it. An on-time run at 19:00 is still a good hour to
   reach people, which makes the early aim safe in both directions.

   The window closes at 21:59 so that even an unusually late run still goes
   out, rather than being skipped entirely. Nothing may go later: past 22:00 an
   invitation reads as an intrusion, and an intrusion is what a spam report is
   made of. */
const HOUR_START_UTC = 6;
const HOUR_END_UTC = 18;

/* Two runs cannot land inside this window. The scheduled runs are nine hours
   apart, so this only ever catches an overlap nobody intended. */
const MIN_MINUTES_BETWEEN_RUNS = 10;

/* A run stakes this the moment it decides to send, and clears the way for the
   next scheduled run a few minutes later. Shorter than the gap between the two
   daily crons by a wide margin, so a crashed run never blocks a real one. */
const RUN_CLAIM = "run_started";
const CLAIM_TTL_MINUTES = 4;

/* Heal guests whose open was recorded in one place and not the other.

   Noya opened her invitation twice on 10/8. Both rsvp_opened events landed;
   guests.opened_at stayed null. She told us the page "did not work", and the
   data said she had never looked — so the one guest who could prove the bug
   existed appeared, from every screen, to be someone who had ignored the
   invitation. Nothing in the product could have surfaced that, because nothing
   compared the two.

   The write path is fixed, but "we fixed the write" is a promise about code
   that has not been written yet — the next lost write will come from a dropped
   connection, an aborted request, an RLS change, or something nobody has
   thought of. This runs twice a day, for every couple, and repairs the
   disagreement whichever way it was caused. That is the difference between a
   bug that was fixed and a bug that cannot persist.

   Deliberately one-directional: an event can restore a missing column, and a
   column can never invent a missing event, so this only ever adds information
   that a guest's own visit already proved. It never clears opened_at, and it
   never touches status or an answer. */
async function reconcileOpens(
  sb: ReturnType<typeof createServerClient>,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: evs } = await sb.from("events").select("id").gte("date", today);
  const eventIds = (evs ?? []).map(e => e.id as string);
  if (!eventIds.length) return 0;

  const { data: blind } = await sb.from("guests")
    .select("id").in("event_id", eventIds).is("opened_at", null);
  const ids = (blind ?? []).map(g => g.id as string);
  if (!ids.length) return 0;

  /* Earliest open per guest — the moment they actually first looked, not the
     moment we noticed the column was empty. Backfilling with now() would put a
     wrong timestamp on a real event and quietly corrupt every "how long from
     delivery to open" figure we have. */
  const earliest = new Map<string, string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb.from("guest_events")
      .select("guest_id, created_at")
      .eq("event_type", "rsvp_opened")
      .in("guest_id", ids.slice(i, i + 100));
    for (const e of data ?? []) {
      const g = e.guest_id as string;
      const at = e.created_at as string;
      if (!earliest.has(g) || at < earliest.get(g)!) earliest.set(g, at);
    }
  }

  let healed = 0;
  for (const [guestId, at] of earliest) {
    const { error } = await sb.from("guests")
      .update({ opened_at: at }).eq("id", guestId).is("opened_at", null);
    if (!error) healed++;
  }
  return healed;
}

/* Apply delivery reports that arrived before the message they describe.

   The wa_messages row is written after the send call returns, and Meta can
   report delivery in milliseconds — so the report sometimes wins that race,
   the UPDATE matches nothing, and PostgREST reports success for updating
   nothing. That report is the ONLY notice we ever get that a guest did or did
   not receive their invitation, and it was evaporating.

   The webhook now parks those instead of dropping them, and this puts them
   where they belong on the next run. Late is fine; lost is not.

   Attempts are counted so a wamid that never turns up — a message from a
   deleted event, a payload for another account — stops being retried forever
   rather than accumulating into a queue nobody drains, which is the shape of
   the failure this whole day was spent removing. */
const ORPHAN_MAX_ATTEMPTS = 20;

async function applyOrphanStatuses(
  sb: ReturnType<typeof createServerClient>,
): Promise<number> {
  const { data: orphans } = await sb
    .from("wa_status_orphans")
    .select("id, wamid, status, error, error_code, attempts")
    .lt("attempts", ORPHAN_MAX_ATTEMPTS)
    .limit(200);
  if (!orphans?.length) return 0;

  let applied = 0;
  for (const o of orphans) {
    const { data: hit } = await sb.from("wa_messages")
      .update({
        status: o.status, error: o.error, error_code: o.error_code,
        updated_at: new Date().toISOString(),
      })
      .eq("wamid", o.wamid).select("id");

    if (hit?.length) {
      await sb.from("wa_status_orphans").delete().eq("id", o.id);
      applied++;
    } else {
      await sb.from("wa_status_orphans")
        .update({ attempts: (o.attempts ?? 0) + 1 }).eq("id", o.id);
    }
  }
  return applied;
}

/* Tell guests the gallery is ready — the one message that comes after.

   The template was approved before the wedding and nothing has ever sent it.
   An approved template is permission, not a mechanism; the couple would have
   discovered that the week after their wedding, by hand, guest by guest.

   Three gates, each because skipping it does real harm:

     the date has passed  obvious, and not sufficient on its own
     gallery_ready        the couple confirms the photos are actually up. No
                          machine can know this, and "the gallery is ready"
                          sent to an empty gallery is worse than silence
     wants_photos         only guests who asked. That tick is what makes this
                          a fulfilment of their own request rather than an
                          unsolicited one — why Meta approved it as UTILITY,
                          and why it escapes the recipient marketing cap that
                          cost sixteen guests their invitation today

   Already-sent guests are excluded by their own guest_events row rather than
   by a flag on the event, so a run that dies halfway resumes exactly where it
   stopped and nobody is messaged twice. */
async function notifyGallery(
  sb: ReturnType<typeof createServerClient>,
  cfg: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
  budget: number,
): Promise<{ sent: number; event?: string }> {
  if (budget <= 0) return { sent: 0 };
  const today = new Date().toISOString().slice(0, 10);

  const { data: evs } = await sb.from("events")
    .select("id, name, gallery_ready, gallery_notified_at")
    .lt("date", today).eq("gallery_ready", true).is("gallery_notified_at", null)
    .order("date", { ascending: false }).limit(1);
  const ev = (evs ?? [])[0];
  if (!ev) return { sent: 0 };

  const { data: album } = await sb.from("gallery_albums")
    .select("public_token").eq("event_id", ev.id).maybeSingle();
  if (!album?.public_token) return { sent: 0 };

  const { data: guests } = await sb.from("guests")
    .select("id, phone, wants_photos, category")
    .eq("event_id", ev.id).eq("wants_photos", true);
  const targets = (guests ?? []).filter(g => g.category !== "demo" && g.phone);
  if (!targets.length) return { sent: 0 };

  const { data: done } = await sb.from("guest_events").select("guest_id")
    .eq("event_type", "gallery_sent").in("guest_id", targets.map(g => g.id as string));
  const already = new Set((done ?? []).map(r => r.guest_id as string));

  const todo = targets.filter(g => !already.has(g.id as string)).slice(0, budget);
  if (!todo.length) {
    /* Everyone who asked has been told — close the event so later runs skip it */
    await sb.from("events")
      .update({ gallery_notified_at: new Date().toISOString() }).eq("id", ev.id);
    return { sent: 0, event: ev.name as string };
  }

  let sent = 0;
  for (let i = 0; i < todo.length; i += SEND_CONCURRENCY) {
    const batch = await Promise.all(
      todo.slice(i, i + SEND_CONCURRENCY).map(async g => ({
        g, res: await sendGalleryReady(cfg, g.phone as string, album.public_token as string),
      })),
    );
    for (const { g, res } of batch) {
      if (!res.ok) continue;
      sent++;
      await sb.from("guest_events").insert({ guest_id: g.id, event_type: "gallery_sent" });
      if (res.messageId) {
        await sb.from("wa_messages").insert({
          event_id: ev.id, guest_id: g.id, wa_phone: toE164(g.phone as string) ?? "",
          direction: "out", body: "גלריית התמונות מוכנה",
          wamid: res.messageId, status: "accepted",
        });
      }
    }
  }
  return { sent, event: ev.name as string };
}

/* One row per run, whatever the outcome.

   Everything worth knowing already existed — it went into the HTTP response,
   which went to Vercel's logs, which nobody opens and which age out. So "did
   the 15:00 run send anything?" could only be answered by querying the
   database by hand, which is not a product; it is the same shape as every
   other failure here, where something happened and the only record of it was
   somewhere nobody looks.

   Written on every exit path, including the ones that send nothing. A run that
   stopped because the window was full is not a missing row, it is a row that
   says window_full — and a GAP in this table means the scheduler never fired,
   which is the one failure the sender itself can never report.

   Fails soft and last: bookkeeping must never be able to break sending. */
async function record(
  sb: ReturnType<typeof createServerClient>,
  payload: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) {
  try {
    await sb.from("wa_runs").insert({
      sent: (payload.sent as number) ?? 0,
      failed: (payload.failed as number) ?? 0,
      healed: (payload.healed as number) ?? 0,
      reason: (payload.reason as string) ?? null,
      stopped: (payload.stopped as string) ?? null,
      details: (payload.details as object) ?? {},
      ...extra,
    });
  } catch { /* a log that cannot be written must not stop a wedding invitation */ }
  return NextResponse.json(payload);
}

/* A crash must leave the same trace as any other outcome.
 *
 * There was no handler around the run. Anything thrown after the first send —
 * a dropped connection, a null where a guest was expected — returned a 500 and
 * wrote no wa_runs row at all. Messages already sent stayed sent, and the
 * books said the run never happened, which is indistinguishable on
 * /admin/sending from a cron that never fired. The one failure you cannot see
 * is the one that looks like silence.
 */
export async function GET(req: NextRequest) {
  try {
    return await runSend(req);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[wa-send:crash]", message);
    try {
      await record(createServerClient(), { sent: 0, reason: "crashed", error: message });
    } catch { /* if even this fails there is nothing left to try */ }
    return NextResponse.json({ error: "crashed", message }, { status: 500 });
  }
}

async function runSend(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET not set — refusing to run unauthenticated" },
      { status: 500 },
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cfg = getWhatsAppConfig();
  if (!cfg) return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });

  const sb = createServerClient();
  /* The clock the run is actually bounded by.
   *
   * timeCap below estimates from pacing constants alone and got it wrong: on
   * 13/08 it allowed 72, the run sent 66, and the function was killed before it
   * could write its own completion row. The estimate does not include the two
   * database writes per message, the health fetch, or reconciliation — and
   * Vercel does not extend the invocation to be fair.
   *
   * A real deadline needs no arithmetic and cannot drift when the constants or
   * the database latency change. The loop checks it and stops early with what
   * it has, which is always better than being killed holding it. */
  const startedAt = Date.now();
  const DEADLINE_MS = (maxDuration - 15) * 1000;

  /* Before any early return. Reconciliation is not part of sending, and a run
     that goes home because it is 2am or because the window is full must still
     leave the books straight. */
  const healed = await reconcileOpens(sb);
  const statusesApplied = await applyOrphanStatuses(sb);

  /* Shabbat, before the hour check and before anything is claimed.
   *
   * Placed after reconciliation on purpose — the books are still balanced on a
   * Saturday, nothing is sent. See src/lib/shabbat.ts for why the window is
   * wider than Shabbat itself. */
  const shabbat = shabbatBlock();
  if (shabbat.blocked)
    return record(sb, { sent: 0, reason: shabbat.reason, healed, statusesApplied });

  const hour = new Date().getUTCHours();
  if (hour < HOUR_START_UTC || hour > HOUR_END_UTC)
    return record(sb, { sent: 0, reason: "outside_sending_hours", healed, statusesApplied });

  /* Refuse to start if a run that actually sent has just been here.

     A run takes about a minute and prints nothing until it finishes, so it
     looks frozen — and today it was started twice for exactly that reason.
     Between them, 91 unique recipients went out in sixty seconds, against the
     82 at which this number was restricted on 9/8.

     The operator was not wrong to try again; a command that is silent for a
     minute invites it. The defect was that nothing here objected. Two
     schedulers firing at once, a retried request, an impatient second tab —
     all produce the same overlap, and the rolling-window check cannot stop it
     because both runs read the window before either has written to it.

     Only runs that SENT count. One that stopped on window_full consumed
     nothing and must not lock the door behind it — including the row this
     branch is about to write. */
  const { data: justRan } = await sb.from("wa_runs")
    .select("created_at").gt("sent", 0)
    .gte("created_at", new Date(Date.now() - MIN_MINUTES_BETWEEN_RUNS * 60_000).toISOString())
    .limit(1);
  if (justRan?.length) {
    return record(sb, {
      sent: 0, reason: "run_too_soon", healed,
      lastRunAt: justRan[0].created_at,
    });
  }

  /* The check above reads rows that are only written when a run FINISHES, so it
     cannot see a run that is still going. Two invocations starting in the same
     minute both find an empty table and both send.
     That is not hypothetical: on 11/08 a run at 13:00 sent 48 and a run at
     13:01 sent 43 — 91 unique recipients in two minutes, against the 82 at
     which this number was restricted on 9/8. The 16:04 run then found the
     window full. The lock was added after the first time this happened and
     never actually closed the door.
     So the claim is staked here, before a single message goes out, and the gate
     below refuses to start if another run staked one in the last few minutes.
     Claims expire quickly — a run takes about a minute — so a crash cannot lock
     out the next scheduled run. */
  const claimCutoff = new Date(Date.now() - CLAIM_TTL_MINUTES * 60_000).toISOString();
  const { data: inFlight } = await sb.from("wa_runs")
    .select("created_at").eq("reason", RUN_CLAIM)
    .gte("created_at", claimCutoff).limit(1);
  if (inFlight?.length) {
    return record(sb, {
      sent: 0, reason: "run_in_flight", healed,
      startedAt: inFlight[0].created_at,
    });
  }
  await sb.from("wa_runs").insert({ sent: 0, failed: 0, reason: RUN_CLAIM }).then(() => {}, () => {});

  /* Ask Meta what it will allow today rather than trusting a constant written
     on the day the number was restricted. The old constants held us to 25 a
     day and 4 an hour long after quality_rating returned to GREEN — with 55
     guests waiting and every screen reporting a healthy system. */
  const [health, peak] = await Promise.all([
    fetchAccountHealth(cfg),
    recentPeakRecipients(sb),
  ]);
  const cap = warmupCap(health, peak);

  if (!cap) {
    return record(sb, {
      sent: 0, reason: "meta_blocked", healed,
      quality: health.quality, posture: health.posture, reasons: health.reasons,
    }, { cap: 0, tier: health.tier, quality: health.quality, posture: health.posture });
  }

  /* Meta counts unique recipients in a rolling 24h and refuses past the
     ceiling with 141015. Reading it first is the difference between pausing
     and reproducing the run that failed 90%. */
  const usage = await rollingWindowUsage(sb, cap);
  if (usage.blocked) {
    return record(sb, {
      sent: 0, reason: "window_full", healed,
      recipients: usage.recipients, cap, quality: health.quality,
    }, { cap, tier: health.tier, quality: health.quality, posture: health.posture,
         window_used: usage.recipients });
  }

  /* Time is now the only per-run ceiling that matters. At six in flight and
     ~1.2s each, a 48-second working window holds far more than any day's cap,
     so the run is bounded by the rolling window rather than by the clock —
     which is the whole point of the change. */
  const timeCap = Math.floor(((maxDuration - 12) / SECONDS_PER_MESSAGE) * SEND_CONCURRENCY);
  const budget = Math.max(0, Math.min(usage.remaining, timeCap));
  if (!budget) return record(sb, { sent: 0, reason: "budget_exhausted", cap, healed },
    { cap, tier: health.tier, quality: health.quality, posture: health.posture,
      window_used: usage.recipients });

  /* An event with no card of its own is skipped, never sent with someone
     else's. Reported, so a missing image surfaces instead of looking like a
     quiet day. */
  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await sb.from("events")
    .select("id, name, date, address, wa_header_image_url")
    .gte("date", today).order("date").limit(MAX_EVENTS_PER_RUN);

  const active = (events ?? []).filter(e => e.wa_header_image_url);
  const skippedEvents = (events ?? [])
    .filter(e => !e.wa_header_image_url)
    .map(e => ({ event: e.name, reason: "אין תמונת הזמנה" }));

  if (!active.length)
    return record(sb, { sent: 0, reason: "no_sendable_event", healed, skippedEvents },
      { cap, tier: health.tier, quality: health.quality, posture: health.posture });

  /* One event per run, nearest wedding first — but the nearest wedding that
     still has somebody to reach.
   *
   * This was `active[0]` unconditionally, which is fine while the closest
   * wedding has work and silently fatal the moment it does not. Dvir's own
   * wedding is on 24/08 with 146 people still pending; those finish in about
   * two runs. Every run after that would have selected his event, found nothing
   * to do, and returned "nothing_due" — twice a day, until 24/08 — while a
   * paying client's 550 guests sat untouched behind him. The constant is called
   * MAX_EVENTS_PER_RUN = 3 and only one was ever considered.
   *
   * Picking the first event with pending guests costs one small query per event
   * and removes a failure whose symptom is silence. Sharing a single run's
   * budget across several weddings is a different and larger change; with two
   * runs a day and this ordering, a second couple is served as soon as the
   * first has nobody left, which is the case that actually arrives. */
  let ev = active[0];
  for (const cand of active) {
    const { count } = await sb.from("guests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", cand.id).eq("status", "pending");
    if ((count ?? 0) > 0) { ev = cand; break; }
  }
  const image = ev.wa_header_image_url as string;

  const sent: string[] = [];
  const failed: { name: string; error: string }[] = [];
  let stopped: string | null = null;

  /* Who gets the day's budget, in order.

       1. guests with no evidence anything ever arrived
       2. guests a send was attempted for and failed — also never reached
       3. everyone else still unanswered, as a reminder

     Nobody in group 3 is touched while a single name remains in 1 or 2. There
     is no reminding a guest who was never invited.

     The previous order broke this in two separate places, and both spent the
     allowance on people who already held the invitation. Due retries claimed
     HALF the budget before a first contact was even considered — 26 rows sat
     due while 181 people had nothing. And a priority flag let REMINDERS jump
     the whole queue: the block below used to push `prioReminders` before
     `firstContact`, so on a 24-message day the first 24 could all go to guests
     who had already received one.

     send_priority survives, with its scope corrected: it orders WITHIN a
     group. It no longer reorders the groups. */

  const targets: { id: string; row?: string; count?: number; reminder?: boolean }[] = [];

  /* No limit on the query. A cap here would not bound the work — the budget
     does that — it would bound who is ELIGIBLE, and PostgREST returns the
     first N in arbitrary order. At 550 guests the tail simply never appears in
     any run, and nothing reports it. */
  const { data: pending } = await sb.from("guests")
    .select("id, phone, rsvp_token, category, status, opened_at, send_priority")
    .eq("event_id", ev.id).eq("status", "pending")
    .order("send_priority", { ascending: false });

  const ids = (pending ?? []).filter(g => g.category !== "demo" && g.phone && g.rsvp_token)
    .map(g => g.id);

  const contacted = new Set<string>();
  /* When each guest FIRST got the invitation into their hands — by message or
     by a helper. Used to order reminders, below. */
  const firstArrival = new Map<string, string>();
  /* Guests the number can never reach, and must stop trying.

     policyFor already classifies these — 131026 "the number cannot receive"
     and 131050 "the recipient asked to stop" both return action "never" — but
     nothing consulted it here. Eligibility was defined purely as "no evidence
     of arrival", so a permanent failure looked exactly like a guest who had
     simply not been contacted yet, and every run picked them up again.

     For 131026 that is waste: one guest burning a slot of a 90-a-day budget,
     twice a day, forever. For 131050 it is worse than waste — someone who
     asked to stop hearing from us keeps being messaged, which is both a
     promise broken and the fastest way back to the spam reports that
     restricted this number in the first place.

     Judged on the LATEST message per guest, not on any: a number that failed
     in June and delivered in August is reachable, and only the most recent
     attempt describes where things actually stand. */
  const lastByGuest = new Map<string,
    { at: string; status: string; code: number | null; err: string | null }>();
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { data } = await sb.from("wa_messages")
      .select("guest_id, status, error_code, error, created_at")
      .eq("direction", "out").in("guest_id", slice);
    (data ?? []).forEach(m => {
      if (!m.guest_id) return;
      if (["delivered", "read"].includes(m.status)) {
        contacted.add(m.guest_id);
        /* EARLIEST arrival, not latest. See the reminder ordering below. */
        const prev = firstArrival.get(m.guest_id);
        if (!prev || m.created_at < prev) firstArrival.set(m.guest_id, m.created_at);
      }
      /* Every message, not only the failures. Recording failures alone would
         make a guest who failed at 10:00 and was delivered at 11:00 look
         permanently unreachable, because the failure would be the only row
         this map had ever seen. */
      const prev = lastByGuest.get(m.guest_id);
      if (!prev || m.created_at > prev.at) {
        lastByGuest.set(m.guest_id, {
          at: m.created_at, status: m.status, code: m.error_code, err: m.error,
        });
      }
    });

    /* A send made by hand from a personal phone leaves no wa_messages row, so
       without this the couple messages someone at 11:00 and the business number
       messages them again at 13:00. */
    const { data: manual } = await sb.from("guest_events")
      .select("guest_id, created_at")
      .eq("event_type", "manual_sent").in("guest_id", slice);
    (manual ?? []).forEach(m => {
      if (!m.guest_id) return;
      contacted.add(m.guest_id);
      const prev = firstArrival.get(m.guest_id);
      if (!prev || m.created_at < prev) firstArrival.set(m.guest_id, m.created_at);
    });
  }

  /* Guests currently handed to a helper are not this sender's to take.

     A cousin who is *about to* message someone has produced no delivery
     evidence yet, so `contacted` cannot see her — which is how a guest gets a
     message from family at 14:50 and from the business number at 15:00.

     Its own query, and one that fails soft. Adding these columns to the
     eligibility select above would mean that the day someone forgets to run
     the migration, PostgREST rejects the whole statement, `pending` comes back
     null, and the run reports "nothing_due" while 195 people wait. That
     already happened once, for two days. A missing column here costs the
     feature; it must never again cost the sending. */
  /* Whose most recent attempt ended in a failure no retry can fix. Reported in
     the response rather than only skipped, because "the automation has given
     up on these three" is exactly the list a human has to work from. */
  const unreachable = new Map<string, string>();
  for (const [id, m] of lastByGuest) {
    if (m.status !== "failed") continue;
    const pol = policyFor(m.code, m.err);
    if (pol.action === "never") unreachable.set(id, pol.human);
  }

  const assignedSince = new Date(Date.now() - 48 * 3_600_000).toISOString();
  const { data: held } = await sb.from("guests")
    .select("id").eq("event_id", ev.id)
    .not("assigned_helper", "is", null)
    .gte("assigned_at", assignedSince);
  const reserved = new Set((held ?? []).map(h => h.id as string));

  /* ---- 1. no evidence the invitation ever arrived ---- */
  ids.filter(id => !contacted.has(id) && !reserved.has(id) && !unreachable.has(id))
    .slice(0, budget)
    .forEach(id => targets.push({ id }));

  /* ---- 2. attempted and failed ----

     Filtered by policy and de-duplicated by guest: most failures are 131048,
     which policyFor classifies as stop_run — no timer can make those succeed —
     and three failed rows for one guest are still one message.

     Scoped to this event, which it was not before. wa_messages rows carry an
     event_id and the query ignored it, so a due retry belonging to another
     couple's guest could be selected here and then sent THIS event's header
     image — someone else's wedding invitation, to a stranger. */
  if (targets.length < budget) {
    const { data: dueRaw } = await sb.from("wa_messages")
      .select("id, guest_id, retry_count, error, error_code")
      .eq("direction", "out").eq("status", "failed").eq("event_id", ev.id)
      .not("retry_after", "is", null).lte("retry_after", new Date().toISOString())
      .order("retry_after").limit(100);

    /* Whether the guest still needs this at all.

       The retry queue reads wa_messages and never looked at the guest. A failed
       row keeps its due retry even after the guest answers by some other route
       — most often opening an earlier, successful send and using the web form —
       so on 12/08 both זוהר נחמיאס and שוהם דידי, who had answered on 10/08,
       were retried again. Two blocked sends, two slots of a capped day, and two
       more rejections against a number Meta is already throttling for exactly
       this: messaging people who do not need it. */
    const dueIds = [...new Set((dueRaw ?? []).map(d => d.guest_id).filter(Boolean))] as string[];
    const answered = new Set<string>();
    for (let i = 0; i < dueIds.length; i += 100) {
      const { data } = await sb.from("guests")
        .select("id").in("id", dueIds.slice(i, i + 100)).neq("status", "pending");
      for (const g of data ?? []) answered.add(g.id as string);
    }
    /* Retire their queue entries too, or they come back every run for ever. */
    if (answered.size) {
      const rows = (dueRaw ?? []).filter(d => d.guest_id && answered.has(d.guest_id)).map(d => d.id);
      if (rows.length) await sb.from("wa_messages").update({ retry_after: null }).in("id", rows);
    }

    const seen = new Set(targets.map(t => t.id));
    for (const d of dueRaw ?? []) {
      if (targets.length >= budget) break;
      if (!d.guest_id || seen.has(d.guest_id)) continue;
      if (answered.has(d.guest_id)) continue;
      if (policyFor(d.error_code, d.error).action !== "retry_later") continue;
      seen.add(d.guest_id);
      targets.push({ id: d.guest_id, row: d.id, count: (d.retry_count ?? 0) + 1 });
    }
  }

  /* ---- 3. reminders, only once nobody is left uninvited ----

     Their own approved template, never the invitation again: sending the same
     invitation a second time to someone who already has it reads as a system
     that lost track of them. */
  if (targets.length < budget) {
    const already = new Set(targets.map(t => t.id));
    /* Longest wait first.

       Someone who has held the invitation since Saturday and still has not
       answered is more overdue than someone who received it yesterday, and
       until now the two were indistinguishable: the reminder group inherited
       whatever order PostgREST happened to return, so on a capped day the
       five-day silence could sit behind the one-day silence for another cycle.

       Ordered by when the invitation FIRST reached them — the moment the wait
       began — not by the most recent message, which for a guest already
       reminded once would reset their place in the queue and starve the very
       people this is for. */
    ids.filter(id => contacted.has(id) && !already.has(id) && !reserved.has(id)
                  && !unreachable.has(id))
      .sort((a, b) => (firstArrival.get(a) ?? "9999").localeCompare(firstArrival.get(b) ?? "9999"))
      .slice(0, budget - targets.length)
      .forEach(id => targets.push({ id, reminder: true }));
  }

  /* Nobody left to invite or remind is exactly when the gallery announcement
     should go out — same budget, same pacing, same caps. */
  if (!targets.length) {
    const gal = await notifyGallery(sb, cfg, budget);
    if (gal.sent) {
      return record(sb, {
        sent: gal.sent, reason: "gallery_notified", healed, statusesApplied,
        galleryEvent: gal.event,
      }, { event_id: ev.id, cap, tier: health.tier, quality: health.quality,
           posture: health.posture, window_used: usage.recipients });
    }
  }
  if (!targets.length) return record(sb, { sent: 0, reason: "nothing_due", healed },
    { event_id: ev.id, cap, tier: health.tier, quality: health.quality,
      posture: health.posture, window_used: usage.recipients });

  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, rsvp_token").in("id", targets.map(t => t.id));
  const byId = new Map((guests ?? []).map(g => [g.id, g]));

  /* Batches, not one at a time.

     Sequentially at nine seconds a message, a 60-second invocation fit five
     sends, and two scheduled runs a day made the automatic sender's real
     capacity ten messages — while 55 guests had received nothing at all. The
     batch boundary is also where the one failure worth reacting to mid-run is
     caught: 131048 describes the NUMBER, so the next guest fails too and
     sending the rest of the list is pure damage. */
  let ranOutOfTime = 0;
  for (let i = 0; i < targets.length && !stopped; i += SEND_CONCURRENCY) {
    /* Stop while there is still time to record what happened. A run that is
       killed mid-flight leaves messages delivered and no trace that it ran —
       which is how 66 went out on 13/08 under a row that says sent: 0. */
    if (Date.now() - startedAt > DEADLINE_MS) {
      ranOutOfTime = targets.length - i;
      break;
    }
    const batch = targets.slice(i, i + SEND_CONCURRENCY);

    const results = await Promise.all(batch.map(async t => {
      const g = byId.get(t.id);
      if (!g?.phone || !g.rsvp_token) return null;
      const res = await sendInvitation(
        cfg, g.phone, g.rsvp_token, image, undefined,
        t.reminder ? "reminder" : "invitation",
      );
      return { t, g, res };
    }));

    for (const r of results) {
      if (!r) continue;
      const { t, g, res } = r;

      if (res.ok) {
        sent.push(g.name);
        /* Dequeued only once the send has actually succeeded. This loop used
           to clear retry_after BEFORE the attempt, so a retry that failed was
           evicted from the queue and nothing anywhere put it back — the guest
           silently left every send path forever. */
        if (t.row) {
          await sb.from("wa_messages")
            .update({ retry_count: t.count, retry_after: null }).eq("id", t.row);
        }
        await sb.from("guest_events").insert({ guest_id: g.id, event_type: "invite_sent" });
        if (res.messageId) {
          await sb.from("wa_messages").insert({
            event_id: ev.id, guest_id: g.id,
            wa_phone: toE164(g.phone) ?? "",
            direction: "out",
            body: t.reminder ? "תזכורת אישור הגעה"
                : t.row      ? "הזמנה לחתונה (ניסיון חוזר)"
                :              "הזמנה לחתונה (תבנית)",
            wamid: res.messageId, status: "accepted",
            ...(t.row ? { retry_count: t.count, retried_from: t.row } : {}),
          });
        }
      } else {
        failed.push({ name: g.name, error: res.error ?? "unknown" });
        const pol = policyFor(null, res.error);

        /* A retry that failed is either rescheduled or retired on purpose —
           never silently dropped. */
        if (t.row) {
          const again = pol.action === "retry_later";
          await sb.from("wa_messages").update({
            retry_count: t.count,
            retry_after: again
              ? new Date(Date.now() + (pol.delayH ?? 24) * 3_600_000).toISOString()
              : null,
          }).eq("id", t.row);
        } else {
          /* A first contact that Meta rejected outright left no trace at all.
             Every failed row in the table has a wamid, meaning it was accepted
             and only later reported failed by the webhook — the immediate
             rejections were written nowhere.

             What that costs: the guest looks untouched on the next run, so they
             are picked as a first contact again, twice a day, for ever. The
             "never retry" policies cannot fire on them because policyFor reads
             wa_messages. They cannot appear in unreachable or in needsHuman. A
             number that can never work would quietly consume two slots of a
             capped day until the wedding — and nothing would ever say so.

             Writing the failure makes it a fact the rest of the system can act
             on. No wamid, because Meta never issued one. */
          await sb.from("wa_messages").insert({
            event_id: ev.id, guest_id: g.id,
            wa_phone: toE164(g.phone) ?? "",
            direction: "out",
            body: t.reminder ? "תזכורת אישור הגעה" : "הזמנה לחתונה (תבנית)",
            status: "failed",
            error: res.error ?? "unknown",
            retry_count: 0,
            retry_after: pol.action === "retry_later"
              ? new Date(Date.now() + (pol.delayH ?? 24) * 3_600_000).toISOString()
              : null,
          });
        }

        if (pol.action === "stop_run") stopped = "המספר מוגבל — עצירת ההרצה";
      }
    }
  }

  return record(sb, {
    event: ev.name,
    sent: sent.length, failed: failed.length, stopped,
    /* Guests the run had time for but not budget. Reported rather than dropped:
       they are picked up by the next run, and a run that ends early must say so
       rather than looking like a quiet day. */
    ...(ranOutOfTime ? { deferredForTime: ranOutOfTime } : {}),
    windowRecipients: usage.recipients,
    /* Reported on every run so a quiet day can be told apart from a throttled
       one without opening Meta's dashboard. "sent: 0" meant both for weeks. */
    limits: {
      cap, tier: health.tier, quality: health.quality,
      posture: health.posture, recentPeak: peak,
      reasons: health.reasons,
    },
    skippedEvents,
    /* Named, not just counted. These are the guests the automation has given
       up on, and somebody has to phone them. */
    unreachable: [...unreachable.values()].length,
    healed, statusesApplied,
    details: { sent, failed },
  }, {
    event_id: ev.id, cap, tier: health.tier, quality: health.quality,
    posture: health.posture, window_used: usage.recipients,
  });
}
