"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { CheckCircle, XCircle, Users, Loader2, AlertCircle, Share2, Clock } from "lucide-react";
import { getTheme, type EventTheme } from "@/lib/themes";

type Status = "confirmed" | "declined" | "pending";
type MealOption = "regular" | "vegetarian" | "vegan" | "mehadrin";

const MEAL_OPTIONS: { value: MealOption; label: string; emoji: string }[] = [
  { value: "regular",     label: "רגיל",          emoji: "🍽️" },
  { value: "vegetarian",  label: "צמחוני",         emoji: "🥗" },
  { value: "vegan",       label: "טבעוני",         emoji: "🌱" },
  { value: "mehadrin",    label: "כשר מהדרין",     emoji: "✡️" },
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
  rsvp_deadline?: string | null;
}

type Screen = "loading" | "error" | "form" | "done" | "closed" | "wrong-person";

export default function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [screen,      setScreen]      = useState<Screen>("loading");
  const [guest,       setGuest]       = useState<GuestInfo | null>(null);
  const [event,       setEvent]       = useState<EventInfo | null>(null);
  const [choice,      setChoice]      = useState<"confirmed" | "declined" | null>(null);
  const [guestCount,  setGuestCount]  = useState(1);
  const [meal,        setMeal]        = useState<MealOption | null>(null);
  const [mealNote,    setMealNote]    = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [cardVisible,  setCardVisible]  = useState(false);
  const [tableName,    setTableName]    = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rsvp/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setScreen("error"); return; }
        setGuest(data.guest);
        setEvent(data.event);
        setTableName(data.tableName ?? null);
        setGuestCount(data.guest.guest_count ?? 1);

        // Check deadline
        if (data.event?.rsvp_deadline) {
          const deadline = new Date(data.event.rsvp_deadline);
          deadline.setHours(23, 59, 59);
          if (new Date() > deadline && data.guest.status === "pending") {
            setScreen("closed");
            return;
          }
        }

        if (data.guest.status !== "pending") {
          setScreen("done");
        } else {
          // Start envelope animation
          setTimeout(() => setEnvelopeOpen(true), 400);
          setTimeout(() => setCardVisible(true), 1200);
          setTimeout(() => setScreen("form"), 1400);
        }
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
      if (choice === "confirmed") {
        try {
          const text = `🎉 מגיעים לחתונה של ${event?.name ?? ""}! מחכים לחגוג ביחד 🤍`;
          if (navigator.share) { navigator.share({ text }).catch(() => {}); }
        } catch { /* ignore */ }
      }
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

  const deadlineStr = event?.rsvp_deadline
    ? new Date(event.rsvp_deadline).toLocaleDateString("he-IL", { day: "numeric", month: "long" })
    : null;

  if (screen === "loading") {
    // Show envelope animation while loading
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F2EDE3" }}>
        <style>{`
          @keyframes envelopeOpen {
            0%   { transform: perspective(600px) rotateX(0deg); }
            100% { transform: perspective(600px) rotateX(-180deg); }
          }
          @keyframes cardRise {
            0%   { opacity:0; transform: translateY(30px); }
            100% { opacity:1; transform: translateY(0); }
          }
          @keyframes envelopeFade {
            0%   { opacity:1; transform: scale(1); }
            100% { opacity:0; transform: scale(0.85); }
          }
          .envelope-flap-open { animation: envelopeOpen 0.7s cubic-bezier(0.4,0,0.2,1) forwards; transform-origin: top center; }
          .card-rise { animation: cardRise 0.5s ease forwards; }
          .envelope-fade { animation: envelopeFade 0.4s ease forwards; }
        `}</style>
        <LoadingSpinner theme={theme} />
      </div>
    );
  }

  if (screen === "error") return <Shell theme={theme}><ErrorScreen theme={theme} /></Shell>;

  if (screen === "wrong-person") {
    return (
      <Shell theme={theme}>
        <div className="text-center py-4">
          <div className="text-5xl mb-4">🤷</div>
          <h2 className="text-xl font-bold mb-3" style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
            קיבלתם בטעות?
          </h2>
          <p className="text-sm mb-2" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif", lineHeight: 1.7 }}>
            ייתכן שהקישור נשלח למספר הטלפון הלא נכון.
          </p>
          <p className="text-sm" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
            פנו ישירות לבעלי השמחה כדי לתקן את הטעות 🙏
          </p>
        </div>
      </Shell>
    );
  }

  if (screen === "closed") {
    return (
      <Shell theme={theme}>
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: `rgba(197,164,109,0.1)`, border: `1.5px solid rgba(197,164,109,0.3)` }}>
            <Clock size={38} style={{ color: theme.accentColor }} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
            ההזמנה נסגרה
          </h2>
          <p className="text-sm mb-2" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif", lineHeight: 1.7 }}>
            תאריך האחרון לאישור הגעה עבר.
          </p>
          <p className="text-sm" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
            לפרטים נוספים, פנו ישירות לבעלי השמחה.
          </p>
        </div>
      </Shell>
    );
  }

  if (screen === "done") {
    const confirmed = guest?.status === "confirmed";

    const calUrl = (() => {
      if (!event?.date) return null;
      const d     = new Date(event.date);
      const ymd   = (dt: Date) => dt.toISOString().replace(/-/g, "").replace(/:/g, "").split(".")[0] + "Z";
      const start = ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0, 0));
      const end   = ymd(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 0));
      const calParams = new URLSearchParams({
        action: "TEMPLATE", text: event.name,
        dates: `${start}/${end}`,
        details: event.address ?? "",
        location: event.address ?? "",
      });
      return `https://calendar.google.com/calendar/render?${calParams.toString()}`;
    })();

    const wazeUrl = event?.address
      ? `https://waze.com/ul?q=${encodeURIComponent(event.address)}&navigate=yes`
      : null;

    return (
      <Shell theme={theme}>
        <div className="text-center" style={{ animation: "rsvpFadeUp 0.5s ease both" }}>
          {confirmed && (
            <div className="flex justify-center gap-3 mb-4" style={{ animation: "rsvpFadeUp 0.4s ease 0.1s both" }}>
              {["✦", "💛", "✦"].map((s, i) => (
                <span key={i} className="text-base" style={{
                  color: theme.accentColor,
                  animation: `float ${2.5 + i * 0.4}s ease-in-out ${i * 0.15}s infinite`,
                  opacity: i === 1 ? 1 : 0.6,
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: confirmed
                ? `radial-gradient(circle, ${theme.accentColor}22 0%, ${theme.accentColor}0a 100%)`
                : "rgba(197,164,109,0.08)",
              border: `1.5px solid ${theme.accentColor}44`,
              animation: "rsvpPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both",
            }}>
            {confirmed
              ? <CheckCircle size={44} style={{ color: theme.accentColor }} strokeWidth={1.5} />
              : <XCircle    size={44} style={{ color: theme.accentColor }} strokeWidth={1.5} />}
          </div>

          <h2 className="text-2xl font-bold mb-2"
            style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif", lineHeight: 1.3 }}>
            {confirmed ? "תודה שאישרתם!" : "קיבלנו את תגובתכם"}
          </h2>

          {confirmed && (
            <p className="text-base font-light mb-1" style={{ color: theme.mutedColor, fontFamily: "Frank Ruhl Libre, serif" }}>
              מחכים לכם ביום המיוחד 🤍
            </p>
          )}

          <p className="text-sm mb-1" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
            {confirmed
              ? `${guest?.guest_count} ${(guest?.guest_count ?? 1) === 1 ? "אורח" : "אורחים"} רשומים להגיע`
              : "חבל שלא תוכלו להגיע — נשמח לראותכם בפעם אחרת 💛"}
          </p>

          {event && (
            <div className="mt-4 mb-5 py-3 px-4 rounded-2xl"
              style={{ background: theme.accentBg, border: `1px solid ${theme.accentColor}22` }}>
              <p className="text-sm font-semibold" style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
                {event.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: theme.accentColor, fontFamily: "Heebo, sans-serif" }}>
                {formattedDate}
              </p>
            </div>
          )}

          {confirmed && tableName && (
            <div className="mt-2 mb-4 py-3 px-4 rounded-2xl text-center"
              style={{ background: `linear-gradient(135deg,${theme.accentColor}18,${theme.accentColor}08)`, border: `1.5px solid ${theme.accentColor}33` }}>
              <p className="text-xs mb-1" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>מקום ישיבה</p>
              <p className="text-xl font-bold" style={{ color: theme.accentColor, fontFamily: "Frank Ruhl Libre, serif" }}>
                🪑 שולחן {tableName}
              </p>
            </div>
          )}

          {confirmed && (calUrl || wazeUrl) && (
            <div className="flex flex-col gap-2.5" style={{ animation: "rsvpFadeUp 0.4s ease 0.35s both" }}>
              {calUrl && (
                <a href={calUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:opacity-85 hover:-translate-y-0.5"
                  style={{ background: theme.accentBg, color: theme.accentColor, border: `1px solid ${theme.accentColor}33`, fontFamily: "Heebo, sans-serif", boxShadow: `0 2px 10px ${theme.accentColor}14` }}>
                  📅 הוסיפו ליומן Google
                </a>
              )}
              {wazeUrl && (
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 hover:opacity-85 hover:-translate-y-0.5"
                  style={{ background: "rgba(51,204,255,0.08)", color: "#0099CC", border: "1px solid rgba(51,204,255,0.25)", fontFamily: "Heebo, sans-serif" }}>
                  🚗 נווטו לאולם — Waze
                </a>
              )}
            </div>
          )}

          {confirmed && (
            <button
              onClick={async () => {
                const text = `🎉 מגיעים לחתונה של ${event?.name ?? ""}! מחכים לחגוג ביחד 🤍`;
                if (navigator.share) {
                  try { await navigator.share({ text }); } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(text);
                  alert("הטקסט הועתק! שתפו בסטטוס 🎉");
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-medium mt-3 transition-all duration-200 hover:opacity-85"
              style={{ background: `${theme.accentColor}10`, color: theme.accentColor, border: `1px solid ${theme.accentColor}33`, fontFamily: "Heebo, sans-serif" }}>
              <Share2 size={15} />
              שתפו שאתם מגיעים!
            </button>
          )}

          <div className="w-16 h-px mx-auto mt-6"
            style={{ background: `linear-gradient(90deg,transparent,${theme.accentColor},transparent)` }} />
        </div>
      </Shell>
    );
  }

  /* ── Envelope animation screen ───────────── */
  if (!cardVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: theme.bodyBg === "#FFFFFF" || theme.bodyBg === "#111111"
          ? theme.bodyBg
          : `linear-gradient(160deg,${theme.bodyBg} 0%,${theme.bodyBg}ee 100%)` }}>
        <style>{`
          @keyframes envelopeFlap {
            0%   { transform: perspective(400px) rotateX(0deg); }
            100% { transform: perspective(400px) rotateX(-175deg); }
          }
          @keyframes letterRise {
            0%   { transform: translateY(0); opacity:0.3; }
            100% { transform: translateY(-55px); opacity:1; }
          }
          @keyframes envFade {
            0%   { opacity:1; transform:scale(1); }
            100% { opacity:0; transform:scale(0.92) translateY(12px); }
          }
          .env-body { position:relative; width:220px; height:140px; background:linear-gradient(145deg,#FDF5E6,#F5E8C8); border-radius:6px 6px 14px 14px; border:1.5px solid rgba(197,164,109,0.5); box-shadow:0 8px 32px rgba(197,164,109,0.2); }
          .env-flap { position:absolute; top:0; left:0; right:0; height:0; border-right:110px solid transparent; border-left:110px solid transparent; border-top:70px solid #EDD99A; transform-origin:top center; }
          .env-flap-open { animation: envelopeFlap 0.7s cubic-bezier(0.4,0,0.2,1) 0.3s forwards; }
          .env-letter { position:absolute; bottom:10px; left:14px; right:14px; height:80px; background:white; border-radius:6px; border:1px solid rgba(197,164,109,0.3); display:flex;align-items:center;justify-content:center; }
          .letter-rise { animation: letterRise 0.6s cubic-bezier(0.34,1.4,0.64,1) 0.9s forwards; }
          .env-fade  { animation: envFade 0.4s ease 1.1s forwards; }
        `}</style>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div className={`env-body ${envelopeOpen ? "env-fade" : ""}`}>
            <div className={`env-flap ${envelopeOpen ? "env-flap-open" : ""}`} />
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:0, borderRight:"110px solid transparent", borderLeft:"110px solid transparent", borderBottom:"60px solid #E8D5A0" }} />
            <div style={{ position:"absolute", top:"50%", left:0, right:0, height:0, borderRight:"110px solid #F0E2B2", borderLeft:"110px solid transparent" }} />
            <div className={`env-letter ${envelopeOpen ? "letter-rise" : ""}`}>
              <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:15, color:"#C5A46D", textAlign:"center", padding:"0 8px", lineHeight:1.4 }}>
                {event?.name ?? "ההזמנה שלכם"}
              </p>
            </div>
          </div>
          <p style={{ fontSize:13, color:"rgba(28,16,8,0.45)", fontFamily:"Heebo, sans-serif" }}>
            {envelopeOpen ? "פותח את ההזמנה..." : "יש לכם הזמנה 💌"}
          </p>
        </div>
      </div>
    );
  }

  /* ── Form screen ─────────────────────────────────── */
  return (
    <Shell theme={theme}>
      {/* Event header */}
      {event && (
        <div className="text-center mb-6" style={{ animation: "rsvpFadeUp 0.4s ease both" }}>
          <div className="flex justify-center gap-2 mb-3" style={{ color: theme.accentColor, opacity: 0.55 }}>
            <span style={{ fontSize: 10 }}>✦</span>
            <span style={{ fontSize: 10 }}>✦</span>
            <span style={{ fontSize: 10 }}>✦</span>
          </div>
          <p className="text-[10px] tracking-[0.26em] uppercase mb-2"
            style={{ color: theme.accentColor, fontFamily: "Heebo, sans-serif" }}>
            אתם מוזמנים
          </p>
          <h1 className="text-3xl font-bold mb-1.5 leading-tight"
            style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
            {event.name}
          </h1>
          <p className="text-sm" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
            {formattedDate}
          </p>
          {event.address && (
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
              <p className="text-xs" style={{ color: `${theme.accentColor}bb`, fontFamily: "Heebo, sans-serif" }}>
                📍 {event.address}
              </p>
              <a
                href={`https://waze.com/ul?q=${encodeURIComponent(event.address)}&navigate=yes`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(51,204,255,0.12)", color: "#0099CC", fontFamily: "Heebo, sans-serif", textDecoration: "none" }}>
                🚗 Waze
              </a>
            </div>
          )}
          {/* Deadline badge */}
          {deadlineStr && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <Clock size={11} style={{ color: "#EF4444" }} />
              <span style={{ fontSize: 11, color: "#EF4444", fontFamily: "Heebo, sans-serif" }}>
                אנא אשרו עד {deadlineStr}
              </span>
            </div>
          )}
          <div className="w-14 h-px mx-auto mt-4"
            style={{ background: `linear-gradient(90deg,transparent,${theme.accentColor}88,transparent)` }} />
        </div>
      )}

      <p className="text-center text-base font-semibold mb-1"
        style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif", animation: "rsvpFadeUp 0.4s ease 0.08s both" }}>
        שלום {guest?.name} 🤍
      </p>
      <p className="text-center text-sm mb-6"
        style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif", animation: "rsvpFadeUp 0.4s ease 0.12s both" }}>
        האם תוכלו להגיע לאירוע?
      </p>

      <div className="flex flex-col gap-3 mb-6" style={{ animation: "rsvpFadeUp 0.4s ease 0.18s both" }}>
        <button
          onClick={() => { setChoice("confirmed"); setGuestCount(guest?.guest_count ?? 1); }}
          className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-250"
          style={{
            fontFamily: "Heebo, sans-serif",
            background: choice === "confirmed"
              ? `linear-gradient(135deg,${theme.accentColor} 0%,${theme.accentColor}dd 100%)`
              : theme.cardBg,
            color: choice === "confirmed" ? "white" : theme.accentColor,
            border: `2px solid ${choice === "confirmed" ? "transparent" : theme.accentBorder}`,
            boxShadow: choice === "confirmed"
              ? `0 6px 24px ${theme.accentColor}30, 0 2px 8px ${theme.accentColor}18`
              : `0 1px 4px rgba(0,0,0,0.04)`,
            transform: choice === "confirmed" ? "scale(1.015)" : "scale(1)",
          }}>
          <CheckCircle size={20} strokeWidth={choice === "confirmed" ? 2 : 1.5} />
          כן, נגיע! 🎉
        </button>

        <button
          onClick={() => { setChoice("declined"); setGuestCount(1); }}
          className="w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-250"
          style={{
            fontFamily: "Heebo, sans-serif",
            background: choice === "declined" ? "rgba(90,75,65,0.08)" : "transparent",
            color: choice === "declined" ? "#7A6A5A" : theme.mutedColor,
            border: `1.5px solid ${choice === "declined" ? "rgba(90,75,65,0.3)" : theme.cardBorder}`,
          }}>
          <XCircle size={16} strokeWidth={1.5} />
          לא נוכל להגיע
        </button>
      </div>

      <div className="text-center mb-4" style={{ animation: "rsvpFadeUp 0.4s ease 0.22s both" }}>
        <button
          onClick={() => setScreen("wrong-person")}
          className="text-xs underline-offset-2"
          style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", opacity: 0.6 }}>
          קיבלתם בטעות? זה לא אני
        </button>
      </div>

      {choice === "confirmed" && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: theme.headingColor, fontFamily: "Heebo, sans-serif" }}>
            <Users size={16} style={{ color: theme.accentColor }} />
            כמה אורחים מגיעים?
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
              style={{ background: theme.cardBg, border: `1px solid ${theme.accentBorder}`, color: theme.accentColor }}>
              −
            </button>
            <span className="text-3xl font-bold w-12 text-center"
              style={{ color: theme.headingColor, fontFamily: "Frank Ruhl Libre, serif" }}>
              {guestCount}
            </span>
            <button onClick={() => setGuestCount((c) => Math.min(20, c + 1))}
              className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
              style={{ background: theme.cardBg, border: `1px solid ${theme.accentBorder}`, color: theme.accentColor }}>
              +
            </button>
          </div>
        </div>
      )}

      {choice === "confirmed" && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: theme.accentBg, border: `1px solid ${theme.accentBorder}` }}>
          <p className="text-sm font-semibold mb-3"
            style={{ color: theme.headingColor, fontFamily: "Heebo, sans-serif" }}>
            העדפת מנה
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {MEAL_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setMeal(opt.value)}
                className="py-3 px-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                style={{
                  fontFamily: "Heebo, sans-serif",
                  background: meal === opt.value
                    ? `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}cc)`
                    : theme.cardBg,
                  color: meal === opt.value ? "white" : theme.accentColor,
                  border: `1.5px solid ${meal === opt.value ? "transparent" : theme.accentBorder}`,
                }}>
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <input type="text" placeholder="הערה למנה (אופציונלי)"
            value={mealNote} onChange={(e) => setMealNote(e.target.value)} maxLength={120}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ fontFamily: "Heebo, sans-serif", background: theme.cardBg, border: `1px solid ${theme.accentBorder}`, color: theme.headingColor }} />
        </div>
      )}

      {errorMsg && (
        <p className="text-sm text-red-500 text-center mb-3" style={{ fontFamily: "Heebo, sans-serif" }}>
          {errorMsg}
        </p>
      )}

      <button onClick={handleSubmit} disabled={!choice || submitting}
        className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-40"
        style={{
          fontFamily: "Heebo, sans-serif",
          background: `linear-gradient(135deg,${theme.accentColor},${theme.accentColor}bb)`,
          color: "white",
          boxShadow: choice ? `0 4px 20px ${theme.accentColor}33` : "none",
        }}>
        {submitting ? <Loader2 size={18} className="animate-spin" /> : "שלחו אישור ✓"}
      </button>

      <p className="text-center text-xs mt-5" style={{ color: theme.mutedColor, fontFamily: "Heebo, sans-serif" }}>
        התגובה שלכם תישמר מיד
      </p>
    </Shell>
  );
}

function Shell({ theme, children }: { theme: EventTheme; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: theme.bodyBg === "#FFFFFF" || theme.bodyBg === "#111111"
        ? theme.bodyBg
        : `linear-gradient(160deg,${theme.bodyBg} 0%,${theme.bodyBg}ee 100%)` }}>
      {(["top-6 right-6","top-6 left-6 scale-x-[-1]","bottom-6 right-6 scale-y-[-1]","bottom-6 left-6 -scale-x-100 scale-y-[-1]"] as const).map((p) => (
        <div key={p} className={`fixed ${p} opacity-20 pointer-events-none`}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M2 2L13 2" stroke={theme.accentColor} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 2L2 13" stroke={theme.accentColor} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      ))}
      <div className="w-full max-w-sm rounded-3xl p-7"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, boxShadow: theme.cardShadow }}>
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
