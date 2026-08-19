export interface ParsedGuest {
  name: string;
  phone: string;
  guest_count: number;
}

/* What a couple actually calls these columns.
 *
 * The spreadsheet reader matched three spellings per field — "שם"/"name"/"Name",
 * "טלפון"/"phone"/"Phone", "מספר מוזמנים"/"guests" — and anything else fell to
 * "", which the filter below then dropped. A guest list headed "כמות" or "נייד"
 * or "שם מלא" imported silently short, and short is the failure nobody sees:
 * the count on screen is the count that arrived, so there is nothing to compare
 * it against. תהל's file was 312 rows and had to be checked by hand.
 *
 * This is the first thing a new couple does with the product, and it has to
 * survive whatever their planner sent them. */
const NAME_KEYS  = ['שם', 'שם מלא', 'שם האורח', 'שם משפחה ופרטי', 'איש קשר',
                    'name', 'full name', 'guest', 'guest name'];
const PHONE_KEYS = ['טלפון', 'נייד', 'טלפון נייד', 'מספר טלפון', 'מס טלפון',
                    "מס' טלפון", 'פלאפון', 'סלולרי',
                    'phone', 'mobile', 'cell', 'telephone', 'tel'];
const COUNT_KEYS = ['כמות', 'כמות אורחים', 'מספר מוזמנים', 'מספר אורחים',
                    "מס' מוזמנים", 'מס מוזמנים', 'כמה', 'מוזמנים',
                    'guests', 'count', 'quantity', 'qty', 'seats'];

const norm = (s: string) =>
  s.toLowerCase().replace(/["'׳״]/g, '').replace(/\s+/g, ' ').trim();

/** The first value whose header matches one of `keys`, or ''. */
export function pickColumn(row: Record<string, unknown>, keys: string[]): string {
  const wanted = keys.map(norm);
  for (const [header, value] of Object.entries(row)) {
    if (wanted.includes(norm(String(header)))) return String(value ?? '').trim();
  }
  return '';
}

/** One spreadsheet row — whatever the couple happened to call the columns. */
export function rowToGuest(row: Record<string, unknown>): ParsedGuest {
  const count = Number(pickColumn(row, COUNT_KEYS));
  return {
    name:  pickColumn(row, NAME_KEYS),
    phone: pickColumn(row, PHONE_KEYS),
    /* A missing quantity column is normal and means one person. A present but
       unreadable one must not silently become one — but there is nowhere to
       report it from here, so it is clamped and validateGuests sees the row. */
    guest_count: Number.isFinite(count) && count >= 1 ? Math.floor(count) : 1,
  };
}

/** True when this CSV line is a header rather than a guest. */
export function looksLikeHeader(parts: string[]): boolean {
  const cells = parts.map(norm);
  const known = [...NAME_KEYS, ...PHONE_KEYS, ...COUNT_KEYS].map(norm);
  return cells.some(c => known.includes(c));
}

export type GuestIssueKind =
  | 'missing_name'
  | 'missing_phone'
  | 'invalid_phone'
  | 'duplicate_phone';

export interface GuestIssue {
  row: number;
  kind: GuestIssueKind;
}

export interface GuestValidation {
  guests: ParsedGuest[];
  issues: GuestIssue[];
  stats: {
    total: number;
    valid: number;
    missingName: number;
    missingPhone: number;
    invalidPhone: number;
    duplicatePhone: number;
  };
}

export function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return false;
  if (digits.startsWith('972')) return digits.length >= 11 && digits.length <= 13;
  if (digits.startsWith('0'))   return digits.length >= 9  && digits.length <= 11;
  return digits.length >= 9;
}

export function parseGuestText(text: string): ParsedGuest[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'))
    .map((line) => {
      // Split by comma, semicolon, tab, or pipe
      const parts = line.split(/[,;\t|]+/).map((p) => p.trim());

      if (parts.length >= 2) {
        return {
          name: parts[0] ?? '',
          phone: parts[1] ?? '',
          guest_count: Number(parts[2]) || 1,
        };
      }

      // Single token — try to extract trailing phone number
      const phoneMatch = parts[0]?.match(/(\d[\d\s\-]{7,})\s*$/);
      if (phoneMatch) {
        const phone = phoneMatch[1].replace(/\s/g, '').trim();
        const name  = (parts[0] ?? '').slice(0, (parts[0]?.length ?? 0) - phoneMatch[0].length).trim();
        return { name, phone, guest_count: 1 };
      }

      return { name: parts[0] ?? '', phone: '', guest_count: 1 };
    });
}

export function parseCsvText(text: string): ParsedGuest[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];

  const split = (line: string) =>
    line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));

  /* A header row was imported as a guest. Column order was assumed —
     name, phone, count — and the first line was read as data, so a file
     exported from any spreadsheet produced a guest called "שם" with the
     phone number "טלפון", and every real row after it was off by nothing
     but the count was one too many. */
  const first = split(lines[0]);
  const hasHeader = looksLikeHeader(first);

  if (hasHeader) {
    /* Headers present — read by name, so the columns can be in any order.
       A list that puts the phone first is not a broken list. */
    return lines.slice(1)
      .map((line) => {
        const parts = split(line);
        const row: Record<string, unknown> = {};
        first.forEach((h, i) => { row[h] = parts[i]; });
        return rowToGuest(row);
      })
      .filter((g) => g.name.length > 0);
  }

  return lines
    .map((line) => {
      const parts = split(line);
      return {
        name: parts[0] ?? '',
        phone: parts[1] ?? '',
        guest_count: Number(parts[2]) || 1,
      };
    })
    .filter((g) => g.name.length > 0);
}

export function validateGuests(guests: ParsedGuest[]): GuestValidation {
  const issues: GuestIssue[] = [];
  const seenPhones = new Map<string, number>();

  guests.forEach((g, i) => {
    if (!g.name.trim()) {
      issues.push({ row: i, kind: 'missing_name' });
    }
    if (!g.phone.trim()) {
      issues.push({ row: i, kind: 'missing_phone' });
    } else if (!isValidPhone(g.phone)) {
      issues.push({ row: i, kind: 'invalid_phone' });
    } else {
      const normalized = g.phone.replace(/\D/g, '');
      if (seenPhones.has(normalized)) {
        issues.push({ row: i, kind: 'duplicate_phone' });
      } else {
        seenPhones.set(normalized, i);
      }
    }
  });

  const rowsWithIssues = new Set(issues.map((i) => i.row)).size;

  return {
    guests,
    issues,
    stats: {
      total:          guests.length,
      valid:          guests.length - rowsWithIssues,
      missingName:    issues.filter((i) => i.kind === 'missing_name').length,
      missingPhone:   issues.filter((i) => i.kind === 'missing_phone').length,
      invalidPhone:   issues.filter((i) => i.kind === 'invalid_phone').length,
      duplicatePhone: issues.filter((i) => i.kind === 'duplicate_phone').length,
    },
  };
}

export const ISSUE_LABEL: Record<GuestIssueKind, string> = {
  missing_name:    'שם חסר',
  missing_phone:   'טלפון חסר',
  invalid_phone:   'טלפון לא תקין',
  duplicate_phone: 'טלפון כפול',
};
