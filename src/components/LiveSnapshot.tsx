"use client";

/**
 * LiveSnapshot — the countdown + RSVP card that used to float over the hero photo.
 * Relocated to its own light section so the hero image stays clean (CEO request).
 * Self-contained: own live countdown + KPIs. Levitates on a soft golden glow.
 */

import { useEffect, useState } from "react";
import { Users, CheckCircle2, Clock, Gauge } from "lucide-react";
import FadeIn from "@/components/FadeIn";

const KPIS = [
  { label: "מוזמנים", value: "287", Icon: Users, bar: "" },
  { label: "אישרו", value: "214", Icon: CheckCircle2, bar: "bg-olive" },
  { label: "ממתינים", value: "41", Icon: Clock, bar: "bg-gold" },
  { label: "אחוז מענה", value: "75%", Icon: Gauge, bar: "bg-gold" },
];

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { days, hours: pad(hours), mins: pad(mins), secs: pad(secs) };
}

const DEMO_WEDDING = new Date("2026-10-16T19:30:00+03:00").getTime();

export default function LiveSnapshot() {
  const cd = useCountdown(DEMO_WEDDING);
  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-ivory px-6 lg:px-12 py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1150px] items-center gap-12 lg:grid-cols-2">
        {/* text */}
        <FadeIn direction="right">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">
            לוח הבקרה שלכם
          </p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black leading-tight text-ink">
            תמונת מצב אחת.
            <span className="block text-gold">בכל רגע נתון.</span>
          </h2>
          <p className="mt-5 max-w-md font-body text-lg font-light text-ink/60">
            ספירה לאחור, אישורי הגעה, אחוז מענה ותזכורות — הכל חי ומעודכן, זמין לכם
            ולבן/בת הזוג מכל מכשיר. בלי לרדוף אחרי אף אחד.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["מתעדכן בזמן אמת", "לשני בני הזוג", "מכל מכשיר"].map((t) => (
              <span key={t} className="rounded-pill border border-gold/25 bg-surface-raised px-4 py-2 font-body text-[13px] text-ink/70">
                {t}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* card */}
        <FadeIn direction="left" delay={0.1} className="relative">
          {/* golden glow — makes the card levitate */}
          <div
            className="pointer-events-none absolute inset-0 mx-auto my-auto h-72 w-72 rounded-full bg-gold/25 blur-[100px]"
            aria-hidden
          />
          <div className="relative mx-auto w-full max-w-[440px] rounded-[24px] border border-white/60 bg-white/95 p-6 shadow-[0_40px_90px_-25px_rgba(28,16,8,0.35)] ring-1 ring-gold/10 backdrop-blur-md">
            {/* Countdown header */}
            <div className="flex items-start justify-between border-b border-cream pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">חתונת נועה ואורי</h3>
                <p className="mt-1 font-body text-[11px] uppercase tracking-wider text-ink/50">זמן נותר</p>
              </div>
              <div
                className="font-display text-3xl font-black tracking-tight text-gold"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {cd.days}<span className="text-xl text-ink/40">:</span>{cd.hours}
                <span className="text-xl text-ink/40">:</span>{cd.mins}
                <span className="text-xl text-ink/40">:</span>{cd.secs}
              </div>
            </div>

            {/* KPI bento grid */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              {KPIS.map(({ label, value, Icon, bar }) => (
                <div key={label} className="relative overflow-hidden rounded-xl bg-ivory/70 p-4 shadow-card">
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
        </FadeIn>
      </div>
    </section>
  );
}
