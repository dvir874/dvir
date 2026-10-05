"use client";

/**
 * ScatterToOne — "כל מה שמפוזר בחתונה / מתרכז במקום אחד."
 *
 * Stitch project 18431120483630512231, screen 0460a530 ("סקשן מפוזר למרוכז
 * (Scroll Pinned Animation)"), approved 05/10/2026. The design is three
 * keyframes side by side; this is the motion they describe. The section pins,
 * and scrolling through it pulls the fragments — the Excel sheet, the family
 * WhatsApp group, the sticky note, the paper seating chart — into the centre
 * until one calm dashboard is left. Replaces ToolsWarm, which said the same
 * thing ("5 tools → one") as a static list.
 *
 * One change from the design: its gold second line is set in italic. Frank
 * Ruhl Libre has no italic and Hebrew has no italic tradition (see HeroWarm),
 * so it is upright here. Reduced motion, and phones, get the final frame
 * without the pin.
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";

type Frag = { x: number; y: number; r: number; node: React.ReactNode };

const FRAGS: Frag[] = [
  { x: -380, y: -150, r: -8, node: (
    <div className="w-60 rounded-lg border border-[#E2DAC8] bg-white p-3 text-[11px] shadow-md">
      <div className="mb-1.5 flex justify-between font-bold text-ink"><span>רשימת אורחים (סופי_2_חדש)</span><span className="text-[#B85C4B]">⚠ 14</span></div>
      {["משפחת לוי · 4", "יוסי כהן · ?", "אביטל · לא עונה", "שיר כהן · 1+"].map(r =>
        <div key={r} className="border-t border-[#F0EBE0] py-1 text-ink/70">{r}</div>)}
    </div>) },
  { x: 360, y: -170, r: 7, node: (
    <div className="w-56 rounded-2xl bg-[#DCF8C6] p-3 text-[12px] text-ink shadow-md">
      <div className="mb-1 flex justify-between text-[10px] font-bold text-olive"><span>קבוצה: חתונה – משפחה קרובה</span><span className="rounded-full bg-[#B85C4B] px-1.5 text-white">12</span></div>
      מי עוד לא אישר? מישהו דיבר עם דוד שלמה?
    </div>) },
  { x: -330, y: 140, r: -6, node: (
    <div className="w-48 rotate-[-2deg] bg-[#FFF3A8] p-3 text-[12px] font-bold text-ink shadow-md">
      להתקשר לדודה רחל ⚠️<div className="mt-1 font-normal text-ink/70">לאשר אם צריכה הסעה</div>
    </div>) },
  { x: 340, y: 150, r: 9, node: (
    <div className="w-52 border border-dashed border-ink/30 bg-[#FBF8F1] p-3 font-mono text-[11px] text-ink/70 shadow-md">
      <div className="mb-1 font-bold text-ink">פתק שולחנות · 18/11</div>
      <div className="line-through">שולחן 4 – משפחת לוי</div>
      <div>שולחן 6 או 7?</div><div className="text-[#B85C4B]">?</div>
    </div>) },
  { x: 20, y: -230, r: -12, node: (
    <div className="rounded-md border border-[#E2DAC8] bg-white px-3 py-2 font-mono text-[13px] font-bold text-[#B85C4B] shadow-md">₪34,200 ?</div>) },
];

function Fragment({ f, p }: { f: Frag; p: MotionValue<number> }) {
  const x = useTransform(p, [0.1, 0.55], [f.x, 0]);
  const y = useTransform(p, [0.1, 0.55], [f.y, 0]);
  const rotate = useTransform(p, [0.1, 0.55], [f.r, 0]);
  const scale = useTransform(p, [0.1, 0.55], [1, 0.3]);
  const opacity = useTransform(p, [0.1, 0.45, 0.6], [1, 0.8, 0]);
  return (
    /* Centred by the wrapper, not by translate classes: framer writes its own
       transform from x/y/scale and would silently drop -translate-x-1/2. */
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div style={{ x, y, rotate, scale, opacity }}>{f.node}</motion.div>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="w-[min(560px,92vw)] rounded-[28px] border-[10px] border-[#2B2B2E] bg-white p-5 shadow-[0_30px_80px_rgba(28,16,8,0.18)]">
      <div className="mb-4 flex items-center justify-between border-b border-[#F0EBE0] pb-3">
        <div>
          <div className="font-display text-base font-bold text-ink">שירה ועומרי</div>
          <div className="text-[11px] text-ink/60">18 בנובמבר 2026 · דוגמה</div>
        </div>
        <span className="rounded-md bg-olive/15 px-2 py-0.5 text-[11px] font-semibold text-olive">✓ הכול מסונכרן</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[["אישרו הגעה", "241", "text-olive"], ["טרם השיבו", "48", "text-gold-text"], ["לא מגיעים", "23", "text-ink/70"]].map(([l, v, c]) => (
          <div key={l} className="rounded-xl bg-cream p-3 text-center">
            <div className="text-[11px] text-ink/60">{l}</div>
            <div className={`font-display text-2xl font-black ${c}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-cream p-3">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 36 36" className="h-11 w-11 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E9E1D2" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6B7B5A" strokeWidth="3.5" strokeDasharray="97.4" strokeDashoffset={97.4 * 0.23} strokeLinecap="round" />
          </svg>
          <div>
            <div className="text-sm font-bold text-ink">תמונת מצב מדויקת</div>
            <div className="text-[11px] text-ink/60">312 מוזמנים · 77% ענו</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {["10/10", "10/10", "8/10"].map((t, i) => (
            <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 text-[9px] font-semibold text-ink/70">{t}</span>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className="text-ink"><span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-olive" />משפחת שפירא אישרו הרגע (3 נפשות) ✓</span>
        <span className="text-ink/50">לפני 2 דק׳</span>
      </div>
    </div>
  );
}

export default function ScatterToOne() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const dashOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
  const dashScale = useTransform(scrollYProgress, [0.45, 0.75], [0.85, 1]);

  const Heading = (
    <div className="mx-auto max-w-3xl px-4 text-center">
      <h2 className="font-display text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
        כל מה שמפוזר בחתונה
        <span className="block text-gold-large">מתרכז במקום אחד.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-ink/70">
        במקום 7 רשימות, הודעות בוואטסאפ ופתקים על המקרר — הכול מתנקז למסך אחד מסודר ושקט.
      </p>
    </div>
  );

  return (
    <section dir="rtl" className="relative w-full bg-ivory">
      {/* Phones and reduced motion: the calm end state, no pin. */}
      <div className={`py-16 ${reduce ? "" : "lg:hidden"}`}>
        {Heading}
        <div className="mt-10 flex justify-center px-4"><Dashboard /></div>
      </div>

      {!reduce && (
        <div ref={ref} className="relative hidden h-[240vh] lg:block">
          <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden pt-20">
            {Heading}
            <div className="relative mt-8 h-[440px] w-full max-w-6xl">
              {FRAGS.map((f, i) => <Fragment key={i} f={f} p={scrollYProgress} />)}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div style={{ opacity: dashOpacity, scale: dashScale }}>
                  <Dashboard />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
