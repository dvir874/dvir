"use client";

import { motion } from "framer-motion";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";

const outcomes = [
  {
    emoji: "🤍",
    title: "מגיעים לחתונה רגועים",
    body: "לא צריך לנהל כלום ביום עצמו. שבוע לפני אתם יודעים בדיוק מי מגיע, מי יושב איפה, ומה עוד פתוח — ואחר כך פשוט נהנים.",
    accent: "#C5A46D",
    accentBg: "rgba(197,164,109,0.08)",
    accentBorder: "rgba(197,164,109,0.2)",
  },
  {
    emoji: "✓",
    title: "אפס מרדפים אחרי אישורים",
    body: "התזכורות בוואטסאפ יוצאות אוטומטית בשמכם. אתם פותחים את לוח הבקרה ורואים שורה ירוקה ארוכה של 'אישר הגעה'.",
    accent: "#6B7B5A",
    accentBg: "rgba(107,123,90,0.07)",
    accentBorder: "rgba(107,123,90,0.18)",
  },
  {
    emoji: "📊",
    title: "תקציב תחת שליטה",
    body: "מי שילם מה, כמה נשאר, כמה מתנות נכנסו — הכל בלוח אחד. שניכם רואים את אותה תמונה, בזמן אמת, מכל מכשיר.",
    accent: "#C5A46D",
    accentBg: "rgba(197,164,109,0.08)",
    accentBorder: "rgba(197,164,109,0.2)",
  },
  {
    emoji: "🪑",
    title: "הושבה שמסתדרת לבד",
    body: "גוררים אורחים לשולחנות, רואים מיד את כל הפריסה, ומפסיקים לריב על מי יושב עם מי. זה פחות כואב ממה שחשבתם.",
    accent: "#6B7B5A",
    accentBg: "rgba(107,123,90,0.07)",
    accentBorder: "rgba(107,123,90,0.18)",
  },
];

const promises = [
  "תוך 48 שעות המערכת מוכנה לשימוש",
  "ליווי אישי בוואטסאפ לאורך כל הדרך",
  "שניכם רואים הכל — ביחד, בזמן אמת",
  "מגיעים ליום הגדול — רגועים ונינוחים",
];

export default function Testimonials() {
  return (
    <section
      id="outcomes"
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-0 pattern-overlay opacity-40 pointer-events-none" />

      <div className="container-max mx-auto relative z-10">
        {/* Header */}
        <FadeIn className="text-center mb-14">
          <span className="section-eyebrow">מה מחכה לכם</span>
          <h2 className="section-title">התוצאה שאנחנו מבטיחים</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            לא תוכנה — ליווי. לא טפסים — שקט נפשי. לא רשימות — יום חתונה שאתם נוכחים בו.
          </p>
        </FadeIn>

        {/* Outcome cards */}
        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto"
          staggerDelay={0.1}
        >
          {outcomes.map((o) => (
            <motion.div
              key={o.title}
              variants={staggerItem}
              whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(197,164,109,0.14)" }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl p-7 flex flex-col gap-4 cursor-default"
              style={{
                background: "rgba(255,255,255,0.82)",
                border: `1px solid ${o.accentBorder}`,
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: o.accentBg, border: `1px solid ${o.accentBorder}` }}
              >
                {o.emoji}
              </div>
              <div>
                <h3
                  className="text-lg font-bold mb-2 leading-snug"
                  style={{ color: "#333333", fontFamily: "Frank Ruhl Libre, serif" }}
                >
                  {o.title}
                </h3>
                <p
                  className="text-sm leading-[1.85]"
                  style={{ color: "rgba(51,51,51,0.62)", fontFamily: "Heebo, sans-serif" }}
                >
                  {o.body}
                </p>
              </div>
              <div
                className="w-10 h-0.5 rounded-full mt-auto"
                style={{ background: `linear-gradient(90deg,${o.accent},transparent)` }}
              />
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Promise strip */}
        <FadeIn delay={0.35} className="mt-14">
          <div
            className="max-w-2xl mx-auto rounded-2xl px-7 py-6"
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(197,164,109,0.22)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="text-center text-xs tracking-[0.22em] uppercase mb-5"
              style={{ color: "rgba(197,164,109,0.75)", fontFamily: "Heebo, sans-serif" }}
            >
              ✦ ההבטחה שלנו
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promises.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(107,123,90,0.14)" }}
                  >
                    <span style={{ color: "#6B7B5A", fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(51,51,51,0.72)", fontFamily: "Heebo, sans-serif" }}
                  >
                    {p}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
