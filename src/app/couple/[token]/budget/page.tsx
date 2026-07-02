"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import CoupleBottomNav from "@/components/CoupleBottomNav";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
  red:    "#B85C38",
};

const CATEGORIES = [
  "אולם וקייטרינג", "צלם וידאו", "צלם סטילס", "דיג'יי / להקה", "שמלת כלה",
  "חליפת חתן", "עיצוב ופרחים", "איפור ושיער", "טבעות", "הזמנות ומיתוג",
  "רב / עורך טקס", "הסעות", "ירח דבש", "אחר",
];

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  planned_amount: number;
  actual_amount: number | null;
}

export default function CoupleBudgetPage() {
  const { token } = useParams<{ token: string }>();
  const [items, setItems]     = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat]       = useState(CATEGORIES[0]);
  const [newDesc, setNewDesc]     = useState("");
  const [newPlanned, setNewPlanned] = useState("");

  const load = useCallback(() => {
    fetch(`/api/couple/${token}/budget`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (Array.isArray(d)) setItems(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(load, [load]);

  async function addItem() {
    const planned = Number(newPlanned);
    if (!planned || planned <= 0) return;
    await fetch(`/api/couple/${token}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: newCat, description: newDesc.trim() || newCat, planned_amount: planned }),
    });
    setNewDesc(""); setNewPlanned(""); setShowAdd(false);
    load();
  }

  async function updateActual(id: string, value: string) {
    const actual = value === "" ? null : Number(value);
    if (actual !== null && (isNaN(actual) || actual < 0)) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, actual_amount: actual } : i));
    await fetch(`/api/couple/${token}/budget`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actual_amount: actual }),
    });
  }

  async function removeItem(id: string) {
    if (!confirm("למחוק את הסעיף?")) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await fetch(`/api/couple/${token}/budget?id=${id}`, { method: "DELETE" });
  }

  const totalPlanned = items.reduce((s, i) => s + (i.planned_amount ?? 0), 0);
  const totalActual  = items.reduce((s, i) => s + (i.actual_amount ?? 0), 0);
  const diff = totalPlanned - totalActual;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "'Heebo', sans-serif", paddingBottom: 120 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        input, select { font-family: 'Heebo', sans-serif; }
        input:focus, select:focus { outline: none; border-color: ${C.gold} !important; }
        .actual-input { width: 90px; padding: 8px 10px; border: 1.5px solid ${C.border}; border-radius: 10px; font-size: 14px; text-align: center; background: #fff; color: ${C.dark}; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <a href={`/couple/${token}`} style={{ color: C.dark, minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowRight size={22} />
        </a>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 20, fontWeight: 700, color: C.dark, margin: 0 }}>
          💰 ניהול תקציב
        </h1>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>

        {/* Summary card */}
        <div style={{ background: C.cream, borderRadius: 20, padding: "20px", border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: C.dark, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>₪{totalPlanned.toLocaleString()}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>מתוכנן</p>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: C.goldT, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>₪{totalActual.toLocaleString()}</p>
              <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>שולם בפועל</p>
            </div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 900, color: diff >= 0 ? C.green : C.red, margin: 0, fontFamily: "'Frank Ruhl Libre', serif" }}>
                {diff >= 0 ? "" : "−"}₪{Math.abs(diff).toLocaleString()}
              </p>
              <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{diff >= 0 ? "נותר" : "חריגה"}</p>
            </div>
          </div>
          {totalPlanned > 0 && (
            <div style={{ marginTop: 14, height: 8, background: "rgba(28,16,8,0.06)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, Math.round((totalActual / totalPlanned) * 100))}%`, background: totalActual > totalPlanned ? C.red : C.gold, borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          )}
        </div>

        {/* Items */}
        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, fontSize: 14, padding: 40 }}>טוען...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>💰</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: C.dark, margin: "0 0 6px" }}>עוד אין סעיפי תקציב</p>
            <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>הוסיפו את ההוצאות הצפויות — אולם, צלם, שמלה — ועקבו אחרי התשלומים</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(item => {
              const paid = item.actual_amount ?? 0;
              const over = paid > item.planned_amount;
              return (
                <div key={item.id} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: C.dark, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description}</p>
                      <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{item.category} · מתוכנן ₪{item.planned_amount.toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} aria-label="מחק"
                      style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 6, flexShrink: 0 }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                    <label style={{ fontSize: 13, color: C.muted }}>שולם:</label>
                    <input
                      className="actual-input"
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      defaultValue={item.actual_amount ?? ""}
                      onBlur={e => updateActual(item.id, e.target.value)}
                    />
                    {over && <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>חריגה של ₪{(paid - item.planned_amount).toLocaleString()}</span>}
                    {!over && paid > 0 && paid >= item.planned_amount && <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ שולם במלואו</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add form */}
        {showAdd ? (
          <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${C.gold}`, padding: "16px", marginTop: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.dark, margin: "0 0 12px" }}>סעיף חדש</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={newCat} onChange={e => setNewCat(e.target.value)}
                style={{ padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 15, background: "#fff", color: C.dark }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input placeholder="תיאור (לא חובה)" value={newDesc} onChange={e => setNewDesc(e.target.value)}
                style={{ padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 15 }} />
              <input placeholder="סכום מתוכנן ₪" type="number" inputMode="numeric" value={newPlanned} onChange={e => setNewPlanned(e.target.value)}
                style={{ padding: "11px 14px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 15 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addItem}
                  style={{ flex: 1, padding: "13px", background: C.gold, color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  הוסף
                </button>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding: "13px 20px", background: "none", color: C.muted, border: `1.5px solid ${C.border}`, borderRadius: 12, fontSize: 14, cursor: "pointer" }}>
                  ביטול
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 16, padding: "14px", background: "none", border: `1.5px dashed ${C.gold}`, borderRadius: 14, color: C.goldT, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Heebo', sans-serif" }}>
            <Plus size={17} /> הוסיפו סעיף תקציב
          </button>
        )}
      </div>

      <CoupleBottomNav token={token} />
    </div>
  );
}
