"use client";

/**
 * WhyUsWarm — Warm Romantic editorial "why us" section (landing redesign).
 * Based on approved Stitch design "למה רגע לפני - הפקה עורכית" (screen 25ecc75d):
 * asymmetric 12-col bento, integrated photography, one dark olive accent block.
 * Grid uses natural RTL flow (col-span only, no col-start) for robustness.
 */

import Image from "next/image";
import { LayoutGrid, ShieldCheck, Heart, Gift, Camera, MessageCircle } from "lucide-react";

function OliveSprig() {
  return (
    <svg className="mx-auto my-6 w-16 h-8 text-olive" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
      <path d="M4 16 H26" />
      <path d="M38 16 H60" />
      <path d="M32 8 C 28 12, 28 20, 32 24 C 36 20, 36 12, 32 8 Z" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

export default function WhyUsWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-ivory py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">למה רגע לפני</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[56px] font-black leading-tight text-ink">
            לא עוד כלי לאישורי הגעה.
            <span className="block italic font-light text-gold">מערכת שמנהלת את כל החתונה.</span>
          </h2>
          <OliveSprig />
          <p className="font-body text-lg font-light text-ink/55">
            ההבדל בין לחכות לסוף ולבין ליהנות מהדרך — זה רגע לפני
          </p>
        </div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-12 gap-5 lg:gap-6">
          {/* 1 — feature card with dashboard image (7) */}
          <article className="col-span-12 md:col-span-7 rounded-card bg-surface-raised shadow-card overflow-hidden flex flex-col">
            <div className="relative w-full h-52 lg:h-64 bg-cream">
              <Image src="/redesign/whyus-dashboard.webp" alt="לוח הבקרה של רגע לפני" fill className="object-cover" sizes="(max-width:768px) 100vw, 58vw" />
            </div>
            <div className="p-7">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-2">הכל במקום אחד — ממש הכל</h3>
              <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">
                14 כלים שרוב הזוגות מפזרים על פני אקסלים, וואטסאפ ו'קובץ של אמא'. אצלנו הם מערכת אחת שמסונכרנת ומכירה אתכם.
              </p>
            </div>
          </article>

          {/* 2 — שקט נפשי (5) */}
          <article className="col-span-12 md:col-span-5 rounded-card bg-surface-raised shadow-card p-7">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">שקט נפשי אמיתי</h3>
            <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">
              יודעים בדיוק כמה מגיעים, מי יושב איפה, ומה עוד פתוח. מגיעים לאירוע רגועים ונוכחים — לא עסוקים בלוגיסטיקה.
            </p>
          </article>

          {/* 3 — לא עוד כלי (4) */}
          <article className="col-span-12 md:col-span-4 rounded-card bg-surface-raised shadow-card p-7">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink mb-2">לא עוד כלי. שותף לדרך</h3>
            <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">
              רגע לפני לא מוכרת לכם תוכנה. היא מלווה אתכם מהאירוסין, עוברת איתכם כל שלב, ועומדת לצדכם ביום הגדול — ואחריו.
            </p>
          </article>

          {/* 4 — Wedding Mode (dark olive, 8) */}
          <article className="col-span-12 md:col-span-8 rounded-card bg-olive text-white shadow-raised p-8 relative overflow-hidden">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Wedding Mode ביום עצמו</h3>
            <p className="font-body text-[15px] font-light text-white/85 leading-relaxed max-w-xl">
              ביום החתונה המערכת עוברת מצב מיוחד: לוח הזמנים של האירוע, ניווט Waze, ספקים ואנשי קשר — הכל בלחיצה אחת.
            </p>
          </article>

          {/* 5 — מהאירוסין ועד הזיכרון with image (7) */}
          <article className="col-span-12 md:col-span-7 rounded-card bg-surface-raised shadow-card overflow-hidden">
            <div className="relative w-full h-44 bg-cream">
              <Image src="/redesign/whyus-memories.webp" alt="אלבום זיכרונות מהחתונה" fill className="object-cover" sizes="(max-width:768px) 100vw, 58vw" />
            </div>
            <div className="p-7">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-display text-2xl font-bold text-ink mb-2">מהאירוסין ועד הזיכרון</h3>
              <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">
                לא רק לפני האירוע. אחרי היום הגדול, המערכת הופכת לאלבום חיים — עם תמונות וברכות מכל האורחים לנצח.
              </p>
            </div>
          </article>

          {/* 6 — ליווי אישי (5) */}
          <article className="col-span-12 md:col-span-5 rounded-card bg-surface-raised shadow-card p-7 flex flex-col justify-center">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mb-2">ליווי אישי שאחרים לא נותנים</h3>
            <p className="font-body text-[15px] font-light text-ink/60 leading-relaxed">
              דבר זמין בוואטסאפ לכל שאלה. לא בוט, לא מוקד שירות. אדם אחד שמכיר את האירוע שלכם ועוזר מהרגע הראשון.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
