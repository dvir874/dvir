/**
 * Automation Engine — Rule Evaluator
 *
 * Evaluates a set of AutomationRules against an ExecutionContext.
 * Pure function — no DB access, no side effects.
 *
 * Usage:
 *   const result = evaluateRules(rules, context);
 *   result.triggeredRules.forEach(r => dispatchActions(r.actions));
 */

import type {
  AutomationRule,
  Condition,
  ConditionGroup,
  EngineResult,
  ExecutionContext,
  RuleMatch,
  TriggerType,
} from "./types";

// Resolve a dot-path like "event.daysUntilEvent" from a nested context object
function resolvePath(ctx: ExecutionContext, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, ctx);
}

function evaluateCondition(cond: Condition, ctx: ExecutionContext): boolean {
  const left  = resolvePath(ctx, cond.field);
  const right = cond.value;

  switch (cond.operator) {
    case "eq":       return left === right;
    case "neq":      return left !== right;
    case "gt":       return typeof left === "number" && typeof right === "number" && left > right;
    case "lt":       return typeof left === "number" && typeof right === "number" && left < right;
    case "gte":      return typeof left === "number" && typeof right === "number" && left >= right;
    case "lte":      return typeof left === "number" && typeof right === "number" && left <= right;
    case "in":       return Array.isArray(right) && right.includes(left);
    case "contains": return typeof left === "string" && typeof right === "string" && left.includes(right);
    default:         return false;
  }
}

function evaluateGroup(group: ConditionGroup, ctx: ExecutionContext): boolean {
  if (group.and && group.and.length > 0) {
    return group.and.every((c) => evaluateCondition(c, ctx));
  }
  if (group.or && group.or.length > 0) {
    return group.or.some((c) => evaluateCondition(c, ctx));
  }
  // Empty conditions = always match
  return true;
}

export function evaluateRules(
  rules: AutomationRule[],
  trigger: TriggerType,
  ctx: ExecutionContext,
): EngineResult {
  const triggered: RuleMatch[] = [];
  const skipped:   RuleMatch[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.triggerType !== trigger) continue;

    const matched = evaluateGroup(rule.conditions, ctx);
    const match: RuleMatch = {
      ruleId:   rule.id,
      ruleName: rule.name,
      matched,
      actions:  matched ? rule.actions : [],
    };

    if (matched) triggered.push(match);
    else          skipped.push(match);
  }

  return { triggeredRules: triggered, skippedRules: skipped };
}

// Convenience: evaluate a single rule against a context
export function testRule(rule: AutomationRule, ctx: ExecutionContext): boolean {
  if (!rule.enabled) return false;
  return evaluateGroup(rule.conditions, ctx);
}
