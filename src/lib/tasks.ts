/**
 * Task Queue Generator
 *
 * Takes the manager overview (all events + aggregated stats) and produces
 * a prioritized list of recommended actions.
 *
 * Architecture: pure function — no side effects, no API calls.
 * Future: replace or augment with AI-generated tasks.
 */

export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type TaskAction   = "send_reminders" | "send_invitations" | "update_contacts" | "review_event" | "export_report";

export interface Task {
  id: string;
  eventId: string;
  eventName: string;
  priority: TaskPriority;
  action: TaskAction;
  title: string;
  description: string;
  dueContext: string;   // e.g. "אירוע בעוד 7 ימים"
}

interface EventInput {
  id: string;
  name: string;
  date: string;
  daysUntilEvent: number;
  total: number;
  pending: number;
  openedPending: number;
  noPhone: number;
  responseRate: number;
  healthTier: "green" | "yellow" | "red";
  recentActivity: number;
}

const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function generateTasks(events: EventInput[]): Task[] {
  const tasks: Task[] = [];
  let counter = 0;
  const id = () => `task-${++counter}`;

  for (const ev of events) {
    const { daysUntilEvent: d, total, pending, openedPending, noPhone, responseRate } = ev;
    if (d <= 0) continue; // skip past events

    // URGENT: event very soon + many pending
    if (d <= 7 && pending > 0) {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "urgent", action: "send_reminders",
        title: `שליחת תזכורות אחרונות`,
        description: `${pending} אורחים לא ענו — האירוע בעוד ${d} ימים בלבד.`,
        dueContext: `⚠ דחוף מאוד — ${d} ימים`,
      });
    } else if (d <= 14 && pending > total * 0.2) {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "urgent", action: "send_reminders",
        title: `תזכורת דחופה לממתינים`,
        description: `${pending} מתוך ${total} (${Math.round(pending / total * 100)}%) עדיין לא ענו. האירוע בעוד ${d} ימים.`,
        dueContext: `${d} ימים לאירוע`,
      });
    }

    // HIGH: guests opened but didn't respond
    if (openedPending >= 3) {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "high", action: "send_reminders",
        title: `תזכורת לאורחים שפתחו ולא ענו`,
        description: `${openedPending} אורחים פתחו את הקישור אך לא השלימו את האישור — הם כבר מודעים להזמנה.`,
        dueContext: `מומלץ לבצע היום`,
      });
    }

    // HIGH: low response rate with time to act
    if (responseRate < 40 && d > 14 && pending > 10) {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "high", action: "send_invitations",
        title: `גל הזמנות — אחוז מענה נמוך`,
        description: `רק ${responseRate}% מהאורחים ענו. שלחו גל הזמנות לכל הממתינים.`,
        dueContext: `${d} ימים לאירוע`,
      });
    }

    // MEDIUM: guests without phone number
    if (noPhone > 5) {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "medium", action: "update_contacts",
        title: `עדכון פרטי קשר`,
        description: `ל-${noPhone} אורחים אין מספר טלפון — לא ניתן לשלוח להם הזמנה בוואטסאפ.`,
        dueContext: `עד ${d} ימים לפני האירוע`,
      });
    }

    // MEDIUM: health score red/yellow
    if (ev.healthTier === "red") {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "medium", action: "review_event",
        title: `בדיקת מצב האירוע`,
        description: `ציון בריאות נמוך — יש לבחון את מצב האישורים ולנקוט פעולה.`,
        dueContext: `${d} ימים לאירוע`,
      });
    }

    // LOW: event ≤30 days, response rate good — suggest venue report
    if (d <= 30 && responseRate >= 70) {
      tasks.push({
        id: id(), eventId: ev.id, eventName: ev.name,
        priority: "low", action: "export_report",
        title: `ייצוא דוח לאולם`,
        description: `אחוז מענה ${responseRate}% — הגיע הזמן לשלוח דוח מפורט לאולם האירועים.`,
        dueContext: `מומלץ לפני ${d} ימים`,
      });
    }
  }

  // Sort by priority
  tasks.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  return tasks;
}
