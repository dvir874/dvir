"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* Open group RSVP form — shared in group chats (yeshiva class, army unit...).
   Anyone fills their own details; answers land in the couple's guest list
   tagged with the group name (?g=). */

const T = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "#8C7B6E", border: "#E8E0D4",
};

interface EventInfo { name: string; date: string | null; address?: string | null }

function JoinInner({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const search = useSearchParams();
  const group = search.get("g") ?? "";

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [screen, setScreen] = useState<"loading" | "error" | "form" | "done">("loading");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "chuppah" | null>(null);
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [myToken, setMyToken] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/join/${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.event) { setEvent(d.event); setScreen("form"); } else setScreen("error"); })
      .catch(() => setScreen("error"));
  }, [token]);

  async function submit() {
    if (name.trim().length < 2) { setErrorMsg("איך קוראים לכם? 🙂"); return; }
    const digits = phone.replace(/\D/g, "");
    if (!(digits.length === 10 && digits.startsWith("05"))) { setErrorMsg("מספר טלפון לא תקין (05X-XXXXXXX)"); return; }
    if (attending === null) { setErrorMsg("מגיעים או לא? 🙂"); return; }
    setSubmitting(true); setErrorMsg("");
    try {
      const res = await fetch(`/api/join/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: digits, attending, guest_count: count, group: group || null }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "שגיאה");
      setMyToken(d.rsvp_token ?? null);
      setScreen("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "שגיאה — נסו שוב");
    } finally { setSubmitting(false); }
  }

  const dateStr = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: T.ivory, fontFamily: "'Heebo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        input:focus { outline: none; border-color: ${T.gold} !important; }
      `}</style>

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "36px 20px 60px" }}>
        {screen === "loading" && <p style={{ textAlign: "center", color: T.muted, padding: 60 }}>טוען...</p>}

        {screen === "error" && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>💍</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: T.dark }}>הקישור אינו תקין או שפג תוקפו</p>
            <p style={{ fontSize: 14, color: T.muted }}>בקשו מהזוג קישור חדש</p>
          </div>
        )}

        {screen === "form" && event && (
          <div style={{ animation: "fadeUp 0.4s ease both" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 13, fontWeight: 700, color: T.goldT, letterSpacing: "0.16em", margin: "0 0 14px" }}>
                הוזמנתם לחגוג 💍
              </p>
              <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, color: T.dark, margin: "0 0 6px" }}>
                {event.name}
              </h1>
              {dateStr && <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>{dateStr}</p>}
              {event.address && <p style={{ fontSize: 13, color: T.muted, margin: "4px 0 0" }}>📍 {event.address}</p>}
              {group && (
                <span style={{ display: "inline-block", marginTop: 12, background: "rgba(197,164,109,0.14)", border: `1px solid rgba(197,164,109,0.35)`, borderRadius: 9999, padding: "5px 14px", fontSize: 12, fontWeight: 600, color: T.goldT }}>
                  {group}
                </span>
              )}
            </div>

            <p style={{ textAlign: "center", fontSize: 14, color: T.muted, marginBottom: 22, lineHeight: 1.7 }}>
              מלאו את הפרטים שלכם כדי שהזוג יידע לצפות לכם 🤍
            </p>

            {/* Name + phone */}
            <input placeholder="שם מלא" value={name} onChange={e => setName(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", border: `1.5px solid ${T.border}`, borderRadius: 12, fontSize: 16, fontFamily: "'Heebo', sans-serif", background: "#fff", color: T.dark, marginBottom: 10 }} />
            <input placeholder="טלפון נייד" type="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", border: `1.5px solid ${T.border}`, borderRadius: 12, fontSize: 16, fontFamily: "'Heebo', sans-serif", background: "#fff", color: T.dark, marginBottom: 20, textAlign: "right" }} />

            {/* Attending */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <button type="button" onClick={() => setAttending(a => a === "no" ? null : "no")}
                style={{ padding: "16px 12px", borderRadius: 16, cursor: "pointer", textAlign: "center", border: `2px solid ${attending === "no" ? "#B85C38" : T.border}`, background: attending === "no" ? "rgba(184,92,56,0.08)" : T.cream, fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15, fontWeight: 700, color: attending === "no" ? "#B85C38" : T.dark }}>
                ✗ לא אגיע
              </button>
              <button type="button" onClick={() => setAttending(a => a === "yes" ? null : "yes")}
                style={{ padding: "16px 12px", borderRadius: 16, cursor: "pointer", textAlign: "center", border: `2px solid ${attending === "yes" ? T.gold : T.border}`, background: attending === "yes" ? T.gold : T.cream, fontFamily: "'Frank Ruhl Libre', serif", fontSize: 15, fontWeight: 700, color: attending === "yes" ? "#fff" : T.dark }}>
                ✓ מגיע/ה!
              </button>
            </div>
            <button type="button" onClick={() => setAttending(a => a === "chuppah" ? null : "chuppah")}
              style={{ width: "100%", padding: "13px 12px", borderRadius: 14, cursor: "pointer", textAlign: "center", border: `2px solid ${attending === "chuppah" ? T.goldT : T.border}`, background: attending === "chuppah" ? "rgba(139,105,20,0.08)" : T.cream, fontFamily: "'Heebo', sans-serif", fontSize: 14, fontWeight: attending === "chuppah" ? 700 : 500, color: attending === "chuppah" ? T.goldT : T.dark, marginBottom: attending ? 20 : 24 }}>
              💍 אגיע רק לחופה
            </button>

            {/* Count */}
            {(attending === "yes" || attending === "chuppah") && (
              <div style={{ marginBottom: 24, animation: "fadeUp 0.25s ease both" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.dark, textAlign: "center", margin: "0 0 4px" }}>כמה תגיעו?</p>
                <p style={{ fontSize: 11, fontWeight: 300, color: T.muted, textAlign: "center", margin: "0 0 10px" }}>כולל אתכם</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setCount(n)}
                      style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${count === n ? T.gold : T.border}`, background: count === n ? T.gold : T.cream, color: count === n ? "#fff" : T.dark, fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, cursor: "pointer" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMsg && <p style={{ color: "#B85C38", fontSize: 14, fontWeight: 600, textAlign: "center", marginBottom: 12 }}>{errorMsg}</p>}

            <button onClick={submit} disabled={submitting}
              style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: T.gold, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", boxShadow: "0 4px 12px rgba(197,164,109,0.4)", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "שולח..." : "שליחת תשובה 🎉"}
            </button>

            <p style={{ textAlign: "center", fontSize: 11, color: T.muted, marginTop: 24, opacity: 0.7 }}>
              נבנה באהבה ע״י רגע לפני 💍
            </p>
          </div>
        )}

        {screen === "done" && (
          <div style={{ textAlign: "center", paddingTop: 40, animation: "fadeUp 0.4s ease both" }}>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: T.gold, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 34, color: "#fff" }}>
              {attending === "no" ? "♡" : "✓"}
            </div>
            <h2 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 700, color: T.dark, margin: "0 0 8px" }}>
              {attending === "no" ? "תודה על העדכון 💛" : attending === "chuppah" ? "נתראה בחופה! 💍" : "נתראה בשמחות! 🥂"}
            </h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.7, margin: "0 0 24px" }}>
              {attending === "no" ? "הזוג קיבל את תשובתכם" : attending === "chuppah" ? "עדכנו את הזוג שתגיעו לטקס — מרגש שתהיו שם" : `${count} מקומות נשמרו — הזוג קיבל את האישור שלכם`}
            </p>
            {myToken && (
              <a href={`/rsvp/${myToken}`}
                style={{ display: "inline-block", padding: "13px 26px", borderRadius: 12, background: T.cream, border: `1.5px solid ${T.gold}`, color: T.goldT, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                הקישור האישי שלכם — לעדכונים ופרטי האירוע ←
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען...</div>}>
      <JoinInner params={params} />
    </Suspense>
  );
}
