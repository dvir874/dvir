# Knowledge Graph — Conceptual Architecture
## רגע לפני AI Company OS — v2.0

---

## What Is the Knowledge Graph?

מפת ידע שמראה את הקשרים בין כל מרכיב במערכת.
כל feature יודע מה הוא משפיע עליו.
כל department יודע מי תלוי בו.
כל agent יודע מי צריך לדעת על השינויים שלו.

---

## Primary Entities

```
ENTITIES:
  Features ← implemented in → Code Files
  Features ← affect → User Journeys
  Features ← require → DB Tables
  Features ← use → API Routes
  
  Agents ← own → Responsibilities
  Agents ← read → Memory Files
  Agents ← produce → Reports
  Agents ← depend on → Other Agents
  
  Workflows ← connect → Agents
  Workflows ← enforce → AI Laws
  Workflows ← produce → Decisions
  
  Memory ← informs → Agents
  Memory ← updated by → Events
  Memory ← scoped by → Hierarchy
```

---

## Memory Hierarchy

```
Level 0 — Immutable (never changes without CEO)
├── governance/company-constitution.md
└── governance/ai-laws.md

Level 1 — Company Memory (changes rarely)
├── memory/business-rules.md
├── memory/brand-guidelines.md
└── memory/coding-standards.md

Level 2 — Department Memory (changes monthly)
├── memory/product-decisions.md
├── memory/customer-insights.md
├── memory/roadmap.md
└── research/* (weekly/monthly)

Level 3 — Operational Memory (changes weekly)
├── memory/known-issues.md
├── memory/post-mortems.md
└── dashboard/README.md (live status)

Level 4 — Task Memory (changes per task)
└── [Sprint task notes, temporary context]
```

---

## Agent Dependency Map

```
CEO
 └─ reads from → ALL

Chief of Staff
 └─ reads from → ALL
 └─ coordinates → COO, All Directors

COO
 └─ reads from → Level 0, 1, 3
 └─ coordinates → All Execution Agents

CTO
 └─ reads from → Level 0, 1, 2 (technical)
 └─ manages → Frontend, Backend, Security, QA, Release

Product Manager
 └─ reads from → Level 0, 1, 2 (product)
 └─ manages → UX Director

UX Director
 └─ reads from → Level 0, 1 (design)
 └─ outputs → Design specs → Frontend Engineer

Frontend Engineer
 └─ reads from → Level 1 (coding + design)
 └─ outputs → UI code

Backend Engineer
 └─ reads from → Level 1 (coding + business rules)
 └─ outputs → API routes + migrations

Security Engineer
 └─ reads from → Level 0, 1
 └─ outputs → Security reports → CTO

QA Engineer
 └─ reads from → Level 1, 3 (issues)
 └─ outputs → QA reports → CTO

Release Manager
 └─ reads from → Level 0, 1, 3
 └─ outputs → Deploy status

Customer Success
 └─ reads from → Level 1, 2 (customer)
 └─ outputs → Customer insights → Level 2 memory

Analytics
 └─ reads from → Level 1, 2, 3
 └─ outputs → Reports → CoS + CEO

Finance
 └─ reads from → Level 1, 2 (financial)
 └─ outputs → Financial reports → CEO

Research Division
 └─ reads from → Level 2 (external + internal)
 └─ outputs → Research reports → Level 2 memory
```

---

## Feature Impact Map

When a feature changes, these agents must be notified:

```
RSVP Flow Change:
  → Frontend Engineer (implements)
  → Backend Engineer (API changes)
  → QA Engineer (regression test)
  → Customer Success (briefs couples)
  → Marketing (if affects onboarding messaging)
  → Release Manager (deploy)
  → Chief of Staff (coordinates)

DB Schema Change:
  → Backend Engineer (owns)
  → CTO (approves)
  → QA Engineer (tests migration)
  → Security Engineer (RLS review)
  → CEO (approves production run)
  → Release Manager (deploy coordination)

Design System Change:
  → UX Director (owns)
  → Design Council (reviews)
  → Frontend Engineer (implements everywhere)
  → QA Engineer (regression all screens)
  → Chief of Staff (CEO notification)

Pricing Change:
  → Finance (owns)
  → CEO (decides)
  → Marketing (messaging)
  → Customer Success (communicates to existing customers)
  → Backend Engineer (if code changes needed)
```

---

## Route → Feature → Tables Map

```
/rsvp/[token]
  └─ tables: events, guests, seating_assignments
  └─ APIs: /api/rsvp/[token]
  └─ owner: Backend Engineer
  └─ critical: YES (sent to guests, cannot break)

/couple/[token]
  └─ tables: events, guests, wedding_vendors, budget_items, wedding_tasks
  └─ APIs: /api/couple/[token]/briefing, /api/couple/[token]/onboarding
  └─ owner: Frontend Engineer + Backend Engineer
  └─ critical: YES (couple's main dashboard)

/gallery/[token]
  └─ tables: gallery_albums, gallery_photos
  └─ APIs: /api/gallery/[token]
  └─ owner: Backend Engineer
  └─ critical: YES (sent to guests)

/memory/[token]
  └─ tables: gallery_photos, events
  └─ APIs: /api/memory/[token]
  └─ owner: Backend Engineer
  └─ critical: YES (guest upload)

/admin
  └─ tables: ALL
  └─ APIs: /api/admin/*, /api/design-requests
  └─ owner: CTO
  └─ critical: YES (operations)
```

---

## Decision → Impact Graph

```
Decision: "Add a new DB column"
  Impact chain:
  Backend Engineer
    → CTO (approval)
    → Security Engineer (RLS check)
    → QA Engineer (migration test)
    → Release Manager (deploy)
    → CEO (production approval)
  Memory updated: known-issues.md (pending), then closed

Decision: "Change brand color"
  Impact chain:
  UX Director
    → Design Council (full review)
    → Frontend Engineer (update everywhere)
    → QA Engineer (visual regression)
    → Marketing (update all materials)
    → CEO (approval)
  Memory updated: brand-guidelines.md

Decision: "New pricing tier"
  Impact chain:
  Finance + CEO (decides)
    → Marketing (messaging)
    → Customer Success (customer communication)
    → Backend Engineer (if code needed)
    → Frontend Engineer (if UI needed)
  Memory updated: business-rules.md, product-decisions.md
```

---

## Scalability Note

This Knowledge Graph is conceptual (written).
Future v3.0 could implement it as a live system:
- JSON graph stored in `ai-os/knowledge/graph.json`
- Queried by agents to discover impact before making changes
- Automatically updated when memory files change
- Visualized as interactive dependency map
