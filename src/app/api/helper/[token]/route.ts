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
    /* couple_names and the two times are here because the helper's page writes
       its own message text and had nothing to write it from: it fell back to a
       hardcoded "קבלת פנים 19:00 | חופה וקידושין 20:00" and to events.name,
       which is a dashboard title — "חתונת אורי ושחר מתחתנים". אורי ✧ שחר
       receive at 17:30 and stand under the chuppah at 18:15, and a family
       member sending from her own phone is the one place where nothing
       downstream can catch either mistake. */
    .select("id, name, couple_names, date, address, venue_name, reception_time, chuppah_time")
    .eq("helper_token", token)
    .maybeSingle();
  return { sb, event: data };
}

/* Guests handed to a named helper, and still hers.

   Two helpers sharing one link both see the same "next in line" and both send
   to them, and the automatic sender cannot see a message a cousin is *about*
   to send. Assigning up front removes both races by construction rather than
   by timing.

   Expiry is what makes handing work out safe. An assignment older than 48
   hours is ignored everywhere, so a helper who starts and does not finish
   cannot strand a guest — they return to the automatic queue on their own.

   Fails soft, on purpose: the columns are new, and a route that 400s because
   one column has not been migrated yet is exactly how the automatic sender
   silently reached nobody for two days. No column, no assignments, everything
   behaves as it did before. */
const ASSIGNMENT_TTL_MS = 48 * 60 * 60 * 1000;

async function liveAssignments(
  sb: ReturnType<typeof createServerClient>, eventId: string,
): Promise<Map<string, string>> {
  const since = new Date(Date.now() - ASSIGNMENT_TTL_MS).toISOString();
  const { data, error } = await sb
    .from("guests").select("id, assigned_helper")
    .eq("event_id", eventId)
    .not("assigned_helper", "is", null)
    .gte("assigned_at", since);
  if (error || !data) return new Map();
  return new Map(data.map(g => [g.id as string, g.assigned_helper as string]));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { sb, event } = await eventFor(token);
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  /* ?h=noya — the helper's own slice. Without it the link keeps behaving
     exactly as it did yesterday, minus anyone currently assigned to someone
     else, so the link already in Noya's hands does not break. */
  const who = (req.nextUrl.searchParams.get("h") ?? "").trim().toLowerCase();
  const assigned = await liveAssignments(sb, event.id);

  const { data: all } = await sb
    .from("guests")
    .select("id, name, phone, rsvp_token, status, opened_at, category, source_group")
    .eq("event_id", event.id);

  const guests = (all ?? []).filter(
    g => g.category !== "demo" && String(g.phone ?? "").trim() && g.rsvp_token,
  ).filter(g => {
    const owner = assigned.get(g.id);
    return who ? owner === who : !owner;
  });
  const ids = guests.map(g => g.id);

  /* ?mode=reminder — the second round.
   *
   * "Still needs contacting" below means the message never got there. That is
   * the right question for a first round and the exact opposite of the one a
   * reminder asks: the 143 guests who have not answered all had their
   * invitation delivered, so every one of them counts as reached and the queue
   * comes back empty. The page could already say the reminder wording; there
   * was no way to ask the server who it was for.
   *
   * A reminder is for a guest the invitation reached and who has not answered.
   * Opening the link without answering still counts — someone who looked and
   * did not finish is more worth a nudge, not less. */
  const isReminder = req.nextUrl.searchParams.get("mode") === "reminder";

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
      if (m.guest_id && ["delivered", "read"].includes(m.status)) {
        reached.add(m.guest_id);
      }
    });
  }

  const todo = guests
    .filter(g => isReminder
      /* Reached by ANY route, and still no answer.
       *
       * This asked for a delivery receipt, which quietly excluded everyone a
       * helper had already messaged by hand: WhatsApp Web leaves no receipt in
       * our system, so a guest Oriya sent to yesterday counts as manually sent
       * — which keeps them out of the first round — and has no delivered row,
       * which kept them out of this one. Ten of her eighteen were in neither
       * list, and the screen said "סיימת" over them.
       *
       * A reminder is for anyone we believe we contacted who has not answered,
       * however the message got there. `reached` already means exactly that,
       * and `status === pending` is what keeps it off anyone who has answered. */
      ? g.status === "pending" && reached.has(g.id)
      : !reached.has(g.id))
    .map(g => ({
      id: g.id, name: g.name, phone: g.phone,
      rsvp_token: g.rsvp_token, group: g.source_group,
    }));

  return NextResponse.json({
    event: {
      name: event.name, couple_names: event.couple_names ?? null,
      date: event.date, address: event.address, venue_name: event.venue_name,
      reception_time: event.reception_time ?? null, chuppah_time: event.chuppah_time ?? null,
    },
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
