# Design Council
## רגע לפני AI Company OS — v2.0

---

## Mission

כל שינוי UI משמעותי עובר בפני מועצת העיצוב לפני שמגיע לקוד.
לא עיצוב אחד מחליט. מועצה שלמה מוודאת שהמוצר נשאר עקבי, נגיש, ופרימיום.

---

## Council Members

| Member | Role | Focus Area |
|--------|------|-----------|
| UX Director | Chair | Overall UX + brand coherence |
| Frontend Engineer | Member | Technical feasibility + implementation |
| Customer Success | Member | Customer-facing impact |
| Product Manager | Member | Business + user story alignment |
| Chief of Staff | Observer | CEO alignment |

---

## When Design Council Is Required

### חובה (Mandatory Review):
- מסכים חדשים לחלוטין
- Dashboards (couple + admin)
- Navigation changes (Bottom Nav, Tab Bar)
- Onboarding flows / Wizards
- Landing pages ו-marketing pages
- Dialogs ו-Bottom Sheets
- Empty States / Error States / Success States
- שינוי Design System (colors, typography, spacing)
- כל component שמשמש ב-3+ מקומות

### לא חובה:
- תיקוני CSS קטנים (ריווח, גודל, צבע קטן)
- Bug fixes שלא משנים מבנה
- Backend changes

---

## Design Review Process

```
1. UX Director completes Stitch design
      ↓
2. UX Director submits Design Brief to Council
      ↓
3. Council Review Period: 24h async
   Each member reviews + provides written feedback
      ↓
4. Council Meeting (virtual, 30 min max):
   - Present findings
   - Resolve conflicts
   - Vote
      ↓
5. Decision: APPROVED / NEEDS REVISION / REJECTED
      ↓
6. If APPROVED → Chief of Staff notified
   If NEEDS REVISION → UX Director revises + resubmits
   If REJECTED → PM escalates to CEO
      ↓
7. CEO Approval Required (if):
   - Design System change
   - Major navigation change
   - New screen category
      ↓
8. Frontend Engineer builds (pixel-accurate)
      ↓
9. UX Director QA (pixel accuracy check)
```

---

## Design Brief Template

```markdown
## Design Brief — [SCREEN/FEATURE NAME]
**Submitted by:** UX Director
**Date:** [DATE]
**Priority:** P1/P2/P3

### What Is Being Designed
[Description of the screen/component]

### User Story
As a [couple/admin/guest], I want to [action] so that [value].

### Stitch Link / Export
[Link or attachment]

### Design Decisions Made
1. [Decision + rationale]
2. [Decision + rationale]

### Design System Used
- Colors: [List colors used]
- Typography: [Heading/body choices]
- Spacing: [Notable spacing decisions]
- Components: [Reused/new components]

### Mobile Verification
- [ ] Designed at 375px first
- [ ] Touch targets ≥ 44px
- [ ] RTL verified
- [ ] All states included (empty/loading/error/success)

### Questions for Council
1. [Open question needing input]
```

---

## Council Review Criteria

Each member evaluates against:

```
UX Director: Brand consistency? Premium feel? Usability?
Frontend Engineer: Technically feasible? Performance concerns?
Customer Success: Will couples understand this? Any confusion?
Product Manager: Solves the right problem? Acceptance criteria met?
```

---

## Accessibility Gate (Built into Council)

Before any design is APPROVED:

- [ ] Color contrast ≥ 4.5:1 for normal text
- [ ] Color contrast ≥ 3:1 for large text
- [ ] Interactive elements have visible focus states
- [ ] Not color-only information (icons/text also carry meaning)
- [ ] Touch targets ≥ 44x44px
- [ ] Hebrew text readable at 16px minimum
- [ ] RTL layout correct

---

## Council Vote

| Outcome | Condition |
|---------|-----------|
| APPROVED | All members approve OR majority + UX Director |
| NEEDS REVISION | Any member has blocking feedback |
| ESCALATE TO CEO | Council split + design system change |

---

## Design Council Log

Each approved design is logged:

```markdown
## Design Approval — [DATE]
**Feature:** [Name]
**Approved by:** [Members]
**Conditions:** [Any conditions attached]
**Stitch Reference:** [Link]
**Built by:** [Frontend Engineer]
**QA Passed:** [Date]
```
