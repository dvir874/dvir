"use client";

import type { SeatingTable, SeatingAssignment, Guest } from "@/lib/types";

const C = {
  ivory:  "#FDFAF5",
  cream:  "#F6F1E8",
  gold:   "#C5A46D",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.52)",
  border: "rgba(197,164,109,0.22)",
};

interface Props {
  tables:      SeatingTable[];
  assignments: SeatingAssignment[];
  guests:      Guest[];
  onDropGuest: (guestId: string, tableId: string) => void;
  onRemoveGuest: (guestId: string) => void;
}

function getTableState(table: SeatingTable, assignedCount: number): "empty" | "partial" | "full" {
  if (assignedCount === 0) return "empty";
  if (assignedCount >= table.capacity) return "full";
  return "partial";
}

export default function SeatingGridPanel({ tables, assignments, guests, onDropGuest, onRemoveGuest }: Props) {
  const assignedSeats = (tableId: string) => {
    return assignments
      .filter(a => a.table_id === tableId)
      .reduce((sum, a) => {
        const guest = guests.find(g => g.id === a.guest_id);
        return sum + (guest?.guest_count ?? 1);
      }, 0);
  };

  const guestsAtTable = (tableId: string) => {
    return assignments
      .filter(a => a.table_id === tableId)
      .map(a => guests.find(g => g.id === a.guest_id))
      .filter(Boolean) as Guest[];
  };

  function handleDrop(e: React.DragEvent, tableId: string) {
    e.preventDefault();
    const guestId = e.dataTransfer.getData("guestId");
    if (guestId) onDropGuest(guestId, tableId);
  }

  if (tables.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 22, color: C.dark, margin: "0 0 8px" }}>אין שולחנות עדיין</p>
        <p style={{ fontFamily: "Heebo, sans-serif", fontWeight: 300, fontSize: 14, color: C.muted, margin: 0 }}>הוסיפו שולחנות כדי להתחיל</p>
      </div>
    );
  }

  return (
    <div
      className="floor-plan-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: 16,
        overflowY: "auto",
        padding: 16,
        maxHeight: "calc(100vh - 200px)",
      }}
      onDragOver={e => e.preventDefault()}
    >
      {tables.map(table => {
        const seated   = assignedSeats(table.id);
        const state    = getTableState(table, seated);
        const tableGuests = guestsAtTable(table.id);

        const borderColor = state === "full" ? "#6B7B5A" : state === "empty" ? C.border : C.gold;
        const bgColor     = state === "full" ? "rgba(107,123,90,0.08)" : C.cream;
        const borderStyle = state === "empty" ? "dashed" : "solid";
        const borderWidth = 2;
        const boxShadow   = state === "full" ? "0 0 0 2px rgba(107,123,90,0.18)" : "none";

        return (
          <div
            key={table.id}
            title={`שולחן ${table.sort_order ?? table.name}: ${tableGuests.map(g => g.name).join(", ") || "ריק"}`}
            onDrop={e => handleDrop(e, table.id)}
            onDragOver={e => { e.preventDefault(); }}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: bgColor,
              border: `${borderWidth}px ${borderStyle} ${borderColor}`,
              boxShadow,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              userSelect: "none",
              position: "relative",
              justifySelf: "center",
            }}
          >
            <p style={{
              fontFamily: "Frank Ruhl Libre, serif",
              fontWeight: 700,
              fontSize: 18,
              color: state === "full" ? "#6B7B5A" : C.dark,
              margin: 0,
              lineHeight: 1,
            }}>
              {table.sort_order ?? table.name}
            </p>
            <p style={{
              fontFamily: "Heebo, sans-serif",
              fontWeight: 300,
              fontSize: 11,
              color: C.muted,
              margin: "3px 0 0",
              lineHeight: 1,
            }}>
              {seated}/{table.capacity}
            </p>
            {state === "full" && (
              <span style={{
                position: "absolute",
                bottom: -6,
                fontSize: 14,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
              }}>✓</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
