"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Users, ArrowRight, Search, X, AlertTriangle } from "lucide-react";
import type { SeatingTable, SeatingAssignment, Guest } from "@/lib/types";

const CARD = { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)", borderRadius: "1.25rem" };
const GOLD = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK = "#333333";

const CATEGORIES = [
  { value: "general", label: "כללי" },
  { value: "family", label: "משפחה" },
  { value: "friends", label: "חברים" },
  { value: "work", label: "עבודה" },
  { value: "bride", label: "צד כלה" },
  { value: "groom", label: "צד חתן" },
];

const TABLE_TYPES = [
  { value: "round", label: "עגול", emoji: "⭕" },
  { value: "rectangular", label: "מלבני", emoji: "🟥" },
  { value: "custom", label: "מותאם", emoji: "✦" },
];

interface SeatingData {
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  guests: (Guest & { category?: string | null })[];
}

export default function SeatingPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
  const [data, setData] = useState<SeatingData>({ tables: [], assignments: [], guests: [] });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ name: "", capacity: 10, type: "round" });
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
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
    const r = await fetch(`/api/seating?event_id=${eventId}`);
    const d = await r.json();
    if (!d.error) setData(d);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const assignmentsByTable = (tableId: string) =>
    data.assignments.filter((a) => a.table_id === tableId);

  const assignedGuestIds = new Set(data.assignments.map((a) => a.guest_id));

  const guestById = (id: string) => data.guests.find((g) => g.id === id);

  const unassignedGuests = data.guests
    .filter((g) => !assignedGuestIds.has(g.id))
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    .filter((g) => categoryFilter === "all" || (g.category ?? "general") === categoryFilter);

  async function assignGuest(guestId: string, tableId: string | null) {
    if (!eventId) return;
    setSaving(true);
    await fetch("/api/seating/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_id: guestId, table_id: tableId, event_id: eventId }),
    });
    await load();
    setSaving(false);
    setSelectedGuest(null);
  }

  async function addTable() {
    if (!eventId || !newTable.name.trim()) return;
    setSaving(true);
    await fetch("/api/seating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTable, event_id: eventId, sort_order: data.tables.length }),
    });
    setNewTable({ name: "", capacity: 10, type: "round" });
    setShowAddTable(false);
    await load();
    setSaving(false);
  }

  async function deleteTable(id: string) {
    if (!confirm("למחוק שולחן? כל ההצבות יבוטלו.")) return;
    setSaving(true);
    await fetch(`/api/seating/${id}`, { method: "DELETE" });
    await load();
    setSaving(false);
  }

  const totalAssigned = data.assignments.length;
  const totalConfirmed = data.guests.filter((g) => g.status === "confirmed").length;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Heebo, sans-serif", color: DARK }}>
      {/* Header */}
      <div style={{ background: "#FDFAF5", borderBottom: "1px solid rgba(197,164,109,0.2)", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <a href="/admin" style={{ color: GOLD, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
            <ArrowRight size={16} />
            חזרה לניהול
          </a>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>
            סידור הושבה
          </h1>
          {events.length > 1 && (
            <select
              value={eventId ?? ""}
              onChange={(e) => setEventId(e.target.value)}
              style={{ marginRight: "auto", padding: "0.4rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", background: "white", color: DARK, fontSize: 14 }}
            >
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem" }}>
        {/* Stats bar */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "שולחנות", value: data.tables.length },
            { label: "מאורחים מוצבים", value: totalAssigned },
            { label: "מאושרים", value: totalConfirmed },
            { label: "לא מוצבים", value: totalConfirmed - totalAssigned < 0 ? 0 : totalConfirmed - totalAssigned },
          ].map((s) => (
            <div key={s.label} style={{ ...CARD, padding: "0.75rem 1.25rem", display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>{s.value}</span>
              <span style={{ fontSize: 12, color: "rgba(51,51,51,0.55)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem" }}>
          {/* Tables area */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>שולחנות</h2>
              <button
                onClick={() => setShowAddTable(!showAddTable)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${OLIVE},#4A5E3A)`, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}
              >
                <Plus size={15} />
                הוסף שולחן
              </button>
            </div>

            {showAddTable && (
              <div style={{ ...CARD, padding: "1rem", marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                <input
                  placeholder="שם שולחן"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  style={{ flex: 1, minWidth: 120, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
                />
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                  style={{ width: 70, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
                />
                <select
                  value={newTable.type}
                  onChange={(e) => setNewTable({ ...newTable, type: e.target.value })}
                  style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}
                >
                  {TABLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
                <button onClick={addTable} disabled={saving} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", background: GOLD, color: "white", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>
                  צור
                </button>
              </div>
            )}

            {loading && <p style={{ textAlign: "center", color: "rgba(51,51,51,0.4)", padding: "2rem" }}>טוען...</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {data.tables.map((table) => {
                const assigned = assignmentsByTable(table.id);
                const occupancy = assigned.length;
                const over = occupancy > table.capacity;
                const typeIcon = TABLE_TYPES.find((t) => t.value === table.type)?.emoji ?? "⭕";

                return (
                  <div key={table.id} style={{ ...CARD, padding: "1rem", position: "relative" }}>
                    {/* Table header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{typeIcon}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{table.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: over ? "rgba(220,38,38,0.1)" : "rgba(107,123,90,0.1)",
                            color: over ? "rgb(220,38,38)" : OLIVE,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {over && <AlertTriangle size={11} />}
                          {occupancy}/{table.capacity}
                        </span>
                        <button
                          onClick={() => deleteTable(table.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.3)", padding: 2 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Seat slots */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: "0.5rem" }}>
                      {assigned.map((a) => {
                        const g = guestById(a.guest_id);
                        return (
                          <span
                            key={a.id}
                            onClick={() => assignGuest(a.guest_id, null)}
                            title="לחץ להסרה"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 8px",
                              borderRadius: 20,
                              background: "rgba(197,164,109,0.12)",
                              color: DARK,
                              fontSize: 12,
                              cursor: "pointer",
                              border: "1px solid rgba(197,164,109,0.25)",
                            }}
                          >
                            {g?.name ?? a.guest_id}
                            <X size={10} />
                          </span>
                        );
                      })}
                    </div>

                    {/* Drop zone */}
                    {selectedGuest && (
                      <button
                        onClick={() => assignGuest(selectedGuest, table.id)}
                        disabled={saving}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          borderRadius: 8,
                          border: `2px dashed ${GOLD}`,
                          background: "rgba(197,164,109,0.06)",
                          color: GOLD,
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "Heebo, sans-serif",
                          marginTop: 4,
                        }}
                      >
                        ✦ הצב כאן — {guestById(selectedGuest)?.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unassigned guests panel */}
          <div>
            <div style={{ ...CARD, padding: "1rem", position: "sticky", top: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                <Users size={16} style={{ color: GOLD }} />
                <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>לא מוצבים ({unassignedGuests.length})</h2>
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: "0.5rem" }}>
                <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(51,51,51,0.35)" }} />
                <input
                  placeholder="חיפוש אורח..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 2rem 0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.25)", fontFamily: "Heebo, sans-serif", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: "100%", padding: "0.4rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.25)", fontFamily: "Heebo, sans-serif", fontSize: 13, marginBottom: "0.75rem" }}
              >
                <option value="all">כל הקטגוריות</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <p style={{ fontSize: 11, color: "rgba(51,51,51,0.4)", marginBottom: "0.5rem" }}>לחץ על אורח לבחירה, אחר כך לחץ על שולחן</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 500, overflowY: "auto" }}>
                {unassignedGuests.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuest(selectedGuest === g.id ? null : g.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.5rem 0.75rem",
                      borderRadius: 8,
                      border: `1.5px solid ${selectedGuest === g.id ? GOLD : "rgba(197,164,109,0.18)"}`,
                      background: selectedGuest === g.id ? "rgba(197,164,109,0.1)" : "transparent",
                      cursor: "pointer",
                      fontFamily: "Heebo, sans-serif",
                      fontSize: 13,
                      color: DARK,
                      textAlign: "right",
                    }}
                  >
                    <span style={{ color: "rgba(51,51,51,0.45)", fontSize: 11 }}>
                      {CATEGORIES.find((c) => c.value === (g.category ?? "general"))?.label ?? "כללי"}
                    </span>
                    <span>{g.name}</span>
                  </button>
                ))}
                {unassignedGuests.length === 0 && (
                  <p style={{ textAlign: "center", color: "rgba(51,51,51,0.4)", fontSize: 13, padding: "1rem" }}>
                    {data.guests.length === 0 ? "אין אורחים עדיין" : "כל האורחים מוצבים ✓"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
