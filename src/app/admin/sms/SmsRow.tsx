"use client";

import { useState } from "react";

/* One row of the SMS fallback list, and the mark that was missing.
 *
 * The list rebuilt itself from delivery failures every time it was opened, so
 * it always showed the same thirteen people whether they had been texted or
 * not. There was no way to answer "who is left" — which is the only question
 * this page exists to answer — and the cost of getting it wrong is texting
 * someone the same invitation three times.
 *
 * Marked through guest_events, the same mechanism the helper flow already uses
 * for manual_sent. No migration, and the sender already treats a marked guest
 * as reached. */
export default function SmsRow({
  id, name, phone, note, icon, body, alreadySent, opened, answered,
}: {
  id: string; name: string; phone: string; note: string; icon: string;
  body: string; alreadySent: boolean; opened: boolean; answered: boolean;
}) {
  const [sent, setSent] = useState(alreadySent);
  const [busy, setBusy] = useState(false);

  async function mark(next: boolean) {
    setBusy(true);
    setSent(next);                       /* optimistic — the tap already opened Messages */
    try {
      await fetch("/api/admin/sms-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_id: id, sent: next }),
      });
    } catch { setSent(!next); }
    finally { setBusy(false); }
  }

  const T = { card: "#FDFAF5", border: "#E8E0D4", dark: "#1C1008",
              muted: "rgba(28,16,8,0.6)", gold: "#C5A46D", olive: "#6B7B5A" };

  return (
    <div style={{
      background: sent ? "#F3F1EA" : T.card,
      border: `1px solid ${sent ? T.border : T.gold}`,
      borderRadius: 14, padding: "14px 16px", marginBottom: 12,
      opacity: sent && !answered ? 0.72 : 1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.dark }}>
          {icon} {name}
        </span>
        {answered
          ? <span style={{ fontSize: 13, fontWeight: 800, color: T.olive }}>✅ ענה</span>
          : opened
          ? <span style={{ fontSize: 12.5, fontWeight: 700, color: T.olive }}>👁 פתח, טרם ענה</span>
          : null}
      </div>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }} dir="ltr">{phone}</div>
      <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>{note}</div>

      {!answered && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <a
            href={`sms:${phone}&body=${encodeURIComponent(body)}`}
            onClick={() => { if (!sent) mark(true); }}
            style={{
              flex: 1, textAlign: "center", background: sent ? "none" : T.gold,
              color: sent ? T.gold : "#fff", border: `1px solid ${T.gold}`,
              borderRadius: 9999, padding: "11px 18px", fontSize: 14, fontWeight: 700,
              textDecoration: "none", minHeight: 44, lineHeight: "22px",
            }}
          >
            {sent ? "שלח שוב" : "שלח SMS ›"}
          </a>
          <button
            onClick={() => mark(!sent)} disabled={busy}
            style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 9999,
              padding: "11px 14px", fontSize: 13, color: T.muted, cursor: "pointer",
              minHeight: 44, whiteSpace: "nowrap",
            }}
          >
            {sent ? "בטל סימון" : "כבר שלחתי"}
          </button>
        </div>
      )}
    </div>
  );
}
