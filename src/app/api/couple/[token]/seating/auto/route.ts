import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { planSeating, planIntoRoom, DEFAULT_CAPACITY, type PlanGuest, type RoomTable } from "@/lib/seating-plan";

export const dynamic = "force-dynamic";

/* "סדר לי" — a first draft of the room, from the list the couple already has.
 *
 * This used to proxy to /api/seating/ai-generate with an admin cookie. That
 * engine groups by guest_tags and guest_relationships and seats into tables
 * that already exist; there are zero rows in both of those tables and two
 * seating_tables across every wedding. So the button has always run, always
 * succeeded, and always produced nothing — which is why not one guest has ever
 * been seated, and why אבא של לאל built two tables by hand and gave up.
 *
 * It now plans from source_group, which arrives with the imported list and is
 * set on 97% of confirmed guests without anybody typing it, and it CREATES the
 * tables instead of demanding them.
 *
 * A draft, not a decision: everything it writes can be dragged afterwards, and
 * it refuses to overwrite seating somebody has already done by hand unless
 * asked twice.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events")
    .select("id").eq("couple_token", token).maybeSingle();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });
  const eventId = event.id as string;

  const body = await req.json().catch(() => ({}));
  const capacity = Math.max(2, Math.min(30, Number(body?.capacity) || DEFAULT_CAPACITY));
  const replace = body?.replace === true;

  /* Work already done by hand is not overwritten on a stray tap. The screen
     asks, and only then sends replace. */
  const { count: existing } = await sb.from("seating_assignments")
    .select("guest_id", { count: "exact", head: true }).eq("event_id", eventId);
  if ((existing ?? 0) > 0 && !replace) {
    return NextResponse.json(
      { error: "already_seated", seated: existing ?? 0 }, { status: 409 });
  }

  const { data: rows, error: gErr } = await sb.from("guests")
    .select("id, name, guest_count, source_group, meal_counts")
    .eq("event_id", eventId).eq("status", "confirmed").neq("category", "demo");
  if (gErr) return NextResponse.json({ error: gErr.message }, { status: 500 });

  const guests: PlanGuest[] = (rows ?? []).map(r => ({
    id: r.id as string,
    name: String(r.name ?? ""),
    seats: Number(r.guest_count ?? 1) || 1,
    group: (r.source_group as string | null) ?? null,
    kids: Number((r.meal_counts as Record<string, number> | null)?.kids ?? 0) || 0,
  }));
  if (!guests.length) {
    return NextResponse.json({ error: "אין עדיין אורחים שאישרו הגעה" }, { status: 400 });
  }

  /* If the hall is already described, seat into it. Otherwise work out what
   * the list needs and build that.
   *
   * ארץ האיילים sent שחר's plan on 02/09: 26 numbered tables across four
   * areas, all twelve seats except table 24 which is ten. Inventing 37 tables
   * for that room is not a seating plan, and the number we then send a guest —
   * "שולחן 14" — is only true because a sign in the hall says 14.
   *
   * A described room is never demolished. Its tables, their numbers, their
   * capacities and their areas came from the venue; only the assignments are
   * cleared and redone. */
  type HallTable = { id: string; name: string; capacity: number; zone?: string | null; sort_order: number };
  let hall: HallTable[] = [];
  {
    const { data, error } = await sb.from("seating_tables")
      .select("id, name, capacity, zone, sort_order")
      .eq("event_id", eventId).order("sort_order");
    if (error) {
      /* zone arrives with 20260902_table_zone.sql; without it the room is
         still a room, just one undivided area. */
      const { data: plain } = await sb.from("seating_tables")
        .select("id, name, capacity, sort_order")
        .eq("event_id", eventId).order("sort_order");
      hall = (plain ?? []) as HallTable[];
    } else {
      hall = (data ?? []) as HallTable[];
    }
  }

  const intoRoom = hall.length > 0;
  const room: RoomTable[] = hall.map(t => ({
    name: String(t.name), capacity: Number(t.capacity) || DEFAULT_CAPACITY, zone: t.zone ?? null,
  }));
  const plan = intoRoom ? planIntoRoom(guests, room) : planSeating(guests, capacity);

  await sb.from("seating_assignments").delete().eq("event_id", eventId);

  let idByIndex: Map<number, string>;
  if (intoRoom) {
    idByIndex = new Map<number, string>(hall.map((t, i) => [i, t.id]));
  } else {
    await sb.from("seating_tables").delete().eq("event_id", eventId);
    const { data: made, error: tErr } = await sb.from("seating_tables")
      .insert(plan.tables.map((t, i) => ({
        event_id: eventId, name: t.name, capacity: t.capacity,
        type: "round", sort_order: i,
      })))
      .select("id, sort_order");
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
    idByIndex = new Map<number, string>(
      (made ?? []).map(t => [Number(t.sort_order), t.id as string]));
  }

  const assignments = plan.tables.flatMap((t, i) => {
    const tableId = idByIndex.get(i);
    if (!tableId) return [];
    return t.guestIds.map(guest_id => ({ event_id: eventId, table_id: tableId, guest_id }));
  });

  if (assignments.length) {
    const { error: aErr } = await sb.from("seating_assignments").insert(assignments);
    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    tables: plan.totals.tables,
    people: plan.totals.people,
    records: plan.totals.records,
    groups: plan.totals.groups,
    kids: plan.totals.kids,
    capacity,
    /* Whether this filled the venue's own room or built one. */
    intoRoom,
    roomCapacity: plan.totals.capacity ?? null,
    /* Named, so the screen can say who could not be placed rather than leaving
       the couple to notice a missing family on the night. */
    oversized: plan.oversized,
    unseated: plan.unseated,
    short: plan.totals.short ?? 0,
  });
}
