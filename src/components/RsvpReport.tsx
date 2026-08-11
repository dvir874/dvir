"use client";

import { useEffect, useMemo, useState } from "react";

/* Read-only RSVP status report.
   This is the page a couple forwards to a partner or a parent: it answers
   "how many are coming, who hasn't answered" without exposing any control
   that could change an answer. Exports to CSV (Excel-safe) and prints clean. */

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.55)",
  border: "#E8E0D4",
  green:  "#4A7C59",
  red:    "#B4453C",
};

type Filter = "all" | "confirmed" | "declined" | "pending";

interface Guest {
  name: string; phone: string | null; status: string; statusHe: string;
  count: number; group: string; respondedAt: string | null;
}
interface Group {
  key: string; label: string; total: number;
  confirmed: number; declined: number; pending: number; attendees: number;
}
interface Report {
  event: { name: string; date: string | null; address: string | null };
  stats: { total: number; confirmed: number; declined: number; pending: number;
           attendees: number; opened: number; responseRate: number };
  groups: Group[];
  shuttle: { name: string; count: number }[];
  notes: { name: string; note: string }[];
  guests: Guest[];
}

export default function RsvpReport({ apiBase }: { apiBase: string }) {
  const [data, setData] = useState<Report | null>(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [group, setGroup] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(apiBase)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => setErr(true));
  }, [apiBase]);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.guests.filter(g => {
      if (filter !== "all" && g.status !== filter) return false;
      if (group !== "all" && g.group !== group) return false;
      if (q.trim() && !g.name.includes(q.trim())) return false;
      return true;
    });
  }, [data, filter, group, q]);

  if (err) return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "Heebo, sans-serif", color: C.muted }}>
      הקישור אינו תקין
    </div>
  );
  if (!data) return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "Heebo, sans-serif", color: C.muted }}>
      טוען…
    </div>
  );

  const s = data.stats;
  const tiles = [
    { k: "מגיעים",     v: s.attendees, sub: `${s.confirmed} אישורים`, c: C.green },
    { k: "לא מגיעים",  v: s.declined,  sub: "הודיעו",                 c: C.red },
    { k: "טרם ענו",    v: s.pending,   sub: `מתוך ${s.total}`,         c: C.goldT },
    { k: "אחוז מענה",  v: `${s.responseRate}%`, sub: `${s.opened} פתחו`, c: C.dark },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, color: C.dark,
      fontFamily: "Heebo, system-ui, sans-serif", padding: "28px 18px 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        @media print { .no-print { display: none !important; } body { background: #fff; } }
        input:focus, select:focus { outline: none; border-color: ${C.gold} !important; }
      `}</style>

      <div style={{ maxWidth: 940, margin: "0 auto" }}>

        <header style={{ textAlign: "center", marginBottom: 26 }}>
          <p style={{ fontSize: 12, letterSpacing: ".18em", color: C.muted, margin: 0 }}>מצב אישורי הגעה</p>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 30, fontWeight: 900, margin: "6px 0 4px" }}>
            {data.event.name}
          </h1>
          {data.event.date && (
            <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>
              {new Date(data.event.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {data.event.address ? ` · ${data.event.address}` : ""}
            </p>
          )}
        </header>

        {/* headline numbers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 12, marginBottom: 22 }}>
          {tiles.map(t => (
            <div key={t.k} style={{ background: "#fff", border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "16px 18px" }}>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{t.k}</p>
              <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 34, fontWeight: 900,
                color: t.c, margin: "2px 0 0", lineHeight: 1.1 }}>{t.v}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{t.sub}</p>
            </div>
          ))}
        </div>

        {/* per-group progress */}
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
          padding: "16px 18px", marginBottom: 22 }}>
          <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px" }}>לפי קבוצה</p>
          {data.groups.map(g => {
            const answered = g.confirmed + g.declined;
            const pct = g.total ? Math.round((answered / g.total) * 100) : 0;
            return (
              <div key={g.key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{g.label}</span>
                  <span style={{ color: C.muted }}>
                    {g.confirmed} מגיעים ({g.attendees} אורחים) · {g.pending} טרם ענו · {pct}%
                  </span>
                </div>
                <div style={{ height: 7, background: "rgba(28,16,8,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: C.gold }} />
                </div>
              </div>
            );
          })}
        </div>

        {data.shuttle.length > 0 && (
          <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: "16px 18px", marginBottom: 22 }}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>
              🚌 הסעה מטבריה — {data.shuttle.reduce((a, x) => a + x.count, 0)} מקומות
            </p>
            <p style={{ fontSize: 13.5, color: C.muted, margin: 0, lineHeight: 1.8 }}>
              {data.shuttle.map(x => `${x.name}${x.count > 1 ? ` (${x.count})` : ""}`).join(" · ")}
            </p>
          </div>
        )}

        {data.notes.length > 0 && (
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
            padding: "16px 18px", marginBottom: 22 }}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 10px" }}>
              💌 הערות וברכות ({data.notes.length})
            </p>
            {data.notes.map((n, i) => (
              <p key={i} style={{ fontSize: 13.5, margin: "0 0 8px", lineHeight: 1.7 }}>
                <b>{n.name}:</b> <span style={{ color: C.muted }}>{n.note}</span>
              </p>
            ))}
          </div>
        )}

        {/* controls */}
        <div className="no-print" style={{ display: "flex", gap: 8, flexWrap: "wrap",
          alignItems: "center", marginBottom: 12 }}>
          {(["all", "confirmed", "pending", "declined"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "8px 14px", borderRadius: 9999, cursor: "pointer", fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", border: `1.5px solid ${filter === f ? C.gold : C.border}`,
                background: filter === f ? C.gold : "#fff", color: filter === f ? "#fff" : C.muted }}>
              {{ all: "הכול", confirmed: "מגיעים", pending: "טרם ענו", declined: "לא מגיעים" }[f]}
            </button>
          ))}
          <select value={group} onChange={e => setGroup(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`,
              background: "#fff", fontFamily: "inherit", fontSize: 13, color: C.dark }}>
            <option value="all">כל הקבוצות</option>
            {data.groups.map(g => <option key={g.key} value={g.label}>{g.label}</option>)}
          </select>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש שם…"
            style={{ padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`,
              background: "#fff", fontFamily: "inherit", fontSize: 13, flex: "1 1 140px", minWidth: 120 }} />
          <a href={`${apiBase}?csv=1`}
            style={{ padding: "9px 16px", borderRadius: 10, background: C.goldT, color: "#fff",
              fontSize: 13, fontWeight: 600, textDecoration: "none" }}>⬇ הורדה לאקסל</a>
          <button onClick={() => window.print()}
            style={{ padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`,
              background: "#fff", color: C.dark, fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit" }}>🖨 הדפסה / PDF</button>
        </div>

        {/* table */}
        <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 16,
          overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: C.cream }}>
                  {["שם", "קבוצה", "סטטוס", "אורחים"].map(h => (
                    <th key={h} style={{ textAlign: "right", padding: "10px 14px",
                      fontWeight: 700, color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((g, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "9px 14px", fontWeight: 500 }}>{g.name}</td>
                    <td style={{ padding: "9px 14px", color: C.muted }}>{g.group}</td>
                    <td style={{ padding: "9px 14px", whiteSpace: "nowrap",
                      color: g.status === "confirmed" ? C.green : g.status === "declined" ? C.red : C.muted,
                      fontWeight: g.status === "pending" ? 400 : 600 }}>{g.statusHe}</td>
                    <td style={{ padding: "9px 14px", color: C.muted }}>{g.count || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <p style={{ textAlign: "center", color: C.muted, padding: 28, fontSize: 14 }}>
              אין תוצאות לסינון הזה
            </p>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 20 }}>
          מוצג {rows.length} מתוך {data.stats.total} · הנתונים מתעדכנים בזמן אמת
        </p>
      </div>
    </div>
  );
}
