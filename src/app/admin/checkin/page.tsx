"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Undo2 } from "lucide-react";

/* Entrance check-in station — tablet-first, used at the venue door.
   Usage: /admin/checkin?event=[eventId] */

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  goldT:  "#8B6914",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.5)",
  border: "#E8E0D4",
  green:  "#4A7C59",
};

interface Guest {
  id: string;
  name: string;
  guest_count: number;
  status: string;
  arrived_at?: string | null;
}
interface SeatingTable { id: string; name: string }
interface Assignment { guest_id: string; table_id: string }

function CheckinStation() {
  const params = useSearchParams();
  const eventId = params.get("event") ?? "";

  const [eventName, setEventName] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [justArrived, setJustArrived] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/events/${eventId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/guests?event_id=${eventId}`).then(r => r.ok ? r.json() : []),
      fetch(`/api/seating?event_id=${eventId}`).then(r => r.ok ? r.json() : null),
    ]).then(([ev, gs, seat]) => {
      if (ev?.name) setEventName(ev.name);
      if (Array.isArray(gs)) setGuests(gs);
      if (seat?.tables) setTables(seat.tables);
      if (seat?.assignments) setAssignments(seat.assignments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId]);

  const tableByGuest = useMemo(() => {
    const tName = new Map(tables.map(t => [t.id, t.name]));
    return new Map(assignments.map(a => [a.guest_id, tName.get(a.table_id) ?? ""]));
  }, [tables, assignments]);

  async function toggleArrived(g: Guest) {
    const arrived = !g.arrived_at;
    setGuests(prev => prev.map(x => x.id === g.id ? { ...x, arrived_at: arrived ? new Date().toISOString() : null } : x));
    if (arrived) {
      setJustArrived(g.id);
      setTimeout(() => setJustArrived(null), 2000);
      setSearch("");
    }
    await fetch("/api/admin/checkin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_id: g.id, arrived }),
    });
  }

  const arrivedGuests = guests.filter(g => g.arrived_at);
  const arrivedPeople = arrivedGuests.reduce((s, g) => s + (g.guest_count ?? 1), 0);
  const expectedPeople = guests.filter(g => g.status === "confirmed").reduce((s, g) => s + (g.guest_count ?? 1), 0);

  const q = search.trim();
  const results = q
    ? guests.filter(g => g.name.includes(q)).slice(0, 8)
    : [];

  if (!eventId) return <p style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>חסר מזהה אירוע — /admin/checkin?event=[ID]</p>;

  return (
    <div dir="rtl" style={{ minHeight: "100dvh", background: C.ivory, fontFamily: "'Heebo', sans-serif", paddingBottom: 40 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        input:focus { outline: none; border-color: ${C.gold} !important; }
        @keyframes pop { 0% { transform: scale(0.96); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
      `}</style>

      {/* Header with live counter */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/admin" style={{ color: C.dark, display: "flex" }}><ArrowRight size={20} /></a>
          <div>
            <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 18, fontWeight: 700, color: C.dark, margin: 0 }}>🎊 עמדת קבלה</h1>
            {eventName && <p style={{ fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{eventName}</p>}
          </div>
        </div>
        <div style={{ textAlign: "center", background: "rgba(74,124,89,0.1)", borderRadius: 12, padding: "8px 16px" }}>
          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, color: C.green, margin: 0, lineHeight: 1 }}>
            {arrivedPeople}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}> / {expectedPeople}</span>
          </p>
          <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>הגיעו</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        {loading ? <p style={{ textAlign: "center", color: C.muted, padding: 40 }}>טוען...</p> : (
          <>
            {/* Big search — the main interaction */}
            <input
              autoFocus
              placeholder="🔍 הקלידו שם אורח..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "18px 20px", border: `2px solid ${C.gold}`, borderRadius: 16, fontSize: 20, fontFamily: "'Heebo', sans-serif", background: "#fff", color: C.dark, boxShadow: "0 4px 20px rgba(197,164,109,0.15)" }}
            />

            {/* Search results */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {q && results.length === 0 && (
                <p style={{ textAlign: "center", color: C.muted, fontSize: 15, padding: 20 }}>
                  לא נמצא אורח בשם &quot;{q}&quot;
                </p>
              )}
              {results.map(g => {
                const table = tableByGuest.get(g.id);
                const arrived = !!g.arrived_at;
                return (
                  <button
                    key={g.id}
                    onClick={() => toggleArrived(g)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      padding: "18px 20px", borderRadius: 16, cursor: "pointer", textAlign: "right",
                      border: `2px solid ${arrived ? "rgba(74,124,89,0.5)" : C.border}`,
                      background: arrived ? "rgba(74,124,89,0.08)" : "#fff",
                      fontFamily: "'Heebo', sans-serif",
                      animation: justArrived === g.id ? "pop 0.3s ease" : undefined,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 700, color: C.dark, margin: 0 }}>
                        {arrived ? "✅ " : ""}{g.name}
                        {g.guest_count > 1 && <span style={{ fontSize: 14, fontWeight: 400, color: C.muted }}> ({g.guest_count})</span>}
                      </p>
                      <p style={{ fontSize: 13, color: arrived ? C.green : C.muted, margin: "4px 0 0" }}>
                        {arrived ? "הגיעו — לחצו לביטול" : g.status === "confirmed" ? "אישרו הגעה" : g.status === "declined" ? "⚠️ סימנו שלא מגיעים" : "לא אישרו מראש"}
                      </p>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0, background: table ? "rgba(197,164,109,0.15)" : "transparent", borderRadius: 12, padding: table ? "10px 18px" : 0 }}>
                      {table ? (
                        <>
                          <p style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, color: C.goldT, margin: 0, lineHeight: 1 }}>{table}</p>
                          <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>שולחן</p>
                        </>
                      ) : (
                        <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>לא שובץ</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Recent arrivals */}
            {!q && arrivedGuests.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.goldT, margin: "0 0 10px" }}>
                  הגיעו לאחרונה ({arrivedGuests.length} משפחות)
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[...arrivedGuests]
                    .sort((a, b) => (b.arrived_at! < a.arrived_at! ? -1 : 1))
                    .slice(0, 10)
                    .map(g => (
                      <div key={g.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", borderRadius: 12, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 14, color: C.dark }}>
                          ✅ {g.name}{g.guest_count > 1 ? ` (${g.guest_count})` : ""}
                          {tableByGuest.get(g.id) && <span style={{ color: C.goldT, fontWeight: 600 }}> · {tableByGuest.get(g.id)}</span>}
                        </span>
                        <button onClick={() => toggleArrived(g)} aria-label="בטל הגעה"
                          style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 6, display: "flex" }}>
                          <Undo2 size={14} />
                        </button>
                      </div>
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

export default function CheckinPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>טוען...</div>}>
      <CheckinStation />
    </Suspense>
  );
}
