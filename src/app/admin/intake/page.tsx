"use client";

import { useState } from "react";

/* קליטת אירוע — paste what the couple sent, correct what the system got wrong.
 *
 * Every event so far was created by typing five fields out of a WhatsApp
 * message. It is the least valuable half-hour in the business and the reason
 * a third client meant a third evening.
 *
 * The screen exists to make the parse CHECKABLE, not to hide it. Every field
 * shows the exact words it was read from, anything the parser refused is left
 * empty and marked, and every line it could not place is listed underneath —
 * because a field silently wrong reaches three hundred people, and a field
 * visibly empty costs ten seconds.
 *
 * Same visual language as /admin/sms and /admin/profit. */

const T = { page: "#F6F1E8", card: "#FDFAF5", border: "#E8E0D4", dark: "#1C1008",
            muted: "rgba(28,16,8,0.6)", gold: "#C5A46D", olive: "#6B7B5A", alert: "#B4453C" };

type Field = { value: string | null; source: string | null };
type Parsed = {
  couple: Field; date: Field; venue: Field; address: Field;
  reception: Field; chuppah: Field; unparsed: string[];
};

const LABELS: [keyof Parsed, string, string][] = [
  ["couple", "שמות בני הזוג", "לאל וטל"],
  ["date", "תאריך (YYYY-MM-DD)", "2026-09-22"],
  ["venue", "מקום", "סקיי גארדן"],
  ["address", "כתובת", "היוזמה, יקנעם עילית"],
  ["reception", "קבלת פנים", "18:00"],
  ["chuppah", "חופה", "19:00"],
];

export default function IntakePage() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [client, setClient] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ event_id: string; name: string; couple_token: string; helper_token: string } | null>(null);

  async function parse() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/intake", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "parse", text }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
      setParsed(d.parsed);
      const v: Record<string, string> = {};
      for (const [k] of LABELS) v[k] = (d.parsed[k] as Field).value ?? "";
      setVals(v);
    } catch (e) { setErr(String((e as Error).message)); }
    finally { setBusy(false); }
  }

  async function create() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/intake", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "create", fields: { ...vals, client_name: client.name, client_phone: client.phone } }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
      setDone(d);
    } catch (e) { setErr(String((e as Error).message)); }
    finally { setBusy(false); }
  }

  const inputStyle = (filled: boolean) => ({
    width: "100%", padding: "11px 13px", borderRadius: 10, minHeight: 44,
    border: `1px solid ${filled ? T.border : T.gold}`, background: "#fff",
    color: T.dark, fontSize: 15, fontFamily: "inherit",
  });

  if (done) return (
    <Shell>
      <h1 style={h1}>✅ האירוע הוקם</h1>
      <p style={{ ...p, textAlign: "center" }}>{done.name}</p>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18, marginTop: 18 }}>
        <p style={{ ...p, fontWeight: 700, color: T.dark, margin: "0 0 10px" }}>מה שנשאר:</p>
        <p style={{ ...p, margin: "0 0 6px" }}>1 · להעלות את תמונת ההזמנה — בלעדיה השליחה מסרבת</p>
        <p style={{ ...p, margin: "0 0 14px" }}>2 · לייבא את רשימת האורחים</p>
        <p style={{ ...p, fontSize: 12.5, margin: 0 }} dir="ltr">
          couple: /couple/{done.couple_token}<br />helper: /send/{done.helper_token}
        </p>
      </div>
      <a href="/admin" style={{ ...btn, display: "block", textAlign: "center", marginTop: 18, textDecoration: "none" }}>חזרה לאדמין</a>
    </Shell>
  );

  return (
    <Shell>
      <h1 style={h1}>📥 קליטת אירוע חדש</h1>
      <p style={{ ...p, textAlign: "center", marginBottom: 20 }}>
        הדביקו את ההודעה שהזוג שלח, והמערכת תוציא ממנה את הפרטים.<br />
        מה שהיא לא בטוחה בו — היא משאירה ריק ולא מנחשת.
      </p>

      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={9}
        placeholder={"היי דביר! הנה הפרטים\nהחתונה של תהל ואביב\n22.09.2026\n📍 גן האירועים ארץ, מושב עג׳ור\nקבלת פנים 17:45\nחופה וקידושין 18:45"}
        style={{ ...inputStyle(true), minHeight: 170, lineHeight: 1.7, resize: "vertical" as const }}
      />
      <button onClick={parse} disabled={busy || !text.trim()} style={{ ...btn, width: "100%", marginTop: 12, opacity: busy || !text.trim() ? 0.5 : 1 }}>
        {busy ? "קורא…" : "קרא את ההודעה"}
      </button>

      {err && <p style={{ color: T.alert, textAlign: "center", marginTop: 14 }}>{err}</p>}

      {parsed && (
        <div style={{ marginTop: 24 }}>
          {LABELS.map(([k, label, ph]) => {
            const f = parsed[k] as Field;
            const filled = !!vals[k];
            return (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ ...p, display: "block", margin: "0 0 5px", fontWeight: 700, color: T.dark }}>
                  {label} {!f.value && <span style={{ color: T.gold, fontWeight: 400 }}>· לא זוהה, מלאו ידנית</span>}
                </label>
                <input value={vals[k] ?? ""} placeholder={ph}
                       onChange={e => setVals(v => ({ ...v, [k]: e.target.value }))}
                       style={inputStyle(filled)} />
                {f.source && (
                  <p style={{ ...p, fontSize: 11.5, margin: "4px 2px 0", color: T.olive }}>
                    נקרא מתוך: &ldquo;{f.source}&rdquo;
                  </p>
                )}
              </div>
            );
          })}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <input placeholder="שם איש הקשר" value={client.name}
                   onChange={e => setClient(c => ({ ...c, name: e.target.value }))} style={inputStyle(true)} />
            <input placeholder="טלפון איש הקשר" value={client.phone} dir="ltr"
                   onChange={e => setClient(c => ({ ...c, phone: e.target.value }))} style={inputStyle(true)} />
          </div>

          {parsed.unparsed.length > 0 && (
            <div style={{ background: T.card, border: `1px solid ${T.gold}`, borderRadius: 12, padding: "13px 15px", marginBottom: 16 }}>
              <p style={{ ...p, fontWeight: 700, color: T.dark, margin: "0 0 6px" }}>
                ⚠️ שורות שלא זוהו — בדקו שלא הלך משהו לאיבוד
              </p>
              {parsed.unparsed.map((l, i) => (
                <p key={i} style={{ ...p, margin: "0 0 3px", fontSize: 13 }}>· {l}</p>
              ))}
            </div>
          )}

          <button onClick={create} disabled={busy} style={{ ...btn, width: "100%", opacity: busy ? 0.5 : 1 }}>
            {busy ? "מקים…" : "הקם את האירוע"}
          </button>
        </div>
      )}
    </Shell>
  );
}

const h1 = { fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 26, fontWeight: 900,
             color: T.dark, margin: "0 0 8px", textAlign: "center" as const };
const p = { fontSize: 14, color: T.muted, margin: "0 0 8px", lineHeight: 1.7 };
const btn = { background: T.gold, color: "#fff", border: "none", borderRadius: 9999,
              padding: "13px 30px", fontSize: 15.5, fontWeight: 700, cursor: "pointer",
              fontFamily: "Heebo, sans-serif", minHeight: 46 };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: T.page, padding: "32px 16px 70px",
                            fontFamily: "Heebo, -apple-system, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
