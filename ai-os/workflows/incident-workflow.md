# Incident Response Workflow
## רגע לפני AI-OS

---

## Severity Classification

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| P0 | Production down / data loss risk | < 1h | Site returns 500, RSVP broken for all |
| P1 | Core feature broken | < 4h | Couple dashboard crashes, guests can't RSVP |
| P2 | Feature partially broken | < 24h | Seating doesn't save, gallery slow |
| P3 | Minor UX / visual bug | Next sprint | Button misaligned, text overflow |

---

## P0 Incident Response

```
Detection (anyone)
    ↓
IMMEDIATE: Notify CEO + CTO (< 5 min)
    ↓
CTO: Assess scope + root cause (< 15 min)
    ↓
Decision: Hotfix or Rollback?
    │
    ├── Rollback (faster, < 2 min via Vercel)
    │   Release Manager executes
    │   CTO confirms scope clear
    │
    └── Hotfix (if rollback insufficient)
        Backend/Frontend fixes
        QA smoke test (abbreviated)
        Release Manager deploys
    ↓
CEO Confirmation: "Fixed"
    ↓
Post-Mortem (within 24h)
    ↓
Prevention measures deployed (within 48h)
```

---

## Incident Report Template

```markdown
## Incident Report: [NAME]
**Date:** [DATE]
**Severity:** P0/P1/P2
**Detected:** [How + when]
**Resolved:** [Time]
**Duration:** [Total downtime/impact]

### Impact
- Couples affected: [N]
- Features affected: [List]
- Data at risk: YES/NO

### Timeline
- [HH:MM] Detected
- [HH:MM] CTO notified
- [HH:MM] Root cause identified
- [HH:MM] Fix applied / Rollback
- [HH:MM] Confirmed resolved

### Root Cause
[Technical root cause]

### Fix Applied
[What was done]

### Rollback Plan Used?
YES/NO — [Details]

### Prevention
[What changes prevent recurrence]

### Post-Mortem Scheduled
[DATE]
```

---

## Rollback Procedure

```
1. Go to Vercel Dashboard → Deployments
2. Find last successful deployment
3. Click "Promote to Production"
4. Time: < 2 minutes
5. Verify: Test RSVP + Couple Dashboard + Admin

If DB migration was part of failed deploy:
1. CTO writes reverse migration SQL
2. CEO approves
3. Backend Engineer runs in Supabase
4. Verify data integrity
```

---

## Communication Templates

### To CEO (P0)
```
🔴 P0 INCIDENT — [HH:MM]
Issue: [One line description]
Impact: [Who is affected]
Status: Investigating / Fixing / Rollback in progress
ETA: [Estimated resolution]
```

### Resolved Notification to CEO
```
✅ RESOLVED — [HH:MM]
Issue: [Name]
Duration: [X minutes]
Fix: [One line]
Post-mortem: [DATE]
```

---

## On-Call Policy

- P0: CTO responds immediately, regardless of time
- P0 during peak hours (Fri evening, Sat): extra care — more couples active
- CEO notified within 5 minutes of P0 detection
- No deploy during active P0 (unless it's the fix)
