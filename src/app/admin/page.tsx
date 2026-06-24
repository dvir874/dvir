"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Users, CheckCircle, Clock, XCircle, Search, Upload, Download,
  Trash2, Copy, MessageCircle, ChevronLeft, ChevronRight,
  Loader2, Plus, ExternalLink, RefreshCw, Percent, Zap,
  Send, AlertTriangle, Bell, Wand2, Palette,
} from "lucide-react";
import type { Event, EventSummary, Forecast, Guest, GuestEvent, GuestStatus, HealthScore, EventStatus, ApprovalRequest } from "@/lib/types";
import { EVENT_STATUS_LABEL, EVENT_STATUS_COLOR } from "@/lib/types";
import { generateReminderRecommendations } from "@/lib/reminder-recommendations";
import type { ReminderRecommendation } from "@/lib/reminder-recommendations";
import { ACTION_LABEL } from "@/lib/reminder-recommendations";
import { whatsappReminderLink, whatsappInviteLink, whatsappThankYouLink } from "@/lib/phone";
import { generateTasks } from "@/lib/automation/task-engine";
import type { Task }     from "@/lib/automation/task-engine";
import { THEME_LIST, DEFAULT_THEME_ID } from "@/lib/themes";
import type { ThemeId }  from "@/lib/themes";
import ChatWidget from "@/components/ChatWidget";

/* ── Insights engine (deterministic, AI-upgradeable) ── *
 *
 * Architecture note:
 * generateInsights() returns InsightItem[] sorted by priority.
 * To integrate a real AI model later, replace or augment this
 * function — the caller (JSX) already handles the array shape.
 */
interface InsightItem {
  text: string;
  priority: "high" | "medium" | "low";
  type: "action" | "info" | "warning" | "positive";
}

function generateInsights(
  guests: Guest[],
  eventName: string,
  eventDate?: string | null,
): InsightItem[] {
  if (guests.length === 0) return [];

  const now        = Date.now();
  const total      = guests.length;
  const confirmed  = guests.filter((g) => g.status === "confirmed").length;
  const pending    = guests.filter((g) => g.status === "pending").length;
  const declined   = guests.filter((g) => g.status === "declined").length;
  const attendees  = guests.filter((g) => g.status === "confirmed").reduce((s, g) => s + g.guest_count, 0);
  const responders = confirmed + declined;
  const rate       = Math.round((responders / total) * 100);
  const opened     = guests.filter((g) => g.opened_at).length;

  const items: InsightItem[] = [];

  // ── Days until event ────────────────────────────────
  const daysLeft = eventDate
    ? Math.ceil((new Date(eventDate).getTime() - now) / 86_400_000)
    : null;

  // ── Trend: response rate this week vs. last week ────
  const weekAgo    = now - 7 * 86_400_000;
  const twoWeeksAgo = now - 14 * 86_400_000;
  const thisWeekResponses = guests.filter(
    (g) => g.response_time && new Date(g.response_time).getTime() > weekAgo
  ).length;
  const lastWeekResponses = guests.filter(
    (g) => g.response_time &&
      new Date(g.response_time).getTime() > twoWeeksAgo &&
      new Date(g.response_time).getTime() <= weekAgo
  ).length;

  // ── PRIORITY: actionable warnings first ─────────────

  // Urgent: event soon + many pending
  if (daysLeft !== null && daysLeft <= 14 && daysLeft > 0 && pending > total * 0.2) {
    items.push({
      text: `⚠️ האירוע בעוד ${daysLeft} ימים ו-${pending} אורחים עדיין לא ענו — מומלץ לשלוח תזכורות מיידית.`,
      priority: "high", type: "warning",
    });
  }

  // Opened but didn't respond — hot leads for reminders
  const openedPending = guests.filter((g) => g.opened_at && g.status === "pending").length;
  if (openedPending >= 3) {
    items.push({
      text: `👁 ${openedPending} אורחים פתחו את הקישור אך טרם ענו — הם כבר ראו את ההזמנה, תזכורת תניב תוצאות.`,
      priority: "high", type: "action",
    });
  }

  // Low response rate + time to act
  if (rate < 40 && pending > 10) {
    items.push({
      text: `🔔 אחוז מענה נמוך: רק ${rate}% ענו — ${pending} אורחים עדיין לא אישרו. שווה לשלוח גל תזכורות.`,
      priority: "high", type: "action",
    });
  }

  // No phone for many pending guests
  const pendingNoPhone = guests.filter((g) => g.status === "pending" && !g.phone).length;
  if (pendingNoPhone > 5) {
    items.push({
      text: `📵 ל-${pendingNoPhone} ממתינים אין מספר טלפון — לא ניתן לשלוח להם תזכורת בוואטסאפ. שקלו לעדכן את הרשימה.`,
      priority: "high", type: "warning",
    });
  }

  // ── MEDIUM priority: informative ────────────────────

  // Trend: activity increase
  if (thisWeekResponses > lastWeekResponses + 2 && thisWeekResponses > 0) {
    const delta = thisWeekResponses - lastWeekResponses;
    items.push({
      text: `📈 פעילות עלתה השבוע: ${thisWeekResponses} תגובות (עלייה של ${delta} לעומת השבוע שעבר).`,
      priority: "medium", type: "info",
    });
  } else if (lastWeekResponses > thisWeekResponses + 3 && lastWeekResponses > 0) {
    items.push({
      text: `📉 קצב התגובות ירד השבוע: ${thisWeekResponses} תגובות לעומת ${lastWeekResponses} בשבוע שעבר. זה הזמן לשלוח תזכורת.`,
      priority: "medium", type: "action",
    });
  }

  // Response rate context
  if (rate === 100) {
    items.push({ text: "✅ כל האורחים ענו — רשימה מלאה! אפשר לייצא דוח לאולם.", priority: "medium", type: "positive" });
  } else if (rate >= 80) {
    items.push({ text: `📊 אחוז מענה גבוה: ${rate}% — ${pending} אורחים נותרו.`, priority: "medium", type: "positive" });
  } else {
    items.push({
      text: `📊 אחוז מענה: ${rate}% (${responders} מתוך ${total} ענו).`,
      priority: "medium", type: "info",
    });
  }

  // Attendance summary
  if (confirmed > 0) {
    items.push({
      text: `🎊 ${attendees} אנשים מגיעים בפועל ל${eventName}${daysLeft && daysLeft > 0 ? ` — עוד ${daysLeft} ימים` : ""}.`,
      priority: "medium", type: "positive",
    });
  }

  // Recent 48h burst
  const recent48 = guests.filter(
    (g) => g.response_time && now - new Date(g.response_time).getTime() < 48 * 3600_000
  ).length;
  if (recent48 > 0) {
    items.push({
      text: `⚡ ${recent48} תגובות התקבלו ב-48 שעות האחרונות.`,
      priority: "medium", type: "info",
    });
  }

  // ── LOW priority: nice-to-know ──────────────────────

  if (declined > 0) {
    const declinedPct = Math.round((declined / total) * 100);
    items.push({
      text: `❌ ${declined} אורחים (${declinedPct}%) לא יוכלו להגיע.`,
      priority: "low", type: "info",
    });
  }

  if (opened > 0 && opened < total) {
    items.push({
      text: `🔗 ${opened} מתוך ${total} אורחים פתחו את קישור ה-RSVP.`,
      priority: "low", type: "info",
    });
  }

  if (daysLeft !== null && daysLeft > 30 && rate > 60) {
    items.push({
      text: `📅 עוד ${daysLeft} ימים לאירוע — אחוז מענה טוב לשלב זה.`,
      priority: "low", type: "positive",
    });
  }

  // Sort: high → medium → low, then action → warning → positive → info
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const typeRank     = { action: 0, warning: 1, positive: 2, info: 3 };
  items.sort((a, b) =>
    priorityRank[a.priority] - priorityRank[b.priority] ||
    typeRank[a.type] - typeRank[b.type]
  );

  return items;
}

/* ── Attendance Forecast model ──────────────────────── */
function computeForecast(guests: Guest[]): Forecast | null {
  if (guests.length === 0) return null;

  const total      = guests.length;
  const confirmed  = guests.filter((g) => g.status === "confirmed");
  const declined   = guests.filter((g) => g.status === "declined").length;
  const pending    = guests.filter((g) => g.status === "pending").length;
  const responders = confirmed.length + declined;

  const confirmedAttendees = confirmed.reduce((s, g) => s + g.guest_count, 0);
  const responseRate = Math.round((responders / total) * 100);

  // Average seat-count per confirmed guest (≥1 to avoid division oddities)
  const avgSeats = confirmed.length > 0
    ? confirmedAttendees / confirmed.length
    : 1;

  const confirmRate = responders > 0
    ? Math.round((confirmed.length / responders) * 100)
    : 50; // default assumption when no data

  const hasEnoughData = responders >= 5;

  // Expected pending confirmations × avg seat size
  const pendingConfirm = pending * (confirmRate / 100);
  const expected     = Math.round(confirmedAttendees + pendingConfirm * avgSeats);
  const optimistic   = Math.round(confirmedAttendees + pendingConfirm * avgSeats * 1.15);
  const conservative = Math.round(confirmedAttendees + pendingConfirm * avgSeats * 0.75);

  return {
    confirmedAttendees,
    responseRate,
    confirmRate,
    pendingGuests: pending,
    optimistic,
    expected,
    conservative,
    hasEnoughData,
  };
}

/* ── Event Health Score ──────────────────────────────── */
function computeHealthScore(
  guests: Guest[],
  eventDate: string | undefined,
): HealthScore {
  const now        = Date.now();
  const total      = guests.length;
  const confirmed  = guests.filter((g) => g.status === "confirmed").length;
  const declined   = guests.filter((g) => g.status === "declined").length;
  const responders = confirmed + declined;
  const opened     = guests.filter((g) => g.opened_at).length;

  const breakdown: HealthScore["breakdown"] = [];

  // 1. Response rate (40 pts)
  const rateScore = total > 0 ? Math.round((responders / total) * 40) : 0;
  breakdown.push({ factor: "אחוז מענה", points: rateScore, max: 40 });

  // 2. Open rate (20 pts)
  const openScore = total > 0 ? Math.round((opened / total) * 20) : 0;
  breakdown.push({ factor: "אחוז פתיחת קישור", points: openScore, max: 20 });

  // 3. Low pending penalty (20 pts) — full if ≤10% pending, 0 if ≥60% pending
  const pendingPct = total > 0 ? (guests.filter((g) => g.status === "pending").length / total) : 1;
  const pendingScore = Math.round(Math.max(0, 1 - pendingPct / 0.6) * 20);
  breakdown.push({ factor: "אחוז נמוך של ממתינים", points: pendingScore, max: 20 });

  // 4. Time factor (10 pts) — >60 days: 10, 30–60: 7, 14–30: 5, <14: 2, past: 0
  let timeScore = 5;
  if (eventDate) {
    const daysLeft = Math.ceil((new Date(eventDate).getTime() - now) / 86_400_000);
    if (daysLeft > 60)     timeScore = 10;
    else if (daysLeft > 30) timeScore = 7;
    else if (daysLeft > 14) timeScore = 5;
    else if (daysLeft > 0)  timeScore = 2;
    else                    timeScore = 0;
  }
  breakdown.push({ factor: "זמן עד האירוע", points: timeScore, max: 10 });

  // 5. Recent activity (10 pts) — confirmations in last 7 days
  const recentCount = guests.filter(
    (g) => g.response_time && now - new Date(g.response_time).getTime() < 7 * 86_400_000
  ).length;
  const activityScore = Math.min(10, Math.round((recentCount / Math.max(total * 0.1, 1)) * 10));
  breakdown.push({ factor: "פעילות אחרונה", points: activityScore, max: 10 });

  const score = rateScore + openScore + pendingScore + timeScore + activityScore;
  const tier  = score >= 80 ? "green" : score >= 50 ? "yellow" : "red";

  const labelMap: Record<HealthScore["tier"], string> = {
    green:  "האירוע במצב מצוין.",
    yellow: "יש מקום לשיפור — שווה לשלוח תזכורות.",
    red:    "מספר רב של מוזמנים עדיין לא ענו.",
  };

  return { score, tier, label: labelMap[tier], breakdown };
}

/* ── Design tokens ─────────────────────────────────── */
const C = {
  cream:   "#F6F1E8",
  ivory:   "#FDFAF5",
  gold:    "#C5A46D",
  goldL:   "#D4BC8A",
  olive:   "#6B7B5A",
  dark:    "#333333",
  muted:   "rgba(51,51,51,0.55)",
  border:  "rgba(197,164,109,0.20)",
  borderS: "rgba(197,164,109,0.10)",
};

const STATUS_LABEL: Record<GuestStatus, string> = {
  confirmed: "אישר הגעה",
  pending:   "ממתין",
  declined:  "לא מגיע",
};
const STATUS_COLOR: Record<GuestStatus, { bg: string; color: string }> = {
  confirmed: { bg: "rgba(107,123,90,0.12)", color: C.olive },
  pending:   { bg: "rgba(197,164,109,0.15)", color: "#A07840" },
  declined:  { bg: "rgba(51,51,51,0.07)",   color: "rgba(51,51,51,0.50)" },
};

const PAGE_SIZE = 20;
type Tab = "guests" | "reminders" | "import-export" | "command-center" | "recommendations" | "couple-view" | "calendar" | "history" | "analytics";

interface CouponRow {
  id: string;
  code: string;
  discount_pct: number;
  description: string | null;
  used_by_event_id: string | null;
  created_at: string;
  created_by_event?: { name: string } | null;
  used_by_event?: { name: string } | null;
}
type StatusFilter = "all" | GuestStatus;

/* ══════════════════════════════════════════════════════
   Main Admin Page
══════════════════════════════════════════════════════ */
export default function AdminPage() {
  /* ── State ──────────────────────────────────────── */
  const [events,          setEvents]          = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [guests,          setGuests]          = useState<Guest[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [guestsLoading,   setGuestsLoading]   = useState(false);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState<StatusFilter>("all");
  const [activeTab,       setActiveTab]       = useState<Tab>("guests");
  const [page,            setPage]            = useState(1);

  // Create event form
  const [showCreate,        setShowCreate]        = useState(false);
  const [newName,           setNewName]           = useState("");
  const [newDate,           setNewDate]           = useState("");
  const [newAddress,        setNewAddress]        = useState("");
  const [newTheme,          setNewTheme]          = useState<ThemeId>(DEFAULT_THEME_ID);
  const [newPhone,          setNewPhone]          = useState("");
  const [newRsvpDeadline,   setNewRsvpDeadline]   = useState("");
  const [creating,          setCreating]          = useState(false);

  // Extra modals
  const [showBroadcast,     setShowBroadcast]     = useState(false);
  const [broadcastMsg,      setBroadcastMsg]      = useState("");
  const [broadcastLoading,  setBroadcastLoading]  = useState(false);
  const [showAnnounce,      setShowAnnounce]      = useState(false);
  const [announceMsg,       setAnnounceMsg]       = useState("");
  const [announceLoading,   setAnnounceLoading]   = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);

  // Import
  const fileRef                       = useRef<HTMLInputElement>(null);
  const [importFile,   setImportFile]  = useState<File | null>(null);
  const [importing,    setImporting]   = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Command center overview
  const [overview,        setOverview]        = useState<EventSummary[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [eventSearch,     setEventSearch]     = useState("");
  const [eventFilter,     setEventFilter]     = useState<"all" | "attention" | "upcoming">("all");

  // Activity timeline
  const [expandedGuestId, setExpandedGuestId] = useState<string | null>(null);
  const [activityMap, setActivityMap]         = useState<Record<string, GuestEvent[]>>({});
  const [activityLoading, setActivityLoading] = useState(false);

  // Add single guest
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [addName,      setAddName]      = useState("");
  const [addPhone,     setAddPhone]     = useState("");
  const [addCount,     setAddCount]     = useState(1);
  const [addLoading,   setAddLoading]   = useState(false);

  // Approval system
  const [approvalMap,     setApprovalMap]     = useState<Record<string, ApprovalRequest | null>>({});
  const [approvalCreating, setApprovalCreating] = useState(false);

  // Delete event
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteGuestCount, setDeleteGuestCount] = useState<number | null>(null);
  const [pendingDeleteEventId, setPendingDeleteEventId] = useState<string | null>(null);

  // Coupons
  const [coupons,        setCoupons]        = useState<CouponRow[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showCoupons,    setShowCoupons]    = useState(false);
  const [showBitModal,   setShowBitModal]   = useState(false);
  const [bitPhoneInput,  setBitPhoneInput]  = useState("");
  const [savingBit,      setSavingBit]      = useState(false);
  const [showInfoModal,  setShowInfoModal]  = useState(false);
  const [infoDressCode,  setInfoDressCode]  = useState("");
  const [infoParking,    setInfoParking]    = useState("");
  const [infoGreeting,   setInfoGreeting]   = useState("");
  const [savingInfo,     setSavingInfo]     = useState(false);
  const [showPayModal,   setShowPayModal]   = useState(false);
  const [payAmount,      setPayAmount]      = useState("499");
  const [payDesc,        setPayDesc]        = useState("");
  const [payLoading,     setPayLoading]     = useState(false);

  // Dropdown menus (click-based)
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const [showWeddingTools, setShowWeddingTools] = useState(false);
  const eventDropdownRef  = useRef<HTMLDivElement>(null);
  const weddingToolsRef   = useRef<HTMLDivElement>(null);
  const coupleMenuRef     = useRef<HTMLDivElement>(null);
  const toolsMenuRef      = useRef<HTMLDivElement>(null);
  const [showCoupleMenu,  setShowCoupleMenu]  = useState(false);
  const [showToolsMenu,   setShowToolsMenu]   = useState(false);

  /* ── Data fetching ──────────────────────────────── */
  useEffect(() => {
    fetch("/api/events")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !Array.isArray(data)) {
          // Diagnostic: log the actual server error so it appears in Vercel logs
          console.error("[admin] /api/events error", r.status, JSON.stringify(data));
          setLoading(false);
          return;
        }
        setEvents(data);
        if (data.length) setSelectedEventId(data[0].id);
        else setLoading(false);
      })
      .catch((err) => {
        console.error("[admin] /api/events fetch failed", err);
        setLoading(false);
      });
  }, []);

  const fetchGuests = useCallback((eventId: string) => {
    setGuestsLoading(true);
    fetch(`/api/guests?event_id=${eventId}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !Array.isArray(data)) {
          console.error("[admin] /api/guests error", r.status, JSON.stringify(data));
          return;
        }
        setGuests(data);
      })
      .catch((err) => {
        console.error("[admin] /api/guests fetch failed", err);
        setGuests([]);
      })
      .finally(() => { setGuestsLoading(false); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchGuests(selectedEventId);
      fetchApproval(selectedEventId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId, fetchGuests]);

  useEffect(() => {
    if (activeTab !== "command-center") return;
    setOverviewLoading(true);
    fetch("/api/manager/overview")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !Array.isArray(data)) {
          console.error("[admin] /api/manager/overview error", r.status, JSON.stringify(data));
          return;
        }
        setOverview(data);
      })
      .catch((err) => {
        console.error("[admin] /api/manager/overview fetch failed", err);
        setOverview([]);
      })
      .finally(() => setOverviewLoading(false));
  }, [activeTab]);

  /* ── Click-outside / ESC for dropdown menus ─────── */
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target as Node))
        setShowEventDropdown(false);
      if (weddingToolsRef.current && !weddingToolsRef.current.contains(e.target as Node))
        setShowWeddingTools(false);
      if (coupleMenuRef.current && !coupleMenuRef.current.contains(e.target as Node))
        setShowCoupleMenu(false);
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node))
        setShowToolsMenu(false);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") { setShowEventDropdown(false); setShowWeddingTools(false); setShowCoupleMenu(false); setShowToolsMenu(false); }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  /* ── KPIs ───────────────────────────────────────── */
  const total      = guests.length;
  const confirmed  = guests.filter((g) => g.status === "confirmed").length;
  const pending    = guests.filter((g) => g.status === "pending").length;
  const declined   = guests.filter((g) => g.status === "declined").length;
  const attendees    = guests
    .filter((g) => g.status === "confirmed")
    .reduce((s, g) => s + g.guest_count, 0);
  const responseRate = total > 0
    ? Math.round(((confirmed + declined) / total) * 100)
    : 0;

  /* ── Filtered + paginated guests ───────────────── */
  const filtered = guests.filter((g) => {
    const matchSearch =
      !search ||
      g.name.includes(search) ||
      g.phone.includes(search);
    const matchStatus =
      statusFilter === "all" || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Handlers ───────────────────────────────────── */
  async function fetchApproval(eventId: string) {
    if (approvalMap[eventId] !== undefined) return;
    try {
      const res = await fetch(`/api/approval/${eventId}`);
      const data = await res.json();
      setApprovalMap((prev) => ({ ...prev, [eventId]: data }));
    } catch {
      setApprovalMap((prev) => ({ ...prev, [eventId]: null }));
    }
  }

  async function handleCreateApproval() {
    if (!selectedEventId) return;
    setApprovalCreating(true);
    try {
      const res = await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: selectedEventId }),
      });
      const data: ApprovalRequest = await res.json();
      setApprovalMap((prev) => ({ ...prev, [selectedEventId]: data }));
      // Sync event status in UI
      setEvents((prev) => prev.map((e) => e.id === selectedEventId ? { ...e, status: "waiting_approval" } : e));
      setOverview((prev) => prev.map((e) => e.id === selectedEventId ? { ...e, status: "waiting_approval" } : e));
      const approvalUrl = `${window.location.origin}/approval/${selectedEventId}`;
      await navigator.clipboard.writeText(approvalUrl);
      alert(`קישור האישור הועתק ללוח!\n${approvalUrl}`);
    } finally {
      setApprovalCreating(false);
    }
  }

  async function handleEventStatusChange(status: EventStatus) {
    if (!selectedEventId) return;
    setEvents((prev) =>
      prev.map((e) => e.id === selectedEventId ? { ...e, status } : e)
    );
    setOverview((prev) =>
      prev.map((e) => e.id === selectedEventId ? { ...e, status } : e)
    );
    await fetch(`/api/events/${selectedEventId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleDeleteEvent() {
    const targetId = pendingDeleteEventId ?? selectedEventId;
    if (!targetId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${targetId}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        alert(`שגיאה: ${d.error}`);
        return;
      }
      const remaining = events.filter((e) => e.id !== targetId);
      setEvents(remaining);
      if (selectedEventId === targetId) {
        const next = remaining[0] ?? null;
        setSelectedEventId(next?.id ?? null);
        setGuests([]);
      }
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      setDeleteGuestCount(null);
      setPendingDeleteEventId(null);
    } finally {
      setDeleting(false);
    }
  }

  function openDeleteModal(eventId?: string) {
    const targetId = eventId ?? selectedEventId;
    if (!targetId) return;
    setPendingDeleteEventId(targetId);
    setDeleteGuestCount(targetId === selectedEventId ? guests.length : null);
    setDeleteConfirmText("");
    setShowDeleteModal(true);
    setShowEventDropdown(false);
  }

  async function handleStatusChange(guestId: string, status: GuestStatus) {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, status } : g))
    );
    await fetch(`/api/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function handleDelete(guestId: string) {
    if (!confirm("למחוק את האורח?")) return;
    setGuests((prev) => prev.filter((g) => g.id !== guestId));
    await fetch(`/api/guests/${guestId}`, { method: "DELETE" });
  }

  async function handleCreateEvent() {
    if (!newName || !newDate) return;
    setCreating(true);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, date: newDate, address: newAddress, theme: newTheme, client_phone: newPhone.trim() || undefined, rsvp_deadline: newRsvpDeadline || undefined }),
    });
    const data: Event = await res.json();
    setEvents((e) => [...e, data]);
    setSelectedEventId(data.id);
    setShowCreate(false);
    setNewName("");
    setNewDate("");
    setNewAddress("");
    setNewTheme(DEFAULT_THEME_ID);
    setNewPhone("");
    setCreating(false);
  }

  async function handleImport() {
    if (!importFile || !selectedEventId) return;
    setImporting(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("file", importFile);
    fd.append("event_id", selectedEventId);
    try {
      const res = await fetch("/api/guests/import", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) {
        setImportResult(`שגיאה: ${data.error}`);
      } else {
        setImportResult(`✅ יובאו ${data.imported} אורחים`);
        setImportFile(null);
        if (fileRef.current) fileRef.current.value = "";
        fetchGuests(selectedEventId);
      }
    } catch {
      setImportResult("שגיאה בייבוא. נסו שוב.");
    }
    setImporting(false);
  }

  function handleExport() {
    if (!selectedEventId) return;
    window.location.href = `/api/guests/export?event_id=${selectedEventId}`;
  }

  async function handleAddGuest() {
    if (!addName || !selectedEventId) return;
    setAddLoading(true);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: selectedEventId, name: addName, phone: addPhone, guest_count: addCount }),
    });
    const data: Guest = await res.json();
    setGuests((prev) => [...prev, data]);
    setAddName(""); setAddPhone(""); setAddCount(1);
    setShowAddGuest(false);
    setAddLoading(false);
  }

  function copyRsvpLink(token: string) {
    const base = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    navigator.clipboard.writeText(`${base}/rsvp/${token}`);
  }

  async function toggleTimeline(guestId: string) {
    if (expandedGuestId === guestId) { setExpandedGuestId(null); return; }
    setExpandedGuestId(guestId);
    if (activityMap[guestId]) return; // already loaded
    setActivityLoading(true);
    try {
      const res = await fetch(`/api/guests/${guestId}/activity`);
      const data: GuestEvent[] = await res.json();
      setActivityMap((prev) => ({ ...prev, [guestId]: data }));
    } finally {
      setActivityLoading(false);
    }
  }

  function logActivity(guestId: string, eventType: string) {
    fetch(`/api/guests/${guestId}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: eventType }),
    }).then(() => {
      // Invalidate cached timeline so it reloads on next expand
      setActivityMap((prev) => { const n = { ...prev }; delete n[guestId]; return n; });
    }).catch(() => {});
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const insights  = generateInsights(guests, selectedEvent?.name ?? "האירוע", selectedEvent?.date);
  const forecast  = computeForecast(guests);
  const health    = guests.length > 0
    ? computeHealthScore(guests, selectedEvent?.date)
    : null;
  const tasks     = generateTasks(overview);

  /* ── Loading ────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
        <Loader2 size={32} className="animate-spin" style={{ color: C.gold }} />
      </div>
    );
  }

  /* ── No events — onboarding ─────────────────────── */
  if (events.length === 0 && !showCreate) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.cream }}>
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 16px 48px rgba(197,164,109,0.12)" }}
        >
          <div className="text-3xl mb-4">🎊</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            יצירת אירוע ראשון
          </h2>
          <p className="text-sm mb-6" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
            צרו אירוע כדי להתחיל לנהל את רשימת המוזמנים
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary w-full justify-center">
            <Plus size={16} /> צרו אירוע
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     Main Dashboard
  ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: C.cream, fontFamily: "Heebo, sans-serif" }}>
      {/* ── Top bar ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center gap-4 flex-wrap"
        style={{
          background: "rgba(253,250,245,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          boxShadow: "0 1px 12px rgba(197,164,109,0.08)",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>רגע לפני</p>
          <p className="text-sm font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
            ניהול אורחים
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mr-auto">
          <a
            href="/admin/crm"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(37,99,235,0.10)", color: "#2563EB" }}
          >
            📋 CRM לידים
          </a>
          <a
            href="/admin/automation"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(107,123,90,0.10)", color: C.olive }}
          >
            <Zap size={12} /> אוטומציה
          </a>
          <a
            href="/admin/automations"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(197,164,109,0.14)", color: C.olive }}
          >
            <Bell size={12} /> אוטומציות אורחים
          </a>
          {/* Event selector — custom dropdown with per-event trash */}
          {events.length > 0 && (
            <div ref={eventDropdownRef} style={{ position: "relative", display: "inline-block" }}>
              <button
                onClick={() => setShowEventDropdown((s) => !s)}
                className="flex items-center gap-2 text-sm rounded-xl px-3 py-2 outline-none"
                style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark, minWidth: 140 }}
              >
                <span className="truncate max-w-[140px]">
                  {events.find((e) => e.id === selectedEventId)?.name ?? "בחר אירוע"}
                </span>
                <span style={{ opacity: 0.4, fontSize: 10, marginRight: "auto" }}>▾</span>
              </button>
              {showEventDropdown && (
                <div
                  className="absolute z-50 rounded-xl overflow-hidden shadow-lg"
                  style={{
                    top: "calc(100% + 4px)",
                    right: 0,
                    background: "#FDFAF5",
                    border: `1px solid ${C.border}`,
                    minWidth: 220,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center gap-2 px-3 py-2.5 transition-colors"
                      style={{
                        background: ev.id === selectedEventId ? "rgba(197,164,109,0.10)" : "transparent",
                        borderBottom: `1px solid rgba(197,164,109,0.10)`,
                      }}
                    >
                      <button
                        className="flex-1 text-right text-sm truncate"
                        style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        onClick={() => { setSelectedEventId(ev.id); setPage(1); setShowEventDropdown(false); }}
                      >
                        {ev.name}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(ev.id); }}
                        title="מחק אירוע"
                        className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: "rgba(239,68,68,0.5)", background: "none", border: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Couple phone quick-dial */}
          {selectedEvent?.client_phone && (
            <a
              href={`https://wa.me/${selectedEvent.client_phone.replace(/[^0-9]/g,"").replace(/^0/,"972")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
              style={{ background: "rgba(37,211,102,0.10)", color: "#1A9B4E", textDecoration: "none", direction: "ltr" }}
              title="שלח WhatsApp לזוג"
            >
              💬 {selectedEvent.client_phone}
            </a>
          )}

          {/* Event status changer */}
          {selectedEventId && (
            <select
              value={selectedEvent?.status ?? "new_lead"}
              onChange={(e) => handleEventStatusChange(e.target.value as EventStatus)}
              className="text-xs rounded-xl px-2 py-2 outline-none font-medium"
              style={{
                background: selectedEvent?.status
                  ? EVENT_STATUS_COLOR[selectedEvent.status as EventStatus]
                  : "rgba(197,164,109,0.70)",
                border: "none",
                color: "white",
              }}
              title="שנה סטטוס אירוע"
            >
              {(Object.entries(EVENT_STATUS_LABEL) as [EventStatus, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          )}
          <a
            href="/admin/wizard"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(197,164,109,0.12)", color: C.olive }}
          >
            <Wand2 size={13} /> אשף יצירה
          </a>
          {/* ── Group A: זוג ואירוע dropdown ── */}
          {selectedEventId && (
            <div ref={coupleMenuRef} style={{ position: "relative", display: "inline-block" }}>
              <button
                onClick={() => { setShowCoupleMenu(s => !s); setShowToolsMenu(false); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
                style={{ background: showCoupleMenu ? "rgba(197,164,109,0.28)" : "rgba(197,164,109,0.15)", color: C.gold }}
              >
                👫 זוג ואירוע ▾
              </button>
              {showCoupleMenu && (
                <div className="absolute rounded-2xl overflow-hidden z-50" style={{ background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.25)", minWidth: 190, top: "calc(100% + 6px)", right: 0, boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
                  {/* Approval */}
                  <button
                    onClick={() => { handleCreateApproval(); setShowCoupleMenu(false); }}
                    disabled={approvalCreating}
                    className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors text-right disabled:opacity-50"
                    style={{ color: approvalMap[selectedEventId]?.status === "approved" ? C.olive : C.gold, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {approvalCreating ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    {approvalMap[selectedEventId]?.status === "approved" ? "✓ אושר" : approvalMap[selectedEventId]?.status === "pending" ? "⏳ ממתין לאישור" : approvalMap[selectedEventId]?.status === "changes_requested" ? "✏️ תיקונים נדרשים" : "שלח לאישור לקוח"}
                  </button>
                  <div style={{ height: 1, background: "rgba(197,164,109,0.12)", margin: "0 12px" }} />
                  {selectedEvent?.couple_token && (
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/couple/${selectedEvent.couple_token}`); setShowCoupleMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      <Copy size={13} /> קישור לזוג
                    </button>
                  )}
                  {selectedEvent?.couple_token && (
                    <button onClick={async () => {
                      const phone = selectedEvent?.client_phone?.replace(/[^0-9]/g, "").replace(/^0/, "972") ?? "";
                      if (!phone) { alert("אין מספר טלפון שמור לזוג"); return; }
                      try {
                        const res = await fetch(`/api/couple/${selectedEvent.couple_token}/briefing`);
                        const brief = await res.json();
                        const keyFacts: string[] = brief.keyFacts ?? [];
                        const alerts: { title: string }[] = brief.alerts ?? [];
                        const msg = `שלום! 💛\nעדכון מרגע לפני עבור ${selectedEvent.name}:\n\n${keyFacts.join(" | ")}\n\nפעולות נדרשות:\n${alerts.slice(0, 3).map((a) => `• ${a.title}`).join("\n")}\n\nלדשבורד המלא: ${window.location.origin}/couple/${selectedEvent.couple_token}`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                      } catch { alert("שגיאה בשליפת הנתונים"); }
                      setShowCoupleMenu(false);
                    }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      🔔 תזכורת לזוג WhatsApp
                    </button>
                  )}
                  <button onClick={() => {
                    const themesUrl = `${window.location.origin}/themes?event=${selectedEventId}`;
                    const phone = selectedEvent?.client_phone?.replace(/[^0-9]/g, "").replace(/^0/, "972") ?? "";
                    if (phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`שלום! 🎉\nהכנתי לכם דף לבחירת עיצוב ההזמנה.\nבחרו את הסגנון שאתם אוהבים ושלחו לי 👇\n${themesUrl}`)}`, "_blank");
                    else { navigator.clipboard.writeText(themesUrl); alert("קישור הועתק!"); }
                    setShowCoupleMenu(false);
                  }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                    <Palette size={13} /> בחירת עיצוב
                  </button>
                  <a href={`/event/${selectedEventId}?preview=true`} target="_blank" rel="noopener noreferrer" onClick={() => setShowCoupleMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.dark, textDecoration: "none", fontFamily: "Heebo, sans-serif" }}>
                    <ExternalLink size={13} /> תצוגה מקדימה
                  </a>
                  <div style={{ height: 1, background: "rgba(197,164,109,0.12)", margin: "0 12px" }} />
                  <button onClick={() => { setBitPhoneInput((selectedEvent as (typeof selectedEvent & { bit_phone?: string }))?.bit_phone ?? ""); setShowBitModal(true); setShowCoupleMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: "#1B3AE8", fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                    ₪ ביט מתנות
                  </button>
                  <button onClick={() => {
                    const ev = selectedEvent as (typeof selectedEvent & { dress_code?: string; parking_info?: string; greeting?: string });
                    setInfoDressCode(ev?.dress_code ?? ""); setInfoParking(ev?.parking_info ?? ""); setInfoGreeting(ev?.greeting ?? "");
                    setShowInfoModal(true); setShowCoupleMenu(false);
                  }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                    ✏️ פרטי הזמנה
                  </button>

                  <button onClick={() => {
                    setPayDesc(`ניהול חתונה — ${selectedEvent?.name ?? ""}`);
                    setShowPayModal(true); setShowCoupleMenu(false);
                  }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-green-50 transition-colors" style={{ color: "#1A9B4E", fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer", borderTop: "1px solid rgba(197,164,109,0.10)" }}>
                    💳 גבה תשלום
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Group B: כלים dropdown ── */}
          <div ref={toolsMenuRef} style={{ position: "relative", display: "inline-block" }}>
            <button
              onClick={() => { setShowToolsMenu(s => !s); setShowCoupleMenu(false); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
              style={{ background: showToolsMenu ? "rgba(107,123,90,0.20)" : "rgba(107,123,90,0.12)", color: C.olive }}
            >
              🛠️ כלים ▾
            </button>
            {showToolsMenu && (
              <div className="absolute rounded-2xl overflow-hidden z-50" style={{ background: "#FDFAF5", border: "1px solid rgba(107,123,90,0.2)", minWidth: 190, top: "calc(100% + 6px)", right: 0, boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
                {[
                  { href: selectedEventId ? `/admin/seating?event=${selectedEventId}` : "/admin/seating", label: "סידור הושבה", emoji: "🪑" },
                  { href: "/admin/budget",    label: "ניהול תקציב",   emoji: "💰" },
                  { href: "/admin/gifts",     label: "מעקב מתנות",    emoji: "🎁" },
                  { href: "/admin/reminders", label: "תזכורות RSVP",  emoji: "📨" },
                  { href: "/admin/whatsapp",  label: "קמפיין וואטסאפ", emoji: "📲" },
                  ...(selectedEventId ? [{ href: `/admin/gallery/${selectedEventId}`, label: "גלריית תמונות", emoji: "📸" }] : []),
                ].map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setShowToolsMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-xs hover:bg-green-50 transition-colors" style={{ color: C.dark, textDecoration: "none", fontFamily: "Heebo, sans-serif" }}>
                    <span>{item.emoji}</span>{item.label}
                  </a>
                ))}
                {selectedEventId && (
                  <>
                    <div style={{ height: 1, background: "rgba(107,123,90,0.12)", margin: "0 12px" }} />
                    {selectedEvent?.client_phone && selectedEvent?.couple_token && (() => {
                      const phone = selectedEvent.client_phone!.replace(/\D/g,"").replace(/^0/,"972");
                      const dashUrl = `${window.location.origin}/couple/${selectedEvent.couple_token}`;
                      const msg = encodeURIComponent(`💌 שלום!\nהנה הקישור לדשבורד שלכם:\n${dashUrl}\n\nשם תמצאו את כל הפרטים, אישורי הגעה ועוד 🤍`);
                      return (
                        <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowToolsMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-xs hover:bg-green-50 transition-colors font-semibold"
                          style={{ color: "#1A9B4E", fontFamily: "Heebo, sans-serif", textDecoration: "none", background: "rgba(37,211,102,0.04)" }}>
                          💌 שלח קישור דשבורד לזוג
                        </a>
                      );
                    })()}
                    <button onClick={() => { setShowBroadcast(true); setShowToolsMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-blue-50 transition-colors" style={{ color: "#1A6FBF", fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      📣 שלח הודעה לכל האורחים
                    </button>
                    <button onClick={() => { setShowAnnounce(true); setShowToolsMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.gold, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      📢 פרסם עדכון לזוג
                    </button>
                    <button onClick={async () => {
                      if (!selectedEvent?.client_phone) { alert("לא הוגדר טלפון לזוג"); return; }
                      const phone = selectedEvent.client_phone.replace(/\D/g,"").replace(/^0/,"972");
                      const url = `https://g.page/r/YOUR_GOOGLE_PLACE_ID/review`;
                      const msg = encodeURIComponent(`שלום! 🌟\nשמחנו לנהל את החתונה שלכם.\nנשמח אם תשאירו לנו ביקורת קצרה:\n${url}`);
                      window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                      setShowToolsMenu(false);
                    }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: "#E67E22", fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      ⭐ בקש ביקורת Google
                    </button>
                    {selectedEvent?.client_phone && (() => {
                      const phone = selectedEvent.client_phone!.replace(/\D/g,"").replace(/^0/,"972");
                      const eventDate = selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString("he-IL", { day: "numeric", month: "long" }) : "";
                      const venue = selectedEvent.address ?? "האולם";
                      const msg = encodeURIComponent(`🎊 היום זה הגדול!\nהחתונה של ${selectedEvent.name} — ${eventDate}\n📍 ${venue}\n\nמחכים לחגוג איתכם! 🤍`);
                      return (
                        <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowToolsMenu(false)}
                          className="flex items-center gap-2 px-4 py-3 text-xs hover:bg-green-50 transition-colors" style={{ color: "#1A9B4E", fontFamily: "Heebo, sans-serif", textDecoration: "none" }}>
                          🎉 שלח ברכת יום האירוע לזוג
                        </a>
                      );
                    })()}
                    <div style={{ height: 1, background: "rgba(107,123,90,0.12)", margin: "0 12px" }} />
                    <button onClick={() => { setShowContractModal(true); setShowToolsMenu(false); }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-amber-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      📝 צור חוזה שירות
                    </button>
                    <button onClick={async () => {
                      try {
                        const res = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ created_by_event_id: selectedEventId, discount_pct: 10, description: "הפניית חבר" }) });
                        const d = await res.json();
                        if (!res.ok) throw new Error(d.error);
                        alert(`קוד הקופון: ${d.code} (${d.discount_pct}% הנחה)`);
                      } catch (e: unknown) { alert("שגיאה: " + (e instanceof Error ? e.message : String(e))); }
                      setShowToolsMenu(false);
                    }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-green-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                      🎟️ צור קופון הפניה
                    </button>
                    {selectedEvent && (
                      <button onClick={() => {
                        window.open(`/quote?name=${encodeURIComponent(selectedEvent.name ?? "")}&date=${selectedEvent.date ?? ""}`, "_blank");
                        setShowToolsMenu(false);
                      }} className="flex items-center gap-2 w-full px-4 py-3 text-xs hover:bg-green-50 transition-colors" style={{ color: C.dark, fontFamily: "Heebo, sans-serif", background: "none", border: "none", cursor: "pointer" }}>
                        📄 הצעת מחיר
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Standalone: create + refresh + delete + logout ── */}
          <button
            onClick={() => setShowCreate((s) => !s)}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:opacity-80"
            style={{ background: "rgba(197,164,109,0.12)", color: C.olive }}
          >
            <Plus size={13} /> מהיר
          </button>
          <button
            onClick={() => selectedEventId && fetchGuests(selectedEventId)}
            className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ background: "rgba(107,123,90,0.08)", color: C.olive }}
            title="רענן"
          >
            <RefreshCw size={14} className={guestsLoading ? "animate-spin" : ""} />
          </button>
          {selectedEventId && (
            <button
              onClick={() => openDeleteModal()}
              className="p-2 rounded-xl transition-all hover:opacity-70"
              style={{ background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.7)" }}
              title="מחק אירוע"
            >
              🗑
            </button>
          )}
          <button
            onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/admin/login"; }}
            className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ background: "rgba(239,68,68,0.08)", color: "rgba(239,68,68,0.7)" }}
            title="יציאה"
          >
            ↩
          </button>
        </div>
      </header>

      {/* ── Bit phone modal ─────────────────────────── */}
      {showBitModal && selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowBitModal(false)}>
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
              🎁 קבלת מתנות בביט
            </h3>
            <p className="text-xs mb-4" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
              הוסף מספר ביט של הזוג. אורחים שייכנסו להזמנה יראו כפתור &quot;שלח מתנה בביט&quot;.
            </p>
            <input
              type="tel"
              placeholder="05X-XXXXXXX"
              value={bitPhoneInput}
              onChange={e => setBitPhoneInput(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
              style={{ background: "white", border: `1.5px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif", direction: "ltr", textAlign: "left" }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setSavingBit(true);
                  await fetch(`/api/events/${selectedEventId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bit_phone: bitPhoneInput.trim() || null }),
                  });
                  setEvents(prev => prev.map(e => e.id === selectedEventId ? { ...e, bit_phone: bitPhoneInput.trim() || null } as typeof e : e));
                  setSavingBit(false);
                  setShowBitModal(false);
                }}
                disabled={savingBit}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#1B3AE8,#2D52F5)", color: "white", fontFamily: "Heebo, sans-serif", opacity: savingBit ? 0.7 : 1 }}
              >
                {savingBit ? "שומר..." : "שמור"}
              </button>
              <button
                onClick={() => setShowBitModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, fontFamily: "Heebo, sans-serif" }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event info modal (dress code, parking, greeting) ── */}
      {showInfoModal && selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowInfoModal(false)}>
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
              ✏️ פרטי הזמנה
            </h3>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>👔 קוד לבוש</label>
                <input
                  placeholder="למשל: לבוש אלגנטי / חגיגי"
                  value={infoDressCode}
                  onChange={e => setInfoDressCode(e.target.value)}
                  maxLength={60}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "white", border: `1.5px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>🅿️ הוראות חניה</label>
                <input
                  placeholder="למשל: חניה חינם בחניון הסמוך"
                  value={infoParking}
                  onChange={e => setInfoParking(e.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "white", border: `1.5px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>💌 ברכה אישית מהזוג</label>
                <textarea
                  placeholder="מילים חמות מהזוג שיופיעו בהזמנה..."
                  value={infoGreeting}
                  onChange={e => setInfoGreeting(e.target.value)}
                  maxLength={300}
                  rows={3}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                  style={{ background: "white", border: `1.5px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setSavingInfo(true);
                  await fetch(`/api/events/${selectedEventId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dress_code: infoDressCode.trim() || null, parking_info: infoParking.trim() || null, greeting: infoGreeting.trim() || null }),
                  });
                  setEvents(prev => prev.map(e => e.id === selectedEventId ? { ...e, dress_code: infoDressCode.trim() || null, parking_info: infoParking.trim() || null, greeting: infoGreeting.trim() || null } as typeof e : e));
                  setSavingInfo(false);
                  setShowInfoModal(false);
                }}
                disabled={savingInfo}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: `linear-gradient(135deg,${C.gold},${C.gold}cc)`, color: "white", fontFamily: "Heebo, sans-serif", opacity: savingInfo ? 0.7 : 1 }}
              >
                {savingInfo ? "שומר..." : "שמור"}
              </button>
              <button
                onClick={() => setShowInfoModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, fontFamily: "Heebo, sans-serif" }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment modal ───────────────────────────── */}
      {showPayModal && selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#FDFAF5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>💳 גביית תשלום</h2>
            <p className="text-xs mb-4" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>{selectedEvent?.name}</p>

            {/* Package shortcuts */}
            <p className="text-xs font-semibold mb-2" style={{ color: C.muted }}>בחר חבילה:</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "בסיסי",  price: 299, desc: "הזמנה + RSVP" },
                { label: "מלא",    price: 499, desc: "הכל כלול" },
                { label: "פרימיום", price: 799, desc: "פרימיום + ליווי" },
              ].map(p => (
                <button key={p.price} onClick={() => { setPayAmount(String(p.price)); setPayDesc(`${p.label} — ${selectedEvent?.name ?? ""}`); }}
                  className="rounded-xl p-3 text-center transition-all"
                  style={{ border: `1.5px solid ${payAmount === String(p.price) ? C.gold : C.border}`, background: payAmount === String(p.price) ? `rgba(197,164,109,0.10)` : "white", cursor: "pointer" }}>
                  <p style={{ fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.gold, margin: 0 }}>₪{p.price}</p>
                  <p style={{ fontSize: 10, color: C.dark, margin: "2px 0 0", fontFamily: "Heebo, sans-serif" }}>{p.label}</p>
                  <p style={{ fontSize: 9, color: C.muted, fontFamily: "Heebo, sans-serif" }}>{p.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: C.muted }}>סכום מותאם (₪)</label>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} min={1}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${C.border}`, fontFamily: "Frank Ruhl Libre, serif", fontSize: 16, fontWeight: 700, color: C.gold }} />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: C.muted }}>תיאור (יופיע בקבלה)</label>
                <input value={payDesc} onChange={e => setPayDesc(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif" }} />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={payLoading || !payAmount || Number(payAmount) <= 0}
                onClick={async () => {
                  setPayLoading(true);
                  try {
                    const res = await fetch("/api/stripe/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ event_id: selectedEventId, amount: Number(payAmount), description: payDesc }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      // Copy link + optionally open
                      await navigator.clipboard.writeText(data.url);
                      const phone = selectedEvent?.client_phone?.replace(/[^0-9]/g,"").replace(/^0/,"972") ?? "";
                      const waMsg = encodeURIComponent(`שלום! 💛\nהנה קישור לתשלום עבור החבילה שלכם:\n${data.url}`);
                      if (phone) window.open(`https://wa.me/${phone}?text=${waMsg}`, "_blank");
                      else window.open(data.url, "_blank");
                      setShowPayModal(false);
                    } else { alert(data.error ?? "שגיאה ביצירת קישור"); }
                  } catch { alert("שגיאה ביצירת קישור"); }
                  setPayLoading(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: payLoading ? "rgba(37,211,102,0.4)" : "linear-gradient(135deg,#1A9B4E,#0f6b35)", color: "white", fontFamily: "Heebo, sans-serif", border: "none", cursor: "pointer", opacity: (!payAmount || Number(payAmount) <= 0) ? 0.5 : 1 }}>
                {payLoading ? "מייצר קישור..." : `שלח קישור תשלום ₪${payAmount}`}
              </button>
              <button onClick={() => setShowPayModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, fontFamily: "Heebo, sans-serif", border: "none", cursor: "pointer" }}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Broadcast modal (#24) ── */}
      {showBroadcast && selectedEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#FDFAF5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>📣 הודעה לכל האורחים</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>ייפתח וואטסאפ עם הודעה לכל אורח. שלחו אחד אחד (מגבלת וואטסאפ).</p>
            <div className="mb-3">
              <p className="text-xs mb-2" style={{ color: C.muted }}>תבניות מהירות:</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: "תזכורת RSVP", text: `שלום [שם], עדיין לא קיבלנו את אישורך לאירוע ${selectedEvent?.name ?? ""}. נשמח לדעת! 🙏` },
                  { label: "פרטי האולם", text: `שלום [שם], 📍 האירוע ${selectedEvent?.name ?? ""} יתקיים ב${selectedEvent?.address ?? ""}. מחכים לכם! 🤍` },
                  { label: "יום האירוע", text: `שלום [שם]! 🎊 היום זה הגדול — ${selectedEvent?.name ?? ""}. מחכים לכם ❤️` },
                ].map(t => (
                  <button key={t.label} onClick={() => setBroadcastMsg(t.text)}
                    className="text-right px-3 py-2 rounded-lg text-xs transition-colors hover:bg-amber-50"
                    style={{ border: `1px solid ${C.border}`, background: "transparent", fontFamily: "Heebo, sans-serif", color: C.dark, cursor: "pointer" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} rows={4}
              placeholder="כתבו את ההודעה. השתמשו ב[שם] למקום שם האורח..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none mb-4"
              style={{ border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", resize: "none" }} />
            <div className="flex gap-2">
              <button disabled={broadcastLoading || !broadcastMsg.trim()}
                onClick={async () => {
                  setBroadcastLoading(true);
                  const res = await fetch(`/api/events/${selectedEventId}/guests`).catch(() => null);
                  const guestsData = res ? await res.json() : null;
                  const list: { name: string; phone: string }[] = Array.isArray(guestsData) ? guestsData.filter((g: { phone?: string }) => g.phone) : [];
                  if (list.length === 0) {
                    // Fallback: use guests state
                    const gList = guests.filter(g => (g as { phone?: string }).phone);
                    if (gList.length === 0) { alert("אין אורחים עם מספר טלפון"); setBroadcastLoading(false); return; }
                    for (const g of gList.slice(0, 3)) {
                      const phone = ((g as { phone?: string }).phone ?? "").replace(/\D/g,"").replace(/^0/,"972");
                      const msg = broadcastMsg.replace(/\[שם\]/g, g.name);
                      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
                      await new Promise(r => setTimeout(r, 800));
                    }
                  }
                  setBroadcastLoading(false);
                  setShowBroadcast(false);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#1A6FBF,#0D4F8C)", color: "white", border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif", opacity: !broadcastMsg.trim() ? 0.5 : 1 }}>
                {broadcastLoading ? "שולח..." : "פתח בוואטסאפ"}
              </button>
              <button onClick={() => setShowBroadcast(false)}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Announce to couple modal (#16) ── */}
      {showAnnounce && selectedEvent?.couple_token && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#FDFAF5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>📢 עדכון לזוג</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>ההודעה תופיע בדשבורד של הזוג.</p>
            <textarea value={announceMsg} onChange={e => setAnnounceMsg(e.target.value)} rows={4}
              placeholder="כתבו עדכון / הודעה לזוג..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none mb-4"
              style={{ border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", resize: "none" }} />
            <div className="flex gap-2">
              <button disabled={announceLoading || !announceMsg.trim()}
                onClick={async () => {
                  setAnnounceLoading(true);
                  await fetch(`/api/couple/${selectedEvent.couple_token}/announcements`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: announceMsg }),
                  });
                  setAnnounceMsg("");
                  setAnnounceLoading(false);
                  setShowAnnounce(false);
                  alert("✓ העדכון פורסם לדשבורד הזוג!");
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: `linear-gradient(135deg,${C.gold},${C.gold}cc)`, color: "white", border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif", opacity: !announceMsg.trim() ? 0.5 : 1 }}>
                {announceLoading ? "שולח..." : "פרסם עדכון"}
              </button>
              <button onClick={() => setShowAnnounce(false)}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contract modal (#7) ── */}
      {showContractModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl p-6 overflow-y-auto max-h-[90vh]" style={{ background: "#FDFAF5", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "Frank Ruhl Libre, serif", color: C.dark }}>📝 חוזה שירות</h2>
            <p className="text-xs mb-4" style={{ color: C.muted }}>תבנית חוזה מולאה אוטומטית — העתיקו / הדפיסו</p>
            <div id="contract-body" className="text-sm leading-relaxed p-4 rounded-xl mb-4" style={{ border: `1px solid ${C.border}`, background: "white", fontFamily: "Heebo, sans-serif", color: C.dark, direction: "rtl", whiteSpace: "pre-wrap", maxHeight: 420, overflowY: "auto", lineHeight: 1.8 }}>
              {`חוזה שירות — ניהול אירוע
━━━━━━━━━━━━━━━━━━━━━━━━━

בין: דביר בן ברוך, מנהל אירועים
     טל׳: 053-3318177

לבין: ${selectedEvent.client_name ?? "[שם הלקוח]"}
     טל׳: ${selectedEvent.client_phone ?? "[טלפון]"}

אירוע: ${selectedEvent.name}
תאריך: ${selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString("he-IL") : ""}
מיקום: ${selectedEvent.address ?? "[כתובת האולם]"}

━━━━━━━━━━━━━━━━━━━━━━━━━
שירותים הכלולים:
• ניהול רשימת אורחים ואישורי הגעה (RSVP)
• הזמנה דיגיטלית מעוצבת
• סידורי הושבה
• ניהול תקציב ומעקב מתנות
• דשבורד דיגיטלי לזוג
• ליווי אישי לאורך כל הדרך

━━━━━━━━━━━━━━━━━━━━━━━━━
תשלום: ₪${selectedEvent.payment_amount ?? "____"}
סטטוס: ${selectedEvent.payment_status === "paid" ? "שולם ✓" : "טרם שולם"}

━━━━━━━━━━━━━━━━━━━━━━━━━
חתימת הלקוח: ________________
תאריך: ________________

חתימת נותן השירות: ________________
תאריך: ${new Date().toLocaleDateString("he-IL")}`}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const text = document.getElementById("contract-body")?.innerText ?? "";
                navigator.clipboard.writeText(text);
                alert("החוזה הועתק ללוח!");
              }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: `linear-gradient(135deg,${C.gold},${C.gold}cc)`, color: "white", border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                העתק
              </button>
              <button onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.dark, border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                🖨️ הדפס
              </button>
              <button onClick={() => setShowContractModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.07)", color: "rgba(239,68,68,0.7)", border: "none", cursor: "pointer", fontFamily: "Heebo, sans-serif" }}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create event modal ───────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
            style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
          >
            <h3 className="text-lg font-bold mb-5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
              אירוע חדש
            </h3>

            {/* ── Event details ── */}
            <div className="flex flex-col gap-3 mb-5">
              <input
                placeholder="שם האירוע (למשל: חתונת נועה ואורי)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
              />
              <input
                placeholder="כתובת האולם"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
              />
              <input
                type="tel"
                placeholder="📱 טלפון הזוג (לשליחת קישורים בוואטסאפ)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif", direction: "ltr", textAlign: "right" }}
              />
              <div>
                <label className="text-xs block mb-1" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>⏰ תאריך אחרון לאישור RSVP (אופציונלי)</label>
                <input
                  type="date"
                  value={newRsvpDeadline}
                  onChange={(e) => setNewRsvpDeadline(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark, fontFamily: "Heebo, sans-serif" }}
                />
              </div>
            </div>

            {/* ── Theme picker ── */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: C.gold, fontFamily: "Heebo, sans-serif" }}>
                בחר עיצוב
              </p>
              <div className="grid grid-cols-1 gap-2">
                {THEME_LIST.map((t) => {
                  const isSelected = newTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewTheme(t.id as ThemeId)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-right w-full transition-all duration-200"
                      style={{
                        background: isSelected ? "rgba(197,164,109,0.12)" : "white",
                        border: `1.5px solid ${isSelected ? C.gold : C.border}`,
                        boxShadow: isSelected ? "0 2px 12px rgba(197,164,109,0.18)" : "none",
                      }}
                    >
                      {/* Color swatch */}
                      <div
                        className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden relative"
                        style={{ background: t.previewGradient }}
                      >
                        <div
                          className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white/40"
                          style={{ background: t.previewAccent }}
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold leading-tight"
                          style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>
                          {t.nameHe}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle size={16} style={{ color: C.gold, flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3">
              <button
                onClick={handleCreateEvent}
                disabled={creating || !newName || !newDate}
                className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)`, fontFamily: "Heebo, sans-serif" }}
              >
                {creating ? "יוצר…" : "צור אירוע"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, fontFamily: "Heebo, sans-serif" }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete event confirmation modal ─────────── */}
      {showDeleteModal && (() => { const pendingDeleteEvent = events.find(e => e.id === (pendingDeleteEventId ?? selectedEventId)); return pendingDeleteEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-3xl p-6"
            style={{ background: C.ivory, border: "1.5px solid rgba(239,68,68,0.25)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
          >
            {/* Icon + title */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "#DC2626", fontFamily: "Frank Ruhl Libre, serif" }}>
                מחיקת אירוע
              </h3>
              <p className="text-sm" style={{ color: C.muted, fontFamily: "Heebo, sans-serif" }}>
                פעולה זו אינה הפיכה
              </p>
            </div>

            {/* Event info */}
            <div
              className="rounded-2xl p-4 mb-4 text-sm text-right"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", fontFamily: "Heebo, sans-serif" }}
            >
              <div className="font-semibold mb-2" style={{ color: C.dark }}>{pendingDeleteEvent.name}</div>
              <div style={{ color: C.muted }}>
                {deleteGuestCount !== null && deleteGuestCount > 0
                  ? `${deleteGuestCount} אורחים ייימחקו`
                  : "אין אורחים רשומים"}
              </div>
            </div>

            {/* What will be deleted */}
            <div
              className="rounded-2xl p-4 mb-5 text-xs text-right"
              style={{ background: "rgba(0,0,0,0.03)", border: `1px solid ${C.border}`, fontFamily: "Heebo, sans-serif", color: C.muted }}
            >
              <div className="font-medium mb-2" style={{ color: C.dark }}>מה יימחק לצמיתות:</div>
              <div className="flex flex-col gap-1">
                {["כל האורחים ופעילותם", "סידור הושבה", "ספקים ומשימות", "תקציב ומתנות", "זיכרונות וקפסולות", "כל נתוני האירוע"].map((item) => (
                  <div key={item} className="flex items-center gap-2 justify-end">
                    <span>{item}</span>
                    <span style={{ color: "#DC2626" }}>✕</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm input */}
            <div className="mb-5">
              <label
                className="block text-xs mb-2 font-medium text-right"
                style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}
              >
                הקלד <strong>מחק</strong> לאישור
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="מחק"
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm text-right outline-none"
                style={{ background: "white", border: "1.5px solid rgba(239,68,68,0.3)", color: C.dark, fontFamily: "Heebo, sans-serif" }}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteEvent}
                disabled={deleteConfirmText !== "מחק" || deleting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: deleteConfirmText === "מחק" ? "#DC2626" : "rgba(239,68,68,0.25)",
                  color: "white",
                  fontFamily: "Heebo, sans-serif",
                  cursor: deleteConfirmText === "מחק" && !deleting ? "pointer" : "not-allowed",
                }}
              >
                {deleting ? "מוחק..." : "מחק לצמיתות"}
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); setPendingDeleteEventId(null); }}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(51,51,51,0.07)", color: C.muted, fontFamily: "Heebo, sans-serif" }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      ) : null; })()}

      <div className="container-max mx-auto px-4 md:px-8 py-6">

        {/* ── Today's Agenda strip ──────────────────── */}
        <AdminAgenda events={events} onSelect={(id) => setSelectedEventId(id)} />

        {/* ── Insights Panel ─────────────────────────── */}
        {insights.length > 0 && (
          <div
            className="rounded-2xl p-4 mb-5"
            style={{
              background: "rgba(197,164,109,0.06)",
              border: `1px solid rgba(197,164,109,0.18)`,
            }}
          >
            <p className="text-xs font-semibold mb-3 tracking-wide uppercase" style={{ color: C.gold }}>
              תובנות חכמות
            </p>
            <div className="flex flex-col gap-2">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl"
                  style={{
                    background: ins.priority === "high"
                      ? ins.type === "warning"
                        ? "rgba(200,80,80,0.06)"
                        : "rgba(107,123,90,0.08)"
                      : "transparent",
                    border: ins.priority === "high"
                      ? ins.type === "warning"
                        ? "1px solid rgba(200,80,80,0.15)"
                        : "1px solid rgba(107,123,90,0.14)"
                      : "none",
                  }}
                >
                  {ins.priority === "high" && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
                      style={{
                        background: ins.type === "warning" ? "rgba(200,80,80,0.12)" : "rgba(107,123,90,0.12)",
                        color: ins.type === "warning" ? "rgb(180,60,60)" : C.olive,
                      }}
                    >
                      {ins.type === "warning" ? "⚠ דחוף" : "✦ פעולה"}
                    </span>
                  )}
                  <p className="text-sm leading-snug" style={{ color: C.dark, fontFamily: "Heebo, sans-serif" }}>
                    {ins.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Forecast + Health row ──────────────────── */}
        {(forecast || health) && (
          <div className="grid md:grid-cols-2 gap-4 mb-5">

            {/* Attendance Forecast */}
            {forecast && (
              <div
                className="rounded-2xl p-5"
                style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.gold }}>
                  תחזית נוכחות
                </p>

                {/* Current confirmed */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                    {forecast.confirmedAttendees}
                  </span>
                  <span className="text-sm" style={{ color: C.muted }}>מגיעים בוודאות</span>
                </div>

                {/* Forecast range */}
                {forecast.pendingGuests > 0 && (
                  <div
                    className="rounded-xl p-3 mb-3"
                    style={{ background: "rgba(107,123,90,0.06)", border: "1px solid rgba(107,123,90,0.12)" }}
                  >
                    <p className="text-xs mb-2" style={{ color: C.muted }}>תחזית סופית (כולל {forecast.pendingGuests} ממתינים)</p>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: "rgba(51,51,51,0.45)", fontFamily: "Frank Ruhl Libre, serif" }}>
                          {forecast.conservative}
                        </p>
                        <p className="text-[10px]" style={{ color: C.muted }}>שמרני</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-2xl font-bold" style={{ color: C.olive, fontFamily: "Frank Ruhl Libre, serif" }}>
                          {forecast.expected}
                        </p>
                        <p className="text-[10px]" style={{ color: C.olive }}>צפוי</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold" style={{ color: C.gold, fontFamily: "Frank Ruhl Libre, serif" }}>
                          {forecast.optimistic}
                        </p>
                        <p className="text-[10px]" style={{ color: C.muted }}>אופטימי</p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[11px]" style={{ color: "rgba(51,51,51,0.35)" }}>
                  {forecast.hasEnoughData
                    ? `מבוסס על ${forecast.confirmRate}% שיעור אישור בקרב הנענים · אחוז מענה כללי: ${forecast.responseRate}%`
                    : `נדרשים לפחות 5 נענים לתחזית מדויקת · כרגע: אחוז מענה ${forecast.responseRate}%`}
                </p>
              </div>
            )}

            {/* Health Score */}
            {health && (
              <div
                className="rounded-2xl p-5"
                style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.gold }}>
                  ציון בריאות האירוע
                </p>

                {/* Score circle */}
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: health.tier === "green"
                        ? "rgba(107,123,90,0.12)"
                        : health.tier === "yellow"
                          ? "rgba(197,164,109,0.15)"
                          : "rgba(200,50,50,0.10)",
                    }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: health.tier === "green" ? C.olive : health.tier === "yellow" ? "#A07840" : "rgb(180,50,50)",
                        fontFamily: "Frank Ruhl Libre, serif",
                      }}
                    >
                      {health.score}
                    </span>
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: health.tier === "green" ? C.olive : health.tier === "yellow" ? "#A07840" : "rgb(180,50,50)",
                      }}
                    >
                      {health.score}/100 ·{" "}
                      {health.tier === "green" ? "מצב מצוין 🟢" : health.tier === "yellow" ? "מצב בינוני 🟡" : "דורש תשומת לב 🔴"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>{health.label}</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="flex flex-col gap-1.5">
                  {health.breakdown.map(({ factor, points, max }) => (
                    <div key={factor} className="flex items-center gap-2">
                      <span className="text-xs w-36 shrink-0" style={{ color: C.muted }}>{factor}</span>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(197,164,109,0.15)" }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(points / max) * 100}%`,
                            background: points / max >= 0.7 ? C.olive : points / max >= 0.4 ? C.gold : "rgba(200,100,100,0.6)",
                          }}
                        />
                      </div>
                      <span className="text-xs w-10 text-left shrink-0" style={{ color: C.muted }}>{points}/{max}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── KPI Cards ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "סה״כ מוזמנים",    value: total,              icon: Users,        color: C.gold    },
            { label: "אישרו הגעה",       value: confirmed,          icon: CheckCircle,  color: C.olive   },
            { label: "ממתינים",           value: pending,            icon: Clock,        color: "#A07840" },
            { label: "לא מגיעים",        value: declined,           icon: XCircle,      color: C.muted   },
            { label: "מגיעים בפועל",     value: attendees,          icon: Users,        color: C.olive   },
            { label: "אחוז מענה",        value: `${responseRate}%`, icon: Percent,      color: C.gold    },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex flex-col gap-1.5"
              style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}
            >
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color, flexShrink: 0 }} />
                <p className="text-xs" style={{ color: C.muted }}>{label}</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Approval status banner ─────────────────── */}
        {selectedEventId && approvalMap[selectedEventId] && (
          <div
            className="rounded-2xl p-3 mb-4 flex items-center gap-3 flex-wrap"
            style={{
              background: approvalMap[selectedEventId]?.status === "approved"
                ? "rgba(107,123,90,0.08)"
                : approvalMap[selectedEventId]?.status === "changes_requested"
                  ? "rgba(200,100,0,0.08)"
                  : "rgba(197,164,109,0.08)",
              border: `1px solid ${
                approvalMap[selectedEventId]?.status === "approved"
                  ? "rgba(107,123,90,0.20)"
                  : approvalMap[selectedEventId]?.status === "changes_requested"
                    ? "rgba(200,100,0,0.20)"
                    : "rgba(197,164,109,0.20)"
              }`,
            }}
          >
            <span className="text-sm font-semibold" style={{ color: C.dark }}>
              {approvalMap[selectedEventId]?.status === "approved" && "🟢 העיצוב אושר על ידי הלקוח"}
              {approvalMap[selectedEventId]?.status === "pending" && "🟡 ממתין לאישור לקוח"}
              {approvalMap[selectedEventId]?.status === "changes_requested" && "🔴 הלקוח ביקש תיקונים"}
            </span>
            {approvalMap[selectedEventId]?.client_comment && (
              <span className="text-xs italic" style={{ color: C.muted }}>
                &ldquo;{approvalMap[selectedEventId]?.client_comment}&rdquo;
              </span>
            )}
            <a
              href={`/approval/${selectedEventId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto text-xs underline"
              style={{ color: C.gold }}
            >
              עמוד אישור ↗
            </a>
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────── */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl flex-wrap" style={{ background: "rgba(197,164,109,0.08)", width: "fit-content" }}>
          {([
            ["command-center","מרכז בקרה"],
            ["guests","רשימת אורחים"],
            ["reminders","תזכורות"],
            ["analytics","📊 אנליטיקה"],
            ["couple-view","👀 מבט הזוג"],
            ["calendar","📅 לוח שנה"],
            ["history","🕓 היסטוריה"],
            ["recommendations","מרכז המלצות"],
            ["import-export","ייבוא / ייצוא"],
          ] as [Tab, string][]).map(
            ([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: activeTab === id ? C.ivory : "transparent",
                  color:      activeTab === id ? C.dark  : C.muted,
                  boxShadow:  activeTab === id ? "0 1px 6px rgba(197,164,109,0.12)" : "none",
                }}
              >
                {label}
                {id === "reminders" && pending > 0 && (
                  <span
                    className="mr-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(197,164,109,0.25)", color: "#A07840" }}
                  >
                    {pending}
                  </span>
                )}
                {id === "recommendations" && generateReminderRecommendations(overview).length > 0 && (
                  <span
                    className="mr-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: "rgba(200,80,60,0.15)", color: "rgb(180,60,60)" }}
                  >
                    {generateReminderRecommendations(overview).length}
                  </span>
                )}
              </button>
            )
          )}
        </div>

        {/* ══════════════════════════════════════════════
            TAB: Guest List
        ══════════════════════════════════════════════ */}
        {activeTab === "guests" && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={15} className="absolute top-1/2 -translate-y-1/2 right-3.5" style={{ color: C.muted }} />
                <input
                  placeholder="חיפוש לפי שם או טלפון…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none"
                  style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {([
                  ["all","הכל"],
                  ["confirmed","אישרו"],
                  ["pending","ממתינים"],
                  ["declined","לא מגיעים"],
                ] as [StatusFilter, string][]).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => { setStatusFilter(val); setPage(1); }}
                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: statusFilter === val ? `linear-gradient(135deg,${C.olive},#3E5435)` : C.ivory,
                      color:      statusFilter === val ? "white" : C.muted,
                      border:     statusFilter === val ? "none" : `1px solid ${C.border}`,
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddGuest(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white whitespace-nowrap"
                style={{ background: `linear-gradient(135deg,${C.gold},${C.goldL})` }}
              >
                <Plus size={14} /> הוסף אורח
              </button>
            </div>

            {/* Bulk WhatsApp Actions */}
            {total > 0 && (
              <div
                className="flex flex-wrap gap-2 mb-4 p-3 rounded-2xl"
                style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.15)" }}
              >
                <span className="text-xs font-semibold self-center" style={{ color: "#1A9B4E" }}>
                  <MessageCircle size={13} className="inline ml-1" />
                  שליחה מרוכזת:
                </span>
                <button
                  onClick={() => {
                    guests.forEach((g, i) => {
                      setTimeout(() => {
                        window.open(whatsappInviteLink(g.phone, g.name, g.rsvp_token), "_blank");
                      }, i * 500);
                    });
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:opacity-80"
                  style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E" }}
                >
                  הזמנה לכל האורחים ({total})
                </button>
                {pending > 0 && (
                  <>
                    <button
                      onClick={() => {
                        guests.filter((g) => g.status === "pending").forEach((g, i) => {
                          setTimeout(() => {
                            window.open(whatsappInviteLink(g.phone, g.name, g.rsvp_token), "_blank");
                          }, i * 500);
                        });
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:opacity-80"
                      style={{ background: "rgba(197,164,109,0.15)", color: "#A07840" }}
                    >
                      הזמנה לממתינים ({pending})
                    </button>
                    <button
                      onClick={() => {
                        guests.filter((g) => g.status === "pending" && g.phone).forEach((g, i) => {
                          setTimeout(() => {
                            window.open(
                              whatsappReminderLink(g.phone, g.name, g.rsvp_token, selectedEvent?.name ?? ""),
                              "_blank"
                            );
                          }, i * 500);
                        });
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-medium transition-all hover:opacity-80"
                      style={{ background: "rgba(107,123,90,0.10)", color: C.olive }}
                    >
                      תזכורת לממתינים ({pending})
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Add guest modal */}
            {showAddGuest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                <div
                  className="w-full max-w-sm rounded-3xl p-6"
                  style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                >
                  <h3 className="text-lg font-bold mb-4" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                    הוספת אורח
                  </h3>
                  <div className="flex flex-col gap-3 mb-4">
                    <input placeholder="שם *" value={addName} onChange={(e) => setAddName(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark }} />
                    <input placeholder="טלפון" value={addPhone} onChange={(e) => setAddPhone(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                      style={{ background: "white", border: `1px solid ${C.border}`, color: C.dark }} />
                    <div className="flex items-center gap-3">
                      <label className="text-sm" style={{ color: C.muted }}>מספר מוזמנים:</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAddCount((c) => Math.max(1, c - 1))}
                          className="w-8 h-8 rounded-lg font-bold" style={{ background: C.cream, color: C.olive }}>−</button>
                        <span className="w-6 text-center font-bold" style={{ color: C.dark }}>{addCount}</span>
                        <button onClick={() => setAddCount((c) => Math.min(20, c + 1))}
                          className="w-8 h-8 rounded-lg font-bold" style={{ background: C.cream, color: C.olive }}>+</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddGuest} disabled={addLoading || !addName}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                      style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)` }}>
                      {addLoading ? "מוסיף…" : "הוסף"}
                    </button>
                    <button onClick={() => setShowAddGuest(false)}
                      className="flex-1 py-3 rounded-xl text-sm" style={{ background: "rgba(51,51,51,0.07)", color: C.muted }}>
                      ביטול
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}`, boxShadow: "0 2px 16px rgba(197,164,109,0.06)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(197,164,109,0.07)", borderBottom: `1px solid ${C.borderS}` }}>
                      {["שם","טלפון","סטטוס","מוזמנים","מנה","זמן תגובה","נפתח","פעולות"].map((h) => (
                        <th key={h} className="text-right px-4 py-3 font-semibold text-xs" style={{ color: C.muted }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guestsLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <Loader2 size={24} className="animate-spin mx-auto" style={{ color: C.gold }} />
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm" style={{ color: C.muted }}>
                          לא נמצאו אורחים
                        </td>
                      </tr>
                    ) : paginated.map((g, i) => (
                      <React.Fragment key={g.id}>
                      <tr
                        style={{
                          background: i % 2 === 0 ? C.ivory : "white",
                          borderBottom: `1px solid ${C.borderS}`,
                        }}
                      >
                        <td className="px-4 py-3 font-medium" style={{ color: C.dark }}>{g.name}</td>
                        <td className="px-4 py-3" style={{ color: C.muted }}>{g.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <select
                            value={g.status}
                            onChange={(e) => handleStatusChange(g.id, e.target.value as GuestStatus)}
                            className="rounded-lg px-2.5 py-1 text-xs font-medium outline-none cursor-pointer"
                            style={{
                              background: (STATUS_COLOR[g.status] ?? STATUS_COLOR.pending).bg,
                              color: (STATUS_COLOR[g.status] ?? STATUS_COLOR.pending).color,
                              border: "none",
                            }}
                          >
                            {(["confirmed","pending","declined"] as GuestStatus[]).map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center" style={{ color: C.dark }}>{g.guest_count}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: C.muted }}>
                          {g.meal_preference
                            ? ({ regular: "🍽️ רגיל", vegetarian: "🥗 צמחוני", vegan: "🌱 טבעוני", mehadrin: "✡️ מהדרין" }[g.meal_preference] ?? g.meal_preference)
                            : "—"}
                          {g.meal_note && <span title={g.meal_note} style={{ marginRight: 4, opacity: 0.5 }}>📝</span>}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: C.muted }}>
                          {g.response_time
                            ? new Date(g.response_time).toLocaleString("he-IL", {
                                day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: C.muted }}>
                          {g.opened_at
                            ? new Date(g.opened_at).toLocaleString("he-IL", {
                                day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              title="היסטוריה"
                              onClick={() => toggleTimeline(g.id)}
                              className="p-1.5 rounded-lg transition-all hover:opacity-70"
                              style={{
                                background: expandedGuestId === g.id ? "rgba(107,123,90,0.18)" : "rgba(107,123,90,0.08)",
                                color: C.olive,
                              }}
                            >
                              <Clock size={13} />
                            </button>
                            <button
                              title="העתק קישור RSVP"
                              onClick={() => copyRsvpLink(g.rsvp_token)}
                              className="p-1.5 rounded-lg transition-all hover:opacity-70"
                              style={{ background: "rgba(197,164,109,0.10)", color: C.gold }}
                            >
                              <Copy size={13} />
                            </button>
                            <a
                              href={whatsappInviteLink(g.phone, g.name, g.rsvp_token)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="שלח הזמנה בוואטסאפ"
                              onClick={() => logActivity(g.id, "invitation_sent")}
                              className="p-1.5 rounded-lg transition-all hover:opacity-70"
                              style={{ background: "rgba(37,211,102,0.10)", color: "#25D366" }}
                            >
                              <MessageCircle size={13} />
                            </a>
                            <button
                              title="מחק"
                              onClick={() => handleDelete(g.id)}
                              className="p-1.5 rounded-lg transition-all hover:opacity-70"
                              style={{ background: "rgba(220,50,50,0.07)", color: "rgba(200,50,50,0.60)" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Timeline row */}
                      {expandedGuestId === g.id && (
                        <tr style={{ background: "rgba(107,123,90,0.04)" }}>
                          <td colSpan={7} className="px-6 py-3">
                            {activityLoading && !activityMap[g.id] ? (
                              <Loader2 size={14} className="animate-spin" style={{ color: C.gold }} />
                            ) : (activityMap[g.id] ?? []).length === 0 ? (
                              <p className="text-xs" style={{ color: C.muted }}>אין פעילות רשומה עדיין</p>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                {(activityMap[g.id] ?? []).map((ev) => (
                                  <div key={ev.id} className="flex items-center gap-3 text-xs">
                                    <span style={{ color: C.gold }}>·</span>
                                    <span style={{ color: C.muted }}>
                                      {new Date(ev.created_at).toLocaleString("he-IL", {
                                        day: "numeric", month: "numeric",
                                        hour: "2-digit", minute: "2-digit",
                                      })}
                                    </span>
                                    <span style={{ color: C.dark }}>
                                      {{
                                        invitation_sent: "📩 הזמנה נשלחה",
                                        reminder_sent:   "🔔 תזכורת נשלחה",
                                        rsvp_opened:     "👁 דף RSVP נפתח",
                                        rsvp_submitted:  "✅ תגובה התקבלה",
                                      }[ev.event_type] ?? ev.event_type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderTop: `1px solid ${C.borderS}`, background: C.ivory }}
                >
                  <span className="text-xs" style={{ color: C.muted }}>
                    עמוד {page} מתוך {totalPages} · {filtered.length} אורחים
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-1.5 rounded-lg disabled:opacity-30"
                      style={{ background: C.cream, color: C.olive }}
                    >
                      <ChevronRight size={15} />
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-1.5 rounded-lg disabled:opacity-30"
                      style={{ background: C.cream, color: C.olive }}
                    >
                      <ChevronLeft size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: Reminders
        ══════════════════════════════════════════════ */}
        {activeTab === "reminders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                  תזכורות לממתינים
                </h2>
                <p className="text-sm" style={{ color: C.muted }}>
                  {pending} אורחים עדיין לא אישרו הגעה
                </p>
              </div>
              {pending > 0 && (
                <button
                  onClick={() => {
                    const pendingGuests = guests.filter((g) => g.status === "pending" && g.phone);
                    pendingGuests.forEach((g, i) => {
                      setTimeout(() => {
                        window.open(
                          whatsappReminderLink(g.phone, g.name, g.rsvp_token, selectedEvent?.name ?? ""),
                          "_blank"
                        );
                      }, i * 500);
                    });
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E" }}
                >
                  <MessageCircle size={14} /> שלח תזכורות לכולם
                </button>
              )}
            </div>

            {pending === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: C.ivory, border: `1px solid ${C.border}` }}
              >
                <CheckCircle size={36} className="mx-auto mb-3" style={{ color: C.olive }} />
                <p className="font-semibold" style={{ color: C.dark }}>כל האורחים ענו! 🎊</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                {guests
                  .filter((g) => g.status === "pending")
                  .map((g, i) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-4 px-4 py-3.5"
                      style={{
                        background: i % 2 === 0 ? C.ivory : "white",
                        borderBottom: `1px solid ${C.borderS}`,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: C.dark }}>{g.name}</p>
                        <p className="text-xs" style={{ color: C.muted }}>{g.phone || "אין מספר"}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyRsvpLink(g.rsvp_token)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
                          style={{ background: "rgba(197,164,109,0.10)", color: C.gold }}
                        >
                          <Copy size={11} /> קישור
                        </button>
                        {g.phone && (
                          <a
                            href={whatsappReminderLink(g.phone, g.name, g.rsvp_token, selectedEvent?.name ?? "")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
                            style={{ background: "rgba(37,211,102,0.10)", color: "#1A9B4E" }}
                          >
                            <MessageCircle size={11} /> שלח
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ── Thank-you messages ─────────────────────── */}
            <ThankYouSection
              guests={guests}
              eventName={selectedEvent?.name ?? ""}
              eventId={selectedEventId ?? ""}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: Reminder Recommendations
        ══════════════════════════════════════════════ */}
        {activeTab === "couple-view" && selectedEvent?.couple_token && (
          <CoupleView token={selectedEvent.couple_token} eventName={selectedEvent.name} />
        )}
        {activeTab === "couple-view" && !selectedEvent?.couple_token && (
          <div className="rounded-2xl p-10 text-center" style={{ background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)" }}>
            <p style={{ color: "rgba(51,51,51,0.4)", fontFamily: "Heebo, sans-serif" }}>לאירוע זה אין עדיין קישור זוג</p>
          </div>
        )}

        {activeTab === "calendar" && (
          <AdminCalendar events={events} onSelectEvent={(id) => setSelectedEventId(id)} selectedEventId={selectedEventId} />
        )}

        {activeTab === "history" && selectedEventId && (
          <AdminHistory eventId={selectedEventId} />
        )}
        {activeTab === "history" && !selectedEventId && (
          <div className="rounded-2xl p-10 text-center" style={{ background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.22)" }}>
            <p style={{ color: "rgba(51,51,51,0.4)", fontFamily: "Heebo, sans-serif" }}>בחר אירוע כדי לראות היסטוריה</p>
          </div>
        )}

        {activeTab === "recommendations" && (
          <ReminderCenter overview={overview} onSelectEvent={(id) => { setSelectedEventId(id); setActiveTab("reminders"); }} />
        )}

        {/* ══════════════════════════════════════════════
            TAB: Analytics
        ══════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <AdminAnalytics guests={guests} events={events} selectedEventId={selectedEventId} />
        )}

        {/* ══════════════════════════════════════════════
            TAB: Import / Export
        ══════════════════════════════════════════════ */}
        {activeTab === "import-export" && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Import */}
            <div
              className="rounded-2xl p-6"
              style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}
            >
              <h3 className="font-bold mb-1" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                ייבוא מאקסל
              </h3>
              <p className="text-xs mb-4" style={{ color: C.muted }}>
                עמודות נדרשות: <strong>שם</strong> · <strong>טלפון</strong> · <strong>מספר מוזמנים</strong>
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportResult(null); }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed py-8 mb-3 flex flex-col items-center gap-2 transition-all hover:opacity-70"
                style={{ borderColor: C.border, color: C.muted }}
              >
                <Upload size={24} style={{ color: C.gold }} />
                <span className="text-sm">
                  {importFile ? importFile.name : "לחצו לבחירת קובץ Excel"}
                </span>
              </button>

              {importResult && (
                <p
                  className="text-sm text-center mb-3 font-medium"
                  style={{ color: importResult.startsWith("✅") ? C.olive : "rgb(200,50,50)" }}
                >
                  {importResult}
                </p>
              )}

              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: `linear-gradient(135deg,${C.olive},#3E5435)` }}
              >
                {importing
                  ? <><Loader2 size={15} className="animate-spin" /> מייבא…</>
                  : <><Upload size={15} /> ייבא אורחים</>}
              </button>

              <p className="text-xs mt-3 text-center" style={{ color: "rgba(51,51,51,0.30)" }}>
                הקובץ יתווסף לאירוע הנוכחי
              </p>
            </div>

            {/* Export */}
            <div
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: C.ivory, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(197,164,109,0.06)" }}
            >
              <h3 className="font-bold mb-1" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>
                ייצוא לאקסל
              </h3>
              <p className="text-xs mb-6" style={{ color: C.muted }}>
                הורדת רשימת כל המוזמנים עם הסטטוסים וזמני התגובה
              </p>

              <div className="flex-1 flex flex-col items-center justify-center py-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(107,123,90,0.10)" }}
                >
                  <Download size={28} style={{ color: C.olive }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: C.dark }}>{total} אורחים</p>
                <p className="text-xs mb-6" style={{ color: C.muted }}>
                  {confirmed} אישרו · {pending} ממתינים · {declined} לא מגיעים
                </p>
                <button
                  onClick={handleExport}
                  disabled={!selectedEventId || total === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg,${C.gold},${C.goldL})` }}
                >
                  <Download size={15} /> הורד Excel
                </button>
              </div>

              {/* Venue PDF Report */}
              <div className="mt-4">
                <button
                  onClick={async () => {
                    if (!selectedEventId) return;
                    const { generateVenueReportPdf } = await import("@/lib/venue-report");
                    await generateVenueReportPdf({
                      eventName:    selectedEvent?.name ?? "האירוע",
                      eventDate:    selectedEvent?.date ?? "",
                      eventAddress: selectedEvent?.address,
                      total, confirmed, declined, pending, attendees,
                      forecast,
                      health,
                      generatedAt: new Date().toLocaleString("he-IL"),
                    });
                  }}
                  disabled={!selectedEventId || total === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-all hover:opacity-80"
                  style={{ background: `linear-gradient(135deg,${C.gold},${C.goldL})`, color: "white" }}
                >
                  <Download size={15} /> ייצוא דוח לאולם (PDF)
                </button>
                <p className="text-xs text-center mt-2" style={{ color: "rgba(51,51,51,0.35)" }}>
                  כולל נוכחות צפויה, ציון בריאות ופרטי האירוע
                </p>
              </div>

              {/* RSVP base URL info */}
              <div
                className="mt-4 p-3 rounded-xl"
                style={{ background: "rgba(197,164,109,0.07)", border: `1px solid ${C.borderS}` }}
              >
                <p className="text-xs mb-1 font-medium" style={{ color: C.muted }}>קישור RSVP לאורחים:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs truncate flex-1" style={{ color: C.dark }}>
                    {(process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : ""))}/rsvp/[token]
                  </code>
                  <ExternalLink size={12} style={{ color: C.gold, flexShrink: 0 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: Command Center
        ══════════════════════════════════════════════ */}
        {activeTab === "command-center" && (
          <div>
            {overviewLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin" style={{ color: C.gold }} />
              </div>
            ) : (
              <div className="flex flex-col gap-6">

                {/* Task Queue */}
                {tasks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.gold }}>
                      תור משימות
                    </p>
                    <div className="flex flex-col gap-2">
                      {tasks.map((task: Task) => {
                        const isUrgent = task.priority === "urgent";
                        const isHigh   = task.priority === "high";
                        return (
                          <div
                            key={task.id}
                            className="rounded-2xl p-4"
                            style={{
                              background: C.ivory,
                              border: `1px solid ${isUrgent ? "rgba(200,60,60,0.30)" : isHigh ? "rgba(197,164,109,0.30)" : C.border}`,
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5"
                                style={{
                                  background: isUrgent ? "rgba(200,60,60,0.10)" : isHigh ? "rgba(197,164,109,0.15)" : "rgba(107,123,90,0.08)",
                                  color: isUrgent ? "rgb(180,60,60)" : isHigh ? "#A07840" : C.olive,
                                }}
                              >
                                {isUrgent ? "דחוף" : isHigh ? "גבוה" : task.priority === "medium" ? "בינוני" : "נמוך"}
                              </span>
                              <div className="flex-1">
                                <p className="text-xs mb-0.5" style={{ color: C.muted }}>{task.eventName}</p>
                                <p className="text-sm font-semibold mb-1" style={{ color: C.dark }}>{task.title}</p>
                                <p className="text-xs" style={{ color: C.muted }}>{task.description}</p>
                              </div>
                              <div className="text-left shrink-0">
                                <p className="text-[10px]" style={{ color: C.muted }}>{task.dueContext}</p>
                                <button
                                  onClick={() => { setSelectedEventId(task.eventId); setActiveTab(task.actionType === "send_reminders" || task.actionType === "send_invitations" ? "reminders" : "guests"); }}
                                  className="text-xs mt-1 px-2.5 py-1 rounded-lg font-medium"
                                  style={{ background: "rgba(197,164,109,0.12)", color: C.gold }}
                                >
                                  פתח
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tasks.filter((t) => t.priority === "urgent" || t.priority === "high").length === 0 && (
                  <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(107,123,90,0.06)", border: `1px solid rgba(107,123,90,0.15)` }}>
                    <p className="text-sm" style={{ color: C.olive }}>✅ אין משימות דחופות כרגע</p>
                  </div>
                )}

                {/* Global stats strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "אירועים פעילים",   value: overview.filter((e) => e.daysUntilEvent > 0).length },
                    { label: "סה״כ מוזמנים",      value: overview.reduce((s, e) => s + e.total, 0) },
                    { label: "ממוצע מענה",         value: overview.length > 0 ? `${Math.round(overview.reduce((s, e) => s + e.responseRate, 0) / overview.length)}%` : "—" },
                    { label: "דורשים תשומת לב",   value: overview.filter((e) => e.needsAttention).length },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl p-4 text-center"
                      style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                      <p className="text-2xl font-bold mb-0.5" style={{ color: C.dark, fontFamily: "Frank Ruhl Libre, serif" }}>{value}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Needs attention */}
                {overview.filter((e) => e.needsAttention).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "rgb(180,60,60)" }}>
                      ⚠ דורשים טיפול מיידי
                    </p>
                    <div className="flex flex-col gap-2">
                      {overview.filter((e) => e.needsAttention).map((ev) => (
                        <EventCard key={ev.id} ev={ev} approvalStatus={approvalMap[ev.id]?.status} onSelect={() => { setSelectedEventId(ev.id); setActiveTab("guests"); }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All events — with search + filter */}
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>
                      כל האירועים
                    </p>
                    <div className="flex gap-1 mr-auto flex-wrap">
                      {(["all","attention","upcoming"] as const).map((f) => (
                        <button key={f}
                          onClick={() => setEventFilter(f)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                          style={{
                            background: eventFilter === f ? `linear-gradient(135deg,${C.olive},#3E5435)` : C.ivory,
                            color: eventFilter === f ? "white" : C.muted,
                            border: eventFilter === f ? "none" : `1px solid ${C.border}`,
                          }}
                        >
                          { f === "all" ? "הכל" : f === "attention" ? "דורשים טיפול" : "קרובים (30 יום)" }
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative mb-3">
                    <Search size={13} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: C.muted }} />
                    <input
                      placeholder="חיפוש לפי שם אירוע…"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full rounded-xl pr-9 pl-4 py-2 text-sm outline-none"
                      style={{ background: C.ivory, border: `1px solid ${C.border}`, color: C.dark }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {overview
                      .filter((ev) => {
                        if (eventFilter === "attention") return ev.needsAttention;
                        if (eventFilter === "upcoming")  return ev.daysUntilEvent > 0 && ev.daysUntilEvent <= 30;
                        return true;
                      })
                      .filter((ev) => !eventSearch || ev.name.includes(eventSearch))
                      .map((ev) => (
                        <EventCard key={ev.id} ev={ev} approvalStatus={approvalMap[ev.id]?.status} onSelect={() => { setSelectedEventId(ev.id); setActiveTab("guests"); }} />
                      ))}
                    {overview.filter((ev) => {
                      if (eventFilter === "attention") return ev.needsAttention;
                      if (eventFilter === "upcoming")  return ev.daysUntilEvent > 0 && ev.daysUntilEvent <= 30;
                      return true;
                    }).filter((ev) => !eventSearch || ev.name.includes(eventSearch)).length === 0 && (
                      <p className="text-sm text-center py-8" style={{ color: C.muted }}>אין אירועים תואמים</p>
                    )}
                  </div>
                </div>

                {/* Business Intelligence */}
                {overview.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.gold }}>
                      סיכום עסקי
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {/* Top performing events */}
                      <div className="rounded-2xl p-4" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>אירועים עם אחוז מענה גבוה</p>
                        {[...overview]
                          .filter((e) => e.total > 0)
                          .sort((a, b) => b.responseRate - a.responseRate)
                          .slice(0, 3)
                          .map((ev) => (
                            <div key={ev.id} className="flex items-center gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: C.dark }}>{ev.name}</p>
                              </div>
                              <div className="h-1.5 w-20 rounded-full shrink-0" style={{ background: "rgba(197,164,109,0.15)" }}>
                                <div className="h-1.5 rounded-full" style={{ width: `${ev.responseRate}%`, background: C.olive }} />
                              </div>
                              <span className="text-xs w-8 text-left" style={{ color: C.olive }}>{ev.responseRate}%</span>
                            </div>
                          ))}
                      </div>
                      {/* Attendance summary */}
                      <div className="rounded-2xl p-4" style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: C.muted }}>סיכום נוכחות כוללת</p>
                        {[
                          { label: "סה״כ אישרו",    value: overview.reduce((s, e) => s + e.confirmed, 0), color: C.olive },
                          { label: "סה״כ ממתינים",   value: overview.reduce((s, e) => s + e.pending,   0), color: "#A07840" },
                          { label: "סה״כ לא מגיעים", value: overview.reduce((s, e) => s + e.declined,  0), color: C.muted },
                          { label: "כיסאות צפויים",  value: overview.reduce((s, e) => s + e.attendees, 0), color: C.gold },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex justify-between text-xs mb-1.5">
                            <span style={{ color: C.muted }}>{label}</span>
                            <span className="font-bold" style={{ color }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Follow-up queue: opened but not responded */}
                {overview.some((e) => e.openedPending > 0) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: C.gold }}>
                      👁 פתחו קישור — טרם ענו
                    </p>
                    <div className="flex flex-col gap-2">
                      {overview.filter((e) => e.openedPending > 0).map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between rounded-xl px-4 py-3"
                          style={{ background: C.ivory, border: `1px solid ${C.border}` }}>
                          <div>
                            <p className="text-sm font-medium" style={{ color: C.dark }}>{ev.name}</p>
                            <p className="text-xs" style={{ color: C.muted }}>
                              {ev.openedPending} אורחים פתחו אך לא ענו
                            </p>
                          </div>
                          <button
                            onClick={() => { setSelectedEventId(ev.id); setActiveTab("reminders"); }}
                            className="text-xs px-3 py-1.5 rounded-xl font-medium"
                            style={{ background: "rgba(37,211,102,0.12)", color: "#1A9B4E" }}
                          >
                            שלח תזכורות
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coupons section */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.gold }}>
                      🎟️ קופונים והנחות
                    </p>
                    <button
                      onClick={async () => {
                        if (!showCoupons) {
                          setCouponsLoading(true);
                          try {
                            const res = await fetch("/api/coupons");
                            const data = await res.json();
                            setCoupons(Array.isArray(data) ? data : []);
                          } catch { /* ignore */ }
                          setCouponsLoading(false);
                        }
                        setShowCoupons((v) => !v);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium"
                      style={{ background: "rgba(197,164,109,0.10)", color: C.gold }}
                    >
                      {showCoupons ? "הסתר" : "הצג רשימה"}
                    </button>
                  </div>
                  {showCoupons && (
                    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                      {couponsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 size={20} className="animate-spin" style={{ color: C.gold }} />
                        </div>
                      ) : coupons.length === 0 ? (
                        <p className="text-sm text-center py-8" style={{ color: C.muted }}>אין קופונים עדיין</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ background: "rgba(197,164,109,0.08)", borderBottom: `1px solid ${C.border}` }}>
                              {["קוד", "הנחה", "סטטוס", "נוצר עבור"].map((h) => (
                                <th key={h} className="text-right px-4 py-2 text-xs font-semibold" style={{ color: C.muted }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {coupons.map((c) => (
                              <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                                <td className="px-4 py-2.5 font-mono font-bold" style={{ color: C.dark }}>{c.code}</td>
                                <td className="px-4 py-2.5" style={{ color: C.olive }}>{c.discount_pct}%</td>
                                <td className="px-4 py-2.5">
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{ background: c.used_by_event_id ? "rgba(200,60,60,0.10)" : "rgba(107,123,90,0.10)", color: c.used_by_event_id ? "rgb(180,50,50)" : C.olive }}>
                                    {c.used_by_event_id ? `נוצל — ${c.used_by_event?.name ?? ""}` : "פנוי"}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-xs" style={{ color: C.muted }}>{c.created_by_event?.name ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* Global chat widget — visible whenever an event is selected */}
      {selectedEventId && (
        <ChatWidget
          fetchUrl={`/api/admin/chat/${selectedEventId}`}
          postUrl={`/api/admin/chat/${selectedEventId}`}
          myRole="admin"
          accentColor="#C5A46D"
          label={`💬 צ׳אט עם ${selectedEvent?.name ?? "הזוג"}`}
        />
      )}
    </div>
  );
}

/* ── Event Card (used in Command Center) ────────────── */
function EventCard({ ev, approvalStatus, onSelect }: { ev: EventSummary; approvalStatus?: string; onSelect: () => void }) {
  const C = {
    ivory: "#FDFAF5", dark: "#333333", muted: "rgba(51,51,51,0.55)",
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
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: "rgba(200,60,60,0.10)", color: "rgb(180,60,60)" }}>
                דחוף
              </span>
            )}
            {statusLabel && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white"
                style={{ background: statusColor }}
              >
                {statusLabel}
              </span>
            )}
            {approvalStatus === "pending"           && <span className="text-[10px]">🟡</span>}
            {approvalStatus === "approved"          && <span className="text-[10px]">🟢</span>}
            {approvalStatus === "changes_requested" && <span className="text-[10px]">🔴</span>}
          </div>
          {ev.client_name && (
            <p className="text-[11px] mb-1" style={{ color: C.gold }}>לקוח: {ev.client_name}</p>
          )}
          <p className="text-xs mb-2" style={{ color: C.muted }}>
            {new Date(ev.date).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            {ev.daysUntilEvent > 0 ? ` · עוד ${ev.daysUntilEvent} ימים` : ev.daysUntilEvent === 0 ? " · היום!" : " · עבר"}
          </p>
          <div className="flex gap-4 text-xs flex-wrap" style={{ color: C.muted }}>
            <span>{ev.total} מוזמנים</span>
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

function AdminCalendar({ events, onSelectEvent, selectedEventId }: {
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
                          className="w-full text-right text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 truncate"
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

function AdminHistory({ eventId }: { eventId: string }) {
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
              <p className="text-[11px] shrink-0" style={{ color: C2.muted }}>
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

function CoupleView({ token, eventName }: { token: string; eventName: string }) {
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
function ThankYouSection({ guests, eventName, eventId }: { guests: Guest[]; eventName: string; eventId: string }) {
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
              <p className="text-[10px]" style={{ color: C2.muted }}>{g.phone}</p>
            </div>
            <a
              href={whatsappThankYouLink(g.phone, g.name, eventName, galleryUrl || null)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg shrink-0"
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
function ReminderCenter({
  overview,
  onSelectEvent,
}: {
  overview: EventSummary[];
  onSelectEvent: (id: string) => void;
}) {
  const C = {
    ivory: "#FDFAF5", dark: "#333333", muted: "rgba(51,51,51,0.55)",
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
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
                    <p className="text-[10px]" style={{ color: C.muted }}>
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
function AdminAgenda({ events, onSelect }: { events: Event[]; onSelect: (id: string) => void }) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed || events.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inWeek = new Date(today.getTime() + 7 * 86_400_000);

  const upcoming = events
    .filter(e => e.date)
    .map(e => {
      const d = new Date(e.date + "T00:00:00");
      const diffDays = Math.round((d.getTime() - today.getTime()) / 86_400_000);
      return { ...e, diffDays };
    })
    .filter(e => e.diffDays >= 0 && e.diffDays <= 60)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 6);

  if (upcoming.length === 0) return null;

  return (
    <div className="mb-5 rounded-2xl p-4" style={{ background: "rgba(197,164,109,0.07)", border: "1px solid rgba(197,164,109,0.2)" }}>
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
            <button
              key={ev.id}
              onClick={() => onSelect(ev.id)}
              className="flex-shrink-0 rounded-xl p-3 text-right transition-all hover:scale-105"
              style={{ background: "#FDFAF5", border: "1px solid rgba(197,164,109,0.25)", minWidth: 160, cursor: "pointer" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badgeBg, color: badgeColor }}>{label}</span>
              </div>
              <p className="text-xs font-semibold truncate" style={{ color: "#1C1008", fontFamily: "Frank Ruhl Libre, serif", maxWidth: 140 }}>{ev.name}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(28,16,8,0.45)", fontFamily: "Heebo, sans-serif" }}>
                {new Date(ev.date + "T00:00:00").toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   AdminAnalytics — Guest analytics dashboard
══════════════════════════════════════════════════════ */
function AdminAnalytics({ guests, events, selectedEventId }: { guests: Guest[]; events: Event[]; selectedEventId: string | null }) {
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
      <p style={{ fontSize: 11, color: "rgba(28,16,8,0.45)", marginBottom: 6, ...HEEBO }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color, ...FRANK }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "rgba(28,16,8,0.4)", marginTop: 4, ...HEEBO }}>{sub}</p>}
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
        <p style={{ fontSize: 11, color: "rgba(28,16,8,0.4)", marginBottom: 16, ...HEEBO }}>
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
              <span style={{ fontSize: 11, minWidth: 48, color: "rgba(28,16,8,0.55)", ...HEEBO }}>{label}</span>
              <div style={{ flex: 1, height: 16, background: "rgba(197,164,109,0.1)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(dayBuckets[i] / maxDayCount) * 100}%`, background: `linear-gradient(90deg,${GOLD},${GOLD}88)`, borderRadius: 8, transition: "width 0.4s ease" }} />
              </div>
              <span style={{ fontSize: 11, minWidth: 20, color: "rgba(28,16,8,0.4)", textAlign: "left", ...HEEBO }}>{dayBuckets[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Response time histogram */}
      {responseTimes.length > 0 && (
        <div style={CARD}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: DARK, ...HEEBO }}>התפלגות זמני תגובה</p>
          <p style={{ fontSize: 11, color: "rgba(28,16,8,0.4)", marginBottom: 16, ...HEEBO }}>
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
                <p style={{ fontSize: 10, color, marginTop: 4, ...HEEBO }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
