# רגע לפני — AI Company Operating System
## Version 2.1 | Built: 2026-06-26

---

> "אני לא בונה אוסף של Agents. אני בונה חברה."
> — CEO, Dvir

---

## What Is This?

מערכת הפעלה שלמה של חברה המנוהלת על ידי AI Agents.
אתה ה-CEO. כל שאר התפקידים — Agents עם אחריות, KPIs, ו-checklists.

**v1.0:** 12 Agents + Memory + Workflows + Reports
**v2.0:** + Executive Layer + Governance + Crisis + Research + Design Council + Knowledge Graph
**v2.1:** + Autonomous Operating Mode (Autopilot) — system runs itself

---

## Org Chart

```
CEO (Human — Dvir)
│
├── Chief of Staff (AI) ← נקודת קשר יחידה ל-CEO
│   └── COO (AI) ← מנהל execution יומיומי
│
├── CTO
│   ├── Frontend Engineer
│   ├── Backend Engineer
│   ├── Security Engineer
│   ├── QA Engineer
│   └── Release Manager
│
├── Product Manager
│   └── UX Director
│
├── Marketing Director
│
├── Customer Success
│
├── Analytics
│
├── Finance
│
├── Operations
│
└── Research Division
    ├── R1 — Competitive Intelligence
    ├── R2 — Trend Research
    ├── R3 — AI & Technology Research
    └── R4 — Innovation Lab
```

---

## Directory Structure

```
ai-os/
├── README.md                         ← אתה כאן (v2.0)
├── COMPANY_CHARTER.md                ← Org chart, permissions, KPIs
│
├── executive/                        ← NEW v2.0
│   ├── chief-of-staff.md             ← CoS Agent (CEO's single point of contact)
│   ├── coo.md                        ← COO Agent (day-to-day operations)
│   └── executive-dashboard.md        ← CEO-only dashboard
│
├── governance/                       ← NEW v2.0
│   ├── company-constitution.md       ← Mission, Vision, Values, Philosophies
│   ├── ai-laws.md                    ← 13 immutable laws
│   ├── escalation-tree.md            ← Who resolves what, in what order
│   └── design-council.md             ← Design review process
│
├── crisis/                           ← NEW v2.0
│   └── crisis-management.md          ← Playbooks for 5 crisis types
│
├── research/                         ← NEW v2.0
│   └── research-division.md          ← 4 research agents
│
├── knowledge/                        ← NEW v2.0
│   └── knowledge-graph.md            ← Conceptual dependency map
│
├── agents/                           ← v1.0 (unchanged)
│   ├── cto.md
│   ├── product-manager.md
│   ├── ux-director.md
│   ├── frontend-engineer.md
│   ├── backend-engineer.md
│   ├── security-engineer.md
│   ├── qa-engineer.md
│   ├── release-manager.md
│   ├── marketing-director.md
│   ├── customer-success.md
│   ├── analytics.md
│   └── finance.md
│
├── workflows/                        ← v1.0 (unchanged)
│   ├── feature-workflow.md
│   └── incident-workflow.md
│
├── reports/                          ← v1.0 (unchanged)
│   ├── executive-report-template.md
│   └── meeting-templates.md
│
├── memory/                           ← v1.0 (unchanged)
│   ├── business-rules.md
│   ├── brand-guidelines.md
│   ├── coding-standards.md
│   ├── product-decisions.md
│   ├── customer-insights.md
│   ├── known-issues.md
│   ├── post-mortems.md
│   └── roadmap.md
│
└── dashboard/                        ← v1.0 (operational)
    └── README.md
```

---

## How CEO Uses the System

### Daily (< 5 minutes)
1. Read `executive/executive-dashboard.md`
2. Action any "Decisions Pending Your Approval"
3. Note any 🔴 risks

### Per Task — Autopilot Mode (DEFAULT)
```
CEO: "Build the WhatsApp Center feature"
      ↓
Chief of Staff analyzes → classifies as FEATURE
      ↓
Autopilot activates: PM → UX → Design Council → CTO → Frontend → Backend
      ↓
Auto Reviews: QA + Security + Mobile + Accessibility + Performance + TypeScript
      ↓
[All pass] → Release Manager prepares deploy
      ↓
[Autopilot PAUSES] → Executive Brief sent to CEO
      ↓
CEO approves deploy → Done
```

**CEO does not manage steps. CEO only approves the final gate.**

### Per Decision
Board Review provides a one-page `Executive Decision Brief`. You decide.

### Per Crisis
Chief of Staff and CTO alert immediately. Playbook runs automatically. You approve response.

---

## How to Activate Any Agent

### Activating Chief of Staff (most common)
```
"You are the Chief of Staff for רגע לפני.
Read:
- ai-os/executive/chief-of-staff.md
- ai-os/governance/company-constitution.md
- ai-os/governance/ai-laws.md
- ai-os/memory/business-rules.md

Today's task: [WHAT CEO WANTS]
Prepare a Daily Executive Brief when done."
```

### Activating a Specific Agent
```
"You are the [AGENT] for רגע לפני.
Read: ai-os/agents/[agent].md + relevant memory files.
Task: [SPECIFIC TASK]
Output: Executive Report when done."
```

---

## The 13 AI Laws (Summary)

1. No deploy without CEO approval
2. No migration without rollback plan
3. No data deletion without CEO
4. No significant UI change without Stitch
5. All features need QA sign-off
6. Every production change = Executive Report
7. Every action must be explainable
8. When in doubt, stop
9. No PII exposure in logs/URLs/errors
10. No secrets in code
11. WhatsApp never starts with personal name
12. No breaking existing routes
13. CEO is final authority

---

## Memory Hierarchy (Quick Reference)

```
Level 0 (Immutable): company-constitution.md, ai-laws.md
Level 1 (Stable):    business-rules.md, brand-guidelines.md, coding-standards.md
Level 2 (Monthly):   product-decisions.md, customer-insights.md, roadmap.md
Level 3 (Weekly):    known-issues.md, post-mortems.md, dashboard
Level 4 (Per-task):  Sprint notes, temporary context
```

---

## Scaling to Other Businesses

This OS is designed generically. To deploy for a new business:

1. Clone `ai-os/` directory to new project
2. Update `memory/business-rules.md` (new business rules)
3. Update `memory/brand-guidelines.md` (new brand)
4. Update `governance/company-constitution.md` (new mission/vision)
5. Update KPIs in each agent file
6. Keep all agent roles, workflows, escalation tree, AI laws

**Estimated setup time:** 2-4 hours per business

---

*CEO: Dvir | Built: 2026-06-26 | Version: 2.0*
*Architecture by: CEO + Strategic Advisor (Claude)*
