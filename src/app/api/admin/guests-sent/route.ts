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

  const { data: guests } = await sb.from("guests")
    .select("id, status, opened_at").eq("event_id", eventId);
  const ids = (guests ?? []).map(g => g.id);
  if (!ids.length) return NextResponse.json({ sent: [] });

  /* Chunked for the same PostgREST .in() limit as the send route. Returning
     an empty list on error used to look like "nobody has been sent yet",
     which is the most dangerous possible lie to tell a sender. */
  /* What counts as "done" is evidence the guest was actually reached — not
     that a row named invite_sent exists.
     Every guest on this event carries invite_sent from the pre-tracking era,
     when messages went out as wa.me links with no delivery reporting. Treating
     that as reached made the station announce "כולם קיבלו! סיימת" over a group
     of 80 where most had no proof of receiving anything at all — the exact
     screen a sender trusts to tell them there is no one left.

     Three things do count:
       manual_sent            — a human sent it from their own phone, tracked
       delivered / read       — Meta confirmed it arrived
       answered or opened     — the guest demonstrably got the link */
  const reached = new Set<string>();

  (guests ?? []).forEach(g => {
    if (g.status !== "pending" || g.opened_at) reached.add(g.id);
  });

  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);

    const { data: manual, error: manualErr } = await sb
      .from("guest_events").select("guest_id")
      .eq("event_type", MANUAL_TYPE).in("guest_id", slice);
    if (manualErr) {
      return NextResponse.json(
        { error: "lookup_failed", hint: "לא ניתן לטעון מי כבר קיבל" },
        { status: 503 },
      );
    }
    (manual ?? []).forEach(e => reached.add(e.guest_id));

    const { data: msgs } = await sb
      .from("wa_messages").select("guest_id, status")
      .eq("direction", "out").in("guest_id", slice);
    (msgs ?? []).forEach(m => {
      if (m.guest_id && ["delivered", "read"].includes(m.status)) reached.add(m.guest_id);
    });
  }

  return NextResponse.json({ sent: [...reached] });
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
    /* Chunked like every other .in() here. Unchunked it truncates past ~390
       ids, and this one does not merely under-report: `fresh` is computed by
       subtracting `already` from ids, so a truncated read makes guests look
       unmarked and writes them a SECOND guest_events row. At 550 selected
       guests that is hundreds of duplicate "already contacted" records, and
       those records are what the sender consults to leave somebody alone. */
    const already = new Set<string>();
    for (let i = 0; i < ids.length; i += 100) {
      const { data: existing } = await sb
        .from("guest_events").select("guest_id")
        .eq("event_type", type).in("guest_id", ids.slice(i, i + 100));
      for (const e of existing ?? []) already.add(e.guest_id as string);
    }
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

  /* BOTH markers, not just invite_sent.

     manual_sent is the strongest "already reached" signal in the system —
     five separate send paths treat it as proof of receipt and skip the guest.
     Clearing only invite_sent therefore made "שלח שוב" a button that reports
     success and does nothing: the delete returned ok, the send route then
     skipped the guest on the manual_sent row it had just left behind, and the
     screen printed "נשלחו 0 · נכשלו 0" without ever mentioning the skip.

     64 guests carry manual_sent today, 47 of them with no delivery evidence of
     any kind — and until this line there was no code anywhere in the repo that
     could remove one. A marker that cannot be undone is not a record, it is a
     one-way door out of the guest list. */
  const TYPES = [EVENT_TYPE, MANUAL_TYPE];

  /* Chunked for the same PostgREST .in() ceiling the send route hit at ~390
     ids: past it the whole statement is rejected, and a delete that silently
     did nothing is exactly the failure being fixed here. */
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const { error } = await sb
      .from("guest_events")
      .delete()
      .in("event_type", TYPES)
      .in("guest_id", slice);
    if (error) return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }

  return NextResponse.json({ cleared: ids.length, types: TYPES });
}
