"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, LayoutDashboard, HeartHandshake, Gift, Camera } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";


const cards = [
  {
    icon: HeartHandshake,
    title: "לא עוד כלי. שותף לדרך.",
    description:
      "רגע לפני לא מוכרת לכם תוכנה. היא מלווה אתכם מהאירוסין, עוברת איתכם כל שלב, ועומדת לצדכם ביום הגדול — ואחריו.",
    accent: "#C5A46D",
  },
  {
    icon: ShieldCheck,
    title: "שקט נפשי אמיתי",
    description:
      "יודעים בדיוק כמה מגיעים, מי יושב איפה, ומה עוד פתוח. מגיעים לאירוע רגועים ונוכחים — לא עסוקים בלוגיסטיקה.",
    accent: "#6B7B5A",
  },
  {
    icon: LayoutDashboard,
    title: "הכל במקום אחד — ממש הכל",
    description:
      "14 כלים שרוב הזוגות מפזרים על פני אקסלים, וואטסאפ ו'קובץ של אמא'. אצלנו הם מערכת אחת שמסונכרנת ומכירה אתכם.",
    accent: "#C5A46D",
  },
  {
    icon: MessageCircle,
    title: "ליווי אישי שאחרים לא נותנים",
    description:
      "דביר זמין בוואטסאפ לכל שאלה. לא בוט, לא מוקד שירות. אדם אחד שמכיר את האירוע שלכם ועוזר מהרגע הראשון.",
    accent: "#6B7B5A",
  },
  {
    icon: Camera,
    title: "מהאירוסין ועד הזיכרון",
    description:
      "לא רק לפני האירוע. אחרי היום הגדול, המערכת הופכת לאלבום חיים — עם תמונות וברכות מכל האורחים לנצח.",
    accent: "#C5A46D",
  },
  {
    icon: Gift,
    title: "Wedding Mode ביום עצמו",
    description:
      "ביום החתונה המערכת עוברת מצב מיוחד: לוח הזמנים של האירוע, ניווט Waze, ספקים ואנשי קשר — הכל בלחיצה אחת.",
    accent: "#6B7B5A",
  },
];

export default function WhyUs() {
  return (
    <motion.section
      id="why-us"
      className="section-padding relative overflow-hidden"
      style={{ borderBottom: "1px solid rgba(197,164,109,0.12)", background: "white" }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gold line sweep from right */}
      <motion.div
        initial={{ scaleX: 0, originX: 1 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, #C5A46D, transparent)", transformOrigin: "right" }}
      />

      {/* Soft background wash */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(197,164,109,0.06) 0%, transparent 65%)", pointerEvents: "none" }}
      />

      <div className="container-max mx-auto" style={{ position: "relative" }}>
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="section-title">
            לא עוד כלי לאישורי הגעה.
            <br />
            <span style={{ color: "#C5A46D" }}>מערכת שמנהלת את כל החתונה.</span>
          </h2>
          <p className="section-subtitle">
            ההבדל בין לחכות לסוף ולבין ליהנות מהדרך — זה רגע לפני
          </p>
        </motion.div>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
          staggerDelay={0.1}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={staggerItem}
                className="h-full flex gap-5 p-7 rounded-2xl cursor-default transition-all duration-300 hover:shadow-[0_8px_32px_rgba(197,164,109,0.14)] hover:-translate-y-1"
                style={{
                  background: "#FDFAF5",
                  border: "1px solid rgba(197,164,109,0.18)",
                }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.accent}18` }}
                >
                  <Icon size={22} strokeWidth={1.5} style={{ color: card.accent }} />
                </div>
                <div>
                  <h3
                    className="font-bold text-dark mb-2 text-base leading-snug"
                    style={{ fontFamily: "Frank Ruhl Libre, serif" }}
                  >
                    {card.title}
                  </h3>
                  <p
                    className="text-dark/60 text-sm leading-[1.8]"
                    style={{ fontFamily: "Heebo, sans-serif" }}
                  >
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>

      {/* Gold line sweep at bottom */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(197,164,109,0.4), transparent)", transformOrigin: "left" }}
      />
    </motion.section>
  );
}
