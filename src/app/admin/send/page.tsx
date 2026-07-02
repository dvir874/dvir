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
}
interface EventInfo { id: string; name: string; address?: string | null }

type Filter = "all" | "pending" | "confirmed";

const TEMPLATES: { label: string; text: string }[] = [
  { label: "הזמנה + קישור RSVP", text: "💍 משפחה וחברים יקרים!\n\n[שם], הוזמנתם לחתונה של [אירוע]! 🎉\n\nלאישור הגעה לחצו:\n[קישור]\n\nמחכים לכם! 🤍" },
  { label: "תזכורת RSVP",        text: "💍 משפחה וחברים יקרים!\n\n[שם], עדיין לא קיבלנו את אישורכם לחתונה של [אירוע] 🙏\n\nלחצו לאישור מהיר:\n[קישור]" },
  { label: "מחר החתונה!",        text: "💍 משפחה וחברים יקרים!\n\n[שם], מחר זה קורה! 🎉\nהחתונה של [אירוע]\n\nמחכים לראותכם! 🤍" },
  { label: "תודה שהגעתם",        text: "💍 משפחה וחברים יקרים!\n\n[שם], תודה שהייתם חלק מהיום המיוחד שלנו! ❤️" },
];

function SendStation() {
  const params = useSearchParams();
  const eventId = params.get("event") ?? "";

  const [event, setEvent]   = useState<EventInfo | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [template, setTemplate] = useState(TEMPLATES[0].text);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const LS_KEY = `send_station_${eventId}`;

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/guests?event_id=${eventId}`).then(r => r.ok ? r.json() : []),
    ]).then(([ev, gs]) => {
      if (ev) setEvent(ev);
      if (Array.isArray(gs)) setGuests(gs);
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
        if (Array.isArray(saved)) setSentIds(new Set(saved));
      } catch {}
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId, LS_KEY]);

  const eligible = useMemo(() => guests.filter(g => {
    if (!g.phone) return false;
    if (filter === "pending")   return g.status === "pending";
    if (filter === "confirmed") return g.status === "confirmed";
    return true;
  }), [guests, filter]);

  const queue = eligible.filter(g => !sentIds.has(g.id));
  const current = queue[0] ?? null;
  const doneCount = eligible.length - queue.length;

  function buildMessage(g: Guest): string {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return template
      .replaceAll("[שם]", g.name)
      .replaceAll("[אירוע]", event?.name ?? "")
      .replaceAll("[קישור]", g.rsvp_token ? `${base}/rsvp/${g.rsvp_token}` : "");
  }

  function markSent(id: string) {
    setSentIds(prev => {
      const next = new Set(prev); next.add(id);
      localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function sendCurrent() {
    if (!current) return;
    const phone = current.phone!.replace(/\D/g, "").replace(/^0/, "972");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(current))}`, "_blank");
    markSent(current.id);
  }

  function resetProgress() {
    if (!confirm("לאפס את ההתקדמות? כל האורחים יסומנו כ'לא נשלח'.")) return;
    setSentIds(new Set());
    localStorage.removeItem(LS_KEY);
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
                {TEMPLATES.map(t => (
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
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {([["all", "כולם"], ["pending", "ממתינים"], ["confirmed", "אישרו"]] as const).map(([f, label]) => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${filter === f ? C.gold : C.border}`, background: filter === f ? "rgba(197,164,109,0.12)" : "#fff", color: filter === f ? C.goldT : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                  {label}
                </button>
              ))}
            </div>

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

            {/* Current guest — the big button */}
            {current ? (
              <div style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${C.gold}`, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: C.muted, margin: "0 0 4px" }}>הבא בתור</p>
                <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 24, fontWeight: 700, color: C.dark, margin: "0 0 2px" }}>{current.name}</p>
                <p style={{ fontSize: 13, color: C.muted, margin: "0 0 16px", direction: "ltr" }}>{current.phone}</p>
                <button onClick={sendCurrent}
                  style={{ width: "100%", padding: "16px", background: "#25D366", color: "#fff", border: "none", borderRadius: 14, fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "Heebo, sans-serif", boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}>
                  💬 שלח ל{current.name} ←
                </button>
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
