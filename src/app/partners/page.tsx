import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "תוכנית שותפים לספקי חתונות — רגע לפני",
  description: "צלמים, DJ, מאפרות ומעצבים — הרוויחו על כל זוג שתפנו לרגע לפני. קוד אישי, מעקב שקוף, תגמול על כל סגירה.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4", olive: "#6B7B5A" };

const STEPS = [
  { num: "1", title: "מקבלים קוד אישי", desc: "קישור ייחודי שלכם, למשל: regalifnei.app/ref/photo-danny" },
  { num: "2", title: "משתפים עם זוגות", desc: "בסוף פגישה, בחתימת חוזה, בסטורי — הזוג מקבל 10% הנחה דרככם" },
  { num: "3", title: "מרוויחים על כל סגירה", desc: "₪50 על כל זוג שסוגר חבילה — בלי תקרה, עם מעקב שקוף" },
];

const FOR_WHO = ["צלמי סטילס ווידאו", "תקליטנים ולהקות", "מאפרות ומעצבי שיער", "מעצבי אירועים", "רבנים ועורכי טקסים", "יועצות חתונה ומפיקים"];

export default function PartnersPage() {
  const wa = `https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! אני ספק/ית בתחום החתונות ומעניין אותי להצטרף לתוכנית השותפים 🤝")}`;
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: 16, color: C.goldT }}>תוכנית שותפים</span>
        <div style={{ width: 60 }} />
      </div>

      <section style={{ textAlign: "center", padding: "56px 20px 40px", maxWidth: 620, margin: "0 auto" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>🤝</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,6vw,38px)", fontWeight: 900, lineHeight: 1.25, margin: "0 0 14px" }}>
          אתם פוגשים זוגות מתחתנים כל שבוע.<br />
          <span style={{ color: C.goldT }}>למה לא להרוויח מזה עוד?</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
          רגע לפני היא מערכת ניהול חתונה דיגיטלית — אישורי הגעה, הושבה וגלריה.
          הזוגות שלכם צריכים אותה ממילא. תנו להם הנחה, וקבלו תגמול על כל סגירה.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "16px 36px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(197,164,109,0.35)" }}>
          רוצה קוד שותף 💬
        </a>
      </section>

      <section style={{ background: "#fff", padding: "40px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {STEPS.map(s => (
            <div key={s.num} style={{ background: C.ivory, borderRadius: 18, padding: "22px 18px", border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.gold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 900, margin: "0 auto 12px" }}>{s.num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "40px 20px 72px", textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, margin: "0 0 16px" }}>למי זה מתאים?</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 28 }}>
          {FOR_WHO.map(w => (
            <span key={w} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 9999, padding: "8px 16px", fontSize: 13, color: C.dark }}>{w}</span>
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
          בונוס לשותפים: הזוגות שדרככם מקבלים עדיפות בשירות —<br />מה שגורם לכם להיראות טוב. Win-Win-Win.
        </p>
      </section>
    </div>
  );
}
