"use client";

import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const STEPS = [
  { emoji: "💍", stage: "אירוסין",        desc: "המסע מתחיל" },
  { emoji: "📋", stage: "תכנון",           desc: "מארגנים הכל" },
  { emoji: "📩", stage: "הזמנות",          desc: "שולחים ועוקבים" },
  { emoji: "✅", stage: "אישורי הגעה",     desc: "בזמן אמת" },
  { emoji: "🎊", stage: "יום החתונה",      desc: "Wedding Mode" },
  { emoji: "📸", stage: "אחרי האירוע",     desc: "גלריה וזיכרונות" },
];

export default function JourneyStrip() {
  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ background: "#1C1008" }}
    >
      {/* subtle gold top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.5),transparent)" }}
      />

      <div className="container-max mx-auto px-4">
        <FadeIn className="text-center mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: "rgba(197,164,109,0.65)", fontFamily: "Heebo, sans-serif" }}
          >
            ✦ המסע שלכם איתנו ✦
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "#FDFAF5", fontFamily: "Frank Ruhl Libre, serif" }}
          >
            מהאירוסין ועד הזיכרון
          </h2>
          <p
            className="mt-3 text-sm max-w-md mx-auto"
            style={{ color: "rgba(253,250,245,0.50)", fontFamily: "Heebo, sans-serif", lineHeight: 1.8 }}
          >
            רגע לפני לא נעלמת אחרי שתרכשו. אנחנו איתכם בכל שלב.
          </p>
        </FadeIn>

        {/* Steps — horizontal scroll on mobile */}
        <div
          className="flex items-start gap-0 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"] }}
        >
          {STEPS.map((step, i) => (
            <div key={step.stage} className="flex items-start flex-shrink-0" style={{ minWidth: 0 }}>
              {/* Step card */}
              <motion.div
                className="flex flex-col items-center text-center px-4"
                style={{ minWidth: 110 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {/* Circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 flex-shrink-0"
                  style={{
                    background: "rgba(197,164,109,0.12)",
                    border: "1px solid rgba(197,164,109,0.30)",
                  }}
                >
                  {step.emoji}
                </div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#FDFAF5", fontFamily: "Frank Ruhl Libre, serif", whiteSpace: "nowrap" }}
                >
                  {step.stage}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(197,164,109,0.70)", fontFamily: "Heebo, sans-serif", whiteSpace: "nowrap" }}
                >
                  {step.desc}
                </p>
              </motion.div>

              {/* Connector line (not after last step) */}
              {i < STEPS.length - 1 && (
                <div
                  className="flex-shrink-0 mt-7"
                  style={{
                    width: 32,
                    height: 1,
                    background: "linear-gradient(90deg,rgba(197,164,109,0.40),rgba(197,164,109,0.10))",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* subtle gold bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.5),transparent)" }}
      />
    </section>
  );
}
