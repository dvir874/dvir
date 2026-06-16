"use client";

import { motion } from "framer-motion";
import { Palette, MessageCircle, Layers, RefreshCcw } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";


const cards = [
  {
    icon: Palette,
    title: "עיצוב אישי לכל זוג",
    description:
      "לא תבניות — כל הזמנה מעוצבת מאפס עבורכם. אנחנו מקשיבים לכם ובונים עיצוב שמספר את הסיפור שלכם.",
    accent: "#C5A46D",
  },
  {
    icon: MessageCircle,
    title: "מענה ישיר בוואטסאפ",
    description:
      "כל התהליך מתנהל בוואטסאפ — נוח, אישי ומהיר. אין מיילים, אין המתנות ארוכות.",
    accent: "#6B7B5A",
  },
  {
    icon: Layers,
    title: "התאמה מלאה לסגנון האירוע",
    description:
      "חתונה, חינה, בר מצווה או יום הולדת — כל אירוע מקבל עיצוב שמתאים בדיוק לאופי שלו.",
    accent: "#C5A46D",
  },
  {
    icon: RefreshCcw,
    title: "תיקונים עד לאישור סופי",
    description:
      "לא מרוצים? נשנה. ושוב. עד שתגידו 'בדיוק זה'. כל התיקונים כלולים במחיר.",
    accent: "#6B7B5A",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="section-padding relative overflow-hidden bg-white"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="container-max mx-auto">
        <FadeIn className="text-center mb-10">
          <p className="text-gold text-xs tracking-[0.22em] mb-3 uppercase" style={{ fontFamily: "Heebo, sans-serif" }}>
            הגישה שלנו
          </p>
          <h2 className="section-title">למה לבחור ברגע לפני?</h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            אנחנו לא מוכרים הזמנות — אנחנו יוצרים את הרגע הראשון שבו האורחים מרגישים את האירוע שלכם
          </p>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto"
          staggerDelay={0.1}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: "0 20px 48px rgba(197,164,109,0.15)" }}
                transition={{ duration: 0.3 }}
                className="h-full flex gap-5 p-7 rounded-2xl cursor-default"
                style={{
                  background: "linear-gradient(160deg,#FDFAF5 0%,#F6F1E8 100%)",
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
    </section>
  );
}
