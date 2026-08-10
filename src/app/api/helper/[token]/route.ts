import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* The helper's own endpoint.
 *
 * Scoped deliberately hard: it answers with the guests who still need
 * contacting for ONE event and nothing else. No other event, no counts of who
 * declined, no phone numbers beyond the ones needed to open a chat, no
 * destructive action of any kind. A family member helping for an afternoon
 * should not be handed the admin session, and forwarding personal links one
 * message at a time makes the couple a bottleneck and loses the record of who
 * was reached.
 *
 * "Still needs contacting" is the same definition every other screen uses:
 * no confirmed delivery, no recorded manual send, and no sign the guest opened
 * their link or answered.
 */

async function eventFor(token: string) {
  const sb = createServerClient();
  const { data } = await sb
    .from("events")
    .select("id, name, date, address, venue_name")
    .eq("helper_token", token)
    .maybeSingle();
  return { sb, event: data };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { sb, event } = await eventFor(token);
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: all } = await sb
    .from("guests")
    .select("id, name, phone, rsvp_token, status, opened_at, category, source_group")
    .eq("event_id", event.id);

  const guests = (all ?? []).filter(
    g => g.category !== "demo" && String(g.phone ?? "").trim() && g.rsvp_token,
  );
  const ids = guests.map(g => g.id);

  const reached = new Set<string>();
  guests.forEach(g => { if (g.status !== "pending" || g.opened_at) reached.add(g.id); });

  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);

    const { data: manual, error: mErr } = await sb.from("guest_events")
      .select("guest_id").eq("event_type", "manual_sent").in("guest_id", slice);
    /* Fail closed. Answering with an incomplete "already reached" set would
       show the helper people who were contacted an hour ago. */
    if (mErr) return NextResponse.json({ error: "lookup_failed" }, { status: 503 });
    (manual ?? []).forEach(r => r.guest_id && reached.add(r.guest_id));

    const { data: msgs, error: wErr } = await sb.from("wa_messages")
      .select("guest_id, status").eq("direction", "out").in("guest_id", slice);
    if (wErr) return NextResponse.json({ error: "lookup_failed" }, { status: 503 });
    (msgs ?? []).forEach(m => {
      if (m.guest_id && ["delivered", "read"].includes(m.status)) reached.add(m.guest_id);
    });
  }

  const todo = guests
    .filter(g => !reached.has(g.id))
    .map(g => ({
      id: g.id, name: g.name, phone: g.phone,
      rsvp_token: g.rsvp_token, group: g.source_group,
    }));

  return NextResponse.json({
    event: { name: event.name, date: event.date, address: event.address, venue_name: event.venue_name },
    todo,
    done: guests.length - todo.length,
    total: guests.length,
  });
}

/* POST { guest_id } — the helper confirming, after the fact, that the message
   actually went out. Never called automatically on opening WhatsApp: WhatsApp
   Web can log out and serve a QR screen instead of the chat, and marking on the
   attempt rather than the result is how a guest gets recorded as invited having
   received nothing. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { sb, event } = await eventFor(token);
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { guest_id } = await req.json().catch(() => ({}));
  if (!guest_id) return NextResponse.json({ error: "guest_id required" }, { status: 400 });

  /* Scoped to this event, so a token can only ever mark its own guests */
  const { data: guest } = await sb.from("guests")
    .select("id").eq("id", guest_id).eq("event_id", event.id).maybeSingle();
  if (!guest) return NextResponse.json({ error: "not found" }, { status: 404 });

  for (const type of ["invite_sent", "manual_sent"]) {
    const { data: existing } = await sb.from("guest_events")
      .select("id").eq("guest_id", guest_id).eq("event_type", type).limit(1);
    if (!existing?.length) {
      await sb.from("guest_events").insert({ guest_id, event_type: type });
    }
  }

  return NextResponse.json({ ok: true });
}
