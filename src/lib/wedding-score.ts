/**
 * Wedding Success Score — 100-point composite readiness score.
 *
 * Components:
 *   RSVP Progress      30 pts  — response rate vs. expected stage
 *   Task Completion    20 pts  — % of wedding tasks done
 *   Seating Progress   15 pts  — % of confirmed guests seated
 *   Budget Setup       15 pts  — budget planned and tracked
 *   Vendor Checklist   10 pts  — key vendors confirmed
 *   Timeline Health    10 pts  — time remaining vs. pending work
 */

export type ScoreTier = "excellent" | "good" | "needs_attention" | "high_risk";

export interface ScoreComponent {
  key:         string;
  label:       string;
  points:      number;
  max:         number;
  pct:         number;     // 0-100 percentage for display
  explanation: string;
  tip:         string | null;
}

export interface WeddingScore {
  total:       number;          // 0-100
  tier:        ScoreTier;
  tierLabel:   string;
  tierColor:   string;
  headline:    string;
  components:  ScoreComponent[];
  delta:       number | null;   // vs. last snapshot
  deltaLabel:  string | null;
}

export interface ScoreInput {
  // RSVP
  totalGuests:         number;
  confirmedGuests:     number;
  declinedGuests:      number;
  daysUntilEvent:      number;
  // Tasks
  totalTasks:          number;
  completedTasks:      number;
  // Seating
  confirmedAttendees:  number;  // sum of guest_count for confirmed
  assignedSeats:       number;
  // Budget
  budgetItemCount:     number;
  budgetActual:        number;
  budgetPlanned:       number;
  // Vendors
  totalVendors:        number;
  confirmedVendors:    number;
  // Previous score for delta
  previousScore?:      number;
}

const TIER_CONFIG: Record<ScoreTier, { label: string; color: string }> = {
  excellent:       { label: "מצוין",         color: "#4A7C3F" },
  good:            { label: "טוב",            color: "#6B7B5A" },
  needs_attention: { label: "דורש תשומת לב", color: "#C5A46D" },
  high_risk:       { label: "סיכון גבוה",    color: "#C0392B" },
};

export function computeWeddingScore(input: ScoreInput): WeddingScore {
  const {
    totalGuests, confirmedGuests, declinedGuests, daysUntilEvent,
    totalTasks, completedTasks,
    confirmedAttendees, assignedSeats,
    budgetItemCount, budgetActual, budgetPlanned,
    totalVendors, confirmedVendors,
    previousScore,
  } = input;

  const responders   = confirmedGuests + declinedGuests;
  const responseRate = totalGuests > 0 ? responders / totalGuests : 0;

  // ── 1. RSVP Progress (30 pts) ─────────────────────────────────
  // Expected response rate by days remaining:
  // >90 days: 30% expected, <30 days: 80% expected
  const expectedRate =
    daysUntilEvent > 90 ? 0.30 :
    daysUntilEvent > 60 ? 0.50 :
    daysUntilEvent > 30 ? 0.70 :
    daysUntilEvent > 14 ? 0.80 : 0.90;

  const rsvpRatio  = expectedRate > 0 ? Math.min(1, responseRate / expectedRate) : responseRate;
  const rsvpPts    = Math.round(rsvpRatio * 30);
  const rsvpPct    = Math.round(responseRate * 100);

  // ── 2. Task Completion (20 pts) ───────────────────────────────
  const taskRatio  = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const taskPts    = Math.round(taskRatio * 20);
  const taskPct    = Math.round(taskRatio * 100);

  // ── 3. Seating Progress (15 pts) ──────────────────────────────
  const seatingRatio = confirmedAttendees > 0 ? Math.min(1, assignedSeats / confirmedAttendees) : 0;
  const seatingPts   = Math.round(seatingRatio * 15);
  const seatingPct   = Math.round(seatingRatio * 100);

  // ── 4. Budget Setup (15 pts) ──────────────────────────────────
  // 5 pts for having any budget items, 10 more for actual tracking
  const hasBudget     = budgetItemCount >= 3;
  const hasActuals    = budgetActual > 0;
  const utilization   = budgetPlanned > 0 ? budgetActual / budgetPlanned : 0;
  const overBudget    = utilization > 1.1;
  const budgetSetup   = hasBudget ? 5 : 0;
  const budgetTracked = hasActuals ? (overBudget ? 5 : 10) : 0;
  const budgetPts     = budgetSetup + budgetTracked;
  const budgetPct     = Math.round((budgetPts / 15) * 100);

  // ── 5. Vendor Checklist (10 pts) ──────────────────────────────
  const vendorRatio = totalVendors > 0 ? confirmedVendors / totalVendors : 0;
  const vendorPts   = Math.round(vendorRatio * 10);
  const vendorPct   = Math.round(vendorRatio * 100);

  // ── 6. Timeline Health (10 pts) ───────────────────────────────
  // Points for having healthy time buffer relative to pending work
  const pendingGuests = totalGuests - responders;
  const pendingWork   = (pendingGuests / Math.max(totalGuests, 1)) + (1 - taskRatio) + (1 - seatingRatio);
  const urgency       = daysUntilEvent <= 0 ? 1 : Math.min(1, pendingWork / 3);
  const timelinePts   = daysUntilEvent <= 0 ? 0 : Math.round((1 - urgency * 0.8) * 10);
  const timelinePct   = Math.round((timelinePts / 10) * 100);

  const total = rsvpPts + taskPts + seatingPts + budgetPts + vendorPts + timelinePts;

  const tier: ScoreTier =
    total >= 85 ? "excellent" :
    total >= 65 ? "good" :
    total >= 45 ? "needs_attention" : "high_risk";

  const headline =
    tier === "excellent"       ? "החתונה שלכם מוכנה מצוין — המשיכו כך!" :
    tier === "good"            ? "אתם בדרך הנכונה — עוד כמה צעדים ותהיו מוכנים לחלוטין." :
    tier === "needs_attention" ? "יש כמה תחומים שדורשים תשומת לב עכשיו." :
                                 "החתונה זקוקה לטיפול מיידי — בדקו את ההמלצות למטה.";

  const delta = previousScore !== undefined ? total - previousScore : null;
  const deltaLabel = delta === null ? null : delta > 0 ? `+${delta} מהשבוע שעבר` : delta < 0 ? `${delta} מהשבוע שעבר` : "ללא שינוי";

  return {
    total,
    tier,
    tierLabel:  TIER_CONFIG[tier].label,
    tierColor:  TIER_CONFIG[tier].color,
    headline,
    delta,
    deltaLabel,
    components: [
      {
        key:         "rsvp",
        label:       "אישורי הגעה",
        points:      rsvpPts,
        max:         30,
        pct:         rsvpPct,
        explanation: totalGuests > 0
          ? `${responders} מתוך ${totalGuests} ענו (${rsvpPct}%)`
          : "טרם נוספו אורחים",
        tip: responseRate < expectedRate - 0.1
          ? `שלחו תזכורות — ${pendingGuests} אורחים עדיין לא ענו`
          : null,
      },
      {
        key:         "tasks",
        label:       "משימות",
        points:      taskPts,
        max:         20,
        pct:         taskPct,
        explanation: totalTasks > 0
          ? `${completedTasks} מתוך ${totalTasks} משימות הושלמו`
          : "טרם נוספו משימות",
        tip: taskRatio < 0.5 && daysUntilEvent < 60
          ? "התחילו לסמן משימות — יש ${totalTasks - completedTasks} פתוחות"
          : null,
      },
      {
        key:         "seating",
        label:       "הושבה",
        points:      seatingPts,
        max:         15,
        pct:         seatingPct,
        explanation: confirmedAttendees > 0
          ? `${assignedSeats} מתוך ${confirmedAttendees} מוצבים (${seatingPct}%)`
          : "טרם אושרו אורחים",
        tip: seatingRatio < 0.8 && daysUntilEvent < 30
          ? "פחות מ-30 יום — הגיע הזמן לסיים את ההושבה"
          : null,
      },
      {
        key:         "budget",
        label:       "תקציב",
        points:      budgetPts,
        max:         15,
        pct:         budgetPct,
        explanation: !hasBudget
          ? "הוסיפו פריטי תקציב כדי לעקוב אחר ההוצאות"
          : overBudget
          ? `חורגים מהתקציב — ${Math.round(utilization * 100)}% נוצל`
          : `${Math.round(utilization * 100)}% מהתקציב נוצל`,
        tip: !hasBudget ? "הגדירו תקציב בסיסי לשדרג את הציון" : overBudget ? "שימו לב — חריגה מהתקציב" : null,
      },
      {
        key:         "vendors",
        label:       "ספקים",
        points:      vendorPts,
        max:         10,
        pct:         vendorPct,
        explanation: totalVendors > 0
          ? `${confirmedVendors} מתוך ${totalVendors} ספקים אושרו`
          : "הוסיפו את רשימת הספקים",
        tip: vendorPct < 80 ? "אשרו את הספקים החסרים" : null,
      },
      {
        key:         "timeline",
        label:       "לוח זמנים",
        points:      timelinePts,
        max:         10,
        pct:         timelinePct,
        explanation: daysUntilEvent <= 0
          ? "האירוע עבר"
          : `${daysUntilEvent} ימים נותרו`,
        tip: timelinePts < 5 && daysUntilEvent > 0
          ? "סיימו את המשימות הפתוחות כדי להקטין את הלחץ"
          : null,
      },
    ],
  };
}

// ── Phase-aware briefing tone ──────────────────────────────────
export type BriefingPhase = "planning" | "organizing" | "accelerating" | "finalizing" | "countdown" | "imminent";

export function getBriefingPhase(daysUntilEvent: number): BriefingPhase {
  if (daysUntilEvent > 90)  return "planning";
  if (daysUntilEvent > 60)  return "organizing";
  if (daysUntilEvent > 30)  return "accelerating";
  if (daysUntilEvent > 14)  return "finalizing";
  if (daysUntilEvent > 3)   return "countdown";
  return "imminent";
}

export const PHASE_LABELS: Record<BriefingPhase, string> = {
  planning:      "שלב התכנון",
  organizing:    "שלב הארגון",
  accelerating:  "שלב ההאצה",
  finalizing:    "שלב הסיום",
  countdown:     "ספירה לאחור",
  imminent:      "ממש בקרוב!",
};

export type AlertSeverity = "urgent" | "important" | "suggested" | "info";

export interface SmartAlert {
  severity:    AlertSeverity;
  title:       string;
  body:        string;
  action:      string | null;
}

export function generateAlerts(input: ScoreInput): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const {
    totalGuests, confirmedGuests, declinedGuests, daysUntilEvent,
    totalTasks, completedTasks,
    confirmedAttendees, assignedSeats,
    budgetItemCount, budgetActual, budgetPlanned,
    totalVendors, confirmedVendors,
  } = input;

  const pendingGuests = totalGuests - confirmedGuests - declinedGuests;
  const responseRate  = totalGuests > 0 ? (confirmedGuests + declinedGuests) / totalGuests : 0;
  const taskPct       = totalTasks > 0 ? completedTasks / totalTasks : 1;
  const seatingPct    = confirmedAttendees > 0 ? assignedSeats / confirmedAttendees : 1;
  const utilization   = budgetPlanned > 0 ? budgetActual / budgetPlanned : 0;

  // Urgent
  if (daysUntilEvent <= 7 && pendingGuests > 0) {
    alerts.push({ severity: "urgent", title: "תזכורות דחופות", body: `${pendingGuests} אורחים לא ענו — החתונה בעוד ${daysUntilEvent} ימים`, action: "שלח תזכורות" });
  }
  if (daysUntilEvent <= 14 && seatingPct < 0.6) {
    alerts.push({ severity: "urgent", title: "הושבה לא הושלמה", body: `רק ${Math.round(seatingPct * 100)}% מהאורחים מוצבים — פחות מ-14 יום נשארו`, action: "פתח הושבה" });
  }
  if (utilization > 1.1) {
    alerts.push({ severity: "urgent", title: "חריגה מהתקציב", body: `הוצאתם ${Math.round(utilization * 100)}% מהתקציב המתוכנן`, action: "בדוק תקציב" });
  }

  // Important
  if (daysUntilEvent <= 30 && pendingGuests > totalGuests * 0.25) {
    alerts.push({ severity: "important", title: "שיעור מענה נמוך", body: `${Math.round((1 - responseRate) * 100)}% מהאורחים עדיין לא ענו`, action: "שלח תזכורות" });
  }
  if (daysUntilEvent <= 30 && taskPct < 0.5) {
    alerts.push({ severity: "important", title: "משימות פתוחות", body: `${totalTasks - completedTasks} משימות טרם הושלמו`, action: "ראה משימות" });
  }
  if (totalVendors > 0 && confirmedVendors < totalVendors && daysUntilEvent <= 60) {
    alerts.push({ severity: "important", title: "ספקים לא אושרו", body: `${totalVendors - confirmedVendors} ספקים עדיין לא אושרו`, action: "עדכן ספקים" });
  }
  if (!budgetItemCount && daysUntilEvent <= 60) {
    alerts.push({ severity: "important", title: "אין תקציב מוגדר", body: "הגדירו תקציב כדי לעקוב אחר ההוצאות", action: "הגדר תקציב" });
  }

  // Suggested
  if (responseRate > 0.8 && seatingPct < 0.5) {
    alerts.push({ severity: "suggested", title: "הגיע הזמן לסידור הושבה", body: "יש מספיק אישורים — הגיע הזמן לתכנן שולחנות", action: "פתח הושבה" });
  }

  // Info
  if (responseRate >= 0.9 && taskPct >= 0.8 && seatingPct >= 0.8) {
    alerts.push({ severity: "info", title: "הכל נראה טוב!", body: "אתם מוכנים מצוין — המשיכו כך", action: null });
  }

  return alerts;
}
