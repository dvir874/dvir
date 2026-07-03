import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אישורי הגעה לחתונה דתית — הפרדה, מהדרין והזמנות צנועות | רגע לפני",
  description: "מערכת אישורי הגעה והושבה שמותאמת לחתונות דתיות וחרדיות: הושבה נפרדת לעזרת גברים ונשים, מנות מהדרין, והזמנות מעוצבות ללא תמונות.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4" };

const FEATURES = [
  { emoji: "🕍", title: "הושבה נפרדת", desc: "בונים את מפת ההושבה בשני אזורים — עזרת גברים ועזרת נשים — וכל מוזמן מקבל את השולחן הנכון שלו." },
  { emoji: "🍖", title: "מנות מהדרין", desc: "אפשרות מהדרין מובנית בטופס האישור, ודוח מנות מסודר לאולם עם הפירוט המלא." },
  { emoji: "🖼️", title: "הזמנה צנועה", desc: "עיצובי הזמנות מכובדים ללא תמונות זוג — טיפוגרפיה, עיטורים וברכת בס\"ד." },
  { emoji: "📵", title: "בלי אפליקציות", desc: "האורח מאשר בקישור פשוט — עובד גם בטלפון כשר תומך דפדפן, בלי להתקין כלום." },
  { emoji: "👨‍👩‍👧‍👦", title: "משפחות גדולות", desc: "אישור עד 15 נפשות בהזמנה אחת, עם פירוט מנות לכל בני המשפחה כולל מנות ילדים." },
  { emoji: "🤝", title: "יחס אישי", desc: "מדברים עם בן אדם, לא עם מוקד. ליווי צמוד מההזמנה הראשונה ועד אחרי השבע ברכות." },
];

export default function ReligiousPage() {
  const wa = `https://wa.me/972533318177?text=${encodeURIComponent("שלום! אנחנו מארגנים חתונה דתית ומעניין אותנו לשמוע על המערכת 🙂")}`;
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <Link href="/pricing" style={{ color: C.goldT, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>למחשבון המחיר ←</Link>
      </div>

      <section style={{ textAlign: "center", padding: "56px 20px 40px", maxWidth: 640, margin: "0 auto" }}>
        <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 14, fontWeight: 700, color: C.goldT, letterSpacing: "0.1em", margin: "0 0 10px" }}>בס״ד</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "clamp(28px,6vw,38px)", fontWeight: 900, lineHeight: 1.3, margin: "0 0 14px" }}>
          ניהול חתונה דיגיטלי<br />
          <span style={{ color: C.goldT }}>שמכבד את הדרך שלכם</span>
        </h1>
        <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, margin: "0 0 28px" }}>
          אישורי הגעה, הושבה נפרדת, מנות מהדרין והזמנות צנועות —<br />
          מערכת אחת שבנויה גם לחתונה של תורה.
        </p>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "16px 36px", fontSize: 17, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 24px rgba(197,164,109,0.35)" }}>
          דברו איתנו 💬
        </a>
        <p style={{ fontSize: 13, color: C.muted, marginTop: 12 }}>החל מ-₪180 · ללא דמי מנוי</p>
      </section>

      <section style={{ background: "#fff", padding: "48px 20px 64px", borderTop: `1px solid ${C.border}` }}>
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
    </div>
  );
}
