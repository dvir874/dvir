"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import HelpButton from "@/components/HelpButton";
import CoupleBottomNav from "@/components/CoupleBottomNav";

const C = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D", goldText: "#8B6914",
  olive: "#6B7B5A", dark: "#1C1008", muted: "#8C7B6E", border: "#E8E0D4",
};

const CSS_CHECK = `
  @import url('https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700;900&family=Heebo:wght@300;400;500;600&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes checkDraw{from{stroke-dashoffset:30}to{stroke-dashoffset:0}}
`;

function CheckProgressArc({ value, done, total }: { value:number; done:number; total:number }) {
  const r=52, circ=2*Math.PI*r, arc=circ*0.75, filled=(Math.min(value,100)/100)*arc;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0 8px", position:"relative" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" aria-label={`הושלם: ${value}%`} style={{ transform:"rotate(135deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(197,164,109,0.14)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${arc} ${circ-arc}`}/>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#C5A46D" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${filled} ${circ-filled}`} style={{ transition:"stroke-dasharray .8s ease" }}/>
      </svg>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-46%)", textAlign:"center" }}>
        <p style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"28px", fontWeight:900, color:C.goldText, margin:0, lineHeight:1 }}>{value}%</p>
        <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"13px", fontWeight:300, color:C.muted, margin:0 }}>הושלם</p>
      </div>
    </div>
  );
}

const CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "venue",    label: "אולם ומקום",       icon: "🏛" },
  { value: "vendors",  label: "ספקים",            icon: "🤝" },
  { value: "legal",    label: "רבנות וחוזים",     icon: "📜" },
  { value: "personal", label: "אישי",             icon: "💍" },
  { value: "guests",   label: "מוזמנים",          icon: "👥" },
  { value: "budget",   label: "תקציב",            icon: "💰" },
  { value: "day_of",   label: "יום האירוע",       icon: "🎉" },
  { value: "general",  label: "כללי",             icon: "📋" },
];

interface Task {
  id: string;
  title: string;
  category: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
}

const MILESTONE_MSGS: Record<number, string> = {
  25: "🎉 כל הכבוד! סיימתם 25% מהמשימות.",
  50: "👏 מדהים! חצי הדרך כבר מאחוריכם!",
  75: "🥳 75% הושלמו — אתם כמעט שם!",
  100: "🏆 כל המשימות הושלמו! אתם מדהימים.",
};

export default function ChecklistPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.value)));
  const [filter, setFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState("general");
  const [newDue, setNewDue] = useState("");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const prevPct = useRef(0);

  const load = useCallback(async () => {
    const r = await fetch(`/api/couple/${token}/tasks`);
    if (r.ok) setTasks(await r.json());
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (task: Task) => {
    const updated = { ...task, completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null };
    setTasks(ts => ts.map(t => t.id === task.id ? updated : t));

    // Check milestone
    const newDone = tasks.filter(t => t.id !== task.id ? t.completed : !task.completed).length + (!task.completed ? 1 : 0);
    const total = tasks.length;
    if (total > 0) {
      const pct = Math.round((newDone / total) * 100);
      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (pct >= m && prevPct.current < m) {
          setToast(MILESTONE_MSGS[m]);
          setTimeout(() => setToast(null), 4000);
          break;
        }
      }
      prevPct.current = pct;
    }

    await fetch(`/api/wedding-tasks/${task.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
  };

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    const r = await fetch(`/api/couple/${token}/tasks`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), category: newCat, due_date: newDue || null }),
    });
    if (r.ok) { setShowAdd(false); setNewTitle(""); setNewDue(""); await load(); }
    setAdding(false);
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/wedding-tasks/${id}`, { method: "DELETE" });
    setTasks(ts => ts.filter(t => t.id !== id));
  };

  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const knownCats = new Set(CATEGORIES.map(c => c.value));
  const catsWithTasks = CATEGORIES.filter(cat => tasks.some(t => t.category === cat.value));
  const chipFilters = [{ value:"all", label:"הכל", icon:"" }, ...catsWithTasks];

  const filteredTasks = filter === "all" ? tasks : tasks.filter(t => t.category === filter);
  const groupedByCategory = CATEGORIES.map(cat => ({
    ...cat,
    tasks: filteredTasks.filter(t => t.category === cat.value).sort((a,b) => a.sort_order - b.sort_order),
  })).filter(cat => cat.tasks.length > 0);
  const uncategorized = filteredTasks.filter(t => !knownCats.has(t.category));

  if (pct === 100 && total > 0) return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:C.ivory, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"16px", padding:"32px", textAlign:"center" }}>
      <style>{CSS_CHECK}</style>
      <svg width="80" height="60" viewBox="0 0 80 60" fill="none" aria-hidden="true">
        <path d="M40 56 C40 56 40 28 40 8" stroke={C.olive} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M40 40 C30 35 18 36 12 30" stroke={C.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M40 30 C50 25 62 26 68 20" stroke={C.olive} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="30" r="2" fill={C.olive}/><circle cx="68" cy="20" r="2" fill={C.olive}/><circle cx="40" cy="8" r="2.5" fill={C.gold}/>
      </svg>
      <h1 style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:"24px", fontWeight:700, color:C.dark }}>כל המשימות הושלמו! 🎉</h1>
      <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"16px", fontWeight:300, color:C.muted }}>אתם מוכנים לחתונה</p>
      <CoupleBottomNav token={token} />
    </div>
  );

  return (
    <div dir="rtl" style={{ minHeight:"100dvh", background:C.ivory, fontFamily:"Heebo,sans-serif", paddingBottom:"80px" }}>
      <style>{CSS_CHECK}</style>

      {/* E3-S8: Header */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", position:"sticky", top:0, background:"rgba(253,250,245,0.96)", backdropFilter:"blur(8px)", borderBottom:`1px solid rgba(197,164,109,0.15)`, zIndex:10 }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", cursor:"pointer", padding:"8px", color:C.muted, fontSize:20, lineHeight:1 }} aria-label="חזרה">→</button>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"12px", fontWeight:300, color:C.muted, margin:0 }}>צ'קליסט החתונה</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background:C.gold, color:"white", border:"none", borderRadius:12, padding:"6px 14px", fontFamily:"Heebo,sans-serif", fontSize:13, fontWeight:600, cursor:"pointer", minHeight:36 }} aria-label="הוסף משימה">
          + הוסף
        </button>
      </header>

      {/* CircularProgressArc */}
      {!loading && total > 0 && (
        <div style={{ textAlign:"center" }}>
          <CheckProgressArc value={pct} done={done} total={total} />
          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:"14px", fontWeight:300, color:C.muted, marginTop:"-8px", marginBottom:"16px" }}>
            {done} מתוך {total} משימות הושלמו
          </p>
        </div>
      )}

      {/* E3-S8: Category filter chips (gold active, cream inactive) */}
      <div role="group" aria-label="סנן לפי קטגוריה" style={{ display:"flex", gap:"8px", padding:"0 16px 16px", overflowX:"auto", scrollbarWidth:"none" }}>
        {chipFilters.map(f => {
          const active = filter === f.value;
          return (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{ flexShrink:0, padding:"6px 14px", borderRadius:20, border:"none", background:active ? C.gold : C.cream, color:active ? "white" : C.muted, fontFamily:"Heebo,sans-serif", fontSize:13, fontWeight:active ? 600 : 400, cursor:"pointer", minHeight:36, whiteSpace:"nowrap", transition:"background .15s,color .15s" }}>
              {f.icon && `${f.icon} `}{f.label}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div style={{ padding:"0 16px" }}>
        {loading ? (
          <p style={{ textAlign:"center", color:C.muted, padding:"2rem" }}>טוען...</p>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign:"center", padding:"3rem 1rem" }}>
            <p style={{ color:C.muted, fontSize:14, fontFamily:"Heebo,sans-serif", fontWeight:300, marginBottom:"16px" }}>אין משימות בקטגוריה זו</p>
            <button onClick={() => setShowAdd(true)} style={{ background:C.gold, color:"white", border:"none", borderRadius:14, padding:"12px 24px", fontFamily:"Heebo,sans-serif", fontSize:14, fontWeight:600, cursor:"pointer" }}>
              + הוסיפו משימה ראשונה
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {[...groupedByCategory, ...(uncategorized.length > 0 ? [{ value:"other", label:"אחר", icon:"📦", tasks:uncategorized }] : [])].map(cat => (
              <div key={cat.value}>
                {/* Category header — olive, Heebo 600 14px */}
                <button onClick={() => setExpanded(s => { const n=new Set(s); n.has(cat.value)?n.delete(cat.value):n.add(cat.value); return n; })}
                  style={{ width:"100%", background:"none", border:"none", padding:"8px 4px", display:"flex", alignItems:"center", gap:"6px", cursor:"pointer", textAlign:"right" }}>
                  <span style={{ fontSize:15 }}>{cat.icon}</span>
                  <span style={{ fontFamily:"Heebo,sans-serif", fontWeight:600, fontSize:14, color:C.olive, flex:1 }}>{cat.label}</span>
                  <span style={{ fontFamily:"Heebo,sans-serif", fontSize:11, color:C.muted }}>{cat.tasks.filter(t=>t.completed).length}/{cat.tasks.length}</span>
                  {cat.tasks.every(t=>t.completed) && <span style={{ width:6, height:6, borderRadius:"50%", background:C.olive, display:"inline-block" }}/>}
                  <span style={{ color:C.muted, fontSize:12 }}>{expanded.has(cat.value)?"▲":"▼"}</span>
                </button>

                {expanded.has(cat.value) && (
                  <div style={{ background:C.cream, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden" }} role="list">
                    {cat.tasks.map((task, i) => (
                      <div key={task.id} role="listitem" style={{ padding:"13px 14px", display:"flex", alignItems:"center", gap:"12px", borderBottom:i<cat.tasks.length-1?`1px solid rgba(197,164,109,0.12)`:"none" }}>
                        <button
                          role="checkbox"
                          aria-checked={task.completed}
                          onClick={() => toggle(task)}
                          style={{ width:24, height:24, borderRadius:8, border:`2px solid ${task.completed?C.gold:C.border}`, background:task.completed?C.gold:C.ivory, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"all .2s" }}>
                          {task.completed && <span style={{ color:"white", fontSize:13, lineHeight:1 }}>✓</span>}
                        </button>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontFamily:"Heebo,sans-serif", fontSize:15, fontWeight:400, color:task.completed?C.muted:C.dark, textDecoration:task.completed?"line-through":"none", margin:0, transition:"all .2s" }}>
                            {task.title}
                          </p>
                          {task.due_date && !task.completed && (
                            <p style={{ fontFamily:"Heebo,sans-serif", fontSize:12, fontWeight:300, color:C.muted, margin:"3px 0 0" }}>
                              📅 {new Date(task.due_date).toLocaleDateString("he-IL")}
                            </p>
                          )}
                        </div>
                        <button onClick={() => deleteTask(task.id)} style={{ background:"none", border:"none", color:"rgba(192,57,43,0.3)", fontSize:16, cursor:"pointer", padding:"4px", minWidth:28, minHeight:28 }} aria-label={`מחק משימה: ${task.title}`}>🗑</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast milestone */}
      {toast && (
        <div style={{ position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)", background:C.dark, color:"#FDFAF5", padding:"0.85rem 1.5rem", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.2)", zIndex:100, fontFamily:"Heebo,sans-serif", fontSize:15, fontWeight:600, animation:"fadeUp .3s ease", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      {/* Add Task bottom sheet */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:50, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={e => { if (e.target===e.currentTarget) setShowAdd(false); }}>
          <div style={{ background:C.ivory, borderRadius:"20px 20px 0 0", width:"100%", maxWidth:640, padding:"1.5rem 1rem calc(1.5rem + env(safe-area-inset-bottom))" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
              <h2 style={{ fontFamily:"Frank Ruhl Libre,serif", fontSize:20, fontWeight:700, color:C.dark }}>משימה חדשה</h2>
              <button onClick={() => setShowAdd(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.muted }} aria-label="סגור">✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="שם המשימה *" autoFocus
                style={{ width:"100%", border:`1.5px solid ${C.border}`, borderRadius:12, padding:"0.75rem 1rem", fontSize:15, fontFamily:"Heebo,sans-serif", background:"white", color:C.dark, outline:"none", boxSizing:"border-box" }} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.75rem" }}>
                <select value={newCat} onChange={e => setNewCat(e.target.value)}
                  style={{ border:`1.5px solid ${C.border}`, borderRadius:12, padding:"0.65rem 0.8rem", fontSize:14, fontFamily:"Heebo,sans-serif", background:"white", color:C.dark, outline:"none" }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
                <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                  style={{ border:`1.5px solid ${C.border}`, borderRadius:12, padding:"0.65rem 0.8rem", fontSize:14, fontFamily:"Heebo,sans-serif", background:"white", color:C.dark, outline:"none" }} />
              </div>
              <button onClick={addTask} disabled={adding || !newTitle.trim()}
                style={{ width:"100%", background:(!newTitle.trim()||adding)?"rgba(197,164,109,0.5)":C.gold, color:"white", border:"none", borderRadius:14, padding:"0.9rem", fontSize:16, fontWeight:700, cursor:(!newTitle.trim()||adding)?"default":"pointer", fontFamily:"Heebo,sans-serif", minHeight:52 }}>
                {adding ? "שומר..." : "הוסף משימה"}
              </button>
            </div>
          </div>
        </div>
      )}

      <HelpButton token={token} />
      <CoupleBottomNav token={token} />
    </div>
  );
}
