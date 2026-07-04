import type { Metadata } from "next";
import Link from "next/link";
import { PORTFOLIO } from "@/lib/weddings-portfolio";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "החתונות שלנו — רגע לפני",
  description: "חתונות אמיתיות שנוהלו עם רגע לפני: אישורי הגעה, הושבה, גלריה חיה וליווי אישי.",
};

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.52)", border: "#E8E0D4",
};

export default async function WeddingsPage() {
  const sb = createServerClient();
  const [{ count: eventsCount }, { count: guestsCount }] = await Promise.all([
    sb.from("events").select("id", { count: "exact", head: true }),
    sb.from("guests").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← חזרה לאתר</Link>
        <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: 16, color: C.goldT }}>רגע לפני</span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 900, textAlign: "center", margin: "0 0 10px" }}>
          החתונות שלנו
        </h1>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 16, margin: "0 0 20px", lineHeight: 1.7 }}>
          זוגות אמיתיים, מספרים אמיתיים
        </p>

        {(eventsCount ?? 0) > 0 && (
          <p style={{ textAlign: "center", fontSize: 14, color: C.goldT, fontWeight: 600, margin: "0 0 40px" }}>
            🎉 {eventsCount} אירועים · {(guestsCount ?? 0).toLocaleString()} אורחים נוהלו במערכת
          </p>
        )}

        {PORTFOLIO.length === 0 ? (
          <div style={{ textAlign: "center", background: C.cream, borderRadius: 24, padding: "56px 24px", border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 44, margin: "0 0 16px" }}>💍</p>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>
              החתונות הראשונות בדרך
            </h2>
            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.8, margin: "0 0 28px" }}>
              אנחנו עסק צעיר שמלווה עכשיו את הזוגות הראשונים שלו —<br />
              ובקרוב תראו כאן את הסיפורים והמספרים שלהם.<br />
              רוצים להיות מהראשונים? מחכה לכם מחיר מייסדים 😉
            </p>
            <a href={`https://wa.me/972533318177?text=${encodeURIComponent("שלום דביר! ראיתי שאתם בתחילת הדרך — מעניין אותי מחיר מייסדים 🙂")}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-block", background: C.gold, color: "#fff", borderRadius: 9999, padding: "14px 32px", fontSize: 16, fontWeight: 700, textDecoration: "none" }}>
              דברו איתי 💬
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {PORTFOLIO.map((w) => (
              <div key={w.couple + w.date} style={{ background: "#fff", borderRadius: 20, border: `1px solid ${C.border}`, padding: "24px", boxShadow: "0 4px 20px rgba(28,16,8,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 700, margin: 0 }}>{w.couple}</h2>
                  <span style={{ fontSize: 13, color: C.muted }}>{w.date}{w.venue ? ` · ${w.venue}` : ""}</span>
                </div>
                <div style={{ display: "flex", gap: 24, marginBottom: w.quote ? 16 : 0 }}>
                  <div>
                    <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 900, color: C.goldT, margin: 0 }}>{w.guests}</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>אורחים</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 900, color: "#4A7C59", margin: 0 }}>{w.responseRate}%</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>אחוז מענה</p>
                  </div>
                </div>
                {w.quote && (
                  <p style={{ fontSize: 15, color: C.dark, lineHeight: 1.8, margin: 0, borderRight: `3px solid ${C.gold}`, paddingRight: 14 }}>
                    &quot;{w.quote}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
