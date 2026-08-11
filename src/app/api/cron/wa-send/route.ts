import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  getWhatsAppConfig, sendInvitation, toE164, policyFor,
  rollingWindowUsage, SECONDS_PER_MESSAGE, SEND_CONCURRENCY,
  fetchAccountHealth, warmupCap, recentPeakRecipients,
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

/* Israel is UTC+3 in August. Nothing goes out before 09:00 or after 18:00
   local — a wedding invitation arriving at 04:00 gets reported, and reports
   are what restricted this number in the first place. */
const HOUR_START_UTC = 6;
const HOUR_END_UTC = 15;

export async function GET(req: NextRequest) {
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

  const hour = new Date().getUTCHours();
  if (hour < HOUR_START_UTC || hour > HOUR_END_UTC)
    return NextResponse.json({ sent: 0, reason: "outside_sending_hours" });

  const sb = createServerClient();

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
    return NextResponse.json({
      sent: 0, reason: "meta_blocked",
      quality: health.quality, posture: health.posture, reasons: health.reasons,
    });
  }

  /* Meta counts unique recipients in a rolling 24h and refuses past the
     ceiling with 141015. Reading it first is the difference between pausing
     and reproducing the run that failed 90%. */
  const usage = await rollingWindowUsage(sb, cap);
  if (usage.blocked) {
    return NextResponse.json({
      sent: 0, reason: "window_full",
      recipients: usage.recipients, cap, quality: health.quality,
    });
  }

  /* Time is now the only per-run ceiling that matters. At six in flight and
     ~1.2s each, a 48-second working window holds far more than any day's cap,
     so the run is bounded by the rolling window rather than by the clock —
     which is the whole point of the change. */
  const timeCap = Math.floor(((maxDuration - 12) / SECONDS_PER_MESSAGE) * SEND_CONCURRENCY);
  const budget = Math.max(0, Math.min(usage.remaining, timeCap));
  if (!budget) return NextResponse.json({ sent: 0, reason: "budget_exhausted", cap });

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
    return NextResponse.json({ sent: 0, reason: "no_sendable_event", skippedEvents });

  /* One event per run, round-robin by date, so a large wedding cannot starve
     a smaller one that shares the same number-level quota. */
  const ev = active[0];
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
      if (["delivered", "read"].includes(m.status)) contacted.add(m.guest_id);
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
    const { data: manual } = await sb.from("guest_events").select("guest_id")
      .eq("event_type", "manual_sent").in("guest_id", slice);
    (manual ?? []).forEach(m => m.guest_id && contacted.add(m.guest_id));
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

    const seen = new Set(targets.map(t => t.id));
    for (const d of dueRaw ?? []) {
      if (targets.length >= budget) break;
      if (!d.guest_id || seen.has(d.guest_id)) continue;
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
    ids.filter(id => contacted.has(id) && !already.has(id) && !reserved.has(id)
                  && !unreachable.has(id))
      .slice(0, budget - targets.length)
      .forEach(id => targets.push({ id, reminder: true }));
  }

  if (!targets.length) return NextResponse.json({ sent: 0, reason: "nothing_due" });

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
  for (let i = 0; i < targets.length && !stopped; i += SEND_CONCURRENCY) {
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
        }

        if (pol.action === "stop_run") stopped = "המספר מוגבל — עצירת ההרצה";
      }
    }
  }

  return NextResponse.json({
    event: ev.name,
    sent: sent.length, failed: failed.length, stopped,
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
    details: { sent, failed },
  });
}
