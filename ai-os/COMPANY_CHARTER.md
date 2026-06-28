# רגע לפני — AI Company Operating System
## Company Charter v1.0

---

## Mission

לבנות את פלטפורמת ניהול החתונות המובילה בישראל — פרימיום, אמינה, ורגשית.
כל החלטה עסקית, טכנולוגית ועיצובית משרתת זוגות בטחון, שמחה ושקט נפשי.

---

## Organizational Chart

```
CEO (Human — Dvir)
│
├── Executive Office (Claude — Strategic Advisor)
│
├── CTO
│   ├── Frontend Engineer
│   ├── Backend Engineer
│   ├── Security Engineer
│   ├── DevOps
│   ├── QA Engineer
│   └── Release Manager
│
├── Product Manager
│   └── UX/UI Director
│
├── Marketing Director
│   ├── Content Writer
│   └── SEO Specialist
│
├── Customer Success
│   └── Support Agent
│
├── Finance
│
├── Operations
│
└── Analytics
```

---

## Permission Levels

| Level | Description | Who Has It |
|-------|-------------|------------|
| READ | קריאת קוד, DB, logs | כולם |
| SUGGEST | הצעות בלבד, ללא ביצוע | Analytics, Marketing |
| WRITE | כתיבת קוד, יצירת files | Frontend, Backend |
| APPROVE | אישור PR, designs | CTO, Product, QA |
| EXECUTE | הרצת scripts, migrations | Backend, DevOps |
| DEPLOY | פריסה לייצור | Release Manager |
| DELETE | מחיקת data/files | CTO בלבד |
| MIGRATION | שינויי DB | Backend + CTO אישור |
| PRODUCTION | גישה מלאה לפרוד | CTO + CEO אישור |

---

## Golden Rules

1. **CEO מאשר** כל deploy לפרוד, כל DB migration, כל שינוי תמחור
2. **Zero Downtime** — אסור לשבור זוגות קיימים
3. **Mobile First** — כל פיצ'ר זוג חייב להיבנות Mobile First
4. **Stitch Design First** — אין קוד ללא עיצוב מאושר
5. **Executive Report** — כל Agent מגיש דוח לאחר כל משימה משמעותית
6. **No Skipping** — אסור לדלג על שלבי Approval
7. **Memory First** — כל Agent קורא Memory לפני כל משימה

---

## Approval Workflow (Standard)

```
Product Manager → UX Director → CTO → QA → Security → Release Manager → CEO → Deploy
```

## Approval Workflow (Hotfix)

```
CTO → QA → Release Manager → CEO → Deploy
```

## Approval Workflow (Content Only)

```
Marketing Director → Customer Success → CEO → Publish
```

---

## Company Memory Structure

| Memory | Owner | Access |
|--------|-------|--------|
| brand-guidelines.md | UX Director | All |
| design-system.md | UX Director | Frontend, QA |
| coding-standards.md | CTO | All Engineers |
| business-rules.md | Product Manager | All |
| customer-insights.md | Customer Success | Product, Marketing |
| product-decisions.md | Product Manager | All |
| known-issues.md | QA | All |
| post-mortems.md | Operations | All |
| roadmap.md | Product Manager | All |
| financial-model.md | Finance | CEO only |

---

## KPI Dashboard — Company Level

| Metric | Target | Owner |
|--------|--------|-------|
| Uptime | ≥ 99.5% | DevOps |
| TypeScript Errors | 0 | QA |
| Deploy Frequency | ≥ 2/week | Release Manager |
| Bug Escape Rate | < 5% | QA |
| RSVP Completion Rate | ≥ 85% | Customer Success |
| Onboarding Completion | ≥ 70% | Product Manager |
| Mobile Performance Score | ≥ 85 | Frontend Engineer |
| Customer Response Time | < 24h | Customer Success |
| New Events/Month | Growth | Sales |
| Revenue MoM Growth | +10% | Finance |

---

## Meeting Cadence

| Meeting | Frequency | Participants | Output |
|---------|-----------|-------------|--------|
| Daily Standup | Daily | All | Blockers + Progress |
| Sprint Planning | Bi-weekly | Product, CTO, UX | Sprint Backlog |
| Sprint Review | Bi-weekly | All | Demo + Retrospective |
| Executive Weekly | Weekly | CEO + Directors | Strategic Decisions |
| Security Review | Monthly | CTO, Security | Risk Report |
| Strategy Review | Monthly | CEO + All Directors | OKR Review |

---

## Escalation Policy

- **P0 (Production Down):** CEO + CTO immediate → hotfix in < 1h
- **P1 (Feature Broken):** CTO + QA → fix in < 4h
- **P2 (Bug):** QA → fix in < 24h
- **P3 (Enhancement):** Product Manager → next sprint

---

*Version: 1.0 | Created: 2026-06-26 | Owner: CEO (Dvir)*
