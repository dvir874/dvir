export const WA_PHONE = "972533318177";
export const PHONE_DISPLAY = "053-3318177";
export const PHONE_HREF = "tel:0533318177";
export const EMAIL = "dvir874@gmail.com";

function waUrl(source: string, message?: string) {
  const text = message ?? `שלום דביר, הגעתי דרך אתר רגע לפני (${source}) ואני מעוניין לשמוע פרטים.`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}

// CTA-specific WhatsApp links — so you know in WhatsApp where each lead came from
export const WA_URL         = waUrl("hero",       "שלום דביר, הגעתי מה-Hero באתר רגע לפני — אשמח לשמוע פרטים.");
export const WA_URL_DEMO    = waUrl("demo-cta",   "שלום דביר, ראיתי את ההדגמה ורוצה לשמוע עוד.");
export const WA_URL_PRICING = waUrl("pricing",    "שלום דביר, ראיתי את החבילות — אשמח לשמוע פרטים.");
export const WA_URL_FAQ     = waUrl("faq",        "שלום דביר, יש לי שאלה לגבי ניהול החתונה.");
export const WA_URL_STRIP   = waUrl("cta-strip",  "שלום דביר, ראיתי את האתר ואשמח להתחיל.");
export const WA_URL_FOOTER  = waUrl("footer",     "שלום דביר, הגעתי מהאתר רגע לפני — אשמח לשמוע פרטים.");
export const WA_URL_BUTTON  = waUrl("wa-button",  "שלום דביר, הגעתי מהאתר רגע לפני.");
