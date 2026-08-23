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
