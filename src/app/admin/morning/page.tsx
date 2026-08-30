"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw, AlertTriangle, MessageSquare } from "lucide-react";

/* "הבוקר של דביר" — the four questions, on one screen.
 *
 * Designed in Stitch on 30/08 and implemented from that design. Two departures
 * from what Stitch produced, both deliberate:
 *
 * Stitch shipped its own Material palette and Libre Caslon / Work Sans. This
 * codebase already carries a documented palette problem — twenty-seven inline
 * colour sets across the admin — and a fourth cream three percent off the other
 * three reads as a rendering bug, not as a design. So the layout, spacing and
 * hierarchy are Stitch's; the tokens are the ones every other admin screen uses.
 *
 * And its error red (#ba1a1a) is the red of a failed deploy. Nothing here is an
 * emergency — a full cap is the normal state of a working afternoon — so the
 * warning tone is the muted terracotta already used on /admin/today.
 */

const T = {
  page:   "#F6F1E8",
  card:   "#FDFAF5",
  border: "#E8E0D4",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.55)",
  faint:  "rgba(28,16,8,0.35)",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  olive:  "#6B7B5A",
  warn:   "#B85C38",
};

const serif = "'Frank Ruhl Libre', serif";

interface Morning {
  now: string;
  cap: {
    used: number; cap: number; blocked: boolean;
    nextOpen: { time: string; slots: number } | null;
    runs: { time: string; slots: number; blocked: boolean; reason: string | null }[];
  };
  sentToday: { groups: { wedding: string; items: { kind: string; count: number; failed: number }[] }[]; total: number };
  weddings: {
    id: string; name: string; date: string; days: number;
    confirmed: number; pending: number; declined: number; meals: number;
    confirmedToday: number; dueTomorrow: number; exhausted: number;
  }[];
  needsYou: {
    unreachable: { name: string; phone: string; reason: string; token: string; wedding: string }[];
    questions: { guestId: string; text: string; at: string }[];
  };
}

const card: React.CSSProperties = {
  background: T.card, border: `1px solid ${T.border}`,
  borderRadius: 12, boxShadow: "0 4px 20px rgba(28,16,8,0.03)",
};

function Heading({ children, pill }: { children: React.ReactNode; pill?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, margin: 0, color: T.dark, opacity: 0.9 }}>
        {children}
      </h2>
      {pill && (
        <span style={{
          background: "#ECE8DF", color: T.muted, fontSize: 13, fontWeight: 500,
          padding: "3px 12px", borderRadius: 999, border: `1px solid ${T.border}`,
        }}>{pill}</span>
      )}
    </div>
  );
}

export default function MorningPage() {
  const [d, setD] = useState<Morning | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/morning", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      setD(await r.json());
      setErr(null);
    } catch {
      setErr("לא הצלחנו לטעון. נסו שוב.");
    } finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const wrap: React.CSSProperties = {
    minHeight: "100vh", background: T.page, color: T.dark,
    fontFamily: "Heebo, system-ui, sans-serif", padding: "20px 16px 64px",
  };

  if (!d) {
    return (
      <div dir="rtl" style={wrap}>
        <p style={{ color: T.muted, textAlign: "center", marginTop: 60 }}>
          {err ?? "טוען…"}
        </p>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((d.cap.used / d.cap.cap) * 100));
  const full = d.cap.blocked;

  return (
    <div dir="rtl" style={wrap}>
      {/* Stitch designed a 12-column desktop frame — sections 1+2 across the
          top, 3+4 beneath. Inline styles cannot hold a media query, and the
          rest of this file is inline like every other admin screen, so the two
          breakpoints live here and nothing else changes shape. */}
      <style>{`
        .m-wrap { max-width: 720px; margin: 0 auto; }
        .m-top  { display: grid; gap: 28px; }
        .m-low  { display: grid; gap: 28px; }
        @media (min-width: 1024px) {
          .m-wrap { max-width: 1120px; }
          .m-top  { grid-template-columns: 7fr 5fr; align-items: start; }
          .m-low  { grid-template-columns: 1fr 1fr; align-items: start; }
        }
      `}</style>
      <div className="m-wrap">

        {/* ---------- header ---------- */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <Link href="/admin" style={{ color: T.muted, display: "flex", alignItems: "center", gap: 6, fontSize: 14, textDecoration: "none" }}>
            <ArrowRight size={18} /> ניהול
          </Link>
          <h1 style={{ fontFamily: serif, fontSize: 26, fontWeight: 700, margin: 0 }}>הבוקר של דביר</h1>
          <button onClick={load} aria-label="רענון" style={{
            background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 6,
          }}>
            <RefreshCw size={18} style={{ opacity: busy ? 0.4 : 1 }} />
          </button>
        </header>

        <div className="m-top">
        {/* ---------- 1. now ---------- */}
        <section style={{ marginBottom: 0 }}>
          <Heading>עכשיו</Heading>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
              <span style={{
                fontFamily: serif, fontSize: 24, fontWeight: 600,
                color: full ? T.warn : T.dark, letterSpacing: "-0.01em",
              }}>
                {d.cap.used} / {d.cap.cap} נמענים
              </span>
              {full && <AlertTriangle size={20} style={{ color: T.warn, opacity: 0.85 }} />}
            </div>

            <div style={{ height: 8, borderRadius: 999, background: "#E7E2D9", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`, borderRadius: 999,
                background: full ? T.warn : T.gold, transition: "width .4s ease",
              }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: full ? T.warn : T.olive }}>
                {full
                  ? d.cap.nextOpen ? `מלא — נפתח ב-${d.cap.nextOpen.time}` : "מלא"
                  : "פנוי לשליחה"}
              </span>
              {d.cap.nextOpen && (
                <span style={{ fontSize: 15, color: T.muted }}>
                  החלון הבא: {d.cap.nextOpen.time} · {d.cap.nextOpen.slots} מקומות
                </span>
              )}
              {d.cap.runs.some(r => r.blocked) && (
                <span style={{ fontSize: 13, color: T.faint }}>
                  {d.cap.runs.find(r => r.blocked)?.reason ?? "שבת — אין שליחות"}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ---------- 2. sent today ---------- */}
        <section style={{ marginBottom: 0 }}>
          <Heading pill={`${d.sentToday.total} הודעות`}>יצא היום</Heading>
          {d.sentToday.groups.length === 0 ? (
            <div style={{ ...card, padding: 20, color: T.muted, fontSize: 15 }}>
              עוד לא יצאה היום שום הודעה.
            </div>
          ) : (
            <div style={card}>
              {d.sentToday.groups.map((g, i) => (
                <div key={g.wedding} style={{
                  padding: 16, borderTop: i ? `1px solid ${T.border}` : "none",
                }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{g.wedding}</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 6 }}>
                    {g.items.map(it => (
                      <li key={it.kind} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
                        <span style={{ width: 4, height: 4, borderRadius: 999, background: T.faint }} />
                        <span>{it.kind}</span>
                        <span style={{ fontWeight: 600 }}>{it.count}</span>
                        {it.failed > 0 && (
                          <span style={{ color: T.muted, fontSize: 13 }}>· {it.failed} נכשלו</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        </div>

        <div className="m-low" style={{ marginTop: 28 }}>
        {/* ---------- 3. weddings ---------- */}
        <section style={{ marginBottom: 0 }}>
          <Heading>החתונות</Heading>
          <div style={{ display: "grid", gap: 14 }}>
            {d.weddings.map(w => {
              const total = w.confirmed + w.pending + w.declined;
              const share = total ? Math.round((w.confirmed / total) * 100) : 0;
              return (
                <div key={w.id} style={{ ...card, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <h3 style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, margin: 0 }}>{w.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, fontSize: 13, color: T.muted }}>
                        <span>{w.date.slice(8, 10)}.{w.date.slice(5, 7)}</span>
                        <span style={{ width: 4, height: 4, borderRadius: 999, background: T.faint }} />
                        <span>בעוד {w.days} ימים</span>
                      </div>
                    </div>
                    {w.confirmedToday > 0 && (
                      <span style={{
                        background: "rgba(107,123,90,0.12)", color: T.olive, border: `1px solid rgba(107,123,90,0.25)`,
                        fontSize: 13, fontWeight: 600, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
                      }}>+{w.confirmedToday} אישרו היום</span>
                    )}
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", textAlign: "center",
                    borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
                    padding: "14px 0", margin: "16px 0 12px",
                  }}>
                    {([["אישרו", w.confirmed], ["ממתינים", w.pending], ["לא מגיעים", w.declined]] as const).map(([label, n], i) => (
                      <div key={label} style={{
                        borderInlineEnd: i < 2 ? `1px solid ${T.border}` : "none",
                      }}>
                        <div style={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>{n}</div>
                        <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 6, borderRadius: 999, background: "#E7E2D9", overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${share}%`, borderRadius: 999, background: T.gold }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: T.muted }}>
                    <span>{w.meals} מנות</span>
                    <span>
                      {w.dueTomorrow > 0
                        ? `מחר: ${w.dueTomorrow} מוכנים`
                        : w.exhausted > 0 ? `מחר: אף אחד · ${w.exhausted} מיצו` : "מחר: אף אחד"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- 4. needs you ---------- */}
        <section>
          <Heading pill={d.needsYou.unreachable.length ? `${d.needsYou.unreachable.length} אנשים` : undefined}>
            צריך אותך
          </Heading>

          {d.needsYou.unreachable.length === 0 && d.needsYou.questions.length === 0 ? (
            <div style={{ ...card, padding: 28, textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 20, color: T.olive }}>הכול מטופל 🤍</div>
              <div style={{ fontSize: 14, color: T.muted, marginTop: 6 }}>אין אף אחד שממתין לך.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {d.needsYou.unreachable.length > 0 && (
                <div style={card}>
                  {d.needsYou.unreachable.map((g, i) => (
                    <div key={g.phone + i} style={{
                      padding: 14, borderTop: i ? `1px solid ${T.border}` : "none",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{g.name}</div>
                        <div style={{ fontSize: 13, color: T.muted }}>{g.reason} · {g.wedding}</div>
                      </div>
                      <a
                        href={`sms:${g.phone}${/iPhone|iPad|Mac/.test(typeof navigator !== "undefined" ? navigator.userAgent : "") ? "&" : "?"}body=${encodeURIComponent(`שלום ${g.name}, קיבלתם הזמנה לחתונה ולא הצלחנו להעביר אותה בוואטסאפ. לאישור הגעה: https://regalifnei.vercel.app/rsvp/${g.token}`)}`}
                        style={{
                          background: T.gold, color: "#fff", textDecoration: "none",
                          fontSize: 14, fontWeight: 600, padding: "8px 16px", borderRadius: 8,
                          whiteSpace: "nowrap",
                        }}
                      >שלח SMS</a>
                    </div>
                  ))}
                </div>
              )}

              {d.needsYou.questions.length > 0 && (
                <Link href="/admin/inbox" style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <MessageSquare size={20} style={{ color: T.gold, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {d.needsYou.questions.length} הודעות מאורחים מחכות לתשובה
                      </div>
                      <div style={{
                        fontSize: 13, color: T.muted, overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{d.needsYou.questions[0].text}</div>
                    </div>
                    <span style={{ color: T.goldT, fontSize: 14, fontWeight: 600 }}>פתח</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}
