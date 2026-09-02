import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* The hall, as the venue drew it.
 *
 * ארץ האיילים sent שחר's plan on 02/09: 26 numbered tables across מרכז,
 * מפלס א, מפלס ב, מפלס ג and the floor by the bar — every one twelve seats
 * except table 24, which is ten. That is not something a seating engine gets
 * to decide. It is also what makes the number we send a guest true: "שולחן 14"
 * is useful only because a sign in that room says 14.
 *
 * Once the room is here, /seating/auto fills it instead of inventing one, and
 * a list the hall cannot hold comes back as names rather than as extra tables
 * that do not exist.
 *
 * Replacing the room clears the seating with it. Assignments point at table
 * ids, and a plan drawn for a different room is not a plan.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: ev } = await sb.from("events")
    .select("id").eq("couple_token", token).maybeSingle();
  if (!ev) return NextResponse.json({ error: "not found" }, { status: 404 });
  const eventId = ev.id as string;

  const body = await req.json().catch(() => null);
  const raw = Array.isArray(body?.tables) ? body.tables : null;
  if (!raw?.length) {
    return NextResponse.json({ error: "צריך רשימת שולחנות" }, { status: 400 });
  }
  if (raw.length > 200) {
    return NextResponse.json({ error: "יותר מדי שולחנות" }, { status: 400 });
  }

  /* Validated rather than trusted. A capacity of zero seats nobody and a
     capacity of four hundred seats a wedding at one table; both would reach a
     couple as a plan they believe. */
  const tables: { name: string; capacity: number; zone: string | null }[] = [];
  for (const t of raw) {
    const name = String(t?.name ?? "").trim().slice(0, 40);
    const capacity = Math.floor(Number(t?.capacity));
    const zone = String(t?.zone ?? "").trim().slice(0, 40) || null;
    if (!name) return NextResponse.json({ error: "לשולחן חסר מספר או שם" }, { status: 400 });
    if (!Number.isFinite(capacity) || capacity < 1 || capacity > 40) {
      return NextResponse.json(
        { error: `תפוסה לא תקינה בשולחן ${name}` }, { status: 400 });
    }
    tables.push({ name, capacity, zone });
  }

  const dupes = tables.map(t => t.name).filter((n, i, a) => a.indexOf(n) !== i);
  if (dupes.length) {
    return NextResponse.json(
      { error: `מספר שולחן מופיע פעמיים: ${[...new Set(dupes)].join(", ")}` }, { status: 400 });
  }

  /* Assignments first — a table row that disappears while its assignments
     still point at it is a room nobody can render. */
  await sb.from("seating_assignments").delete().eq("event_id", eventId);
  await sb.from("seating_tables").delete().eq("event_id", eventId);

  const rows = tables.map((t, i) => ({
    event_id: eventId, name: t.name, capacity: t.capacity,
    type: "round", sort_order: i, zone: t.zone,
  }));

  let { error } = await sb.from("seating_tables").insert(rows);
  if (error) {
    /* zone arrives with 20260902_table_zone.sql. Without it the room is still
       the venue's room, just one undivided area. */
    const plain = rows.map(r => ({
      event_id: r.event_id, name: r.name, capacity: r.capacity,
      type: r.type, sort_order: r.sort_order,
    }));
    ({ error } = await sb.from("seating_tables").insert(plain));
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    tables: tables.length,
    capacity: tables.reduce((s, t) => s + t.capacity, 0),
    zones: [...new Set(tables.map(t => t.zone).filter(Boolean))],
  });
}
