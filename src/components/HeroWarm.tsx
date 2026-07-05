"use client";

/**
 * HeroWarm — Warm Romantic editorial hero (landing redesign).
 * Pixel-accurate reproduction of the approved Stitch design
 * "וריאציה אדיטוריאלית: שער מגזין" (screen d8884d63).
 * Replaces the legacy <Hero/> on the redesign branch. Old Hero.tsx
 * is kept intact for rollback.
 */

import Image from "next/image";
import { MessageCircle, Phone, Users, CheckCircle2, Clock, Gauge } from "lucide-react";
import { WA_URL } from "@/lib/constants";

const KPIS = [
  { label: "מוזמנים", value: "287", Icon: Users, bar: "" },
  { label: "אישרו", value: "214", Icon: CheckCircle2, bar: "bg-olive" },
  { label: "ממתינים", value: "41", Icon: Clock, bar: "bg-gold" },
  { label: "אחוז מענה", value: "75%", Icon: Gauge, bar: "bg-gold" },
];

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
            <span>מענה מהיר</span>
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
              ראו דמו חי ✨
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
            src="/redesign/hero-couple.webp"
            alt="זוג חוגג חתונה, מתחת לעץ זית בשקיעה"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover lg:rounded-bl-[100px]"
          />
          {/* Warm gradient for legibility on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-ivory/85 via-ivory/10 to-transparent lg:hidden" />

          {/* Floating glass dashboard panel */}
          <div className="absolute -bottom-10 lg:bottom-16 right-4 lg:-right-12 w-[92%] lg:w-[440px] rounded-[24px] border border-cream bg-white/90 p-6 shadow-modal backdrop-blur-md">
            {/* Countdown header */}
            <div className="flex items-start justify-between border-b border-cream pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">חתונת נועה ואורי</h3>
                <p className="mt-1 font-body text-[11px] uppercase tracking-wider text-ink/50">
                  זמן נותר
                </p>
              </div>
              <div
                className="font-display text-3xl font-black tracking-tight text-gold"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                109<span className="text-xl text-ink/40">:</span>06
                <span className="text-xl text-ink/40">:</span>39
                <span className="text-xl text-ink/40">:</span>22
              </div>
            </div>

            {/* KPI bento grid */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {KPIS.map(({ label, value, Icon, bar }) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-xl bg-ivory/70 p-4 shadow-card"
                >
                  {bar && <span className={`absolute right-0 top-0 h-full w-1.5 ${bar}`} />}
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${bar === "bg-gold" ? "text-gold" : "text-olive"}`} />
                    <span className="font-body text-[11px] uppercase text-ink/50">{label}</span>
                  </div>
                  <div className="font-display text-2xl font-bold text-ink">{value}</div>
                </div>
              ))}
            </div>

            {/* Footer status */}
            <div className="mt-4 flex items-center justify-between font-body text-[11px] text-ink/50">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-cream">
                  <div className="h-full w-3/4 bg-olive" />
                </div>
                <span>75%</span>
              </div>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                17 תזכורות נשלחו
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
