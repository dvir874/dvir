"use client";

import { useEffect, useState } from "react";

/* לפני שליחה — the last look before hundreds of invitations go out.
 *
 * Dvir never saw the message his clients' guests receive. He saw whether they
 * confirmed, which is the outcome and not the artifact — and on 15/08 the
 * sender was one deploy away from inviting שחר's 327 guests to somebody else's
 * wedding, over her own photograph. Nothing on any screen would have shown it.
 *
 * Implemented from the approved Stitch screen "לפני שליחה — תצוגה מקדימה
 * (נקי ובהיר)". The data comes from /api/admin/send-preview, which builds the
 * four template variables with the same functions the cron calls and reads the
 * body text from Meta's own copy of the approved template — so what is on this
 * page is what will be delivered, not what we believe is approved.
 */

const T = {
  page: "#F6F1E8", card: "#FDFAF5", border: "#E8E0D4",
  dark: "#1C1008", muted: "rgba(28,16,8,0.6)",
  gold: "#C5A46D", olive: "#6B7B5A", alert: "#B4453C",
};

type Ev = {
  event: string; date: string; status: string;
  blockedReason: string | null; pausedUntil: string | null;
  pending: number; template: string | null; templateSource: string;
  headerImage: string | null;
  variables: { couple: string; date: string; venue: string; times: string } | null;
  button: { text: string; url: string; sampleGuest: string } | null;
  message: string | null;
};

export default function SendPreview() {
  const [data, setData] = useState<{ events: Ev[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/send-preview")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 401 ? "צריך להתחבר לאדמין" : `שגיאה ${r.status}`)))
      .then(setData)
      .catch(e => setErr(e.message));
  }, []);

  return (
    <div dir="rtl" style={{
      minHeight: "100dvh", background: T.page, padding: "40px 20px 80px",
      fontFamily: "Heebo, -apple-system, system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 34 }}>
          <h1 style={{
            fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 30, fontWeight: 900,
            color: T.dark, margin: "0 0 8px", letterSpacing: "-0.01em",
          }}>
            לפני שליחה
          </h1>
          <p style={{ fontSize: 14, color: T.muted, margin: 0, lineHeight: 1.6 }}>
            תצוגה מקדימה ואישור סופי של הודעות וואטסאפ לפני הפצה לאורחים
          </p>
        </header>

        {err && <Note tone="alert">{err}</Note>}
        {!data && !err && <Note tone="muted">טוען…</Note>}
        {data?.events.length === 0 && <Note tone="muted">אין אירועים קרובים</Note>}

        {data?.events.map(ev => <Card key={ev.event} ev={ev} />)}
      </div>
    </div>
  );
}

function Card({ ev }: { ev: Ev }) {
  const blocked = !!ev.blockedReason;
  const paused = !!ev.pausedUntil;

  return (
    <article style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 18,
      padding: "22px 22px 18px", marginBottom: 22,
      boxShadow: "0 1px 3px rgba(28,16,8,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
        <div>
          <h3 style={{
            fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 21, fontWeight: 700,
            color: T.dark, margin: "0 0 7px",
          }}>
            {ev.variables?.couple ?? ev.event}
          </h3>
          <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.7 }}>
            {new Date(ev.date).toLocaleDateString("he-IL")}
            {"  ·  "}
            <span style={{ color: T.gold, fontWeight: 700 }}>{ev.pending}</span> אורחים ממתינים
          </p>
        </div>
        <Chip blocked={blocked} paused={paused} />
      </div>

      {blocked ? (
        <div style={{
          marginTop: 18, padding: "16px 18px", borderRadius: 12,
          border: `1px solid ${T.border}`, background: "rgba(180,69,60,0.04)",
        }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: T.alert }}>
            ⚠️ לא יישלח — {ev.blockedReason}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
            האירוע ידולג בריצה הבאה. השלימו את הפרט החסר והוא ייכנס אוטומטית.
          </p>
        </div>
      ) : (
        <Mockup ev={ev} />
      )}

      <div style={{
        marginTop: 16, paddingTop: 13, borderTop: `1px solid ${T.border}`,
        display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 11.5, color: T.muted,
      }}>
        {ev.template && <span>תבנית: {ev.template}</span>}
        <span>{ev.templateSource}</span>
        {paused && <span>מושהה עד {new Date(ev.pausedUntil!).toLocaleString("he-IL", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}</span>}
      </div>
    </article>
  );
}

/* The WhatsApp message as the guest will see it — the centrepiece, and the only
   part of this page that is not in the brand palette. It keeps WhatsApp's own
   look on purpose: a white bubble on a warm ivory card reads as a phone
   screenshot, and a screenshot is what makes a wrong message obvious. */
function Mockup({ ev }: { ev: Ev }) {
  return (
    <div style={{
      marginTop: 18, background: "#F0F2F5", borderRadius: 14,
      padding: 16, border: `1px solid ${T.border}`,
    }}>
      <div style={{
        background: "#fff", borderRadius: 10, overflow: "hidden",
        maxWidth: 340, margin: "0 auto", boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}>
        {ev.headerImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={ev.headerImage} alt="תמונת ההזמנה"
               style={{ display: "block", width: "100%", height: "auto" }} />
        )}
        <p style={{
          margin: 0, padding: "12px 14px", fontSize: 13, lineHeight: 1.65,
          color: "#111B21", whiteSpace: "pre-wrap", direction: "rtl",
        }}>
          {ev.message}
        </p>
        {ev.button && (
          <a href={ev.button.url} target="_blank" rel="noreferrer"
             style={{
               display: "block", textAlign: "center", padding: "11px 8px",
               borderTop: "1px solid #E9EDEF", color: "#0A7CFF",
               fontSize: 14, fontWeight: 500, textDecoration: "none",
             }}>
            🔗 {ev.button.text}
          </a>
        )}
      </div>
      {ev.button && (
        <p style={{ margin: "10px 0 0", fontSize: 11, color: T.muted, textAlign: "center" }}>
          הקישור לדוגמה הוא של {ev.button.sampleGuest} — לחצו לבדיקה
        </p>
      )}
    </div>
  );
}

function Chip({ blocked, paused }: { blocked: boolean; paused: boolean }) {
  const [label, colour, bg] = blocked
    ? ["לא יישלח", T.alert, "rgba(180,69,60,0.08)"]
    : paused
      ? ["מושהה", T.muted, "rgba(28,16,8,0.05)"]
      : ["יישלח", T.olive, "rgba(107,123,90,0.1)"];

  return (
    <span style={{
      flexShrink: 0, padding: "6px 13px", borderRadius: 999, background: bg,
      color: colour, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
      border: `1px solid ${blocked ? "rgba(180,69,60,0.2)" : paused ? T.border : "rgba(107,123,90,0.25)"}`,
    }}>
      {blocked ? "✕" : paused ? "⏸" : "✓"} {label}
    </span>
  );
}

function Note({ children, tone }: { children: React.ReactNode; tone: "alert" | "muted" }) {
  return (
    <p style={{
      textAlign: "center", padding: "28px 16px", fontSize: 14,
      color: tone === "alert" ? T.alert : T.muted,
    }}>
      {children}
    </p>
  );
}
