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

/* ── Per record, which is what is actually billed ──────────────────────── */

/* The old model above prices by "guests" and asks the couple how many they
 * have. Every number in this system is a RECORD — one phone number, which may
 * carry a family of six — and a record is what the sender spends, what Meta's
 * 250-a-day ceiling counts, and what appears on the bill. Asking for guests and
 * charging for records meant translating in his head on every call.
 *
 * Kept beside the old constants rather than replacing them: /pricing and /quote
 * are live and read those, and a couple mid-decision must not see the page
 * change under them.
 *
 * The three numbers are measured, not chosen:
 *
 *   Message cost per record        0.188₪ basic · 0.319₪ with the rides group
 *   Guests still silent after all
 *   three reminders                33%  (922 records: שחר 22%, תהל 34%,
 *                                        לאל וטל 44%)
 *
 * BASIC at 1₪ sits just under DigiNet's automated tier (₪519 for 500 records,
 * 1.04₪ each) with no human in it at all. FULL at 2₪ is exactly what
 * "מגיעים או לא" charges — except theirs is a call centre and this is Dvir on
 * the phone, which is the thing being sold.
 *
 * And it is close to what he already charges without a model: אמיר landed on
 * 0.98₪ a record, שחר on 0.78₪, שלמה on 1.28₪. */

/** Automated end to end: invitation, three reminders, day-before, thank-you + gallery. */
export const PER_RECORD_BASIC = 1;

/** Everything in BASIC, plus Dvir calling every guest still silent after the
    reminders — about a third of the list. */
export const PER_RECORD_FULL = 2;

/** He opens a WhatsApp group and sends every record a rides message of its own.
    The message alone is 0.131₪ a record; the rest is running the group. */
export const PER_RECORD_RIDES = 0.5;

/** Setup costs the same whether the list is 90 records or 250, so below this
    the per-record price stops describing the work. Quoted out loud with the
    rate — a couple told "1₪ a record" who receives a bill for 290 is right to
    feel misled. */
export const MIN_CHARGE_BASIC = 290;
export const MIN_CHARGE_FULL  = 490;
export const MIN_CHARGE_RIDES = 100;

/** Share of records still unanswered once every reminder has been sent — the
    call list the FULL package exists to work through. */
export const SILENT_SHARE = 0.33;

export type PackageId = "basic" | "full";

export interface Quote {
  records: number;
  pkg: PackageId;
  rides: boolean;
  /** What each line contributes, before the minimum is applied. */
  lines: { label: string; amount: number }[];
  /** True when the minimum, rather than the rate, set the price. */
  atMinimum: boolean;
  total: number;
  /** Roughly how many guests he will have to phone. FULL only. */
  calls: number;
}

export function quoteFor(records: number, pkg: PackageId, rides = false): Quote {
  const n = Math.max(0, Math.floor(records) || 0);
  const rate = pkg === "full" ? PER_RECORD_FULL : PER_RECORD_BASIC;
  const floor = pkg === "full" ? MIN_CHARGE_FULL : MIN_CHARGE_BASIC;

  const base = Math.max(floor, n * rate);
  const lines = [{
    label: pkg === "full" ? "אישורי הגעה + ליווי אישי" : "אישורי הגעה דיגיטליים",
    amount: base,
  }];

  if (rides) {
    lines.push({
      label: "קבוצת טרמפים",
      amount: Math.max(MIN_CHARGE_RIDES, n * PER_RECORD_RIDES),
    });
  }

  return {
    records: n, pkg, rides, lines,
    atMinimum: n * rate < floor,
    total: lines.reduce((s, l) => s + l.amount, 0),
    calls: pkg === "full" ? Math.round(n * SILENT_SHARE) : 0,
  };
}

/** What the messages cost us for this quote — internal, never shown to a couple. */
export function costFor(records: number, rides = false): number {
  const n = Math.max(0, Math.floor(records) || 0);
  return n * (rides ? 0.319 : 0.188);
}

/* ── from what a couple says to what we actually bill ─────────────────────── */

/**
 * People per phone number, measured on the three weddings that have a list.
 *
 *   שחר      225 records → 421 people   1.87
 *   לאל וטל  146 records → 301 people   2.06
 *   תהל      182 records → 302 people   1.66
 *
 * A household gets one message, not one per person: "משפחת ביטון" is a single
 * record and ten people at the wedding.
 */
export const PEOPLE_PER_RECORD = 1.86;

/**
 * A couple answering "כמה מוזמנים?" is counting people, and this system bills
 * phone numbers.
 *
 * אמיר said "כ־430 מוזמנים" on 31/08 and was quoted 420 ₪ — the price of 430
 * records, which is an eight-hundred-person wedding. His actual list is around
 * 230 numbers and his actual price is the 290 ₪ floor. He answered "לצערי זה
 * יקר לי מידי", and he was right: he had been quoted roughly double.
 *
 * An estimate and only that. It is the opening number, to be replaced the
 * moment the real list arrives and can be counted.
 */
export function recordsFromGuests(people: number): number {
  const n = Math.max(0, Math.floor(people) || 0);
  return Math.round(n / PEOPLE_PER_RECORD);
}
