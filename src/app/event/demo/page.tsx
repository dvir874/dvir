"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Map,
  MessageCircle,
  Share2,
  CheckCircle,
  Users,
  Send,
  ChevronDown,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { WA_PHONE } from "@/lib/constants";

/* ── Event configuration ───────────────────────────── */
const EVENT = {
  type:         "חתונה",
  names:        "נועה & אורי",
  subtitle:     "מתחתנים!",
  date:         new Date("2026-10-16T19:00:00"),
  dateDisplay:  "יום שישי, 16 באוקטובר 2026",
  dateHebrew:   "כ״ד בתשרי תשפ״ז",
  time:         "19:00",
  venue:        "אולם השרון",
  address:      "רחוב הארגמן 4, אבן יהודה",
  rsvpBy:       "1 באוקטובר 2026",
  wazeQuery:    "אולם+השרון+אבן+יהודה",
  mapsQuery:    "אולם+השרון+אבן+יהודה",
  demoUrl:      "https://ragalifnei.co.il/event/demo",
};

const HEEBO = { fontFamily: "Heebo, sans-serif" };
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };

/* ── Countdown hook ────────────────────────────────── */
function useCountdown(target: Date) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff / 3_600_000) % 24),
        m: Math.floor((diff / 60_000) % 60),
        s: Math.floor((diff / 1_000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);

  return { time, mounted };
}

/* ─────────────────────────────────────────────────── */
export default function DemoEventPage() {
  const { time, mounted } = useCountdown(EVENT.date);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [form, setForm] = useState({
    name: "", attending: "yes", guests: "1", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* Smooth scroll helper */
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* RSVP → WhatsApp */
  const handleRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "נא להזין שם מלא";
    if (setErrors(errs), Object.keys(errs).length) return;

    const attending = form.attending === "yes";
    const msg = [
      `🎉 אישור הגעה — חתונת נועה ואורי`,
      `📅 ${EVENT.dateDisplay}`,
      ``,
      `👤 שם: ${form.name}`,
      `${attending ? "✅" : "❌"} הגעה: ${attending ? "מגיע/ה" : "לא מגיע/ה"}`,
      attending ? `👥 מספר אורחים: ${form.guests}` : "",
      form.notes.trim() ? `📝 הערות: ${form.notes}` : "",
      ``,
      `נשלח דרך דף האירוע הדיגיטלי`,
    ].filter((l) => l !== undefined).join("\n");

    window.open(
      `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setRsvpDone(true);
  };

  /* WhatsApp share */
  const share = () => {
    const text = `הוזמנתם לחתונה של נועה ואורי! 🎉\n${EVENT.dateDisplay}\n${EVENT.venue}, ${EVENT.address}\n\nלדף האירוע: ${EVENT.demoUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ─────────── render ─────────── */
  return (
    <div dir="rtl" lang="he" className="min-h-screen" style={{ background: "#FDFAF5" }}>

      {/* ══ DEMO BANNER ══════════════════════════════ */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5"
        style={{
          background: "linear-gradient(135deg,#C5A46D,#D4BC8A)",
          boxShadow: "0 2px 12px rgba(197,164,109,0.4)",
        }}
      >
        <span className="text-white/70 text-xs hidden sm:block" style={HEEBO}>
          ✦ דף לדוגמה בלבד
        </span>
        <p className="text-white font-semibold text-sm text-center flex-1" style={HEEBO}>
          זהו דף הדגמה — כך נראה דף האירוע שלכם
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

      {/* ══ HERO ═════════════════════════════════════ */}
      <section
        id="top"
        className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-10"
        style={{ background: "linear-gradient(160deg,#0D1B0C 0%,#1A2B18 55%,#0F2010 100%)" }}
      >
        {/* Background layers */}
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px,rgba(197,164,109,0.9) 1px,transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(197,164,109,0.10) 0%,transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-5%] left-[-5%] w-[40vw] h-[40vw] max-w-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(107,123,90,0.12) 0%,transparent 70%)" }}
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
              <path d="M2 2L18 2" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 2L2 18" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="2" cy="2" r="2.5" fill="#C5A46D" />
            </svg>
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 px-6 max-w-xl mx-auto flex flex-col items-center">
          {/* Event type badge */}
          <div
            className="mb-7 px-5 py-1.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase"
            style={{
              background: "rgba(197,164,109,0.15)",
              border: "1px solid rgba(197,164,109,0.4)",
              color: "#C5A46D",
              ...HEEBO,
            }}
          >
            ✦ {EVENT.type}
          </div>

          {/* Olive branch */}
          <svg
            width="80"
            height="48"
            viewBox="0 0 80 48"
            fill="none"
            className="mb-6"
            style={{ animation: "float 5s ease-in-out infinite" }}
          >
            <path d="M40 44C40 44 30 32 22 20C16 12 20 4 28 6" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M40 44C40 44 50 32 58 20C64 12 60 4 52 6" stroke="#C5A46D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <ellipse cx="22" cy="20" rx="7" ry="4" fill="#4A6B3A" transform="rotate(-30 22 20)" />
            <ellipse cx="28" cy="12" rx="6" ry="3.5" fill="#4A6B3A" transform="rotate(-20 28 12)" />
            <ellipse cx="58" cy="20" rx="7" ry="4" fill="#4A6B3A" transform="rotate(30 58 20)" />
            <ellipse cx="52" cy="12" rx="6" ry="3.5" fill="#4A6B3A" transform="rotate(20 52 12)" />
            <circle cx="40" cy="4" r="2" fill="#C5A46D" />
          </svg>

          {/* Eyebrow */}
          <p className="text-xs tracking-[0.28em] uppercase mb-4 text-white/45" style={HEEBO}>
            מוזמנים לחגוג
          </p>

          {/* Divider */}
          <div
            className="w-20 h-px mb-6"
            style={{ background: "linear-gradient(90deg,transparent,#C5A46D,transparent)" }}
          />

          {/* Names */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none text-white mb-3"
            style={FRANK}
          >
            {EVENT.names}
          </h1>

          {/* Subtitle */}
          <p className="text-2xl sm:text-3xl font-light mb-6" style={{ color: "#C5A46D", ...FRANK }}>
            {EVENT.subtitle}
          </p>

          {/* Date */}
          <div className="w-10 h-px mb-5" style={{ background: "#C5A46D" }} />
          <p className="text-white/60 text-sm mb-1" style={HEEBO}>{EVENT.dateDisplay}</p>
          <p className="text-white/35 text-xs mb-8" style={HEEBO}>{EVENT.dateHebrew}</p>

          {/* ── Countdown ── */}
          {mounted && (
            <div className="flex items-start gap-4 sm:gap-6 mb-10">
              {[
                { v: time.d, l: "ימים"  },
                { v: time.h, l: "שעות"  },
                { v: time.m, l: "דקות"  },
                { v: time.s, l: "שניות" },
              ].map(({ v, l }, i) => (
                <div key={l} className="flex flex-col items-center gap-1.5">
                  {i > 0 && (
                    <span
                      className="absolute text-white/25 text-2xl font-light -translate-x-[calc(50%+0.75rem)] mt-2"
                      aria-hidden
                    >
                    </span>
                  )}
                  <div
                    className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: "rgba(197,164,109,0.10)",
                      border: "1px solid rgba(197,164,109,0.35)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                      minWidth: "56px",
                    }}
                  >
                    <span
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums"
                      style={FRANK}
                    >
                      {String(v).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] tracking-widest text-white/40 uppercase" style={HEEBO}>
                    {l}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Scroll cue */}
          <button
            onClick={() => scrollTo("details")}
            className="text-white/25 hover:text-white/50 transition-colors"
            style={{ animation: "float 3s ease-in-out infinite" }}
            aria-label="גלול למטה"
          >
            <ChevronDown size={26} />
          </button>
        </div>
      </section>

      {/* ══ EVENT DETAILS ════════════════════════════ */}
      <section
        id="details"
        className="py-16 px-4"
        style={{ background: "#FDFAF5" }}
      >
        <div className="max-w-xl mx-auto">
          <p className="text-center text-xs tracking-[0.22em] uppercase mb-8 text-[#C5A46D]" style={HEEBO}>
            פרטי האירוע
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Calendar,
                title: "תאריך",
                line1: EVENT.dateDisplay.split(",")[1]?.trim() ?? EVENT.dateDisplay,
                line2: EVENT.dateHebrew,
                accent: "#C5A46D",
              },
              {
                icon: Clock,
                title: "שעה",
                line1: EVENT.time,
                line2: "קבלת פנים",
                accent: "#6B7B5A",
              },
              {
                icon: MapPin,
                title: "מיקום",
                line1: EVENT.venue,
                line2: EVENT.address,
                accent: "#C5A46D",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl"
                style={{
                  background: "white",
                  border: "1px solid rgba(197,164,109,0.18)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${item.accent}14` }}
                >
                  <item.icon size={20} strokeWidth={1.5} style={{ color: item.accent }} />
                </div>
                <p className="text-[10px] tracking-[0.18em] uppercase mb-2 text-[#C5A46D]/70" style={HEEBO}>
                  {item.title}
                </p>
                <p className="font-bold text-[#1a1a1a] text-base leading-tight mb-1" style={FRANK}>
                  {item.line1}
                </p>
                <p className="text-[#1a1a1a]/45 text-xs" style={HEEBO}>
                  {item.line2}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NAVIGATION ═══════════════════════════════ */}
      <section
        id="nav-section"
        className="py-14 px-4"
        style={{ background: "linear-gradient(160deg,#F6F1E8,#EDE6D6)" }}
      >
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs tracking-[0.22em] uppercase mb-3 text-[#C5A46D]" style={HEEBO}>
            הגעה למקום
          </p>
          <h2
            className="text-2xl font-bold text-[#1a1a1a] mb-2"
            style={FRANK}
          >
            {EVENT.venue}
          </h2>
          <p className="text-[#1a1a1a]/55 text-sm mb-8" style={HEEBO}>
            {EVENT.address}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* Waze */}
            <a
              href={`https://waze.com/ul?q=${EVENT.wazeQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg,#33CCFF,#0099CC)",
                color: "white",
                boxShadow: "0 6px 20px rgba(51,204,255,0.3)",
                ...HEEBO,
              }}
            >
              <Navigation size={18} strokeWidth={2} />
              נווטו ב-Waze
            </a>

            {/* Google Maps */}
            <a
              href={`https://maps.google.com/?q=${EVENT.mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "white",
                color: "#444",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                ...HEEBO,
              }}
            >
              <Map size={18} strokeWidth={1.5} style={{ color: "#4285F4" }} />
              Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ══ RSVP ═════════════════════════════════════ */}
      <section id="rsvp" className="py-16 px-4" style={{ background: "#FDFAF5" }}>
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs tracking-[0.22em] uppercase mb-3 text-[#C5A46D]" style={HEEBO}>
            אישור הגעה
          </p>
          <h2
            className="text-center text-3xl font-bold text-[#1a1a1a] mb-2"
            style={FRANK}
          >
            {rsvpDone ? "תודה רבה! 🎉" : "האם תגיעו?"}
          </h2>
          {!rsvpDone && (
            <p className="text-center text-[#1a1a1a]/45 text-sm mb-10" style={HEEBO}>
              נא לאשר הגעה עד {EVENT.rsvpBy}
            </p>
          )}

          {rsvpDone ? (
            /* ── Success state ── */
            <div
              className="flex flex-col items-center text-center p-10 rounded-3xl"
              style={{
                background: "linear-gradient(135deg,#f0f7ee,#e8f3e4)",
                border: "1px solid rgba(107,123,90,0.22)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg,#6B7B5A,#4A5E3A)" }}
              >
                <CheckCircle size={30} color="white" strokeWidth={1.8} />
              </div>
              <h3 className="text-2xl font-bold text-[#2d4a20] mb-3" style={FRANK}>
                האישור נשלח בהצלחה!
              </h3>
              <p className="text-[#2d4a20]/65 text-sm leading-relaxed mb-6" style={HEEBO}>
                פנייתך הועברה לבעלי האירוע דרך וואטסאפ.
                <br />
                מחכים לראותכם — {EVENT.dateDisplay}
              </p>
              <button
                onClick={() => { setRsvpDone(false); setForm({ name: "", attending: "yes", guests: "1", notes: "" }); }}
                className="text-[#6B7B5A] text-sm underline underline-offset-4"
                style={HEEBO}
              >
                שלחו אישור נוסף
              </button>
            </div>
          ) : (
            /* ── RSVP Form ── */
            <form
              onSubmit={handleRSVP}
              className="rounded-3xl p-8 space-y-6"
              style={{
                background: "white",
                border: "1px solid rgba(197,164,109,0.18)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
              }}
            >
              {/* Full Name */}
              <div>
                <label
                  className="block text-xs font-semibold tracking-[0.14em] uppercase mb-2.5 text-[#1a1a1a]/60"
                  style={HEEBO}
                >
                  שם מלא <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="הזינו את שמכם המלא"
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200"
                  style={{
                    background: "#FDFAF5",
                    border: errors.name
                      ? "1.5px solid #f87171"
                      : "1.5px solid rgba(197,164,109,0.25)",
                    fontFamily: "Heebo, sans-serif",
                    color: "#1a1a1a",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C5A46D")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.name
                      ? "#f87171"
                      : "rgba(197,164,109,0.25)")
                  }
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1.5" style={HEEBO}>{errors.name}</p>
                )}
              </div>

              {/* Attending */}
              <div>
                <label
                  className="block text-xs font-semibold tracking-[0.14em] uppercase mb-3 text-[#1a1a1a]/60"
                  style={HEEBO}
                >
                  הגעה לאירוע
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "yes", label: "מגיע/ה ✓", color: "#6B7B5A" },
                    { value: "no",  label: "לא מגיע/ה", color: "#9B7B7B" },
                  ].map((opt) => {
                    const active = form.attending === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, attending: opt.value }))}
                        className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                          background: active ? opt.color : "#FDFAF5",
                          color: active ? "white" : "#1a1a1a",
                          border: active
                            ? `1.5px solid ${opt.color}`
                            : "1.5px solid rgba(0,0,0,0.1)",
                          boxShadow: active ? `0 4px 16px ${opt.color}30` : "none",
                          ...HEEBO,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of guests — only when attending */}
              {form.attending === "yes" && (
                <div>
                  <label
                    className="block text-xs font-semibold tracking-[0.14em] uppercase mb-2.5 text-[#1a1a1a]/60"
                    style={HEEBO}
                  >
                    <Users size={13} className="inline ml-1.5" />
                    מספר אורחים (כולל עצמכם)
                  </label>
                  <div className="flex items-center gap-3">
                    {["1", "2", "3", "4", "5+"].map((n) => {
                      const active = form.guests === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, guests: n }))}
                          className="w-12 h-12 rounded-xl text-sm font-bold transition-all duration-200 flex-shrink-0"
                          style={{
                            background: active
                              ? "linear-gradient(135deg,#C5A46D,#D4BC8A)"
                              : "#FDFAF5",
                            color: active ? "white" : "#1a1a1a",
                            border: active
                              ? "none"
                              : "1.5px solid rgba(197,164,109,0.22)",
                            boxShadow: active ? "0 4px 14px rgba(197,164,109,0.3)" : "none",
                            ...FRANK,
                          }}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label
                  className="block text-xs font-semibold tracking-[0.14em] uppercase mb-2.5 text-[#1a1a1a]/60"
                  style={HEEBO}
                >
                  הערות (אופציונלי)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="אלרגיות, בקשות מיוחדות..."
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-200 resize-none"
                  style={{
                    background: "#FDFAF5",
                    border: "1.5px solid rgba(197,164,109,0.25)",
                    fontFamily: "Heebo, sans-serif",
                    color: "#1a1a1a",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C5A46D")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(197,164,109,0.25)")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                  ...HEEBO,
                }}
              >
                <MessageCircle size={18} strokeWidth={2} />
                שלחו אישור דרך וואטסאפ
              </button>

              <p className="text-center text-[#1a1a1a]/35 text-xs" style={HEEBO}>
                האישור ישלח ישירות לבעלי האירוע
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ══ SHARE ════════════════════════════════════ */}
      <section
        className="py-14 px-4"
        style={{ background: "linear-gradient(160deg,#0D1B0C,#1A2B18)" }}
      >
        <div className="max-w-sm mx-auto text-center">
          <p className="text-xs tracking-[0.22em] uppercase mb-3" style={{ color: "#C5A46D88", ...HEEBO }}>
            שתפו את השמחה
          </p>
          <h2 className="text-2xl font-bold text-white mb-2" style={FRANK}>
            הזמינו חברים ומשפחה
          </h2>
          <p className="text-white/40 text-sm mb-8" style={HEEBO}>
            שתפו את הלינק לדף האירוע בקבוצת הוואטסאפ
          </p>
          <button
            onClick={share}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
              ...HEEBO,
            }}
          >
            <MessageCircle size={19} strokeWidth={2} />
            שתפו בוואטסאפ
          </button>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════ */}
      <footer
        className="py-8 px-4 text-center"
        style={{ background: "#080F07" }}
      >
        <div className="w-12 h-px mx-auto mb-4" style={{ background: "rgba(197,164,109,0.35)" }} />
        <p className="text-white/25 text-xs mb-3" style={HEEBO}>
          הזמנה דיגיטלית בעיצוב מקצועי
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#C5A46D]/70 hover:text-[#C5A46D] transition-colors text-sm font-semibold"
          style={HEEBO}
        >
          רגע לפני
          <ExternalLink size={13} />
        </Link>
        <p className="text-white/15 text-[10px] mt-3" style={HEEBO}>
          © {new Date().getFullYear()} רגע לפני · כל הזכויות שמורות
        </p>
      </footer>

    </div>
  );
}
