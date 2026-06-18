"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, Clock, XCircle, Users, Loader2, AlertCircle,
  Wallet, LayoutGrid, ListChecks, Gift, Plus, Trash2,
  ChevronDown, ChevronUp, Camera, Mic, Lock, Sparkles, Zap,
} from "lucide-react";
import type { WeddingScore, SmartAlert } from "@/lib/wedding-score";

const C = {
  cream:  "#F6F1E8",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#333333",
  muted:  "rgba(51,51,51,0.55)",
  border: "rgba(197,164,109,0.22)",
};

interface EventInfo    { id: string; name: string; date: string; address?: string | null; client_name?: string | null }
interface Stats        { total: number; confirmed: number; declined: number; pending: number; attendees: number; responseRate: number }
interface Budget       { planned: number; actual: number; remaining: number; itemCount: number }
interface Seating      { totalSeats: number; assignedSeats: number; tableCount: number }
interface Tasks        { total: number; completed: number }
interface GiftsSummary { total: number; count: number }
interface DashboardData { event: EventInfo; stats: Stats; budget: Budget; seating: Seating; tasks: Tasks; gifts: GiftsSummary }
interface WeddingTask  { id: string; title: string; category: string; completed: boolean; due_date?: string | null }

interface BriefingData {
  greeting:       string;
  phase:          string;
  phaseLabel:     string;
  phaseMessage:   string;
  daysUntilEvent: number;
  eventName:      string;
  score:          WeddingScore;
  alerts:         SmartAlert[];
  keyFacts:       string[];
}

const VENDOR_CATEGORIES = [
  { key: "photographer", label: "צלם",          emoji: "📸" },
  { key: "videographer", label: "צלם וידאו",    emoji: "🎬" },
  { key: "dj",           label: "DJ / תזמורת",  emoji: "🎵" },
  { key: "catering",     label: "קייטרינג",      emoji: "🍽️" },
  { key: "flowers",      label: "פרחים",         emoji: "💐" },
  { key: "dress",        label: "שמלה / חליפה",  emoji: "👗" },
  { key: "rabbi",        label: "רב / קלציה",    emoji: "📜" },
  { key: "rabbi",        label: "רב",             emoji: "📜" },
  { key: "venue",        label: "אולם",           emoji: "🏛️" },
];

const ALERT_CONFIG: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  urgent:    { bg: "rgba(192,57,43,0.06)",  border: "rgba(192,57,43,0.25)",  text: "#C0392B", icon: "🚨" },
  important: { bg: "rgba(197,164,109,0.08)",border: "rgba(197,164,109,0.3)", text: "#A07840", icon: "⚠️" },
  suggested: { bg: "rgba(107,123,90,0.06)", border: "rgba(107,123,90,0.2)",  text: "#4A7C3F", icon: "💡" },
  info:      { bg: "rgba(107,123,90,0.05)", border: "rgba(107,123,90,0.15)", text: "#6B7B5A", icon: "✅" },
};

function fmt(n: number) { return n.toLocaleString("he-IL"); }

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 54, circ = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(197,164,109,0.15)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dasharray 1s ease" }} />
      <text x="70" y="65" textAnchor="middle" style={{ fontSize: 32, fontWeight: 700, fill: color, fontFamily: "Frank Ruhl Libre, serif" }}>{score}</text>
      <text x="70" y="85" textAnchor="middle" style={{ fontSize: 11, fill: "rgba(51,51,51,0.5)", fontFamily: "Heebo, sans-serif" }}>/ 100</text>
    </svg>
  );
}

export default function CoupleDashboard({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router    = useRouter();
  const [data,        setData]        = useState<DashboardData | null>(null);
  const [briefing,    setBriefing]    = useState<BriefingData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [tasks,       setTasks]       = useState<WeddingTask[]>([]);
  const [vendors,     setVendors]     = useState<Record<string, boolean>>({});
  const [newTask,     setNewTask]     = useState("");
  const [saving,      setSaving]      = useState(false);
  const [showScore,   setShowScore]   = useState(false);
  const [showAlerts,  setShowAlerts]  = useState(true);
  const [actionBusy,  setActionBusy]  = useState<string | null>(null);
  const [actionDone,  setActionDone]  = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const [mainRes, briefRes, onboardRes] = await Promise.all([
      fetch(`/api/couple/${token}`),
      fetch(`/api/couple/${token}/briefing`),
      fetch(`/api/couple/${token}/onboarding`),
    ]);
    const main     = await mainRes.json();
    const brief    = await briefRes.json();
    const onboard  = await onboardRes.json();
    if (!main.error)  setData(main);
    if (!brief.error) setBriefing(brief);
    // Redirect to onboarding if not yet completed
    if (!onboard.onboarding_completed && !onboard.error) {
      router.replace(`/couple/${token}/onboarding`);
      return;
    }
    setLoading(false);
  }, [token, router]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data?.event?.id) return;
    fetch(`/api/wedding-tasks?event_id=${data.event.id}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setTasks(d));
    fetch(`/api/wedding-vendors?event_id=${data.event.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const map: Record<string, boolean> = {};
          d.forEach((v: { category: string; confirmed: boolean }) => { map[v.category] = v.confirmed; });
          setVendors(map);
        }
      });
  }, [data?.event?.id]);

  async function toggleTask(task: WeddingTask) {
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t));
    await fetch(`/api/wedding-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    load();
  }

  async function addTask() {
    if (!newTask.trim() || !data?.event?.id) return;
    setSaving(true);
    await fetch("/api/wedding-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: data.event.id, title: newTask.trim(), category: "general" }),
    });
    setNewTask("");
    const res = await fetch(`/api/wedding-tasks?event_id=${data.event.id}`);
    const d   = await res.json();
    if (Array.isArray(d)) setTasks(d);
    setSaving(false);
  }

  async function deleteTask(id: string) {
    await fetch(`/api/wedding-tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function doAction(action: string, extra?: Record<string, string>) {
    if (actionBusy) return;
    setActionBusy(action);
    try {
      await fetch(`/api/couple/${token}/briefing`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action, ...extra }),
      });
      setActionDone(prev => new Set(prev).add(action));
      load();
    } finally {
      setActionBusy(null);
    }
  }

  async function toggleVendor(category: string) {
    const next = !vendors[category];
    setVendors((p) => ({ ...p, [category]: next }));
    await fetch(`/api/couple/${token}/briefing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, confirmed: next }),
    });
    load();
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.cream }}>
      <Loader2 size={32} style={{ color: C.gold, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.cream, gap: "1rem" }}>
      <AlertCircle size={40} style={{ color: C.gold }} />
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.25rem", color: C.dark }}>הקישור אינו תקין</p>
    </div>
  );

  const { event, stats, budget, seating, gifts } = data;
  const daysLeft   = briefing?.daysUntilEvent ?? Math.max(0, Math.ceil((new Date(event.date).getTime() - Date.now()) / 86_400_000));
  const taskPct    = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const seatingPct = stats.attendees > 0 ? Math.round((seating.assignedSeats / stats.attendees) * 100) : 0;
  const score      = briefing?.score;
  const alerts     = briefing?.alerts ?? [];
  const urgents    = alerts.filter(a => a.severity === "urgent");
  const others     = alerts.filter(a => a.severity !== "urgent");

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: `linear-gradient(160deg, #F6F1E8 0%, #EDE6D6 100%)`, fontFamily: "Heebo, sans-serif", color: C.dark }}>

      {/* Morning Briefing Header */}
      <div style={{ background: "linear-gradient(135deg, #3D2B1F 0%, #5C3D2E 100%)", padding: "2rem 1.5rem 1.75rem", color: "white" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(197,164,109,0.7)", marginBottom: "0.4rem" }}>
            {briefing?.phaseLabel ?? "לוח בקרה"}
          </p>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1.4rem,5vw,1.8rem)", fontWeight: 700, marginBottom: "0.5rem" }}>
            {briefing?.greeting ?? event.name}
          </h1>
          {briefing?.phaseMessage && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
              {briefing.phaseMessage}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(briefing?.keyFacts ?? [
              `${stats.confirmed + stats.declined}/${stats.total} ענו`,
              `${tasks.filter(t => t.completed).length}/${tasks.length} משימות`,
              `${daysLeft} ימים`,
            ]).map((fact, i) => (
              <div key={i} style={{ padding: "0.35rem 0.8rem", borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                {fact}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.25rem 1rem 5rem" }}>

        {/* Urgent alerts with one-tap actions */}
        {urgents.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {urgents.map((a, i) => {
              const cfg    = ALERT_CONFIG.urgent;
              const isPending = a.key === "rsvp_low" || a.key === "rsvp_pending";
              const isDone    = actionDone.has("send_reminder");
              return (
                <div key={i} style={{ padding: "0.875rem 1rem", borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: cfg.text, marginBottom: 2 }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>{a.body}</p>
                    </div>
                  </div>
                  {isPending && (
                    <button
                      onClick={() => doAction("send_reminder")}
                      disabled={!!actionBusy || isDone}
                      style={{
                        marginTop: "0.6rem", width: "100%", padding: "0.5rem 1rem",
                        borderRadius: 8, border: "none", cursor: isDone ? "default" : "pointer",
                        background: isDone ? "rgba(107,123,90,0.15)" : "rgba(192,57,43,0.12)",
                        color: isDone ? C.olive : cfg.text,
                        fontSize: 12, fontWeight: 600, fontFamily: "Heebo, sans-serif",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      }}
                    >
                      {actionBusy === "send_reminder" ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={13} />}
                      {isDone ? "✓ תזכורות נשלחו" : "שלח תזכורת לכולם עכשיו"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Wedding Success Score */}
        {score && (
          <div style={{ background: C.ivory, borderRadius: "1.5rem", border: `1px solid ${C.border}`, marginBottom: "1rem", overflow: "hidden" }}>
            <button onClick={() => setShowScore(!showScore)}
              style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem", background: "transparent", border: "none", cursor: "pointer", textAlign: "right" }}>
              <ScoreGauge score={score.total} color={score.tierColor} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: C.dark }}>ציון מוכנות</p>
                  <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${score.tierColor}18`, color: score.tierColor }}>
                    {score.tierLabel}
                  </span>
                </div>
                {score.deltaLabel && (
                  <p style={{ fontSize: 11, color: (score.delta ?? 0) > 0 ? C.olive : (score.delta ?? 0) < 0 ? "#C0392B" : C.muted, marginBottom: 4 }}>
                    {(score.delta ?? 0) > 0 ? "↑" : (score.delta ?? 0) < 0 ? "↓" : "→"} {score.deltaLabel}
                  </p>
                )}
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{score.headline}</p>
              </div>
              {showScore ? <ChevronUp size={18} style={{ color: C.muted, flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: C.muted, flexShrink: 0 }} />}
            </button>
            {showScore && (
              <div style={{ padding: "0 1.5rem 1.25rem", borderTop: `1px solid ${C.border}` }}>
                <div style={{ paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {score.components.map((c) => (
                    <div key={c.key}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: C.dark }}>{c.label}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{c.points}/{c.max}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(197,164,109,0.12)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${c.pct}%`, borderRadius: 3, background: c.pct >= 75 ? C.olive : c.pct >= 40 ? C.gold : "#C0392B", transition: "width 0.8s ease" }} />
                      </div>
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.explanation}</p>
                      {c.tip && <p style={{ fontSize: 11, color: C.gold, marginTop: 1 }}>→ {c.tip}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Recommendations */}
        {others.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={() => setShowAlerts(!showAlerts)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif", fontSize: 13, color: C.muted, padding: "0.25rem 0", marginBottom: "0.5rem" }}>
              <Sparkles size={13} />המלצות
              {showAlerts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showAlerts && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {others.map((a, i) => {
                  const cfg = ALERT_CONFIG[a.severity] ?? ALERT_CONFIG.info;
                  return (
                    <div key={i} style={{ padding: "0.75rem 1rem", borderRadius: 12, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", gap: "0.65rem" }}>
                      <span style={{ fontSize: 15 }}>{cfg.icon}</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 12, color: cfg.text, marginBottom: 1 }}>{a.title}</p>
                        <p style={{ fontSize: 11, color: C.muted }}>{a.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RSVP */}
        <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
            <Users size={16} style={{ color: C.gold }} />
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>אישורי הגעה</h2>
            <span style={{ marginRight: "auto", fontSize: 12, color: C.muted }}>{stats.responseRate}% ענו</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "0.875rem" }}>
            {[
              { icon: CheckCircle, count: stats.confirmed, label: "מגיעים",    color: C.olive },
              { icon: Clock,       count: stats.pending,   label: "ממתינים",   color: C.gold },
              { icon: XCircle,     count: stats.declined,  label: "לא מגיעים", color: "#C0392B" },
            ].map(({ icon: Icon, count, label, color }) => (
              <div key={label} style={{ textAlign: "center", padding: "0.75rem 0.5rem", borderRadius: 12, background: `${color}08`, border: `1px solid ${color}25` }}>
                <Icon size={18} style={{ color, margin: "0 auto 4px" }} />
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.4rem", fontWeight: 700, color, lineHeight: 1 }}>{count}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "rgba(197,164,109,0.12)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stats.responseRate}%`, borderRadius: 3, background: `linear-gradient(90deg, ${C.olive}, ${C.gold})`, transition: "width 0.8s" }} />
          </div>
          {stats.attendees > 0 && <p style={{ fontSize: 12, color: C.muted, marginTop: "0.5rem", textAlign: "center" }}>{fmt(stats.attendees)} מגיעים</p>}
        </div>

        {/* Vendors */}
        <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
            <span style={{ fontSize: 16 }}>🏢</span>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>ספקים</h2>
            <span style={{ marginRight: "auto", fontSize: 12, color: C.muted }}>
              {Object.values(vendors).filter(Boolean).length}/{VENDOR_CATEGORIES.length} אושרו
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {VENDOR_CATEGORIES.map((v) => {
              const confirmed = !!vendors[v.key];
              return (
                <button key={v.key} onClick={() => toggleVendor(v.key)}
                  style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem 0.875rem", borderRadius: 10, textAlign: "right", border: `1.5px solid ${confirmed ? C.olive : C.border}`, background: confirmed ? "rgba(107,123,90,0.08)" : "transparent", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                  <span style={{ fontSize: 16 }}>{v.emoji}</span>
                  <span style={{ flex: 1, fontSize: 13, color: C.dark }}>{v.label}</span>
                  {confirmed
                    ? <CheckCircle size={14} style={{ color: C.olive, flexShrink: 0 }} />
                    : <Clock size={14} style={{ color: "rgba(51,51,51,0.25)", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tasks */}
        <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
            <ListChecks size={16} style={{ color: C.gold }} />
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0 }}>משימות</h2>
            <span style={{ marginRight: "auto", fontSize: 12, color: C.muted }}>{taskPct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "rgba(197,164,109,0.12)", overflow: "hidden", marginBottom: "0.875rem" }}>
            <div style={{ height: "100%", width: `${taskPct}%`, borderRadius: 3, background: `linear-gradient(90deg, ${C.olive}, ${C.gold})` }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.875rem", maxHeight: 260, overflowY: "auto" }}>
            {tasks.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.5rem 0", borderBottom: `1px solid rgba(197,164,109,0.1)` }}>
                <button onClick={() => toggleTask(task)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                  {task.completed
                    ? <CheckCircle size={18} style={{ color: C.olive }} />
                    : <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid rgba(197,164,109,0.4)` }} />}
                </button>
                <span style={{ flex: 1, fontSize: 13, color: task.completed ? C.muted : C.dark, textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</span>
                <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.2)", padding: 2, flexShrink: 0 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="הוסף משימה..." style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, background: "transparent", outline: "none" }} />
            <button onClick={addTask} disabled={saving || !newTask.trim()}
              style={{ padding: "0.5rem 0.875rem", borderRadius: 8, border: "none", background: C.gold, color: "white", cursor: "pointer" }}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Budget + Seating + Gifts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.75rem" }}>
              <Wallet size={14} style={{ color: C.gold }} />
              <h3 style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>תקציב</h3>
            </div>
            {budget.itemCount > 0 ? (
              <>
                <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.2rem", fontWeight: 700 }}>₪{fmt(budget.actual)}</p>
                <p style={{ fontSize: 11, color: C.muted }}>מתוך ₪{fmt(budget.planned)}</p>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(197,164,109,0.12)", overflow: "hidden", marginTop: "0.5rem" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, budget.planned > 0 ? (budget.actual / budget.planned) * 100 : 0)}%`, background: budget.actual > budget.planned ? "#C0392B" : C.gold }} />
                </div>
              </>
            ) : <p style={{ fontSize: 12, color: C.muted }}>לא הוגדר תקציב</p>}
          </div>

          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.75rem" }}>
              <LayoutGrid size={14} style={{ color: C.gold }} />
              <h3 style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>הושבה</h3>
            </div>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.2rem", fontWeight: 700 }}>{seatingPct}%</p>
            <p style={{ fontSize: 11, color: C.muted }}>{seating.assignedSeats} מתוך {stats.attendees} מוצבים</p>
            <div style={{ height: 4, borderRadius: 2, background: "rgba(197,164,109,0.12)", overflow: "hidden", marginTop: "0.5rem" }}>
              <div style={{ height: "100%", width: `${seatingPct}%`, background: seatingPct >= 80 ? C.olive : C.gold }} />
            </div>
          </div>

          <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1rem", gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
            <Gift size={14} style={{ color: C.gold }} />
            <h3 style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>מתנות</h3>
            <span style={{ marginRight: "auto", fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.1rem", fontWeight: 700 }}>₪{fmt(gifts.total)}</span>
            <span style={{ fontSize: 12, color: C.muted }}>{gifts.count} מתנות</span>
          </div>
        </div>

        {/* Vault/Capsule CTAs */}
        <div style={{ background: C.ivory, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem" }}>
          <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginBottom: "0.875rem" }}>זכרונות וכמוסת זמן</p>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {[
              { href: `/memory/${token}/wall`,   icon: Camera,    label: "קיר זכרונות",  color: C.gold,    bg: "rgba(197,164,109,0.06)" },
              { href: `/couple/${token}/capsule`, icon: Lock,      label: "כמוסת זמן",    color: C.olive,   bg: "rgba(107,123,90,0.06)" },
              { href: `/memory/${token}`,         icon: Mic,       label: "הקלטת ברכה",   color: "#7c3aed", bg: "rgba(124,58,237,0.05)" },
            ].map(({ href, icon: Icon, label, color, bg }) => (
              <a key={href} href={href} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "0.875rem 0.5rem", borderRadius: 12, background: bg, border: `1px solid ${color}22`, textDecoration: "none" }}>
                <Icon size={22} style={{ color }} />
                <span style={{ fontSize: 11, color: C.dark, fontFamily: "Heebo, sans-serif", textAlign: "center" }}>{label}</span>
              </a>
            ))}
          </div>

          {/* Recap link — shown after wedding date */}
          {briefing && briefing.daysUntilEvent <= 0 && (
            <a
              href={`/couple/${token}/recap`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                marginTop: "0.75rem", padding: "0.9rem 1rem", borderRadius: 12,
                background: "linear-gradient(135deg,#1a120a,#2d1f10)",
                border: "1px solid rgba(197,164,109,0.25)", textDecoration: "none",
              }}
            >
              <Sparkles size={18} style={{ color: C.gold }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "white", fontFamily: "Heebo, sans-serif" }}>
                צפו בסיכום החתונה שלכם ✦
              </span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
