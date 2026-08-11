"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Phone,
  RefreshCw, Send, Sparkles, XCircle,
} from "lucide-react";

/* מרכז השליחה — implementation of the approved Stitch screen
   "מרכז השליחה - דסקטופ (Warm Romantic)".

   The screen exists because the sender reported everything it did into a
   server log nobody opens. Twice this month a silent stoppage went unnoticed
   for two days while 55 guests sat with no invitation and every other admin
   screen reported a healthy system.

   Three things it must make impossible to miss, in this order of severity:
     1. a run that did not happen at all — the one failure the sender itself
        can never report, because a scheduler that does not fire writes nothing
     2. a run that happened and sent nothing, and why
     3. guests the automation has permanently given up on, by name

   Every error is translated. The operator never sees 130472; they see "הנמען
   בקבוצת ניסוי של מטא — צריך שליחה מטלפון אישי" and a phone button. */

const C = {
  ivory: "#FDFAF5", page: "#F6F3EE", cream: "#F6F1E8", gold: "#C5A46D",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)", faint: "rgba(28,16,8,0.38)",
  border: "#E8E0D4", green: "#4A7C59", greenBg: "rgba(74,124,89,0.10)",
  red: "#B4453C", redBg: "rgba(180,69,60,0.09)", neutral: "#E7E2D9",
};

/* Supplied by the API, which reads it from the same constant the sender uses.
   This was [10, 15] hardcoded and was wrong within the hour — the schedule
   moved to the evening the same afternoon, and the empty state went on
   promising a 10:00 run that no longer existed. */
const FALLBACK_HOURS = [10, 19];
const GRACE_MIN = 45;

interface Run {
  id: string; created_at: string;
  sent: number; failed: number; healed: number;
  reason: string | null; stopped: string | null;
  cap: number | null; quality: string | null; posture: string | null;
  window_used: number | null;
  details: { sent?: string[]; failed?: { name: string; error: string }[] } | null;
}
interface Next {
  event: string | null; firstContact: number; reminders: number;
  windowUsed: number; cap: number | null; remaining: number | null;
}
interface Human { id: string; name: string; phone: string | null; why: string }
interface Data {
  runs: Run[]; next: Next | null; needsHuman: Human[];
  available: boolean; note?: string; schedule?: number[];
}

/* A run's outcome, in the operator's language rather than the API's. A run
   that sent nothing on purpose must not look like a broken one — that
   distinction is most of the value of this screen. */
function outcome(r: Run): { label: string; tone: "ok" | "warn" | "idle" } {
  if (r.stopped) return { label: "נעצרה — המספר מוגבל", tone: "warn" };
  if (r.failed > 0 && r.sent > 0) return { label: "הושלמה עם כשלים", tone: "warn" };
  switch (r.reason) {
    case null: case undefined: return { label: "הושלם בהצלחה", tone: "ok" };
    case "window_full":
    case "budget_exhausted":       return { label: "מכסה מוצתה", tone: "idle" };
    case "outside_sending_hours":  return { label: "מחוץ לשעות שליחה", tone: "idle" };
    case "nothing_due":            return { label: "אין למי לשלוח", tone: "idle" };
    case "no_sendable_event":      return { label: "אין אירוע פעיל", tone: "idle" };
    case "run_too_soon":           return { label: "נחסמה — ריצה קודמת זה עתה", tone: "idle" };
    case "meta_blocked":           return { label: "מטא חוסמת", tone: "warn" };
    default:                       return { label: r.reason, tone: "idle" };
  }
}

const QUALITY: Record<string, { he: string; tone: "ok" | "warn" | "idle" }> = {
  GREEN:  { he: "גבוה",   tone: "ok" },
  YELLOW: { he: "יורד",   tone: "warn" },
  RED:    { he: "נמוך",   tone: "warn" },
};

/* The next scheduled hour that has not passed today, else the first tomorrow. */
function nextRunLabel(hours: number[]): string {
  const h = new Date().getHours();
  const up = [...hours].sort((a, b) => a - b).find(x => x > h);
  return `${String(up ?? hours[0]).padStart(2, "0")}:00`;
}

const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
const dayLabel = (iso: string) => {
  const d = new Date(iso), now = new Date();
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, now)) return "";
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (same(d, y)) return "אתמול ";
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "short" }) + " ";
};

/* Which scheduled run should already have happened today and has not.
   Computed from the clock rather than from a flag, because the failure being
   detected is precisely that nothing wrote a flag. */
function missedRun(runs: Run[], hours: number[]): string | null {
  const now = new Date();
  const todayRuns = runs.filter(r => new Date(r.created_at).toDateString() === now.toDateString());
  for (const h of hours) {
    const due = new Date(now); due.setHours(h, GRACE_MIN, 0, 0);
    if (now < due) continue;
    const ran = todayRuns.some(r => {
      const t = new Date(r.created_at);
      return t.getHours() >= h && t.getHours() < h + 2;
    });
    if (!ran) return `${String(h).padStart(2, "0")}:00`;
  }
  return null;
}

export default function SendingCentre() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/wa-runs?limit=30", {
        signal: AbortSignal.timeout(15_000), cache: "no-store",
      });
      if (!r.ok) { setErr("לא הצלחנו לטעון את נתוני השליחה"); return; }
      setData(await r.json()); setErr(null);
    } catch { setErr("לא הצלחנו לטעון את נתוני השליחה"); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) =>
    setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const runs = data?.runs ?? [];
  const latest = runs[0];
  const q = QUALITY[latest?.quality ?? ""] ?? null;
  const hours = data?.schedule?.length ? data.schedule : FALLBACK_HOURS;
  const missed = runs.length ? missedRun(runs, hours) : null;
  const nx = data?.next ?? null;
  const humans = data?.needsHuman ?? [];

  const card: React.CSSProperties = {
    background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
  };
  const h2: React.CSSProperties = {
    fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 800,
    fontSize: 18, color: C.dark, margin: 0,
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.page, padding: "28px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h1 style={{ ...h2, fontSize: 30 }}>מרכז השליחה</h1>
          <button
            onClick={load} disabled={busy}
            aria-label="רענון"
            style={{
              display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 16px",
              background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12,
              color: C.muted, fontSize: 14, cursor: busy ? "default" : "pointer",
            }}
          >
            <RefreshCw size={15} style={{ animation: busy ? "spin 1s linear infinite" : undefined }} />
            רענון
          </button>
        </div>

        {/* ── health strip ─────────────────────────────────────────── */}
        <div style={{
          ...card, display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20, padding: "18px 24px", marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, flexWrap: "wrap" }}>
            <Stat
              icon={<span style={{
                width: 9, height: 9, borderRadius: 99, display: "inline-block",
                background: missed ? C.red : latest?.posture === "blocked" ? C.red : C.green,
              }} />}
              label="סטטוס מערכת"
              value={missed ? "דורש בדיקה" : latest?.posture === "blocked" ? "חסום" : "תקין"}
              tone={missed || latest?.posture === "blocked" ? "warn" : "ok"}
            />
            {q && (
              <Stat
                icon={<CheckCircle2 size={16} color={q.tone === "ok" ? C.green : C.red} />}
                label="דירוג איכות Meta" value={q.he} tone={q.tone}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Box label="מכסה יומית" value={nx?.cap ?? latest?.cap ?? "—"} />
            <Box label="נותרו להיום" value={nx?.remaining ?? "—"} accent />
          </div>
        </div>

        {/* ── missed run — the highest-severity element on the screen ── */}
        {missed && (
          <div style={{
            background: C.redBg, borderRight: `4px solid ${C.red}`, borderRadius: 12,
            padding: "16px 20px", marginBottom: 16,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <AlertTriangle size={20} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: C.red, fontSize: 15 }}>
                ריצת {missed} לא התבצעה
              </p>
              <p style={{ margin: "4px 0 0", color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>
                המתזמן היה אמור לפעול ולא נרשמה שום הרצה. אורחים לא קיבלו הזמנות בזמן הזה —
                בדקו את התזמון ב-Vercel, או המתינו לריצה הבאה.
              </p>
            </div>
          </div>
        )}

        {err && (
          <div style={{ ...card, padding: 20, marginBottom: 16, color: C.muted, fontSize: 14 }}>
            {err}
          </div>
        )}

        {data && !data.available && (
          <div style={{ ...card, padding: 20, marginBottom: 16, color: C.muted, fontSize: 14 }}>
            {data.note}
          </div>
        )}

        {/* ── two columns ─────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,2fr) minmax(280px,1fr)", gap: 16, alignItems: "start" }}>

          {/* history */}
          <div style={{ ...card, padding: "20px 22px" }}>
            <h2 style={{ ...h2, marginBottom: 16 }}>היסטוריית שליחות</h2>

            {!runs.length && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Sparkles size={26} color={C.gold} />
                <p style={{ margin: "12px 0 4px", fontWeight: 700, color: C.dark, fontSize: 15 }}>
                  עוד לא נרשמה אף הרצה
                </p>
                <p style={{ margin: 0, color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>
                  הרישום פעיל. {`ההרצה הבאה מתוזמנת ל-${nextRunLabel(hours)} ותופיע כאן אוטומטית.`}
                </p>
              </div>
            )}

            {runs.map(r => {
              const o = outcome(r);
              const isOpen = open.has(r.id);
              const fails = r.details?.failed ?? [];
              const sentNames = r.details?.sent ?? [];
              const expandable = fails.length > 0 || sentNames.length > 0;
              return (
                <div key={r.id} style={{
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  marginBottom: 10, overflow: "hidden",
                }}>
                  <button
                    onClick={() => expandable && toggle(r.id)}
                    style={{
                      width: "100%", minHeight: 44, background: "#fff", border: "none",
                      padding: "14px 16px", textAlign: "right",
                      cursor: expandable ? "pointer" : "default",
                      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontWeight: 800, color: C.dark, fontSize: 15, direction: "ltr" }}>
                      {dayLabel(r.created_at)}{hhmm(r.created_at)}
                    </span>
                    <span style={{ color: C.muted, fontSize: 14, flex: 1, minWidth: 120 }}>
                      {nx?.event ? `סבב אישורי הגעה — ${nx.event}` : "סבב שליחה"}
                    </span>
                    <Pill tone={o.tone}>{o.label}</Pill>
                    {expandable && (isOpen
                      ? <ChevronUp size={16} color={C.faint} />
                      : <ChevronDown size={16} color={C.faint} />)}
                  </button>

                  <div style={{
                    display: "flex", gap: 18, flexWrap: "wrap",
                    padding: "0 16px 14px", fontSize: 13.5,
                  }}>
                    <Metric icon={<Send size={13} />} label="נשלחו" n={r.sent} tone="ok" />
                    <Metric icon={<XCircle size={13} />} label="נכשלו" n={r.failed} tone={r.failed ? "warn" : "idle"} />
                    {r.healed > 0 &&
                      <Metric icon={<Sparkles size={13} />} label="תוקנו" n={r.healed} tone="idle" />}
                  </div>

                  {isOpen && (
                    <div style={{ background: C.page, borderTop: `1px solid ${C.border}`, padding: "14px 16px" }}>
                      {fails.length > 0 && (
                        <>
                          <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 13, color: C.dark }}>
                            פרטי שגיאות
                          </p>
                          {fails.map((f, i) => (
                            <div key={i} style={{
                              display: "flex", alignItems: "center", gap: 12,
                              background: "#fff", border: `1px solid ${C.border}`,
                              borderRadius: 10, padding: "10px 12px", marginBottom: 8,
                            }}>
                              <span style={{
                                width: 32, height: 32, borderRadius: 99, flexShrink: 0,
                                background: C.cream, color: C.gold, fontSize: 12, fontWeight: 800,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>{f.name.slice(0, 2)}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: C.dark }}>{f.name}</p>
                                <p style={{ margin: 0, fontSize: 12.5, color: C.muted }}>{f.error}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {sentNames.length > 0 && (
                        <p style={{ margin: fails.length ? "10px 0 0" : 0, fontSize: 12.5, color: C.muted, lineHeight: 1.8 }}>
                          <b style={{ color: C.dark }}>נשלחו אל: </b>{sentNames.join(" · ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* right rail */}
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ ...card, padding: "20px 22px" }}>
              <h2 style={{ ...h2, marginBottom: 16 }}>תמונת מצב קמפיין</h2>
              <Row label="לא קיבלו כלום" n={nx?.firstContact ?? 0} strong />
              <Row label="קיבלו ולא ענו" n={nx?.reminders ?? 0} />
              <Row label="ממתינים במכסה" n={nx?.remaining ?? 0} last />
              <p style={{ margin: "14px 0 0", fontSize: 12.5, color: C.muted, lineHeight: 1.7 }}>
                הסבב שולח קודם למי שלא קיבל כלום. תזכורות יוצאות רק כשהקבוצה
                הראשונה מתרוקנת.
              </p>
            </div>

            <div style={{ ...card, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <AlertTriangle size={16} color={C.red} />
                <h2 style={h2}>דורש טיפול אנושי</h2>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                אורחים שהאוטומציה לא תוכל להגיע אליהם לעולם.
              </p>
              {!humans.length && (
                <p style={{ margin: 0, fontSize: 13, color: C.green }}>אין כרגע — הכול מטופל 🤍</p>
              )}
              {humans.map(h => (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0", borderTop: `1px solid ${C.border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: C.dark }}>{h.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{h.why}</p>
                  </div>
                  {h.phone && (
                    <a
                      href={`tel:${h.phone}`}
                      aria-label={`התקשרו אל ${h.name}`}
                      style={{
                        minWidth: 44, minHeight: 44, borderRadius: 12, flexShrink: 0,
                        background: C.cream, color: C.gold,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    ><Phone size={16} /></a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ── small pieces ─────────────────────────────────────────────── */

function Stat({ icon, label, value, tone }: {
  icon: React.ReactNode; label: string; value: string; tone: "ok" | "warn" | "idle";
}) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
      {icon}
      <span style={{ color: C.muted }}>{label}:</span>
      <b style={{ color: tone === "warn" ? C.red : C.dark }}>{value}</b>
    </span>
  );
}

function Box({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? C.cream : C.page, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "10px 20px", textAlign: "center", minWidth: 104,
    }}>
      <p style={{ margin: 0, fontSize: 11.5, color: C.muted }}>{label}</p>
      <p style={{
        margin: 0, fontFamily: "'Frank Ruhl Libre', serif", fontWeight: 800,
        fontSize: 24, color: accent ? C.gold : C.dark, direction: "ltr",
      }}>{value}</p>
    </div>
  );
}

/* Status is never carried by colour alone — always colour plus label. */
function Pill({ tone, children }: { tone: "ok" | "warn" | "idle"; children: React.ReactNode }) {
  const s = tone === "ok"   ? { bg: C.greenBg, fg: C.green }
          : tone === "warn" ? { bg: C.redBg,   fg: C.red }
          :                   { bg: C.neutral, fg: C.muted };
  return (
    <span style={{
      background: s.bg, color: s.fg, borderRadius: 99,
      padding: "5px 12px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Metric({ icon, label, n, tone }: {
  icon: React.ReactNode; label: string; n: number; tone: "ok" | "warn" | "idle";
}) {
  const fg = tone === "ok" ? C.green : tone === "warn" ? C.red : C.muted;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, color: fg }}>
      {icon}<span style={{ color: C.muted }}>{label}:</span>
      <b style={{ color: fg, direction: "ltr" }}>{n}</b>
    </span>
  );
}

function Row({ label, n, strong, last }: {
  label: string; n: number; strong?: boolean; last?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0", borderBottom: last ? "none" : `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 13.5, color: strong ? C.dark : C.muted, fontWeight: strong ? 700 : 400 }}>
        {label}
      </span>
      <b style={{
        fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22,
        color: strong ? C.gold : C.dark, direction: "ltr",
      }}>{n}</b>
    </div>
  );
}
