"use client";
/* The thirteen panels that were living at the bottom of admin/page.tsx.
 *
 * That file was 5,619 lines — seven per cent of the whole project in one
 * component — and every change to it was a bet. These thirteen are already
 * self-contained functions with explicit props, and between them they use
 * exactly two names from the file they sat in: the palette and the tab union.
 * So moving them changes nothing and removes 1,563 lines from the file that
 * most needed to lose them.
 *
 * One file rather than thirteen, deliberately. A single move that the build
 * either accepts or rejects is a different kind of risk from thirteen, and
 * this is the week of שחר's wedding. They can be separated later at leisure.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Users, CheckCircle, Clock, XCircle, Search, Upload, Download, Trash2, Copy, MessageCircle, ChevronLeft, ChevronRight, Loader2, Plus, ExternalLink, RefreshCw, Percent, Zap, Send, AlertTriangle, Smartphone, Bell, Wand2, Palette, Car, Image, QrCode, Building2, FileUp, LayoutDashboard, CalendarDays, BarChart3, Sparkles, Eye, History, LifeBuoy, Inbox, Armchair, MapPin, ArrowLeft, Heart, Sunrise } from "lucide-react";
import type { Event, EventSummary, Forecast, Guest, GuestEvent, GuestStatus, HealthScore, EventStatus, ApprovalRequest } from "@/lib/types";
import { EVENT_STATUS_LABEL, EVENT_STATUS_COLOR } from "@/lib/types";
import { buildRideBoard } from "@/lib/rides";
import { generateReminderRecommendations } from "@/lib/reminder-recommendations";
import type { ReminderRecommendation } from "@/lib/reminder-recommendations";
import { ACTION_LABEL } from "@/lib/reminder-recommendations";
import { whatsappReminderLink, whatsappInviteLink, whatsappThankYouLink } from "@/lib/phone";
import { generateTasks } from "@/lib/automation/task-engine";
import type { Task }     from "@/lib/automation/task-engine";
import { THEME_LIST, DEFAULT_THEME_ID } from "@/lib/themes";
import type { ThemeId }  from "@/lib/themes";
import ChatWidget from "@/components/ChatWidget";
import { C, type Tab } from "./_shared";

export function AdminSidebar({
  activeTab, setActiveTab, pendingCount, recCount, onCreate, eventId, rideMatches,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  pendingCount: number;
  recCount: number;
  onCreate: () => void;
  /* The board is per wedding, so the link has to carry which one. */
  eventId: string | null;
  rideMatches: number;
}) {
  const SC = {
    bg:        "#586151",              // secondary — matches approved Stitch render
    gold:      "#E5C188",              // primary-fixed-dim accent
    textDim:   "rgba(255,255,255,0.62)",
    textFaint: "rgba(255,255,255,0.40)",
  };
  const groups: { title: string; items: { id: Tab; label: string; icon: React.ReactNode; badge?: number; href?: string }[] }[] = [
    { title: "ניהול", items: [
      { id: "command-center", label: "מרכז בקרה",   icon: <LayoutDashboard size={20} /> },
      { id: "guests",         label: "אורחים",      icon: <Users size={20} /> },
      { id: "calendar",       label: "לוח שנה",     icon: <CalendarDays size={20} /> },
      { id: "analytics",      label: "אנליטיקה",    icon: <BarChart3 size={20} /> },
      /* Five screens were reachable only by typing their URL, which this menu's
         own comments already call "the same as not existing". This one is the
         sharpest of them: without an invitation image the sender refuses the
         whole event, and ירון ואיילת has none. */
      { id: "guests",         label: "תמונת הזמנה", icon: <Image size={20} />, href: "/admin/event-image" },
      { id: "guests",         label: "ייבוא אורחים", icon: <FileUp size={20} />, href: "/admin/guests-import" },
    ] },
    { title: "תקשורת", items: [
      { id: "messages",        label: "WhatsApp",    icon: <MessageCircle size={20} /> },
      /* A route rather than a tab. The screen existed and was reachable only by
         typing its URL, which is the same as not existing — Dvir asked twice
         where to find it. */
      { id: "messages",        label: "לפני שליחה",  icon: <Send size={20} />, href: "/admin/send-preview" },
      /* Also a route, also previously reachable only by typing its URL. It
         classifies every failure by reason — 7 guests of שחר with no WhatsApp
         account, 6 in a Meta experiment group, 1 over the recipient cap — and
         Dvir had to ask for that list rather than open it. */
      { id: "messages",        label: "מי לא קיבל",  icon: <AlertTriangle size={20} />, href: "/admin/delivery" },
      /* The fallback channel, on the phone rather than in a file on a Mac. */
      { id: "messages",        label: "שליחה ב-SMS", icon: <Smartphone size={20} />, href: "/admin/sms" },
      /* The rides board, which lived on the couple's dashboard until Dvir asked
         for the matchmaking to be his. It was reachable only from a badge that
         appears when there are matches — which is the same trap as every other
         screen in this menu: findable exactly when you already knew to look. */
      { id: "messages",        label: "לוח טרמפים",  icon: <Car size={20} />,
        href: eventId ? `/admin/rides?event=${eventId}` : "/admin/rides",
        badge: rideMatches || undefined },
      /* Did this wedding make money. The system could account for every
         message and not for a single shekel; asked what שחר earned, nothing
         in it knew. */
      /* Paste the couple's WhatsApp message instead of retyping it. */
      { id: "guests",          label: "קליטת אירוע", icon: <Sparkles size={20} />, href: "/admin/intake" },
      { id: "analytics",       label: "רווחיות",     icon: <BarChart3 size={20} />, href: "/admin/profit" },
      { id: "reminders",       label: "תזכורות",     icon: <Bell size={20} />, badge: pendingCount },
      { id: "recommendations", label: "מרכז המלצות", icon: <Sparkles size={20} />, badge: recCount },
      /* Sending to one guest by hand — the 29 Meta refuses, and anyone who
         needs a nudge that is not a template. */
      { id: "messages",        label: "שליחה ידנית", icon: <Send size={20} />, href: "/admin/whatsapp" },
      /* The QR and upload links a couple puts on a table at the wedding. */
      { id: "messages",        label: "QR לאורחים",  icon: <QrCode size={20} />, href: "/admin/memory" },
      /* One tap per venue. A hall does 40-60 weddings a year and this page had
         no way in at all. */
      { id: "analytics",       label: "פנייה לאולמות", icon: <Building2 size={20} />, href: "/admin/venues-outreach" },
    ] },
    { title: "מעקב", items: [
      { id: "couple-view",   label: "מבט הזוג",     icon: <Eye size={20} /> },
      { id: "history",       label: "היסטוריה",     icon: <History size={20} /> },
      { id: "import-export", label: "ייבוא / ייצוא", icon: <Upload size={20} /> },
    ] },
    { title: "שירות", items: [
      { id: "service-center",  label: "מרכז שירות",  icon: <LifeBuoy size={20} /> },
      { id: "requests",        label: "בקשות זוג",   icon: <Inbox size={20} /> },
      { id: "design-requests", label: "בקשות עיצוב", icon: <Palette size={20} /> },
    ] },
  ];
  const links = [
    /* First, because it is the one screen that answers "what do I do now" and
       the others answer "what happened". */
    { href: "/admin/morning",     label: "הבוקר שלי",  icon: <Sunrise size={20} /> },
    { href: "/admin/crm",         label: "CRM לידים",  icon: <Users size={20} /> },
    { href: "/admin/seating",     label: "הושבה",      icon: <Armchair size={20} /> },
    { href: "/admin/automations", label: "אוטומציות",  icon: <Zap size={20} /> },
  ];

  return (
    <aside
      className="hidden md:flex fixed right-0 top-0 h-screen flex-col z-50"
      style={{ width: 260, background: SC.bg, boxShadow: "-4px 0 24px rgba(0,0,0,0.12)" }}
    >
      {/* Brand */}
      <div className="px-7 py-7 flex items-center gap-2 shrink-0">
        <span style={{ color: SC.gold, fontFamily: "Frank Ruhl Libre, serif", fontWeight: 700, fontSize: 24 }}>רגע לפני</span>
        <span style={{ color: SC.gold, fontSize: 18 }}>✦</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {groups.map((g) => (
          <div key={g.title} className="mb-6">
            <p className="px-4 mb-2" style={{ color: SC.textFaint, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>{g.title}</p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const active = !it.href && activeTab === it.id;
                return (
                  <button
                    key={it.href ?? it.id}
                    onClick={() => it.href ? (window.location.href = it.href) : setActiveTab(it.id)}
                    className="flex items-center gap-3 px-4 py-3 transition-all duration-200 text-right"
                    style={{
                      color:       active ? "#fff" : SC.textDim,
                      background:   active ? "rgba(255,255,255,0.10)" : "transparent",
                      borderRight: `4px solid ${active ? SC.gold : "transparent"}`,
                    }}
                  >
                    <span style={{ color: active ? SC.gold : "inherit", display: "flex" }}>{it.icon}</span>
                    <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 500 }}>{it.label}</span>
                    {!!it.badge && it.badge > 0 && (
                      <span className="mr-auto text-[12px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: SC.gold, color: SC.bg }}>{it.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mb-6">
          <p className="px-4 mb-2" style={{ color: SC.textFaint, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>כלים</p>
          <div className="flex flex-col gap-0.5">
            {links.map((l) => (
              <a key={l.href} href={l.href}
                className="flex items-center gap-3 px-4 py-3 transition-all duration-200 hover:bg-white/5"
                style={{ color: SC.textDim, borderRight: "4px solid transparent" }}>
                <span style={{ display: "flex" }}>{l.icon}</span>
                <span style={{ fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 500 }}>{l.label}</span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer CTA */}
      <div className="p-5 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <button
          onClick={onCreate}
          className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-90"
          style={{ border: `1px solid ${SC.gold}`, color: SC.gold, fontFamily: "Heebo, sans-serif", fontSize: 14, fontWeight: 600 }}
        >
          <Plus size={16} /> אירוע חדש
        </button>
      </div>
    </aside>
  );
}

/* ── Event Card (used in Command Center) ────────────── */
export function EventCard({ ev, approvalStatus, onSelect }: { ev: EventSummary; approvalStatus?: string; onSelect: () => void }) {
  const C = {
    ivory: "#FDFAF5", dark: "#1C1008", muted: "rgba(28,16,8,0.52)",
    gold: "#C5A46D", olive: "#6B7B5A", border: "rgba(197,164,109,0.22)",
  };
  const tierColor = ev.healthTier === "green" ? C.olive : ev.healthTier === "yellow" ? "#A07840" : "rgb(180,50,50)";
  const tierBg    = ev.healthTier === "green" ? "rgba(107,123,90,0.10)" : ev.healthTier === "yellow" ? "rgba(197,164,109,0.12)" : "rgba(200,50,50,0.08)";
  const statusColor = ev.status ? EVENT_STATUS_COLOR[ev.status as EventStatus] : "rgba(197,164,109,0.7)";
  const statusLabel = ev.status ? (EVENT_STATUS_LABEL[ev.status as EventStatus] ?? ev.status) : null;

  return (
    <div
      className="rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ background: C.ivory, border: `1px solid ${ev.needsAttention ? "rgba(200,60,60,0.30)" : C.border}` }}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Health badge */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: tierBg }}>
          <span className="text-sm font-bold" style={{ color: tierColor, fontFamily: "Frank Ruhl Libre, serif" }}>
            {ev.healthScore}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm" style={{ color: C.dark }}>{ev.name}</p>
            {ev.needsAttention && (
              <span className="text-[12px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: "rgba(200,60,60,0.10)", color: "rgb(180,60,60)" }}>
                דחוף
              </span>
            )}
            {statusLabel && (
              <span
                className="text-[12px] px-2 py-0.5 rounded-full font-semibold text-white"
                style={{ background: statusColor }}
              >
                {statusLabel}
              </span>
            )}
            {approvalStatus === "pending"           && <span className="text-[12px]">🟡</span>}
            {approvalStatus === "approved"          && <span className="text-[12px]">🟢</span>}
            {approvalStatus === "changes_requested" && <span className="text-[12px]">🔴</span>}
          </div>
          {ev.client_name && (
            <p className="text-[12px] mb-1" style={{ color: C.gold }}>לקוח: {ev.client_name}</p>
          )}
          <p className="text-xs mb-2" style={{ color: C.muted }}>
            {new Date(ev.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            {ev.daysUntilEvent > 0 ? ` · עוד ${ev.daysUntilEvent} ימים` : ev.daysUntilEvent === 0 ? " · היום!" : " · עבר"}
          </p>
          <div className="flex gap-4 text-xs flex-wrap" style={{ color: C.muted }}>
            <span>{ev.total} רשומות</span>
            <span style={{ color: C.olive }}>{ev.confirmed} אישרו</span>
            <span style={{ color: "#A07840" }}>{ev.pending} ממתינים</span>
            <span>{ev.responseRate}% מענה</span>
          </div>
        </div>
        <div className="text-left shrink-0">
          <p className="text-xs" style={{ color: C.muted }}>נוכחות צפויה</p>
          <p className="text-xl font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{ev.attendees}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ADMIN CALENDAR
══════════════════════════════════════════════════════ */
const MONTH_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const DAY_HE   = ["א","ב","ג","ד","ה","ו","ש"];

export function AdminCalendar({ events, onSelectEvent, selectedEventId }: {
  events: Event[];
  onSelectEvent: (id: string) => void;
  selectedEventId: string | null;
}) {
  const C2 = { gold:"#C5A46D", dark:"#1C1008", muted:"rgba(28,16,8,0.4)", ivory:"#FDFAF5", border:"rgba(197,164,109,0.22)", olive:"#6B7B5A" };
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map event dates to day numbers this month
  const eventsByDay: Record<number, Event[]> = {};
  events.forEach(ev => {
    const d = new Date(ev.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(ev);
    }
  });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Upcoming events list
  const upcoming = events
    .filter(ev => new Date(ev.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <div className="flex flex-col gap-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-2 rounded-xl" style={{ background: "rgba(197,164,109,0.1)", color: C2.gold }}>
          <ChevronRight size={18} />
        </button>
        <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", color: C2.dark, fontSize: 20, fontWeight: 700 }}>
          {MONTH_HE[month]} {year}
        </h2>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-2 rounded-xl" style={{ background: "rgba(197,164,109,0.1)", color: C2.gold }}>
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="grid md:grid-cols-[1fr_260px] gap-5">
        {/* Calendar grid */}
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C2.border}` }}>
          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ background: "rgba(197,164,109,0.08)" }}>
            {DAY_HE.map(d => (
              <div key={d} className="text-center py-2 text-xs font-bold" style={{ color: C2.gold }}>{d}</div>
            ))}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-7" style={{ background: C2.ivory }}>
            {cells.map((day, i) => {
              const evs = day ? (eventsByDay[day] ?? []) : [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={i} className="min-h-[70px] p-1.5 border-b border-r"
                  style={{ borderColor: "rgba(197,164,109,0.1)" }}>
                  {day && (
                    <>
                      <span className="text-xs font-medium flex items-center justify-center w-6 h-6 rounded-full mb-1"
                        style={{ background: isToday ? C2.gold : "transparent", color: isToday ? "white" : C2.muted }}>
                        {day}
                      </span>
                      {evs.map(ev => (
                        <button key={ev.id} onClick={() => onSelectEvent(ev.id)}
                          title={ev.name}
                          className="w-full text-right text-[12px] px-1.5 py-0.5 rounded-md mb-0.5 truncate"
                          style={{
                            background: ev.id === selectedEventId ? C2.gold : "rgba(197,164,109,0.15)",
                            color: ev.id === selectedEventId ? "white" : C2.dark,
                            fontFamily: "Heebo, sans-serif",
                          }}>
                          {ev.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming events sidebar */}
        <div className="rounded-2xl p-4" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
          <p className="text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: C2.gold }}>אירועים קרובים</p>
          {upcoming.length === 0 && <p className="text-xs" style={{ color: C2.muted }}>אין אירועים קרובים</p>}
          {upcoming.map(ev => {
            const d = new Date(ev.date);
            const daysLeft = Math.ceil((d.getTime() - today.getTime()) / 86_400_000);
            return (
              <button key={ev.id} onClick={() => onSelectEvent(ev.id)}
                className="w-full text-right mb-3 p-3 rounded-xl transition-all"
                style={{ background: ev.id === selectedEventId ? "rgba(197,164,109,0.12)" : "white", border: `1px solid ${ev.id === selectedEventId ? C2.gold : "rgba(197,164,109,0.15)"}` }}>
                <p className="text-sm font-bold truncate" style={{ color: C2.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{ev.name}</p>
                <p className="text-xs mt-0.5" style={{ color: C2.muted }}>
                  {d.toLocaleDateString("he-IL", { day:"numeric", month:"long" })}
                  <span className="mr-2" style={{ color: daysLeft <= 7 ? "rgb(200,60,60)" : daysLeft <= 30 ? "#A07840" : C2.olive }}>
                    · עוד {daysLeft} ימים
                  </span>
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ADMIN HISTORY
══════════════════════════════════════════════════════ */
interface ActivityLog { id: string; action: string; details: Record<string,unknown>; created_at: string }

const HISTORY_ACTION_LABEL: Record<string, { label: string; emoji: string }> = {
  guest_added:       { label: "אורח נוסף",          emoji: "➕" },
  guest_deleted:     { label: "אורח נמחק",           emoji: "🗑️" },
  status_changed:    { label: "סטטוס שונה",           emoji: "🔄" },
  invitation_sent:   { label: "הזמנה נשלחה",         emoji: "📩" },
  reminder_sent:     { label: "תזכורת נשלחה",        emoji: "🔔" },
  rsvp_confirmed:    { label: "אישור הגעה התקבל",    emoji: "✅" },
  rsvp_declined:     { label: "סירוב הגעה",           emoji: "❌" },
  table_created:     { label: "שולחן נוצר",           emoji: "🪑" },
  table_deleted:     { label: "שולחן נמחק",           emoji: "🗑️" },
  guest_assigned:    { label: "אורח הושב",            emoji: "🪑" },
  event_created:     { label: "אירוע נוצר",           emoji: "🎉" },
  budget_item_added: { label: "פריט תקציב נוסף",     emoji: "💰" },
};

export function AdminHistory({ eventId }: { eventId: string }) {
  const C2 = { gold:"#C5A46D", dark:"#1C1008", muted:"rgba(28,16,8,0.4)", ivory:"#FDFAF5", border:"rgba(197,164,109,0.22)", olive:"#6B7B5A" };
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/history/${eventId}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: C2.gold }} /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <p className="font-bold" style={{ color: C2.dark, fontFamily: "Frank Ruhl Libre, serif", fontSize: 17 }}>היסטוריית שינויים</p>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(197,164,109,0.12)", color: C2.gold }}>{logs.length} פעולות</span>
      </div>

      {logs.length === 0 && (
        <div className="rounded-2xl p-10 text-center" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
          <p style={{ color: C2.muted, fontFamily: "Heebo, sans-serif" }}>עדיין אין פעולות רשומות לאירוע זה</p>
          <p className="text-xs mt-1" style={{ color: C2.muted }}>פעולות חדשות יירשמו מעכשיו</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {logs.map((log, i) => {
          const meta = HISTORY_ACTION_LABEL[log.action] ?? { label: log.action, emoji: "•" };
          const date = new Date(log.created_at);
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-2xl"
              style={{ background: i % 2 === 0 ? C2.ivory : "white", border: `1px solid rgba(197,164,109,0.1)` }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ background: "rgba(197,164,109,0.12)" }}>
                {meta.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: C2.dark, fontFamily: "Heebo, sans-serif" }}>{meta.label}</p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: C2.muted }}>
                    {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                )}
              </div>
              <p className="text-[12px] shrink-0" style={{ color: C2.muted }}>
                {isToday ? "היום" : date.toLocaleDateString("he-IL", { day:"numeric", month:"short" })}
                {" "}
                {date.toLocaleTimeString("he-IL", { hour:"2-digit", minute:"2-digit" })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   COUPLE VIEW COMPONENT
══════════════════════════════════════════════════════ */
interface CoupleData {
  event: { id: string; name: string; date: string; address?: string | null };
  stats: { total: number; confirmed: number; declined: number; pending: number; attendees: number; responseRate: number };
  budget: { planned: number; actual: number; items: number };
  seating: { tables: number; assigned: number; total: number };
  tasks: { done: number; total: number };
  gifts: { total: number; count: number };
}

export function CoupleView({ token, eventName }: { token: string; eventName: string }) {
  const C2 = { gold: "#C5A46D", dark: "#1C1008", muted: "rgba(28,16,8,0.45)", ivory: "#FDFAF5", border: "rgba(197,164,109,0.22)", olive: "#6B7B5A", cream: "#F2EDE3" };
  const [data, setData]       = useState<CoupleData | null>(null);
  const [tasks, setTasks]     = useState<{ id: string; title: string; completed: boolean; category?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/couple/${token}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/couple/${token}/tasks`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([summary, taskList]) => {
      setData(summary);
      setTasks(Array.isArray(taskList) ? taskList : taskList?.tasks ?? []);
      setLoading(false);
    });
  }, [token]);

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 size={28} className="animate-spin" style={{ color: C2.gold }} />
    </div>
  );

  if (!data) return (
    <div className="rounded-2xl p-10 text-center" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
      <p style={{ color: C2.muted }}>לא ניתן לטעון נתוני זוג</p>
    </div>
  );

  const tasksDone    = data.tasks.done;
  const tasksTotal   = data.tasks.total;
  const tasksPct     = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
  const budgetUsedPct = data.budget.planned > 0 ? Math.round((data.budget.actual / data.budget.planned) * 100) : 0;
  const seatingPct   = data.seating.total > 0 ? Math.round((data.seating.assigned / data.seating.total) * 100) : 0;

  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 6);
  const doneTasks    = tasks.filter(t => t.completed).slice(0, 4);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: "rgba(197,164,109,0.06)", border: `1px solid rgba(197,164,109,0.18)` }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: "rgba(197,164,109,0.15)" }}>💑</div>
        <div>
          <p className="font-bold" style={{ color: C2.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{eventName}</p>
          <p className="text-xs" style={{ color: C2.muted }}>
            {new Date(data.event.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            {data.event.address ? ` · ${data.event.address}` : ""}
          </p>
        </div>
        <a href={`/couple/${token}`} target="_blank" rel="noopener noreferrer"
          className="mr-auto flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(197,164,109,0.1)", color: C2.gold }}>
          <ExternalLink size={12} /> כניסה לדשבורד
        </a>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "אורחים אישרו", value: data.stats.confirmed, sub: `מתוך ${data.stats.total}`, color: C2.olive },
          { label: "אחוז מענה", value: `${data.stats.responseRate}%`, sub: `${data.stats.pending} ממתינים`, color: C2.gold },
          { label: "תקציב בפועל", value: `₪${(data.budget.actual / 1000).toFixed(0)}K`, sub: `מתוך ₪${(data.budget.planned / 1000).toFixed(0)}K`, color: C2.gold },
          { label: "מתנות", value: `₪${data.gifts.total.toLocaleString()}`, sub: `${data.gifts.count} מתנות`, color: C2.olive },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
            <p className="text-xs mb-1" style={{ color: C2.muted }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color, fontFamily: "Frank Ruhl Libre, serif" }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: C2.muted }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          { label: "משימות הושלמו", pct: tasksPct, value: `${tasksDone}/${tasksTotal}`, color: C2.olive },
          { label: "תקציב נוצל", pct: budgetUsedPct, value: `${budgetUsedPct}%`, color: budgetUsedPct > 90 ? "rgb(200,80,80)" : C2.gold },
          { label: "אורחים הושבו", pct: seatingPct, value: `${data.seating.assigned}/${data.seating.total}`, color: C2.gold },
        ].map(({ label, pct, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-medium" style={{ color: C2.dark }}>{label}</p>
              <p className="text-xs font-bold" style={{ color }}>{value}</p>
            </div>
            <div className="h-2 rounded-full" style={{ background: "rgba(197,164,109,0.15)" }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Tasks breakdown */}
      {tasksTotal > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-4" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
            <p className="text-xs font-bold mb-3" style={{ color: C2.dark }}>⏳ משימות פתוחות ({tasks.filter(t => !t.completed).length})</p>
            {pendingTasks.length === 0
              ? <p className="text-xs" style={{ color: C2.muted }}>כל המשימות הושלמו 🎉</p>
              : pendingTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "rgba(197,164,109,0.1)" }}>
                  <div className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ borderColor: "rgba(197,164,109,0.4)" }} />
                  <p className="text-xs" style={{ color: C2.dark }}>{t.title}</p>
                </div>
              ))}
            {tasks.filter(t => !t.completed).length > 6 && (
              <p className="text-xs mt-2" style={{ color: C2.muted }}>+ {tasks.filter(t => !t.completed).length - 6} נוספות</p>
            )}
          </div>
          <div className="rounded-2xl p-4" style={{ background: C2.ivory, border: `1px solid ${C2.border}` }}>
            <p className="text-xs font-bold mb-3" style={{ color: C2.olive }}>✅ הושלמו לאחרונה ({tasks.filter(t => t.completed).length})</p>
            {doneTasks.length === 0
              ? <p className="text-xs" style={{ color: C2.muted }}>עדיין לא הושלמו משימות</p>
              : doneTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 py-1.5 border-b" style={{ borderColor: "rgba(197,164,109,0.1)" }}>
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(107,123,90,0.15)" }}>
                    <span style={{ fontSize: 8, color: C2.olive }}>✓</span>
                  </div>
                  <p className="text-xs line-through" style={{ color: C2.muted }}>{t.title}</p>
                </div>
              ))}
            {tasks.filter(t => t.completed).length > 4 && (
              <p className="text-xs mt-2" style={{ color: C2.muted }}>+ {tasks.filter(t => t.completed).length - 4} נוספות</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   THANK YOU SECTION
══════════════════════════════════════════════════════ */
export function ThankYouSection({ guests, eventName, eventId }: { guests: Guest[]; eventName: string; eventId: string }) {
  const C2 = { gold: "#C5A46D", dark: "#1C1008", muted: "rgba(28,16,8,0.45)", ivory: "#FDFAF5", border: "rgba(197,164,109,0.22)", olive: "#6B7B5A" };
  const [galleryUrl, setGalleryUrl] = useState("");
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setLoadingAlbum(true);
    fetch(`/api/admin/gallery/${eventId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.album?.public_token) {
          setGalleryUrl(`${window.location.origin}/gallery/${d.album.public_token}`);
        }
        setLoadingAlbum(false);
      })
      .catch(() => setLoadingAlbum(false));
  }, [eventId]);

  const guestsWithPhone = guests.filter(g => g.phone);

  function sendAll() {
    setSending(true);
    guestsWithPhone.forEach((g, i) => {
      setTimeout(() => {
        window.open(whatsappThankYouLink(g.phone, g.name, eventName, galleryUrl || null), "_blank");
      }, i * 600);
    });
    setTimeout(() => setSending(false), guestsWithPhone.length * 600 + 500);
  }

  return (
    <div className="mt-8 rounded-2xl p-5" style={{ background: "rgba(197,164,109,0.05)", border: "1px solid rgba(197,164,109,0.18)" }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <p className="font-bold text-sm" style={{ color: C2.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            💛 הודעות תודה לאחר האירוע
          </p>
          <p className="text-xs mt-0.5" style={{ color: C2.muted }}>
            שלחו הודעת תודה לכל האורחים עם קישור להעלאת תמונות
          </p>
        </div>
        <button
          onClick={sendAll}
          disabled={sending || guestsWithPhone.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E", opacity: sending ? 0.6 : 1 }}
        >
          <MessageCircle size={14} />
          {sending ? "שולח..." : `שלח לכולם (${guestsWithPhone.length})`}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="url"
          placeholder={loadingAlbum ? "טוען קישור גלריה..." : "קישור לגלריה / אלבום תמונות (אופציונלי)"}
          value={galleryUrl}
          onChange={e => setGalleryUrl(e.target.value)}
          className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
          style={{ background: "white", border: "1px solid rgba(197,164,109,0.28)", color: C2.dark, fontFamily: "Heebo, sans-serif", direction: "ltr", textAlign: "left" }}
        />
        {galleryUrl && (
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(107,123,90,0.1)", color: C2.olive }}>
            ✓ גלריה
          </span>
        )}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(197,164,109,0.15)", maxHeight: 220, overflowY: "auto" }}>
        {guestsWithPhone.map((g, i) => (
          <div key={g.id} className="flex items-center gap-3 px-3 py-2.5"
            style={{ background: i % 2 === 0 ? C2.ivory : "white", borderBottom: "1px solid rgba(197,164,109,0.08)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: C2.dark }}>{g.name}</p>
              <p className="text-[12px]" style={{ color: C2.muted }}>{g.phone}</p>
            </div>
            <a
              href={whatsappThankYouLink(g.phone, g.name, eventName, galleryUrl || null)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[12px] px-2.5 py-1.5 rounded-lg shrink-0"
              style={{ background: "rgba(37,211,102,0.10)", color: "#1A9B4E" }}
            >
              <MessageCircle size={10} /> שלח
            </a>
          </div>
        ))}
        {guestsWithPhone.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: C2.muted }}>אין אורחים עם מספר טלפון</p>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   REMINDER CENTER COMPONENT
══════════════════════════════════════════════════════ */
export function ReminderCenter({
  overview,
  onSelectEvent,
}: {
  overview: EventSummary[];
  onSelectEvent: (id: string) => void;
}) {
  const C = {
    ivory: "#FDFAF5", dark: "#1C1008", muted: "rgba(28,16,8,0.52)",
    gold: "#C5A46D", olive: "#6B7B5A", border: "rgba(197,164,109,0.22)",
  };

  const recs = generateReminderRecommendations(overview);

  const priorityStyle: Record<ReminderRecommendation["priority"], { bg: string; border: string; color: string; label: string }> = {
    high:   { bg: "rgba(200,60,60,0.07)",  border: "rgba(200,60,60,0.18)",  color: "rgb(180,60,60)",  label: "⚠ דחוף" },
    medium: { bg: "rgba(200,140,0,0.07)",  border: "rgba(200,140,0,0.18)",  color: "rgb(180,120,0)",  label: "⚡ מומלץ" },
    low:    { bg: "rgba(107,123,90,0.07)", border: "rgba(107,123,90,0.14)", color: C.olive,           label: "💡 לתשומת לב" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            מרכז המלצות
          </h2>
          <p className="text-sm" style={{ color: C.muted }}>
            פעולות מומלצות לניהול האירועים שלך
          </p>
        </div>
        {recs.length > 0 && (
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: "rgba(200,60,60,0.75)" }}
          >
            {recs.length} המלצות
          </span>
        )}
      </div>

      {recs.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: C.ivory, border: `1px solid ${C.border}` }}
        >
          <Bell size={36} className="mx-auto mb-3" style={{ color: C.olive }} />
          <p className="font-semibold mb-1" style={{ color: C.dark }}>אין המלצות כרגע 🎊</p>
          <p className="text-sm" style={{ color: C.muted }}>
            כל האירועים הפעילים בסטטוס טוב.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recs.map((rec, i) => {
            const style = priorityStyle[rec.priority];
            return (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: style.bg, border: `1px solid ${style.border}` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: style.border, color: style.color }}
                      >
                        {style.label}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                        {rec.eventName}
                      </span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: C.dark }}>
                      {rec.reason}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                      {rec.detail}
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-2xl font-bold" style={{ color: style.color, fontFamily: "Frank Ruhl Libre, serif" }}>
                      {rec.affectedCount}
                    </p>
                    <p className="text-[12px]" style={{ color: C.muted }}>
                      {rec.action === "send_reminders" || rec.action === "send_followup" ? "אורחים" : "אירועים"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: "rgba(0,0,0,0.06)", color: C.muted }}>
                    {ACTION_LABEL[rec.action]}
                  </span>
                  <span className="text-xs" style={{ color: C.muted }}>·</span>
                  <span className="text-xs" style={{ color: C.muted }}>
                    {rec.daysUntilEvent === 0 ? "היום" : `עוד ${rec.daysUntilEvent} ימים`}
                  </span>
                  <button
                    onClick={() => onSelectEvent(rec.eventId)}
                    className="mr-auto text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:opacity-80"
                    style={{ background: style.border, color: style.color }}
                  >
                    עבור לאירוע ←
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AdminAgenda — Today's Agenda Strip
══════════════════════════════════════════════════════ */
export function AdminAgenda({ events, onSelect }: { events: Event[]; onSelect: (id: string) => void }) {
  const [dismissed, setDismissed] = React.useState(false);
  const [dismissedReminders, setDismissedReminders] = React.useState<Set<string>>(new Set());
  if (events.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mapped = events
    .filter(e => e.date)
    .map(e => {
      const d = new Date(e.date + "T00:00:00");
      const diffDays = Math.round((d.getTime() - today.getTime()) / 86_400_000);
      return { ...e, diffDays };
    });

  // Action reminders: today's events + exactly-7-days events
  const todayEvents  = mapped.filter(e => e.diffDays === 0);
  const weekEvents   = mapped.filter(e => e.diffDays === 7);
  const actionReminders = [
    ...todayEvents.map(e => ({ ev: e, type: "today"  as const })),
    ...weekEvents.map(e =>  ({ ev: e, type: "week"   as const })),
  ].filter(r => !dismissedReminders.has(`${r.type}-${r.ev.id}`));

  const upcoming = mapped
    .filter(e => e.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 8);

  if (actionReminders.length === 0 && (dismissed || upcoming.length === 0)) return null;

  return (
    <div className="mb-5 flex flex-col gap-3">
      {/* ── Action reminders ── */}
      {actionReminders.map(({ ev, type }) => {
        const isToday = type === "today";
        const bg      = isToday ? "#FFF3CD" : "rgba(197,164,109,0.10)";
        const border  = isToday ? "#F5C842" : "rgba(197,164,109,0.30)";
        const icon    = isToday ? "🎊" : "🔔";
        const title   = isToday
          ? `ברכת יום האירוע — ${ev.name}`
          : `שבוע לאירוע — ${ev.name}`;
        const subtitle = isToday
          ? "שלח ברכה לזוג היום! זה הרגע הגדול שלהם 🤍"
          : "עוד 7 ימים לחתונה — כדאי לבדוק RSVP פתוחים ולסגור הושבה";
        const phone = (ev as Event & { client_phone?: string }).client_phone
          ?.replace(/\D/g, "").replace(/^0/, "972");
        const coupleToken = (ev as Event & { couple_token?: string }).couple_token;
        const dashUrl = coupleToken
          ? `https://regalifnei.vercel.app/couple/${coupleToken}`
          : null;
        const waText = isToday
          ? `🎊 היום זה הגדול!\n${ev.name} — ${new Date(ev.date + "T00:00:00").toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}\n\nמחכים לחגוג איתכם! 🤍\nכל הכבוד על ההכנות — הכל יהיה מושלם!`
          : `הי! 🌟\nעוד שבוע לחתונה של ${ev.name}!\nהמלצה: בדקו שכל האורחים אישרו, וסיימו את סידורי ההושבה.${dashUrl ? `\n\nדשבורד: ${dashUrl}` : ""}`;
        const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(waText)}` : null;

        return (
          <div key={`${type}-${ev.id}`} className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: bg, border: `1px solid ${border}` }}>
            <span className="text-2xl mt-0.5">{icon}</span>
            <div className="flex-1 text-right">
              <p className="text-sm font-bold" style={{ color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif" }}>{title}</p>
              <p className="text-xs mt-0.5 mb-3" style={{ color: "rgba(28,16,8,0.6)", fontFamily: "Heebo, sans-serif" }}>{subtitle}</p>
              <div className="flex gap-2 justify-end flex-wrap">
                <button onClick={() => onSelect(ev.id)}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium"
                  style={{ background: "rgba(28,16,8,0.08)", color: "#1C1008", fontFamily: "Heebo, sans-serif" }}>
                  פתח דשבורד
                </button>
                {waUrl && (
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                    style={{ background: "#25D366", color: "white", textDecoration: "none", fontFamily: "Heebo, sans-serif" }}>
                    📱 שלח WhatsApp
                  </a>
                )}
                <button onClick={() => setDismissedReminders(p => new Set([...p, `${type}-${ev.id}`]))}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium"
                  style={{ background: "rgba(28,16,8,0.05)", color: "rgba(28,16,8,0.4)", fontFamily: "Heebo, sans-serif" }}>
                  סגור
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Upcoming events strip ── */}
      {!dismissed && upcoming.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(197,164,109,0.07)", border: "1px solid rgba(197,164,109,0.2)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold" style={{ color: "#6B7B5A", fontFamily: "Heebo, sans-serif" }}>
              📅 סדר היום — אירועים קרובים
            </p>
            <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(28,16,8,0.3)", fontSize: 16 }}>×</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {upcoming.map(ev => {
              const isToday = ev.diffDays === 0;
              const isTomorrow = ev.diffDays === 1;
              const isThisWeek = ev.diffDays <= 7;
              const badgeColor = isToday ? "#A32D2D" : isThisWeek ? "#854F0B" : "#3B6D11";
              const badgeBg = isToday ? "#FCEBEB" : isThisWeek ? "#FAEEDA" : "#EAF3DE";
              const label = isToday ? "היום!" : isTomorrow ? "מחר" : `בעוד ${ev.diffDays} ימים`;
              return (
                <button key={ev.id} onClick={() => onSelect(ev.id)}
                  className="flex-shrink-0 rounded-xl p-3 text-right transition-all hover:scale-105"
                  style={{ background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.25)", minWidth: 160, cursor: "pointer" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-bold px-2 py-0.5 rounded-full" style={{ background: badgeBg, color: badgeColor }}>{label}</span>
                  </div>
                  <p className="text-xs font-semibold truncate" style={{ color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif", maxWidth: 140 }}>{ev.name}</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "rgba(28,16,8,0.45)", fontFamily: "Heebo, sans-serif" }}>
                    {new Date(ev.date + "T00:00:00").toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AdminAnalytics — Guest analytics dashboard
══════════════════════════════════════════════════════ */
export function AdminAnalytics({ guests, events, selectedEventId }: { guests: Guest[]; events: Event[]; selectedEventId: string | null }) {
  const HEEBO = { fontFamily: "Heebo, sans-serif" };
  const FRANK = { fontFamily: "Frank Ruhl Libre, serif" };
  const GOLD = "#C5A46D";
  const DARK = "#1C1008";
  const CARD = { background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)", borderRadius: 16, padding: "1.25rem" };

  if (!selectedEventId) {
    return (
      <div className="rounded-2xl p-10 text-center" style={CARD}>
        <p style={{ color: "rgba(51,51,51,0.4)", ...HEEBO }}>בחר אירוע כדי לראות אנליטיקה</p>
      </div>
    );
  }

  const total = guests.length;
  const opened = guests.filter(g => g.opened_at).length;
  const responded = guests.filter(g => g.status !== "pending").length;
  const confirmed = guests.filter(g => g.status === "confirmed").length;
  const openRate = total > 0 ? Math.round((opened / total) * 100) : 0;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const confirmRate = responded > 0 ? Math.round((confirmed / responded) * 100) : 0;

  // Average response time (hours from created_at to response_time)
  const responseTimes = guests
    .filter(g => g.response_time && g.created_at)
    .map(g => (new Date(g.response_time!).getTime() - new Date(g.created_at).getTime()) / 3_600_000);
  const avgResponseHours = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  // Opening times by hour of day
  const hourBuckets: number[] = Array(24).fill(0);
  guests.forEach(g => {
    if (g.opened_at) {
      const h = new Date(g.opened_at).getHours();
      hourBuckets[h]++;
    }
  });
  const maxHourCount = Math.max(...hourBuckets, 1);
  const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));

  // Response by day of week
  const dayLabels = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const dayBuckets: number[] = Array(7).fill(0);
  guests.forEach(g => {
    if (g.response_time) {
      const d = new Date(g.response_time).getDay();
      dayBuckets[d]++;
    }
  });
  const maxDayCount = Math.max(...dayBuckets, 1);

  const StatCard = ({ label, value, sub, color = GOLD }: { label: string; value: string; sub?: string; color?: string }) => (
    <div style={{ ...CARD, textAlign: "center" }}>
      <p style={{ fontSize: 12, color: "rgba(28,16,8,0.45)", marginBottom: 6, ...HEEBO }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color, ...FRANK }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "rgba(28,16,8,0.4)", marginTop: 4, ...HEEBO }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <StatCard label="פתחו קישור" value={`${openRate}%`} sub={`${opened} מתוך ${total}`} />
        <StatCard label="ענו על RSVP" value={`${responseRate}%`} sub={`${responded} מתוך ${total}`} color="#6B7B5A" />
        <StatCard label="אישרו הגעה" value={`${confirmRate}%`} sub={`מתוך שענו`} color="#3B6D11" />
        <StatCard label="זמן תגובה ממוצע" value={avgResponseHours !== null ? `${avgResponseHours}ש'` : "—"} sub="מקבלת הזמנה" color="#854F0B" />
      </div>

      {/* Opening hours chart */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: DARK, ...HEEBO }}>שעות פתיחת הזמנה</p>
        <p style={{ fontSize: 12, color: "rgba(28,16,8,0.4)", marginBottom: 16, ...HEEBO }}>
          שיא פתיחות: {String(peakHour).padStart(2, "0")}:00 ({hourBuckets[peakHour]} פתיחות)
        </p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 80 }}>
          {hourBuckets.map((count, h) => (
            <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{
                width: "100%", borderRadius: 4,
                height: `${Math.max(4, (count / maxHourCount) * 72)}px`,
                background: h === peakHour ? GOLD : `${GOLD}44`,
                transition: "height 0.3s ease",
              }} />
              {(h % 4 === 0) && <span style={{ fontSize: 8, color: "rgba(28,16,8,0.35)", ...HEEBO }}>{h}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Response by day of week */}
      <div style={CARD}>
        <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: DARK, ...HEEBO }}>מענה לפי יום בשבוע</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dayLabels.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, minWidth: 48, color: "rgba(28,16,8,0.55)", ...HEEBO }}>{label}</span>
              <div style={{ flex: 1, height: 16, background: "rgba(197,164,109,0.1)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(dayBuckets[i] / maxDayCount) * 100}%`, background: `linear-gradient(90deg,${GOLD},${GOLD}88)`, borderRadius: 8, transition: "width 0.4s ease" }} />
              </div>
              <span style={{ fontSize: 12, minWidth: 20, color: "rgba(28,16,8,0.4)", textAlign: "left", ...HEEBO }}>{dayBuckets[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Response time histogram */}
      {responseTimes.length > 0 && (
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: DARK, ...HEEBO }}>התפלגות זמני תגובה</p>
          <p style={{ fontSize: 12, color: "rgba(28,16,8,0.4)", marginBottom: 16, ...HEEBO }}>
            {responseTimes.filter(t => t <= 2).length} ענו תוך שעתיים · {responseTimes.filter(t => t > 2 && t <= 24).length} ענו תוך יום · {responseTimes.filter(t => t > 24).length} ענו אחרי יום+
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "< 2 שעות", count: responseTimes.filter(t => t <= 2).length, color: "#3B6D11" },
              { label: "2–24 שעות", count: responseTimes.filter(t => t > 2 && t <= 24).length, color: GOLD },
              { label: "> 24 שעות", count: responseTimes.filter(t => t > 24).length, color: "#854F0B" },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ textAlign: "center", padding: "0.75rem", background: `${color}0d`, borderRadius: 12, border: `1px solid ${color}33` }}>
                <p style={{ fontSize: 20, fontWeight: 700, color, ...FRANK }}>{count}</p>
                <p style={{ fontSize: 12, color, marginTop: 4, ...HEEBO }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Service Center Admin ────────────────────────── */
const DEFAULT_STEPS = [
  { id: "1", title: "קיבלנו את הפרטים שלכם", description: "הכרטיס נקלט במערכת", icon: "📋", status: "pending" },
  { id: "2", title: "שיחת היכרות", description: "שיחה ראשונה להכרת החזון שלכם", icon: "📞", status: "pending" },
  { id: "3", title: "בניית תוכנית עבודה", description: "מפת דרכים אישית לחתונה שלכם", icon: "🗺️", status: "pending" },
  { id: "4", title: "ליווי שוטף", description: "אנחנו איתכם לאורך כל הדרך", icon: "🤝", status: "pending" },
  { id: "5", title: "בדיקות לפני האירוע", description: "סיכום סופי ואישור כל הפרטים", icon: "✅", status: "pending" },
  { id: "6", title: "יום האירוע", description: "ביום עצמו אנחנו זמינים עבורכם", icon: "🎊", status: "pending" },
];

export function ServiceCenterAdmin({ selectedEventId, events }: { selectedEventId: string | null; events: Array<{ id: string; name: string }> }) {
  const [steps, setSteps] = useState<Array<{ id: string; title: string; description?: string; icon?: string; status: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedEventId) return;
    fetch(`/api/events/${selectedEventId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.service_steps && d.service_steps.length > 0) setSteps(d.service_steps);
        else setSteps(DEFAULT_STEPS.map(s => ({ ...s })));
      });
  }, [selectedEventId]);

  const save = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    await fetch(`/api/events/${selectedEventId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_steps: steps }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!selectedEventId) {
    return <p style={{ textAlign: "center", color: "rgba(28,16,8,0.45)", padding: "3rem" }}>בחרו אירוע כדי לנהל את מרכז השירות.</p>;
  }

  const eventName = events.find(e => e.id === selectedEventId)?.name ?? "";

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: "#1C1008", margin: 0 }}>🛎 מרכז שירות</h2>
          <p style={{ fontSize: 13, color: "rgba(28,16,8,0.5)", margin: 0 }}>{eventName}</p>
        </div>
        <button onClick={save} disabled={saving}
          style={{ background: "#C5A46D", color: "white", border: "none", borderRadius: 12, padding: "0.6rem 1.25rem", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
          {saved ? "✓ נשמר" : saving ? "שומר..." : "שמור"}
        </button>
      </div>

      <p style={{ fontSize: 13, color: "rgba(28,16,8,0.5)", marginBottom: "1.25rem" }}>
        סמנו אילו שלבים הושלמו — הזוג יראה את ההתקדמות בזמן אמת.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {steps.map((step, i) => (
          <div key={step.id} style={{ background: "#FDFAF5", borderRadius: 14, padding: "1rem", border: `1px solid rgba(197,164,109,0.2)`, display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{step.icon ?? "⬡"}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "#1C1008", fontSize: 14 }}>{step.title}</p>
              {step.description && <p style={{ fontSize: 12, color: "rgba(28,16,8,0.5)" }}>{step.description}</p>}
            </div>
            <select
              value={step.status}
              onChange={e => setSteps(prev => prev.map((s, j) => j === i ? { ...s, status: e.target.value } : s))}
              style={{ border: "1px solid rgba(197,164,109,0.3)", borderRadius: 8, padding: "0.4rem 0.6rem", fontSize: 13, fontFamily: "Heebo, sans-serif", background: "white", color: "#1C1008", outline: "none" }}
            >
              <option value="pending">ממתין</option>
              <option value="in_progress">בתהליך</option>
              <option value="done">הושלם ✓</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Admin Requests Tab ───────────────────────────────────── */
export function AdminRequestsTab({ selectedEventId }: { selectedEventId: string | null }) {
  const [requests, setRequests] = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setLoading(true);
    const url = selectedEventId ? `/api/admin/requests?event_id=${selectedEventId}` : "/api/admin/requests";
    fetch(url, { headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" } })
      .then(r => r.json())
      .then(d => Array.isArray(d) && setRequests(d))
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  const STATUS_OPTIONS = [
    { value: "new", label: "נשלחה" },
    { value: "in_progress", label: "בטיפול" },
    { value: "resolved", label: "טופלה" },
    { value: "closed", label: "נסגרה" },
  ];

  async function update(id: string, status: string) {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" },
      body: JSON.stringify({ id, status, admin_note: note[id] }),
    });
    const url = selectedEventId ? `/api/admin/requests?event_id=${selectedEventId}` : "/api/admin/requests";
    const r = await fetch(url, { headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" } });
    const d = await r.json();
    if (Array.isArray(d)) setRequests(d);
  }

  const C = { gold: "#C5A46D", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "rgba(197,164,109,0.20)", card: "#FFFFFF", ivory: "#FDFAF5" };

  return (
    <div dir="rtl" style={{ padding: "1.5rem 1rem" }}>
      <h2 style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: C.dark, marginBottom: "1rem" }}>📬 בקשות הזוגות</h2>
      {loading ? <p style={{ color: C.muted }}>טוען...</p> : requests.length === 0 ? <p style={{ color: C.muted }}>אין בקשות</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map((req: Record<string, unknown>) => (
            <div key={req.id as string} style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <p style={{ fontWeight: 700, color: C.dark, fontSize: 15 }}>{req.title as string}</p>
                  <p style={{ fontSize: 12, color: C.muted }}>{(req.events as Record<string, string>)?.name ?? ""} · {req.category as string} · {new Date(req.created_at as string).toLocaleDateString("he-IL")}</p>
                </div>
                <select
                  value={req.status as string}
                  onChange={e => update(req.id as string, e.target.value)}
                  style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "0.35rem 0.6rem", fontSize: 12, fontFamily: "Heebo, sans-serif", background: C.ivory, outline: "none" }}
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {req.description ? <p style={{ fontSize: 13, color: C.muted, marginBottom: "0.65rem" }}>{String(req.description)}</p> : null}
              <textarea
                placeholder="תגובה לזוג (תוצג להם)"
                value={note[req.id as string] ?? (req.admin_note as string) ?? ""}
                onChange={e => setNote(p => ({ ...p, [req.id as string]: e.target.value }))}
                rows={2}
                style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "Heebo, sans-serif", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: "0.5rem" }}
              />
              <button onClick={() => update(req.id as string, req.status as string)}
                style={{ padding: "0.45rem 1rem", borderRadius: 8, background: C.gold, border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                שמור
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Admin Messages Tab (WhatsApp Center Pro) ──────────── */
export function DesignRequestsTab() {
  const Cd = { gold: "#C5A46D", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "rgba(197,164,109,0.20)", ivory: "#FDFAF5" };
  const [requests, setRequests] = React.useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/design-requests", { headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" } })
      .then(r => r.json())
      .then(d => { if (d.requests) setRequests(d.requests); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: "2rem", color: Cd.muted, textAlign: "center" }}>טוען...</div>;

  return (
    <div style={{ padding: "1.5rem 1rem" }}>
      <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 20, fontWeight: 700, color: Cd.dark, marginBottom: "1rem" }}>
        ✨ בקשות עיצוב הזמנה
      </p>
      {requests.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: Cd.muted, fontSize: 14 }}>
          אין בקשות עדיין
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map((req, i) => (
            <div key={String(req.id ?? i)} style={{ background: "#FFFFFF", border: `1px solid ${Cd.border}`, borderRadius: "1rem", padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: Cd.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                    {String(req.invitation_name ?? "")}
                  </p>
                  <p style={{ fontSize: 12, color: Cd.muted, marginTop: 2 }}>{String(req.name ?? "—")} · {String(req.phone ?? "")}</p>
                </div>
                <span style={{ fontSize: 12, background: "rgba(197,164,109,0.12)", color: Cd.gold, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                  {String(req.status ?? "new")}
                </span>
              </div>
              {req.message != null && (
                <p style={{ fontSize: 12, color: Cd.muted, fontStyle: "italic", lineHeight: 1.6 }}>{String(req.message)}</p>
              )}
              <p style={{ fontSize: 12, color: "rgba(28,16,8,0.30)", marginTop: 6 }}>
                {new Date(String(req.created_at ?? "")).toLocaleDateString("he-IL")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminMessagesTab({ selectedEventId, events }: { selectedEventId: string | null; events: { id: string; name: string }[] }) {
  const C = { gold: "#C5A46D", dark: "#1C1008", muted: "rgba(28,16,8,0.55)", border: "rgba(197,164,109,0.20)", card: "#FFFFFF", ivory: "#FDFAF5", cream: "#F6F1E8" };

  const TEMPLATES = [
    { key: "invite",    label: "💍 הזמנה ל-RSVP",    text: "💍 משפחה וחברים יקרים!\n\nאנחנו שמחים להזמין אתכם לחתונה שלנו 🎊\nנשמח מאוד לראות אתכם!\n\nלאישור הגעה:\n" },
    { key: "reminder",  label: "⏰ תזכורת לאישור",    text: "💍 משפחה וחברים יקרים!\n\nעדיין לא קיבלנו ממכם אישור הגעה 🙏\nנשמח אם תאשרו מוקדם ככל האפשר:\n" },
    { key: "seating",   label: "🪑 שובצתם לשולחן",   text: "💍 משפחה וחברים יקרים!\n\nשמחים לעדכן שמקומכם מוכן ✨\nנתראה בקרוב!\n" },
    { key: "thanks",    label: "❤️ תודה שבאתם",       text: "💍 משפחה וחברים יקרים!\n\nתודה על שהיותכם חלק מהיום המיוחד שלנו ❤️\nאתם תמיד בלבנו!\n" },
    { key: "photos",    label: "📸 העלו תמונות",       text: "💍 משפחה וחברים יקרים!\n\nהעלו את התמונות שלכם מהחתונה ויחד נבנה גלריה משפחתית 📸\n" },
    { key: "custom",    label: "✏️ הודעה מותאמת",     text: "💍 משפחה וחברים יקרים!\n\n" },
  ];

  type Stage = "templates" | "preview" | "audience" | "queue" | "send";

  const [stage, setStage] = React.useState<Stage>("templates");
  const [selectedTemplate, setSelectedTemplate] = React.useState(TEMPLATES[0]);
  const [customText, setCustomText] = React.useState(TEMPLATES[0].text);
  const [audience, setAudience] = React.useState<"all"|"bride"|"groom"|"pending"|"vip">("all");
  const [queue, setQueue] = React.useState<Record<string, unknown>[]>([]);
  const [guests, setGuests] = React.useState<{ id: string; name: string; phone: string; status: string; side?: string; is_vip?: boolean }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [queueing, setQueueing] = React.useState(false);

  React.useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/message-queue?event_id=${selectedEventId}`, { headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" } }).then(r => r.json()),
      fetch(`/api/guests?event_id=${selectedEventId}`, { headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" } }).then(r => r.json()),
    ]).then(([q, g]) => {
      if (Array.isArray(q)) setQueue(q);
      if (Array.isArray(g)) setGuests(g);
    }).finally(() => setLoading(false));
  }, [selectedEventId]);

  function getFilteredGuests() {
    return guests.filter(g => {
      if (!g.phone) return false;
      if (audience === "bride") return g.side === "bride";
      if (audience === "groom") return g.side === "groom";
      if (audience === "pending") return g.status === "pending";
      if (audience === "vip") return g.is_vip;
      return true;
    });
  }

  async function addToQueue() {
    if (!selectedEventId) return;
    const filtered = getFilteredGuests();
    if (filtered.length === 0) return;
    setQueueing(true);
    const messages = filtered.map(g => ({
      guest_id: g.id,
      phone: g.phone,
      message_text: customText,
      template_key: selectedTemplate.key,
    }));
    /* The response was thrown away, which mattered the moment the server
       started refusing anything: a rejected batch left the queue empty, the
       screen advanced to "send" anyway, and it looked exactly like a batch
       that had gone through and had nothing in it. */
    const res = await fetch("/api/admin/message-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" },
      body: JSON.stringify({ event_id: selectedEventId, messages }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "לא הצלחנו להכניס את ההודעות לתור");
      setQueueing(false);
      return;
    }
    const q = await fetch(`/api/admin/message-queue?event_id=${selectedEventId}`, { headers: { "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" } }).then(r => r.json());
    if (Array.isArray(q)) setQueue(q);
    setQueueing(false);
    setStage("send");
  }

  async function markSent(id: string) {
    await fetch("/api/admin/message-queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-token": process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? "" },
      body: JSON.stringify({ id, status: "sent" }),
    });
    setQueue(prev => prev.map(m => m.id === id ? { ...m, status: "sent", sent_at: new Date().toISOString() } : m));
  }

  const pending = queue.filter(m => m.status === "pending");
  const sent    = queue.filter(m => m.status === "sent");
  const STAGES: { key: Stage; label: string }[] = [
    { key: "templates", label: "1 · תבנית" },
    { key: "preview",   label: "2 · תצוגה" },
    { key: "audience",  label: "3 · קהל" },
    { key: "queue",     label: "4 · תור" },
    { key: "send",      label: "5 · שליחה" },
  ];

  if (!selectedEventId) return <p style={{ color: C.muted, padding: "2rem", textAlign: "center" }}>בחרו אירוע תחילה</p>;

  const stageOrder: Stage[] = ["templates","preview","audience","queue","send"];
  const currentIdx = stageOrder.indexOf(stage);
  const OLIVE = "#6B7B5A";

  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo',sans-serif" }}>
      {/* ── E4-S2: Step Indicator (spec: gold circle active, olive checkmark completed, dashed connector) ── */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
        {STAGES.map((s, i) => {
          const isActive    = stage === s.key;
          const isCompleted = currentIdx > i;
          return (
            <React.Fragment key={s.key}>
              <button onClick={() => setStage(s.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isCompleted ? OLIVE : isActive ? C.gold : "transparent",
                  border: `2px solid ${isCompleted ? OLIVE : isActive ? C.gold : C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  {isCompleted
                    ? <span style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>✓</span>
                    : <span style={{ color: isActive ? "#fff" : C.muted, fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                  }
                </div>
                <span style={{ fontSize: 12, color: isActive ? C.gold : isCompleted ? OLIVE : C.muted, whiteSpace: "nowrap", fontWeight: isActive ? 700 : 400 }}>
                  {s.label.replace(/^\d+ · /, "")}
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <div style={{ flex: 1, height: 0, minWidth: 16, borderTop: `2px dashed ${currentIdx > i ? OLIVE : C.border}`, margin: "0 4px", marginBottom: 18 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ← חזרה back nav */}
      {currentIdx > 0 && (
        <button onClick={() => setStage(stageOrder[currentIdx - 1])}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.muted, fontFamily: "Heebo, sans-serif", fontSize: 13, marginBottom: "1rem", padding: 0 }}>
          <span style={{ fontSize: 16 }}>←</span>
          <span>חזרה</span>
        </button>
      )}

      {/* Stage 1 — Templates */}
      {stage === "templates" && (
        <div>
          <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: "1rem", fontSize: 16 }}>בחרו תבנית הודעה</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.75rem" }}>
            {TEMPLATES.map(t => (
              <button key={t.key} onClick={() => { setSelectedTemplate(t); setCustomText(t.text); setStage("preview"); }}
                style={{ padding: "1rem", borderRadius: 12, textAlign: "right", cursor: "pointer",
                         border: `1.5px solid ${selectedTemplate.key === t.key ? C.gold : C.border}`,
                         background: selectedTemplate.key === t.key ? "rgba(197,164,109,0.08)" : C.card,
                         fontFamily: "inherit" }}>
                <div style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.text.slice(0, 50)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage 2 — Preview (phone mockup) */}
      {stage === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: 280, background: "#111", borderRadius: 36, padding: "1.5rem 0.75rem", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ background: "#E5DDD5", borderRadius: 24, minHeight: 360, padding: "1rem", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ background: "#DCF8C6", borderRadius: "12px 12px 0 12px", padding: "0.75rem 0.85rem", maxWidth: "85%", alignSelf: "flex-end", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
                <p style={{ margin: 0, fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.5, color: "#111", fontFamily: "Heebo, sans-serif" }}>{customText}</p>
                <p style={{ margin: "0.35rem 0 0", fontSize: 12, color: "#888", textAlign: "right" }}>עכשיו ✓✓</p>
              </div>
            </div>
          </div>
          <div style={{ width: "100%", maxWidth: 480 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: "0.4rem", display: "block" }}>ערכו את ההודעה</label>
            <textarea value={customText} onChange={e => setCustomText(e.target.value)} rows={6}
              style={{ width: "100%", padding: "0.75rem", borderRadius: 10, border: `1.5px solid ${C.border}`,
                       fontSize: 14, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            {customText.trim().match(/^[א-ת]/) && !customText.startsWith("💍") && (
              <p style={{ color: "#d97706", fontSize: 12, marginTop: "0.25rem" }}>⚠️ ההודעה חייבת להתחיל עם 💍 — לא עם שם אישי</p>
            )}
            <button onClick={() => setStage("audience")} style={{ marginTop: "0.75rem", background: C.gold, color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
              המשך →
            </button>
          </div>
        </div>
      )}

      {/* Stage 3 — Audience */}
      {stage === "audience" && (
        <div>
          <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: "1rem", fontSize: 16 }}>בחרו קהל יעד</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {([["all","כולם"],["bride","צד כלה"],["groom","צד חתן"],["pending","לא ענו"],["vip","VIP"]] as const).map(([val, label]) => (
              <button key={val} onClick={() => setAudience(val as typeof audience)}
                style={{ padding: "0.45rem 1rem", borderRadius: 999, fontSize: 13, cursor: "pointer",
                         border: `1.5px solid ${audience === val ? C.gold : C.border}`,
                         background: audience === val ? C.gold : "transparent",
                         color: audience === val ? "#fff" : C.muted,
                         fontWeight: audience === val ? 700 : 400, fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ background: C.cream, borderRadius: 10, padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ margin: 0, fontWeight: 600, color: C.dark }}>
              {getFilteredGuests().length} אורחים עם טלפון יקבלו את ההודעה
            </p>
          </div>
          <button onClick={() => setStage("queue")} style={{ background: C.gold, color: "#fff", border: "none", borderRadius: 10, padding: "0.65rem 1.5rem", fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
            המשך →
          </button>
        </div>
      )}

      {/* Stage 4 — Queue */}
      {stage === "queue" && (
        <div>
          <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: "0.5rem", fontSize: 16 }}>אישור ושליחה לתור</h3>
          <div style={{ background: C.cream, borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem" }}>
            <p style={{ margin: "0 0 0.35rem", fontWeight: 700, color: C.dark }}>תבנית: {selectedTemplate.label}</p>
            <p style={{ margin: "0 0 0.35rem", color: C.muted, fontSize: 13 }}>קהל: {getFilteredGuests().length} אורחים</p>
            <p style={{ margin: 0, color: C.muted, fontSize: 12, whiteSpace: "pre-wrap", fontStyle: "italic" }}>{customText.slice(0, 120)}{customText.length > 120 ? "..." : ""}</p>
          </div>
          <button onClick={addToQueue} disabled={queueing || getFilteredGuests().length === 0}
            style={{ background: C.gold, color: "#fff", border: "none", borderRadius: 10, padding: "0.75rem 2rem",
                     fontWeight: 700, cursor: queueing ? "wait" : "pointer", fontSize: 15, fontFamily: "inherit",
                     opacity: getFilteredGuests().length === 0 ? 0.5 : 1 }}>
            {queueing ? "מוסיף לתור..." : `הוסף ${getFilteredGuests().length} אורחים לתור`}
          </button>
        </div>
      )}

      {/* Stage 5 — Send */}
      {stage === "send" && (
        <div>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {[["ממתין",pending.length,"#d97706"],["נשלח",sent.length,"#16a34a"]].map(([label, count, color]) => (
              <div key={label as string} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.75rem 1.25rem", minWidth: 100 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: color as string }}>{count as number}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{label}</div>
              </div>
            ))}
          </div>

          {loading && <p style={{ color: C.muted }}>טוען...</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {pending.slice(0, 50).map(m => {
              const guest = guests.find(g => g.id === m.guest_id);
              const waLink = m.wa_link as string;
              return (
                <div key={m.id as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem",
                                                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "0.6rem 0.85rem" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.dark }}>{guest?.name ?? m.phone as string}</p>
                    <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{m.phone as string}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <a href={waLink} target="_blank" rel="noreferrer"
                       style={{ background: "#25D366", color: "#fff", textDecoration: "none", borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: 12, fontWeight: 600 }}>
                      📱 שלח
                    </a>
                    <button onClick={() => markSent(m.id as string)}
                      style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: 12, cursor: "pointer", color: C.muted, fontFamily: "inherit" }}>
                      ✓
                    </button>
                  </div>
                </div>
              );
            })}
            {pending.length === 0 && <p style={{ color: C.muted, textAlign: "center", padding: "2rem" }}>אין הודעות ממתינות ✓</p>}
          </div>
        </div>
      )}
    </div>
  );
}
