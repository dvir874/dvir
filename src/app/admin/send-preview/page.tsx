"use client";

import { useCallback, useEffect, useState } from "react";

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

type NextRun = { event: string; approx: number; why: string };
type Tpl = { name: string; status: string; body: string | null; vars: number | null; ok: boolean };
type Health = { tier: string; quality: string; capped: boolean };
type Today = {
  runsDone: number; runsLeft: number; upcoming: string[];
  sent: number;
  perRun: {
    at: string; sent: number; counted: number; reason: string | null;
    messages: {
      label: string; kind: string; count: number;
      template: string | null; status: string | null; category: string | null;
      event?: string; rendered: string | null;
    }[];
  }[];
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
  const [data, setData] = useState<{ events: Ev[]; nextRun?: NextRun | null; templates?: { invite: Tpl | null; reminder: Tpl | null }; today?: Today; health?: Health | null } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ids, setIds] = useState<Record<string, string | null>>({});

  const load = useCallback(() => {
    fetch("/api/admin/send-preview")
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 401 ? "צריך להתחבר לאדמין" : `שגיאה ${r.status}`)))
      .then(setData)
      .catch(e => setErr(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  /* השהיה נכתבת לפי מזהה אירוע, והתצוגה המקדימה מחזירה שם בלבד — היא נבנתה
     כדי להיקרא, לא כדי ללחוץ עליה. השמות נפתרים מרשימת האירועים במקום להרחיב
     את המבנה של /api/admin/send-preview.

     שני אירועים עתידיים באותו שם נשמרים כ-null: אין דרך בטוחה לדעת על מי
     לוחצים, ולהשהות את החתונה הלא נכונה גרוע מלא להציג כפתור. אותו סינון
     תאריך כמו התצוגה המקדימה, כדי שאירוע שעבר לא יחסום שם של אירוע קרוב. */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    fetch("/api/events")
      .then(r => r.ok ? r.json() : [])
      .then((rows: { id: string; name: string; date: string }[]) => {
        const byName: Record<string, string | null> = {};
        for (const r of rows ?? []) {
          if (!r.date || r.date < today) continue;
          byName[r.name] = r.name in byName ? null : r.id;
        }
        setIds(byName);
      })
      .catch(() => { /* בלי המזהים פשוט אין כפתור השהיה — התצוגה עצמה עובדת */ });
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

        {/* Which wedding wins the next run — the question the cards below do not
            answer. They say each event COULD send; the cron serves one per run,
            the nearest with pending guests, so a ✅ card can wait days behind a
            closer wedding. Twice I told Dvir a run would go to תהל ואביב and
            twice it went to שחר, who sits between them by date. */}
        {/* Meta's tier, and a loud line when our own override has become the
            ceiling. TIER_250 with WA_CAP_OVERRIDE=250 costs nothing; the day
            Meta grants TIER_1000 those stop being the same number and the
            upgrade arrives with nothing to show for it. */}
        {data?.health && (
          <div style={{
            background: data.health.capped ? "rgba(197,164,109,0.12)" : T.card,
            border: `1.5px solid ${data.health.capped ? T.gold : T.border}`,
            borderRadius: 14, padding: "12px 18px", marginBottom: 14, textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 13.5, color: T.dark }}>
              Meta: <strong>{data.health.tier.replace("TIER_", "")}</strong> ליום ·{" "}
              איכות <strong style={{ color: data.health.quality === "GREEN" ? T.olive : T.alert }}>
                {data.health.quality}
              </strong>
            </p>
            {data.health.capped && (
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: T.gold, fontWeight: 700 }}>
                ⬆ Meta העלתה את המדרגה — צריך להעלות את WA_CAP_OVERRIDE ולעשות Redeploy
              </p>
            )}
          </div>
        )}

        {/* The day at a glance — runs fired, runs left, messages out.
            Answering it meant reading wa_runs by hand every time. */}
        {data?.today && (
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "14px 18px", marginBottom: 14,
          }}>
            <p style={{ margin: 0, fontSize: 14, color: T.dark, textAlign: "center" }}>
              היום: <strong>{data.today.runsDone}</strong> ריצות ·{" "}
              <span style={{ color: T.gold, fontWeight: 800 }}>{data.today.sent}</span> הודעות ·{" "}
              עוד <strong>{data.today.runsLeft}</strong> ריצות
            </p>
            {data.today.perRun.length > 0 && (
              <p style={{ margin: "7px 0 0", fontSize: 11.5, color: T.muted, textAlign: "center" }}>
                {data.today.perRun.map(r => `${r.at} → ${r.sent}`).join("  ·  ")}
              </p>
            )}
            {data.today.upcoming.length > 0 && (
              <p style={{ margin: "4px 0 0", fontSize: 11.5, color: T.muted, textAlign: "center" }}>
                נותרו היום: {data.today.upcoming.join(" · ")}
              </p>
            )}

            {/* מה נשלח בפועל — להבדיל מכל השאר במסך, שמראה מה יישלח.
                נשאל ב-21:50 "איזו הודעה נשלחה עכשיו?", והמסך הציג את ההזמנה
                בזמן שכל מה שיצא היה תבנית "מחר מתחתנים". סגור כברירת מחדל
                כדי שהשורה העליונה תישאר מה שהיא. */}
            {data.today.perRun.some(r => r.messages.length > 0) && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ fontSize: 12, color: T.gold, cursor: "pointer",
                                  textAlign: "center", fontWeight: 700 }}>
                  מה נשלח בפועל בכל ריצה
                </summary>
                {/* אין עמודה ששומרת שם תבנית לכל הודעה, אז השם נגזר מהתצורה
                    הנוכחית לפי סוג ההודעה. הסוג עצמו נשמר בזמן השליחה ולכן
                    מדויק. אם תבנית הוחלפה במהלך היום — הודעות שיצאו לפני
                    ההחלפה יוצגו עם השם החדש, וזה נאמר כאן ולא מוסתר. */}
                <p style={{ fontSize: 11, color: T.muted, textAlign: "center",
                            margin: "6px 0 0", lineHeight: 1.6 }}>
                  סוג ההודעה נשמר בזמן השליחה. שם התבנית נגזר מההגדרה הנוכחית —
                  אם החלפת תבנית היום, הודעות מוקדמות יוצגו עם השם החדש.
                </p>

                {data.today.perRun.filter(r => r.messages.length > 0).slice().reverse().map(r => (
                  <div key={r.at} style={{ marginTop: 12, paddingTop: 10,
                                           borderTop: `1px solid ${T.border}` }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 800, color: T.dark }}>
                      {r.at} · {r.counted} הודעות
                      {r.counted !== r.sent && (
                        <span style={{ fontWeight: 500, color: T.muted, fontSize: 11 }}>
                          {"  "}(הריצה דיווחה {r.sent} — היא לא סופרת את "מחר מתחתנים")
                        </span>
                      )}
                    </p>

                    {r.messages.map((m, i) => (
                      <div key={i} style={{ marginTop: 8 }}>
                        <p style={{ margin: 0, fontSize: 12.5, color: T.dark }}>
                          <strong>{m.label}</strong> · {m.count}
                          {m.event ? ` · ${m.event}` : ""}
                        </p>
                        {m.template && (
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: T.muted }} dir="ltr">
                            {m.template}
                            {m.status ? ` · ${m.status}` : ""}
                            {m.category ? ` · ${m.category}` : ""}
                          </p>
                        )}
                        {m.rendered && (
                          <p style={{
                            margin: "6px 0 0", fontSize: 12, color: "#111B21",
                            background: "#fff", border: `1px solid ${T.border}`,
                            borderRadius: 10, padding: "10px 12px",
                            whiteSpace: "pre-wrap", direction: "rtl", lineHeight: 1.65,
                          }}>{m.rendered}</p>
                        )}
                        {!m.template && (
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: T.muted }}>
                            לא תבנית — טקסט חופשי
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </details>
            )}
          </div>
        )}

        {/* The two templates, and whether each can actually send.
            On 17/08 the reminder template had zero variables while the code sent
            four; fifty-three of Dvir's own reminders failed on #132000 and this
            screen — built to show what will be sent — was silent, because it
            only ever looked at the invitation. */}
        {data?.templates && (
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            {([["הזמנה", data.templates.invite], ["תזכורת", data.templates.reminder]] as const).map(([label, t]) => (
              <div key={label} style={{
                flex: "1 1 220px", background: T.card, borderRadius: 12, padding: "11px 14px",
                border: `1.5px solid ${t?.ok ? T.border : T.alert}`,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: t?.ok ? T.dark : T.alert }}>
                  {t?.ok ? "✓" : "✕"} תבנית {label}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 3, wordBreak: "break-all" }}>
                  {t?.name ?? "—"}
                </div>
                <div style={{ fontSize: 11, color: t?.ok ? T.muted : T.alert, marginTop: 2 }}>
                  {t ? `${t.status} · ${t.vars} משתנים${t.ok ? "" : " — הקוד שולח 4, השליחה תיכשל"}` : "לא נבדקה"}
                </div>
              </div>
            ))}
          </div>
        )}

        {data?.nextRun && (
          <div style={{
            background: T.card, border: `1.5px solid ${T.gold}`, borderRadius: 14,
            padding: "14px 18px", marginBottom: 22, textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 15, color: T.dark }}>
              הריצה הבאה: <strong>{data.nextRun.event}</strong>
              {"  ·  "}
              <span style={{ color: T.gold, fontWeight: 800 }}>~{data.nextRun.approx}</span> הודעות
            </p>
            <p style={{ margin: "5px 0 0", fontSize: 11.5, color: T.muted }}>
              {data.nextRun.why}
            </p>
          </div>
        )}
        {data && !data.nextRun && (
          <Note tone="muted">אף אירוע לא ישלח בריצה הבאה — כולם מושהים, חסומים או ללא ממתינים</Note>
        )}

        {err && <Note tone="alert">{err}</Note>}
        {!data && !err && <Note tone="muted">טוען…</Note>}
        {data?.events.length === 0 && <Note tone="muted">אין אירועים קרובים</Note>}

        {data?.events.map(ev => (
          <Card key={ev.event} ev={ev} eventId={ids[ev.event] ?? null} onChanged={load} />
        ))}
      </div>
    </div>
  );
}

function Card({ ev, eventId, onChanged }: { ev: Ev; eventId: string | null; onChanged: () => void }) {
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
        {eventId && <PauseControl eventId={eventId} paused={paused} onChanged={onChanged} />}
      </div>
    </article>
  );
}

/* השהיה — הכתיבה היחידה במוצר ל-send_paused_until.
 *
 * הקרון קורא את השדה מאז 14/08 והשורה שמעל כבר הציגה אותו, אבל שום מסך לא ידע
 * לכתוב אליו: להחזיק את החתונה של דביר (24/08) בצד כדי ש-327 ההזמנות של שחר
 * יצאו במוצ״ש ובראשון היה אפשרי רק ב-SQL ידני — בדיוק הדבר שנשכח ב-21:00 בליל
 * שבת, שזו הסיבה שהעמודה נוספה מלכתחילה.
 *
 * תאריכים מוכנים ולא שדה תאריך: ההחלטה האמיתית היא "לא הערב" או "לא עד יום
 * שני", לא חותמת זמן שצריך לחשב. */
function PauseControl({ eventId, paused, onChanged }: { eventId: string; paused: boolean; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function save(until: string | null) {
    setBusy(true);
    setFailed(false);
    try {
      const r = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ send_paused_until: until }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setOpen(false);
      onChanged();
    } catch {
      /* לא משנים את התצוגה מקומית — עדיף להראות "לא נשמר" מאשר להראות מושהה
         בזמן שהקרון עדיין מתכוון לשלוח. */
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const link = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: "none", border: "none", padding: 0, fontFamily: "inherit",
    fontSize: 11.5, fontWeight: 700, color: T.gold,
    cursor: busy ? "default" : "pointer", opacity: busy ? 0.5 : 1, ...extra,
  });

  return (
    <span style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 12 }}>
      {failed && <span style={{ color: T.alert }}>לא נשמר</span>}
      {paused ? (
        <button type="button" disabled={busy} onClick={() => save(null)} style={link({ color: T.olive })}>
          חידוש שליחה
        </button>
      ) : open ? (
        <>
          <button type="button" disabled={busy} onClick={() => save(morningAfter(1))} style={link()}>
            עד מחר בבוקר
          </button>
          <button type="button" disabled={busy} onClick={() => save(morningAfter(2))} style={link()}>
            עד מחרתיים
          </button>
          <button type="button" disabled={busy} onClick={() => setOpen(false)} style={link({ color: T.muted, fontWeight: 400 })}>
            ביטול
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setOpen(true)} style={link()}>
          השהיית שליחה
        </button>
      )}
    </span>
  );
}

/* 08:00 מקומי ביום המבוקש, ולא "עוד 24 שעות": ריצת הבוקר הראשונה של השולח היא
   09:00 בארץ, כך ש"עד מחר בבוקר" מחזיר את האירוע כבר בריצה הראשונה של מחר
   ולא יום שלם אחריה. */
function morningAfter(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
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
