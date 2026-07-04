import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "דביר בן ברוך — רגע לפני | ניהול חתונה דיגיטלי",
  description: "דביר בן ברוך — מייסד רגע לפני. אישורי הגעה, הושבה, גלריה וליווי אישי לחתונה שלכם.",
};

/* Digital business card — QR-able from the phone at events */

const C = { ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914", dark: "#1C1008", muted: "rgba(28,16,8,0.52)", border: "#E8E0D4" };

const LINKS = [
  { emoji: "💬", label: "וואטסאפ — הכי מהיר", href: "https://wa.me/972533318177?text=" + encodeURIComponent("שלום דביר! קיבלתי את הכרטיס שלך 🙂") },
  { emoji: "📞", label: "053-3318177", href: "tel:0533318177" },
  { emoji: "✨", label: "נסו את המערכת (דמו חי)", href: "/try" },
  { emoji: "🧮", label: "מחשבון מחיר", href: "/pricing" },
  { emoji: "🌐", label: "האתר המלא", href: "/" },
];

export default function DvirCardPage() {
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: `linear-gradient(160deg, ${C.ivory}, ${C.cream})`, fontFamily: "Heebo, sans-serif", color: C.dark, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#fff", borderRadius: 28, border: `1px solid ${C.border}`, boxShadow: "0 16px 48px rgba(28,16,8,0.1)", padding: "36px 28px", textAlign: "center" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, #A8864A)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 38, color: "#fff", fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900 }}>
          ד
        </div>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>
          דביר בן ברוך
        </h1>
        <p style={{ fontSize: 14, color: C.goldT, fontWeight: 600, margin: "0 0 6px" }}>מייסד רגע לפני 💍</p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: "0 0 24px" }}>
          ניהול חתונה דיגיטלי עם ליווי אישי —<br />אישורי הגעה, הושבה, גלריה חיה ועוד
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {LINKS.map(l =>
            l.href.startsWith("/") ? (
              <Link key={l.label} href={l.href}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", background: C.ivory, border: `1.5px solid ${C.border}`, borderRadius: 14, textDecoration: "none", color: C.dark, fontSize: 14, fontWeight: 600 }}>
                <span style={{ fontSize: 20 }}>{l.emoji}</span>{l.label}
              </Link>
            ) : (
              <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", background: l.label.includes("וואטסאפ") ? "rgba(37,211,102,0.1)" : C.ivory, border: `1.5px solid ${l.label.includes("וואטסאפ") ? "rgba(37,211,102,0.4)" : C.border}`, borderRadius: 14, textDecoration: "none", color: C.dark, fontSize: 14, fontWeight: 600 }}>
                <span style={{ fontSize: 20 }}>{l.emoji}</span>{l.label}
              </a>
            )
          )}
        </div>

        <p style={{ fontSize: 11, color: C.muted, marginTop: 22 }}>
          שמרו את הדף — או שתפו עם זוג שמתחתן 🤍
        </p>
      </div>
    </div>
  );
}
