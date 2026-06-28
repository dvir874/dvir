# Post-Mortems — Company Memory
## רגע לפני | Updated: 2026-06-26

---

## How to Write a Post-Mortem

```markdown
## PM-XXX: [Incident Title]
**Date:** [DATE]
**Severity:** P0/P1/P2
**Duration:** [How long it was broken]

### What Happened
[Timeline of events]

### Root Cause
[The actual underlying cause]

### Impact
[Who was affected, how many couples, what they couldn't do]

### Detection
[How was it found? User report / monitoring / accident?]

### Fix Applied
[What was done to resolve]

### Prevention
[What we changed to prevent recurrence]

### Lessons Learned
[What every agent should know going forward]
```

---

## PM-001: Mock/Prod DB Divergence Risk
**Date:** 2026 Q1 (pre-launch)
**Severity:** P1 (prevented before reaching prod)

### What Happened
Tests passed with mocked DB but actual migrations failed on real data structure.

### Root Cause
Mocked Supabase client returned different nulls/arrays than real DB.

### Fix Applied
Changed to integration tests hitting real DB.

### Lessons Learned
- **Never mock the database in integration tests**
- Always test migrations on a copy of real schema
- `ADD COLUMN IF NOT EXISTS` with DEFAULT is mandatory

---

## PM-002: Admin Endpoint Exposed Without Auth
**Date:** 2026-06-26
**Severity:** P1

### What Happened
Several admin API endpoints had no authentication check.

### Root Cause
Copy-paste pattern without auth guard included.

### Fix Applied
Added `requireAdmin()` guard to all admin endpoints.

### Lessons Learned
- Security Engineer reviews every new endpoint
- Auth guard is first line of every admin route
- Backend checklist includes auth verification

---

## Ongoing Prevention Rules (derived from post-mortems)

1. `npx tsc --noEmit` before every commit
2. Integration tests on real DB schema
3. Auth guard on every admin endpoint
4. Every migration: idempotent + with DEFAULT
5. Never delete production data without CEO approval
6. Rollback plan before every deploy
