# Executive Report Template
## רגע לפני AI-OS

---

## When to Submit

Every Agent submits this report after:
- Completing a feature / significant change
- Deploying to production
- Resolving a P0/P1 incident
- Making an architecture decision
- Completing a security review
- Completing a sprint

---

## Executive Report Template

```markdown
---
## Executive Report
**Agent:** [Agent Name]
**Date:** [YYYY-MM-DD HH:MM]
**Task:** [Task/Feature/Incident Name]
**Type:** Feature | Hotfix | Architecture | Security | Sprint

---

### What Was Done
[2-4 sentences. What changed? What was built?]

### Why It Was Done
[Business reason. How does this serve couples or the business?]

### What Changed (Technical)
[Files modified, API changes, DB changes, dependencies]

### Business Impact
**Couples:** [How does this affect existing/new couples?]
**Revenue:** [Revenue impact, if any]
**Operations:** [Operational impact]

### Risk Assessment
**Level:** LOW / MEDIUM / HIGH
**Details:** [What could go wrong? What's the blast radius?]
**Mitigation:** [What was done to reduce risk?]

### Rollback Plan
[How to revert within 5 minutes if something breaks]

### Recommendation
[Agent's recommendation for CEO]

### Confidence Level
[0-100%] — [Why this confidence level]

### Requires CEO Approval?
- [ ] YES — [What specifically needs approval]
- [ ] NO — [Why it's safe to proceed]

### Next Steps
[What happens next? Any follow-up tasks?]

---
```

---

## Example: Feature Report

```markdown
## Executive Report
**Agent:** CTO
**Date:** 2026-06-26 18:30
**Task:** Wedding Mode — Event Day Screen
**Type:** Feature

### What Was Done
Implemented a special "Wedding Day" screen that couples see when event.date === today. Shows event timeline, 5 action buttons (Waze, vendors, seating, gallery, message guests), and hides planning tools.

### Why It Was Done
Couples using the app on their wedding day need real-time tools, not planning tools. This delivers the right experience at the most emotional moment of their journey.

### What Changed (Technical)
- Modified: src/app/couple/[token]/page.tsx (early return when daysLeft === 0)
- Added: WeddingDayScreen component (inline, ~180 lines)
- No DB changes, no API changes, no migration needed

### Business Impact
**Couples:** Significantly improved experience on the wedding day
**Revenue:** No direct impact — retention/NPS improvement
**Operations:** No operational changes

### Risk Assessment
**Level:** LOW
**Details:** Early return before existing dashboard — existing couples unaffected if daysLeft > 0
**Mitigation:** Tested with date set to today, all flows verified

### Rollback Plan
Revert the early return condition in page.tsx (2-line change) → git push → Vercel redeploys in < 3 min

### Recommendation
Approve and deploy. Low risk, high emotional impact.

### Confidence Level
95% — Tested locally, TypeScript clean, no DB changes

### Requires CEO Approval?
- [x] YES — Production deploy requires CEO sign-off per charter

### Next Steps
Monitor Sentry for 24h post-deploy. Collect feedback from first couple who uses it.
```

---

## Report Routing

| Report Type | From | To |
|-------------|------|-----|
| Feature Complete | CTO / Frontend | CEO |
| Security Issue | Security | CTO → CEO |
| Incident Report | CTO | CEO |
| Analytics Weekly | Analytics | CEO |
| Financial Monthly | Finance | CEO |
| Sprint Review | Product Manager | CEO |
| Design Complete | UX Director | PM → CEO |
