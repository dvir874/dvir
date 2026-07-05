"use client";

/** ToolsWarm — "chaos → clarity": 5 scattered tools consolidate into one panel.
 * Based on approved Stitch "מכאוס לבהירות" (screen c3388a3a). */

import { FileSpreadsheet, MessageSquare, Bell, FileText, Mail, ArrowLeft, Gem, Check } from "lucide-react";

const TOOLS = [
  { Icon: FileSpreadsheet, name: "Excel", sub: "רשימת מוזמנים ידנית", rot: "-rotate-2" },
  { Icon: MessageSquare, name: "WhatsApp", sub: "אישורי הגעה ידניים", rot: "rotate-1" },
  { Icon: Bell, name: "תזכורות", sub: "תזכורות ידניות", rot: "-rotate-1" },
  { Icon: FileText, name: "Notes / PDF", sub: "רשימות פזורות", rot: "rotate-2" },
  { Icon: Mail, name: "מיילים", sub: "עדכונים לספקים ולאורחים", rot: "-rotate-1" },
];

const UNIFIED = [
  "דף אירוע אישי + אישורי הגעה",
  "תזכורות אוטומטיות בוואטסאפ",
  "תכנון הושבה לפי שולחנות",
  "מעקב תקציב ומתנות",
  "לוח משימות לכל שלב",
  "לוח בקרה זוגי בזמן אמת",
];

export default function ToolsWarm() {
  return (
    <section dir="rtl" className="relative w-full bg-cream py-20 lg:py-28 px-6 lg:px-12">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-16">
          <p className="font-body text-[13px] font-semibold uppercase tracking-[0.22em] text-gold">הפלטפורמה שלנו</p>
          <h2 className="mt-4 font-display text-4xl lg:text-[52px] font-black leading-tight text-ink">
            מחליפים 5 כלים נפרדים
            <span className="block text-gold">בלוח בקרה אחד</span>
          </h2>
          <p className="mt-5 font-body text-lg font-light text-ink/55">
            Excel, WhatsApp, תזכורות ידניות. הכל עובר למקום אחד, ואנחנו מגדירים אותו עבורכם.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* chaos side */}
          <div>
            <p className="mb-5 text-center font-body text-sm text-ink/50">היום · 5 כלים נפרדים</p>
            <div className="space-y-3">
              {TOOLS.map(({ Icon, name, sub, rot }) => (
                <div
                  key={name}
                  className={`flex items-center gap-4 rounded-2xl bg-surface-raised p-4 shadow-card ${rot}`}
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cream text-ink/60">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="font-body font-semibold text-ink">{name}</div>
                    <div className="font-body text-[13px] text-ink/50">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* arrow */}
          <div className="flex justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-raised">
              <ArrowLeft className="w-6 h-6" />
            </span>
          </div>

          {/* unified side */}
          <div>
            <p className="mb-5 text-center font-body text-sm text-gold">עם רגע לפני · שירות אחד</p>
            <div className="rounded-card border border-gold/40 bg-surface-raised p-7 shadow-float">
              <div className="mb-5 flex items-center gap-3 border-b border-cream pb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Gem className="w-5 h-5" />
                </span>
                <span className="font-display text-lg font-bold text-ink">רגע לפני · הכל כאן</span>
              </div>
              <ul className="space-y-3">
                {UNIFIED.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body text-[15px] text-ink/80">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-olive/10 text-olive">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
