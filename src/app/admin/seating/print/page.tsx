"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface Guest { id: string; name: string; guest_count: number; status: string; category?: string | null; meal_preference?: string | null; }
interface Table { id: string; name: string; capacity: number; type: string; }
interface Assignment { guest_id: string; table_id: string; }

const MEAL_HE: Record<string, string> = {
  vegetarian: "צמחוני",
  vegan: "טבעוני",
  mehadrin: "כשר מהדרין",
  regular: "",
};

function PrintContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event_id");
  const [tables, setTables] = useState<Table[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    Promise.all([
      fetch(`/api/seating?event_id=${eventId}`).then(r => r.json()),
      fetch(`/api/events/${eventId}`).then(r => r.json()),
    ]).then(([seating, event]) => {
      setTables(seating.tables ?? []);
      setAssignments(seating.assignments ?? []);
      setGuests(seating.guests ?? []);
      setEventName(event?.name ?? "אירוע");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div style={{ padding: 40, fontFamily: "Heebo, sans-serif" }}>טוען...</div>;

  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]));

  const tableData = tables.map(t => {
    const seated = assignments
      .filter(a => a.table_id === t.id)
      .map(a => guestMap[a.guest_id])
      .filter(Boolean);
    const totalPeople = seated.reduce((s, g) => s + (g.guest_count || 1), 0);
    return { table: t, guests: seated, totalPeople };
  });

  const unassigned = guests.filter(
    g => g.status === "confirmed" && !assignments.some(a => a.guest_id === g.id)
  );

  const totalSeated = tableData.reduce((s, t) => s + t.totalPeople, 0);
  const totalGuests = guests.filter(g => g.status === "confirmed").reduce((s, g) => s + (g.guest_count || 1), 0);

  return (
    <div dir="rtl" style={{ fontFamily: "Heebo, sans-serif", padding: "24px 32px", color: "#1C1008", background: "white", minHeight: "100vh" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .table-section { break-inside: avoid; page-break-inside: avoid; }
          body { margin: 0; }
        }
        @page { margin: 1.5cm; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "2px solid #C5A46D", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif", margin: 0 }}>
              {eventName}
            </h1>
            <p style={{ fontSize: 13, color: "#6B7B5A", marginTop: 4 }}>
              דוח סידור הושבה · הודפס {new Date().toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, color: "#888" }}>
              {totalSeated} / {totalGuests} אורחים מוצבים
            </div>
            <div style={{ fontSize: 13, color: "#888" }}>{tables.length} שולחנות</div>
          </div>
        </div>
      </div>

      {/* Print button */}
      <div className="no-print" style={{ marginBottom: 24 }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "0.6rem 1.8rem", background: "linear-gradient(135deg,#C5A46D,#B8935A)",
            color: "white", border: "none", borderRadius: 12, cursor: "pointer",
            fontFamily: "Heebo, sans-serif", fontWeight: 700, fontSize: 14,
          }}
        >
          🖨️ הדפס
        </button>
        <button
          onClick={() => window.close()}
          style={{
            marginRight: 10, padding: "0.6rem 1.4rem", background: "rgba(0,0,0,0.06)",
            color: "#555", border: "none", borderRadius: 12, cursor: "pointer",
            fontFamily: "Heebo, sans-serif", fontSize: 14,
          }}
        >
          סגור
        </button>
      </div>

      {/* Tables grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {tableData.map(({ table, guests: seated, totalPeople }) => (
          <div
            key={table.id}
            className="table-section"
            style={{
              border: "1px solid #D6CCBA", borderRadius: 12, overflow: "hidden",
              background: "#FDFAF5",
            }}
          >
            {/* Table header */}
            <div style={{ padding: "10px 14px", background: "#C5A46D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "white", fontSize: 14, fontFamily: "Frank Ruhl Libre, serif" }}>
                {table.name}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.15)", padding: "2px 8px", borderRadius: 20 }}>
                {totalPeople} / {table.capacity} מקומות
              </span>
            </div>
            {/* Guest list */}
            <div style={{ padding: "10px 14px" }}>
              {seated.length === 0 ? (
                <p style={{ fontSize: 12, color: "#aaa", fontStyle: "italic" }}>אין אורחים מוצבים</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <tbody>
                    {seated.map((g, i) => (
                      <tr key={g.id} style={{ borderBottom: i < seated.length - 1 ? "1px solid #EDE8DF" : "none" }}>
                        <td style={{ padding: "5px 0", color: "#1C1008", fontWeight: 500 }}>{g.name}</td>
                        <td style={{ padding: "5px 0", color: "#6B7B5A", textAlign: "center" }}>
                          {(g.guest_count ?? 1) > 1 ? `×${g.guest_count}` : ""}
                        </td>
                        <td style={{ padding: "5px 0", color: "#C5A46D", textAlign: "left", fontSize: 11 }}>
                          {g.meal_preference ? MEAL_HE[g.meal_preference] || "" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <div style={{ marginTop: 32, borderTop: "2px dashed #D6CCBA", paddingTop: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#A32D2D", marginBottom: 12, fontFamily: "Frank Ruhl Libre, serif" }}>
            ⚠️ לא מוצבים ({unassigned.reduce((s, g) => s + (g.guest_count || 1), 0)} אורחים)
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {unassigned.map(g => (
              <span key={g.id} style={{ padding: "4px 12px", background: "#FCEBEB", color: "#A32D2D", borderRadius: 20, fontSize: 12, border: "1px solid #F09595" }}>
                {g.name}{(g.guest_count ?? 1) > 1 ? ` ×${g.guest_count}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #EDE8DF", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#C5A46D", letterSpacing: "0.1em" }}>✦ רגע לפני · ניהול חתונות דיגיטלי</p>
      </div>
    </div>
  );
}

export default function SeatingPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, fontFamily: "Heebo, sans-serif" }}>טוען...</div>}>
      <PrintContent />
    </Suspense>
  );
}
