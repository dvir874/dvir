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
            {/* Backgrounds */}
            <linearGradient id="bg-wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0E8D8" />
              <stop offset="100%" stopColor="#EBE0CC" />
            </linearGradient>
            <linearGradient id="bg-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2D5BC" />
              <stop offset="100%" stopColor="#D8C9A8" />
            </linearGradient>
            {/* Window light */}
            <radialGradient id="win-light" cx="85%" cy="25%" r="55%">
              <stop offset="0%" stopColor="rgba(255,240,200,0.22)" />
              <stop offset="100%" stopColor="rgba(255,240,200,0)" />
            </radialGradient>
            {/* Sofa */}
            <linearGradient id="sofa-main" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C8A96E" />
              <stop offset="100%" stopColor="#A8884A" />
            </linearGradient>
            <linearGradient id="sofa-seat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BF9E60" />
              <stop offset="100%" stopColor="#9E7E42" />
            </linearGradient>
            <linearGradient id="sofa-arm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8953C" />
              <stop offset="100%" stopColor="#9A7A30" />
            </linearGradient>
            <linearGradient id="cushion-l" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4B870" />
              <stop offset="100%" stopColor="#BDA058" />
            </linearGradient>
            <linearGradient id="cushion-r" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D0B468" />
              <stop offset="100%" stopColor="#B89A52" />
            </linearGradient>
            {/* Table */}
            <linearGradient id="table-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4956A" />
              <stop offset="100%" stopColor="#A87A50" />
            </linearGradient>
            {/* Characters */}
            <linearGradient id="shirt-m" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A5568" />
              <stop offset="100%" stopColor="#2D3748" />
            </linearGradient>
            <linearGradient id="shirt-f" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9B8EAE" />
              <stop offset="100%" stopColor="#7B6E8E" />
            </linearGradient>
            <linearGradient id="skin-m" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8B888" />
              <stop offset="100%" stopColor="#D4A070" />
            </linearGradient>
            <linearGradient id="skin-f" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EAB890" />
              <stop offset="100%" stopColor="#D6A878" />
            </linearGradient>
            {/* Laptop screen */}
            <linearGradient id="screen-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A2820" />
              <stop offset="100%" stopColor="#141F18" />
            </linearGradient>
            <radialGradient id="screen-glow" cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="rgba(107,123,90,0.35)" />
              <stop offset="100%" stopColor="rgba(107,123,90,0)" />
            </radialGradient>
            {/* Plant pot */}
            <linearGradient id="pot-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C5A46D" />
              <stop offset="100%" stopColor="#A88240" />
            </linearGradient>
            {/* Shadows */}
            <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8A6A30" floodOpacity="0.12" />
            </filter>
            <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8A6A30" floodOpacity="0.10" />
            </filter>
            <filter id="char-shadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="#4A3820" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* ══ BACKGROUND ══ */}
          {/* Wall */}
          <rect width="320" height="260" fill="url(#bg-wall)" />
          {/* Floor */}
          <rect y="255" width="320" height="145" fill="url(#bg-floor)" />
          {/* Baseboard */}
          <rect y="253" width="320" height="5" rx="1" fill="rgba(160,130,80,0.18)" />
          {/* Window light overlay */}
          <rect width="320" height="400" fill="url(#win-light)" />

          {/* ══ WINDOW (top right) ══ */}
          <g opacity="0.9">
            {/* Frame */}
            <rect x="226" y="32" width="76" height="98" rx="4" fill="rgba(220,235,255,0.28)" stroke="rgba(197,164,109,0.3)" strokeWidth="1.5" />
            {/* Cross dividers */}
            <line x1="264" y1="32" x2="264" y2="130" stroke="rgba(197,164,109,0.22)" strokeWidth="1.2" />
            <line x1="226" y1="81" x2="302" y2="81" stroke="rgba(197,164,109,0.22)" strokeWidth="1.2" />
            {/* Light bloom */}
            <rect x="227" y="33" width="74" height="47" rx="2" fill="rgba(255,248,220,0.15)" />
            {/* Window sill */}
            <rect x="222" y="130" width="84" height="6" rx="2" fill="rgba(197,164,109,0.28)" />
          </g>
          {/* Window light rays on floor */}
          <polygon points="240,136 302,136 275,260 220,260" fill="rgba(255,245,200,0.06)" />

          {/* ══ DECORATIVE PLANT (left) ══ */}
          <g>
            {/* Pot */}
            <path d="M24 282 L36 282 L33 298 L27 298 Z" fill="url(#pot-grad)" />
            <rect x="22" y="279" width="16" height="5" rx="2.5" fill="#B8922E" opacity="0.85" />
            {/* Soil */}
            <ellipse cx="30" cy="281" rx="7" ry="2" fill="#7A5C2A" opacity="0.5" />
            {/* Stem */}
            <path d="M30 280 C29 265 25 248 22 232" stroke="#6B7B5A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            {/* Leaves — monstera style */}
            <ellipse cx="18" cy="232" rx="14" ry="7" fill="#7A8C6A" transform="rotate(-30,18,232)" />
            <ellipse cx="14" cy="244" rx="11" ry="6" fill="#6B7B5A" transform="rotate(-45,14,244)" />
            <ellipse cx="22" cy="220" rx="12" ry="5.5" fill="#8A9A78" transform="rotate(-15,22,220)" />
            <ellipse cx="28" cy="252" rx="10" ry="5" fill="#758568" transform="rotate(10,28,252)" />
            {/* Leaf veins */}
            <line x1="18" y1="232" x2="12" y2="226" stroke="rgba(107,123,90,0.35)" strokeWidth="0.7" />
            <line x1="14" y1="244" x2="8" y2="240" stroke="rgba(107,123,90,0.3)" strokeWidth="0.7" />
          </g>

          {/* ══ TAGLINE (top area) ══ */}
          <g>
            {/* Decorative lines */}
            <line x1="72" y1="36" x2="196" y2="36" stroke="#C5A46D" strokeWidth="0.6" opacity="0.35" />
            <circle cx="68" cy="36" r="2" fill="#C5A46D" opacity="0.3" />
            <circle cx="200" cy="36" r="2" fill="#C5A46D" opacity="0.3" />
            <text x="134" y="60" textAnchor="middle" fontFamily="Frank Ruhl Libre, Georgia, serif" fontSize="13" fill="rgba(60,44,24,0.50)" letterSpacing="0.3">פחות טלפונים.</text>
            <text x="134" y="79" textAnchor="middle" fontFamily="Frank Ruhl Libre, Georgia, serif" fontSize="13" fill="rgba(60,44,24,0.50)" letterSpacing="0.3">פחות כאב ראש.</text>
            <text x="134" y="100" textAnchor="middle" fontFamily="Frank Ruhl Libre, Georgia, serif" fontSize="14" fontWeight="600" fill="#C5A46D" letterSpacing="0.4">יותר זמן להתרגש.</text>
            <line x1="72" y1="113" x2="196" y2="113" stroke="#C5A46D" strokeWidth="0.6" opacity="0.35" />
          </g>

          {/* ══ SOFA ══ */}
          {/* Shadow under sofa */}
          <ellipse cx="160" cy="316" rx="130" ry="10" fill="rgba(80,60,20,0.09)" />
          {/* Back */}
          <rect x="38" y="208" width="244" height="46" rx="16" fill="url(#sofa-main)" filter="url(#drop-shadow)" />
          {/* Back highlight */}
          <rect x="42" y="210" width="236" height="8" rx="8" fill="rgba(255,255,255,0.10)" />
          {/* Left cushion */}
          <rect x="46" y="203" width="112" height="52" rx="13" fill="url(#cushion-l)" filter="url(#soft-shadow)" />
          <rect x="50" y="206" width="100" height="10" rx="6" fill="rgba(255,255,255,0.12)" />
          {/* Right cushion */}
          <rect x="162" y="203" width="112" height="52" rx="13" fill="url(#cushion-r)" filter="url(#soft-shadow)" />
          <rect x="166" y="206" width="100" height="10" rx="6" fill="rgba(255,255,255,0.10)" />
          {/* Center seam */}
          <line x1="160" y1="204" x2="160" y2="254" stroke="rgba(120,90,30,0.14)" strokeWidth="2.5" />
          {/* Seat */}
          <rect x="46" y="250" width="228" height="58" rx="10" fill="url(#sofa-seat)" />
          <rect x="50" y="252" width="220" height="10" rx="6" fill="rgba(255,255,255,0.08)" />
          {/* Left armrest */}
          <rect x="38" y="206" width="22" height="90" rx="11" fill="url(#sofa-arm)" filter="url(#soft-shadow)" />
          <rect x="40" y="208" width="16" height="6" rx="4" fill="rgba(255,255,255,0.12)" />
          {/* Right armrest */}
          <rect x="260" y="206" width="22" height="90" rx="11" fill="url(#sofa-arm)" filter="url(#soft-shadow)" />
          <rect x="262" y="208" width="16" height="6" rx="4" fill="rgba(255,255,255,0.10)" />
          {/* Base / skirt */}
          <rect x="52" y="302" width="216" height="10" rx="5" fill="#8A6A2A" />
          {/* Legs */}
          <rect x="68"  y="311" width="14" height="20" rx="4" fill="#7A5E22" />
          <rect x="238" y="311" width="14" height="20" rx="4" fill="#7A5E22" />
          {/* Throw pillow (left side) */}
          <rect x="52" y="218" width="32" height="30" rx="8" fill="#8C9E7A" opacity="0.75" />
          <rect x="54" y="220" width="28" height="6" rx="4" fill="rgba(255,255,255,0.14)" />
          <path d="M52 233 Q68 244 84 233" stroke="rgba(255,255,255,0.10)" strokeWidth="1" fill="none" />

          {/* ══ PERSON 1 — MALE (left, leaning slightly right) ══ */}
          <g filter="url(#char-shadow)">
            {/* Body / shirt */}
            <path d="M66 250 C66 230 76 222 96 220 L114 220 C134 222 140 230 140 250 L140 302 L66 302 Z" fill="url(#shirt-m)" rx="8" />
            {/* Collar */}
            <path d="M96 222 L105 232 L114 222" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            {/* Shoulder highlight */}
            <path d="M68 238 Q90 230 112 236" stroke="rgba(255,255,255,0.07)" strokeWidth="3" fill="none" />
            {/* Neck */}
            <path d="M97 214 C97 208 114 208 114 214 L114 226 C114 228 97 228 97 226 Z" fill="url(#skin-m)" />
            {/* Head */}
            <ellipse cx="105" cy="189" rx="26" ry="27" fill="url(#skin-m)" />
            {/* Ear */}
            <ellipse cx="79" cy="191" rx="5.5" ry="7" fill="#D4A070" />
            <path d="M80 187 Q82 191 80 195" stroke="#C09060" strokeWidth="0.8" fill="none" />
            {/* Chin shadow */}
            <ellipse cx="105" cy="210" rx="14" ry="5" fill="rgba(160,100,50,0.10)" />
            {/* Hair — short textured */}
            <path d="M79 182 C78 160 92 158 105 158 C118 158 132 160 131 182 C130 176 122 170 105 170 C88 170 80 176 79 182 Z" fill="#2A1A0E" />
            <path d="M79 182 C79 175 83 172 88 172" fill="none" stroke="#3A2418" strokeWidth="2" />
            {/* Temple */}
            <path d="M131 184 C132 175 128 164 119 161" fill="none" stroke="#2A1A0E" strokeWidth="3" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="96"  cy="192" rx="4.5" ry="3.5" fill="white" />
            <ellipse cx="96"  cy="193" rx="2.8" ry="2.8" fill="#4A3020" />
            <circle  cx="97"  cy="192" r="1"   fill="rgba(255,255,255,0.7)" />
            <ellipse cx="114" cy="192" rx="4.5" ry="3.5" fill="white" />
            <ellipse cx="114" cy="193" rx="2.8" ry="2.8" fill="#4A3020" />
            <circle  cx="115" cy="192" r="1"   fill="rgba(255,255,255,0.7)" />
            {/* Eyebrows */}
            <path d="M91 186 Q96 183 101 185" stroke="#3A2018" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M109 185 Q114 183 119 186" stroke="#3A2018" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Nose */}
            <path d="M103 198 Q105 204 107 198" stroke="#C09060" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
            {/* Smile */}
            <path d="M97 205 Q105 211 113 205" stroke="#C08850" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.65" />
            {/* Arm — reaching toward partner */}
            <path d="M132 256 C144 250 155 250 165 253" stroke="#4A5568" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M132 256 C144 250 155 250 165 253" stroke="rgba(255,255,255,0.06)" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Hand */}
            <ellipse cx="168" cy="253" rx="9" ry="8" fill="url(#skin-m)" />
          </g>

          {/* ══ PERSON 2 — FEMALE (right, leaning toward partner) ══ */}
          <g filter="url(#char-shadow)">
            {/* Body / shirt */}
            <path d="M180 250 C180 230 186 222 205 220 L222 220 C240 222 252 230 252 250 L252 302 L180 302 Z" fill="url(#shirt-f)" />
            {/* Collar */}
            <path d="M205 222 L213 232 L222 222" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.5" />
            <path d="M182 238 Q212 230 248 236" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
            {/* Neck */}
            <path d="M202 216 C202 210 220 210 220 216 L220 228 C220 230 202 230 202 228 Z" fill="url(#skin-f)" />
            {/* Head */}
            <ellipse cx="211" cy="191" rx="25" ry="27" fill="url(#skin-f)" />
            {/* Ear */}
            <ellipse cx="237" cy="193" rx="5" ry="6.5" fill="#D8A878" />
            {/* Chin shadow */}
            <ellipse cx="211" cy="212" rx="13" ry="5" fill="rgba(160,100,50,0.10)" />
            {/* Hair — long, flowing */}
            <path d="M187 186 C186 162 196 156 211 155 C226 156 236 162 235 186" fill="#221408" />
            <path d="M187 186 C186 200 186 240 190 262" fill="#221408" stroke="#2A1A0A" strokeWidth="1" />
            <path d="M235 186 C236 200 235 238 232 258" fill="#221408" stroke="#2A1A0A" strokeWidth="1" />
            {/* Hair highlight */}
            <path d="M200 157 C205 154 216 154 222 157" stroke="rgba(120,80,40,0.25)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="201" cy="192" rx="4.5" ry="3.5" fill="white" />
            <ellipse cx="201" cy="193" rx="2.8" ry="2.8" fill="#3A2818" />
            <circle  cx="202" cy="192" r="1"   fill="rgba(255,255,255,0.7)" />
            <ellipse cx="220" cy="192" rx="4.5" ry="3.5" fill="white" />
            <ellipse cx="220" cy="193" rx="2.8" ry="2.8" fill="#3A2818" />
            <circle  cx="221" cy="192" r="1"   fill="rgba(255,255,255,0.7)" />
            {/* Eyebrows — arched */}
            <path d="M196 185 Q201 182 206 184" stroke="#3A2018" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M215 184 Q220 181 225 185" stroke="#3A2018" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            {/* Lashes top */}
            <path d="M197 189 Q201 187 206 189" stroke="#2A1808" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M215 189 Q220 187 225 189" stroke="#2A1808" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* Nose */}
            <path d="M209 199 Q211 205 213 199" stroke="#C09868" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.55" />
            {/* Smile */}
            <path d="M203 207 Q211 214 219 207" stroke="#C08858" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.60" />
            {/* Arm toward partner */}
            <path d="M188 257 C178 251 171 250 163 253" stroke="#9B8EAE" strokeWidth="13" strokeLinecap="round" fill="none" />
            <path d="M188 257 C178 251 171 250 163 253" stroke="rgba(255,255,255,0.06)" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Hand */}
            <ellipse cx="160" cy="253" rx="9" ry="8" fill="url(#skin-f)" />
          </g>

          {/* Hands touching - warm overlap */}
          <ellipse cx="163" cy="253" rx="7" ry="6" fill="rgba(220,170,120,0.55)" />

          {/* ══ COFFEE TABLE ══ */}
          {/* Shadow */}
          <ellipse cx="160" cy="360" rx="115" ry="8" fill="rgba(80,55,20,0.08)" />
          {/* Table top */}
          <rect x="54" y="334" width="212" height="16" rx="8" fill="url(#table-top)" filter="url(#drop-shadow)" />
          {/* Top sheen */}
          <rect x="58" y="335" width="200" height="5" rx="3" fill="rgba(255,255,255,0.14)" />
          {/* Legs */}
          <rect x="72"  y="349" width="13" height="26" rx="4" fill="#9A7040" />
          <rect x="235" y="349" width="13" height="26" rx="4" fill="#9A7040" />

          {/* ══ LAPTOP (on table) ══ */}
          {/* Base / keyboard */}
          <rect x="88" y="320" width="88" height="17" rx="5" fill="#1E1E1E" />
          <rect x="90" y="322" width="84" height="4" rx="2" fill="rgba(255,255,255,0.05)" />
          {/* Keyboard rows */}
          <rect x="92" y="328" width="80" height="2" rx="1" fill="rgba(255,255,255,0.04)" />
          <rect x="92" y="332" width="72" height="2" rx="1" fill="rgba(255,255,255,0.03)" />
          {/* Hinge */}
          <rect x="88" y="318" width="88" height="4" rx="2" fill="#141414" />
          {/* Screen outer */}
          <path d="M90 318 L174 318 L169 274 L95 274 Z" fill="#1E1E1E" />
          {/* Screen bezel */}
          <path d="M92 316 L172 316 L167 276 L97 276 Z" fill="url(#screen-bg)" />
          {/* Screen glow */}
          <ellipse cx="132" cy="296" rx="45" ry="24" fill="url(#screen-glow)" />
          {/* Platform UI — header bar */}
          <rect x="98" y="278" width="68" height="7" rx="2" fill="#C5A46D" opacity="0.55" />
          <text x="132" y="284" textAnchor="middle" fontFamily="Heebo, sans-serif" fontSize="4" fill="rgba(255,255,255,0.7)" letterSpacing="0.3">רגע לפני</text>
          {/* Sidebar */}
          <rect x="98" y="286" width="14" height="28" rx="2" fill="rgba(197,164,109,0.15)" />
          <rect x="100" y="289" width="10" height="2" rx="1" fill="rgba(197,164,109,0.4)" />
          <rect x="100" y="293" width="10" height="2" rx="1" fill="rgba(107,123,90,0.35)" />
          <rect x="100" y="297" width="8"  height="2" rx="1" fill="rgba(107,123,90,0.25)" />
          <rect x="100" y="301" width="9"  height="2" rx="1" fill="rgba(107,123,90,0.2)" />
          <rect x="100" y="305" width="7"  height="2" rx="1" fill="rgba(107,123,90,0.15)" />
          {/* Main content area */}
          <rect x="113" y="286" width="52" height="28" rx="2" fill="rgba(255,255,255,0.04)" />
          {/* Guest list rows */}
          <rect x="115" y="289" width="28" height="2.5" rx="1" fill="rgba(107,123,90,0.45)" />
          <rect x="146" y="289" width="16" height="2.5" rx="1" fill="rgba(107,123,90,0.2)" />
          <rect x="115" y="294" width="32" height="2.5" rx="1" fill="rgba(197,164,109,0.45)" />
          <rect x="150" y="294" width="12" height="2.5" rx="1" fill="rgba(107,123,90,0.25)" />
          <rect x="115" y="299" width="24" height="2.5" rx="1" fill="rgba(107,123,90,0.35)" />
          <rect x="142" y="299" width="20" height="2.5" rx="1" fill="rgba(107,123,90,0.18)" />
          <rect x="115" y="304" width="30" height="2.5" rx="1" fill="rgba(197,164,109,0.30)" />
          <rect x="148" y="304" width="14" height="2.5" rx="1" fill="rgba(107,123,90,0.22)" />
          <rect x="115" y="309" width="20" height="2.5" rx="1" fill="rgba(107,123,90,0.22)" />
          {/* Status chip */}
          <rect x="148" y="308" width="15" height="4" rx="2" fill="rgba(107,123,90,0.35)" />
          {/* Screen reflection */}
          <path d="M98 276 L112 276 L108 316 L94 316 Z" fill="white" opacity="0.025" />

          {/* ══ COFFEE CUP (right of laptop) ══ */}
          <g transform="translate(195, 326)">
            {/* Saucer */}
            <ellipse cx="12" cy="16" rx="14" ry="4" fill="#C4956A" opacity="0.55" />
            {/* Cup body */}
            <path d="M4 6 L5 16 L19 16 L20 6 Z" fill="#F5EEE0" />
            <path d="M4 6 Q12 8 20 6" fill="none" stroke="#E0D0B0" strokeWidth="1" />
            {/* Cup highlight */}
            <path d="M5 8 L6 13" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
            {/* Handle */}
            <path d="M20 8 Q28 8 28 12 Q28 16 20 16" fill="none" stroke="#E0D0B0" strokeWidth="1.5" strokeLinecap="round" />
            {/* Steam */}
            <path d="M9 4 Q10 0 9 -3" stroke="rgba(197,164,109,0.3)" strokeWidth="1" fill="none" strokeLinecap="round" />
            <path d="M14 3 Q15 -1 14 -4" stroke="rgba(197,164,109,0.22)" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>

          {/* ══ NOTEBOOK (right side, angled) ══ */}
          <g transform="rotate(5,248,330)">
            <rect x="230" y="318" width="52" height="22" rx="3" fill="#F5EEE0" />
            <rect x="254" y="318" width="2.5" height="22" fill="#DCC898" />
            {/* Spine */}
            <rect x="230" y="318" width="5" height="22" fill="#E8D8A8" />
            {/* Lines */}
            <line x1="234" y1="325" x2="252" y2="325" stroke="#C5A46D" strokeWidth="0.7" opacity="0.4" />
            <line x1="234" y1="329" x2="252" y2="329" stroke="#C5A890" strokeWidth="0.6" opacity="0.28" />
            <line x1="234" y1="333" x2="250" y2="333" stroke="#C5A890" strokeWidth="0.6" opacity="0.18" />
            <line x1="257" y1="325" x2="280" y2="325" stroke="#C5A46D" strokeWidth="0.7" opacity="0.4" />
            <line x1="257" y1="329" x2="280" y2="329" stroke="#C5A890" strokeWidth="0.6" opacity="0.28" />
            <line x1="257" y1="333" x2="278" y2="333" stroke="#C5A890" strokeWidth="0.6" opacity="0.18" />
          </g>

          {/* ══ GOLD SPARKLES ══ */}
          {/* Top area */}
          <g opacity="0.55">
            <path d="M50 130 L51.5 134 L55 135.5 L51.5 137 L50 141 L48.5 137 L45 135.5 L48.5 134 Z" fill="#C5A46D" opacity="0.35" />
            <path d="M270 118 L271 121 L274 122 L271 123 L270 126 L269 123 L266 122 L269 121 Z" fill="#C5A46D" opacity="0.28" />
            <circle cx="285" cy="145" r="1.8" fill="#C5A46D" opacity="0.22" />
            <circle cx="44"  cy="158" r="1.4" fill="#C5A46D" opacity="0.20" />
            <circle cx="296" cy="168" r="1"   fill="#C5A46D" opacity="0.15" />
          </g>
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
