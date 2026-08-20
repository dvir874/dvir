"use client";

import { useCallback, useEffect, useState } from "react";

/* רווחיות — the screen that answers "did we make money on this wedding".
 *
 * Same visual language as /admin/sms: ivory ground, gold, one card per row,
 * nothing invented. Admin is Desktop-First per CLAUDE.md and a dense table is
 * what this data is.
 *
 * Cost is measured from Meta's own pricing_analytics, not estimated. The only
 * number a human supplies is what was charged — which is exactly the number
 * the system never had. */

const T = { page: "#F6F1E8", card: "#FDFAF5", border: "#E8E0D4",
            dark: "#1C1008", muted: "rgba(28,16,8,0.6)", gold: "#C5A46D",
            olive: "#6B7B5A", alert: "#B4453C" };

type Row = {
  id: string; name: string; couple: string | null; date: string;
  sent: number; charged: number | null; cost: number; costMeasured: boolean;
  profit: number | null; margin: number | null;
};

export default function ProfitPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [totals, setTotals] = useState<{ revenue: number; cost: number; profit: number; missingPrice: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/profit")
      .then(async r => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`);
        setRows(d.rows ?? []); setTotals(d.totals ?? null); setErr("");
      })
      .catch(e => setErr(String(e.message ?? e)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  async function save(id: string, raw: string) {
    const price = raw.trim() === "" ? null : Number(raw);
    if (price !== null && !Number.isFinite(price)) return;
    setRows(prev => prev.map(r => r.id === id ? { ...r, charged: price } : r));
    await fetch("/api/admin/profit", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: id, price }),
    });
    load();
  }

  const ils = (n: number) => `${n.toLocaleString("he-IL")}₪`;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: T.page, padding: "32px 16px 70px",
                            fontFamily: "Heebo, -apple-system, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 27, fontWeight: 900,
                     color: T.dark, margin: "0 0 6px", textAlign: "center" }}>
          💰 רווחיות לפי אירוע
        </h1>
        <p style={{ fontSize: 13.5, color: T.muted, textAlign: "center", margin: "0 0 24px", lineHeight: 1.7 }}>
          העלות נמדדת מ-Meta בפועל, לא מוערכת.<br />
          המספר היחיד שצריך ממך הוא כמה גבית.
        </p>

        {err && <p style={{ color: T.alert, textAlign: "center" }}>{err}</p>}
        {loading && <p style={{ color: T.muted, textAlign: "center" }}>טוען…</p>}

        {totals && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
            {[["הכנסות", ils(totals.revenue), T.dark],
              ["עלויות", ils(totals.cost), T.muted],
              ["רווח", ils(totals.profit), totals.profit >= 0 ? T.olive : T.alert]].map(([l, v, c]) => (
              <div key={l} style={{ background: T.card, border: `1px solid ${T.border}`,
                                    borderRadius: 14, padding: "14px 10px", textAlign: "center" }}>
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 22, fontWeight: 900,
                            margin: 0, color: c as string }}>{v}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: "3px 0 0" }}>{l}</p>
              </div>
            ))}
          </div>
        )}

        {totals && totals.missingPrice > 0 && (
          <p style={{ fontSize: 12.5, color: T.alert, textAlign: "center", margin: "0 0 16px" }}>
            ⚠️ ב-{totals.missingPrice} אירועים לא הוזן מחיר — הרווח שלהם לא נספר
          </p>
        )}

        {rows.map(r => (
          <div key={r.id} style={{ background: T.card, border: `1px solid ${T.border}`,
                                   borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: T.dark }}>
                {r.couple || r.name}
              </span>
              <span style={{ fontSize: 12.5, color: T.muted }}>{r.date}</span>
            </div>
            <div style={{ fontSize: 12.5, color: T.muted, margin: "4px 0 12px" }}>
              {r.sent.toLocaleString("he-IL")} הודעות · עלות {ils(r.cost)}
              {!r.costMeasured && " (טרם נמדדה)"}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label style={{ fontSize: 13, color: T.muted }}>נגבה:</label>
              <input
                type="number" inputMode="numeric" defaultValue={r.charged ?? ""}
                placeholder="—"
                onBlur={e => save(r.id, e.target.value)}
                style={{ width: 110, padding: "9px 12px", borderRadius: 10, minHeight: 40,
                         border: `1px solid ${r.charged == null ? T.gold : T.border}`,
                         background: "#fff", color: T.dark, fontSize: 15, fontFamily: "inherit" }}
              />
              {r.profit != null && (
                <span style={{ fontSize: 15, fontWeight: 800,
                               color: r.profit >= 0 ? T.olive : T.alert }}>
                  רווח {ils(r.profit)}{r.margin != null ? ` · ${r.margin}%` : ""}
                </span>
              )}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 11.5, color: T.muted, textAlign: "center", marginTop: 20, lineHeight: 1.8 }}>
          עלות = חלק האירוע בחיוב היומי של Meta, לפי כמות ההודעות ששלח באותו יום,<br />
          ועוד חלק יחסי במנוי ורסל. שער 3.7₪ לדולר.
        </p>
      </div>
    </div>
  );
}
