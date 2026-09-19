/* Reading a seating plan out of the spreadsheet a family actually keeps.
 *
 * Every couple seats their wedding in Excel first. The app has had a seating
 * screen since migration 004 and there are two seating_tables rows across
 * every wedding in production, because the only way in was to drag 371 people
 * into tables one at a time on a phone. טל sent the file instead: "משפחת החתן
 * הצליחה לשבץ בשולחנות, אני לא הצלחתי - האפליקציה ממש קשה".
 *
 * So the file is the input, and it is not a clean export. The one טל sent is
 * two sheets in two different shapes, neither of which any importer would
 * choose:
 *
 *   שפירא — three (שם · כמות · קבוצה · שולחן) blocks side by side across the
 *   page, because that is how you fit 96 households on one printable sheet,
 *   plus a fourth block that is a per-table summary rather than guests.
 *
 *   קנריק — no headers at all. A bare table number opens a block, the
 *   households sitting there are listed under it, and a number in the next
 *   column closes the block with how many people that table seats.
 *
 * Both are read here, and neither is guessed at: a spreadsheet kept by hand
 * states its own totals, and a reading that does not reproduce them is a
 * reading that is wrong. The grouped shape is accepted only when the block
 * headcounts add up to the סה"כ the sheet itself carries. When they do not,
 * the blocks come back in `skipped` with the arithmetic, for a human, instead
 * of seating somebody at a table this file never put them at.
 *
 * A wrong table number is the one mistake here that cannot be fixed at the
 * door — see venueTableNumbers in the send cron — which is why nothing in this
 * file returns a best guess.
 *
 * Import-free so it can be tested, the same reason guest-match.ts is. The
 * workbook binding lives in xlsx-utils.ts with the other one.
 */

export type Cell = string | number | boolean | null | undefined;
export type Grid = Cell[][];

export interface SeatingEntry {
  /** The name exactly as the sheet writes it — matched to the list later. */
  name: string;
  /** The number that will be on the sign, or the couple's name for the table.
      null when the sheet lists somebody without placing them. */
  table: string | null;
  /** People this record brings, when the sheet says. Never invented: the
      grouped shape counts by table, not by household. */
  count: number | null;
  /** The couple's own word for the group — "משפחה ימית", "חברות טל". */
  group: string | null;
  sheet: string;
  /** 1-indexed, so a report can name the row the operator is looking at. */
  row: number;
}

export interface SeatingTableSpec {
  table: string;
  /** What the sheet says sits there. null when it does not say. */
  statedSeats: number | null;
  /** The couple's word for whoever is at it, when one group owns the table. */
  group: string | null;
}

export interface SkippedBlock {
  sheet: string;
  what: string;
  reason: string;
}

export interface SeatingParse {
  entries: SeatingEntry[];
  tables: SeatingTableSpec[];
  /** Blocks this reader would not guess at, each with why. */
  skipped: SkippedBlock[];
  warnings: string[];
}

/* ── cells ────────────────────────────────────────────────────────────── */

/* A name pasted out of an RTL document carries invisible direction marks. They
   survive a trim, and a table named "‏12" fails a digits-only test while
   looking exactly like 12 on screen — the same trap venueTableNumbers works
   around downstream. Taken off here so it never gets that far.
   ﻿ and ​ are in the set for the reason xlsx-blocks.ts gives: Excel
   writes a BOM into the first cell of a CSV, and a zero-width space survives
   every copy-paste. Written as escapes so pasting into this line cannot break
   it — which is the same failure it exists to prevent. */
const BIDI = /[‎‏‪-‮⁦-⁩​﻿]/g;

function text(cell: Cell): string {
  if (cell === null || cell === undefined || typeof cell === "boolean") return "";
  return String(cell).replace(BIDI, "").replace(/\s+/g, " ").trim();
}

function empty(cell: Cell): boolean {
  return text(cell) === "";
}

/** A cell that is only a number — 12, "12", 12.0. Not "שולחן 12". */
function bareNumber(cell: Cell): number | null {
  if (typeof cell === "number") return Number.isInteger(cell) ? cell : null;
  const t = text(cell);
  return /^\d{1,3}$/.test(t) ? parseInt(t, 10) : null;
}

/** Headers compared without the punctuation people put in them: מס' שולחן. */
function headerKey(cell: Cell): string {
  return text(cell).replace(/["'`׳״.]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

const NAME_HEADERS = new Set([
  "שם", "שם מלא", "שם האורח", "אורח", "מוזמן", "הזמנה לכבוד",
  "name", "full name", "guest",
]);
const COUNT_HEADERS = new Set([
  "כמות", "כמות מוזמנים", "כמות אנשים", "מספר מוזמנים", "מספר אנשים",
  "נפשות", "מגיעים", "מספר מגיעים", "count", "guests", "qty",
]);
const GROUP_HEADERS = new Set([
  "קבוצה", "שיוך", "קטגוריה", "צד", "group", "category", "side",
]);
const TABLE_HEADERS = new Set([
  "שולחן", "מס שולחן", "מספר שולחן", "שולחנות", "table", "table number", "table no",
]);

type HeaderKind = "name" | "count" | "group" | "table";

function headerKind(cell: Cell): HeaderKind | null {
  const k = headerKey(cell);
  if (!k) return null;
  if (NAME_HEADERS.has(k)) return "name";
  if (COUNT_HEADERS.has(k)) return "count";
  if (GROUP_HEADERS.has(k)) return "group";
  if (TABLE_HEADERS.has(k)) return "table";
  return null;
}

/** The value of a שולחן cell, as it will be printed. */
function tableName(cell: Cell): string | null {
  const n = bareNumber(cell);
  if (n !== null) return String(n);
  const t = text(cell);
  return t ? t.slice(0, 40) : null;
}

function headcount(cell: Cell): number | null {
  const n = bareNumber(cell);
  return n !== null && n > 0 ? n : null;
}

/* A row that closes a hand-kept sheet: סה"כ, סה"כ כללי, "סך הכל". */
function isTotalsRow(row: Cell[]): boolean {
  return row.some((c) => /^(סה"?כ|סך הכל|total)/i.test(headerKey(c)));
}

/* ── shape A: a sheet with headers ────────────────────────────────────── */

interface Block {
  nameCol: number | null;
  countCol: number | null;
  groupCol: number | null;
  tableCol: number | null;
}

/* The header row carries every block on the page, left to right. A שם opens a
   new block and the columns after it belong to it; a שולחן arriving when the
   open block already has one is not a fourth column of that block, it is the
   summary table the family keeps beside the list. */
function blocksFromHeaderRow(row: Cell[]): { guests: Block[]; summary: Block[] } {
  const guests: Block[] = [];
  const summary: Block[] = [];
  let open: Block | null = null;

  row.forEach((cell, col) => {
    const kind = headerKind(cell);
    if (!kind) return;

    if (kind === "name") {
      open = { nameCol: col, countCol: null, groupCol: null, tableCol: null };
      guests.push(open);
      return;
    }
    if (open && open[`${kind}Col` as const] === null) {
      open[`${kind}Col` as const] = col;
      return;
    }
    /* Outside any block, or a repeat of a column it already has. A שולחן that
       starts with a כמות and never gets a שם is the per-table summary. */
    if (kind === "table") {
      open = null;
      summary.push({ nameCol: null, countCol: null, groupCol: null, tableCol: col });
      return;
    }
    const last = summary[summary.length - 1];
    if (last && last[`${kind}Col` as const] === null) last[`${kind}Col` as const] = col;
  });

  return {
    guests: guests.filter((b) => b.tableCol !== null),
    summary: summary.filter((b) => b.countCol !== null),
  };
}

function findHeaderRow(grid: Grid): number {
  for (let r = 0; r < Math.min(grid.length, 20); r++) {
    const kinds = (grid[r] ?? []).map(headerKind);
    if (kinds.includes("name") && kinds.includes("table")) return r;
  }
  return -1;
}

function readColumnar(grid: Grid, sheet: string, out: SeatingParse): void {
  const headerRow = findHeaderRow(grid);
  const { guests, summary } = blocksFromHeaderRow(grid[headerRow] ?? []);

  if (!guests.length) {
    out.skipped.push({
      sheet,
      what: `שורת כותרות ${headerRow + 1}`,
      reason: 'נמצאה כותרת "שם" בלי עמודת "שולחן" לצידה',
    });
    return;
  }

  const seenTables = new Map<string, SeatingTableSpec>();

  for (let r = headerRow + 1; r < grid.length; r++) {
    const row = grid[r] ?? [];
    if (isTotalsRow(row)) continue;

    for (const b of guests) {
      const nameCell = row[b.nameCol as number];
      if (empty(nameCell)) continue;
      /* A number under a שם column is the sheet's own arithmetic leaking into
         the list — the 212 that closes טל's file sits under a name column. */
      if (bareNumber(nameCell) !== null) continue;

      const table = b.tableCol === null ? null : tableName(row[b.tableCol]);
      const group = b.groupCol === null ? null : text(row[b.groupCol]) || null;
      out.entries.push({
        name: text(nameCell),
        table,
        count: b.countCol === null ? null : headcount(row[b.countCol]),
        group,
        sheet,
        row: r + 1,
      });
      if (table && !seenTables.has(table)) {
        seenTables.set(table, { table, statedSeats: null, group });
      }
    }

    /* The summary block, when the family keeps one: how many seats the table
       holds, in their own count, which is better than anything we could add
       up from a list that may still be missing somebody. */
    for (const b of summary) {
      const table = tableName(row[b.tableCol as number]);
      if (!table || bareNumber(row[b.tableCol as number]) === null) continue;
      const seats = b.countCol === null ? null : headcount(row[b.countCol]);
      const group = b.groupCol === null ? null : text(row[b.groupCol]) || null;
      const known = seenTables.get(table);
      if (known) {
        known.statedSeats = seats ?? known.statedSeats;
        known.group = known.group ?? group;
      } else {
        seenTables.set(table, { table, statedSeats: seats, group });
      }
    }
  }

  out.tables.push(...seenTables.values());
}

/* ── shape B: a sheet with no headers ─────────────────────────────────── */

/* Two columns at a time: the names, and the one beside them that carries the
   group and the headcount. A bare number in the names column, with nothing
   beside it, is a table opening — which is also what tells this reader the
   pair is a seating block at all and not a column of leftover numbers. */
function groupedPairs(grid: Grid): number[] {
  const width = grid.reduce((w, r) => Math.max(w, r.length), 0);
  const pairs: number[] = [];

  for (let c = 0; c < width; c++) {
    if (pairs.includes(c - 1)) continue; /* already read as somebody's mate */
    let openers = 0;
    let names = 0;
    for (const row of grid) {
      const cell = row?.[c];
      if (empty(cell)) continue;
      if (bareNumber(cell) !== null) {
        if (empty(row?.[c + 1])) openers++;
      } else if (!isTotalsRow(row ?? [])) {
        names++;
      }
    }
    if (openers >= 2 && names >= 3) pairs.push(c);
  }
  return pairs;
}

interface GroupedBlock {
  table: string | null;
  stated: number | null;
  group: string | null;
  members: { name: string; row: number }[];
  /** Set once the headcount arrives; anything after it belongs elsewhere. */
  closed: boolean;
}

function readGroupedPair(
  grid: Grid, sheet: string, nameCol: number, sideCol: number, out: SeatingParse,
): void {
  const blocks: GroupedBlock[] = [];
  let open: GroupedBlock | null = null;
  let statedTotal: number | null = null;

  const openBlock = (table: string | null): GroupedBlock => {
    const b: GroupedBlock = { table, stated: null, group: null, members: [], closed: false };
    blocks.push(b);
    return b;
  };

  for (let r = 0; r < grid.length; r++) {
    const row = grid[r] ?? [];
    if (isTotalsRow(row)) {
      /* The sheet's own bottom line, for this pair of columns. Everything
         below it is another family's arithmetic. */
      statedTotal = headcount(row[sideCol]) ?? headcount(row[nameCol]);
      break;
    }

    const nameCell = row[nameCol];
    const sideCell = row[sideCol];
    if (empty(nameCell) && empty(sideCell)) continue;

    const opensTable = bareNumber(nameCell);
    if (opensTable !== null && empty(sideCell)) {
      open = openBlock(String(opensTable));
      continue;
    }

    if (!empty(nameCell)) {
      /* A closed block has had its headcount stated. A name after that is not
         another person at that table — it is somebody the sheet has not
         placed, like the household טל marked "בשולחן של שפירא". */
      if (!open || open.closed) open = openBlock(null);
      open.members.push({ name: text(nameCell), row: r + 1 });
    }

    if (!empty(sideCell) && open) {
      const n = headcount(sideCell);
      if (n !== null && open.stated === null) {
        open.stated = n;
        open.closed = true;
      } else if (n === null && open.group === null) {
        open.group = text(sideCell);
      }
    }
  }

  /* The sheet's title sitting in the first cell of the column — "קנריק",
     "חברים חתן". Not a guest, and it would be reported as one forever. */
  const first = blocks[0];
  if (first && first.table === null && first.stated === null && first.members.length <= 1) {
    if (first.members.length) {
      out.skipped.push({
        sheet, what: `שורה ${first.members[0].row}: "${first.members[0].name}"`,
        reason: "כותרת של הגיליון, לא מוזמן",
      });
    }
    blocks.shift();
  }

  const placed = blocks.filter((b) => b.table !== null);
  if (!placed.length) return;

  /* The reconciliation. A hand-kept sheet states what it adds up to, and a
     reading that does not reproduce that number has misread where a block
     starts or ends — which would seat people at the wrong table rather than
     fail. Nothing from these columns is imported when it does not agree. */
  const sum = blocks.reduce((s, b) => s + (b.stated ?? 0), 0);
  const where = `שולחנות ${placed.map((b) => b.table).join(", ")}`;
  if (statedTotal !== null && sum !== statedTotal) {
    out.skipped.push({
      sheet, what: where,
      reason: `הקריאה מגיעה ל-${sum} איש והגיליון כותב סה"כ ${statedTotal} — צריך בדיקה ידנית`,
    });
    return;
  }
  if (statedTotal === null) {
    out.warnings.push(
      `${sheet}: ${where} — אין שורת "סה"כ" להצליב מולה, הקריאה לא אומתה (${sum} איש)`,
    );
  }

  for (const b of blocks) {
    for (const m of b.members) {
      out.entries.push({
        name: m.name, table: b.table, count: null,
        group: b.group, sheet, row: m.row,
      });
    }
    if (b.table !== null) {
      out.tables.push({ table: b.table, statedSeats: b.stated, group: b.group });
    }
  }
}

/* ── the sheet, then the workbook ─────────────────────────────────────── */

function readSheet(grid: Grid, sheet: string, out: SeatingParse): void {
  if (!grid.length) return;
  if (findHeaderRow(grid) >= 0) {
    readColumnar(grid, sheet, out);
    return;
  }
  const pairs = groupedPairs(grid);
  if (!pairs.length) {
    out.skipped.push({
      sheet, what: "הגיליון כולו",
      reason: 'לא נמצאו עמודות "שם" ו"שולחן", וגם לא מבנה של מספר שולחן עם שמות תחתיו',
    });
    return;
  }
  for (const c of pairs) readGroupedPair(grid, sheet, c, c + 1, out);
}

export function parseSeatingSheets(sheets: { name: string; grid: Grid }[]): SeatingParse {
  const out: SeatingParse = { entries: [], tables: [], skipped: [], warnings: [] };
  for (const s of sheets) readSheet(s.grid, s.name, out);

  /* One table, one row, whichever sheet reached it first — the two families
     number into the same room. A stated headcount beats a missing one. */
  const merged = new Map<string, SeatingTableSpec>();
  for (const t of out.tables) {
    const known = merged.get(t.table);
    if (!known) { merged.set(t.table, { ...t }); continue; }
    known.statedSeats = known.statedSeats ?? t.statedSeats;
    known.group = known.group ?? t.group;
  }
  out.tables = [...merged.values()].sort((a, b) => {
    const na = bareNumber(a.table), nb = bareNumber(b.table);
    if (na !== null && nb !== null) return na - nb;
    return a.table.localeCompare(b.table, "he");
  });

  /* The same household written at two tables. Both rows look right on their
     own page and the family has never seen them side by side. */
  const byName = new Map<string, Set<string>>();
  for (const e of out.entries) {
    if (!e.table) continue;
    const key = e.name.replace(/["'`׳״]/g, "").replace(/\s+/g, " ").trim();
    let tables = byName.get(key);
    if (!tables) byName.set(key, (tables = new Set()));
    tables.add(e.table);
  }
  for (const [name, tables] of byName) {
    if (tables.size > 1) {
      out.warnings.push(`"${name}" מופיע בשני שולחנות: ${[...tables].join(", ")}`);
    }
  }

  /* Tables the hall cannot label. The send cron gives a guest a number only
     when every table at the wedding is one, so a single descriptive name here
     silences the "🪑 שולחן" message for all 371 of them. */
  const named = out.tables.filter((t) => bareNumber(t.table) === null);
  if (named.length) {
    out.warnings.push(
      `${named.length} שולחנות בלי מספר (${named.slice(0, 3).map((t) => `"${t.table}"`).join(", ")}) — ` +
      "כל עוד יש כאלה, ההודעה עם מספר השולחן לא תישלח לאף אורח",
    );
  }

  const unplaced = out.entries.filter((e) => !e.table).length;
  if (unplaced) {
    out.warnings.push(`${unplaced} רשומות בקובץ בלי שולחן — הן לא ישובצו`);
  }

  return out;
}

/* Seats to build the table with: the family's own number, which knows about
   the chairs they asked the venue for, and never fewer than the people this
   file actually puts there. Bounded to what /seating/room will accept. */
export function tableCapacity(spec: SeatingTableSpec, seated: number): number {
  const stated = spec.statedSeats ?? seated;
  return Math.min(40, Math.max(1, stated, seated));
}
