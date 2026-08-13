/* Reading the guest list people actually send.
 *
 * parseGuestsFromXlsx assumes one tidy table: a header row, then a column each
 * for name, phone and headcount. No client has ever sent that.
 *
 * The list for אורי ✧ שחר is four lists side by side in a single sheet — one
 * per family, each with its own three columns and its own header:
 *
 *   מוזמנים פורת │ מס' מוזמנים │ מס' טלפון   ‖ משפחת ביטון │ מס' טלפון │ מס מוזמנים ‖ …
 *
 * Look at the order. פורת lists the headcount before the phone; ביטון the other
 * way round. A parser that reads the first block's layout and applies it to the
 * rest gives sixty-five people the phone number "2" and everyone else a
 * headcount of 052-2962397 — and it does not fail while doing it. It imports
 * nonsense quietly, which is the failure mode this codebase spent a whole day
 * removing from everywhere else.
 *
 * So nothing here is positional. Every block finds its own columns by reading
 * its own header, and a block whose header cannot be understood is reported
 * rather than guessed at.
 *
 * The blocks are also where the guest list keeps something worth having: which
 * side each guest belongs to. Four families, and the sheet already knows.
 */

import * as XLSX from "xlsx";

export interface ParsedGuest {
  name: string;
  phone: string;
  guest_count: number;
  /* The block heading — "מוזמנים פורת", "משפחת ביטון". Kept as source_group so
     the couple can filter by side without re-typing it 327 times. */
  source_group: string;
}

export interface BlockReport {
  group: string;
  /* Column letters as the client sees them in Excel, so a problem can be
     pointed at rather than described. */
  columns: { name: string; phone: string; count: string };
  rows: number;
  guests: number;
}

export interface ParseResult {
  guests: ParsedGuest[];
  blocks: BlockReport[];
  /* Rows that were found but could not be used. Never silently dropped — a
     guest missing from a wedding because a cell was odd is exactly the kind of
     absence nobody notices until the night itself. */
  problems: { group: string; row: number; name: string; raw: string; why: string }[];
  totals: { records: number; guests: number };
}

/* Header vocabulary. Matched loosely because these are typed by hand: "מס'
   טלפון", "מס טלפון ", "טלפון", "נייד" are all the same intent, and the
   apostrophe and the trailing space are not signal. */
const NAME_WORDS  = ["שם", "name"];
const PHONE_WORDS = ["טלפון", "נייד", "פלאפון", "phone", "mobile"];
const COUNT_WORDS = ["מוזמנים", "כמות", "מספר אנשים", "count", "guests"];

const clean = (v: unknown) =>
  String(v ?? "").replace(/[׳'"]/g, "").replace(/\s+/g, " ").trim();

function headerKind(v: unknown): "name" | "phone" | "count" | null {
  const t = clean(v).toLowerCase();
  if (!t) return null;
  /* Phone before count: "מס' טלפון" and "מס מוזמנים" both start with מס, and
     the distinguishing word is the second one. */
  if (PHONE_WORDS.some(w => t.includes(w))) return "phone";
  if (COUNT_WORDS.some(w => t.includes(w))) return "count";
  if (NAME_WORDS.some(w => t === w || t.startsWith(w + " ") || t === w + " ")) return "name";
  return null;
}

/* Whatever Excel did to it, and wherever the guest lives.
 *
 * Four real shapes from two versions of one file:
 *   "055-8838607"     typed as text
 *   "0 52-868-8437"   a space after the zero
 *   586855990         stored as a NUMBER — Excel ate the leading zero, and all
 *                     eighty-seven rows of one family look like this
 *   " 16462841932 +"  a US number, +1 646 284 1932
 *
 * The third is the dangerous one: valid, imports without complaint, and can
 * never be matched to that guest's own WhatsApp reply. Three guests were stored
 * that way on 12/08; one was Dvir's sister.
 *
 * The fourth arrived on 13/08 when the client corrected a row, and the parser
 * rejected it as malformed. It was not malformed — סטיב ומריאן live abroad.
 * WhatsApp is not an Israeli service and a wedding is not an Israeli-only guest
 * list; refusing every foreign number would have quietly dropped them, and any
 * relative overseas after them, out of every future client's list.
 *
 * Israeli numbers keep their local 0XX shape, because that is what the rest of
 * the system stores and matches on. Foreign numbers are kept as E.164 digits —
 * which is also exactly what Meta sends back on a reply, so matching works
 * without a second code path. */
export function normalisePhone(raw: unknown): string {
  const text = String(raw ?? "");
  let d = text.replace(/\D/g, "");
  if (!d) return "";

  if (d.startsWith("972")) return "0" + d.slice(3);
  /* Nine digits and no leading zero is Excel's numeric mangling, not a real
     nine-digit number — Israeli numbers carry the zero. */
  if (d.length === 9 && !d.startsWith("0")) d = "0" + d;
  if (d.startsWith("0")) return d;

  /* No leading zero and not Israeli: a country code. Kept as digits, the same
     shape Meta uses. */
  return d;
}

export function isPlausiblePhone(p: string): boolean {
  /* Israeli — mobile 05X + 7 digits, landline 0X + 7 with area codes 2-4, 8-9. */
  if (/^0(5\d{8}|[2-4,8-9]\d{7})$/.test(p)) return true;
  /* Foreign, in E.164 digits. The range covers every real country code and
     national number: shortest plausible is around ten digits, longest is
     fifteen by the standard. A leading zero here would be a local number we
     failed to recognise, not an international one, so it is excluded. */
  if (/^[1-9]\d{9,14}$/.test(p)) return true;
  return false;
}

/* Excel column letter, for a report a human can act on. */
function colLetter(i: number): string {
  let s = "";
  for (let n = i; n >= 0; n = Math.floor(n / 26) - 1) s = String.fromCharCode(65 + (n % 26)) + s;
  return s;
}

/* Which row holds the headers.
 *
 * Not assumed to be the first. In this file row 1 carries the family names
 * ("מוזמנים פורת") and row 2 carries the field names ("שם", "מס' טלפון") — so
 * the sheet has two header rows, and the one that matters is the second. The
 * row that yields the most recognisable field names wins. */
function findHeaderRow(grid: unknown[][]): number {
  let best = 0, bestScore = 0;
  for (let r = 0; r < Math.min(grid.length, 10); r++) {
    const score = (grid[r] ?? []).filter(c => headerKind(c) !== null).length;
    if (score > bestScore) { bestScore = score; best = r; }
  }
  return bestScore >= 2 ? best : 0;
}

/* Group the header row into blocks.
 *
 * A block is a run of columns containing exactly one name, one phone and one
 * count, in any order. Runs are separated by the blank spacer columns the
 * client used between families. */
function findBlocks(header: unknown[], titles: unknown[]): {
  name: number; phone: number; count: number; title: string;
}[] {
  const blocks: { name: number; phone: number; count: number; title: string }[] = [];
  let cur: { name?: number; phone?: number; count?: number; first?: number } = {};

  const flush = () => {
    if (cur.name != null && cur.phone != null && cur.count != null) {
      /* The block's title is the nearest non-empty cell at or after its first
         column on the title row — "מוזמנים פורת" sits above the name column. */
      let title = "";
      for (let c = cur.first ?? 0; c <= (cur.count ?? 0) + 1 && !title; c++) {
        title = clean(titles?.[c]);
      }
      blocks.push({ name: cur.name, phone: cur.phone, count: cur.count, title });
    }
    cur = {};
  };

  for (let c = 0; c < header.length; c++) {
    const kind = headerKind(header[c]);
    if (!kind) { if (cur.name != null) flush(); continue; }
    /* A second field of the same kind means a new block began without a spacer. */
    if (cur[kind] != null) flush();
    if (cur.first == null) cur.first = c;
    cur[kind] = c;
    if (cur.name != null && cur.phone != null && cur.count != null) flush();
  }
  flush();
  return blocks;
}

export function parseBlockedGuests(buffer: ArrayBuffer | Buffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const guests: ParsedGuest[] = [];
  const blocks: BlockReport[] = [];
  const problems: ParseResult["problems"] = [];

  for (const sheetName of wb.SheetNames) {
    const grid = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], {
      header: 1, defval: "", raw: true,
    });
    if (!grid.length) continue;

    const h = findHeaderRow(grid);
    const found = findBlocks(grid[h] ?? [], grid[h - 1] ?? []);
    if (!found.length) continue;

    for (const b of found) {
      const group = b.title || sheetName;
      let rows = 0, sum = 0;

      for (let r = h + 1; r < grid.length; r++) {
        const name = clean(grid[r]?.[b.name]);
        if (!name) continue;
        rows++;

        const rawPhone = grid[r]?.[b.phone];
        const phone = normalisePhone(rawPhone);
        const n = Number(grid[r]?.[b.count]);
        const count = Number.isFinite(n) && n >= 1 ? Math.min(20, Math.floor(n)) : 1;
        sum += count;

        if (!phone) {
          problems.push({ group, row: r + 1, name, raw: String(rawPhone ?? ""), why: "אין טלפון" });
          continue;
        }
        if (!isPlausiblePhone(phone)) {
          problems.push({
            group, row: r + 1, name, raw: String(rawPhone ?? ""),
            why: `מספר לא תקין (${phone.length} ספרות)`,
          });
          continue;
        }
        guests.push({ name: name.slice(0, 255), phone, guest_count: count, source_group: group });
      }

      blocks.push({
        group,
        columns: { name: colLetter(b.name), phone: colLetter(b.phone), count: colLetter(b.count) },
        rows, guests: sum,
      });
    }
  }

  return {
    guests, blocks, problems,
    totals: {
      records: blocks.reduce((a, b) => a + b.rows, 0),
      guests: blocks.reduce((a, b) => a + b.guests, 0),
    },
  };
}
