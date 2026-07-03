import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "כמה עולים אישורי הגעה לחתונה ב-2026? המדריך המלא — רגע לפני",
  description: "כל מה שצריך לדעת על מחירי אישורי הגעה לחתונה: SMS מול וואטסאפ, תמחור פר אורח מול חבילה, ומה באמת חשוב לבדוק לפני שסוגרים.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4" };

const H2: React.CSSProperties = { fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 700, color: C.goldT, margin: "36px 0 12px" };
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.9, color: "#333", margin: "0 0 14px" };

export default function RsvpCostGuide() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <Link href="/pricing" style={{ color: C.goldT, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>למחשבון המחיר ←</Link>
      </div>

      <article style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 32, fontWeight: 900, lineHeight: 1.3, margin: "0 0 20px" }}>
          כמה עולים אישורי הגעה לחתונה ב-2026?
        </h1>
        <p style={P}>
          אישורי הגעה הם אחד השירותים הראשונים שכל זוג מתחתן פוגש — וגם אחד המבלבלים ביותר לתמחור.
          חלק מהחברות גובות פר אורח, חלק במנוי, חלק בחבילות. במדריך הזה נעשה סדר.
        </p>

        <h2 style={H2}>שיטות התמחור המקובלות בשוק</h2>
        <p style={P}>
          <strong>תמחור פר רשומה (אורח):</strong> נע בין ₪1 ל-₪2 לאורח בשירותי SMS/וואטסאפ, ובין ₪3 ל-₪5 לאורח
          בשירותים טלפוניים עם מוקד אנושי. לחתונה של 300 מוזמנים המשמעות היא ₪300–₪600 בדיגיטל, ומעל ₪1,000 בטלפוני.
        </p>
        <p style={P}>
          <strong>תמחור בחבילה:</strong> מחיר קבוע שכולל מספר סבבי הודעות, ללא תלות בכמות האורחים (עד תקרה).
          היתרון — אתם יודעים מראש בדיוק כמה תשלמו.
        </p>

        <h2 style={H2}>SMS או וואטסאפ?</h2>
        <p style={P}>
          רוב החברות הוותיקות עובדות ב-SMS. אבל ב-2026, אחוזי הפתיחה של וואטסאפ גבוהים משמעותית —
          הודעת וואטסאפ עם שם האורח וקישור אישי מרגישה כמו הזמנה, לא כמו ספאם.
          אם החברה שאתם בודקים עדיין שולחת רק SMS — שאלו למה.
        </p>

        <h2 style={H2}>5 שאלות לשאול לפני שסוגרים</h2>
        <p style={P}>1. כמה סבבי תזכורות כלולים במחיר — ומה עולה סבב נוסף?</p>
        <p style={P}>2. האם יש לזוג דשבורד לצפייה בזמן אמת, או שמקבלים קובץ אקסל בסוף?</p>
        <p style={P}>3. מה קורה עם אורח שלא ענה — יש מעקב? מי מטפל בו?</p>
        <p style={P}>4. האם ההודעות אישיות (שם + קישור אישי) או הודעה כללית לכולם?</p>
        <p style={P}>5. מה עוד כלול — הושבה? גלריה? דף אירוע? או שכל דבר בתוספת מחיר?</p>

        <h2 style={H2}>כמה זה אצלנו?</h2>
        <p style={P}>
          ברגע לפני, אישורי הגעה מלאים — עד 2 סבבי וואטסאפ אישיים, מעקב חי לזוג וייצוא אקסל — עולים <strong>₪180 לאירוע</strong>,
          בלי תלות בכמות האורחים ובלי דמי מנוי. ותוספות כמו הושבה, גלריה ועיצוב הזמנה — רק אם תרצו.
        </p>

        <div style={{ background: C.cream, borderRadius: 16, padding: "24px", border: `1px solid ${C.border}`, marginTop: 32, textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>רוצים לראות איך זה מרגיש לאורח?</p>
          <Link href="/try" style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "13px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            נסו את הדמו החי ✨
          </Link>
        </div>
      </article>
    </div>
  );
}
