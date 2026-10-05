"use client";

/** FAQWarm — editorial accordion.
 * Based on approved Stitch "שאלות נפוצות - הפקה עורכית" (screen 2bc34a23).
 * Answers were CEO-approved. */

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

/* The first three are CEO-approved. The rest answer what a couple arriving
   cold from a video asks before leaving a number — price, what happens next,
   guests who do not answer, privacy — and every answer is something the
   product or Dvir already does: the reminders and the named non-recipients
   are PackageWarm/FeatureTabs, "תשלום רק אחרי שהכול מוכן" is how he bills
   (PackageWarm), and the privacy answer is the privacy policy, shortened. */
const QA = [
  {
    q: "האם זה מתאים גם לנו אם אנחנו לא טכנולוגיים?",
    a: "בהחלט. בניתי את רגע לפני כך שיהיה פשוט לכל אחד — וחוץ מזה, אני מגדיר לכם את הכל ומלווה אתכם אישית בכל שלב. אתם רק נהנים מהתוצאה.",
  },
  {
    q: "כמה זמן לוקח להקים הכל?",
    a: "תוך 24 שעות מרגע שדיברנו — המערכת שלכם מוכנה עם דף אירוע, אישורי הגעה והכל מוגדר. אתם רק מאשרים ומתחילים.",
  },
  {
    q: "האם האורחים שלנו צריכים להוריד אפליקציה?",
    a: "לא. האורחים מקבלים קישור פשוט בוואטסאפ, לוחצים ומאשרים הגעה — בלי הורדות, בלי הרשמות, בלי סיבוכים.",
  },
  {
    q: "כמה זה עולה?",
    a: "המחיר נקבע לפי כמות המוזמנים — ומשפחה שלמה על מספר טלפון אחד נספרת פעם אחת. שלחו לדביר תאריך וכמות מוזמנים משוערת, ותקבלו הצעה מדויקת תוך 24 שעות. בלי התחייבות, והתשלום רק אחרי שהכול מוכן.",
  },
  {
    q: "מה קורה אחרי שאני שולח/ת הודעה?",
    a: "דביר עונה לכם בוואטסאפ — אדם, לא בוט — ושואל כמה שאלות קצרות: מתי החתונה, בערך כמה מוזמנים, ומה הכי חשוב לכם. אחר כך מקבלים הצעה מותאמת ודוגמה חיה של מה שהאורחים שלכם יקבלו. אם לא מתאים — לא מתאים, בלי לחץ.",
  },
  {
    q: "איך מעבירים את רשימת המוזמנים?",
    a: "בכל צורה שיש לכם: קובץ אקסל, צילום מסך, רשימה מהטלפון או הודעת וואטסאפ. דביר מסדר את הרשימה ומעלה אותה למערכת — אתם לא צריכים להקליד שום דבר מחדש.",
  },
  {
    q: "מה עם אורחים שלא עונים?",
    a: "מי שלא ענה מקבל עד 3 תזכורות אוטומטיות — ורק הוא, לא מי שכבר אישר. ומי שההודעה לא מגיעה אליו בכלל מזוהה בשמו, כך שאתם יודעים בדיוק את מי להשלים בשיחת טלפון, במקום לרדוף אחרי כולם.",
  },
  {
    q: "מה קורה עם הפרטים של האורחים שלנו?",
    a: "הרשימה משמשת רק לשליחת ההזמנות והתזכורות של האירוע שלכם. אין שימוש בה לפרסום, אין מכירה של נתונים, ובדפים שהאורחים רואים אין עוגיות מעקב ואין כלי פרסום של צד שלישי. הנתונים מוצפנים, ואפשר לבקש את מחיקתם אחרי האירוע.",
  },
  {
    q: "זה מתאים גם לבר/בת מצווה או לאירוע אחר?",
    a: "כן. אותה מערכת עובדת לכל אירוע עם רשימת מוזמנים — חתונה, חינה, בר ובת מצווה, ברית ועוד.",
  },
];

/* FAQPage structured data, from the same array the reader sees — so the two
   can never disagree. */
const FAQ_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: QA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

export default function FAQWarm() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section dir="rtl" className="relative w-full bg-ivory py-16 lg:py-20 px-6 lg:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_LD }} />
      <div className="mx-auto max-w-[760px]">
        <div className="text-center mb-8">
          <p className="font-body text-[13px] font-semibold tracking-[0.04em] text-gold-text">יש שאלות?</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black text-ink">שאלות נפוצות</h2>
          <p className="mt-4 font-body text-lg font-light text-ink/70">
            תשובות לשאלות שזוגות שואלים לפני שמתחילים
          </p>
        </div>

        <div className="space-y-4">
          {QA.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="overflow-hidden rounded-card bg-surface-raised shadow-card">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg font-bold text-ink">{q}</span>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-text">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-6 pb-6 font-body text-[15px] font-normal leading-relaxed text-ink/75">{a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
