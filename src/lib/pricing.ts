/* Single source of truth for service pricing.
   Used by /quote (price quotes) and /pricing (public calculator). */

export const BASE_PRICE = 180;
export const FULL_PACKAGE_PRICE = 449;
export const DEPOSIT_AMOUNT = 100;

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
  checkin:  { label: "עמדת קבלה ביום החתונה — דביר מגיע לאולם, מקבל את האורחים ומכוון לשולחנות", price: 800, physical: true },
};

export const BASE_LABEL = "אישורי הגעה דיגיטליים — עד 2 הודעות וואטסאפ, מעקב בזמן אמת";

export function digitalAddonEntries() {
  return Object.entries(ADDONS).filter(([, a]) => !a.physical);
}
