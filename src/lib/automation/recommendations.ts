/**
 * Recommendation Engine
 *
 * Generates ephemeral, actionable recommendations from event context.
 * Recommendations differ from Tasks:
 *   - Tasks  → persisted to DB, tracked, can be completed/dismissed
 *   - Recs   → computed on every load, surfaced in the UI, no DB row
 *
 * This layer is the primary replacement target for future AI integration.
 * See src/lib/ai/provider.ts for the upgrade interface.
 */

export type RecommendationPriority = "critical" | "high" | "medium" | "low";
export type RecommendationType     =
  | "communication" // send reminders, invitations
  | "data_quality"  // update phones, fix names
  | "operations"    // export report, review event
  | "insight";      // informational, no action needed

export interface Recommendation {
  id:          string;
  eventId:     string;
  eventName:   string;
  priority:    RecommendationPriority;
  type:        RecommendationType;
  title:       string;
  rationale:   string;      // why this is recommended
  action:      string;      // what to do
  actionRoute: string;      // which admin tab to navigate to
  confidence:  number;      // 0–1, confidence in this recommendation
  source:      "deterministic" | "ai"; // ai = future
}

export interface RecommendationContext {
  id:             string;
  name:           string;
  daysUntilEvent: number;
  total:          number;
  confirmed:      number;
  declined:       number;
  pending:        number;
  openedPending:  number;
  noPhone:        number;
  responseRate:   number;
  healthTier:     "green" | "yellow" | "red";
  recentActivity: number;   // responses in last 7 days
  confirmRate:    number;   // % of responders who confirmed
}

const PRIORITY_RANK: Record<RecommendationPriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export function generateRecommendations(
  events: RecommendationContext[],
): Recommendation[] {
  const recs: Recommendation[] = [];
  let counter = 0;
  const mkId  = () => `rec-${++counter}`;

  for (const ev of events) {
    const d = ev.daysUntilEvent;
    if (d <= 0) continue;

    // ── Critical: event imminent + many pending ──────
    if (d <= 7 && ev.pending > 0) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "critical", type: "communication",
        title:      "שלח תזכורות עכשיו",
        rationale:  `האירוע בעוד ${d} ימים ו-${ev.pending} אורחים טרם ענו.`,
        action:     `שלח תזכורת בוואטסאפ ל-${ev.pending} ממתינים`,
        actionRoute: "reminders",
        confidence: 0.98, source: "deterministic",
      });
    }

    // ── High: opened but didn't respond ─────────────
    if (ev.openedPending >= 3) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "high", type: "communication",
        title:      "תזכורת לאורחים שכבר פתחו",
        rationale:  `${ev.openedPending} אורחים פתחו את הקישור — מעורבות גבוהה, רק צריכים דחיפה קטנה.`,
        action:     "שלח תזכורת ממוקדת לאורחים אלה",
        actionRoute: "reminders",
        confidence: 0.93, source: "deterministic",
      });
    }

    // ── High: low response rate ──────────────────────
    if (ev.responseRate < 35 && d > 7) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "high", type: "communication",
        title:      "שיעור מענה נמוך — שלח הזמנות",
        rationale:  `רק ${ev.responseRate}% ענו. גל הזמנות יכול לשפר משמעותית.`,
        action:     "שלח הזמנה ל-100% מהממתינים",
        actionRoute: "guests",
        confidence: 0.88, source: "deterministic",
      });
    }

    // ── Medium: activity drop ────────────────────────
    if (ev.recentActivity === 0 && ev.pending > ev.total * 0.3 && d > 7) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "medium", type: "communication",
        title:      "אין פעילות ב-7 ימים האחרונים",
        rationale:  `לא התקבלו תגובות שבוע שלם. ${ev.pending} ממתינים עדיין.`,
        action:     "שקול לשלוח תזכורת — הזרימה נעצרה",
        actionRoute: "reminders",
        confidence: 0.80, source: "deterministic",
      });
    }

    // ── Medium: missing contacts ─────────────────────
    if (ev.noPhone > 5) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "medium", type: "data_quality",
        title:      `עדכן ${ev.noPhone} פרטי קשר`,
        rationale:  "אורחים ללא טלפון אינם ניתנים לפנייה בוואטסאפ.",
        action:     "הוסף מספרי טלפון חסרים ברשימת האורחים",
        actionRoute: "guests",
        confidence: 0.95, source: "deterministic",
      });
    }

    // ── Low: venue report ready ──────────────────────
    if (ev.responseRate >= 70 && d <= 30) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "low", type: "operations",
        title:      "ייצא דוח לאולם",
        rationale:  `${ev.responseRate}% מענה — מספיק נתונים לדוח מפורט לאולם.`,
        action:     "ייצא PDF עם כל הנתונים",
        actionRoute: "import-export",
        confidence: 0.85, source: "deterministic",
      });
    }

    // ── Low: health insight ──────────────────────────
    if (ev.healthTier === "green" && ev.responseRate >= 80) {
      recs.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority: "low", type: "insight",
        title:      "האירוע במצב מצוין",
        rationale:  `${ev.responseRate}% מענה, ציון בריאות גבוה. אין צורך בפעולה.`,
        action:     "המשך לעקוב",
        actionRoute: "command-center",
        confidence: 0.90, source: "deterministic",
      });
    }
  }

  recs.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  return recs;
}
