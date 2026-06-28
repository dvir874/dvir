# Escalation Tree
## רגע לפני AI Company OS — v2.0

---

## Escalation Principles

1. **Resolve at the lowest level possible** — אל תעלה מה שאפשר לפתור לבד
2. **Time-box every level** — כל level מקבל window לפתרון; אם עבר — עולה
3. **Document every escalation** — כל escalation מתועד
4. **No blame** — escalation = מידע, לא כישלון

---

## Escalation Tree Structure

```
Level 0 — Agent Self-Resolution (< 30 min)
    ↓ (if unresolved)
Level 1 — Direct Manager (< 2h)
    ↓ (if unresolved)
Level 2 — COO (< 4h)
    ↓ (if unresolved)
Level 3 — Chief of Staff (< 8h)
    ↓ (if unresolved)
Level 4 — CEO (immediate for P0, same day for rest)
```

---

## Level 0 — Agent Self-Resolution

**Time limit:** 30 minutes
**Who:** The agent facing the issue

```
WHEN TO USE:
  - Technical ambiguity that can be resolved by reading Memory
  - Minor blocker that has an obvious solution
  - Questions answered in CLAUDE.md or company constitution

HOW:
  1. Read relevant memory files
  2. Check company constitution + AI laws
  3. Apply best judgment
  4. Document decision in task notes

WHEN TO ESCALATE:
  - Issue not covered in memory
  - Decision has significant risk
  - Two valid options exist (agent can't choose)
  - AI Law would be violated either way
```

---

## Level 1 — Direct Manager

**Time limit:** 2 hours
**Who:**

| Agent | Escalates To |
|-------|-------------|
| Frontend Engineer | CTO |
| Backend Engineer | CTO |
| Security Engineer | CTO |
| QA Engineer | CTO |
| Release Manager | CTO |
| UX Director | Product Manager |
| Analytics | CEO via CoS |
| Customer Success | CEO via CoS |
| Marketing Director | CEO via CoS |
| Finance | CEO via CoS |

```
WHEN TO USE:
  - Technical decision between 2 valid approaches
  - Unclear requirements from spec
  - Resource needed from another team
  - Task scope changed

HOW:
  1. Brief description: problem + what you've tried
  2. Options you've considered
  3. Your recommended option
  4. Request decision

WHEN TO ESCALATE:
  - Manager can't decide (needs CoS/CEO input)
  - Conflict between departments
  - AI Law potentially violated
  - Time-sensitive beyond manager's authority
```

---

## Level 2 — COO

**Time limit:** 4 hours
**Who:** COO Agent

```
WHEN TO USE:
  - Inter-department resource conflict
  - Sprint scope needs adjustment
  - Multiple agents blocked on same issue
  - Workflow breakdown (gate not moving)
  - Unclear ownership of task

HOW:
  1. Describe the operational blocker
  2. Who is affected and how
  3. Proposed resolution
  4. Resources needed

WHEN TO ESCALATE:
  - Strategic decision needed
  - Budget/resource decision beyond ops authority
  - AI Law violated
  - P0 Incident (skip to Level 4 immediately)
```

---

## Level 3 — Chief of Staff

**Time limit:** 8 hours (same business day)
**Who:** Chief of Staff Agent

```
WHEN TO USE:
  - Strategic conflicts between departments
  - Decisions that require CEO context
  - AI Law violation confirmed
  - Significant risk identified
  - Cross-cutting decisions (affects 3+ departments)

HOW:
  1. Full brief: problem, context, options, recommendation
  2. Which AI Laws are relevant
  3. Business impact if not resolved today
  4. CoS recommendation

WHEN TO ESCALATE TO CEO:
  - Production deploy decision
  - AI Law violation
  - Budget decision
  - Strategic priority change
  - P0 Incident (immediate)
  - Any irreversible action
```

---

## Level 4 — CEO

**Time limit:** Immediate for P0 | Same day for rest
**Who:** CEO (Dvir)

```
REQUIRED FOR (always CEO):
  ✅ Production deploys
  ✅ DB migrations in production
  ✅ Data deletion
  ✅ Pricing changes
  ✅ Strategic direction changes
  ✅ AI Law overrides (if ever needed)
  ✅ P0 incident response
  ✅ Budget decisions
  ✅ Marketing publish (new campaigns)
  ✅ New WhatsApp templates
  ✅ Third-party integrations

HOW CEO DECIDES:
  1. CoS presents Executive Decision Brief
  2. CEO reviews options + recommendation
  3. CEO states decision clearly ("approved", "rejected", "needs X first")
  4. CoS communicates decision to all affected agents
  5. Decision logged in memory/product-decisions.md
```

---

## Conflict Resolution (Between Agents)

```
SCENARIO: Two agents disagree on approach

Step 1: Agents try to resolve directly (30 min)
Step 2: Both present case to direct manager (2h)
Step 3: If still unresolved → COO mediates (4h)
Step 4: If still unresolved → CoS arbitrates with Board Review (8h)
Step 5: CEO final decision

RULE: No agent can block another's work indefinitely.
      If conflict unresolved after 4h → COO assigns default path.
```

---

## Emergency Escalation (P0 Only)

```
Skip all levels:
Anyone → CEO + CoS + CTO simultaneously

Message format:
"🔴 P0 EMERGENCY
Issue: [one line]
Impact: [who affected]
Immediate action taken: [what you did]
Need: [what you need from them]"

Response SLA: < 15 minutes
```

---

## Escalation Log Template

```markdown
## Escalation Log Entry
**Date:** [DATE TIME]
**From:** [Agent]
**To:** [Level reached]
**Issue:** [Brief description]
**Resolution:** [What was decided]
**Time to Resolve:** [Duration]
**Lessons Learned:** [If any]
```

---

## What NOT to Escalate

- Questions answered in memory files (read first)
- Minor CSS/styling decisions within design system
- Technical implementation details within scope
- Routine daily tasks
- Things covered in CLAUDE.md
