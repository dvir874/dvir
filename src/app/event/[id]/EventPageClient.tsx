"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar, Clock, MapPin, Navigation, Map, ChevronDown, ExternalLink,
} from "lucide-react";
import type { EventTheme } from "@/lib/themes";

interface EventData {
  id: string;
  name: string;
  date: string;
  address?: string | null;
  theme?: string | null;
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
}: {
  event: EventData;
  theme: EventTheme;
  isPreview: boolean;
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
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ background: theme.heroBg, paddingTop: isPreview ? "56px" : "0" }}
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

        <div className="relative z-10 px-6 max-w-xl mx-auto flex flex-col items-center hero-content">
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
            <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${theme.cardBorder}` }}>
              <p className="text-xs" style={{ color: `${theme.accentColor}88`, ...HEEBO }}>
                ✦ {event.name}
              </p>
            </div>
          </div>
        </div>
      </section>

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
