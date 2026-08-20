export const WA_PHONE = "972533318177";
/* Grouped the way an Israeli reads a phone number. It was "053-3318177" here
   while every other surface wrote "053-331-8177", and because most components
   hardcode the digits rather than import this, the site shipped both. */
export const PHONE_DISPLAY = "053-331-8177";
export const PHONE_HREF = "tel:0533318177";
/* TODO(dvir): a personal gmail address on a page that calls itself
   "ניהול חתונה יוקרתי" undercuts the positioning more than any design choice
   on the site.

   This used to say the fix was dvir@regalifnei.co.il. It is not: that domain
   was never registered — it has no DNS record — so the mailbox it named could
   not have been created. Buying a domain is the actual first step, and it is
   the same step that would let the site stop publishing a vercel.app address
   to paying couples. Everything reads this constant, so it stays a one-line
   change once a real address exists. */
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
