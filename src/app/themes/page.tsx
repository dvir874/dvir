"use client";

import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { THEME_LIST } from "@/lib/themes";

const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };
const HEEBO = { fontFamily: "Heebo, sans-serif" };

const WA_PHONE = "972533318177";

export default function ThemesPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const theme = THEME_LIST.find((t) => t.id === selected);

  function sendChoice() {
    if (!theme) return;
    const text = encodeURIComponent(
      `שלום דביר! בחרנו את העיצוב: ${theme.nameHe} 🎉`
    );
    window.open(`https://wa.me/${WA_PHONE}?text=${text}`, "_blank");
  }

  return (
    <div dir="rtl" lang="he" className="min-h-screen" style={{ background: "#F8F5EF" }}>
      {/* Header */}
      <div className="text-center py-12 px-4">
        <p className="text-xs tracking-[0.22em] uppercase mb-2" style={{ color: "#C5A46D", ...HEEBO }}>
          רגע לפני
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "#1a1a1a", ...FRANK }}>
          בחרו את עיצוב ההזמנה שלכם
        </h1>
        <p className="text-sm" style={{ color: "rgba(26,26,26,0.55)", ...HEEBO }}>
          לחצו על העיצוב שאתם אוהבים, ואז שלחו לדביר
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 pb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {THEME_LIST.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="relative rounded-2xl overflow-hidden text-right transition-all duration-200"
              style={{
                border: isSelected ? `2.5px solid ${t.previewAccent}` : "2.5px solid transparent",
                boxShadow: isSelected
                  ? `0 0 0 4px ${t.previewAccent}33, 0 8px 32px rgba(0,0,0,0.12)`
                  : "0 2px 12px rgba(0,0,0,0.08)",
                transform: isSelected ? "scale(1.03)" : "scale(1)",
              }}
            >
              {/* Swatch */}
              <div
                className="h-28 w-full relative flex flex-col items-center justify-center gap-1.5 px-3"
                style={{ background: t.heroBg }}
              >
                <span className="text-base font-bold text-center leading-tight" style={{ color: t.heroNameColor, ...FRANK }}>
                  תהל ואביב
                </span>
                <span className="text-[10px]" style={{ color: t.heroSubColor, ...HEEBO }}>
                  מתחתנים!
                </span>
                <div className="w-8 h-px mt-0.5" style={{ background: t.heroAccent }} />
                <span className="text-[9px]" style={{ color: t.heroMutedText, ...HEEBO }}>
                  22.08.2026
                </span>

                {/* Selected checkmark */}
                {isSelected && (
                  <div
                    className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: t.previewAccent }}
                  >
                    <Check size={13} color="white" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              {/* Label */}
              <div
                className="px-3 py-2.5 flex items-center justify-between"
                style={{ background: t.cardBg, borderTop: `1px solid ${t.cardBorder}` }}
              >
                <span className="text-xs font-semibold" style={{ color: t.headingColor, ...HEEBO }}>
                  {t.nameHe}
                </span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: t.previewAccent }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sticky bottom bar */}
      <div
        className="sticky bottom-0 left-0 right-0 px-4 py-4 flex flex-col sm:flex-row items-center justify-center gap-3"
        style={{
          background: "rgba(248,245,239,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(197,164,109,0.20)",
        }}
      >
        {selected && theme ? (
          <>
            <span className="text-sm font-medium" style={{ color: "#1a1a1a", ...HEEBO }}>
              בחרתם: <strong>{theme.nameHe}</strong>
            </span>
            <button
              onClick={sendChoice}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#25D366,#1aab55)",
                boxShadow: "0 4px 16px rgba(37,211,102,0.30)",
                ...HEEBO,
              }}
            >
              <ExternalLink size={15} />
              שלחו לדביר בוואטסאפ
            </button>
          </>
        ) : (
          <span className="text-sm" style={{ color: "rgba(26,26,26,0.45)", ...HEEBO }}>
            לחצו על עיצוב כדי לבחור
          </span>
        )}
      </div>
    </div>
  );
}
