import * as XLSX from 'xlsx';
import type { Guest } from './types';
/* With the .ts, the way xlsx-blocks.ts imports phone-validate: node --test
   strips types but does not resolve an extensionless relative import, and
   `npm test` loads this file through iplan-export.test.ts. */
import { parseSeatingSheets, type Grid, type SeatingParse } from './seating-grid.ts';

/* The seating plan, from whichever sheet of the workbook holds it.
 *
 * Read as a grid rather than through sheet_to_json, which the guest importer
 * above uses: that reads ONE header row into object keys, and a seating sheet
 * is three blocks side by side under repeated headers — "שם" four times over,
 * which collapse into a single key and take two thirds of the wedding with
 * them. It also has no header row at all half the time. seating-grid.ts reads
 * the shapes; this only hands it the cells.
 *
 * Every sheet is offered, because the plan arrives as one sheet per family. */
export function parseSeatingFromXlsx(buffer: ArrayBuffer): SeatingParse {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheets = workbook.SheetNames.map((name) => ({
    name,
    /* defval keeps empty cells in place — the column a value sits in is the
       whole meaning of these sheets, and a ragged row shifts a table number
       onto the wrong household. */
    grid: XLSX.utils.sheet_to_json<Grid[number]>(workbook.Sheets[name], {
      header: 1, blankrows: true, defval: null, raw: true,
    }) as Grid,
  }));
  return parseSeatingSheets(sheets);
}

export function parseGuestsFromXlsx(
  buffer: ArrayBuffer
): Array<{ name: string; phone: string; guest_count: number }> {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

  return rows
    .map((row) => {
      const firstName = String(row['שם פרטי'] ?? row['first_name'] ?? '').trim();
      const lastName  = String(row['שם משפחה'] ?? row['last_name'] ?? '').trim();
      const fullFromCols = [firstName, lastName].filter(Boolean).join(' ');
      const name = (fullFromCols || String(
        row['שם'] ?? row['name'] ?? row['Name'] ?? row['שם מלא'] ??
        row['שם האורח'] ?? row['אורח'] ?? row['משפחה'] ?? ''
      )).trim();
      const phone = String(
        row['טלפון'] ?? row['phone'] ?? row['Phone'] ?? row['מספר טלפון'] ??
        row['נייד'] ?? row['טלפון נייד'] ?? row['סלולרי'] ?? row['mobile'] ?? ''
      ).trim();
      /* "כמות" is the commonest Hebrew heading of all and was not among these,
         so a list using it silently gave every household one seat — a caterer's
         number wrong for the entire wedding, with nothing anywhere to say so.
         A guest list is somebody else's spreadsheet; the reader has to meet it
         where it is. */
      const guest_count =
        Number(
          row['כמות'] ??
            row['כמות מוזמנים'] ??
            row['כמות אנשים'] ??
            row['מספר מוזמנים'] ??
            row['מספר אנשים'] ??
            row['מגיעים'] ??
            row['מספר מגיעים'] ??
            row['נפשות'] ??
            row['guests'] ??
            row['guest_count'] ??
            row['count'] ??
            row['qty'] ??
            row['מספר'] ??
            1
        ) || 1;
      return { name, phone, guest_count };
    })
    .filter((g) => g.name.length > 0);
}

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'אישר הגעה',
  declined: 'לא מגיע',
  pending: 'ממתין',
};

const MEAL_LABEL: Record<string, string> = {
  regular: 'רגיל',
  vegetarian: 'צמחוני',
  vegan: 'טבעוני',
  mehadrin: 'כשר מהדרין',
  kids: 'מנת ילדים',
};

function formatMealCounts(counts: unknown): string {
  if (!counts || typeof counts !== 'object') return '';
  return Object.entries(counts as Record<string, number>)
    .filter(([, n]) => typeof n === 'number' && n > 0)
    .map(([k, n]) => `${MEAL_LABEL[k] ?? k}: ${n}`)
    .join(' · ');
}

export function generateGuestsXlsx(guests: Guest[]): Buffer {
  const data = guests.map((g) => ({
    'שם': g.name,
    'טלפון': g.phone,
    'סטטוס': STATUS_LABEL[g.status] ?? g.status,
    'קבוצה': (g as Guest & { source_group?: string | null }).source_group ?? '',
    'רק חופה': (g as Guest & { chuppah_only?: boolean | null }).chuppah_only ? 'כן' : '',
    'מספר מגיעים': g.guest_count,
    'העדפת מנה': g.meal_preference ? (MEAL_LABEL[g.meal_preference] ?? g.meal_preference) : '',
    'פירוט מנות': formatMealCounts((g as Guest & { meal_counts?: unknown }).meal_counts),
    'הערת מנה': g.meal_note ?? '',
    'זמן תגובה': g.response_time
      ? new Date(g.response_time).toLocaleString('he-IL')
      : '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'מוזמנים');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}


/* The seating file iplan will accept, and only that shape.
 *
 * Dvir asked for this export five times in one week and every one of them was
 * a script run by hand, because iplan does not take the generic sheet above.
 * It wants a legacy .xls — BIFF8, not xlsx — with the sheet named הזמנות, two
 * header rows rather than one, and its own column titles. Each of those was
 * guessed wrong at least once before he sent the real template on 24/08:
 * "אורחים" instead of "הזמנות", "הזמנה עבור" instead of "הזמנה לכבוד", and a
 * single header row, which silently shifted every guest up by one and lost the
 * first of them.
 *
 * Row 0 is the merged banner iplan draws over the column groups. It carries no
 * data and iplan does not read it, but the file is rejected without it.
 *
 * Confirmed guests only. Seating a table for someone who has not answered — or
 * said no — is the one mistake this file can make that costs money, because
 * the chair and the meal are both ordered from it. */
export function generateIplanXls(
  guests: Guest[],
  opts: { coupleSideLabel?: (g: Guest) => string } = {},
): Buffer {
  const side = opts.coupleSideLabel ?? ((g: Guest) => {
    const s = (g as Guest & { side?: string | null }).side;
    return s === "groom" ? "חתן" : s === "bride" ? "כלה" : "";
  });

  const rows: (string | number)[][] = [
    ["", "", "שיוך", "", "פרטי התקשרות", "", "", "כתובת", "", "", "", ""],
    ["הזמנה לכבוד", "מס' אורחים שהוזמנו", "צד", "קבוצה", "סלולרי",
     "טלפון רגיל", "אימייל", "עיר", "רחוב", "מיקוד", "תא דואר", "צ'ק צפוי"],
  ];

  for (const g of guests) {
    if (g.status !== "confirmed") continue;
    rows.push([
      String(g.name ?? "").trim(),
      Math.max(1, Number(g.guest_count) || 1),
      side(g),
      (g as Guest & { source_group?: string | null }).source_group ?? "",
      String(g.phone ?? "").trim(),
      "", "", "", "", "", "", "",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "הזמנות");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "biff8" }));
}
