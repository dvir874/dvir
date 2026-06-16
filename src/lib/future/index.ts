/**
 * Future Feature Architecture
 *
 * This file defines the interfaces and contracts for planned features.
 * No implementation exists yet — only the type contracts that future
 * modules must satisfy.
 *
 * To implement a feature, create a file at the path noted in each section
 * and export functions matching the interfaces defined here.
 */

// ─────────────────────────────────────────────────────────
// SEATING PLANNER  (future: src/app/seating/[eventId]/page.tsx)
// ─────────────────────────────────────────────────────────
export interface SeatingTable {
  id: string;
  eventId: string;
  name: string;         // "שולחן 1", "שולחן כבוד", etc.
  capacity: number;
  assigned: string[];   // guest IDs
}

export interface SeatingAssignment {
  guestId: string;
  tableId: string;
  seatNumber?: number;
}

// ─────────────────────────────────────────────────────────
// AI ASSISTANT  (future: src/lib/ai-assistant.ts)
// Upgrade path: replace generateInsights() with this interface
// ─────────────────────────────────────────────────────────
export interface AIInsight {
  text: string;
  confidence: number;   // 0–1
  priority: "urgent" | "high" | "medium" | "low";
  type: "action" | "warning" | "info" | "positive";
  source: "deterministic" | "llm";
}

export type AIInsightGenerator = (
  eventId: string,
  context: Record<string, unknown>
) => Promise<AIInsight[]>;

// ─────────────────────────────────────────────────────────
// CLIENT PORTAL  (future: src/app/client/[token]/page.tsx)
// Upgrade of /couple/[token] with two-way communication
// ─────────────────────────────────────────────────────────
export interface ClientPortalMessage {
  id: string;
  eventId: string;
  from: "manager" | "couple";
  body: string;
  read: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────
// AUTOMATED REMINDERS  (future: src/lib/automation.ts)
// ─────────────────────────────────────────────────────────
export interface ReminderSchedule {
  eventId: string;
  triggerDaysBefore: number;  // e.g. 30, 14, 7
  targetStatus: "pending" | "all";
  messageTemplate: "invitation" | "reminder" | "final";
  enabled: boolean;
}

// ─────────────────────────────────────────────────────────
// PAYMENTS  (future: src/lib/payments.ts)
// ─────────────────────────────────────────────────────────
export interface ServicePackage {
  id: string;
  name: string;
  priceILS: number;
  features: string[];
}

export interface Invoice {
  id: string;
  eventId: string;
  packageId: string;
  paidAt?: string;
  status: "pending" | "paid" | "cancelled";
}

// ─────────────────────────────────────────────────────────
// VENDOR INTEGRATIONS  (future: src/lib/vendors.ts)
// ─────────────────────────────────────────────────────────
export interface VendorContact {
  id: string;
  eventId: string;
  role: "venue" | "catering" | "photographer" | "band" | "other";
  name: string;
  email?: string;
  phone?: string;
}
