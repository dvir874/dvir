/**
 * What's Next Engine — Single Source of Truth for event stage & progress.
 *
 * All logic for "where is this couple in their wedding journey" lives here.
 * Never scatter phase conditions across components — call computeEventProgress instead.
 */

export type EventStage =
  | "setup"       // no guests yet
  | "inviting"    // guests added, invitations not yet sent
  | "rsvp"        // RSVPs in progress
  | "seating"     // RSVP rate > 70%, seating incomplete
  | "final_prep"  // <21d to event
  | "event_day"   // today
  | "post_event"; // event date passed

export interface ProgressStep {
  key: string;
  label: string;
  icon: string;
  status: "done" | "active" | "pending";
  href: string; // relative to /couple/[token]/
}

export interface NextAction {
  label: string;
  description: string;
  href: string;
  urgency: "normal" | "warn" | "critical";
}

export interface EventProgress {
  stage: EventStage;
  stagePct: number;         // 0-100 overall progress score
  steps: ProgressStep[];
  nextAction: NextAction;
  completedLabels: string[];
  smartAlerts: string[];
  encouragement: string | null;
}

export interface ProgressInput {
  daysUntilEvent: number;
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  seatedGuests: number;     // assignedSeats from seating_assignments
  confirmedAttendees: number;
  totalVendors: number;
  confirmedVendors: number;
  completedTasks: number;
  totalTasks: number;
  hasHeroImage: boolean;
  budgetItemCount: number;
  hasSentInvites: boolean;  // any campaign sent
  giftCount: number;
  hasGallery: boolean;
}

// ── Stage detection ────────────────────────────────────────────────────────

function detectStage(input: ProgressInput): EventStage {
  const {
    daysUntilEvent, totalGuests, confirmedGuests, pendingGuests,
    seatedGuests, confirmedAttendees, hasSentInvites,
  } = input;

  if (daysUntilEvent < 0) return "post_event";
  if (daysUntilEvent === 0) return "event_day";
  if (daysUntilEvent <= 21 && totalGuests > 0) return "final_prep";

  const rsvpRate = totalGuests > 0
    ? (confirmedGuests + (totalGuests - pendingGuests - confirmedGuests)) / totalGuests
    : 0;
  const seatingDone = confirmedAttendees > 0 && seatedGuests >= confirmedAttendees * 0.8;

  if (rsvpRate > 0.7 && !seatingDone && totalGuests > 0) return "seating";
  if (hasSentInvites || (pendingGuests < totalGuests && totalGuests > 0)) return "rsvp";
  if (totalGuests > 0) return "inviting";
  return "setup";
}

// ── Progress percentage ────────────────────────────────────────────────────

function calcPct(stage: EventStage, input: ProgressInput): number {
  const stageBase: Record<EventStage, number> = {
    setup: 5, inviting: 15, rsvp: 30, seating: 55, final_prep: 75, event_day: 90, post_event: 100,
  };
  let base = stageBase[stage];

  // Add micro-progress within stage
  if (stage === "rsvp" && input.totalGuests > 0) {
    const done = input.totalGuests - input.pendingGuests;
    base += Math.round((done / input.totalGuests) * 20);
  }
  if (stage === "seating" && input.confirmedAttendees > 0) {
    base += Math.round((input.seatedGuests / input.confirmedAttendees) * 15);
  }
  if (stage === "final_prep") {
    if (input.completedTasks > 0 && input.totalTasks > 0) {
      base += Math.round((input.completedTasks / input.totalTasks) * 10);
    }
  }

  return Math.min(99, base); // never 100% until post_event
}

// ── Steps ──────────────────────────────────────────────────────────────────

function buildSteps(stage: EventStage, input: ProgressInput): ProgressStep[] {
  const stageOrder: EventStage[] = ["setup", "inviting", "rsvp", "seating", "final_prep", "event_day", "post_event"];
  const idx = stageOrder.indexOf(stage);

  const definitions: { key: EventStage; label: string; icon: string; href: string }[] = [
    { key: "setup",      label: "פתיחת האירוע",     icon: "📝", href: "" },
    { key: "inviting",   label: "רשימת מוזמנים",    icon: "👥", href: "guests" },
    { key: "rsvp",       label: "אישורי הגעה",       icon: "📲", href: "guests" },
    { key: "seating",    label: "סידורי הושבה",      icon: "🪑", href: "seating" },
    { key: "final_prep", label: "הכנות אחרונות",     icon: "✅", href: "checklist" },
    { key: "event_day",  label: "יום האירוע",        icon: "🎉", href: "" },
    { key: "post_event", label: "אחרי האירוע",       icon: "📸", href: "" },
  ];

  return definitions.map((d, i) => ({
    key: d.key,
    label: d.label,
    icon: d.icon,
    href: d.href,
    status: i < idx ? "done" : i === idx ? "active" : "pending",
  }));
}

// ── Next Action ────────────────────────────────────────────────────────────

function buildNextAction(stage: EventStage, input: ProgressInput): NextAction {
  const { daysUntilEvent, totalGuests, pendingGuests, seatedGuests, confirmedAttendees,
    completedTasks, totalTasks, confirmedVendors, totalVendors } = input;

  if (stage === "post_event") {
    if (!input.hasGallery) return { label: "שלחו הודעת תודה ואספו תמונות", description: "הגיע הזמן לשלוח הודעת תודה לאורחים ולהזמין אותם להעלות תמונות.", href: "", urgency: "normal" };
    return { label: "האירוע הסתיים — כל הכבוד!", description: "אתם יכולים לעיין בסיכום האירוע ובגלריית התמונות.", href: "", urgency: "normal" };
  }

  if (stage === "event_day") {
    return { label: "היום הגדול הגיע! 🎊", description: "רשימת האורחים ומיקומי השולחנות מוכנים לשימוש.", href: "seating", urgency: "normal" };
  }

  if (stage === "setup") {
    return { label: "העלו את רשימת המוזמנים", description: "הוסיפו את האורחים שלכם כדי שנוכל להתחיל לשלוח הזמנות.", href: "guests", urgency: "warn" };
  }

  if (stage === "inviting") {
    return { label: `${totalGuests} אורחים מחכים להזמנה`, description: "המערכת תשלח הזמנות ב-WhatsApp לכל האורחים ברשימה.", href: "", urgency: "normal" };
  }

  if (stage === "rsvp") {
    if (pendingGuests > 0 && daysUntilEvent <= 30) {
      return { label: `${pendingGuests} אורחים עדיין לא ענו`, description: "נשארו פחות מחודש — כדאי לשלוח תזכורת.", href: "", urgency: daysUntilEvent <= 14 ? "critical" : "warn" };
    }
    return { label: "אישורי הגעה בתהליך", description: `${totalGuests - pendingGuests} מתוך ${totalGuests} כבר ענו.`, href: "guests", urgency: "normal" };
  }

  if (stage === "seating") {
    const remaining = confirmedAttendees - seatedGuests;
    return { label: `שבצו ${remaining} אורחים לשולחנות`, description: "רוב האורחים אישרו הגעה — הגיע הזמן לסדר הושבה.", href: "seating", urgency: remaining > 20 ? "warn" : "normal" };
  }

  if (stage === "final_prep") {
    if (daysUntilEvent <= 7 && totalVendors > confirmedVendors) {
      return { label: "אשרו ספקים שטרם אושרו", description: `${totalVendors - confirmedVendors} ספקים ממתינים לאישור.`, href: "vendors", urgency: "critical" };
    }
    if (completedTasks < totalTasks) {
      return { label: `${totalTasks - completedTasks} משימות לסיום`, description: "בדקו את הצ'קליסט ואשרו שהכל מוכן.", href: "checklist", urgency: daysUntilEvent <= 3 ? "critical" : "warn" };
    }
    return { label: "הכל נראה מוכן!", description: "בדקו שוב שכל הספקים מאושרים ושהסידורי הושבה מודפסים.", href: "checklist", urgency: "normal" };
  }

  return { label: "המשיכו להתקדם", description: "", href: "", urgency: "normal" };
}

// ── Smart Alerts ───────────────────────────────────────────────────────────

function buildAlerts(stage: EventStage, input: ProgressInput): string[] {
  const alerts: string[] = [];
  const { daysUntilEvent, pendingGuests, totalGuests, seatedGuests, confirmedAttendees,
    totalVendors, confirmedVendors, budgetItemCount } = input;

  if (stage === "rsvp" && pendingGuests > totalGuests * 0.4 && daysUntilEvent <= 21)
    alerts.push(`⚠️ ${pendingGuests} אורחים עדיין לא ענו ונותרו ${daysUntilEvent} ימים.`);

  if (["seating", "final_prep"].includes(stage) && confirmedAttendees > 0 && seatedGuests < confirmedAttendees * 0.5)
    alerts.push(`⚠️ רק ${seatedGuests} מתוך ${confirmedAttendees} מאושרים שובצו לשולחנות.`);

  if (totalVendors > 0 && confirmedVendors < totalVendors && daysUntilEvent <= 30)
    alerts.push(`⚠️ ${totalVendors - confirmedVendors} ספקים טרם אושרו.`);

  if (budgetItemCount === 0 && daysUntilEvent <= 60)
    alerts.push(`💡 עדיין לא הגדרתם תקציב — כדאי להתחיל לעקוב אחרי ההוצאות.`);

  return alerts;
}

// ── Encouragement ─────────────────────────────────────────────────────────

function buildEncouragement(stage: EventStage, pct: number): string | null {
  if (pct >= 90) return "🎊 כמעט שם! אתם עושים עבודה מדהימה.";
  if (pct >= 75) return "👏 אתם בדרך הנכונה — רוב העבודה מאחוריכם!";
  if (pct >= 50) return "🎉 כבר חצי הדרך — המשיכו כך!";
  if (pct >= 25) return "✨ התחלה נהדרת — אתם מתקדמים יפה.";
  if (stage === "setup") return "❤️ ברוכים הבאים — יש לנו הרבה דברים יפים לבנות יחד.";
  return null;
}

// ── Main export ────────────────────────────────────────────────────────────

export function computeEventProgress(input: ProgressInput): EventProgress {
  const stage = detectStage(input);
  const stagePct = calcPct(stage, input);
  const steps = buildSteps(stage, input);
  const nextAction = buildNextAction(stage, input);
  const completedLabels = steps.filter(s => s.status === "done").map(s => s.label);
  const smartAlerts = buildAlerts(stage, input);
  const encouragement = buildEncouragement(stage, stagePct);

  return { stage, stagePct, steps, nextAction, completedLabels, smartAlerts, encouragement };
}
