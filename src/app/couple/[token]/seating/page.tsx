"use client";

import { use, useEffect, useState } from "react";
import { Users, ArrowRight, Search } from "lucide-react";

const C = {
  cream:  "#F2EDE3",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.45)",
  border: "rgba(197,164,109,0.18)",
  card:   "rgba(255,255,255,0.9)",
  shadow: "0 2px 16px rgba(28,16,8,0.07)",
};

interface Table      { id: string; name: string; capacity: number; type: string }
interface Assignment { guest_id: string; table_id: string }
interface Guest      { id: string; name: string; guest_count: number }

export default function CoupleSeatingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [tables,      setTables]      = useState<Table[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [guests,      setGuests]      = useState<Guest[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [activeTable, setActiveTable] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/couple/${token}/seating`)
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setTables(d.tables);
          setAssignments(d.assignments);
          setGuests(d.guests);
        }
        setLoading(false);
      });
  }, [token]);

  const guestById = (id: string) => guests.find(g => g.id === id);
  const assignedIds = new Set(assignments.map(a => a.guest_id));

  const guestsAtTable = (tableId: string) =>
    assignments
      .filter(a => a.table_id === tableId)
      .map(a => guestById(a.guest_id))
      .filter(Boolean) as Guest[];

  const totalSeated = assignments.reduce((s, a) => {
    const g = guestById(a.guest_id);
    return s + (g?.guest_count ?? 1);
  }, 0);
  const totalGuests = guests.reduce((s, g) => s + g.guest_count, 0);

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>טוען...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" lang="he" style={{ minHeight: "100vh", background: C.cream, fontFamily: "Heebo, sans-serif" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(150deg, #C5954A 0%, #9B6E2C 50%, #7A5020 100%)",
        padding: "1.75rem 1.5rem 1.5rem",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <a href={`/couple/${token}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,240,200,0.7)", textDecoration: "none", fontSize: 13, marginBottom: "1rem" }}>
            <ArrowRight size={14} />
            חזרה ללוח הבקרה
          </a>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.8rem", fontWeight: 700, color: "#FFF8EC", margin: 0 }}>
            🪑 סידורי הושבה
          </h1>
          {tables.length > 0 && (
            <p style={{ fontSize: 13, color: "rgba(255,240,200,0.72)", marginTop: "0.4rem" }}>
              {totalSeated} מתוך {totalGuests} אורחים מוצבים · {tables.length} שולחנות
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.25rem 1rem 4rem" }}>

        {tables.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: C.muted }}>
            <p style={{ fontSize: 32, marginBottom: "0.75rem" }}>🪑</p>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.1rem", color: C.dark, marginBottom: "0.5rem" }}>
              סידורי ההושבה עדיין לא הוכנו
            </p>
            <p style={{ fontSize: 13 }}>דביר יעדכן אתכם כשזה יהיה מוכן</p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: "1.25rem" }}>
              <Search size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.muted, pointerEvents: "none" }} />
              <input
                placeholder="חפש אורח..."
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveTable(null); }}
                style={{ width: "100%", padding: "0.6rem 2.25rem 0.6rem 0.75rem", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, fontFamily: "Heebo, sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Search results */}
            {search && (
              <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "0.75rem", marginBottom: "1.25rem" }}>
                {filteredGuests.length === 0 ? (
                  <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "0.5rem" }}>לא נמצא אורח בשם זה</p>
                ) : filteredGuests.map(g => {
                  const a = assignments.find(a => a.guest_id === g.id);
                  const table = a ? tables.find(t => t.id === a.table_id) : null;
                  return (
                    <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.5rem", borderRadius: 8 }}>
                      <span style={{ fontSize: 14, color: C.dark }}>{g.name}</span>
                      <span style={{ fontSize: 12, color: table ? C.olive : C.muted, fontWeight: table ? 600 : 400 }}>
                        {table ? `שולחן: ${table.name}` : "לא הוצב"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tables grid */}
            {!search && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {tables.map(table => {
                  const seated = guestsAtTable(table.id);
                  const seatCount = seated.reduce((s, g) => s + g.guest_count, 0);
                  const isActive = activeTable === table.id;
                  const pct = table.capacity > 0 ? Math.min(100, Math.round((seatCount / table.capacity) * 100)) : 0;

                  return (
                    <div
                      key={table.id}
                      style={{
                        background: C.card,
                        borderRadius: "1.25rem",
                        border: `1px solid ${isActive ? C.gold : C.border}`,
                        boxShadow: isActive ? `0 4px 20px rgba(197,164,109,0.2)` : C.shadow,
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() => setActiveTable(isActive ? null : table.id)}
                    >
                      {/* Table header */}
                      <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: table.type === "round" ? "50%" : 8,
                            background: `linear-gradient(135deg, ${C.gold}22, ${C.gold}11)`,
                            border: `1.5px solid ${C.gold}44`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16,
                          }}>
                            {table.type === "round" ? "⭕" : "🟥"}
                          </div>
                          <div>
                            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0, color: C.dark }}>{table.name}</p>
                            <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{seatCount} / {table.capacity} מקומות</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 48, height: 6, borderRadius: 3, background: "rgba(197,164,109,0.12)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 90 ? C.olive : C.gold, transition: "width 0.5s" }} />
                          </div>
                          <Users size={13} style={{ color: C.muted }} />
                        </div>
                      </div>

                      {/* Guest list — expanded */}
                      {isActive && (
                        <div style={{ borderTop: `1px solid ${C.border}`, padding: "0.75rem 1.25rem" }}>
                          {seated.length === 0 ? (
                            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>אין אורחים מוצבים בשולחן זה עדיין</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {seated.map(g => (
                                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.3rem 0.5rem", borderRadius: 8, background: "rgba(107,123,90,0.05)" }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.olive, flexShrink: 0 }} />
                                  <span style={{ flex: 1, fontSize: 13, color: C.dark }}>{g.name}</span>
                                  {g.guest_count > 1 && (
                                    <span style={{ fontSize: 11, color: C.muted }}>+{g.guest_count - 1}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unassigned */}
            {!search && guests.filter(g => !assignedIds.has(g.id)).length > 0 && (
              <div style={{ marginTop: "1.25rem", background: "rgba(192,57,43,0.04)", borderRadius: "1.25rem", border: "1px solid rgba(192,57,43,0.12)", padding: "1rem 1.25rem" }}>
                <p style={{ fontSize: 12, color: "#C0392B", marginBottom: "0.5rem", fontWeight: 600 }}>
                  {guests.filter(g => !assignedIds.has(g.id)).length} אורחים טרם הוצבו
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {guests.filter(g => !assignedIds.has(g.id)).map(g => (
                    <span key={g.id} style={{ fontSize: 12, padding: "0.2rem 0.6rem", borderRadius: 12, background: "rgba(192,57,43,0.08)", color: "#C0392B" }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
