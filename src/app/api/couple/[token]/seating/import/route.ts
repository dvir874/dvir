import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { parseSeatingFromXlsx } from "@/lib/xlsx-utils";
import { tableCapacity, type SeatingEntry } from "@/lib/seating-grid";
import { matchGuest } from "@/lib/guest-match";

export const dynamic = "force-dynamic";

/* Loading the seating plan the family already made.
 *
 * The couple's seating screen has existed since migration 004 and there are
 * two seating_tables rows across every wedding in production. The plan is not
 * missing — it is in Excel, where every family makes it, and the app asked
 * them to make it a second time by hand. טל, 19/09: "משפחת החתן הצליחה לשבץ
 * בשולחנות, אני לא הצלחתי - האפליקציה ממש קשה". Her file is 371 people.
 *
 * What this takes from the file and what it does not:
 *
 *   · WHERE somebody sits — from the file, which is the only place it exists.
 *   · HOW MANY they are — from the list, never the file. guest_count is what
 *     the guest answered on the RSVP page, it is what the caterer is ordering
 *     against, and a spreadsheet the family last updated three weeks ago must
 *     not quietly overwrite it. Disagreements come back in the report.
 *
 * Nothing is deleted. /seating/room clears the room because a plan drawn for
 * another room is not a plan; an import is additive — tables already there are
 * matched by name, and a guest this file does not mention keeps their seat.
 *
 * dry_run returns the whole report without writing, because the first thing
 * anyone should do with 371 rows is look at them.
 */

interface GuestRow {
  id: string;
  name: string;
  guest_count: number | null;
  status: string | null;
  /* The family block the guest list was imported under — "מוזמנים פורת". Set
     on 97% of confirmed guests; see seating-plan.ts. */
  source_group: string | null;
}

/* Two guests named the same, and a file that says which family this one is.
 *
 * guest-match.ts refuses a tie on principle, and it is right to: picking one
 * of two identical names is a coin toss written as a decision. But a tie
 * broken by a field that had no part in the tie is not a coin toss — the
 * spreadsheet says "פורת" and exactly one of the two candidates was imported
 * under "מוזמנים פורת". Only ever applied when exactly one survives, and every
 * one of them is listed separately in the report, because this is the one
 * place here that decides something guest-match declined to. */
function sameFamily(group: string | null, g: GuestRow): boolean {
  const a = String(group ?? "").replace(/\s+/g, " ").trim();
  const b = String(g.source_group ?? "").replace(/\s+/g, " ").trim();
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

interface TableRow { id: string; name: string }

/** Everything a human needs to fix one row, and nothing else. */
interface Unmatched {
  name: string;
  table: string | null;
  sheet: string;
  row: number;
  reason: string;
  /** Who it might have been, when the file is close to somebody on the list. */
  candidates: string[];
}

const clean = (n: unknown) =>
  String(n ?? "").replace(/[‎‏‪-‮⁦-⁩]/g, "").trim();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: ev } = await sb.from("events")
    .select("id").eq("couple_token", token).maybeSingle();
  if (!ev) return NextResponse.json({ error: "not found" }, { status: 404 });
  const eventId = ev.id as string;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  const dryRun = form?.get("dry_run") === "1";
  if (!file) return NextResponse.json({ error: "צריך קובץ" }, { status: 400 });
  if (file.size > 5_000_000)
    return NextResponse.json({ error: "הקובץ גדול מדי (מקסימום 5MB)" }, { status: 400 });

  let parsed;
  try {
    parsed = parseSeatingFromXlsx(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      { error: "לא הצלחנו לקרוא את הקובץ. ודאו שהוא אקסל תקין." }, { status: 422 });
  }

  const placed = parsed.entries.filter((e) => e.table !== null);
  if (!placed.length) {
    return NextResponse.json({
      error: "לא נמצא בקובץ אף שיבוץ לשולחן",
      warnings: parsed.warnings, skipped: parsed.skipped,
    }, { status: 422 });
  }
  if (placed.length > 1500)
    return NextResponse.json({ error: "יותר מדי שורות בייבוא אחד" }, { status: 422 });

  /* ── the file against the list ──────────────────────────────────────── */

  const { data: guestRows, error: guestsErr } = await sb.from("guests")
    .select("id, name, guest_count, status, source_group").eq("event_id", eventId);
  if (guestsErr)
    return NextResponse.json({ error: guestsErr.message }, { status: 500 });
  const guests = (guestRows ?? []) as GuestRow[];
  if (!guests.length)
    return NextResponse.json(
      { error: "אין עדיין רשימת מוזמנים לאירוע הזה — צריך לייבא אותה קודם" },
      { status: 422 });

  /* One guest per row of the file. A false positive here seats a real person
     somewhere they are not, so only the two confidences guest-match.ts is
     willing to stand behind are applied; the rest are reported by name and
     row, which is the form somebody can actually act on. */
  const seat = new Map<string, { guest: GuestRow; entry: SeatingEntry }>();
  const unmatched: Unmatched[] = [];
  const duplicates: { guest: string; rows: string[] }[] = [];
  const REASON: Record<string, string> = {
    partial: "דומה לשם ברשימה אבל לא מספיק — צריך אישור",
    ambiguous: "מתאים ליותר ממוזמן אחד",
    none: "לא נמצא ברשימת המוזמנים",
  };

  const byFamily: { name: string; group: string | null; table: string | null }[] = [];

  for (const entry of placed) {
    const m = matchGuest(entry.name, guests, (g) => g.name);
    const where = `${entry.sheet}:${entry.row}`;

    let hit = m.confidence === "exact" || m.confidence === "spelling" ? m.match : undefined;
    if (!hit && m.confidence === "ambiguous") {
      const family = m.candidates.filter((c) => sameFamily(entry.group, c.row));
      if (family.length === 1) {
        hit = family[0].row;
        byFamily.push({ name: hit.name, group: entry.group, table: entry.table });
      }
    }

    if (hit) {
      const already = seat.get(hit.id);
      if (already) {
        /* The same household written twice — once per family's sheet, or once
           per table. Neither row is applied: the file does not say which. */
        duplicates.push({
          guest: hit.name,
          rows: [`${already.entry.sheet}:${already.entry.row} → שולחן ${already.entry.table}`,
                 `${where} → שולחן ${entry.table}`],
        });
        seat.delete(hit.id);
        continue;
      }
      seat.set(hit.id, { guest: hit, entry });
      continue;
    }

    unmatched.push({
      name: entry.name, table: entry.table, sheet: entry.sheet, row: entry.row,
      reason: REASON[m.confidence] ?? m.confidence,
      candidates: m.candidates.slice(0, 3).map((c) => c.name),
    });
  }

  /* What the file believes about headcounts, where it disagrees with what the
     guest themselves answered. Reported, never written — see the header. */
  const countMismatch = [...seat.values()]
    .filter(({ guest, entry }) =>
      entry.count !== null && guest.guest_count !== null && entry.count !== guest.guest_count)
    .map(({ guest, entry }) => ({
      name: guest.name, inFile: entry.count, inList: guest.guest_count,
    }));

  /* Somebody the file seats who told us they are not coming. Not refused —
     this is the family's plan and they may know something we do not — but a
     chair and a meal are ordered off this, so it is never silent. */
  const seatedButDeclined = [...seat.values()]
    .filter(({ guest }) => guest.status === "declined")
    .map(({ guest, entry }) => ({ name: guest.name, table: entry.table }));

  /* ── the room ───────────────────────────────────────────────────────── */

  const { data: tableRows } = await sb.from("seating_tables")
    .select("id, name").eq("event_id", eventId);
  const existing = new Map<string, string>();
  for (const t of (tableRows ?? []) as TableRow[]) existing.set(clean(t.name), t.id);

  /* People, not records. A capacity floor counted in households would build
     table 16 with four chairs for the eleven the sheet seats there. */
  const seatedAt = new Map<string, number>();
  for (const { guest, entry } of seat.values()) {
    const t = entry.table as string;
    seatedAt.set(t, (seatedAt.get(t) ?? 0) + Math.max(1, guest.guest_count ?? 1));
  }

  const toCreate = parsed.tables
    .filter((t) => !existing.has(t.table))
    .map((t, i) => ({
      name: t.table,
      capacity: tableCapacity(t, seatedAt.get(t.table) ?? 0),
      /* The venue's own number, so the couple's grid comes out in the order
         the room is in. Falls back to position for a table named rather than
         numbered — sort_order is not what a guest is ever told either way. */
      sort_order: /^\d{1,3}$/.test(t.table) ? parseInt(t.table, 10) : existing.size + i,
      zone: null as string | null,
    }));

  const report = {
    dryRun,
    file: {
      name: file.name,
      sheets: [...new Set(parsed.entries.map((e) => e.sheet))],
      rows: parsed.entries.length,
      placed: placed.length,
      tables: parsed.tables.length,
    },
    seats: {
      toAssign: seat.size,
      unmatched: unmatched.length,
      duplicates: duplicates.length,
      byFamily: byFamily.length,
    },
    tables: {
      alreadyInApp: existing.size,
      toCreate: toCreate.map((t) => ({ name: t.name, capacity: t.capacity })),
    },
    unmatched: unmatched.slice(0, 200),
    /* Worth a second pair of eyes even though they were applied: each one was
       a tie that the file's own קבוצה broke. */
    matchedByFamily: byFamily,
    duplicates,
    countMismatch,
    seatedButDeclined,
    /* Guests who answered yes and whom this file seats nowhere. They keep
       whatever seat they already had; this is here because a name missing
       from the family's spreadsheet is how somebody arrives to no chair. */
    notInFile: (() => {
      const names = guests
        .filter((g) => !seat.has(g.id) && g.status === "confirmed")
        .map((g) => g.name);
      return { count: names.length, sample: names.slice(0, 30) };
    })(),
    warnings: parsed.warnings,
    skipped: parsed.skipped,
  };

  if (dryRun) return NextResponse.json(report);

  /* ── the write ──────────────────────────────────────────────────────── */

  if (toCreate.length) {
    const base = toCreate.map((t) => ({
      event_id: eventId, name: t.name, capacity: t.capacity,
      type: "round", sort_order: t.sort_order,
    }));
    /* zone arrives with 20260902_table_zone.sql, type and sort_order with
       migration 004. A column that is not there fails the whole insert with
       42703, and the room is still the family's room without them. */
    let { data: made, error } = await sb.from("seating_tables")
      .insert(base.map((r, i) => ({ ...r, zone: toCreate[i].zone })))
      .select("id, name");
    if (error) {
      ({ data: made, error } = await sb.from("seating_tables")
        .insert(base).select("id, name"));
    }
    if (error) {
      ({ data: made, error } = await sb.from("seating_tables")
        .insert(base.map(({ event_id, name, capacity }) => ({ event_id, name, capacity })))
        .select("id, name"));
    }
    if (error) return NextResponse.json({ error: error.message, ...report }, { status: 500 });
    for (const t of (made ?? []) as TableRow[]) existing.set(clean(t.name), t.id);
  }

  const rows = [...seat.values()]
    .map(({ guest, entry }) => ({
      event_id: eventId,
      guest_id: guest.id,
      table_id: existing.get(entry.table as string),
    }))
    .filter((r): r is { event_id: string; guest_id: string; table_id: string } =>
      Boolean(r.table_id));

  /* Chunked, the same reason the guest import is: one oversized statement is
     the difference between seating 371 people and seating none of them. */
  let assigned = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await sb.from("seating_assignments")
      .upsert(rows.slice(i, i + 200), { onConflict: "guest_id" });
    if (error)
      return NextResponse.json(
        { error: error.message, assigned, ...report }, { status: 500 });
    assigned += rows.slice(i, i + 200).length;
  }

  return NextResponse.json({ ...report, assigned, tablesCreated: toCreate.length });
}
