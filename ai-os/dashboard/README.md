# Company Dashboard
## רגע לפני AI-OS

---

## Dashboard Purpose

כל בוקר, ה-CEO פותח את ה-Dashboard ורואה את מצב החברה בלי לשאול אף אחד.
כל Agent מעדכן את ה-KPIs שלו.

---

## Company Health — Snapshot

```
📊 COMPANY HEALTH — [DATE]

┌─────────────────────────────────────────┐
│  🟢 PRODUCT      | Sprint 12, Day 3      │
│  🟢 TECHNICAL    | 0 TypeScript errors   │
│  🟡 SECURITY     | 1 medium open         │
│  🟢 CUSTOMER     | NPS 8.2, 0 open P1    │
│  🟢 DEPLOY       | Last deploy: 18h ago  │
│  🟡 ANALYTICS    | Weekly report pending │
└─────────────────────────────────────────┘
```

---

## KPI Scorecard

### Product KPIs (Product Manager)

| KPI | Current | Target | Status |
|-----|---------|--------|--------|
| Sprint Delivery Rate | 85% | ≥ 80% | 🟢 |
| Onboarding Completion | 67% | ≥ 70% | 🟡 |
| RSVP Completion Rate | 88% | ≥ 85% | 🟢 |
| Feature Adoption (30d) | 72% | ≥ 60% | 🟢 |

### Technical KPIs (CTO)

| KPI | Current | Target | Status |
|-----|---------|--------|--------|
| TypeScript Errors | 0 | 0 | 🟢 |
| Build Success Rate | 100% | ≥ 99% | 🟢 |
| Uptime | 99.8% | ≥ 99.5% | 🟢 |
| API Response (p95) | 380ms | < 500ms | 🟢 |

### Security KPIs (Security Engineer)

| KPI | Current | Target | Status |
|-----|---------|--------|--------|
| Critical Vulnerabilities | 0 | 0 | 🟢 |
| Exposed Endpoints | 0 | 0 | 🟢 |
| Secrets in Code | 0 | 0 | 🟢 |
| Open Medium Issues | 1 | < 3 | 🟡 |

### Customer KPIs (Customer Success)

| KPI | Current | Target | Status |
|-----|---------|--------|--------|
| Response Time | 6h | < 24h | 🟢 |
| NPS Score | 8.2 | ≥ 8 | 🟢 |
| Churn Rate | 3% | < 5% | 🟢 |
| Open Tickets | 2 | < 5 | 🟢 |

### Business KPIs (Finance + Analytics)

| KPI | Current | Target | Status |
|-----|---------|--------|--------|
| Active Events | -- | Growth | ⬜ |
| MRR | -- | +10% MoM | ⬜ |
| New Events/Month | -- | Growth | ⬜ |
| LTV/CAC | -- | ≥ 3x | ⬜ |

*⬜ = Data collection in progress*

---

## Sprint Board

### Sprint [N] — [START] to [END]

```
IN PROGRESS
├── [Feature 1] — Frontend Engineer (Day 2/5)
└── [Feature 2] — Backend Engineer (Day 1/3)

BLOCKED
└── [Feature 3] — waiting for Stitch design

TODO (This Sprint)
├── [Feature 4]
└── [Feature 5]

DONE
├── [Feature X] ✅
└── [Feature Y] ✅
```

---

## Open Decisions (CEO Action Required)

```
1. [DECISION] Admin Dashboard — Re-shell vs patch?
   Context: Stitch designed full re-shell. Risk: 244KB file.
   Recommendation: Full re-shell (pixel-accurate)
   Status: AWAITING CEO

2. [PENDING] Run DB Migration: reminder_days_before
   Action: Run in Supabase SQL editor
   Risk: LOW (ADD COLUMN IF NOT EXISTS)
   Status: AWAITING CEO ACTION

3. [PENDING] Add CRON_ENABLED=true to Vercel
   Action: Vercel dashboard → Environment Variables
   Risk: LOW (enables auto-reminders)
   Status: AWAITING CEO ACTION
```

---

## Recent Deploys

| Date | Feature | Status | Executive Report |
|------|---------|--------|-----------------|
| 2026-06-26 | Design Requests Tab | ✅ | Filed |
| 2026-06-26 | Smart Onboarding Wizard | ✅ | Filed |
| 2026-06-26 | Bottom Nav + Health Score | ✅ | Filed |

---

## How to Update Dashboard

Each Agent updates their KPI section after completing work.
Dashboard review: every morning before starting work.
CEO reviews: Sunday for weekly summary.
