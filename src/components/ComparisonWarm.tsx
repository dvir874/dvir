"use client";

/** ComparisonWarm — elegant before/after comparison table.
 * Based on approved Stitch "השוואת ניהול - הפקה עורכית" (screen 7d89bc3d). */

import { Check, X } from "lucide-react";

const ROWS: { feature: string; manual: boolean; ragah: boolean }[] = [
  { feature: "ניהול הזמנות, אורחים ואישורי הגעה", manual: false, ragah: true },
  { feature: "מעקב אישורי הגעה בזמן אמת", manual: false, ragah: true },
  { feature: "תזכורות אוטומטיות בוואטסאפ", manual: false, ragah: true },
  { feature: "תכנון הושבה לפי שולחנות", manual: false, ragah: true },
  { feature: "מעקב תקציב ומתנות", manual: false, ragah: true },
  { feature: "לוח בקרה זוגי משותף", manual: false, ragah: true },
  { feature: "ליווי אישי לאורך כל התהליך", manual: false, ragah: true },
  { feature: "ניהול ידני ב-WhatsApp ואקסל", manual: true, ragah: false },
];

function Mark({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-olive/10 text-olive">
      <Check className="w-4 h-4" />
    </span>
  ) : (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-danger/10 text-danger">
      <X className="w-4 h-4" />
    </span>
  );
}

export default function ComparisonWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-ivory py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[1000px]">
        <div className="text-center mb-14">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">ההבדל</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black leading-tight text-ink">
            ניהול חתונה בלי רגע לפני
            <span className="block text-gold">לעומת ניהול עם רגע לפני</span>
          </h2>
          <p className="mt-5 font-body text-lg font-light text-ink/55">
            כל מה שצריך לניהול החתונה. בלוח בקרה אחד, עם ליווי אישי לאורך כל הדרך.
          </p>
        </div>

        <div className="overflow-hidden rounded-card bg-surface-raised shadow-card">
          {/* header */}
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-cream px-6 py-5 font-body text-sm">
            <span className="font-semibold text-ink">תכונה</span>
            <span className="w-24 text-center text-ink/50">ניהול עצמאי</span>
            <span className="w-24 text-center font-semibold text-gold">רגע לפני ✦</span>
          </div>
          {ROWS.map((r, i) => (
            <div
              key={r.feature}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-4 ${
                i < ROWS.length - 1 ? "border-b border-cream/70" : ""
              } ${i === ROWS.length - 1 ? "bg-cream/40" : ""}`}
            >
              <span className="font-body text-[15px] text-ink/80">{r.feature}</span>
              <span className="flex w-24 justify-center"><Mark ok={r.manual} /></span>
              <span className="flex w-24 justify-center"><Mark ok={r.ragah} /></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
