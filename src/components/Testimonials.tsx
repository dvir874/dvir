"use client";
import { motion } from "framer-motion";
import FadeIn, { StaggerContainer, staggerItem } from "./FadeIn";

const TESTIMONIALS = [
  {
    quote: "הגענו לחתונה שלנו רגועים לגמרי. שבוע לפני ידענו בדיוק מי מגיע, מי יושב איפה — וביום עצמו פשוט נהנינו.",
    name: "נועה ואורי",
    event: "חתונה · 240 מוזמנים",
  },
  {
    quote: "בלי המערכת הייתי צריכה לרדוף אחרי 180 אנשים בוואטסאפ. בסוף כל מי שהיה צריך לאשר — אישר. אוטומטית.",
    name: "מיכל ודניאל",
    event: "חתונה · 180 מוזמנים",
  },
  {
    quote: "ההושבה לבד שווה את כל הכסף. שינינו 6 פעמים ובכל פעם זה עדכן הכל בשנייה. פחות ריבים, יותר שמחה.",
    name: "שירי ויואב",
    event: "חתונה · 320 מוזמנים",
  },
  {
    quote: "הבעל שלי לא מסוג האנשים שעוקבים אחרי משימות. עם לוח הבקרה המשותף — הוא עקב. זה לבד שווה הכל.",
    name: "רחל ואיתי",
    event: "חינה + חתונה · 200 מוזמנים",
  },
];

export default function Testimonials() {
  return (
    <section
      className="section-padding relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)" }}
    >
      <div className="container-max mx-auto">
        <FadeIn className="text-center mb-12">
          <h2
            className="section-title mb-3"
            style={{ fontFamily: "Frank Ruhl Libre, serif" }}
          >
            מה אומרים הזוגות
          </h2>
          <p className="section-subtitle">
            120+ זוגות כבר ניהלו את האירוע שלהם דרך המערכת
          </p>
        </FadeIn>

        <StaggerContainer
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto"
          staggerDelay={0.08}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{
                background: "white",
                border: "1px solid rgba(197,164,109,0.15)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              }}
            >
              {/* Quote mark */}
              <span
                style={{
                  fontSize: 48,
                  lineHeight: 1,
                  color: "rgba(197,164,109,0.25)",
                  fontFamily: "Frank Ruhl Libre, serif",
                  display: "block",
                  marginBottom: -16,
                }}
              >
                ״
              </span>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "rgba(51,51,51,0.75)",
                  fontFamily: "Heebo, sans-serif",
                }}
              >
                {t.quote}
              </p>
              <div style={{ borderTop: "1px solid rgba(197,164,109,0.12)", paddingTop: 12 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#333", fontFamily: "Frank Ruhl Libre, serif" }}>
                  {t.name}
                </p>
                <p style={{ fontSize: 12, color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif", marginTop: 2 }}>
                  {t.event}
                </p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
