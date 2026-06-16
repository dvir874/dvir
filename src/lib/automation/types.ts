/**
 * Automation Engine — Core Types
 *
 * These types define the shape of automation rules, contexts, and results.
 * Nothing here is specific to weddings or RSVPs — this is generic infrastructure.
 *
 * Layering:
 *   types.ts       — shared contracts (this file)
 *   engine.ts      — rule evaluation
 *   task-engine.ts — persistent task generation
 *   recommendations.ts — ephemeral suggestions
 *   health.ts      — event health scoring
 *   scheduler.ts   — scheduled job registry
 */

// ── Trigger types ──────────────────────────────────────────
// The condition that wakes up a rule.
export type TriggerType =
  | "event.created"
  | "event.updated"
  | "guest.responded"
  | "guest.opened_rsvp"
  | "schedule.daily"
  | "schedule.hourly"
  | "manual"
  | "threshold.response_rate"
  | "threshold.days_until_event";

// ── Condition ──────────────────────────────────────────────
// A single comparison: context[field] operator value
export interface Condition {
  field: string;          // dot-path into context, e.g. "event.daysUntilEvent"
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "in" | "contains";
  value: unknown;
}

// Rules use AND logic by default; wrap in { or: [...] } for OR
export interface ConditionGroup {
  and?: Condition[];
  or?:  Condition[];
}

// ── Action ─────────────────────────────────────────────────
export type ActionType =
  | "create_task"
  | "create_recommendation"
  | "notify_manager"
  | "update_event_flag"
  | "trigger_rule";       // chain to another rule

export interface Action {
  type: ActionType;
  payload: Record<string, unknown>;
}

// ── Rule ───────────────────────────────────────────────────
export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  conditions: ConditionGroup;
  actions: Action[];
  createdAt: string;
}

// DB row shape (JSON columns stored as strings in Supabase)
export interface AutomationRuleRow {
  id: string;
  name: string;
  enabled: boolean;
  trigger_type: TriggerType;
  conditions_json: ConditionGroup;
  actions_json: Action[];
  created_at: string;
}

export function rowToRule(row: AutomationRuleRow): AutomationRule {
  return {
    id:          row.id,
    name:        row.name,
    enabled:     row.enabled,
    triggerType: row.trigger_type,
    conditions:  row.conditions_json,
    actions:     row.actions_json,
    createdAt:   row.created_at,
  };
}

// ── Execution context ──────────────────────────────────────
// Arbitrary key/value bag passed to the engine when a trigger fires.
// Values at any nesting level; engine uses dot-path resolution.
export type ContextValue = string | number | boolean | null | undefined;
export type ExecutionContext = Record<string, ContextValue | Record<string, ContextValue>>;

// ── Engine result ──────────────────────────────────────────
export interface RuleMatch {
  ruleId:  string;
  ruleName: string;
  matched: boolean;
  actions: Action[];
}

export interface EngineResult {
  triggeredRules: RuleMatch[];
  skippedRules:   RuleMatch[];
}
