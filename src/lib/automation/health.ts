/**
 * Event Health Engine
 *
 * Centralised health scoring service.
 * Previously duplicated across admin/page.tsx and api/couple/[token]/route.ts.
 * All health calculations now live here.
 *
 * Scoring model (100 pts total):
 *   Response rate    — 40 pts (primary signal)
 *   Link open rate   — 20 pts (engagement proxy)
 *   Low pending      — 20 pts (inverted: fewer pending = higher score)
 *   Time remaining   — 10 pts (buffer to act)
 *   Recent activity  —  10 pts (momentum signal)
 */

export type HealthTier = "green" | "yellow" | "red";
export type RiskLevel  = "low" | "medium" | "high" | "critical";
export type Trend      = "improving" | "stable" | "declining" | "unknown";

export interface HealthBreakdown {
  factor:     string;
  points:     number;
  max:        number;
  description: string;
}

export interface EventHealthReport {
  score:       number;       // 0–100
  tier:        HealthTier;
  riskLevel:   RiskLevel;
  label:       string;
  trend:       Trend;
  breakdown:   HealthBreakdown[];
  actions:     string[];     // recommended next steps
}

export interface HealthInput {
  total:          number;
  confirmed:      number;
  declined:       number;
  pending:        number;
  openedCount:    number;
  responseRate:   number;    // 0–100
  daysUntilEvent: number;
  recentActivity: number;    // responses in last 7 days
  prevResponseRate?: number; // previous week's rate (for trend)
}

export function computeEventHealth(input: HealthInput): EventHealthReport {
  const {
    total, confirmed, declined, openedCount,
    responseRate, daysUntilEvent: d, recentActivity,
    prevResponseRate,
  } = input;
  const responders = confirmed + declined;
  const pendingPct = total > 0 ? (input.pending / total) : 1;

  // ── Factor 1: Response rate (40 pts) ──────────────
  const rateScore = total > 0 ? Math.round((responders / total) * 40) : 0;

  // ── Factor 2: Open rate (20 pts) ──────────────────
  const openScore = total > 0 ? Math.round((openedCount / total) * 20) : 0;

  // ── Factor 3: Low pending (20 pts) ────────────────
  // Full 20 pts at 0% pending; 0 pts at ≥60% pending
  const pendingScore = Math.round(Math.max(0, 1 - pendingPct / 0.6) * 20);

  // ── Factor 4: Time buffer (10 pts) ────────────────
  const timeScore =
    d > 60 ? 10 :
    d > 30 ? 7  :
    d > 14 ? 5  :
    d > 0  ? 2  : 0;

  // ── Factor 5: Recent activity (10 pts) ────────────
  const activityScore = Math.min(
    10,
    Math.round((recentActivity / Math.max(total * 0.1, 1)) * 10),
  );

  const score = rateScore + openScore + pendingScore + timeScore + activityScore;
  const tier: HealthTier  = score >= 80 ? "green" : score >= 50 ? "yellow" : "red";
  const riskLevel: RiskLevel =
    score >= 80 ? "low" :
    score >= 65 ? "medium" :
    score >= 40 ? "high" : "critical";

  // ── Trend ──────────────────────────────────────────
  let trend: Trend = "unknown";
  if (prevResponseRate !== undefined) {
    const delta = responseRate - prevResponseRate;
    trend = delta > 3 ? "improving" : delta < -3 ? "declining" : "stable";
  }

  // ── Label ──────────────────────────────────────────
  const label =
    tier === "green"  ? "האירוע במצב מצוין." :
    tier === "yellow" ? "יש מקום לשיפור — שווה לשלוח תזכורות." :
                        "מספר רב של מוזמנים עדיין לא ענו.";

  // ── Recommended actions ────────────────────────────
  const actions: string[] = [];
  if (input.pending > 0 && d <= 14) actions.push("שלח תזכורות מיידית");
  if (input.pending > total * 0.4)  actions.push("שקול גל הזמנות חדש");
  if (input.openedCount < total * 0.3) actions.push("בדוק שהקישורים נשלחו לכלל האורחים");
  if (riskLevel === "critical")     actions.push("יש לטפל בדחיפות — האירוע בסיכון");
  if (tier === "green")             actions.push("המשך לעקוב — אין צורך בפעולה מיידית");

  return {
    score,
    tier,
    riskLevel,
    label,
    trend,
    breakdown: [
      { factor: "אחוז מענה",            points: rateScore,    max: 40, description: `${responders} מתוך ${total} ענו` },
      { factor: "אחוז פתיחת קישור",     points: openScore,    max: 20, description: `${openedCount} פתחו את הקישור` },
      { factor: "אחוז נמוך של ממתינים", points: pendingScore, max: 20, description: `${Math.round(pendingPct * 100)}% ממתינים` },
      { factor: "זמן עד האירוע",        points: timeScore,    max: 10, description: d > 0 ? `${d} ימים` : "האירוע עבר" },
      { factor: "פעילות אחרונה",        points: activityScore,max: 10, description: `${recentActivity} תגובות ב-7 ימים` },
    ],
    actions,
  };
}
