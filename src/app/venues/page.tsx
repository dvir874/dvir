import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "מערכת אישורי הגעה לאולמות ומפיקי אירועים | רגע לפני",
  description: "אולמות, גני אירועים ומפיקים: הציעו לזוגות שלכם מערכת אישורי הגעה והושבה בליווי מלא — יתרון תחרותי לאולם, בלי עבודה נוספת לצוות.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4", olive: "#6B7B5A" };

const BENEFITS = [
  { emoji: "🎯", title: "יתרון תחרותי לאולם", desc: "\"אצלנו כל זוג מקבל מערכת ניהול אורחים דיגיטלית\" — משפט שסוגר סיורי אולם." },
  { emoji: "🍽️", title: "דוח מנות מדויק אליכם", desc: "פירוט בשרי/צמחוני/ילדים מגיע ישירות מהמערכת — בלי טלפונים עם הזוג ובלי הפתעות בקייטרינג." },
  { emoji: "🪑", title: "הושבה סגורה מראש", desc: "הזוג סוגר את המפה במערכת, האורחים מקבלים מספרי שולחן בוואטסאפ — פחות עומס בכניסה." },
  { emoji: "💼", title: "אפס עבודה לצוות שלכם", desc: "אנחנו מלווים את הזוג מא׳ ועד ת׳. האולם רק נהנה מהתוצאה." },
];

export default function VenuesPage() {
  const wa = `https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! אני מאולם/הפקה ומעניין אותי לשמוע על שיתוף פעולה 🏛️")}`;
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: 16, color: C.goldT }}>לאולמות ומפיקים</span>
        <div style={{ width: 60 }} />
      </div>

      <section style={{ textAlign: "center", padding: "56px 20px 40px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏛️</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,6vw,38px)", fontWeight: 900, lineHeight: 1.3, margin: "0 0 14px" }}>
          תנו לזוגות שלכם<br />
          <span style={{ color: C.goldT }}>חוויה דיגיטלית שאין לאולם ליד</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
          שיתוף פעולה עם רגע לפני: כל זוג שסוגר אצלכם מקבל מערכת
          אישורי הגעה והושבה בליווי אישי — ואתם מקבלים דוחות מנות מדויקים ואפס כאבי ראש.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "16px 36px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(197,164,109,0.35)" }}>
          בואו נדבר 💬
        </a>
      </section>

      <section style={{ background: "#fff", padding: "48px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {BENEFITS.map(b => (
            <div key={b.title} style={{ background: C.ivory, borderRadius: 18, padding: "22px 20px", border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 30, margin: "0 0 10px" }}>{b.emoji}</p>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: "center", padding: "48px 20px 72px", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, margin: "0 0 12px" }}>מודלים לשיתוף פעולה</h2>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.9, margin: "0 0 24px" }}>
          הפניה תמורת עמלה · חבילה מסובסדת לזוגות האולם ·<br />
          או מערכת ממותגת בשם האולם שלכם — נתאים יחד את המודל.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: "none", color: C.goldT, border: `2px solid ${C.gold}`, borderRadius: 9999, padding: "13px 32px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
          קבעו שיחת היכרות
        </a>
      </section>
    </div>
  );
}
