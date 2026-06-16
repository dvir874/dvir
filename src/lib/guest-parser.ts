export interface ParsedGuest {
  name: string;
  phone: string;
  guest_count: number;
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
  return text
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((line) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
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
