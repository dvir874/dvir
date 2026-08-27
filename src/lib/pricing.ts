/* Single source of truth for service pricing.
   Used by /quote (price quotes) and /pricing (public calculator). */

/* 249 ולא 180 — ראה ai-os/PRICING-RESEARCH.md, שבו נמדדו ארבעה מחירונים
   מפורסמים ב-23/08/2026.
   
   180₪ היה נמוך ב-34% מהמתחרה האוטומטי הישיר (DigiNet, ~272₪ ל-262 אורחים)
   וזול פי שלושה מהשוק שבו רגע לפני באמת פועלת. להיות הזול בשוק בלי מותג אינו
   יתרון — הוא איתות שמשהו חסר. 249₪ עדיין מתחת ל-DigiNet. */
export const BASE_PRICE = 249;

/* אותו יחס הנחה שהיה (449 מתוך 740 = 60.7%), על הסכום החדש: 249 + 560 = 809. */
export const FULL_PACKAGE_PRICE = 499;
export const DEPOSIT_AMOUNT = 100;

/* המדרגה שבה המוצר באמת נמצא, וטרם מוצגת בשום מסך.
 *
 * מה שדביר עושה בכל אירוע — מקליד את פרטי האירוע, מייבא ומתקן את הרשימה, עונה
 * אישית לכל שאלה חופשית של אורח, ושולח ידנית ל-29 שמטא מסרבת אליהם — הוא בדיוק
 * מה ש"ראש שקט" של DigiNet (500–600₪) ו"מגיעים או לא" (655₪) גובים עליו.
 *
 * הקבוע יושב כאן כדי שהמספר יהיה במקום אחד כשיוצג, ולא מוצג עדיין: כרטיס מדרגה
 * חדש בדף התמחור הוא אלמנט עיצובי, ו-CLAUDE.md אוסר להמציא עיצוב. */
export const MANAGED_PRICE = 549;

/* Price by size, because until now there was none.
 *
 * BASE_PRICE was one number for every wedding, so /pricing quoted 249₪ to a
 * 500-guest event and to a 100-guest one alike. Every client so far has been
 * 260–370 guests and the gap never showed; the first 500-guest enquiry — a
 * friend of Dvir's, 15/12 — would have read 249₪ off the site before he
 * answered.
 *
 * The tiers sit where the market sits, measured 26/08 from published price
 * lists. At 500 records DigiNet charges ₪519 for automated WhatsApp with no
 * human in it, and ₪1,049 for the same plus three rounds of phone calls;
 * מגיעים או לא charges ₪2 a guest with a call centre and publishes nothing
 * above 450. רגע לפני is above the first and below the second, and the
 * managed numbers say so.
 *
 * A record is a phone number, not a person: one invitation to a couple is one
 * record, which is how every competitor counts and how the sender bills. */
export interface SizeTier {
  /** Inclusive upper bound on records. */
  upTo: number;
  label: string;
  /** Self-serve: they upload, the system sends, nobody's hours are spent. */
  base: number;
  /** Dvir in it — setup, list repair, guest questions, the numbers Meta refuses. */
  managed: number;
}

export const SIZE_TIERS: SizeTier[] = [
  { upTo: 250, label: "עד 250 מוזמנים", base: BASE_PRICE, managed: MANAGED_PRICE },
  { upTo: 400, label: "251–400",        base: 399,        managed: 649 },
  { upTo: 600, label: "401–600",        base: 549,        managed: 750 },
];

/** The tier a guest count falls into. Above the largest tier is a quote, not a
    price — 600+ is a different conversation and pretending otherwise is how
    the single-number mistake happened in the first place. */
export function tierFor(records: number): SizeTier | null {
  return SIZE_TIERS.find(t => records <= t.upTo) ?? null;
}

export interface Addon {
  label: string;
  price: number;          // 0 = free
  physical?: boolean;     // on-site service — excluded from the digital full package
}

export const ADDONS: Record<string, Addon> = {
  invite:   { label: "עיצוב הזמנה אישית (קובץ להדפסה)",                    price: 150 },
  savedate: { label: "הודעת Save the Date מעוצבת (3-4 חודשים לפני)",       price: 60 },
  seating:  { label: "סידור הושבה + שליחת מספרי שולחן לאורחים",            price: 100 },
  minisite: { label: "דף אירוע אישי (ניווט, לו״ז, קוד לבוש)",              price: 0 },
  gallery:  { label: "גלריית אורחים + קיר ברכות",                          price: 80 },
  planning: { label: "חבילת תכנון — תקציב, ספקים, צ'קליסט",                price: 0 },
  daymsg:   { label: "הודעות \"מחר החתונה\" + תודה לאורחים",               price: 50 },
  hina:     { label: "אירוע חינה נוסף — אישורי הגעה מלאים לאותם מוזמנים",  price: 120 },
  checkin:  { label: "עמדת קבלה ביום החתונה — דביר מגיע לאולם, מקבל את האורחים ומכוון לשולחנות", price: 800, physical: true },
};

export const BASE_LABEL = "אישורי הגעה דיגיטליים — עד 2 הודעות וואטסאפ, מעקב בזמן אמת";

export function digitalAddonEntries() {
  return Object.entries(ADDONS).filter(([, a]) => !a.physical);
}
