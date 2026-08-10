"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ───────────────────────────────────────────────────── */
type Status = "confirmed" | "declined" | "pending";
type MealOption = "regular" | "vegetarian" | "vegan" | "mehadrin" | "kids";
type Screen = "loading" | "error" | "form" | "done" | "wrong-person";

import type { RsvpData as RsvpInitialData } from "@/lib/rsvp-load";

const MEAL_OPTIONS: { value: MealOption; label: string; emoji: string }[] = [
  { value: "regular",    label: "בשרי",       emoji: "🥩" },
  { value: "vegetarian", label: "צמחוני",     emoji: "🥕" },
  { value: "vegan",      label: "טבעוני",     emoji: "🌿" },
  { value: "mehadrin",   label: "דג",         emoji: "🐟" },
  { value: "kids",       label: "מנת ילדים",  emoji: "🧒" },
];
const COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;
/* The hall serves a fixed 5-course menu — a per-guest meal picker would
   promise a choice that does not exist. Flip to true only if a venue
   actually offers alternatives. */
const SHOW_MEAL_CHOICE = false;

const DVIR_WEDDING_EVENT_ID = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";

const MAX_GUESTS = 15;

interface GuestInfo {
  id: string;
  name: string;
  guest_count: number;
  status: Status;
  /* Which wedding this guest belongs to — decides whether the bespoke
     Dvir & Mirav flow applies or the generic one does */
  event_id?: string;
  meal_preference?: string | null;
  meal_note?: string | null;
  source_group?: string | null;
  /* Server-rendered guests carry these too; the client fetch always did, the
     type simply never said so. */
  wants_photos?: boolean | null;
  opened_at?: string | null;
  category?: string | null;
}
interface EventInfo {
  name: string;
  date: string;
  address?: string | null;
  venue_name?: string | null;
  theme?: string | null;
  mini_site_hero_path?: string | null;
  bit_phone?: string | null;
  paybox_link?: string | null;
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
export default function RsvpClient({
  token,
  initialData,
  notFound,
}: {
  token: string;
  /* Rendered by the server so the first paint needs no network call of its own.
     Null when that read failed — the fetch below then behaves exactly as it
     always did, so a bad server read costs a slower start, never a broken
     invitation. */
  initialData?: RsvpInitialData | null;
  /* The server matched no guest for this token */
  notFound?: boolean;
}) {

  /* Every one of these is seeded from the server render when it is available,
     so the first paint is the finished invitation rather than a spinner
     waiting on a request that might never come back. */
  const seed = initialData?.guest as GuestInfo | undefined;
  const [screen,     setScreen]     = useState<Screen>(
    notFound ? "error" : !seed ? "loading" : seed.status !== "pending" ? "done" : "form");
  const [guest,      setGuest]      = useState<GuestInfo | null>(seed ?? null);
  const [event,      setEvent]      = useState<EventInfo | null>(
    (initialData?.event as EventInfo | null) ?? null);
  const [choice,     setChoice]     = useState<"confirmed" | "declined" | null>(
    seed && seed.status !== "pending" ? (seed.status as "confirmed" | "declined") : null);
  const [guestCount, setGuestCount] = useState(seed?.guest_count ?? 1);
  const [meal,       setMeal]       = useState<MealOption | null>(null);
  const [mealCounts, setMealCounts] = useState<Partial<Record<MealOption, number>>>({});
  const [rideFrom,   setRideFrom]   = useState("");
  const [rideRole,   setRideRole]   = useState<"offer" | "seek" | null>(null);
  const [shuttle,    setShuttle]    = useState<"yes" | "no" | null>(null);  // horim_list: Tiberias shuttle
  const [mealNote,   setMealNote]   = useState(seed?.meal_note ?? "");
  const [zoomInvite, setZoomInvite] = useState(false);   // dvir_list: tap invitation → full-screen
  const [hasNotes,   setHasNotes]   = useState(!!seed?.meal_note);   // dvir_list: "notes to hosts?" toggle
  /* Explicit opt-in for the post-event gallery. Asking turns the follow-up
     message into something the guest requested — kinder, and the only
     honest basis for sending it at all. */
  const [wantsPhotos, setWantsPhotos] = useState(
    typeof seed?.wants_photos === "boolean" ? seed.wants_photos : true);
  const [wrongMsg,   setWrongMsg]   = useState("");      // "wrong number" report text
  const [wrongSending, setWrongSending] = useState(false);
  const [wrongSent,  setWrongSent]  = useState(false);
  /* The cinematic intro used to run before the invitation: about 7 seconds of
     verse, then a sealed envelope that opens itself only after another 12 if
     nobody taps the wax seal. A guest who did not know to tap sat looking at a
     near-black screen for nineteen seconds — and a guest told me it "did not
     work".

     Of 97 guests whose invitation WhatsApp confirmed delivered, 19 opened the
     link. Among those who demonstrably read the message, 23%. For a wedding
     invitation from family that is not indifference, it is a gate.

     Landing on the invitation is now the default. The intro is still here and
     still beautiful — reachable from the invitation itself — but it no longer
     stands between a guest and the reason they clicked. */
  const [introDone,  setIntroDone]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState("");
  const [tableName,  setTableName]  = useState<string | null>(initialData?.tableName ?? null);
  const [memoryToken, setMemoryToken] = useState<string | null>(initialData?.memoryToken ?? null);

  useEffect(() => {
    /* A guest reported the page "just stayed on the waiting screen", on her
       phone, her husband's phone and a computer. The fetch below had a .catch
       but no timeout: a request that never settles never rejects either, so the
       three pulsing dots stayed on screen forever and the guest concluded the
       invitation was broken. Nothing in any log would show it — from the
       server's side the request simply never completed.

       Fifteen seconds, then say so and offer to try again. */
    /* Nothing to ask about a token the server already failed to match. */
    if (notFound) return;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);

    fetch(`/api/rsvp/${token}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        /* With a server render already on screen this call exists for its side
           effect — the API marks opened_at, and only a real browser reaches it,
           so WhatsApp's link-preview crawler cannot inflate the one honest
           signal we have about who actually looked. Its response must never be
           allowed to replace a working page with an error. */
        if (data.error) { if (!initialData) setScreen("error"); return; }
        setGuest(data.guest);
        setEvent(data.event);
        setTableName(data.tableName ?? null);
        setMemoryToken(data.memoryToken ?? null);
        setGuestCount(data.guest.guest_count ?? 1);
        /* Restore previous answers so "edit my answer" opens a pre-filled form
           instead of a blank one with a disabled CTA. */
        if (data.guest.status === "confirmed" || data.guest.status === "declined") {
          setChoice(data.guest.status);
        }
        if (data.guest.meal_preference) setMeal(data.guest.meal_preference);
        if (data.guest.meal_note) { setMealNote(data.guest.meal_note); setHasNotes(true); }
        if (typeof data.guest.wants_photos === "boolean") setWantsPhotos(data.guest.wants_photos);
        /* Only when the server render did not already decide. Re-setting it
           here would throw away an answer the guest is midway through. */
        if (!initialData) setScreen(data.guest.status !== "pending" ? "done" : "form");
      })
      .catch(() => { if (!initialData) setScreen("error"); })
      .finally(() => clearTimeout(timer));

    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [token, initialData, notFound]);

  /* The full cinematic flow — verse intro, envelope, invitation, countdown —
     is bespoke to Dvir & Mirav's own wedding: it hard-codes their verse, their
     names, their date and their scanned invitation.

     This was briefly `!!guest`, which silently showed every guest of every
     event that wedding instead of their own. Scope it to the one event it was
     built for; any other couple gets the generic flow that reads their real
     name, date and venue from the database. */
  const isDvir = guest?.event_id === DVIR_WEDDING_EVENT_ID;
  /* The Tiberias shuttle is offered to both of the parents' lists — the
     dedicated Tiberias group and their wider guest list, since plenty of them
     travel from the same area. It is shown *in addition* to the ride-sharing
     question, which every guest now sees. */
  const isHorim = guest?.source_group === "horim_tveria"
    || guest?.source_group === "horim_list";
  const finishIntro = useCallback(() => setIntroDone(true), []);
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

  async function submitWrongPerson() {
    setWrongSending(true);
    try {
      await fetch(`/api/rsvp/${token}/wrong-person`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: wrongMsg.trim() || null }),
      });
      setWrongSent(true);
    } catch {
      setWrongSent(true); // don't block the guest on a network hiccup
    } finally {
      setWrongSending(false);
    }
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
          ...(newChoice === "confirmed" ? { wants_photos: wantsPhotos } : {}),
          /* horim_list shuttle: stored via the existing ride fields (no schema change) */
          ...(newChoice === "confirmed" && isHorim && shuttle === "yes"
            ? { ride_from: "הסעה מאזור טבריה", ride_role: "seek" }
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
    /* Local wall-clock plus ctz, rather than converting to UTC here. Building
       the instant with new Date(y, m, d, 19, ...) used the GUEST's timezone, so
       a guest abroad got 19:00 in their own city rather than in Israel. */
    const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const dates = `${day}T190000/${day}T235900`;
    const where = [event.venue_name, event.address].filter(Boolean).join(", ");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${dates}&ctz=Asia/Jerusalem&location=${encodeURIComponent(where)}`;
  })();

  /* The hall's name, then the city. Searching Waze for the address alone sent
     everyone to "חדרה" — the town, not the venue — while venue_name sat unused
     on the event. On the night itself this is the one link that has to work. */
  const navQuery = [event?.venue_name, event?.address].filter(Boolean).join(", ");
  const wazeUrl = navQuery
    ? `https://waze.com/ul?q=${encodeURIComponent(navQuery)}&navigate=yes`
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
            ייתכן שהחיבור נקטע באמצע.<br />נסו שוב — לרוב זה פותר את זה.
          </p>
          {/* A guest who hits this has no idea whether to wait, retry or give
              up. The one who told us "it just stayed on the waiting screen"
              tried three devices before writing; a button would have cost her
              one tap. */}
          <button
            onClick={() => location.reload()}
            style={{
              marginTop: 20, padding: "14px 32px", borderRadius: 14,
              border: `1.5px solid ${T.goldText}`, background: "transparent",
              color: T.goldText, fontFamily: "'Heebo', sans-serif",
              fontSize: 16, fontWeight: 600, cursor: "pointer", minHeight: 48,
            }}
          >
            נסו שוב
          </button>
          <p style={{ color: T.muted, fontSize: "13px", marginTop: 18, lineHeight: 1.7 }}>
            אם זה חוזר — פנו ישירות לבעלי השמחה.
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
            {wrongSent ? "תודה שהודעתם 🙏" : "קיבלתם בטעות?"}
          </h2>

          {wrongSent ? (
            <p style={{ color: T.muted, fontSize: "14px", lineHeight: 1.7 }}>
              ההודעה נשלחה לבעלי השמחה והם יתקנו את הפרטים.<br />מצטערים על ההפרעה!
            </p>
          ) : (
            <>
              <p style={{ color: T.muted, fontSize: "14px", lineHeight: 1.7, marginBottom: "20px" }}>
                ייתכן שהקישור נשלח למספר הטלפון הלא נכון.<br />
                כתבו לנו כאן ובעלי השמחה יתקנו את זה.
              </p>

              <textarea
                value={wrongMsg}
                onChange={e => setWrongMsg(e.target.value)}
                placeholder="למשל: זה לא המספר של דוד — נסו 05X-XXXXXXX"
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box", padding: "13px 14px",
                  border: `1.5px solid ${T.border}`, borderRadius: "12px",
                  fontSize: "15px", fontFamily: "'Heebo', sans-serif",
                  background: "#fff", color: T.dark, resize: "vertical", marginBottom: "12px",
                }}
              />

              <GoldCTA onClick={submitWrongPerson} loading={wrongSending} disabled={wrongSending} fullWidth>
                {wrongSending ? "שולח..." : "שליחה לבעלי השמחה"}
              </GoldCTA>
            </>
          )}
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
                {event.paybox_link && (
                  <a
                    href={event.paybox_link}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "block", fontFamily: "'Heebo', sans-serif", fontSize: 14, fontWeight: 700, color: "#00A9E0", padding: 4, textDecoration: "none" }}
                  >
                    או דרך PayBox ←
                  </a>
                )}
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
      <div dir="rtl" className={isDvir ? "rsvp-warm-bg" : undefined} style={{ minHeight: "100dvh", background: isDvir ? undefined : T.ivory, fontFamily: "'Heebo', sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
          @keyframes scaleIn { from { opacity:0; transform:scale(0.7); } to { opacity:1; transform:scale(1); } }
          .rsvp-warm-bg {
            background:
              radial-gradient(circle at 12% 8%, rgba(197,164,109,0.16) 0%, transparent 42%),
              radial-gradient(circle at 88% 22%, rgba(184,150,120,0.13) 0%, transparent 40%),
              radial-gradient(circle at 50% 100%, rgba(197,164,109,0.10) 0%, transparent 55%),
              linear-gradient(170deg, #FDFAF5 0%, #F6F1E8 55%, #F2EADD 100%);
            background-attachment: fixed;
          }
        `}</style>
        {isDvir && !introDone && <WeddingIntro onDone={finishIntro} />}
        {isDvir ? <GoldConfetti /> : <Confetti />}

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
            {isDvir ? "תודה! נתראה ב־24.08 🤍" : "כבר אישרתם את הגעתכם! ✓"}
          </h2>
          <p style={{ color: T.muted, fontSize: "15px", fontWeight: 300, marginBottom: "24px", animation: "fadeUp 0.5s ease 0.15s both" }}>
            {isDvir
              ? "איזה כיף שתהיו איתנו! שמרו את התאריך ביומן — נשלח תזכורת עם ניווט לקראת היום הגדול."
              : "אנחנו מחכים לראות אתכם ביום המאושר שלנו."}
          </p>

          {/* dvir_list: live gold countdown to the chuppah */}
          {isDvir && event?.date && <LiveCountdown date={event.date} />}

          {/* dvir_list: keep the invitation + schedule on the confirmed screen too, so
              reopening the WhatsApp link weeks later answers "where / when / what time". */}
          {isDvir && (
            <div style={{ marginBottom: "16px", animation: "fadeUp 0.5s ease 0.18s both" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/wedding/dvir-mirav-invitation.jpg"
                alt="הזמנה לחתונה של דביר ומירב"
                onClick={() => setZoomInvite(true)}
                style={{ width: "100%", borderRadius: "16px", boxShadow: T.shadowCard, display: "block", cursor: "zoom-in" }}
              />
              <p style={{ fontSize: "12px", color: T.goldText, textAlign: "center", margin: "8px 0 0", fontWeight: 600 }}>
                👆 לחצו על ההזמנה להגדלה
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
                <WarmCard style={{ padding: "14px 10px", textAlign: "center" }}>
                  <p style={{ fontSize: "22px", margin: "0 0 4px" }}>🥂</p>
                  <p style={{ fontSize: "12px", color: T.muted, margin: "0 0 2px" }}>קבלת פנים</p>
                  <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "20px", fontWeight: 700, color: T.goldText, margin: 0 }}>19:00</p>
                </WarmCard>
                <WarmCard style={{ padding: "14px 10px", textAlign: "center" }}>
                  <p style={{ fontSize: "22px", margin: "0 0 4px" }}>💍</p>
                  <p style={{ fontSize: "12px", color: T.muted, margin: "0 0 2px" }}>חופה וקידושין</p>
                  <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "20px", fontWeight: 700, color: T.goldText, margin: 0 }}>20:00</p>
                </WarmCard>
              </div>
            </div>
          )}

          {/* Bento summary cards — meal card hidden for dvir_list (no meal choice in their flow) */}
          <div style={{ display: "grid", gridTemplateColumns: isDvir ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "16px", animation: "fadeUp 0.5s ease 0.2s both" }}>
            <WarmCard style={{ textAlign: "right", padding: "16px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: T.muted, letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" }}>כמות אורחים</p>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 700, color: T.dark }}>
                {guest?.guest_count ?? 1} {(guest?.guest_count ?? 1) === 1 ? "אורח" : "אורחים"}
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
              {event.paybox_link && (
                <a
                  href={event.paybox_link}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", fontFamily: "'Heebo', sans-serif", fontSize: 14, fontWeight: 700, color: "#00A9E0", padding: 4, textDecoration: "none" }}
                >
                  או דרך PayBox ←
                </a>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setScreen("form")}
            style={{
              display: "block", width: "100%", margin: "20px auto 0",
              background: T.cream, border: `1.5px solid ${T.border}`, borderRadius: "14px",
              padding: "14px 16px", cursor: "pointer",
              fontFamily: "'Heebo', sans-serif", fontSize: 15, fontWeight: 600,
              color: T.goldText, minHeight: "48px",
            }}
          >
            ✏️ טעיתם במשהו? לחצו לעריכת התשובה
          </button>

          <div style={{ width: "64px", height: "1px", background: `linear-gradient(90deg,transparent,${T.gold},transparent)`, margin: "28px auto 0" }} />

          {/* Speaks to the guest instead of about us. The credit half of the
              old line was spending half the width on something nobody was
              looking for; "an invitation like this" points at the invitation
              sitting directly above, which is the whole argument.
              Stays at 11px and half opacity — this is a paying couple's page,
              and what is above it must always win. */}
          <p style={{ textAlign: "center", fontSize: "11px", letterSpacing: "0.04em", padding: "16px 0 24px", margin: 0 }}>
            <a
              href="https://wa.me/972533318177?text=%D7%94%D7%99%D7%99%2C%20%D7%A8%D7%90%D7%99%D7%AA%D7%99%20%D7%94%D7%96%D7%9E%D7%A0%D7%94%20%D7%A9%D7%9C%20%D7%A8%D7%92%D7%A2%20%D7%9C%D7%A4%D7%A0%D7%99%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A4%D7%A8%D7%98%D7%99%D7%9D%20%F0%9F%A4%8D"
              target="_blank" rel="noopener noreferrer"
              onClick={() => {
                navigator.sendBeacon?.("/api/lead-from-rsvp",
                  new Blob([JSON.stringify({ token })], { type: "application/json" }));
              }}
              style={{ color: T.muted, opacity: 0.6, textDecoration: "none" }}
            >
              מתחתנים בקרוב? הזמנה כזאת מחכה גם לכם 💍
            </a>
          </p>
        </div>

        {isDvir && zoomInvite && <InvitationLightbox onClose={() => setZoomInvite(false)} />}
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
        /* dvir_list: warm textured backdrop instead of flat ivory */
        .rsvp-warm-bg {
          background:
            radial-gradient(circle at 12% 8%, rgba(197,164,109,0.16) 0%, transparent 42%),
            radial-gradient(circle at 88% 22%, rgba(184,150,120,0.13) 0%, transparent 40%),
            radial-gradient(circle at 50% 100%, rgba(197,164,109,0.10) 0%, transparent 55%),
            linear-gradient(170deg, #FDFAF5 0%, #F6F1E8 55%, #F2EADD 100%);
          background-attachment: fixed;
        }
        .rsvp-count-circle { transition: all 0.15s ease; }
        .rsvp-meal-card { transition: all 0.15s ease; }
        /* ── dvir_list: cinematic invitation reveal ─────────────────── */
        @keyframes invGreet {
          from { opacity: 0; transform: translateY(-14px); letter-spacing: 0.12em; }
          to   { opacity: 1; transform: translateY(0);     letter-spacing: normal; }
        }
        @keyframes invSub { from { opacity: 0; } to { opacity: 1; } }
        @keyframes invReveal {
          0%   { opacity: 0; transform: scale(0.93) translateY(18px); filter: blur(10px); }
          55%  { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes invGlow {
          0%   { box-shadow: 0 2px 8px rgba(28,16,8,0.06); }
          45%  { box-shadow: 0 10px 44px rgba(197,164,109,0.55), 0 2px 8px rgba(28,16,8,0.06); }
          100% { box-shadow: 0 6px 24px rgba(197,164,109,0.22), 0 2px 8px rgba(28,16,8,0.06); }
        }
        @keyframes invShine {
          0%   { transform: translateX(120%) skewX(-18deg); }
          100% { transform: translateX(-220%) skewX(-18deg); }
        }
        @keyframes invSpark {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.7); }
          25%      { opacity: 0.9; }
          50%      { opacity: 0.5; transform: translateY(-14px) scale(1); }
          75%      { opacity: 0.9; }
        }
        .inv-greet { animation: invGreet 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .inv-sub   { animation: invSub 0.6s ease 0.55s both; }
        .inv-card {
          position: relative; overflow: hidden; border-radius: 16px;
          animation: invReveal 1.1s cubic-bezier(0.22,1,0.36,1) 0.45s both,
                     invGlow 2.2s ease 1.0s both;
        }
        .inv-card::after {
          content: ""; position: absolute; top: -12%; bottom: -12%; width: 34%;
          left: 0; transform: translateX(120%) skewX(-18deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), rgba(255,246,224,0.75), rgba(255,255,255,0.55), transparent);
          animation: invShine 1.5s cubic-bezier(0.4,0,0.2,1) 1.35s both;
          pointer-events: none;
        }
        .inv-hint { animation: invSub 0.6s ease 2.1s both; }
        .inv-spark { position: absolute; font-size: 13px; color: #C5A46D; pointer-events: none; animation: invSpark 3.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .inv-greet, .inv-sub, .inv-card, .inv-hint { animation: none !important; opacity: 1 !important; }
          .inv-card::after, .inv-spark { display: none !important; }
        }
        /* Hold the invitation reveal until the intro overlay dissolves */
        .inv-hold *, .inv-hold *::after { animation-play-state: paused !important; }
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

      {isDvir && !introDone && <WeddingIntro onDone={finishIntro} />}

      <div className="rsvp-form-wrap" style={{ flex: 1 }}>

        {/* Tablet: sticky photo panel — hidden for dvir_list (the invitation IS the visual) */}
        {!isDvir && (
          <div className="rsvp-photo-side">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80" alt="" />
          </div>
        )}

        <div className={`rsvp-form-side${isDvir ? " rsvp-warm-bg" : ""}`}>
          <div className="rsvp-form-inner">

            {/* Invitation image + warm personal greeting — shown only for this wedding's
                own guests (dvir_list). Graceful: any other event/guest has a different
                source_group → nothing renders, zero effect on other couples. */}
            {isDvir && (
              <div className={introDone ? undefined : "inv-hold"} style={{ marginBottom: "24px", position: "relative" }}>
                {/* Floating gold sparkles around the invitation */}
                <span className="inv-spark" aria-hidden="true" style={{ top: "18%", right: "-4px", animationDelay: "1.6s" }}>✦</span>
                <span className="inv-spark" aria-hidden="true" style={{ top: "34%", left: "-2px", fontSize: "10px", animationDelay: "2.4s" }}>✦</span>
                <span className="inv-spark" aria-hidden="true" style={{ bottom: "26%", right: "6px", fontSize: "11px", animationDelay: "3.1s" }}>✦</span>

                <p className="inv-greet" style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "20px", fontWeight: 700, color: T.dark, textAlign: "center", margin: "0 0 4px" }}>
                  משפחה וחברים יקרים 🤍
                </p>
                <p className="inv-sub" style={{ fontSize: "14px", fontWeight: 300, color: T.muted, textAlign: "center", margin: "0 0 16px" }}>
                  הוזמנתם לחתונה שלנו — נשמח שתהיו איתנו ביום הגדול
                </p>
                {/* Tap to open full-screen; card tilts with phone/mouse */}
                <TiltCard>
                  <button
                    type="button"
                    onClick={() => setZoomInvite(true)}
                    className="inv-card"
                    style={{ display: "block", width: "100%", padding: 0, border: "none", background: "none", cursor: "zoom-in" }}
                    aria-label="הגדלת ההזמנה"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/wedding/dvir-mirav-invitation.jpg"
                      alt="הזמנה לחתונה של דביר ומירב"
                      style={{ width: "100%", borderRadius: "16px", display: "block", border: `1px solid ${T.border}` }}
                    />
                  </button>
                </TiltCard>
                <p className="inv-hint" style={{ fontSize: "12px", color: T.goldText, textAlign: "center", margin: "8px 0 0", fontWeight: 600 }}>
                  👆 לחצו על ההזמנה להגדלה
                </p>
                {/* The cinematic opening, by choice rather than by default.
                    It used to run before the invitation — verse, then a sealed
                    envelope that opened itself only after twelve seconds if
                    nobody tapped the wax seal. A guest told the couple's mother
                    the link "did not work"; the link was fine, she never got
                    past the envelope. Kept here because it is genuinely lovely,
                    and because a guest who wants it can now ask for it. */}
                {isDvir && (
                  <p style={{ textAlign: "center", margin: "10px 0 0" }}>
                    <button
                      onClick={() => setIntroDone(false)}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: T.goldText, fontSize: "12.5px", fontWeight: 600,
                        fontFamily: "'Heebo', sans-serif", opacity: 0.75,
                        padding: "10px 8px", minHeight: 44,
                      }}
                    >
                      ✨ צפו בפתיחה החגיגית
                    </button>
                  </p>
                )}


                {/* Names · date · venue */}
                <div style={{ textAlign: "center", marginTop: "18px" }}>
                  <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: "22px", fontWeight: 700, color: T.dark, margin: "0 0 6px" }}>
                    דביר בן ברוך <span style={{ color: T.gold }}>&amp;</span> מירב ברון
                  </p>
                  <p style={{ fontSize: "15px", color: T.goldText, fontWeight: 600, margin: 0 }}>
                    יום שני · 24.08.2026
                  </p>
                  <p style={{ fontSize: "14px", color: T.muted, margin: "2px 0 0" }}>
                    אולמי גאיה, חדרה
                  </p>
                </div>
              </div>
            )}

            {/* Event headline — hidden for dvir_list (names/date/venue shown under invitation) */}
            {!isDvir && (
              <>
                <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 700, fontSize: "28px", color: T.dark, textAlign: "center", margin: "0 0 6px", animation: "fadeUp 0.4s ease both" }}>
                  {event?.name ?? ""}
                </h1>
                {event && (
                  <p style={{ textAlign: "center", color: T.muted, fontSize: "14px", marginBottom: "24px", animation: "fadeUp 0.4s ease 0.06s both" }}>
                    {formattedDate}{event.address ? ` | ${event.address}` : ""}
                  </p>
                )}
              </>
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

            {/* Meal choice — single select for 1 guest, per-guest steppers for parties.
                Hidden for dvir_list (they get a free-text notes question instead). */}
            {SHOW_MEAL_CHOICE && attending && !isDvir && guestCount === 1 && (
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

            {SHOW_MEAL_CHOICE && attending && !isDvir && guestCount > 1 && (
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

            {/* Photo-sharing opt-in.
                The gallery is two-way: guests upload what they shot and the
                couple gets every angle. Asking here means the post-event
                message fulfils a request the guest made, instead of arriving
                unannounced — better for the guest, and the only honest basis
                for sending it. */}
            {attending && (
              <div style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease 0.05s both" }}>
                <button
                  type="button"
                  onClick={() => setWantsPhotos((v: boolean) => !v)}
                  aria-pressed={wantsPhotos}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px", borderRadius: "14px", cursor: "pointer",
                    textAlign: "right", fontFamily: "'Heebo', sans-serif",
                    border: `2px solid ${wantsPhotos ? T.gold : T.border}`,
                    background: wantsPhotos ? "rgba(197,164,109,0.10)" : T.cream,
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${wantsPhotos ? T.gold : T.border}`,
                    background: wantsPhotos ? T.gold : "transparent",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                  }}>{wantsPhotos ? "✓" : ""}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: 600, color: T.dark }}>
                      📸 אשמח לשתף תמונות מהחתונה
                    </span>
                    <span style={{ display: "block", fontSize: "12.5px", color: T.muted, marginTop: 2, lineHeight: 1.5 }}>
                      נשלח לכם קישור לגלריה המשותפת — תוכלו להעלות את התמונות שצילמתם ולראות את של כולם
                    </span>
                  </span>
                </button>
              </div>
            )}

            {/* dvir_list: notes to the hosts (replaces meal choice) */}
            {attending && isDvir && (
              <div style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease 0.05s both" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.dark, marginBottom: "12px", textAlign: "center" }}>
                  האם יש לכם הערות מיוחדות לבעלי השמחה?
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: hasNotes ? "12px" : 0 }}>
                  {([[false, "לא"], [true, "כן"]] as const).map(([val, label]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { setHasNotes(val); if (!val) setMealNote(""); }}
                      aria-pressed={hasNotes === val}
                      style={{
                        padding: "13px 8px", borderRadius: "12px", cursor: "pointer", textAlign: "center",
                        border: `2px solid ${hasNotes === val ? T.gold : T.border}`,
                        background: hasNotes === val ? "rgba(197,164,109,0.12)" : T.cream,
                        fontFamily: "'Heebo', sans-serif", fontSize: "14px",
                        fontWeight: hasNotes === val ? 600 : 400,
                        color: hasNotes === val ? T.goldText : T.dark,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {hasNotes && (
                  <textarea
                    value={mealNote}
                    onChange={e => setMealNote(e.target.value)}
                    /* No meal wording here — the hall serves a fixed menu and we
                       don't want the placeholder to imply a choice exists. */
                    placeholder="כתבו כאן... (למשל: ברכה לזוג, כיסא לתינוק, בקשה מיוחדת)"
                    rows={3}
                    maxLength={500}
                    style={{
                      width: "100%", boxSizing: "border-box", padding: "13px 14px",
                      border: `1.5px solid ${T.border}`, borderRadius: "12px",
                      fontSize: "15px", fontFamily: "'Heebo', sans-serif",
                      background: "#fff", color: T.dark, resize: "vertical",
                      animation: "fadeUp 0.25s ease both",
                    }}
                  />
                )}
              </div>
            )}

            {/* horim_list: shuttle from Tiberias area (replaces the rides question) */}
            {attending && isHorim && (
              <div style={{ marginBottom: "24px", animation: "fadeUp 0.3s ease 0.08s both" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: T.dark, marginBottom: "4px", textAlign: "center" }}>
                  🚌 תתקיים הסעה מאזור טבריה — מעוניינים?
                </p>
                <p style={{ fontSize: "12px", fontWeight: 300, color: T.muted, marginBottom: "12px", textAlign: "center" }}>
                  פרטים מדויקים על שעת ונקודת האיסוף יישלחו בהמשך
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {([["yes", "🚌 כן, נשמח מקום בהסעה"], ["no", "🚗 לא, מגיעים עצמאית"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setShuttle(s => s === val ? null : val)}
                      aria-pressed={shuttle === val}
                      style={{
                        padding: "13px 8px", borderRadius: "12px", cursor: "pointer", textAlign: "center",
                        border: `2px solid ${shuttle === val ? T.gold : T.border}`,
                        background: shuttle === val ? "rgba(197,164,109,0.12)" : T.cream,
                        fontFamily: "'Heebo', sans-serif", fontSize: "13px",
                        fontWeight: shuttle === val ? 600 : 400,
                        color: shuttle === val ? T.goldText : T.dark,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {shuttle === "yes" && (
                  <p style={{ fontSize: "12px", color: "#4A7C59", fontWeight: 600, textAlign: "center", margin: "10px 0 0", animation: "fadeUp 0.25s ease both" }}>
                    ✓ נשמור לכם {guestCount} {guestCount === 1 ? "מקום" : "מקומות"} בהסעה
                  </p>
                )}
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

      {isDvir && zoomInvite && <InvitationLightbox onClose={() => setZoomInvite(false)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Gold confetti burst (dvir_list only) — matches the intro's language
═══════════════════════════════════════════════════════════════ */
function GoldConfetti() {
  const pieces = [
    { x: 6,  delay: 0,    dur: 3.6, size: 7,  color: "#E8D5A8", kind: "circle" },
    { x: 12, delay: 0.5,  dur: 4.4, size: 11, color: "#C5A46D", kind: "spark"  },
    { x: 18, delay: 0.2,  dur: 3.9, size: 5,  color: "#D9BC85", kind: "rect"   },
    { x: 26, delay: 0.8,  dur: 4.8, size: 6,  color: "#A9822F", kind: "circle" },
    { x: 33, delay: 0.1,  dur: 3.4, size: 8,  color: "#E8D5A8", kind: "rect"   },
    { x: 40, delay: 0.6,  dur: 4.2, size: 12, color: "#D9BC85", kind: "spark"  },
    { x: 47, delay: 0.3,  dur: 3.8, size: 5,  color: "#C5A46D", kind: "circle" },
    { x: 54, delay: 0.9,  dur: 4.6, size: 7,  color: "#E8D5A8", kind: "rect"   },
    { x: 61, delay: 0.15, dur: 3.5, size: 6,  color: "#A9822F", kind: "circle" },
    { x: 68, delay: 0.7,  dur: 4.3, size: 10, color: "#E8D5A8", kind: "spark"  },
    { x: 75, delay: 0.4,  dur: 3.7, size: 5,  color: "#D9BC85", kind: "rect"   },
    { x: 82, delay: 1.0,  dur: 4.9, size: 7,  color: "#C5A46D", kind: "circle" },
    { x: 89, delay: 0.25, dur: 3.6, size: 6,  color: "#E8D5A8", kind: "rect"   },
    { x: 95, delay: 0.55, dur: 4.1, size: 11, color: "#C5A46D", kind: "spark"  },
    { x: 22, delay: 1.3,  dur: 4.5, size: 5,  color: "#D9BC85", kind: "circle" },
    { x: 58, delay: 1.5,  dur: 4.7, size: 6,  color: "#E8D5A8", kind: "rect"   },
    { x: 86, delay: 1.2,  dur: 4.2, size: 9,  color: "#A9822F", kind: "spark"  },
    { x: 38, delay: 1.7,  dur: 4.8, size: 5,  color: "#C5A46D", kind: "circle" },
  ];
  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes goldFall {
            0%   { transform: translateY(-4vh) translateX(0) rotate(0deg); opacity: 0; }
            8%   { opacity: 1; }
            50%  { transform: translateY(48vh) translateX(14px) rotate(200deg); }
            100% { transform: translateY(104vh) translateX(-10px) rotate(420deg); opacity: 0; }
          }
          .gold-confetti-piece { animation: goldFall linear forwards; }
        }
        @media (prefers-reduced-motion: reduce) { .gold-confetti-piece { display: none; } }
      `}</style>
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 20 }}>
        {pieces.map((p, i) => (
          p.kind === "spark" ? (
            <span key={i} className="gold-confetti-piece"
              style={{ position: "absolute", top: 0, left: `${p.x}%`, fontSize: p.size, color: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, textShadow: "0 0 6px rgba(232,213,168,0.8)" }}>✦</span>
          ) : (
            <div key={i} className="gold-confetti-piece"
              style={{ position: "absolute", top: 0, left: `${p.x}%`, width: p.size, height: p.kind === "rect" ? p.size * 1.8 : p.size, background: p.color, borderRadius: p.kind === "circle" ? "50%" : 2, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, boxShadow: "0 0 4px rgba(232,213,168,0.5)" }} />
          )
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Live wedding countdown (dvir_list only) — dark band, gold digits
═══════════════════════════════════════════════════════════════ */
function LiveCountdown({ date }: { date: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(date);
  target.setHours(19, 0, 0, 0); // reception starts 19:00
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  if (diff === 0) return null;

  const cell = (value: number, label: string) => (
    <div style={{ textAlign: "center", minWidth: 56 }}>
      <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1.1, background: "linear-gradient(180deg,#F3E6C8,#D9BC85 55%,#A9822F)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontVariantNumeric: "tabular-nums" }}>
        {String(value).padStart(2, "0")}
      </p>
      <p style={{ fontSize: 11, color: "rgba(243,230,200,0.6)", margin: "2px 0 0", letterSpacing: "0.06em" }}>{label}</p>
    </div>
  );

  return (
    <div style={{
      background: "radial-gradient(ellipse at 50% 0%, rgba(197,164,109,0.22) 0%, transparent 60%), linear-gradient(165deg, #241507 0%, #1C1008 60%, #120A05 100%)",
      borderRadius: 16, padding: "18px 12px 14px", marginBottom: 16,
      display: "flex", justifyContent: "center", gap: 6, direction: "rtl",
      boxShadow: "0 6px 24px rgba(28,16,8,0.25)",
      animation: "fadeUp 0.5s ease 0.22s both",
    }}>
      {cell(days, "ימים")}
      <span style={{ color: "rgba(217,188,133,0.5)", fontSize: 24, lineHeight: "38px" }}>:</span>
      {cell(hours, "שעות")}
      <span style={{ color: "rgba(217,188,133,0.5)", fontSize: 24, lineHeight: "38px" }}>:</span>
      {cell(mins, "דקות")}
      <span style={{ color: "rgba(217,188,133,0.5)", fontSize: 24, lineHeight: "38px" }}>:</span>
      {cell(secs, "שניות")}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D tilt (dvir_list only) — invitation responds to phone tilt /
   mouse, with a moving specular highlight. Reduced-motion: inert.
═══════════════════════════════════════════════════════════════ */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const apply = useCallback((rx: number, ry: number) => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      const glare = el.querySelector<HTMLElement>(".tilt-glare");
      if (glare) glare.style.background =
        `radial-gradient(circle at ${50 - ry * 4.5}% ${50 - rx * 4.5}%, rgba(255,246,224,0.30), transparent 58%)`;
    });
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    apply(py * -7, px * 9);
  }, [apply]);

  const onMouseLeave = useCallback(() => apply(0, 0), [apply]);

  /* Android fires deviceorientation freely; iOS 13+ requires a permission
     prompt we deliberately skip — those devices keep the static card. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      const rx = Math.max(-7, Math.min(7, (e.beta - 45) / 7));
      const ry = Math.max(-7, Math.min(7, e.gamma / 7));
      apply(-rx, ry);
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(rafRef.current);
    };
  }, [apply]);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transition: "transform 0.16s ease-out", transformStyle: "preserve-3d", position: "relative", borderRadius: 16, willChange: "transform" }}
    >
      {children}
      <div className="tilt-glare" aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Cinematic full-screen intro (dvir_list only)
   Auto-plays ~3.2s then dissolves into the invitation page.
   Tap anywhere to skip. Honors prefers-reduced-motion.
═══════════════════════════════════════════════════════════════ */
/* Verse written by a pen — RTL aware.
   The line is revealed by a continuously-growing clip (not per character), and a
   calligraphy nib rides the leading edge, so it reads as handwriting rather than
   typing. Each line's duration scales with its length. */
function PenNib() {
  return (
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none" aria-hidden="true"
      style={{ display: "block", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.45))" }}>
      <defs>
        <linearGradient id="wiNib" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F3E6C8" />
          <stop offset="45%" stopColor="#D9BC85" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>
      </defs>
      {/* holder */}
      <rect x="11.5" y="0" width="7" height="15" rx="3" fill="#3B2A12" />
      <rect x="11.5" y="12" width="7" height="4" fill="#A9822F" />
      {/* nib */}
      <path d="M15 39 L9.5 17 Q15 13 20.5 17 Z" fill="url(#wiNib)" />
      <path d="M15 39 L15 21" stroke="#6B4E12" strokeWidth="0.9" />
      <circle cx="15" cy="22" r="1.1" fill="#6B4E12" />
    </svg>
  );
}

function HandwrittenVerse({
  lines, startDelay = 800, msPerChar = 62, linePauseMs = 260,
}: { lines: string[]; startDelay?: number; msPerChar?: number; linePauseMs?: number }) {
  const style: React.CSSProperties = {
    fontFamily: "'Frank Ruhl Libre', serif",
    fontSize: "clamp(19px, 5.4vw, 26px)",
    fontWeight: 700,
    color: "#E8D5A8",
    margin: 0,
    textShadow: "0 0 24px rgba(197,164,109,0.4)",
    whiteSpace: "pre",
  };

  let offset = startDelay;
  return (
    <>
      {lines.map((line, i) => {
        const dur = Math.round(line.length * msPerChar);
        const delay = offset;
        offset += dur + linePauseMs;
        return (
          <p key={i} style={{ ...style, position: "relative", display: "inline-block" }}>
            <span
              style={{
                display: "inline-block",
                clipPath: "inset(0 0 0 100%)",
                animation: `wiWrite ${dur}ms linear ${delay}ms forwards`,
              }}
            >
              {line}
            </span>
            {/* nib rides the leading edge of the reveal */}
            <span
              className="wi-nib"
              style={{
                animation:
                  `wiNibMove ${dur}ms linear ${delay}ms both, ` +
                  `wiNibVis ${dur + 340}ms linear ${Math.max(0, delay - 170)}ms both, ` +
                  `wiNibBob 260ms ease-in-out ${delay}ms ${Math.round(dur / 260)} both`,
              }}
            >
              <PenNib />
            </span>
          </p>
        );
      })}
    </>
  );
}

function WeddingIntro({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const settledRef = useRef(false); // set once opening/skip has been triggered

  /* Open the envelope (tap or auto) → flap opens, card slides out, dissolve */
  const runOpen = useCallback(() => {
    if (settledRef.current) return;
    settledRef.current = true;
    setEnvOpen(true);
    setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 650);
    }, 1600);
  }, [onDone]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onDone();
      return;
    }
    /* Senior-friendly: the envelope appears at ~6.9s. If nobody taps the seal
       within ~4s, it opens itself — less tech-savvy guests see the same magic
       without needing to discover the tap. */
    const t1 = setTimeout(runOpen, 12000);
    return () => clearTimeout(t1);
  }, [onDone, runOpen]);

  const skip = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    setExiting(true);
    setTimeout(onDone, 500);
  };

  const openEnvelope = (e: React.MouseEvent) => {
    e.stopPropagation();
    runOpen();
  };

  return (
    <div
      onClick={skip}
      role="presentation"
      className={exiting ? "wi-root wi-exit" : "wi-root"}
      style={{
        position: "fixed", inset: 0, zIndex: 2000, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden", fontFamily: "'Heebo', sans-serif",
        background:
          "radial-gradient(ellipse at 50% 30%, rgba(197,164,109,0.22) 0%, transparent 55%)," +
          "radial-gradient(ellipse at 20% 85%, rgba(139,105,20,0.18) 0%, transparent 50%)," +
          "linear-gradient(165deg, #241507 0%, #1C1008 45%, #120A05 100%)",
      }}
    >
      <style>{`
        @keyframes wiRingDraw { from { stroke-dashoffset: 164; } to { stroke-dashoffset: 0; } }
        @keyframes wiRingGlow {
          0%   { filter: drop-shadow(0 0 0 rgba(232,213,168,0)); }
          100% { filter: drop-shadow(0 0 10px rgba(232,213,168,0.65)); }
        }
        @keyframes wiTitle {
          0%   { opacity: 0; letter-spacing: 0.35em; filter: blur(12px); transform: translateY(10px); }
          60%  { opacity: 1; }
          100% { opacity: 1; letter-spacing: 0.06em; filter: blur(0); transform: translateY(0); }
        }
        @keyframes wiFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes wiLine { from { width: 0; opacity: 0; } to { width: 130px; opacity: 1; } }
        @keyframes wiDust {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.6); }
          30% { opacity: 0.85; }
          60% { opacity: 0.35; transform: translateY(-26px) scale(1.05); }
        }
        @keyframes wiExitAnim {
          to { opacity: 0; transform: scale(1.06); }
        }
        @keyframes wiVerseLine {
          from { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes wiVerseOut { to { opacity: 0; filter: blur(6px); transform: translateY(-10px); } }
        @keyframes wiBtnIn { from { opacity: 0; transform: translateY(14px) scale(0.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes wiBtnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197,164,109,0.55), 0 6px 24px rgba(0,0,0,0.35); }
          50%      { box-shadow: 0 0 0 14px rgba(197,164,109,0), 0 6px 24px rgba(0,0,0,0.35); }
        }
        .wi-exit { animation: wiExitAnim 0.65s cubic-bezier(0.4,0,0.2,1) forwards; }

        /* Act 1 — בס"ד */
        .wi-bsd { animation: wiFade 0.9s ease 0.3s both; }

        /* Act 2 — the invitation's verse, line by line, then dissolves */
        /* handwriting runs ~0.8s→4.4s, then the whole verse dissolves */
        .wi-verse { animation: wiVerseOut 0.7s ease 4.7s forwards; }
        @keyframes wiWrite   { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0 0 0 -2%); } }
        @keyframes wiNibMove { from { right: 0%; } to { right: 100%; } }
        @keyframes wiNibVis  { 0% { opacity: 0; } 6% { opacity: 1; } 88% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes wiNibBob  { 0%,100% { transform: translateY(0) rotate(-12deg); } 50% { transform: translateY(-1.6px) rotate(-13.5deg); } }
        .wi-nib {
          position: absolute; bottom: -6px; right: 0;
          transform-origin: 50% 100%; opacity: 0; pointer-events: none;
          margin-right: -13px;
        }

        /* Act 3 — rings draw, names revealed */
        .wi-rings circle { stroke-dasharray: 164; stroke-dashoffset: 164; }
        .wi-rings .r1 { animation: wiRingDraw 1.25s cubic-bezier(0.65,0,0.35,1) 5.1s forwards; }
        .wi-rings .r2 { animation: wiRingDraw 1.25s cubic-bezier(0.65,0,0.35,1) 5.4s forwards; }
        .wi-rings { animation: wiRingGlow 1.4s ease 6.2s forwards; }
        .wi-title { animation: wiTitle 1.5s cubic-bezier(0.22,1,0.36,1) 5.7s both; }
        .wi-line  { animation: wiLine 0.9s cubic-bezier(0.22,1,0.36,1) 6.6s both; }
        .wi-sub   { animation: wiFade 0.8s ease 6.8s both; }
        .wi-sub2  { animation: wiFade 0.8s ease 7.05s both; }

        /* Act 4 — the sealed envelope */
        .wi-env {
          position: relative; width: 216px; height: 148px; margin-top: 36px;
          background: none; border: none; padding: 0; cursor: pointer;
          perspective: 700px;
          animation: wiBtnIn 0.8s cubic-bezier(0.22,1,0.36,1) 7.4s both;
        }
        .wi-env-back {
          position: absolute; inset: 0; border-radius: 10px;
          background: linear-gradient(180deg, #3A2611 0%, #2A1A0B 100%);
          border: 1px solid rgba(217,188,133,0.45);
          box-shadow: 0 10px 34px rgba(0,0,0,0.45);
        }
        .wi-env-card {
          position: absolute; left: 9%; right: 9%; top: 30%; height: 64%; z-index: 2;
          background: linear-gradient(180deg, #FDFAF5 0%, #F2EADD 100%);
          border-radius: 6px; border: 1px solid rgba(197,164,109,0.6);
          display: flex; align-items: center; justify-content: center;
          transform: translateY(0); will-change: transform;
          transition: transform 0.95s cubic-bezier(0.22,1,0.36,1) 0.5s;
        }
        .wi-env-card-txt {
          font-family: 'Frank Ruhl Libre', serif; font-weight: 700; font-size: 17px;
          color: #8B6914; text-align: center; line-height: 1.5;
        }
        .wi-env-front {
          position: absolute; inset: 0; z-index: 3; border-radius: 10px;
          background: linear-gradient(180deg, #55361A 0%, #3E2812 100%);
          clip-path: polygon(0 42%, 50% 64%, 100% 42%, 100% 100%, 0 100%);
          border: 1px solid rgba(217,188,133,0.35);
        }
        .wi-env-flap {
          position: absolute; top: 0; left: 0; right: 0; height: 56%; z-index: 4;
          background: linear-gradient(180deg, #4A2F15 0%, #55361A 100%);
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          transform-origin: top center; will-change: transform;
          transition: transform 0.75s cubic-bezier(0.55,0,0.3,1) 0.18s, z-index 0s 0.5s;
          border-radius: 10px 10px 0 0;
        }
        .wi-env-seal {
          position: absolute; left: 50%; top: 54%; z-index: 5;
          transform: translate(-50%, -50%);
          width: 48px; height: 48px; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #F3E6C8 0%, #C5A46D 45%, #8B6914 100%);
          border: 1.5px solid rgba(243,230,200,0.7);
          display: flex; align-items: center; justify-content: center; font-size: 21px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.4);
          animation: wiBtnPulse 2.2s ease-in-out 8.3s infinite;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .wi-env.open .wi-env-seal { transform: translate(-50%,-50%) scale(0); opacity: 0; animation: none; }
        .wi-env.open .wi-env-flap { transform: rotateX(180deg); z-index: 1; }
        .wi-env.open .wi-env-card { transform: translateY(-124%); }
        .wi-env-hint { animation: wiFade 0.8s ease 8.1s both; }
        .wi-skip  { animation: wiFade 0.8s ease 8.1s both; }
        .wi-dust  { position: absolute; color: #E8D5A8; pointer-events: none; animation: wiDust 3.4s ease-in-out infinite; }
      `}</style>

      {/* Gold dust */}
      <span className="wi-dust" style={{ top: "16%", right: "18%", fontSize: 12, animationDelay: "0.4s" }}>✦</span>
      <span className="wi-dust" style={{ top: "28%", left: "14%", fontSize: 9,  animationDelay: "1.1s" }}>✦</span>
      <span className="wi-dust" style={{ top: "62%", right: "12%", fontSize: 10, animationDelay: "1.7s" }}>✦</span>
      <span className="wi-dust" style={{ bottom: "20%", left: "20%", fontSize: 12, animationDelay: "2.2s" }}>✦</span>
      <span className="wi-dust" style={{ top: "12%", left: "44%", fontSize: 8,  animationDelay: "2.6s" }}>✦</span>
      <span className="wi-dust" style={{ bottom: "34%", right: "38%", fontSize: 9, animationDelay: "0.8s" }}>✦</span>

      {/* Act 1 — בס"ד, like on the printed invitation */}
      <p className="wi-bsd" style={{ position: "absolute", top: "max(28px, env(safe-area-inset-top))", left: 0, right: 0, textAlign: "center", color: "rgba(243,230,200,0.55)", fontSize: 14, letterSpacing: "0.14em", margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>
        בס״ד
      </p>

      {/* Act 2 — the couple's own verse, line by line, then dissolves */}
      <div className="wi-verse" aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 32px", pointerEvents: "none" }}>
        <HandwrittenVerse
          lines={["״ואני בחסדך בטחתי", "יגל ליבי בישועתך", "אשירה לה׳ כי גמל עלי״"]}
          startDelay={800}
          msPerChar={62}
          linePauseMs={260}
        />
      </div>

      {/* Act 3 — interlocking rings draw themselves */}
      <svg className="wi-rings" width="150" height="96" viewBox="0 0 150 96" fill="none" aria-hidden="true">
        <circle className="r1" cx="57" cy="48" r="26" stroke="#E8D5A8" strokeWidth="2.5" />
        <circle className="r2" cx="93" cy="48" r="26" stroke="#C5A46D" strokeWidth="2.5" />
      </svg>

      <h1
        className="wi-title"
        style={{
          fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 900,
          fontSize: "clamp(38px, 11vw, 64px)", margin: "18px 0 0", textAlign: "center",
          background: "linear-gradient(180deg, #F3E6C8 0%, #D9BC85 45%, #A9822F 100%)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          textShadow: "0 0 34px rgba(197,164,109,0.35)",
        }}
      >
        דביר <span style={{ fontWeight: 400 }}>&</span> מירב
      </h1>

      <div className="wi-line" style={{ height: 1, background: "linear-gradient(90deg, transparent, #C5A46D, transparent)", margin: "20px 0" }} />

      <p className="wi-sub" style={{ color: "rgba(243,230,200,0.92)", fontSize: 17, fontWeight: 400, margin: 0, letterSpacing: "0.04em" }}>
        יום שני · 24.08.2026
      </p>
      <p className="wi-sub2" style={{ color: "rgba(243,230,200,0.55)", fontSize: 14, fontWeight: 300, margin: "6px 0 0" }}>
        אולמי גאיה, חדרה
      </p>

      {/* Act 4 — the sealed envelope; tap the wax seal to open */}
      <button
        type="button"
        className={`wi-env${envOpen ? " open" : ""}`}
        onClick={openEnvelope}
        aria-label="פתיחת ההזמנה"
      >
        <span className="wi-env-back" />
        <span className="wi-env-card">
          <span className="wi-env-card-txt">דביר &amp; מירב<br />24.08.2026</span>
        </span>
        <span className="wi-env-flap" />
        <span className="wi-env-front" />
        <span className="wi-env-seal">💍</span>
      </button>
      <p className="wi-env-hint" style={{ color: "rgba(243,230,200,0.75)", fontSize: 14, fontWeight: 400, margin: "16px 0 0" }}>
        {envOpen ? "ההזמנה בדרך אליכם… 🤍" : "לחצו על החותם לפתיחת ההזמנה 💌"}
      </p>

      <p className="wi-skip" style={{ position: "absolute", bottom: "max(24px, env(safe-area-inset-bottom))", color: "rgba(243,230,200,0.35)", fontSize: 12, margin: 0 }}>
        לחצו בכל מקום לדילוג
      </p>
    </div>
  );
}

/* Full-screen invitation viewer (dvir_list only) */
function InvitationLightbox({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label="הזמנה במסך מלא"
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(28,16,8,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px", cursor: "zoom-out",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/wedding/dvir-mirav-invitation.jpg"
        alt="הזמנה לחתונה של דביר ומירב"
        style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "12px", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="סגירה"
        style={{
          position: "absolute", top: "max(16px, env(safe-area-inset-top))", left: "16px",
          width: "44px", height: "44px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
          fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        ✕
      </button>
    </div>
  );
}
