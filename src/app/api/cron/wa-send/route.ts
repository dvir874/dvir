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

const OWN_WEDDING = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";

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

  const { data: ev } = await sb.from("events")
    .select("wa_header_image_url").eq("id", OWN_WEDDING).maybeSingle();
  const image = ev?.wa_header_image_url;
  if (!image) return NextResponse.json({ error: "missing_invitation_image" }, { status: 400 });

  const sent: string[] = [];
  const failed: { name: string; error: string }[] = [];
  let stopped: string | null = null;

  /* ---- 1. retries that have come due ---- */
  const { data: due } = await sb.from("wa_messages")
    .select("id, guest_id, retry_count")
    .eq("direction", "out").eq("status", "failed")
    .not("retry_after", "is", null).lte("retry_after", new Date().toISOString())
    .order("retry_after").limit(budget);

  const targets: { id: string; row?: string; count?: number }[] =
    (due ?? []).filter(d => d.guest_id)
      .map(d => ({ id: d.guest_id as string, row: d.id, count: (d.retry_count ?? 0) + 1 }));

  /* ---- 2. guests with no evidence the invitation ever arrived ---- */
  if (targets.length < budget) {
    const need = budget - targets.length;
    const { data: pending } = await sb.from("guests")
      .select("id, phone, rsvp_token, category, status, opened_at")
      .eq("event_id", OWN_WEDDING).eq("status", "pending").limit(400);

    const ids = (pending ?? []).filter(g => g.category !== "demo" && g.phone && g.rsvp_token)
      .map(g => g.id);
    const contacted = new Set<string>();
    for (let i = 0; i < ids.length; i += 100) {
      const { data } = await sb.from("wa_messages").select("guest_id, status")
        .eq("direction", "out").in("guest_id", ids.slice(i, i + 100));
      (data ?? []).forEach(m => {
        if (["delivered", "read"].includes(m.status) && m.guest_id) contacted.add(m.guest_id);
      });
    }
    /* Anyone whose invitation is confirmed delivered is a reminder, and the
       reminder template is still PENDING — so they wait rather than receive a
       second identical invitation. */
    const firstContact = ids.filter(id => !contacted.has(id) && !targets.some(t => t.id === id));
    firstContact.slice(0, need).forEach(id => targets.push({ id }));
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

    const res = await sendInvitation(cfg, g.phone, g.rsvp_token, image);
    if (res.ok) {
      sent.push(g.name);
      await sb.from("guest_events").insert({ guest_id: g.id, event_type: "invite_sent" });
      if (res.messageId) {
        await sb.from("wa_messages").insert({
          event_id: OWN_WEDDING, guest_id: g.id,
          wa_phone: toE164(g.phone) ?? "",
          direction: "out",
          body: t.row ? "הזמנה לחתונה (ניסיון חוזר)" : "הזמנה לחתונה (תבנית)",
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
    sent: sent.length, failed: failed.length, stopped,
    windowRecipients: usage.recipients,
    details: { sent, failed },
  });
}
