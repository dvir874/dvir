"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

const C = {
  ivory: "#FDFAF5", gold: "#C5A46D", olive: "#6B7B5A",
  dark: "#1C1008", muted: "rgba(28,16,8,0.55)",
  border: "rgba(197,164,109,0.20)", card: "#FFFFFF",
};

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
  const [filter, setFilter] = useState<"all" | "done" | "pending">("all");
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

  const filteredTasks = tasks.filter(t => {
    if (filter === "done") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  const groupedByCategory = CATEGORIES.map(cat => ({
    ...cat,
    tasks: filteredTasks.filter(t => t.category === cat.value).sort((a, b) => a.sort_order - b.sort_order),
  })).filter(cat => cat.tasks.length > 0);

  // Also handle uncategorized
  const knownCats = new Set(CATEGORIES.map(c => c.value));
  const uncategorized = filteredTasks.filter(t => !knownCats.has(t.category));

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: C.ivory, fontFamily: "Heebo, sans-serif", paddingBottom: "2rem" }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
            <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "rgba(197,164,109,0.7)", cursor: "pointer", fontSize: 20, padding: 0 }}>→</button>
            <div style={{ flex: 1 }}>
              <p style={{ color: "rgba(197,164,109,0.6)", fontSize: 10, letterSpacing: "0.3em" }}>רגע לפני</p>
              <h1 style={{ color: "#FDFAF5", fontSize: 18, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, margin: 0 }}>📋 צ'קליסט החתונה</h1>
            </div>
            <button onClick={() => setShowAdd(true)} style={{ background: C.gold, color: "white", border: "none", borderRadius: 12, padding: "0.5rem 1rem", fontFamily: "Heebo, sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + הוסף
            </button>
          </div>

          {/* Progress */}
          {!loading && total > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(197,164,109,0.75)", marginBottom: 6 }}>
                <span>{done} מתוך {total} משימות</span>
                <span style={{ fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(197,164,109,0.2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #C5A46D, #E8D5A8)", borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
            </>
          )}

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.75rem" }}>
            {[{ key: "all", label: "הכל" }, { key: "pending", label: "ממתינות" }, { key: "done", label: "הושלמו" }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as "all" | "done" | "pending")}
                style={{ padding: "4px 12px", borderRadius: 10, border: "none", background: filter === f.key ? "rgba(197,164,109,0.25)" : "transparent", color: filter === f.key ? C.gold : "rgba(197,164,109,0.5)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1rem" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: C.muted, padding: "2rem" }}>טוען...</p>
        ) : total === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <p style={{ fontSize: 48, marginBottom: "0.75rem" }}>📋</p>
            <p style={{ color: C.muted, fontSize: 14 }}>אין משימות עדיין.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[...groupedByCategory, ...(uncategorized.length > 0 ? [{ value: "other", label: "אחר", icon: "📦", tasks: uncategorized }] : [])].map(cat => (
              <div key={cat.value} style={{ background: C.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 10px rgba(28,16,8,0.06)", border: `1px solid ${C.border}` }}>
                {/* Category header */}
                <button onClick={() => setExpanded(s => { const n = new Set(s); n.has(cat.value) ? n.delete(cat.value) : n.add(cat.value); return n; })}
                  style={{ width: "100%", background: "none", border: "none", padding: "0.9rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", textAlign: "right" }}>
                  <span style={{ fontSize: 18 }}>{cat.icon}</span>
                  <span style={{ fontWeight: 700, color: C.dark, fontSize: 15, flex: 1 }}>{cat.label}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{cat.tasks.filter(t => t.completed).length}/{cat.tasks.length}</span>
                  <span style={{ color: C.muted, fontSize: 13 }}>{expanded.has(cat.value) ? "▲" : "▼"}</span>
                </button>

                {/* Tasks */}
                {expanded.has(cat.value) && (
                  <div style={{ borderTop: `1px solid ${C.border}` }}>
                    {cat.tasks.map((task, i) => (
                      <div key={task.id} style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: i < cat.tasks.length - 1 ? `1px solid rgba(197,164,109,0.08)` : "none", transition: "background 0.2s" }}>
                        {/* Checkbox */}
                        <button onClick={() => toggle(task)} style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${task.completed ? C.gold : C.border}`, background: task.completed ? C.gold : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.25s" }}>
                          {task.completed && <span style={{ color: "white", fontSize: 14, lineHeight: 1 }}>✓</span>}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, color: task.completed ? C.muted : C.dark, fontWeight: task.completed ? 400 : 500, textDecoration: task.completed ? "line-through" : "none", transition: "all 0.25s" }}>
                            {task.title}
                          </p>
                          {task.due_date && !task.completed && (
                            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                              📅 {new Date(task.due_date).toLocaleDateString("he-IL")}
                            </p>
                          )}
                        </div>
                        <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", color: "rgba(192,57,43,0.3)", fontSize: 16, cursor: "pointer", opacity: 0.5 }}>🗑</button>
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
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "#FDFAF5", padding: "0.85rem 1.5rem", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.2)", zIndex: 100, fontFamily: "Heebo, sans-serif", fontSize: 15, fontWeight: 600, animation: "fadeIn 0.3s ease", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Add Task Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div style={{ background: C.ivory, borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 640, padding: "1.5rem 1rem 2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: C.dark }}>משימה חדשה</h2>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="שם המשימה *" autoFocus
                style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.65rem 0.8rem", fontSize: 15, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none", boxSizing: "border-box" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <select value={newCat} onChange={e => setNewCat(e.target.value)}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none" }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
                <input type="date" value={newDue} onChange={e => setNewDue(e.target.value)}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.8rem", fontSize: 14, fontFamily: "Heebo, sans-serif", background: "white", color: C.dark, outline: "none" }} />
              </div>
              <button onClick={addTask} disabled={adding || !newTitle.trim()}
                style={{ width: "100%", background: (!newTitle.trim() || adding) ? "rgba(197,164,109,0.5)" : C.gold, color: "white", border: "none", borderRadius: 14, padding: "0.9rem", fontSize: 16, fontWeight: 700, cursor: (!newTitle.trim() || adding) ? "default" : "pointer", fontFamily: "Heebo, sans-serif" }}>
                {adding ? "שומר..." : "הוסף משימה"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
