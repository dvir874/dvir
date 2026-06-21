"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell, CheckCircle2, Clock, Send, Eye, ChevronDown, ChevronUp,
  AlertTriangle, MessageCircle, Users, Loader2, X, ExternalLink,
  ToggleLeft, ToggleRight, Edit3, Check, RefreshCw, Calendar,
} from "lucide-react";
import Link from "next/link";
import {
  CAMPAIGN_LABELS, CAMPAIGN_ORDER, CAMPAIGN_ICONS, DEFAULT_TEMPLATES,
  getAutomationAlerts, type CampaignType,
} from "@/lib/automation/message-templates";

const G = {
  gold:      "#C5A46D",
  goldLight: "#D4BC8A",
  olive:     "#6B7B5A",
  cream:     "#F6F1E8",
  ivory:     "#FDFAF5",
  dark:      "#333333",
  border:    "rgba(197,164,109,0.18)",
};

const HEEBO = { fontFamily: "Heebo, sans-serif" };
const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };

interface Campaign { id: string; type: string; status: string; mode: string; sent_at: string | null; scheduled_for: string | null; recipients_total: number; recipients_sent: number; }
interface Template  { title: string; body: string; is_active: boolean; }
interface StateItem { type: CampaignType; campaign: Campaign | null; template: Template; scheduledDate: string; }
interface Event     { id: string; name: string; date: string; address?: string; venue?: string; }

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending:   { label: "ממתין",    bg: "rgba(197,164,109,0.12)", color: G.gold  },
    scheduled: { label: "מתוזמן",   bg: "rgba(107,123,90,0.12)",  color: G.olive },
    sent:      { label: "נשלח ✓",   bg: "rgba(107,123,90,0.18)",  color: "#3D8B5C" },
    cancelled: { label: "בוטל",     bg: "rgba(200,80,80,0.10)",   color: "#C05050" },
    sending:   { label: "שולח...",  bg: "rgba(197,164,109,0.12)", color: G.gold  },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, ...HEEBO }}
    >
      {s.label}
    </span>
  );
}

function AlertBanner({ level, text, onAction, actionLabel }: { level: string; text: string; onAction?: () => void; actionLabel?: string }) {
  const styles: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    warning: { bg: "rgba(197,164,109,0.10)", border: "rgba(197,164,109,0.35)", color: "#8A6D3A", icon: "⚠" },
    info:    { bg: "rgba(107,123,90,0.08)",  border: "rgba(107,123,90,0.25)",  color: G.olive,   icon: "ℹ" },
    success: { bg: "rgba(107,123,90,0.12)",  border: "rgba(107,123,90,0.35)",  color: "#3D8B5C", icon: "✓" },
  };
  const s = styles[level] ?? styles.info;
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span className="text-sm font-medium flex-1" style={{ color: s.color, ...HEEBO }}>
        {s.icon} {text}
      </span>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
          style={{ background: s.border, color: s.color, ...HEEBO }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function AutomationsPage() {
  const [events,         setEvents]         = useState<Event[]>([]);
  const [selectedEvent,  setSelectedEvent]  = useState<Event | null>(null);
  const [state,          setState]          = useState<StateItem[]>([]);
  const [daysUntil,      setDaysUntil]      = useState<number>(0);
  const [confirmedCount, setConfirmedCount] = useState<number>(0);
  const [loading,        setLoading]        = useState(false);
  const [expanded,       setExpanded]       = useState<Record<string, boolean>>({});
  const [previewing,     setPreviewing]     = useState<CampaignType | null>(null);
  const [previewData,    setPreviewData]    = useState<{ rendered: string; links: Array<{ id: string; name: string; phone: string; link: string }>; count: number } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editingTpl,     setEditingTpl]     = useState<CampaignType | null>(null);
  const [tplDraft,       setTplDraft]       = useState("");
  const [saving,         setSaving]         = useState(false);
  const [acting,         setActing]         = useState<string | null>(null);

  // Load events list
  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data as Event[] : [];
        setEvents(arr);
        if (arr.length > 0) setSelectedEvent(arr[0]);
      })
      .catch(() => {});
  }, []);

  // Load automation state when event changes
  const loadState = useCallback(async (eventId: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/automations/${eventId}`);
      const data = await res.json() as { state: StateItem[]; daysUntil: number; confirmedCount: number };
      setState(data.state ?? []);
      setDaysUntil(data.daysUntil ?? 0);
      setConfirmedCount(data.confirmedCount ?? 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedEvent) loadState(selectedEvent.id);
  }, [selectedEvent, loadState]);

  // Preview
  const openPreview = async (type: CampaignType) => {
    if (!selectedEvent) return;
    setPreviewing(type);
    setPreviewLoading(true);
    try {
      const res  = await fetch(`/api/admin/automations/${selectedEvent.id}/preview?type=${type}`);
      const data = await res.json() as typeof previewData;
      setPreviewData(data);
    } catch { /* ignore */ }
    setPreviewLoading(false);
  };

  // Actions
  const doAction = async (action: string, type: CampaignType, extra: Record<string, unknown> = {}) => {
    if (!selectedEvent) return;
    setActing(`${action}_${type}`);
    try {
      await fetch(`/api/admin/automations/${selectedEvent.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, type, ...extra }),
      });
      await loadState(selectedEvent.id);
    } catch { /* ignore */ }
    setActing(null);
  };

  // Save template
  const saveTpl = async (type: CampaignType) => {
    if (!selectedEvent) return;
    setSaving(true);
    const item = state.find((s) => s.type === type);
    await fetch(`/api/admin/automations/${selectedEvent.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_template", type, title: item?.template.title ?? "", templateBody: tplDraft }),
    });
    setSaving(false);
    setEditingTpl(null);
    await loadState(selectedEvent.id);
  };

  const campaigns = state.map((s) => s.campaign).filter(Boolean) as Campaign[];
  const alerts    = getAutomationAlerts(daysUntil, campaigns);

  const toggle = (type: string) =>
    setExpanded((p) => ({ ...p, [type]: !p[type] }));

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: G.ivory }}>

      {/* Header */}
      <div className="sticky top-0 z-40" style={{ background: "rgba(253,250,245,0.96)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${G.border}` }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm" style={{ color: G.olive, ...HEEBO }}>← אדמין</Link>
            <span style={{ color: G.border }}>|</span>
            <h1 className="text-lg font-bold" style={{ color: G.dark, ...FRANK }}>אוטומציות אורחים</h1>
          </div>
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: alerts.length > 0 ? G.gold : "rgba(51,51,51,0.3)" }} />
            {alerts.length > 0 && (
              <span className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: G.gold }}>
                {alerts.length}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Event selector */}
        <div className="rounded-2xl p-5" style={{ background: "white", border: `1px solid ${G.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>
            אירוע פעיל
          </label>
          <select
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: G.ivory, border: `1.5px solid ${G.border}`, color: G.dark, ...HEEBO }}
            value={selectedEvent?.id ?? ""}
            onChange={(e) => {
              const ev = events.find((x) => x.id === e.target.value);
              if (ev) setSelectedEvent(ev);
            }}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name} — {new Date(ev.date).toLocaleDateString("he-IL")}</option>
            ))}
          </select>

          {selectedEvent && (
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm" style={{ color: G.olive, ...HEEBO }}>
                <Users size={14} />
                <span>{confirmedCount} אורחים מאשרים</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: daysUntil < 0 ? "#C05050" : G.gold, ...HEEBO }}>
                <Clock size={14} />
                <span>
                  {daysUntil > 0 ? `בעוד ${daysUntil} ימים` : daysUntil === 0 ? "היום!" : `לפני ${Math.abs(daysUntil)} ימים`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <AlertBanner
                key={i}
                level={a.level}
                text={a.text}
                actionLabel={a.type ? "עבור לשלב" : undefined}
                onAction={a.type ? () => setExpanded((p) => ({ ...p, [a.type!]: true })) : undefined}
              />
            ))}
          </div>
        )}

        {/* Campaign cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: G.gold }} />
          </div>
        ) : (
          <div className="space-y-4">
            {state.map((item) => {
              const { type, campaign, template, scheduledDate } = item;
              const isExpanded = expanded[type];
              const isSent     = campaign?.status === "sent";
              const isActing   = acting?.startsWith(type);
              const schedDate  = new Date(scheduledDate);
              const isPast     = schedDate < new Date();

              return (
                <div
                  key={type}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: `1px solid ${isSent ? "rgba(107,123,90,0.25)" : G.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                    onClick={() => toggle(type)}
                    style={{ background: isSent ? "rgba(107,123,90,0.04)" : "transparent" }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: isSent ? "rgba(107,123,90,0.12)" : G.cream }}
                    >
                      {CAMPAIGN_ICONS[type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base" style={{ color: G.dark, ...FRANK }}>
                          {CAMPAIGN_LABELS[type]}
                        </span>
                        <StatusPill status={campaign?.status ?? "pending"} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>
                          <Calendar size={11} className="inline ml-1" />
                          {schedDate.toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                          {isPast && daysUntil > 0 && <span className="mr-1 text-red-400">(עבר)</span>}
                        </span>
                        {campaign?.recipients_total ? (
                          <span className="text-xs" style={{ color: "rgba(51,51,51,0.45)", ...HEEBO }}>
                            <Users size={11} className="inline ml-1" />
                            {campaign.recipients_total} נמענים
                          </span>
                        ) : null}
                        {isSent && campaign?.sent_at && (
                          <span className="text-xs" style={{ color: "#3D8B5C", ...HEEBO }}>
                            ✓ נשלח {new Date(campaign.sent_at).toLocaleDateString("he-IL")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isExpanded ? <ChevronUp size={18} style={{ color: G.gold }} /> : <ChevronDown size={18} style={{ color: "rgba(51,51,51,0.3)" }} />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4" style={{ borderTop: `1px solid ${G.border}` }}>

                      {/* Template editor */}
                      <div className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>
                            תוכן ההודעה
                          </span>
                          {editingTpl === type ? (
                            <div className="flex gap-2">
                              <button onClick={() => setEditingTpl(null)} className="text-xs px-2 py-1 rounded" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>ביטול</button>
                              <button
                                onClick={() => saveTpl(type)}
                                disabled={saving}
                                className="text-xs px-3 py-1 rounded-lg font-semibold text-white"
                                style={{ background: G.olive, ...HEEBO }}
                              >
                                {saving ? "שומר..." : "שמור"}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingTpl(type); setTplDraft(template.body); }}
                              className="text-xs flex items-center gap-1"
                              style={{ color: G.gold, ...HEEBO }}
                            >
                              <Edit3 size={12} /> ערוך
                            </button>
                          )}
                        </div>

                        {editingTpl === type ? (
                          <textarea
                            value={tplDraft}
                            onChange={(e) => setTplDraft(e.target.value)}
                            rows={8}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                            style={{ background: G.ivory, border: `1.5px solid ${G.gold}`, ...HEEBO, color: G.dark, lineHeight: 1.8 }}
                          />
                        ) : (
                          <pre
                            className="rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
                            style={{ background: G.ivory, border: `1px solid ${G.border}`, ...HEEBO, color: G.dark, fontFamily: "Heebo, sans-serif" }}
                          >
                            {template.body}
                          </pre>
                        )}
                        <p className="text-xs mt-1.5" style={{ color: "rgba(51,51,51,0.35)", ...HEEBO }}>
                          {`משתנים: {{guest_name}} {{couple_name}} {{event_date}} {{venue}} {{event_link}} {{navigation_link}}`}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: `1px solid ${G.border}` }}>

                        {/* Preview */}
                        <button
                          onClick={() => openPreview(type)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: G.cream, border: `1px solid ${G.border}`, color: G.dark, ...HEEBO }}
                        >
                          <Eye size={15} />
                          תצוגה מקדימה + קישורי WhatsApp
                        </button>

                        {/* Create campaign */}
                        {!campaign && (
                          <button
                            onClick={() => doAction("create_campaign", type, { mode: "manual" })}
                            disabled={!!isActing}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: `linear-gradient(135deg,${G.olive},#3A5030)`, ...HEEBO }}
                          >
                            {isActing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            הכן לשליחה
                          </button>
                        )}

                        {/* Mark as sent */}
                        {campaign && campaign.status !== "sent" && (
                          <button
                            onClick={() => doAction("mark_sent", type)}
                            disabled={!!isActing}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                            style={{ background: `linear-gradient(135deg,#3D8B5C,#2D6B4A)`, ...HEEBO }}
                          >
                            {isActing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            סמן כנשלח
                          </button>
                        )}

                        {/* Reset */}
                        {campaign?.status === "sent" && (
                          <button
                            onClick={() => doAction("cancel", type)}
                            disabled={!!isActing}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                            style={{ background: "rgba(200,80,80,0.08)", border: "1px solid rgba(200,80,80,0.2)", color: "#C05050", ...HEEBO }}
                          >
                            <X size={14} />
                            בטל
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Info note */}
        <div className="rounded-2xl px-5 py-4" style={{ background: "rgba(197,164,109,0.06)", border: `1px solid ${G.border}` }}>
          <p className="text-sm font-semibold mb-1" style={{ color: G.dark, ...HEEBO }}>איך זה עובד?</p>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(51,51,51,0.55)", ...HEEBO }}>
            לחצו על שלב, ערכו את ההודעה אם רוצים, ולחצו &quot;תצוגה מקדימה&quot; לקבלת קישורי WhatsApp לכל האורחים המאשרים. שלחו ידנית ולאחר מכן סמנו &quot;נשלח&quot;. המערכת תעדכן את הסטטוס ותסיר את ההתראה.
          </p>
        </div>
      </div>

      {/* Preview modal */}
      {previewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden" style={{ background: "white" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${G.border}` }}>
              <h2 className="font-bold text-lg" style={{ color: G.dark, ...FRANK }}>
                {CAMPAIGN_ICONS[previewing]} {CAMPAIGN_LABELS[previewing]}
              </h2>
              <button onClick={() => { setPreviewing(null); setPreviewData(null); }} style={{ color: "rgba(51,51,51,0.4)" }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {previewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={28} className="animate-spin" style={{ color: G.gold }} />
                </div>
              ) : previewData ? (
                <>
                  {/* Sample render */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>
                      תצוגה מקדימה (אורח לדוגמה)
                    </p>
                    <pre
                      className="rounded-xl px-4 py-4 text-sm whitespace-pre-wrap leading-relaxed"
                      style={{ background: G.ivory, border: `1px solid ${G.border}`, fontFamily: "Heebo, sans-serif", color: G.dark }}
                    >
                      {previewData.rendered}
                    </pre>
                  </div>

                  {/* Guest links */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>
                      קישורי שליחה — {previewData.count} אורחים מאשרים
                    </p>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {previewData.links.map((g) => (
                        <a
                          key={g.id}
                          href={g.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all hover:opacity-80"
                          style={{ background: G.ivory, border: `1px solid ${G.border}` }}
                        >
                          <div>
                            <p className="text-sm font-medium" style={{ color: G.dark, ...HEEBO }}>{g.name}</p>
                            <p className="text-xs" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>{g.phone}</p>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: "#25D366", color: "white", ...HEEBO }}>
                            <MessageCircle size={13} />
                            שלח
                          </div>
                        </a>
                      ))}
                      {previewData.count === 0 && (
                        <p className="text-sm text-center py-6" style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>
                          אין אורחים מאשרים עדיין
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mark as sent after viewing */}
                  {previewData.count > 0 && (
                    <button
                      onClick={async () => {
                        await doAction("mark_sent", previewing);
                        setPreviewing(null);
                        setPreviewData(null);
                      }}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
                      style={{ background: `linear-gradient(135deg,#3D8B5C,#2D6B4A)`, ...HEEBO }}
                    >
                      ✓ שלחתי לכולם — סמן כנשלח
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
