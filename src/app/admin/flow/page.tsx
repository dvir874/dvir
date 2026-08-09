"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, RefreshCw, Check, Circle, AlertTriangle } from "lucide-react";

/* The run-an-event screen.

   The admin had grown to two dozen tools with no order between them, so the
   question "what do I do next?" had no answer. This screen is that answer:
   every stage from first enquiry to after the wedding, each one explaining
   what it is and carrying the single button that performs it.

   Status is computed from the data, never ticked by hand — a checklist you
   can lie to is worse than none. */

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4",
  green: "#4A7C59", red: "#B4453C", amber: "#B8860B",
};

const DVIR_EVENT_ID = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";

interface EventRow {
  id: string; name: string; date: string | null; hasImage: boolean;
  daysToEvent: number | null; total: number; confirmed: number;
  pending: number; responseRate: number;
}

interface Flow {
  event: { id: string; name: string; date: string | null; address: string | null;
           hasImage: boolean; imageUrl: string | null; coupleToken: string | null;
           reportCode: string; daysToEvent: number | null };
  counts: { guests: number; withPhone: number; missingPhone: number; sent: number;
            unsent: number; failed: number; opened: number; answered: number;
            confirmed: number; pending: number; responseRate: number };
  ready: { details: boolean; image: boolean; guests: boolean; phones: boolean;
           previewable: boolean; canSend: boolean };
  sampleToken: string | null;
}

type State = "done" | "now" | "todo" | "warn";

interface Step {
  n: number;
  title: string;
  what: string;
  state: State;
  detail?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

function Flow() {
  const eventId = useSearchParams().get("event") ?? DVIR_EVENT_ID;
  const [d, setD] = useState<Flow | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/event-flow?event_id=${eventId}`);
    if (r.ok) { setD(await r.json()); setErr(null); }
    else setErr("לא ניתן לטעון את האירוע");
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  /* Every event, so switching weddings is one click rather than a URL edit */
  useEffect(() => {
    fetch("/api/admin/events-list")
      .then(r => r.ok ? r.json() : { events: [] })
      .then(j => setEvents(j.events ?? []))
      .catch(() => {});
  }, []);

  if (err) return <Shell><p style={{ color: C.red, padding: 30 }}>{err}</p></Shell>;
  if (!d)  return <Shell><p style={{ color: C.muted, padding: 30 }}>טוען…</p></Shell>;

  const { event: e, counts: c, ready: r } = d;
  const base = `/admin`;

  const steps: Step[] = [
    {
      n: 1,
      title: "פנייה נכנסת",
      what: "זוג פונה בוואטסאפ. בונה ההצעות מחשב מחיר לפי מספר המוזמנים ומנסח הודעה מוכנה לשליחה — כולל מה בדיוק כלול.",
      state: "done",
      action: { label: "בונה הצעות מחיר", href: `${base}/quote` },
    },
    {
      n: 2,
      title: "פרטי האירוע",
      what: "שם הזוג, תאריך ומקום. שלושת אלה נכנסים לתוך גוף הודעת הוואטסאפ שכל אורח מקבל — בלעדיהם השליחה נעצרת.",
      state: r.details ? "done" : "now",
      detail: r.details
        ? `${e.name} · ${e.date ? new Date(e.date).toLocaleDateString("he-IL") : ""} · ${e.address ?? ""}`
        : "חסרים שם / תאריך / מקום",
      action: { label: "עריכת האירוע", href: `${base}?event=${e.id}` },
    },
    {
      n: 3,
      title: "תמונת ההזמנה",
      what: "התמונה שמופיעה בראש הודעת הוואטסאפ. זו ההזמנה של הזוג — בלעדיה המערכת מסרבת לשלוח, כדי שלא תצא הזמנה של זוג אחר.",
      state: r.image ? "done" : r.details ? "now" : "todo",
      detail: r.image ? "הוגדרה ✓" : "טרם הוגדרה",
      action: { label: "העלאת תמונת הזמנה", href: `${base}/event-image?event=${e.id}` },
    },
    {
      n: 4,
      title: "רשימת המוזמנים",
      what: "מעלים אקסל עם שם / טלפון / כמות אורחים. המערכת מנרמלת כל מספר לפורמט אחד, מזהה כפילויות, ומראה בדיוק מה נדחה ולמה — לפני שמייבאים.",
      state: !r.guests ? (r.image ? "now" : "todo")
           : c.missingPhone > 0 ? "warn" : "done",
      detail: !r.guests ? "אין עדיין מוזמנים"
            : c.missingPhone > 0 ? `${c.guests} מוזמנים · ${c.missingPhone} ללא טלפון`
            : `${c.guests} מוזמנים · לכולם יש טלפון`,
      action: { label: "ייבוא רשימה", href: `${base}/guests-import?event=${e.id}` },
    },
    {
      n: 5,
      title: "בדיקה לפני שליחה",
      what: "פותחים קישור של אורח אמיתי ורואים בדיוק מה הוא יראה. זה גם הקישור שמראים לזוג לאישור — אחרי ששולחים אי אפשר להחזיר.",
      state: r.previewable ? (c.sent > 0 ? "done" : "now") : "todo",
      detail: d.sampleToken ? "מוכן לבדיקה" : "צריך רשימת מוזמנים",
      action: d.sampleToken
        ? { label: "פתיחת קישור לדוגמה", href: `/rsvp/${d.sampleToken}` }
        : undefined,
    },
    {
      n: 6,
      title: "שליחת ההזמנות",
      what: "כל אורח מקבל את ההזמנה עם קישור אישי. השליחה מווסתת בכוונה — הודעה כל 3 שניות, ואם וואטסאפ מאט אנחנו ממתינים עד 2 דקות ומנסים שוב. עדיף שייקח זמן מאשר שהודעה תיחסם. מגבלה: 250 ליממה.",
      state: !r.canSend ? "todo" : c.unsent === 0 ? "done" : c.sent > 0 ? "warn" : "now",
      detail: !r.canSend ? "חסרים פרטי אירוע או תמונה"
            : c.unsent === 0 ? `כל ${c.sent} המוזמנים קיבלו`
            : `${c.sent} נשלחו · ${c.unsent} נותרו · כ-${Math.max(1, Math.round(c.unsent * 3 / 60))} דקות שליחה`
              + (c.guests > 250 ? ` · ${Math.ceil(c.guests / 250)} ימים בשל מגבלת וואטסאפ` : ""),
      action: { label: "תחנת השליחה", href: `${base}/send?event=${e.id}` },
    },
    {
      n: 7,
      title: "מי באמת קיבל",
      what: "וואטסאפ מדווח על כל הודעה: נמסרה, נקראה או נכשלה — ולמה. מכאן שולחים שוב למי שנכשל, בלחיצה.",
      state: c.sent === 0 ? "todo" : c.failed > 0 ? "warn" : "done",
      detail: c.sent === 0 ? "עוד לא נשלח"
            : c.failed > 0 ? `⚠️ ${c.failed} נכשלו — דורש טיפול`
            : "כל ההודעות נמסרו",
      action: { label: "מצב מסירה", href: `${base}/delivery?event=${e.id}` },
    },
    {
      n: 8,
      title: "דוח חי לזוג",
      what: "קישור לקריאה בלבד שהזוג מקבל — מי אישר, מי סירב, מי ממתין, פילוח לפי צד, ייצוא לאקסל. מתעדכן לבד, בלי שתצטרך לשלוח דוחות.",
      state: c.sent > 0 ? "done" : "todo",
      detail: `${c.confirmed} אישרו · ${c.pending} ממתינים · ${c.responseRate}% מענה`,
      action: { label: "פתיחת הדוח", href: `/report/${e.reportCode}` },
    },
    {
      n: 9,
      title: "מענה לאורחים",
      what: "אורח שמשיב להודעה מגיע לתיבה כאן, ואתה עונה מהמספר העסקי — לא מהוואטסאפ האישי שלך.",
      state: c.sent > 0 ? "done" : "todo",
      action: { label: "תיבת הודעות", href: `${base}/inbox?event=${e.id}` },
    },
    {
      n: 10,
      title: "תזכורת למי שלא ענה",
      what: "יומיים־שלושה אחרי ההזמנה, תזכורת רק למי שטרם ענה. מוקדם מדי נקרא כנודניקי ומוריד היענות.",
      state: c.pending === 0 && c.sent > 0 ? "done"
           : c.sent > 0 && c.responseRate < 80 ? "now" : "todo",
      detail: c.sent === 0 ? "אחרי השליחה"
            : `${c.pending} עדיין לא ענו`,
      action: { label: "שליחת תזכורת", href: `${base}/send?event=${e.id}` },
    },
    {
      n: 11,
      title: "יום לפני",
      what: "למי שאישר בלבד — שעה, מקום וניווט ישיר ב-Waze. זו הודעה תפעולית ולכן עולה 2 אגורות במקום 13.",
      state: e.daysToEvent !== null && e.daysToEvent <= 1 ? "now" : "todo",
      detail: e.daysToEvent !== null ? `עוד ${e.daysToEvent} ימים לאירוע` : undefined,
      action: { label: "תחנת השליחה", href: `${base}/send?event=${e.id}` },
    },
    {
      n: 12,
      title: "אחרי החתונה",
      what: "למי שסימן שרוצה — קישור לגלריה המשותפת להעלאת התמונות שצילם. זו גם ההודעה שמייצרת המלצות והפניות.",
      state: e.daysToEvent !== null && e.daysToEvent < 0 ? "now" : "todo",
      action: { label: "תחנת השליחה", href: `${base}/send?event=${e.id}` },
    },
  ];

  const badge = (s: State) => s === "done" ? { bg: "rgba(74,124,89,0.12)", fg: C.green, icon: <Check size={14} /> }
    : s === "now"  ? { bg: "rgba(197,164,109,0.18)", fg: C.goldT, icon: <Circle size={13} fill={C.goldT} /> }
    : s === "warn" ? { bg: "rgba(180,69,60,0.10)", fg: C.red, icon: <AlertTriangle size={14} /> }
    :                { bg: "rgba(28,16,8,0.05)", fg: C.muted, icon: <Circle size={13} /> };

  return (
    <Shell onRefresh={load} title={e.name}>
      {events.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {events.map(ev => {
            const on = ev.id === eventId;
            const soon = ev.daysToEvent !== null && ev.daysToEvent >= 0 && ev.daysToEvent <= 30;
            return (
              <a key={ev.id} href={`/admin/flow?event=${ev.id}`}
                style={{ padding: "9px 15px", borderRadius: 9999, textDecoration: "none",
                  border: `1.5px solid ${on ? C.gold : C.border}`,
                  background: on ? C.gold : "#fff", color: on ? "#fff" : C.dark,
                  fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                <span>{ev.name}</span>
                <span style={{ fontSize: 11.5, opacity: .8 }}>
                  {ev.total ? `${ev.confirmed}/${ev.total}` : "ריק"}
                  {soon ? ` · ${ev.daysToEvent}י׳` : ""}
                </span>
                {!ev.hasImage && <span title="חסרה תמונת הזמנה">⚠️</span>}
              </a>
            );
          })}
          <a href="/admin?new=1"
            style={{ padding: "9px 15px", borderRadius: 9999, textDecoration: "none",
              border: `1.5px dashed ${C.border}`, background: "#fff", color: C.goldT,
              fontSize: 13, fontWeight: 700 }}>+ אירוע חדש</a>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
        gap: 12, marginBottom: 22 }}>
        {[
          { k: "מוזמנים", v: c.guests },
          { k: "נשלחו", v: c.sent },
          { k: "אישרו", v: c.confirmed },
          { k: "מענה", v: `${c.responseRate}%` },
          ...(c.failed ? [{ k: "נכשלו", v: c.failed, red: true }] : []),
        ].map(x => (
          <div key={x.k} style={{ background: "#fff", border: `1px solid ${C.border}`,
            borderRadius: 14, padding: "13px 16px" }}>
            <div style={{ fontSize: 12, color: C.muted }}>{x.k}</div>
            <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 28, fontWeight: 800,
              color: (x as { red?: boolean }).red ? C.red : C.dark }}>{x.v}</div>
          </div>
        ))}
      </div>

      {steps.map(s => {
        const b = badge(s.state);
        return (
          <div key={s.n} style={{ background: "#fff", border: `1px solid ${s.state === "now" ? C.gold : C.border}`,
            borderRadius: 16, padding: "16px 18px", marginBottom: 12,
            display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: b.bg, color: b.fg, fontWeight: 700, fontSize: 13 }}>
              {s.state === "done" || s.state === "warn" ? b.icon : s.n}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17,
                  fontWeight: 700, color: C.dark }}>{s.title}</span>
                {s.state === "now" && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: C.gold,
                    padding: "2px 9px", borderRadius: 999 }}>עכשיו</span>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: C.muted, margin: "5px 0 0", lineHeight: 1.7 }}>
                {s.what}
              </p>
              {s.detail && (
                <p style={{ fontSize: 12.5, margin: "6px 0 0", fontWeight: 600,
                  color: s.state === "warn" ? C.red : s.state === "done" ? C.green : C.goldT }}>
                  {s.detail}
                </p>
              )}
            </div>

            {s.action && (
              <a href={s.action.href} target={s.action.href?.startsWith("/rsvp") || s.action.href?.startsWith("/report") ? "_blank" : undefined}
                style={{ flexShrink: 0, padding: "10px 16px", borderRadius: 10, textDecoration: "none",
                  fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "inherit",
                  background: s.state === "now" || s.state === "warn" ? C.gold : "#fff",
                  color: s.state === "now" || s.state === "warn" ? "#fff" : C.goldT,
                  border: `1.5px solid ${s.state === "now" || s.state === "warn" ? C.gold : C.border}` }}>
                {s.action.label}
              </a>
            )}
          </div>
        );
      })}
    </Shell>
  );
}

function Shell({ children, onRefresh, title }:
  { children: React.ReactNode; onRefresh?: () => void; title?: string }) {
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, color: C.dark,
      fontFamily: "Heebo, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
        <div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
            🧭 ניהול אירוע — שלב אחר שלב
          </h1>
          {title && <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{title}</p>}
        </div>
        {onRefresh && (
          <button onClick={onRefresh} style={{ marginRight: "auto", background: "none", border: "none",
            cursor: "pointer", color: C.muted, padding: 8 }}><RefreshCw size={16} /></button>
        )}
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: 16 }}>{children}</div>
    </div>
  );
}

export default function FlowPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען…</div>}>
      <Flow />
    </Suspense>
  );
}
