"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TASKS = [
  { id: 1, label: "הזמנת צלם", done: true,  cat: "צלם" },
  { id: 2, label: "בחירת תפריט", done: true,  cat: "קייטרינג" },
  { id: 3, label: "שמלת כלה", done: false, cat: "שמלה" },
  { id: 4, label: "זימון רב", done: false, cat: "רב" },
  { id: 5, label: "הזמנת DJ",   done: false, cat: "מוזיקה" },
];

const BUDGET = [
  { label: "אולם",      amount: 18000, color: "#C5A46D" },
  { label: "צלם",       amount: 9000,  color: "#6B7B5A" },
  { label: "קייטרינג", amount: 22000, color: "#9B6E2C" },
  { label: "שמלה",      amount: 5000,  color: "#D4BC8A" },
  { label: "שאר",      amount: 6000,  color: "#8BA87A" },
];

const TOTAL_BUDGET = BUDGET.reduce((s, b) => s + b.amount, 0);

function DonutChart({ slices }: { slices: typeof BUDGET }) {
  const R = 38, CX = 50, CY = 50;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  const total = slices.reduce((s, b) => s + b.amount, 0);

  return (
    <svg viewBox="0 0 100 100" width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
      {slices.map((s, i) => {
        const pct = s.amount / total;
        const dash = pct * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return el;
      })}
      {/* center hole */}
      <circle cx={CX} cy={CY} r={28} fill="#1C1008" />
    </svg>
  );
}

export default function LiveDashboardWidget() {
  const [rsvp, setRsvp] = useState(0);
  const [tasks, setTasks] = useState(TASKS);
  const [tab, setTab] = useState<"rsvp"|"budget"|"tasks">("rsvp");
  const rsvpTarget = 187;
  const started = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const id = setInterval(() => {
          cur = Math.min(cur + 3, rsvpTarget);
          setRsvp(cur);
          if (cur >= rsvpTarget) clearInterval(id);
        }, 20);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function toggleTask(id: number) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const confirmed = Math.round(rsvp * 0.72);
  const declined  = Math.round(rsvp * 0.11);
  const pending   = rsvp - confirmed - declined;
  const doneTasks = tasks.filter(t => t.done).length;

  return (
    <section
      ref={sectionRef}
      style={{
        background: "linear-gradient(160deg, #1C1008 0%, #2E1A0A 60%, #1C1008 100%)",
        padding: "80px 20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes dashPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        .db-tab { transition: all .2s; cursor: pointer; }
        .db-tab:hover { background: rgba(197,164,109,0.12) !important; }
      `}</style>

      {/* Glow */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 70% 50%, rgba(197,164,109,0.07) 0%, transparent 60%)", pointerEvents:"none" }} />

      <div style={{ maxWidth: 900, margin: "0 auto", position:"relative", zIndex:1 }}>

        {/* Heading */}
        <div className="text-center" style={{ marginBottom:"3rem" }}>
          <p style={{ fontSize:10, letterSpacing:"0.3em", textTransform:"uppercase" as const, color:"rgba(197,164,109,0.6)", marginBottom:"0.6rem", fontFamily:"Heebo, sans-serif" }}>
            ✦ לוח הבקרה שלכם
          </p>
          <h2 style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:700, color:"#FFF8EC", margin:0 }}>
            הכל במקום אחד, בזמן אמת
          </h2>
          <p style={{ fontFamily:"Heebo, sans-serif", fontSize:14, color:"rgba(255,240,200,0.4)", marginTop:"0.6rem" }}>
            לחצו על הטאבים — זה בדיוק מה שתקבלו
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2rem", alignItems:"start" }}
          className="flex-col-on-mobile"
        >

          {/* Left: laptop frame */}
          <motion.div
            initial={{ opacity:0, x:-20 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6 }}
            style={{ position:"relative" }}
          >
            {/* Laptop shell */}
            <div style={{
              background:"linear-gradient(180deg, #2a2a3e 0%, #1a1a2e 100%)",
              borderRadius:16, padding:"10px 10px 0",
              boxShadow:"0 30px 80px rgba(0,0,0,0.5)",
              border:"1.5px solid rgba(255,255,255,0.06)",
            }}>
              {/* Screen */}
              <div style={{
                background:"#0f0b07", borderRadius:10, overflow:"hidden",
                minHeight:260, padding:"14px",
              }}>
                {/* Top bar */}
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#ff5f56" }} />
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#ffbd2e" }} />
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#27c93f" }} />
                  <div style={{ flex:1, height:14, borderRadius:4, background:"rgba(255,255,255,0.05)", marginRight:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:7, color:"rgba(255,255,255,0.2)", fontFamily:"Heebo, sans-serif" }}>regalifnei.co.il/dashboard</span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display:"flex", gap:4, marginBottom:14 }}>
                  {([["rsvp","אישורי הגעה"],["budget","תקציב"],["tasks","משימות"]] as const).map(([id, label]) => (
                    <button
                      key={id}
                      className="db-tab"
                      onClick={() => setTab(id)}
                      style={{
                        flex:1, padding:"5px 4px", borderRadius:8, border:"none", cursor:"pointer",
                        background: tab === id ? "rgba(197,164,109,0.2)" : "rgba(255,255,255,0.04)",
                        color: tab === id ? "#C5A46D" : "rgba(255,255,255,0.35)",
                        fontFamily:"Heebo, sans-serif", fontSize:9, fontWeight: tab === id ? 700 : 400,
                        borderBottom: tab === id ? "1.5px solid #C5A46D" : "1.5px solid transparent",
                        transition:"all .2s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  {tab === "rsvp" && (
                    <motion.div key="rsvp" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
                      {/* Big number */}
                      <div style={{ textAlign:"center", marginBottom:12 }}>
                        <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:36, fontWeight:700, color:"#FFF8EC", margin:0, lineHeight:1 }}>{rsvp}</p>
                        <p style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:"rgba(255,240,200,0.4)", margin:"4px 0 0" }}>הוזמנו סה״כ</p>
                      </div>
                      {/* Bars */}
                      {[
                        { label:"מגיעים", value:confirmed, color:"#6B7B5A" },
                        { label:"לא מגיעים", value:declined,  color:"#C0392B" },
                        { label:"ממתינים", value:pending,   color:"#C5A46D" },
                      ].map(b => (
                        <div key={b.label} style={{ marginBottom:8 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:"rgba(255,255,255,0.45)" }}>{b.label}</span>
                            <span style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:b.color, fontWeight:700 }}>{b.value}</span>
                          </div>
                          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                            <motion.div
                              initial={{ width:0 }}
                              animate={{ width:`${rsvpTarget > 0 ? (b.value / rsvpTarget) * 100 : 0}%` }}
                              transition={{ duration:1.2, ease:"easeOut" }}
                              style={{ height:"100%", background:b.color, borderRadius:3 }}
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {tab === "budget" && (
                    <motion.div key="budget" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ position:"relative" }}>
                          <DonutChart slices={BUDGET} />
                          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                            <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:11, fontWeight:700, color:"#C5A46D", margin:0 }}>₪{(TOTAL_BUDGET/1000).toFixed(0)}K</p>
                            <p style={{ fontFamily:"Heebo, sans-serif", fontSize:6.5, color:"rgba(255,255,255,0.3)", margin:0 }}>סה״כ</p>
                          </div>
                        </div>
                        <div style={{ flex:1 }}>
                          {BUDGET.map(b => (
                            <div key={b.label} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
                              <div style={{ width:6, height:6, borderRadius:"50%", background:b.color, flexShrink:0 }} />
                              <span style={{ flex:1, fontFamily:"Heebo, sans-serif", fontSize:8, color:"rgba(255,255,255,0.5)" }}>{b.label}</span>
                              <span style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:"rgba(255,255,255,0.7)", fontWeight:600 }}>₪{b.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {tab === "tasks" && (
                    <motion.div key="tasks" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                        <span style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:"rgba(255,255,255,0.35)" }}>התקדמות</span>
                        <span style={{ fontFamily:"Heebo, sans-serif", fontSize:8, color:"#C5A46D", fontWeight:700 }}>{doneTasks}/{tasks.length}</span>
                      </div>
                      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, marginBottom:12, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${(doneTasks/tasks.length)*100}%`, background:"linear-gradient(90deg,#6B7B5A,#C5A46D)", borderRadius:2, transition:"width .4s" }} />
                      </div>
                      {tasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => toggleTask(t.id)}
                          style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 4px", borderRadius:6, cursor:"pointer", marginBottom:4, transition:"background .15s" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{
                            width:13, height:13, borderRadius:4, border:`1.5px solid ${t.done ? "#6B7B5A" : "rgba(255,255,255,0.2)"}`,
                            background: t.done ? "#6B7B5A" : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s",
                          }}>
                            {t.done && <span style={{ color:"white", fontSize:8, fontWeight:700 }}>✓</span>}
                          </div>
                          <span style={{ fontFamily:"Heebo, sans-serif", fontSize:9, color: t.done ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)", textDecoration: t.done ? "line-through" : "none", transition:"all .2s" }}>
                            {t.label}
                          </span>
                          <span style={{ marginRight:"auto", fontFamily:"Heebo, sans-serif", fontSize:7, color:"rgba(197,164,109,0.4)", background:"rgba(197,164,109,0.08)", padding:"1px 5px", borderRadius:8 }}>
                            {t.cat}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Laptop bottom */}
              <div style={{ height:10, background:"rgba(255,255,255,0.03)", borderRadius:"0 0 6px 6px", margin:"0 -2px" }} />
            </div>
            {/* Base */}
            <div style={{ height:6, background:"linear-gradient(180deg,#2a2a3e,#1a1a2e)", borderRadius:"0 0 8px 8px", margin:"0 10px", boxShadow:"0 8px 20px rgba(0,0,0,0.4)" }} />
            <div style={{ height:3, background:"rgba(255,255,255,0.04)", borderRadius:4, margin:"0 30px", boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }} />
          </motion.div>

          {/* Right: explanation */}
          <motion.div
            initial={{ opacity:0, x:20 }}
            whileInView={{ opacity:1, x:0 }}
            viewport={{ once:true }}
            transition={{ duration:0.6, delay:0.15 }}
            style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}
          >
            {[
              { icon:"📊", tab:"rsvp" as const, title:"אישורי הגעה חיים", desc:"תראו בזמן אמת כמה מגיעים, כמה סירבו וכמה עוד לא ענו. אוטומטי, ללא מרדפים." },
              { icon:"💰", tab:"budget" as const, title:"תקציב חכם", desc:"הוסיפו קטגוריות ועלויות. המערכת מציגה גרף עוגה חי ומחשבת את הנשאר." },
              { icon:"✅", tab:"tasks" as const, title:"משימות לפי עדיפות", desc:"רשימת משימות שמסודרת לפי דדליין. לחצו על כל טאב בשמאל לניסיון." },
            ].map(item => (
              <motion.div
                key={item.title}
                whileHover={{ x: -4 }}
                onClick={() => setTab(item.tab)}
                style={{
                  padding:"1rem 1.25rem", borderRadius:"1rem", cursor:"pointer",
                  background: tab === item.tab ? "rgba(197,164,109,0.1)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${tab === item.tab ? "rgba(197,164,109,0.3)" : "rgba(255,255,255,0.06)"}`,
                  transition:"all .2s",
                }}
              >
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <span style={{ fontSize:20, flexShrink:0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontFamily:"Frank Ruhl Libre, serif", fontSize:"0.95rem", fontWeight:700, color:"#FFF8EC", margin:"0 0 4px" }}>{item.title}</p>
                    <p style={{ fontFamily:"Heebo, sans-serif", fontSize:13, color:"rgba(255,240,200,0.45)", margin:0, lineHeight:1.6 }}>{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      <style>{`.flex-col-on-mobile { } @media(max-width:640px){ .flex-col-on-mobile { grid-template-columns:1fr !important; } }`}</style>
    </section>
  );
}
