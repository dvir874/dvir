"use client";

/** AboutWarm — founder story, pull-quote, dark dashboard mockup, "what you get" + stats.
 * Based on approved Stitch "אודות - הפקה עורכית" (screen d8d9644f). */

import { Check, Infinity as InfinityIcon, Star, HeartHandshake, RefreshCw, Heart } from "lucide-react";
import { WA_URL } from "@/lib/constants";
import Link from "next/link";

const GET = [
  "הכל במקום אחד — ללא אקסלים וקבוצות וואטסאפ",
  "תכנון הושבה ללא כאב ראש",
  "לוח בקרה משותף לשניכם",
  "אישורי הגעה אוטומטיים ועם מעקב",
  "מעקב תקציב ומתנות בזמן אמת",
  "ליווי אישי לאורך כל הדרך",
];

const STATS = [
  { Icon: InfinityIcon, big: "∞", title: "רגעים מרגשים", sub: "שיצרנו יחד" },
  { Icon: Star, big: "מותאם", title: "אישית", sub: "לכל אירוע" },
  { Icon: HeartHandshake, big: "100%", title: "יחס אישי", sub: "לכל לקוח" },
  { Icon: RefreshCw, big: "עדכון", title: "בזמן אמת", sub: "כל תגובת אורח מתעדכנת מיידית" },
];

const KPI = [
  { label: "מוזמנים", value: "180" },
  { label: "אישרו הגעה", value: "143" },
  { label: "שולחנות", value: "12" },
];

export default function AboutWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-cream py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[1150px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* text */}
          <div>
            <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">למה רגע לפני</p>
            <h2 className="mt-4 font-display text-4xl lg:text-6xl font-black leading-tight text-ink">
              תכנון חתונה —<br />בלי כאב ראש
            </h2>
            <p className="mt-3 font-display text-xl italic text-ink/50">כל מה שצריך, במקום אחד</p>

            <div className="mt-8 space-y-5 font-body text-[15px] font-light leading-relaxed text-ink/70">
              <p>תכנון חתונה יכול להיות אחד הדברים היפים בחיים — אבל לרוב הוא הופך לרשימות אינסופיות בוואטסאפ, אקסלים שמתפרקים, ושיחות טלפון שלא נגמרות.</p>
              <blockquote className="border-r-4 border-gold pr-5 font-display text-xl font-bold not-italic text-ink">
                המטרה שלנו היא לאפשר לכם להתרכז באהבה, בזמן שאנחנו דואגים לכל הפרטים הקטנים שמסביב.
              </blockquote>
              <p>את "רגע לפני" בניתי כדי לשנות בדיוק את זה. פלטפורמה שמרכזת את הכל — אורחים, הושבה, תקציב, מתנות, משימות — ומאפשרת לכם להתמקד ברגעים שחשובים באמת.</p>
              <p>כל לקוח מקבל יחס אישי, ירידה לפרטים, וזמינות לאורך כל התהליך — מהרגע הראשון ועד אחרי שהאורח האחרון יוצא מהאולם. כי "רגע לפני" הוא לא רק שם. זה ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל.</p>
            </div>

            {/* what you get */}
            <div className="mt-8 rounded-card bg-surface-raised p-6 shadow-card">
              <p className="mb-4 font-body text-sm font-semibold uppercase tracking-wide text-gold">מה מקבלים איתנו</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {GET.map((g) => (
                  <div key={g} className="flex items-center gap-2 font-body text-[14px] text-ink/75">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    {g}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a href={WA_URL} className="inline-flex items-center justify-center gap-2 rounded-pill bg-gold px-8 py-4 font-body text-[15px] font-semibold text-ink shadow-raised">
                <Heart className="w-4 h-4" /> בואו נעבוד יחד
              </a>
              <Link href="/invitations" className="inline-flex items-center justify-center rounded-pill border border-gold px-8 py-4 font-body text-[15px] font-semibold text-gold">
                צפו בדוגמאות
              </Link>
            </div>
          </div>

          {/* dark dashboard mockup */}
          <div className="relative">
            <div className="rounded-[28px] bg-ink p-6 shadow-modal text-white">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-display text-lg font-bold text-primary-soft">רגע לפני</span>
                <span className="font-body text-[11px] text-white/50">ימים לחתונה</span>
              </div>
              <div className="mb-5 grid grid-cols-4 gap-2 text-center">
                {[["47", "ימים"], ["08", "שעות"], ["23", "דקות"], ["14", "שניות"]].map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-white/5 py-3">
                    <div className="font-display text-2xl font-black text-primary-soft">{n}</div>
                    <div className="font-body text-[10px] text-white/40">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {KPI.map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="font-display text-xl font-bold text-white">{value}</div>
                    <div className="font-body text-[10px] text-white/40">{label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <div className="mb-2 flex items-center justify-between font-body text-[11px] text-white/50">
                  <span>תקציב ומתנות</span>
                  <span className="font-display text-lg font-black text-primary-soft">₪48,200</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[80%] bg-primary-soft" />
                </div>
              </div>
            </div>
            {/* floating badges */}
            <div className="absolute -top-4 right-4 rounded-pill bg-surface-raised px-4 py-2 font-body text-[13px] font-semibold text-ink shadow-float flex items-center gap-2">
              <Heart className="w-4 h-4 text-gold" /> ליווי אישי תמיד
            </div>
            <div className="absolute -bottom-4 left-4 rounded-pill bg-olive px-4 py-2 font-body text-[13px] font-semibold text-white shadow-float">
              עדכון בזמן אמת · לשני בני הזוג
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map(({ Icon, big, title, sub }) => (
            <div key={title} className="rounded-card bg-surface-raised p-6 text-center shadow-card">
              <Icon className="mx-auto mb-2 h-6 w-6 text-gold" />
              <div className="font-display text-2xl font-black text-ink">{big}</div>
              <div className="font-body text-sm font-semibold text-ink/80">{title}</div>
              <div className="font-body text-[12px] text-ink/45">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
