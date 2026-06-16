"use client";

import { Heart, Sparkles, Check, Shield, Users, Star, Infinity } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";
import { motion } from "framer-motion";

/* ─── Values list ─────────────────────────────────── */
const VALUES = [
  "יחס אישי לכל לקוח",
  "זמינות גבוהה וליווי לאורך התהליך",
  "התאמה מלאה לסגנון האירוע",
  "ירידה לפרטים הקטנים",
  "מחויבות לאיכות",
  "שירות מכל הלב",
];

/* ─── Stat cards ──────────────────────────────────── */
const STATS = [
  {
    value: "600+",
    label: "ימי מילואים",
    sub: "במלחמת חרבות ברזל",
    icon: Shield,
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
    את ״רגע לפני״ הקמתי מתוך אהבה לעיצוב, יצירתיות וטכנולוגיה, ומתוך רצון לעזור
    לאנשים להפוך את הרגעים החשובים בחייהם למיוחדים כבר מהרגע הראשון.
  </>,
  <>
    אני מאמין שהזמנה היא הרבה יותר מפרטי האירוע — היא הרושם הראשוני, ההתרגשות
    הראשונה וההצצה הראשונה למה שמצפה לאורחים.
  </>,
  <>
    מאז פרוץ מלחמת חרבות ברזל שירתתי למעלה מ‑600 ימי מילואים. לצד השירות המשמעותי,
    המשכתי לפתח את ״רגע לפני״ מתוך אמונה שגם בתקופות מאתגרות חשוב ליצור רגעים של
    שמחה, משפחה ואהבה.
  </>,
  <>
    התקופה הזו חיזקה בי ערכים של אחריות, מחויבות, אמינות, התמדה וירידה לפרטים —
    ערכים שמלווים אותי היום בכל הזמנה שאני יוצר ובכל לקוח שאני מלווה.
  </>,
  <>
    המטרה שלי היא להעניק לכל זוג, משפחה או חוגג חוויה אישית, מקצועית ומרגשת, עם
    עיצוב שמותאם בדיוק עבורם.
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
            הסיפור שלנו
          </p>
          <h2 className="section-title">קצת עליי</h2>
          <div className="gold-divider" />
          <p
            className="text-xl md:text-2xl font-light text-olive mt-2"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            נעים להכיר, אני דביר
          </p>
        </FadeIn>

        {/* ── Two-column: founder card + story ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start mb-12 md:mb-16">

          {/* Left — decorative invitation card */}
          <FadeIn direction="right" delay={0.12} className="order-2 lg:order-1">
            <FounderCard />
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
                הערכים שמובילים אותי
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

/* ─── Founder card (decorative invitation mockup) ─── */
function FounderCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto">

      {/* Invitation mockup */}
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
        {/* Concentric rings watermark */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.055]"
          viewBox="0 0 200 250"
          preserveAspectRatio="xMidYMid slice"
        >
          <circle cx="100" cy="125" r="60"  stroke="#C5A46D" strokeWidth="0.5"  fill="none" />
          <circle cx="100" cy="125" r="82"  stroke="#C5A46D" strokeWidth="0.3"  fill="none" />
          <circle cx="100" cy="125" r="104" stroke="#C5A46D" strokeWidth="0.15" fill="none" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
          {/* Olive branch icon */}
          <svg
            width="80"
            height="48"
            viewBox="0 0 80 48"
            fill="none"
            className="mb-5 animate-float"
          >
            <path d="M40 44 C40 44 30 32 22 20 C16 12 20 4 28 6" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M40 44 C40 44 50 32 58 20 C64 12 60 4 52 6" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <ellipse cx="22" cy="20" rx="7" ry="4" fill="#6B7B5A" transform="rotate(-30 22 20)" />
            <ellipse cx="28" cy="12" rx="6" ry="3.5" fill="#6B7B5A" transform="rotate(-20 28 12)" />
            <ellipse cx="58" cy="20" rx="7" ry="4" fill="#6B7B5A" transform="rotate(30 58 20)" />
            <ellipse cx="52" cy="12" rx="6" ry="3.5" fill="#6B7B5A" transform="rotate(20 52 12)" />
            <circle cx="40" cy="4" r="2" fill="#C5A46D" />
          </svg>

          <div className="w-10 h-px bg-gold mb-5" />
          <p
            className="text-xs tracking-[0.18em] text-gold mb-2 uppercase"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            מוזמנים לחגוג
          </p>
          <h3
            className="text-3xl font-bold text-dark text-center mb-2"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            נועה & אורי
          </h3>
          <p
            className="text-olive mb-6"
            style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 300 }}
          >
            מתחתנים!
          </p>
          <div className="w-7 h-px bg-gold mb-4" />
          <p
            className="text-dark/45 text-xs text-center"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            ה׳ בסיוון תשפ״ה
            <br />
            אולם השרון, תל אביב
          </p>
          <div className="w-7 h-px bg-gold mt-4" />
        </div>

        {/* Corner ornaments */}
        {(["top-4 right-4", "top-4 left-4 scale-x-[-1]", "bottom-4 right-4 scale-y-[-1]", "bottom-4 left-4 -scale-x-100 scale-y-[-1]"] as const).map((pos) => (
          <div key={pos} className={`absolute ${pos} opacity-25 pointer-events-none`}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M2 2L10 2" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" />
              <path d="M2 2L2 10" stroke="#C5A46D" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </motion.div>

      {/* Floating founder badge */}
      <div
        className="absolute -bottom-5 -left-5 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-2.5"
        style={{
          background: "linear-gradient(135deg,#6B7B5A,#4A5E3A)",
          animation: "float 4.5s ease-in-out 1s infinite",
        }}
      >
        <Sparkles size={16} color="rgba(255,255,255,0.7)" />
        <div>
          <p
            className="text-white text-xs font-semibold"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            דביר — מייסד רגע לפני
          </p>
          <p
            className="text-white/50 text-[10px]"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            עיצוב אישי מ‑₪70
          </p>
        </div>
      </div>

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
        <p
          className="text-white text-[11px] font-semibold"
          style={{ fontFamily: "Heebo, sans-serif" }}
        >
          יחס אישי תמיד
        </p>
      </motion.div>
    </div>
  );
}
