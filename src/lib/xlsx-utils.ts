import * as XLSX from 'xlsx';
import type { Guest } from './types';

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
        row['שם'] ?? row['name'] ?? row['Name'] ?? row['שם מלא'] ?? ''
      )).trim();
      const phone = String(
        row['טלפון'] ?? row['phone'] ?? row['Phone'] ?? row['מספר טלפון'] ?? ''
      ).trim();
      const guest_count =
        Number(
          row['מספר מוזמנים'] ??
            row['guests'] ??
            row['guest_count'] ??
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
