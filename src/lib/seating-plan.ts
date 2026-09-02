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
  totals: { people: number; records: number; tables: number; groups: number; kids: number };
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
