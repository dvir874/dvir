"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Users, ArrowRight } from "lucide-react";

/* ── Demo data — mirrors a real RSVP token payload ─── */
const DEMO_GUEST = { name: "ישראל ישראלי", guest_count: 2 };
const DEMO_EVENT = {
  name:    "נועה & אורי",
  date:    "יום שישי, 16 באוקטובר 2026",
  address: "אולם השרון, אבן יהודה",
};

/* ── Theme — matches the default gold theme ─────────── */
const T = {
  bodyBg:       "#FDFAF5",
  cardBg:       "#FFFFFF",
  cardBorder:   "rgba(197,164,109,0.18)",
  cardShadow:   "0 8px 40px rgba(0,0,0,0.07)",
  headingColor: "#1a1a1a",
  mutedColor:   "rgba(26,26,26,0.50)",
  accentColor:  "#C5A46D",
  accentBg:     "rgba(197,164,109,0.10)",
  accentBorder: "rgba(197,164,109,0.25)",
};

const MEAL_OPTIONS = [
  { value: "regular",     label: "רגיל",          emoji: "🍽️" },
  { value: "vegetarian",  label: "צמחוני",         emoji: "🥗" },
  { value: "vegan",       label: "טבעוני",         emoji: "🌱" },
  { value: "mehadrin",    label: "כשר מהדרין",    emoji: "✡️" },
];

const HEEBO = { fontFamily: "Heebo, sans-serif" };
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };

export default function DemoRsvpPage() {
  const [screen,     setScreen]     = useState<"form" | "done">("form");
  const [choice,     setChoice]     = useState<"confirmed" | "declined" | null>(null);
  const [guestCount, setGuestCount] = useState(DEMO_GUEST.guest_count);
  const [meal,       setMeal]       = useState<string | null>(null);

  const handleSubmit = () => {
    if (!choice) return;
    setScreen("done");
  };

  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(DEMO_EVENT.address)}&navigate=yes`;
  const calUrl  = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=נועה+%26+אורי&dates=20261016T190000Z/20261016T235900Z&location=אולם+השרון+אבן+יהודה";

  return (
    <div dir="rtl" lang="he" className="min-h-screen flex flex-col" style={{ background: T.bodyBg }}>

      {/* Demo banner */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5"
        style={{ background: "linear-gradient(135deg,#C5A46D,#D4BC8A)", boxShadow: "0 2px 12px rgba(197,164,109,0.4)" }}
      >
        <span className="text-white/70 text-xs hidden sm:block" style={HEEBO}>✦ דף לדוגמה בלבד</span>
        <p className="text-white font-semibold text-sm text-center flex-1" style={HEEBO}>
          כך נראה דף האישור שמקבל כל אורח
        </p>
        <Link
          href="/#pricing"
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap"
          style={HEEBO}
        >
          הזמינו עכשיו
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Page body — same structure as real Shell */}
      <div
        className="flex-1 flex items-center justify-center p-4 pt-20"
        style={{ background: `linear-gradient(160deg,${T.bodyBg} 0%,${T.bodyBg}ee 100%)` }}
      >
        {/* Corner ornaments — same as real RSVP */}
        {(["top-16 right-6", "top-16 left-6 scale-x-[-1]", "bottom-6 right-6 scale-y-[-1]", "bottom-6 left-6 -scale-x-100 scale-y-[-1]"] as const).map((p) => (
          <div key={p} className={`fixed ${p} opacity-20 pointer-events-none`}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M2 2L13 2" stroke={T.accentColor} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 2L2 13" stroke={T.accentColor} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        ))}

        <div
          className="w-full max-w-sm rounded-3xl p-7"
          style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow }}
        >
          {screen === "done" ? (
            /* ── Done screen ─────────────────────────────── */
            <div className="text-center" style={{ animation: "rsvpFadeUp 0.5s ease both" }}>

              {choice === "confirmed" && (
                <div className="flex justify-center gap-3 mb-4">
                  {["✦", "💛", "✦"].map((s, i) => (
                    <span key={i} className="text-base" style={{
                      color: T.accentColor,
                      animation: `float ${2.5 + i * 0.4}s ease-in-out ${i * 0.15}s infinite`,
                      opacity: i === 1 ? 1 : 0.6,
                    }}>{s}</span>
                  ))}
                </div>
              )}

              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{
                  background: choice === "confirmed"
                    ? `radial-gradient(circle,${T.accentColor}22 0%,${T.accentColor}0a 100%)`
                    : "rgba(197,164,109,0.08)",
                  border: `1.5px solid ${T.accentColor}44`,
                  animation: "rsvpPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
                }}
              >
                {choice === "confirmed"
                  ? <CheckCircle size={44} style={{ color: T.accentColor }} strokeWidth={1.5} />
                  : <XCircle    size={44} style={{ color: T.accentColor }} strokeWidth={1.5} />}
              </div>

              <h2 className="text-2xl font-bold mb-2" style={{ color: T.headingColor, ...FRANK, lineHeight: 1.3 }}>
                {choice === "confirmed" ? "תודה שאישרתם!" : "קיבלנו את תגובתכם"}
              </h2>

              {choice === "confirmed" && (
                <p className="text-base font-light mb-1" style={{ color: T.mutedColor, ...FRANK }}>
                  מחכים לכם ביום המיוחד 🤍
                </p>
              )}

              <p className="text-sm mb-1" style={{ color: T.mutedColor, ...HEEBO }}>
                {choice === "confirmed"
                  ? `${guestCount} ${guestCount === 1 ? "אורח" : "אורחים"} רשומים להגיע`
                  : "חבל שלא תוכלו להגיע — נשמח לראותכם בפעם אחרת 💛"}
              </p>

              {/* Event name card */}
              <div className="mt-4 mb-5 py-3 px-4 rounded-2xl"
                style={{ background: T.accentBg, border: `1px solid ${T.accentColor}22` }}>
                <p className="text-sm font-semibold" style={{ color: T.headingColor, ...FRANK }}>
                  {DEMO_EVENT.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: T.accentColor, ...HEEBO }}>
                  {DEMO_EVENT.date}
                </p>
              </div>

              {/* Calendar + Waze */}
              {choice === "confirmed" && (
                <div className="flex flex-col gap-2.5" style={{ animation: "rsvpFadeUp 0.4s ease 0.35s both" }}>
                  <a href={calUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:opacity-85"
                    style={{ background: T.accentBg, color: T.accentColor, border: `1px solid ${T.accentColor}33`, ...HEEBO, boxShadow: `0 2px 10px ${T.accentColor}14` }}
                  >
                    📅 הוסיפו ליומן Google
                  </a>
                  <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:opacity-85"
                    style={{ background: "rgba(51,204,255,0.08)", color: "#0099CC", border: "1px solid rgba(51,204,255,0.25)", ...HEEBO }}
                  >
                    🚗 נווטו לאולם — Waze
                  </a>
                </div>
              )}

              <div className="w-16 h-px mx-auto mt-6"
                style={{ background: `linear-gradient(90deg,transparent,${T.accentColor},transparent)` }} />

              <button
                onClick={() => { setScreen("form"); setChoice(null); setGuestCount(DEMO_GUEST.guest_count); setMeal(null); }}
                className="mt-4 text-xs underline underline-offset-4"
                style={{ color: T.mutedColor, ...HEEBO }}
              >
                חזרה לטופס
              </button>
            </div>

          ) : (
            /* ── Form screen ─────────────────────────────── */
            <>
              {/* Event header */}
              <div className="text-center mb-6" style={{ animation: "rsvpFadeUp 0.4s ease both" }}>
                <div className="flex justify-center gap-2 mb-3" style={{ color: T.accentColor, opacity: 0.55 }}>
                  <span style={{ fontSize: 10 }}>✦</span>
                  <span style={{ fontSize: 10 }}>✦</span>
                  <span style={{ fontSize: 10 }}>✦</span>
                </div>
                <p className="text-[10px] tracking-[0.26em] uppercase mb-2" style={{ color: T.accentColor, ...HEEBO }}>
                  אתם מוזמנים
                </p>
                <h1 className="text-3xl font-bold mb-1.5 leading-tight" style={{ color: T.headingColor, ...FRANK }}>
                  {DEMO_EVENT.name}
                </h1>
                <p className="text-sm" style={{ color: T.mutedColor, ...HEEBO }}>{DEMO_EVENT.date}</p>
                <p className="text-xs mt-1" style={{ color: `${T.accentColor}bb`, ...HEEBO }}>
                  📍 {DEMO_EVENT.address}
                </p>
                <div className="w-14 h-px mx-auto mt-4"
                  style={{ background: `linear-gradient(90deg,transparent,${T.accentColor}88,transparent)` }} />
              </div>

              {/* Greeting */}
              <p className="text-center text-base font-semibold mb-1"
                style={{ color: T.headingColor, ...FRANK, animation: "rsvpFadeUp 0.4s ease 0.08s both" }}>
                שלום {DEMO_GUEST.name} 🤍
              </p>
              <p className="text-center text-sm mb-6"
                style={{ color: T.mutedColor, ...HEEBO, animation: "rsvpFadeUp 0.4s ease 0.12s both" }}>
                האם תוכלו להגיע לאירוע?
              </p>

              {/* Confirm / Decline */}
              <div className="flex flex-col gap-3 mb-6" style={{ animation: "rsvpFadeUp 0.4s ease 0.18s both" }}>
                <button
                  onClick={() => { setChoice("confirmed"); setGuestCount(DEMO_GUEST.guest_count); }}
                  className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-250"
                  style={{
                    ...HEEBO,
                    background: choice === "confirmed"
                      ? `linear-gradient(135deg,${T.accentColor} 0%,${T.accentColor}dd 100%)`
                      : T.cardBg,
                    color:  choice === "confirmed" ? "white" : T.accentColor,
                    border: `2px solid ${choice === "confirmed" ? "transparent" : T.accentBorder}`,
                    boxShadow: choice === "confirmed"
                      ? `0 6px 24px ${T.accentColor}30, 0 2px 8px ${T.accentColor}18`
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    transform: choice === "confirmed" ? "scale(1.015)" : "scale(1)",
                  }}
                >
                  <CheckCircle size={20} strokeWidth={choice === "confirmed" ? 2 : 1.5} />
                  כן, נגיע! 🎉
                </button>

                <button
                  onClick={() => { setChoice("declined"); setGuestCount(1); }}
                  className="w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-250"
                  style={{
                    ...HEEBO,
                    background: choice === "declined" ? "rgba(90,75,65,0.08)" : "transparent",
                    color:  choice === "declined" ? "#7A6A5A" : T.mutedColor,
                    border: `1.5px solid ${choice === "declined" ? "rgba(90,75,65,0.3)" : T.cardBorder}`,
                  }}
                >
                  <XCircle size={16} strokeWidth={1.5} />
                  לא נוכל להגיע
                </button>
              </div>

              {/* Guest count */}
              {choice === "confirmed" && (
                <div className="rounded-2xl p-5 mb-5" style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}` }}>
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: T.headingColor, ...HEEBO }}>
                    <Users size={16} style={{ color: T.accentColor }} />
                    כמה אורחים מגיעים?
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                      className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                      style={{ background: T.cardBg, border: `1px solid ${T.accentBorder}`, color: T.accentColor }}
                    >−</button>
                    <span className="text-3xl font-bold w-12 text-center" style={{ color: T.headingColor, ...FRANK }}>
                      {guestCount}
                    </span>
                    <button
                      onClick={() => setGuestCount((c) => Math.min(20, c + 1))}
                      className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                      style={{ background: T.cardBg, border: `1px solid ${T.accentBorder}`, color: T.accentColor }}
                    >+</button>
                  </div>
                </div>
              )}

              {/* Meal preference */}
              {choice === "confirmed" && (
                <div className="rounded-2xl p-5 mb-5" style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}` }}>
                  <p className="text-sm font-semibold mb-3" style={{ color: T.headingColor, ...HEEBO }}>
                    העדפת מנה
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {MEAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setMeal(opt.value)}
                        className="py-3 px-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                        style={{
                          ...HEEBO,
                          background: meal === opt.value
                            ? `linear-gradient(135deg,${T.accentColor},${T.accentColor}cc)`
                            : T.cardBg,
                          color:  meal === opt.value ? "white" : T.accentColor,
                          border: `1.5px solid ${meal === opt.value ? "transparent" : T.accentBorder}`,
                        }}
                      >
                        <span>{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!choice}
                className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40"
                style={{
                  ...HEEBO,
                  background: `linear-gradient(135deg,${T.accentColor},${T.accentColor}bb)`,
                  color: "white",
                  boxShadow: choice ? `0 4px 20px ${T.accentColor}33` : "none",
                }}
              >
                שלחו אישור ✓
              </button>

              <p className="text-center text-xs mt-5" style={{ color: T.mutedColor, ...HEEBO }}>
                התגובה שלכם תישמר מיד
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
