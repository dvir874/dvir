"use client";

/**
 * ShowcaseBand — dark full-bleed product showcase (Polish Wave 1, CEO-approved).
 * Breaks the run of light cream cards right after WhyUs with a deep-ink band and a
 * large, realistic dashboard mockup on a golden glow. Numbers count up on scroll.
 * Built in CSS (no external screenshot dependency); tokens only.
 */

import { Users, CheckCircle2, Clock, Armchair, Wallet, Bell, Check, X } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import CountUp from "@/components/CountUp";

const KPIS = [
  { Icon: Users, value: 287, label: "מוזמנים", tint: "text-primary-soft" },
  { Icon: CheckCircle2, value: 214, label: "אישרו הגעה", tint: "text-success-soft" },
  { Icon: Clock, value: 41, label: "ממתינים", tint: "text-gold" },
  { Icon: Armchair, value: 26, label: "שולחנות", tint: "text-primary-soft" },
];

const GUESTS = [
  { name: "משפחת כהן", tag: "אישרו · 4", cls: "bg-olive/20 text-success-soft", I: Check },
  { name: "יובל ודנה", tag: "ממתינים", cls: "bg-gold/20 text-gold", I: Clock },
  { name: "משפחת לוי", tag: "אישרו · 2", cls: "bg-olive/20 text-success-soft", I: Check },
  { name: "רון אברהם", tag: "לא מגיע", cls: "bg-danger/20 text-danger", I: X },
];

export default function ShowcaseBand() {
  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-ink px-6 lg:px-12 py-20 lg:py-24">
      {/* golden glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-20 right-1/4 h-96 w-96 rounded-full bg-gold/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-olive/25 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-2">
        {/* copy */}
        <FadeIn direction="right">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
            כל האירוע במסך אחד
          </p>
          <h2 className="mt-4 font-display text-4xl lg:text-[56px] font-black leading-[1.05] text-white">
            זה לא מוקאפ.
            <span className="block text-primary-soft">ככה נראה לנהל חתונה נכון.</span>
          </h2>
          <p className="mt-6 max-w-md font-body text-lg font-light text-white/60">
            אורחים, אישורי הגעה, הושבה, תקציב ותזכורות — הכל מסונכרן, בזמן אמת, מכל מכשיר.
            אתם רואים תמונת מצב אחת ברורה במקום עשרה קבצים.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["אישורי הגעה חיים", "הושבה חכמה", "מעקב תקציב", "תזכורות אוטומטיות"].map((t) => (
              <span key={t} className="rounded-pill border border-white/15 bg-white/5 px-4 py-2 font-body text-[13px] text-white/80">
                {t}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* dashboard mockup */}
        <FadeIn direction="left" delay={0.1}>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-modal backdrop-blur-sm">
            {/* top bar */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-primary-soft">רגע לפני</span>
                <span className="rounded-pill bg-olive/25 px-2.5 py-0.5 font-body text-[11px] text-success-soft">חתונת נועה ואורי</span>
              </div>
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold/60" />
              </div>
            </div>

            {/* KPI row */}
            <div className="mb-4 grid grid-cols-4 gap-2.5">
              {KPIS.map(({ Icon, value, label, tint }) => (
                <div key={label} className="rounded-2xl bg-white/[0.06] p-3">
                  <Icon className={`mb-2 h-4 w-4 ${tint}`} />
                  <div className={`font-display text-2xl font-black ${tint}`}>
                    <CountUp value={value} />
                  </div>
                  <div className="font-body text-[10px] text-white/40">{label}</div>
                </div>
              ))}
            </div>

            {/* guest list + budget */}
            <div className="grid gap-3 sm:grid-cols-5">
              {/* guest list */}
              <div className="sm:col-span-3 rounded-2xl bg-white/[0.06] p-4">
                <p className="mb-3 font-body text-[11px] uppercase tracking-wide text-white/40">אישורי הגעה · חי</p>
                <div className="space-y-2.5">
                  {GUESTS.map(({ name, tag, cls, I }) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="font-body text-[13px] text-white/75">{name}</span>
                      <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 font-body text-[11px] ${cls}`}>
                        <I className="h-3 w-3" /> {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* side widgets */}
              <div className="sm:col-span-2 space-y-3">
                <div className="rounded-2xl bg-white/[0.06] p-4">
                  <div className="mb-2 flex items-center gap-2 font-body text-[11px] text-white/40">
                    <Wallet className="h-3.5 w-3.5 text-gold" /> תקציב ומתנות
                  </div>
                  <div className="font-display text-xl font-black text-primary-soft">
                    <CountUp value={48200} prefix="₪" />
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[80%] rounded-full bg-primary-soft" />
                  </div>
                </div>
                <div className="rounded-2xl bg-olive/20 p-4">
                  <div className="mb-1 flex items-center gap-2 font-body text-[11px] text-success-soft">
                    <Bell className="h-3.5 w-3.5" /> תזכורות
                  </div>
                  <div className="font-body text-[13px] text-white/80">
                    <CountUp value={17} /> תזכורות נשלחו אוטומטית השבוע
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
