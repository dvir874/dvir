"use client";

import { Heart, Sparkles, Check, Zap, Star, Infinity } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";
import { motion } from "framer-motion";

/* ─── Values list ─────────────────────────────────── */
const VALUES = [
  "הכל במקום אחד — ללא אקסל ווצאפ",
  "אישורי הגעה אוטומטיים ועם מעקב",
  "תכנון הושבה ללא כאב ראש",
  "מעקב תקציב ומתנות בזמן אמת",
  "לוח בקרה משותף לשניכם",
  "ליווי אישי לאורך כל הדרך",
];

/* ─── Stat cards ──────────────────────────────────── */
const STATS = [
  {
    value: "עדכון",
    label: "בזמן אמת",
    sub: "כל תגובת אורח מתעדכנת מיידית",
    icon: Zap,
    accent: "#6B7B5A",
  },
  {
    value: "100%",
    label: "יחס אישי",
    sub: "לכל לקוח",
    icon: Heart,
    accent: "#C5A46D",
  },
  {
    value: "מותאם",
    label: "אישית",
    sub: "לכל אירוע",
    icon: Star,
    accent: "#6B7B5A",
  },
  {
    value: "∞",
    label: "רגעים מרגשים",
    sub: "שיוצרו יחד",
    icon: Infinity,
    accent: "#C5A46D",
  },
];

/* ─── Story paragraphs ────────────────────────────── */
const STORY = [
  <>
    תכנון חתונה יכול להיות אחד הדברים היפים בחיים — אבל לרוב הוא הופך לרשימות
    אינסופיות בווצאפ, אקסלים שמתפרקים, ושיחות טלפון שלא נגמרות.
  </>,
  <>
    את ״רגע לפני״ בניתי כדי לשנות בדיוק את זה. פלטפורמה שמרכזת את הכל — אורחים,
    הושבה, תקציב, מתנות, משימות — ומאפשרת לכם להתמקד ברגעים שחשובים באמת.
  </>,
  <>
    אני מאמין שכל זוג ראוי לתכנן את חתונתו ברוגע, בבהירות ועם תחושה שמישהו מלווה
    אותם לאורך הדרך. לא רק כלי — ליווי אמיתי.
  </>,
  <>
    כל לקוח מקבל יחס אישי, ירידה לפרטים, וזמינות לאורך כל התהליך — מהרגע הראשון
    ועד אחרי שהאורח האחרון יוצא מהאולם.
  </>,
  <>
    כי ״רגע לפני״ הוא לא רק שם. זה ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל.
  </>,
];

/* ─── Main component ──────────────────────────────── */
export default function About() {
  return (
    <section
      id="about"
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#EDE6D6 0%,#F6F1E8 100%)" }}
    >
      {/* Subtle texture */}
      <div className="absolute inset-0 pattern-overlay opacity-35" />

      {/* Top / bottom gold lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/28 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 60%,rgba(197,164,109,0.07) 0%,transparent 55%)," +
            "radial-gradient(ellipse at 80% 30%,rgba(107,123,90,0.06) 0%,transparent 55%)",
        }}
      />

      <div className="container-max mx-auto relative z-10">

        {/* ── Section header ── */}
        <FadeIn className="text-center mb-12 md:mb-14">
          <p
            className="text-gold text-xs tracking-[0.22em] mb-3 uppercase"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            למה רגע לפני
          </p>
          <h2 className="section-title">תכנון חתונה — בלי כאב ראש</h2>
          <div className="gold-divider" />
          <p
            className="text-xl md:text-2xl font-light text-olive mt-2"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            כל מה שצריך, במקום אחד
          </p>
        </FadeIn>

        {/* ── Two-column: founder card + story ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start mb-12 md:mb-16">

          {/* Left — emotional couple visual */}
          <FadeIn direction="right" delay={0.12} className="order-2 lg:order-1">
            <CoupleVisual />
          </FadeIn>

          {/* Right — story + values */}
          <FadeIn direction="left" delay={0} className="order-1 lg:order-2">

            {/* Story paragraphs */}
            <div
              className="space-y-4 text-dark/68 leading-[1.95] text-sm md:text-[0.9375rem] mb-8"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              {STORY.map((para, i) => (
                <p key={i} className={i === 0 ? "font-medium text-dark/80" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* Values list — 2-column grid */}
            <div
              className="rounded-2xl px-6 py-6 mb-8"
              style={{
                background: "rgba(255,255,255,0.60)",
                border: "1px solid rgba(197,164,109,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <p
                className="text-gold text-[10px] tracking-[0.2em] uppercase mb-4"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                מה מקבלים איתנו
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6">
                {VALUES.map((v) => (
                  <div key={v} className="flex items-center gap-2.5">
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(107,123,90,0.14)" }}
                    >
                      <Check size={11} className="text-olive" strokeWidth={2.5} />
                    </div>
                    <span
                      className="text-dark/72 text-sm"
                      style={{ fontFamily: "Heebo, sans-serif" }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-primary"
              >
                <Heart size={17} />
                בואו נעבוד יחד
              </button>
              <button
                onClick={() =>
                  document.querySelector("#gallery")?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-outline"
              >
                צפו בדוגמאות
              </button>
            </div>
          </FadeIn>
        </div>

        {/* ── Stats row ── */}
        <StaggerContainer
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          staggerDelay={0.1}
          delayStart={0.1}
        >
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(197,164,109,0.16)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl p-6 flex flex-col items-center text-center cursor-default overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(197,164,109,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Icon bg circle */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ background: `${s.accent}15` }}
              >
                <s.icon size={18} strokeWidth={1.5} style={{ color: s.accent }} />
              </div>

              {/* Value */}
              <span
                className="text-3xl md:text-[2rem] font-bold text-dark leading-none mb-1"
                style={{ fontFamily: "Frank Ruhl Libre, serif" }}
              >
                {s.value}
              </span>

              {/* Label */}
              <span
                className="font-semibold text-dark/80 text-sm mt-1 leading-tight"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                {s.label}
              </span>

              {/* Sub */}
              <span
                className="text-dark/40 text-xs mt-1 leading-snug"
                style={{ fontFamily: "Heebo, sans-serif" }}
              >
                {s.sub}
              </span>

              {/* Subtle corner accent */}
              <div
                className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full"
                style={{ background: `${s.accent}55` }}
              />
            </motion.div>
          ))}
        </StaggerContainer>

      </div>
    </section>
  );
}

/* ─── Dashboard mockup visual ─────────────────────── */
function CoupleVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto">

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#1E2820 0%,#141C10 100%)",
          border: "1px solid rgba(197,164,109,0.22)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(197,164,109,0.08)",
        }}
      >
        <svg
          viewBox="0 0 320 400"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="dash-header" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#252E1E" />
              <stop offset="100%" stopColor="#1C2418" />
            </linearGradient>
            <linearGradient id="gold-bar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C5A46D" />
              <stop offset="100%" stopColor="#E2C48A" />
            </linearGradient>
            <linearGradient id="progress-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C5A46D" />
              <stop offset="100%" stopColor="#A8843A" />
            </linearGradient>
            <linearGradient id="olive-fill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6B7B5A" />
              <stop offset="100%" stopColor="#4A5E3A" />
            </linearGradient>
            <linearGradient id="card-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#242E1C" />
              <stop offset="100%" stopColor="#1E2618" />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="320" height="400" fill="#161E10" />

          {/* Ambient glow top-right */}
          <ellipse cx="280" cy="60" rx="120" ry="90" fill="#C5A46D" fillOpacity="0.04" />
          <ellipse cx="60"  cy="340" rx="100" ry="70" fill="#6B7B5A" fillOpacity="0.05" />

          {/* ── TOP BAR ── */}
          <rect x="0" y="0" width="320" height="48" fill="url(#dash-header)" />
          <rect x="0" y="47" width="320" height="1" fill="#C5A46D" fillOpacity="0.15" />
          {/* Logo mark */}
          <rect x="14" y="16" width="18" height="18" rx="5" fill="#C5A46D" fillOpacity="0.18" stroke="#C5A46D" strokeWidth="0.8" strokeOpacity="0.5" />
          <text x="23" y="28" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#C5A46D" fontWeight="700">✦</text>
          <text x="40" y="28" fontFamily="Georgia,serif" fontSize="11" fill="rgba(255,255,255,0.85)" fontWeight="600">רגע לפני</text>
          {/* Nav dots */}
          <circle cx="260" cy="24" r="3" fill="rgba(197,164,109,0.5)" />
          <circle cx="272" cy="24" r="3" fill="rgba(255,255,255,0.12)" />
          <circle cx="284" cy="24" r="3" fill="rgba(255,255,255,0.12)" />
          {/* Avatar pair */}
          <circle cx="300" cy="24" r="7" fill="rgba(107,123,90,0.35)" stroke="#6B7B5A" strokeWidth="0.8" />
          <text x="300" y="27.5" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="7" fill="rgba(255,255,255,0.7)">זו</text>

          {/* ── COUNTDOWN ROW ── */}
          <rect x="12" y="56" width="296" height="52" rx="10" fill="url(#card-bg)" stroke="rgba(197,164,109,0.12)" strokeWidth="0.8" />
          <text x="24" y="72" fontFamily="Georgia,serif" fontSize="9" fill="rgba(197,164,109,0.65)">ימים לחתונה</text>
          {/* Countdown boxes */}
          {[
            { x: 24,  v: "47", l: "ימים"  },
            { x: 87,  v: "08", l: "שעות"  },
            { x: 150, v: "23", l: "דקות"  },
            { x: 213, v: "14", l: "שניות" },
          ].map(({ x, v, l }) => (
            <g key={l}>
              <rect x={x} y="78" width="52" height="22" rx="6" fill="rgba(197,164,109,0.1)" stroke="rgba(197,164,109,0.2)" strokeWidth="0.6" />
              <text x={x + 26} y="92" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" fontWeight="700" fill="#C5A46D">{v}</text>
              <text x={x + 26} y="106" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="7" fill="rgba(255,255,255,0.3)">{l}</text>
            </g>
          ))}

          {/* ── STAT CARDS ROW ── */}
          {[
            { x: 12,  w: 92,  val: "180",   sub: "מוזמנים",     color: "#C5A46D" },
            { x: 116, w: 92,  val: "143 ✓", sub: "אישרו הגעה", color: "#6B7B5A" },
            { x: 220, w: 88,  val: "12",    sub: "שולחנות",     color: "#C5A46D" },
          ].map(({ x, w, val, sub, color }) => (
            <g key={sub}>
              <rect x={x} y="120" width={w} height="46" rx="8" fill="url(#card-bg)" stroke="rgba(197,164,109,0.1)" strokeWidth="0.7" />
              <text x={x + w / 2} y="140" textAnchor="middle" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fill={color}>{val}</text>
              <text x={x + w / 2} y="156" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(255,255,255,0.35)">{sub}</text>
            </g>
          ))}

          {/* ── PROGRESS BAR ── */}
          <text x="12" y="182" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(255,255,255,0.35)">התקדמות אישורים</text>
          <text x="308" y="182" textAnchor="end" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(107,123,90,0.8)">79%</text>
          <rect x="12" y="186" width="296" height="6" rx="3" fill="rgba(255,255,255,0.05)" />
          <rect x="12" y="186" width="234" height="6" rx="3" fill="url(#progress-fill)" />

          {/* ── GUEST LIST ── */}
          <text x="12" y="208" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(255,255,255,0.3)" letterSpacing="1">רשימת מוזמנים</text>
          <text x="308" y="208" textAnchor="end" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(197,164,109,0.55)">הכל ←</text>

          {[
            { y: 216, name: "שרה ודוד לוי",   status: "✓ אישרו", statusColor: "rgba(107,123,90,0.9)", table: "שולחן 3", dot: "#6B7B5A" },
            { y: 234, name: "משפחת כהן",       status: "✓ אישרו", statusColor: "rgba(107,123,90,0.9)", table: "שולחן 1", dot: "#6B7B5A" },
            { y: 252, name: "מיכל אברהם",      status: "⏳ ממתין", statusColor: "rgba(197,164,109,0.7)", table: "—",       dot: "#C5A46D" },
            { y: 270, name: "רוני ואורית פרץ", status: "✓ אישרו", statusColor: "rgba(107,123,90,0.9)", table: "שולחן 5", dot: "#6B7B5A" },
            { y: 288, name: "יוסי ברקת",       status: "⏳ ממתין", statusColor: "rgba(197,164,109,0.7)", table: "—",       dot: "#C5A46D" },
          ].map(({ y, name, status, statusColor, table, dot }) => (
            <g key={y}>
              <rect x="12" y={y} width="296" height="16" rx="4" fill="rgba(255,255,255,0.025)" />
              <circle cx="22" cy={y + 8} r="4" fill={dot} fillOpacity="0.4" />
              <text x="32" y={y + 11} fontFamily="Arial,sans-serif" fontSize="9" fill="rgba(255,255,255,0.65)">{name}</text>
              <text x="210" y={y + 11} fontFamily="Arial,sans-serif" fontSize="8.5" fill={statusColor}>{status}</text>
              <text x="308" y={y + 11} textAnchor="end" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(255,255,255,0.25)">{table}</text>
            </g>
          ))}

          {/* ── SEATING MINI MAP ── */}
          <rect x="12" y="314" width="140" height="72" rx="8" fill="url(#card-bg)" stroke="rgba(197,164,109,0.1)" strokeWidth="0.7" />
          <text x="22" y="328" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(255,255,255,0.3)">פריסת שולחנות</text>
          {/* Tables */}
          {[
            [30, 340], [70, 340], [110, 340],
            [30, 362], [70, 362], [110, 362],
          ].map(([tx, ty], i) => (
            <g key={i}>
              <rect x={tx} y={ty} width="26" height="14" rx="4"
                fill={i < 4 ? "rgba(107,123,90,0.3)" : "rgba(197,164,109,0.18)"}
                stroke={i < 4 ? "rgba(107,123,90,0.5)" : "rgba(197,164,109,0.35)"}
                strokeWidth="0.6" />
              <text x={tx + 13} y={ty + 9} textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="6" fill="rgba(255,255,255,0.5)">{i + 1}</text>
            </g>
          ))}

          {/* ── BUDGET MINI ── */}
          <rect x="164" y="314" width="144" height="72" rx="8" fill="url(#card-bg)" stroke="rgba(197,164,109,0.1)" strokeWidth="0.7" />
          <text x="174" y="328" fontFamily="Arial,sans-serif" fontSize="8" fill="rgba(255,255,255,0.3)">תקציב ומתנות</text>
          <text x="174" y="346" fontFamily="Georgia,serif" fontSize="16" fontWeight="700" fill="#C5A46D">₪48,200</text>
          <text x="174" y="360" fontFamily="Arial,sans-serif" fontSize="7.5" fill="rgba(255,255,255,0.3)">מתוך ₪60,000</text>
          {/* Budget bar */}
          <rect x="174" y="365" width="124" height="4" rx="2" fill="rgba(255,255,255,0.05)" />
          <rect x="174" y="365" width="99" height="4" rx="2" fill="url(#progress-fill)" />
          <text x="174" y="382" fontFamily="Arial,sans-serif" fontSize="7" fill="rgba(107,123,90,0.7)">🎁 23 מתנות התקבלו</text>

          {/* Bottom gold line */}
          <rect x="0" y="398" width="320" height="2" fill="url(#gold-bar)" fillOpacity="0.35" />
        </svg>

        {/* Corner ornaments */}
        {(["top-3 right-3", "top-3 left-3 scale-x-[-1]", "bottom-3 right-3 scale-y-[-1]", "bottom-3 left-3 -scale-x-100 scale-y-[-1]"] as const).map((pos) => (
          <div key={pos} className={`absolute ${pos} opacity-30 pointer-events-none`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 2L9 2" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" />
              <path d="M2 2L2 9" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </motion.div>

      {/* Floating badge — bottom left */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2.5"
        style={{
          background: "linear-gradient(135deg,#6B7B5A,#4A5E3A)",
          animation: "float 4.5s ease-in-out 1s infinite",
        }}
      >
        <Sparkles size={15} color="rgba(255,255,255,0.7)" />
        <div>
          <p className="text-white text-xs font-semibold" style={{ fontFamily: "Heebo, sans-serif" }}>
            עדכון בזמן אמת
          </p>
          <p className="text-white/55 text-[10px]" style={{ fontFamily: "Heebo, sans-serif" }}>
            לשני בני הזוג
          </p>
        </div>
      </motion.div>

      {/* Live pill — top right */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-4 -right-4 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2"
        style={{
          background: "linear-gradient(135deg,rgba(197,164,109,0.95),rgba(212,188,138,0.95))",
          backdropFilter: "blur(8px)",
        }}
      >
        <Heart size={12} color="white" fill="white" />
        <p className="text-white text-[11px] font-semibold" style={{ fontFamily: "Heebo, sans-serif" }}>
          ליווי אישי תמיד
        </p>
      </motion.div>
    </div>
  );
}
