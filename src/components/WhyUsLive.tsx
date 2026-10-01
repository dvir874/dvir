"use client";

/**
 * WhyUsLive — "לא עוד כלי לאישורי הגעה", as six living vignettes.
 *
 * Stitch project 18431120483630512231, screen 7303adfc ("סקשן למה רגע לפני
 * (Bento Grid — 6 Cards)"), approved 01/10/2026. Replaces WhyUsWarm, whose
 * cards were empty white boxes, an AI tablet-on-a-desk and a stock invitation,
 * and whose "Wedding Mode" card promised Waze and supplier contacts that the
 * day screen does not have.
 *
 * Every card is UI, not imagery, and moves once it scrolls into view — the
 * grey "אנימציה:" notes in the design are what the motion here implements.
 * One deliberate change from the design: the gifts card said "PayBox ואשראי".
 * How gifts reach the couple is still undecided, so it says "מתנות שנרשמו".
 * Reduced motion gets the final state of every card.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import CountUp from "@/components/CountUp";

const card = "rounded-[24px] border border-[#E9DFCF] bg-cream/70 p-6 sm:p-7 shadow-[0_4px_24px_rgba(28,16,8,0.05)]";
const inner = "rounded-2xl border border-[#EFE7DA] bg-white";

function useLoop(len: number, every: number, on: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) return;
    const t = setInterval(() => setI((x) => (x + 1) % len), every);
    return () => clearInterval(t);
  }, [len, every, on]);
  return i;
}

/* 1 ─ live dashboard */
const FEED = [
  { name: "משפחת לוי אישרו", sub: "4 מנות (2 רגיל, 1 צמחוני, 1 ילד)", tag: "אישרו", ok: true, ago: "לפני 2 דק׳" },
  { name: "יעל כהן", sub: "הודיעה שלא תגיע", tag: "לא מגיעה", ok: false, ago: "לפני 5 דק׳" },
  { name: "יוסי ומיכל אברהם", sub: "אישרו 2 מנות", tag: "אישרו", ok: true, ago: "לפני 11 דק׳" },
];

function Dashboard({ go }: { go: boolean }) {
  const reduce = useReducedMotion();
  const shown = useLoop(FEED.length + 1, 2000, go && !reduce);
  const visible = reduce ? FEED.length : Math.max(1, shown);
  const stats = [
    { label: "מוזמנים", value: 312, sub: "118 בתי אב" },
    { label: "אישרו הגעה", value: 241, sub: "77% מתוכם", hi: true },
    { label: "ממתינים", value: 48, sub: "תזכורות אוטומטיות" },
    { label: "לא מגיעים", value: 23, sub: "פינו מקום מראש" },
  ];
  return (
    <div className={`${card} lg:col-span-2`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-olive">
            <span className="h-2 w-2 rounded-full bg-olive" /> סנכרון חי ועדכון שוטף
          </div>
          <h3 className="font-display text-2xl font-black text-ink">רואים הכול, בזמן אמת</h3>
        </div>
        <span className="rounded-full border border-[#E9DFCF] bg-white px-3 py-1 text-xs text-ink/70">
          כל שקל וכל מנה מתעדכנים ברגע שהאורח משיב
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${inner} p-4 text-center ${s.hi ? "!border-gold/50 !bg-[#FBF6EC]" : ""}`}>
            <div className={`text-xs font-medium ${s.hi ? "text-gold-text" : "text-ink/70"}`}>{s.label}</div>
            <div className={`mt-1 font-display text-3xl font-black ${s.hi ? "text-gold-text" : "text-ink"}`}>
              <CountUp value={s.value} />
            </div>
            <div className="mt-1 text-[11px] text-ink/60">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className={`${inner} mt-4 flex items-center justify-between gap-4 p-4`}>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90" aria-hidden>
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F0E8DA" strokeWidth="3.5" />
            <motion.circle
              cx="18" cy="18" r="15.5" fill="none" stroke="#C5A46D" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray="97.4"
              initial={{ strokeDashoffset: 97.4 }}
              animate={go ? { strokeDashoffset: 97.4 * 0.23 } : {}}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </svg>
          <div>
            <div className="text-sm font-bold text-ink">יעד אישורי ההגעה הושלם כמעט לחלוטין</div>
            <div className="text-xs text-ink/70">241 אישרו מתוך 312 מוזמנים · 77%</div>
          </div>
        </div>
        <span className="hidden rounded-lg bg-cream px-3 py-1 text-xs font-semibold text-ink/70 sm:inline">24 שולחנות מלאים</span>
      </div>

      <div className={`${inner} mt-4 p-4`}>
        <div className="mb-2 text-xs font-medium text-ink/60">עדכונים אחרונים ברשת (שידור חי)</div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {FEED.slice(0, visible).map((r) => (
              <motion.div
                key={r.name}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between rounded-xl border border-[#F2ECE2] px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className={`h-2 w-2 rounded-full ${r.ok ? "bg-olive" : "bg-ink/30"}`} />
                  <span className="font-bold text-ink">{r.name}</span>
                  <span className="hidden text-ink/60 sm:inline">· {r.sub}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`rounded-md px-2 py-0.5 font-semibold ${r.ok ? "bg-olive/15 text-olive" : "bg-ink/5 text-ink/60"}`}>
                    {r.ok ? "✓ " : ""}{r.tag}
                  </span>
                  <span className="text-ink/50">{r.ago}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* 2 ─ seating */
function Seating({ go }: { go: boolean }) {
  const reduce = useReducedMotion();
  const step = useLoop(2, 2600, go && !reduce);
  const seated = reduce || step === 1;
  return (
    <div className={card}>
      <h3 className="font-display text-xl font-black text-ink">הושבה בגרירה</h3>
      <p className="mt-1 text-sm text-ink/70">מחברים בין אנשים, מפרידים בין מתחים — בשניות.</p>
      <div className={`${inner} relative mt-5 h-[230px] overflow-hidden p-4`}>
        <div className="flex justify-between text-[11px] text-ink/50">
          <span>אזור אולם: מרכז רחבה</span>
        </div>
        <div className="mt-4 flex items-center justify-around">
          {[
            { n: 12, cap: seated ? "8/10" : "6/10", hi: true },
            { n: 11, cap: "6/10" },
            { n: 10, cap: "10/10 מלא" },
          ].map((t) => (
            <div
              key={t.n}
              className={`flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full border-2 text-center transition-colors ${
                t.hi ? (seated ? "border-gold bg-[#FBF6EC]" : "border-dashed border-gold/60") : "border-dashed border-[#E9DFCF]"
              }`}
            >
              <span className="text-xs font-bold text-ink">שולחן {t.n}</span>
              <span className="text-[10px] text-ink/60">{t.cap}</span>
            </div>
          ))}
        </div>
        <motion.div
          className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-ink px-3 py-2.5 text-ivory shadow-lg"
          animate={seated ? { y: -96, x: 46, scale: 0.55, opacity: 0 } : { y: 0, x: 0, scale: 1, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: "easeInOut" }}
        >
          <div>
            <div className="text-sm font-bold">סבא אליהו + סבתא שרה</div>
            <div className="text-[10px] text-ivory/70">2 מקומות · צמחוני + רגיל</div>
          </div>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px]">← שולחן 12</span>
        </motion.div>
      </div>
    </div>
  );
}

/* 3 ─ reminders */
function Reminders({ go }: { go: boolean }) {
  const rows = [
    { n: "רועי שטרן", ok: true },
    { n: "עדי מזרחי", ok: true },
    { n: "תמר אלון", ok: true },
    { n: "גיא לוין", ok: false },
    { n: "נועה כרמי", ok: false },
  ];
  return (
    <div className={card}>
      <h3 className="font-display text-xl font-black text-ink">תזכורות עדינות ומדויקות</h3>
      <p className="mt-1 text-sm text-ink/70">בלי להטריד את הדודים שכבר אישרו.</p>
      <div className={`${inner} mt-5 space-y-2 p-3`}>
        {rows.map((r, i) => (
          <div key={r.n} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${r.ok ? "border-[#F2ECE2]" : "border-gold/40 bg-[#FFFBF2]"}`}>
            <span className="text-ink">{i + 1}. {r.n}</span>
            {r.ok ? (
              <span className="rounded-md bg-olive/15 px-2 py-0.5 text-[11px] font-semibold text-olive">✓ אישור הגעה</span>
            ) : (
              <span className="flex items-center gap-1 rounded-md border border-gold/40 px-2 py-0.5 text-[11px] font-semibold text-gold-text">
                <motion.span
                  className="inline-block"
                  animate={go ? { rotate: [0, -18, 16, -10, 8, 0] } : {}}
                  transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.6, delay: i * 0.25 }}
                >
                  🔔
                </motion.span>
                נשלחה תזכורת
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* 4 ─ meal report */
function MealReport({ go }: { go: boolean }) {
  const reduce = useReducedMotion();
  const lines = [
    ["מנות בשרי", "186"],
    ["צמחוני", "22"],
    ["טבעוני (ללא גלוטן)", "9"],
    ["מנות ילדים", "24"],
  ];
  return (
    <div className={card}>
      <h3 className="font-display text-xl font-black text-ink">דוח מנות סופי לאולם</h3>
      <p className="mt-1 text-sm text-ink/70">אפס חוסר הבנות ביום האירוע.</p>
      <div className={`${inner} mt-5 p-4`}>
        <div className="border-b border-dashed border-[#E9DFCF] pb-2 text-sm font-bold text-ink">סיכום מנות סופי לאירוע</div>
        <div className="space-y-2 py-3 text-sm">
          {lines.map(([k, v], i) => (
            <motion.div
              key={k}
              className="flex justify-between"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={go ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.35 }}
            >
              <span className="text-ink/70">{k}</span>
              <span className="font-bold text-ink">{v}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between border-t border-dashed border-[#E9DFCF] pt-3">
          <span className="font-bold text-ink">סה״כ מנות מוגשות:</span>
          <span className="font-display text-xl font-black text-ink">241</span>
        </div>
        <motion.div
          className="mt-3 rounded-xl border border-olive/30 bg-olive/10 py-2 text-center text-sm font-bold text-olive"
          initial={reduce ? false : { opacity: 0, scale: 1.3 }}
          animate={go ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 2, type: "spring", stiffness: 260, damping: 14 }}
        >
          ✓ נשלח לאולם בוואטסאפ
        </motion.div>
      </div>
    </div>
  );
}

/* 5 ─ budget & gifts */
function Budget({ go }: { go: boolean }) {
  return (
    <div className={card}>
      <h3 className="font-display text-xl font-black text-ink">תקציב ומתנות</h3>
      <p className="mt-1 text-sm text-ink/70">רואים את העלויות מול המתנות שנכנסות.</p>
      <div className={`${inner} mt-5 space-y-4 p-4`}>
        {[
          { label: "תקציב מתוכנן", amount: "₪115,000", w: 1, c: "bg-ink/50" },
          { label: "מכוסה ממתנות", amount: "₪98,400 (85%)", w: 0.85, c: "bg-gold" },
        ].map((b, i) => (
          <div key={b.label}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-ink/70">{b.label}</span>
              <span className="font-bold text-ink">{b.amount}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#F0E8DA]">
              <motion.div
                className={`h-full rounded-full ${b.c}`}
                initial={{ width: 0 }}
                animate={go ? { width: `${b.w * 100}%` } : {}}
                transition={{ duration: 1.3, delay: i * 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className={`${inner} mt-3 space-y-2 p-4 text-sm`}>
        <div className="text-xs text-ink/60">מתנות שנרשמו</div>
        {[
          ["עומר ודנה ברקוביץ׳", "1,200"],
          ["משפחת אלקיים", "1,600"],
          ["אורן כץ (חבר מהצבא)", "800"],
        ].map(([n, a]) => (
          <div key={n} className="flex justify-between">
            <span className="text-ink">{n}</span>
            <span className="font-mono text-ink/80">₪{a}+</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 6 ─ one person */
function OnePerson({ go }: { go: boolean }) {
  const reduce = useReducedMotion();
  const phase = useLoop(3, 1800, go && !reduce);
  const p = reduce ? 2 : phase;
  return (
    <div className="grid items-center gap-8 rounded-[28px] bg-olive p-7 text-ivory sm:p-10 lg:col-span-3 lg:grid-cols-2">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ivory/30 px-3 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-[#9FD3A8]" /> ליווי אישי וישיר · זמין עכשיו בוואטסאפ
        </span>
        <h3 className="mt-4 font-display text-4xl font-black sm:text-5xl">אדם אחד, לא מוקד</h3>
        <p className="mt-3 text-lg text-ivory/85">דביר מלווה אתכם אישית בכל בקשה, עד אחרון האורחים.</p>
        <ul className="mt-5 space-y-2 text-ivory/90">
          <li>✓ אין מענה קולי מנוכר, אין מערכת כרטיסים סבוכה</li>
          <li>✓ טיפול מהיר בכל שינוי שולחן או הוספת אורח של הרגע האחרון</li>
        </ul>
      </div>
      <div className="rounded-2xl border border-ivory/15 bg-black/15 p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-ivory/10 pb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream font-bold text-ink">ד</span>
          <div>
            <div className="text-sm font-bold">דביר · מנהל האירוע שלכם</div>
            <div className="text-[11px] text-ivory/60">מחובר ישירות לקבוצת הזוג</div>
          </div>
        </div>
        <div className="flex min-h-[150px] flex-col gap-3">
          <div className="max-w-[85%] self-start rounded-2xl rounded-tr-sm bg-white px-4 py-3 text-sm text-ink">
            דביר, אפשר להוסיף עוד 3 אורחים לשולחן של החברים מהצבא?
            <div className="mt-1 text-[10px] text-ink/50">14:12 ✓✓</div>
          </div>
          {p === 1 && (
            <div className="flex items-center gap-1 self-end px-2 text-[11px] text-ivory/70">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-ivory/70"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
              <span className="mr-1">דביר מקליד</span>
            </div>
          )}
          {p === 2 && (
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-[85%] self-end rounded-2xl rounded-tl-sm bg-[#2F3A26] px-4 py-3 text-sm text-ivory"
            >
              בטח, הוספתי! הם יקבלו הזמנה בוואטסאפ עוד היום 🤍
              <div className="mt-1 text-[10px] text-ivory/50">14:13</div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WhyUsLive() {
  const ref = useRef<HTMLDivElement>(null);
  const go = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <section dir="rtl" className="relative w-full overflow-hidden bg-ivory px-4 py-16 sm:px-6 sm:py-24 lg:px-12">
      <div className="mx-auto max-w-[1150px]">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E9DFCF] bg-cream px-3.5 py-1.5 text-sm text-ink/70">
            <span className="h-2 w-2 rounded-full bg-olive" /> למה רגע לפני · המערכת והשירות
          </span>
          <h2 className="mt-5 font-display text-4xl font-black leading-tight text-ink sm:text-5xl">
            לא עוד כלי לאישורי הגעה.
            <span className="block text-gold-large">מערכת שמנהלת את כל האורחים.</span>
          </h2>
          <p className="mt-4 text-lg text-ink/70">ההבדל בין לחכות לסוף לבין ליהנות מהדרך.</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Dashboard go={go} />
          <Seating go={go} />
          <Reminders go={go} />
          <MealReport go={go} />
          <Budget go={go} />
          <OnePerson go={go} />
        </div>
      </div>
    </section>
  );
}
