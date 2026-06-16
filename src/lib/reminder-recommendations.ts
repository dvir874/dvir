import type { EventSummary } from './types';

export type RecommendationAction =
  | 'send_reminders'
  | 'send_followup'
  | 'send_invitations';

export interface ReminderRecommendation {
  eventId: string;
  eventName: string;
  priority: 'high' | 'medium' | 'low';
  action: RecommendationAction;
  reason: string;
  detail: string;
  affectedCount: number;
  daysUntilEvent: number;
}

const ACTION_LABEL: Record<RecommendationAction, string> = {
  send_reminders:   'שלחו תזכורות',
  send_followup:    'מעקב מוזמנים',
  send_invitations: 'שלחו הזמנות',
};

export { ACTION_LABEL };

/**
 * Pure function — takes existing EventSummary data, returns sorted
 * recommendation list. No side effects, no API calls.
 *
 * Rules (highest → lowest priority):
 *  R1: ≤3 days  + openedPending ≥ 1  → high  follow-up
 *  R2: ≤7 days  + pending > 15%      → high  reminder
 *  R3: ≤14 days + pending > 30%      → medium reminder
 *  R4: ≤21 days + openedPending ≥ 3  → low   follow-up
 *  R5: total = 0 (no guests yet)     → low   invitation hint
 */
export function generateReminderRecommendations(
  overview: EventSummary[],
): ReminderRecommendation[] {
  const recs: ReminderRecommendation[] = [];

  for (const ev of overview) {
    if (ev.daysUntilEvent < 0) continue; // past events

    const pendingRate = ev.total > 0 ? ev.pending / ev.total : 0;

    // R1 — 3 days + someone opened but didn't answer
    if (ev.daysUntilEvent <= 3 && ev.openedPending >= 1) {
      recs.push({
        eventId: ev.id, eventName: ev.name,
        priority: 'high',
        action: 'send_followup',
        reason: `האירוע בעוד ${ev.daysUntilEvent} ימים`,
        detail: `${ev.openedPending} אורחים פתחו את ההזמנה אך לא ענו`,
        affectedCount: ev.openedPending,
        daysUntilEvent: ev.daysUntilEvent,
      });
      continue;
    }

    // R2 — 7 days + >15% pending
    if (ev.daysUntilEvent <= 7 && pendingRate > 0.15 && ev.pending > 0) {
      recs.push({
        eventId: ev.id, eventName: ev.name,
        priority: 'high',
        action: 'send_reminders',
        reason: `${ev.pending} אורחים עדיין לא ענו — האירוע בעוד ${ev.daysUntilEvent} ימים`,
        detail: `${Math.round(pendingRate * 100)}% מהמוזמנים ממתינים`,
        affectedCount: ev.pending,
        daysUntilEvent: ev.daysUntilEvent,
      });
      continue;
    }

    // R3 — 14 days + >30% pending
    if (ev.daysUntilEvent <= 14 && pendingRate > 0.3 && ev.pending > 0) {
      recs.push({
        eventId: ev.id, eventName: ev.name,
        priority: 'medium',
        action: 'send_reminders',
        reason: `${ev.pending} מוזמנים לא ענו (${Math.round(pendingRate * 100)}%)`,
        detail: `האירוע בעוד ${ev.daysUntilEvent} ימים`,
        affectedCount: ev.pending,
        daysUntilEvent: ev.daysUntilEvent,
      });
      continue;
    }

    // R4 — 21 days + opened pending ≥ 3
    if (ev.daysUntilEvent <= 21 && ev.openedPending >= 3) {
      recs.push({
        eventId: ev.id, eventName: ev.name,
        priority: 'low',
        action: 'send_followup',
        reason: `${ev.openedPending} אורחים פתחו את ההזמנה וטרם ענו`,
        detail: `עדיין יש זמן לגייס תגובות`,
        affectedCount: ev.openedPending,
        daysUntilEvent: ev.daysUntilEvent,
      });
      continue;
    }

    // R5 — no guests yet (need to import + send)
    if (ev.total === 0 && ev.daysUntilEvent <= 30) {
      recs.push({
        eventId: ev.id, eventName: ev.name,
        priority: 'low',
        action: 'send_invitations',
        reason: 'טרם יובאה רשימת מוזמנים',
        detail: `האירוע בעוד ${ev.daysUntilEvent} ימים`,
        affectedCount: 0,
        daysUntilEvent: ev.daysUntilEvent,
      });
    }
  }

  // Sort: high → medium → low, then soonest first
  const order = { high: 0, medium: 1, low: 2 };
  return recs.sort(
    (a, b) =>
      order[a.priority] - order[b.priority] ||
      a.daysUntilEvent - b.daysUntilEvent,
  );
}
