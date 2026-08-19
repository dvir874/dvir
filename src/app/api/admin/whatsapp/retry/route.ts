import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { venueLine } from "@/lib/venue";
import { coupleName, looksLikeCouple } from "@/lib/couple-name";
import { eventTimes } from "@/lib/event-times";
import { weddingDateLine } from "@/lib/hebrew-date";
import {
  getWhatsAppConfig, sendInvitation, toE164,
  SECONDS_PER_MESSAGE, SAFE_DAILY_LIMIT, MAX_RETRIES, rollingWindowUsage,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* POST /api/admin/whatsapp/retry   { event_id?, force? }

   Resends invitations that Meta accepted and then silently dropped.

   Those failures never reach the send route's retry loop — Meta answers 200
   with a message id and only reports "Spam Rate limit hit" through the
   webhook minutes later. The webhook stamps retry_after; this route is what
   finally acts on it. Without it a blocked invitation is permanent, and the
   guest simply never hears from the couple.

   Deliberately conservative:
   - only messages whose retry_after has actually come due
   - never more than one invocation's worth of time
   - never past the daily budget, because the reason these failed in the
     first place is that the number sent too much in one day */

export async function POST(req: NextRequest) {
  const cfg = getWhatsAppConfig();
  if (!cfg) return NextResponse.json({ error: "whatsapp_not_configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const eventId: string | null = body?.event_id ?? null;

  const sb = createServerClient();
  const now = new Date();

  /* Meta counts unique recipients in a rolling 24 hours, and refuses past the
     ceiling with error 141015 — which is precisely how the batch that failed
     90% happened. Retrying into a full window reproduces it exactly. */
  const usage = await rollingWindowUsage(sb);
  if (usage.blocked) {
    return NextResponse.json({
      sent: 0, skipped: "rolling_window_full",
      hint: `${usage.recipients} נמענים בחלון 24 השעות — ניסיון חוזר עכשיו ייחסם`,
    });
  }
  const budget = Math.min(usage.remaining, SAFE_DAILY_LIMIT);

  /* One invocation's worth, with headroom for the round trips themselves */
  const timeCap = Math.floor((maxDuration - 10) / SECONDS_PER_MESSAGE);
  const limit = Math.max(1, Math.min(budget, timeCap));

  let q = sb.from("wa_messages")
    .select("id, guest_id, event_id, retry_count")
    .eq("direction", "out")
    .eq("status", "failed")
    .not("retry_after", "is", null)
    .lte("retry_after", now.toISOString())
    .lt("retry_count", MAX_RETRIES)
    .order("retry_after")
    .limit(limit);
  if (eventId) q = q.eq("event_id", eventId);

  const { data: due, error: dueErr } = await q;
  if (dueErr) return NextResponse.json({ error: dueErr.message }, { status: 500 });
  if (!due?.length) return NextResponse.json({ sent: 0, due: 0 });

  /* Guests and their events, so each retry carries the right card */
  const guestIds = [...new Set(due.map(d => d.guest_id).filter(Boolean))] as string[];
  /* In chunks — limit is min(budget, timeCap), so this list reaches 250 and
     250 UUIDs is a ~9,000 character query string. Same latent failure the
     cron's target lookup had: PostgREST returns what it could parse, the map
     comes back short, and every retry it missed is skipped with no send and no
     error. A retry that vanishes looks exactly like a retry that succeeded. */
  const guests: { id: string; name: string; phone: string; rsvp_token: string; event_id: string; category: string | null }[] = [];
  for (let i = 0; i < guestIds.length; i += 100) {
    const { data } = await sb.from("guests")
      .select("id, name, phone, rsvp_token, event_id, category").in("id", guestIds.slice(i, i + 100));
    guests.push(...((data ?? []) as typeof guests));
  }
  /* Demo guests exist to make screenshots; they must never consume the daily
     budget that real invitations need. */
  const guestById = new Map(
    (guests ?? []).filter(g => g.category !== "demo").map(g => [g.id, g]));

  const evIds = [...new Set((guests ?? []).map(g => g.event_id))];
  const { data: events } = await sb.from("events")
    .select("id, name, couple_names, date, address, venue_name, reception_time, chuppah_time, wa_header_image_url")
    .in("id", evIds);
  const eventById = new Map((events ?? []).map(e => [e.id, e]));

  const sent: string[] = [];
  const failed: { name: string; error: string }[] = [];

  for (const row of due) {
    const g = row.guest_id ? guestById.get(row.guest_id) : null;
    const ev = g ? eventById.get(g.event_id) : null;
    const image = ev?.wa_header_image_url;

    /* Clear the schedule first: a crash mid-loop must not leave a row that
       retries forever. */
    const nextCount = (row.retry_count ?? 0) + 1;
    await sb.from("wa_messages")
      .update({ retry_count: nextCount, retry_after: null }).eq("id", row.id);

    if (!g?.phone || !g.rsvp_token || !image) {
      failed.push({ name: g?.name ?? "?", error: "חסר טלפון, קישור או תמונת הזמנה" });
      continue;
    }

    const isOwnWedding = g.event_id === "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";
    const details = isOwnWedding ? undefined : {
      /* couple_names, not name — events.name is the dashboard title and this
         variable sits inside "בעזרת ה׳ *{{1}}* מתחתנים". See the same fix in
         the send route and src/lib/couple-name.ts. */
      couple: coupleName(ev) ?? "",
      /* Both calendars. Her card says כ״ו אלול תשפ״ו and a guest
         reading "8 בספטמבר" alone is being shown a translation of their
         own date back to them. See src/lib/hebrew-date.ts. */
      date: weddingDateLine(ev?.date ?? ""),
      venue: venueLine(ev) ?? "",
      /* From the event, not from a constant — see src/lib/event-times.ts. */
      times: eventTimes(ev) ?? "",
    };
    if (details && (!details.couple || !details.date || !details.venue || !details.times)) {
      failed.push({ name: g.name, error: "חסרים פרטי אירוע (שם, תאריך, מקום או שעות)" });
      continue;
    }
    /* A retry is still a send, so a title that got past the stripper is refused
       here too rather than resent — this row already failed once, and resending
       it with the wrong name in it makes the guest's only message the wrong
       one. Fill couple_names for the event. */
    if (details && !looksLikeCouple(details.couple)) {
      failed.push({ name: g.name, error: `"${details.couple}" לא נראה כמו שמות בני זוג — מלאו couple_names` });
      continue;
    }

    const res = await sendInvitation(cfg, g.phone, g.rsvp_token, image, details);
    if (res.ok) {
      sent.push(g.name);
      /* A new row, so the webhook can report on this attempt independently
         and the original failure stays visible in the history. */
      await sb.from("wa_messages").insert({
        event_id: g.event_id, guest_id: g.id,
        wa_phone: toE164(g.phone) ?? "",
        direction: "out", body: "הזמנה לחתונה (ניסיון חוזר)",
        wamid: res.messageId, status: "accepted",
        retry_count: nextCount, retried_from: row.id,
      });
    } else {
      failed.push({ name: g.name, error: res.error ?? "unknown" });
    }
  }

  return NextResponse.json({
    sent: sent.length, failed: failed.length,
    remaining: Math.max(0, due.length - limit),
    details: { sent, failed },
  });
}

/* GET — how many messages are waiting, and when the next one comes due */
export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const eventId = req.nextUrl.searchParams.get("event_id");

  let q = sb.from("wa_messages")
    .select("retry_after, retry_count")
    .eq("direction", "out").eq("status", "failed")
    .not("retry_after", "is", null).lt("retry_count", MAX_RETRIES);
  if (eventId) q = q.eq("event_id", eventId);

  const { data } = await q;
  const rows = data ?? [];
  const now = Date.now();
  return NextResponse.json({
    queued: rows.length,
    dueNow: rows.filter(r => new Date(r.retry_after as string).getTime() <= now).length,
    nextAt: rows.map(r => r.retry_after as string).sort()[0] ?? null,
  });
}
