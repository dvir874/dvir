import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getWhatsAppConfig, sendInvitation, toE164 } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* POST /api/admin/whatsapp/send  { event_id, guest_ids?: string[] }

   Sends the approved RSVP invitation template to the given guests (or to every
   eligible guest of the event when guest_ids is omitted). Each guest gets their
   own rsvp_token in the template's URL button, so one approved template serves
   all 300 invitations.

   Safety properties:
   - Guests already marked invite_sent are skipped, so a re-run never
     double-messages anyone.
   - Guests with no phone or no token are skipped and reported, never guessed.
   - Demo guests are excluded.
   - Marking as sent happens only after Meta accepts the message.
   - If WhatsApp env is absent the route reports disabled and changes nothing,
     leaving the manual wa.me flow untouched. */

const EVENT_TYPE = "invite_sent";
/* Sends are paced inside src/lib/whatsapp.ts (≥900ms apart) and retried on
   throttling, so parallelism here only controls how many are in flight while
   waiting on the network. Two is enough and keeps the queue orderly. */
const CONCURRENCY = 2;

export async function POST(req: NextRequest) {
  const cfg = getWhatsAppConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "whatsapp_not_configured", hint: "set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const eventId: string = body?.event_id ?? "";
  const requested: string[] | null = Array.isArray(body?.guest_ids) ? body.guest_ids : null;
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  /* Each event carries its own invitation card and its own wording. */
  const { data: eventRow } = await sb
    .from("events")
    .select("name, date, address, wa_header_image_url")
    .eq("id", eventId).maybeSingle();
  const headerImage: string = eventRow?.wa_header_image_url ?? cfg.headerImageUrl;
  if (!headerImage) {
    return NextResponse.json(
      { error: "missing_invitation_image",
        hint: "לא הוגדרה תמונת הזמנה לאירוע — הגדירו אותה לפני שליחה" },
      { status: 400 },
    );
  }

  const { data: allGuests } = await sb
    .from("guests")
    .select("id, name, phone, rsvp_token, category")
    .eq("event_id", eventId);

  let guests = (allGuests ?? []).filter(g => g.category !== "demo");
  if (requested) {
    const want = new Set(requested);
    guests = guests.filter(g => want.has(g.id));
  }

  /* Never message anyone twice — the server record is the source of truth.
     Chunked because PostgREST rejects .in() lists past roughly 390 ids (the
     16KB header limit): at 550 guests the unchunked query failed outright,
     `already` stayed empty, and every guest would have been invited twice.
     A failure here must abort, never silently proceed. */
  const ids = guests.map(g => g.id);
  const already = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data: sentRows, error: sentErr } = await sb
      .from("guest_events")
      .select("guest_id")
      .eq("event_type", EVENT_TYPE)
      .in("guest_id", ids.slice(i, i + 100));
    if (sentErr) {
      return NextResponse.json(
        { error: "dedupe_check_failed",
          hint: "לא ניתן לוודא מי כבר קיבל — השליחה נעצרה כדי למנוע כפילויות" },
        { status: 503 },
      );
    }
    (sentRows ?? []).forEach(r => already.add(r.guest_id));
  }

  const skipped: { name: string; reason: string }[] = [];
  const queue = guests.filter(g => {
    if (already.has(g.id)) { skipped.push({ name: g.name, reason: "כבר נשלח" }); return false; }
    if (!String(g.phone ?? "").trim()) { skipped.push({ name: g.name, reason: "אין טלפון" }); return false; }
    if (!g.rsvp_token) { skipped.push({ name: g.name, reason: "אין קישור" }); return false; }
    return true;
  });

  /* Dvir's own wedding keeps its bespoke approved template, whose names and
     date are part of the approved text. Every other event uses the generic
     template and supplies its details as variables. */
  const isOwnWedding = eventId === "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";
  const details = isOwnWedding ? undefined : {
    couple: eventRow?.name ?? "",
    date: eventRow?.date
      ? new Date(eventRow.date).toLocaleDateString("he-IL",
          { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "",
    venue: eventRow?.address ?? "",
    times: "קבלת פנים 19:00 | חופה וקידושין 20:00",
  };
  if (details && (!details.couple || !details.date || !details.venue)) {
    return NextResponse.json(
      { error: "missing_event_details",
        hint: "חסרים שם הזוג, תאריך או מקום האירוע — השליחה נעצרה" },
      { status: 400 },
    );
  }

  const sent: { id: string; name: string; messageId?: string }[] = [];
  const failed: { name: string; error: string }[] = [];

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async g => ({
        guest: g,
        res: await sendInvitation(cfg, g.phone as string, g.rsvp_token as string, headerImage, details),
      })),
    );
    for (const { guest, res } of results) {
      if (res.ok) sent.push({ id: guest.id, name: guest.name, messageId: res.messageId });
      else failed.push({ name: guest.name, error: res.error ?? "unknown" });
    }
  }

  /* Mark only what Meta actually accepted */
  if (sent.length) {
    await sb.from("guest_events").insert(
      sent.map(s => ({ guest_id: s.id, event_type: EVENT_TYPE })),
    );

    /* Log the outbound message so the delivery webhook has a row to attach
       its sent → delivered → read status to. Failure here must not fail the
       send: the guest already has the message. */
    const byId = new Map(queue.map(g => [g.id, g]));
    await sb.from("wa_messages").insert(
      sent.filter(s => s.messageId).map(s => ({
        event_id: eventId,
        guest_id: s.id,
        wa_phone: toE164(byId.get(s.id)?.phone ?? "") ?? "",
        direction: "out",
        body: "הזמנה לחתונה (תבנית)",
        wamid: s.messageId,
        status: "accepted",
      })),
    ).then(r => r.error && console.warn("wa_messages log skipped:", r.error.message));
  }

  return NextResponse.json({
    sent: sent.length,
    failed: failed.length,
    skipped: skipped.length,
    details: { sent: sent.map(s => s.name), failed, skipped },
  });
}
