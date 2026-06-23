"use client";

import { useRef, useState, useCallback } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

const GOLD  = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK  = "#1C1008";

export interface FPTable {
  id: string;
  name: string;
  capacity: number;
  type: string;
  pos_x?: number;
  pos_y?: number;
}
export interface FPAssignment { id: string; guest_id: string; table_id: string }
export interface FPGuest      { id: string; name: string }

interface Props {
  tables:      FPTable[];
  assignments: FPAssignment[];
  guests:      FPGuest[];
  selectedGuest: string | null;
  saving: boolean;
  onAssign:     (guestId: string, tableId: string) => void;
  onRemove:     (guestId: string) => void;
  onDelete:     (tableId: string) => void;
  onMoveTable:  (tableId: string, x: number, y: number) => void;
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[p.length - 1][0];
}

const CANVAS_W = 900;
const CANVAS_H = 560;
const DEFAULT_SPACING = 180;

function defaultPos(index: number): { x: number; y: number } {
  const cols = Math.floor(CANVAS_W / DEFAULT_SPACING);
  const col  = index % cols;
  const row  = Math.floor(index / cols);
  return { x: 80 + col * DEFAULT_SPACING, y: 80 + row * DEFAULT_SPACING };
}

export default function SeatingFloorPlan({
  tables, assignments, guests, selectedGuest, saving,
  onAssign, onRemove, onDelete, onMoveTable,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const dragging = useRef<{ tableId: string; startMouseX: number; startMouseY: number; startX: number; startY: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const getPos = useCallback((table: FPTable, index: number) => {
    if (positions[table.id]) return positions[table.id];
    if (table.pos_x != null && table.pos_y != null) return { x: table.pos_x, y: table.pos_y };
    return defaultPos(index);
  }, [positions]);

  const guestById   = (id: string) => guests.find(g => g.id === id);
  const assignedAt  = (tableId: string) => assignments.filter(a => a.table_id === tableId);

  function onMouseDown(e: React.MouseEvent, table: FPTable, index: number) {
    // Only start drag on the table surface (not on buttons)
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const pos = getPos(table, index);
    dragging.current = { tableId: table.id, startMouseX: e.clientX, startMouseY: e.clientY, startX: pos.x, startY: pos.y };
    setDragId(table.id);

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      const dx = ev.clientX - dragging.current.startMouseX;
      const dy = ev.clientY - dragging.current.startMouseY;
      const newX = Math.max(20, Math.min(CANVAS_W - 80,  dragging.current.startX + dx));
      const newY = Math.max(20, Math.min(CANVAS_H - 80,  dragging.current.startY + dy));
      setPositions(p => ({ ...p, [dragging.current!.tableId]: { x: newX, y: newY } }));
    }

    function onUp(ev: MouseEvent) {
      if (!dragging.current) return;
      const dx = ev.clientX - dragging.current.startMouseX;
      const dy = ev.clientY - dragging.current.startMouseY;
      const newX = Math.max(20, Math.min(CANVAS_W - 80, dragging.current.startX + dx));
      const newY = Math.max(20, Math.min(CANVAS_H - 80, dragging.current.startY + dy));
      onMoveTable(dragging.current.tableId, Math.round(newX), Math.round(newY));
      dragging.current = null;
      setDragId(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    const gId = e.dataTransfer.getData("guestId");
    const tId = e.dataTransfer.getData("tableId");
    if (gId && tId) onAssign(gId, tId);
  }

  return (
    <div
      ref={canvasRef}
      onDragOver={e => e.preventDefault()}
      onDrop={handleCanvasDrop}
      style={{
        position: "relative",
        width: "100%", maxWidth: CANVAS_W, height: CANVAS_H,
        background: "#FDFAF5",
        borderRadius: "1.25rem",
        border: "1.5px solid rgba(197,164,109,0.2)",
        overflow: "hidden",
        boxShadow: "0 2px 20px rgba(28,16,8,0.06)",
        userSelect: "none",
      }}
    >
      {/* Grid dots */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="rgba(197,164,109,0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floor label */}
      <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", fontSize: 11, color: "rgba(28,16,8,0.2)", fontFamily: "Heebo, sans-serif", letterSpacing: "0.15em", pointerEvents: "none" }}>
        ✦ גרור שולחנות לסידור האולם
      </div>

      {tables.map((table, index) => {
        const pos      = getPos(table, index);
        const assigned = assignedAt(table.id);
        const over     = assigned.length > table.capacity;
        const cap      = Math.max(table.capacity, 1);
        const isRect   = table.type === "rectangular";
        const isDragging = dragId === table.id;

        // SVG dimensions
        const svgW = isRect ? 160 : 120;
        const svgH = isRect ? 100 : 120;

        // Seat positions
        const seats = isRect ? (() => {
          const topN = Math.ceil(cap / 2), botN = Math.floor(cap / 2);
          const res: { x: number; y: number }[] = [];
          const rX = 20, rY = 25, rW = 120, rH = 50, sR = 8;
          for (let i = 0; i < topN; i++) res.push({ x: rX + (rW / (topN + 1)) * (i + 1), y: rY - sR - 2 });
          for (let i = 0; i < botN; i++) res.push({ x: rX + (rW / (botN + 1)) * (i + 1), y: rY + rH + sR + 2 });
          return res;
        })() : Array.from({ length: cap }, (_, i) => {
          const angle = (i / cap) * 2 * Math.PI - Math.PI / 2;
          return { x: 60 + 54 * Math.cos(angle), y: 60 + 54 * Math.sin(angle) };
        });

        return (
          <div
            key={table.id}
            onMouseDown={e => onMouseDown(e, table, index)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              const gId = e.dataTransfer.getData("guestId");
              if (gId) onAssign(gId, table.id);
            }}
            style={{
              position: "absolute",
              left: pos.x - svgW / 2,
              top:  pos.y - svgH / 2,
              cursor: isDragging ? "grabbing" : "grab",
              zIndex: isDragging ? 10 : 1,
              filter: isDragging ? "drop-shadow(0 8px 20px rgba(28,16,8,0.18))" : "drop-shadow(0 2px 6px rgba(28,16,8,0.08))",
              transition: isDragging ? "none" : "filter 0.2s",
            }}
          >
            {/* Drag handle hint */}
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              width={svgW} height={svgH}
              style={{ overflow: "visible", display: "block" }}
            >
              {/* Table surface */}
              {isRect ? (
                <rect x={20} y={25} width={120} height={50} rx={8}
                  fill={selectedGuest ? "rgba(197,164,109,0.12)" : "#FDF8EF"}
                  stroke={selectedGuest ? GOLD : GOLD}
                  strokeWidth={isDragging ? 2 : 1.5}
                  strokeDasharray={selectedGuest ? "5,3" : "none"}
                />
              ) : (
                <circle cx={60} cy={60} r={38}
                  fill={selectedGuest ? "rgba(197,164,109,0.12)" : "#FDF8EF"}
                  stroke={GOLD}
                  strokeWidth={isDragging ? 2 : 1.5}
                  strokeDasharray={selectedGuest ? "5,3" : "none"}
                />
              )}

              {/* Table name */}
              <text
                x={svgW / 2} y={isRect ? 53 : 64}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fill={DARK}
                fontFamily="Frank Ruhl Libre, serif" fontWeight={700}
                style={{ pointerEvents: "none" }}
              >
                {table.name}
              </text>

              {/* Seats */}
              {seats.map((s, i) => {
                const assignment = assigned[i];
                const guest = assignment ? guestById(assignment.guest_id) : undefined;
                return (
                  <g key={i}
                    onClick={assignment ? (e) => { e.stopPropagation(); onRemove(assignment.guest_id); } : undefined}
                    style={{ cursor: assignment ? "pointer" : "default" }}
                  >
                    <circle cx={s.x} cy={s.y} r={9}
                      fill={guest ? OLIVE : "rgba(197,164,109,0.18)"}
                      stroke={guest ? OLIVE : "rgba(197,164,109,0.35)"}
                      strokeWidth={1}
                    />
                    {guest && (
                      <text x={s.x} y={s.y + 3.5} textAnchor="middle" fontSize={6}
                        fill="white" fontFamily="Heebo, sans-serif" fontWeight={600}
                        style={{ pointerEvents: "none" }}>
                        {getInitials(guest.name)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Occupancy badge */}
            <div style={{
              position: "absolute", top: -8, right: -8,
              fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20,
              background: over ? "rgba(220,38,38,0.1)" : "rgba(107,123,90,0.1)",
              color: over ? "rgb(220,38,38)" : OLIVE,
              border: `1px solid ${over ? "rgba(220,38,38,0.3)" : "rgba(107,123,90,0.25)"}`,
              display: "flex", alignItems: "center", gap: 2,
              pointerEvents: "none",
            }}>
              {over && <AlertTriangle size={8} />}{assigned.length}/{table.capacity}
            </div>

            {/* Delete button */}
            <button
              onClick={e => { e.stopPropagation(); onDelete(table.id); }}
              style={{
                position: "absolute", top: -8, left: -8,
                width: 20, height: 20, borderRadius: "50%",
                background: "rgba(255,255,255,0.9)", border: "1px solid rgba(197,164,109,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(51,51,51,0.45)", padding: 0,
              }}
            >
              <Trash2 size={10} />
            </button>

            {/* Assign CTA when guest selected */}
            {selectedGuest && !saving && (
              <button
                onClick={e => { e.stopPropagation(); onAssign(selectedGuest, table.id); }}
                style={{
                  position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", padding: "2px 10px", borderRadius: 12,
                  border: `1.5px dashed ${GOLD}`, background: "rgba(197,164,109,0.08)",
                  color: GOLD, cursor: "pointer", fontSize: 10, fontFamily: "Heebo, sans-serif",
                }}
              >
                ✦ הצב כאן
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
