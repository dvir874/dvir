/* Seating, arranged from what the list already knows.
 *
 * A seating engine has existed since before this file: seating-ai.ts, wired to
 * the couple's "סדר לי" button. It groups by guest_tags and guest_relationships
 * and seats into tables that already exist. There are zero rows in both of
 * those tables and two seating_tables across every wedding, so pressing the
 * button has always done nothing — which is the real reason no couple has ever
 * seated a single guest, and why אבא של לאל built two tables and stopped.
 *
 * What the list DOES know, at 97% of confirmed guests: source_group. It arrives
 * with the imported list in the couple's own words — "משפחת ביטון", "חברים
 * לאל", "מוזמנים אורי" — and nobody has to type it. Alongside it: how many
 * people each record brings, and now how many of them are children.
 *
 * So this plans from that, and creates the tables rather than requiring them.
 *
 * Two rules it will not break, because both are visible at the wedding:
 *   · a record is never split — "משפחת ביטון" is ten people at one table
 *   · a group is kept whole where it fits, and spills into consecutive tables
 *     where it does not, so the couple can place those side by side
 *
 * Import-free so it can be tested, the same reason phone-validate.ts is.
 */

export interface PlanGuest {
  id: string;
  name: string;
  /** People this record brings — guest_count. */
  seats: number;
  /** source_group, in the couple's own words. */
  group: string | null;
  /** How many of `seats` are children, when known. */
  kids?: number;
}

/** A table the hall actually has. */
export interface RoomTable {
  name: string;
  capacity: number;
  /** מפלס א, מפלס ב — the part of the hall it stands in. */
  zone?: string | null;
}

export interface PlannedTable {
  name: string;
  capacity: number;
  guestIds: string[];
  seats: number;
  /** The group this table belongs to, or null for a mixed table. */
  group: string | null;
  kids: number;
}

export interface Plan {
  tables: PlannedTable[];
  /** Records that fit nowhere — a household larger than one table. */
  oversized: { id: string; name: string; seats: number }[];
  /** Records the hall has no room for. Only possible when seating into a
      fixed room; the room is a given and inventing a table is not an option. */
  unseated: { id: string; name: string; seats: number }[];
  totals: {
    people: number; records: number; tables: number; groups: number; kids: number;
    /** Seats the room has, when seating into a real one. */
    capacity?: number;
    /** How many people the room cannot hold. */
    short?: number;
  };
}

export const DEFAULT_CAPACITY = 12;
/** Below this a table is a candidate for merging with another group's remainder. */
const MERGE_BELOW = 0.6;

const UNGROUPED = "";

/**
 * Build a seating plan.
 *
 * First-fit-decreasing within each group, then the half-empty remainders are
 * packed together. FFD rather than anything cleverer on purpose: the couple has
 * to look at the result and agree with it, and "the big families went down
 * first, then whoever fit" is a sentence a person can check. An optimal packing
 * they cannot follow is worse than a good one they can.
 */
export function planSeating(guests: PlanGuest[], capacity = DEFAULT_CAPACITY): Plan {
  const cap = Math.max(2, Math.floor(capacity) || DEFAULT_CAPACITY);

  const usable = guests.filter(g => g && g.id && (g.seats ?? 0) > 0);
  const oversized = usable.filter(g => g.seats > cap)
    .map(g => ({ id: g.id, name: g.name, seats: g.seats }));
  const seatable = usable.filter(g => g.seats <= cap);

  /* Largest groups first, so the tables that must stay together are placed
     while there is still room to keep them together. */
  const byGroup = new Map<string, PlanGuest[]>();
  for (const g of seatable) {
    const k = (g.group ?? "").trim() || UNGROUPED;
    const list = byGroup.get(k);
    if (list) list.push(g); else byGroup.set(k, [g]);
  }
  const groups = [...byGroup.entries()]
    .sort((a, b) => sum(b[1]) - sum(a[1]) || a[0].localeCompare(b[0]));

  const full: PlannedTable[] = [];
  const partial: PlannedTable[] = [];

  for (const [name, members] of groups) {
    const households = [...members]
      .sort((a, b) => b.seats - a.seats || a.name.localeCompare(b.name));
    const tables: PlannedTable[] = [];

    for (const h of households) {
      /* First table with room. Households are already largest-first, which is
         what makes first-fit behave like best-fit here without the cost. */
      const t = tables.find(x => x.seats + h.seats <= cap);
      if (t) { place(t, h); continue; }
      const fresh = blank(name === UNGROUPED ? null : name, cap);
      place(fresh, h);
      tables.push(fresh);
    }

    for (const t of tables) {
      (t.seats >= cap * MERGE_BELOW ? full : partial).push(t);
    }
  }

  /* Whatever is left over from each group, packed together rather than left as
     a room full of half-empty tables. Largest remainder first, same reason. */
  partial.sort((a, b) => b.seats - a.seats);
  const merged: PlannedTable[] = [];
  for (const t of partial) {
    const host = merged.find(x => x.seats + t.seats <= cap);
    if (!host) { merged.push(t); continue; }
    host.guestIds.push(...t.guestIds);
    host.seats += t.seats;
    host.kids += t.kids;
    /* A table holding two groups belongs to neither. */
    if (host.group !== t.group) host.group = null;
  }

  const tables = [...full, ...merged]
    .sort((a, b) => (a.group ?? "￿").localeCompare(b.group ?? "￿") || b.seats - a.seats);

  /* Named after the group, numbered only when a group needs more than one —
     "משפחת ביטון" reads better than "משפחת ביטון 1" when there is just one. */
  const countByGroup = new Map<string, number>();
  for (const t of tables) {
    if (t.group) countByGroup.set(t.group, (countByGroup.get(t.group) ?? 0) + 1);
  }
  const seenByGroup = new Map<string, number>();
  const grouped = tables.filter(t => t.group).length;
  let mixedNo = 0;
  for (const t of tables) {
    if (!t.group) { mixedNo += 1; t.name = `שולחן ${grouped + mixedNo}`; continue; }
    const n = (seenByGroup.get(t.group) ?? 0) + 1;
    seenByGroup.set(t.group, n);
    t.name = (countByGroup.get(t.group) ?? 1) > 1 ? `${t.group} ${n}` : t.group;
  }

  return {
    tables,
    oversized,
    unseated: [],
    totals: {
      people: tables.reduce((s, t) => s + t.seats, 0),
      records: tables.reduce((s, t) => s + t.guestIds.length, 0),
      tables: tables.length,
      groups: new Set(tables.map(t => t.group).filter(Boolean)).size,
      kids: tables.reduce((s, t) => s + t.kids, 0),
    },
  };
}

function blank(group: string | null, capacity: number): PlannedTable {
  return { name: "", capacity, guestIds: [], seats: 0, group, kids: 0 };
}

function place(t: PlannedTable, g: PlanGuest): void {
  t.guestIds.push(g.id);
  t.seats += g.seats;
  t.kids += Math.min(g.kids ?? 0, g.seats);
}

function sum(gs: PlanGuest[]): number {
  return gs.reduce((s, g) => s + g.seats, 0);
}


/* ── seating into a hall that already exists ─────────────────────────────── */

/**
 * Seat into the room the venue actually has.
 *
 * ארץ האיילים sent שחר's plan on 02/09: 26 numbered tables across מפלס א,
 * מפלס ב, מפלס ג and the floor by the bar, all twelve seats except table 24
 * which is ten. planSeating had produced 37 tables for that hall, because it
 * asks "how many tables do these people need" when the real question is "who
 * sits at the tables that exist".
 *
 * That is also what makes the number we send a guest true. "שולחן 14" is
 * useful only because a sign in the room says 14, and it says 14 because the
 * venue decided so — not because we counted.
 *
 * The zone is the reason a group split across two tables is still sitting
 * together: two tables on מפלס א are one party, and the same two split across
 * floors are not.
 *
 * Nobody is invented a seat for. A hall that cannot hold the list is a fact
 * the couple has to hear now, by name, and not discover on the night.
 */
export function planIntoRoom(guests: PlanGuest[], room: RoomTable[]): Plan {
  const tables: PlannedTable[] = room.map(t => ({
    name: t.name,
    capacity: Math.max(1, Math.floor(t.capacity) || 1),
    guestIds: [], seats: 0, group: null, kids: 0,
    zone: (t.zone ?? "").trim() || null,
  } as PlannedTable & { zone: string | null }));

  const capacity = tables.reduce((s, t) => s + t.capacity, 0);
  const biggest = tables.reduce((m, t) => Math.max(m, t.capacity), 0);

  const usable = guests.filter(g => g && g.id && (g.seats ?? 0) > 0);
  const oversized = usable.filter(g => g.seats > biggest)
    .map(g => ({ id: g.id, name: g.name, seats: g.seats }));
  const seatable = usable.filter(g => g.seats <= biggest);

  const byGroup = new Map<string, PlanGuest[]>();
  for (const g of seatable) {
    const k = (g.group ?? "").trim() || UNGROUPED;
    const list = byGroup.get(k);
    if (list) list.push(g); else byGroup.set(k, [g]);
  }
  const groups = [...byGroup.entries()]
    .sort((a, b) => sum(b[1]) - sum(a[1]) || a[0].localeCompare(b[0]));

  const unseated: { id: string; name: string; seats: number }[] = [];

  for (const [name, members] of groups) {
    const label = name === UNGROUPED ? null : name;
    const households = [...members]
      .sort((a, b) => b.seats - a.seats || a.name.localeCompare(b.name));

    for (const h of households) {
      /* Same zone as the rest of this group first, then any table already
         holding it, then any empty table, then anywhere at all. Each fallback
         is a worse outcome than the one before and a better one than a guest
         with nowhere to sit. */
      const zonesOfGroup = new Set(
        tables.filter(t => t.group === label && t.seats > 0)
          .map(t => (t as PlannedTable & { zone: string | null }).zone));

      const fits = (t: PlannedTable) => t.seats + h.seats <= t.capacity;
      const spot =
        tables.find(t => fits(t) && t.group === label
          && zonesOfGroup.has((t as PlannedTable & { zone: string | null }).zone))
        ?? tables.find(t => fits(t) && t.group === label)
        ?? tables.find(t => fits(t) && t.seats === 0
          && (!zonesOfGroup.size
            || zonesOfGroup.has((t as PlannedTable & { zone: string | null }).zone)))
        ?? tables.find(t => fits(t) && t.seats === 0)
        ?? tables.find(fits);

      if (!spot) { unseated.push({ id: h.id, name: h.name, seats: h.seats }); continue; }
      place(spot, h);
      spot.group = spot.group === null || spot.group === label ? label : null;
    }
  }

  const used = tables.filter(t => t.seats > 0);
  const people = used.reduce((s, t) => s + t.seats, 0);
  const shortBy = unseated.reduce((s, g) => s + g.seats, 0)
    + oversized.reduce((s, g) => s + g.seats, 0);

  return {
    tables,
    oversized,
    unseated,
    totals: {
      people,
      records: used.reduce((s, t) => s + t.guestIds.length, 0),
      tables: used.length,
      groups: new Set(used.map(t => t.group).filter(Boolean)).size,
      kids: used.reduce((s, t) => s + t.kids, 0),
      capacity,
      short: shortBy,
    },
  };
}
