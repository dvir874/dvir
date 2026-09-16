"use client";

import { use, useEffect, useState, useCallback } from "react";
import {
  ArrowRight, Phone, PhoneOff, Info, Save, Lightbulb, LayoutGrid, DoorOpen,
  CheckCircle2, AlertTriangle, Route, Search, GripVertical, Plus, X, Sparkles,
  Share2, Check, Users, Ruler,
} from "lucide-react";
import SeatingFloorPlan from "@/components/SeatingFloorPlan";
import HelpButton from "@/components/HelpButton";
import { coupleName } from "@/lib/couple-name";

/* סידור הושבה והגדרת אולם — the approved Stitch screen.
 *
 * Project "Rega Lifney Hebrew Wedding Hero", screen 2e05669d. It did not come
 * from the nine briefs; it came from the evening of 14/09 with איילת, and its
 * argument is in its own first card: a couple does not need the venue's
 * drawing to start. Two numbers do — how many tables, how many seats each —
 * and a hall answers both on the phone in a minute.
 *
 * So the screen is two stages, in the order the work actually happens.
 * Stage one builds the room. Stage two fills it. Everything that used to be a
 * `prompt()` — the seats-per-table question, the "are you sure" before an auto
 * seating wipes the plan — is a field or a dialog here, because a prompt()
 * cannot show what it is about to delete.
 *
 * The room fields are unchanged on purpose: the design's "24=10, 35=9, 1=14"
 * and "1-10=רחבת ריקודים" are exactly the syntax parseRanges already reads.
 *
 * Colours are the project's Wave-0 tokens, not the Material palette the Stitch
 * file carries. They are the same warm scale under different names — its
 * tertiary-fixed-dim #E5C188 IS our primary-soft — and this app's whole
 * redesign exists because it had 27 inline palettes. Adding a 28th to match a
 * token sheet would undo the point of the wave.
 *
 * The page top nav in the design (event tabs, footer) belongs to the couple
 * portal shell, which every other couple screen shares. That is a shell-wide
 * change and is not this screen's to make, so the existing shell is kept.
 */

const TABLE_TYPES = [
  { value: "round",       label: "עגול"   },
  { value: "rectangular", label: "מלבני"  },
];

interface SeatingTable      { id: string; name: string; capacity: number; type: string; sort_order: number; zone?: string | null }
interface SeatingAssignment { id: string; guest_id: string; table_id: string }
interface Guest             { id: string; name: string; guest_count: number; status?: string; phone?: string | null; source_group?: string | null; side?: string | null }
interface EventInfo         { name?: string | null; couple_names?: string | null; date?: string | null; venue_name?: string | null }
interface SeatingData { tables: SeatingTable[]; assignments: SeatingAssignment[]; guests: Guest[]; event: EventInfo | null }

type Filter = "all" | "confirmed" | "pending" | "declined" | "unseated";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
}

/* Days to the wedding, in whole days, Israel time. Returns null rather than a
   number when there is no date, so the countdown is absent instead of wrong. */
function daysUntil(date: string | null | undefined): number | null {
  if (!date) return null;
  const t = new Date(`${String(date).slice(0, 10)}T00:00:00+03:00`).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.ceil((t - Date.now()) / 86_400_000));
}

function RoundTableSVG({ table, assigned, capacity, guestById, onRemoveGuest }: {
  table: SeatingTable; assigned: SeatingAssignment[]; capacity: number;
  guestById: (id: string) => Guest | undefined; onRemoveGuest: (id: string) => void;
}) {
  const cx = 60, cy = 60, tableR = 38, seatR = 9, orbitR = 54;
  const seats = Array.from({ length: capacity }, (_, i) => {
    const angle = (i / capacity) * 2 * Math.PI - Math.PI / 2;
    const assignment = assigned[i];
    const guest = assignment ? guestById(assignment.guest_id) : undefined;
    return { x: cx + orbitR * Math.cos(angle), y: cy + orbitR * Math.sin(angle), assignment, guest };
  });
  return (
    <svg viewBox="0 0 120 120" width={120} height={120} style={{ overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={tableR} fill="#FDF8EF" stroke="#C5A46D" strokeWidth={1.5} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={9} fill="#1C1008" fontFamily="Frank Ruhl Libre, serif" fontWeight={700}>{table.name}</text>
      {seats.map(({ x, y, assignment, guest }, i) => (
        <g key={i} onClick={assignment ? () => onRemoveGuest(assignment.guest_id) : undefined} style={{ cursor: assignment ? "pointer" : "default" }}>
          <circle cx={x} cy={y} r={seatR} fill={guest ? "#6B7B5A" : "rgba(197,164,109,0.15)"} stroke={guest ? "#6B7B5A" : "rgba(197,164,109,0.3)"} strokeWidth={1} />
          {guest && <text x={x} y={y + 3.5} textAnchor="middle" fontSize={6} fill="white" fontFamily="Heebo, sans-serif" fontWeight={600} style={{ pointerEvents: "none" }}>{getInitials(guest.name)}</text>}
        </g>
      ))}
    </svg>
  );
}

function RectTableSVG({ table, assigned, capacity, guestById, onRemoveGuest }: {
  table: SeatingTable; assigned: SeatingAssignment[]; capacity: number;
  guestById: (id: string) => Guest | undefined; onRemoveGuest: (id: string) => void;
}) {
  const seatR = 8, rectX = 20, rectY = 25, rectW = 120, rectH = 50;
  const totalW = rectX * 2 + rectW, totalH = rectY * 2 + rectH;
  const perSide = Math.ceil(capacity / 2);
  const seats = Array.from({ length: capacity }, (_, i) => {
    const top = i < perSide;
    const idx = top ? i : i - perSide;
    const count = top ? perSide : capacity - perSide;
    const step = rectW / (count + 1);
    const assignment = assigned[i];
    return {
      x: rectX + step * (idx + 1),
      y: top ? rectY - 10 : rectY + rectH + 10,
      assignment, guest: assignment ? guestById(assignment.guest_id) : undefined,
    };
  });
  return (
    <svg viewBox={`0 0 ${totalW} ${totalH}`} width={totalW} height={totalH} style={{ overflow: "visible" }}>
      <rect x={rectX} y={rectY} width={rectW} height={rectH} rx={6} fill="#FDF8EF" stroke="#C5A46D" strokeWidth={1.5} />
      <text x={totalW / 2} y={rectY + rectH / 2 + 5} textAnchor="middle" fontSize={11} fill="#1C1008" fontFamily="Frank Ruhl Libre, serif" fontWeight={700}>{table.name}</text>
      {seats.map(({ x, y, assignment, guest }, i) => (
        <g key={i} onClick={assignment ? () => onRemoveGuest(assignment.guest_id) : undefined} style={{ cursor: assignment ? "pointer" : "default" }}>
          <circle cx={x} cy={y} r={seatR} fill={guest ? "#6B7B5A" : "rgba(197,164,109,0.15)"} stroke={guest ? "#6B7B5A" : "rgba(197,164,109,0.3)"} strokeWidth={1} />
          {guest && <text x={x} y={y + 3} textAnchor="middle" fontSize={6} fill="white" fontFamily="Heebo, sans-serif" fontWeight={600} style={{ pointerEvents: "none" }}>{getInitials(guest.name)}</text>}
        </g>
      ))}
    </svg>
  );
}

export default function CoupleSeatingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data,          setData]          = useState<SeatingData>({ tables: [], assignments: [], guests: [], event: null });
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [search,        setSearch]        = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);
  const [showAddTable,   setShowAddTable]   = useState(false);
  const [newTable,       setNewTable]       = useState({ name: "", capacity: 10, type: "round" });
  const [showSimulator,  setShowSimulator]  = useState(false);
  const [simExpanded,    setSimExpanded]    = useState<string | null>(null);

  /* The room-plan fields live up here with the other hooks, above the
     `if (loading) return` below.

     They used to sit further down, next to the markup that reads them. That
     put seven useState calls after an early return: on the first render
     loading was true and eleven hooks ran, and the moment the fetch came back
     React reached the twelfth and threw "Rendered more hooks than during the
     previous render". Every couple who opened הושבה got משהו השתבש — the
     screen failed as soon as its data arrived, so it never once worked.

     Everything the redesign added is a hook too, so it goes here as well. */
  const [roomCount, setRoomCount] = useState("");
  const [roomCap, setRoomCap] = useState("12");
  const [roomExcept, setRoomExcept] = useState("");
  const [roomZones, setRoomZones] = useState("");
  const [roomOpen, setRoomOpen] = useState(false);
  const [roomSaving, setRoomSaving] = useState(false);
  /* The designed "הדגמת חוסר" control. It shows the couple what a half-entered
     plan looks like before they can mistake one for a complete room — the
     state I was actually in when I told שחר 119 of her guests had nowhere to
     sit. Saving is blocked while it is on, because the number on screen is
     not the number they typed. */
  const [roomDemoShort, setRoomDemoShort] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [autoAsk, setAutoAsk] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/couple/${token}/seating`);
    const d = await res.json();
    if (!d.error) setData({ tables: d.tables ?? [], assignments: d.assignments ?? [], guests: d.guests ?? [], event: d.event ?? null });
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  /* Toasts clear themselves. The design shows one confirmation strip, not a
     stack that grows for the rest of the session. */
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(id);
  }, [toast]);

  const assignmentsByTable = (tableId: string) => data.assignments.filter(a => a.table_id === tableId);
  const assignedIds = new Set(data.assignments.map(a => a.guest_id));
  const guestById   = (id: string) => data.guests.find(g => g.id === id);

  async function assignGuest(guestId: string, tableId: string | null) {
    setSaving(true);
    await fetch(`/api/couple/${token}/seating/assign`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_id: guestId, table_id: tableId }),
    });
    await load();
    setSelectedGuest(null);
    setSaving(false);
  }

  async function addTable() {
    if (!newTable.name.trim()) return;
    setSaving(true);
    await fetch(`/api/couple/${token}/seating`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTable, sort_order: data.tables.length }),
    });
    setNewTable({ name: "", capacity: 10, type: "round" });
    setShowAddTable(false);
    await load();
    setSaving(false);
  }

  async function deleteTable(tableId: string) {
    if (!confirm("למחוק שולחן? כל ההצבות יבוטלו.")) return;
    setSaving(true);
    await fetch(`/api/couple/${token}/seating/${tableId}`, { method: "DELETE" });
    await load();
    setSaving(false);
  }

  if (loading) return (
    <div dir="rtl" className="min-h-screen bg-surface flex items-center justify-center">
      <p className="font-body text-ink/40">טוען...</p>
    </div>
  );

  /* Chairs, not rows. An assignment seats a household — two people sit down and
     the old count called it one. "40 מתוך 326 אורחים מוצבים" compared rows to
     rows while the room is filled with people. */
  const seatsById = new Map(data.guests.map(g => [g.id, g.guest_count ?? 1]));
  const totalSeated = data.assignments.reduce((n, a) => n + (seatsById.get(a.guest_id) ?? 1), 0);
  const totalGuests = data.guests.reduce((n, g) => n + (g.guest_count ?? 1), 0);

  /* Assigned guests with a phone — eligible for "your table" message */
  const tableByGuestId = new Map(data.assignments.map(a => [a.guest_id, data.tables.find(t => t.id === a.table_id)?.name ?? ""]));
  const notifiable = data.guests.filter(g => g.phone && tableByGuestId.get(g.id));

  const couple = coupleName(data.event);
  const days = daysUntil(data.event?.date);
  const totalSeats = data.tables.reduce((s, t) => s + (t.capacity ?? 0), 0);

  const byStatus = (s: string) => data.guests.filter(g => (g.status ?? "pending") === s);
  const confirmed = byStatus("confirmed");
  const confirmedSeated = confirmed.filter(g => assignedIds.has(g.id))
    .reduce((n, g) => n + (g.guest_count ?? 1), 0);

  /* A conflict is a table holding more chairs than it has. The engine cannot
     produce one; a couple dragging by hand can, and until this screen there
     was nowhere it would have shown. */
  const conflicts = data.tables.filter(t =>
    assignmentsByTable(t.id).reduce((n, a) => n + (seatsById.get(a.guest_id) ?? 1), 0) > (t.capacity ?? 0),
  );

  /* The people this system cannot tell where to sit.
     Seated, so they have a table number, and no number to send it to — the
     only guests for whom a sign at the door is the entire plan. */
  const seatedNoPhone = data.guests
    .filter(g => assignedIds.has(g.id) && !String(g.phone ?? "").trim())
    .map(g => ({ guest: g, table: data.tables.find(t => t.id === data.assignments.find(a => a.guest_id === g.id)?.table_id) }));
  const noPhoneCount = data.guests.filter(g => !String(g.phone ?? "").trim()).length;

  const matchesSearch = (g: Guest) => g.name.toLowerCase().includes(search.toLowerCase());
  const filtered = data.guests.filter(g => {
    if (!matchesSearch(g)) return false;
    switch (filter) {
      case "confirmed": return (g.status ?? "pending") === "confirmed";
      case "pending":   return (g.status ?? "pending") === "pending";
      case "declined":  return (g.status ?? "pending") === "declined";
      case "unseated":  return !assignedIds.has(g.id);
      default:          return true;
    }
  });
  const unassigned = filtered.filter(g => !assignedIds.has(g.id));

  /* Ask the system to tell every seated guest where they sit.
   *
   * This used to open one wa.me tab per guest and let the couple click send on
   * each: 229 tabs for שחר, from their own WhatsApp, and — because the URL was
   * built inline rather than through waPrefill — with 💍 🎉 🪑 🤍 all arriving
   * as replacement characters.
   *
   * Now it records the request and the sender does the work, through the
   * business number, on the approved template, with delivery reports. */
  async function sendTableNumbers() {
    if (notifiable.length === 0) return;
    if (!confirm(
      `נשלח לכל ${notifiable.length} האורחים המשובצים הודעה עם מספר השולחן שלהם.\n\n` +
      `חשוב: האורח מקבל את המספר שמופיע כאן ליד כל שולחן (1, 2, 3...),\n` +
      `אז כדאי שהשלטים באולם יהיו באותו מספור.\n\n` +
      `ההודעות יוצאות מהמערכת בהדרגה — לא צריך לעשות כלום.\n` +
      `מי שיוזז אחר כך יקבל עדכון רק אם תלחצו שוב.`)) return;

    const res = await fetch(`/api/couple/${token}/seating/notify`, { method: "POST" });
    const d = await res.json().catch(() => null);
    if (!res.ok) { alert(d?.error ?? "לא הצלחנו לשלוח"); return; }
    setToast(`${d.seated} אורחים יקבלו את מספר השולחן שלהם בשעות הקרובות.`);
  }

  /* Describing the hall, the way the venue describes it.
   *
   * ארץ האיילים sent שחר a two-page plan: 26 tables on one page and 12 more on
   * the second, in a separate plaza. Read by hand, the second page was missed
   * and the couple was told 119 of her guests had nowhere to sit — a hall of
   * 448 seats reported as 310.
   *
   * That is what a form fixes. A couple reading their own plan does not skip
   * its second page, and the number that reaches the system is then the number
   * the venue actually wrote.
   *
   * Two fields rather than 38 rows: nobody types "12" thirty-eight times. The
   * exceptions field is where the real plan differs — table 24 seats ten, 35
   * and 38 seat nine — and it is exactly what a person reads off the drawing. */

  /* "24=10, 35=9" and "1-7=מרכז, 8-15=מפלס א" read the same way. */
  const parseRanges = (text: string): Map<number, string> => {
    const out = new Map<number, string>();
    for (const part of text.split(/[,\n;]/)) {
      const m = part.trim().match(/^(\d+)\s*(?:-\s*(\d+))?\s*=\s*(.+)$/);
      if (!m) continue;
      const from = Number(m[1]);
      const to = m[2] ? Number(m[2]) : from;
      const val = m[3].trim();
      if (!val || from < 1 || to < from || to > 400) continue;
      for (let n = from; n <= to; n++) out.set(n, val);
    }
    return out;
  };

  const roomPreview = (() => {
    const count = Math.max(0, Math.min(200, parseInt(roomCount, 10) || 0));
    const base = Math.max(1, Math.min(40, parseInt(roomCap, 10) || 12));
    if (!count) return null;
    const caps = parseRanges(roomExcept);
    const zones = parseRanges(roomZones);
    const tables = Array.from({ length: count }, (_, i) => {
      const n = i + 1;
      const c = Number(caps.get(n));
      return {
        name: String(n),
        capacity: Number.isFinite(c) && c >= 1 && c <= 40 ? c : base,
        zone: zones.get(n) ?? null,
      };
    });
    return { tables, seats: tables.reduce((s, t) => s + t.capacity, 0) };
  })();

  /* The zones as typed, in the order they first appear, with the table range
     each covers. The design lists them back to the couple so a typo in the
     range syntax is visible before it becomes a room. */
  const zonePreview = (() => {
    if (!roomPreview) return [];
    const order: string[] = [];
    const nums = new Map<string, number[]>();
    roomPreview.tables.forEach((t, i) => {
      const z = t.zone;
      if (!z) return;
      if (!nums.has(z)) { nums.set(z, []); order.push(z); }
      nums.get(z)!.push(i + 1);
    });
    return order.map(z => {
      const ns = nums.get(z)!;
      return { zone: z, from: ns[0], to: ns[ns.length - 1], count: ns.length };
    });
  })();

  async function saveRoom() {
    if (!roomPreview) return;
    if (data.assignments.length && !confirm(
      `הגדרת האולם מחדש תמחק את ${data.assignments.length} השיבוצים הקיימים.\nלהמשיך?`)) return;
    setRoomSaving(true);
    try {
      const res = await fetch(`/api/couple/${token}/seating/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tables: roomPreview.tables }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) { alert(d?.error ?? "לא הצלחנו לשמור"); return; }
      await load();
      setRoomOpen(false);
      setToast(`הפריסה נשמרה — ${d.tables} שולחנות · ${d.capacity} מקומות. עכשיו אפשר להריץ סידור אוטומטי.`);
    } finally { setRoomSaving(false); }
  }

  /* Seat everyone who confirmed.
   *
   * The confirmation that used to be a browser confirm() is the dialog at the
   * bottom of this file, because what it is about to destroy — "יימחקו 240
   * שיבוצים" — is the only fact that makes the answer obvious, and a confirm()
   * cannot show it. */
  async function runAuto(replace: boolean) {
    setAutoRunning(true);
    try {
      const capacity = Math.max(2, Math.min(30, parseInt(roomCap, 10) || 12));
      const res = await fetch(`/api/couple/${token}/seating/auto`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capacity, replace }),
      });
      const d = await res.json().catch(() => null);

      /* 409 means there is a plan in the way. Ask once, with the number. */
      if (res.status === 409) { setAutoAsk(true); return; }
      if (!res.ok) { alert(d?.error ?? "לא הצלחנו לשבץ"); return; }

      await load();
      setAutoAsk(false);
      setToast(
        d?.seated != null
          ? `שובצו ${d.seated} אורחים. אפשר לגרור להתאמות ידניות.`
          : "הסידור האוטומטי הסתיים.");
    } finally { setAutoRunning(false); }
  }

  const stats = [
    { label: "שולחנות מוגדרים",     value: data.tables.length },
    { label: "מקומות ישיבה כוללים", value: totalSeats },
    { label: "מאשרי הגעה ששובצו",   value: confirmedSeated },
    { label: "חריגות והתנגשויות",   value: conflicts.length, bad: conflicts.length > 0 },
  ];

  const chips: { key: Filter; label: string; n: number }[] = [
    { key: "all",       label: "הכול",      n: data.guests.length },
    { key: "confirmed", label: "אישרו",     n: confirmed.length },
    { key: "pending",   label: "ממתינים",   n: byStatus("pending").length },
    { key: "declined",  label: "לא מגיעים", n: byStatus("declined").length },
    { key: "unseated",  label: "טרם שובצו", n: data.guests.filter(g => !assignedIds.has(g.id)).length },
  ];

  /* Tables grouped by the zone the couple gave them, in table order. A room
     saved before the zone column existed is one unnamed area, which is what
     the fallback key means — not an error. */
  const zones: { zone: string | null; tables: SeatingTable[] }[] = (() => {
    const order: (string | null)[] = [];
    const map = new Map<string, SeatingTable[]>();
    for (const t of data.tables) {
      const z = t.zone?.trim() || null;
      const k = z ?? " ";
      if (!map.has(k)) { map.set(k, []); order.push(z); }
      map.get(k)!.push(t);
    }
    return order.map(z => ({ zone: z, tables: map.get(z ?? " ")! }));
  })();

  const hasRoom = data.tables.length > 0;

  return (
    <div dir="rtl" lang="he" className="min-h-screen bg-surface font-body text-ink">

      {/* ── Page head ─────────────────────────────────────────────────────
          The design's full event tab bar belongs to the portal shell; what is
          this screen's own is the title, the couple, and the countdown. */}
      <header className="bg-surface-raised border-b border-line">
        <div className="max-w-[1280px] mx-auto px-5 md:px-12 py-6">
          <a href={`/couple/${token}`}
             className="inline-flex items-center gap-1.5 text-[12px] leading-4 text-ink/50 hover:text-ink transition-colors">
            <ArrowRight size={14} /> חזרה ללוח הבקרה
          </a>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] leading-[14px] tracking-[0.4px] font-medium text-gold-text uppercase">
                סידור הושבה ואולם
              </p>
              <h1 className="font-display text-[32px] leading-[40px] font-extrabold text-ink mt-0.5">
                {couple ?? "סידור הושבה"}
              </h1>
              <p className="text-[14px] leading-5 text-ink/60 mt-1">
                {hasRoom
                  ? <>{data.tables.length} שולחנות · {totalSeats} מקומות · {totalSeated} מתוך {totalGuests} אורחים מושבים</>
                  : <>עוד לא הוגדר אולם — מתחילים בשלב 1</>}
                {days != null && <> · עוד {days} יום</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <HelpButton token={token} />
              {notifiable.length > 0 && (
                <button onClick={sendTableNumbers}
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-pill bg-[#25D366] text-white text-[14px] leading-5 font-semibold hover:brightness-95 transition">
                  <Phone size={16} /> שלחו מספרי שולחן ({notifiable.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-5 md:px-12 py-6 flex flex-col gap-6">

        {/* ── דביר's note ───────────────────────────────────────────────
            The screen's own thesis, and the reason it does not open with a
            file upload: the couple needs two numbers, not a drawing. */}
        <section className="relative overflow-hidden bg-surface-raised rounded-card p-6 shadow-card border border-line">
          <div className="flex items-start gap-4 max-w-3xl">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/15 border border-line grid place-items-center font-display font-bold text-gold-text">
              ד
            </div>
            <div>
              <p className="text-[14px] leading-5 font-semibold text-ink">דביר · מלווה אישי</p>
              <p className="text-[11px] leading-[14px] tracking-[0.4px] text-ink/50 mb-2">עדכון לתכנון האולם</p>
              <p className="text-[16px] leading-6 text-ink/80">
                {couple ? `שלום ${couple} 🤍 ` : "שלום 🤍 "}
                הדבר הכי חשוב: אתם לא צריכים שום מסמך כדי להתחיל. צריך רק שני מספרים —
                כמה שולחנות יש באולם, וכמה אנשים יושבים בשולחן. את זה באולם יודעים לענות
                בטלפון תוך דקה. סידור ההושבה יתמלא לפי מי שיאשר הגעה, ונוכל להפעיל סידור
                אוטומטי בלחיצה אחת.
              </p>
            </div>
          </div>
        </section>

        {/* ── Guests with no number ────────────────────────────────────── */}
        {noPhoneCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-warning-soft border border-primary/30 rounded-card px-5 py-4">
            <AlertTriangle size={18} className="text-gold-text shrink-0" />
            <p className="text-[14px] leading-5 text-ink/80 flex-1 min-w-[16rem]">
              שימו לב: יש {noPhoneCount} מוזמנים ללא מספר טלפון — לא נוכל לשלוח אליהם הודעה עם מספר השולחן.
            </p>
            <a href={`/couple/${token}/guests`}
               className="inline-flex items-center gap-1.5 text-[14px] leading-5 font-semibold text-gold-text hover:underline">
              להשלמת טלפונים במסך המוזמנים <ArrowRight size={14} />
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ══ Stage 1 — the room ═════════════════════════════════════ */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <section className="bg-surface-raised rounded-card p-6 shadow-card border border-line flex flex-col gap-4">
              <div>
                <p className="text-[11px] leading-[14px] tracking-[0.4px] font-medium text-gold-text">
                  שלב 1 • תשתית
                </p>
                <h2 className="font-display text-[20px] leading-7 font-bold text-ink mt-0.5 flex items-center gap-2">
                  <Ruler size={18} className="text-gold-text" /> הגדרת פריסת האולם
                </h2>
                <p className="text-[14px] leading-5 text-ink/60 mt-1">
                  הזינו את המידות הבסיסיות שקיבלתם מהאולם כדי שנוכל לחשב תפוסה מדויקת.
                </p>
              </div>

              {/* What to ask the hall — the minute-long phone call that
                  replaces waiting for a drawing that may never arrive. */}
              <div className="bg-surface rounded-xl p-4 border border-line">
                <p className="text-[14px] leading-5 font-semibold text-ink flex items-center gap-2 mb-2">
                  <Phone size={15} className="text-gold-text" /> מה לשאול את האולם בטלפון (תוך דקה):
                </p>
                <ul className="list-disc pr-5 space-y-1.5 text-[14px] leading-5 text-ink/70">
                  <li>כמה שולחנות בסך הכול באולם?</li>
                  <li>כמה מושבים בכל שולחן, ואיזה שולחן חורג?</li>
                  <li>יש יותר מאזור אחד? (מפלס עליון, גלריה, חצר — כדי שלא נפספס שולחנות).</li>
                  <li>השולחנות ממוספרים באולם, ואם כן — באילו מספרים?</li>
                </ul>
              </div>

              {!hasRoom || roomOpen ? (
                <>
                  <Stepper label="כמה שולחנות בסך הכול באולם?" hint="כולל אבירים וכבוד" unit="שולחנות"
                           value={roomCount} onChange={setRoomCount} min={1} max={200} fallback="" />
                  <Stepper label="כמה מושבים בכל שולחן (ברירת מחדל)?" hint="סטנדרט עגול" unit="מושבים"
                           value={roomCap} onChange={setRoomCap} min={1} max={40} fallback="12" />

                  <RoomField label="שולחנות חריגים" optional ltr value={roomExcept} onChange={setRoomExcept}
                             placeholder="24=10, 35=9, 1=14"
                             help="כותבים רק את החריגים, למשל: 24=10, 35=9, 1=14 (שולחן כלה וחתן/משפחה קרובה)." />

                  <div className="flex items-start gap-2 bg-info-soft border border-info/20 rounded-xl px-4 py-3">
                    <Info size={15} className="text-info shrink-0 mt-0.5" />
                    <p className="text-[12px] leading-4 text-ink/70">
                      כשנשלח לאורחים הודעה עם מספר השולחן שלהם — הם יקבלו את המספר שמופיע כאן במסך.
                      חשוב שהשלטים שיונחו על השולחנות באולם יהיו באותו מספור.
                    </p>
                  </div>

                  <RoomField label="חלוקה לאזורים באולם" optional value={roomZones} onChange={setRoomZones}
                             placeholder="1-10=רחבת ריקודים, 11-26=מרכז האולם"
                             help="שומר על קבוצות ומשפחות יחד באותו מתחם." />

                  {zonePreview.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] leading-[14px] tracking-[0.4px] font-medium text-gold-text">
                        {zonePreview.length} אזורים פעילים
                      </p>
                      {zonePreview.map(z => (
                        <div key={z.zone}
                             className="flex items-center justify-between bg-success-soft/60 border border-secondary/20 rounded-lg px-3 py-2">
                          <span className="text-[14px] leading-5 font-semibold text-ink">{z.zone}</span>
                          <span className="text-[12px] leading-4 text-ink/60">
                            ({z.from}-{z.to}) · {z.count} שולחנות
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {roomPreview && (
                    <div className="rounded-xl border border-line bg-surface px-4 py-3">
                      <p className="text-[14px] leading-5 text-ink/80">
                        {roomPreview.tables.length} שולחנות ·{" "}
                        <strong className="text-ink">{roomDemoShort ? Math.round(roomPreview.seats * 0.7) : roomPreview.seats}</strong> מקומות
                        {totalGuests > 0 && (
                          <> · {totalGuests} אורחים ברשימה</>
                        )}
                      </p>
                      {totalGuests > 0 && roomPreview.seats < totalGuests && (
                        <p className="text-[12px] leading-4 text-danger mt-1">
                          חסרים {totalGuests - roomPreview.seats} מקומות לכל מי שברשימה.
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    onClick={saveRoom}
                    disabled={!roomPreview || roomSaving || roomDemoShort}
                    className="inline-flex items-center justify-center gap-2 h-12 rounded-pill bg-ink text-white text-[14px] leading-5 font-semibold disabled:opacity-40 hover:brightness-110 transition">
                    <Save size={16} /> {roomSaving ? "שומר..." : "שמור פריסת אולם מעודכנת"}
                  </button>
                  {hasRoom && (
                    <button onClick={() => setRoomOpen(false)}
                            className="min-h-[44px] text-[13px] leading-4 text-ink/50 hover:text-ink transition">
                      ביטול
                    </button>
                  )}
                </>
              ) : (
                <button onClick={() => setRoomOpen(true)}
                        className="inline-flex items-center justify-center gap-2 h-11 rounded-pill border border-line bg-surface text-[14px] leading-5 font-semibold text-ink hover:bg-cream-dark transition">
                  <Ruler size={15} /> ערכו את האולם
                </button>
              )}
            </section>

            {/* ── Golden tip ─────────────────────────────────────────── */}
            <section className="bg-warning-soft border border-primary/30 rounded-card p-5">
              <p className="text-[14px] leading-5 font-semibold text-ink flex items-center gap-2 mb-1.5">
                <Lightbulb size={16} className="text-gold-text" /> עצת זהב מדביר
              </p>
              <p className="text-[14px] leading-5 text-ink/75">
                מומלץ לשמור כ-2 שולחנות רזרבה ריקים, ללא שיוך מראש, עבור הפתעות של הרגע האחרון.
              </p>
            </section>
          </aside>

          {/* ══ Stage 2 — filling it ══════════════════════════════════ */}
          <section className="lg:col-span-8 flex flex-col gap-4">

            <div className="bg-surface-raised rounded-card p-6 shadow-card border border-line flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] leading-[14px] tracking-[0.4px] font-medium text-gold-text">
                    שלב 2 • שיבוץ ואופטימיזציה
                  </p>
                  <h2 className="font-display text-[20px] leading-7 font-bold text-ink mt-0.5">
                    מפת שולחנות וסידור הושבה
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => (data.assignments.length ? setAutoAsk(true) : runAuto(false))}
                    disabled={!data.guests.length || autoRunning}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-pill bg-ink text-white text-[14px] leading-5 font-semibold disabled:opacity-40 hover:brightness-110 transition">
                    <Sparkles size={16} /> {autoRunning ? "משבץ..." : "סידור אוטומטי חכם"}
                  </button>
                  <a href={`/couple/${token}/venue-report`}
                     className="inline-flex items-center gap-2 h-11 px-4 rounded-pill border border-line bg-surface text-[14px] leading-5 font-semibold text-ink hover:bg-cream-dark transition">
                    <Share2 size={15} /> דוח לאולם
                  </a>
                </div>
              </div>

              {data.assignments.length > 0 && (
                <div className="flex items-start gap-2 bg-warning-soft border border-primary/30 rounded-xl px-4 py-3">
                  <AlertTriangle size={15} className="text-gold-text shrink-0 mt-0.5" />
                  <p className="text-[12px] leading-4 text-ink/75">
                    הרצת סידור אוטומטי בונה את האולם מחדש ומוחקת {data.assignments.length} שיבוצים קיימים.
                    מומלץ להריץ לפני סידור ידני.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 text-[12px] leading-4 text-ink/60">
                <Route size={15} className="text-gold-text shrink-0 mt-0.5" />
                <p>סדר עבודה מומלץ: סמנו מאושרים במסך אורחים ← סידור אוטומטי ← התאמות ידניות בגרירה</p>
              </div>

              {/* ── Stats ─────────────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {stats.map(s => (
                  <div key={s.label}
                       className="bg-surface rounded-xl border border-line px-3 py-3 text-center">
                    <p className="text-[11px] leading-[14px] tracking-[0.4px] text-ink/55">{s.label}</p>
                    <p className={`font-display text-[26px] leading-[34px] font-extrabold mt-0.5 ${s.bad ? "text-danger" : "text-ink"}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Search + filters ──────────────────────────────── */}
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="חיפוש אורח..."
                    className="w-full h-11 pr-10 pl-4 rounded-pill bg-surface border border-line text-[14px] leading-5 text-ink placeholder:text-ink/35 focus:outline-none focus:border-primary transition"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {chips.map(c => (
                    <button key={c.key} onClick={() => setFilter(c.key)}
                      className={`h-11 px-4 rounded-pill text-[13px] leading-4 font-medium border transition ${
                        filter === c.key
                          ? "bg-ink text-white border-ink"
                          : "bg-surface text-ink/70 border-line hover:border-primary"
                      }`}>
                      {c.label} ({c.n})
                    </button>
                  ))}
                </div>
              </div>

              {/* ── View toggle ───────────────────────────────────── */}
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <button onClick={() => setShowSimulator(false)}
                  className={`inline-flex items-center gap-2 h-11 px-4 rounded-pill text-[14px] leading-5 font-semibold border transition ${
                    !showSimulator ? "bg-ink text-white border-ink" : "bg-surface text-ink/70 border-line"
                  }`}>
                  <LayoutGrid size={15} /> מפת אזורים ושולחנות
                </button>
                <button onClick={() => setShowSimulator(true)}
                  className={`inline-flex items-center gap-2 h-11 px-4 rounded-pill text-[14px] leading-5 font-semibold border transition ${
                    showSimulator ? "bg-ink text-white border-ink" : "bg-surface text-ink/70 border-line"
                  }`}>
                  <DoorOpen size={15} /> תצוגת אולם מלאה
                </button>
                {!hasRoom && (
                  <span className="text-[12px] leading-4 text-ink/45">אין עדיין שולחנות להציג</span>
                )}
              </div>
            </div>

            {/* ── The people a message cannot reach ─────────────────── */}
            {seatedNoPhone.length > 0 && (
              <section className="bg-surface-raised rounded-card p-5 shadow-card border border-line">
                <p className="text-[14px] leading-5 font-semibold text-ink flex items-center gap-2">
                  <PhoneOff size={16} className="text-danger" />
                  דוח מרוכז לאולם — אורחים ללא טלפון
                </p>
                <p className="text-[12px] leading-4 text-ink/60 mt-1 mb-3">
                  הודעת וואטסאפ עם מספר שולחן לא תישלח אליהם. כדאי לוודא שהדיילים בכניסה
                  מוכנים להפנות אותם ידנית לפי הטבלה.
                  <span className="font-semibold text-ink"> {seatedNoPhone.length} אורחים לעדכון ידני.</span>
                </p>
                {/* Cards on a phone, the design's table from md up.
                    The Stitch screen is a 2560px desktop artboard and draws
                    this as a four-column table; the couple area is Mobile
                    First and a four-column table on a 375px screen is a
                    sideways scroll. Same rows, same order, same columns —
                    stacked while there is no room for them side by side. */}
                <ul className="flex flex-col gap-2 md:hidden">
                  {seatedNoPhone.map(({ guest, table }) => (
                    <li key={guest.id}
                        className="bg-surface rounded-xl border border-line px-3 py-3 flex items-center gap-3">
                      <span className="w-11 h-11 shrink-0 rounded-xl bg-ink text-white grid place-items-center font-display font-bold text-[15px]">
                        {table?.name ?? "—"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] leading-5 text-ink truncate">{guest.name}</p>
                        <p className="text-[12px] leading-4 text-ink/55 truncate">
                          {table?.zone?.trim() || "ללא אזור"}
                        </p>
                      </div>
                      <a href={`/couple/${token}/guests`}
                         className="shrink-0 inline-flex items-center min-h-[44px] px-3 text-[13px] font-semibold text-gold-text hover:underline">
                        הזן טלפון
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="text-[11px] leading-[14px] tracking-[0.4px] text-ink/50">
                        <th className="font-medium pb-2 pl-3">מספר שולחן</th>
                        <th className="font-medium pb-2 pl-3">אזור</th>
                        <th className="font-medium pb-2 pl-3">שם האורח</th>
                        <th className="font-medium pb-2">פעולה</th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] leading-5">
                      {seatedNoPhone.map(({ guest, table }) => (
                        <tr key={guest.id} className="border-t border-line">
                          <td className="py-2 pl-3 font-display font-bold text-ink">{table?.name ?? "—"}</td>
                          <td className="py-2 pl-3 text-ink/60">{table?.zone?.trim() || "—"}</td>
                          <td className="py-2 pl-3 text-ink">{guest.name}</td>
                          <td className="py-2">
                            <a href={`/couple/${token}/guests`}
                               className="inline-flex items-center min-h-[44px] text-gold-text font-semibold hover:underline">הזן טלפון</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── The room itself ───────────────────────────────────── */}
            {!hasRoom ? (
              <section className="bg-surface-raised rounded-card p-10 shadow-card border border-line text-center">
                <Users size={28} className="mx-auto text-ink/25" />
                <p className="font-display text-[20px] leading-7 font-bold text-ink mt-3">עוד אין אולם</p>
                <p className="text-[14px] leading-5 text-ink/60 mt-1 max-w-md mx-auto">
                  מלאו את שני המספרים בשלב 1 — כמה שולחנות וכמה מושבים בשולחן — והאולם ייבנה כאן.
                </p>
              </section>
            ) : showSimulator ? (
              <section className="bg-surface-raised rounded-card p-5 shadow-card border border-line">
                <p className="text-[12px] leading-4 text-ink/45 mb-3">
                  גרור שולחנות לסידור האולם · גרור אורח לשולחן · לחץ על כיסא מלא להסרה
                </p>
                <SeatingFloorPlan
                  tables={data.tables}
                  assignments={data.assignments}
                  guests={data.guests}
                  selectedGuest={selectedGuest}
                  saving={saving}
                  onAssign={(gId, tId) => assignGuest(gId, tId)}
                  onRemove={(gId) => assignGuest(gId, null)}
                  onDelete={(tId) => deleteTable(tId)}
                  onMoveTable={async (tId, x, y) => {
                    await fetch(`/api/couple/${token}/seating/${tId}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ pos_x: x, pos_y: y }),
                    });
                  }}
                />
              </section>
            ) : (
              zones.map(({ zone, tables }) => {
                const seats = tables.reduce((s, t) => s + (t.capacity ?? 0), 0);
                const taken = tables.reduce((s, t) =>
                  s + assignmentsByTable(t.id).reduce((n, a) => n + (seatsById.get(a.guest_id) ?? 1), 0), 0);
                return (
                  <section key={zone ?? "—"} className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
                      <h3 className="font-display text-[20px] leading-7 font-bold text-ink">
                        {zone ?? "האולם"}
                        <span className="font-body text-[12px] leading-4 font-normal text-ink/50 mr-2">
                          (שולחנות {tables[0]?.name} עד {tables[tables.length - 1]?.name})
                        </span>
                      </h3>
                      <p className="text-[12px] leading-4 text-ink/60">תפוסה: {taken} / {seats}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tables.map(table => {
                        const assigned = assignmentsByTable(table.id);
                        const cap = table.capacity ?? 0;
                        const taken = assigned.reduce((n, a) => n + (seatsById.get(a.guest_id) ?? 1), 0);
                        const over = taken > cap;
                        const full = taken === cap;
                        return (
                          <article key={table.id}
                            onClick={() => selectedGuest && assignGuest(selectedGuest, table.id)}
                            className={`bg-surface-raised rounded-card border p-4 shadow-card transition ${
                              over ? "border-danger/50" : "border-line"
                            } ${selectedGuest ? "cursor-pointer hover:border-primary" : ""}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-9 h-9 rounded-xl bg-ink text-white grid place-items-center font-display font-bold text-[15px]">
                                  {table.name}
                                </span>
                                <div>
                                  <p className="text-[14px] leading-5 font-semibold text-ink">
                                    שולחן {TABLE_TYPES.find(t => t.value === table.type)?.label ?? "עגול"}
                                  </p>
                                  <p className={`text-[12px] leading-4 ${over ? "text-danger" : "text-ink/55"}`}>
                                    {taken} / {cap} {over ? "— חריגה" : full ? "מלא" : `(${cap - taken} פנויים)`}
                                  </p>
                                </div>
                              </div>
                              <button onClick={e => { e.stopPropagation(); deleteTable(table.id); }}
                                      title="מחק שולחן"
                                      className="text-ink/30 hover:text-danger transition p-2.5 -m-1 min-w-[44px] min-h-[44px] grid place-items-center">
                                <X size={15} />
                              </button>
                            </div>

                            <div className="my-3 grid place-items-center">
                              {table.type === "rectangular"
                                ? <RectTableSVG  table={table} assigned={assigned} capacity={cap} guestById={guestById} onRemoveGuest={g => assignGuest(g, null)} />
                                : <RoundTableSVG table={table} assigned={assigned} capacity={cap} guestById={guestById} onRemoveGuest={g => assignGuest(g, null)} />}
                            </div>

                            <div className="flex flex-col gap-1">
                              {assigned.slice(0, 6).map(a => {
                                const g = guestById(a.guest_id);
                                if (!g) return null;
                                const noPhone = !String(g.phone ?? "").trim();
                                return (
                                  <div key={a.id}
                                       className="flex items-center justify-between gap-2 bg-surface rounded-lg px-2.5 py-1.5">
                                    <span className="text-[12px] leading-4 text-ink truncate">
                                      {g.name}{(g.guest_count ?? 1) > 1 ? ` +${(g.guest_count ?? 1) - 1}` : ""}
                                    </span>
                                    {noPhone
                                      ? <PhoneOff size={13} className="text-danger shrink-0" />
                                      : <Check size={13} className="text-secondary shrink-0" />}
                                  </div>
                                );
                              })}
                              {assigned.length > 6 && (
                                <p className="text-[11px] leading-[14px] text-ink/45 px-1">
                                  + {assigned.length - 6} נוספים שובצו
                                </p>
                              )}
                              {!assigned.length && (
                                <p className="text-[12px] leading-4 text-ink/40 text-center py-1">
                                  לא שובצו אורחים
                                </p>
                              )}
                            </div>

                            <p className="flex items-center gap-1.5 text-[11px] leading-[14px] text-ink/35 mt-2">
                              <GripVertical size={13} /> בתצוגת אולם מלאה אפשר לגרור
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}

            {/* ── Who still needs a seat ────────────────────────────── */}
            {hasRoom && (
              <section className="bg-surface-raised rounded-card p-5 shadow-card border border-line">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[14px] leading-5 font-semibold text-ink">
                    טרם שובצו ({unassigned.length})
                  </p>
                  <button onClick={() => setShowAddTable(!showAddTable)}
                          className="inline-flex items-center gap-1.5 min-h-[44px] px-1 text-[13px] leading-4 font-semibold text-gold-text hover:underline">
                    <Plus size={14} /> הוסף שולחן
                  </button>
                </div>

                {showAddTable && (
                  <div className="flex flex-wrap items-end gap-2 mb-3 bg-surface rounded-xl p-3 border border-line">
                    <input value={newTable.name} onChange={e => setNewTable({ ...newTable, name: e.target.value })}
                           placeholder="מספר או שם"
                           className="h-11 px-3 rounded-lg bg-surface-raised border border-line text-[14px] w-32 focus:outline-none focus:border-primary" />
                    <input type="number" value={newTable.capacity} min={1} max={40}
                           onChange={e => setNewTable({ ...newTable, capacity: parseInt(e.target.value, 10) || 10 })}
                           className="h-11 px-3 rounded-lg bg-surface-raised border border-line text-[14px] w-24 focus:outline-none focus:border-primary" />
                    <select value={newTable.type} onChange={e => setNewTable({ ...newTable, type: e.target.value })}
                            className="h-11 px-3 rounded-lg bg-surface-raised border border-line text-[14px] focus:outline-none focus:border-primary">
                      {TABLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <button onClick={addTable} disabled={!newTable.name.trim() || saving}
                            className="h-11 px-4 rounded-pill bg-ink text-white text-[13px] font-semibold disabled:opacity-40">
                      הוסף
                    </button>
                  </div>
                )}

                {unassigned.length === 0 ? (
                  <p className="text-[14px] leading-5 text-secondary flex items-center gap-2">
                    <CheckCircle2 size={16} /> כולם שובצו.
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] leading-4 text-ink/50 mb-2">
                      בחרו אורח ואז לחצו על שולחן כדי לשבץ.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {unassigned.slice(0, 60).map(g => (
                        <button key={g.id}
                          onClick={() => setSelectedGuest(selectedGuest === g.id ? null : g.id)}
                          className={`h-11 px-4 rounded-pill text-[13px] leading-4 border transition ${
                            selectedGuest === g.id
                              ? "bg-ink text-white border-ink"
                              : "bg-surface text-ink/75 border-line hover:border-primary"
                          }`}>
                          {g.name}{(g.guest_count ?? 1) > 1 ? ` +${(g.guest_count ?? 1) - 1}` : ""}
                        </button>
                      ))}
                      {unassigned.length > 60 && (
                        <span className="text-[12px] leading-4 text-ink/45 self-center">
                          ועוד {unassigned.length - 60}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </section>
            )}
          </section>
        </div>
      </main>

      {/* ── Auto-seating confirmation ───────────────────────────────────
          A confirm() could not say what it was about to delete. This can. */}
      {autoAsk && (
        <div className="fixed inset-0 z-50 bg-ink/50 grid place-items-center p-5"
             onClick={() => !autoRunning && setAutoAsk(false)}>
          <div className="bg-surface-raised rounded-card max-w-md w-full p-6 shadow-modal border border-line flex flex-col gap-4 text-right"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[20px] leading-7 font-bold text-ink flex items-center gap-2">
                <Sparkles size={18} className="text-gold-text" /> אישור הרצת סידור אוטומטי
              </h3>
              <button onClick={() => setAutoAsk(false)} disabled={autoRunning}
                      className="text-ink/40 hover:text-ink transition p-2.5 -m-1 min-w-[44px] min-h-[44px] grid place-items-center"><X size={16} /></button>
            </div>

            <div className="flex items-start gap-2 bg-warning-soft border border-primary/30 rounded-xl px-4 py-3">
              <AlertTriangle size={15} className="text-gold-text shrink-0 mt-0.5" />
              <p className="text-[14px] leading-5 text-ink/80">
                הרצה תמחק את {data.assignments.length} השיבוצים הקיימים ותשבץ מחדש את מי שאישר הגעה בלבד.
              </p>
            </div>

            <ul className="list-disc pr-5 space-y-1 text-[14px] leading-5 text-ink/70">
              <li>{confirmed.length} מאשרי הגעה ישובצו לפי קבוצות קרבה ואזורים.</li>
              <li>שולחנות חריגים יישמרו לפי ההגדרות בשלב 1.</li>
              <li>אורחים ללא אישור יישארו פנויים לשיבוץ מאוחר יותר.</li>
            </ul>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setAutoAsk(false)} disabled={autoRunning}
                      className="h-11 px-5 rounded-pill border border-line bg-surface text-[14px] font-semibold text-ink hover:bg-cream-dark transition">
                ביטול וחזרה
              </button>
              <button onClick={() => runAuto(true)} disabled={autoRunning}
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-pill bg-ink text-white text-[14px] font-semibold disabled:opacity-40 hover:brightness-110 transition">
                <Check size={16} /> {autoRunning ? "משבץ..." : "כן, אפס ושבץ אוטומטית"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 animate-rl-toast-in">
          <div className="flex items-center gap-2 bg-ink text-white rounded-pill px-5 py-3 shadow-float max-w-[90vw]">
            <CheckCircle2 size={16} className="text-success-soft shrink-0" />
            <p className="text-[14px] leading-5">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* A number the couple can nudge, because the two numbers this screen runs on
   are the two most likely to be typed wrong in a hurry. */
function Stepper({ label, hint, unit, value, onChange, min, max, fallback }: {
  label: string; hint?: string; unit: string;
  value: string; onChange: (v: string) => void;
  min: number; max: number; fallback: string;
}) {
  const n = parseInt(value, 10);
  const step = (d: number) => {
    const base = Number.isFinite(n) ? n : (parseInt(fallback, 10) || min);
    onChange(String(Math.max(min, Math.min(max, base + d))));
  };
  return (
    <div>
      <label className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[14px] leading-5 font-semibold text-ink">{label}</span>
        {hint && <span className="text-[11px] leading-[14px] text-ink/45">{hint}</span>}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="פחות"
                className="w-10 h-11 rounded-lg border border-line bg-surface text-ink text-lg leading-none hover:border-primary transition">
          −
        </button>
        <div className="relative flex-1">
          <input
            inputMode="numeric"
            value={value}
            onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 3))}
            placeholder={fallback}
            className="w-full h-11 px-3 rounded-lg bg-surface-raised border border-line text-[16px] leading-6 text-ink text-center focus:outline-none focus:border-primary transition"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] leading-[14px] text-ink/40 pointer-events-none">
            {unit}
          </span>
        </div>
        <button type="button" onClick={() => step(1)} aria-label="עוד"
                className="w-10 h-11 rounded-lg border border-line bg-surface text-ink text-lg leading-none hover:border-primary transition">
          +
        </button>
      </div>
    </div>
  );
}

function RoomField({ label, optional, value, onChange, placeholder, help, ltr }: {
  label: string; optional?: boolean;
  value: string; onChange: (v: string) => void;
  placeholder: string; help: string;
  /* Bidi, and it is not cosmetic.
     "24=10, 35=9, 1=14" is pure digits and punctuation. Typed into an RTL
     field it is laid out right-to-left and reads back as "14=1 ,9=35 ,10=24" —
     the couple sees their own exceptions reversed and cannot tell whether
     table 24 seats ten or table 10 seats twenty-four. Forcing LTR on the field
     keeps what they typed and what they read the same string; text stays
     right-aligned so the form still looks Hebrew. */
  ltr?: boolean;
}) {
  return (
    <div>
      <label className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[14px] leading-5 font-semibold text-ink">{label}</span>
        {optional && <span className="text-[11px] leading-[14px] text-ink/45">(אופציונלי)</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        dir={ltr ? "ltr" : undefined}
        className={`w-full h-11 px-3 rounded-lg bg-surface-raised border border-line text-[14px] leading-5 text-ink placeholder:text-ink/30 focus:outline-none focus:border-primary transition ${ltr ? "text-right" : ""}`}
      />
      <p className="text-[11px] leading-[14px] text-ink/50 mt-1">{help}</p>
    </div>
  );
}
