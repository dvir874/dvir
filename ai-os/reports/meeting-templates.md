# Meeting Templates
## רגע לפני AI-OS

---

## Daily Standup

**Frequency:** Daily (async — each agent submits in writing)
**Format:** 3 questions, max 3 bullets each

```markdown
## Daily Standup — [DATE]
**Agent:** [Name]

### Done Yesterday
- [Task 1]
- [Task 2]

### Doing Today
- [Task 1]
- [Task 2]

### Blockers
- [Blocker 1 — who can unblock?]
- None
```

---

## Sprint Planning

**Frequency:** Every 2 weeks (Monday)
**Owner:** Product Manager
**Participants:** PM, CTO, UX Director

```markdown
## Sprint [N] Planning — [DATE]
**Sprint Period:** [START DATE] → [END DATE]
**Capacity:** [Estimated story points]

### Sprint Goal
[One sentence — what we're trying to achieve]

### Committed Features
| Feature | Owner | Effort | Priority |
|---------|-------|--------|---------|
| [Feature 1] | Frontend | M | P1 |
| [Feature 2] | Backend | S | P1 |

### Out of Scope (This Sprint)
- [Item 1]

### Dependencies
- [Dependency 1 — who/what]

### Risks
- [Risk 1]

### Definition of Done
- [ ] npx tsc --noEmit clean
- [ ] QA signed off
- [ ] Deployed to production
- [ ] CEO approved
```

---

## Sprint Review

**Frequency:** Every 2 weeks (Friday end of sprint)
**Owner:** Product Manager

```markdown
## Sprint [N] Review — [DATE]

### Completed
| Feature | Status | Notes |
|---------|--------|-------|
| [Feature 1] | ✅ Done | |
| [Feature 2] | ⚠️ Partial | Reason |

### Not Completed
| Feature | Reason | Next Sprint? |
|---------|--------|-------------|

### Sprint Metrics
- Committed: [N] points
- Delivered: [N] points
- Velocity: [N]%

### Key Learnings
[2-3 bullets]

### Customer Impact
[How do completed features affect couples?]
```

---

## Weekly Executive Report (CEO)

**Frequency:** Every Sunday
**Owner:** Product Manager compiles, all agents contribute

```markdown
## Weekly Executive Report — Week [N], [DATE]

### Highlights
[Top 3 things that happened this week]

### Product
- Features shipped: [N]
- Features in progress: [N]
- Blockers: [List]

### Technical Health
- Uptime: [%]
- TypeScript errors: [N]
- Sentry incidents: [N]
- Deploys: [N]

### Business
- New events: [N]
- Active events: [N]
- RSVP completion rate: [%]
- Customer tickets: [N] (resolved: [N])

### Decisions Required from CEO
1. [Decision 1 — context + recommendation]
2. [Decision 2]

### Next Week
[Top 3 priorities]
```

---

## Monthly Strategy Review

**Frequency:** First Monday of each month
**Owner:** CEO

```markdown
## Monthly Strategy Review — [MONTH YEAR]

### OKR Progress
| Objective | Key Result | Progress | On Track? |
|-----------|-----------|----------|----------|
| [O1] | [KR1] | [%] | ✅/⚠️/🔴 |

### Revenue
- MRR: [Amount]
- Growth: [%]
- Churn: [%]

### Product
- Features shipped this month: [N]
- Features in roadmap: [N]
- Technical debt status: [LOW/MEDIUM/HIGH]

### Market
- Competitive changes: [Any?]
- Customer sentiment: [Summary]
- Growth channels: [What's working]

### Strategic Decisions
[Decisions made this month]

### Next Month Focus
[Top 3 strategic priorities]
```
