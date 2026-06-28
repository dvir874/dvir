# Continuous Optimization Engine (COE)
## רגע לפני AI Company OS — v3.0

---

## Mission

**פעם בשבוע — גם ללא בקשה — COE סורק את כל החברה ומוצא הזדמנויות שיפור.**

לא רק bugs. לא רק features. כל ממד של החברה.

---

## Weekly Optimization Scan

מתרחש כל ראשון בשבוע. אוטומטי. לא צריך הוראה מה-CEO.

### Scan 1 — Code Quality

```
CHECKS:
  [ ] TypeScript strictness — האם יש any / unknown ללא הצדקה?
  [ ] Duplicate code patterns — האם יש לוגיקה שחוזרת בלי abstraction?
  [ ] Dead code — קוד שלא נקרא עוד
  [ ] API response times — endpoints איטיים יותר מ-500ms
  [ ] Bundle size — האם גדל ב-10%+ מהשבוע הקודם?
  [ ] Missing error handling — try/catch ללא catch meaningful
  [ ] Console.log בקוד production

TOOLS: npx tsc --noEmit, manual code review
OUTPUT: Code Quality Score [0-100] + Issues List + Priority
```

### Scan 2 — UX & Accessibility

```
CHECKS:
  [ ] Mobile (375px) — כל מסכים עדיין תקינים?
  [ ] RTL consistency — כל הטקסט RTL?
  [ ] Touch targets — כל interactive elements ≥ 44px?
  [ ] Color contrast — עומד ב-WCAG AA?
  [ ] Loading states — לכל fetch יש loading state?
  [ ] Empty states — לכל list יש empty state?
  [ ] Error states — לכל form יש error state?
  [ ] Focus states — keyboard navigation עובד?

OUTPUT: UX Score [0-100] + Issues by severity
```

### Scan 3 — Performance

```
CHECKS:
  [ ] Lighthouse Mobile score < 85?
  [ ] Images not optimized (not using next/image)?
  [ ] Unnecessary re-renders in React components?
  [ ] Supabase queries > 500ms (N+1 patterns)?
  [ ] Large JS bundles blocking first load?
  [ ] No caching on repeated API calls?

OUTPUT: Performance Score + Top 3 Issues
```

### Scan 4 — Security Audit

```
CHECKS:
  [ ] New dependencies added — run audit
  [ ] All admin endpoints still require auth?
  [ ] Any new environment variables added to wrong scope?
  [ ] RLS policies still correct after recent migrations?
  [ ] No PII appearing in logs or error messages?
  [ ] Supabase service key usage — only server-side?

OUTPUT: Security Score + Any New Vulnerabilities
```

### Scan 5 — SEO & Discoverability

```
CHECKS:
  [ ] Landing page meta tags complete?
  [ ] Open Graph images set?
  [ ] Page titles descriptive?
  [ ] sitemap.xml current?
  [ ] robots.txt correct?
  [ ] Core Web Vitals passing?
  [ ] Hebrew content properly crawlable?

OUTPUT: SEO Score + Top 3 Improvements
```

### Scan 6 — Customer Funnel Analysis

```
CHECKS:
  [ ] Onboarding completion rate trend (vs last week)?
  [ ] RSVP link sent rate trend?
  [ ] Where do couples drop in onboarding wizard?
  [ ] Which features are NOT being used (dead features)?
  [ ] What's the most visited page? Most abandoned?

OUTPUT: Funnel Score + Top Drop Points + Opportunities
```

### Scan 7 — Developer Experience (DX)

```
CHECKS:
  [ ] Time from code to deploy (how long does full cycle take)?
  [ ] Number of manual steps in workflow?
  [ ] Are all workflows documented and current?
  [ ] Are memory files current (< 30 days old)?
  [ ] Is the AI-OS itself working well?

OUTPUT: DX Score + Process Bottlenecks
```

### Scan 8 — Content & Communication

```
CHECKS:
  [ ] Are WhatsApp templates still current (no outdated info)?
  [ ] Is onboarding wizard copy still accurate?
  [ ] Are error messages helpful or generic?
  [ ] Are email templates professional and on-brand?

OUTPUT: Content Score + Stale Content List
```

---

## Weekly Optimization Report

```markdown
# Weekly Optimization Report — Week [N], [DATE]
**Prepared by:** Continuous Optimization Engine (COE)
**No request needed — automatic weekly scan**

## Overall Optimization Score: [N]/100

## Scan Results

| Area | Score | vs Last Week | Top Issue |
|------|-------|-------------|-----------|
| Code Quality | 88 | +3 | 2 console.logs in prod |
| UX & Accessibility | 91 | +1 | |
| Performance | 82 | -4 | Large image unoptimized |
| Security | 100 | → | |
| SEO | 71 | +2 | Missing OG image |
| Customer Funnel | 74 | ↓ | 35% drop at Step 3 onboarding |
| Developer Experience | 85 | → | |
| Content | 89 | +1 | |

## 🔴 Critical Issues (fix this week)
1. [Issue] — [Why critical] — [Owner]

## 🟡 Improvement Opportunities (prioritized)
1. [Opportunity] — [Expected impact] — [Effort: S/M/L]
2. [Opportunity]
3. [Opportunity]

## Quick Wins (< 1h each)
1. [Win] — [File/component to change]
2. [Win]

## Patterns Over Time
[Is any area consistently declining? Consistently improving?]

## Recommended Sprint Items
[Top 3 issues COE suggests adding to next sprint backlog]

## CEO Awareness
[Anything CEO should know — not action, just awareness]
```

---

## Action Routing

After scan, COE routes issues automatically:

```
Code Quality issues → CTO → Backend/Frontend
UX issues → UX Director → Design Council (if significant)
Performance issues → CTO + Frontend
Security issues → Security Engineer → CTO
SEO issues → Marketing Director
Funnel issues → Product Manager → UX Director
DX issues → COO → CTO
Content issues → Marketing Director + Customer Success
```

---

## COE's Authority

```
COE CAN:
  - Identify and report all issues
  - Recommend fixes with priority
  - Add to sprint backlog (via COO)
  - Update memory with findings

COE CANNOT:
  - Change code directly
  - Deploy anything
  - Bypass design process for UI fixes
  - Override priorities without CoS/CEO input
```
