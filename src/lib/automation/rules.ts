/**
 * Built-in Automation Rules
 *
 * These are the default rules seeded into automation_rules on first setup.
 * They are NOT hardcoded in application logic — they run through the engine.
 *
 * To disable a rule: set enabled = false in the DB.
 * To add a rule: INSERT into automation_rules.
 * To customize: edit conditions_json / actions_json in the DB.
 */

import type { AutomationRule } from "./types";

export const DEFAULT_RULES: Omit<AutomationRule, "id" | "createdAt">[] = [
  {
    name:        "Urgent reminder — event in 7 days with pending guests",
    enabled:     true,
    triggerType: "schedule.daily",
    conditions: {
      and: [
        { field: "event.daysUntilEvent", operator: "lte", value: 7 },
        { field: "event.daysUntilEvent", operator: "gt",  value: 0 },
        { field: "event.pending",        operator: "gt",  value: 0 },
      ],
    },
    actions: [
      {
        type: "create_task",
        payload: {
          priority:    "urgent",
          title:       "שליחת תזכורות אחרונות",
          description: "האירוע קרוב מאוד ויש אורחים שעדיין לא ענו.",
          action_type: "send_reminders",
        },
      },
    ],
  },
  {
    name:        "High reminder — event in 14 days, >20% pending",
    enabled:     true,
    triggerType: "schedule.daily",
    conditions: {
      and: [
        { field: "event.daysUntilEvent",  operator: "lte", value: 14 },
        { field: "event.daysUntilEvent",  operator: "gt",  value: 7  },
        { field: "event.pendingPercent",  operator: "gt",  value: 20 },
      ],
    },
    actions: [
      {
        type: "create_task",
        payload: {
          priority:    "high",
          title:       "תזכורת לממתינים",
          description: "יותר מ-20% מהאורחים עדיין לא ענו.",
          action_type: "send_reminders",
        },
      },
    ],
  },
  {
    name:        "Follow-up — opened RSVP but did not respond",
    enabled:     true,
    triggerType: "schedule.daily",
    conditions: {
      and: [
        { field: "event.openedPending", operator: "gte", value: 3 },
      ],
    },
    actions: [
      {
        type: "create_task",
        payload: {
          priority:    "high",
          title:       "מעקב אחרי אורחים שפתחו ולא ענו",
          description: "אורחים אלה כבר ראו את ההזמנה — תזכורת תניב תוצאות.",
          action_type: "send_reminders",
        },
      },
    ],
  },
  {
    name:        "Low response rate — send invitations",
    enabled:     true,
    triggerType: "schedule.daily",
    conditions: {
      and: [
        { field: "event.responseRate",   operator: "lt",  value: 40 },
        { field: "event.pending",        operator: "gt",  value: 10 },
        { field: "event.daysUntilEvent", operator: "gt",  value: 14 },
      ],
    },
    actions: [
      {
        type: "create_task",
        payload: {
          priority:    "high",
          title:       "גל הזמנות — אחוז מענה נמוך",
          description: "שלחו הזמנות לכלל הממתינים.",
          action_type: "send_invitations",
        },
      },
    ],
  },
  {
    name:        "Missing phone numbers",
    enabled:     true,
    triggerType: "schedule.daily",
    conditions: {
      and: [
        { field: "event.noPhone", operator: "gt", value: 5 },
      ],
    },
    actions: [
      {
        type: "create_task",
        payload: {
          priority:    "medium",
          title:       "עדכון פרטי קשר",
          description: "אורחים ללא מספר טלפון אינם ניתנים לפנייה בוואטסאפ.",
          action_type: "update_contacts",
        },
      },
    ],
  },
  {
    name:        "Venue report ready — high response rate",
    enabled:     true,
    triggerType: "schedule.daily",
    conditions: {
      and: [
        { field: "event.responseRate",   operator: "gte", value: 70 },
        { field: "event.daysUntilEvent", operator: "lte", value: 30 },
        { field: "event.daysUntilEvent", operator: "gt",  value: 0  },
      ],
    },
    actions: [
      {
        type: "create_task",
        payload: {
          priority:    "low",
          title:       "ייצוא דוח לאולם",
          description: "אחוז המענה גבוה — הגיע הזמן לשלוח דוח לאולם האירועים.",
          action_type: "export_report",
        },
      },
    ],
  },
];
