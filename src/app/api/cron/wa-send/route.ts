import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { shabbatBlock } from "@/lib/shabbat";
import { coupleName, looksLikeCouple } from "@/lib/couple-name";
import { isEligibleNow, dueWithin, type ContactState } from "@/lib/eligibility";
import { eventTimes } from "@/lib/event-times";
import { venueLine } from "@/lib/venue";
import { weddingDateLine } from "@/lib/hebrew-date";
import {
  getWhatsAppConfig, sendInvitation, toE164, policyFor,
  rollingWindowUsage, SECONDS_PER_MESSAGE, SEND_CONCURRENCY,
  fetchAccountHealth, warmupCap, recentPeakRecipients, sendPhotosUploadRequest, sendDayBefore, sendRunSummary, sendRidesGroup } from "@/lib/whatsapp";
import { checkEventLinks, brokenSummary } from "@/lib/link-health";

export const dynamic = "force-dynamic";
/* Five minutes, so a run can reach the daily cap instead of a fifth of it.
 *
 * Saturday night sent 30 with 150 available, no failures and an empty window.
 * The daily cap was never the binder — the function was: at roughly four
 * paced seconds a message it can only get so far before Vercel stops it, and
 * five times the seconds is five times the messages. 30 × 5 = 150, which is
 * exactly where usage.remaining takes over and stops it anyway.
 *
 * So this cannot overshoot. budget is min(remaining, timeCap) and raising
 * timeCap only lets the run reach a ceiling Meta already enforces; the pacing
 * between messages is untouched, which is the part that protects quality.
 *
 * 300 requires Vercel Pro. On Hobby the platform caps the function at 60 and
 * this silently stays where it was — worth knowing if tomorrow sends 30 again,
 * because then the plan is the answer and not the code. */
export const maxDuration = 300;

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
/* Ceiling per run for the rides-group message. Sixty clears a 334-guest
   wedding in six runs — one day — without ever taking a run whole. */
const RIDES_GROUP_PER_RUN = 60;

/* The thank-you: ceiling, and the room left behind it for invitations. */
const GALLERY_PER_RUN = 150;
const GALLERY_RESERVE = 30;

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
/* Israel local, not UTC. Every sentence of the comment above is about the hour
   it is for the guest — "an on-time run at 19:00 is still a good hour to reach
   people", "past 22:00 an invitation reads as an intrusion". The constants were
   UTC and assumed UTC+3, which is only true while Israel is on summer time.
   Israel returns to UTC+2 between 20/10 and 25/10 2026, and on that morning the
   same two numbers would have meant 08:00 to 20:00: an hour too early to be
   welcome, and the productive evening hour gone. */
const HOUR_START_IL = 9;
const HOUR_END_IL = 21;

/** The hour in Israel, whatever the server thinks the time is. */
function israelHour(now: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false,
  }).format(now));
}

/* Two runs cannot land inside this window. The scheduled runs are nine hours
   apart, so this only ever catches an overlap nobody intended. */
const MIN_MINUTES_BETWEEN_RUNS = 10;

/* A run stakes this the moment it decides to send, and clears the way for the
   next scheduled run a few minutes later. Shorter than the gap between the two
   daily crons by a wide margin, so a crashed run never blocks a real one. */
/* Reminders held until this moment. First invitations are unaffected.
 *
 * שחר asked for her reminders to go tomorrow rather than tonight, and the
 * sixteen guests of hers who have never received anything still had to go out
 * in the 21:50 run — so "pause the wedding" was the wrong instrument: it would
 * have held the sixteen too.
 *
 * A constant with a date rather than a column, deliberately. It is a dated,
 * one-off decision made twenty minutes before a run, and the alternative was a
 * migration on a live database at 21:20 the night before it mattered. It
 * expires by itself: after this instant every run behaves exactly as it did
 * before, with nothing to remember to undo.
 *
 * 2026-08-20 06:00Z = 09:00 Israel, the first run of tomorrow. */
const REMINDERS_RESUME_AT = Date.parse("2026-08-20T06:00:00Z");

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
/* "מחר מתחתנים" — the morning before the wedding.
 *
 * Runs before everything else, and that ordering is the whole feature. A
 * reminder that goes out a day late is still a reminder; this one is worthless
 * the moment the wedding starts. It is also small and bounded — only guests who
 * confirmed, only the day before, once each — so giving it first call on the
 * budget costs the reminders one morning and nothing else.
 *
 * Deduplicated through guest_events rather than a new column: 'day_before_sent'
 * per guest, the same mechanism 'gallery_sent' and 'invite_sent' already use.
 * A run that dies halfway resumes exactly where it stopped.
 *
 * Refuses rather than guesses. An event missing its times or venue is skipped
 * and reported — "קבלת פנים undefined" reaching 196 people is worse than
 * nothing reaching them. */
/* The evening digest — one message per wedding, written to be forwarded.
 *
 * שחר asks "did anything go out today? how many answered?" and Dvir opens the
 * admin, checks, and answers. Then it happens again tomorrow. The cost is not
 * the two minutes; it is being permanently on call.
 *
 * Sent to HIM, not to the couple, on purpose. Some days the number is not
 * flattering and he will want to add a sentence, and some days it is better
 * not to send anything at all. That judgement is his and the product should
 * not take it.
 *
 * Once a day, on the last run, and only for weddings that still have someone
 * to reach — a couple whose list is finished does not need a nightly note. */
async function sendDailyDigest(
  sb: ReturnType<typeof createServerClient>,
  cfg: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
): Promise<void> {
  const to = process.env.ADMIN_ALERT_PHONE;
  if (!to) return;

  const dayStart = new Date(); dayStart.setUTCHours(0, 0, 0, 0);
  const since = dayStart.toISOString();
  const today = new Date().toISOString().slice(0, 10);

  const { data: evs } = await sb.from("events")
    .select("id, name, couple_names").gte("date", today).order("date").limit(4);

  for (const ev of evs ?? []) {
    const { data: gs } = await sb.from("guests")
      .select("id, status, category").eq("event_id", ev.id).limit(900);
    const real = (gs ?? []).filter(g => g.category !== "demo");
    if (!real.length) continue;
    const pending = real.filter(g => g.status === "pending").length;
    if (!pending) continue;                       /* nothing left to report on */
    const confirmed = real.filter(g => g.status === "confirmed").length;

    const { count: sentToday } = await sb.from("wa_messages")
      .select("id", { count: "exact", head: true })
      .eq("direction", "out").eq("event_id", ev.id).gte("created_at", since);

    const { count: answeredToday } = await sb.from("guests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", ev.id).neq("status", "pending").gte("response_time", since);

    if (!sentToday && !answeredToday) continue;   /* a quiet day is not news */

    /* What is due tomorrow, which is the question this digest never answered.
     *
     * "מחר יישלחו הודעות? למי?" was asked four times in one week and worked
     * out by hand each time — wrongly once, on 27/08, when the reply was
     * "150-180 tomorrow" because it counted the quota still available instead
     * of the guests actually due. Thirteen were due. Quota is what may be
     * spent; this is what there is to spend it on.
     *
     * Built from the same three facts the sender itself uses, so the number in
     * the message and the number of messages that go out cannot disagree. */
    const pendingIds = real.filter(g => g.status === "pending").map(g => g.id as string);
    let tomorrow = { now: 0, soon: 0, never: 0 };
    if (pendingIds.length) {
      const states: ContactState[] = [];
      for (let i = 0; i < pendingIds.length; i += 150) {
        const slice = pendingIds.slice(i, i + 150);
        const { data: ms } = await sb.from("wa_messages")
          .select("guest_id, body, status, created_at")
          .eq("direction", "out").in("guest_id", slice);
        const byGuest = new Map<string, { last: string | null; got: boolean; rem: number }>();
        for (const id of slice) byGuest.set(id, { last: null, got: false, rem: 0 });
        for (const m of ms ?? []) {
          const row = byGuest.get(m.guest_id as string);
          if (!row) continue;
          const at = m.created_at as string;
          if (!row.last || at > row.last) row.last = at;
          if (m.status === "delivered" || m.status === "read") row.got = true;
          if (/תזכורת|עוד לא קיבלנו/.test(String(m.body ?? ""))) row.rem++;
        }
        for (const r of byGuest.values())
          states.push({ delivered: r.got, lastOutboundAt: r.last, remindersSent: r.rem });
      }
      tomorrow = dueWithin(states, Date.now() + 24 * 3_600_000);
    }

    const dueLine = tomorrow.now + tomorrow.soon > 0
      ? `מחר: ${tomorrow.now + tomorrow.soon} מוכנים לקבל הודעה`
      : tomorrow.never > 0
        ? `מחר: אף אחד — ${tomorrow.never} מיצו את התזכורות`
        : "מחר: אף אחד";

    await sendRunSummary(cfg, to, {
      event: `🤍 עדכון יומי — ${coupleName(ev) ?? ev.name}`,
      sent: String(sentToday ?? 0),
      failed: String(answeredToday ?? 0),
      left: String(pending),
      attention: `אישרו עד כה: ${confirmed} מתוך ${real.length} · ${dueLine}`,
    });
  }
}

/* The rides group, once per guest per wedding.
 *
 * Placed after the gallery and before event selection, and deliberately NOT
 * returning the run: the gallery takes a whole run because it is a burst that
 * clears in four, while this one competes with invitations that are still
 * going out — לאל וטל had forty guests with nothing at all the day this was
 * written. It takes its ceiling off the top and leaves the rest.
 *
 * Gated on rides_group_url, which only Dvir sets and which the events API
 * validates as a real invite link. No link, no send, no error — a wedding
 * without a group simply never enters this.
 *
 * Deduplicated through guest_events like every other milestone, so a guest
 * added tomorrow is picked up on their own and nobody is messaged twice. */
async function notifyRidesGroup(
  sb: ReturnType<typeof createServerClient>,
  cfg: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
  budget: number,
): Promise<{ sent: number; event?: string }> {
  if (budget <= 0) return { sent: 0 };
  const today = new Date().toISOString().slice(0, 10);
  const nowMs = Date.now();

  const { data: evs } = await sb.from("events")
    .select("id, name, couple_names, rides_group_url, send_paused_until")
    .gte("date", today).not("rides_group_url", "is", null).order("date").limit(5);

  for (const ev of evs ?? []) {
    if (!(ev.rides_group_url as string | null)?.trim()) continue;
    if (ev.send_paused_until
        && new Date(ev.send_paused_until as string).getTime() > nowMs) continue;
    const couple = coupleName(ev);
    if (!couple) continue;

    const { data: guests } = await sb.from("guests")
      .select("id, phone, rsvp_token, category, do_not_contact")
      .eq("event_id", ev.id);
    const eligible = (guests ?? []).filter(g =>
      g.category !== "demo" && String(g.phone ?? "").trim()
      && g.rsvp_token && !g.do_not_contact);
    if (!eligible.length) continue;

    const ids = eligible.map(g => g.id as string);
    const already = new Set<string>();
    for (let i = 0; i < ids.length; i += 100) {
      const { data } = await sb.from("guest_events")
        .select("guest_id").eq("event_type", "rides_group_sent")
        .in("guest_id", ids.slice(i, i + 100));
      (data ?? []).forEach(r => r.guest_id && already.add(r.guest_id as string));
    }

    const todo = eligible.filter(g => !already.has(g.id as string))
      .slice(0, Math.min(RIDES_GROUP_PER_RUN, budget));
    if (!todo.length) continue;

    let sent = 0;
    for (let i = 0; i < todo.length; i += SEND_CONCURRENCY) {
      const batch = await Promise.all(
        todo.slice(i, i + SEND_CONCURRENCY).map(async g => ({
          g, res: await sendRidesGroup(cfg, g.phone as string, couple,
                                       g.rsvp_token as string),
        })),
      );
      for (const { g, res } of batch) {
        if (!res.ok) continue;
        sent++;
        await sb.from("guest_events")
          .insert({ guest_id: g.id, event_type: "rides_group_sent" });
        if (res.messageId) {
          await sb.from("wa_messages").insert({
            event_id: ev.id, guest_id: g.id,
            wa_phone: toE164(g.phone as string) ?? "",
            direction: "out", body: "קבוצת טרמפים (תבנית)",
            wamid: res.messageId, status: "accepted",
          });
        }
      }
    }
    if (sent) return { sent, event: ev.name as string };
  }
  return { sent: 0 };
}

async function notifyDayBefore(
  sb: ReturnType<typeof createServerClient>,
  cfg: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
  budget: number,
): Promise<{ sent: number; event?: string; skipped?: string }> {
  if (budget <= 0) return { sent: 0 };

  /* Tomorrow in Israel, not in UTC. At 10:00 Israel the two agree, but the
     function must not depend on the hour it happens to run at. */
  const tomorrow = new Date(Date.now() + 86_400_000)
    .toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

  /* EVERY wedding tomorrow, not the first one.
   *
   * This took evs[0] and stopped, which was invisible while no two weddings
   * shared a date and became a silent failure the moment two did: תהל ואביב
   * and טל ולאל are both on 22/09, so on 21/09 one of them would have been
   * told what time to arrive and the other would have heard nothing at all.
   * Two Saturdays in an Israeli September is not an edge case. */
  const { data: evs } = await sb.from("events")
    .select("id, name, couple_names, date, address, venue_name, reception_time, chuppah_time")
    .eq("date", tomorrow).limit(5);
  if (!(evs ?? []).length) return { sent: 0 };

  let sentTotal = 0;
  const names: string[] = [];
  const skips: string[] = [];

  for (const ev of evs ?? []) {
    if (sentTotal >= budget) break;
    const one = await dayBeforeForEvent(sb, cfg, ev, budget - sentTotal);
    sentTotal += one.sent;
    if (one.sent) names.push(ev.name as string);
    if (one.skipped) skips.push(`${ev.name}: ${one.skipped}`);
  }
  return {
    sent: sentTotal,
    event: names.join(" + ") || undefined,
    skipped: skips.join(" · ") || undefined,
  };
}

async function dayBeforeForEvent(
  sb: ReturnType<typeof createServerClient>,
  cfg: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
  ev: { id: string; name: string; couple_names?: string | null; date?: string | null;
        address?: string | null; venue_name?: string | null;
        reception_time?: string | null; chuppah_time?: string | null },
  budget: number,
): Promise<{ sent: number; skipped?: string }> {
  if (budget <= 0) return { sent: 0 };

  const couple = coupleName(ev);
  const venue  = venueLine(ev);
  const rec    = (ev.reception_time as string | null)?.trim();
  const chu    = (ev.chuppah_time as string | null)?.trim();
  if (!couple || !venue || !rec || !chu)
    return { sent: 0, skipped: "חסרים שמות, מקום או שעות" };

  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, category, do_not_contact")
    .eq("event_id", ev.id).eq("status", "confirmed");
  const eligible = (guests ?? []).filter(g =>
    g.category !== "demo" && String(g.phone ?? "").trim() && !g.do_not_contact);
  if (!eligible.length) return { sent: 0 };

  const ids = eligible.map(g => g.id as string);
  const already = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb.from("guest_events")
      .select("guest_id").eq("event_type", "day_before_sent")
      .in("guest_id", ids.slice(i, i + 100));
    (data ?? []).forEach(r => r.guest_id && already.add(r.guest_id as string));
  }

  const todo = eligible.filter(g => !already.has(g.id as string)).slice(0, budget);
  if (!todo.length) return { sent: 0 };

  let sent = 0;
  for (let i = 0; i < todo.length; i += SEND_CONCURRENCY) {
    const batch = await Promise.all(
      todo.slice(i, i + SEND_CONCURRENCY).map(async g => ({
        g, res: await sendDayBefore(cfg, g.phone as string, couple, rec, chu, venue),
      })),
    );
    for (const { g, res } of batch) {
      if (!res.ok) continue;
      sent++;
      await sb.from("guest_events").insert({ guest_id: g.id, event_type: "day_before_sent" });
      if (res.messageId) {
        await sb.from("wa_messages").insert({
          event_id: ev.id, guest_id: g.id, wa_phone: toE164(g.phone as string) ?? "",
          direction: "out", body: "מחר מתחתנים (תבנית)",
          wamid: res.messageId, status: "accepted",
        });
      }
    }
  }
  return { sent };
}

async function notifyGallery(
  sb: ReturnType<typeof createServerClient>,
  cfg: NonNullable<ReturnType<typeof getWhatsAppConfig>>,
  budget: number,
): Promise<{ sent: number; event?: string }> {
  if (budget <= 0) return { sent: 0 };
  const today = new Date().toISOString().slice(0, 10);

  const { data: evs } = await sb.from("events")
    .select("id, name, couple_names, gallery_ready, gallery_notified_at")
    .lt("date", today).eq("gallery_ready", true).is("gallery_notified_at", null)
    .order("date", { ascending: false }).limit(1);
  const ev = (evs ?? [])[0];
  if (!ev) return { sent: 0 };

  /* The upload page, not the gallery. See sendPhotosUploadRequest — the guest
     is being asked for their photos, and the gallery is the couple's alone.
     /memory/[token] reads vault_tokens, which is a different token from the
     album's: שחר has an album and no vault token, תהל has a vault token and no
     album, so neither could be assumed from the other. */
  const { data: vault } = await sb.from("vault_tokens")
    .select("token").eq("event_id", ev.id).maybeSingle();
  const couple = coupleName(ev);
  if (!vault?.token || !couple) return { sent: 0 };

  /* Confirmed guests only, and the status filter is not a nicety.
   *
   * wants_photos is written by the RSVP form and only on a "confirmed" answer,
   * so on two of the three live weddings every non-attending guest carries
   * false and this query happened to be right. לאל וטל was imported down a
   * path that defaults the column to true, and there 158 guests who never
   * attended are flagged: 149 who never answered at all and 9 who said
   * explicitly that they were not coming.
   *
   * Without this filter every one of them is asked to share the photos they
   * took at a wedding they did not attend — 158 marketing messages, 158 slots
   * out of a 250-a-day ceiling, and nine of them to people who had already
   * said no. */
  const { data: guests } = await sb.from("guests")
    .select("id, phone, wants_photos, category, status, do_not_contact")
    .eq("event_id", ev.id).eq("wants_photos", true).eq("status", "confirmed");
  /* do_not_contact, which every other send in this file honours and this one
     did not. A couple saying "never message this person again" does not stop
     applying because the wedding is over — if anything the opposite. */
  const targets = (guests ?? []).filter(g =>
    g.category !== "demo" && g.phone && !g.do_not_contact);
  if (!targets.length) return { sent: 0 };

  /* Chunked, and it refuses rather than fails open.
   *
   * One .in() with every target id builds a URL that grows with the guest
   * list. At 555 guests that request is long enough for PostgREST to reject,
   * and the failure mode is the worst available: `done` comes back null, the
   * set is empty, nobody looks like they have been sent to, and the entire
   * wedding is messaged a second time — a photo request the couple's guests
   * already received, at 0.13₪ and one 250-cap slot each.
   *
   * A dedup query that failed must stop the send, not wave it through. */
  const already = new Set<string>();
  const ids = targets.map(g => g.id as string);
  for (let i = 0; i < ids.length; i += 100) {
    const { data: done, error } = await sb.from("guest_events").select("guest_id")
      .eq("event_type", "gallery_sent").in("guest_id", ids.slice(i, i + 100));
    if (error) {
      console.error("[gallery:dedupe]", error.message);
      return { sent: 0, event: ev.name as string };
    }
    (done ?? []).forEach(r => r.guest_id && already.add(r.guest_id as string));
  }

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
        g, res: await sendPhotosUploadRequest(
          cfg, g.phone as string, couple, vault.token as string),
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
      /* Everything the row has no column for goes into details.
       *
       * This used to persist payload.details alone, and silently dropped every
       * other key. deferredForTime was the expensive one: the send loop breaks
       * on DEADLINE_MS at a batch boundary, sets it, and returns it in the HTTP
       * response — which nobody reads — while the stored row kept only sent and
       * failed. A run cut off by the clock was therefore written to look
       * exactly like a run that finished with nothing left to do.
       *
       * That is what happened on 15/08: the 45-second deadline fired after five
       * batches of six, thirty invitations went out of a possible 150, and the
       * row said sent 30, reason null, failed none. Three separate explanations
       * were checked against that row before the truth was found by reading the
       * loop, because the one field that would have said so was thrown away
       * here on its way to the database.
       *
       * Nothing passed to record() is dropped now. windowRecipients, limits,
       * crossEvent, skippedEvents and anything added later land in details
       * without needing a column or a change to this function. */
      details: {
        ...((payload.details as Record<string, unknown>) ?? {}),
        ...Object.fromEntries(
          Object.entries(payload).filter(([k]) =>
            !["sent", "failed", "healed", "reason", "stopped", "details"].includes(k)),
        ),
      },
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

/* One unanswered-guest alert per hour, however many runs fire in between. */
async function alreadyAlertedThisHour(sb: ReturnType<typeof createServerClient>) {
  const { count } = await sb.from("wa_runs")
    .select("id", { count: "exact", head: true })
    .eq("reason", "guest_waiting_alert")
    .gte("created_at", new Date(Date.now() - 3_600_000).toISOString());
  if (count) return true;
  await sb.from("wa_runs").insert({ sent: 0, reason: "guest_waiting_alert" }).then(() => {}, () => {});
  return false;
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

  /* A guest wrote and nobody has answered.
   *
   * This is the last thing in the system that is still completely silent. שקד
   * הומינר wrote on 16/08 — "אני מנסה לאשר הגעה והכפתורים לא מגיבים" — and the
   * only reason anyone saw it is that Dvir happened to open the inbox. A guest
   * asking a question is the one message that cannot wait for someone to think
   * of checking.
   *
   * Two hours of silence, so a reply written five minutes later is not
   * announced, and only once per hour so a slow morning does not become a
   * stream. Runs before anything else in the send, and can never affect it. */
  try {
    const alertTo = process.env.ADMIN_ALERT_PHONE;

    if (alertTo) {
      const since = new Date(Date.now() - 24 * 3_600_000).toISOString();
      const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString();
      const { data: inbound } = await sb.from("wa_messages")
        .select("guest_id, wa_phone, body, created_at")
        .eq("direction", "in").gte("created_at", since)
        .lte("created_at", twoHoursAgo)
        .order("created_at", { ascending: false }).limit(30);

      const waiting: { name: string; body: string }[] = [];
      for (const m of inbound ?? []) {
        if (!m.guest_id) continue;
        /* Answered means WE wrote to them after they wrote to us. */
        const { count: replied } = await sb.from("wa_messages")
          .select("id", { count: "exact", head: true })
          .eq("direction", "out").eq("guest_id", m.guest_id)
          .gt("created_at", m.created_at as string);
        if (replied) continue;
        /* Already announced in an earlier run? One alert per guest per day. */
        const { count: told } = await sb.from("wa_messages")
          .select("id", { count: "exact", head: true })
          .eq("direction", "in").eq("guest_id", m.guest_id)
          .gt("created_at", m.created_at as string);
        if (told) continue;
        const { data: g } = await sb.from("guests")
          .select("name").eq("id", m.guest_id).maybeSingle();
        waiting.push({ name: (g?.name as string) ?? (m.wa_phone as string), body: String(m.body ?? "").slice(0, 60) });
        if (waiting.length >= 3) break;
      }

      if (waiting.length && !(await alreadyAlertedThisHour(sb))) {
        await sendRunSummary(cfg, alertTo, {
          event: waiting.map(w => w.name).join(", "),
          sent: "0", failed: "0", left: String(waiting.length),
          attention: `💬 אורחים כתבו ואין תשובה: ${waiting.map(w => `${w.name} — "${w.body}"`).join(" · ")}`,
        });
      }
    }
  } catch { /* never let a notification cost a send */ }
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

  const hour = israelHour();
  if (hour < HOUR_START_IL || hour > HOUR_END_IL)
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
  let budget = Math.max(0, Math.min(usage.remaining, timeCap));

  /* The day before, first — see notifyDayBefore.
   *
   * Before the event selection and before every group, because this is the one
   * message with no second chance: a guest told at 22:00 what time to arrive
   * tomorrow was told too late, and one told after the חופה was not told at
   * all. Everything else in this file can wait a run.
   *
   * What it takes comes off the budget the rest of the run then shares, so a
   * day with 196 of these simply has fewer reminders — which is the correct
   * trade and not an accident. */
  try {
  /* The one alert that prevents damage instead of reporting it.
   *
   * On 9/8 Meta restricted this number with 131048 and sending stopped for
   * ALL THREE weddings for days. Dvir found out by looking. Quality moves
   * GREEN → YELLOW → RED before a restriction lands, so a message the
   * moment it slips is the difference between slowing down in time and
   * discovering it afterwards.
   *
   * The previous value is read from wa_runs, which has recorded quality on
   * every run since it existed — no new column, and the comparison is
   * against what actually happened rather than something held in memory
   * that a cold start would lose.
   *
   * Deliberately unconditional on posture: this fires even on a run that
   * sends nothing, because a number can degrade on a quiet day too. */
  if (process.env.ADMIN_ALERT_PHONE && health.quality && health.quality !== "UNKNOWN") {
    const RANK: Record<string, number> = { GREEN: 3, YELLOW: 2, RED: 1 };
    const now = RANK[health.quality] ?? 0;
    const { data: prevRows } = await sb.from("wa_runs")
      .select("quality, created_at").not("quality", "is", null)
      .neq("quality", "UNKNOWN")
      .order("created_at", { ascending: false }).limit(2);
    const prev = (prevRows ?? []).map(r => r.quality as string).find(q => RANK[q]);
    const was = prev ? RANK[prev] ?? 0 : 0;

    if (was && now && now < was) {
      /* Once per drop, not once per run — the check above reads the last
         recorded value, so the next run compares against the new low and
         stays quiet. */
      await sendRunSummary(cfg, process.env.ADMIN_ALERT_PHONE, {
        event: `⚠️ דירוג האיכות ירד: ${prev} → ${health.quality}`,
        sent: "0", failed: "0", left: String(usage.remaining ?? 0),
        attention: health.quality === "RED"
          ? "🔴 אדום — מטא עלולה להגביל את המספר בקרוב. לעצור שליחות ולבדוק דיווחי ספאם."
          : "🟡 צהוב — התקרה תרד לחצי אוטומטית. כדאי להאט ולבדוק למי נשלח לאחרונה.",
      });
    }
  }

  } catch { /* a notification must never cost a send */ }

  /* Once an evening, and only once.
   *
   * This was `getUTCHours() >= 18`, which matches BOTH of the day's last two
   * crons — 18:30 and 18:50 — so the digest and the link check ran twice every
   * night. The money is nothing; the cost is that Dvir receives the same
   * summary twice, and a message that repeats is one you stop opening.
   *
   * Gating on hour AND minute would work until a run is delayed, which Vercel
   * crons routinely are, and an 18:30 landing at 18:45 would qualify again.
   *
   * So it counts run claims instead. Every run inserts exactly one RUN_CLAIM
   * near the top — well before this line — so the current run always accounts
   * for one, and a second means an earlier evening run already came through
   * here. Counting all wa_runs rows would not work: a run writes several, and
   * the first version of this check found the current run's own claim and
   * skipped the digest every night. */
  const evening = new Date();
  const eveningStart = new Date(Date.UTC(
    evening.getUTCFullYear(), evening.getUTCMonth(), evening.getUTCDate(), 18, 0,
  )).toISOString();
  const { count: claimsTonight } = evening.getUTCHours() >= 18
    ? await sb.from("wa_runs").select("id", { count: "exact", head: true })
        .eq("reason", RUN_CLAIM).gte("created_at", eveningStart)
    : { count: 99 };

  if (evening.getUTCHours() >= 18 && (claimsTonight ?? 99) <= 1) {
    try { await sendDailyDigest(sb, cfg); }
    catch { /* a notification must never cost a send */ }

    /* And once a day, whether the links still work.
     *
     * A wrong link is silent by nature: it answers 200, it looks right on
     * every screen, and the only thing that reports it is a guest telling the
     * couple, who tells Dvir, a day and 175 messages later. That is what
     * happened on 30/08.
     *
     * Once a night, on the last run, and only when something is actually
     * broken — an alert that fires on a healthy evening is one nobody reads
     * by the third day. */
    try {
      const to = process.env.ADMIN_ALERT_PHONE;
      if (to) {
        const today2 = new Date().toISOString().slice(0, 10);
        const { data: live } = await sb.from("events")
          .select("id, name, wa_header_image_url, rides_group_url")
          .gte("date", today2).order("date").limit(5);
        for (const ev of live ?? []) {
          const [{ data: g }, { data: vt }] = await Promise.all([
            sb.from("guests").select("rsvp_token").eq("event_id", ev.id)
              .not("rsvp_token", "is", null).limit(1).maybeSingle(),
            sb.from("vault_tokens").select("token").eq("event_id", ev.id).maybeSingle(),
          ]);
          const broken = brokenSummary(await checkEventLinks({
            headerImage: ev.wa_header_image_url as string | null,
            ridesGroupUrl: (ev.rides_group_url as string | null) ?? undefined,
            sampleRsvpToken: g?.rsvp_token as string | undefined,
            vaultToken: vt?.token as string | undefined,
            baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app",
          }));
          if (broken) {
            await sendRunSummary(cfg, to, {
              event: `🔗 קישור שבור — ${ev.name}`,
              sent: "0", failed: "0", left: "0",
              attention: `${broken} · אורחים שילחצו יגיעו לשומקום. /admin/send-preview`,
            });
          }
        }
      }
    } catch { /* a check must never cost a send */ }
  }

  const dayBefore = await notifyDayBefore(sb, cfg, budget);

  /* A skipped day-before is not a routine line in a run record.
   *
   * notifyDayBefore refuses an event missing the couple's names, the venue or
   * the times — correctly, because a "מחר זה קורה" with a blank address is
   * worse than silence. The refusal was recorded and nothing else: the reason
   * landed in a run record nobody reads, on the one evening it could still be
   * fixed. ירון ואיילת is missing names and both times today; a wedding in that
   * state on its eve means every confirmed guest gets no directions at all and
   * the first anyone hears of it is the phone ringing on the day.
   *
   * Once, and only when something was actually skipped. */
  if (dayBefore.skipped && process.env.ADMIN_ALERT_PHONE) {
    try {
      await sendRunSummary(cfg, process.env.ADMIN_ALERT_PHONE, {
        event: "⚠️ הודעת \"מחר זה קורה\" לא יצאה",
        sent: "0", failed: "—", left: "—",
        attention: `${dayBefore.skipped} · החתונה מחר. השלימו ב-/admin ותוך שעה זה יוצא לבד.`,
      });
    } catch { /* an alert must never cost a send */ }
  }

  budget = Math.max(0, budget - dayBefore.sent);
  if (!budget) return record(sb, { sent: dayBefore.sent, reason: dayBefore.sent ? "day_before_only" : "budget_exhausted", cap, healed, dayBefore },
    { cap, tier: health.tier, quality: health.quality, posture: health.posture,
      window_used: usage.recipients });

  /* The thank-you, second — and it has to be here rather than at the bottom.
   *
   * It used to live inside `if (!targets.length)`, which reads as "send it when
   * there is nothing better to do" and behaves as "never send it". A run
   * selects the nearest wedding with anyone eligible, and one eligible guest
   * anywhere is enough to skip this block entirely. On 25/08 that was exactly
   * the state: Dvir's wedding was the day before, 192 guests had asked for the
   * photos, and שחר, תהל and לאל וטל each had someone eligible — so the flag
   * could have been switched on and nothing would have gone out, for days.
   *
   * The message is worth the most in the hours after a wedding, when the photos
   * are still on everyone's phone, and worth steadily less every day after. It
   * cannot wait behind an invitation for a wedding a month away.
   *
   * Still capped, for the reason the old comment gave: a wedding with 555 of
   * these would otherwise take four consecutive days of quota and stop another
   * couple's invitations.
   *
   * The number moved from sixty to a hundred and fifty on 27/08, with a
   * reserve replacing the flat ceiling as the actual protection. Sixty was
   * measured against nothing: it cleared 195 in four runs, so the last guest
   * heard at 21:30 instead of 16:00, and this is the one message whose value
   * decays by the hour — a guest asked for photos the day after still has them
   * open on their phone, and one asked at midnight has moved on.
   *
   * A reserve says what the ceiling was trying to say and says it honestly:
   * leave room for the invitations, take the rest. Thirty is more than the
   * uninvited backlog has been on any day this month, and at a full 250-budget
   * a 555-guest gallery is still held to 150, leaving a hundred behind it.
   *
   * Gated on gallery_ready, which only Dvir can set, so this sends nothing
   * until he says the photos are actually up. */
  /* Nothing when the reserve cannot be honoured, rather than one.
   *
   * This was Math.max(1, …), so a budget below the reserve still sent a single
   * gallery message — and the block below returns the whole run the moment
   * gallery.sent is non-zero. At a budget of 25 that meant one photo request
   * went out and twenty-four slots that were being held for invitations were
   * simply not used. The reserve exists for exactly the runs where the budget
   * is tight, which is the one case where it leaked. */
  const galleryRoom = Math.min(GALLERY_PER_RUN, Math.max(0, budget - GALLERY_RESERVE));
  const gallery = galleryRoom > 0
    ? await notifyGallery(sb, cfg, galleryRoom)
    : { sent: 0 as number, event: undefined as string | undefined };
  if (gallery.sent) {
    budget = Math.max(0, budget - gallery.sent);
    try {
      const to = process.env.ADMIN_ALERT_PHONE;
      if (to) await sendRunSummary(cfg, to, {
        event: gallery.event ?? "", sent: String(gallery.sent), failed: "0",
        left: String(Math.max(0, cap - usage.recipients - gallery.sent)),
        attention: "📸 סבב התודה והתמונות יצא לאורחים",
      });
    } catch { /* an alert must never cost a send */ }
    return record(sb, {
      sent: gallery.sent, reason: "gallery_notified", healed,
      galleryEvent: gallery.event, cap,
    }, { cap, tier: health.tier, quality: health.quality,
         posture: health.posture, window_used: usage.recipients });
  }

  const rides = await notifyRidesGroup(sb, cfg, budget);
  budget = Math.max(0, budget - rides.sent);
  if (!budget) return record(sb, {
    sent: rides.sent, reason: "rides_group_only", healed, cap,
    ridesEvent: rides.event,
  }, { cap, tier: health.tier, quality: health.quality,
       posture: health.posture, window_used: usage.recipients });

  /* An event with no card of its own is skipped, never sent with someone
     else's. Reported, so a missing image surfaces instead of looking like a
     quiet day. */
  const today = new Date().toISOString().slice(0, 10);
  const { data: events } = await sb.from("events")
    .select("id, name, couple_names, date, address, venue_name, wa_header_image_url, send_paused_until, reception_time, chuppah_time")
    .gte("date", today).order("date").limit(MAX_EVENTS_PER_RUN);

  /* A wedding can be held back without disturbing the order of the others.
   *
   * Nearest-wedding-first is the right default and stays. What it could not
   * express is "not this one, not tonight": Dvir's own wedding is the nearest
   * and would take every run, while שחר's 327 invitations wait behind it. He
   * wants מוצ״ש and Sunday to go to her and his own 83 reminders to resume on
   * Monday, and until now that meant watching the clock and flipping something
   * by hand at 21:00 on a Saturday night.
   *
   * A paused event is not deprioritised, it is skipped — the next nearest
   * wedding takes the run, and when the pause lapses the ordering returns to
   * what it was with nothing to undo. It appears in skippedEvents with its
   * return date so a silent run is never unexplained. */
  const nowMs = Date.now();
  const paused = (events ?? []).filter(e =>
    e.send_paused_until && new Date(e.send_paused_until as string).getTime() > nowMs);
  const pausedIds = new Set(paused.map(e => e.id as string));

  const active = (events ?? []).filter(e => e.wa_header_image_url && !pausedIds.has(e.id as string));
  const skippedEvents = [
    ...(events ?? [])
      .filter(e => !e.wa_header_image_url && !pausedIds.has(e.id as string))
      .map(e => ({ event: e.name, reason: "אין תמונת הזמנה" })),
    ...paused.map(e => ({
      event: e.name,
      reason: `מושהה עד ${new Date(e.send_paused_until as string)
        .toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    })),
  ];

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
  /* "Has pending guests" is not the same as "has anyone we may message today".
   *
   * This counted status = pending and stopped there, which was true before the
   * cooldown existed. Now a wedding whose guests were all reminded this morning
   * still shows a full pending list, gets selected by every later run, and
   * sends nothing — while the wedding behind it, with three hundred people who
   * have never been contacted, waits for a turn that never comes.
   *
   * That is exactly the case Dvir is about to create: his own 60 reminders go
   * out at 09:00, and from 11:15 onward his event would win every run and send
   * zero, starving תהל ואביב for the whole day.
   *
   * So the selection asks the question the send actually asks — is there anyone
   * here we are allowed to message right now — using the same 24h floor as the
   * first-contact group. Three events at most, one extra query each. */
  /* Nobody is reminded while anybody is still uninvited — across all weddings,
   * not only within one.
   *
   * Group 3 below already says "reminders, only once nobody is left uninvited",
   * and it was true per event and false everywhere else. שחר has 199 people
   * holding an invitation they have not answered and 6 who never received one;
   * תהל has 6 more. Nearest-wedding-first gives שחר the run, her 199 reminders
   * fill a 250-a-day ceiling, and תהל's 6 — people who have never once been
   * told there is a wedding — wait behind them. Not for a run. For a day, and
   * then the next day, because the same arithmetic repeats.
   *
   * A reminder is worth something. A first invitation is worth the whole
   * feature: the guest cannot answer, cannot be counted, and cannot arrive.
   * The two should never compete for the same slot, and the fifteen people this
   * concerns cost 6% of one day.
   *
   * So: if any wedding still has someone never contacted, this run serves the
   * nearest such wedding and sends first contacts only. The reminders are not
   * cancelled, they wait for a run — and with six runs a day the uninvited are
   * drained by mid-morning, which is what happened on 20/08. */
  let firstContactOnly = false;
  let fallback: (typeof active)[number] | null = null;
  for (const cand of active) {
    const { data: pend } = await sb.from("guests")
      .select("id").eq("event_id", cand.id).eq("status", "pending")
      .not("phone", "is", null).limit(900);
    const pendIds = (pend ?? []).map(r => r.id as string);
    if (!pendIds.length) continue;

    /* The same two floors the send itself applies, not one average of them.
     *
     * This asked a single question — "messaged in the last 24 hours?" — while
     * the groups below use two: 24h before a first contact, 72h before a
     * reminder. A guest last messaged thirty hours ago passed the selection and
     * failed the send, so on 18/08 the 19:31 and 21:30 runs both chose מירב
     * ודביר, found nothing they were allowed to send, and recorded nothing_due
     * — while תהל ואביב had 204 eligible guests and 204 of the day's quota went
     * unused.
     *
     * Never contacted → the 24h floor. Already contacted → the 72h one. */
    const last = new Map<string, string>();
    const arrived = new Set<string>();
    for (let i = 0; i < pendIds.length; i += 150) {
      const { data } = await sb.from("wa_messages")
        .select("guest_id, status, created_at").eq("direction", "out")
        .in("guest_id", pendIds.slice(i, i + 150));
      for (const m of data ?? []) {
        const id = m.guest_id as string;
        if (!id) continue;
        if (["delivered", "read"].includes(m.status as string)) arrived.add(id);
        const at = m.created_at as string;
        if (!last.has(id) || at > last.get(id)!) last.set(id, at);
      }
    }
    const eligible = pendIds.filter(id => isEligibleNow({
      delivered: arrived.has(id), lastOutboundAt: last.get(id) ?? null,
    }));
    if (!eligible.length) continue;

    /* Never reached, and allowed to be reached now. */
    const uninvited = eligible.filter(id => !arrived.has(id));
    if (uninvited.length) { ev = cand; firstContactOnly = true; break; }

    /* Nearest wedding with reminder work, remembered in case no wedding
       anywhere still has anyone uninvited. The loop continues rather than
       settling here, because a later wedding may. */
    if (!fallback) fallback = cand;
  }
  /* No first contacts left anywhere — the ordinary reminder day. */
  if (!firstContactOnly && fallback) ev = fallback;
  const image = ev.wa_header_image_url as string;

  /* The four variables the generic template needs — built here, and refused
   * here if they cannot be built.
   *
   * This call used to pass `undefined` for details, which made sendInvitation
   * fall through to cfg.templateName: the template approved for Dvir's own
   * wedding, with his and Mirav's names and date baked into the text. It was
   * correct for exactly one event and would have sent שחר's 327 guests an
   * invitation to somebody else's wedding, over her own photograph, with her
   * own RSVP link underneath. It was right for מירב ודביר by coincidence,
   * which is why nothing ever caught it.
   *
   * Refusing is the point. An event with no couple name, no times or no venue
   * is skipped and reported, because the failure this replaces was not a
   * crash — it was a message that sent perfectly and said the wrong thing. */
  /* Everything one wedding needs in a message, or the reason it cannot be sent.
   *
   * Extracted so a run can carry more than one wedding. A run served exactly
   * one, and on a day when the nearest wedding has three people left that
   * wasted the rest: 13:30 today has 43 free slots, two first contacts at
   * מירב ודביר, and would have sent two — while תהל's nine and שחר's sixteen
   * waited for a turn. See the second first-contact pass below. */
  type Pack = { image: string; details: { couple: string; date: string; venue: string; times: string } };
  const packFor = (e: (typeof active)[number]): { pack?: Pack; missing?: string } => {
    const c = coupleName(e);
    const t = eventTimes(e);
    const v = venueLine(e);
    const d = e.date ? weddingDateLine(e.date as string) : null;
    const img = e.wa_header_image_url as string | null;
    const why =
      !img                 ? "אין תמונת הזמנה"
      : !c                 ? "אין שמות בני זוג (couple_names)"
      : !looksLikeCouple(c) ? `"${c}" לא נראה כמו שמות בני זוג`
      : !d                 ? "אין תאריך"
      : !v                 ? "אין מקום"
      : !t                 ? "אין שעות קבלת פנים/חופה"
      : null;
    return why ? { missing: why }
               : { pack: { image: img!, details: { couple: c!, date: d!, venue: v!, times: t! } } };
  };

  const couple = coupleName(ev);
  const times  = eventTimes(ev);
  /* Both halves of the address, not whichever one happens to be filled.
   *
   * This read address and stopped. תהל ואביב were entered as venue_name "גן
   * האירועים ארץ" + address "מושב עג׳ור", so their 310 guests would have been
   * told to drive to "מושב עג׳ור" — a village, with no venue named in it.
   * שחר's row happened to carry the whole string in address and came out right,
   * which is the worst kind of correct: same person, same afternoon, two
   * weddings, and only luck separated them.
   *
   * The schema allows two valid fillings that produce different messages, so
   * the sender stops depending on which one it got. */
  const vName  = (ev.venue_name as string | null)?.trim() || "";
  const vAddr  = (ev.address as string | null)?.trim() || "";
  const venue  =
    vAddr && vName && !vAddr.includes(vName) ? `${vName}, ${vAddr}`
    : vAddr || vName || null;
  const when   = ev.date ? weddingDateLine(ev.date as string) : null;

  const missing =
    !couple                  ? "אין שמות בני זוג (couple_names)"
    : !looksLikeCouple(couple) ? `"${couple}" לא נראה כמו שמות בני זוג`
    : !when                  ? "אין תאריך"
    : !venue                 ? "אין מקום"
    : !times                 ? "אין שעות קבלת פנים/חופה"
    : null;

  if (missing) {
    return record(sb, {
      sent: 0, reason: "event_not_ready", healed,
      skippedEvents: [...skippedEvents, { event: ev.name, reason: missing }],
    }, { event_id: ev.id, cap, tier: health.tier, quality: health.quality,
         posture: health.posture, window_used: usage.recipients });
  }

  const details = { couple, date: when, venue, times } as {
    couple: string; date: string; venue: string; times: string };

  /* Every wedding this run is allowed to speak for, keyed by event. The send
     loop looks a guest's own wedding up here rather than trusting that all
     four target queries were scoped correctly — a wedding with no pack is
     dropped by name, exactly as a cross-event guest was before. */
  const packs = new Map<string, Pack>([[ev.id as string, { image, details }]]);
  for (const e of active) {
    if (packs.has(e.id as string)) continue;
    const { pack, missing: why } = packFor(e);
    if (pack) packs.set(e.id as string, pack);
    else if (why) skippedEvents.push({ event: e.name as string, reason: why });
  }

  const sent: string[] = [];
  const failed: { name: string; error: string }[] = [];
  /* Guests who reached the batch from a query scoped to a different wedding.
     Always empty in a healthy run; loud in the run where it is not. */
  const crossEvent: { name: string; event: string }[] = [];
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
  /* Reminders already sent, for the cap in lib/eligibility.
   *
   * There is no per-message type column; the sender writes a Hebrew label into
   * body at send time, and that label is the only record of what a message
   * was. Counting it here is reading what happened rather than reconstructing
   * it from configuration that may since have changed. */
  const remindersByGuest = new Map<string, number>();
  /* Sends Meta ACCEPTED, for the first-contact ceiling in lib/eligibility.
     Accepted, not delivered: a wamid means Meta took the message, and Meta does
     not always report back afterwards. Guests whose reports never arrived were
     exempt from every ceiling and were written to daily — 46 of them, 123
     redundant messages, 42 of which took a slot out of a 250-a-day cap. */
  const acceptedByGuest = new Map<string, number>();
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { data } = await sb.from("wa_messages")
      .select("guest_id, status, error_code, error, created_at, body")
      .eq("direction", "out").in("guest_id", slice);
    (data ?? []).forEach(m => {
      if (!m.guest_id) return;
      if (String(m.body ?? "").includes("תזכורת")) {
        remindersByGuest.set(m.guest_id, (remindersByGuest.get(m.guest_id) ?? 0) + 1);
      }
      if (m.status !== "failed" && !m.error_code) {
        acceptedByGuest.set(m.guest_id, (acceptedByGuest.get(m.guest_id) ?? 0) + 1);
      }
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

    /* A guest who wrote to us has demonstrably received something.
     *
     * `contacted` was built from delivery reports alone, and Meta does not
     * always send one — which is the same gap the first-contact ceiling in
     * lib/eligibility now closes from the other side. Between the two, a guest
     * whose reports never arrive but who is actively replying would be silenced
     * at four attempts while mid-conversation. An inbound message is stronger
     * evidence than a delivery report, not weaker: the report says Meta thinks
     * it arrived, the reply says a person read it.
     *
     * Nobody is in that state today — every guest who has ever written also has
     * a delivery report — so this changes nothing now and closes the case
     * before it happens. */
    const { data: spoke } = await sb.from("wa_messages")
      .select("guest_id, created_at").eq("direction", "in").in("guest_id", slice);
    (spoke ?? []).forEach(r => {
      if (!r.guest_id) return;
      contacted.add(r.guest_id);
      const prev = firstArrival.get(r.guest_id);
      if (!prev || r.created_at < prev) firstArrival.set(r.guest_id, r.created_at);
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
  /* "Do not message this person." A couple saying so is not an error state and
     must not expire: the helper-assignment field was borrowed for it once and
     would have returned אורית to the queue two days later, after Dvir had
     already spoken to her himself. Read straight from the guest, alongside the
     numbers Meta will never accept — from the sender's side they are the same
     instruction. */
  const { data: dncRows } = await sb.from("guests")
    .select("id, do_not_contact_note").eq("event_id", ev.id).eq("do_not_contact", true);
  const doNotContact = new Map<string, string>(
    (dncRows ?? []).map(r => [r.id as string, (r.do_not_contact_note as string) || "סומן: לא לפנות"]),
  );

  /* Guests no send can reach right now — permanently, or until they speak first.
   *
   * This caught only "never" (131026 no account, 131050 opted out) and let
   * "wait_for_inbound" through. 130472 is wait_for_inbound: Meta has placed the
   * recipient in a marketing-experiment control group and withholds templates
   * from them, and policyFor's own comment says no timer can fix it "no matter
   * how long the timer is".
   *
   * But nothing excluded them, so they stayed eligible: their message failed so
   * they never count as contacted, and every run picked them up again and sent
   * a template that cannot arrive. Six of שחר's guests, once a day, for as long
   * as the wedding is in the future — each attempt burning a send, writing
   * another failed row and telling Meta we keep pushing at a number it asked us
   * to leave alone.
   *
   * The exclusion is not permanent. The moment one of them messages us the
   * webhook records an inbound row, the 24h service window opens, and the next
   * run finds them contactable again. */
  const unreachable = new Map<string, string>();
  for (const [id, m] of lastByGuest) {
    if (m.status !== "failed") continue;
    const pol = policyFor(m.code, m.err);
    if (pol.action === "never" || pol.action === "wait_for_inbound") {
      unreachable.set(id, pol.human);
    }
  }

  /* And released the moment they speak.
   *
   * lastByGuest holds only OUTBOUND rows, so a guest whose template failed
   * stays excluded on that evidence for ever — which turns wait_for_inbound
   * into never, the exact opposite of what it means. An inbound message after
   * the failure is the 24h window opening, and it is the one thing that makes
   * these guests reachable again. */
  const waiting = [...unreachable.keys()].filter(id => {
    const a = policyFor(lastByGuest.get(id)?.code, lastByGuest.get(id)?.err ?? null);
    return a.action === "wait_for_inbound";
  });
  if (waiting.length) {
    const { data: spoke } = await sb.from("wa_messages")
      .select("guest_id, created_at").eq("direction", "in").in("guest_id", waiting);
    for (const r of spoke ?? []) {
      const id = r.guest_id as string;
      const failedAt = lastByGuest.get(id)?.at;
      if (failedAt && (r.created_at as string) > failedAt) unreachable.delete(id);
    }
  }

  const assignedSince = new Date(Date.now() - 48 * 3_600_000).toISOString();
  const { data: held } = await sb.from("guests")
    .select("id").eq("event_id", ev.id)
    .not("assigned_helper", "is", null)
    .gte("assigned_at", assignedSince);
  const reserved = new Set((held ?? []).map(h => h.id as string));

  /* How long since we last put anything on this person's phone.
   *
   * Nothing here asked that question, and nothing else answered it either:
   * rollingWindowUsage counts UNIQUE recipients, so messaging the same guest
   * again never reduces `remaining` and the budget comes back identical on the
   * next run. The reminder sort is deterministic and the same people stay
   * pending, so the same head of the queue was selected by all six daily runs
   * while the tail was never reached — up to six messages a day to one guest,
   * and none at all to another.
   *
   * That is exactly what produces 131048, and 131048 stops sending for all
   * three weddings at once.
   *
   * lastByGuest is already built above from every outbound row, so this costs
   * nothing: no extra query, one map lookup per candidate. */
  /* One rule, from lib/eligibility. The floors used to be spelled out here and
     again in the selection above, and the two disagreed — see that file. */
  const mayMessage = (id: string) => isEligibleNow({
    delivered: contacted.has(id),
    lastOutboundAt: lastByGuest.get(id)?.at ?? null,
    /* Two reminders and no more — see MAX_REMINDERS_PER_GUEST. Passed only
       here, where a reminder is what would be sent; the first-contact groups
       must stay uncapped. */
    remindersSent: remindersByGuest.get(id) ?? 0,
    attemptsAccepted: acceptedByGuest.get(id) ?? 0,
  });

  /* ---- 1. no evidence the invitation ever arrived ---- */
  ids.filter(id => !contacted.has(id) && !reserved.has(id) && !unreachable.has(id)
                   && !doNotContact.has(id) && mayMessage(id))
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
      /* The three guards every other group applies, and this one did not.
       *
       * A retry is chosen from wa_messages, so it knew about the failed row and
       * nothing about the guest. A couple marking someone do_not_contact — the
       * אורית case this file already documents — did not retire a retry already
       * queued for them, and a guest whose LATEST failure is 131050 ("asked to
       * stop") is held in `unreachable` while an OLDER retry_later row for the
       * same person stays due and is picked here.
       *
       * Both send another wedding template to someone who was promised no more
       * of them, which is the fastest route back to the 131048 restriction that
       * stopped sending for all three weddings at once. */
      if (doNotContact.has(d.guest_id)) continue;
      if (unreachable.has(d.guest_id)) continue;
      if (reserved.has(d.guest_id)) continue;
      if (policyFor(d.error_code, d.error).action !== "retry_later") continue;
      seen.add(d.guest_id);
      targets.push({ id: d.guest_id, row: d.id, count: (d.retry_count ?? 0) + 1 });
    }
  }

  /* ---- 2b. the first contacts at every OTHER wedding ----
   *
   * Group 1 is the same rule scoped to one event, and one event was all a run
   * could ever carry. That is what makes a 43-slot run send two messages: the
   * nearest wedding has two people left uninvited, and nothing lets the run
   * reach the nine at תהל or the sixteen at שחר sitting behind it.
   *
   * Each guest is sent their OWN wedding's invitation — packs is keyed by
   * event and the send loop looks up per guest, so the image, the names, the
   * venue and the times all come from the wedding the guest is actually
   * invited to. That is the failure this whole file is most afraid of, and it
   * is now checked per message rather than assumed per run.
   *
   * Reminders still come after all of it. Nobody is reminded anywhere while
   * anybody is uninvited anywhere. */
  if (targets.length < budget) {
    for (const other of active) {
      if (targets.length >= budget) break;
      if (other.id === ev.id || !packs.has(other.id as string)) continue;

      const { data: op } = await sb.from("guests")
        .select("id, phone, rsvp_token, category, do_not_contact")
        .eq("event_id", other.id).eq("status", "pending")
        .order("send_priority", { ascending: false });
      const oIds = (op ?? [])
        .filter(x => x.category !== "demo" && x.phone && x.rsvp_token && !x.do_not_contact)
        .map(x => x.id as string);
      if (!oIds.length) continue;

      const arrived = new Set<string>();
      const latest = new Map<string, { at: string; code: number | null; err: string | null }>();
      for (let i = 0; i < oIds.length; i += 100) {
        const { data } = await sb.from("wa_messages")
          .select("guest_id, status, error_code, error, created_at")
          .eq("direction", "out").in("guest_id", oIds.slice(i, i + 100));
        for (const m of data ?? []) {
          const id = m.guest_id as string;
          if (!id) continue;
          if (["delivered", "read"].includes(m.status as string)) arrived.add(id);
          const at = m.created_at as string;
          const prev = latest.get(id);
          if (!prev || at > prev.at) latest.set(id, { at, code: m.error_code, err: m.error });
        }
      }

      /* A helper may already be holding this guest — same reason as above. */
      const { data: held } = await sb.from("guests")
        /* assigned_helper. There is no assigned_to column on guests, so this
           query errored, `held` came back null, the set was empty, and every
           guest a helper is currently working through at a secondary wedding
           was messaged by the sender as well — the "family messages them at
           14:50 and the business number at 15:00" failure the selected-wedding
           path above exists to prevent, live on every other wedding. */
        .select("id").eq("event_id", other.id).not("assigned_helper", "is", null);
      const reservedHere = new Set((held ?? []).map(r => r.id as string));

      const seen = new Set(targets.map(t => t.id));
      for (const id of oIds) {
        if (targets.length >= budget) break;
        if (seen.has(id) || arrived.has(id) || reservedHere.has(id)) continue;
        const l = latest.get(id);
        /* Latest attempt only — a number that failed in June and delivered in
           August is reachable. Same judgement as the unreachable map above. */
        if (l && ["never", "wait_for_inbound"].includes(policyFor(l.code, l.err).action)) continue;
        if (!isEligibleNow({ delivered: false, lastOutboundAt: l?.at ?? null })) continue;
        targets.push({ id });
      }
    }
  }

  /* ---- 3. reminders, only once nobody is left uninvited ----

     Their own approved template, never the invitation again: sending the same
     invitation a second time to someone who already has it reads as a system
     that lost track of them. */
  /* No hold here, and the first version of this change had one.
   *
   * The crowding-out this was meant to prevent is a problem BETWEEN events,
   * and the selection above already solves it: the run picks a wedding that
   * still has someone uninvited, so every wedding gets its turn within a day.
   * Inside a single run there is nothing to protect against — group 1 is built
   * before group 3 and takes its budget first.
   *
   * What the hold did instead was throw budget away. Simulated against
   * tonight, the 22:00 run has 204 slots, four first contacts, and would have
   * sent four — while 81 of שחר's reminders sat waiting for tomorrow. */
  const remindersHeld = Date.now() < REMINDERS_RESUME_AT;
  if (targets.length < budget && !remindersHeld) {
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
                  && !unreachable.has(id) && !doNotContact.has(id)
                  && mayMessage(id))
      .sort((a, b) => (firstArrival.get(a) ?? "9999").localeCompare(firstArrival.get(b) ?? "9999"))
      .slice(0, budget - targets.length)
      .forEach(id => targets.push({ id, reminder: true }));
  }

  /* ---- 3b. reminders at the OTHER weddings ----
   *
   * Only once the nearest wedding has nobody left to remind. That ordering is
   * the whole point — a wedding in five days outranks one in five weeks — but
   * it stopped being an ordering and became a wall: when the nearest wedding
   * ran dry the run simply ended, however much of the day was left.
   *
   * Tonight is the clearest case. 204 slots come back at 21:44, the 22:00 run
   * picks תהל because it has four people never contacted, תהל has nobody due
   * for a reminder, and 196 slots expire while 76 of שחר's guests wait — the
   * exact reminders Dvir asked to go out tonight. */
  if (targets.length < budget && !remindersHeld) {
    for (const other of active) {
      if (targets.length >= budget) break;
      if (other.id === ev.id || !packs.has(other.id as string)) continue;

      const { data: op } = await sb.from("guests")
        .select("id, phone, rsvp_token, category, do_not_contact")
        .eq("event_id", other.id).eq("status", "pending");
      const oIds = (op ?? [])
        .filter(x => x.category !== "demo" && x.phone && x.rsvp_token && !x.do_not_contact)
        .map(x => x.id as string);
      if (!oIds.length) continue;

      const arrived = new Set<string>();
      const firstAt = new Map<string, string>();
      const latest = new Map<string, { at: string; code: number | null; err: string | null }>();
      /* Reminders already sent, which this block never counted.
       *
       * The selected wedding passes remindersSent into isEligibleNow and its
       * guests stop at three. This one did not, so MAX_REMINDERS_PER_GUEST
       * simply did not exist here: a guest was capped while their wedding was
       * the one the run picked and uncapped the moment it picked another.
       *
       * תהל ואביב and לאל וטל are both on 22/09, so one of them is the
       * secondary wedding on most runs, and 87 pending guests are sitting on
       * exactly three reminders today — every one of them a fourth away. */
      const remCount = new Map<string, number>();
      for (let i = 0; i < oIds.length; i += 100) {
        const { data } = await sb.from("wa_messages")
          .select("guest_id, status, error_code, error, created_at, body")
          .eq("direction", "out").in("guest_id", oIds.slice(i, i + 100));
        for (const m of data ?? []) {
          const id = m.guest_id as string;
          if (!id) continue;
          const at = m.created_at as string;
          if (String(m.body ?? "").includes("תזכורת")) {
            remCount.set(id, (remCount.get(id) ?? 0) + 1);
          }
          if (["delivered", "read"].includes(m.status as string)) {
            arrived.add(id);
            const f = firstAt.get(id);
            if (!f || at < f) firstAt.set(id, at);
          }
          const prev = latest.get(id);
          if (!prev || at > prev.at) latest.set(id, { at, code: m.error_code, err: m.error });
        }
      }

      const { data: held } = await sb.from("guests")
        /* assigned_helper. There is no assigned_to column on guests, so this
           query errored, `held` came back null, the set was empty, and every
           guest a helper is currently working through at a secondary wedding
           was messaged by the sender as well — the "family messages them at
           14:50 and the business number at 15:00" failure the selected-wedding
           path above exists to prevent, live on every other wedding. */
        .select("id").eq("event_id", other.id).not("assigned_helper", "is", null);
      const reservedHere = new Set((held ?? []).map(r => r.id as string));

      const seen = new Set(targets.map(t => t.id));
      /* Longest wait first, same as the group above. */
      oIds.filter(id => arrived.has(id) && !seen.has(id) && !reservedHere.has(id))
        .filter(id => {
          const l = latest.get(id);
          if (l && ["never", "wait_for_inbound"].includes(policyFor(l.code, l.err).action)) return false;
          return isEligibleNow({
            delivered: true, lastOutboundAt: l?.at ?? null,
            remindersSent: remCount.get(id) ?? 0,
          });
        })
        .sort((a, b) => (firstAt.get(a) ?? "9999").localeCompare(firstAt.get(b) ?? "9999"))
        .slice(0, budget - targets.length)
        .forEach(id => targets.push({ id, reminder: true }));
    }
  }

  if (!targets.length) {
    /* A run that chose a wedding and then had nobody to message.
     *
     * This is the exact shape of the 18/08 evening: selection picked מירב ודביר
     * on a 24-hour test, the reminder group refused them on a 72-hour one, and
     * both the 19:31 and 21:30 runs recorded nothing_due while תהל ואביב had
     * 204 eligible guests and 204 of the day's quota expired. Nothing said a
     * word — Dvir found it himself at half past nine.
     *
     * The thresholds are aligned now, so this should not recur. But "should not"
     * is what I said yesterday, and a run that selects an event and sends zero
     * is worth a message either way: it means the selection and the send
     * disagree, which is a bug every time it happens.
     *
     * Only when there is quota left. A quiet run at the end of a full day is
     * normal and must not wake anybody. */
    const left = Math.max(0, cap - usage.recipients);
    if (left > 20) {
      try {
        const to = process.env.ADMIN_ALERT_PHONE;
        if (to) await sendRunSummary(cfg, to, {
          event: ev.name as string, sent: "0", failed: "0", left: String(left),
          attention: "⚠️ הריצה בחרה אירוע ולא שלחה כלום — בדוק מי זכאי",
        });
      } catch { /* an alert must never cost a run */ }
    }
    return record(sb, { sent: 0, reason: "nothing_due", healed },
      { event_id: ev.id, cap, tier: health.tier, quality: health.quality,
        posture: health.posture, window_used: usage.recipients });
  }

  /* In chunks, because this list is no longer small.
   *
   * `.in()` becomes a query string, and a query string has a length nobody
   * declares until it is exceeded — 250 UUIDs is about 9,000 characters. It
   * held while a run was one wedding's reminders; now a run can carry the
   * day's whole budget across three weddings, and the failure mode is not an
   * error. PostgREST returns the rows it could parse, byId comes back short,
   * and every target it missed is silently skipped: no send, no failure, no
   * row. Exactly the kind of quiet loss this file keeps being bitten by. */
  const guests: { id: string; name: string; phone: string; rsvp_token: string; event_id: string }[] = [];
  const allIds = targets.map(t => t.id);
  for (let i = 0; i < allIds.length; i += 100) {
    const { data } = await sb.from("guests")
      .select("id, name, phone, rsvp_token, event_id").in("id", allIds.slice(i, i + 100));
    guests.push(...((data ?? []) as typeof guests));
  }
  const byId = new Map(guests.map(g => [g.id, g]));

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

      /* The guest must belong to the wedding whose details are in this message.
       *
       * targets is assembled from four separate queries — pending guests,
       * reminders, deferred retries, backfill — and details comes from one
       * event. Every one of those queries is supposed to be scoped to ev.id,
       * and checking that they all are is a claim with a shelf life: the next
       * source added is one nobody re-checks.
       *
       * So it is not a claim. A guest from another wedding is dropped here and
       * recorded by name, which turns "I read the queries" into something that
       * holds for queries not yet written. This is the only thing standing
       * between three couples sending in the same week and שחר's guests being
       * invited to תהל's wedding. */
      const pack = packs.get(g.event_id as string);
      if (!pack) {
        crossEvent.push({ name: (g.name as string) ?? t.id, event: ev.name as string });
        return null;
      }
      const res = await sendInvitation(
        cfg, g.phone, g.rsvp_token, pack.image, pack.details,
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
            /* The GUEST's wedding, not the run's.
               A run now carries several weddings, and this wrote whichever one
               was selected — so on 19/08 five of תהל's guests were recorded
               against מירב ודביר. The message they received was correct (the
               send reads packs by g.event_id), but the row describing it was
               not, and the retry queue and every per-event count read this
               column. */
            event_id: (g.event_id as string) ?? ev.id, guest_id: g.id,
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
            /* The guest's wedding — same reason as the success path above. */
            event_id: (g.event_id as string) ?? ev.id, guest_id: g.id,
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

  /* Tell Dvir, on his phone, when something needs him.
   *
   * sending_run_summary_utility has been approved and unsent this whole time —
   * the seventh capability this week that existed and nothing reached. He asked
   * how he would learn that Meta raised the tier, and the honest answer was
   * that I check each morning, which is not a system.
   *
   * Only when it matters: the last run of the day, or a run that hit trouble.
   * Six summaries a day is noise, and noise is how the one that counts gets
   * ignored. UTILITY, so it costs nothing against the marketing cap.
   *
   * Never allowed to break a send — the whole thing is wrapped and swallowed.
   * A failed alert must not lose a run that already put messages on phones. */
  try {
    const alertTo = process.env.ADMIN_ALERT_PHONE;
    const hourIl = Number(new Date().toLocaleString("en-GB",
      { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }));
    const metaCap = Number(String(health.tier).replace(/\D/g, "")) || 0;
    const needsAction =
      failed.length > 5 ||
      health.quality !== "GREEN" ||
      (metaCap > 0 && cap > 0 && cap < metaCap);   /* Meta raised the tier */

    /* Every run that actually sent, plus anything that needs a decision.
     *
     * The first version spoke only at the end of the day or on trouble, on the
     * reasoning that six summaries a day become noise. Dvir asked for the
     * reminders too: 43 of his own went out at 11:17 and he learned it by
     * opening a screen. He is right that a send is not noise — it is the thing
     * the system exists to do, and there are only one to three of them a day
     * once the quota is spent by mid-morning.
     *
     * A run that sends nothing still says nothing, unless quota is going to
     * waste. That is the line: messages out, or a decision needed. Never
     * "nothing happened, as expected". */
    /* Did this run finish a round?
     *
     * Computed from the state the run leaves behind rather than remembered, so
     * it needs no column and cannot fire twice: once nobody is left without an
     * invitation the condition is only true for the run that emptied the list,
     * because every later run sends nothing.
     *
     * These are the moments Dvir wants to hear about without opening anything —
     * they are also the moments he messages a client, and a client would rather
     * hear it from him than ask. */
    let milestone = "";
    if (sent.length > 0) {
      const { count: noInvite } = await sb.from("guests")
        .select("id", { count: "exact", head: true })
        .eq("event_id", ev.id).eq("status", "pending")
        .not("phone", "is", null).neq("category", "demo")
        .is("opened_at", null);

      const firstContacts = targets.filter(t => !t.reminder).length;
      const reminders = targets.filter(t => t.reminder).length;

      if (firstContacts > 0 && (noInvite ?? 0) === 0) {
        milestone = `🎉 סבב ההזמנות הושלם — כל האורחים קיבלו`;
      } else if (reminders > 0 && firstContacts === 0) {
        /* Nothing left this run was allowed to remind. */
        milestone = `🔔 סבב התזכורות הושלם — ${reminders} יצאו`;
      }
    }

    if (alertTo && (sent.length > 0 || needsAction || hourIl >= 21)) {
      await sendRunSummary(cfg, alertTo, {
        event: ev.name as string,
        sent: String(sent.length),
        failed: String(failed.length),
        left: String(Math.max(0, cap - usage.recipients - sent.length)),
        attention: metaCap > cap
          ? `⬆ Meta אישרה ${metaCap} ליום — צריך להעלות את המכסה`
          : health.quality !== "GREEN"
            ? `⚠️ איכות ${health.quality}`
            : milestone || String(failed.length),
      });
    }
  } catch { /* an alert must never cost a run */ }

  return record(sb, {
    event: ev.name,
    /* Everything this run sent, not only the group it chose.
     *
     * This wrote sent.length — the invitations and reminders for one event —
     * while "מחר מתחתנים", the gallery and the rides group were counted in
     * their own fields and reached no total. On 23/08 the run at 21:52 sent
     * 158 messages and recorded 50, so the day read 139 on every screen while
     * 247 had actually left. Every number built on this was wrong by exactly
     * the messages that mattered most that week.
     *
     * The parts stay reported separately below; this is their sum. */
    sent: sent.length + dayBefore.sent + rides.sent,
    groupSent: sent.length,
    failed: failed.length, stopped,
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
    ...(crossEvent.length ? { crossEvent } : {}),
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
