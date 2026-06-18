"use client";

import { Check, X } from "lucide-react";
import FadeIn from "./FadeIn";

const rows = [
  { label: "שליחת הזמנות דיגיטליות אישיות",   them: false, us: true  },
  { label: "מעקב אישורי הגעה בזמן אמת",        them: false, us: true  },
  { label: "תזכורות אוטומטיות בוואטסאפ",       them: false, us: true  },
  { label: "תכנון הושבה לפי שולחנות",          them: false, us: true  },
  { label: "מעקב תקציב ומתנות",               them: false, us: true  },
  { label: "לוח בקרה זוגי משותף",              them: false, us: true  },
  { label: "ליווי אישי לאורך כל התהליך",       them: false, us: true  },
  { label: "ניהול ידני ב-WhatsApp ואקסל",      them: true,  us: false },
  { label: "לחץ ובלבול שבוע לפני האירוע",      them: true,  us: false },
];

export default function ComparisonSection() {
  return (
    <section
      id="comparison"
      className="section-padding relative overflow-hidden"
      style={{ background: "#FDFAF5" }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      <div className="container-max mx-auto">
        <FadeIn className="text-center mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-3"
            style={{ color: "rgba(197,164,109,0.75)", fontFamily: "Heebo, sans-serif" }}
          >
            למה רגע לפני?
          </p>
          <h2 className="section-title">
            ניהול חתונה בלי רגע לפני
            <span className="block mt-1" style={{ color: "#C5A46D" }}>לעומת ניהול עם רגע לפני</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle">
            כל מה שצריך לניהול החתונה — בלוח בקרה אחד, עם ליווי אישי לאורך כל הדרך.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div
            className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(197,164,109,0.22)", boxShadow: "0 4px 32px rgba(197,164,109,0.10)" }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-3 text-center text-xs font-bold uppercase tracking-wide"
              style={{ background: "rgba(197,164,109,0.08)", borderBottom: "1px solid rgba(197,164,109,0.18)" }}
            >
              <div className="py-4 px-4 text-right" style={{ color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif" }}>
                תכונה
              </div>
              <div className="py-4 px-2 border-r border-gold/10" style={{ color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif" }}>
                ניהול ידני
              </div>
              <div className="py-4 px-2" style={{ color: "#C5A46D", fontFamily: "Frank Ruhl Libre, serif", fontSize: "0.85rem", letterSpacing: 0 }}>
                רגע לפני ✦
              </div>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={row.label}
                className="grid grid-cols-3 items-center"
                style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(197,164,109,0.10)" : undefined }}
              >
                <div className="py-3.5 px-4 text-sm text-right" style={{ color: "#333333", fontFamily: "Heebo, sans-serif" }}>
                  {row.label}
                </div>

                {/* "Them" column — ✓ muted when true, ✕ red when false */}
                <div className="py-3.5 flex justify-center border-r" style={{ borderColor: "rgba(197,164,109,0.10)" }}>
                  {row.them ? (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(51,51,51,0.06)" }}>
                      <Check size={13} style={{ color: "rgba(51,51,51,0.35)" }} strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(200,60,60,0.08)" }}>
                      <X size={12} style={{ color: "rgba(180,60,60,0.7)" }} strokeWidth={2.5} />
                    </span>
                  )}
                </div>

                {/* "Us" column — ✓ green when true, ✕ red when false */}
                <div className="py-3.5 flex justify-center">
                  {row.us ? (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(107,123,90,0.12)" }}>
                      <Check size={13} style={{ color: "#6B7B5A" }} strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(200,60,60,0.08)" }}>
                      <X size={12} style={{ color: "rgba(180,60,60,0.7)" }} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Footer callout */}
            <div
              className="py-4 px-6 text-center text-sm"
              style={{
                background: "linear-gradient(135deg, rgba(197,164,109,0.08), rgba(107,123,90,0.06))",
                borderTop: "1px solid rgba(197,164,109,0.15)",
                color: "rgba(51,51,51,0.60)",
                fontFamily: "Heebo, sans-serif",
              }}
            >
              הזוגות שלנו מגיעים לאירוע רגועים — כי אנחנו טיפלנו בכל השאר
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
