"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, MapPin, Navigation, Map, ChevronDown, ExternalLink, CalendarPlus, Share2,
} from "lucide-react";

function buildICS(name: string, date: string, address?: string | null): string {
  const d = new Date(date + "T19:00:00");
  const end = new Date(d.getTime() + 4 * 60 * 60 * 1000);
  const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `DTSTART:${fmt(d)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${name}`,
    address ? `LOCATION:${address}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

function googleCalendarUrl(name: string, date: string, address?: string | null): string {
  const d = new Date(date + "T19:00:00");
  const end = new Date(d.getTime() + 4 * 60 * 60 * 1000);
  // Note: avoid inline regex with brackets — Tailwind scanner mistake
  const stripForGCal = (dt: Date) => dt.toISOString().replace(/-/g, "").replace(/:/g, "").replace(/\./g, "").replace("Z", "").slice(0, 15) + "Z";
  const fmt = stripForGCal;
  const params = new URLSearchParams({
    action: "TEMPLATE", text: name,
    dates: `${fmt(d)}/${fmt(end)}`,
    ...(address ? { location: address } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function AddToCalendarButton({ event, theme }: { event: EventData; theme: import("@/lib/themes").EventTheme }) {
  const [open, setOpen] = useState(false);
  function downloadICS() {
    const blob = new Blob([buildICS(event.name, event.date, event.address)], { type: "text/calendar" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${event.name}.ics`; a.click();
    setOpen(false);
  }
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 1.4rem",
          borderRadius: 50, border: `1.5px solid ${theme.accentColor}55`,
          background: `${theme.accentColor}10`, color: theme.accentColor,
          cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600,
        }}
      >
        <CalendarPlus size={15} /> הוסף ליומן
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)",
          background: "white", borderRadius: 14, overflow: "hidden", whiteSpace: "nowrap",
          boxShadow: "0 8px 30px rgba(0,0,0,0.13)", zIndex: 10,
          border: "1px solid rgba(197,164,109,0.2)",
        }}>
          <a href={googleCalendarUrl(event.name, event.date, event.address)} target="_blank" rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.25rem", color: "#1C1008", textDecoration: "none", fontSize: 13, fontFamily: "Heebo, sans-serif" }}>
            📅 Google Calendar
          </a>
          <button onClick={downloadICS}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.25rem", width: "100%", background: "none", border: "none", cursor: "pointer", color: "#1C1008", fontSize: 13, fontFamily: "Heebo, sans-serif", borderTop: "1px solid rgba(197,164,109,0.12)" }}>
            🍎 Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}
import type { EventTheme } from "@/lib/themes";

interface EventData {
  id: string;
  name: string;
  date: string;
  address?: string | null;
  theme?: string | null;
  bit_phone?: string | null;
  paybox_link?: string | null;
  easy2give_link?: string | null;
  custom_gift_link?: string | null;
  dress_code?: string | null;
  parking_info?: string | null;
  greeting?: string | null;
  mini_site_hero_path?: string | null;
  event_timeline?: Array<{ time: string; title: string }> | null;
  partner1_name?: string | null;
  partner2_name?: string | null;
  couple_token?: string | null;
}

/* ── Countdown hook ─────────────────────────────────── */
function useCountdown(target: Date) {
  const [time, setTime]       = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff / 3_600_000) % 24),
        m: Math.floor((diff / 60_000)    % 60),
        s: Math.floor((diff / 1_000)     % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);

  return { time, mounted };
}

const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };
const HEEBO = { fontFamily: "Heebo, sans-serif" };

export default function EventPageClient({
  event,
  theme,
  isPreview,
  bitPhone,
}: {
  event: EventData;
  theme: EventTheme;
  isPreview: boolean;
  bitPhone?: string | null;
}) {
  const eventDate = new Date(event.date + "T19:00:00");
  const { time, mounted } = useCountdown(eventDate);

  const dateDisplay = eventDate.toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div dir="rtl" lang="he" className="min-h-screen" style={{ background: theme.bodyBg }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(197,164,109,0.3); }
          50% { text-shadow: 0 0 50px rgba(197,164,109,0.7), 0 0 100px rgba(197,164,109,0.2); }
        }
        @keyframes shimmerBtn {
          0% { left: -100%; }
          100% { left: 120%; }
        }
        .rsvp-btn {
          position: relative; overflow: hidden;
        }
        .rsvp-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        }
        .rsvp-btn:hover::after {
          animation: shimmerBtn 0.6s ease forwards;
        }
        .hero-content {
          animation: slideInUp 0.9s ease forwards;
        }
      `}</style>

      {/* ── Preview banner ──────────────────────────── */}
      {isPreview && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5"
          style={{
            background: `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}cc)`,
            boxShadow: `0 2px 12px ${theme.accentColor}40`,
          }}
        >
          <span className="text-white/70 text-xs hidden sm:block" style={HEEBO}>
            ✦ תצוגה מקדימה
          </span>
          <p className="text-white font-semibold text-sm text-center flex-1" style={HEEBO}>
            תצוגה מקדימה — כך יראה דף האירוע שלכם
          </p>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap"
            style={HEEBO}
          >
            חזרה לניהול
            <ExternalLink size={11} />
          </Link>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────── */}
      <section
        id="top"
        className="relative overflow-hidden"
        style={{
          minHeight: event.mini_site_hero_path ? "442px" : "100svh",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          justifyContent: event.mini_site_hero_path ? "flex-end" : "center",
          textAlign: "center",
          background: event.mini_site_hero_path ? "transparent" : theme.heroBg,
          paddingTop: isPreview ? "56px" : "0",
        }}
      >
        {/* Floating decorative circles */}
        <div style={{
          position: "absolute", width: 220, height: 220, borderRadius: "50%",
          border: "1px solid rgba(197,164,109,0.12)", top: -60, right: -60,
          animation: "float 8s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 140, height: 140, borderRadius: "50%",
          border: "1px solid rgba(197,164,109,0.08)", bottom: 30, left: -40,
          animation: "float 6s ease-in-out 2s infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 80, height: 80, borderRadius: "50%",
          border: "1px solid rgba(197,164,109,0.1)", top: "30%", left: 20,
          animation: "float 7s ease-in-out 1s infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 60, height: 60, borderRadius: "50%",
          border: "1px solid rgba(197,164,109,0.07)", bottom: "25%", right: 30,
          animation: "float 9s ease-in-out 3s infinite", pointerEvents: "none",
        }} />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px,${theme.heroAccent}dd 1px,transparent 0)`,
            backgroundSize: "22px 22px",
          }}
        />
        {/* Radial glow top-right */}
        <div
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle,${theme.heroAccent}18 0%,transparent 70%)` }}
        />

        {/* Corner ornaments */}
        {([
          "top-24 right-5 md:right-12",
          "top-24 left-5 md:left-12 scale-x-[-1]",
          "bottom-24 right-5 md:right-12 scale-y-[-1]",
          "bottom-24 left-5 md:left-12 -scale-x-100 scale-y-[-1]",
        ] as const).map((pos) => (
          <div key={pos} className={`absolute ${pos} opacity-20 pointer-events-none hidden sm:block`}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M2 2L18 2" stroke={theme.heroAccent} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 2L2 18" stroke={theme.heroAccent} strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="2" cy="2" r="2.5" fill={theme.heroAccent} />
            </svg>
          </div>
        ))}

        {/* Hero background photo — full-bleed when present (Stitch 2f663c5a) */}
        {event.mini_site_hero_path && (
          <>
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `url(${event.mini_site_hero_path})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }} />
            {/* Gradient overlay: lighter version to let photo show */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "linear-gradient(to top, rgba(253,250,245,1) 0%, rgba(253,250,245,0.2) 50%, transparent 100%)",
            }} />
          </>
        )}

        <div className="relative z-10 px-6 max-w-xl mx-auto flex flex-col items-center hero-content">
          {/* Couple photo circle / initials fallback (E3-S10) */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%", marginBottom: 24,
            border: `2px solid ${theme.heroAccent}`,
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            background: event.mini_site_hero_path ? "transparent" : `${theme.heroAccent}18`,
            flexShrink: 0,
          }}>
            {event.mini_site_hero_path ? (
              <img src={event.mini_site_hero_path} alt="תמונת הזוג"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 28, color: theme.heroAccent }}>
                {[event.partner1_name, event.partner2_name].filter(Boolean).map(n => n?.charAt(0)).join("") || "💍"}
              </span>
            )}
          </div>

          {/* Badge */}
          <div
            className="mb-7 px-5 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase"
            style={{
              background: theme.heroBadgeBg,
              border: `1px solid ${theme.heroBadgeBorder}`,
              color: theme.heroBadgeText,
              ...HEEBO,
            }}
          >
            ✦ חתונה
          </div>

          {/* Olive branch SVG ornament */}
          <svg width="80" height="48" viewBox="0 0 80 48" fill="none" className="mb-6"
            style={{ animation: "float 5s ease-in-out infinite" }}>
            <path d="M40 44C40 44 30 32 22 20C16 12 20 4 28 6" stroke={theme.heroAccent}
              strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M40 44C40 44 50 32 58 20C64 12 60 4 52 6" stroke={theme.heroAccent}
              strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <ellipse cx="22" cy="20" rx="7" ry="4" fill={theme.previewAccent} transform="rotate(-30 22 20)" opacity="0.7" />
            <ellipse cx="28" cy="12" rx="6" ry="3.5" fill={theme.previewAccent} transform="rotate(-20 28 12)" opacity="0.7" />
            <ellipse cx="58" cy="20" rx="7" ry="4" fill={theme.previewAccent} transform="rotate(30 58 20)" opacity="0.7" />
            <ellipse cx="52" cy="12" rx="6" ry="3.5" fill={theme.previewAccent} transform="rotate(20 52 12)" opacity="0.7" />
            <circle cx="40" cy="4" r="2" fill={theme.heroAccent} />
          </svg>

          <p className="text-xs tracking-[0.28em] uppercase mb-4" style={{ color: theme.heroMutedText, ...HEEBO }}>
            מוזמנים לחגוג
          </p>

          <div className="w-20 h-px mb-6"
            style={{ background: `linear-gradient(90deg,transparent,${theme.heroAccent},transparent)` }} />

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none mb-3"
            style={{ color: theme.heroNameColor, ...FRANK, animation: "glow 4s ease-in-out infinite" }}>
            {event.name}
          </h1>

          <p className="text-2xl sm:text-3xl font-light mb-6"
            style={{ color: theme.heroSubColor, ...FRANK }}>
            מתחתנים!
          </p>

          <div className="w-10 h-px mb-5" style={{ background: theme.heroAccent }} />
          <p className="text-sm mb-1" style={{ color: theme.heroMutedText, ...HEEBO }}>{dateDisplay}</p>
          {event.address && (
            <p className="text-xs mb-8" style={{ color: theme.heroMutedText, ...HEEBO }}>
              📍 {event.address}
            </p>
          )}

          {/* Countdown */}
          {mounted && (
            <div className="flex items-start gap-4 sm:gap-6 mb-10">
              {[
                { v: time.d, l: "ימים"  },
                { v: time.h, l: "שעות"  },
                { v: time.m, l: "דקות"  },
                { v: time.s, l: "שניות" },
              ].map(({ v, l }) => (
                <div key={l} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: theme.heroCountdownBg,
                      border: `1px solid ${theme.heroCountdownBorder}`,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      minWidth: "56px",
                    }}
                  >
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums"
                      style={{ color: theme.heroCountdownText, ...FRANK }}>
                      {String(v).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] tracking-widest uppercase"
                    style={{ color: theme.heroMutedText, ...HEEBO }}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => scrollTo("details")}
            className="transition-colors"
            style={{ color: theme.heroMutedText, animation: "float 3s ease-in-out infinite" }}
            aria-label="גלול למטה"
          >
            <ChevronDown size={26} />
          </button>
        </div>
      </section>

      {/* ── Event details ────────────────────────────── */}
      <section id="details" className="py-16 px-4" style={{ background: theme.bodyBg }}>
        <div className="max-w-xl mx-auto">
          <p className="text-center text-xs tracking-[0.22em] uppercase mb-8"
            style={{ color: theme.accentColor, ...HEEBO }}>
            פרטי האירוע
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Calendar, title: "תאריך", line1: dateDisplay.split(",")[1]?.trim() ?? dateDisplay, line2: "" },
              { icon: Clock,    title: "שעה",   line1: "19:00",  line2: "קבלת פנים" },
              { icon: MapPin,   title: "מיקום", line1: event.address ?? "כתובת האולם", line2: "" },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl"
                style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: theme.cardIconBg }}>
                  <item.icon size={20} strokeWidth={1.5} style={{ color: theme.accentColor }} />
                </div>
                <p className="text-[10px] tracking-[0.18em] uppercase mb-2"
                  style={{ color: `${theme.accentColor}aa`, ...HEEBO }}>
                  {item.title}
                </p>
                <p className="font-bold text-base leading-tight mb-1"
                  style={{ color: theme.headingColor, ...FRANK }}>
                  {item.line1}
                </p>
                {item.line2 && (
                  <p className="text-xs" style={{ color: theme.mutedColor, ...HEEBO }}>{item.line2}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Navigation ──────────────────────────────── */}
      {event.address && (
        <section className="py-14 px-4" style={{ background: theme.altSectionBg }}>
          <div className="max-w-xl mx-auto text-center">
            <p className="text-xs tracking-[0.22em] uppercase mb-3"
              style={{ color: theme.accentColor, ...HEEBO }}>
              הגעה למקום
            </p>
            <h2 className="text-2xl font-bold mb-2"
              style={{ color: theme.headingColor, ...FRANK }}>
              {event.address}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(event.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg,#33CCFF,#0099CC)", color: "white",
                  boxShadow: "0 6px 20px rgba(51,204,255,0.3)", ...HEEBO }}
              >
                <Navigation size={18} strokeWidth={2} /> נווטו ב-Waze
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105"
                style={{ background: theme.cardBg, color: theme.headingColor,
                  border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow, ...HEEBO }}
              >
                <Map size={18} strokeWidth={1.5} style={{ color: "#4285F4" }} /> Google Maps
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── Couple greeting ────────────────────────── */}
      {event.greeting && (
        <section className="py-12 px-4" style={{ background: theme.altSectionBg }}>
          <div className="max-w-md mx-auto text-center">
            <div className="text-2xl mb-3">💌</div>
            <div
              className="rounded-3xl p-7"
              style={{ background: theme.cardBg, border: `1px solid ${theme.accentColor}22`, boxShadow: theme.cardShadow }}
            >
              <p
                className="text-base leading-relaxed whitespace-pre-line"
                style={{ color: theme.headingColor, ...FRANK, fontStyle: "italic", lineHeight: 1.8 }}
              >
                {event.greeting}
              </p>
              <div className="mt-4 flex justify-center gap-2" style={{ color: theme.accentColor, opacity: 0.5 }}>
                <span style={{ fontSize: 9 }}>✦</span>
                <span style={{ fontSize: 9 }}>✦</span>
                <span style={{ fontSize: 9 }}>✦</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Dress code + Parking ────────────────────── */}
      {(event.dress_code || event.parking_info) && (
        <section className="py-12 px-4" style={{ background: event.greeting ? theme.bodyBg : theme.altSectionBg }}>
          <div className="max-w-xl mx-auto">
            <p className="text-center text-xs tracking-[0.22em] uppercase mb-7"
              style={{ color: theme.accentColor, ...HEEBO }}>
              מידע נוסף
            </p>
            <div className={`grid gap-4 ${event.dress_code && event.parking_info ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"}`}>
              {event.dress_code && (
                <div
                  className="flex flex-col items-center text-center p-6 rounded-2xl"
                  style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: theme.cardIconBg }}>
                    <span style={{ fontSize: 20 }}>👔</span>
                  </div>
                  <p className="text-[10px] tracking-[0.18em] uppercase mb-2"
                    style={{ color: `${theme.accentColor}aa`, ...HEEBO }}>
                    קוד לבוש
                  </p>
                  <p className="font-bold text-base leading-tight" style={{ color: theme.headingColor, ...FRANK }}>
                    {event.dress_code}
                  </p>
                </div>
              )}
              {event.parking_info && (
                <div
                  className="flex flex-col items-center text-center p-6 rounded-2xl"
                  style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: theme.cardIconBg }}>
                    <span style={{ fontSize: 20 }}>🅿️</span>
                  </div>
                  <p className="text-[10px] tracking-[0.18em] uppercase mb-2"
                    style={{ color: `${theme.accentColor}aa`, ...HEEBO }}>
                    חניה
                  </p>
                  <p className="font-bold text-sm leading-snug" style={{ color: theme.headingColor, ...FRANK }}>
                    {event.parking_info}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── RSVP note ───────────────────────────────── */}
      <section className="py-14 px-4" style={{ background: theme.bodyBg }}>
        <div className="max-w-sm mx-auto text-center">
          <div
            className="rounded-3xl p-8"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}
          >
            <div className="text-3xl mb-4">💌</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: theme.headingColor, ...FRANK }}>
              אישור הגעה
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: theme.mutedColor, ...HEEBO }}>
              קישור אישי לאישור הגעה נשלח לכם ישירות בהודעה.
              <br />
              לא קיבלתם? פנו לזוג המאושר.
            </p>
            <div className="mt-5 pt-4 flex justify-center gap-3 flex-wrap" style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
              <AddToCalendarButton event={event} theme={theme} />
              <button
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try { await navigator.share({ title: event.name, text: `מוזמנים לאירוע ${event.name}`, url }); } catch { /* cancelled */ }
                  } else {
                    await navigator.clipboard.writeText(url);
                    alert("הקישור הועתק! שתפו עם מי שתרצו 🎉");
                  }
                }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 1.4rem", borderRadius: 50, border: `1.5px solid ${theme.accentColor}55`, background: `${theme.accentColor}10`, color: theme.accentColor, cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600 }}
              >
                <Share2 size={15} /> שתף
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gift / Payment section ──────────────────────── */}
      {(event.bit_phone || event.paybox_link || event.easy2give_link || event.custom_gift_link) && (
        <section className="py-10 px-4 text-center" style={{ background: theme.bodyBg }}>
          <p style={{ fontSize: 13, color: theme.accentColor, marginBottom: "0.4rem", fontFamily: "Frank Ruhl Libre, serif", letterSpacing: "0.08em" }}>🎁 רוצים לשלוח מתנה?</p>
          <p style={{ fontSize: 12, color: `${theme.heroMutedText}`, marginBottom: "1.25rem", fontFamily: "Heebo, sans-serif" }}>בחרו אמצעי תשלום נוח עבורכם</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", justifyContent: "center" }}>
            {event.bit_phone && (
              <a href={`https://www.bitpay.co.il/?phone=${event.bit_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.7rem 1.5rem", borderRadius: 50, background: "linear-gradient(135deg, #1B3AE8, #2D52F5)", color: "white", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(27,58,232,0.25)" }}>
                📱 Bit
              </a>
            )}
            {event.paybox_link && (
              <a href={event.paybox_link} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.7rem 1.5rem", borderRadius: 50, background: "linear-gradient(135deg, #6B46C1, #8B5CF6)", color: "white", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(107,70,193,0.25)" }}>
                💜 PayBox
              </a>
            )}
            {event.easy2give_link && (
              <a href={event.easy2give_link} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.7rem 1.5rem", borderRadius: 50, background: "linear-gradient(135deg, #059669, #10B981)", color: "white", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 4px 16px rgba(5,150,105,0.25)" }}>
                💚 Easy2Give
              </a>
            )}
            {event.custom_gift_link && (
              <a href={event.custom_gift_link} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0.7rem 1.5rem", borderRadius: 50, background: `linear-gradient(135deg, ${theme.accentColor}, #D4BC8A)`, color: "white", fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                🔗 שליחת מתנה
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Wedding Day Timeline ─────────────────────── */}
      {event.event_timeline && event.event_timeline.length > 0 && (
        <section className="py-12 px-4" style={{ background: theme.bodyBg }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <h2 className="text-xl font-bold text-center mb-8" style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
              🕐 תוכנית האירוע
            </h2>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", right: 16, top: 8, bottom: 8, width: 2, background: `${theme.accentColor}25` }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {event.event_timeline.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: theme.cardBg, border: `2px solid ${theme.accentColor}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: theme.accentColor, fontFamily: "Heebo, sans-serif" }}>
                      {item.time}
                    </div>
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <p style={{ fontWeight: 700, color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif", fontSize: 15 }}>{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="py-8 px-4 text-center" style={{ background: theme.footerBg }}>
        <div className="w-12 h-px mx-auto mb-4"
          style={{ background: `rgba(197,164,109,0.35)` }} />
        <p className="text-xs mb-3" style={{ color: theme.footerTextMuted, ...HEEBO }}>
          הזמנה דיגיטלית בעיצוב מקצועי
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          style={{ color: theme.footerAccent, ...HEEBO }}
        >
          רגע לפני <ExternalLink size={13} />
        </Link>
        <p className="text-[10px] mt-3" style={{ color: `${theme.footerTextMuted}88`, ...HEEBO }}>
          © {new Date().getFullYear()} רגע לפני · כל הזכויות שמורות
        </p>
        <div style={{
          textAlign: "center", padding: "1.5rem",
          borderTop: "1px solid rgba(197,164,109,0.15)",
          background: "rgba(197,164,109,0.04)"
        }}>
          <a
            href="https://regalifnei.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: "rgba(197,164,109,0.6)", textDecoration: "none", fontFamily: "Heebo, sans-serif", letterSpacing: "0.05em" }}
          >
            ✦ נוצר ע״י רגע לפני · הזמנות דיגיטליות לחתונה
          </a>
        </div>
      </footer>
    </div>
  );
}
