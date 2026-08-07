import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { getWhatsAppConfig, sendInvitation } from "@/lib/whatsapp";

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
/* Meta accepts well above this, but a modest ceiling keeps one run inside the
   function timeout and makes partial failures easy to reason about. */
const CONCURRENCY = 5;

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

  const { data: allGuests } = await sb
    .from("guests")
    .select("id, name, phone, rsvp_token, category")
    .eq("event_id", eventId);

  let guests = (allGuests ?? []).filter(g => g.category !== "demo");
  if (requested) {
    const want = new Set(requested);
    guests = guests.filter(g => want.has(g.id));
  }

  /* Never message anyone twice — the server record is the source of truth */
  const ids = guests.map(g => g.id);
  const already = new Set<string>();
  if (ids.length) {
    const { data: sentRows } = await sb
      .from("guest_events")
      .select("guest_id")
      .eq("event_type", EVENT_TYPE)
      .in("guest_id", ids);
    (sentRows ?? []).forEach(r => already.add(r.guest_id));
  }

  const skipped: { name: string; reason: string }[] = [];
  const queue = guests.filter(g => {
    if (already.has(g.id)) { skipped.push({ name: g.name, reason: "כבר נשלח" }); return false; }
    if (!String(g.phone ?? "").trim()) { skipped.push({ name: g.name, reason: "אין טלפון" }); return false; }
    if (!g.rsvp_token) { skipped.push({ name: g.name, reason: "אין קישור" }); return false; }
    return true;
  });

  const sent: { id: string; name: string; messageId?: string }[] = [];
  const failed: { name: string; error: string }[] = [];

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async g => ({
        guest: g,
        res: await sendInvitation(cfg, g.phone as string, g.rsvp_token as string),
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
  }

  return NextResponse.json({
    sent: sent.length,
    failed: failed.length,
    skipped: skipped.length,
    details: { sent: sent.map(s => s.name), failed, skipped },
  });
}
