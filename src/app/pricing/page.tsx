"use client";

import Link from "next/link";
import { useState } from "react";
import type { Metadata } from "next";

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

const FREE_FEATURES = [
  "עד 50 אורחים",
  "ניהול RSVPs",
  "גלריה",
];

const PREMIUM_FEATURES = [
  "אורחים ללא הגבלה",
  "WhatsApp",
  "בינה מלאכותית",
  "אתר יוקרה",
  "תמיכה 24/7",
];

export default function PricingPage() {
  const [plan, setPlan] = useState<"basic" | "premium">("premium");

  return (
    <div dir="rtl" style={{ minHeight: "100svh", background: C.ivory, fontFamily: "Heebo, sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;600&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${C.border}` }}>
        <Link href="/" style={{ color: C.dark, textDecoration: "none", fontFamily: "Heebo, sans-serif", fontSize: 18, display: "flex", alignItems: "center", gap: 4 }}>
          →
        </Link>
        <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18, color: C.goldText }}>
          רגע לפני
        </span>
        <div style={{ width: 24 }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "32px 24px 48px", maxWidth: 520, margin: "0 auto", width: "100%" }}>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: C.dark, margin: "0 0 8px" }}>
            בחרו את החבילה שלכם
          </h1>
          <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 15, color: C.muted, margin: 0 }}>
            הכל כלול, ללא הפתעות
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          <button
            onClick={() => setPlan("basic")}
            style={{
              padding: "8px 24px", borderRadius: 20, border: `1.5px solid ${C.border}`,
              background: plan === "basic" ? C.gold : "transparent",
              color: plan === "basic" ? "#fff" : C.dark,
              fontFamily: "Heebo, sans-serif", fontWeight: 600, fontSize: 14,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            בסיסי
          </button>
          <button
            onClick={() => setPlan("premium")}
            style={{
              padding: "8px 24px", borderRadius: 20, border: `1.5px solid ${C.border}`,
              background: plan === "premium" ? C.gold : "transparent",
              color: plan === "premium" ? "#fff" : C.dark,
              fontFamily: "Heebo, sans-serif", fontWeight: 600, fontSize: 14,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            פרמיום
          </button>
        </div>

        {/* Free card */}
        <div style={{
          background: C.ivory, borderRadius: 20, padding: "24px",
          border: `1.5px solid ${C.border}`, marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 40, color: C.dark }}>₪0</span>
            <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted }}>/לחודש</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
            {FREE_FEATURES.map(f => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.dark }}>
                <span style={{ color: C.olive, fontSize: 16, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <Link href="/auth/register" style={{
            display: "block", textAlign: "center", padding: "13px",
            borderRadius: 12, border: `1.5px solid ${C.gold}`,
            color: C.goldText, fontFamily: "Heebo, sans-serif", fontWeight: 600, fontSize: 15,
            textDecoration: "none",
          }}>
            להתחיל
          </Link>
        </div>

        {/* Premium card */}
        <div style={{
          background: C.cream, borderRadius: 20, padding: "24px",
          border: `1.5px solid ${C.gold}`, position: "relative",
          boxShadow: "0 8px 32px rgba(197,164,109,0.18)",
        }}>
          {/* Badge */}
          <div style={{
            position: "absolute", top: -12, right: 24,
            background: C.gold, borderRadius: 20, padding: "4px 14px",
            fontFamily: "Heebo, sans-serif", fontWeight: 600, fontSize: 12, color: "#fff",
          }}>
            מומלץ
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16, marginTop: 4 }}>
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 40, color: C.dark }}>₪299</span>
            <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.muted }}>/לאירוע</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
            {PREMIUM_FEATURES.map(f => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 14, color: C.dark }}>
                <span style={{ color: C.olive, fontSize: 16, flexShrink: 0 }}>✓</span>
                {f}
              </li>
            ))}
          </ul>

          <Link href="/auth/register" style={{
            display: "block", textAlign: "center", padding: "14px",
            borderRadius: 12, background: C.gold,
            color: "#fff", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 16,
            textDecoration: "none", boxShadow: "0 4px 16px rgba(197,164,109,0.35)",
          }}>
            להצטרף
          </Link>
        </div>

        {/* Reassurance */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 18, color: C.goldText, margin: "0 0 8px" }}>
            רגע לפני
          </p>
          <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 13, color: C.muted, margin: "0 0 12px" }}>
            לשאלות נוספות צרו קשר עם הצוות שלנו —<br />
            1000 אנשים כבר הצטרפו!
          </p>
          <Link href="/auth/register" style={{ color: C.goldText, fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
}
