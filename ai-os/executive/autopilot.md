# Autonomous Operating Mode (Autopilot)
## רגע לפני AI Company OS — v2.1

---

> "המערכת מנהלת את עצמה. CEO מנהל את הכיוון."

---

## What Is Autopilot?

**Autopilot = ברירת המחדל של ה-AI Company OS.**

כאשר CEO נותן משימה — Chief of Staff לוקח אותה, מנתח אותה, מפעיל את כל ה-Agents הנכונים בסדר הנכון, מבצע את כל ה-Reviews הנדרשים, פותר Blockers, ומגיש Executive Brief אחד בסיום.

CEO לא מנהל. CEO מחליט.

---

## Autopilot Activation

**מתי Autopilot פועל:** תמיד — על כל משימה שמגיעה ל-Chief of Staff.

**מי מפעיל:** Chief of Staff אוטומטית.

**מה CEO צריך לעשות:** לתת משימה / שאלה / יעד. הכל אחרי — אוטומטי.

---

## Step 1 — Task Intake & Analysis (Chief of Staff)

כל משימה נכנסת נעברת ניתוח:

```
INPUT: משימה/שאלה/יעד מה-CEO
      ↓
ANALYSIS:
  1. Task Type Classification
     ├── FEATURE — פיצ'ר חדש
     ├── BUG_FIX — תיקון
     ├── DESIGN — עיצוב בלבד
     ├── CONTENT — תוכן שיווקי
     ├── RESEARCH — מחקר
     ├── OPERATIONAL — תפעול
     ├── STRATEGIC — החלטה אסטרטגית
     └── CRISIS — אירוע חירום
  
  2. Departments Involved (auto-detect from task type)
  
  3. Required Reviews (auto-select from task type)
  
  4. Risk Level (LOW / MEDIUM / HIGH / CRITICAL)
  
  5. CEO Approval Required? (YES/NO — per AI Laws)
  
  6. Estimated Duration
      ↓
OUTPUT: Autopilot Plan → activate workflow
```

---

## Step 2 — Auto-Routing (by Task Type)

### FEATURE Route

```
Chief of Staff → Task Intake
      ↓
Product Manager → Feature Spec (PRD)
      ↓
UX Director → Stitch Design [if UI involved]
      ↓
Design Council → Design Review [if significant UI]
      ↓
CTO → Technical Review + Architecture
      ↓
Backend Engineer → API + DB [if needed]
      ↓
Frontend Engineer → Implementation
      ↓
── AUTO REVIEWS (all run in parallel) ──
QA Engineer          → Acceptance Criteria + Regression
Security Engineer    → Security Review
UX Director          → Pixel Accuracy Check
Performance Review   → Mobile score, API response time
Accessibility Review → WCAG checks
Mobile Review        → 375px, 768px, RTL
Business Review      → Zero Downtime, backward compat
── END REVIEWS ──
      ↓
[If any review FAILS → back to owner for fix → re-review]
      ↓
Release Manager → Deploy Checklist
      ↓
[CEO_REQUIRED: YES] → Executive Brief to CEO → CEO Approves → Deploy
[CEO_REQUIRED: NO]  → Deploy (auto, if all reviews pass)
      ↓
Post-Deploy Monitoring (24h)
      ↓
Retrospective → Memory Update
      ↓
Executive Brief → CEO
```

---

### BUG_FIX Route

```
Chief of Staff → Severity Classification (P0/P1/P2/P3)
      ↓
[P0/P1] → CRISIS MODE (crisis-management.md)
[P2/P3] ↓
CTO → Root Cause Analysis
      ↓
Frontend or Backend → Fix
      ↓
QA Engineer → Regression Check
Security Engineer → Security Check (if security-related bug)
      ↓
Release Manager → Hotfix Deploy Checklist
      ↓
[P2: CEO notified] → Auto-Deploy
[P1: CEO approves] → Deploy
      ↓
Retrospective (if P0/P1 → full post-mortem)
      ↓
Executive Brief → CEO
```

---

### DESIGN Route

```
Chief of Staff → Design Council notification
      ↓
UX Director → Stitch Design
      ↓
Design Council → Review (24h async)
      ↓
[APPROVED] → Frontend Engineer → Implementation
[NEEDS_REVISION] → UX Director → Revise → Re-review
[REJECTED] → CoS → CEO Decision Brief
      ↓
[After implementation]
UX Director → Pixel Accuracy QA
Mobile Review → 375px + RTL
Accessibility Review
      ↓
Executive Brief → CEO
```

---

### CONTENT Route

```
Chief of Staff → Content brief
      ↓
Marketing Director → Draft
      ↓
Customer Success → Customer accuracy review
      ↓
[CEO_REQUIRED: YES] → CEO Approval → Publish
      ↓
Executive Brief → CEO
```

---

### RESEARCH Route

```
Chief of Staff → Research brief
      ↓
Relevant Research Agent (R1/R2/R3/R4)
      ↓
Research Report produced
      ↓
Analytics → Data validation (if needed)
      ↓
Chief of Staff → Compiles into Strategic Brief
      ↓
CEO receives Research Brief (no approval needed)
```

---

### STRATEGIC Route (Decision Needed)

```
Chief of Staff → Board Review activation
      ↓
ALL relevant departments → Submit opinions (async, 24h)
      ↓
Chief of Staff → Executive Decision Brief
      ↓
CEO → Decision
      ↓
Chief of Staff → Communicate decision to all agents
      ↓
Memory Update (product-decisions.md)
```

---

### OPERATIONAL Route (No Code)

```
Chief of Staff → Assign to relevant agent
      ↓
Agent executes
      ↓
COO → Confirms completion
      ↓
Executive Brief → CEO (if significant)
```

---

## Step 3 — Automatic Reviews

Whenever a feature or fix completes, these reviews run automatically:

| Review | Owner | Checks | Blocking? |
|--------|-------|--------|-----------|
| Product Review | Product Manager | Acceptance Criteria met? | YES |
| UX Review | UX Director | Pixel-accurate? RTL? States? | YES |
| Design Review | Design Council | Significant UI → council vote | YES (if triggered) |
| Accessibility Review | UX Director | WCAG, contrast, touch targets | YES |
| QA Review | QA Engineer | Regression, edge cases, mobile | YES |
| Security Review | Security Engineer | Auth, injection, secrets | YES |
| Performance Review | CTO | Mobile score, API < 500ms | YES |
| Mobile Review | QA Engineer | 375px, 768px, RTL layout | YES |
| Business Review | CTO | Zero Downtime, backward compat | YES |
| TypeScript Check | QA Engineer | npx tsc --noEmit = 0 errors | YES |

**If any review returns FAIL:**
```
→ STOP Workflow
→ Return task to owning agent with specific failure reason
→ Agent fixes → Reviews re-run on that item
→ All-GREEN → Workflow continues
→ CoS logs the failure in task notes
```

---

## Step 4 — Blocker Handling

Chief of Staff monitors for blockers every 2h during active tasks:

```
BLOCKER DETECTED
      ↓
Can CoS resolve? → YES → Resolve immediately
                → NO  ↓
Can COO resolve (4h)? → YES → COO resolves
                      → NO  ↓
Escalate to CEO with:
  - What is blocked
  - Why it's blocked
  - Options to unblock
  - Recommendation
```

---

## Step 5 — Executive Brief (End of Every Task)

**Mandatory. Always. No exceptions.**

```markdown
# Executive Brief — [TASK NAME]
**Prepared by:** Chief of Staff
**Date:** [DATE]
**Task Type:** [FEATURE/BUG_FIX/DESIGN/CONTENT/RESEARCH/STRATEGIC]

## Summary (30 words max)
[What happened, in plain language]

## Agents Involved
[List: who did what]

## Reviews Completed
| Review | Result | Notes |
|--------|--------|-------|
| Product | ✅ PASS | |
| UX | ✅ PASS | |
| QA | ✅ PASS | |
| Security | ✅ PASS | |
| Mobile | ✅ PASS | |
| TypeScript | ✅ PASS | 0 errors |

## What Changed
[Technical summary: files, APIs, DB]

## Business Impact
[How this affects couples / operations / revenue]

## Risk Level
[LOW / MEDIUM / HIGH — with reason]

## Current System Status
[Healthy / Watch / Critical]

## Memory Updated
- [memory/known-issues.md] ← if applicable
- [memory/product-decisions.md] ← if applicable

## Retrospective (1 line)
[What we learned / what we'd do differently]

## Requires Your Approval
- [ ] Production Deploy — [YES/NO]
- [ ] DB Migration — [YES/NO]
- [ ] Other: ___
```

---

## Step 6 — Retrospective & Memory Update

After every task:

```
COO → Retrospective questions:
  1. Did the workflow run smoothly?
  2. Were there unnecessary blockers?
  3. Did any agent miss something?
  4. Was any review too strict or too lenient?
  5. Any new pattern or lesson learned?
      ↓
Chief of Staff → Update memory if needed:
  - New lesson → memory/post-mortems.md
  - New coding pattern → memory/coding-standards.md
  - New product decision → memory/product-decisions.md
  - New known issue → memory/known-issues.md
  - New customer insight → memory/customer-insights.md
      ↓
Memory updated = future tasks benefit from this knowledge
```

---

## CEO Approval Gates (Autopilot pauses here)

```
Autopilot PAUSES and waits for CEO only when:

✅ Production Deploy
✅ DB Migration (any production schema change)
✅ Data Deletion
✅ Permission/access changes
✅ Real customer communications (new WhatsApp templates)
✅ Pricing changes
✅ Strategic direction changes (roadmap shifts)
✅ Any AI Law override request

EVERYTHING ELSE = Autopilot handles autonomously
```

---

## Continuous Monitoring (COO + CoS)

**Every 2 hours during active work:**
- Any agent blocked for > 2h?
- Any review failing repeatedly?
- Any AI Law about to be violated?
- Any unexpected customer impact?
- TypeScript errors introduced?
- Performance regression detected?

**If yes → Autopilot activates the relevant response automatically**

---

## Communication Protocol

```
CEO ↔ Chief of Staff only (default)
Chief of Staff ↔ COO (daily sync)
COO ↔ All Agents (task management)
Agents ↔ Agents (direct, when same department)
Cross-department ↔ via COO or CoS

EXCEPTION: CEO may directly engage any agent
           but CoS is always copied.
```

---

## Autopilot Limitations (Honest Assessment)

Autopilot coordinates and enforces process.
**It does not replace human judgment** for:
- Whether to build something at all
- Pricing strategy
- Relationships with customers
- Brand decisions
- Company culture
- Hiring (future)
- Legal decisions

These remain CEO-only, always.

---

*Effective: Immediately | Version: 2.1 | 2026-06-26*
