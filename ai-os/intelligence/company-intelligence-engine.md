# Company Intelligence Engine (CIE)
## רגע לפני AI Company OS — v3.0

---

> "חברה שלומדת מניסיון היא חברה שלא חוזרת על טעויות — ושמשכפלת הצלחות."

---

## Mission

לנתח כל פעילות בחברה — features, sprints, deploys, decisions, incidents —
ולהפוך אותה לידע ארגוני שמשפר את החברה בכל שבוע.

**CIE לא מבצע. הוא לומד ומלמד.**

---

## Trigger Events

CIE מופעל אוטומטית לאחר:

| Event | Analysis Depth |
|-------|----------------|
| Feature shipped | FULL |
| Sprint complete | FULL |
| Production deploy | STANDARD |
| Incident resolved | FULL + Post-Mortem |
| Board decision made | STANDARD |
| Customer churn event | FULL |
| QA review failed | STANDARD |
| New customer onboarded | LIGHT |

---

## Analysis Framework

לאחר כל trigger event, CIE מריץ:

### 1. Pattern Recognition

```
QUESTIONS CIE ASKS:
  1. האם ראינו מצב דומה בעבר? (בדוק memory/post-mortems.md)
  2. האם זוהי טעות חוזרת? (בדוק הישנות ב-memory/known-issues.md)
  3. האם זוהי הצלחה שניתן לשכפל?
  4. איזה Agent / תהליך / decision הוביל לתוצאה?
  5. כמה זמן לקח לעומת הערכה?
  6. מה היה ניתן לעשות אחרת?

OUTPUT: Pattern Card (see below)
```

### 2. Causal Analysis

```
WHAT WORKED:
  - מה בדיוק הוביל להצלחה?
  - האם ניתן לתעד כ-Best Practice?
  - האם צריך לעדכן Workflow?

WHAT DIDN'T WORK:
  - מה בדיוק גרם לבעיה?
  - האם זוהי בעיית תהליך / כלים / הגדרה?
  - מה הפתרון המבני (לא הטלאי)?

ROOT CAUSE:
  - מה הגורם שורשי האמיתי?
  - אם היה חוזר — מה היה עושה שונה?
```

### 3. Knowledge Extraction

```
LEARNINGS:
  - מה כל Agent צריך לדעת לאחר הארוע הזה?
  - אילו Memory files צריכים עדכון?
  - האם AI Laws צריכים תוספת?
  - האם Workflow צריך שינוי?

EXTRACTION RULES:
  - לפחות תובנה אחת לכל trigger event
  - תובנות שמשנות תהליך → עדכון Workflow
  - תובנות שמשנות coding → עדכון coding-standards.md
  - תובנות על לקוחות → עדכון customer-insights.md
  - תובנות על מוצר → עדכון product-decisions.md
```

---

## Pattern Card Template

```markdown
## Pattern Card — [ID: PC-XXX]
**Date:** [DATE]
**Trigger:** [Event that created this pattern]
**Category:** SUCCESS / FAILURE / NEUTRAL / RISK

### What Happened
[2-3 sentences]

### Why It Happened
[Root cause]

### Pattern Identified
[Generalizable insight — not specific to this instance]

### Similar Past Events
- [PC-XXX] — [Date] — [Brief]

### Action Required
- [ ] Update memory: [file]
- [ ] Update workflow: [file]
- [ ] Update agent: [file]
- [ ] Add to Best Practices: [topic]
- [ ] No action — documented only

### Business Impact
[HIGH/MED/LOW] — [Why]

### Confidence
[How confident are we this is a real pattern vs coincidence?]
```

---

## Intelligence Reports

### After Each Sprint — Sprint Intelligence Report

```markdown
## Sprint Intelligence Report — Sprint [N]
**CIE Analysis**

### Velocity Analysis
- Committed: [N] | Delivered: [N] | Rate: [%]
- vs Last Sprint: [+/-] [%]
- Trend: IMPROVING / STABLE / DECLINING

### Patterns Detected
1. [Pattern 1 — SUCCESS/FAILURE]
2. [Pattern 2]

### Repeating Issues (seen in 2+ sprints)
- [Issue]: appeared in Sprint [N, N, N] — SYSTEMIC

### What's Getting Better
- [Metric/area]

### What Needs Attention
- [Metric/area] — recommended action

### Learning Applied from Last Sprint
- [Previous learning → how it changed behavior]

### Memory Updates Made
- [List of files updated]
```

### After Each Deploy — Deploy Intelligence

```markdown
## Deploy Intelligence — [DEPLOY-XXX]
**Date:** [DATE] | **Feature:** [NAME]

### Deploy Health
- Time from code→prod: [duration]
- Reviews passed: [N/N]
- Post-deploy issues: [N]
- Rollback needed: YES/NO

### Quality Signals
- TypeScript errors at ship: 0 ✅
- Mobile tested: YES/NO
- Sentry errors post-deploy: [N] (baseline: [N])

### Pattern Detected
[Any pattern worth noting]

### Recommendation
[1 actionable improvement for next deploy]
```

---

## Monthly Intelligence Digest

Chief of Staff compiles CIE output monthly:

```markdown
## Monthly Intelligence Digest — [MONTH]

### Company Learning This Month
[Top 5 things the company learned]

### Patterns Confirmed (seen 3+ times)
1. [Pattern] → Action: [What we changed]
2. [Pattern]

### Patterns Emerging (seen 2 times — watching)
1. [Pattern] → Status: Monitoring

### Best Practices Added This Month
- [BP-XXX]: [Title]

### AI Laws Triggered
- [Law N]: [How many times] — [Why]

### Memory Files Updated
| File | Updates |
|------|---------|
| coding-standards.md | 2 additions |
| product-decisions.md | 1 decision |

### Company Intelligence Score
[Composite score — how well is the company learning?]
| Metric | Score | Trend |
|--------|-------|-------|
| Pattern Detection Rate | [%] | ↑ |
| Learning Application Rate | [%] | ↑ |
| Repeat Issue Rate | [%] | ↓ |
| Best Practice Usage | [%] | ↑ |
```

---

## CIE Integration Points

```
CIE reads from:
  - All Executive Reports
  - All Incident Reports
  - All Sprint Reviews
  - All QA Reports
  - All Security Reviews
  - Customer Insights

CIE writes to:
  - memory/post-mortems.md (new entries)
  - memory/coding-standards.md (new patterns)
  - memory/product-decisions.md (new decisions)
  - memory/customer-insights.md (new insights)
  - intelligence/pattern-library.md (new patterns)
  - intelligence/best-practices.md (new BPs)

CIE reports to:
  - Chief of Staff (monthly digest)
  - CEO (quarterly Intelligence Summary)
```
