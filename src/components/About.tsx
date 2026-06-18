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

/* ─── Couple emotional visual ─────────────────────── */
function CoupleVisual() {
  return (
    <div className="relative w-full max-w-sm mx-auto">

      {/* Main illustration card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: "linear-gradient(160deg,#F6F1E8,#EDE6D6)",
          border: "1px solid rgba(197,164,109,0.3)",
          aspectRatio: "4/5",
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
            <radialGradient id="cv-warm" cx="50%" cy="48%" r="55%">
              <stop offset="0%" stopColor="rgba(197,164,109,0.13)" />
              <stop offset="100%" stopColor="rgba(197,164,109,0)" />
            </radialGradient>
            <radialGradient id="cv-screen" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(107,123,90,0.28)" />
              <stop offset="100%" stopColor="rgba(107,123,90,0)" />
            </radialGradient>
            <linearGradient id="cv-body1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3D4A6B" />
              <stop offset="100%" stopColor="#2C3657" />
            </linearGradient>
            <linearGradient id="cv-body2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B7EA0" />
              <stop offset="100%" stopColor="#7A6D8E" />
            </linearGradient>
            <linearGradient id="cv-sofa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D8C89A" />
              <stop offset="100%" stopColor="#C0AA78" />
            </linearGradient>
            <linearGradient id="cv-table" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B09060" />
              <stop offset="100%" stopColor="#9A7A4A" />
            </linearGradient>
            <filter id="cv-shadow">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.07" />
            </filter>
          </defs>

          {/* ── Background ── */}
          <rect width="320" height="400" fill="#F6F1E8" />
          <rect width="320" height="400" fill="url(#cv-warm)" />

          {/* Subtle concentric rings */}
          <circle cx="160" cy="210" r="95"  stroke="#C5A46D" strokeWidth="0.45" fill="none" opacity="0.045" />
          <circle cx="160" cy="210" r="135" stroke="#C5A46D" strokeWidth="0.3"  fill="none" opacity="0.025" />
          <circle cx="160" cy="210" r="170" stroke="#C5A46D" strokeWidth="0.15" fill="none" opacity="0.015" />

          {/* ── Emotional tagline (top of card) ── */}
          <line x1="100" y1="30" x2="220" y2="30" stroke="#C5A46D" strokeWidth="0.5" opacity="0.4" />
          <text x="160" y="54"  textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontSize="13.5" fill="rgba(51,40,28,0.52)">פחות טלפונים.</text>
          <text x="160" y="74"  textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontSize="13.5" fill="rgba(51,40,28,0.52)">פחות כאב ראש.</text>
          <text x="160" y="96"  textAnchor="middle" fontFamily="Frank Ruhl Libre, serif" fontSize="14.5" fontWeight="500" fill="#C5A46D">יותר זמן להתרגש.</text>
          <line x1="100" y1="110" x2="220" y2="110" stroke="#C5A46D" strokeWidth="0.5" opacity="0.4" />

          {/* ── Background plant (left side) ── */}
          <g opacity="0.3">
            <line x1="32" y1="260" x2="28" y2="190" stroke="#6B7B5A" strokeWidth="1.4" strokeLinecap="round" />
            <ellipse cx="24" cy="182" rx="12" ry="6.5" fill="#6B7B5A" transform="rotate(-18,24,182)" />
            <ellipse cx="33" cy="165" rx="10" ry="5.5" fill="#6B7B5A" transform="rotate(-32,33,165)" />
            <line x1="32" y1="230" x2="18" y2="208" stroke="#6B7B5A" strokeWidth="1.1" strokeLinecap="round" />
            <ellipse cx="15" cy="202" rx="9" ry="5" fill="#6B7B5A" transform="rotate(18,15,202)" />
            {/* Pot */}
            <path d="M26 260 L38 260 L34 274 L30 274 Z" fill="#C5A46D" opacity="0.55" />
            <rect x="24" y="257" width="16" height="4" rx="2" fill="#B07E44" opacity="0.6" />
          </g>

          {/* ── Wall / floor division ── */}
          <rect x="0" y="125" width="320" height="275" fill="rgba(238,228,208,0.25)" />
          <line x1="0" y1="125" x2="320" y2="125" stroke="rgba(197,164,109,0.06)" strokeWidth="1" />

          {/* ── Window hint (top right, barely visible) ── */}
          <rect x="234" y="130" width="62" height="76" rx="3" stroke="rgba(197,164,109,0.08)" strokeWidth="1.2" fill="rgba(197,164,109,0.025)" />
          <line x1="265" y1="130" x2="265" y2="206" stroke="rgba(197,164,109,0.06)" strokeWidth="0.8" />
          <line x1="234" y1="168" x2="296" y2="168" stroke="rgba(197,164,109,0.06)" strokeWidth="0.8" />

          {/* ── SOFA ── */}
          {/* Back rest */}
          <rect x="42" y="220" width="236" height="36" rx="14" fill="url(#cv-sofa)" filter="url(#cv-shadow)" />
          {/* Left cushion */}
          <rect x="50" y="215" width="108" height="44" rx="12" fill="#D8C89E" />
          {/* Right cushion */}
          <rect x="162" y="215" width="108" height="44" rx="12" fill="#D8C89E" />
          {/* Cushion seam shadow */}
          <line x1="161" y1="216" x2="161" y2="258" stroke="rgba(160,130,70,0.18)" strokeWidth="2" />
          {/* Seat */}
          <rect x="50" y="254" width="220" height="52" rx="8" fill="#CCB882" />
          {/* Left armrest */}
          <rect x="42" y="218" width="20" height="80" rx="10" fill="#BCA876" />
          {/* Right armrest */}
          <rect x="258" y="218" width="20" height="80" rx="10" fill="#BCA876" />
          {/* Sofa base */}
          <rect x="56" y="296" width="208" height="12" rx="6" fill="#A48E5E" />
          {/* Legs */}
          <rect x="72"  y="306" width="12" height="22" rx="4" fill="#8A7445" />
          <rect x="236" y="306" width="12" height="22" rx="4" fill="#8A7445" />

          {/* ── PERSON 1 (LEFT — MALE) ── */}
          {/* Body */}
          <rect x="70" y="232" width="74" height="70" rx="24" fill="url(#cv-body1)" />
          {/* Neck */}
          <rect x="97" y="214" width="18" height="22" rx="8" fill="#D4A070" />
          {/* Head */}
          <circle cx="106" cy="192" r="27" fill="#DBA878" />
          {/* Hair — short, dark */}
          <path d="M80 188 Q81 162 106 162 Q131 162 132 186 L130 191 Q118 178 106 178 Q94 178 80 191 Z" fill="#3A2218" />
          {/* Left ear */}
          <ellipse cx="79" cy="193" rx="5" ry="7" fill="#CE9A6A" />
          {/* Minimal face */}
          <ellipse cx="98"  cy="196" rx="2.2" ry="2.8" fill="#C08850" opacity="0.55" />
          <ellipse cx="114" cy="196" rx="2.2" ry="2.8" fill="#C08850" opacity="0.55" />
          <path d="M100 205 Q106 210 112 205" stroke="#B87840" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5" />
          {/* Right arm reaching toward partner */}
          <path d="M136 258 Q160 250 173 253" stroke="#3D4A6B" strokeWidth="13" strokeLinecap="round" fill="none" />

          {/* ── PERSON 2 (RIGHT — FEMALE) ── */}
          {/* Body */}
          <rect x="176" y="234" width="74" height="68" rx="24" fill="url(#cv-body2)" />
          {/* Neck */}
          <rect x="203" y="217" width="16" height="21" rx="7" fill="#D4A070" />
          {/* Head */}
          <circle cx="211" cy="196" r="25" fill="#DBA878" />
          {/* Hair — long, dark */}
          <path d="M187 192 Q188 166 211 164 Q234 166 235 192" fill="#2E1A10" />
          {/* Side strands */}
          <rect x="186" y="190" width="9"  height="54" rx="5" fill="#2E1A10" />
          <rect x="226" y="190" width="9"  height="48" rx="5" fill="#2E1A10" />
          {/* Right ear */}
          <ellipse cx="237" cy="197" rx="5" ry="7" fill="#CE9A6A" />
          {/* Minimal face */}
          <ellipse cx="203" cy="200" rx="2"  ry="2.5" fill="#C08850" opacity="0.5" />
          <ellipse cx="218" cy="200" rx="2"  ry="2.5" fill="#C08850" opacity="0.5" />
          <path d="M205 208 Q211 213 217 208" stroke="#B87840" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.45" />
          {/* Left arm toward partner */}
          <path d="M184 257 Q169 250 159 253" stroke="#8B7EA0" strokeWidth="12" strokeLinecap="round" fill="none" />

          {/* Hands meeting — skin tone oval */}
          <ellipse cx="159" cy="254" rx="11" ry="9" fill="#D4A070" opacity="0.88" />

          {/* Soft heart between / above heads */}
          <g opacity="0.18" transform="translate(151,157)">
            <path d="M9 4C9 1.5 7 0 4.5 0S0 1.5 0 4c0 3 9 10 9 10s9-7 9-10c0-2.5-2-4-4.5-4S9 1.5 9 4z" fill="#C5A46D" transform="scale(0.9)" />
          </g>

          {/* ── FLOOR SHADOW ── */}
          <ellipse cx="160" cy="340" rx="138" ry="14" fill="rgba(107,90,55,0.055)" />

          {/* ── COFFEE TABLE ── */}
          <rect x="58"  y="308" width="204" height="14" rx="7" fill="url(#cv-table)" filter="url(#cv-shadow)" />
          {/* Surface sheen */}
          <rect x="62"  y="309" width="196" height="4"  rx="2" fill="rgba(255,255,255,0.1)" />
          {/* Legs */}
          <rect x="76"  y="321" width="11" height="24" rx="4" fill="#8A6A38" />
          <rect x="233" y="321" width="11" height="24" rx="4" fill="#8A6A38" />

          {/* ── LAPTOP (center, on table) ── */}
          {/* Base */}
          <rect x="90" y="295" width="82" height="16" rx="4" fill="#252525" />
          {/* Screen */}
          <path d="M92 295 L170 295 L165 260 L97 260 Z" fill="#1C2C18" />
          {/* Screen inner */}
          <path d="M94 293 L168 293 L163 262 L99 262 Z" fill="#233A1E" />
          {/* Screen glow emanating */}
          <ellipse cx="131" cy="278" rx="42" ry="20" fill="url(#cv-screen)" opacity="0.7" />
          {/* Platform UI — gold header */}
          <rect x="99" y="264" width="62" height="5" rx="1.5" fill="#C5A46D" opacity="0.6" />
          {/* Three status dots */}
          <circle cx="103" cy="266.5" r="2"   fill="rgba(197,164,109,0.55)" />
          <circle cx="109" cy="266.5" r="2"   fill="rgba(197,164,109,0.4)" />
          <circle cx="115" cy="266.5" r="2"   fill="rgba(107,123,90,0.45)" />
          {/* UI rows */}
          <rect x="99" y="272" width="30" height="3" rx="1" fill="#6B7B5A" opacity="0.5" />
          <rect x="132" y="272" width="18" height="3" rx="1" fill="#C5A46D" opacity="0.38" />
          <rect x="99" y="278" width="24" height="3" rx="1" fill="#6B7B5A" opacity="0.35" />
          <rect x="126" y="278" width="22" height="3" rx="1" fill="#8B9A78" opacity="0.28" />
          <rect x="99" y="284" width="34" height="3" rx="1" fill="#6B7B5A" opacity="0.22" />
          {/* Screen reflection */}
          <path d="M99 262 L110 262 L107 293 L96 293 Z" fill="white" opacity="0.03" />

          {/* ── NOTEBOOK (right of laptop, slightly rotated) ── */}
          <g transform="rotate(4,202,296)">
            <rect x="178" y="286" width="54" height="24" rx="3" fill="#F5EEE0" />
            <rect x="202" y="286" width="2"  height="24" fill="#D0BC94" />
            {/* Left page lines */}
            <line x1="181" y1="293" x2="199" y2="293" stroke="#C5A46D" strokeWidth="0.7" opacity="0.42" />
            <line x1="181" y1="297" x2="199" y2="297" stroke="#B8A890" strokeWidth="0.6" opacity="0.3" />
            <line x1="181" y1="301" x2="196" y2="301" stroke="#B8A890" strokeWidth="0.6" opacity="0.2" />
            {/* Right page lines */}
            <line x1="205" y1="293" x2="229" y2="293" stroke="#C5A46D" strokeWidth="0.7" opacity="0.42" />
            <line x1="205" y1="297" x2="229" y2="297" stroke="#B8A890" strokeWidth="0.6" opacity="0.28" />
            <line x1="205" y1="301" x2="226" y2="301" stroke="#B8A890" strokeWidth="0.6" opacity="0.18" />
          </g>

          {/* ── PAPERS / GUEST LIST (left side of table) ── */}
          <g transform="rotate(-7,72,300)">
            <rect x="59" y="292" width="26" height="20" rx="2" fill="white"  opacity="0.82" />
            <line x1="62" y1="298" x2="82" y2="298" stroke="#D4C090" strokeWidth="0.8" opacity="0.45" />
            <line x1="62" y1="302" x2="82" y2="302" stroke="#D4C090" strokeWidth="0.8" opacity="0.3" />
            <line x1="62" y1="306" x2="79" y2="306" stroke="#D4C090" strokeWidth="0.8" opacity="0.2" />
          </g>
          {/* Second paper (slightly behind) */}
          <g transform="rotate(5,74,302)">
            <rect x="62" y="294" width="24" height="18" rx="2" fill="rgba(255,255,255,0.62)" />
          </g>

          {/* ── PHONE (far right) ── */}
          <rect x="247" y="289" width="13" height="22" rx="3.5" fill="#222222" />
          <rect x="248.5" y="291" width="10" height="18" rx="2.5" fill="#1D3120" />
          {/* Notification dot */}
          <circle cx="259" cy="290" r="3.5" fill="#C5A46D" opacity="0.8" />

          {/* ── Sparkle accents (top area) ── */}
          <circle cx="52"  cy="140" r="1.8" fill="#C5A46D" opacity="0.3" />
          <circle cx="268" cy="133" r="1.5" fill="#C5A46D" opacity="0.22" />
          <circle cx="280" cy="150" r="1"   fill="#C5A46D" opacity="0.18" />
          <circle cx="46"  cy="160" r="1"   fill="#C5A46D" opacity="0.15" />
        </svg>

        {/* Corner ornaments */}
        {(["top-4 right-4", "top-4 left-4 scale-x-[-1]", "bottom-4 right-4 scale-y-[-1]", "bottom-4 left-4 -scale-x-100 scale-y-[-1]"] as const).map((pos) => (
          <div key={pos} className={`absolute ${pos} opacity-20 pointer-events-none`}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M2 2L10 2" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" />
              <path d="M2 2L2 10" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </motion.div>

      {/* Calm floating badge — bottom left */}
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
            ניהול מלא של החתונה
          </p>
          <p className="text-white/55 text-[10px]" style={{ fontFamily: "Heebo, sans-serif" }}>
            הכל במקום אחד
          </p>
        </div>
      </motion.div>

      {/* Personal touch pill — top right */}
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
