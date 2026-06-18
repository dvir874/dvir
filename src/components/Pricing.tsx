"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";
import { WA_URL_PRICING as WA_URL } from "@/lib/constants";

const packages = [
  {
    name: "עיצוב והזמנה",
    tagline: "הזמנה מעוצבת בהתאמה אישית — הרושם הראשון שהאורחים מקבלים.",
    highlight: false,
    badge: null as string | null,
    features: [
      "עיצוב אישי מותאם לאירוע שלכם",
      "התאמת סגנון, צבעים ואווירה",
      "קובץ מוכן לשליחה בוואטסאפ",
    ],
    cta: "קבלו הצעת מחיר",
  },
  {
    name: "הזמנה + דף אירוע",
    tagline: "הזמנה מעוצבת לצד דף אירוע אישי עם כל הפרטים שהאורחים צריכים — במקום אחד.",
    highlight: false,
    badge: null as string | null,
    features: [
      "עיצוב הזמנה אישית",
      "דף אירוע אישי עם קישור ייחודי",
      "מיקום האירוע עם ניווט Waze",
      "כל פרטי האירוע נגישים מכל מכשיר",
    ],
    cta: "קבלו הצעת מחיר",
  },
  {
    name: "ניהול אישורי הגעה",
    tagline: "אנחנו מנהלים עבורכם את אישורי ההגעה, התזכורות והמעקב אחר המוזמנים.",
    highlight: true,
    badge: "⭐ הפופולרי ביותר" as string | null,
    features: [
      "דף אירוע אישי",
      "אישורי הגעה בוואטסאפ",
      "מעקב תגובות מוזמנים",
      "תזכורות אוטומטיות לממתינים",
      "תמונת מצב מסודרת לפני האירוע",
    ],
    cta: "דברו איתנו",
  },
  {
    name: "ליווי מלא לאירוע",
    tagline: "הפתרון המלא הכולל עיצוב, הזמנות, אישורי הגעה, תזכורות ומעקב עד יום האירוע.",
    highlight: false,
    badge: "✦ פרימיום" as string | null,
    features: [
      "עיצוב פרימיום בהתאמה מלאה",
      "ניהול מלא של אישורי הגעה",
      "תזכורות ומעקב אוטומטיים",
      "שינויים ועדכונים ללא הגבלה",
      "ליווי אישי עד יום האירוע",
    ],
    cta: "בואו נדבר",
  },
];

const alwaysIncluded = [
  "ליווי אישי בוואטסאפ",
  "תיקונים עד שאתם מרוצים",
  "מסירה מהירה",
  "שירות אישי מתחילה ועד סוף",
];

export default function Pricing() {
  const scrollToContact = () =>
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="pricing"
      className="section-padding bg-white relative overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%,rgba(107,123,90,0.06) 0%,transparent 60%)," +
            "radial-gradient(ellipse at 70% 50%,rgba(197,164,109,0.06) 0%,transparent 60%)",
        }}
      />

      <div className="container-max mx-auto relative z-10">
        {/* ── Header ── */}
        <FadeIn className="text-center mb-10">
          <p
            className="text-gold text-xs tracking-[0.22em] mb-3 uppercase"
            style={{ fontFamily: "Heebo, sans-serif" }}
          >
            השירותים שלנו
          </p>
          <h2 className="section-title">מה אנחנו מציעים</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            בחרו את רמת השירות המתאימה לכם — ואנחנו נדאג לכל השאר
          </p>
        </FadeIn>

        {/* ── Always included strip ── */}
        <FadeIn delay={0.08} className="mb-10">
          <div
            className="rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            style={{
              background:
                "linear-gradient(135deg,rgba(107,123,90,0.06) 0%,rgba(197,164,109,0.06) 100%)",
              border: "1px solid rgba(197,164,109,0.22)",
            }}
          >
            <p
              className="text-dark font-semibold text-sm"
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              כלול בכל השירותים:
            </p>
            {alwaysIncluded.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(107,123,90,0.18)" }}
                >
                  <Check size={10} className="text-olive" />
                </div>
                <span
                  className="text-dark/65 text-sm"
                  style={{ fontFamily: "Heebo, sans-serif" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── Package cards ── */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start"
          staggerDelay={0.09}
          delayStart={0.05}
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={staggerItem}
              className={pkg.highlight ? "lg:-mt-5 sm:-mt-0" : ""}
            >
              <PricingCard pkg={pkg} onCta={scrollToContact} />
            </motion.div>
          ))}
        </StaggerContainer>

        {/* ── Trust section ── */}
        <FadeIn delay={0.3} className="mt-14">
          <div
            className="max-w-2xl mx-auto text-center rounded-2xl px-8 py-7"
            style={{
              background: "linear-gradient(135deg,rgba(197,164,109,0.07) 0%,rgba(107,123,90,0.05) 100%)",
              border: "1px solid rgba(197,164,109,0.20)",
            }}
          >
            <p
              className="text-xs tracking-[0.18em] uppercase mb-3"
              style={{ color: "rgba(197,164,109,0.80)", fontFamily: "Heebo, sans-serif" }}
            >
              ✦ הצעה מותאמת אישית
            </p>
            <h3
              className="text-xl font-bold mb-3"
              style={{ color: "#333333", fontFamily: "Frank Ruhl Libre, serif" }}
            >
              כל אירוע מקבל הצעת מחיר מותאמת
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(51,51,51,0.60)", fontFamily: "Heebo, sans-serif" }}
            >
              המחיר נקבע בהתאם לסוג האירוע, כמות המוזמנים והשירותים הנדרשים.
              <br />
              כך אנו יכולים להציע פתרון מדויק המותאם לצרכים שלכם — בלי לשלם על דברים שאינכם צריכים.
            </p>
          </div>
        </FadeIn>

        {/* ── WhatsApp CTA ── */}
        <FadeIn delay={0.4} className="mt-10 text-center">
          <p
            className="text-xl font-bold mb-2"
            style={{ color: "#333333", fontFamily: "Frank Ruhl Libre, serif" }}
          >
            רוצים לקבל הצעת מחיר?
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: "rgba(51,51,51,0.55)", fontFamily: "Heebo, sans-serif" }}
          >
            שלחו לנו כמה פרטים על האירוע שלכם ונחזור אליכם עם הצעה מותאמת.
          </p>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
              fontFamily: "Heebo, sans-serif",
              boxShadow: "0 8px 24px rgba(34,197,94,0.28)",
            }}
          >
            <MessageCircle size={18} strokeWidth={2} />
            שלחו הודעה בוואטסאפ
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

function PricingCard({
  pkg,
  onCta,
}: {
  pkg: (typeof packages)[0];
  onCta: () => void;
}) {
  const ctaStyle = pkg.highlight
    ? { background: "white", color: "#6B7B5A", boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }
    : { background: "linear-gradient(135deg,#6B7B5A,#4A5E3A)", color: "white", boxShadow: "0 4px 16px rgba(107,123,90,0.25)" };

  return (
    <motion.div
      whileHover={{ y: pkg.highlight ? -3 : -5 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-6 flex flex-col h-full"
      style={
        pkg.highlight
          ? { background: "linear-gradient(160deg,#6B7B5A 0%,#3E5435 100%)", boxShadow: "0 24px 64px rgba(107,123,90,0.28), 0 0 0 1px rgba(107,123,90,0.15)" }
          : { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.2)", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }
      }
    >
      {/* Badge */}
      {pkg.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-lg whitespace-nowrap"
            style={{
              background: pkg.highlight
                ? "linear-gradient(90deg,#C5A46D,#D4BC8A)"
                : "linear-gradient(90deg,#6B7B5A,#4A5E3A)",
              fontFamily: "Heebo, sans-serif",
            }}
          >
            {pkg.badge}
          </div>
        </div>
      )}

      {/* Name + tagline */}
      <div className="mb-5 mt-2">
        <h3
          className={`text-lg font-bold mb-2 ${pkg.highlight ? "text-white" : "text-dark"}`}
          style={{ fontFamily: "Frank Ruhl Libre, serif" }}
        >
          {pkg.name}
        </h3>
        <p
          className={`text-xs leading-relaxed ${pkg.highlight ? "text-white/70" : "text-dark/55"}`}
          style={{ fontFamily: "Heebo, sans-serif" }}
        >
          {pkg.tagline}
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-5"
        style={{ background: pkg.highlight ? "rgba(255,255,255,0.15)" : "rgba(197,164,109,0.2)" }}
      />

      {/* Feature list */}
      <ul className="flex flex-col gap-2.5 flex-1 mb-6">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: pkg.highlight ? "rgba(255,255,255,0.18)" : "rgba(107,123,90,0.13)" }}
            >
              <Check size={10} className={pkg.highlight ? "text-white" : "text-olive"} />
            </div>
            <span
              className={`text-xs leading-snug ${pkg.highlight ? "text-white/88" : "text-dark/65"}`}
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA — all scroll to contact */}
      <button
        onClick={onCta}
        className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ fontFamily: "Heebo, sans-serif", ...ctaStyle }}
      >
        {pkg.cta}
      </button>
    </motion.div>
  );
}
