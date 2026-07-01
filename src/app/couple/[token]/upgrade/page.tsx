"use client";

import { use, useState } from "react";
import Link from "next/link";

const C = {
  ivory:   "#FDFAF5",
  cream:   "#F6F1E8",
  gold:    "#C5A46D",
  goldText:"#8B6914",
  dark:    "#1C1008",
  muted:   "rgba(28,16,8,0.52)",
  border:  "#E8E0D4",
  olive:   "#6B7B5A",
} as const;

const PREMIUM_FEATURES = [
  "אורחים ללא הגבלה",
  "גלריה ותמונות",
  "קפסולת זמן",
  "WhatsApp Center",
];

const FREE_FEATURES = [
  "עד 50 אורחים",
  "RSVP בסיסי",
];

export default function UpgradePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      // Look up event_id by couple token
      const evRes = await fetch(`/api/couple/${token}/event`);
      const evData = await evRes.json();
      const event_id = evData?.id;
      if (!event_id) throw new Error("לא נמצא אירוע");

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id, amount: 299, description: "רגע לפני — חבילה פרמיום" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error ?? "שגיאה");
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בתהליך הרכישה");
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark, paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <Link href={`/couple/${token}`} style={{ color: C.muted, textDecoration: "none", fontSize: 22 }}>←</Link>
        <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 16, color: C.goldText }}>
          רגע לפני
        </span>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 26, color: C.dark, textAlign: "center", marginBottom: 28 }}>
          בחרו את החבילה שלכם
        </h1>

        {/* Premium card */}
        <div style={{ background: C.gold, borderRadius: 20, padding: "24px", marginBottom: 16, position: "relative", boxShadow: "0 8px 32px rgba(197,164,109,0.35)" }}>
          <div style={{ position: "absolute", top: -12, right: 20, background: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: C.goldText }}>
            🌟 הכי פופולרי
          </div>
          <div style={{ marginBottom: 16, marginTop: 4 }}>
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 48, color: "#fff" }}>₪299</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginRight: 4 }}>לאירוע</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
            {PREMIUM_FEATURES.map(f => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.2)", fontSize: 15, color: "#fff" }}>
                <span style={{ fontSize: 16 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          {error && <p style={{ color: "#B85C38", fontSize: 13, marginBottom: 8, textAlign: "center" }}>{error}</p>}
          <button onClick={handleCheckout} disabled={loading} style={{ display: "block", width: "100%", textAlign: "center", padding: "15px", borderRadius: 14, background: "#fff", color: C.goldText, fontWeight: 700, fontSize: 16, border: "none", cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "מעביר לתשלום..." : "להמשיך לעכשיו"}
          </button>
        </div>

        {/* Free card */}
        <div style={{ background: C.ivory, borderRadius: 20, padding: "24px", border: `1.5px solid ${C.border}` }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 48, color: C.dark }}>₪0</span>
            <span style={{ fontSize: 14, color: C.muted, marginRight: 4 }}>חינם</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
            {FREE_FEATURES.map(f => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 15, color: C.dark }}>
                <span style={{ color: C.olive, fontSize: 16 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>
          <Link href={`/couple/${token}`} style={{ display: "block", textAlign: "center", padding: "14px", borderRadius: 14, border: `1.5px solid ${C.border}`, color: C.muted, fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
            להתחיל בחינם
          </Link>
        </div>
      </div>
    </div>
  );
}
