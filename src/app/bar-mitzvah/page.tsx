import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אישורי הגעה לבר/בת מצווה — ניהול אירוע דיגיטלי | רגע לפני",
  description: "אישורי הגעה בוואטסאפ, ניהול מוזמנים, הושבה וגלריה חיה לבר מצווה ובת מצווה — הכל במקום אחד, עם ליווי אישי. החל מ-₪180.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4", olive: "#6B7B5A" };

const FEATURES = [
  { emoji: "📲", title: "אישורי הגעה בוואטסאפ", desc: "כל מוזמן מקבל הודעה אישית עם קישור. ההורים רואים בזמן אמת מי אישר — בלי טלפונים." },
  { emoji: "👨‍👩‍👧‍👦", title: "ניהול מוזמנים פשוט", desc: "ייבוא מאקסל או הזנה ידנית, חלוקה למשפחה/חברים/כיתה, ומעקב אחרי כל תשובה." },
  { emoji: "🪑", title: "סידורי הושבה", desc: "גרירה ושחרור מהטלפון + שליחת מספר שולחן לכל מוזמן לפני האירוע." },
  { emoji: "📸", title: "גלריה חיה", desc: "האורחים סורקים QR ומעלים תמונות ישר לאלבום — כל הרגעים במקום אחד למחרת בבוקר." },
  { emoji: "🧒", title: "מותאם לילדים", desc: "מנת ילדים בטופס האישור, ספירת ילדים נפרדת — בדיוק מה שהאולם צריך לדעת." },
  { emoji: "🤝", title: "ליווי אישי", desc: "לא בוט ולא מוקד. דביר זמין בוואטסאפ מהרגע הראשון ועד אחרי האירוע." },
];

export default function BarMitzvahPage() {
  const wa = `https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! אנחנו מארגנים בר/בת מצווה ונשמח לשמוע על המערכת 🙂")}`;
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <Link href="/try" style={{ color: C.goldT, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>✨ נסו את הדמו</Link>
      </div>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "56px 20px 40px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>🎉</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,6vw,40px)", fontWeight: 900, lineHeight: 1.25, margin: "0 0 14px" }}>
          בר מצווה בלי בלאגן.<br />
          <span style={{ color: C.goldT }}>אישורי הגעה, הושבה וגלריה — במקום אחד.</span>
        </h1>
        <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
          אתם מארגנים שמחה — אנחנו מארגנים את הרשימות.<br />
          מערכת דיגיטלית מלאה עם ליווי אישי, החל מ-₪180.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "16px 36px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(197,164,109,0.35)" }}>
          דברו איתי בוואטסאפ 💬
        </a>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 12 }}>ללא התחייבות · מענה מהיר</p>
      </section>

      {/* Features */}
      <section style={{ background: "#fff", padding: "48px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 18 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: C.ivory, borderRadius: 18, padding: "22px 20px", border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 30, margin: "0 0 10px" }}>{f.emoji}</p>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: "center", padding: "48px 20px 72px" }}>
        <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 900, margin: "0 0 10px" }}>
          גם חינה, ברית ויום הולדת 🎈
        </h2>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: "0 0 24px" }}>
          המערכת מתאימה לכל אירוע עם רשימת מוזמנים — ספרו לנו מה חוגגים ונתאים חבילה.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={wa} target="_blank" rel="noopener noreferrer"
            style={{ background: C.gold, color: "#fff", borderRadius: 9999, padding: "14px 30px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            קבלו הצעת מחיר 💬
          </a>
          <Link href="/pricing"
            style={{ background: "none", color: C.goldT, border: `2px solid ${C.gold}`, borderRadius: 9999, padding: "12px 30px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            למחשבון המחיר
          </Link>
        </div>
      </section>
    </div>
  );
}
