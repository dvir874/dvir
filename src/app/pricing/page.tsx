"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BASE_PRICE, FULL_PACKAGE_PRICE, ADDONS, BASE_LABEL, digitalAddonEntries } from "@/lib/pricing";

const C = {
  ivory:   "#FDFAF5",
  cream:   "#F6F1E8",
  gold:    "#C5A46D",
  goldT:   "#8B6914",
  dark:    "#1C1008",
  muted:   "rgba(28,16,8,0.52)",
  border:  "#E8E0D4",
  olive:   "#6B7B5A",
} as const;

const DVIR_PHONE = "972533318177";

export default function PricingCalculatorPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const digital = digitalAddonEntries().filter(([, a]) => a.price > 0);
  const included = [
    ...digitalAddonEntries().filter(([, a]) => a.price === 0).map(([, a]) => a.label),
    "אפשרות תשלום בביט לאורחים",
  ];
  const physical = Object.entries(ADDONS).filter(([, a]) => a.physical);

  const digitalTotal = useMemo(
    () => BASE_PRICE + digital.filter(([k]) => selected.has(k)).reduce((s, [, a]) => s + a.price, 0),
    [selected, digital]
  );
  const physicalTotal = physical.filter(([k]) => selected.has(k)).reduce((s, [, a]) => s + a.price, 0);

  const allDigitalPaid = digital.filter(([, a]) => a.price > 0).every(([k]) => selected.has(k));
  const effectiveDigital = allDigitalPaid ? Math.min(digitalTotal, FULL_PACKAGE_PRICE) : digitalTotal;
  const total = effectiveDigital + physicalTotal;
  const savings = allDigitalPaid ? digitalTotal - FULL_PACKAGE_PRICE : 0;

  function toggle(key: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const summaryLines = [
    `בסיס — אישורי הגעה`,
    ...Object.entries(ADDONS).filter(([k]) => selected.has(k)).map(([, a]) => a.label.split("—")[0].trim()),
  ].join(", ");
  const waMsg = encodeURIComponent(
    `שלום דביר! בניתי חבילה במחשבון באתר:\n${summaryLines}\nסה״כ: ₪${total.toLocaleString()}\nאשמח להצעת מחיר רשמית 🙂`
  );

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", color: C.dark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        .addon-row { transition: border-color 0.15s, background 0.15s; }
        .addon-row:hover { border-color: ${C.gold} !important; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <Link href="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>← חזרה לאתר</Link>
        <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: 16, color: C.goldT }}>רגע לפני</span>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 140px" }}>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, textAlign: "center", margin: "0 0 8px" }}>
          בנו את החבילה שלכם
        </h1>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 15, margin: "0 0 32px", lineHeight: 1.7 }}>
          סמנו מה שמעניין אתכם — המחיר מתעדכן מיד. ללא התחייבות.
        </p>

        {/* Base — always included, with everything that comes free inside */}
        <div style={{ background: C.cream, border: `2px solid ${C.gold}`, borderRadius: 20, padding: "20px", marginBottom: 14, boxShadow: "0 8px 28px rgba(197,164,109,0.18)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>חבילת הבסיס</p>
              <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>תמיד כלולה — וכוללת הרבה יותר ממה שנשמע</p>
            </div>
            <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 900, color: C.goldT, flexShrink: 0 }}>₪{BASE_PRICE}</span>
          </div>
          <div style={{ borderTop: `1px solid rgba(197,164,109,0.3)`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: C.dark }}>✓ {BASE_LABEL}</p>
            {included.map(label => (
              <p key={label} style={{ fontSize: 14, margin: 0, color: C.dark, display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ color: C.olive, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span>{label} <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, background: "rgba(107,123,90,0.1)", borderRadius: 9999, padding: "2px 8px", marginRight: 4 }}>מתנה 🎁</span></span>
              </p>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, fontWeight: 700, color: C.goldT, margin: "20px 0 10px" }}>תוספות לבחירה</p>

        {/* Digital add-ons */}
        {digital.map(([key, a]) => {
          const on = selected.has(key);
          return (
            <button key={key} className="addon-row" onClick={() => toggle(key)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                width: "100%", textAlign: "right", cursor: "pointer",
                background: on ? "rgba(197,164,109,0.1)" : "#fff",
                border: `2px solid ${on ? C.gold : C.border}`,
                borderRadius: 16, padding: "14px 18px", marginBottom: 10,
                fontFamily: "Heebo, sans-serif",
              }}>
              <span style={{ fontSize: 14, fontWeight: on ? 600 : 400, color: C.dark }}>
                {on ? "✓ " : ""}{a.label}
              </span>
              <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, color: a.price === 0 ? C.olive : C.goldT, flexShrink: 0 }}>
                {a.price === 0 ? "חינם" : `₪${a.price}`}
              </span>
            </button>
          );
        })}

        {/* Physical services */}
        <p style={{ fontSize: 13, fontWeight: 700, color: C.goldT, margin: "24px 0 10px" }}>שירותים ביום החתונה</p>
        {physical.map(([key, a]) => {
          const on = selected.has(key);
          return (
            <button key={key} className="addon-row" onClick={() => toggle(key)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                width: "100%", textAlign: "right", cursor: "pointer",
                background: on ? "rgba(107,123,90,0.08)" : "#fff",
                border: `2px solid ${on ? C.olive : C.border}`,
                borderRadius: 16, padding: "14px 18px", marginBottom: 10,
                fontFamily: "Heebo, sans-serif",
              }}>
              <span style={{ fontSize: 14, fontWeight: on ? 600 : 400, color: C.dark }}>
                {on ? "✓ " : ""}{a.label}
              </span>
              <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, color: C.olive, flexShrink: 0 }}>₪{a.price}</span>
            </button>
          );
        })}
      </div>

      {/* Sticky total bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(253,250,245,0.97)", backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.border}`, boxShadow: "0 -8px 32px rgba(28,16,8,0.08)",
        padding: "14px 20px calc(14px + env(safe-area-inset-bottom))",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 900, color: C.goldT, margin: 0, lineHeight: 1 }}>
              ₪{total.toLocaleString()}
            </p>
            {savings > 0 && (
              <p style={{ fontSize: 12, color: C.olive, fontWeight: 600, margin: "4px 0 0" }}>
                🎁 חבילה מלאה — חסכתם ₪{savings}
              </p>
            )}
            <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>תשלום חד-פעמי · ללא מנוי</p>
          </div>
          <a
            href={`https://wa.me/${DVIR_PHONE}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              background: C.gold, color: "#fff", borderRadius: 9999,
              padding: "14px 24px", fontSize: 15, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(197,164,109,0.4)", whiteSpace: "nowrap",
            }}>
            שלחו לי הצעה 💬
          </a>
        </div>
      </div>
    </div>
  );
}
