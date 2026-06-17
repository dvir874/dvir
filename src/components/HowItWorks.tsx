"use client";

import { motion } from "framer-motion";
import { Users, Zap, BarChart2 } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";

const steps = [
  {
    number: "01",
    icon: Users,
    title: "הזמנות ואישורי הגעה",
    description:
      "הזמנה דיגיטלית אישית לכל אורח. תגובות מגיעות ישירות ללוח הבקרה שלכם — ללא מרדפים בוואטסאפ.",
  },
  {
    number: "02",
    icon: Zap,
    title: "ניהול מלא של האירוע",
    description:
      "הושבה לפי שולחנות, מעקב תקציב, רישום מתנות, רשימת משימות — הכל במסך אחד, זמין מכל מכשיר.",
  },
  {
    number: "03",
    icon: BarChart2,
    title: "לוח בקרה זוגי בזמן אמת",
    description:
      "שניכם רואים את אותה תמונה עדכנית: מי מגיע, כמה תקציב נשאר, מה עדיין פתוח. עד יום האירוע.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F6F1E8 0%, #EDE6D6 100%)" }}
    >
      <div className="absolute inset-0 pattern-overlay opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container-max mx-auto relative z-10">
        <FadeIn className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.22em] mb-3 uppercase" style={{ fontFamily: "Heebo, sans-serif" }}>
            מערכת ניהול חתונה מלאה
          </p>
          <h2 className="section-title">הכל במקום אחד</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            מההזמנה הראשונה ועד יום החתונה — אתם בשליטה מלאה
          </p>
        </FadeIn>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 right-32 left-32 h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent" />
          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 max-w-4xl mx-auto"
            staggerDelay={0.14}
          >
            {steps.map((step, i) => (
              <motion.div key={step.number} variants={staggerItem}>
                <StepCard step={step} index={i} />
              </motion.div>
            ))}
          </StaggerContainer>
        </div>

        {/* Feature chips */}
        <FadeIn delay={0.3} className="mt-12">
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "✉️ הזמנות דיגיטליות",
              "✅ אישורי הגעה",
              "💬 תזכורות בוואטסאפ",
              "🪑 תכנון הושבה",
              "💰 מעקב תקציב",
              "🎁 רישום מתנות",
              "📋 משימות תכנון",
              "📊 לוח בקרה זוגי",
            ].map((chip) => (
              <div
                key={chip}
                className="px-4 py-2 rounded-full text-sm"
                style={{
                  background: "rgba(197,164,109,0.10)",
                  border: "1px solid rgba(197,164,109,0.28)",
                  color: "rgba(51,51,51,0.70)",
                  fontFamily: "Heebo, sans-serif",
                }}
              >
                {chip}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const Icon = step.icon;

  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #C5A46D, #D4BC8A)",
            boxShadow: "0 8px 24px rgba(197,164,109,0.3)",
          }}
        >
          <Icon size={28} color="white" strokeWidth={1.5} />
        </div>
        <div
          className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#6B7B5A", fontFamily: "Heebo, sans-serif" }}
        >
          {index + 1}
        </div>
      </div>

      <h3
        className="text-xl font-bold text-dark mb-3 mt-1"
        style={{ fontFamily: "Frank Ruhl Libre, serif" }}
      >
        {step.title}
      </h3>

      <p
        className="text-dark/60 text-sm leading-relaxed max-w-[240px]"
        style={{ fontFamily: "Heebo, sans-serif" }}
      >
        {step.description}
      </p>
    </div>
  );
}
