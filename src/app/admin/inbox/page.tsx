"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, RefreshCw, ArrowRight } from "lucide-react";

/* Admin inbox for the official WhatsApp number (077-549-4850).

   A number registered on the Cloud API cannot also be opened in WhatsApp Web —
   Meta allows one or the other. This screen is the replacement: guests' replies
   arrive through the webhook and are answered from the same business number,
   so nothing ever goes out from a personal account. */

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
  red:    "#B4453C",
  bubble: "#DCF8C6",
};

const DVIR_EVENT_ID = "a5e65dcf-8109-438d-a4a1-8f65d6f3e948";

interface Msg { id: string; direction: string; body: string | null; status: string | null; error: string | null; at: string }
interface Thread {
  phone: string;
  guest: { id: string; name: string; status: string; group: string | null } | null;
  unread: number; lastAt: string | null; canReply: boolean; windowEndsAt: string | null;
  messages: Msg[];
}
interface Delivery {
  total: number; accepted: number; sent: number; delivered: number; read: number; failed: number;
  failures: { name: string; error: string | null }[];
}

const time = (iso: string) =>
  new Date(iso).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const STATUS_HE: Record<string, string> = {
  accepted: "נשלח", sent: "נשלח", delivered: "נמסר ✓✓", read: "נקרא 👀", failed: "נכשל",
};

function Inbox() {
  const params = useSearchParams();
  const eventId = params.get("event") ?? DVIR_EVENT_ID;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/inbox?event_id=${eventId}`);
      const d = await r.json();
      if (!r.ok) { setErr(d?.hint ?? d?.error ?? "שגיאה"); return; }
      setErr(null);
      setThreads(d.threads ?? []);
      setDelivery(d.delivery ?? null);
    } catch {
      setErr("לא ניתן לטעון");
    } finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { load(); }, [load]);
  /* Poll rather than push: WhatsApp volume here is a handful of messages an
     hour, so a 20s refresh is plenty and avoids a socket to maintain. */
  useEffect(() => {
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const thread = threads.find(t => t.phone === active) ?? null;

  async function openThread(t: Thread) {
    setActive(t.phone);
    if (t.unread > 0) {
      await fetch("/api/admin/inbox", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read", phone: t.phone }),
      });
      load();
    }
  }

  async function reply() {
    if (!thread || !draft.trim() || busy) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/admin/inbox", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: thread.phone, text: draft.trim(), event_id: eventId }),
      });
      const d = await r.json();
      if (!r.ok) setErr(d?.error ?? "השליחה נכשלה");
      else { setDraft(""); await load(); }
    } finally { setBusy(false); }
  }

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, color: C.dark,
      fontFamily: "Heebo, system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        textarea:focus { outline: none; border-color: ${C.gold} !important; }`}</style>

      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
        <div>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
            💬 תיבת הודעות — רגע לפני
          </h1>
          <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>077-549-4850</p>
        </div>
        <button onClick={load} title="רענון"
          style={{ marginRight: "auto", background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 8 }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>

        {err && (
          <div style={{ background: "rgba(180,69,60,0.08)", border: `1px solid ${C.red}`,
            borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 14, color: C.red }}>
            {err}
          </div>
        )}

        {/* delivery roll-up — the answer to "did it really arrive" */}
        {delivery && delivery.total > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
            padding: "14px 18px", marginBottom: 16 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 10px" }}>מסירה בפועל</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(96px,1fr))", gap: 12 }}>
              {[
                { k: "נשלחו", v: delivery.total, c: C.dark },
                { k: "נמסרו", v: delivery.delivered, c: C.green },
                { k: "נקראו", v: delivery.read, c: C.goldT },
                { k: "נכשלו", v: delivery.failed, c: delivery.failed ? C.red : C.muted },
              ].map(x => (
                <div key={x.k}>
                  <div style={{ fontSize: 12, color: C.muted }}>{x.k}</div>
                  <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 26, fontWeight: 800, color: x.c }}>{x.v}</div>
                </div>
              ))}
            </div>
            {delivery.failures.slice(0, 6).map((f, i) => (
              <p key={i} style={{ fontSize: 12.5, color: C.red, margin: "6px 0 0" }}>
                {f.name} — {f.error ?? "כשל במסירה"}
              </p>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" }}>

          {/* thread list */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
            {loading ? (
              <p style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 14 }}>טוען…</p>
            ) : threads.length === 0 ? (
              <p style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 14, lineHeight: 1.7 }}>
                אין עדיין הודעות נכנסות.<br />כשאורח ישיב, השיחה תופיע כאן.
              </p>
            ) : threads.map(t => (
              <button key={t.phone} onClick={() => openThread(t)}
                style={{ display: "block", width: "100%", textAlign: "right", padding: "13px 16px",
                  border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer",
                  background: active === t.phone ? C.cream : "#fff", fontFamily: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14.5, color: C.dark }}>
                    {t.guest?.name ?? t.phone}
                  </span>
                  {t.unread > 0 && (
                    <span style={{ background: C.green, color: "#fff", borderRadius: 999,
                      fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>{t.unread}</span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: C.muted, margin: "3px 0 0",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.messages.at(-1)?.body}
                </p>
              </button>
            ))}
          </div>

          {/* conversation */}
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
            minHeight: 420, display: "flex", flexDirection: "column" }}>
            {!thread ? (
              <p style={{ margin: "auto", color: C.muted, fontSize: 14 }}>בחר שיחה מימין</p>
            ) : (
              <>
                <div style={{ padding: "13px 18px", borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{thread.guest?.name ?? thread.phone}</p>
                  <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0", direction: "ltr", textAlign: "right" }}>
                    +{thread.phone}
                  </p>
                </div>

                <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 8,
                  maxHeight: 460, overflowY: "auto" }}>
                  {thread.messages.map(m => (
                    <div key={m.id} style={{ alignSelf: m.direction === "in" ? "flex-start" : "flex-end", maxWidth: "78%" }}>
                      <div style={{ background: m.direction === "in" ? C.cream : C.bubble,
                        borderRadius: 14, padding: "9px 13px", fontSize: 14, lineHeight: 1.6,
                        whiteSpace: "pre-wrap" }}>
                        {m.body}
                      </div>
                      <p style={{ fontSize: 10.5, color: C.muted, margin: "3px 6px 0",
                        textAlign: m.direction === "in" ? "right" : "left" }}>
                        {time(m.at)}
                        {m.direction === "out" && m.status ? ` · ${STATUS_HE[m.status] ?? m.status}` : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, padding: 14 }}>
                  {thread.canReply ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2}
                        placeholder="כתוב תשובה…"
                        style={{ flex: 1, padding: "10px 13px", borderRadius: 12, resize: "vertical",
                          border: `1.5px solid ${C.border}`, fontFamily: "inherit", fontSize: 14,
                          background: "#fff", color: C.dark }} />
                      <button onClick={reply} disabled={busy || !draft.trim()}
                        style={{ padding: "12px 18px", borderRadius: 12, border: "none",
                          background: busy || !draft.trim() ? C.border : C.gold, color: "#fff",
                          cursor: busy || !draft.trim() ? "default" : "pointer", fontFamily: "inherit",
                          fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                        <Send size={15} /> שלח
                      </button>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7 }}>
                      חלון 24 השעות נסגר — וואטסאפ מאפשר תשובה חופשית רק תוך יממה מההודעה
                      האחרונה של האורח. אפשר לשלוח לו תבנית מאושרת מתחנת השליחה.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען…</div>}>
      <Inbox />
    </Suspense>
  );
}
