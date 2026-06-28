# AI Company OS — Operating Manual
## רגע לפני | Version 3.1 | 2026-06-26

---

> "ספר ההפעלה של החברה. כל מה שצריך לדעת כדי להפעיל את רגע לפני."

---

## Who Is This For?

- **CEO (Dvir)** — להבין איך המערכת עובדת ומה תפקידו
- **כל Session חדש** — System Prompt + Manual = הקשר מלא
- **אדם חדש שנכנס לפרויקט** — הבנת כל ההחלטות, הנהלים, והתרבות
- **המערכת עצמה** — כל Agent שנפעל חייב לקרוא את זה

---

## Table of Contents

1. [Daily Operations](#1-daily-operations)
2. [Feature Lifecycle](#2-feature-lifecycle)
3. [Incident Lifecycle](#3-incident-lifecycle)
4. [Decision Lifecycle](#4-decision-lifecycle)
5. [Communication Rules](#5-communication-rules)
6. [Continuous Improvement](#6-continuous-improvement)
7. [Success Metrics](#7-success-metrics)
8. [CEO Experience](#8-ceo-experience)
9. [Evolution Rules](#9-evolution-rules)
10. [Final Principles](#10-final-principles)

---

---

# 1. Daily Operations

## How a Day Starts

```
06:00 — Chief of Staff wakes up
        Reads all overnight reports and status updates
        Checks: any incidents? any blockers? any urgent items?

07:00 — CoS processes:
        COO's overnight Ops Report
        Any agent activity that happened
        Intelligence systems (Brain alerts, predictions, ARE)
        Business Health scores

08:30 — Daily Executive Brief → CEO
        (max 1 page, max 5 min read)

09:00 — CEO reads brief + approves/acts on approval queue

09:30 — COO syncs with active agents:
        Sprint board updated
        Blockers addressed
        Resources re-allocated if needed

Throughout day:
  - Agents work on assigned tasks
  - CoS monitors for blockers (every 2h)
  - Any escalation → CoS handles, CEO only if law requires

18:00 — CoS end-of-day scan:
        All active tasks have updated status?
        Any items that will block tomorrow?
        Any reports overdue?

18:30 — COO end-of-day Ops Report → CoS
```

## Daily Reports Generated (Automatically)

| Report | Time | By | To |
|--------|------|----|----|
| Daily Executive Brief | 08:30 | Chief of Staff | CEO |
| Ops Status | 09:00 | COO | CoS |
| Sprint Board Update | Live | COO | CoS |
| Blocker Alerts | As detected | CoS | CEO (if urgent) |
| Post-Deploy Report | Within 2h of deploy | Release Manager | CoS → CEO |

## When Does CoS Interrupt CEO During the Day?

CoS contacts CEO **only** for:
1. A deploy is ready and needs approval
2. A P0/P1 incident is happening
3. An irreversible decision is pending
4. An AI Law is about to be violated
5. A Board Review decision is ready

**Everything else** — CoS handles or queues for tomorrow's brief.

---

---

# 2. Feature Lifecycle

## From Idea to Production

Every feature travels this path. No skipping.

### Stage 1 — IDEA

```
SOURCE: CEO / Customer Success / Analytics / Research Division / Company Brain

WHO CAPTURES IT: Product Manager
ACTION: Log in memory/product-decisions.md as "PROPOSED"
OUTPUT: Brief problem statement + who requested + business case (2 sentences)
```

### Stage 2 — RESEARCH

```
WHO: Product Manager + Analytics + Research Division
ACTIONS:
  - Is this solving a real customer problem? (customer-insights.md)
  - Has this been attempted before? (product-decisions.md)
  - What do competitors do? (R1 Competitive Intel)
  - What's the expected adoption? (Analytics)
  - Decision Intelligence: check historical similar decisions

OUTPUT: Research Brief (1 page)
GATE: PM decides PROCEED / DEFER / REJECT
```

### Stage 3 — PRODUCT SPEC

```
WHO: Product Manager
ACTIONS:
  - Write PRD using Feature Spec Template (agents/product-manager.md)
  - Define: problem, user story, acceptance criteria, success metrics
  - Define: out of scope, dependencies, risks

OUTPUT: Complete PRD
GATE: PM marks spec as "READY FOR UX"
CEO REQUIRED: Only if spec changes roadmap priority
```

### Stage 4 — UX DESIGN (Stitch)

```
WHO: UX Director
ACTIONS:
  - Read PRD + brand-guidelines.md + design-system memory
  - Design in Stitch: all screens, all states (empty/loading/error/success)
  - Mobile-first (375px), RTL, all touch targets ≥ 44px

OUTPUT: Stitch design export + Design Brief
GATE: Design Council reviews (if significant UI) → APPROVED / REVISION
CEO REQUIRED: Only if Design System changes
```

### Stage 5 — TECHNICAL REVIEW

```
WHO: CTO
ACTIONS:
  - Read PRD + Stitch design
  - Check: Zero Downtime? Backward compatible? Migration needed?
  - Pre-Code Checklist (all 5 items from CLAUDE.md)
  - Estimate: effort, complexity, risk

OUTPUT: Technical Brief (architecture decisions + risk level)
GATE: CTO marks "READY FOR ENGINEERING"
CEO REQUIRED: Only if HIGH risk architecture change
```

### Stage 6 — ENGINEERING

```
WHO: Frontend Engineer + Backend Engineer (as needed)
ACTIONS:
  Frontend: Implement pixel-accurate, Mobile First, RTL, TypeScript strict
  Backend: API routes, DB migrations (if needed), auth guards
  
RULES:
  - npx tsc --noEmit must pass at all times
  - No console.logs in production code
  - Graceful fallbacks for all optional data
  - No secrets in code

OUTPUT: Code complete, PR created
GATE: Engineering marks "READY FOR QA"
```

### Stage 7 — QA REVIEW

```
WHO: QA Engineer
ACTIONS:
  Full QA checklist (agents/qa-engineer.md):
  [ ] All Acceptance Criteria pass
  [ ] Regression checklist complete (all existing flows)
  [ ] Mobile: 375px, 768px, 1280px
  [ ] RTL layout correct
  [ ] TypeScript: 0 errors
  [ ] Edge cases: empty / loading / error / success states
  [ ] No console errors

OUTPUT: QA Report → APPROVED or BLOCKED (with specific issues)
GATE: QA sign-off required. No deploy without it.
If BLOCKED: back to Engineering → fix → re-QA
```

### Stage 8 — SECURITY REVIEW

```
WHO: Security Engineer
ACTIONS:
  [ ] Auth guards on all new endpoints
  [ ] No secrets in code
  [ ] Input validation on all user inputs
  [ ] No XSS / SQL injection vectors
  [ ] No PII in logs or URLs
  [ ] Error messages don't expose internals

OUTPUT: Security Review → APPROVED or BLOCKED
GATE: Security approval required before deploy
```

### Stage 9 — RELEASE

```
WHO: Release Manager
ACTIONS:
  Pre-deploy checklist:
  [ ] All gates passed (QA ✅ Security ✅ CTO ✅)
  [ ] Not peak hours (no Fri 18-23, no Shabbat)
  [ ] No active incidents
  [ ] Rollback plan confirmed
  [ ] CEO approval received

  Deploy:
  [ ] git push main
  [ ] Vercel build succeeded
  [ ] Production URL tested
  [ ] No Sentry spike within 30 min

OUTPUT: Deploy confirmation + Post-Deploy Report
CEO REQUIRED: YES — always for production deploy
```

### Stage 10 — RETROSPECTIVE

```
WHO: CIE (Company Intelligence Engine) + COO
ACTIONS:
  - What worked well in this feature's lifecycle?
  - What took longer than expected? Why?
  - Any new patterns detected?
  - What should change for next feature?

OUTPUT: Retrospective notes → Pattern Cards (if patterns found)
```

### Stage 11 — KNOWLEDGE UPDATE

```
WHO: Chief of Staff + CIE
ACTIONS:
  - Update memory files if anything changed:
    * New coding pattern → coding-standards.md
    * New product decision → product-decisions.md
    * New customer insight → customer-insights.md
    * New known issue → known-issues.md
  - Close any Brain entries that this feature resolved
  - Update roadmap (feature → SHIPPED)

OUTPUT: Memory current. Company smarter for next feature.
```

## Feature Lifecycle Summary

```
IDEA → RESEARCH (2 days) → SPEC (3 days) → UX/STITCH (2-5 days) →
TECH REVIEW (1 day) → ENGINEERING (varies) → QA (0.5-1 day) →
SECURITY (0.5 day) → RELEASE → RETRO → KNOWLEDGE UPDATE
```

**CEO touch points:** Sprint priority, Design approval (if significant), Deploy approval.
**Everything else:** Autonomous.

---

---

# 3. Incident Lifecycle

## Severity First

| Severity | Definition | CEO Notified |
|----------|-----------|-------------|
| P0 | Production down / Data loss | Immediately |
| P1 | Core feature broken for all | Within 1h |
| P2 | Feature broken for some | Daily brief |
| P3 | Minor bug / visual | Next sprint |

## P0 Lifecycle (Production Down)

```
DETECTION (anyone)
  ↓
IMMEDIATE (< 5 min):
  CTO + CoS notified simultaneously
  CoS alerts CEO: "🔴 P0 — [one line] — investigating"
  COO puts all non-critical work on hold
  ↓
ASSESSMENT (< 15 min):
  CTO identifies: scope + likely cause + rollback vs hotfix
  ↓
DECISION:
  Rollback (< 2 min) → if last deploy caused it
  Hotfix → if rollback not possible
  ↓
EXECUTION:
  Rollback: Release Manager via Vercel (< 2 min)
  Hotfix: CTO writes → QA smoke test → Release Manager deploys
  ↓
CONFIRMATION (< 1h total target):
  CoS to CEO: "✅ Resolved — [duration] — root cause: [X]"
  ↓
POST-MORTEM (within 24h):
  CIE leads retrospective
  Post-mortem written → memory/post-mortems.md
  Prevention measure identified + implemented
  AI Laws updated if applicable
```

## P2/P3 Lifecycle

```
Detection → QA logs bug (severity P2/P3)
         → COO adds to sprint board
         → Backend/Frontend fixes in current or next sprint
         → QA re-tests
         → Deploy in next release cycle
```

## Communication During Incidents

```
CEO: receives structured updates only (via CoS)
     does not participate in technical resolution
     approves: rollback if DB migration was involved
              any data recovery action

Internal: CTO + QA + Release Manager in direct coordination
          CoS bridges to CEO
          COO manages agent availability
```

---

---

# 4. Decision Lifecycle

## When Is a Formal Decision Process Needed?

Not every choice is a "Decision". Use formal process for:
- Architectural changes (build vs buy, new dependency)
- Roadmap priority changes (adding/removing features)
- Pricing or business model changes
- UX paradigm changes (navigation, new interaction pattern)
- New integrations or third-party services
- Any irreversible change

## Decision Lifecycle

### Step 1 — Identify & Frame

```
WHO IDENTIFIES: CEO / CoS / any agent (via CoS)
ACTION: CoS writes: "The question is: [X]"
        Checks: has this been decided before? (Decision Intelligence)
```

### Step 2 — Intelligence Brief

```
WHO: Decision Intelligence + CoS
TIME: 24h
OUTPUT:
  - Historical precedent (was this decided before? outcome?)
  - Options generated (minimum 3 + Do Nothing)
  - Risk/ROI assessment per option
  - Business Twin simulation (if strategic)
  - Initial recommendation
```

### Step 3 — Board Review (for significant decisions)

```
WHO: All relevant departments (async)
TIME: 24h window
EACH DEPT SUBMITS:
  - Recommendation (which option)
  - Key reasoning (2-3 points)
  - Concerns (what they'd watch out for)
```

### Step 4 — Executive Decision Brief

```
WHO: Chief of Staff
COMPILES: All opinions + DI analysis + simulation
FORMAT: 1-2 pages (see template in intelligence/decision-intelligence.md)
INCLUDES: Clear recommendation + confidence level + what to watch for
SENDS TO: CEO
```

### Step 5 — CEO Decision

```
CEO reads brief (< 10 min)
CEO decides: Option A / B / C / Defer / Need more info
CEO communicates decision to CoS (brief text or voice)
```

### Step 6 — Communicate & Log

```
CoS communicates decision to all affected agents
Decision logged in: memory/product-decisions.md
If architecture: also in ADR format
CoS updates roadmap if needed
```

## Decision Response Times

| Urgency | Brief Ready | CEO Decision |
|---------|-------------|-------------|
| URGENT (blocks work) | 4h | Same day |
| NORMAL | 24h | Within 48h |
| STRATEGIC | 48-72h | Weekly review |
| DEFERRED | — | Next quarter |

---

---

# 5. Communication Rules

## The Single Channel Rule

```
CEO ↔ Chief of Staff ONLY (default)

Chief of Staff may route CEO to another agent directly ONLY if:
  - CEO explicitly wants direct technical discussion
  - Crisis requires real-time CEO + CTO coordination
  - CoS determines CoS cannot add value as intermediary

In all such cases: CoS is always copied.
```

## When CoS Contacts CEO

### Proactive (CoS initiates):
- Daily Executive Brief (every morning)
- Approval needed (deploy / migration / pricing / etc.)
- P0/P1 incident
- AI Law about to be violated
- Board Review decision ready
- Significant business risk detected

### Reactive (CEO asks):
- CEO initiates conversation → CoS responds with relevant context

### NEVER (CoS does NOT initiate for):
- Routine task progress
- Internal agent coordination
- Minor bug fixes
- QA/Security pass results (unless blocking deploy)
- Research in progress

## Report Format Rules

Every communication to CEO follows:

```
1. WHAT: One sentence — what happened / what's needed
2. WHY: One sentence — why it matters
3. STATUS: [GREEN/YELLOW/RED] + one line
4. ACTION NEEDED: [YES: what] or [NO: awareness only]
5. DETAIL: (optional) — more info if CEO wants it
```

**Maximum length of CEO-bound message:** 1 page.
**If it takes more than 1 page** — CoS hasn't synthesized it enough.

## Internal Communication (Between Agents)

```
Agents communicate directly within their department.
Cross-department: via COO (operational) or CoS (strategic).
Escalation path: Agent → Manager → COO → CoS → CEO.

Format between agents (internal):
  - Direct, technical, efficient
  - No need for executive format
  - Document outcomes in relevant memory files
```

---

---

# 6. Continuous Improvement

## How the Company Gets Smarter

Improvement happens at 4 levels:

### Level 1 — Per Task (After Every Feature/Incident)

```
WHO: CIE + QA + CoS
WHEN: Within 24h of completion
ACTIONS:
  - Write Pattern Card if pattern detected
  - Update memory files if new learning
  - Add/update checklist item if process gap found
  - Close brain entries if issue resolved
```

### Level 2 — Per Sprint (Every 2 Weeks)

```
WHO: COO + CoS + CIE
WHEN: Sprint review day
ACTIONS:
  - Sprint retrospective (what worked / what didn't)
  - Velocity analysis vs last sprint
  - Update sprint templates if process improved
  - CIE Sprint Intelligence Report
  - Agent performance contributions logged
```

### Level 3 — Monthly (1st of Each Month)

```
WHO: Chief of Staff + CIE + Autonomous Recommendations Engine
WHEN: 1st of each month
ACTIONS:
  - Monthly Intelligence Digest (top patterns, learnings, BPs)
  - Agent Performance Review (all 12 agents scored)
  - Business Health Trend (12 domains, 30-day trend)
  - Research Division monthly digest
  - Memory Audit (any stale files?)
  - Autonomous Recommendations review (acted on? effective?)
```

### Level 4 — Quarterly (Every 3 Months)

```
WHO: CEO + Chief of Staff
WHEN: End of quarter
ACTIONS:
  - AI Laws Review (any laws to add/update?)
  - Governance Retrospective (is the system working?)
  - Agent Calibration (any agents to restructure?)
  - OKR Review (are we hitting company goals?)
  - Company Constitution review (is mission/vision still current?)
  - Strategic roadmap adjustment
```

## The Learning Loop

```
Event happens
    ↓
CIE analyzes
    ↓
Pattern detected? → Pattern Card created
    ↓
Action identified?
    ├── Update memory file
    ├── Update checklist
    ├── Update workflow
    └── Update agent definition
    ↓
Applied in next task → improved outcome → new pattern (positive)
    ↓
Company gets smarter
```

## Best Practices Evolution

```
HOW A BEST PRACTICE IS BORN:
  1. CIE detects pattern 3+ times
  2. CoS validates: is this generalizable?
  3. CoS writes BP to intelligence/best-practices.md
  4. CoS adds to relevant agent checklist
  5. COO communicates to relevant agents
  6. Applied in next sprint

HOW A BEST PRACTICE DIES:
  1. BP no longer applicable (technology changed, context shifted)
  2. COE scan shows it's being consistently violated
     (may indicate it's wrong, not agents)
  3. CoS reviews → CoS retires from memory + communicates
```

---

---

# 7. Success Metrics

## What "Success" Means for רגע לפני

Success is not shipping features.
**Success is couples having a better wedding experience.**

### Product Success

| Metric | Target | Measured By |
|--------|--------|-------------|
| Onboarding Completion | ≥ 70% | Analytics |
| RSVP Completion Rate | ≥ 85% | Analytics |
| Feature Adoption (30d) | ≥ 60% | Analytics |
| Time to First RSVP | ≤ 7 days | Analytics |
| Mobile Session Time | ↑ trend | Analytics |

### Quality Success

| Metric | Target | Measured By |
|--------|--------|-------------|
| TypeScript Errors in Prod | 0 | QA / CTO |
| P0 Incidents/Month | 0 | CTO |
| QA First-Pass Rate | ≥ 80% | QA |
| Security Vulnerabilities | 0 critical | Security |
| Uptime | ≥ 99.5% | DevOps |

### Customer Success

| Metric | Target | Measured By |
|--------|--------|-------------|
| NPS Score | ≥ 8 | CS |
| Churn Rate | < 5%/month | Finance |
| Response Time | < 24h | CS |
| Repeat Complaints | Declining | Brain |
| Unsolicited Positive Feedback | Increasing | CS |

### Business Success

| Metric | Target | Measured By |
|--------|--------|-------------|
| MRR Growth | +10% MoM | Finance |
| LTV/CAC | ≥ 3x | Finance |
| New Events/Month | ↑ trend | Analytics |
| Referral Rate | ≥ 20% of new | Marketing |

### Engineering Velocity

| Metric | Target | Measured By |
|--------|--------|-------------|
| Sprint Delivery Rate | ≥ 80% | COO |
| Deploy Frequency | ≥ 2/week | Release Manager |
| Mean Time to Recovery | < 1h (P0) | CTO |
| Code Review Turnaround | < 4h | CTO |

### AI Company OS Success

| Metric | Target | Measured By |
|--------|--------|-------------|
| CEO time on operational tasks | < 20% | CoS |
| Decisions with full brief | 100% | CoS |
| AI Law violations | 0 | Governance |
| Memory currency | ≤ 30 days old | Governance |
| Agent performance avg | ≥ 80/100 | AI Perf Review |

---

---

# 8. CEO Experience

## The CEO's Job Description

```
✅ CEO DOES:
  - Sets company strategy and vision
  - Makes irreversible decisions (deploy, migration, pricing, direction)
  - Reads Daily Executive Brief (5 min/day)
  - Approves Board Review decisions
  - Gives new tasks / goals / directions
  - Monitors Business Health Heatmap (weekly)
  - Reviews quarterly OKRs

❌ CEO DOES NOT:
  - Manage individual agent tasks
  - Chase status updates
  - Review code
  - Handle customer support
  - Choose which agent does what
  - Decide workflow order
  - Write feature specs
  - Handle internal conflicts between agents
```

## CEO's 4 Interfaces

### Interface 1 — Daily Brief
**Time:** 5 minutes, every morning at 08:30
**Contains:** Pulse + Approvals + Risks + Recommendations
**Action:** Approve/reject queued items. Note anything unusual.

### Interface 2 — Task Input
**When:** Anytime CEO has a new direction, idea, or task
**Format:** Natural language is fine. CoS interprets and routes.
**Examples:**
- "בנה WhatsApp Center"
- "מה המצב עם Marketing?"
- "כדאי לנו להעלות מחיר?"
- "האם יש bugs שאנחנו לא יודעים עליהם?"

### Interface 3 — Approval Queue
**When:** As items arrive requiring CEO sign-off
**Format:** CoS presents brief + recommendation → CEO types decision
**Items:** Deploy, migration, pricing, new customer comms, strategy pivots

### Interface 4 — Strategic Review
**When:** Monthly or as needed
**Format:** Board Review Decision Brief → CEO decision
**Purpose:** Major directional decisions that shape next quarter

## What CEO Should Never Do

```
❌ Call individual agents directly for status
   (use: "CoS, what's the status of X?")

❌ Make technical implementation decisions
   (use: "CoS, recommend which approach")

❌ Review QA reports line by line
   (use: wait for QA gate result in Executive Brief)

❌ Micromanage sprint tasks
   (use: set goals, let COO manage execution)

❌ Resolve conflicts between agents
   (use: CoS/COO escalation path handles it)
```

---

---

# 9. Evolution Rules

## The Minimalism Principle

**The AI Company OS must remain understandable.**

Every new addition must earn its place.

### Adding a New Agent

**Required before adding:**
1. Prove the need: what work is not being done? (with examples)
2. Prove it can't be handled by an existing agent
3. Prove adding it doesn't create confusion or duplication
4. Define: mission, KPIs, permissions, memory, inputs, outputs
5. CEO approval

**Who proposes:** CoS or Research Division
**Who approves:** CEO (always)

### Adding a New Workflow

**Required before adding:**
1. Existing workflow demonstrably insufficient
2. New workflow is clearly different (not overlap with existing)
3. Written in same format as existing workflows
4. Tested on 1 real task before formal adoption
5. CoS approval (no CEO required unless strategic)

### Adding a New Memory File

**Required before adding:**
1. Content doesn't fit in any existing file
2. Will actually be read (by which agent, when?)
3. Owner defined (who updates it? how often?)
4. Added to Memory Hierarchy in knowledge/knowledge-graph.md
5. CoS approval

### Adding a New AI Law

**Required before adding:**
1. A real violation occurred (or near miss)
2. Existing laws don't cover it
3. CEO proposes or approves
4. Written in same format as existing laws
5. All agents notified by CoS

### Removing / Deprecating

```
An Agent, Workflow, or Memory file can be deprecated if:
  - It hasn't been used in 3 months
  - Its purpose is now covered by another component
  - It creates confusion more than clarity

Process:
  1. CoS proposes deprecation with evidence
  2. 30-day notice period (in case it's needed)
  3. CEO approves removal
  4. Archived (not deleted) in ai-os/archive/
```

---

---

# 10. Final Principles

## The 5 Principles of AI Company OS

### Principle 1 — CEO Clarity

The CEO should never be confused about:
- What is the current status of the company?
- What decisions are waiting for me?
- What is the biggest risk right now?
- What is the most important opportunity?

**If CEO is ever confused — the system has failed, not the CEO.**

### Principle 2 — Operational Autonomy

The system handles:
- Routing tasks to the right agents
- Running all review gates
- Detecting and resolving blockers
- Learning from every task
- Proactively surfacing opportunities and risks

**CEO is interrupted only when a decision is irreversible or AI Law requires it.**

### Principle 3 — Knowledge Accumulation

Every week, the company knows more than the week before.
Pattern Cards, Memory files, Best Practices, Post-Mortems —
these are the institutional knowledge that makes the company more valuable over time.

**A company that doesn't learn repeats its mistakes.**

### Principle 4 — Trust Through Transparency

Every agent action is logged.
Every decision is documented.
Every deploy has an Executive Report.
Every incident has a post-mortem.

**CEO can always ask "why did this happen?" and get a complete answer.**

### Principle 5 — The System Serves the CEO

AI Company OS is not autonomous for its own sake.
It is autonomous **to free the CEO for what only a CEO can do**:
vision, relationships, strategy, and growth.

```
CEO's time should be invested in:
  40% Strategy & Vision
  30% Product Direction
  20% Key Decisions
  10% Learning & Adaptation

NOT in:
  Sprint management
  Bug triage
  QA reviews
  Agent coordination
  Report reading (beyond 5 min/day)
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│  AI COMPANY OS v3.1 — QUICK REFERENCE              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SINGLE COMMAND: Talk to Chief of Staff             │
│                                                     │
│  IRREVERSIBLE (needs CEO approval):                 │
│  Deploy · Migration · Delete · Pricing              │
│  Customer comms · Strategy pivots                   │
│                                                     │
│  EVERYTHING ELSE: Autonomous                        │
│                                                     │
│  DAILY READ: Executive Dashboard (5 min)            │
│                                                     │
│  13 AI LAWS: Never broken (ai-os/governance/)       │
│                                                     │
│  TECH: Next.js · Supabase · Vercel                  │
│  Colors: ivory cream gold olive dark                │
│  Fonts: Frank Ruhl Libre + Heebo                   │
│  Rule: TypeScript 0 errors · Mobile First · RTL     │
│                                                     │
│  SUCCESS: Couples have better weddings              │
└─────────────────────────────────────────────────────┘
```

---

## Document Maintenance

This Operating Manual is a living document.

| When to Update | Who Updates |
|---------------|-------------|
| New AI Law added | Chief of Staff |
| Workflow changed | CoS + affected agent |
| New agent added | CoS |
| Metric targets change | CoS + Finance/Analytics |
| Post-mortem reveals gap | CIE → CoS |
| Quarterly review | CEO + CoS |

**Version history in git. Last updated: 2026-06-26 (v3.1)**

---

*"המטרה של AI Company OS אינה להחליף את ה-CEO.*
*המטרה היא להחליף עבודה תפעולית, לרכז מידע, להציע המלצות,*
*ולאפשר ל-CEO להתמקד באסטרטגיה, במוצר ובצמיחת העסק."*

— Company OS Founding Principle

---

*CEO: Dvir | Version: 3.1 | Built: 2026-06-26*
