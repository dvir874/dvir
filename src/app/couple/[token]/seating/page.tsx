"use client";

import { use, useEffect, useState, useCallback } from "react";
import { Plus, Users, ArrowRight, Search } from "lucide-react";
import SeatingFloorPlan from "@/components/SeatingFloorPlan";
import HelpButton from "@/components/HelpButton";

const GOLD  = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK  = "#1C1008";
const CREAM = "#F2EDE3";
const CARD  = { background: "rgba(255,255,255,0.92)", border: "1px solid rgba(197,164,109,0.18)", borderRadius: "1.25rem" };

const TABLE_TYPES = [
  { value: "round",       label: "עגול"   },
  { value: "rectangular", label: "מלבני"  },
];

interface SeatingTable      { id: string; name: string; capacity: number; type: string; sort_order: number }
interface SeatingAssignment { id: string; guest_id: string; table_id: string }
interface Guest             { id: string; name: string; guest_count: number; status?: string; phone?: string | null }
interface SeatingData { tables: SeatingTable[]; assignments: SeatingAssignment[]; guests: Guest[] }

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}

function RoundTableSVG({ table, assigned, capacity, guestById, onRemoveGuest }: {
  table: SeatingTable; assigned: SeatingAssignment[]; capacity: number;
  guestById: (id: string) => Guest | undefined; onRemoveGuest: (id: string) => void;
}) {
  const cx = 60, cy = 60, tableR = 38, seatR = 9, orbitR = 54;
  const seats = Array.from({ length: capacity }, (_, i) => {
    const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
    const assignment = assigned[i];
    const guest = assignment ? guestById(assignment.guest_id) : undefined;
    return { x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle), assignment, guest };
  });
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} style={{ overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={tableR} fill="#FDF8EF" stroke={GOLD} strokeWidth={1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={9} fill={DARK} fontFamily="Frank Ruhl Libre, serif" fontWeight={700}>{table.name}</text>
      {seats.map(({ x, y, assignment, guest }, i) => (
        <g key={i} onClick={assignment ? () => onRemoveGuest(assignment.guest_id) : undefined} style={{ cursor: assignment ? "pointer" : "default" }}>
          <circle cx={x} cy={y} r={seatR} fill={guest ? OLIVE : "rgba(197,164,109,0.15)"} stroke={guest ? OLIVE : "rgba(197,164,109,0.3)"} strokeWidth={1} />
          {guest && <text x={x} y={y + 3.5} textAnchor="middle" fontSize={6} fill="white" fontFamily="Heebo, sans-serif" fontWeight={600} style={{ pointerEvents: "none" }}>{getInitials(guest.name)}</text>}
        </g>
      ))}
    </svg>
  );
}

function RectTableSVG({ table, assigned, capacity, guestById, onRemoveGuest }: {
  table: SeatingTable; assigned: SeatingAssignment[]; capacity: number;
  guestById: (id: string) => Guest | undefined; onRemoveGuest: (id: string) => void;
}) {
  const seatR = 8, rectX = 20, rectY = 25, rectW = 120, rectH = 50;
  const totalW = rectX * 2 + rectW, totalH = rectY * 2 + rectH;
  const topCount = Math.ceil(capacity / 2), botCount = Math.floor(capacity / 2);
  const topSeats = Array.from({ length: topCount }, (_, i) => {
    const assignment = assigned[i]; const guest = assignment ? guestById(assignment.guest_id) : undefined;
    return { x: rectX + (rectW / (topCount + 1)) * (i + 1), y: rectY - seatR - 2, assignment, guest };
  });
  const botSeats = Array.from({ length: botCount }, (_, i) => {
    const assignment = assigned[topCount + i]; const guest = assignment ? guestById(assignment.guest_id) : undefined;
    return { x: rectX + (rectW / (botCount + 1)) * (i + 1), y: rectY + rectH + seatR + 2, assignment, guest };
  });
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} width={totalW} height={totalH} style={{ overflow: "visible" }}>
      <rect x={rectX} y={rectY} width={rectW} height={rectH} rx={8} fill="#FDF8EF" stroke={GOLD} strokeWidth={1.5} />
      <text x={rectX + rectW / 2} y={rectY + rectH / 2 + 5} textAnchor="middle" fontSize={10} fill={DARK} fontFamily="Frank Ruhl Libre, serif" fontWeight={700}>{table.name}</text>
      {[...topSeats, ...botSeats].map(({ x, y, assignment, guest }, i) => (
        <g key={i} onClick={assignment ? () => onRemoveGuest(assignment.guest_id) : undefined} style={{ cursor: assignment ? "pointer" : "default" }}>
          <circle cx={x} cy={y} r={seatR} fill={guest ? OLIVE : "rgba(197,164,109,0.15)"} stroke={guest ? OLIVE : "rgba(197,164,109,0.3)"} strokeWidth={1} />
          {guest && <text x={x} y={y + 3.5} textAnchor="middle" fontSize={5.5} fill="white" fontFamily="Heebo, sans-serif" fontWeight={600} style={{ pointerEvents: "none" }}>{getInitials(guest.name)}</text>}
        </g>
      ))}
    </svg>
  );
}

export default function CoupleSeatingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data,          setData]          = useState<SeatingData>({ tables: [], assignments: [], guests: [] });
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [search,        setSearch]        = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [showAddTable,   setShowAddTable]   = useState(false);
  const [newTable,       setNewTable]       = useState({ name: "", capacity: 10, type: "round" });
  const [showSimulator,  setShowSimulator]  = useState(false);
  const [simExpanded,    setSimExpanded]    = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/couple/${token}/seating`);
    const d = await res.json();
    if (!d.error) setData(d);
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const assignmentsByTable = (tableId: string) => data.assignments.filter(a => a.table_id === tableId);
  const assignedIds = new Set(data.assignments.map(a => a.guest_id));
  const guestById   = (id: string) => data.guests.find(g => g.id === id);
  const unassigned  = data.guests.filter(g => !assignedIds.has(g.id) && g.name.toLowerCase().includes(search.toLowerCase()));

  async function assignGuest(guestId: string, tableId: string | null) {
    setSaving(true);
    await fetch(`/api/couple/${token}/seating/assign`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_id: guestId, table_id: tableId }),
    });
    await load(); setSaving(false); setSelectedGuest(null);
  }

  async function addTable() {
    if (!newTable.name.trim()) return;
    setSaving(true);
    await fetch(`/api/couple/${token}/seating`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTable, sort_order: data.tables.length }),
    });
    setNewTable({ name: "", capacity: 10, type: "round" });
    setShowAddTable(false);
    await load(); setSaving(false);
  }

  async function deleteTable(tableId: string) {
    if (!confirm("למחוק שולחן? כל ההצבות יבוטלו.")) return;
    setSaving(true);
    await fetch(`/api/couple/${token}/seating/${tableId}`, { method: "DELETE" });
    await load(); setSaving(false);
  }

  if (loading) return (
    <div dir="rtl" style={{ minHeight: "100vh", background: CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(28,16,8,0.4)", fontFamily: "Heebo, sans-serif" }}>טוען...</p>
    </div>
  );

  const totalSeated = data.assignments.length;
  const totalGuests = data.guests.length;

  /* Assigned guests with a phone — eligible for "your table" message */
  const tableByGuestId = new Map(data.assignments.map(a => [a.guest_id, data.tables.find(t => t.id === a.table_id)?.name ?? ""]));
  const notifiable = data.guests.filter(g => g.phone && tableByGuestId.get(g.id));

  function sendTableNumbers() {
    if (notifiable.length === 0) return;
    if (!confirm(`ייפתחו ${notifiable.length} הודעות וואטסאפ — אחת לכל אורח משובץ. להמשיך?`)) return;
    notifiable.forEach((g, i) => {
      const tableName = tableByGuestId.get(g.id)!;
      const msg =
        `💍 משפחה וחברים יקרים!\n\n` +
        `${g.name}, מחכים לראותכם! 🎉\n\n` +
        `🪑 השולחן שלכם: ${tableName}\n\n` +
        `נתראה בשמחות! 🤍`;
      const phone = (g.phone ?? "").replace(/\D/g, "").replace(/^0/, "972");
      setTimeout(() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank"), i * 600);
    });
  }

  return (
    <div dir="rtl" lang="he" style={{ minHeight: "100vh", background: CREAM, fontFamily: "Heebo, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(150deg, #C5954A 0%, #9B6E2C 50%, #7A5020 100%)", padding: "1.75rem 1.5rem 1.5rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <a href={`/couple/${token}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,240,200,0.7)", textDecoration: "none", fontSize: 13, marginBottom: "1rem" }}>
            <ArrowRight size={14} /> חזרה ללוח הבקרה
          </a>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.8rem", fontWeight: 700, color: "#FFF8EC", margin: 0 }}>🪑 סידורי הושבה</h1>
              <p style={{ fontSize: 13, color: "rgba(255,240,200,0.65)", marginTop: "0.35rem" }}>
                {totalSeated} מתוך {totalGuests} אורחים מוצבים · {data.tables.length} שולחנות
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.6rem 1.2rem", borderRadius: 12, border: "none", background: showSimulator ? "rgba(197,164,109,0.35)" : "rgba(255,255,255,0.15)", color: "#FFF8EC", cursor: "pointer", fontSize: 14, fontFamily: "Heebo, sans-serif", backdropFilter: "blur(8px)" }}
              >
                🏛️ {showSimulator ? "הסתר אולם" : "תצוגת אולם"}
              </button>
              <button
                onClick={() => setShowAddTable(!showAddTable)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.6rem 1.2rem", borderRadius: 12, border: "none", background: "rgba(255,255,255,0.15)", color: "#FFF8EC", cursor: "pointer", fontSize: 14, fontFamily: "Heebo, sans-serif", backdropFilter: "blur(8px)" }}
              >
                <Plus size={16} /> הוסף שולחן
              </button>
              {notifiable.length > 0 && (
                <button
                  onClick={sendTableNumbers}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.6rem 1.2rem", borderRadius: 12, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "Heebo, sans-serif" }}
                >
                  📨 שלחו מספרי שולחן ({notifiable.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>

        {/* F10 — Seating Simulator */}
        {showSimulator && data.tables.length > 0 && (
          <div style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(197,164,109,0.2)", borderRadius: "1.25rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
            <p style={{ fontSize: 12, color: "rgba(28,16,8,0.4)", marginBottom: "1rem", fontFamily: "Heebo, sans-serif" }}>
              🏛️ תצוגת האולם — קבלו תמונה כללית של סידורי ההושבה
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
              {[...data.tables].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(table => {
                const assigned = assignmentsByTable(table.id);
                const pct = Math.round((assigned.length / table.capacity) * 100);
                const color = pct === 100 ? "#EF4444" : pct >= 75 ? "#D97706" : "#059669";
                const guests = assigned.map(a => guestById(a.guest_id)).filter(Boolean);
                return (
                  <div key={table.id}
                    onClick={() => setSimExpanded(simExpanded === table.id ? null : table.id)}
                    style={{ cursor: "pointer", background: "white", borderRadius: 12, padding: "0.85rem", border: `2px solid ${simExpanded === table.id ? GOLD : "rgba(197,164,109,0.2)"}`, transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 14, color: DARK }}>{table.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 8, padding: "2px 7px" }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(197,164,109,0.15)", borderRadius: 3, overflow: "hidden", marginBottom: "0.4rem" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.4s" }} />
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(28,16,8,0.45)" }}>{assigned.length} / {table.capacity} מושבים</p>
                    {simExpanded === table.id && guests.length > 0 && (
                      <ul style={{ marginTop: "0.65rem", paddingRight: "0.75rem", borderTop: "1px solid rgba(197,164,109,0.15)", paddingTop: "0.5rem" }}>
                        {guests.map(g => g && <li key={g.id} style={{ fontSize: 12, color: DARK, marginBottom: 2 }}>{g.name} ({g.guest_count})</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add table form */}
        {showAddTable && (
          <div style={{ ...CARD, padding: "1rem", marginBottom: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <input placeholder="שם השולחן" value={newTable.name} onChange={e => setNewTable({ ...newTable, name: e.target.value })} onKeyDown={e => e.key === "Enter" && addTable()}
              style={{ flex: 1, minWidth: 130, padding: "0.55rem 0.85rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, outline: "none" }} />
            <input type="number" min={1} max={30} value={newTable.capacity} onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
              style={{ width: 70, padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, outline: "none" }} />
            <select value={newTable.type} onChange={e => setNewTable({ ...newTable, type: e.target.value })}
              style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, outline: "none" }}>
              {TABLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button onClick={addTable} disabled={saving || !newTable.name.trim()}
              style={{ padding: "0.55rem 1.2rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#9B6E2C)`, color: "white", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600 }}>
              צור
            </button>
            <button onClick={() => setShowAddTable(false)}
              style={{ padding: "0.55rem 0.75rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.25)", background: "transparent", color: "rgba(28,16,8,0.5)", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 14 }}>
              ביטול
            </button>
          </div>
        )}

        {data.tables.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <p style={{ fontSize: 40, marginBottom: "0.75rem" }}>🪑</p>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.2rem", color: DARK, marginBottom: "0.5rem" }}>עדיין אין שולחנות</p>
            <p style={{ fontSize: 13, color: "rgba(28,16,8,0.4)" }}>לחצו על &quot;הוסף שולחן&quot; למעלה כדי להתחיל</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.5rem", alignItems: "start" }}>

            {/* Floor plan */}
            <div>
              <p style={{ fontSize: 12, color: "rgba(28,16,8,0.4)", marginBottom: "0.75rem" }}>
                גרור שולחנות לסידור האולם · גרור אורח לשולחן · לחץ על כיסא מלא להסרה
              </p>
              <SeatingFloorPlan
                tables={data.tables}
                assignments={data.assignments}
                guests={data.guests}
                selectedGuest={selectedGuest}
                saving={saving}
                onAssign={(gId, tId) => assignGuest(gId, tId)}
                onRemove={(gId) => assignGuest(gId, null)}
                onDelete={(tId) => deleteTable(tId)}
                onMoveTable={async (tId, x, y) => {
                  await fetch(`/api/couple/${token}/seating/${tId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pos_x: x, pos_y: y }),
                  });
                }}
              />
            </div>

            {/* Sidebar */}
            <div style={{ ...CARD, padding: "1rem", position: "sticky", top: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                <Users size={15} style={{ color: GOLD }} />
                <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: DARK }}>לא מוצבים ({unassigned.length})</h2>
              </div>

              <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                <Search size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(28,16,8,0.35)", pointerEvents: "none" }} />
                <input placeholder="חיפוש..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem 2rem 0.5rem 0.75rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.25)", fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>

              <p style={{ fontSize: 11, color: "rgba(28,16,8,0.4)", marginBottom: "0.6rem" }}>גרור לשולחן או לחץ לבחירה</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 480, overflowY: "auto" }}>
                {unassigned.map(g => (
                  <button key={g.id}
                    draggable={true}
                    onDragStart={e => e.dataTransfer.setData("guestId", g.id)}
                    onClick={() => setSelectedGuest(selectedGuest === g.id ? null : g.id)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.5rem 0.75rem", borderRadius: 10,
                      border: `1.5px solid ${selectedGuest === g.id ? GOLD : "rgba(197,164,109,0.2)"}`,
                      background: selectedGuest === g.id ? "rgba(197,164,109,0.1)" : "transparent",
                      cursor: "grab", fontFamily: "Heebo, sans-serif", fontSize: 13, color: DARK, textAlign: "right",
                    }}>
                    <span style={{ fontSize: 10, color: "rgba(28,16,8,0.25)" }}>⠿</span>
                    <span>{g.name}</span>
                  </button>
                ))}
                {unassigned.length === 0 && (
                  <p style={{ fontSize: 13, color: "rgba(28,16,8,0.35)", textAlign: "center", padding: "1rem 0" }}>
                    {search ? "לא נמצאו אורחים" : "✓ כל האורחים הוצבו!"}
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
      <HelpButton token={token} />
    </div>
  );
}
