"use client";

import { Check } from "lucide-react";

const G = {
  cream:     "#F6F1E8",
  white:     "#FFFFFF",
  ivory:     "#FDFAF5",
  gold:      "#C5A46D",
  goldLight: "#D4BC8A",
  goldMuted: "rgba(197,164,109,0.65)",
  olive:     "#6B7B5A",
  oliveMuted:"rgba(107,123,90,0.65)",
  dark:      "#333333",
  darkMuted: "rgba(51,51,51,0.55)",
  border:    "rgba(197,164,109,0.18)",
  borderSoft:"rgba(197,164,109,0.10)",
};

/* ─── Tools being replaced ─── */
const APPS = [
  { emoji: "📊", name: "Excel",       sub: "רשימת מוזמנים ידנית"      },
  { emoji: "💬", name: "WhatsApp",    sub: "אישורי הגעה ידניים"        },
  { emoji: "🔔", name: "תזכורות",     sub: "תזכורות ידניות"            },
  { emoji: "📋", name: "Notes / PDF", sub: "רשימות פזורות"             },
  { emoji: "📧", name: "מיילים",      sub: "עדכונים לספקים ולאורחים"   },
];

/* ─── Platform modules — what we actually provide ─── */
const MODULES = [
  "דף אירוע אישי + אישורי הגעה",
  "תזכורות אוטומטיות בוואטסאפ",
  "תכנון הושבה לפי שולחנות",
  "מעקב תקציב ומתנות",
  "לוח משימות לכל שלב",
  "לוח בקרה זוגי בזמן אמת",
];

/* ─── Value pillars ─── */
const VALUES = [
  { icon: "🤍", label: "שקט נפשי",          sub: "אתם יודעים מה קורה — תמיד"       },
  { icon: "⚡", label: "מוכן תוך 48 שעות",  sub: "אנחנו מגדירים, אתם מתחילים"      },
  { icon: "👫", label: "לשני בני הזוג",      sub: "שניכם רואים הכל, בזמן אמת"       },
  { icon: "💬", label: "ליווי בוואטסאפ",    sub: "אנחנו כאן לאורך כל הדרך"         },
];

export default function FeaturedDesigns() {
  return (
    <section
      id="featured"
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(180deg,${G.ivory} 0%,${G.cream} 100%)` }}
    >
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${G.gold},transparent)` }} />
      <div className="absolute inset-0 pattern-overlay opacity-40 pointer-events-none" />

      <div className="relative z-10 container-max mx-auto px-4 md:px-8 py-20">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: G.goldMuted, fontFamily: "Heebo, sans-serif" }}>
            הפלטפורמה שלנו
          </p>
          <h2 className="section-title mb-3" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
            מחליפים 5 כלים נפרדים{" "}
            <span style={{ color: G.goldMuted }}>בלוח בקרה אחד.</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle text-base" style={{ fontFamily: "Heebo, sans-serif" }}>
            Excel, WhatsApp, תזכורות ידניות — הכל עובר למקום אחד, ואנחנו מגדירים אותו עבורכם.
          </p>
        </div>

        {/* Comparison — LTR so arrow points left→right visually */}
        <div dir="ltr" className="grid md:grid-cols-[1fr_56px_1fr] gap-4 items-center mb-16">

          {/* Left: scattered tools */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-5" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>
              כיום — 5 כלים נפרדים
            </p>
            {APPS.map((app) => (
              <div
                key={app.name}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: G.white, border: `1px solid ${G.borderSoft}`, boxShadow: "0 2px 8px rgba(197,164,109,0.07)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(197,164,109,0.08)", border: `1px solid ${G.borderSoft}` }}
                >
                  {app.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: G.dark,     fontFamily: "Heebo, sans-serif" }}>{app.name}</p>
                  <p className="text-xs"                              style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>{app.sub}</p>
                </div>
                <div className="mr-auto w-2 h-2 rounded-full" style={{ background: "rgba(197,164,109,0.25)" }} />
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center justify-center gap-2 py-6 self-stretch">
            <div className="flex-1 w-px" style={{ background: `linear-gradient(to bottom,transparent,${G.gold},transparent)` }} />
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${G.gold},${G.goldLight})`, color: G.white, boxShadow: "0 4px 14px rgba(197,164,109,0.30)" }}
            >
              →
            </div>
            <div className="flex-1 w-px" style={{ background: `linear-gradient(to bottom,${G.gold},transparent)` }} />
          </div>

          {/* Right: one platform */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-5" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>
              עם רגע לפני — שירות אחד
            </p>
            <div
              className="rounded-2xl p-5"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: "0 4px 24px rgba(197,164,109,0.10)" }}
            >
              <div className="flex items-center gap-2.5 mb-5 pb-4" style={{ borderBottom: `1px solid ${G.borderSoft}` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: `linear-gradient(135deg,${G.gold},${G.goldLight})` }}>
                  ✦
                </div>
                <span className="font-bold text-sm" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                  רגע לפני
                </span>
                <span
                  className="mr-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(107,123,90,0.10)", color: G.olive, fontFamily: "Heebo, sans-serif" }}
                >
                  הכל כאן
                </span>
              </div>
              <ul className="space-y-2.5">
                {MODULES.map((mod) => (
                  <li key={mod} className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(107,123,90,0.12)", border: "1px solid rgba(107,123,90,0.25)" }}
                    >
                      <Check className="w-2.5 h-2.5" style={{ color: G.olive }} />
                    </div>
                    <span className="text-sm" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Value propositions — no invented numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {VALUES.map((v) => (
            <div
              key={v.label}
              className="flex flex-col items-center text-center px-5 py-7 rounded-2xl"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: "0 4px 20px rgba(197,164,109,0.07)" }}
            >
              <span
                className="text-2xl mb-3 flex items-center justify-center w-11 h-11 rounded-xl"
                style={{ background: "rgba(197,164,109,0.10)" }}
              >
                {v.icon}
              </span>
              <p className="text-sm font-bold mb-1.5" style={{ color: G.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{v.label}</p>
              <p className="text-xs leading-relaxed" style={{ color: G.darkMuted, fontFamily: "Heebo, sans-serif" }}>{v.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${G.borderSoft},transparent)` }} />
    </section>
  );
}
