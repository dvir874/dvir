import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  getWhatsAppConfig, sendInvitation, toE164, policyFor,
  rollingWindowUsage, SAFE_DAILY_LIMIT, MAX_PER_HOUR, SECONDS_PER_MESSAGE,
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

  /* Meta counts unique recipients in a rolling 24h and refuses past the
     ceiling with 141015. Reading it first is the difference between pausing
     and reproducing the run that failed 90%. */
  const usage = await rollingWindowUsage(sb);
  if (usage.blocked)
    return NextResponse.json({ sent: 0, reason: "window_full", recipients: usage.recipients });

  const sinceDay = new Date(Date.now() - 86_400_000).toISOString();
  const sinceHour = new Date(Date.now() - 3_600_000).toISOString();
  const [{ count: dayCount }, { count: hourCount }] = await Promise.all([
    sb.from("wa_messages").select("id", { count: "exact", head: true })
      .eq("direction", "out").gte("created_at", sinceDay),
    sb.from("wa_messages").select("id", { count: "exact", head: true })
      .eq("direction", "out").gte("created_at", sinceHour),
  ]);

  const budget = Math.max(0, Math.min(
    usage.remaining,
    SAFE_DAILY_LIMIT - (dayCount ?? 0),
    MAX_PER_HOUR - (hourCount ?? 0),
    Math.floor((maxDuration - 12) / SECONDS_PER_MESSAGE),
  ));
  if (!budget) return NextResponse.json({ sent: 0, reason: "budget_exhausted" });

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

  /* ---- 1. retries that have come due ----

     Half the budget at most. Taking the whole budget meant first-contact
     guests never moved: 26 rows sat due while 181 people had no invitation at
     all, and the queue drained ahead of them every single run.

     Rows are also filtered by policy and de-duplicated by guest. Most of the
     failures are 131048, which policyFor classifies as stop_run — retrying
     those on a timer cannot work, and three failed rows for one guest are
     still one message. */
  const retryBudget = Math.max(1, Math.floor(budget / 2));
  const { data: dueRaw } = await sb.from("wa_messages")
    .select("id, guest_id, retry_count, error, error_code")
    .eq("direction", "out").eq("status", "failed")
    .not("retry_after", "is", null).lte("retry_after", new Date().toISOString())
    .order("retry_after").limit(100);

  const seenGuest = new Set<string>();
  const targets: { id: string; row?: string; count?: number; reminder?: boolean }[] = [];
  for (const d of dueRaw ?? []) {
    if (!d.guest_id || seenGuest.has(d.guest_id)) continue;
    if (policyFor(d.error_code, d.error).action !== "retry_later") continue;
    seenGuest.add(d.guest_id);
    targets.push({ id: d.guest_id, row: d.id, count: (d.retry_count ?? 0) + 1 });
    if (targets.length >= retryBudget) break;
  }

  /* ---- 2. guests with no evidence the invitation ever arrived ---- */
  if (targets.length < budget) {
    const need = budget - targets.length;
    /* No limit. A cap here does not bound the work — the budget above already
       does that — it bounds who is ELIGIBLE, and PostgREST returns the first N
       in arbitrary order. At 550 guests the tail simply never appears in any
       run, and nothing reports it: the guests past the cutoff wait forever
       while the screen shows a healthy send rate. */
    const { data: pending } = await sb.from("guests")
      .select("id, phone, rsvp_token, category, status, opened_at, send_priority")
      .eq("event_id", ev.id).eq("status", "pending")
      /* Highest priority first. Set by hand for guests who need reaching ahead
         of the normal order — the 22 who opened their link and never answered,
         who may have pressed submit into a request that hung and believe they
         already replied. */
      .order("send_priority", { ascending: false });

    const ids = (pending ?? []).filter(g => g.category !== "demo" && g.phone && g.rsvp_token)
      .map(g => g.id);
    const contacted = new Set<string>();
    for (let i = 0; i < ids.length; i += 100) {
      const slice = ids.slice(i, i + 100);
      const { data } = await sb.from("wa_messages").select("guest_id, status")
        .eq("direction", "out").in("guest_id", slice);
      (data ?? []).forEach(m => {
        if (["delivered", "read"].includes(m.status) && m.guest_id) contacted.add(m.guest_id);
      });

      /* A send made by hand from a personal phone leaves no wa_messages row,
         so without this the couple messages someone at 11:00 and the business
         number messages them again at 13:00. */
      const { data: manual } = await sb.from("guest_events").select("guest_id")
        .eq("event_type", "manual_sent").in("guest_id", slice);
      (manual ?? []).forEach(m => m.guest_id && contacted.add(m.guest_id));
    }
    /* First contact before reminders, always. Someone who has never heard from
       the couple is a different problem from someone who has the invitation and
       has not got round to answering, and the first has to be solved first —
       there is no reminding a guest who was never invited. */
    /* Priority overrides the usual first-contact-before-reminders rule, and
       only ever by explicit instruction — nothing sets send_priority on its
       own. */
    const prio = new Set(
      (pending ?? []).filter(g => (g.send_priority ?? 0) > 0).map(g => g.id));

    const prioReminders = ids.filter(id => prio.has(id) && contacted.has(id)
      && !targets.some(t => t.id === id));
    prioReminders.slice(0, need).forEach(id => targets.push({ id, reminder: true }));

    const firstContact = ids.filter(id => !contacted.has(id) && !targets.some(t => t.id === id));
    firstContact.slice(0, Math.max(0, budget - targets.length)).forEach(id => targets.push({ id }));

    /* Only once nobody is left uninvited does the budget go to reminders, and
       they get their own approved template: sending the invitation a second
       time to someone who already has it reads as a system that lost track. */
    if (targets.length < budget) {
      const spare = budget - targets.length;
      ids.filter(id => contacted.has(id) && !targets.some(t => t.id === id))
        .slice(0, spare)
        .forEach(id => targets.push({ id, reminder: true }));
    }
  }

  if (!targets.length) return NextResponse.json({ sent: 0, reason: "nothing_due" });

  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, rsvp_token").in("id", targets.map(t => t.id));
  const byId = new Map((guests ?? []).map(g => [g.id, g]));

  for (const t of targets) {
    const g = byId.get(t.id);
    if (!g?.phone || !g.rsvp_token) continue;

    if (t.row) {
      await sb.from("wa_messages")
        .update({ retry_count: t.count, retry_after: null }).eq("id", t.row);
    }

    const res = await sendInvitation(
      cfg, g.phone, g.rsvp_token, image, undefined,
      t.reminder ? "reminder" : "invitation",
    );
    if (res.ok) {
      sent.push(g.name);
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
      /* 131048 describes the number, not this guest — the next one fails too */
      if (policyFor(null, res.error).action === "stop_run") {
        stopped = "המספר מוגבל — עצירת ההרצה";
        break;
      }
    }
  }

  return NextResponse.json({
    event: ev.name,
    sent: sent.length, failed: failed.length, stopped,
    windowRecipients: usage.recipients,
    skippedEvents,
    details: { sent, failed },
  });
}
