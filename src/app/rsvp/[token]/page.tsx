"use client";

import { useEffect, useState } from "react";
import { use } from "react";

/* ─── Types ───────────────────────────────────────────────────── */
type Status = "confirmed" | "declined" | "pending";
type MealOption = "regular" | "vegetarian" | "vegan" | "mehadrin" | "kids";
type Screen = "loading" | "error" | "form" | "done" | "wrong-person";

const MEAL_OPTIONS: { value: MealOption; label: string; emoji: string }[] = [
  { value: "regular",    label: "בשרי",       emoji: "🥩" },
  { value: "vegetarian", label: "צמחוני",     emoji: "🥕" },
  { value: "vegan",      label: "טבעוני",     emoji: "🌿" },
  { value: "mehadrin",   label: "דג",         emoji: "🐟" },
  { value: "kids",       label: "מנת ילדים",  emoji: "🧒" },
];
const COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;
const MAX_GUESTS = 15;

interface GuestInfo {
  id: string;
  name: string;
  guest_count: number;
  status: Status;
  meal_preference?: string | null;
  meal_note?: string | null;
}
interface EventInfo {
  name: string;
  date: string;
  address?: string | null;
  theme?: string | null;
  mini_site_hero_path?: string | null;
  bit_phone?: string | null;
}

/* ─── Design tokens (inline — same values as SYS-02 CSS vars) ── */
const T = {
  ivory:        "#FDFAF5",
  cream:        "#F6F1E8",
  gold:         "#C5A46D",
  goldText:     "#8B6914",
  dark:         "#1C1008",
  muted:        "#8C7B6E",
  olive:        "#6B7B5A",
  border:       "#E8E0D4",
  shadowCard:   "0 2px 8px rgba(28,16,8,0.06)",
  shadowCta:    "0 4px 12px rgba(197,164,109,0.4)",
} as const;

/* ─── Botanical sprig SVG ──────────────────────────────────────── */
function BotanicalSprig({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 40 40"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", margin: "0 auto" }}
    >
      <path d="M20 32 C20 32 20 18 20 8" stroke={T.olive} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M20 22 C20 22 14 18 10 14" stroke={T.olive} strokeWidth="1" strokeLinecap="round"/>
      <path d="M20 22 C20 22 26 18 30 14" stroke={T.olive} strokeWidth="1" strokeLinecap="round"/>
      <path d="M20 16 C20 16 15 13 12 10" stroke={T.olive} strokeWidth="0.8" strokeLinecap="round"/>
      <path d="M20 16 C20 16 25 13 28 10" stroke={T.olive} strokeWidth="0.8" strokeLinecap="round"/>
      <ellipse cx="10" cy="13" rx="3.5" ry="2" transform="rotate(-30 10 13)" fill={T.olive} opacity="0.5"/>
      <ellipse cx="30" cy="13" rx="3.5" ry="2" transform="rotate(30 30 13)" fill={T.olive} opacity="0.4"/>
      <ellipse cx="12" cy="10" rx="2.5" ry="1.5" transform="rotate(-40 12 10)" fill={T.olive} opacity="0.4"/>
      <ellipse cx="28" cy="10" rx="2.5" ry="1.5" transform="rotate(40 28 10)" fill={T.olive} opacity="0.4"/>
    </svg>
  );
}

/* ─── Ring SVG (custom — never emoji, per spec P1-003) ─────────── */
function RingSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="30" cy="36" r="14" stroke={T.gold} strokeWidth="4" fill="none"/>
      <path d="M22 20 L30 12 L38 20 L34 27 L26 27 Z" fill={T.gold}/>
      <path d="M26 27 L30 20 L34 27" stroke={T.ivory} strokeWidth="0.8" fill="none"/>
      <path d="M30 12 L30 20" stroke={T.ivory} strokeWidth="0.8"/>
    </svg>
  );
}

/* ─── Confetti (CSS-only, respects prefers-reduced-motion) ──────── */
function Confetti() {
  const pieces = [
    { x: 15, delay: 0,    size: 6,  color: T.gold,  shape: "circle" },
    { x: 30, delay: 0.1,  size: 4,  color: T.cream, shape: "rect" },
    { x: 50, delay: 0.05, size: 5,  color: T.olive, shape: "circle" },
    { x: 65, delay: 0.2,  size: 6,  color: T.gold,  shape: "rect" },
    { x: 80, delay: 0.15, size: 4,  color: T.cream, shape: "circle" },
    { x: 22, delay: 0.25, size: 5,  color: T.olive, shape: "rect" },
    { x: 44, delay: 0.08, size: 7,  color: T.gold,  shape: "circle" },
    { x: 70, delay: 0.3,  size: 4,  color: T.cream, shape: "rect" },
    { x: 88, delay: 0.12, size: 5,  color: T.gold,  shape: "circle" },
  ];
  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes confettiFall {
            0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
          }
          .confetti-piece { animation: confettiFall 2.5s ease-in forwards; }
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { opacity: 0.6; }
        }
      `}</style>
      <div aria-hidden="true" style={{ position:"absolute", top:0, left:0, right:0, height:"160px", overflow:"hidden", pointerEvents:"none" }}>
        {pieces.map((p, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: "-8px",
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/* ─── Warm card ──────────────────────────────────────────────────── */
function WarmCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.cream,
      border: `1px solid ${T.border}`,
      borderRadius: "16px",
      padding: "20px",
      boxShadow: T.shadowCard,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Gold CTA button (COMP-02) ─────────────────────────────────── */
function GoldCTA({
  children, onClick, href, disabled = false, loading = false,
  size = "lg", fullWidth = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: "lg" | "md";
  fullWidth?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: fullWidth ? "100%" : undefined,
    padding: size === "lg" ? "16px 24px" : "12px 20px",
    background: disabled ? "#D4C4A8" : T.gold,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: 700,
    fontFamily: "'Heebo', sans-serif",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : T.shadowCta,
    transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
    textDecoration: "none",
    minHeight: "56px",
    opacity: loading ? 0.8 : 1,
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(197,164,109,0.5)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = T.shadowCta;
      }}
    >
      {loading ? <span style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "16px" }}>⟳</span> : null}
      {children}
    </button>
  );
}

/* ─── Warm alert card (COMP-05) ─────────────────────────────────── */
function WarmAlertCard({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        background: "rgba(184,92,56,0.08)",
        border: `1px solid rgba(184,92,56,0.25)`,
        borderRadius: "12px",
        padding: "12px 16px",
        marginBottom: "16px",
        color: "#B85C38",
        fontFamily: "'Heebo', sans-serif",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span aria-hidden="true">⚠</span>
      {message}
    </div>
  );
}

/* ─── Simple ivory shell (error / wrong-person / done screens) ──── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100dvh",
        background: T.ivory,
        fontFamily: "'Heebo', sans-serif",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px 40px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [screen,     setScreen]     = useState<Screen>("loading");
  const [guest,      setGuest]      = useState<GuestInfo | null>(null);
  const [event,      setEvent]      = useState<EventInfo | null>(null);
  const [choice,     setChoice]     = useState<"confirmed" | "declined" | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [meal,       setMeal]       = useState<MealOption | null>(null);
  const [mealCounts, setMealCounts] = useState<Partial<Record<MealOption, number>>>({});
  const [rideFrom,   setRideFrom]   = useState("");
  const [rideRole,   setRideRole]   = useState<"offer" | "seek" | null>(null);
  const [mealNote,   setMealNote]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");
  const [tableName,  setTableName]  = useState<string | null>(null);
  const [memoryToken, setMemoryToken] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setScreen("error"); return; }
        setGuest(data.guest);
        setEvent(data.event);
        setTableName(data.tableName ?? null);
        setMemoryToken(data.memoryToken ?? null);
        setGuestCount(data.guest.guest_count ?? 1);
        setScreen(data.guest.status !== "pending" ? "done" : "form");
      })
      .catch(() => setScreen("error"));
  }, [token]);

  const mealTotal = Object.values(mealCounts).reduce((s, n) => s + (n ?? 0), 0);
  /* Most-selected meal type — kept for backward compat with meal_preference */
  const primaryMeal: MealOption | null =
    guestCount > 1 && mealTotal > 0
      ? ((Object.entries(mealCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as MealOption) ?? null)
      : meal;

  function bumpMeal(opt: MealOption, delta: number) {
    setMealCounts(prev => {
      const cur = prev[opt] ?? 0;
      const next = Math.max(0, cur + delta);
      const total = Object.values(prev).reduce((s, n) => s + (n ?? 0), 0) - cur + next;
      if (total > guestCount) return prev; // can't exceed party size
      return { ...prev, [opt]: next };
    });
  }

  async function handleSubmit(newChoice: "confirmed" | "declined") {
    setChoice(newChoice);
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newChoice,
          guest_count: guestCount,
          meal_preference: newChoice === "confirmed" ? (primaryMeal ?? "regular") : null,
          meal_note: newChoice === "confirmed" && mealNote.trim() ? mealNote.trim() : null,
          ...(newChoice === "confirmed" && guestCount > 1 && mealTotal > 0
            ? { meal_counts: mealCounts }
            : newChoice === "confirmed" && meal
            ? { meal_counts: { [meal]: 1 } }
            : {}),
          ...(newChoice === "confirmed" && rideRole && rideFrom.trim()
            ? { ride_from: rideFrom.trim(), ride_role: rideRole }
            : {}),
        }),
      });
      if (!res.ok) throw new Error("server error");
      setGuest(g => g ? { ...g, status: newChoice, guest_count: guestCount } : g);
      setScreen("done");
    } catch {
      setErrorMsg("אירעה שגיאה. אנא נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const calUrl = (() => {
    if (!event?.date) return null;
    const d = new Date(event.date);
    const fmt = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const start = fmt(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0, 0));
    const end   = fmt(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 0));
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&location=${encodeURIComponent(event.address ?? "")}`;
  })();

  const wazeUrl = event?.address
    ? `https://waze.com/ul?q=${encodeURIComponent(event.address)}&navigate=yes`
    : null;

  /* ── Loading — E2-S1: 3 pulsing gold dots + spec copy ────────── */
  if (screen === "loading") {
    return (
      <div
        dir="rtl"
        style={{ minHeight: "100dvh", background: T.ivory, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}
      >
        <style>{`
          @keyframes dotPulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
            40%            { transform: scale(1);   opacity: 1; }
          }
          .loading-dot { width: 10px; height: 10px; border-radius: 50%; background: ${T.gold}; animation: dotPulse 1.2s ease-in-out infinite; }
          .loading-dot:nth-child(2) { animation-delay: 0.2s; }
          .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        `}</style>
        <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 900, color: T.goldText, letterSpacing: "-0.01em" }}>
          רגע לפני
        </p>
        <BotanicalSprig size={28} />
        <div style={{ display: "flex", gap: "8px" }}>
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
        <p role="status" aria-live="polite" style={{ color: T.muted, fontFamily: "'Heebo', sans-serif", fontSize: "14px", fontWeight: 300, marginTop: "-4px" }}>
          מכינים את ההזמנה שלך...
        </p>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────── */
  if (screen === "error") {
    return (
      <PageShell>
        <div style={{ textAlign: "center", paddingTop: "48px" }}>
          <BotanicalSprig size={48} />
          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 700, color: T.dark, marginTop: "16px", marginBottom: "8px" }}>
            לא מצאנו את ההזמנה
          </h2>
          <p style={{ color: T.muted, fontSize: "14px", lineHeight: 1.7 }}>
            ייתכן שהקישור פג תוקף או שגוי.<br />פנו ישירות לבעלי השמחה.
          </p>
        </div>
      </PageShell>
    );
  }

  /* ── Wrong person ─────────────────────────────────────────────── */
  if (screen === "wrong-person") {
    return (
      <PageShell>
        <div style={{ textAlign: "center", paddingTop: "48px" }}>
          <BotanicalSprig size={48} />
          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 700, color: T.dark, marginTop: "16px", marginBottom: "8px" }}>
            קיבלתם בטעות?
          </h2>
          <p style={{ color: T.muted, fontSize: "14px", lineHeight: 1.7 }}>
            ייתכן שהקישור נשלח למספר הטלפון הלא נכון.<br />פנו ישירות לבעלי השמחה כדי לתקן.
          </p>
        </div>
      </PageShell>
    );
  }

  /* ── Done (confirmed or declined) ────────────────────────────── */
  if (screen === "done") {
    const confirmed = guest?.status === "confirmed";

    if (!confirmed) {
      /* ── Declined state — Stitch 85f07f64: MAZAL TOV + heart + event card with photo + bokeh ── */
      const ddmmyyyy = event?.date
        ? (() => { const d = new Date(event.date); return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; })()
        : formattedDate;

      return (
        <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <style>{`
            @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
          `}</style>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
            <button
              type="button"
              onClick={() => setScreen("form")}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.dark, fontSize: "22px", minWidth: "44px", minHeight: "44px", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
              aria-label="חזרה"
            >
              ×
            </button>
            <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: "15px", color: T.goldText, letterSpacing: "0.16em", margin: 0 }}>
              MAZAL TOV
            </p>
            <div style={{ width: "44px" }} />
          </div>

          <div style={{ flex: 1, maxWidth: "420px", margin: "0 auto", width: "100%", padding: "32px 24px 0", textAlign: "center" }}>
            {/* Heart circle */}
            <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "fadeUp 0.35s ease both" }}>
              <span style={{ fontSize: "32px", lineHeight: 1, color: "#fff" }}>♡</span>
            </div>

            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "28px", fontWeight: 700, color: T.dark, margin: "0 0 10px", animation: "fadeUp 0.35s ease 0.07s both" }}>
              קיבלנו את תגובתכם
            </h2>
            <p style={{ color: T.muted, fontSize: "15px", fontWeight: 300, margin: "0 0 28px", lineHeight: 1.7, animation: "fadeUp 0.35s ease 0.12s both" }}>
              חבל שלא תוכלו להגיע — מאחלים לכם כל טוב 💛
            </p>

            {/* Event card with couple photo */}
            {event && (
              <div style={{
                background: "#fff",
                border: `1px solid ${T.border}`,
                borderRadius: "16px",
                padding: "16px",
                textAlign: "right",
                animation: "fadeUp 0.35s ease 0.17s both",
                marginBottom: "28px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}>
                {/* Text side */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "17px", fontWeight: 700, color: T.dark, margin: "0 0 6px" }}>
                    {event.name}
                  </p>
                  <p style={{ color: T.muted, fontSize: "13px", margin: "0 0 4px" }}>{ddmmyyyy}</p>
                  {event.address && (
                    <p style={{ color: T.muted, fontSize: "13px", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span>📍</span> {event.address}
                    </p>
                  )}
                  <p style={{ color: T.muted, fontSize: "12px", margin: 0, opacity: 0.7 }}>
                    התגובה. נשמרה במערכת
                  </p>
                </div>

                {/* Couple photo or initials */}
                {event.mini_site_hero_path ? (
                  <div style={{ flexShrink: 0, width: "56px", height: "56px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${T.border}` }}>
                    <img src={event.mini_site_hero_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ flexShrink: 0, width: "56px", height: "56px", borderRadius: "50%", background: T.cream, border: `2px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    💍
                  </div>
                )}
              </div>
            )}

            {event?.bit_phone && (
              <div style={{
                margin: "0 0 16px", padding: "14px 18px", borderRadius: 14,
                background: "rgba(0,102,255,0.05)", border: "1.5px solid rgba(0,102,255,0.18)",
                textAlign: "center", animation: "fadeUp 0.35s ease 0.2s both",
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: T.dark, margin: "0 0 4px" }}>
                  🎁 רוצים לשמח את הזוג במתנה גם מרחוק?
                </p>
                <button
                  type="button"
                  onClick={() => { navigator.clipboard?.writeText(event.bit_phone!); }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontSize: 15, fontWeight: 700, color: "#0066FF", padding: 4 }}
                >
                  ביט למספר {event.bit_phone} 📋 (לחצו להעתקה)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setScreen("form")}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.goldText, fontSize: "14px", fontFamily: "'Heebo', sans-serif", fontWeight: 400, textDecoration: "underline", textUnderlineOffset: "3px", minHeight: "44px" }}
            >
              טעיתי — אני כן מגיע/ה
            </button>
          </div>

          {/* Decorative bokeh photo strip */}
          <div style={{
            marginTop: "auto",
            height: "180px",
            background: `linear-gradient(to bottom, ${T.ivory} 0%, transparent 30%)`,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #e8ddd0 0%, #d4c4b0 40%, #c8b89a 70%, #d4c4b0 100%)",
              filter: "blur(12px)",
              transform: "scale(1.1)",
            }} />
            {/* bokeh circles */}
            {[
              { s:60, x:"15%", y:"40%", o:0.25 },
              { s:80, x:"35%", y:"60%", o:0.18 },
              { s:45, x:"55%", y:"30%", o:0.22 },
              { s:70, x:"75%", y:"55%", o:0.2 },
              { s:50, x:"88%", y:"35%", o:0.15 },
            ].map((c,i) => (
              <div key={i} style={{
                position: "absolute",
                width: c.s, height: c.s,
                borderRadius: "50%",
                background: `rgba(197,164,109,${c.o})`,
                left: c.x, top: c.y,
                filter: "blur(8px)",
                transform: "translate(-50%,-50%)",
              }} />
            ))}
            {/* fade-to-ivory top overlay */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60px", background: `linear-gradient(to bottom, ${T.ivory}, transparent)` }} />
          </div>

          {/* Footer */}
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.04em", padding: "12px 0 20px", background: "#d4c4b0", margin: 0 }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: T.muted, opacity: 0.7, textDecoration: "none" }}>
              נבנה באהבה ע״י רגע לפני 💍
            </a>
          </p>
        </div>
      );
    }

    /* ── Confirmed state — E2-S4: MAZAL TOV header + checkmark ──── */
    return (
      <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
          @keyframes scaleIn { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
        `}</style>
        <Confetti />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: "16px", color: T.goldText, letterSpacing: "0.12em", margin: 0 }}>
            MAZAL TOV
          </p>
        </div>

        <div style={{ flex: 1, maxWidth: "420px", margin: "0 auto", width: "100%", padding: "40px 24px 40px", textAlign: "center" }}>
          {/* Checkmark circle (olive/green per Stitch) */}
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(107,123,90,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", animation: "scaleIn 0.4s ease both" }}>
            <span style={{ fontSize: "36px", color: T.olive, lineHeight: 1 }}>✓</span>
          </div>

          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "26px", fontWeight: 700, color: T.goldText, marginBottom: "8px", animation: "fadeUp 0.5s ease 0.1s both" }}>
            כבר אישרתם את הגעתכם! ✓
          </h2>
          <p style={{ color: T.muted, fontSize: "15px", fontWeight: 300, marginBottom: "24px", animation: "fadeUp 0.5s ease 0.15s both" }}>
            אנחנו מחכים לראות אתכם ביום המאושר שלנו.
          </p>

          {/* Bento summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px", animation: "fadeUp 0.5s ease 0.2s both" }}>
            <WarmCard style={{ textAlign: "right", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>כמות אורחים</p>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 700, color: T.dark }}>
                {guest?.guest_count ?? 1} {(guest?.guest_count ?? 1) === 1 ? "אורח" : "אורחים"}
              </p>
            </WarmCard>
            <WarmCard style={{ textAlign: "right", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>העדפות קולינריות</p>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "16px", fontWeight: 700, color: T.dark, lineHeight: 1.3 }}>
                {guest?.meal_preference === "vegan" ? "טבעוני" : guest?.meal_preference === "vegetarian" ? "צמחוני" : guest?.meal_preference === "kosher" ? "כשר" : "רגיל"}
              </p>
            </WarmCard>
          </div>

          {event && (() => {
            const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86_400_000);
            return (
              <WarmCard style={{ marginBottom: "16px", animation: "fadeUp 0.5s ease 0.25s both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "18px", fontWeight: 700, color: T.dark, marginBottom: "4px" }}>{event.name}</p>
                    <p style={{ color: T.muted, fontSize: "13px" }}>{formattedDate}</p>
                  </div>
                  {daysLeft > 0 && (
                    <span style={{ background: "rgba(197,164,109,0.15)", color: T.goldText, borderRadius: 9999, padding: "4px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                      בעוד {daysLeft} ימים
                    </span>
                  )}
                </div>
                {event.address && <p style={{ color: T.muted, fontSize: "13px" }}>📍 {event.address}</p>}
              </WarmCard>
            );
          })()}

          {tableName && (
            <WarmCard style={{ marginBottom: "24px", background: `linear-gradient(135deg,rgba(197,164,109,0.10),rgba(197,164,109,0.05))`, border: `1.5px solid rgba(197,164,109,0.3)`, animation: "fadeUp 0.5s ease 0.3s both" }}>
              <p style={{ color: T.muted, fontSize: "12px", marginBottom: "4px" }}>מקום ישיבה</p>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 700, color: T.goldText }}>
                שולחן {tableName}
              </p>
            </WarmCard>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "fadeUp 0.5s ease 0.35s both" }}>
            {calUrl && (
              <GoldCTA href={calUrl} fullWidth>
                📅 הוסיפו ליומן Google
              </GoldCTA>
            )}
            {event?.date && (
              <a
                href={`/api/rsvp/${token}/ics`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "14px 24px", background: T.cream, color: T.dark,
                  border: `1px solid ${T.border}`, borderRadius: "12px",
                  fontSize: "16px", fontWeight: 500, fontFamily: "'Heebo', sans-serif",
                  textDecoration: "none", minHeight: "52px",
                  boxShadow: T.shadowCard,
                }}
              >
                🍎 יומן iPhone / Outlook
              </a>
            )}
            {wazeUrl && (
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "14px 24px", background: T.cream, color: T.dark,
                  border: `1px solid ${T.border}`, borderRadius: "12px",
                  fontSize: "16px", fontWeight: 500, fontFamily: "'Heebo', sans-serif",
                  textDecoration: "none", minHeight: "52px",
                  boxShadow: T.shadowCard,
                }}
              >
                🚗 נווטו לאולם — Waze
              </a>
            )}
          </div>

          {memoryToken && (
            <a
              href={`/memory/${memoryToken}`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                marginTop: 20, padding: "14px 24px",
                background: `linear-gradient(135deg,rgba(197,164,109,0.15),rgba(197,164,109,0.08))`,
                border: `1.5px solid rgba(197,164,109,0.35)`,
                borderRadius: 14, textDecoration: "none",
                fontFamily: "'Heebo', sans-serif", fontSize: 16, fontWeight: 600, color: T.goldText,
                animation: "fadeUp 0.5s ease 0.4s both",
              }}
            >
              💌 כתבו ברכה לזוג
            </a>
          )}

          {event?.bit_phone && (
            <div style={{
              marginTop: 16, padding: "14px 18px", borderRadius: 14,
              background: "rgba(0,102,255,0.05)", border: "1.5px solid rgba(0,102,255,0.18)",
              textAlign: "center", animation: "fadeUp 0.5s ease 0.45s both",
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.dark, margin: "0 0 4px" }}>
                🎁 רוצים לשמח את הזוג במתנה?
              </p>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText(event.bit_phone!); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontSize: 15, fontWeight: 700, color: "#0066FF", padding: 4 }}
              >
                ביט למספר {event.bit_phone} 📋 (לחצו להעתקה)
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setScreen("form")}
            style={{
              display: "block", margin: "20px auto 0", background: "none", border: "none",
              cursor: "pointer", fontFamily: "'Heebo', sans-serif", fontSize: 13,
              color: T.muted, textDecoration: "underline",
            }}
          >
            צריכים לעדכן את התשובה? לחצו כאן
          </button>

          <div style={{ width: "64px", height: "1px", background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, margin: "28px auto 0" }} />

          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.04em", padding: "16px 0 24px", margin: 0 }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ color: T.muted, opacity: 0.6, textDecoration: "none" }}>
              נבנה באהבה ע״י רגע לפני 💍
            </a>
          </p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     FORM SCREEN — E2-S2 / E2-S3
     Stitch: YES/NO cards → count circles → meal grid → CTA
  ═══════════════════════════════════════════════════════════════ */
  const attending = choice === "confirmed";

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .rsvp-attend-card { transition: all 0.18s ease; }
        .rsvp-count-circle { transition: all 0.15s ease; }
        .rsvp-meal-card { transition: all 0.15s ease; }
        @media (min-width: 768px) {
          .rsvp-form-wrap { display: flex; min-height: 100dvh; }
          .rsvp-photo-side { flex: 0 0 45%; position: sticky; top: 0; height: 100dvh; overflow: hidden; }
          .rsvp-photo-side img { width:100%; height:100%; object-fit:cover; object-position:center; }
          .rsvp-form-side { flex: 1; overflow-y: auto; display:flex; align-items:flex-start; justify-content:center; }
          .rsvp-form-inner { max-width: 480px; width:100%; padding: 48px 40px; }
        }
        @media (max-width: 767px) {
          .rsvp-photo-side { display: none; }
          .rsvp-form-side { flex: 1; display:flex; align-items:flex-start; justify-content:center; }
          .rsvp-form-inner { max-width: 420px; width:100%; padding: 28px 20px 56px; }
        }
      `}</style>

      <div className="rsvp-form-wrap" style={{ flex: 1 }}>

        {/* Tablet: sticky photo panel */}
        <div className="rsvp-photo-side">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80" alt="" />
        </div>

        <div className="rsvp-form-side">
          <div className="rsvp-form-inner">

            {/* Event headline */}
            <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: "28px", color: T.dark, textAlign: "center", margin: "0 0 6px", animation: "fadeUp 0.4s ease both" }}>
              {event?.name ?? ""}
            </h1>
            {event && (
              <p style={{ textAlign: "center", color: T.muted, fontSize: "14px", marginBottom: "24px", animation: "fadeUp 0.4s ease 0.06s both" }}>
                {formattedDate}{event.address ? ` | ${event.address}` : ""}
              </p>
            )}

            {/* Gold divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "24px" }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ color: T.gold, fontSize: 14 }}>✦</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {errorMsg && <WarmAlertCard message={errorMsg} />}

            {/* YES / NO cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px", animation: "fadeUp 0.4s ease 0.1s both" }}>
              {/* NO card */}
              <button
                type="button"
                className="rsvp-attend-card"
                onClick={() => setChoice(c => c === "declined" ? null : "declined")}
                style={{
                  padding: "18px 12px", borderRadius: "16px", cursor: "pointer",
                  border: `2px solid ${choice === "declined" ? "#B85C38" : T.border}`,
                  background: choice === "declined" ? "rgba(184,92,56,0.08)" : T.cream,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>✗</div>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "15px", fontWeight: 700, color: choice === "declined" ? "#B85C38" : T.dark, margin: 0, lineHeight: 1.3 }}>
                  מצטערים,<br />לא נוכל
                </p>
              </button>

              {/* YES card */}
              <button
                type="button"
                className="rsvp-attend-card"
                onClick={() => setChoice(c => c === "confirmed" ? null : "confirmed")}
                style={{
                  padding: "18px 12px", borderRadius: "16px", cursor: "pointer",
                  border: `2px solid ${attending ? T.gold : T.border}`,
                  background: attending ? T.gold : T.cream,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "22px", marginBottom: "6px", color: attending ? "#fff" : T.dark }}>✓</div>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "15px", fontWeight: 700, color: attending ? "#fff" : T.dark, margin: 0, lineHeight: 1.3 }}>
                  כן, נשמח<br />להגיע
                </p>
              </button>
            </div>

            {/* Guest count — circles (shown when attending) */}
            {attending && (
              <div style={{ marginBottom: "20px", animation: "fadeUp 0.3s ease both" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.dark, marginBottom: "4px", textAlign: "center" }}>
                  כמות אורחים
                </p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: T.muted, marginBottom: "12px", textAlign: "center" }}>
                  כולל אתכם
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  {COUNT_OPTIONS.map(n => {
                    const isLast = n === 5;
                    const selected = isLast ? guestCount >= 5 : guestCount === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        className="rsvp-count-circle"
                        onClick={() => setGuestCount(n)}
                        aria-pressed={selected}
                        style={{
                          width: "52px", height: "52px", borderRadius: "50%",
                          border: `2px solid ${selected ? T.gold : T.border}`,
                          background: selected ? T.gold : T.cream,
                          color: selected ? "#fff" : T.dark,
                          fontFamily: "'Frank Ruhl Libre', serif", fontSize: "18px", fontWeight: 700,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {isLast ? "5+" : n}
                      </button>
                    );
                  })}
                </div>
                {/* Stepper for 5+ parties */}
                {guestCount >= 5 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "14px", animation: "fadeUp 0.25s ease both" }}>
                    <button type="button" onClick={() => setGuestCount(c => Math.max(5, c - 1))}
                      aria-label="פחות"
                      style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${T.border}`, background: T.cream, color: T.dark, fontSize: 20, cursor: "pointer" }}>−</button>
                    <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 700, color: T.goldText, minWidth: 40, textAlign: "center" }}>{guestCount}</span>
                    <button type="button" onClick={() => setGuestCount(c => Math.min(MAX_GUESTS, c + 1))}
                      aria-label="יותר"
                      style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${T.gold}`, background: T.gold, color: "#fff", fontSize: 20, cursor: "pointer" }}>+</button>
                  </div>
                )}
              </div>
            )}

            {/* Meal choice — single select for 1 guest, per-guest steppers for parties */}
            {attending && guestCount === 1 && (
              <div style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease 0.05s both" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.dark, marginBottom: "12px", textAlign: "center" }}>
                  בחירת מנה
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {MEAL_OPTIONS.map(opt => {
                    const selected = meal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className="rsvp-meal-card"
                        onClick={() => setMeal(m => m === opt.value ? null : opt.value)}
                        aria-pressed={selected}
                        style={{
                          padding: "16px 8px", borderRadius: "14px", cursor: "pointer", textAlign: "center",
                          border: `2px solid ${selected ? T.gold : T.border}`,
                          background: selected ? `rgba(197,164,109,0.12)` : T.cream,
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>{opt.emoji}</div>
                        <p style={{ fontFamily: "'Heebo', sans-serif", fontSize: "14px", fontWeight: selected ? 600 : 400, color: selected ? T.goldText : T.dark, margin: 0 }}>
                          {opt.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {attending && guestCount > 1 && (
              <div style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease 0.05s both" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.dark, marginBottom: "4px", textAlign: "center" }}>
                  בחירת מנות
                </p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: mealTotal === guestCount ? "#4A7C59" : T.muted, marginBottom: "12px", textAlign: "center" }}>
                  {mealTotal === guestCount ? "✓ כל המנות נבחרו" : `נבחרו ${mealTotal} מתוך ${guestCount} מנות`}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {MEAL_OPTIONS.map(opt => {
                    const count = mealCounts[opt.value] ?? 0;
                    return (
                      <div key={opt.value} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", borderRadius: "14px",
                        border: `2px solid ${count > 0 ? T.gold : T.border}`,
                        background: count > 0 ? "rgba(197,164,109,0.10)" : T.cream,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "22px" }}>{opt.emoji}</span>
                          <span style={{ fontFamily: "'Heebo', sans-serif", fontSize: "14px", fontWeight: count > 0 ? 600 : 400, color: count > 0 ? T.goldText : T.dark }}>
                            {opt.label}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <button type="button" onClick={() => bumpMeal(opt.value, -1)}
                            aria-label={`פחות ${opt.label}`}
                            style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${T.border}`, background: "#fff", color: T.dark, fontSize: 17, cursor: "pointer", opacity: count === 0 ? 0.35 : 1 }}>−</button>
                          <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, color: T.dark, minWidth: 20, textAlign: "center" }}>{count}</span>
                          <button type="button" onClick={() => bumpMeal(opt.value, 1)}
                            aria-label={`יותר ${opt.label}`}
                            style={{ width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${T.gold}`, background: mealTotal >= guestCount ? T.cream : T.gold, color: mealTotal >= guestCount ? T.muted : "#fff", fontSize: 17, cursor: "pointer" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ride sharing (optional, shown when attending) */}
            {attending && (
              <div style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease 0.08s both" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.dark, marginBottom: "4px", textAlign: "center" }}>
                  🚗 מגיעים ברכב?
                </p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: T.muted, marginBottom: "12px", textAlign: "center" }}>
                  לא חובה — עוזר לתאם טרמפים בין האורחים
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: rideRole ? "12px" : 0 }}>
                  {([["offer", "🚙 יש לי מקום ברכב"], ["seek", "🙋 מחפש/ת טרמפ"]] as const).map(([role, label]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setRideRole(r => r === role ? null : role)}
                      aria-pressed={rideRole === role}
                      style={{
                        padding: "13px 8px", borderRadius: "12px", cursor: "pointer", textAlign: "center",
                        border: `2px solid ${rideRole === role ? T.gold : T.border}`,
                        background: rideRole === role ? "rgba(197,164,109,0.12)" : T.cream,
                        fontFamily: "'Heebo', sans-serif", fontSize: "13px",
                        fontWeight: rideRole === role ? 600 : 400,
                        color: rideRole === role ? T.goldText : T.dark,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {rideRole && (
                  <input
                    value={rideFrom}
                    onChange={e => setRideFrom(e.target.value)}
                    placeholder="מאיזה עיר / אזור? (למשל: תל אביב)"
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "13px 14px",
                      border: `1.5px solid ${T.border}`, borderRadius: "12px",
                      fontSize: "15px", fontFamily: "'Heebo', sans-serif",
                      background: "#fff", color: T.dark, animation: "fadeUp 0.25s ease both",
                    }}
                  />
                )}
              </div>
            )}

            {/* CTA */}
            <div style={{ marginBottom: "12px" }}>
              <GoldCTA
                onClick={() => {
                  if (choice === "confirmed") handleSubmit("confirmed");
                  else if (choice === "declined") handleSubmit("declined");
                }}
                loading={submitting}
                disabled={submitting || !choice}
                fullWidth
              >
                {submitting ? "שולח..." : "אישור והמשך"}
              </GoldCTA>
            </div>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button
                type="button"
                onClick={() => setScreen("wrong-person")}
                style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: "12px", fontFamily: "'Heebo', sans-serif", opacity: 0.7, textDecoration: "underline", minHeight: "44px" }}
              >
                קיבלתם בטעות? זה לא אני
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
