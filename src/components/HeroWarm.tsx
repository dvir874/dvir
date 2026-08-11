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
import { WA_URL, PHONE_DISPLAY } from "@/lib/constants";

function Dot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />;
}

export default function HeroWarm() {
  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-ivory">
      {/* Hand-drawn olive branch — editorial background accent (desktop only).
          The previous three curves never connected to anything and read as a
          stray diagonal crossing the headline rather than as a branch. This is
          the same mark already used on the memory screens: one stem, leaves
          off it, a bud at the tip. */}
      <svg
        className="pointer-events-none absolute top-24 right-10 hidden lg:block w-48 h-48 text-olive opacity-25"
        viewBox="0 0 80 80"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M40 74 C40 74 40 40 40 12" strokeWidth="1.2" />
        <path d="M40 56 C31 51 21 52 15 46" strokeWidth="1" />
        <path d="M40 44 C49 39 59 40 65 34" strokeWidth="1" />
        <path d="M40 32 C33 28 25 29 20 24" strokeWidth="1" />
        <circle cx="15" cy="46" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="65" cy="34" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="20" cy="24" r="1.8" fill="currentColor" stroke="none" />
        <circle cx="40" cy="12" r="2.2" fill="currentColor" stroke="none" />
      </svg>

      <div className="mx-auto flex max-w-[1440px] flex-col-reverse lg:flex-row items-center">
        {/* ── Text column (right in RTL) ── */}
        <div className="w-full lg:w-[42%] px-6 lg:px-12 pb-16 pt-10 lg:py-24 space-y-8">
          {/* The first word on the site used to be "לא". Defining the product
              by what the competition is put the reader in someone else's frame
              before they knew what this was. */}
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
            ניהול חתונות · ליווי אישי
          </p>

          {/* text-7xl on a 42% column could not fit "— במערכת אחת", so it broke
              to "— במערכת" / "אחת" — an em-dash leading a line and a single
              orphaned word. The dash is gone and the last line is sized to the
              column it actually lives in. */}
          <h1 className="font-display text-ink leading-[1.02]">
            <span className="block text-5xl lg:text-6xl font-black">כל החתונה</span>
            <span className="block text-4xl lg:text-5xl font-light italic opacity-80 mr-8 -mt-1">
              שלכם
            </span>
            <span className="block whitespace-nowrap text-5xl lg:text-6xl font-black text-gold mt-2">
              במערכת אחת
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
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-gold px-8 py-4 font-body text-[15px] font-semibold text-ink shadow-raised transition-colors hover:bg-primary-soft"
            >
              <MessageCircle className="w-5 h-5" />
              {/* "קבלו הצעת מחיר תוך 24 שעות" wrapped to two lines inside the
                  pill. The 24-hour promise now sits on the line below, where it
                  has room and is still read before the tap. */}
              קבלו הצעת מחיר
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
            {/* Hours matched to ContactWarm, which said 07:00–22:00 while this
                said "עד 22:00". */}
            <span>{PHONE_DISPLAY} · זמין 07:00–22:00 · מענה תוך 24 שעות</span>
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
            className="object-cover object-[50%_42%] lg:rounded-bl-[100px]"
          />
          {/* Warm gradient for legibility on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-ivory/70 via-transparent to-transparent lg:hidden" />
        </div>
      </div>

      {/* Trust strip — 4 assurances under the hero (matches the reference) */}
      <div className="relative border-t border-gold/15 bg-ivory">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-8 px-6 py-10 lg:grid-cols-4 lg:px-12">
          {[
            /* Was: "שירות פרימיום · יחס אישי לכל אירוע" beside "ליווי אישי ·
               אנחנו פה בשבילכם" — two tiles saying the same nothing. Each one
               now names something the reader can check. */
            { Icon: ShieldCheck, title: "מאובטח ומוצפן", sub: "רשימת האורחים שלכם לא יוצאת מכאן" },
            { Icon: Heart, title: "אדם אחד, לא מוקד", sub: "דביר מלווה אתכם מהיום הראשון" },
            { Icon: Clock, title: "תזכורות אוטומטיות", sub: "המערכת רודפת אחרי האורחים, לא אתם" },
            { Icon: Sparkles, title: "זמינות בוואטסאפ", sub: "תשובה מאדם, לא טופס" },
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
