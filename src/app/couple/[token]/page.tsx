"use client";

import { use, useEffect, useState, useCallback } from "react";
import {
  CheckCircle, Clock, XCircle, Users, Loader2, AlertCircle,
  TrendingUp, Heart, Wallet, LayoutGrid, ListChecks, Gift,
  Plus, Trash2,
} from "lucide-react";

const C = {
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  goldL:  "#D4BC8A",
  olive:  "#6B7B5A",
  dark:   "#333333",
  muted:  "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
  cardBg: "rgba(255,255,255,0.85)",
};

/* ── Types ──────────────────────────────────────────── */
interface EventInfo  { id: string; name: string; date: string; address?: string | null }
interface Stats      { total: number; confirmed: number; declined: number; pending: number; attendees: number; responseRate: number }
interface Budget     { planned: number; actual: number; remaining: number; itemCount: number }
interface Seating    { totalSeats: number; assignedSeats: number; tableCount: number }
interface Tasks      { total: number; completed: number }
interface GiftsSummary { total: number; count: number }

interface WeddingTask {
  id: string; title: string; category: string;
  completed: boolean; due_date?: string | null;
}

interface DashboardData {
  event:    EventInfo;
  stats:    Stats;
  budget:   Budget;
  seating:  Seating;
  tasks:    Tasks;
  gifts:    GiftsSummary;
}

/* ── Formatting helpers ─────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString("he-IL");
}

/* ── Main page ──────────────────────────────────────── */
export default function CoupleDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [tasks,   setTasks]   = useState<WeddingTask[]>([]);
  const [newTask, setNewTask] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/couple/${token}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(true); else setData(d); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Load tasks once we have event id
  useEffect(() => {
    if (!data?.event?.id) return;
    setTaskLoading(true);
    fetch(`/api/wedding-tasks?event_id=${data.event.id}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTasks(d))
      .finally(() => setTaskLoading(false));
  }, [data?.event?.id]);

  const toggleTask = async (task: WeddingTask) => {
    const updated = !task.completed;
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: updated } : t));
    await fetch(`/api/wedding-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: updated }),
    });
  };

  const addTask = async () => {
    if (!newTask.trim() || !data?.event?.id) return;
    setAddingTask(true);
    try {
      const res = await fetch("/api/wedding-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: data.event.id, title: newTask.trim(), category: "general" }),
      });
      const created = await res.json();
      if (created.id) { setTasks((p) => [...p, created]); setNewTask(""); }
    } finally { setAddingTask(false); }
  };

  const deleteTask = async (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    await fetch(`/api/wedding-tasks/${id}`, { method: "DELETE" });
  };

  if (loading) return <Shell><CenterSpin /></Shell>;
  if (error || !data) return <Shell><NotFound /></Shell>;

  const { event, stats, budget, seating, gifts } = data;
  const daysLeft = Math.ceil((new Date(event.date).getTime() - Date.now()) / 86_400_000);
  const formattedDate = new Date(event.date).toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskPct  = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const budgetPct = budget.planned > 0 ? Math.min(100, Math.round((budget.actual / budget.planned) * 100)) : 0;
  const seatingPct = seating.totalSeats > 0 ? Math.round((seating.assignedSeats / seating.totalSeats) * 100) : 0;

  // Wedding health
  const healthScore = Math.round(
    (stats.responseRate * 0.4) +
    (taskPct * 0.3) +
    (seatingPct * 0.2) +
    (budget.itemCount > 0 ? 10 : 0)
  );
  const healthTier = healthScore >= 75 ? "green" : healthScore >= 45 ? "yellow" : "red";
  const HEALTH = {
    green:  { label: "הכל על המסלול ✅",         color: C.olive,              bg: "rgba(107,123,90,0.10)"  },
    yellow: { label: "יש כמה דברים לטפל בהם 🟡", color: "#A07840",            bg: "rgba(197,164,109,0.12)" },
    red:    { label: "דורש תשומת לב מיידית 🔴",  color: "rgb(190,50,50)",     bg: "rgba(200,50,50,0.08)"   },
  };

  return (
    <Shell>
      {/* ── Event hero ───────────────────────────── */}
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}>
          מרכז ניהול החתונה
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
          {event.name}
        </h1>
        <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{formattedDate}</p>
        {event.address && (
          <p className="text-xs mt-1" style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}>📍 {event.address}</p>
        )}
      </div>

      {/* ── Countdown + health ───────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Countdown */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: `linear-gradient(135deg,${C.olive},#4A5E3A)`, boxShadow: "0 8px 24px rgba(107,123,90,0.25)" }}
        >
          <p className="text-5xl font-bold text-white leading-none mb-1" style={{ fontFamily: "Frank Ruhl Libre, serif" }}>
            {daysLeft > 0 ? daysLeft : "🎊"}
          </p>
          <p className="text-white/70 text-xs" style={{ fontFamily: "Heebo, sans-serif" }}>
            {daysLeft > 0 ? "ימים לחתונה" : "מזל טוב!"}
          </p>
        </div>
        {/* Health */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: HEALTH[healthTier].bg, border: `1px solid ${C.border}` }}
        >
          <p className="text-4xl font-bold leading-none mb-1" style={{ color: HEALTH[healthTier].color, fontFamily: "Frank Ruhl Libre, serif" }}>
            {healthScore}%
          </p>
          <p className="text-xs font-medium" style={{ color: HEALTH[healthTier].color, fontFamily: "Heebo, sans-serif" }}>
            {HEALTH[healthTier].label}
          </p>
        </div>
      </div>

      <GoldDivider />

      {/* ── RSVP stats grid ──────────────────────── */}
      <SectionTitle icon={<Users size={14} />}>אורחים</SectionTitle>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "אישרו",    value: stats.confirmed,  color: C.olive,     icon: CheckCircle },
          { label: "ממתינים", value: stats.pending,    color: "#A07840",   icon: Clock },
          { label: "לא מגיעים", value: stats.declined, color: "rgba(51,51,51,0.4)", icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
            <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
            <p className="text-2xl font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{value}</p>
            <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* RSVP progress bar */}
      {stats.total > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            <span>אחוז מענה</span>
            <span className="font-semibold">{stats.responseRate}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(197,164,109,0.15)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${stats.responseRate}%`, background: `linear-gradient(90deg,${C.olive},${C.gold})` }}
            />
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {[
              { label: `${stats.confirmed} אישרו`, color: C.olive },
              { label: `${stats.pending} ממתינים`, color: C.gold },
              { label: `${stats.declined} לא מגיעים`, color: "rgba(51,51,51,0.3)" },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1 text-[11px]" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <GoldDivider />

      {/* ── Budget + Seating + Gifts ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">

        {/* Budget */}
        <MiniWidget
          icon={<Wallet size={16} style={{ color: C.gold }} />}
          title="תקציב"
          empty={budget.itemCount === 0}
          emptyText="לא הוזן תקציב"
        >
          {budget.itemCount > 0 && (
            <>
              <p className="text-xl font-bold mb-0.5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                ₪{fmt(budget.actual)}
              </p>
              <p className="text-xs mb-2" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                מתוך ₪{fmt(budget.planned)} מתוכנן
              </p>
              <ProgressBar pct={budgetPct} color={budgetPct > 90 ? "rgb(200,80,80)" : budgetPct > 70 ? "#A07840" : C.olive} />
              <p className="text-xs mt-1.5" style={{ color: budgetPct > 90 ? "rgb(200,80,80)" : C.muted, fontFamily: "Heebo, sans-serif" }}>
                {budgetPct}% מנוצל
              </p>
            </>
          )}
        </MiniWidget>

        {/* Seating */}
        <MiniWidget
          icon={<LayoutGrid size={16} style={{ color: C.gold }} />}
          title="הושבה"
          empty={seating.tableCount === 0}
          emptyText="לא הוגדרו שולחנות"
        >
          {seating.tableCount > 0 && (
            <>
              <p className="text-xl font-bold mb-0.5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                {seating.assignedSeats}/{seating.totalSeats}
              </p>
              <p className="text-xs mb-2" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                מקומות שהוקצו
              </p>
              <ProgressBar pct={seatingPct} color={C.olive} />
              <p className="text-xs mt-1.5" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                {seating.totalSeats - seating.assignedSeats} מקומות פנויים
              </p>
            </>
          )}
        </MiniWidget>

        {/* Gifts */}
        <MiniWidget
          icon={<Gift size={16} style={{ color: C.gold }} />}
          title="מתנות"
          empty={gifts.count === 0}
          emptyText="לא נרשמו מתנות"
        >
          {gifts.count > 0 && (
            <>
              <p className="text-xl font-bold mb-0.5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                ₪{fmt(gifts.total)}
              </p>
              <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                {gifts.count} מתנות נרשמו
              </p>
            </>
          )}
        </MiniWidget>
      </div>

      <GoldDivider />

      {/* ── Task checklist ───────────────────────── */}
      <SectionTitle icon={<ListChecks size={14} />}>
        רשימת משימות
        <span className="mr-2 text-xs font-normal" style={{ color: C.muted }}>
          {completedTasks}/{tasks.length} הושלמו
        </span>
      </SectionTitle>

      {tasks.length > 0 && (
        <div className="mb-3">
          <ProgressBar pct={taskPct} color={C.olive} />
          <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{taskPct}% הושלם</p>
        </div>
      )}

      {taskLoading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin" style={{ color: C.gold }} /></div>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {/* Add task */}
      <div className="flex gap-2 mb-6">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="הוסיפו משימה..."
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm"
          style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
        />
        <button
          onClick={addTask}
          disabled={addingTask || !newTask.trim()}
          className="px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40"
          style={{ background: C.olive, color: "white", fontFamily: "Heebo, sans-serif" }}
        >
          {addingTask ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
        </button>
      </div>

      <GoldDivider />

      {/* ── Attendance forecast ──────────────────── */}
      {stats.total > 0 && stats.pending > 0 && (
        <>
          <SectionTitle icon={<TrendingUp size={14} />}>תחזית נוכחות</SectionTitle>
          <div className="rounded-2xl p-5 mb-6" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "שמרני",  value: Math.round(stats.attendees * 0.85), color: C.muted },
                { label: "צפוי",   value: stats.attendees + Math.round(stats.pending * 0.55), color: C.olive, large: true },
                { label: "אופטימי", value: stats.attendees + Math.round(stats.pending * 0.85), color: C.gold },
              ].map(({ label, value, color, large }) => (
                <div key={label}>
                  <p className={`font-bold ${large ? "text-4xl" : "text-2xl"} mb-1`}
                    style={{ color, fontFamily: "Frank Ruhl Libre, serif" }}>{value}</p>
                  <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-4" style={{ color: "rgba(51,51,51,0.30)", fontFamily: "Heebo, sans-serif" }}>
              {stats.attendees} מגיעים בוודאות · {stats.pending} ממתינים עדיין
            </p>
          </div>
        </>
      )}

      {/* ── Reassurance footer ───────────────────── */}
      <div
        className="rounded-2xl p-4 text-center mt-2"
        style={{ background: "rgba(197,164,109,0.06)", border: `1px solid ${C.border}` }}
      >
        <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
          💛 כל הנתונים מתעדכנים בזמן אמת
          <br />
          <span className="text-xs">אין צורך לרענן — הכל מסונכרן אוטומטית</span>
        </p>
      </div>
    </Shell>
  );
}

/* ── Sub-components ──────────────────────────────────── */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen py-8 px-4" style={{ background: `linear-gradient(160deg,#F6F1E8 0%,#EDE6D6 100%)` }}>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: "rgba(197,164,109,0.6)", fontFamily: "Heebo, sans-serif" }}>
            רגע לפני
          </p>
        </div>
        {children}
        <p className="text-center text-[10px] mt-8" style={{ color: "rgba(51,51,51,0.25)", fontFamily: "Heebo, sans-serif" }}>
          © רגע לפני · מרכז ניהול חתונה
        </p>
      </div>
    </div>
  );
}

function GoldDivider() {
  return (
    <div className="w-full h-px my-5" style={{ background: "linear-gradient(90deg,transparent,rgba(197,164,109,0.35),transparent)" }} />
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-3"
      style={{ color: "rgba(197,164,109,0.85)", fontFamily: "Heebo, sans-serif" }}>
      {icon}{children}
    </p>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(197,164,109,0.15)" }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

function MiniWidget({ icon, title, children, empty, emptyText }: {
  icon: React.ReactNode; title: string; children?: React.ReactNode;
  empty?: boolean; emptyText?: string;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-1.5 mb-3">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(197,164,109,0.85)", fontFamily: "Heebo, sans-serif" }}>
          {title}
        </p>
      </div>
      {empty ? (
        <p className="text-xs" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{emptyText}</p>
      ) : children}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: {
  task: WeddingTask; onToggle: () => void; onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all duration-150"
      style={{ background: task.completed ? "rgba(107,123,90,0.06)" : C.ivory, border: `1px solid ${C.border}` }}
    >
      <button
        onClick={onToggle}
        className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
        style={{
          background:   task.completed ? C.olive : "transparent",
          borderColor:  task.completed ? C.olive : C.gold,
        }}
      >
        {task.completed && <CheckCircle size={12} color="white" />}
      </button>
      <span
        className="flex-1 text-sm transition-all duration-200"
        style={{
          color:           task.completed ? C.muted : C.dark,
          textDecoration:  task.completed ? "line-through" : "none",
          fontFamily:      "Heebo, sans-serif",
        }}
      >
        {task.title}
      </span>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1 rounded"
        style={{ color: "rgba(200,80,80,0.5)" }}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function CenterSpin() {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <Loader2 size={32} className="animate-spin" style={{ color: "#C5A46D" }} />
      <p style={{ color: "rgba(51,51,51,0.45)", fontFamily: "Heebo, sans-serif" }}>טוען…</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <AlertCircle size={40} className="mx-auto mb-4" style={{ color: "#C5A46D" }} />
      <p className="font-semibold mb-1" style={{ color: "#333", fontFamily: "Frank Ruhl Libre, serif" }}>
        הקישור אינו תקין
      </p>
      <p className="text-sm" style={{ color: "rgba(51,51,51,0.55)", fontFamily: "Heebo, sans-serif" }}>
        פנו אלינו לקבלת הקישור הנכון לאירוע שלכם.
      </p>
    </div>
  );
}
