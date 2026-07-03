"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* Printable A4 backup sheet: alphabetical guest → table lookup.
   Usage: /admin/print-list?event=[eventId] */

interface Guest { id: string; name: string; guest_count: number; status: string }
interface SeatingTable { id: string; name: string }
interface Assignment { guest_id: string; table_id: string }

function PrintList() {
  const params = useSearchParams();
  const eventId = params.get("event") ?? "";

  const [eventName, setEventName] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const rows = useMemo(() => {
    const tName = new Map(tables.map(t => [t.id, t.name]));
    const tByGuest = new Map(assignments.map(a => [a.guest_id, tName.get(a.table_id) ?? ""]));
    return guests
      .filter(g => g.status !== "declined")
      .map(g => ({ name: g.name, count: g.guest_count ?? 1, table: tByGuest.get(g.id) ?? "—" }))
      .sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [guests, tables, assignments]);

  if (!eventId) return <p style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>חסר מזהה אירוע — /admin/print-list?event=[ID]</p>;
  if (loading)  return <p style={{ padding: 40, textAlign: "center", fontFamily: "Heebo, sans-serif" }}>טוען...</p>;

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo', sans-serif", background: "#f0f0f0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@700;900&family=Heebo:wght@300;400;500;600;700&display=swap');
        .sheet { background: white; max-width: 210mm; margin: 24px auto; padding: 14mm; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
        .cols { column-count: 3; column-gap: 8mm; }
        .row { display: flex; justify-content: space-between; padding: 2.2px 4px; font-size: 11.5px; break-inside: avoid; border-bottom: 0.5px solid rgba(197,164,109,0.25); }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .sheet { margin: 0; box-shadow: none; max-width: none; padding: 8mm; }
        }
      `}</style>

      <div className="no-print" style={{ background: "#1C1008", padding: "12px 24px", display: "flex", gap: 12, justifyContent: "center", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>דף גיבוי לעמדת הקבלה — {rows.length} רשומות</span>
        <button onClick={() => window.print()}
          style={{ background: "#C5A46D", color: "white", border: "none", borderRadius: 8, padding: "8px 20px", fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          🖨️ הדפס
        </button>
      </div>

      <div className="sheet">
        <div style={{ textAlign: "center", borderBottom: "2px solid #C5A46D", paddingBottom: 10, marginBottom: 12 }}>
          <h1 style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22, fontWeight: 900, color: "#1C1008", margin: 0 }}>
            {eventName} — רשימת הושבה
          </h1>
          <p style={{ fontSize: 11, color: "#8C7B6E", margin: "4px 0 0" }}>
            שם ← שולחן · לפי א״ב · גיבוי לעמדת הקבלה · רגע לפני 💍
          </p>
        </div>

        <div className="cols">
          {rows.map((r, i) => (
            <div key={i} className="row">
              <span style={{ color: "#1C1008", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.name}{r.count > 1 ? ` (${r.count})` : ""}
              </span>
              <span style={{ color: "#8B6914", fontWeight: 700, flexShrink: 0, marginRight: 6 }}>{r.table}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PrintListPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>טוען...</div>}>
      <PrintList />
    </Suspense>
  );
}
