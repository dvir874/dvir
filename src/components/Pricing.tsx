"use client";

import Link from "next/link";
import { WA_URL_PRICING } from "@/lib/constants";

const T = {
  ivory:    "#FDFAF5",
  cream:    "#F6F1E8",
  gold:     "#C5A46D",
  goldDark: "#A8864A",
  goldText: "#8B6914",
  dark:     "#1C1008",
  muted:    "#8C7B6E",
  border:   "#E8E0D4",
  olive:    "#6B7B5A",
};

const FREE_FEATURES = [
  { label: "ניהול אורחים עד 50", included: true  },
  { label: "RSVP דיגיטלי",      included: true  },
  { label: "גלריה",              included: false },
  { label: "קפסולת זמן",        included: false },
  { label: "WhatsApp Center",    included: false },
  { label: "הושבה",              included: false },
  { label: "תמיכה",             included: true, note: "אימייל"  },
];

const PREMIUM_FEATURES = [
  { label: "ניהול אורחים ללא הגבלה", included: true  },
  { label: "RSVP דיגיטלי",           included: true  },
  { label: "גלריה",                   included: true  },
  { label: "קפסולת זמן",             included: true  },
  { label: "WhatsApp Center",         included: true  },
  { label: "הושבה",                   included: true  },
  { label: "תמיכה",                  included: true, note: "עדיפות" },
];

export default function Pricing() {
  return (
    <section
      dir="rtl"
      id="pricing"
      style={{
        background:  T.ivory,
        padding:     "80px 24px",
        fontFamily:  "Heebo, sans-serif",
      }}
    >
      {/* Section header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2
          style={{
            fontFamily:   "Frank Ruhl Libre, serif",
            fontWeight:   700,
            fontSize:     "clamp(28px, 5vw, 40px)",
            color:        T.dark,
            margin:       "0 0 12px",
          }}
        >
          מחיר שקוף. ללא הפתעות.
        </h2>
        <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 16, color: T.muted, margin: 0 }}>
          שתי אפשרויות. ללא דמי מנוי חודשי.
        </p>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap:                 20,
          maxWidth:            680,
          margin:              "0 auto 48px",
          alignItems:          "start",
        }}
      >
        {/* Free plan */}
        <div
          style={{
            background:   T.cream,
            borderRadius: 20,
            padding:      "28px 24px",
            border:       `1px solid ${T.border}`,
            order:        1,
          }}
        >
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 22, color: T.dark, margin: "0 0 4px" }}>
            חינם
          </p>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 36, color: T.dark, margin: "0 0 4px" }}>
            ₪0
          </p>
          <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: T.muted, margin: "0 0 24px" }}>
            לתמיד
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
            {FREE_FEATURES.map(f => (
              <li key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.border}`, fontFamily: "Heebo, sans-serif", fontSize: 14, color: f.included ? T.dark : T.muted }}>
                <span style={{ color: f.included ? T.olive : T.border, fontSize: 16, flexShrink: 0 }}>{f.included ? "✓" : "✗"}</span>
                {f.label}{f.note && <span style={{ color: T.muted, fontSize: 12 }}>({f.note})</span>}
              </li>
            ))}
          </ul>

          <Link href={WA_URL_PRICING} target="_blank" rel="noopener noreferrer" style={{
            display: "block", textAlign: "center",
            padding: "12px",
            borderRadius: 12,
            border: `2px solid ${T.gold}`,
            color: T.goldText,
            fontFamily: "Frank Ruhl Libre, serif",
            fontWeight: 700, fontSize: 15,
            textDecoration: "none",
            transition: "background 0.2s",
          }}>
            התחילו בחינם
          </Link>
        </div>

        {/* Premium plan */}
        <div
          style={{
            background:   T.gold,
            borderRadius: 20,
            padding:      "28px 24px",
            border:       `2px solid ${T.goldDark}`,
            position:     "relative",
            order:        0,
            boxShadow:    "0 12px 48px rgba(197,164,109,0.40)",
          }}
        >
          {/* Badge */}
          <div style={{
            position: "absolute", top: 20, left: 20,
            background: "rgba(255,255,255,0.25)",
            borderRadius: 20, padding: "4px 12px",
            fontFamily: "Heebo, sans-serif", fontWeight: 600, fontSize: 12, color: "#fff",
          }}>
            הכי פופולרי
          </div>

          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 22, color: "#fff", margin: "0 0 4px" }}>
            פרמיום
          </p>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 900, fontSize: 48, color: "#fff", lineHeight: 1, margin: "0 0 4px" }}>
            ₪299
          </p>
          <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 16, color: "rgba(255,255,255,0.85)", margin: "0 0 24px" }}>
            תשלום חד-פעמי בלבד
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
            {PREMIUM_FEATURES.map(f => (
              <li key={f.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.2)", fontFamily: "Heebo, sans-serif", fontSize: 14, color: "#fff" }}>
                <span style={{ color: "#fff", fontSize: 16, flexShrink: 0 }}>✓</span>
                {f.label}{f.note && <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>({f.note})</span>}
              </li>
            ))}
          </ul>

          <Link href={WA_URL_PRICING} target="_blank" rel="noopener noreferrer" style={{
            display: "block", textAlign: "center",
            padding: "14px",
            borderRadius: 12,
            background: "#fff",
            color: T.goldText,
            fontFamily: "Frank Ruhl Libre, serif",
            fontWeight: 700, fontSize: 16,
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            transition: "opacity 0.2s",
          }}>
            התחילו עכשיו
          </Link>
        </div>
      </div>

      {/* Reassurance note */}
      <p style={{ textAlign: "center", fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 13, color: T.muted }}>
        ✦ לא נדרש כרטיס אשראי להרשמה ✦ ללא דמי מנוי ✦ ביטול בכל עת
      </p>
    </section>
  );
}
