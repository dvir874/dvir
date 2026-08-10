"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, RefreshCw, Send } from "lucide-react";

/* One screen that answers "did every guest actually get it?".
   Built because the admin had grown into a dozen places to look and none of
   them told the truth about delivery — a guest could be marked sent while
   Meta had silently blocked the message. */

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldT: "#8B6914",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "#E8E0D4",
  green: "#4A7C59", red: "#B4453C", amber: "#B8860B",
};

const DVIR_EVENT_ID = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";

const GROUPS: Record<string, string> = {
  dvir_list: "שלי", mirav_list: "של מירב", nitza_list: "של ניצה",
  horim_list: "של ההורים", horim_tveria: "טבריה",
};

interface Row {
  id: string; name: string; phone: string | null; group: string | null;
  he?: string; action?: string; retryable?: boolean; raw?: string | null;
  reason?: string; at?: string; evidence?: string; exhausted?: boolean;
}
interface Data {
  trackingAvailable: boolean;
  totals: { guests: number; queued: number; delivered: number; read: number;
            accepted: number; sent: number; failed: number; untracked: number; unsent: number };
  failed: Row[]; untracked: Row[]; unsent: Row[]; reachedNoLog?: Row[];
}

function Delivery() {
  const eventId = useSearchParams().get("event") ?? DVIR_EVENT_ID;
  const [d, setD] = useState<Data | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/delivery?event_id=${eventId}`);
    if (r.ok) setD(await r.json());
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  /* Resend clears the "already sent" mark first, otherwise the send route
     would skip the guest by design. */
  async function resend(ids: string[], label: string) {
    if (!ids.length || busy) return;

    /* A WhatsApp message cannot be recalled, and this button reaches dozens of
       real guests at once. Two weeks before a wedding, working fast on a phone,
       one stray tap is all it takes — and the number's own ceiling is roughly
       60 recipients a day, so a mistaken bulk send costs days of capacity the
       guests who were never invited are waiting on. */
    if (ids.length > 1 && !confirm(
      `לשלוח ל-${ids.length} אורחים?\n\n` +
      `כל אחד יקבל הודעת וואטסאפ עם ההזמנה והקישור האישי שלו.\n` +
      `אי אפשר לבטל הודעה שנשלחה.`,
    )) return;

    setBusy(label); setNote(null);
    try {
      await fetch("/api/admin/guests-sent", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_ids: ids }),
      });
      const r = await fetch("/api/admin/whatsapp/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, guest_ids: ids }),
      });
      const j = await r.json();
      setNote(r.ok ? `נשלחו ${j.sent ?? 0} · נכשלו ${j.failed ?? 0}` : (j?.error ?? "שגיאה"));
      await load();
    } catch {
      setNote("השליחה נכשלה");
    } finally { setBusy(null); }
  }

  const t = d?.totals;
  const tiles = t ? [
    { k: "נמסרו", v: t.delivered + t.read, c: C.green },
    { k: "נקראו", v: t.read, c: C.goldT },
    { k: "נכשלו", v: t.failed, c: t.failed ? C.red : C.muted },
    { k: "ללא מעקב", v: t.untracked, c: t.untracked ? C.amber : C.muted },
    { k: "לא נשלחו", v: t.unsent, c: t.unsent ? C.amber : C.muted },
  ] : [];

  const retryable = (d?.failed ?? []).filter(r => r.retryable).map(r => r.id);

  const section = (title: string, sub: string, rows: Row[], color: string,
                   action?: { label: string; ids: string[] }) => rows.length > 0 && (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
      marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color }}>{title} ({rows.length})</span>
        <span style={{ fontSize: 12.5, color: C.muted, flex: 1 }}>{sub}</span>
        {action && action.ids.length > 0 && (
          <button onClick={() => resend(action.ids, action.label)} disabled={!!busy}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
              borderRadius: 9, border: "none", cursor: busy ? "wait" : "pointer",
              background: busy === action.label ? C.border : C.gold, color: "#fff",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>
            <Send size={14} /> {busy === action.label ? "שולח…" : `${action.label} (${action.ids.length})`}
          </button>
        )}
      </div>
      {rows.map(r => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10,
          padding: "10px 18px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 14, minWidth: 130 }}>{r.name}</span>
          <span style={{ fontSize: 13, color: C.muted, direction: "ltr", minWidth: 100 }}>{r.phone ?? "—"}</span>
          <span style={{ fontSize: 12, color: C.muted, minWidth: 70 }}>{GROUPS[r.group ?? ""] ?? ""}</span>
          <span style={{ fontSize: 12.5, color, flex: 1, minWidth: 180 }}>
            {r.he ?? r.reason}
            {r.action && <span style={{ color: C.muted }}> · {r.action}</span>}
          </span>
          <button onClick={() => resend([r.id], r.id)} disabled={!!busy}
            style={{ padding: "6px 12px", borderRadius: 8, cursor: busy ? "wait" : "pointer",
              border: `1px solid ${C.border}`, background: "#fff", color: C.goldT,
              fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>
            {busy === r.id ? "…" : "שלח שוב"}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, color: C.dark,
      fontFamily: "Heebo, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
          📊 מצב מסירה
        </h1>
        <button onClick={load} style={{ marginRight: "auto", background: "none", border: "none",
          cursor: "pointer", color: C.muted, padding: 8 }}><RefreshCw size={16} /></button>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: 16 }}>
        {!d ? (
          <p style={{ textAlign: "center", color: C.muted, padding: 40 }}>טוען…</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
              gap: 12, marginBottom: 18 }}>
              {tiles.map(x => (
                <div key={x.k} style={{ background: "#fff", border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, color: C.muted }}>{x.k}</div>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30,
                    fontWeight: 800, color: x.c }}>{x.v}</div>
                </div>
              ))}
            </div>

            {note && (
              <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: "11px 16px", marginBottom: 14, fontSize: 14 }}>{note}</div>
            )}

            {section("נכשלו — נגמרו הניסיונות", "המערכת כבר לא תנסה שוב. צריך טיפול ידני",
              d.failed.filter(r => r.exhausted), C.red,
              d.failed.filter(r => r.exhausted).length
                ? { label: "נסה שוב ידנית", ids: d.failed.filter(r => r.exhausted).map(r => r.id) }
                : undefined)}

            {section("נכשלו במסירה", "וואטסאפ חסם או דחה — האורח לא קיבל", d.failed.filter(r => !r.exhausted), C.red,
              retryable.length ? { label: "שלח שוב לכל הניתנים", ids: retryable } : undefined)}

            {section("ללא נתוני מסירה", "נשלחו לפני שהמעקב הופעל — לא ידוע אם הגיעו",
              d.untracked, C.amber,
              { label: "שלח שוב לכולם", ids: d.untracked.map(r => r.id) })}

            {/* Kept out of the group above, and out of its bulk-send button:
                these guests opened their link or answered, so they demonstrably
                received the invitation even though no delivery report exists. */}
            {section("הגיעו — בלי דוח מסירה", "פתחו את הקישור או השיבו, אין צורך לשלוח שוב",
              d.reachedNoLog ?? [], C.green)}

            {section("לא נשלחו כלל", "מעולם לא יצאה אליהם הודעה", d.unsent, C.amber,
              { label: "שלח לכולם", ids: d.unsent.filter(r => r.reason === "טרם נשלח").map(r => r.id) })}

            {d.failed.length === 0 && d.untracked.length === 0 && d.unsent.length === 0 && (
              <div style={{ background: "rgba(74,124,89,0.08)", border: `1px solid ${C.green}`,
                borderRadius: 16, padding: 28, textAlign: "center" }}>
                <p style={{ fontSize: 30, margin: "0 0 6px" }}>✅</p>
                <p style={{ fontWeight: 700, color: C.green, margin: 0 }}>
                  כל האורחים קיבלו את ההודעה
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען…</div>}>
      <Delivery />
    </Suspense>
  );
}
