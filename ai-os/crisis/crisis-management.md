# Crisis Management Playbook
## רגע לפני AI Company OS — v2.0

---

## Crisis Definition

**Crisis** = כל אירוע שמשפיע על זמינות, שלמות או אבטחת הנתונים של לקוחות פעילים.

---

## Crisis Severity Matrix

| Level | Definition | Response | Owner |
|-------|-----------|----------|-------|
| CRITICAL | Site down / Data loss / Security breach | < 15 min | CTO + CEO + CoS |
| HIGH | Core feature broken for all users | < 1h | CTO + COO |
| MEDIUM | Feature broken for some users | < 4h | CTO |
| LOW | Performance degraded | < 24h | DevOps |

---

## Crisis #1 — Production Down

```
TRIGGER: Site returns 5xx for > 2 minutes

DETECTION:
  - Sentry spike alert
  - Couple/admin can't access
  - Vercel build failure

IMMEDIATE ACTIONS (first 5 minutes):
  1. CTO confirms: is it really down?
  2. Alert: CoS + CEO ("🔴 Production Down — investigating")
  3. Check Vercel dashboard: build error?
  4. Check Supabase: DB responding?
  5. Check last deploy: was it the cause?

DECISION TREE:
  ├── Last deploy caused it?
  │   └── → ROLLBACK immediately (Release Manager, < 2 min)
  │
  ├── DB unresponsive?
  │   └── → Go to Crisis #2
  │
  ├── Code bug?
  │   └── → Hotfix path (CTO writes fix → QA smoke test → Deploy)
  │
  └── Unknown?
      └── → Rollback first, investigate second

ROLLBACK PROCEDURE:
  1. Vercel Dashboard → Deployments
  2. Find last working deployment
  3. "Promote to Production"
  4. Time: < 2 minutes
  5. Verify: load homepage + RSVP + Admin
  6. Report to CEO: "Rolled back. Investigating root cause."

RECOVERY VERIFICATION:
  - [ ] Homepage loads
  - [ ] Couple dashboard loads
  - [ ] RSVP flow works end-to-end
  - [ ] Admin loads
  - [ ] No Sentry errors spike

POST-CRISIS (within 24h):
  - Root cause analysis
  - Post-mortem written
  - Prevention measures deployed
```

---

## Crisis #2 — Database Failure / Supabase Outage

```
TRIGGER: Supabase connection errors or Supabase status page shows incident

DETECTION:
  - "Failed to fetch" errors in Sentry
  - DB queries timing out
  - Supabase status: supabase.com/status

IMMEDIATE ACTIONS:
  1. Check Supabase status page (supabase.com/status)
  2. Alert CEO + CoS: "Supabase issue — [status page link]"
  3. Do NOT try to "fix" — this is Supabase's infrastructure

IF SUPABASE OUTAGE (their issue):
  - Enable maintenance page (custom 503 with expected recovery)
  - Notify affected couples via WhatsApp (if > 30 min): approved template
  - Wait for Supabase recovery
  - No code changes during outage

IF DB CORRUPTION (our issue):
  - CTO assesses scope immediately
  - CEO notified: scope + recovery plan
  - Backend Engineer prepares data recovery SQL
  - CEO approves before execution
  - Full post-mortem mandatory

COMMUNICATION TEMPLATE (to CEO):
  "🔴 DB ISSUE — [TIME]
   Status: Supabase [down/degraded]
   Impact: [what couples can't do]
   Action: [what we're doing]
   ETA: [Supabase estimate or 'unknown']"
```

---

## Crisis #3 — Security Incident

```
TRIGGER: Unauthorized access detected / credentials exposed / data breach suspected

DETECTION:
  - Unusual DB query patterns
  - API abuse detected
  - Hardcoded secret found in git
  - Third party reports vulnerability

IMMEDIATE ACTIONS (first 15 minutes):
  1. Security Engineer + CTO assess scope
  2. CEO + CoS notified immediately
  3. Contain: revoke exposed credentials, block suspicious IPs
  4. Do NOT communicate breach publicly until scope is known

CONTAINMENT:
  - Rotate ALL exposed credentials immediately
  - Block suspicious access patterns
  - Enable additional logging
  - Preserve evidence (don't delete logs)

ASSESSMENT:
  - What data was accessed?
  - How many couples affected?
  - How long was the window?
  - Is the vulnerability still open?

CEO DECISION REQUIRED:
  - Whether to notify affected couples
  - Whether to notify authorities (if PII breach)
  - Public statement (if needed)
  - Scope of credential rotation

POST-INCIDENT:
  - Full security audit
  - New security checklist item added
  - Post-mortem mandatory
  - AI Law review
```

---

## Crisis #4 — WhatsApp / Communication Failure

```
TRIGGER: WhatsApp links not working / messages not delivering

IMPACT: Couples can't notify guests — high emotional impact

DETECTION:
  - Customer Success receives multiple complaints
  - WhatsApp wa.me links return errors
  - Bulk messages not sending

IMMEDIATE ACTIONS:
  1. Verify: is it our code or WhatsApp infrastructure?
  2. Test manually with a wa.me link
  3. Check WhatsApp Business API status (if applicable)
  4. Alert Customer Success to pause outreach

IF OUR CODE:
  - CTO identifies issue
  - Hotfix path
  - QA smoke test → Deploy → Verify

IF WHATSAPP INFRASTRUCTURE:
  - Customer Success drafts manual workaround for couples
  - Marketing drafts status update if needed
  - Wait for WhatsApp recovery

CUSTOMER COMMUNICATION (if > 2h):
  "📱 אנחנו מודעים לבעיה עם שליחת הודעות WhatsApp.
   אנחנו פועלים לפתרון.
   עדכון ב-[TIME].
   צוות רגע לפני"
```

---

## Crisis #5 — Data Loss Event

```
TRIGGER: Data deleted by mistake / migration gone wrong / ransomware

DETECTION:
  - Couple reports missing guests/RSVP
  - Admin reports missing events
  - DB row count drops unexpectedly

IMMEDIATE ACTIONS:
  1. STOP all database writes immediately (CTO decision)
  2. Alert CEO: "Potential data loss — [scope]"
  3. Assess: how much data? which tables? which timeframe?
  4. Do NOT attempt recovery without CEO approval

RECOVERY OPTIONS:
  A. Supabase Point-in-Time Recovery (if available)
  B. Manual SQL recovery from backup
  C. Reconstruct from application logs

CEO APPROVES recovery method BEFORE execution.

NEVER:
  - Run recovery SQL without CEO + CTO approval
  - Delete anything to "clean up" during incident
  - Make schema changes during active data loss

POST-RECOVERY:
  - Verify data integrity
  - Notify affected couples personally
  - Full post-mortem
  - Add safeguards to prevent recurrence
```

---

## Crisis Communication Templates

### To CEO (Initial Alert)
```
🔴 CRISIS ALERT — [HH:MM]
Type: [Production Down / Security / DB / WhatsApp / Data Loss]
Severity: CRITICAL / HIGH
Impact: [Who affected + what they can't do]
Action taken: [What's been done in last 5 min]
Need from you: [Decision / Awareness / Approval]
```

### To CEO (Resolved)
```
✅ CRISIS RESOLVED — [HH:MM]
Type: [Crisis name]
Duration: [X minutes/hours]
Resolution: [What was done]
Couples affected: [N]
Data integrity: [Intact / Issues: describe]
Post-mortem: Scheduled for [DATE]
```

---

## Post-Crisis Mandatory Checklist

- [ ] Root cause identified
- [ ] Post-mortem written within 24h
- [ ] Prevention measure implemented
- [ ] AI Law review (did any law prevent this? could a new one?)
- [ ] Affected couples notified (if applicable)
- [ ] New checklist item added to relevant agent
- [ ] Memory updated: known-issues.md + post-mortems.md
