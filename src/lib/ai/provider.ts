/**
 * AI Provider Interface
 *
 * Defines the contract that any AI implementation must satisfy.
 * The deterministic implementation is the default.
 * An LLM-backed implementation can be swapped in without touching callers.
 *
 * To upgrade:
 *   1. Create src/lib/ai/claude.ts (or openai.ts, etc.)
 *   2. Implement AIProvider
 *   3. Change getProvider() to return the new implementation
 *   4. Set NEXT_PUBLIC_AI_PROVIDER=claude in .env.local
 */

import type { Recommendation, RecommendationContext } from "../automation/recommendations";
import type { Task, TaskEventContext } from "../automation/task-engine";
import type { EventHealthReport, HealthInput } from "../automation/health";

// Shape of an AI-generated insight (richer than a plain string)
export interface AIInsight {
  text:       string;
  priority:   "urgent" | "high" | "medium" | "low";
  type:       "action" | "warning" | "info" | "positive";
  confidence: number;    // 0–1
  source:     "deterministic" | "ai";
}

export interface InsightContext {
  eventName:     string;
  eventDate?:    string;
  total:         number;
  confirmed:     number;
  declined:      number;
  pending:       number;
  responseRate:  number;
  daysUntilEvent?: number;
  recentActivity: number;
  openedPending: number;
  confirmRate:   number;
}

// ── The provider contract ──────────────────────────────────
export interface AIProvider {
  name: string;
  generateInsights(ctx: InsightContext): Promise<AIInsight[]>;
  generateRecommendations(events: RecommendationContext[]): Promise<Recommendation[]>;
  generateTasks(events: TaskEventContext[]): Promise<Task[]>;
  computeHealth(input: HealthInput): Promise<EventHealthReport>;
}
