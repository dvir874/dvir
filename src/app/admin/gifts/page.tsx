"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, ArrowRight, Gift as GiftIcon, Download } from "lucide-react";
import type { Gift, Guest } from "@/lib/types";

const CARD = { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)", borderRadius: "1.25rem" };
const GOLD = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK = "#333333";

function fmt(n: number) {
  return "₪" + n.toLocaleString("he-IL");
}

function exportCsv(gifts: Gift[]) {
  const header = ["שם אורח", "סכום", "הערות", "תאריך קבלה"].join(",");
  const rows = gifts.map((g) =>
    [`"${g.guest_name}"`, g.amount, `"${g.notes ?? ""}"`, g.received_at ?? ""].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gifts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function GiftsPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ guest_name: "", guest_id: "", amount: "", notes: "", received_at: "" });
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
    const [giftsRes, guestsRes] = await Promise.all([
      fetch(`/api/gifts?event_id=${eventId}`).then((r) => r.json()),
      fetch(`/api/guests?event_id=${eventId}`).then((r) => r.json()),
    ]);
    if (Array.isArray(giftsRes)) setGifts(giftsRes);
    if (Array.isArray(guestsRes)) setGuests(guestsRes);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!eventId || !form.guest_name.trim()) return;
    setSaving(true);
    const payload = {
      event_id: eventId,
      guest_id: form.guest_id || null,
      guest_name: form.guest_name,
      amount: Number(form.amount) || 0,
      notes: form.notes || null,
      received_at: form.received_at || null,
    };

    if (editId) {
      await fetch(`/api/gifts/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditId(null);
    } else {
      await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setForm({ guest_name: "", guest_id: "", amount: "", notes: "", received_at: "" });
    setShowAdd(false);
    await load();
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("למחוק מתנה?")) return;
    await fetch(`/api/gifts/${id}`, { method: "DELETE" });
    await load();
  }

  function startEdit(g: Gift) {
    setForm({
      guest_name: g.guest_name,
      guest_id: g.guest_id ?? "",
      amount: String(g.amount),
      notes: g.notes ?? "",
      received_at: g.received_at ?? "",
    });
    setEditId(g.id);
    setShowAdd(true);
  }

  function handleGuestSelect(guestId: string) {
    const g = guests.find((g) => g.id === guestId);
    setForm((f) => ({ ...f, guest_id: guestId, guest_name: g ? g.name : f.guest_name }));
  }

  const total = gifts.reduce((s, g) => s + g.amount, 0);
  const avg = gifts.length > 0 ? Math.round(total / gifts.length) : 0;
  const highest = gifts.length > 0 ? Math.max(...gifts.map((g) => g.amount)) : 0;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Heebo, sans-serif", color: DARK }}>
      {/* Header */}
      <div style={{ background: "#FDFAF5", borderBottom: "1px solid rgba(197,164,109,0.2)", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a href="/admin" style={{ color: GOLD, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
            <ArrowRight size={16} />
            חזרה לניהול
          </a>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>
            מעקב מתנות
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
          <div style={{ display: "flex", gap: 8 }}>
            {gifts.length > 0 && (
              <button
                onClick={() => exportCsv(gifts)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.35)", background: "white", color: GOLD, cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}
              >
                <Download size={15} />
                ייצוא CSV
              </button>
            )}
            <button
              onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ guest_name: "", guest_id: "", amount: "", notes: "", received_at: "" }); }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${OLIVE},#4A5E3A)`, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}
            >
              <Plus size={15} />
              הוסף מתנה
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            { label: "סה״כ מתנות", value: fmt(total), sub: `${gifts.length} תורמים` },
            { label: "ממוצע למתנה", value: fmt(avg), sub: "" },
            { label: "מתנה גבוהה ביותר", value: fmt(highest), sub: "" },
          ].map((s) => (
            <div key={s.label} style={{ ...CARD, padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: GOLD, fontFamily: "Frank Ruhl Libre, serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(51,51,51,0.55)", marginTop: 4 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize: 11, color: "rgba(51,51,51,0.35)" }}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {showAdd && (
          <div style={{ ...CARD, padding: "1.25rem", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 600 }}>{editId ? "עריכת מתנה" : "מתנה חדשה"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ fontSize: 12, color: "rgba(51,51,51,0.5)", display: "block", marginBottom: 4 }}>בחר אורח (אופציונלי)</label>
                <select
                  value={form.guest_id}
                  onChange={(e) => handleGuestSelect(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
                >
                  <option value="">— אורח חיצוני —</option>
                  {guests.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(51,51,51,0.5)", display: "block", marginBottom: 4 }}>שם (חובה)</label>
                <input
                  placeholder="שם נותן המתנה"
                  value={form.guest_name}
                  onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(51,51,51,0.5)", display: "block", marginBottom: 4 }}>סכום (₪)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "rgba(51,51,51,0.5)", display: "block", marginBottom: 4 }}>תאריך קבלה</label>
                <input
                  type="date"
                  value={form.received_at}
                  onChange={(e) => setForm({ ...form, received_at: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
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

        {/* Gifts list */}
        {loading ? (
          <p style={{ textAlign: "center", color: "rgba(51,51,51,0.4)", padding: "2rem" }}>טוען...</p>
        ) : gifts.length === 0 ? (
          <div style={{ ...CARD, padding: "3rem", textAlign: "center", color: "rgba(51,51,51,0.4)" }}>
            <GiftIcon size={40} style={{ margin: "0 auto 1rem", color: "rgba(197,164,109,0.4)", display: "block" }} />
            <p>אין מתנות רשומות עדיין. לחץ על &quot;הוסף מתנה&quot; כדי להתחיל.</p>
          </div>
        ) : (
          <div style={{ ...CARD, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "rgba(197,164,109,0.07)", borderBottom: "1px solid rgba(197,164,109,0.15)" }}>
                  {["שם", "סכום", "הערות", "תאריך קבלה", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "rgba(51,51,51,0.6)", fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gifts.map((g) => (
                  <tr key={g.id} style={{ borderBottom: "1px solid rgba(197,164,109,0.1)" }}>
                    <td style={{ padding: "0.7rem 1rem", fontWeight: 500 }}>{g.guest_name}</td>
                    <td style={{ padding: "0.7rem 1rem", fontWeight: 700, color: GOLD, fontSize: 14 }}>{fmt(g.amount)}</td>
                    <td style={{ padding: "0.7rem 1rem", color: "rgba(51,51,51,0.5)", fontSize: 12 }}>{g.notes ?? "—"}</td>
                    <td style={{ padding: "0.7rem 1rem", color: "rgba(51,51,51,0.5)", fontSize: 12 }}>
                      {g.received_at ? new Date(g.received_at).toLocaleDateString("he-IL") : "—"}
                    </td>
                    <td style={{ padding: "0.7rem 1rem" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => startEdit(g)} style={{ background: "none", border: "none", cursor: "pointer", color: GOLD, fontSize: 12, fontFamily: "Heebo, sans-serif" }}>עריכה</button>
                        <button onClick={() => remove(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(220,38,38,0.7)" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
