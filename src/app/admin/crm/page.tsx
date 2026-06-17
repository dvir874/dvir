"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Phone, MessageCircle, Plus, Trash2, Check, Clock,
  ChevronDown, ArrowRight, Search, X, AlertTriangle, Star,
} from "lucide-react";

const GOLD = "#C5A46D";
const OLIVE = "#6B7B5A";
const DARK = "#333";
const WA_PHONE = "972533318177";

/* ── Types ─────────────────────────────────────────────────────────── */
type PipelineStage = "new_lead" | "contacted" | "demo_scheduled" | "proposal_sent" | "negotiation" | "won" | "lost";

interface LeadTask { id: string; title: string; due_date: string | null; completed: boolean; priority: string; }
interface LeadActivity { id: string; type: string; content: string; created_at: string; }
interface Lead {
  id: string; name: string; phone: string; email: string | null;
  event_type: string | null; wedding_date: string | null; guest_count: number | null;
  source: string; status: PipelineStage; deal_value: number | null; ai_score: number;
  notes: string | null; ref_code: string | null; created_at: string; updated_at: string;
  lead_tasks?: LeadTask[]; lead_activities?: LeadActivity[];
}

/* ── Constants ─────────────────────────────────────────────────────── */
const STAGES: { key: PipelineStage; label: string; color: string; bg: string }[] = [
  { key: "new_lead",        label: "ליד חדש",       color: "#64748B", bg: "rgba(100,116,139,0.1)" },
  { key: "contacted",       label: "יצרנו קשר",    color: GOLD,      bg: "rgba(197,164,109,0.1)" },
  { key: "demo_scheduled",  label: "פגישה נקבעה",  color: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  { key: "proposal_sent",   label: "הצעה נשלחה",   color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  { key: "negotiation",     label: "משא ומתן",     color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { key: "won",             label: "סגרנו 🎉",     color: OLIVE,     bg: "rgba(107,123,90,0.1)" },
  { key: "lost",            label: "לא הצליח",     color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
];

const SOURCE_LABEL: Record<string, string> = {
  facebook: "פייסבוק", instagram: "אינסטגרם", google: "גוגל",
  organic: "אורגני", referral: "המלצה", whatsapp_direct: "וואטסאפ",
  website_chat: "צ׳אט", unknown: "לא ידוע",
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function waLink(phone: string, name: string): string {
  const clean = phone.replace(/[^0-9]/g, "").replace(/^0/, "972");
  const msg = encodeURIComponent(`שלום ${name}, דביר מ״רגע לפני״ — `);
  return `https://wa.me/${clean}?text=${msg}`;
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<PipelineStage | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showAddLead, setShowAddLead] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/leads");
    const d = await r.json();
    if (Array.isArray(d)) setLeads(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, status: PipelineStage) {
    setLeads((ls) => ls.map((l) => l.id === id ? { ...l, status } : l));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (selectedLead?.id === id) setSelectedLead((l) => l ? { ...l, status } : l);
  }

  async function deleteLead(id: string) {
    if (!confirm("למחוק ליד זה?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((ls) => ls.filter((l) => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  }

  const filtered = leads.filter((l) => {
    const matchSearch = !search || l.name.includes(search) || l.phone.includes(search);
    const matchStage = stageFilter === "all" || l.status === stageFilter;
    return matchSearch && matchStage;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new_lead").length,
    won: leads.filter((l) => l.status === "won").length,
    convRate: leads.length > 0 ? Math.round((leads.filter((l) => l.status === "won").length / leads.length) * 100) : 0,
    totalValue: leads.filter((l) => l.status === "won").reduce((s, l) => s + (l.deal_value ?? 0), 0),
    pipeline: leads.filter((l) => !["won","lost"].includes(l.status)).reduce((s, l) => s + (l.deal_value ?? 0), 0),
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Heebo, sans-serif", color: DARK }}>
      {/* Header */}
      <div style={{ background: "#FDFAF5", borderBottom: "1px solid rgba(197,164,109,0.2)", padding: "1rem 1.5rem", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <a href="/admin" style={{ color: GOLD, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
              <ArrowRight size={15} /> ניהול
            </a>
            <h1 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>CRM — ניהול לידים</h1>
            <div style={{ marginRight: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => setView(view === "kanban" ? "list" : "kanban")} style={{ padding: "0.4rem 0.9rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", background: "white", fontSize: 12, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                {view === "kanban" ? "📋 רשימה" : "🗂 קנבן"}
              </button>
              <button onClick={() => setShowAddLead(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.5rem 1rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${OLIVE},#4A5E3A)`, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}>
                <Plus size={14} /> ליד חדש
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "סה״כ לידים", value: stats.total },
              { label: "חדשים", value: stats.new, color: "#EF4444" },
              { label: "סגרנו", value: stats.won, color: OLIVE },
              { label: "המרה", value: `${stats.convRate}%`, color: stats.convRate > 30 ? OLIVE : GOLD },
              { label: "פייפליין פוטנציאלי", value: stats.pipeline ? `₪${stats.pipeline.toLocaleString()}` : "—" },
              { label: "הכנסות שנסגרו", value: stats.totalValue ? `₪${stats.totalValue.toLocaleString()}` : "—", color: OLIVE },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: s.color ?? DARK, fontFamily: "Frank Ruhl Libre, serif" }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "rgba(51,51,51,0.5)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "1.25rem 1.5rem" }}>
        {/* Search + filter */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(51,51,51,0.35)" }} />
            <input
              placeholder="חיפוש לפי שם או טלפון..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.55rem 2rem 0.55rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.25)", fontFamily: "Heebo, sans-serif", fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[{ key: "all" as const, label: "הכל" }, ...STAGES].map((s) => (
              <button
                key={s.key}
                onClick={() => setStageFilter(s.key as PipelineStage | "all")}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: 20,
                  border: "1.5px solid",
                  borderColor: stageFilter === s.key ? ("color" in s ? s.color : GOLD) : "rgba(197,164,109,0.2)",
                  background: stageFilter === s.key ? ("bg" in s ? s.bg : "rgba(197,164,109,0.1)") : "white",
                  color: stageFilter === s.key ? ("color" in s ? s.color : DARK) : "rgba(51,51,51,0.55)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "Heebo, sans-serif",
                  fontWeight: stageFilter === s.key ? 700 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "3rem", color: "rgba(51,51,51,0.4)" }}>טוען לידים...</p>
        ) : filtered.length === 0 ? (
          <EmptyState onAdd={() => setShowAddLead(true)} />
        ) : view === "kanban" ? (
          <KanbanView leads={filtered} onStatusChange={changeStatus} onSelect={setSelectedLead} onDelete={deleteLead} />
        ) : (
          <ListView leads={filtered} onStatusChange={changeStatus} onSelect={setSelectedLead} onDelete={deleteLead} />
        )}
      </div>

      {/* Lead detail panel */}
      {selectedLead && (
        <LeadPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(s) => changeStatus(selectedLead.id, s)}
          onRefresh={load}
        />
      )}

      {/* Add lead modal */}
      {showAddLead && (
        <AddLeadModal onClose={() => setShowAddLead(false)} onSaved={() => { setShowAddLead(false); load(); }} />
      )}
    </div>
  );
}

/* ── Kanban view ────────────────────────────────────────────────────── */
function KanbanView({ leads, onStatusChange, onSelect, onDelete }: {
  leads: Lead[];
  onStatusChange: (id: string, s: PipelineStage) => void;
  onSelect: (l: Lead) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem", alignItems: "flex-start" }}>
      {STAGES.map((stage) => {
        const stagLeads = leads.filter((l) => l.status === stage.key);
        return (
          <div key={stage.key} style={{ minWidth: 240, flex: "0 0 240px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.5rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, display: "inline-block" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>{stage.label}</span>
              <span style={{ fontSize: 11, color: "rgba(51,51,51,0.4)", marginRight: "auto" }}>{stagLeads.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
              {stagLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onStatusChange={onStatusChange} onSelect={onSelect} onDelete={onDelete} compact />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── List view ──────────────────────────────────────────────────────── */
function ListView({ leads, onStatusChange, onSelect, onDelete }: {
  leads: Lead[];
  onStatusChange: (id: string, s: PipelineStage) => void;
  onSelect: (l: Lead) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} onStatusChange={onStatusChange} onSelect={onSelect} onDelete={onDelete} compact={false} />
      ))}
    </div>
  );
}

/* ── Lead card ──────────────────────────────────────────────────────── */
function LeadCard({ lead, onStatusChange, onSelect, onDelete, compact }: {
  lead: Lead;
  onStatusChange: (id: string, s: PipelineStage) => void;
  onSelect: (l: Lead) => void;
  onDelete: (id: string) => void;
  compact: boolean;
}) {
  const stage = STAGES.find((s) => s.key === lead.status)!;
  const days = daysUntil(lead.wedding_date);
  const overdueTasks = (lead.lead_tasks ?? []).filter((t) => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length;
  const openTasks = (lead.lead_tasks ?? []).filter((t) => !t.completed).length;

  return (
    <div
      onClick={() => onSelect(lead)}
      style={{
        background: "#FDFAF5",
        border: `1px solid ${overdueTasks > 0 ? "rgba(239,68,68,0.35)" : "rgba(197,164,109,0.2)"}`,
        borderRadius: "0.9rem",
        padding: compact ? "0.75rem" : "1rem 1.25rem",
        cursor: "pointer",
        position: "relative",
        display: compact ? "block" : "flex",
        alignItems: compact ? undefined : "center",
        gap: compact ? undefined : "1rem",
      }}
    >
      {/* Status dot */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: stage.color,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: DARK }}>{lead.name}</span>
          {lead.ai_score >= 70 && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: "rgba(245,158,11,0.15)", color: "#D97706" }}>🔥 חם</span>
          )}
          {overdueTasks > 0 && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: "rgba(239,68,68,0.12)", color: "#EF4444", display: "flex", alignItems: "center", gap: 2 }}>
              <AlertTriangle size={9} /> {overdueTasks}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "rgba(51,51,51,0.5)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {lead.event_type && <span>{lead.event_type}</span>}
          {days !== null && (
            <span style={{ color: days < 30 && days > 0 ? "#EF4444" : "inherit" }}>
              {days > 0 ? `בעוד ${days} ימים` : days === 0 ? "היום!" : `לפני ${Math.abs(days)} ימים`}
            </span>
          )}
          {lead.deal_value && <span style={{ color: OLIVE, fontWeight: 600 }}>₪{lead.deal_value.toLocaleString()}</span>}
          <span style={{ background: "rgba(107,123,90,0.1)", padding: "0 5px", borderRadius: 4, color: OLIVE }}>{SOURCE_LABEL[lead.source] ?? lead.source}</span>
        </div>
      </div>

      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {openTasks > 0 && (
            <span style={{ fontSize: 11, color: "rgba(51,51,51,0.45)", display: "flex", alignItems: "center", gap: 3 }}>
              <Clock size={11} /> {openTasks}
            </span>
          )}
          <StageSelect value={lead.status} onChange={(s) => { onStatusChange(lead.id, s); }} onClick={(e) => e.stopPropagation()} />
          <a href={waLink(lead.phone, lead.name)} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#22C55E", display: "flex", alignItems: "center" }}>
            <MessageCircle size={17} />
          </a>
          <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} style={{ color: GOLD, display: "flex", alignItems: "center" }}>
            <Phone size={16} />
          </a>
          <button onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.5)", display: "flex", alignItems: "center" }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <a href={waLink(lead.phone, lead.name)} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#22C55E", display: "flex", alignItems: "center" }}>
            <MessageCircle size={15} />
          </a>
          <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()} style={{ color: GOLD }}>
            <Phone size={14} />
          </a>
          <div style={{ marginRight: "auto" }}>
            <StageSelect value={lead.status} onChange={(s) => { onStatusChange(lead.id, s); }} onClick={(e) => e.stopPropagation()} small />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Stage selector ─────────────────────────────────────────────────── */
function StageSelect({ value, onChange, onClick, small }: {
  value: PipelineStage;
  onChange: (s: PipelineStage) => void;
  onClick?: (e: React.MouseEvent) => void;
  small?: boolean;
}) {
  const stage = STAGES.find((s) => s.key === value)!;
  return (
    <div style={{ position: "relative", display: "inline-block" }} onClick={onClick}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as PipelineStage)}
        style={{
          padding: small ? "2px 20px 2px 4px" : "3px 22px 3px 6px",
          borderRadius: 6,
          border: `1px solid ${stage.color}44`,
          background: stage.bg,
          color: stage.color,
          fontSize: small ? 10 : 11,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "Heebo, sans-serif",
          appearance: "none",
        }}
      >
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      <ChevronDown size={10} style={{ position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)", color: stage.color, pointerEvents: "none" }} />
    </div>
  );
}

/* ── Lead detail panel ──────────────────────────────────────────────── */
function LeadPanel({ lead, onClose, onStatusChange, onRefresh }: {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (s: PipelineStage) => void;
  onRefresh: () => void;
}) {
  const [detail, setDetail] = useState<Lead>(lead);
  const [noteText, setNoteText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [addingTask, setAddingTask] = useState(false);
  const [saving, setSaving] = useState(false);
  const [surveyToken, setSurveyToken] = useState<string | null>(null);
  const [surveyCopied, setSurveyCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${lead.id}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setDetail(d); });
  }, [lead.id]);

  async function addNote() {
    if (!noteText.trim()) return;
    setSaving(true);
    await fetch(`/api/leads/${lead.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "note_added", content: noteText.trim() }),
    });
    setNoteText("");
    const r = await fetch(`/api/leads/${lead.id}`);
    const d = await r.json();
    if (!d.error) setDetail(d);
    setSaving(false);
  }

  async function addTask() {
    if (!taskTitle.trim()) return;
    setSaving(true);
    await fetch(`/api/leads/${lead.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: taskTitle.trim(), due_date: taskDate || null }),
    });
    setTaskTitle(""); setTaskDate(""); setAddingTask(false);
    const r = await fetch(`/api/leads/${lead.id}`);
    const d = await r.json();
    if (!d.error) setDetail(d);
    setSaving(false);
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await fetch(`/api/leads/${lead.id}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    setDetail((d) => ({
      ...d,
      lead_tasks: (d.lead_tasks ?? []).map((t) => t.id === taskId ? { ...t, completed } : t),
    }));
  }

  async function generateSurvey() {
    const r = await fetch("/api/referral/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: detail.id }), // using lead.id as placeholder; in practice link to event
    });
    const d = await r.json();
    if (d.survey_token) setSurveyToken(d.survey_token);
  }

  function copySurveyLink() {
    if (!surveyToken) return;
    const url = `${window.location.origin}/survey/${surveyToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setSurveyCopied(true);
      setTimeout(() => setSurveyCopied(false), 2000);
    });
  }

  const days = daysUntil(detail.wedding_date);
  const activities = [...(detail.lead_activities ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const tasks = detail.lead_tasks ?? [];
  const openTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          height: "100%",
          background: "#FDFAF5",
          borderLeft: "1px solid rgba(197,164,109,0.2)",
          overflowY: "auto",
          padding: "1.5rem",
          direction: "rtl",
          fontFamily: "Heebo, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: "1.25rem" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.3rem", fontWeight: 700, color: DARK, marginBottom: 4 }}>
              {detail.name}
            </h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <StageSelect value={detail.status} onChange={(s) => { onStatusChange(s); setDetail((d) => ({ ...d, status: s })); }} />
              {detail.ai_score >= 70 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "rgba(245,158,11,0.12)", color: "#D97706", display: "flex", alignItems: "center", gap: 3 }}>
                  <Star size={10} fill="#D97706" stroke="#D97706" /> ליד חם
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.4)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
          <a
            href={waLink(detail.phone, detail.name)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0.65rem", borderRadius: 10, background: "#22C55E", color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >
            <MessageCircle size={16} /> וואטסאפ
          </a>
          <a
            href={`tel:${detail.phone}`}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "0.65rem", borderRadius: 10, background: GOLD, color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
          >
            <Phone size={16} /> התקשר
          </a>
        </div>

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            marginBottom: "1.25rem",
            background: "rgba(197,164,109,0.06)",
            borderRadius: 12,
            padding: "0.9rem",
          }}
        >
          {[
            { label: "טלפון", value: detail.phone },
            { label: "סוג אירוע", value: detail.event_type ?? "—" },
            { label: "תאריך חתונה", value: detail.wedding_date ? new Date(detail.wedding_date).toLocaleDateString("he-IL") : "—" },
            { label: "ימים לאירוע", value: days !== null ? (days > 0 ? `${days} ימים` : "עבר") : "—", alert: days !== null && days < 30 && days > 0 },
            { label: "מקור", value: SOURCE_LABEL[detail.source] ?? detail.source },
            { label: "שווי עסקה", value: detail.deal_value ? `₪${detail.deal_value.toLocaleString()}` : "לא הוגדר" },
            { label: "ציון AI", value: `${detail.ai_score}/100` },
            { label: "המלצה מ", value: detail.ref_code ?? "—" },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontSize: 10, color: "rgba(51,51,51,0.45)", marginBottom: 1 }}>{item.label}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: item.alert ? "#EF4444" : DARK }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(51,51,51,0.6)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              משימות {openTasks.length > 0 && `(${openTasks.length})`}
            </span>
            <button onClick={() => setAddingTask(true)} style={{ background: "none", border: "none", cursor: "pointer", color: GOLD, display: "flex", alignItems: "center", gap: 3, fontSize: 12 }}>
              <Plus size={13} /> הוסף
            </button>
          </div>

          {addingTask && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              <input
                placeholder="כותרת משימה"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                autoFocus
                style={{ flex: 1, minWidth: 120, padding: "0.4rem 0.65rem", borderRadius: 7, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 13 }}
              />
              <input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                style={{ padding: "0.4rem 0.65rem", borderRadius: 7, border: "1px solid rgba(197,164,109,0.3)", fontSize: 13 }}
              />
              <button onClick={addTask} disabled={saving} style={{ padding: "0.4rem 0.75rem", borderRadius: 7, border: "none", background: GOLD, color: "white", cursor: "pointer", fontSize: 12, fontFamily: "Heebo, sans-serif" }}>שמור</button>
              <button onClick={() => setAddingTask(false)} style={{ padding: "0.4rem 0.75rem", borderRadius: 7, border: "1px solid rgba(197,164,109,0.2)", background: "white", cursor: "pointer", fontSize: 12, fontFamily: "Heebo, sans-serif" }}>ביטול</button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {openTasks.map((task) => {
              const overdue = task.due_date && new Date(task.due_date) < new Date();
              return (
                <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 0.65rem", borderRadius: 8, background: overdue ? "rgba(239,68,68,0.05)" : "rgba(197,164,109,0.05)", border: `1px solid ${overdue ? "rgba(239,68,68,0.2)" : "rgba(197,164,109,0.15)"}` }}>
                  <button onClick={() => toggleTask(task.id, true)} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${overdue ? "#EF4444" : "rgba(197,164,109,0.4)"}`, background: "none", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} />
                  <span style={{ flex: 1, fontSize: 13, color: overdue ? "#EF4444" : DARK }}>{task.title}</span>
                  {task.due_date && <span style={{ fontSize: 10, color: overdue ? "#EF4444" : "rgba(51,51,51,0.4)" }}>{new Date(task.due_date).toLocaleDateString("he-IL")}</span>}
                </div>
              );
            })}
            {doneTasks.length > 0 && (
              <p style={{ fontSize: 11, color: "rgba(51,51,51,0.35)", marginTop: 4 }}>{doneTasks.length} משימות הושלמו</p>
            )}
          </div>
        </div>

        {/* Add note */}
        <div style={{ marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(51,51,51,0.6)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>הוסף הערה</p>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              placeholder="רשום הערה פנימית..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.25)", fontFamily: "Heebo, sans-serif", fontSize: 13 }}
            />
            <button onClick={addNote} disabled={saving || !noteText.trim()} style={{ padding: "0.5rem 0.9rem", borderRadius: 8, border: "none", background: GOLD, color: "white", cursor: "pointer", fontSize: 13, fontFamily: "Heebo, sans-serif" }}>שמור</button>
          </div>
        </div>

        {/* Activity timeline */}
        {activities.length > 0 && (
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(51,51,51,0.6)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>ציר זמן</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {activities.slice(0, 12).map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: DARK }}>{a.content}</p>
                    <p style={{ fontSize: 10, color: "rgba(51,51,51,0.4)" }}>
                      {new Date(a.created_at).toLocaleString("he-IL", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survey generator — for won leads */}
        {detail.status === "won" && (
          <div style={{ padding: "0.9rem", borderRadius: 12, background: "rgba(107,123,90,0.07)", border: "1px solid rgba(107,123,90,0.2)", marginBottom: "1rem" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: OLIVE, marginBottom: 6 }}>📋 סקר שביעות רצון</p>
            <p style={{ fontSize: 11, color: "rgba(51,51,51,0.55)", marginBottom: 10 }}>שלח לאחר האירוע כדי לקבל ביקורת וקישור הפניה.</p>
            {!surveyToken ? (
              <button onClick={generateSurvey} style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", background: OLIVE, color: "white", cursor: "pointer", fontSize: 12, fontFamily: "Heebo, sans-serif" }}>
                צור קישור סקר
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={copySurveyLink} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "0.5rem", borderRadius: 8, border: "none", background: OLIVE, color: "white", cursor: "pointer", fontSize: 12, fontFamily: "Heebo, sans-serif" }}>
                  {surveyCopied ? <><Check size={13} /> הועתק!</> : <><MessageCircle size={13} /> העתק קישור</>}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`שלום! שמחים לשמוע מה חשבתם על השירות 😊\nלחצו כאן: ${window.location.origin}/survey/${surveyToken}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "0.5rem", borderRadius: 8, background: "#22C55E", color: "white", fontWeight: 700, fontSize: 12, textDecoration: "none" }}
                >
                  📤 שלח בוואטסאפ
                </a>
              </div>
            )}
          </div>
        )}

        <button onClick={() => { onRefresh(); onClose(); }} style={{ color: "rgba(51,51,51,0.35)", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Heebo, sans-serif", textDecoration: "underline" }}>
          סגור
        </button>
      </div>
    </div>
  );
}

/* ── Add lead modal ─────────────────────────────────────────────────── */
function AddLeadModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", event_type: "חתונה", wedding_date: "", deal_value: "", source: "unknown", notes: "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, deal_value: form.deal_value ? Number(form.deal_value) : null }),
    });
    onSaved();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", direction: "rtl", fontFamily: "Heebo, sans-serif" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
      <div style={{ position: "relative", background: "#FDFAF5", borderRadius: "1.25rem", padding: "1.75rem", width: "100%", maxWidth: 420, boxShadow: "0 16px 48px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>ליד חדש</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(51,51,51,0.4)" }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "name", label: "שם מלא *", type: "text", placeholder: "שם הלקוח" },
            { key: "phone", label: "טלפון *", type: "tel", placeholder: "05X-XXXXXXX" },
            { key: "wedding_date", label: "תאריך אירוע", type: "date", placeholder: "" },
            { key: "deal_value", label: "שווי עסקה (₪)", type: "number", placeholder: "0" },
          ].map((f) => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(51,51,51,0.6)", display: "block", marginBottom: 4 }}>{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(51,51,51,0.6)", display: "block", marginBottom: 4 }}>מקור</label>
            <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 14 }}>
              {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <textarea
            placeholder="הערות..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            rows={2}
            style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8, border: "1px solid rgba(197,164,109,0.3)", fontFamily: "Heebo, sans-serif", fontSize: 13, resize: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: "1.25rem" }}>
          <button onClick={save} disabled={saving || !form.name.trim() || !form.phone.trim()} style={{ flex: 1, padding: "0.75rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#B8924A)`, color: "white", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "Heebo, sans-serif" }}>
            {saving ? "שומר..." : "הוסף ליד"}
          </button>
          <button onClick={onClose} style={{ padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid rgba(197,164,109,0.25)", background: "white", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>ביטול</button>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", color: "rgba(51,51,51,0.4)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: "1.1rem", color: DARK, marginBottom: 8 }}>אין לידים עדיין</p>
      <p style={{ fontSize: 13, marginBottom: 20 }}>כל פנייה מהאתר תופיע כאן אוטומטית. ניתן גם להוסיף ידנית.</p>
      <button onClick={onAdd} style={{ padding: "0.7rem 1.5rem", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#B8924A)`, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
        הוסף ליד ראשון
      </button>
    </div>
  );
}
