"use client";

import { useEffect, useState } from "react";
import { use } from "react";

/* ─── Types ───────────────────────────────────────────────────── */
type Status = "confirmed" | "declined" | "pending";
type MealOption = "regular" | "vegetarian" | "vegan" | "mehadrin";
type Screen = "loading" | "error" | "form" | "done" | "wrong-person";

const MEAL_OPTIONS: { value: MealOption; label: string }[] = [
  { value: "regular",    label: "רגיל" },
  { value: "vegetarian", label: "צמחוני" },
  { value: "vegan",      label: "טבעוני" },
  { value: "mehadrin",   label: "כשר מהדרין" },
];

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
  const [mealNote,   setMealNote]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");
  const [tableName,  setTableName]  = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setScreen("error"); return; }
        setGuest(data.guest);
        setEvent(data.event);
        setTableName(data.tableName ?? null);
        setGuestCount(data.guest.guest_count ?? 1);
        setScreen(data.guest.status !== "pending" ? "done" : "form");
      })
      .catch(() => setScreen("error"));
  }, [token]);

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
          meal_preference: newChoice === "confirmed" ? (meal ?? "regular") : null,
          meal_note: newChoice === "confirmed" && mealNote.trim() ? mealNote.trim() : null,
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
      /* ── Declined state — olive branch, gracious copy ─────────── */
      return (
        <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif" }}>
          <div style={{ width: "100%", height: "220px", overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
            />
          </div>

          <div style={{ maxWidth: "420px", margin: "0 auto", padding: "32px 24px 40px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "26px", fontWeight: 700, color: T.dark, marginBottom: "12px", lineHeight: 1.3 }}>
              קיבלנו את תגובתכם.
            </h2>
            <p style={{ color: T.muted, fontSize: "16px", fontWeight: 300, marginBottom: "24px", lineHeight: 1.7 }}>
              מאחלים לכם כל טוב 💛
            </p>

            <div style={{ margin: "0 auto 24px", display: "flex", justifyContent: "center" }}>
              <BotanicalSprig size={44} />
            </div>

            <p style={{ color: T.muted, fontSize: "14px", lineHeight: 1.7, marginBottom: "32px" }}>
              חבל שלא תוכלו להגיע —<br />נשמח לראותכם בפעם אחרת.
            </p>

            <button
              type="button"
              onClick={() => { setScreen("form"); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.goldText, fontSize: "14px", fontFamily: "'Heebo', sans-serif", fontWeight: 400, textDecoration: "underline", textUnderlineOffset: "3px", minHeight: "44px" }}
            >
              טעיתי — אני כן מגיע/ה
            </button>
          </div>
        </div>
      );
    }

    /* ── Confirmed state ──────────────────────────────────────────── */
    return (
      <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif", position: "relative", overflow: "hidden" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
        <Confetti />

        <div style={{ maxWidth: "420px", margin: "0 auto", padding: "48px 24px 40px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", animation: "fadeUp 0.5s ease both" }}>
            <RingSVG />
          </div>

          <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "28px", fontWeight: 700, color: T.dark, marginBottom: "8px", animation: "fadeUp 0.5s ease 0.1s both" }}>
            תודה שאישרתם!
          </h2>
          <p style={{ color: T.muted, fontSize: "16px", fontWeight: 300, marginBottom: "4px", animation: "fadeUp 0.5s ease 0.15s both" }}>
            מחכים לכם ביום המיוחד 💛
          </p>
          <p style={{ color: T.muted, fontSize: "14px", marginBottom: "24px", animation: "fadeUp 0.5s ease 0.2s both" }}>
            {guest?.guest_count} {(guest?.guest_count ?? 1) === 1 ? "אורח" : "אורחים"} רשומים להגיע
          </p>

          {event && (
            <WarmCard style={{ marginBottom: "16px", animation: "fadeUp 0.5s ease 0.25s both" }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "18px", fontWeight: 700, color: T.dark, marginBottom: "4px" }}>
                {event.name}
              </p>
              <p style={{ color: T.muted, fontSize: "13px" }}>{formattedDate}</p>
            </WarmCard>
          )}

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

          <div style={{ width: "64px", height: "1px", background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, margin: "28px auto 0" }} />
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     FORM SCREEN — E2-S2 / E2-S3
     Mobile: full-bleed photo + gradient overlay with event info in white
     Tablet (768px+): sticky photo panel left, ivory form panel right
  ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

        .rsvp-page {
          min-height: 100dvh;
          background: ${T.ivory};
          direction: rtl;
          font-family: 'Heebo', sans-serif;
        }

        /* ── Mobile: photo is a full-bleed hero with gradient overlay ── */
        .rsvp-photo-panel {
          position: relative;
          width: 100%;
          height: 300px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .rsvp-photo-panel img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }
        /* Gradient overlay (bottom 60% darkens for text legibility) */
        .rsvp-photo-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(28,16,8,0.72) 0%, rgba(28,16,8,0.35) 50%, rgba(28,16,8,0.05) 100%);
        }
        /* Event info overlaid on photo — visible on mobile only */
        .rsvp-photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1;
          padding: 20px 24px 24px;
          text-align: center;
        }
        /* Event header inside ivory form panel — hidden on mobile, shown on tablet */
        .rsvp-event-header { display: none; }

        .rsvp-form-panel {
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        .rsvp-inner {
          max-width: 420px;
          width: 100%;
          padding: 28px 20px 48px;
        }

        .meal-chip {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 16px; border-radius: 24px; font-size: 14px;
          font-family: 'Heebo', sans-serif; cursor: pointer;
          border: 1.5px solid ${T.border}; background: ${T.ivory}; color: ${T.dark};
          min-height: 44px; transition: all 0.15s ease;
        }
        .meal-chip.selected {
          background: ${T.cream}; border-color: ${T.gold}; color: ${T.goldText}; font-weight: 600;
        }
        .stepper-btn {
          width: 44px; height: 44px; border-radius: 10px;
          border: 1.5px solid ${T.border}; background: ${T.cream}; color: ${T.goldText};
          font-size: 22px; font-weight: 500;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s ease;
        }
        .stepper-btn:hover { border-color: ${T.gold}; }
        .secondary-cta {
          background: none; border: none; cursor: pointer; color: ${T.goldText};
          font-size: 14px; font-family: 'Heebo', sans-serif; font-weight: 400;
          text-decoration: underline; text-underline-offset: 3px; min-height: 44px;
        }
        .wrong-person-btn {
          background: none; border: none; cursor: pointer; color: ${T.muted};
          font-size: 12px; font-family: 'Heebo', sans-serif;
          opacity: 0.7; text-decoration: underline; min-height: 44px;
        }

        /* ── Tablet (768px+): sticky left photo, scrollable right form ── */
        @media (min-width: 768px) {
          .rsvp-page { display: flex; }
          .rsvp-photo-panel {
            flex: 1;
            position: sticky;
            top: 0;
            height: 100dvh;
          }
          /* Remove mobile fixed height — panel fills viewport height */
          .rsvp-photo-panel::after {
            background: linear-gradient(to top, rgba(28,16,8,0.4) 0%, transparent 60%);
          }
          /* Hide mobile overlay on tablet */
          .rsvp-photo-overlay { display: none; }
          /* Show event header in ivory form panel on tablet */
          .rsvp-event-header { display: block; }
          .rsvp-form-panel { flex: 1; overflow-y: auto; }
          .rsvp-inner { max-width: 480px; width: 100%; padding: 48px 40px; }
        }
      `}</style>

      <div className="rsvp-page">

        {/* Photo panel */}
        <div className="rsvp-photo-panel">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
            alt="הזמנה לחתונה"
          />

          {/* Mobile-only: event info overlaid on photo in white text (E2-S2 spec) */}
          {event && (
            <div className="rsvp-photo-overlay">
              <p style={{ fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontFamily: "'Heebo', sans-serif", marginBottom: "6px" }}>
                אתם מוזמנים
              </p>
              <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "26px", fontWeight: 700, color: "#FFFFFF", marginBottom: "4px", lineHeight: 1.2 }}>
                {event.name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 300, marginBottom: "2px" }}>
                {formattedDate}
              </p>
              {event.address && (
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", fontWeight: 300 }}>
                  📍 {event.address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Form panel */}
        <div className="rsvp-form-panel">
          <div className="rsvp-inner">

            {/* Tablet-only event header (inside ivory area) */}
            {event && (
              <div className="rsvp-event-header" style={{ textAlign: "center", marginBottom: "24px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase", color: T.goldText, fontFamily: "'Heebo', sans-serif", marginBottom: "8px" }}>
                  אתם מוזמנים
                </p>
                <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "28px", fontWeight: 700, color: T.dark, marginBottom: "4px", lineHeight: 1.25 }}>
                  {event.name}
                </h1>
                <p style={{ color: T.muted, fontSize: "14px", marginBottom: "8px" }}>{formattedDate}</p>
                {event.address && (
                  <p style={{ color: T.muted, fontSize: "13px" }}>📍 {event.address}</p>
                )}
                <div style={{ width: "56px", height: "1px", background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, margin: "16px auto 0" }} />
              </div>
            )}

            {/* Guest greeting */}
            <div style={{ textAlign: "center", marginBottom: "24px", animation: "fadeUp 0.4s ease 0.08s both" }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "18px", fontWeight: 700, color: T.dark, marginBottom: "4px" }}>
                שלום {guest?.name} 🤍
              </p>
              <p style={{ color: T.muted, fontSize: "14px" }}>
                מתרגשים לראות אתכם בשמחה כזו
              </p>
            </div>

            {errorMsg && <WarmAlertCard message={errorMsg} />}

            {/* Main form card */}
            <WarmCard style={{ marginBottom: "16px", animation: "fadeUp 0.4s ease 0.12s both" }}>

              {/* Guest count stepper */}
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: T.dark, marginBottom: "12px" }}>
                  כמה אנשים מגיעים?
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" }}>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setGuestCount(c => Math.max(1, c - 1))}
                    aria-label="הפחת אורח"
                  >
                    −
                  </button>
                  <span
                    style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "32px", fontWeight: 700, color: T.dark, minWidth: "48px", textAlign: "center" }}
                    aria-live="polite"
                    aria-label={`${guestCount} אורחים`}
                  >
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setGuestCount(c => Math.min(20, c + 1))}
                    aria-label="הוסף אורח"
                  >
                    +
                  </button>
                </div>
                <p style={{ textAlign: "center", fontSize: "12px", color: T.muted, marginTop: "6px" }}>
                  כולל אתם
                </p>
              </div>

              <div style={{ height: "1px", background: T.border, marginBottom: "20px" }} />

              {/* Meal preference */}
              <div style={{ marginBottom: "4px" }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: T.dark, marginBottom: "12px" }}>
                  העדפת מזון
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {MEAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`meal-chip${meal === opt.value ? " selected" : ""}`}
                      onClick={() => setMeal(m => m === opt.value ? null : opt.value)}
                      aria-pressed={meal === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </WarmCard>

            {/* Phone field */}
            <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease 0.18s both" }}>
              <label htmlFor="rsvp-phone" style={{ display: "block", fontSize: "13px", color: T.muted, marginBottom: "6px" }}>
                מספר טלפון <span style={{ fontSize: "11px" }}>(אופציונלי)</span>
              </label>
              <input
                id="rsvp-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="050-0000000"
                style={{
                  width: "100%", padding: "12px 14px",
                  border: `1.5px solid ${T.border}`,
                  borderRadius: "10px", background: T.ivory,
                  fontFamily: "'Heebo', sans-serif", fontSize: "15px",
                  color: T.dark, direction: "ltr", textAlign: "right",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: "11px", color: T.muted, marginTop: "4px" }}>
                הטלפון רק לתיאום ישיר עם הזוג — לא לשיווק
              </p>
            </div>

            {/* Primary CTA */}
            <div style={{ marginBottom: "12px", animation: "fadeUp 0.4s ease 0.22s both" }}>
              <GoldCTA
                onClick={() => handleSubmit("confirmed")}
                loading={submitting && choice === "confirmed"}
                disabled={submitting}
                fullWidth
              >
                אני מגיע/ה 🎉
              </GoldCTA>
            </div>

            {/* Decline CTA */}
            <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease 0.26s both" }}>
              <button
                type="button"
                className="secondary-cta"
                onClick={() => handleSubmit("declined")}
                disabled={submitting}
              >
                {submitting && choice === "declined" ? "שולח..." : "לא אוכל להגיע"}
              </button>
              <p style={{ fontSize: "11px", color: T.muted, marginTop: "4px" }}>
                אפשר לעדכן מאוחר יותר
              </p>
            </div>

            {/* Wrong person */}
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                type="button"
                className="wrong-person-btn"
                onClick={() => setScreen("wrong-person")}
              >
                קיבלתם בטעות? זה לא אני
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
