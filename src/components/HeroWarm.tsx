"use client";

/**
 * HeroWarm — Warm Romantic editorial hero (landing redesign).
 * Pixel-accurate reproduction of the approved Stitch design
 * "וריאציה אדיטוריאלית: שער מגזין" (screen d8884d63).
 * Replaces the legacy <Hero/> on the redesign branch. Old Hero.tsx
 * is kept intact for rollback.
 */

import Image from "next/image";
import { MessageCircle, Phone, ShieldCheck, Sparkles, Clock, Heart } from "lucide-react";
import { WA_URL } from "@/lib/constants";

function Dot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />;
}

export default function HeroWarm() {
  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-ivory">
      {/* Hand-drawn olive branch — editorial background accent (desktop only) */}
      <svg
        className="pointer-events-none absolute top-24 right-10 hidden lg:block w-64 h-64 text-olive opacity-20"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        aria-hidden
      >
        <path d="M10 90 Q 40 50, 90 10" />
        <path d="M40 65 Q 50 40, 70 30" />
        <path d="M20 75 Q 35 60, 50 45" />
      </svg>

      <div className="mx-auto flex max-w-[1440px] flex-col-reverse lg:flex-row items-center">
        {/* ── Text column (right in RTL) ── */}
        <div className="w-full lg:w-[42%] px-6 lg:px-12 pb-16 pt-10 lg:py-24 space-y-8">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
            לא עוד כלי לאישורי הגעה
          </p>

          <h1 className="font-display text-ink leading-[1.02]">
            <span className="block text-5xl lg:text-6xl font-black">כל החתונה</span>
            <span className="block text-4xl lg:text-5xl font-light italic opacity-80 mr-8 -mt-1">
              שלכם
            </span>
            <span className="block text-5xl lg:text-7xl font-black text-gold mt-2">
              — במערכת אחת
            </span>
          </h1>

          <p className="max-w-md font-body text-lg font-light text-ink/60">
            מהרגע שהתארסתם ועד הרבה אחרי האירוע. לא עוד אקסלים וקבוצות וואטסאפ — מערכת שמלווה אתכם לאורך כל הדרך.
          </p>

          {/* Trust bar */}
          <div className="flex items-center gap-3 border-r-2 border-gold pr-4 font-body text-sm font-medium text-ink/60">
            <span>ללא התחייבות</span>
            <Dot />
            <span>שירות אישי</span>
            <Dot />
            <span>תמיכה מלאה</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={WA_URL}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-gold px-8 py-4 font-body text-[15px] font-semibold text-ink shadow-raised transition-colors hover:bg-primary-soft"
            >
              <MessageCircle className="w-5 h-5" />
              קבלו הצעת מחיר תוך 24 שעות
            </a>
            <a
              href="/try"
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-gold px-8 py-4 font-body text-[15px] font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              ראו איך זה עובד ✨
            </a>
          </div>

          {/* Phone line */}
          <div className="flex items-center gap-2 pt-2 font-body text-sm text-ink/60">
            <Phone className="w-4 h-4 text-gold" />
            <span>053-3318177 · דביר, זמין עד 22:00</span>
          </div>
        </div>

        {/* ── Image column (left in RTL) ── */}
        <div className="relative w-full lg:w-[58%] h-[58vh] lg:h-[92vh]">
          <Image
            src="/redesign/hero-couple-chuppah.webp"
            alt="זוג נשוי מתחת לחופה עם וילון וזר כלה, שעת שקיעה"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover object-center lg:rounded-bl-[100px]"
          />
          {/* Warm gradient for legibility on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-ivory/70 via-transparent to-transparent lg:hidden" />
        </div>
      </div>

      {/* Trust strip — 4 assurances under the hero (matches the reference) */}
      <div className="relative border-t border-gold/15 bg-ivory">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-8 px-6 py-10 lg:grid-cols-4 lg:px-12">
          {[
            { Icon: ShieldCheck, title: "מאובטח ומוצפן", sub: "המידע שלכם בטוח" },
            { Icon: Sparkles, title: "שירות פרימיום", sub: "יחס אישי לכל אירוע" },
            { Icon: Clock, title: "חיסכון בזמן", sub: "כלי שעובד בשבילכם" },
            { Icon: Heart, title: "ליווי אישי", sub: "אנחנו פה בשבילכם" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 px-2">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-body text-sm font-semibold text-ink">{title}</div>
                <div className="font-body text-[13px] font-light text-ink/50">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
