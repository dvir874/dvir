/* Canonical handling of Israeli phone numbers.

   One guest was imported twice — once as 0534793515 and once as 972534793515 —
   and received two invitations with two different personal links. The import
   only stripped non-digits, so the same person in two spreadsheet formats
   became two people.

   The rule from here on: the database always stores the LOCAL form (05X…,
   0X…). E.164 exists only at the moment we hand a number to Meta. */

export interface PhoneCheck {
  /** Canonical local form for storage, or null when unusable */
  local: string | null;
  /** Digits-only international form for the WhatsApp API */
  e164: string | null;
  valid: boolean;
  reason?: string;
}

/* Israeli mobile prefixes plus the landline area codes, without the leading 0 */
const MOBILE = ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];
const LANDLINE = ["2", "3", "4", "8", "9", "72", "73", "74", "76", "77", "78"];

export function checkPhone(raw: string | null | undefined): PhoneCheck {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return { local: null, e164: null, valid: false, reason: "אין מספר" };

  /* Normalise every shape we have actually seen in client spreadsheets:
     0501234567 · 501234567 · 972501234567 · 00972501234567 · +972-50-123-4567 */
  let national = digits;
  if (national.startsWith("00972")) national = national.slice(5);
  else if (national.startsWith("972")) national = national.slice(3);
  else if (national.startsWith("0")) national = national.slice(1);

  const mobile = MOBILE.some(p => national.startsWith(p)) && national.length === 9;
  const landline = LANDLINE.some(p => national.startsWith(p))
    && (national.length === 8 || national.length === 9);

  if (!mobile && !landline) {
    return {
      local: null, e164: null, valid: false,
      reason: national.length < 8 ? "מספר קצר מדי"
            : national.length > 9 ? "מספר ארוך מדי"
            : "קידומת לא מוכרת",
    };
  }

  return { local: "0" + national, e164: "972" + national, valid: true };
}

/** Storage form. Returns null rather than guessing when the number is unusable. */
export const toLocalPhone = (raw: string | null | undefined): string | null =>
  checkPhone(raw).local;

/** WhatsApp API form. */
export const toE164Phone = (raw: string | null | undefined): string | null =>
  checkPhone(raw).e164;

/** True when two numbers are the same person, whatever format each is in. */
export const samePhone = (a: string | null | undefined, b: string | null | undefined): boolean => {
  const x = checkPhone(a).local, y = checkPhone(b).local;
  return !!x && x === y;
};
