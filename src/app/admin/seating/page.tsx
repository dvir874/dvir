"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus, Trash2, Users, ArrowRight, Search, X, AlertTriangle,
  Wand2, CheckCircle, Loader2, Tag, Heart, Swords, RefreshCw,
} from "lucide-react";
import type { SeatingTable, SeatingAssignment, Guest } from "@/lib/types";
import { PRESET_TAGS } from "@/lib/seating-ai";
import type { SeatingResult } from "@/lib/seating-ai";

const CARD = { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)", borderRadius: "1.25rem" };
const GOLD = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK = "#333333";

const TABLE_TYPES = [
  { value: "round", label: "עגול", emoji: "⭕" },
  { value: "rectangular", label: "מלבני", emoji: "🟥" },
  { value: "custom", label: "מותאם", emoji: "✦" },
];

const REL_TYPES = [
  { value: "couple",          label: "זוג",             emoji: "❤️", color: "#e11d48" },
  { value: "prefer_together", label: "מעדיפים יחד",    emoji: "🤝", color: OLIVE },
  { value: "conflict",        label: "קונפליקט",        emoji: "⚡", color: "#d97706" },
  { value: "divorced",        label: "גרושים",          emoji: "↔️", color: "#7c3aed" },
];

interface SeatingData {
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  guests: (Guest & { category?: string | null })[];
}

type Tab = "assign" | "tags" | "relationships" | "ai";

export default function SeatingPage() {
  const [eventId,         setEventId]         = useState<string | null>(null);
  const [events,          setEvents]           = useState<{ id: string; name: string }[]>([]);
  const [data,            setData]             = useState<SeatingData>({ tables: [], assignments: [], guests: [] });
  const [loading,         setLoading]          = useState(false);
  const [search,          setSearch]           = useState("");
  const [showAddTable,    setShowAddTable]     = useState(false);
  const [newTable,        setNewTable]         = useState({ name: "", capacity: 10, type: "round" });
  const [selectedGuest,   setSelectedGuest]    = useState<string | null>(null);
  const [saving,          setSaving]           = useState(false);
  const [activeTab,       setActiveTab]        = useState<Tab>("assign");
  const [tagMap,          setTagMap]           = useState<Record<string, string[]>>({});
  const [relationships,   setRelationships]    = useState<{ id: string; guest_id_a: string; guest_id_b: string; type: string }[]>([]);
  const [aiResult,        setAiResult]         = useState<SeatingResult | null>(null);
  const [aiLoading,       setAiLoading]        = useState(false);
  const [relGuestA,       setRelGuestA]        = useState("");
  const [relGuestB,       setRelGuestB]        = useState("");
  const [relType,         setRelType]          = useState("couple");

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
    const [seatingRes, tagsRes, relsRes] = await Promise.all([
      fetch(`/api/seating?event_id=${eventId}`),
      fetch(`/api/seating/tags?event_id=${eventId}`),
      fetch(`/api/seating/relationships?event_id=${eventId}`),
    ]);
    const seatingData = await seatingRes.json();
    const tags        = await tagsRes.json();
    const rels        = await relsRes.json();
    if (!seatingData.error) setData(seatingData);
    if (!tags.error)        setTagMap(tags);
    if (Array.isArray(rels)) setRelationships(rels);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  /* ── Helpers ───────────────────────────────────────────── */
  const assignmentsByTable = (tableId: string) => data.assignments.filter((a) => a.table_id === tableId);
  const assignedGuestIds   = new Set(data.assignments.map((a) => a.guest_id));
  const guestById          = (id: string) => data.guests.find((g) => g.id === id);

  const unassignedGuests = data.guests
    .filter((g) => !assignedGuestIds.has(g.id))
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

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

  async function toggleTag(guestId: string, tag: string) {
    const has = (tagMap[guestId] ?? []).includes(tag);
    setSaving(true);
    await fetch("/api/seating/tags", {
      method: has ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_id: guestId, event_id: eventId, tag }),
    });
    await load();
    setSaving(false);
  }

  async function addRelationship() {
    if (!relGuestA || !relGuestB || relGuestA === relGuestB || !eventId) return;
    setSaving(true);
    await fetch("/api/seating/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, guest_id_a: relGuestA, guest_id_b: relGuestB, type: relType }),
    });
    setRelGuestA(""); setRelGuestB("");
    await load();
    setSaving(false);
  }

  async function deleteRelationship(id: string) {
    await fetch("/api/seating/relationships", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function runAI(apply = false) {
    if (!eventId) return;
    setAiLoading(true);
    const res  = await fetch("/api/seating/ai-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, apply }),
    });
    const result = await res.json();
    setAiResult(result);
    if (apply) await load();
    setAiLoading(false);
    setActiveTab("ai");
  }

  const totalAssigned  = data.assignments.length;
  const totalConfirmed = data.guests.filter((g) => g.status === "confirmed").length;
  const confirmedWithTags = data.guests.filter((g) => g.status === "confirmed" && (tagMap[g.id]?.length ?? 0) > 0).length;

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Heebo, sans-serif", color: DARK }}>

      {/* Header */}
      <div style={{ background: "#FDFAF5", borderBottom: "1px solid rgba(197,164,109,0.2)", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            <a href="/admin" style={{ color: GOLD, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
              <ArrowRight size={16} />חזרה לניהול
            </a>
            <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.5rem", fontWeight: 700, color: DARK, margin: 0 }}>
              סידור הושבה
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
            {/* AI Generate button */}
            <button
              onClick={() => runAI(false)}
              disabled={aiLoading || totalConfirmed === 0 || data.tables.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0.5rem 1rem", borderRadius: 10, border: "none",
                background: aiLoading ? "rgba(197,164,109,0.3)" : "linear-gradient(135deg,#C5A46D,#A07840)",
                color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif",
                opacity: totalConfirmed === 0 || data.tables.length === 0 ? 0.4 : 1,
              }}
            >
              {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              ✨ תכנית AI
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {([
              { key: "assign" as Tab,        label: "הצבה ידנית",      icon: Users },
              { key: "tags" as Tab,           label: "תיוג אורחים",      icon: Tag },
              { key: "relationships" as Tab,  label: "קשרים",            icon: Heart },
              { key: "ai" as Tab,             label: "תכנית AI",         icon: Wand2 },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "0.45rem 0.9rem", borderRadius: "8px 8px 0 0",
                  border: activeTab === key ? "1px solid rgba(197,164,109,0.3)" : "1px solid transparent",
                  borderBottom: activeTab === key ? "1px solid #FDFAF5" : "1px solid rgba(197,164,109,0.25)",
                  background: activeTab === key ? "#FDFAF5" : "transparent",
                  color: activeTab === key ? DARK : "rgba(51,51,51,0.55)",
                  cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif",
                  marginBottom: activeTab === key ? -1 : 0,
                }}
              >
                <Icon size={13} />{label}
                {key === "ai" && aiResult && (
                  <span style={{ background: aiResult.score >= 75 ? OLIVE : GOLD, color: "white", borderRadius: 20, padding: "0 6px", fontSize: 11 }}>
                    {aiResult.score}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "שולחנות",     value: data.tables.length },
            { label: "מוצבים",      value: totalAssigned },
            { label: "מאושרים",     value: totalConfirmed },
            { label: "לא מוצבים",  value: Math.max(0, totalConfirmed - totalAssigned) },
            { label: "מתויגים",     value: confirmedWithTags },
            { label: "קשרים",       value: relationships.length },
          ].map((s) => (
            <div key={s.label} style={{ ...CARD, padding: "0.65rem 1rem" }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: GOLD, display: "block" }}>{s.value}</span>
              <span style={{ fontSize: 11, color: "rgba(51,51,51,0.55)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── TAB: Manual Assign ─────────────────────────── */}
        {activeTab === "assign" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>שולחנות</h2>
                <button
                  onClick={() => setShowAddTable(!showAddTable)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${OLIVE},#4A5E3A)`, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}
                >
                  <Plus size={15} />הוסף שולחן
                </button>
              </div>

              {showAddTable && (
                <div style={{ ...CARD, padding: "1rem", marginBottom: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                  <input placeholder="שם שולחן" value={newTable.name} onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                    style={{ flex: 1, minWidth: 120, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }} />
                  <input type="number" min={1} max={30} value={newTable.capacity} onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                    style={{ width: 70, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }} />
                  <select value={newTable.type} onChange={(e) => setNewTable({ ...newTable, type: e.target.value })}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}>
                    {TABLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select>
                  <button onClick={addTable} disabled={saving} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", background: GOLD, color: "white", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>צור</button>
                </div>
              )}

              {loading && <p style={{ textAlign: "center", color: "rgba(51,51,51,0.4)", padding: "2rem" }}>טוען...</p>}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                {data.tables.map((table) => {
                  const assigned  = assignmentsByTable(table.id);
                  const occupancy = assigned.length;
                  const over      = occupancy > table.capacity;
                  const typeIcon  = TABLE_TYPES.find((t) => t.value === table.type)?.emoji ?? "⭕";

                  return (
                    <div key={table.id} style={{ ...CARD, padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{typeIcon}</span>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{table.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: over ? "rgba(220,38,38,0.1)" : "rgba(107,123,90,0.1)", color: over ? "rgb(220,38,38)" : OLIVE, display: "flex", alignItems: "center", gap: 4 }}>
                            {over && <AlertTriangle size={11} />}{occupancy}/{table.capacity}
                          </span>
                          <button onClick={() => deleteTable(table.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.3)", padding: 2 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: "0.5rem" }}>
                        {assigned.map((a) => {
                          const g = guestById(a.guest_id);
                          const gTags = tagMap[a.guest_id] ?? [];
                          const tagEmoji = gTags.length > 0 ? (PRESET_TAGS.find((t) => t.value === gTags[0])?.emoji ?? "") : "";
                          return (
                            <span key={a.id} onClick={() => assignGuest(a.guest_id, null)} title="לחץ להסרה"
                              style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 20, background: "rgba(197,164,109,0.12)", color: DARK, fontSize: 12, cursor: "pointer", border: "1px solid rgba(197,164,109,0.25)" }}>
                              {tagEmoji && <span>{tagEmoji}</span>}
                              {g?.name ?? a.guest_id}
                              <X size={10} />
                            </span>
                          );
                        })}
                      </div>
                      {selectedGuest && (
                        <button onClick={() => assignGuest(selectedGuest, table.id)} disabled={saving}
                          style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: `2px dashed ${GOLD}`, background: "rgba(197,164,109,0.06)", color: GOLD, cursor: "pointer", fontSize: 12, fontFamily: "Heebo, sans-serif", marginTop: 4 }}>
                          ✦ הצב כאן — {guestById(selectedGuest)?.name}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unassigned guests */}
            <div>
              <div style={{ ...CARD, padding: "1rem", position: "sticky", top: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                  <Users size={16} style={{ color: GOLD }} />
                  <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>לא מוצבים ({unassignedGuests.length})</h2>
                </div>
                <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                  <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(51,51,51,0.35)" }} />
                  <input placeholder="חיפוש..." value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem 2rem 0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.25)", fontFamily: "Heebo, sans-serif", fontSize: 13, boxSizing: "border-box" }} />
                </div>
                <p style={{ fontSize: 11, color: "rgba(51,51,51,0.4)", marginBottom: "0.5rem" }}>לחץ על אורח לבחירה, אחר כך על שולחן</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 500, overflowY: "auto" }}>
                  {unassignedGuests.map((g) => {
                    const gTags = tagMap[g.id] ?? [];
                    return (
                      <button key={g.id} onClick={() => setSelectedGuest(selectedGuest === g.id ? null : g.id)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: 8, border: `1.5px solid ${selectedGuest === g.id ? GOLD : "rgba(197,164,109,0.18)"}`, background: selectedGuest === g.id ? "rgba(197,164,109,0.1)" : "transparent", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13, color: DARK, textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 3 }}>
                          {gTags.slice(0, 2).map((t) => (
                            <span key={t} title={PRESET_TAGS.find((pt) => pt.value === t)?.label}>
                              {PRESET_TAGS.find((pt) => pt.value === t)?.emoji ?? ""}
                            </span>
                          ))}
                        </div>
                        <span>{g.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Guest Tags ─────────────────────────────── */}
        {activeTab === "tags" && (
          <div>
            <p style={{ marginBottom: "1rem", fontSize: 14, color: "rgba(51,51,51,0.6)" }}>
              תייגו כל אורח כדי שה-AI יוכל לקבץ חברים, משפחות ולהפריד בין קונפליקטים.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.75rem" }}>
              {data.guests.filter((g) => g.status === "confirmed").map((g) => {
                const gTags = tagMap[g.id] ?? [];
                return (
                  <div key={g.id} style={{ ...CARD, padding: "0.875rem 1rem" }}>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: "0.5rem" }}>{g.name}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {PRESET_TAGS.map((pt) => {
                        const active = gTags.includes(pt.value);
                        return (
                          <button
                            key={pt.value}
                            onClick={() => toggleTag(g.id, pt.value)}
                            disabled={saving}
                            style={{
                              padding: "3px 8px", borderRadius: 20, fontSize: 11,
                              border: `1px solid ${active ? OLIVE : "rgba(197,164,109,0.3)"}`,
                              background: active ? "rgba(107,123,90,0.12)" : "transparent",
                              color: active ? OLIVE : "rgba(51,51,51,0.55)",
                              cursor: "pointer", fontFamily: "Heebo, sans-serif",
                              display: "flex", alignItems: "center", gap: 3,
                            }}
                          >
                            {pt.emoji} {pt.label}
                            {active && <X size={9} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {data.guests.filter((g) => g.status === "confirmed").length === 0 && (
                <p style={{ color: "rgba(51,51,51,0.4)", fontSize: 14 }}>אין אורחים מאושרים עדיין</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: Relationships ──────────────────────────── */}
        {activeTab === "relationships" && (
          <div style={{ maxWidth: 700 }}>
            <p style={{ marginBottom: "1rem", fontSize: 14, color: "rgba(51,51,51,0.6)" }}>
              סמנו זוגות שצריכים לשבת יחד, ואנשים שחייבים להיות מופרדים.
            </p>

            {/* Add relationship form */}
            <div style={{ ...CARD, padding: "1rem", marginBottom: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <select value={relGuestA} onChange={(e) => setRelGuestA(e.target.value)}
                style={{ flex: 1, minWidth: 130, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>
                <option value="">בחר אורח א׳</option>
                {data.guests.filter((g) => g.status === "confirmed").map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <select value={relType} onChange={(e) => setRelType(e.target.value)}
                style={{ padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>
                {REL_TYPES.map((r) => <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>)}
              </select>
              <select value={relGuestB} onChange={(e) => setRelGuestB(e.target.value)}
                style={{ flex: 1, minWidth: 130, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 13 }}>
                <option value="">בחר אורח ב׳</option>
                {data.guests.filter((g) => g.status === "confirmed" && g.id !== relGuestA).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <button onClick={addRelationship} disabled={saving || !relGuestA || !relGuestB}
                style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", background: OLIVE, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif", opacity: !relGuestA || !relGuestB ? 0.4 : 1 }}>
                <Plus size={14} />
              </button>
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {relationships.map((rel) => {
                const nameA = guestById(rel.guest_id_a)?.name ?? rel.guest_id_a;
                const nameB = guestById(rel.guest_id_b)?.name ?? rel.guest_id_b;
                const rt    = REL_TYPES.find((r) => r.value === rel.type);
                return (
                  <div key={rel.id} style={{ ...CARD, padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: 18 }}>{rt?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{nameA} ↔ {nameB}</p>
                      <p style={{ fontSize: 11, color: "rgba(51,51,51,0.5)" }}>{rt?.label}</p>
                    </div>
                    <button onClick={() => deleteRelationship(rel.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.3)" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
              {relationships.length === 0 && (
                <p style={{ color: "rgba(51,51,51,0.4)", fontSize: 14 }}>לא הוגדרו קשרים עדיין</p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: AI Result ──────────────────────────────── */}
        {activeTab === "ai" && (
          <div style={{ maxWidth: 800 }}>
            {!aiResult && !aiLoading && (
              <div style={{ ...CARD, padding: "2.5rem", textAlign: "center" }}>
                <Wand2 size={40} style={{ color: GOLD, margin: "0 auto 1rem" }} />
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  מנוע ההושבה החכם
                </p>
                <p style={{ color: "rgba(51,51,51,0.55)", fontSize: 14, marginBottom: "1.5rem" }}>
                  תייגו את האורחים וסמנו קשרים, אחר כך לחצו לקבלת תכנית הושבה אוטומטית.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => runAI(false)} disabled={totalConfirmed === 0 || data.tables.length === 0}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.75rem 1.5rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#A07840)`, color: "white", cursor: "pointer", fontSize: 14, fontFamily: "Heebo, sans-serif" }}>
                    <Wand2 size={15} />✨ הצג תצוגה מקדימה
                  </button>
                </div>
              </div>
            )}

            {aiLoading && (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <Loader2 size={36} style={{ color: GOLD, animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
                <p style={{ color: "rgba(51,51,51,0.55)" }}>מחשב תכנית הושבה מיטבית...</p>
              </div>
            )}

            {aiResult && !aiLoading && (
              <div>
                {/* Score card */}
                <div style={{ ...CARD, padding: "1.5rem", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                    <div style={{
                      width: 90, height: 90, borderRadius: "50%", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                      background: aiResult.score >= 80 ? "rgba(107,123,90,0.10)" : aiResult.score >= 50 ? "rgba(197,164,109,0.12)" : "rgba(200,50,50,0.08)",
                      border: `2px solid ${aiResult.score >= 80 ? OLIVE : aiResult.score >= 50 ? GOLD : "rgba(200,50,50,0.3)"}`,
                    }}>
                      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "Frank Ruhl Libre, serif", color: aiResult.score >= 80 ? OLIVE : aiResult.score >= 50 ? "#A07840" : "rgb(180,50,50)", lineHeight: 1 }}>
                        {aiResult.score}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(51,51,51,0.55)" }}>/ 100</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                        ציון תכנית הושבה
                      </p>
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <Stat label="קבוצות בשולחן אחד" value={`${aiResult.groupsSatisfied}/${aiResult.groupsTotal}`} />
                        <Stat label="קונפליקטים שנפגשים" value={aiResult.conflictsViolated} color={aiResult.conflictsViolated > 0 ? "rgb(200,50,50)" : OLIVE} />
                        <Stat label="שולחנות מלאים מדי" value={aiResult.tablesOverCapacity} color={aiResult.tablesOverCapacity > 0 ? "#d97706" : OLIVE} />
                        <Stat label="זוגות מופרדים" value={aiResult.couplesSplit} color={aiResult.couplesSplit > 0 ? "rgb(200,50,50)" : OLIVE} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {aiResult.strengths.length > 0 && (
                  <div style={{ ...CARD, padding: "1rem", marginBottom: "0.75rem" }}>
                    {aiResult.strengths.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.35rem 0", borderBottom: i < aiResult.strengths.length - 1 ? "1px solid rgba(197,164,109,0.1)" : "none" }}>
                        <CheckCircle size={14} style={{ color: OLIVE, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: DARK }}>{s.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {aiResult.warnings.length > 0 && (
                  <div style={{ ...CARD, padding: "1rem", marginBottom: "1.25rem" }}>
                    {aiResult.warnings.map((w, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0.35rem 0", borderBottom: i < aiResult.warnings.length - 1 ? "1px solid rgba(197,164,109,0.1)" : "none" }}>
                        {w.severity === "error"
                          ? <Swords size={14} style={{ color: "rgb(200,50,50)", flexShrink: 0, marginTop: 2 }} />
                          : <AlertTriangle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />}
                        <span style={{ fontSize: 13, color: DARK }}>{w.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button onClick={() => runAI(true)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.75rem 1.5rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${OLIVE},#4A5E3A)`, color: "white", cursor: "pointer", fontSize: 14, fontFamily: "Heebo, sans-serif" }}>
                    <CheckCircle size={15} />החל תכנית על השולחנות
                  </button>
                  <button onClick={() => runAI(false)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.75rem 1.25rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.3)", background: "transparent", color: DARK, cursor: "pointer", fontSize: 14, fontFamily: "Heebo, sans-serif" }}>
                    <RefreshCw size={14} />חשב מחדש
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 18, fontWeight: 700, color: color ?? DARK, fontFamily: "Frank Ruhl Libre, serif", lineHeight: 1.2 }}>{value}</p>
      <p style={{ fontSize: 11, color: "rgba(51,51,51,0.5)" }}>{label}</p>
    </div>
  );
}
