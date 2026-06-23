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
            הקלד שמות ותאריך. ותראה מיד איך זה נראה
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
                💡 <strong style={{ color:"#6B7B5A" }}>כזה בדיוק</strong> יקבלו האורחים שלך. הזמנה אישית בקישור שנשלח בוואטסאפ. כל לחיצה מגיעה ישר אליך בלוח הבקרה.
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

              {/* Screen — full invitation design */}
              <div style={{
                borderRadius:28, height:"100%",
                overflow:"hidden", position:"relative",
                background:"linear-gradient(160deg, #1C1008 0%, #2E1A0A 55%, #1C1008 100%)",
                display:"flex", flexDirection:"column",
              }}>
                {/* Status bar */}
                <div style={{ height:28, display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:4, flexShrink:0 }}>
                  <span style={{ fontSize:7, color:"rgba(197,164,109,0.4)", fontFamily:"Heebo, sans-serif", letterSpacing:"0.15em" }}>הזמנה דיגיטלית</span>
                </div>

                {/* Decorative corner SVG ornaments */}
                <svg style={{ position:"absolute", top:30, right:8, opacity:0.18 }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M2 2 Q20 2 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <path d="M2 2 Q2 20 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <circle cx="2" cy="2" r="2" fill="#C5A46D"/>
                  <circle cx="20" cy="20" r="1.5" fill="#C5A46D"/>
                </svg>
                <svg style={{ position:"absolute", top:30, left:8, opacity:0.18, transform:"scaleX(-1)" }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M2 2 Q20 2 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <path d="M2 2 Q2 20 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <circle cx="2" cy="2" r="2" fill="#C5A46D"/>
                  <circle cx="20" cy="20" r="1.5" fill="#C5A46D"/>
                </svg>
                <svg style={{ position:"absolute", bottom:60, right:8, opacity:0.18, transform:"scaleY(-1)" }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M2 2 Q20 2 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <path d="M2 2 Q2 20 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <circle cx="2" cy="2" r="2" fill="#C5A46D"/>
                </svg>
                <svg style={{ position:"absolute", bottom:60, left:8, opacity:0.18, transform:"scale(-1,-1)" }} width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M2 2 Q20 2 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <path d="M2 2 Q2 20 20 20" stroke="#C5A46D" strokeWidth="1"/>
                  <circle cx="2" cy="2" r="2" fill="#C5A46D"/>
                </svg>

                {/* Glow orb */}
                <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(197,164,109,0.12) 0%, transparent 70%)", top:"25%", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }} />

                {/* Main content */}
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"10px 16px 14px", position:"relative", zIndex:1 }}>

                  {/* Top section */}
                  <div style={{ textAlign:"center", width:"100%" }}>
                    {/* Hebrew blessing */}
                    <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:7.5, color:"rgba(197,164,109,0.6)", letterSpacing:"0.2em", margin:"0 0 8px" }}>
                      ✦ בשעה טובה ומוצלחת ✦
                    </p>
                    {/* Thin gold divider */}
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:8 }}>
                      <div style={{ flex:1, height:0.5, background:"linear-gradient(90deg, transparent, rgba(197,164,109,0.5))" }} />
                      <div style={{ width:3, height:3, borderRadius:"50%", background:"#C5A46D", opacity:0.7 }} />
                      <div style={{ flex:1, height:0.5, background:"linear-gradient(90deg, rgba(197,164,109,0.5), transparent)" }} />
                    </div>
                    <p style={{ fontFamily:"Heebo, sans-serif", fontSize:7, color:"rgba(255,240,200,0.4)", letterSpacing:"0.12em", margin:0 }}>
                      שמחים להזמין אתכם לאירוע החתונה של
                    </p>
                  </div>

                  {/* Names — center piece */}
                  <div style={{ textAlign:"center" }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${groomDisplay}-${brideDisplay}`}
                        initial={{ opacity:0, scale:0.95 }}
                        animate={{ opacity:1, scale:1 }}
                        exit={{ opacity:0, scale:1.02 }}
                        transition={{ duration:0.4 }}
                      >
                        <p style={{
                          fontFamily:"Frank Ruhl Libre, serif",
                          fontSize:22, fontWeight:700,
                          color:"#FFF8EC",
                          margin:0, lineHeight:1.1,
                          textShadow:"0 0 20px rgba(197,164,109,0.3)",
                        }}>
                          {groomDisplay}
                        </p>
                        {/* Ampersand ornament */}
                        <p style={{
                          fontFamily:"Frank Ruhl Libre, serif",
                          fontSize:13, color:"#C5A46D",
                          margin:"3px 0", lineHeight:1,
                        }}>
                          &amp;
                        </p>
                        <p style={{
                          fontFamily:"Frank Ruhl Libre, serif",
                          fontSize:22, fontWeight:700,
                          color:"#FFF8EC",
                          margin:0, lineHeight:1.1,
                          textShadow:"0 0 20px rgba(197,164,109,0.3)",
                        }}>
                          {brideDisplay}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Gold ornamental divider */}
                    <div style={{ margin:"10px auto 0", width:60 }}>
                      <svg viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="6" x2="22" y2="6" stroke="url(#g1)" strokeWidth="0.7"/>
                        <circle cx="30" cy="6" r="3" stroke="#C5A46D" strokeWidth="0.7" fill="none"/>
                        <circle cx="30" cy="6" r="1" fill="#C5A46D" opacity="0.7"/>
                        <line x1="38" y1="6" x2="60" y2="6" stroke="url(#g2)" strokeWidth="0.7"/>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="22" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#C5A46D" stopOpacity="0"/>
                            <stop offset="1" stopColor="#C5A46D" stopOpacity="0.8"/>
                          </linearGradient>
                          <linearGradient id="g2" x1="38" y1="0" x2="60" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#C5A46D" stopOpacity="0.8"/>
                            <stop offset="1" stopColor="#C5A46D" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* Date + details */}
                  <div style={{ textAlign:"center", width:"100%" }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={dateDisplay}
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        exit={{ opacity:0 }}
                        transition={{ duration:0.3 }}
                      >
                        <p style={{
                          fontFamily:"Frank Ruhl Libre, serif",
                          fontSize:11, color:"rgba(197,164,109,0.9)",
                          margin:"0 0 3px", fontWeight:600,
                        }}>
                          {dateDisplay || "תאריך החתונה"}
                        </p>
                        <p style={{ fontFamily:"Heebo, sans-serif", fontSize:7, color:"rgba(255,240,200,0.35)", margin:0 }}>
                          אולם האירועים · שעה 19:00
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* RSVP button */}
                    <div style={{ marginTop:10 }}>
                      <AnimatePresence mode="wait">
                        {rsvped ? (
                          <motion.div
                            key="confirmed"
                            initial={{ scale:0.85, opacity:0 }}
                            animate={{ scale:1, opacity:1 }}
                            style={{
                              padding:"6px 14px", borderRadius:16,
                              background:"rgba(107,123,90,0.2)", border:"1px solid rgba(107,123,90,0.4)",
                              fontFamily:"Heebo, sans-serif", fontSize:8.5, color:"#8BA87A", fontWeight:700,
                              display:"inline-block",
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
                              padding:"7px 22px", borderRadius:20, border:"none", cursor:"pointer",
                              background:"linear-gradient(135deg, #C5A46D 0%, #9B6E2C 100%)",
                              color:"white", fontFamily:"Heebo, sans-serif", fontSize:9, fontWeight:700,
                              boxShadow:"0 4px 16px rgba(197,164,109,0.5)",
                              letterSpacing:"0.05em",
                            }}
                          >
                            אישור הגעה ←
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
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
