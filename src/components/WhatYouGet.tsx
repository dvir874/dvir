"use client";

import { motion } from "framer-motion";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";

const FEATURES = [
  { emoji: "🌐", title: "אתר אישי לחתונה",          desc: "דף אירוע מעוצב עם כל הפרטים, ניווט ואפשרות RSVP" },
  { emoji: "👥", title: "ניהול רשימת מוזמנים",       desc: "הוספה, עריכה, ייבוא מאקסל — הכל מסודר ועדכני" },
  { emoji: "✅", title: "אישורי הגעה דיגיטליים",     desc: "קישור אישי לכל אורח, מעקב בזמן אמת, ללא מרדפים" },
  { emoji: "🪑", title: "סידורי הושבה",              desc: "גרירה, שחרור, תצוגת אולם — ושיבוץ חכם לפי קרבה" },
  { emoji: "💰", title: "ניהול תקציב",               desc: "מעקב הוצאות לפי ספק, אחוז ניצול, ועדכון בזמן אמת" },
  { emoji: "🎁", title: "ניהול מתנות",               desc: "רישום מתנות, ביט, פייבוקס ו-Easy2Give — מסודר לפי אורח" },
  { emoji: "🤝", title: "ניהול ספקים",               desc: "אנשי קשר, חוזים, תשלומים ותאריכי מפגש — הכל שם" },
  { emoji: "📋", title: "Checklist חכם",             desc: "רשימת משימות לפי שלב — מה עושים ב-3 חודשים, שבוע, יום" },
  { emoji: "🗺️", title: "מסע החתונה",               desc: "מה עשיתם, מה נשאר, ומה הצעד הבא — תמיד ברור" },
  { emoji: "🎊", title: "Wedding Mode ביום האירוע", desc: "לוח זמנים, ניווט Waze, ספקים — הכל בלחיצה אחת" },
  { emoji: "📷", title: "גלריית תמונות מהאורחים",  desc: "אלבום משותף שמתמלא בזמן אמת — ממש מהרגע הראשון" },
  { emoji: "📲", title: "העלאת תמונות ללא אפליקציה", desc: "קישור פשוט — האורחים מעלים מהנייד ישירות לגלריה" },
  { emoji: "💬", title: "ליווי אישי לאורך כל הדרך",  desc: "דביר זמין בוואטסאפ — לא בוט, לא שירות לקוחות. אדם אחד." },
  { emoji: "✨", title: "שירותים משלימים",           desc: "עיצוב הזמנה דיגיטלית, Save The Date ועוד — לפי בקשה" },
];

export default function WhatYouGet() {
  return (
    <section
      id="what-you-get"
      className="relative overflow-hidden py-20"
      style={{ background: "#F6F1E8" }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.35),transparent)" }}
      />

      <div className="container-max mx-auto px-4">
        <FadeIn className="text-center mb-12">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: "rgba(197,164,109,0.75)", fontFamily: "Heebo, sans-serif" }}
          >
            ✦ מה כלול במערכת ✦
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif" }}
          >
            כל מה שצריך לחתונה שלכם
            <br />
            <span style={{ color: "#C5A46D" }}>במערכת אחת</span>
          </h2>
          <div
            className="w-14 h-px mx-auto mb-4"
            style={{ background: "linear-gradient(90deg,transparent,#C5A46D,transparent)" }}
          />
          <p
            className="text-sm max-w-lg mx-auto leading-relaxed"
            style={{ color: "rgba(28,16,8,0.55)", fontFamily: "Heebo, sans-serif" }}
          >
            רוב הזוגות מפזרים את אלה על פני 6–8 כלים שונים.
            אצלנו הם חלק ממערכת אחת, מסונכרנת, שמכירה אתכם.
          </p>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto"
          staggerDelay={0.05}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              className="flex gap-3.5 p-5 rounded-2xl transition-all duration-300 hover:shadow-[0_6px_24px_rgba(197,164,109,0.12)] hover:-translate-y-0.5"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(197,164,109,0.16)",
              }}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{f.emoji}</span>
              <div>
                <p
                  className="text-sm font-semibold mb-1 leading-snug"
                  style={{ color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif" }}
                >
                  {f.title}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(28,16,8,0.52)", fontFamily: "Heebo, sans-serif" }}
                >
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Bottom note */}
        <FadeIn className="text-center mt-10">
          <p
            className="text-xs"
            style={{ color: "rgba(28,16,8,0.38)", fontFamily: "Heebo, sans-serif" }}
          >
            כל הפיצ'רים כלולים. אין תוספות נסתרות.
          </p>
        </FadeIn>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.35),transparent)" }}
      />
    </section>
  );
}
