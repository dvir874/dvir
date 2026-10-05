"use client";

/**
 * HeroWarm — the approved Stitch hero.
 *
 * Project "Rega Lifney Hebrew Wedding Hero", screen
 * 659efb269d144a65b8d986d13f1cabcf, approved 14/09/2026. Reproduced to the
 * spec's own numbers rather than to something similar.
 *
 * What the design fixes, all of it measured on the live site first:
 *
 *  · NOTHING WAS TAPPABLE ABOVE THE FOLD, on a 25,807px page. The image is
 *    capped at 190px and the primary button is a 54px pill inside the 553px
 *    a 375×667 phone actually shows, so the first screen now ends in an
 *    action instead of in the middle of a paragraph.
 *
 *  · THE HEADLINE WAS CUT MID-PHRASE. "כל החתונה / שלכם / במערכת אחת" ran to
 *    0.58H + 232, which cleared the fold on none of the iPhones projected, so
 *    the couple read "כל החתונה שלכם" — a bare noun phrase with no predicate,
 *    asserting nothing. Two lines now, and both are on the first screen.
 *
 *  · "שלכם" WAS SET IN ITALIC. Frank Ruhl Libre ships no italic axis, so the
 *    browser sheared it; Hebrew has no italic tradition and the high-contrast
 *    strokes break rather than lean. The softer voice now comes from weight
 *    and colour, which is what the design asks for.
 *
 *  · GOLD CARRIED TEXT AT 2.26:1. #C5A46D is an object colour — 89 uses on
 *    this page alone were reading text. The eyebrow and the button label take
 *    gold-text #8B6914 (4.88:1), the heading accent takes gold-large #A07840
 *    (3.84:1, which clears the large-text bar), and #C5A46D is left to fills.
 *    The primary button is ink on gold at 7.9:1, not white on gold at 2.37:1.
 *
 *  · THE EYEBROW WAS TRACKED 0.22em AND UPPERCASED. Both are Latin
 *    conventions: `uppercase` is a no-op on Hebrew and that much tracking
 *    breaks the word shape. 0.04em, per the spec.
 *
 * Everything the fold budget could not hold — the secondary CTA, the phone
 * line, the trust dots — moves to the cream band directly beneath, which is
 * where the design puts it.
 */

import Image from "next/image";
import { MessageCircle, Phone, ShieldCheck, Sparkles, Clock, Heart } from "lucide-react";
import { WA_URL, PHONE_DISPLAY } from "@/lib/constants";

const EYEBROW = "ניהול חתונות · ליווי אישי";
const DEK = "מהרגע שהתארסתם ועד הרבה אחרי האירוע — מערכת אחת במקום אקסלים וקבוצות וואטסאפ.";
const IMG_ALT = "זוג מאורס עומד יחד באור שקיעה, הכלה בשמלה צנועה עם שרוולים ארוכים";

function Dot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />;
}

/* The real product, playing. Stitch b5ad0cb5 ("Hero מעודכן עם סמארטפון צף
   ומערכת חיה"), approved 05/10/2026 — only the phone is taken from it: that
   render also swapped the locked couple photograph and invented a "דביר כהן"
   card, and neither belongs here. The video is a screen recording of the
   demo wedding's dashboard (public/media), so the caption says so. */
function LivePhone({ className }: { className: string }) {
  return (
    <div className={className}>
      <div className="rounded-[44px] bg-[#1A1A1C] p-2.5 shadow-[0_30px_70px_rgba(28,16,8,0.35)] ring-1 ring-black/40">
        <div className="relative overflow-hidden rounded-[36px] bg-ivory">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" aria-hidden />
          <video
            className="block aspect-[390/844] w-full object-cover"
            src="/media/dashboard-demo.mp4"
            poster="/media/dashboard-demo-poster.png"
            autoPlay muted loop playsInline preload="metadata"
            aria-label="הקלטת מסך של לוח הבקרה של הזוג, בחתונת דוגמה"
          />
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 font-body text-[11px] font-semibold text-ivory">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9FD3A8]" /> המערכת האמיתית · חתונת דוגמה
        </span>
      </div>
    </div>
  );
}

/** The headline, identical on both layouts and sized by the caller. */
function Headline({ className }: { className: string }) {
  return (
    <h1 className={className}>
      <span className="block">כל החתונה שלכם</span>
      <span className="block font-black text-gold-large">במערכת אחת</span>
    </h1>
  );
}

export default function HeroWarm() {
  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-ivory">
      {/* Hand-drawn olive branch — editorial accent, desktop only. One stem,
          leaves off it, a bud at the tip; the same mark as the memory screens. */}
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

      {/* ── Mobile: the whole argument inside 553px ───────────────────────── */}
      <div className="lg:hidden">
        <div className="px-4 pt-[84px]">
          <div className="relative h-[190px] w-full overflow-hidden rounded-2xl border border-[#E9DFCF] bg-cream shadow-sm">
            <Image
              src="/redesign/hero-couple-chuppah.webp"
              alt={IMG_ALT}
              fill
              priority
              sizes="100vw"
              className="rl-drift object-cover object-[50%_42%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            {/* The one claim no competitor on mit4mit can make in the same
                breath as a product this size: a person, named. */}
            <div className="absolute bottom-2 right-2.5 rounded bg-ivory/90 px-2 py-0.5 font-body text-[10px] font-medium text-ink backdrop-blur-sm">
              דביר מלווה אישית
            </div>
          </div>
        </div>

        <div className="px-4 pt-6 text-right">
          <p className="rl-rise rl-d1 font-body text-[13px] font-semibold leading-none tracking-[0.04em] text-gold-text">
            {EYEBROW}
          </p>

          <Headline className="rl-rise rl-d2 mt-1.5 font-display text-[27px] font-black leading-[1.18] text-ink" />

          <p className="rl-rise rl-d3 mt-4 font-body text-[17px] font-normal leading-[1.38] text-ink/80">
            {DEK}
          </p>

          {/* The fold ends here, and it ends on something you can press. */}
          <a
            href={WA_URL}
            className="rl-breathe mt-5 flex h-[54px] w-full items-center justify-center gap-2 rounded-pill bg-gold font-body text-[17px] font-bold text-ink transition-colors hover:bg-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <MessageCircle className="h-5 w-5" />
            קבלו הצעת מחיר
          </a>
          <p className="mt-2.5 text-center font-body text-[13px] font-medium leading-tight text-gold-text">
            מענה מדביר תוך 24 שעות · ללא התחייבות
          </p>
        </div>

        {/* Below the fold by design — everything the 553px budget could not
            hold, in the band the spec puts it in. */}
        <div className="mt-6 space-y-6 border-t border-[#EAE1D3] bg-cream/70 px-4 pb-12 pt-4">
          <a
            href="/try"
            className="flex h-[48px] w-full items-center justify-center rounded-pill border-2 border-primary-deep font-body text-[15px] font-semibold text-gold-text transition-colors hover:bg-primary-deep/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            ראו איך זה עובד
          </a>

          <div className="flex items-center justify-center gap-2 font-body text-[13px] font-medium text-ink/80">
            <Phone className="h-4 w-4 text-olive" />
            <span>{PHONE_DISPLAY}</span>
            <span className="text-ink/40">·</span>
            <span className="text-ink/70">זמין 07:00–22:00</span>
          </div>

          <div className="flex items-center justify-center gap-3 font-body text-[13px] font-medium text-ink/70">
            <span>ללא התחייבות</span>
            <Dot />
            <span>שירות אישי</span>
            <Dot />
            <span>תמיכה מלאה</span>
          </div>
        </div>

        <div className="bg-cream/70 px-4 pb-12">
          <LivePhone className="rl-float-flat mx-auto w-[220px]" />
        </div>
      </div>

      {/* ── Desktop 1440: content right, photograph left ──────────────────── */}
      <div className="mx-auto hidden max-w-[1440px] lg:flex lg:flex-row lg:items-center">
        <div className="w-full space-y-8 px-6 py-24 lg:w-[42%] lg:px-12">
          <p className="rl-rise rl-d1 font-body text-[13px] font-semibold tracking-[0.04em] text-gold-text">
            {EYEBROW}
          </p>

          <div className="rl-rise rl-d2"><Headline className="font-display text-6xl font-black leading-[1.08] text-ink" /></div>

          <p className="rl-rise rl-d3 max-w-md font-body text-lg font-normal text-ink/80">{DEK}</p>

          <div className="rl-rise rl-d4 flex items-center gap-3 border-r-2 border-gold pr-4 font-body text-sm font-medium text-ink/70">
            <span>ללא התחייבות</span>
            <Dot />
            <span>שירות אישי</span>
            <Dot />
            <span>תמיכה מלאה</span>
          </div>

          <div className="rl-rise rl-d5 flex flex-col gap-4 sm:flex-row">
            <a
              href={WA_URL}
              className="rl-breathe inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-gold px-8 py-4 font-body text-[15px] font-bold text-ink shadow-raised transition-colors hover:bg-primary-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <MessageCircle className="h-5 w-5" />
              קבלו הצעת מחיר
            </a>
            <a
              href="/try"
              className="inline-flex items-center justify-center gap-2 rounded-pill border-2 border-primary-deep px-8 py-4 font-body text-[15px] font-semibold text-gold-text transition-colors hover:bg-primary-deep/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              ראו איך זה עובד
            </a>
          </div>

          <div className="rl-rise rl-d6 flex items-center gap-2 pt-2 font-body text-sm text-ink/70">
            <Phone className="h-4 w-4 text-olive" />
            <span>{PHONE_DISPLAY} · זמין 07:00–22:00 · מענה תוך 24 שעות</span>
          </div>
        </div>

        <div className="relative h-[92vh] w-full overflow-hidden rounded-bl-[100px] lg:w-[58%]">
          <LivePhone className="rl-float absolute bottom-10 left-10 z-10 w-[200px] xl:w-[220px]" />
          <Image
            src="/redesign/hero-couple-chuppah.webp"
            alt={IMG_ALT}
            fill
            priority
            sizes="58vw"
            className="rl-drift object-cover object-[50%_42%]"
          />
        </div>
      </div>

      {/* Trust strip — four assurances, each one something a reader can check. */}
      <div className="relative border-t border-gold/15 bg-ivory">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-8 px-6 py-10 lg:grid-cols-4 lg:px-12">
          {[
            { Icon: ShieldCheck, title: "מאובטח ומוצפן", sub: "רשימת האורחים שלכם לא יוצאת מכאן" },
            { Icon: Heart, title: "אדם אחד, לא מוקד", sub: "דביר מלווה אתכם מהיום הראשון" },
            { Icon: Clock, title: "תזכורות אוטומטיות", sub: "המערכת רודפת אחרי האורחים, לא אתם" },
            { Icon: Sparkles, title: "זמינות בוואטסאפ", sub: "תשובה מאדם, לא טופס" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 px-2">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-text">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="font-body text-sm font-semibold text-ink">{title}</div>
                {/* Was ink/50 — 3.49:1, one of the three rungs of the muted
                    ladder that fail AA. ink/70 is 6.86:1. */}
                <div className="font-body text-[13px] font-normal text-ink/70">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
