"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, ArrowRight, TrendingUp, AlertTriangle, Check } from "lucide-react";
import type { BudgetItem } from "@/lib/types";

const CARD = { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)", borderRadius: "1.25rem" };
const GOLD = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK = "#333333";

const CATEGORIES = [
  "אולם", "קייטרינג", "צלם", "וידאוגרף", "תקליטן", "פרחים",
  "שמלת כלה", "חליפת חתן", "מוזיקה חיה", "הסעות", "כרטיסי הזמנה", "אחר",
];

const CATEGORY_COLORS: Record<string, string> = {
  "אולם": "#8B5CF6", "קייטרינג": "#F59E0B", "צלם": "#3B82F6",
  "וידאוגרף": "#10B981", "תקליטן": "#EC4899", "פרחים": "#EF4444",
  "שמלת כלה": "#F472B6", "חליפת חתן": "#6366F1", "מוזיקה חיה": "#14B8A6",
  "הסעות": "#F97316", "כרטיסי הזמנה": "#84CC16", "אחר": "#94A3B8",
};

function fmt(n: number) {
  return "₪" + n.toLocaleString("he-IL");
}

export default function BudgetPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ category: CATEGORIES[0], description: "", planned_amount: "", actual_amount: "", notes: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setEvents(d.map((e: { id: string; name: string }) => ({ id: e.id, name: e.name })));
          if (d.length > 0) setEventId(d[0].id);
        }
      });
  }, []);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    const r = await fetch(`/api/budget?event_id=${eventId}`);
    const d = await r.json();
    if (Array.isArray(d)) setItems(d);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!eventId || !form.description.trim()) return;
    setSaving(true);
    const payload = {
      event_id: eventId,
      category: form.category,
      description: form.description,
      planned_amount: Number(form.planned_amount) || 0,
      actual_amount: form.actual_amount ? Number(form.actual_amount) : null,
      notes: form.notes || null,
    };

    if (editId) {
      await fetch(`/api/budget/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditId(null);
    } else {
      await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ category: CATEGORIES[0], description: "", planned_amount: "", actual_amount: "", notes: "" });
    setShowAdd(false);
    await load();
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("למחוק פריט?")) return;
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(item: BudgetItem) {
    setForm({
      category: item.category,
      description: item.description,
      planned_amount: String(item.planned_amount),
      actual_amount: item.actual_amount != null ? String(item.actual_amount) : "",
      notes: item.notes ?? "",
    });
    setEditId(item.id);
    setShowAdd(true);
  }

  const totalPlanned = items.reduce((s, i) => s + i.planned_amount, 0);
  const totalActual = items.reduce((s, i) => s + (i.actual_amount ?? 0), 0);
  const remaining = totalPlanned - totalActual;

  // Category breakdown for pie-like summary
  const byCategory = CATEGORIES.map((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    return {
      cat,
      planned: catItems.reduce((s, i) => s + i.planned_amount, 0),
      actual: catItems.reduce((s, i) => s + (i.actual_amount ?? 0), 0),
    };
  }).filter((c) => c.planned > 0 || c.actual > 0);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Heebo, sans-serif", color: DARK }}>
      {/* Header */}
      <div style={{ background: "#FDFAF5", borderBottom: "1px solid rgba(197,164,109,0.2)", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a href="/admin" style={{ color: GOLD, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
            <ArrowRight size={16} />
            חזרה לניהול
          </a>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>
            ניהול תקציב
          </h1>
          {events.length > 1 && (
            <select
              value={eventId ?? ""}
              onChange={(e) => setEventId(e.target.value)}
              style={{ marginRight: "auto", padding: "0.4rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", background: "white", fontSize: 14 }}
            >
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          <button
            onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ category: CATEGORIES[0], description: "", planned_amount: "", actual_amount: "", notes: "" }); }}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${OLIVE},#4A5E3A)`, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}
          >
            <Plus size={15} />
            הוסף פריט
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem" }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "תקציב מתוכנן", value: fmt(totalPlanned), color: GOLD },
            { label: "הוצאה בפועל", value: fmt(totalActual), color: totalActual > totalPlanned ? "rgb(220,38,38)" : OLIVE },
            { label: remaining >= 0 ? "נשאר בתקציב" : "חריגה מהתקציב", value: fmt(Math.abs(remaining)), color: remaining >= 0 ? OLIVE : "rgb(220,38,38)" },
          ].map((s) => (
            <div key={s.label} style={{ ...CARD, padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "Frank Ruhl Libre, serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(51,51,51,0.55)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category bars */}
        {byCategory.length > 0 && (
          <div style={{ ...CARD, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} style={{ color: GOLD }} />
              פירוט לפי קטגוריה
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {byCategory.sort((a, b) => b.planned - a.planned).map(({ cat, planned, actual }) => {
                const pct = totalPlanned > 0 ? (planned / totalPlanned) * 100 : 0;
                const actPct = planned > 0 ? Math.min((actual / planned) * 100, 120) : 0;
                const over = actual > planned;
                return (
                  <div key={cat}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: CATEGORY_COLORS[cat] ?? GOLD, display: "inline-block" }} />
                        {cat}
                      </span>
                      <span style={{ color: over ? "rgb(220,38,38)" : "rgba(51,51,51,0.6)" }}>
                        {fmt(actual)} / {fmt(planned)} ({Math.round(pct)}%)
                        {over && <AlertTriangle size={11} style={{ marginRight: 4, color: "rgb(220,38,38)" }} />}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: "rgba(197,164,109,0.15)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${actPct}%`, background: over ? "rgb(220,38,38)" : CATEGORY_COLORS[cat] ?? GOLD, borderRadius: 4, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add/Edit form */}
        {showAdd && (
          <div style={{ ...CARD, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 600 }}>{editId ? "עריכת פריט" : "פריט חדש"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                placeholder="תיאור"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
              />
              <input
                type="number"
                placeholder="תקציב מתוכנן (₪)"
                value={form.planned_amount}
                onChange={(e) => setForm({ ...form, planned_amount: e.target.value })}
                style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
              />
              <input
                type="number"
                placeholder="עלות בפועל (₪) — אופציונלי"
                value={form.actual_amount}
                onChange={(e) => setForm({ ...form, actual_amount: e.target.value })}
                style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
              />
            </div>
            <input
              placeholder="הערות (אופציונלי)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, marginBottom: "0.75rem", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} disabled={saving} style={{ padding: "0.5rem 1.25rem", borderRadius: 8, border: "none", background: GOLD, color: "white", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>
                {editId ? "שמור שינויים" : "הוסף"}
              </button>
              <button onClick={() => { setShowAdd(false); setEditId(null); }} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.25)", background: "white", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* Items table */}
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(51,51,51,0.4)", padding: "2rem" }}>טוען...</p>
        ) : items.length === 0 ? (
          <div style={{ ...CARD, padding: "3rem", textAlign: "center", color: "rgba(51,51,51,0.4)" }}>
            <TrendingUp size={40} style={{ margin: "0 auto 1rem", color: "rgba(197,164,109,0.4)", display: "block" }} />
            <p>אין פריטי תקציב עדיין. לחץ על &quot;הוסף פריט&quot; כדי להתחיל.</p>
          </div>
        ) : (
          <div style={{ ...CARD, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(197,164,109,0.07)", borderBottom: "1px solid rgba(197,164,109,0.15)" }}>
                  {["קטגוריה", "תיאור", "מתוכנן", "בפועל", "הפרש", "הערות", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "rgba(51,51,51,0.6)", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const diff = item.actual_amount != null ? item.planned_amount - item.actual_amount : null;
                  const over = diff != null && diff < 0;
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid rgba(197,164,109,0.1)" }}>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 20, background: `${CATEGORY_COLORS[item.category] ?? GOLD}18`, color: CATEGORY_COLORS[item.category] ?? GOLD, fontWeight: 600, fontSize: 11 }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ padding: "0.7rem 1rem" }}>{item.description}</td>
                      <td style={{ padding: "0.7rem 1rem", fontWeight: 600 }}>{fmt(item.planned_amount)}</td>
                      <td style={{ padding: "0.7rem 1rem", color: over ? "rgb(220,38,38)" : item.actual_amount != null ? OLIVE : "rgba(51,51,51,0.35)" }}>
                        {item.actual_amount != null ? fmt(item.actual_amount) : "—"}
                      </td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        {diff != null ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, color: over ? "rgb(220,38,38)" : OLIVE, fontWeight: 600 }}>
                            {over ? <AlertTriangle size={12} /> : <Check size={12} />}
                            {over ? "-" : "+"}{fmt(Math.abs(diff))}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "0.7rem 1rem", color: "rgba(51,51,51,0.5)", fontSize: 12 }}>{item.notes ?? "—"}</td>
                      <td style={{ padding: "0.7rem 1rem" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => startEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", color: GOLD, fontSize: 12, fontFamily: "Heebo, sans-serif" }}>עריכה</button>
                          <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(220,38,38,0.7)" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
