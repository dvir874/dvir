import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* Server-side record of which guests have already been sent their invitation.
   Stored as guest_events rows (event_type: 'invite_sent') — no schema change.
   Previously "sent" lived only in the sender's localStorage, so it was lost
   across devices and never captured sends made outside the send station. */
const EVENT_TYPE = "invite_sent";

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

  // Skip guests already marked, so re-sending never duplicates rows
  const { data: existing } = await sb
    .from("guest_events")
    .select("guest_id")
    .eq("event_type", EVENT_TYPE)
    .in("guest_id", ids);
  const already = new Set((existing ?? []).map(e => e.guest_id));
  const fresh = ids.filter(id => !already.has(id));

  if (fresh.length) {
    const { error } = await sb
      .from("guest_events")
      .insert(fresh.map(guest_id => ({ guest_id, event_type: EVENT_TYPE })));
    if (error) return NextResponse.json({ error: "insert failed" }, { status: 500 });
  }

  return NextResponse.json({ marked: fresh.length, alreadyMarked: already.size });
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
