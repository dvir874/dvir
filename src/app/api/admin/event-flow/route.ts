import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { reportCodeFor } from "@/lib/rsvp-report";

export const dynamic = "force-dynamic";

/* State of every step in running one event, computed from the data rather
   than tracked by hand — a checklist that ticks itself is the only kind that
   stays honest. The UI turns each step into an explanation plus one button. */

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data: ev } = await sb
    .from("events")
    .select("id, name, date, address, couple_token, wa_header_image_url")
    .eq("id", eventId).maybeSingle();
  if (!ev) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: guestRows } = await sb
    .from("guests")
    .select("id, phone, status, opened_at, category, rsvp_token")
    .eq("event_id", eventId);
  const guests = (guestRows ?? []).filter(g => g.category !== "demo");

  /* Chunked: PostgREST rejects .in() lists past roughly 390 ids */
  const ids = guests.map(g => g.id);
  const sent = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await sb.from("guest_events").select("guest_id")
      .eq("event_type", "invite_sent").in("guest_id", ids.slice(i, i + 100));
    (data ?? []).forEach(r => sent.add(r.guest_id));
  }

  const { data: waRows } = await sb
    .from("wa_messages").select("guest_id, status")
    .eq("event_id", eventId).eq("direction", "out");
  const wa = waRows ?? [];

  const withPhone = guests.filter(g => String(g.phone ?? "").trim()).length;
  const answered = guests.filter(g => g.status !== "pending").length;
  const confirmed = guests.filter(g => g.status === "confirmed");
  const failed = new Set(wa.filter(m => m.status === "failed").map(m => m.guest_id));
  const daysToEvent = ev.date
    ? Math.ceil((new Date(ev.date).getTime() - Date.now()) / 86_400_000)
    : null;

  const detailsReady = !!(ev.name && ev.date && ev.address);

  return NextResponse.json({
    event: {
      id: ev.id, name: ev.name, date: ev.date, address: ev.address,
      hasImage: !!ev.wa_header_image_url,
      imageUrl: ev.wa_header_image_url,
      coupleToken: ev.couple_token,
      reportCode: reportCodeFor(ev.id),
      daysToEvent,
    },
    counts: {
      guests: guests.length,
      withPhone,
      missingPhone: guests.length - withPhone,
      sent: sent.size,
      unsent: guests.filter(g => !sent.has(g.id)).length,
      failed: failed.size,
      opened: guests.filter(g => g.opened_at).length,
      answered,
      confirmed: confirmed.length,
      attendees: confirmed.reduce((s, g) => s + 1, 0),
      pending: guests.length - answered,
      responseRate: guests.length ? Math.round((answered / guests.length) * 100) : 0,
    },
    ready: {
      details: detailsReady,
      image: !!ev.wa_header_image_url,
      guests: guests.length > 0,
      phones: guests.length > 0 && withPhone === guests.length,
      previewable: guests.length > 0 && !!guests.find(g => g.rsvp_token),
      /* Sending is only safe once the couple's own wording and card exist */
      canSend: detailsReady && !!ev.wa_header_image_url && withPhone > 0,
    },
    sampleToken: guests.find(g => g.rsvp_token)?.rsvp_token ?? null,
  });
}
