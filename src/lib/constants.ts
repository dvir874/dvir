export const WA_PHONE = "972533318177";
export const PHONE_DISPLAY = "053-3318177";
export const PHONE_HREF = "tel:0533318177";
export const EMAIL = "dvir874@gmail.com";

function waUrl(source: string, message?: string) {
  const text = message ?? `שלום דביר, הגעתי דרך אתר רגע לפני (${source}) ואני מעוניין לשמוע פרטים.`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}

// CTA-specific WhatsApp links — so you know in WhatsApp where each lead came from
export const WA_URL         = waUrl("hero",       "שלום דביר, הגעתי מהאתר רגע לפני ואני מעוניין/ת בהצעת מחיר לניהול החתונה שלי.");
export const WA_URL_DEMO    = waUrl("demo-cta",   "שלום דביר, ראיתי את האתר של רגע לפני — אשמח לקבל הצעת מחיר מותאמת לאירוע שלי.");
export const WA_URL_PRICING = waUrl("pricing",    "שלום דביר, ראיתי את עמוד המחירים — אשמח לקבל הצעה מותאמת לאירוע שלי.");
export const WA_URL_FAQ     = waUrl("faq",        "שלום דביר, קראתי את השאלות הנפוצות ויש לי שאלה נוספת לגבי ניהול החתונה.");
export const WA_URL_STRIP   = waUrl("cta-strip",  "שלום דביר, ראיתי את האתר רגע לפני — אשמח לשמוע על אפשרויות ומחירים.");
export const WA_URL_FOOTER  = waUrl("footer",     "שלום דביר, הגעתי מהאתר רגע לפני — אשמח לקבל הצעת מחיר.");
export const WA_URL_BUTTON  = waUrl("wa-button",  "שלום דביר, הגעתי מהאתר רגע לפני ואני מעוניין/ת לשמוע עוד.");
