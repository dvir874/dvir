"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MessageCircle, LayoutDashboard, HeartHandshake, Gift, Camera } from "lucide-react";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";


const cards = [
  {
    icon: LayoutDashboard,
    title: "הכל במקום אחד",
    description:
      "אורחים, הושבה, תקציב, מתנות, משימות ולוח בקרה זוגי. בלי אקסלים, בלי WhatsApp כאוטי, בלי להרגיש שאתם מנהלי פרויקט.",
    accent: "#C5A46D",
  },
  {
    icon: MessageCircle,
    title: "ליווי אישי לאורך כל הדרך",
    description:
      "לא מערכת שמשאירים אתכם לבד איתה. אנחנו כאן, בוואטסאפ, עונים לשאלות ומסייעים בכל שלב מרגע ההרשמה ועד יום החתונה.",
    accent: "#6B7B5A",
  },
  {
    icon: ShieldCheck,
    title: "שקט נפשי שבוע לפני",
    description:
      "יודעים בדיוק כמה מגיעים, מי יושב איפה, ומה עדיין פתוח. כדי שתוכלו להגיע ליום הגדול רגועים, נינוחים ונוכחים ברגע.",
    accent: "#C5A46D",
  },
  {
    icon: HeartHandshake,
    title: "מותאם לכל סוג אירוע",
    description:
      "חתונה, חינה, אירוסין, בר מצווה, בת מצווה, ברית ואירועי משפחה. כל אירוע מקבל ניהול מדויק ועיצוב הזמנה שמספר את הסיפור שלכם.",
    accent: "#6B7B5A",
  },
  {
    icon: Gift,
    title: "קבלת מתנות דרך ביט",
    description:
      "האורחים שולחים מתנה כספית ישירות לזוג דרך ביט, ממש מתוך ההזמנה הדיגיטלית. בלי מעטפות, בלי בלבול, הכסף מגיע ישר.",
    accent: "#C5A46D",
  },
  {
    icon: Camera,
    title: "אלבום תמונות משותף",
    description:
      "אחרי האירוע, האורחים מעלים את התמונות שצילמו לאלבום אחד משותף. כל הרגעים של כולם, במקום אחד, לכל החיים.",
    accent: "#6B7B5A",
  },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      className="section-padding relative overflow-hidden bg-white"
      style={{ borderBottom: "1px solid rgba(197,164,109,0.12)" }}
    >
      <div className="container-max mx-auto">
        <FadeIn className="text-center mb-10">
          <h2 className="section-title">למה לבחור ברגע לפני?</h2>
          <p className="section-subtitle">
            טכנולוגיה חכמה עם ליווי אישי. כדי שתוכלו להיות נוכחים ברגעים שחשובים באמת
          </p>
        </FadeIn>

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
                className="h-full flex gap-5 p-7 rounded-2xl cursor-default transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(197,164,109,0.12)]"
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
    </section>
  );
}
