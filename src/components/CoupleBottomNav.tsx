"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

const C = {
  gold:   "#C5A46D",
  goldM:  "rgba(197,164,109,0.70)",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.48)",
  border: "rgba(197,164,109,0.18)",
  bg:     "rgba(253,250,245,0.97)",
};

interface NavProps { token: string }

/* ─── "More" bottom sheet item ─── */
interface SheetItem {
  emoji: string;
  label: string;
  href:  string;
  external?: boolean;
}

/* ─── Main 5 tab items ─── */
interface TabItem {
  emoji: string;
  label: string;
  href:  string | null;  // null = opens sheet
}

function getNavTabs(token: string): TabItem[] {
  return [
    { emoji: "🏠", label: "בית",     href: `/couple/${token}`           },
    { emoji: "👥", label: "אורחים",  href: `/couple/${token}/guests`    },
    { emoji: "📋", label: "משימות",  href: `/couple/${token}/checklist` },
    { emoji: "🪑", label: "הושבה",   href: `/couple/${token}/seating`   },
    { emoji: "☰",  label: "עוד",     href: null                         },
  ];
}

function getSheetItems(token: string): SheetItem[] {
  return [
    { emoji: "💰",  label: "תקציב",             href: `/couple/${token}/budget`  },
    { emoji: "🎁",  label: "מתנות",             href: `/couple/${token}/gifts`   },
    { emoji: "🤝",  label: "ספקים",             href: `/couple/${token}/vendors` },
    { emoji: "📸",  label: "גלריית תמונות",     href: `/gallery/${token}`        },
    { emoji: "🗺️", label: "המסע שלכם",          href: `/couple/${token}/journey` },
    { emoji: "💬",  label: "צריכים את דביר?",   href: `https://wa.me/972533318177?text=${encodeURIComponent("💍 שלום דביר! יש לנו שאלה לגבי החתונה.")}`, external: true },
  ];
}

export default function CoupleBottomNav({ token }: NavProps) {
  const pathname         = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const tabs       = getNavTabs(token);
  const sheetItems = getSheetItems(token);

  function isActive(href: string | null): boolean {
    if (!href) return false;
    if (href === `/couple/${token}`) return pathname === href;
    return pathname.startsWith(href);
  }

  const desktopLinks = [
    ...tabs.filter(t => t.href).map(t => ({ emoji: t.emoji, label: t.label, href: t.href!, external: false })),
    ...sheetItems.map(s => ({ emoji: s.emoji, label: s.label, href: s.href, external: !!s.external })),
  ];

  return (
    <>
      {/* ── Desktop nav bar (hidden on mobile) ── */}
      <nav
        className="hidden md:flex fixed bottom-0 left-0 right-0 z-[180]"
        style={{
          background:     C.bg,
          backdropFilter: "blur(16px)",
          borderTop:      `1px solid ${C.border}`,
          boxShadow:      "0 -4px 24px rgba(28,16,8,0.05)",
          height:         56,
          alignItems:     "center",
          justifyContent: "center",
          gap:            4,
        }}
        dir="rtl"
      >
        {desktopLinks.map((item) => {
          const active = !item.external && isActive(item.href);
          const style: React.CSSProperties = {
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 14px", borderRadius: 10, textDecoration: "none",
            fontFamily: "Heebo, sans-serif", fontSize: 14,
            fontWeight: active ? 700 : 400,
            color: active ? "#8B6914" : C.muted,
            background: active ? "rgba(197,164,109,0.12)" : "transparent",
            whiteSpace: "nowrap",
          };
          return item.external ? (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={style}>
              <span style={{ fontSize: 17 }}>{item.emoji}</span>{item.label}
            </a>
          ) : (
            <Link key={item.label} href={item.href} style={style}>
              <span style={{ fontSize: 17 }}>{item.emoji}</span>{item.label}
            </Link>
          );
        })}
      </nav>
      {/* ── Bottom sheet backdrop ── */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[190] md:hidden"
          style={{ background: "rgba(28,16,8,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* ── Bottom sheet ── */}
      <div
        className="fixed left-0 right-0 z-[195] md:hidden"
        style={{
          bottom:           0,
          transform:        sheetOpen ? "translateY(0)" : "translateY(110%)",
          transition:       "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
          background:       "#FDFAF5",
          borderRadius:     "24px 24px 0 0",
          boxShadow:        "0 -8px 40px rgba(28,16,8,0.12)",
          border:           `1px solid ${C.border}`,
          borderBottom:     "none",
          paddingBottom:    "env(safe-area-inset-bottom, 20px)",
        }}
        dir="rtl"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(28,16,8,0.12)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.dark }}>
            עוד אפשרויות
          </p>
          <button
            onClick={() => setSheetOpen(false)}
            style={{ background: "rgba(28,16,8,0.06)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={15} style={{ color: C.dark }} />
          </button>
        </div>

        {/* Sheet items */}
        <div className="flex flex-col px-4 gap-1 pb-4">
          {sheetItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSheetOpen(false)}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            14,
                  padding:        "13px 12px",
                  borderRadius:   16,
                  textDecoration: "none",
                  color:          C.dark,
                  fontFamily:     "Heebo, sans-serif",
                  fontSize:       15,
                  fontWeight:     500,
                  transition:     "background 0.15s",
                }}
                className="hover:bg-[rgba(197,164,109,0.07)] active:bg-[rgba(197,164,109,0.12)]"
              >
                <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{item.emoji}</span>
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSheetOpen(false)}
                style={{
                  display:        "flex",
                  alignItems:     "center",
                  gap:            14,
                  padding:        "13px 12px",
                  borderRadius:   16,
                  textDecoration: "none",
                  color:          C.dark,
                  fontFamily:     "Heebo, sans-serif",
                  fontSize:       15,
                  fontWeight:     500,
                  background:     pathname.startsWith(item.href) ? "rgba(197,164,109,0.09)" : "transparent",
                  transition:     "background 0.15s",
                }}
              >
                <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{item.emoji}</span>
                {item.label}
                {pathname.startsWith(item.href) && (
                  <span style={{ marginRight: "auto", width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
                )}
              </Link>
            )
          )}
        </div>
      </div>

      {/* ── Fixed bottom nav bar ── */}
      <nav
        className="fixed left-0 right-0 bottom-0 z-[180] md:hidden"
        style={{
          background:     C.bg,
          backdropFilter: "blur(16px)",
          borderTop:      `1px solid ${C.border}`,
          boxShadow:      "0 -4px 24px rgba(28,16,8,0.06)",
          paddingBottom:  "env(safe-area-inset-bottom, 0px)",
        }}
        dir="rtl"
      >
        <div style={{ display: "flex", alignItems: "stretch", height: 56 }}>
          {tabs.map((tab) => {
            const active = tab.href ? isActive(tab.href) : false;
            const sheetTab = tab.href === null;

            const inner = (
              <span
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "center",
                  gap:            3,
                  width:          "100%",
                  height:         "100%",
                  position:       "relative",
                }}
              >
                {/* Active dot */}
                {(active || (sheetTab && sheetOpen)) && (
                  <span
                    style={{
                      position:     "absolute",
                      top:          4,
                      left:         "50%",
                      transform:    "translateX(-50%)",
                      width:        20,
                      height:       3,
                      borderRadius: 2,
                      background:   C.gold,
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize:   20,
                    lineHeight: 1,
                    filter:     active || (sheetTab && sheetOpen) ? "none" : "grayscale(0.6) opacity(0.6)",
                    transition: "filter 0.2s",
                  }}
                >
                  {tab.emoji}
                </span>
                <span
                  style={{
                    fontSize:   10,
                    fontWeight: active || (sheetTab && sheetOpen) ? 700 : 400,
                    color:      active || (sheetTab && sheetOpen) ? C.gold : C.muted,
                    fontFamily: "Heebo, sans-serif",
                    transition: "color 0.2s, font-weight 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </span>
              </span>
            );

            return sheetTab ? (
              <button
                key={tab.label}
                onClick={() => setSheetOpen(!sheetOpen)}
                style={{
                  flex:       1,
                  border:     "none",
                  background: "transparent",
                  cursor:     "pointer",
                  padding:    0,
                }}
              >
                {inner}
              </button>
            ) : (
              <Link
                key={tab.label}
                href={tab.href!}
                onClick={() => setSheetOpen(false)}
                style={{
                  flex:           1,
                  textDecoration: "none",
                  display:        "flex",
                  alignItems:     "stretch",
                }}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
