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
  cream:  "#F2EDE3",
  ivory:  "#FDFAF5",
  gold:   "#C5A46D",
  olive:  "#6B7B5A",
  dark:   "#1C1008",
  muted:  "rgba(28,16,8,0.45)",
  border: "rgba(197,164,109,0.18)",
  card:   "rgba(255,255,255,0.82)",
  shadow: "0 2px 16px rgba(28,16,8,0.07)",
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

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true }); return; }
      const days    = Math.floor(diff / 86_400_000);
      const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      const seconds = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ days, hours, minutes, seconds, done: false });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (timeLeft.done) return null;

  const units = [
    { label: "ימים",    value: timeLeft.days    },
    { label: "שעות",   value: timeLeft.hours   },
    { label: "דקות",   value: timeLeft.minutes },
    { label: "שניות",  value: timeLeft.seconds },
  ];

  return (
    <div style={{ background: "rgba(61,43,31,0.06)", borderBottom: "1px solid rgba(197,164,109,0.15)", padding: "1rem 1.5rem" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p style={{ textAlign: "center", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(197,164,109,0.8)", marginBottom: "0.75rem", fontFamily: "Heebo, sans-serif" }}>
          ספירה לאחור ליום הגדול
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
          {units.map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center", minWidth: 56 }}>
              <div style={{
                background: "linear-gradient(135deg,#3D2B1F,#5C3D2E)",
                borderRadius: 12,
                padding: "0.6rem 0.4rem",
                marginBottom: "0.3rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}>
                <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1.3rem,5vw,1.8rem)", fontWeight: 700, color: "#C5A46D", lineHeight: 1 }}>
                  {String(value).padStart(2, "0")}
                </span>
              </div>
              <span style={{ fontSize: 10, color: "rgba(51,51,51,0.55)", fontFamily: "Heebo, sans-serif" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F2EDE3", fontFamily: "Heebo, sans-serif", color: C.dark }}>

      {/* Header */}
      <style>{`
        @keyframes coupleFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes coupleGlow  { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes slideCard   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmerBtn  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .couple-card { animation: slideCard 0.5s ease forwards; }
        .couple-card:nth-child(2){animation-delay:0.08s}
        .couple-card:nth-child(3){animation-delay:0.16s}
        .couple-card:nth-child(4){animation-delay:0.24s}
        .couple-card:nth-child(5){animation-delay:0.32s}
      `}</style>

      <div style={{
        background: "linear-gradient(150deg, #C5954A 0%, #9B6E2C 50%, #7A5020 100%)",
        padding: "2.25rem 1.5rem 1.75rem",
        borderBottom: "1px solid rgba(0,0,0,0.12)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* floating rings */}
        <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", border:"1px solid rgba(255,220,130,0.1)", top:-60, left:-60, animation:"coupleFloat 7s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:140, height:140, borderRadius:"50%", border:"1px solid rgba(255,220,130,0.08)", bottom:-40, right:40, animation:"coupleFloat 5s ease-in-out infinite 1.5s", pointerEvents:"none" }} />
        {/* subtle texture overlay */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 0%, rgba(255,220,130,0.18) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase", color: "rgba(255,235,180,0.7)", marginBottom: "0.6rem", fontFamily: "Heebo, sans-serif" }}>
            ✦ {briefing?.phaseLabel ?? "לוח בקרה"}
          </p>
          <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1.8rem,6vw,2.4rem)", fontWeight: 700, marginBottom: "0.35rem", lineHeight: 1.2, color: "#FFF8EC" }}>
            {briefing?.greeting ?? event.name}
          </h1>
          {briefing?.phaseMessage && (
            <p style={{ fontSize: 13, color: "rgba(255,240,200,0.75)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              {briefing.phaseMessage}
            </p>
          )}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(briefing?.keyFacts ?? [
              `${stats.confirmed + stats.declined}/${stats.total} ענו`,
              `${tasks.filter(t => t.completed).length}/${tasks.length} משימות`,
              `${daysLeft} ימים`,
            ]).map((fact, i) => (
              <div key={i} style={{
                padding: "0.3rem 0.85rem", borderRadius: 20,
                background: "rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,220,130,0.30)",
                fontSize: 12, color: "rgba(255,235,180,0.92)", fontFamily: "Heebo, sans-serif", fontWeight: 500,
              }}>
                {fact}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Countdown */}
      <CountdownTimer targetDate={event.date} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>

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
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
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
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
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
        <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "1rem" }}>
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

        {/* Blessing */}
        <BlessingCard name={event.name} />

        {/* Smart Recommendations */}
        <SmartRecommendations tasks={tasks} daysLeft={daysLeft} onComplete={toggleTask} />

        {/* RSVP Visual Counter */}
        <RsvpCounter stats={stats} />

        {/* Budget Tracker */}
        <BudgetTracker token={token} />

        {/* Gifts Tracker */}
        <GiftsTracker token={token} />

        {/* Seating */}
        {seating.assignedSeats > 0 && (
          <a href={`/couple/${token}/seating`} style={{ textDecoration: "none", display: "block", marginBottom: "0.875rem" }}>
            <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <LayoutGrid size={14} style={{ color: C.gold }} />
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0, color: C.dark }}>סידורי הושבה</h3>
                </div>
                <span style={{ fontSize: 11, color: C.gold, fontFamily: "Heebo, sans-serif" }}>לצפייה בשולחנות ←</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: "0.4rem" }}>
                <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.4rem", fontWeight: 700, color: C.dark }}>{seatingPct}%</span>
                <span style={{ fontSize: 12, color: C.muted }}>מוצבים</span>
              </div>
              <p style={{ fontSize: 11, color: C.muted, marginBottom: "0.5rem" }}>{seating.assignedSeats} מתוך {stats.attendees} אורחים קיבלו מקום</p>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(197,164,109,0.12)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${seatingPct}%`, background: seatingPct >= 80 ? C.olive : C.gold, transition: "width 0.8s" }} />
              </div>
            </div>
          </a>
        )}

        {/* Wedding Day Timeline — editable */}
        <TimelineEditor token={token} />

        {/* Contact Dvir */}
        <a
          href="https://wa.me/972533318177?text=שלום+דביר%2C+יש+לי+שאלה+לגבי+החתונה+שלנו"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", gap: "1rem",
            background: "linear-gradient(135deg, #1a4731 0%, #0f2e1f 100%)",
            borderRadius: "1.25rem", padding: "1.25rem 1.5rem",
            boxShadow: "0 4px 20px rgba(37,211,102,0.18)",
            textDecoration: "none", marginBottom: "0.875rem",
            border: "1px solid rgba(37,211,102,0.25)",
          }}
        >
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 10px rgba(37,211,102,0.4)" }}>
            <span style={{ fontSize: 22 }}>💬</span>
          </div>
          <div>
            <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: "white", margin: 0 }}>
              שאלה? דברו עם דביר
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", margin: 0, fontFamily: "Heebo, sans-serif" }}>
              053-3318177 · מענה תוך 24 שעות
            </p>
          </div>
          <span style={{ marginRight: "auto", fontSize: 18 }}>←</span>
        </a>

        {/* Memory Wall */}
        <MemorySection token={token} />

        {/* Recap link — shown after wedding date */}
        {briefing && briefing.daysUntilEvent <= 0 && (
          <a
            href={`/couple/${token}/recap`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "0.9rem 1rem", borderRadius: "1.25rem",
              background: "linear-gradient(135deg,#1a120a,#2d1f10)",
              border: "1px solid rgba(197,164,109,0.25)", textDecoration: "none",
              boxShadow: C.shadow,
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
  );
}

interface TimelineItem { time: string; label: string }

function TimelineEditor({ token }: { token: string }) {
  const [items,   setItems]   = useState<TimelineItem[]>([]);
  const [loaded,  setLoaded]  = useState(false);
  const [open,    setOpen]    = useState(false);
  const [time,    setTime]    = useState("18:00");
  const [label,   setLabel]   = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/timeline`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setItems(d); setLoaded(true); });
  }, [token]);

  async function save(next: TimelineItem[]) {
    const sorted = [...next].sort((a, b) => a.time.localeCompare(b.time));
    setItems(sorted);
    await fetch(`/api/couple/${token}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: sorted }),
    });
  }

  async function add() {
    if (!label.trim()) return;
    setSaving(true);
    await save([...items, { time, label: label.trim() }]);
    setLabel(""); setOpen(false); setSaving(false);
  }

  async function remove(i: number) {
    await save(items.filter((_, idx) => idx !== i));
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (!loaded) return null;

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, fontFamily: "Heebo, sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
          🗓 טיימליין יום החתונה
        </p>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.gold, fontFamily: "Heebo, sans-serif" }}>
          {open ? "סגור" : "+ הוסף"}
        </button>
      </div>

      {items.length === 0 && !open && (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>
          בנו את לוח הזמנים של היום שלכם — מתי קבלת פנים, חופה, ריקודים ועוד
        </p>
      )}

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map((item, i) => {
            const [h, m] = item.time.split(":").map(Number);
            const mins = h * 60 + m;
            const nextMins = i + 1 < items.length
              ? Number(items[i+1].time.split(":")[0]) * 60 + Number(items[i+1].time.split(":")[1])
              : mins + 60;
            const isActive = nowMinutes >= mins && nowMinutes < nextMins;
            const isPast   = nowMinutes >= nextMins;
            return (
              <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: isActive ? C.gold : isPast ? C.olive : C.border, boxShadow: isActive ? `0 0 0 3px rgba(197,164,109,0.25)` : "none" }} />
                  {i < items.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, minHeight: 28, background: isPast ? C.olive : C.border, opacity: 0.35, marginTop: 2 }} />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: i < items.length - 1 ? "0.875rem" : 0 }}>
                  <span style={{ fontSize: 11, color: isActive ? C.gold : C.muted, fontFamily: "Heebo, sans-serif", fontWeight: isActive ? 700 : 400 }}>{item.time}</span>
                  <p style={{ fontSize: 13, color: isPast ? C.muted : C.dark, fontFamily: "Heebo, sans-serif", fontWeight: isActive ? 700 : 400, margin: 0, opacity: isPast ? 0.55 : 1 }}>
                    {item.label}
                    {isActive && <span style={{ marginRight: 6, fontSize: 10, background: C.gold, color: "white", padding: "1px 6px", borderRadius: 8, verticalAlign: "middle" }}>עכשיו</span>}
                  </p>
                </div>
                <button onClick={() => remove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.18)", padding: "4px 2px", flexShrink: 0, marginTop: 2 }}>
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${C.border}` }}>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            style={{ width: 90, padding: "0.4rem 0.5rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          <input placeholder="שם האירוע (קבלת פנים, חופה...)" value={label} onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          <button onClick={add} disabled={saving || !label.trim()}
            style={{ padding: "0.4rem 0.8rem", borderRadius: 8, background: C.gold, border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {saving ? "..." : "הוסף"}
          </button>
        </div>
      )}
    </div>
  );
}

function RsvpCounter({ stats }: { stats: { total: number; confirmed: number; declined: number; pending: number; attendees: number } }) {
  const total = stats.total || 1;
  const confirmedPct = Math.round((stats.confirmed / total) * 100);
  const declinedPct  = Math.round((stats.declined  / total) * 100);
  const pendingPct   = 100 - confirmedPct - declinedPct;

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={14} style={{ color: C.gold }} />
          <h3 style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>אישורי הגעה</h3>
        </div>
        <span style={{ fontSize: 11, color: C.muted }}>{stats.confirmed + stats.declined} מתוך {stats.total} ענו</span>
      </div>

      {/* Bar */}
      <div style={{ height: 10, borderRadius: 5, overflow: "hidden", display: "flex", marginBottom: "0.875rem", background: "rgba(197,164,109,0.10)" }}>
        <div style={{ width: `${confirmedPct}%`, background: C.olive, transition: "width 0.8s" }} />
        <div style={{ width: `${declinedPct}%`, background: "#C0392B", transition: "width 0.8s" }} />
        <div style={{ width: `${pendingPct}%`, background: "rgba(197,164,109,0.25)", transition: "width 0.8s" }} />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        {[
          { label: "מגיעים", count: stats.confirmed, color: C.olive },
          { label: "ממתינים", count: stats.pending, color: C.gold },
          { label: "לא מגיעים", count: stats.declined, color: "#C0392B" },
        ].map(({ label, count, color }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.1rem", fontWeight: 700, color: C.dark }}>{count}</span>
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "Heebo, sans-serif" }}>{label}</span>
          </div>
        ))}
      </div>

      {stats.attendees > 0 && (
        <p style={{ textAlign: "center", marginTop: "0.75rem", fontSize: 12, color: C.olive, fontFamily: "Heebo, sans-serif", fontWeight: 600 }}>
          {stats.attendees} אנשים מגיעים ליום הגדול 🎉
        </p>
      )}
    </div>
  );
}

function BudgetVisual({ budget }: { budget: { planned: number; actual: number; remaining: number; itemCount: number } }) {
  if (budget.itemCount === 0) return null;
  const usedPct = budget.planned > 0 ? Math.min(100, Math.round((budget.actual / budget.planned) * 100)) : 0;
  const overBudget = budget.actual > budget.planned;

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "1rem" }}>
        <Wallet size={14} style={{ color: C.gold }} />
        <h3 style={{ fontSize: "0.8rem", fontWeight: 600, margin: 0 }}>תקציב</h3>
        {overBudget && <span style={{ marginRight: "auto", fontSize: 10, background: "rgba(192,57,43,0.12)", color: "#C0392B", padding: "2px 8px", borderRadius: 8, fontFamily: "Heebo, sans-serif" }}>חריגה!</span>}
      </div>

      {/* Donut-style */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(197,164,109,0.12)" strokeWidth="10" />
            <circle cx="36" cy="36" r="28" fill="none"
              stroke={overBudget ? "#C0392B" : C.gold}
              strokeWidth="10"
              strokeDasharray={`${usedPct * 1.759} 175.9`}
              strokeLinecap="round"
              transform="rotate(-90 36 36)"
              style={{ transition: "stroke-dasharray 0.8s" }}
            />
          </svg>
          <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: overBudget ? "#C0392B" : C.dark }}>
            {usedPct}%
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.3rem", fontWeight: 700, margin: 0 }}>₪{fmt(budget.actual)}</p>
          <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 6px" }}>מתוך ₪{fmt(budget.planned)} מתוכנן</p>
          {!overBudget && <p style={{ fontSize: 11, color: C.olive, margin: 0 }}>₪{fmt(budget.remaining)} נותרו</p>}
        </div>
      </div>
    </div>
  );
}


const BLESSINGS = [
  "האהבה שלכם היא המפה, והחתונה היא הצעד הראשון במסע.",
  "כל רגע שעובר מקרב אתכם ליום שתזכרו לנצח.",
  "שיהיה לכם יום שמח כמו הלב שלכם — מלא ועמוק.",
  "שתמיד תצחקו ביחד, ושתמיד תהיו הבית אחד של השני.",
  "מהיום הזה ועד כל הימים — ביחד.",
];

function BlessingCard({ name }: { name: string }) {
  const blessing = BLESSINGS[Math.floor(name.length % BLESSINGS.length)];
  return (
    <div style={{
      borderRadius: "1.25rem",
      padding: "1.75rem 1.5rem",
      marginBottom: "0.875rem",
      textAlign: "center",
      background: "linear-gradient(135deg, #1C1008 0%, #2E1A0A 100%)",
      boxShadow: "0 4px 24px rgba(28,16,8,0.18)",
      border: "1px solid rgba(197,164,109,0.20)",
      position: "relative" as const,
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(197,164,109,0.5), transparent)" }} />
      <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase" as const, color: "rgba(197,164,109,0.6)", marginBottom: "0.75rem", fontFamily: "Heebo, sans-serif" }}>
        ✦ לכבוד {name}
      </p>
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "clamp(1rem,3.5vw,1.2rem)", color: "white", lineHeight: 1.7, margin: 0, fontWeight: 400 }}>
        &ldquo;{blessing}&rdquo;
      </p>
      <div style={{ width: 32, height: 1, background: "rgba(197,164,109,0.4)", margin: "1rem auto 0" }} />
      <p style={{ fontSize: 11, color: "rgba(197,164,109,0.55)", marginTop: "0.5rem", fontFamily: "Heebo, sans-serif" }}>
        דביר · רגע לפני
      </p>
    </div>
  );
}

// ─── Budget Tracker ───────────────────────────────────────────────────────────

const BUDGET_CATS = [
  { key: "venue",        label: "אולם",           color: "#C5A46D" },
  { key: "catering",     label: "קייטרינג",        color: "#8B6914" },
  { key: "photographer", label: "צלם",             color: "#6B7B5A" },
  { key: "dj",           label: "DJ / מוזיקה",    color: "#7C6A52" },
  { key: "flowers",      label: "פרחים",           color: "#A8866A" },
  { key: "dress",        label: "שמלה / חליפה",   color: "#9B8B6E" },
  { key: "other",        label: "אחר",             color: "#B5A090" },
];

interface BudgetItem { id: string; category: string; description: string; planned_amount: number }

function BudgetTracker({ token }: { token: string }) {
  const [items,    setItems]    = useState<BudgetItem[]>([]);
  const [open,     setOpen]     = useState(false);
  const [cat,      setCat]      = useState("venue");
  const [desc,     setDesc]     = useState("");
  const [amount,   setAmount]   = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/budget`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setItems(d));
  }, [token]);

  async function add() {
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    const catLabel = BUDGET_CATS.find(c => c.key === cat)?.label ?? cat;
    const res = await fetch(`/api/couple/${token}/budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, description: desc || catLabel, planned_amount: Number(amount) }),
    });
    const item = await res.json();
    if (!item.error) setItems(prev => [...prev, item]);
    setAmount(""); setDesc(""); setOpen(false); setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/couple/${token}/budget?id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const total = items.reduce((s, i) => s + i.planned_amount, 0);

  // Pie chart segments
  const PIE = 54, CIRC = 2 * Math.PI * PIE;
  let offset = 0;
  const segments = items.map(item => {
    const cat = BUDGET_CATS.find(c => c.key === item.category);
    const pct = total > 0 ? item.planned_amount / total : 0;
    const seg = { id: item.id, color: cat?.color ?? "#C5A46D", dasharray: pct * CIRC, dashoffset: -offset * CIRC };
    offset += pct;
    return seg;
  });

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Wallet size={14} style={{ color: C.gold }} />
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>תקציב החתונה</h3>
        </div>
        {total > 0 && (
          <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: C.gold }}>
            ₪{fmt(total)}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>
          הוסיפו את קטגוריות התקציב שלכם — ותראו תמונה ברורה לאן הולך הכסף
        </p>
      ) : (
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "0.875rem" }}>
          {/* Donut */}
          <svg width="116" height="116" viewBox="0 0 116 116" style={{ flexShrink: 0 }}>
            <circle cx="58" cy="58" r={PIE} fill="none" stroke="rgba(197,164,109,0.12)" strokeWidth="16" />
            {segments.map(s => (
              <circle key={s.id} cx="58" cy="58" r={PIE} fill="none" stroke={s.color} strokeWidth="16"
                strokeDasharray={`${s.dasharray} ${CIRC}`} strokeDashoffset={s.dashoffset}
                transform="rotate(-90 58 58)" style={{ transition: "all 0.5s ease" }} />
            ))}
            <text x="58" y="62" textAnchor="middle" style={{ fontSize: 11, fill: C.muted, fontFamily: "Heebo, sans-serif" }}>
              סה״כ
            </text>
          </svg>
          {/* Legend */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
            {items.map(item => {
              const cat = BUDGET_CATS.find(c => c.key === item.category);
              const pct = total > 0 ? Math.round((item.planned_amount / total) * 100) : 0;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat?.color ?? C.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, flex: 1, color: C.dark }}>{item.description}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{pct}%</span>
                  <button onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.2)", padding: 1 }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem", borderTop: `1px solid ${C.border}` }}>
          <select value={cat} onChange={e => setCat(e.target.value)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, background: "white", outline: "none" }}>
            {BUDGET_CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <input placeholder="תיאור (אופציונלי)" value={desc} onChange={e => setDesc(e.target.value)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input type="number" placeholder="סכום ₪" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
            <button onClick={add} disabled={saving || !amount}
              style={{ padding: "0.4rem 0.9rem", borderRadius: 8, background: C.gold, border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "..." : "הוסף"}
            </button>
            <button onClick={() => setOpen(false)}
              style={{ padding: "0.4rem 0.6rem", borderRadius: 8, background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer" }}>
              <XCircle size={14} style={{ color: C.muted }} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: `1px dashed ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.muted, fontFamily: "Heebo, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Plus size={13} /> הוסף קטגוריית תקציב
        </button>
      )}
    </div>
  );
}

// ─── Gifts Tracker ────────────────────────────────────────────────────────────

// ─── Memory Section ───────────────────────────────────────────────────────────

function MemorySection({ token }: { token: string }) {
  const [vaultToken, setVaultToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/vault`)
      .then(r => r.json())
      .then(d => { if (d.vault_token) setVaultToken(d.vault_token); });
  }, [token]);

  if (!vaultToken) return null;

  async function copyLink() {
    const url = `${window.location.origin}/memory/${vaultToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <span style={{ fontSize: 16 }}>📷</span>
        <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0, color: C.dark }}>קיר זיכרונות האירוע</h3>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={copyLink}
          style={{
            flex: 1, minWidth: 140, padding: "0.65rem 1rem", borderRadius: 10,
            background: copied ? "rgba(107,123,90,0.12)" : "rgba(197,164,109,0.12)",
            border: `1px solid ${copied ? C.olive : C.border}`,
            color: copied ? C.olive : C.dark,
            fontSize: 13, fontWeight: 600, fontFamily: "Heebo, sans-serif", cursor: "pointer",
          }}
        >
          {copied ? "הועתק! ✓" : "שתפו עם האורחים"}
        </button>
        <a
          href={`/memory/${vaultToken}/wall`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, minWidth: 140, padding: "0.65rem 1rem", borderRadius: 10,
            background: "rgba(28,16,8,0.06)", border: `1px solid ${C.border}`,
            color: C.dark, fontSize: 13, fontWeight: 600, fontFamily: "Heebo, sans-serif",
            textDecoration: "none", textAlign: "center" as const,
          }}
        >
          צפו בקיר
        </a>
      </div>
    </div>
  );
}

interface GiftItem { id: string; guest_name: string; amount: number; notes?: string }

function GiftsTracker({ token }: { token: string }) {
  const [gifts,   setGifts]   = useState<GiftItem[]>([]);
  const [open,    setOpen]    = useState(false);
  const [name,    setName]    = useState("");
  const [amount,  setAmount]  = useState("");
  const [notes,   setNotes]   = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch(`/api/couple/${token}/gifts-log`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setGifts(d));
  }, [token]);

  async function add() {
    if (!name || !amount || Number(amount) <= 0) return;
    setSaving(true);
    const res = await fetch(`/api/couple/${token}/gifts-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_name: name, amount: Number(amount), notes }),
    });
    const gift = await res.json();
    if (!gift.error) setGifts(prev => [gift, ...prev]);
    setName(""); setAmount(""); setNotes(""); setOpen(false); setSaving(false);
  }

  async function remove(id: string) {
    await fetch(`/api/couple/${token}/gifts-log?id=${id}`, { method: "DELETE" });
    setGifts(prev => prev.filter(g => g.id !== id));
  }

  const total = gifts.reduce((s, g) => s + g.amount, 0);

  return (
    <div style={{ background: C.card, borderRadius: "1.25rem", border: `1px solid ${C.border}`, padding: "1.25rem", boxShadow: C.shadow, marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Gift size={14} style={{ color: C.gold }} />
          <h3 style={{ fontSize: "0.85rem", fontWeight: 600, margin: 0 }}>מתנות שהתקבלו</h3>
        </div>
        {total > 0 && (
          <span style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, color: C.olive }}>
            ₪{fmt(total)}
          </span>
        )}
      </div>

      {gifts.length === 0 ? (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0.5rem 0" }}>
          רשמו כאן כל מתנה שמגיעה — הכל מסתכם אוטומטית
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: "0.75rem", maxHeight: 180, overflowY: "auto" }}>
          {gifts.map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.4rem 0.5rem", borderRadius: 8, background: "rgba(107,123,90,0.05)" }}>
              <span style={{ flex: 1, fontSize: 13, color: C.dark }}>{g.guest_name}</span>
              {g.notes && <span style={{ fontSize: 11, color: C.muted }}>{g.notes}</span>}
              <span style={{ fontSize: 13, fontWeight: 600, color: C.olive }}>₪{fmt(g.amount)}</span>
              <button onClick={() => remove(g.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.2)", padding: 1 }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.5rem", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input placeholder="שם הנותן" value={name} onChange={e => setName(e.target.value)}
              style={{ flex: 2, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
            <input type="number" placeholder="₪ סכום" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input placeholder="הערה (אופציונלי)" value={notes} onChange={e => setNotes(e.target.value)}
              style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", fontSize: 13, outline: "none" }} />
            <button onClick={add} disabled={saving || !name || !amount}
              style={{ padding: "0.4rem 0.9rem", borderRadius: 8, background: C.olive, border: "none", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "..." : "הוסף"}
            </button>
            <button onClick={() => setOpen(false)}
              style={{ padding: "0.4rem 0.6rem", borderRadius: 8, background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer" }}>
              <XCircle size={14} style={{ color: C.muted }} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: 8, border: `1px dashed ${C.border}`, background: "transparent", cursor: "pointer", fontSize: 12, color: C.muted, fontFamily: "Heebo, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Plus size={13} /> רשום מתנה שהתקבלה
        </button>
      )}
    </div>
  );
}

// ─── Smart Recommendations ────────────────────────────────────────────────────

const TASK_PRIORITY: Record<string, number> = {
  venue: 1, rabbi: 2, photographer: 3, videographer: 4,
  catering: 5, dj: 6, flowers: 7, dress: 8,
  music: 9, seating: 10, invitations: 11, other: 99,
};

function getUrgencyLabel(days: number, dueDate?: string | null): { label: string; color: string } {
  if (dueDate) {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
    if (diff < 0)  return { label: "באיחור!", color: "#C0392B" };
    if (diff <= 7) return { label: `${diff} ימים`, color: "#C0392B" };
    if (diff <= 30) return { label: `עד ${new Date(dueDate).toLocaleDateString("he-IL")}`, color: "#A07840" };
  }
  if (days <= 14)  return { label: "דחוף", color: "#C0392B" };
  if (days <= 45)  return { label: "בקרוב", color: "#A07840" };
  if (days <= 90)  return { label: "השבועות הקרובים", color: "#6B7B5A" };
  return { label: "אין דחיפות", color: "rgba(28,16,8,0.35)" };
}

function SmartRecommendations({
  tasks,
  daysLeft,
  onComplete,
}: {
  tasks: WeddingTask[];
  daysLeft: number;
  onComplete: (task: WeddingTask) => void;
}) {
  const pending = tasks.filter(t => !t.completed);
  if (pending.length === 0) return null;

  // Sort: overdue → has due_date soon → by category priority
  const sorted = [...pending].sort((a, b) => {
    const urgA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const urgB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    if (urgA !== urgB) return urgA - urgB;
    const prioA = TASK_PRIORITY[a.category] ?? 99;
    const prioB = TASK_PRIORITY[b.category] ?? 99;
    return prioA - prioB;
  });

  const recommendations = sorted.slice(0, 4);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(197,164,109,0.08) 0%, rgba(107,123,90,0.06) 100%)",
      borderRadius: "1.25rem",
      border: "1px solid rgba(197,164,109,0.22)",
      padding: "1.25rem",
      marginBottom: "0.875rem",
      boxShadow: C.shadow,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <div>
          <h3 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1rem", fontWeight: 700, margin: 0, color: C.dark }}>
            כדאי לטפל עכשיו
          </h3>
          <p style={{ fontSize: 11, color: C.muted, margin: 0, fontFamily: "Heebo, sans-serif" }}>
            המלצות — לא חובה, אבל יעזור
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {recommendations.map((task, i) => {
          const { label, color } = getUrgencyLabel(daysLeft, task.due_date);
          return (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.7)",
              borderRadius: 12,
              padding: "0.6rem 0.75rem",
              border: "1px solid rgba(197,164,109,0.14)",
            }}>
              {/* Priority number */}
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: i === 0 ? C.gold : "rgba(197,164,109,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: i === 0 ? "white" : C.muted,
              }}>
                {i + 1}
              </div>

              {/* Task name */}
              <span style={{ flex: 1, fontSize: 13, color: C.dark, fontFamily: "Heebo, sans-serif" }}>
                {task.title}
              </span>

              {/* Urgency badge */}
              <span style={{
                fontSize: 10, color, fontFamily: "Heebo, sans-serif",
                padding: "0.15rem 0.5rem", borderRadius: 8,
                background: `${color}12`, border: `1px solid ${color}30`,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>

              {/* Mark done */}
              <button
                onClick={() => onComplete(task)}
                style={{
                  background: "none", border: `1.5px solid rgba(197,164,109,0.4)`,
                  borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: C.muted,
                }}
                title="סמן כבוצע"
              >
                <CheckCircle size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {pending.length > 4 && (
        <p style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: "0.75rem", fontFamily: "Heebo, sans-serif" }}>
          ועוד {pending.length - 4} משימות ברשימה המלאה למטה
        </p>
      )}
    </div>
  );
}
