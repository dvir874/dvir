import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* Server-side record of which guests have already been sent their invitation.
   Stored as guest_events rows (event_type: 'invite_sent') — no schema change.
   Previously "sent" lived only in the sender's localStorage, so it was lost
   across devices and never captured sends made outside the send station. */
const EVENT_TYPE = "invite_sent";

/* A separate marker for sends made by hand from a personal phone.
   invite_sent cannot carry this: every guest on this event already has one
   from the pre-tracking era, so it says nothing about whether a message went
   out today. Without a distinct marker, the automatic sender has no way to
   know a human already reached this guest, and sends a second invitation from
   the business number an hour later. */
const MANUAL_TYPE = "manual_sent";

/* GET /api/admin/guests-sent?event_id=X → { sent: [guest_id, ...] } */
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data: guests } = await sb.from("guests").select("id").eq("event_id", eventId);
  const ids = (guests ?? []).map(g => g.id);
  if (!ids.length) return NextResponse.json({ sent: [] });

  /* Chunked for the same PostgREST .in() limit as the send route. Returning
     an empty list on error used to look like "nobody has been sent yet",
     which is the most dangerous possible lie to tell a sender. */
  const sent = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data: events, error } = await sb
      .from("guest_events")
      .select("guest_id")
      .eq("event_type", EVENT_TYPE)
      .in("guest_id", ids.slice(i, i + 100));
    if (error) {
      return NextResponse.json(
        { error: "lookup_failed", hint: "לא ניתן לטעון מי כבר קיבל" },
        { status: 503 },
      );
    }
    (events ?? []).forEach(e => sent.add(e.guest_id));
  }
  return NextResponse.json({ sent: [...sent] });
}

/* POST /api/admin/guests-sent  { guest_ids: [...] }  → marks them as sent */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.guest_ids) ? body.guest_ids : [];
  if (!ids.length) return NextResponse.json({ error: "guest_ids required" }, { status: 400 });

  const sb = createServerClient();

  /* Every send from this station is a human sending from their own phone, so
     both markers go down: invite_sent for the historical record, manual_sent so
     the automatic sender knows a person already reached this guest today and
     leaves them alone. */
  const marked: Record<string, number> = {};
  for (const type of [EVENT_TYPE, MANUAL_TYPE]) {
    const { data: existing } = await sb
      .from("guest_events").select("guest_id")
      .eq("event_type", type).in("guest_id", ids);
    const already = new Set((existing ?? []).map(e => e.guest_id));
    const fresh = ids.filter(id => !already.has(id));
    if (fresh.length) {
      const { error } = await sb.from("guest_events")
        .insert(fresh.map(guest_id => ({ guest_id, event_type: type })));
      if (error) return NextResponse.json({ error: "insert failed" }, { status: 500 });
    }
    marked[type] = fresh.length;
  }

  return NextResponse.json({ marked });
}

/* DELETE /api/admin/guests-sent  { guest_ids: [...] } → un-marks (for resends) */
export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body?.guest_ids) ? body.guest_ids : [];
  if (!ids.length) return NextResponse.json({ error: "guest_ids required" }, { status: 400 });

  const sb = createServerClient();
  const { error } = await sb
    .from("guest_events")
    .delete()
    .eq("event_type", EVENT_TYPE)
    .in("guest_id", ids);

  if (error) return NextResponse.json({ error: "delete failed" }, { status: 500 });
  return NextResponse.json({ cleared: ids.length });
}
