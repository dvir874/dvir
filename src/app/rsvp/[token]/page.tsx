"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { CheckCircle, XCircle, Users, Loader2, AlertCircle } from "lucide-react";
import { getTheme, type EventTheme } from "@/lib/themes";

type Status = "confirmed" | "declined" | "pending";
type MealOption = "regular" | "vegetarian" | "vegan" | "mehadrin";

const MEAL_OPTIONS: { value: MealOption; label: string; emoji: string }[] = [
  { value: "regular", label: "רגיל", emoji: "🍽️" },
  { value: "vegetarian", label: "צמחוני", emoji: "🥗" },
  { value: "vegan", label: "טבעוני", emoji: "🌱" },
  { value: "mehadrin", label: "כשר מהדרין", emoji: "✡️" },
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

type Screen = "loading" | "error" | "form" | "done";

export default function RsvpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
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

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setScreen("error"); return; }
        setGuest(data.guest);
        setEvent(data.event);
        setGuestCount(data.guest.guest_count ?? 1);
        if (data.guest.status !== "pending") setScreen("done");
        else setScreen("form");
      })
      .catch(() => setScreen("error"));
  }, [token]);

  async function handleSubmit() {
    if (!choice) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: choice,
          guest_count: guestCount,
          meal_preference: choice === "confirmed" ? (meal ?? "regular") : null,
          meal_note: choice === "confirmed" && mealNote.trim() ? mealNote.trim() : null,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setGuest((g) => g ? { ...g, status: choice, guest_count: guestCount } : g);
      setScreen("done");
    } catch {
      setErrorMsg("אירעה שגיאה. נסו שוב.");
    } finally {
      setSubmitting(false);
    }
  }

  const theme = getTheme(event?.theme);

  const formattedDate = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  if (screen === "loading") return <Shell theme={theme}><LoadingSpinner theme={theme} /></Shell>;
  if (screen === "error")   return <Shell theme={theme}><ErrorScreen theme={theme} /></Shell>;

  if (screen === "done") {
    const confirmed = guest?.status === "confirmed";
    return (
      <Shell theme={theme}>
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: confirmed ? theme.accentBg : "rgba(197,164,109,0.12)" }}
          >
            {confirmed
              ? <CheckCircle size={40} style={{ color: theme.accentColor }} />
              : <XCircle    size={40} style={{ color: theme.accentColor }} />}
          </div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}
          >
            {confirmed ? "תודה על האישור! 🎊" : "קיבלנו את תגובתכם"}
          </h2>
          <p className="text-sm mb-2" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
            {confirmed
              ? `מחכים לכם — ${guest?.guest_count} אורחים רשומים להגיע`
              : "חבל שלא תוכלו להגיע — נשמח לראותכם בפעם אחרת 💛"}
          </p>
          {event && (
            <p className="text-xs mt-4" style={{ color: theme.accentColor, fontFamily: "Heebo, sans-serif" }}>
              {event.name} · {formattedDate}
            </p>
          )}
          <div className="w-16 h-px mx-auto mt-6"
            style={{ background: `linear-gradient(90deg,transparent,${theme.accentColor},transparent)` }} />
        </div>
      </Shell>
    );
  }

  /* ── Form screen ─────────────────────────────────── */
  return (
    <Shell theme={theme}>
      <div className="text-center mb-2" style={{ color: theme.accentColor }}>✦</div>

      {event && (
        <div className="text-center mb-7">
          <p
            className="text-xs tracking-[0.22em] uppercase mb-2"
            style={{ color: theme.accentColor, fontFamily: "Heebo, sans-serif" }}
          >
            אתם מוזמנים
          </p>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}
          >
            {event.name}
          </h1>
          <p className="text-sm" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
            {formattedDate}
          </p>
          {event.address && (
            <p className="text-xs mt-1.5" style={{ color: theme.accentColor, fontFamily: "Heebo, sans-serif" }}>
              📍 {event.address}
            </p>
          )}
        </div>
      )}

      <div className="w-full h-px mb-7"
        style={{ background: `linear-gradient(90deg,transparent,${theme.accentBorder},transparent)` }} />

      <p
        className="text-center text-base font-medium mb-6"
        style={{ color: theme.headingColor, fontFamily: "Heebo, sans-serif" }}
      >
        שלום {guest?.name}! 🎊<br />
        <span className="text-sm font-normal" style={{ color: theme.mutedColor }}>
          האם תוכלו להגיע?
        </span>
      </p>

      {/* Confirm / Decline buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => { setChoice("confirmed"); setGuestCount(guest?.guest_count ?? 1); }}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200"
          style={{
            fontFamily: "Heebo, sans-serif",
            background: choice === "confirmed"
              ? `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}cc)`
              : theme.cardBg,
            color: choice === "confirmed" ? "white" : theme.accentColor,
            border: `2px solid ${choice === "confirmed" ? "transparent" : theme.accentBorder}`,
            boxShadow: choice === "confirmed" ? `0 4px 20px ${theme.accentColor}33` : "none",
          }}
        >
          <CheckCircle size={20} />
          כן, נגיע! 🎉
        </button>

        <button
          onClick={() => { setChoice("declined"); setGuestCount(1); }}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200"
          style={{
            fontFamily: "Heebo, sans-serif",
            background: choice === "declined" ? "linear-gradient(135deg,#7A6A5A,#5A4A3A)" : theme.cardBg,
            color: choice === "declined" ? "white" : theme.mutedColor,
            border: `2px solid ${choice === "declined" ? "transparent" : theme.cardBorder}`,
          }}
        >
          <XCircle size={20} />
          לא נוכל להגיע
        </button>
      </div>

      {/* Guest count */}
      {choice === "confirmed" && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}
        >
          <p
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: theme.headingColor, fontFamily: "Heebo, sans-serif" }}
          >
            <Users size={16} style={{ color: theme.accentColor }} />
            כמה אורחים מגיעים?
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
              style={{ background: theme.cardBg, border: `1px solid ${theme.accentBorder}`, color: theme.accentColor }}
            >
              −
            </button>
            <span
              className="text-3xl font-bold w-12 text-center"
              style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}
            >
              {guestCount}
            </span>
            <button
              onClick={() => setGuestCount((c) => Math.min(20, c + 1))}
              className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
              style={{ background: theme.cardBg, border: `1px solid ${theme.accentBorder}`, color: theme.accentColor }}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Meal preference */}
      {choice === "confirmed" && (
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}
        >
          <p
            className="text-sm font-semibold mb-3"
            style={{ color: theme.headingColor, fontFamily: "Heebo, sans-serif" }}
          >
            העדפת מנה
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {MEAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMeal(opt.value)}
                className="py-3 px-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                style={{
                  fontFamily: "Heebo, sans-serif",
                  background: meal === opt.value
                    ? `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}cc)`
                    : theme.cardBg,
                  color: meal === opt.value ? "white" : theme.accentColor,
                  border: `1.5px solid ${meal === opt.value ? "transparent" : theme.accentBorder}`,
                }}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="הערה למנה (אופציונלי)"
            value={mealNote}
            onChange={(e) => setMealNote(e.target.value)}
            maxLength={120}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              fontFamily: "Heebo, sans-serif",
              background: theme.cardBg,
              border: `1px solid ${theme.accentBorder}`,
              color: theme.headingColor,
            }}
          />
        </div>
      )}

      {errorMsg && (
        <p className="text-sm text-red-500 text-center mb-3" style={{ fontFamily: "Heebo, sans-serif" }}>
          {errorMsg}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!choice || submitting}
        className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40"
        style={{
          fontFamily: "Heebo, sans-serif",
          background: `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}bb)`,
          color: "white",
          boxShadow: choice ? `0 4px 20px ${theme.accentColor}33` : "none",
        }}
      >
        {submitting
          ? <Loader2 size={18} className="animate-spin" />
          : "שלחו אישור ✓"}
      </button>

      <p className="text-center text-xs mt-5" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
        התגובה שלכם תישמר מיד
      </p>
    </Shell>
  );
}

/* ── Shared wrapper ─────────────────────────────────── */
function Shell({ theme, children }: { theme: EventTheme; children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: theme.bodyBg === "#FFFFFF" || theme.bodyBg === "#111111"
        ? theme.bodyBg
        : `linear-gradient(160deg,${theme.bodyBg} 0%,${theme.bodyBg}ee 100%)` }}
    >
      {/* Corner ornaments */}
      {(["top-6 right-6","top-6 left-6 scale-x-[-1]","bottom-6 right-6 scale-y-[-1]","bottom-6 left-6 -scale-x-100 scale-y-[-1]"] as const).map((p) => (
        <div key={p} className={`fixed ${p} opacity-20 pointer-events-none`}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M2 2L13 2" stroke={theme.accentColor} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 2L2 13" stroke={theme.accentColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ))}

      <div
        className="w-full max-w-sm rounded-3xl p-7"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.cardShadow,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function LoadingSpinner({ theme }: { theme: EventTheme }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Loader2 size={32} className="animate-spin" style={{ color: theme.accentColor }} />
      <p className="text-sm" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>טוען…</p>
    </div>
  );
}

function ErrorScreen({ theme }: { theme: EventTheme }) {
  return (
    <div className="text-center py-8">
      <AlertCircle size={40} className="mx-auto mb-4" style={{ color: theme.accentColor }} />
      <p className="font-semibold mb-1" style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
        הקישור אינו תקין
      </p>
      <p className="text-sm" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
        בדקו שהקישור שלם ונסו שוב, או פנו אלינו ישירות.
      </p>
    </div>
  );
}
