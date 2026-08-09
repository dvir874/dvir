"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, SkipForward, RotateCcw } from "lucide-react";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
};

interface Guest {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  rsvp_token: string | null;
  source_group?: string | null;
  category?: string | null;
}

/* Friendly labels for known guest groups (Dvir's wedding) */
const GROUP_LABELS: Record<string, string> = {
  dvir_list: "שלי",
  mirav_list: "של מירב",
  nitza_list: "של ניצה",
  horim_list: "של ההורים",
  horim_tveria: "של ההורים · טבריה 🚌",
};
interface EventInfo { id: string; name: string; address?: string | null; date?: string | null }

/* Shape returned by /api/admin/whatsapp/send (or an error we surface as-is) */
interface ApiSendResult {
  sent?: number;
  failed?: number;
  skipped?: number;
  details?: {
    sent?: string[];
    failed?: { name: string; error: string }[];
    skipped?: { name: string; reason: string }[];
  };
  error?: string;
}

type Filter = "all" | "pending" | "confirmed";

const TEMPLATES: { label: string; text: string }[] = [
  { label: "הזמנה + קישור RSVP", text: "💍 משפחה וחברים יקרים!\n\n[שם], הוזמנתם לחתונה של [אירוע]! 🎉\n\nלאישור הגעה לחצו:\n[קישור]\n\nמחכים לכם! 🤍" },
  { label: "תזכורת RSVP",        text: "💍 משפחה וחברים יקרים!\n\n[שם], עדיין לא קיבלנו את אישורכם לחתונה של [אירוע] 🙏\n\nלחצו לאישור מהיר:\n[קישור]" },
  { label: "מחר החתונה!",        text: "💍 משפחה וחברים יקרים!\n\n[שם], מחר זה קורה! 🎉\nהחתונה של [אירוע]\n\nמחכים לראותכם! 🤍" },
  { label: "תודה שהגעתם",        text: "💍 משפחה וחברים יקרים!\n\n[שם], תודה שהייתם חלק מהיום המיוחד שלנו! ❤️" },
  { label: "עדכון תאריך 📅",     text: "💍 משפחה וחברים יקרים!\n\n[שם], עדכון חשוב לגבי [אירוע]:\nהאירוע נדחה לתאריך חדש — [תאריך] 📅\n\nנשמח לדעת אם תוכלו להגיע במועד החדש:\n[קישור]\n\nתודה על ההבנה, מחכים לכם! 🤍" },
];

/* Dvir & Mirav's own wedding — approved message set (shown only for that event) */
const DVIR_EVENT_ID = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";
const WEDDING_TEMPLATES: { label: string; text: string }[] = [
  { label: "💌 הזמנה — האורחים שלי", text: "💍 משפחה וחברים יקרים!\n\nבעזרת ה׳ *דביר בן ברוך ומירב ברון* מתחתנים! 🤍\nוהם שמחים להזמין אתכם לחגוג איתם:\n\n🗓 יום שני, י״א אלול — 24.08.2026\n📍 אולמי גאיה, רחוב האומן 12, חדרה\n🥂 קבלת פנים 19:00 | חופה וקידושין 20:00\n\n👇 לחצו כאן לצפייה בהזמנה המלאה ואישור הגעה 👇\n[קישור]\n\nמחכים לחגוג איתכם ביום המאושר! 🤍\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "אישור — של מירב", text: "💍 משפחה וחברים יקרים!\n\nהיי, כאן מירב 🤍\nכמו שכבר ראיתם בהזמנה — דביר ואני מתחתנים בעז״ה ביום שני, י״א אלול, 24.08.2026 באולמי גאיה בחדרה!\n\nכדי שנוכל להיערך בצורה הכי טובה, אשמח שתלחצו על הקישור ותאשרו הגעה — לוקח פחות מדקה 👇\n[קישור]\n\nמחכה לראות אתכם! 🥂\nמירב & דביר\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "אישור — של ניצה", text: "💍 משפחה וחברים יקרים!\n\nבשמחה רבה אנו מזכירים — חתונתם של מירב ודביר תתקיים בעז״ה ביום שני, י״א אלול, 24.08.2026, באולמי גאיה בחדרה.\n\nנודה לכם מקרב לב אם תלחצו על הקישור ותאשרו את הגעתכם — הדבר יעזור לנו רבות בהיערכות לשמחה 👇\n[קישור]\n\nנשמח לראותכם!\nמשפחות ברון ובן ברוך\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "תזכורת — שבועיים לפני", text: "💍 משפחה וחברים יקרים!\n\nהחתונה של דביר ומירב כבר ממש קרובה — יום שני, י״א אלול, 24.08 באולמי גאיה, חדרה! 🤍\n\nשמנו לב שעדיין לא הספקתם לאשר הגעה — נשמח שתלחצו על הקישור ותקדישו רגע קטן, זה עוזר לנו מאוד להיערך 👇\n[קישור]\n\nמחכים לכם!\nדביר & מירב\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "מחר זה קורה + Waze", text: "💍 משפחה וחברים יקרים!\n\nמחר זה קורה! 🤍\nאנחנו מתרגשים לראות אתכם בחתונה שלנו:\n\n🗓 מחר, יום שני 24.08\n🥂 קבלת פנים 19:00 | חופה וקידושין 20:00\n📍 אולמי גאיה, האומן 12, חדרה\n\n🚗 ניווט ישיר ב-Waze:\nhttps://waze.com/ul?q=האומן%2012%20חדרה&navigate=yes\n\nנתראה מחר בשמחות!\nדביר & מירב\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "🚌 עדכון הסעה — של ההורים", text: "💍 משפחה וחברים יקרים!\n\nעדכון חשוב לקראת החתונה של דביר ומירב 🤍\n\n🚌 תתקיים הסעה מאורגנת מאזור טבריה לאולם וחזרה!\n\nמי שמעוניין במקום בהסעה — לחצו על הקישור, אשרו הגעה וסמנו שם שאתם מעוניינים בהסעה 👇\n[קישור]\n\nפרטים על שעת ונקודת האיסוף יישלחו בהמשך.\n\nנתראה בשמחות!\nמשפחת בן ברוך\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  /* Sent by a family helper from her own number — the opening line tells the
     guest who is writing, so an unknown number doesn't read as spam.
     Replace ○○○ with the sender's name once, then send to everyone. */
  { label: "👧 הזמנה — בשליחת בת משפחה", text: "💍 משפחה וחברים יקרים!\n\nכאן ○○○, האחיינית של דביר — שולחת בשמם 🤍\n\nבעזרת ה׳ *דביר בן ברוך ומירב ברון* מתחתנים,\nוהם שמחים להזמין אתכם לחגוג איתם!\n\n🗓 יום שני, י״א אלול — 24.08.2026\n📍 אולמי גאיה, רחוב האומן 12, חדרה\n🥂 קבלת פנים 19:00 | חופה וקידושין 20:00\n\n👇 לחצו כאן לצפייה בהזמנה המלאה ואישור הגעה 👇\n[קישור]\n\nמחכים לחגוג איתכם ביום המאושר שלהם! 🤍\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "👧 אישור הגעה — בשליחת בת משפחה", text: "💍 משפחה וחברים יקרים!\n\nכאן ○○○, האחיינית של דביר — שולחת בשמם של דביר ומירב 🤍\n\nכמו שכבר ראיתם בהזמנה — הם מתחתנים בעז״ה ביום שני, י״א אלול, 24.08.2026 באולמי גאיה בחדרה!\n\nכדי שיוכלו להיערך בצורה הכי טובה, אשמח שתלחצו על הקישור ותאשרו הגעה — לוקח פחות מדקה 👇\n[קישור]\n\nמחכים לראותכם! 🥂\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
  { label: "👧 תזכורת — בשליחת בת משפחה", text: "💍 משפחה וחברים יקרים!\n\nכאן ○○○, האחיינית של דביר 🤍\n\nהחתונה של דביר ומירב כבר ממש קרובה — יום שני, י״א אלול, 24.08 באולמי גאיה, חדרה!\n\nראינו שעדיין לא הספקתם לאשר הגעה — נשמח שתלחצו על הקישור ותקדישו רגע קטן, זה עוזר להם מאוד להיערך 👇\n[קישור]\n\nמחכים לכם!\n\n_(הודעה זו נשלחה באמצעות שירות רגע לפני)_" },
];

function SendStation() {
  const params = useSearchParams();
  const eventId = params.get("event") ?? "";

  const isDvirEvent = eventId === DVIR_EVENT_ID;
  const templateList = isDvirEvent ? [...WEDDING_TEMPLATES, ...TEMPLATES] : TEMPLATES;

  const [event, setEvent]   = useState<EventInfo | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [group,  setGroup]  = useState<string>("all");
  const [template, setTemplate] = useState(templateList[0].text);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [apiBusy, setApiBusy] = useState(false);
  const [apiResult, setApiResult] = useState<ApiSendResult | null>(null);

  const LS_KEY = `send_station_${eventId}`;

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/guests?event_id=${eventId}`).then(r => r.ok ? r.json() : []),
      /* Server-side record, so "sent" survives across devices and also covers
         messages sent outside this screen. Falls back to local-only on error. */
      fetch(`/api/admin/guests-sent?event_id=${eventId}`).then(r => r.ok ? r.json() : { sent: [] }),
    ]).then(([ev, gs, sentRes]) => {
      if (ev) setEvent(ev);
      if (Array.isArray(gs)) setGuests(gs);
      const merged = new Set<string>(Array.isArray(sentRes?.sent) ? sentRes.sent : []);
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
        if (Array.isArray(saved)) saved.forEach((id: string) => merged.add(id));
      } catch {}
      setSentIds(merged);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId, LS_KEY]);

  /* Distinct guest groups (for the group filter chips) — demo guests excluded */
  const groups = useMemo(() => {
    const s = new Set<string>();
    guests.forEach(g => { if (g.source_group && g.category !== "demo") s.add(g.source_group); });
    return [...s];
  }, [guests]);

  const eligible = useMemo(() => guests.filter(g => {
    if (!g.phone) return false;
    if (g.category === "demo") return false;
    if (group !== "all" && g.source_group !== group) return false;
    if (filter === "pending")   return g.status === "pending";
    if (filter === "confirmed") return g.status === "confirmed";
    return true;
  }), [guests, filter, group]);

  const queue = eligible.filter(g => !sentIds.has(g.id));
  const current = queue[0] ?? null;
  const doneCount = eligible.length - queue.length;

  function buildMessage(g: Guest): string {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return template
      .replaceAll("[שם]", g.name)
      .replaceAll("[אירוע]", event?.name ?? "")
      .replaceAll("[תאריך]", event?.date ? new Date(event.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "")
      .replaceAll("[קישור]", g.rsvp_token ? `${base}/rsvp/${g.rsvp_token}` : "");
  }

  function markSent(id: string) {
    setSentIds(prev => {
      const next = new Set(prev); next.add(id);
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return next;
    });
    // Persist server-side too (fire-and-forget — local state already updated)
    fetch("/api/admin/guests-sent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_ids: [id] }),
    }).catch(() => {});
  }

  function sendCurrent() {
    if (!current) return;
    const phone = current.phone!.replace(/\D/g, "").replace(/^0/, "972");
    const text = encodeURIComponent(buildMessage(current));
    /* On desktop go straight to web.whatsapp.com. The wa.me short link redirects
       via api.whatsapp.com, and that hop re-encodes the query string — which
       mangles multi-byte emoji into "�" and can drop the link preview.
       Mobile still needs wa.me so the native app opens. */
    const isMobile = typeof navigator !== "undefined"
      && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const url = isMobile
      ? `https://wa.me/${phone}?text=${text}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${text}`;
    window.open(url, "_blank");
    markSent(current.id);
  }

  function resetProgress() {
    if (!confirm("לאפס את ההתקדמות? כל האורחים יסומנו כ'לא נשלח'.")) return;
    setSentIds(new Set());
    localStorage.removeItem(LS_KEY);
  }

  /* Send just the guest on screen through the official number.
     Previously the only option was opening web.whatsapp.com, which sends from
     Dvir's personal account — the exact thing the business number exists to
     avoid. */
  async function sendCurrentViaApi() {
    if (!current || apiBusy) return;
    setApiBusy(true);
    setApiResult(null);
    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, guest_ids: [current.id] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiResult({ error: data?.hint ?? data?.error ?? `שגיאה ${res.status}` });
      } else {
        setApiResult(data);
        if ((data.sent ?? 0) > 0) markSent(current.id);
      }
    } catch {
      setApiResult({ error: "השליחה נכשלה — בדוק חיבור לאינטרנט" });
    } finally {
      setApiBusy(false);
    }
  }

  /* Bulk send through the official WhatsApp Cloud API.
     The server skips anyone already marked invite_sent, so a re-run after a
     timeout or a closed tab can never double-message a guest. */
  async function sendAllViaApi() {
    if (!queue.length || apiBusy) return;
    const ok = confirm(
      `לשלוח את ההזמנה ל-${queue.length} אורחים דרך WhatsApp הרשמי?\n\n` +
      `כל אחד יקבל את תמונת ההזמנה, הקישור האישי שלו וכפתור אישור הגעה.\n` +
      `עלות משוערת: ₪${(queue.length * 0.13).toFixed(0)}.\n\n` +
      `מי שכבר קיבל לא יקבל שוב.`
    );
    if (!ok) return;

    setApiBusy(true);
    setApiResult(null);

    /* Send in chunks so a large list can't exceed the serverless time limit.
       Each chunk is independently committed server-side, so if the tab closes
       mid-run nothing is lost and nothing is sent twice on the next attempt. */
    /* Small chunks because each send is now paced ≥900ms apart and may retry
       with backoff — a large chunk would run past the serverless timeout. */
    const CHUNK = 10;
    const ids = queue.map(g => g.id);
    const acc: Required<ApiSendResult>["details"] = { sent: [], failed: [], skipped: [] };
    let sent = 0, failed = 0, skipped = 0;

    try {
      for (let i = 0; i < ids.length; i += CHUNK) {
        const slice = ids.slice(i, i + CHUNK);
        const res = await fetch("/api/admin/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: eventId, guest_ids: slice }),
        });
        const data = await res.json();

        if (!res.ok) {
          setApiResult({ sent, failed, skipped, details: acc,
            error: data?.hint ?? data?.error ?? `שגיאה ${res.status}` });
          return;
        }

        sent += data.sent ?? 0;
        failed += data.failed ?? 0;
        skipped += data.skipped ?? 0;
        acc.sent!.push(...(data.details?.sent ?? []));
        acc.failed!.push(...(data.details?.failed ?? []));
        acc.skipped!.push(...(data.details?.skipped ?? []));

        /* Update the screen after every chunk, not only at the end */
        setApiResult({ sent, failed, skipped, details: acc });
        const done = new Set<string>(acc.sent!);
        setSentIds(prev => {
          const next = new Set(prev);
          queue.forEach(g => { if (done.has(g.name)) next.add(g.id); });
          return next;
        });
      }
    } catch {
      setApiResult({ sent, failed, skipped, details: acc,
        error: "השליחה נקטעה — הרץ שוב, מי שכבר קיבל יידולג" });
    } finally {
      setApiBusy(false);
    }
  }

  if (!eventId) return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Heebo, sans-serif" }}>
      <p style={{ color: C.muted }}>חסר מזהה אירוע — פתחו מהאדמין: /admin/send?event=[ID]</p>
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        textarea:focus, select:focus { outline: none; border-color: ${C.gold} !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, color: C.dark, margin: 0 }}>📨 עמדת שליחה</h1>
          {event && <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{event.name}</p>}
        </div>
        {doneCount > 0 && (
          <button onClick={resetProgress} title="אפס התקדמות" style={{ marginRight: "auto", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 8 }}>
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px" }}>
        {loading ? <p style={{ textAlign: "center", color: C.muted, padding: 40 }}>טוען...</p> : (
          <>
            {/* Template picker */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {templateList.map(t => (
                  <button key={t.label} onClick={() => setTemplate(t.text)}
                    style={{ padding: "7px 12px", borderRadius: 9, border: `1.5px solid ${template === t.text ? C.gold : C.border}`, background: template === t.text ? "rgba(197,164,109,0.12)" : "#fff", color: template === t.text ? C.goldT : C.dark, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea value={template} onChange={e => setTemplate(e.target.value)} rows={5}
                style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, fontFamily: "Heebo, sans-serif", resize: "vertical", background: "#fff", color: C.dark, lineHeight: 1.6 }} />
              <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>
                תגיות: <b>[שם]</b> · <b>[אירוע]</b> · <b>[קישור]</b> (קישור RSVP אישי)
              </p>
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: groups.length > 1 ? 8 : 16 }}>
              {([["all", "כולם"], ["pending", "ממתינים"], ["confirmed", "אישרו"]] as const).map(([f, label]) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${filter === f ? C.gold : C.border}`, background: filter === f ? "rgba(197,164,109,0.12)" : "#fff", color: filter === f ? C.goldT : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Group filter — shown only when the guest list has named groups */}
            {groups.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {["all", ...groups].map(gr => {
                  const label = gr === "all" ? "כל הקבוצות" : (GROUP_LABELS[gr] ?? gr);
                  const count = gr === "all"
                    ? guests.filter(x => x.category !== "demo").length
                    : guests.filter(x => x.source_group === gr && x.category !== "demo").length;
                  return (
                    <button key={gr} onClick={() => setGroup(gr)}
                      style={{ padding: "8px 14px", borderRadius: 9999, border: `1.5px solid ${group === gr ? C.gold : C.border}`, background: group === gr ? C.gold : "#fff", color: group === gr ? "#fff" : C.muted, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                      {label} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{doneCount} / {eligible.length} נשלחו</span>
                {queue.length > 0 && <span style={{ fontSize: 13, color: C.muted }}>נותרו {queue.length}</span>}
              </div>
              <div style={{ height: 8, background: "rgba(28,16,8,0.06)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: eligible.length ? `${(doneCount / eligible.length) * 100}%` : "0%", background: C.gold, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Bulk send via the official API — Dvir's wedding only for now */}
            {isDvirEvent && queue.length > 0 && (
              <div style={{ background: "#fff", border: `1.5px solid ${C.gold}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 17, fontWeight: 700, color: C.dark, margin: "0 0 4px" }}>
                  ⚡ שליחה אוטומטית לכולם
                </p>
                <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 14px", lineHeight: 1.6 }}>
                  דרך WhatsApp הרשמי — תמונת ההזמנה בכל הודעה, קישור אישי לכל אורח,
                  ומי שכבר קיבל מדולג אוטומטית.
                </p>
                <button onClick={sendAllViaApi} disabled={apiBusy}
                  style={{ width: "100%", padding: "16px", background: apiBusy ? C.border : C.gold, color: "#fff", border: "none", borderRadius: 14, fontSize: 16.5, fontWeight: 700, cursor: apiBusy ? "wait" : "pointer", fontFamily: "Heebo, sans-serif" }}>
                  {apiBusy ? "שולח… אל תסגור את הדף" : `שלח ל-${queue.length} אורחים · ~₪${(queue.length * 0.13).toFixed(0)}`}
                </button>

                {apiResult && (
                  <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.7 }}>
                    {apiResult.error ? (
                      <p style={{ color: "#B4453C", margin: 0 }}>❌ {apiResult.error}</p>
                    ) : (
                      <>
                        <p style={{ margin: 0, color: C.green, fontWeight: 700 }}>
                          ✅ נשלחו {apiResult.sent ?? 0}
                          {(apiResult.failed ?? 0) > 0 && ` · נכשלו ${apiResult.failed}`}
                          {(apiResult.skipped ?? 0) > 0 && ` · דולגו ${apiResult.skipped}`}
                        </p>
                        {(apiResult.details?.failed ?? []).slice(0, 8).map((f, i) => (
                          <p key={i} style={{ margin: "3px 0 0", color: "#B4453C" }}>
                            {f.name} — {f.error}
                          </p>
                        ))}
                        {(apiResult.details?.skipped ?? []).slice(0, 8).map((s, i) => (
                          <p key={i} style={{ margin: "3px 0 0", color: C.muted }}>
                            {s.name} — {s.reason}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Current guest — the big button */}
            {current ? (
              <div style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${C.gold}`, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: C.muted, margin: "0 0 4px" }}>הבא בתור</p>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 700, color: C.dark, margin: "0 0 2px" }}>{current.name}</p>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px", direction: "ltr" }}>{current.phone}</p>
                {isDvirEvent ? (
                  <>
                    <button onClick={sendCurrentViaApi} disabled={apiBusy}
                      style={{ width: "100%", padding: "16px", background: apiBusy ? C.border : C.gold, color: "#fff", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: apiBusy ? "wait" : "pointer", fontFamily: "Heebo, sans-serif" }}>
                      {apiBusy ? "שולח…" : `שלח ל${current.name} מ״רגע לפני״ ←`}
                    </button>
                    <button onClick={sendCurrent}
                      style={{ width: "100%", marginTop: 8, padding: "12px", background: "#fff", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                      💬 או מהוואטסאפ האישי שלי
                    </button>
                  </>
                ) : (
                  <button onClick={sendCurrent}
                    style={{ width: "100%", padding: "16px", background: "#25D366", color: "#fff", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "Heebo, sans-serif", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}>
                    💬 שלח ל{current.name} ←
                  </button>
                )}
                <button onClick={() => markSent(current.id)}
                  style={{ marginTop: 10, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 13, fontFamily: "Heebo, sans-serif", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <SkipForward size={13} /> דלג על אורח זה
                </button>
              </div>
            ) : (
              <div style={{ background: "rgba(74,124,89,0.08)", border: "1.5px solid rgba(74,124,89,0.3)", borderRadius: 18, padding: "28px 20px", textAlign: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 34, margin: "0 0 8px" }}>🎉</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: C.green, margin: 0 }}>
                  {eligible.length === 0 ? "אין אורחים מתאימים לסינון" : "כולם קיבלו! סיימת."}
                </p>
              </div>
            )}

            {/* Recently sent */}
            {doneCount > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {eligible.filter(g => sentIds.has(g.id)).slice(-5).reverse().map(g => (
                  <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.muted, padding: "4px 8px" }}>
                    <Check size={13} color={C.green} /> {g.name}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SendStationPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען...</div>}>
      <SendStation />
    </Suspense>
  );
}
