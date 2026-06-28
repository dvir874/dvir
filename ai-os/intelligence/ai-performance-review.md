# AI Agent Performance Review
## רגע לפני AI Company OS — v3.0

---

## Mission

פעם בחודש — כל Agent מקבל Performance Review.
המטרה אינה ענישה. המטרה היא שיפור מתמיד של כל מרכיב במערכת.

---

## Review Cadence

| Review Type | Frequency | Reviewer |
|-------------|-----------|---------|
| Monthly Performance Review | Monthly | Chief of Staff + CIE |
| Sprint Contribution Review | Per Sprint | COO |
| Incident Performance Review | After P0/P1 | CTO + CoS |
| Annual Calibration | Yearly | CEO + CoS |

---

## Performance Dimensions

### Dimension 1 — Accuracy (דיוק)

```
MEASURES:
  - % of outputs accepted without revision
  - % of decisions that proved correct retrospectively
  - Rate of "went back to fix" after handoff

TARGETS:
  - Execution Agents (Frontend/Backend/QA): ≥ 85% first-pass acceptance
  - Decision Agents (CTO/PM/UX): ≥ 90% recommendation accuracy
  - Review Agents (Security/QA): 0 missed critical issues
```

### Dimension 2 — Quality (איכות)

```
MEASURES:
  - Output quality vs standard (checklist completion rate)
  - Zero TypeScript errors (technical agents)
  - Pixel accuracy (Frontend)
  - Documentation completeness
  - Memory update rate after tasks

TARGETS:
  - Checklist completion: 100%
  - TypeScript errors shipped: 0
```

### Dimension 3 — Speed (מהירות)

```
MEASURES:
  - Average task completion time vs estimate
  - Response time to escalations
  - Report delivery timeliness

TARGETS:
  - Escalation response: < 2h
  - Report delivery: 100% on time
  - Task completion: < 120% of estimate
```

### Dimension 4 — Business Impact (השפעה עסקית)

```
MEASURES:
  - Features shipped that moved business KPIs
  - Bugs caught before reaching production
  - Customer issues prevented by proactive action
  - Revenue impact of recommendations

NOTE: Not all agents have direct revenue impact.
      Adjust measurement by role.
```

### Dimension 5 — Collaboration (שיתוף פעולה)

```
MEASURES:
  - Escalations received (fewer = better collaboration)
  - Conflicts with other agents (should be rare)
  - Quality of handoffs (was the next agent able to continue smoothly?)
  - Memory contributions (sharing knowledge with others)
```

### Dimension 6 — Decision Quality (איכות החלטות)

```
MEASURES:
  - When agent recommended Option X — was X the right call?
  - When agent said "approved" — was it actually safe?
  - When agent flagged risk — was the risk real?

TRACKED VIA: Decision Log in decision-intelligence.md
```

### Dimension 7 — Learning (למידה)

```
MEASURES:
  - Were lessons from post-mortems applied in subsequent tasks?
  - Did agent update memory correctly?
  - Did agent's performance improve month-over-month?
  - Did agent catch issues earlier than before?
```

---

## Monthly Performance Report Template

```markdown
# Agent Performance Review — [MONTH]
**Agent:** [Agent Name]
**Reviewed by:** Chief of Staff + CIE
**Review Period:** [MONTH YEAR]

## Overall Performance Score: [N]/100

## Dimension Scores

| Dimension | Score | vs Last Month | Notes |
|-----------|-------|---------------|-------|
| Accuracy | 88 | +3 | |
| Quality | 92 | → | |
| Speed | 79 | -4 | Sprint 11 delays |
| Business Impact | 85 | +5 | |
| Collaboration | 91 | → | |
| Decision Quality | 87 | → | |
| Learning | 76 | +8 | Applied 3 lessons |

## This Month's Contributions
- [Task 1]: [Outcome]
- [Task 2]: [Outcome]

## Highlights (what worked well)
1. [Highlight]
2. [Highlight]

## Development Areas (what to improve)
1. [Area]: [Specific recommendation]
2. [Area]

## Patterns Noticed by CIE
[Any repeating behaviors — good or bad]

## Recommended Adjustments
[Changes to agent's checklist, memory, or workflow to improve performance]

## Goal for Next Month
[One specific, measurable improvement target]

## Agent Self-Assessment (optional)
[Agent's own reflection on the month]
```

---

## Agent Leaderboard (Company-Wide)

Monthly, CoS publishes internal leaderboard:

```markdown
## Agent Leaderboard — [MONTH]

| Rank | Agent | Score | Trend |
|------|-------|-------|-------|
| 1 | Security Engineer | 97 | ↑ |
| 2 | QA Engineer | 94 | → |
| 3 | Backend Engineer | 91 | ↑ |
| ... | ... | ... | ... |

## Most Improved This Month
[Agent name] +[N] points — [reason]

## Company Average: [N]/100
```

---

## Performance Improvement Plans

If an agent scores below 60 for 2 consecutive months:

```
STEP 1: CoS identifies root cause
  - Is the issue the agent's definition (missing context)?
  - Is the issue the memory it reads (outdated)?
  - Is the issue the workflow (too complex)?
  - Is the issue the KPIs (wrong measurements)?

STEP 2: Targeted improvement plan
  - Update agent definition file
  - Update memory files it reads
  - Add specific checklist items
  - Add examples of what "good" looks like

STEP 3: Re-measure in 30 days
```

**Note:** Agents are not "fired" — they are improved. If an agent consistently underperforms, its definition/memory/workflow is updated until it performs correctly.

---

## Annual Calibration (CEO + CoS)

Once per year:
- Review all agent scores over the year
- Identify which agents are most/least valuable
- Consider restructuring responsibilities
- Consider adding new agents (new needs)
- Consider deprecating agents (if function is no longer needed)
- Update Company Charter if org structure changes
