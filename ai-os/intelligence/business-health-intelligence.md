# Business Health Intelligence (BHI)
## רגע לפני AI Company OS — v3.0

---

## Mission

לספק ל-CEO תמונה מלאה של בריאות העסק בכל ממד — לא רק טכנולוגי.
בכל שבוע, BHI מייצר Company Health Report עם Trend, Score ו-Recommendations לכל תחום.

---

## Health Domains

```
12 תחומים נמדדים בכל שבוע:

01. Engineering Health
02. Product Health
03. UX & Design Health
04. Security Health
05. Customer Success Health
06. Marketing Health
07. Finance Health
08. Growth Health
09. Operations Health
10. Data & Analytics Health
11. AI Team Health
12. Company Culture Health
```

---

## Health Score Formula

כל domain מקבל ציון 0–100:

```
Green Zone:  80–100 — Healthy, on track
Yellow Zone: 60–79  — Watch, minor concerns
Red Zone:    0–59   — Critical, action needed

Score = weighted average of KPIs in that domain
Trend = vs last week (↑ IMPROVING / → STABLE / ↓ DECLINING)
```

---

## Domain 01 — Engineering Health

| KPI | Weight | Measure |
|-----|--------|---------|
| TypeScript Errors in Prod | 25% | 0 = 100, any = 0 |
| Uptime (30d) | 25% | ≥99.5% = 100 |
| Deploy Success Rate | 20% | % of successful deploys |
| P0/P1 Bugs This Week | 15% | 0 = 100, each -20 |
| Code Review Coverage | 15% | % PRs reviewed before merge |

**Red Flags:** Any TypeScript errors → immediate 0. Any P0 → immediate 0.

---

## Domain 02 — Product Health

| KPI | Weight | Measure |
|-----|--------|---------|
| Sprint Delivery Rate | 25% | % features delivered vs committed |
| Onboarding Completion | 25% | % couples completing onboarding |
| Feature Adoption (30d) | 20% | % of new features used |
| Backlog Health | 15% | % of backlog items with complete specs |
| Customer Requests in Roadmap | 15% | % of top requests in roadmap |

---

## Domain 03 — UX & Design Health

| KPI | Weight | Measure |
|-----|--------|---------|
| Stitch Compliance | 30% | % of new screens with approved design |
| Pixel Accuracy (QA Pass) | 25% | % passing UX QA first time |
| Mobile Score (Lighthouse) | 20% | Mobile performance/accessibility |
| Accessibility Compliance | 15% | WCAG AA pass rate |
| Design Consistency | 10% | % using brand colors/fonts correctly |

---

## Domain 04 — Security Health

| KPI | Weight | Measure |
|-----|--------|---------|
| Critical Vulnerabilities | 30% | 0 = 100, any = 0 |
| Exposed Endpoints | 30% | 0 = 100, any = 0 |
| Secrets in Code | 20% | 0 = 100, any = 0 |
| Security Review Coverage | 20% | % PRs security-reviewed |

---

## Domain 05 — Customer Success Health

| KPI | Weight | Measure |
|-----|--------|---------|
| NPS Score | 30% | NPS/10 * 100 |
| Response Time | 25% | < 24h = 100 |
| Churn Rate | 25% | < 3% = 100, > 10% = 0 |
| Open Critical Tickets | 20% | 0 = 100, each -20 |

---

## Domain 06 — Marketing Health

| KPI | Weight | Measure |
|-----|--------|---------|
| New Leads This Week | 25% | vs target |
| Content Published | 20% | vs plan |
| Organic Traffic Trend | 25% | vs last week |
| Email Open Rate | 15% | vs 25% benchmark |
| Social Engagement | 15% | vs 3% benchmark |

---

## Domain 07 — Finance Health

| KPI | Weight | Measure |
|-----|--------|---------|
| MRR Growth | 35% | vs +10% MoM target |
| Churn Rate | 30% | same as CS |
| LTV/CAC Ratio | 20% | ≥ 3x = 100 |
| Expense vs Budget | 15% | within 10% = 100 |

---

## Domain 08 — Growth Health

| KPI | Weight | Measure |
|-----|--------|---------|
| New Events/Week | 30% | vs target |
| Activation Rate (RSVP sent) | 25% | % who send RSVP within 7d |
| Referral Rate | 20% | % new customers from referral |
| Conversion Rate | 25% | % visitors who sign up |

---

## Domain 09 — Operations Health

| KPI | Weight | Measure |
|-----|--------|---------|
| Deployment Frequency | 25% | ≥ 2/week = 100 |
| Mean Time to Recovery | 25% | P0 < 1h = 100 |
| Incident Rate | 25% | 0 P0 = 100 |
| Process Compliance | 25% | % workflows followed correctly |

---

## Domain 10 — Data & Analytics Health

| KPI | Weight | Measure |
|-----|--------|---------|
| Report Delivery | 30% | 100% on time = 100 |
| Data Accuracy | 30% | ≥ 99% = 100 |
| Anomaly Detection | 20% | < 24h avg = 100 |
| Actionable Insights/Week | 20% | ≥ 3 = 100 |

---

## Domain 11 — AI Team Health

| KPI | Weight | Measure |
|-----|--------|---------|
| AI Law Compliance | 30% | 0 violations = 100 |
| Executive Reports Submitted | 25% | 100% = 100 |
| Memory Update Rate | 20% | % learnings documented |
| Escalation Resolution Time | 25% | < 4h = 100 |

---

## Domain 12 — Company Culture Health

| KPI | Weight | Measure |
|-----|--------|---------|
| Retrospective Completion | 25% | % of sprints with retro |
| Learning Application Rate | 25% | % of learnings acted on |
| Decision Documentation | 25% | % decisions logged |
| Knowledge Sharing | 25% | % updates to shared memory |

---

## Weekly Business Health Report

```markdown
# Business Health Report — Week [N], [DATE]
**Prepared by:** Business Health Intelligence

## Overall Company Health: [SCORE]/100 — [🟢🟡🔴]

## Domain Scores

| Domain | Score | Trend | Status |
|--------|-------|-------|--------|
| Engineering | 94 | ↑ | 🟢 |
| Product | 82 | → | 🟢 |
| UX & Design | 88 | ↑ | 🟢 |
| Security | 100 | → | 🟢 |
| Customer Success | 91 | ↑ | 🟢 |
| Marketing | 72 | ↓ | 🟡 |
| Finance | 78 | → | 🟡 |
| Growth | 65 | ↓ | 🟡 |
| Operations | 90 | ↑ | 🟢 |
| Data & Analytics | 85 | → | 🟢 |
| AI Team | 96 | ↑ | 🟢 |
| Company Culture | 88 | ↑ | 🟢 |

## 🔴 Needs CEO Attention
[Any domain below 60]

## 🟡 Watch List
- Marketing: 72 (↓ from 81 last week) — Content output dropped
- Finance: 78 — MRR growth below target

## 🟢 Highlights
- Security: 100 — clean streak continues
- AI Team: 96 — best score yet

## Recommendations (Top 3)
1. **Marketing:** [Specific action to improve score]
2. **Growth:** [Specific action]
3. **Finance:** [Specific action]

## vs Last Month (Trend)
| Domain | This Week | Last Month | Change |
|--------|-----------|------------|--------|
| Engineering | 94 | 88 | +6 |
| ... | | | |

## Company Intelligence Insight
[CIE insight about this week's health pattern]
```

---

## Reporting Cadence

| Report | Frequency | To |
|--------|-----------|-----|
| Domain scores updated | Weekly | internal |
| Business Health Report | Weekly | CoS → CEO |
| Deep Dive (single domain) | Monthly rotation | CoS → CEO |
| Company Health Annual | Yearly | CEO |
