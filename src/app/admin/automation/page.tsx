"use client";

import { useEffect, useState } from "react";
import {
  Zap, CheckCircle, Clock, AlertCircle, TrendingUp,
  ChevronRight, Loader2, RefreshCw, Play,
} from "lucide-react";
import { generateTasks }           from "@/lib/automation/task-engine";
import { generateRecommendations } from "@/lib/automation/recommendations";
import { JOB_REGISTRY }            from "@/lib/automation/scheduler";
import type { Task }               from "@/lib/automation/task-engine";
import type { Recommendation }     from "@/lib/automation/recommendations";
import type { EventSummary }       from "@/lib/types";

/* ── Design tokens ─────────────────────────────────── */
const C = {
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  goldL:  "#D4BC8A",
  olive:  "#6B7B5A",
  dark:   "#333333",
  muted:  "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

export default function AutomationPage() {
  const [overview, setOverview] = useState<EventSummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cronResult, setCronResult] = useState<string | null>(null);
  const [cronLoading, setCronLoading] = useState(false);

  useEffect(() => {
    fetch("/api/manager/overview")
      .then((r) => r.json())
      .then((d: EventSummary[]) => setOverview(d ?? []))
      .catch(() => setOverview([]))
      .finally(() => setLoading(false));
  }, []);

  // Build context for engines — mirror the EventSummary shape
  const taskContexts = overview.map((ev) => ({
    id: ev.id, name: ev.name, date: ev.date,
    daysUntilEvent: ev.daysUntilEvent,
    total: ev.total, pending: ev.pending,
    openedPending: ev.openedPending, noPhone: ev.noPhone,
    responseRate: ev.responseRate, healthTier: ev.healthTier,
  }));

  const recContexts = overview.map((ev) => ({
    id: ev.id, name: ev.name,
    daysUntilEvent: ev.daysUntilEvent,
    total: ev.total, confirmed: ev.confirmed,
    declined: ev.declined, pending: ev.pending,
    openedPending: ev.openedPending, noPhone: ev.noPhone,
    responseRate: ev.responseRate, healthTier: ev.healthTier,
    recentActivity: ev.recentActivity,
    confirmRate: ev.confirmed > 0 && (ev.confirmed + ev.declined) > 0
      ? Math.round((ev.confirmed / (ev.confirmed + ev.declined)) * 100)
      : 50,
  }));

  const tasks           = generateTasks(taskContexts);
  const recommendations = generateRecommendations(recContexts);
  const urgentCount     = tasks.filter((t) => t.priority === "urgent" || t.priority === "high").length;

  async function runDryCron() {
    setCronLoading(true);
    setCronResult(null);
    try {
      const r = await fetch("/api/cron/daily?dry=true");
      const d = await r.json();
      setCronResult(`✅ ${d.processed} אירועים · ${d.tasksGenerated} משימות נוצרו (dry run)`);
    } catch {
      setCronResult("שגיאה בהרצת הסריקה");
    } finally {
      setCronLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
        <Loader2 size={32} className="animate-spin" style={{ color: C.gold }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: "Heebo, sans-serif" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center gap-3"
        style={{ background: "rgba(253,250,245,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}
      >
        <Zap size={16} style={{ color: C.gold }} />
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>רגע לפני</p>
          <p className="text-sm font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>מרכז אוטומציה</p>
        </div>
        <a
          href="/admin"
          className="mr-auto flex items-center gap-1 text-xs px-3 py-2 rounded-xl"
          style={{ background: "rgba(197,164,109,0.10)", color: C.gold }}
        >
          חזרה לניהול <ChevronRight size={12} />
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">

        {/* Status strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "אירועים פעילים",   value: overview.filter((e) => e.daysUntilEvent > 0).length, icon: TrendingUp, color: C.gold  },
            { label: "משימות פתוחות",    value: tasks.length,         icon: Clock,         color: "#A07840" },
            { label: "דחופות / גבוהות",  value: urgentCount,          icon: AlertCircle,   color: urgentCount > 0 ? "rgb(180,60,60)" : C.olive },
            { label: "המלצות",           value: recommendations.length, icon: Zap,          color: C.olive  },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl p-4 text-center"
              style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
              <Icon size={16} className="mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-bold mb-0.5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{value}</p>
              <p className="text-xs" style={{ color: C.muted }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Task Queue */}
        <Section title="תור משימות" badge={tasks.length}>
          {tasks.length === 0 ? (
            <Empty icon={CheckCircle} text="אין משימות פתוחות" />
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task: Task) => <TaskRow key={task.id} task={task} />)}
            </div>
          )}
        </Section>

        {/* Recommendations */}
        <Section title="המלצות מנוע ה-AI" badge={recommendations.length}>
          {recommendations.length === 0 ? (
            <Empty icon={CheckCircle} text="אין המלצות כרגע" />
          ) : (
            <div className="flex flex-col gap-2">
              {recommendations.map((rec: Recommendation) => <RecRow key={rec.id} rec={rec} />)}
            </div>
          )}
        </Section>

        {/* Scheduler Status */}
        <Section title="מתזמן משימות">
          <div className="flex flex-col gap-2 mb-4">
            {JOB_REGISTRY.map((job) => (
              <div key={job.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "white", border: `1px solid ${C.border}` }}>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: job.enabled ? C.olive : "rgba(51,51,51,0.25)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: C.dark }}>{job.name}</p>
                  <p className="text-xs" style={{ color: C.muted }}>{job.frequency} · {job.enabled ? "פעיל" : "מושהה"}</p>
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: job.enabled ? "rgba(107,123,90,0.10)" : "rgba(51,51,51,0.07)",
                    color: job.enabled ? C.olive : C.muted,
                  }}
                >
                  {job.enabled ? "רשום" : "כבוי"}
                </span>
              </div>
            ))}
          </div>
          {/* Dry-run trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={runDryCron}
              disabled={cronLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              style={{ background: `linear-gradient(135deg,${C.gold},${C.goldL})`, color: "white" }}
            >
              {cronLoading
                ? <><Loader2 size={14} className="animate-spin" /> סורק…</>
                : <><Play size={14} /> הרץ סריקה יומית (Dry Run)</>}
            </button>
            {cronResult && (
              <p className="text-sm" style={{ color: C.olive }}>{cronResult}</p>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: "rgba(51,51,51,0.35)" }}>
            Dry Run — מחשב משימות ללא כתיבה לבסיס הנתונים
          </p>
        </Section>

        {/* Automation Rules (DB-driven — placeholder) */}
        <Section title="חוקי אוטומציה">
          <div className="rounded-xl p-4" style={{ background: "rgba(197,164,109,0.06)", border: `1px solid rgba(197,164,109,0.15)` }}>
            <p className="text-sm font-semibold mb-1" style={{ color: C.dark }}>
              {DEFAULT_RULES_SUMMARY.length} חוקים מוגדרים כברירת מחדל
            </p>
            <div className="flex flex-col gap-1 mt-2">
              {DEFAULT_RULES_SUMMARY.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" style={{ color: C.olive }} />
                  <span style={{ color: C.muted }}>{rule}</span>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "rgba(51,51,51,0.35)" }}>
              חוקים מנוהלים בטבלת automation_rules בבסיס הנתונים
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */
function Section({ title, badge, children }: { title: string; badge?: number; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}>
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>{title}</p>
        {badge !== undefined && badge > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: "rgba(197,164,109,0.20)", color: "#A07840" }}>
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; text: string }) {
  return (
    <div className="flex items-center gap-2 py-4 justify-center">
      <Icon size={16} style={{ color: "rgba(107,123,90,0.5)" }} />
      <p className="text-sm" style={{ color: "rgba(51,51,51,0.40)" }}>{text}</p>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const isUrgent = task.priority === "urgent";
  const isHigh   = task.priority === "high";
  return (
    <div className="rounded-xl p-3.5 flex items-start gap-3"
      style={{
        background: "white",
        border: `1px solid ${isUrgent ? "rgba(200,60,60,0.25)" : isHigh ? "rgba(197,164,109,0.25)" : C.border}`,
      }}>
      <span className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5"
        style={{
          background: isUrgent ? "rgba(200,60,60,0.10)" : isHigh ? "rgba(197,164,109,0.15)" : "rgba(107,123,90,0.08)",
          color: isUrgent ? "rgb(180,60,60)" : isHigh ? "#A07840" : C.olive,
        }}>
        {isUrgent ? "דחוף" : isHigh ? "גבוה" : task.priority === "medium" ? "בינוני" : "נמוך"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: C.muted }}>{task.eventName}</p>
        <p className="text-sm font-semibold" style={{ color: C.dark }}>{task.title}</p>
        <p className="text-xs mt-0.5" style={{ color: C.muted }}>{task.description}</p>
      </div>
      <p className="text-[10px] shrink-0 text-left" style={{ color: C.muted }}>{task.dueContext}</p>
    </div>
  );
}

function RecRow({ rec }: { rec: Recommendation }) {
  const isCritical = rec.priority === "critical";
  const isHigh     = rec.priority === "high";
  const confidencePct = Math.round(rec.confidence * 100);
  return (
    <div className="rounded-xl p-3.5 flex items-start gap-3"
      style={{
        background: "white",
        border: `1px solid ${isCritical ? "rgba(200,60,60,0.25)" : isHigh ? "rgba(197,164,109,0.25)" : C.border}`,
      }}>
      <Zap size={13} style={{ color: isCritical ? "rgb(180,60,60)" : isHigh ? "#A07840" : C.olive, flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-0.5" style={{ color: C.muted }}>{rec.eventName}</p>
        <p className="text-sm font-semibold" style={{ color: C.dark }}>{rec.title}</p>
        <p className="text-xs mt-0.5" style={{ color: C.muted }}>{rec.rationale}</p>
        <p className="text-xs mt-1 font-medium" style={{ color: C.olive }}>→ {rec.action}</p>
      </div>
      <div className="shrink-0 text-left">
        <p className="text-[10px]" style={{ color: C.muted }}>ביטחון</p>
        <p className="text-xs font-bold" style={{ color: C.olive }}>{confidencePct}%</p>
      </div>
    </div>
  );
}

const DEFAULT_RULES_SUMMARY = [
  "תזכורת דחופה — אירוע בעוד 7 ימים עם ממתינים",
  "תזכורת — אירוע בעוד 14 ימים, >20% ממתינים",
  "מעקב — פתחו קישור ולא ענו (3+)",
  "גל הזמנות — אחוז מענה <40%",
  "עדכון פרטי קשר — חסרים 5+ טלפונים",
  "ייצוא דוח לאולם — מענה ≥70% + קרוב לאירוע",
];
