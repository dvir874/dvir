"use client";

/** FAQWarm — editorial accordion.
 * Based on approved Stitch "שאלות נפוצות - הפקה עורכית" (screen 2bc34a23).
 * Answers were CEO-approved. */

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

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
];

export default function FAQWarm() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section dir="rtl" className="relative w-full bg-ivory py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[760px]">
        <div className="text-center mb-12">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">יש שאלות?</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black text-ink">שאלות נפוצות</h2>
          <p className="mt-4 font-body text-lg font-light text-ink/55">
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
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-6 pb-6 font-body text-[15px] font-light leading-relaxed text-ink/65">{a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
