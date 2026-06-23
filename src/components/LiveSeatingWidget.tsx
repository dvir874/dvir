"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABLES = [
  { id: "t1", name: "שולחן 1", capacity: 8, type: "round" },
  { id: "t2", name: "שולחן 2", capacity: 8, type: "round" },
  { id: "t3", name: "שולחן 3", capacity: 6, type: "rect"  },
  { id: "t4", name: "שולחן 4", capacity: 6, type: "round" },
  { id: "t5", name: "VIP",     capacity: 4, type: "rect"  },
  { id: "t6", name: "שולחן 6", capacity: 8, type: "round" },
];

const INITIAL_GUESTS = [
  "משפחת לוי","דוד ורחל","יוסי כהן","נעמה גולן",
  "משפחת פרץ","איתי שמיר","ליאור אבוטבול","שרה מזרחי",
];

export default function LiveSeatingWidget() {
  const [guests, setGuests]     = useState(INITIAL_GUESTS);
  const [selected, setSelected] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [flash, setFlash]       = useState<string | null>(null);

  const seated = Object.values(assignments).flat().length;
  const total  = INITIAL_GUESTS.length;

  function selectGuest(name: string) {
    setSelected(s => s === name ? null : name);
  }

  function assignToTable(tableId: string) {
    if (!selected) return;
    const table = TABLES.find(t => t.id === tableId)!;
    const current = assignments[tableId] ?? [];
    if (current.length >= table.capacity) return;
    if (Object.values(assignments).flat().includes(selected)) return;

    setAssignments(a => ({ ...a, [tableId]: [...(a[tableId] ?? []), selected] }));
    setGuests(g => g.filter(n => n !== selected));
    setFlash(tableId);
    setTimeout(() => setFlash(null), 600);
    setSelected(null);
  }

  function reset() {
    setGuests(INITIAL_GUESTS);
    setAssignments({});
    setSelected(null);
  }

  return (
    <section style={{
      background: "linear-gradient(160deg, #F6F1E8 0%, #EDE6D6 100%)",
      padding: "80px 20px",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes tablePop { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
        .table-cell:hover { transform: scale(1.04); }
        .guest-chip { transition: all .15s; }
        .guest-chip:hover { transform: translateY(-2px); }
      `}</style>

      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(107,123,90,0.06) 0%, transparent 70%)", bottom:-80, left:-80, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(197,164,109,0.06) 0%, transparent 70%)", top:-60, right:-60, pointerEvents:"none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom:"2.5rem" }}>
          <p style={{ fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"rgba(197,164,109,0.75)", marginBottom:"0.6rem", fontFamily:"Heebo, sans-serif" }}>
            ✦ נסה בעצמך
          </p>
          <h2 style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:700, color:"#1C1008", margin:0 }}>
            סדר את האורחים בשולחנות
          </h2>
          <p style={{ fontFamily:"Heebo, sans-serif", fontSize:14, color:"rgba(28,16,8,0.45)", marginTop:"0.5rem" }}>
            לחץ על אורח, ואז על שולחן — ותראה איך זה עובד
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth:400, margin:"0 auto 2rem", textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontFamily:"Heebo, sans-serif", fontSize:12, color:"rgba(28,16,8,0.4)" }}>הוצבו</span>
            <span style={{ fontFamily:"Heebo, sans-serif", fontSize:12, fontWeight:700, color:"#6B7B5A" }}>{seated} / {total}</span>
          </div>
          <div style={{ height:6, background:"rgba(197,164,109,0.15)", borderRadius:3, overflow:"hidden" }}>
            <motion.div
              animate={{ width:`${(seated/total)*100}%` }}
              transition={{ duration:0.5, ease:"easeOut" }}
              style={{ height:"100%", background:"linear-gradient(90deg,#6B7B5A,#C5A46D)", borderRadius:3 }}
            />
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem", alignItems:"start" }}
          className="flex-col-on-mobile"
        >
          {/* Guest pool */}
          <div>
            <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"1rem", fontWeight:700, color:"#1C1008", marginBottom:"0.75rem" }}>
              {guests.length > 0 ? `אורחים ממתינים (${guests.length})` : "✓ כל האורחים הוצבו!"}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8, minHeight:80 }}>
              <AnimatePresence>
                {guests.map(g => (
                  <motion.button
                    key={g}
                    layout
                    initial={{ opacity:0, scale:0.8 }}
                    animate={{ opacity:1, scale:1 }}
                    exit={{ opacity:0, scale:0.7, y:-10 }}
                    className="guest-chip"
                    onClick={() => selectGuest(g)}
                    style={{
                      padding:"6px 14px", borderRadius:20, cursor:"pointer",
                      background: selected === g
                        ? "linear-gradient(135deg,#C5A46D,#9B6E2C)"
                        : "rgba(197,164,109,0.12)",
                      color: selected === g ? "white" : "#1C1008",
                      fontFamily:"Heebo, sans-serif", fontSize:13, fontWeight: selected === g ? 700 : 400,
                      boxShadow: selected === g ? "0 4px 16px rgba(197,164,109,0.4)" : "none",
                      border: selected === g ? "none" : "1.5px solid rgba(197,164,109,0.25)",
                    }}
                  >
                    {selected === g ? `✦ ${g}` : g}
                  </motion.button>
                ))}
              </AnimatePresence>
              {guests.length === 0 && (
                <div style={{ textAlign:"center", width:"100%", padding:"1rem 0" }}>
                  <p style={{ fontSize:32, margin:"0 0 8px" }}>🎉</p>
                  <button
                    onClick={reset}
                    style={{
                      padding:"6px 16px", borderRadius:20, cursor:"pointer",
                      background:"rgba(107,123,90,0.1)", border:"1.5px solid rgba(107,123,90,0.3)",
                      fontFamily:"Heebo, sans-serif", fontSize:12, color:"#6B7B5A",
                    }}
                  >
                    אפס ונסה שוב
                  </button>
                </div>
              )}
            </div>

            {selected && (
              <motion.p
                initial={{ opacity:0, y:4 }}
                animate={{ opacity:1, y:0 }}
                style={{ fontFamily:"Heebo, sans-serif", fontSize:12, color:"#9B6E2C", marginTop:"0.75rem", fontWeight:600 }}
              >
                ← בחרת: {selected}. עכשיו לחץ על שולחן
              </motion.p>
            )}
          </div>

          {/* Tables grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {TABLES.map(table => {
              const seated_here = assignments[table.id] ?? [];
              const pct = seated_here.length / table.capacity;
              const isFlashing = flash === table.id;
              const isFull = seated_here.length >= table.capacity;

              return (
                <motion.div
                  key={table.id}
                  whileHover={selected && !isFull ? { scale:1.05 } : {}}
                  whileTap={selected && !isFull ? { scale:0.97 } : {}}
                  onClick={() => assignToTable(table.id)}
                  style={{
                    padding:"10px 8px",
                    borderRadius:14,
                    background: isFlashing
                      ? "rgba(107,123,90,0.2)"
                      : selected && !isFull
                        ? "rgba(197,164,109,0.1)"
                        : "rgba(255,255,255,0.85)",
                    border: `1.5px solid ${
                      isFlashing ? "rgba(107,123,90,0.5)"
                      : selected && !isFull ? "rgba(197,164,109,0.4)"
                      : "rgba(197,164,109,0.15)"
                    }`,
                    cursor: selected && !isFull ? "pointer" : "default",
                    textAlign:"center" as const,
                    boxShadow: selected && !isFull ? "0 4px 16px rgba(197,164,109,0.2)" : "0 2px 8px rgba(28,16,8,0.06)",
                    transition:"all .2s",
                    animation: isFlashing ? "tablePop .5s ease" : "none",
                  }}
                >
                  {/* Table icon */}
                  <div style={{
                    width:32, height:32, borderRadius: table.type === "round" ? "50%" : 8,
                    background:`linear-gradient(135deg, rgba(197,164,109,0.2), rgba(197,164,109,0.08))`,
                    border:"1.5px solid rgba(197,164,109,0.3)",
                    margin:"0 auto 6px",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:14,
                  }}>
                    {table.name === "VIP" ? "⭐" : table.type === "round" ? "⭕" : "🟥"}
                  </div>

                  <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:9, fontWeight:700, color:"#1C1008", margin:"0 0 4px" }}>
                    {table.name}
                  </p>

                  {/* Fill bar */}
                  <div style={{ height:3, background:"rgba(197,164,109,0.12)", borderRadius:2, margin:"0 4px 4px", overflow:"hidden" }}>
                    <div style={{
                      height:"100%", borderRadius:2, transition:"width .4s ease",
                      width:`${pct*100}%`,
                      background: isFull ? "#6B7B5A" : "linear-gradient(90deg,#C5A46D,#9B6E2C)",
                    }} />
                  </div>

                  <p style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:"rgba(28,16,8,0.4)", margin:0 }}>
                    {seated_here.length}/{table.capacity}
                  </p>

                  {/* Seated guest dots */}
                  {seated_here.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap" as const, gap:2, marginTop:4, justifyContent:"center" }}>
                      {seated_here.map((_, i) => (
                        <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:"#C5A46D", opacity:0.8 }} />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Reset button */}
        {seated > 0 && guests.length > 0 && (
          <div style={{ textAlign:"center", marginTop:"1.5rem" }}>
            <button
              onClick={reset}
              style={{
                padding:"6px 18px", borderRadius:20, cursor:"pointer",
                background:"transparent", border:"1.5px solid rgba(197,164,109,0.3)",
                fontFamily:"Heebo, sans-serif", fontSize:12, color:"rgba(28,16,8,0.4)",
              }}
            >
              אפס
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
