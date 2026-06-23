"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";

const HEBREW_MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

const PRESETS = [
  { groom: "נועם", bride: "שירה", date: "2026-06-14" },
  { groom: "אורי",  bride: "מיכל", date: "2026-09-20" },
  { groom: "דניאל", bride: "נטע",  date: "2026-11-08" },
];

function formatDate(iso: string) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  const month = HEBREW_MONTHS[parseInt(m, 10) - 1] ?? "";
  return `${parseInt(d, 10)} ב${month}`;
}

export default function LiveInvitationDemo() {
  const [groom, setGroom]  = useState("נועם");
  const [bride, setBride]  = useState("שירה");
  const [date,  setDate]   = useState("2026-06-14");
  const [rsvped, setRsvped] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; angle: number }[]>([]);
  const [presetIdx, setPresetIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-rotate presets when user hasn't touched inputs
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setPresetIdx(i => {
        const next = (i + 1) % PRESETS.length;
        setGroom(PRESETS[next].groom);
        setBride(PRESETS[next].bride);
        setDate(PRESETS[next].date);
        setRsvped(false);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [autoPlay]);

  function stopAuto() { setAutoPlay(false); }

  function handleRsvp() {
    setRsvped(true);
    const pieces = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      color: ["#C5A46D","#FFF8EC","#6B7B5A","#D4BC8A","#fff"][i % 5],
      angle: Math.random() * 360,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1800);
  }

  const groomDisplay = groom.trim() || "החתן";
  const brideDisplay = bride.trim() || "הכלה";
  const dateDisplay  = date ? formatDate(date) : "תאריך החתונה";

  return (
    <section
      id="try-it"
      style={{
        background: "linear-gradient(160deg, #F6F1E8 0%, #EDE6D6 100%)",
        padding: "80px 20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(160px) rotate(720deg) scale(0.3); opacity: 0; }
        }
        @keyframes phoneShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes invitePulse {
          0%,100% { box-shadow: 0 20px 60px rgba(197,164,109,0.25); }
          50%      { box-shadow: 0 20px 60px rgba(197,164,109,0.45); }
        }
        .invite-card { animation: invitePulse 3s ease-in-out infinite; }
        .live-input:focus { outline: none; border-color: #C5A46D !important; box-shadow: 0 0 0 3px rgba(197,164,109,0.15) !important; }
      `}</style>

      {/* Decorative */}
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(197,164,109,0.07) 0%, transparent 70%)", top:-100, right:-100, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(107,123,90,0.05) 0%, transparent 70%)", bottom:-50, left:-50, pointerEvents:"none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <FadeIn className="text-center" >
          <div style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"rgba(197,164,109,0.75)", marginBottom:"0.6rem", fontFamily:"Heebo, sans-serif" }}>
            ✦ נסה עכשיו · בחינם
          </p>
          <h2 style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"clamp(1.8rem,4vw,2.5rem)", fontWeight:700, color:"#1C1008", margin:0, lineHeight:1.2 }}>
            ראה את ההזמנה שלך<br />
            <span style={{ color:"#C5A46D" }}>בזמן אמת</span>
          </h2>
          <p style={{ fontFamily:"Heebo, sans-serif", fontSize:14, color:"rgba(28,16,8,0.5)", marginTop:"0.75rem" }}>
            הקלד שמות ותאריך — ותראה מיד איך זה נראה
          </p>
          </div>
        </FadeIn>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2.5rem", alignItems:"center" }}
          className="flex-col-on-mobile"
        >
          {/* Controls */}
          <motion.div
            initial={{ opacity:0, x:-20 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}
          >
            <div>
              <label style={{ display:"block", fontFamily:"Heebo, sans-serif", fontSize:12, color:"rgba(28,16,8,0.5)", marginBottom:"0.4rem", letterSpacing:"0.05em" }}>
                שם החתן
              </label>
              <input
                className="live-input"
                value={groom}
                onChange={e => { setGroom(e.target.value); stopAuto(); }}
                placeholder="נועם"
                maxLength={20}
                style={{
                  width:"100%", padding:"0.75rem 1rem", borderRadius:"0.75rem",
                  border:"1.5px solid rgba(197,164,109,0.25)",
                  background:"rgba(255,255,255,0.9)",
                  fontFamily:"Frank Ruhl Libre, serif", fontSize:"1.1rem", color:"#1C1008",
                  boxSizing:"border-box" as const, transition:"all 0.2s",
                }}
              />
            </div>

            <div>
              <label style={{ display:"block", fontFamily:"Heebo, sans-serif", fontSize:12, color:"rgba(28,16,8,0.5)", marginBottom:"0.4rem", letterSpacing:"0.05em" }}>
                שם הכלה
              </label>
              <input
                className="live-input"
                value={bride}
                onChange={e => { setBride(e.target.value); stopAuto(); }}
                placeholder="שירה"
                maxLength={20}
                style={{
                  width:"100%", padding:"0.75rem 1rem", borderRadius:"0.75rem",
                  border:"1.5px solid rgba(197,164,109,0.25)",
                  background:"rgba(255,255,255,0.9)",
                  fontFamily:"Frank Ruhl Libre, serif", fontSize:"1.1rem", color:"#1C1008",
                  boxSizing:"border-box" as const, transition:"all 0.2s",
                }}
              />
            </div>

            <div>
              <label style={{ display:"block", fontFamily:"Heebo, sans-serif", fontSize:12, color:"rgba(28,16,8,0.5)", marginBottom:"0.4rem", letterSpacing:"0.05em" }}>
                תאריך החתונה
              </label>
              <input
                type="date"
                className="live-input"
                value={date}
                onChange={e => { setDate(e.target.value); stopAuto(); setRsvped(false); }}
                style={{
                  width:"100%", padding:"0.75rem 1rem", borderRadius:"0.75rem",
                  border:"1.5px solid rgba(197,164,109,0.25)",
                  background:"rgba(255,255,255,0.9)",
                  fontFamily:"Heebo, sans-serif", fontSize:"0.95rem", color:"#1C1008",
                  boxSizing:"border-box" as const, transition:"all 0.2s",
                }}
              />
            </div>

            {/* Preset pills */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" as const }}>
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setGroom(p.groom); setBride(p.bride); setDate(p.date); setRsvped(false); stopAuto(); setPresetIdx(i); }}
                  style={{
                    padding:"0.35rem 0.85rem", borderRadius:20, border:"1.5px solid rgba(197,164,109,0.3)",
                    background: presetIdx === i && !autoPlay ? "rgba(197,164,109,0.12)" : "transparent",
                    fontFamily:"Heebo, sans-serif", fontSize:12, color:"rgba(28,16,8,0.6)",
                    cursor:"pointer", transition:"all 0.2s",
                  }}
                >
                  {p.groom} ו{p.bride}
                </button>
              ))}
            </div>

            <div style={{
              padding:"1rem 1.25rem", borderRadius:"1rem",
              background:"rgba(107,123,90,0.06)", border:"1px solid rgba(107,123,90,0.15)",
            }}>
              <p style={{ fontFamily:"Heebo, sans-serif", fontSize:13, color:"rgba(28,16,8,0.55)", margin:0, lineHeight:1.6 }}>
                💡 <strong style={{ color:"#6B7B5A" }}>כזה בדיוק</strong> יקבלו האורחים שלך — הזמנה אישית בקישור שנשלח בוואטסאפ. כל לחיצה מגיעה ישר אליך בלוח הבקרה.
              </p>
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity:0, x:20 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.15 }}
            style={{ display:"flex", justifyContent:"center", position:"relative" }}
          >
            {/* Confetti */}
            {confetti.map(c => (
              <div key={c.id} style={{
                position:"absolute", top:"35%", left:`${c.x}%`,
                width:8, height:8, borderRadius:2,
                background:c.color, transformOrigin:"center",
                animation:`confettiFall 1.6s ease-out forwards`,
                transform:`rotate(${c.angle}deg)`,
                pointerEvents:"none", zIndex:10,
              }} />
            ))}

            {/* Phone frame */}
            <div style={{
              width:240, height:480,
              background:"linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
              borderRadius:36, padding:"12px 8px",
              boxShadow:"0 30px 80px rgba(28,16,8,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
              border:"2px solid rgba(255,255,255,0.06)",
              position:"relative",
            }}>
              {/* Notch */}
              <div style={{ position:"absolute", top:12, left:"50%", transform:"translateX(-50%)", width:60, height:16, background:"#0d1117", borderRadius:8, zIndex:2 }} />

              {/* Screen */}
              <div style={{
                background:"#F2EDE3", borderRadius:28, height:"100%",
                overflow:"hidden", position:"relative",
                display:"flex", flexDirection:"column",
              }}>
                {/* Screen status bar */}
                <div style={{ height:28, background:"rgba(28,16,8,0.04)", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:4 }}>
                  <span style={{ fontSize:7, color:"rgba(28,16,8,0.3)", fontFamily:"Heebo, sans-serif" }}>הזמנה דיגיטלית</span>
                </div>

                {/* Invitation card */}
                <div className="invite-card" style={{
                  flex:1, margin:"6px 10px 10px",
                  background:"white",
                  borderRadius:20, padding:"16px 12px",
                  display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"space-between",
                  border:"1px solid rgba(197,164,109,0.15)",
                }}>
                  {/* Top ornament */}
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:20, marginBottom:4 }}>💍</div>
                    <div style={{ width:40, height:1, background:"rgba(197,164,109,0.4)", margin:"0 auto 8px" }} />
                    <p style={{ fontFamily:"Heebo, sans-serif", fontSize:7.5, color:"rgba(28,16,8,0.45)", letterSpacing:"0.12em", textTransform:"uppercase" as const }}>
                      בשמחה רבה מזמינים
                    </p>
                  </div>

                  {/* Names */}
                  <div style={{ textAlign:"center", padding:"8px 0" }}>
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={`${groomDisplay}-${brideDisplay}`}
                        initial={{ opacity:0, y:6 }}
                        animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, y:-6 }}
                        transition={{ duration:0.35 }}
                        style={{
                          fontFamily:"Frank Ruhl Libre, serif",
                          fontSize:"clamp(14px,3vw,18px)",
                          fontWeight:700, color:"#1C1008",
                          margin:0, lineHeight:1.35,
                        }}
                      >
                        {groomDisplay}
                        <br />
                        <span style={{ fontSize:"0.7em", color:"rgba(197,164,109,0.8)", fontWeight:400 }}>&amp;</span>
                        <br />
                        {brideDisplay}
                      </motion.h1>
                    </AnimatePresence>
                    <div style={{ width:30, height:1.5, background:"linear-gradient(90deg, transparent, #C5A46D, transparent)", margin:"6px auto" }} />
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={dateDisplay}
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        exit={{ opacity:0 }}
                        transition={{ duration:0.3 }}
                        style={{ fontFamily:"Heebo, sans-serif", fontSize:9, color:"rgba(28,16,8,0.55)", margin:0 }}
                      >
                        {dateDisplay}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* RSVP button */}
                  <div style={{ width:"100%", textAlign:"center" }}>
                    <AnimatePresence mode="wait">
                      {rsvped ? (
                        <motion.div
                          key="confirmed"
                          initial={{ scale:0.8, opacity:0 }}
                          animate={{ scale:1, opacity:1 }}
                          style={{
                            padding:"7px 12px", borderRadius:20,
                            background:"rgba(107,123,90,0.12)", border:"1px solid rgba(107,123,90,0.3)",
                            fontFamily:"Heebo, sans-serif", fontSize:9, color:"#6B7B5A", fontWeight:600,
                          }}
                        >
                          ✓ אישרת הגעה!
                        </motion.div>
                      ) : (
                        <motion.button
                          key="rsvp"
                          whileTap={{ scale:0.95 }}
                          onClick={handleRsvp}
                          style={{
                            padding:"7px 20px", borderRadius:20, border:"none", cursor:"pointer",
                            background:"linear-gradient(135deg, #C5A46D, #9B6E2C)",
                            color:"white", fontFamily:"Heebo, sans-serif", fontSize:9, fontWeight:700,
                            boxShadow:"0 4px 12px rgba(197,164,109,0.4)",
                          }}
                        >
                          אישור הגעה
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* "Live" badge */}
            <div style={{
              position:"absolute", top:12, right:-8,
              background:"#ef4444", color:"white",
              fontFamily:"Heebo, sans-serif", fontSize:9, fontWeight:700,
              padding:"3px 8px", borderRadius:12,
              display:"flex", alignItems:"center", gap:4,
              boxShadow:"0 2px 8px rgba(239,68,68,0.4)",
            }}>
              <div style={{ width:5, height:5, borderRadius:"50%", background:"white", animation:"invitePulse 1s ease-in-out infinite" }} />
              LIVE
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .flex-col-on-mobile { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
