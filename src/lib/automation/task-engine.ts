/**
 * Task Engine
 *
 * Generates Task objects from event context data.
 * Tasks can be persisted to the `tasks` DB table or used ephemerally.
 *
 * DB schema for persistence:
 *
 *   CREATE TABLE tasks (
 *     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
 *     priority     TEXT NOT NULL DEFAULT 'medium'
 *                    CHECK (priority IN ('urgent','high','medium','low')),
 *     title        TEXT NOT NULL,
 *     description  TEXT NOT NULL DEFAULT '',
 *     status       TEXT NOT NULL DEFAULT 'open'
 *                    CHECK (status IN ('open','in_progress','completed','dismissed')),
 *     action_type  TEXT,
 *     created_at   TIMESTAMPTZ DEFAULT NOW(),
 *     completed_at TIMESTAMPTZ
 *   );
 *   CREATE INDEX idx_tasks_event  ON tasks(event_id, status);
 *   CREATE INDEX idx_tasks_status ON tasks(status, priority);
 */

export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskStatus   = "open" | "in_progress" | "completed" | "dismissed";
export type TaskAction   =
  | "send_reminders"
  | "send_invitations"
  | "update_contacts"
  | "review_event"
  | "export_report"
  | "custom";

export interface Task {
  id:           string;
  eventId:      string;
  eventName:    string;
  priority:     TaskPriority;
  title:        string;
  description:  string;
  status:       TaskStatus;
  actionType:   TaskAction;
  dueContext:   string;
  createdAt:    string;
  completedAt?: string;
}

// Shape expected by generateTasks — minimal event context
export interface TaskEventContext {
  id:              string;
  name:            string;
  date:            string;
  daysUntilEvent:  number;
  total:           number;
  pending:         number;
  openedPending:   number;
  noPhone:         number;
  responseRate:    number;
  healthTier:      "green" | "yellow" | "red";
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0, high: 1, medium: 2, low: 3,
};

export function generateTasks(events: TaskEventContext[]): Task[] {
  const tasks: Task[] = [];
  let counter = 0;
  const mkId = () => `ephemeral-task-${++counter}`;
  const now  = new Date().toISOString();

  for (const ev of events) {
    const { daysUntilEvent: d, total, pending, openedPending, noPhone, responseRate } = ev;
    if (d <= 0) continue;

    const push = (
      priority:   TaskPriority,
      title:      string,
      description: string,
      actionType: TaskAction,
      dueContext: string,
    ) =>
      tasks.push({
        id: mkId(), eventId: ev.id, eventName: ev.name,
        priority, title, description, status: "open",
        actionType, dueContext, createdAt: now,
      });

    if (d <= 7 && pending > 0) {
      push("urgent",
        "שליחת תזכורות אחרונות",
        `${pending} אורחים לא ענו — האירוע בעוד ${d} ימים בלבד.`,
        "send_reminders", `⚠ דחוף מאוד — ${d} ימים`);
    } else if (d <= 14 && pending > total * 0.2) {
      push("urgent",
        "תזכורת דחופה לממתינים",
        `${pending} מתוך ${total} (${Math.round(pending / total * 100)}%) עדיין לא ענו.`,
        "send_reminders", `${d} ימים לאירוע`);
    }

    if (openedPending >= 3) {
      push("high",
        "מעקב — פתחו ולא ענו",
        `${openedPending} אורחים פתחו את הקישור אך לא השלימו אישור.`,
        "send_reminders", "מומלץ לבצע היום");
    }

    if (responseRate < 40 && d > 14 && pending > 10) {
      push("high",
        "גל הזמנות — אחוז מענה נמוך",
        `רק ${responseRate}% ענו. שלחו גל הזמנות לכל הממתינים.`,
        "send_invitations", `${d} ימים לאירוע`);
    }

    if (noPhone > 5) {
      push("medium",
        "עדכון פרטי קשר",
        `ל-${noPhone} אורחים אין מספר טלפון — לא ניתן לפנות בוואטסאפ.`,
        "update_contacts", `עד ${d} ימים לפני האירוע`);
    }

    if (ev.healthTier === "red") {
      push("medium",
        "בדיקת מצב האירוע",
        "ציון בריאות נמוך — יש לבחון את מצב האישורים.",
        "review_event", `${d} ימים לאירוע`);
    }

    if (d <= 30 && responseRate >= 70) {
      push("low",
        "ייצוא דוח לאולם",
        `אחוז מענה ${responseRate}% — הגיע הזמן לשלוח דוח לאולם.`,
        "export_report", `מומלץ לפני ${d} ימים`);
    }
  }

  tasks.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  return tasks;
}
