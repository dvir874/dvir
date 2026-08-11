"use client";

import { use, useCallback, useEffect, useState } from "react";

/* סקר תודה — implementation of the approved Stitch screen
   "סקר תודה - חתונת ענבל ונדב".

   Mobile-first because it is guest-facing and will be opened from a phone, in
   a chat, days after the wedding.

   Three questions and nothing else. Every extra field costs answers, and the
   couple does not need a report — they need to hear that it was beautiful, in
   enough voices to believe it. The written blessing is the point; the rating
   and the favourite moment are there to give someone who will not write a
   paragraph a way to say something anyway.

   Reached with the guest's own RSVP token, so no new link has to be
   distributed and the invitation still sitting in their chat leads here. */

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.58)", border: "#E8E0D4",
  olive: "#6B7B5A", green: "#4A7C59",
};

const MOMENTS = ["החופה", "הריקוד הראשון", "הארוחה", "הבילוי"];

interface Data {
  guest: { name: string };
  event: { name: string; date: string } | null;
  tooEarly: boolean;
  existing: { rating: number | null; favourite: string | null; message: string | null } | null;
}

export default function ThanksPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [moment, setMoment] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    try {
      /* A timeout, because this is a guest-facing page and the one before it
         taught us what a request with no timeout does to one. */
      const r = await fetch(`/api/thanks/${token}`, { signal: AbortSignal.timeout(15_000) });
      if (r.status === 404) { setErr("הקישור אינו תקין"); return; }
      if (!r.ok) { setErr("לא הצלחנו לטעון את הדף. נסו שוב בעוד רגע."); return; }
      const d: Data = await r.json();
      setData(d);
      if (d.existing) {
        setRating(d.existing.rating ?? 0);
        setMoment(d.existing.favourite);
        setMessage(d.existing.message ?? "");
      }
    } catch { setErr("לא הצלחנו לטעון את הדף. בדקו חיבור לאינטרנט."); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (busy) return;
    if (!rating && !moment && !message.trim()) {
      setErr("נשמח לכוכב אחד לפחות, או למילה 🤍"); return;
    }
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/thanks/${token}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          rating: rating || undefined,
          favourite: moment,
          message: message.trim() || null,
        }),
      });
      if (!r.ok) { setErr("לא הצלחנו לשמור. נסו שוב."); return; }
      setDone(true);
    } catch { setErr("לא הצלחנו לשמור. בדקו חיבור לאינטרנט."); }
    finally { setBusy(false); }
  }

  const card: React.CSSProperties = {
    background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18,
    padding: "20px 18px", marginBottom: 14,
  };
  const label: React.CSSProperties = {
    margin: "0 0 14px", fontWeight: 700, fontSize: 15.5, color: C.dark,
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: C.ivory,
      padding: "34px 18px calc(34px + env(safe-area-inset-bottom))",
    }}>
      <div style={{ maxWidth: 440, margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 99, margin: "0 auto 16px",
            background: C.cream, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 30,
          }}>🌿</div>
          <h1 style={{
            fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 800,
            fontSize: 25, color: C.dark, margin: 0,
          }}>
            תודה שהייתם איתנו ❤️
          </h1>
          {data?.event && (
            <p style={{ margin: "8px 0 0", fontSize: 14, color: C.muted }}>
              {data.event.name}
              {data.event.date && <><br />{new Date(data.event.date)
                .toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}</>}
            </p>
          )}
        </div>

        {err && !data && (
          <div style={{ ...card, textAlign: "center" }}>
            <p style={{ margin: 0, color: C.muted, fontSize: 15 }}>{err}</p>
          </div>
        )}

        {!data && !err && (
          <p style={{ textAlign: "center", color: C.muted, fontSize: 14 }}>טוען…</p>
        )}

        {/* Before the wedding this page has nothing to ask. */}
        {data?.tooEarly && (
          <div style={{ ...card, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: C.dark }}>
              עוד לא 🤍
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
              הדף הזה ייפתח אחרי האירוע. נשמח לשמוע מכם אז.
            </p>
          </div>
        )}

        {done && (
          <div style={{
            ...card, textAlign: "center",
            background: "rgba(74,124,89,0.08)", border: "1px solid rgba(74,124,89,0.28)",
          }}>
            <p style={{ fontSize: 32, margin: "0 0 8px" }}>🤍</p>
            <p style={{ margin: 0, fontWeight: 700, color: C.green, fontSize: 16 }}>
              תודה! הברכה שלכם הועברה לזוג
            </p>
          </div>
        )}

        {data && !data.tooEarly && !done && (
          <>
            <div style={card}>
              <p style={label}>איך הייתה החוויה?</p>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    aria-label={`${n} מתוך 5`}
                    aria-pressed={rating === n}
                    style={{
                      width: 52, height: 52, borderRadius: 14, border: "none",
                      background: "transparent", cursor: "pointer", fontSize: 30,
                      lineHeight: 1, color: n <= rating ? C.gold : "rgba(28,16,8,0.18)",
                      transition: "color .15s, transform .15s",
                      transform: n <= rating ? "scale(1.04)" : undefined,
                    }}
                  >★</button>
                ))}
              </div>
            </div>

            <div style={card}>
              <p style={label}>מה הרגע שהכי אהבתם?</p>
              {MOMENTS.map(m => {
                const on = moment === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMoment(on ? null : m)}
                    aria-pressed={on}
                    style={{
                      width: "100%", minHeight: 48, marginBottom: 8,
                      display: "flex", alignItems: "center", gap: 11,
                      background: on ? C.cream : "transparent",
                      border: `1.5px solid ${on ? C.gold : C.border}`,
                      borderRadius: 13, padding: "0 14px", cursor: "pointer",
                      fontSize: 15, color: C.dark, textAlign: "right",
                    }}
                  >
                    {/* Selection is shape as well as colour, not colour alone. */}
                    <span style={{
                      width: 19, height: 19, borderRadius: 99, flexShrink: 0,
                      border: `2px solid ${on ? C.gold : "rgba(28,16,8,0.22)"}`,
                      background: on ? C.gold : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 11, fontWeight: 900,
                    }}>{on ? "✓" : ""}</span>
                    {m}
                  </button>
                );
              })}
            </div>

            <div style={card}>
              <p style={label}>השאירו ברכה לזוג</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="כתבו ברכה מהלב…"
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 13,
                  padding: "13px 14px", fontSize: 15.5, lineHeight: 1.7,
                  fontFamily: "inherit", color: C.dark, background: C.ivory,
                  resize: "vertical", boxSizing: "border-box",
                }}
              />
            </div>

            {err && (
              <p style={{ margin: "0 0 12px", textAlign: "center", fontSize: 14, color: "#B4453C" }}>
                {err}
              </p>
            )}

            <button
              onClick={submit}
              disabled={busy}
              style={{
                width: "100%", minHeight: 54, borderRadius: 99, border: "none",
                background: C.gold, color: "#fff", fontSize: 17, fontWeight: 700,
                cursor: busy ? "default" : "pointer", opacity: busy ? 0.65 : 1,
              }}
            >
              {busy ? "שולח…" : "שלחו"}
            </button>

            {data.existing && (
              <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 13, color: C.muted }}>
                כבר עניתם — אפשר לעדכן ולשלוח שוב
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
