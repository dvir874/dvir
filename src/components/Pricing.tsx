"use client";

import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";
import { WA_URL_PRICING as WA_URL } from "@/lib/constants";

const packages = [
  {
    name: "דף אירוע",
    tagline: "דף אירוע אישי עם אישורי הגעה — כל האורחים שלכם בלחיצה אחת.",
    highlight: false,
    badge: null as string | null,
    features: [
      "דף אירוע אישי עם קישור ייחודי",
      "אישורי הגעה בוואטסאפ לכל אורח",
      "מעקב תגובות בזמן אמת",
      "ניווט Waze / Google Maps",
      "Countdown לחתונה",
    ],
    cta: "קבלו הצעת מחיר",
  },
  {
    name: "ניהול מלא",
    tagline: "הפתרון המלא לניהול חתונה — מהאורח הראשון ועד יום האירוע.",
    highlight: true,
    badge: "⭐ הפופולרי ביותר" as string | null,
    features: [
      "דף אירוע + אישורי הגעה",
      "תזכורות אוטומטיות בוואטסאפ",
      "תכנון הושבה לפי שולחנות",
      "מעקב תקציב ומתנות",
      "לוח משימות לכל שלב",
      "לוח בקרה זוגי משותף",
    ],
    cta: "דברו איתנו",
  },
  {
    name: "ליווי VIP",
    tagline: "הכל, עם ליווי אישי אינטנסיבי — אנחנו מגדירים, מנהלים ומעדכנים בשמכם.",
    highlight: false,
    badge: "✦ פרימיום" as string | null,
    features: [
      "כל מה שב'ניהול מלא'",
      "אנחנו מגדירים את המערכת עבורכם",
      "עדכונים שוטפים ומעקב שבועי",
      "ליווי ישיר בוואטסאפ עד יום האירוע",
      "סיכום סופי לפני האירוע",
    ],
    cta: "בואו נדבר",
  },
];

const alwaysIncluded = [
  "הגדרה ראשונית עלינו",
  "ליווי אישי בוואטסאפ",
  "גישה מכל מכשיר",
  "לוח בקרה לשני בני הזוג",
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
            "radial-gradient(ellipse at 25% 50%,rgba(107,123,90,0.05) 0%,transparent 60%)," +
            "radial-gradient(ellipse at 75% 50%,rgba(197,164,109,0.05) 0%,transparent 60%)",
        }}
      />

      <div className="container-max mx-auto relative z-10">
        {/* Header */}
        <FadeIn className="text-center mb-10">
          <span className="section-eyebrow">השירותים שלנו</span>
          <h2 className="section-title">בחרו את רמת הניהול</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            כל חבילה כוללת הגדרה ראשונית מלאה — אתם מתחילים לעבוד ביום שאחרי
          </p>
        </FadeIn>

        {/* Always included strip */}
        <FadeIn delay={0.08} className="mb-12">
          <div
            className="rounded-2xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2"
            style={{
              background: "linear-gradient(135deg,rgba(107,123,90,0.05) 0%,rgba(197,164,109,0.05) 100%)",
              border: "1px solid rgba(197,164,109,0.2)",
            }}
          >
            <p className="text-dark font-semibold text-sm" style={{ fontFamily: "Heebo, sans-serif" }}>
              כלול בכל החבילות:
            </p>
            {alwaysIncluded.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(107,123,90,0.16)" }}
                >
                  <Check size={10} className="text-olive" />
                </div>
                <span className="text-dark/65 text-sm" style={{ fontFamily: "Heebo, sans-serif" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Cards — 3 column */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start max-w-4xl mx-auto"
          staggerDelay={0.1}
          delayStart={0.05}
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={staggerItem}
              className={pkg.highlight ? "sm:-mt-6" : ""}
            >
              <PricingCard pkg={pkg} onCta={scrollToContact} />
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Custom quote note */}
        <FadeIn delay={0.3} className="mt-14">
          <div
            className="max-w-2xl mx-auto text-center rounded-2xl px-8 py-7"
            style={{
              background: "linear-gradient(135deg,rgba(197,164,109,0.07) 0%,rgba(107,123,90,0.05) 100%)",
              border: "1px solid rgba(197,164,109,0.2)",
            }}
          >
            <p
              className="text-xs tracking-[0.18em] uppercase mb-3"
              style={{ color: "rgba(197,164,109,0.75)", fontFamily: "Heebo, sans-serif" }}
            >
              ✦ הצעת מחיר אישית
            </p>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "#333333", fontFamily: "Frank Ruhl Libre, serif" }}
            >
              המחיר נקבע לפי האירוע שלכם
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(51,51,51,0.58)", fontFamily: "Heebo, sans-serif" }}
            >
              כמות המוזמנים, סוג האירוע ורמת הליווי הנדרשת — כל אלה משפיעים על המחיר הסופי.
              <br />
              שלחו לנו כמה פרטים ונחזור אליכם תוך שעה עם הצעה מדויקת.
            </p>
          </div>
        </FadeIn>

        {/* WhatsApp CTA */}
        <FadeIn delay={0.4} className="mt-8 text-center">
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)",
              fontFamily: "Heebo, sans-serif",
              boxShadow: "0 8px 24px rgba(34,197,94,0.26)",
            }}
          >
            <MessageCircle size={18} strokeWidth={2} />
            קבלו הצעת מחיר בוואטסאפ
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
  const highlighted = pkg.highlight;

  return (
    <motion.div
      whileHover={{ y: highlighted ? -3 : -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl p-6 flex flex-col h-full"
      style={
        highlighted
          ? {
              background: "linear-gradient(160deg,#5A6E4A 0%,#3A5030 100%)",
              boxShadow: "0 24px 64px rgba(107,123,90,0.30), 0 0 0 1px rgba(107,123,90,0.2)",
            }
          : {
              background: "#FDFAF5",
              border: "1px solid rgba(197,164,109,0.2)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }
      }
    >
      {/* Badge */}
      {pkg.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-lg whitespace-nowrap"
            style={{
              background: highlighted
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
          className={`text-xl font-bold mb-2 ${highlighted ? "text-white" : "text-dark"}`}
          style={{ fontFamily: "Frank Ruhl Libre, serif" }}
        >
          {pkg.name}
        </h3>
        <p
          className={`text-xs leading-relaxed ${highlighted ? "text-white/70" : "text-dark/55"}`}
          style={{ fontFamily: "Heebo, sans-serif" }}
        >
          {pkg.tagline}
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-5"
        style={{ background: highlighted ? "rgba(255,255,255,0.14)" : "rgba(197,164,109,0.18)" }}
      />

      {/* Features */}
      <ul className="flex flex-col gap-3 flex-1 mb-7">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: highlighted ? "rgba(255,255,255,0.18)" : "rgba(107,123,90,0.14)" }}
            >
              <Check size={10} className={highlighted ? "text-white" : "text-olive"} />
            </div>
            <span
              className={`text-xs leading-snug ${highlighted ? "text-white/88" : "text-dark/68"}`}
              style={{ fontFamily: "Heebo, sans-serif" }}
            >
              {f}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCta}
        className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-250 hover:scale-[1.03] active:scale-95"
        style={{
          fontFamily: "Heebo, sans-serif",
          ...(highlighted
            ? { background: "white", color: "#4A6741", boxShadow: "0 4px 16px rgba(0,0,0,0.14)" }
            : { background: "linear-gradient(135deg,#6B7B5A,#4A5E3A)", color: "white", boxShadow: "0 4px 16px rgba(107,123,90,0.22)" }),
        }}
      >
        {pkg.cta}
      </button>
    </motion.div>
  );
}
