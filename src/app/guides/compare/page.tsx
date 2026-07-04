import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "השוואת שירותי אישורי הגעה לחתונה 2026 — מה באמת חשוב לבדוק | רגע לפני",
  description: "טבלת השוואה: שירותי אישורי הגעה מסורתיים (SMS/טלפוני) מול מערכת ניהול חתונה דיגיטלית מלאה. מחירים, יכולות, ומה שאף אחד לא מספר לכם.",
};

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4", green: "#4A7C59" };

const ROWS: { label: string; sms: string; phone: string; us: string }[] = [
  { label: "אישורי הגעה",            sms: "✓ SMS בלבד",     phone: "✓ שיחות טלפון",  us: "✓ וואטסאפ אישי + קישור" },
  { label: "מחיר ל-300 מוזמנים",     sms: "₪300–600",       phone: "₪900–1,500",      us: "₪180 קבוע" },
  { label: "דשבורד לזוג בזמן אמת",   sms: "לרוב לא",        phone: "✗",               us: "✓ מלא" },
  { label: "סידורי הושבה דיגיטליים", sms: "בתוספת ₪150+",   phone: "בתוספת",          us: "₪100 כולל שליחת שולחנות" },
  { label: "מנות לפי סועד + ילדים",  sms: "✗",              phone: "חלקי",            us: "✓ + דוח מנות לאולם" },
  { label: "גלריית אורחים חיה",      sms: "✗",              phone: "✗",               us: "✓ + קיר תמונות לאולם" },
  { label: "לוח טרמפים לאורחים",     sms: "✗",              phone: "✗",               us: "✓ בלעדי" },
  { label: "ליווי אישי",             sms: "מוקד/צ'אט",      phone: "מוקד",            us: "✓ בן אדם אחד, מספר ישיר" },
];

export default function ComparePage() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← רגע לפני</Link>
        <Link href="/pricing" style={{ color: C.goldT, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>למחשבון המחיר ←</Link>
      </div>

      <article style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px 80px" }}>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, lineHeight: 1.3, margin: "0 0 12px", textAlign: "center" }}>
          איך בוחרים שירות אישורי הגעה? השוואה כנה
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted, textAlign: "center", margin: "0 0 32px" }}>
          שלושה סוגי שירותים בשוק — והבדלים שרואים רק אחרי שסוגרים
        </p>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 16, overflow: "hidden", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                <th style={{ padding: "12px 10px", textAlign: "right", fontWeight: 700 }}></th>
                <th style={{ padding: "12px 10px", fontWeight: 600, color: C.muted }}>שירותי SMS</th>
                <th style={{ padding: "12px 10px", fontWeight: 600, color: C.muted }}>מוקד טלפוני</th>
                <th style={{ padding: "12px 10px", fontWeight: 800, color: C.goldT, background: "rgba(197,164,109,0.12)" }}>רגע לפני 💍</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(r => (
                <tr key={r.label} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "11px 10px", fontWeight: 600 }}>{r.label}</td>
                  <td style={{ padding: "11px 10px", textAlign: "center", color: C.muted }}>{r.sms}</td>
                  <td style={{ padding: "11px 10px", textAlign: "center", color: C.muted }}>{r.phone}</td>
                  <td style={{ padding: "11px 10px", textAlign: "center", fontWeight: 700, color: C.green, background: "rgba(197,164,109,0.06)" }}>{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.9, color: "#333", margin: "28px 0" }}>
          <strong>שורה תחתונה:</strong> שירותי SMS זולים אבל נותנים רק את הבסיס. מוקדים טלפוניים יקרים
          ומתאימים למי שרוצה שיחה אנושית עם כל אורח. מערכת דיגיטלית מלאה נותנת את שני העולמות —
          אוטומציה + ליווי אישי — במחיר של שירות ה-SMS.
        </p>

        <div style={{ background: C.cream, borderRadius: 16, padding: "24px", border: `1px solid ${C.border}`, textAlign: "center" }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px" }}>רוצים לראות בעצמכם לפני שמחליטים?</p>
          <Link href="/try" style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "13px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
            נסו את הדמו החי ✨
          </Link>
        </div>
      </article>
    </div>
  );
}
