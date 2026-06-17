/**
 * AI Seating Intelligence Engine
 *
 * Pure deterministic algorithm — no external API required.
 * Designed to be replaced / augmented with a real LLM call by setting
 *   NEXT_PUBLIC_AI_PROVIDER=claude in env and wiring ClaudeProvider.
 *
 * Scoring model (0-100):
 *   40 pts — affinity groups kept together
 *   30 pts — zero conflict violations
 *   20 pts — all tables within capacity
 *   10 pts — all couples at same table
 */

export const PRESET_TAGS = [
  { value: "bride_family",  label: "משפחת הכלה",   emoji: "👰" },
  { value: "groom_family",  label: "משפחת החתן",    emoji: "🤵" },
  { value: "army",          label: "חברים מהצבא",   emoji: "🪖" },
  { value: "university",    label: "חברים מהאוני׳", emoji: "🎓" },
  { value: "work",          label: "עמיתים לעבודה", emoji: "💼" },
  { value: "childhood",     label: "חברות ילדות",   emoji: "🏠" },
  { value: "religious",     label: "דתיים",          emoji: "✡️" },
  { value: "secular",       label: "חילוניים",       emoji: "🌿" },
  { value: "elderly",       label: "קשישים",         emoji: "👴" },
  { value: "children",      label: "ילדים",          emoji: "👧" },
  { value: "vip",           label: "VIP",            emoji: "⭐" },
  { value: "single",        label: "רווקים/ות",      emoji: "🙋" },
];

export interface GuestNode {
  id: string;
  name: string;
  guest_count: number;   // how many seats this guest entry occupies
  tags: string[];        // from guest_tags table
}

export interface Relationship {
  guest_id_a: string;
  guest_id_b: string;
  type: "couple" | "conflict" | "prefer_together" | "divorced";
}

export interface TableSlot {
  id: string;
  name: string;
  capacity: number;
}

export interface SeatingAssignmentAI {
  guest_id: string;
  table_id: string;
}

export interface SeatingWarning {
  type: "conflict" | "capacity" | "split_group";
  message: string;
  severity: "error" | "warning" | "info";
}

export interface SeatingStrength {
  message: string;
}

export interface SeatingResult {
  assignments: SeatingAssignmentAI[];
  score: number;           // 0–100
  warnings: SeatingWarning[];
  strengths: SeatingStrength[];
  groupsSatisfied: number;
  groupsTotal: number;
  conflictsViolated: number;
  tablesOverCapacity: number;
  couplesSplit: number;
}

/* ── Helpers ─────────────────────────────────────────────── */

function tagAffinityGroups(guests: GuestNode[]): Map<string, string[]> {
  // Map<tag, guestId[]>
  const groups = new Map<string, string[]>();
  for (const g of guests) {
    for (const tag of g.tags) {
      if (!groups.has(tag)) groups.set(tag, []);
      groups.get(tag)!.push(g.id);
    }
  }
  return groups;
}

function seatsNeeded(guests: GuestNode[], ids: string[]): number {
  return ids.reduce((s, id) => {
    const g = guests.find((x) => x.id === id);
    return s + (g?.guest_count ?? 1);
  }, 0);
}

/* ── Core algorithm ──────────────────────────────────────── */

export function generateAISeating(
  guests: GuestNode[],
  relationships: Relationship[],
  tables: TableSlot[],
): SeatingResult {
  const warnings: SeatingWarning[] = [];
  const strengths: SeatingStrength[] = [];

  // Only seat confirmed guests (caller should pre-filter, but guard here too)
  const workingGuests = guests.filter((g) => g.tags !== undefined);

  if (workingGuests.length === 0 || tables.length === 0) {
    return {
      assignments: [], score: 0, warnings: [{ type: "capacity", message: "אין אורחים או שולחנות להצבה", severity: "error" }],
      strengths: [], groupsSatisfied: 0, groupsTotal: 0, conflictsViolated: 0, tablesOverCapacity: 0, couplesSplit: 0,
    };
  }

  // Build lookup maps
  const conflictPairs = new Set<string>();
  const couplePairs   = new Set<string>();
  const togetherPairs = new Set<string>();

  const pairKey = (a: string, b: string) => [a, b].sort().join("|");

  for (const r of relationships) {
    const key = pairKey(r.guest_id_a, r.guest_id_b);
    if (r.type === "conflict" || r.type === "divorced") conflictPairs.add(key);
    if (r.type === "couple")           couplePairs.add(key);
    if (r.type === "prefer_together")  togetherPairs.add(key);
  }

  // Track occupancy per table: table_id → guestId[]
  const tableOccupants = new Map<string, string[]>();
  const tableSeatCount  = new Map<string, number>();
  for (const t of tables) {
    tableOccupants.set(t.id, []);
    tableSeatCount.set(t.id, 0);
  }

  const assignments: SeatingAssignmentAI[] = [];
  const assigned = new Set<string>();

  // Helper: can we place guestId at tableId without violating conflicts?
  function canPlace(guestId: string, tableId: string): boolean {
    const occupants = tableOccupants.get(tableId) ?? [];
    for (const occ of occupants) {
      if (conflictPairs.has(pairKey(guestId, occ))) return false;
    }
    return true;
  }

  function place(guestId: string, tableId: string) {
    const g = workingGuests.find((x) => x.id === guestId)!;
    assignments.push({ guest_id: guestId, table_id: tableId });
    tableOccupants.get(tableId)!.push(guestId);
    tableSeatCount.set(tableId, (tableSeatCount.get(tableId) ?? 0) + (g?.guest_count ?? 1));
    assigned.add(guestId);
  }

  function availableSeats(tableId: string): number {
    const t = tables.find((x) => x.id === tableId)!;
    return t.capacity - (tableSeatCount.get(tableId) ?? 0);
  }

  // ── Step 1: Place couples together ─────────────────────
  const processedCouples = new Set<string>();
  for (const r of relationships.filter((x) => x.type === "couple")) {
    const key = pairKey(r.guest_id_a, r.guest_id_b);
    if (processedCouples.has(key)) continue;
    processedCouples.add(key);

    const a = workingGuests.find((g) => g.id === r.guest_id_a);
    const b = workingGuests.find((g) => g.id === r.guest_id_b);
    if (!a || !b) continue;

    const totalSeats = (a.guest_count ?? 1) + (b.guest_count ?? 1);

    // Find a table with enough space where both can go (no conflicts for either)
    const target = tables.find(
      (t) => availableSeats(t.id) >= totalSeats && canPlace(a.id, t.id) && canPlace(b.id, t.id)
    );
    if (target) {
      if (!assigned.has(a.id)) place(a.id, target.id);
      if (!assigned.has(b.id)) place(b.id, target.id);
    }
  }

  // ── Step 2: Assign affinity groups ─────────────────────
  const affinityGroups = tagAffinityGroups(workingGuests);

  // Tag priority: VIP and family first, then by group size desc
  const tagPriority: Record<string, number> = {
    vip: 0, bride_family: 1, groom_family: 2, elderly: 3,
    army: 4, university: 5, work: 6, childhood: 7,
    religious: 8, secular: 9, children: 10, single: 11,
  };

  const sortedTags = [...affinityGroups.keys()].sort((a, b) => {
    const pa = tagPriority[a] ?? 99;
    const pb = tagPriority[b] ?? 99;
    if (pa !== pb) return pa - pb;
    return (affinityGroups.get(b)?.length ?? 0) - (affinityGroups.get(a)?.length ?? 0);
  });

  let groupsSatisfied = 0;
  const groupsTotal = sortedTags.length;

  for (const tag of sortedTags) {
    const members = (affinityGroups.get(tag) ?? []).filter((id) => !assigned.has(id));
    if (members.length === 0) { groupsSatisfied++; continue; }

    const needed = seatsNeeded(workingGuests, members);

    // Try to fit the entire group on one table
    const bestTable = tables.find(
      (t) => availableSeats(t.id) >= needed && members.every((id) => canPlace(id, t.id))
    );

    if (bestTable) {
      for (const id of members) place(id, bestTable.id);
      groupsSatisfied++;
    } else {
      // Group must be split — fill greedily, table by table
      let remaining = [...members];
      for (const t of [...tables].sort((a, b) => availableSeats(b.id) - availableSeats(a.id))) {
        if (remaining.length === 0) break;
        const fits: string[] = [];
        let seatCount = 0;
        for (const id of remaining) {
          const g = workingGuests.find((x) => x.id === id)!;
          const seats = g?.guest_count ?? 1;
          if (seatCount + seats <= availableSeats(t.id) && canPlace(id, t.id)) {
            fits.push(id);
            seatCount += seats;
          }
        }
        for (const id of fits) place(id, t.id);
        remaining = remaining.filter((id) => !fits.includes(id));
      }
      if (remaining.length > 0) {
        warnings.push({
          type: "split_group",
          message: `קבוצת "${PRESET_TAGS.find((t) => t.value === tag)?.label ?? tag}" פוצלה — לא היה מספיק מקום בשולחן אחד`,
          severity: "warning",
        });
      }
    }
  }

  // ── Step 3: Place remaining unassigned guests ───────────
  const unassigned = workingGuests.filter((g) => !assigned.has(g.id));
  for (const g of unassigned) {
    const target = [...tables].sort((a, b) => availableSeats(b.id) - availableSeats(a.id))
      .find((t) => availableSeats(t.id) >= (g.guest_count ?? 1) && canPlace(g.id, t.id));
    if (target) place(g.id, target.id);
    else {
      // Force-place on least-full table (over capacity)
      const fallback = [...tables].sort((a, b) => availableSeats(b.id) - availableSeats(a.id))[0];
      if (fallback) place(g.id, fallback.id);
    }
  }

  // ── Step 4: Validate and score ──────────────────────────
  let conflictsViolated = 0;
  for (const t of tables) {
    const occupants = tableOccupants.get(t.id) ?? [];
    for (let i = 0; i < occupants.length; i++) {
      for (let j = i + 1; j < occupants.length; j++) {
        if (conflictPairs.has(pairKey(occupants[i], occupants[j]))) {
          conflictsViolated++;
          const nameA = workingGuests.find((g) => g.id === occupants[i])?.name ?? occupants[i];
          const nameB = workingGuests.find((g) => g.id === occupants[j])?.name ?? occupants[j];
          warnings.push({
            type: "conflict",
            message: `⚠️ קונפליקט: ${nameA} ו-${nameB} יושבים יחד בשולחן ${t.name}`,
            severity: "error",
          });
        }
      }
    }
  }

  let tablesOverCapacity = 0;
  for (const t of tables) {
    const used = tableSeatCount.get(t.id) ?? 0;
    if (used > t.capacity) {
      tablesOverCapacity++;
      warnings.push({
        type: "capacity",
        message: `שולחן "${t.name}" מלא מדי: ${used}/${t.capacity} מקומות`,
        severity: "warning",
      });
    }
  }

  let couplesSplit = 0;
  for (const r of relationships.filter((x) => x.type === "couple")) {
    const assignA = assignments.find((a) => a.guest_id === r.guest_id_a)?.table_id;
    const assignB = assignments.find((a) => a.guest_id === r.guest_id_b)?.table_id;
    if (assignA && assignB && assignA !== assignB) {
      couplesSplit++;
      const nameA = workingGuests.find((g) => g.id === r.guest_id_a)?.name ?? "";
      const nameB = workingGuests.find((g) => g.id === r.guest_id_b)?.name ?? "";
      warnings.push({
        type: "conflict",
        message: `הזוג ${nameA} ו-${nameB} הוצבו בשולחנות שונים`,
        severity: "error",
      });
    }
  }

  // ── Scoring ─────────────────────────────────────────────
  const groupScore    = groupsTotal > 0 ? Math.round((groupsSatisfied / groupsTotal) * 40) : 40;
  const conflictScore = conflictsViolated === 0 ? 30 : Math.max(0, 30 - conflictsViolated * 10);
  const capacityScore = tablesOverCapacity === 0 ? 20 : Math.max(0, 20 - tablesOverCapacity * 7);
  const coupleScore   = relationships.filter((r) => r.type === "couple").length === 0
    ? 10
    : couplesSplit === 0 ? 10 : Math.max(0, 10 - couplesSplit * 5);

  const score = groupScore + conflictScore + capacityScore + coupleScore;

  // ── Strengths ───────────────────────────────────────────
  if (conflictsViolated === 0 && relationships.filter((r) => r.type === "conflict" || r.type === "divorced").length > 0) {
    strengths.push({ message: "✅ כל הקונפליקטים הוסרו — אף אורח לא יושב עם מי שלא כדאי" });
  }
  if (couplesSplit === 0 && relationships.filter((r) => r.type === "couple").length > 0) {
    strengths.push({ message: "❤️ כל הזוגות הוצבו יחד" });
  }
  if (groupsSatisfied === groupsTotal && groupsTotal > 0) {
    strengths.push({ message: "🎯 כל קבוצות החברות הוצבו בשולחן אחד" });
  }
  if (tablesOverCapacity === 0) {
    strengths.push({ message: "✨ כל השולחנות בתוך הקיבולת" });
  }

  return {
    assignments, score, warnings, strengths,
    groupsSatisfied, groupsTotal, conflictsViolated, tablesOverCapacity, couplesSplit,
  };
}
