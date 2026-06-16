/**
 * Deterministic AI Provider
 *
 * The default (and currently only) implementation of AIProvider.
 * All logic is pure, data-driven, and requires no external services.
 *
 * When upgrading to a real AI:
 *   - Keep this file as the fallback / offline provider
 *   - Create a new provider that wraps an LLM API
 *   - Register it in registry.ts
 */

import type { AIProvider, AIInsight, InsightContext } from "./provider";
import type { Recommendation, RecommendationContext } from "../automation/recommendations";
import type { Task, TaskEventContext } from "../automation/task-engine";
import type { EventHealthReport, HealthInput } from "../automation/health";
import { generateRecommendations as _genRecs }  from "../automation/recommendations";
import { generateTasks as _genTasks }            from "../automation/task-engine";
import { computeEventHealth }                    from "../automation/health";

export const DeterministicProvider: AIProvider = {
  name: "deterministic",

  async generateInsights(ctx: InsightContext): Promise<AIInsight[]> {
    const now = Date.now();
    const insights: AIInsight[] = [];
    const { total, confirmed, declined, pending, responseRate, daysUntilEvent: d, recentActivity, openedPending } = ctx;
    const responders = confirmed + declined;

    if (d !== undefined && d <= 7 && pending > 0) {
      insights.push({ text: `⚠️ האירוע בעוד ${d} ימים — ${pending} אורחים טרם ענו. שלח תזכורות מיידית.`, priority: "urgent", type: "warning",  confidence: 0.98, source: "deterministic" });
    }
    if (openedPending >= 3) {
      insights.push({ text: `👁 ${openedPending} אורחים פתחו את הקישור אך לא ענו — שלח להם תזכורת.`, priority: "high",   type: "action",   confidence: 0.93, source: "deterministic" });
    }
    if (responseRate < 40 && pending > 10) {
      insights.push({ text: `🔔 אחוז מענה נמוך: ${responseRate}% — ${pending} ממתינים. שקול גל הזמנות.`, priority: "high",   type: "action",   confidence: 0.88, source: "deterministic" });
    }
    if (recentActivity === 0 && pending > total * 0.3) {
      insights.push({ text: `📉 אין פעילות ב-7 ימים האחרונים — ${pending} ממתינים עדיין.`,               priority: "medium", type: "warning",  confidence: 0.80, source: "deterministic" });
    }
    if (responders > 0) {
      insights.push({ text: `📊 אחוז מענה: ${responseRate}% (${responders} מתוך ${total}).`,               priority: "low",    type: "info",     confidence: 1.00, source: "deterministic" });
    }
    if (recentActivity > 0) {
      insights.push({ text: `⚡ ${recentActivity} תגובות התקבלו ב-7 ימים האחרונים.`,                       priority: "low",    type: "positive", confidence: 1.00, source: "deterministic" });
    }

    void now; // silence unused warning
    return insights.sort((a, b) => {
      const r = { urgent: 0, high: 1, medium: 2, low: 3 };
      return r[a.priority] - r[b.priority];
    });
  },

  async generateRecommendations(events: RecommendationContext[]): Promise<Recommendation[]> {
    return _genRecs(events);
  },

  async generateTasks(events: TaskEventContext[]): Promise<Task[]> {
    return _genTasks(events);
  },

  async computeHealth(input: HealthInput): Promise<EventHealthReport> {
    return computeEventHealth(input);
  },
};
