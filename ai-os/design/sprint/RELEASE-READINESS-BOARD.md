# Release Readiness Board
## רגע לפני | Production Release Governance | 2026-06-28
## Purpose: No release enters Production without evidence-based approval from every discipline.

---

# PART 1 — BOARD STRUCTURE

## Disciplines & Approval Authority

| # | Discipline | Responsible | Scope |
|---|---|---|---|
| 1 | **Chief of Staff** | Dvir | Overall product quality, lifecycle completeness, cross-discipline alignment |
| 2 | **Product** | Chief of Staff | Feature completeness, user flows, business rules, edge cases |
| 3 | **Design** | Chief of Staff | Pixel accuracy vs spec, design system compliance, emotional quality |
| 4 | **Engineering** | Lead Engineer | Code quality, architecture, zero-downtime, backward compatibility |
| 5 | **QA** | QA Lead | Regression suite, edge case coverage, device compatibility |
| 6 | **Security** | Security Reviewer | Auth, data exposure, injection risks, OWASP Top 10 |
| 7 | **Performance** | Lead Engineer | FCP, LCP, CLS, bundle size, Core Web Vitals |
| 8 | **Accessibility** | Accessibility Lead | WCAG AA, keyboard navigation, screen reader, touch targets |
| 9 | **Analytics** | Chief of Staff | Event instrumentation, funnel tracking, no PII in logs |
| 10 | **Marketing** | Chief of Staff | Landing page, copy, CTA effectiveness, conversion readiness |
| 11 | **Customer Success** | Chief of Staff | Onboarding clarity, support readiness, known friction points mitigated |

## Approval Statuses

| Status | Meaning |
|---|---|
| ✅ **READY** | All criteria met. Objective evidence provided. Release approved from this discipline. |
| ❌ **NOT READY** | One or more criteria not met. Release is blocked. Specific evidence required. |
| ⚠️ **READY WITH CONDITIONS** | Approved if named conditions are resolved before deployment. Conditions must be specific and verifiable. |

**Any single NOT READY blocks the release. No exceptions.**

---

# PART 2 — RELEASE BLOCKING RULES

A release is **automatically blocked** if any of the following are true:

| Rule | Trigger |
|---|---|
| Any discipline returns NOT READY | Any reviewer |
| P0 issue unresolved | OIE Registry |
| P1 issue without approved mitigation | OIE Registry |
| Regression tests fail | QA |
| WCAG critical violation | Accessibility |
| Security review fails | Security |
| FCP > 2.5s on RSVP page | Performance |
| LCP > 4.0s on any page | Performance |
| Core Web Vitals: any red metric | Performance |
| Production monitoring not configured | Engineering |
| Rollback plan not documented | Engineering |
| Any analytics event unverified | Analytics |
| `npx tsc --noEmit` fails | Engineering |
| Existing couple dashboard regression | QA |
| Existing RSVP link broken | QA |

**No exceptions. No "we'll fix it post-launch." No "it's minor."**

---

# PART 3 — PER-DISCIPLINE RELEASE CRITERIA

## 1. Chief of Staff Checklist

- [ ] All P0 and P1 OIE opportunities resolved or have approved mitigation
- [ ] Opportunity Intelligence Engine updated with resolution evidence
- [ ] Design Freeze conditions met (if first release: score ≥ 9.5)
- [ ] Release Evidence Package generated and reviewed
- [ ] Rollback plan documented and tested
- [ ] Post-release monitoring plan defined

---

## 2. Product Checklist

- [ ] All user flows work end-to-end (RSVP, Onboarding, Dashboard, Admin)
- [ ] All business rules implemented as specified in SCREENS.md
- [ ] All edge cases from SCREENS.md tested (empty states, error states, full states)
- [ ] Free tier guest limit (50) enforced — FT-01, FT-02 states render correctly
- [ ] Time capsule lock/unlock logic correct — content never in DOM when locked
- [ ] WhatsApp template prefix enforced — API rejects non-compliant messages
- [ ] New couples and existing couples both work (no regression, no data gap)
- [ ] Feature flags: all new features behind flags or backward-compatible

---

## 3. Design Checklist

- [ ] All implemented screens match approved Stitch design (pixel accuracy ± 2px)
- [ ] `--color-gold-text: #8B6914` used for all gold text on light backgrounds
- [ ] `--color-gold: #C5A46D` used for all non-text gold elements
- [ ] Frank Ruhl Libre: all display/heading text correct weight and size
- [ ] Heebo: all body/label text correct weight
- [ ] Bottom nav: 4 tabs, active state correct per screen, 64px height + safe area
- [ ] Circular arc only for progress in E2/E3 — no linear bars
- [ ] All botanical illustrations present (COMP-11: BotanicalDivider)
- [ ] All empty states use warm copy and botanical illustration (not blank screens)
- [ ] All error states use WarmAlertCard (not native browser errors)
- [ ] All loading states use warm cream shimmer (not grey skeleton)
- [ ] Admin sidebar: ivory background on all 4 admin tabs
- [ ] RTL layout correct on all screens (dir="rtl" on html element)

---

## 4. Engineering Checklist

- [ ] `npx tsc --noEmit` — zero errors
- [ ] No new `console.error` or unhandled promise rejections in production build
- [ ] All existing routes still work: `/rsvp/[token]`, `/gallery/[token]`, `/memory/[token]`, `/couple/[token]`, `/event/[id]`
- [ ] All new DB columns: `ADD COLUMN IF NOT EXISTS` with DEFAULT value
- [ ] No dropped columns or changed column types
- [ ] All APIs return graceful errors (not 500 stack traces)
- [ ] `ADMIN_TOKEN` required on all admin endpoints (x-admin-token header)
- [ ] `/api/time-capsule/[token]` — when locked: returns ONLY `sender_name`, `created_at`, `id`
- [ ] `/api/admin/message-queue` POST rejects messages not starting with "💍 משפחה וחברים יקרים!"
- [ ] Feature flags: `src/lib/feature-flags.ts` used for new couple-facing features
- [ ] Sentry configured (client + server + edge) — error tracking active
- [ ] Health endpoint `/api/health` returns 200

---

## 5. QA Checklist

- [ ] **Regression: Existing couple dashboard** — loads without error for event with data
- [ ] **Regression: Empty couple dashboard** — loads without error for new event
- [ ] **Regression: Old RSVP link** — confirm + decline both work end-to-end
- [ ] **Regression: Gallery** — photo list loads for real event
- [ ] **Regression: Memory upload** — photo + blessing both submit successfully
- [ ] **Regression: Admin page** — all tabs render, no JavaScript errors
- [ ] **New features: RSVP** — all 5 screens tested on iPhone + Android + tablet
- [ ] **New features: Onboarding** — all 4 steps tested on iPhone
- [ ] **New features: Dashboard** — countdown correct, arc correct, alerts correct
- [ ] **New features: Admin** — all admin tabs, guest management, WhatsApp center
- [ ] **Mobile: 375px (iPhone SE)** — no broken layouts, no horizontal scroll
- [ ] **Mobile: 390px (iPhone 15)** — no broken layouts
- [ ] **Tablet: 768px** — RSVP two-column layout confirmed
- [ ] **Desktop: 1280px** — admin dashboard full width
- [ ] **Safari iOS 16+** — no WebKit-specific layout breaks
- [ ] **Android Chrome** — Hebrew keyboard, phone field numeric, RTL
- [ ] **Dark mode** — ivory/cream surfaces do not invert unexpectedly

---

## 6. Security Checklist

- [ ] No debug endpoints exposed (`/api/debug`, `/api/test`, etc.)
- [ ] All admin routes require `ADMIN_TOKEN` (x-admin-token header)
- [ ] All couple routes require valid token lookup (not enumerable)
- [ ] Excel/file upload: validation against malicious files (OPP-FIX-5 from prior sprint)
- [ ] No stack traces in production API responses
- [ ] No API keys, tokens, or secrets in client-side code or Git history
- [ ] `STITCH_API_KEY` not committed — stored in local config only
- [ ] `ADMIN_TOKEN` not committed — `.env.local.example` lists it as required
- [ ] SQL: all queries use parameterized inputs (no string concatenation)
- [ ] XSS: no `dangerouslySetInnerHTML` with user-controlled data
- [ ] Time capsule: `blessing_text` never returned by API when `unlock_date > today`
- [ ] CORS: admin APIs not accessible cross-origin without token
- [ ] Cron endpoint: `CRON_SECRET` required (FIX-6 from prior sprint)

---

## 7. Performance Checklist

| Metric | Target | Screen |
|---|---|---|
| RSVP FCP | < 1.5s | E2-S2 (guest arrives from WhatsApp) |
| RSVP LCP | < 2.5s | E2-S2 |
| Dashboard FCP | < 2.0s | E3-S6 |
| Admin FCP | < 3.0s | E4-S1 |
| All pages CLS | < 0.1 | All |
| All pages FID | < 100ms | All |

- [ ] Frank Ruhl Libre: `<link rel="preconnect">` to Google Fonts
- [ ] All gallery/memory photos: WebP format, lazy loaded
- [ ] No images blocking render on RSVP loading screen
- [ ] JavaScript bundle: no unused dependencies shipped to guest pages
- [ ] Core Web Vitals: all green in Vercel Analytics
- [ ] RSVP page works without JavaScript (basic confirm form degrades gracefully)

---

## 8. Accessibility Checklist

- [ ] All gold text on light backgrounds: contrast ratio ≥ 4.5:1 (`#8B6914`)
- [ ] All large text (≥ 18px bold / 24px regular): contrast ratio ≥ 3:1
- [ ] All interactive elements: `min 44×44px` touch target
- [ ] All images: `alt` attribute present and descriptive
- [ ] All icon-only buttons: `aria-label` present
- [ ] All forms: `<label>` correctly associated with each input
- [ ] All modals: focus trap active when open, Escape closes
- [ ] All modals: focus returns to trigger element on close
- [ ] Bottom nav: `role="navigation"`, `aria-label="ניווט ראשי"`
- [ ] Hebrew RTL: `dir="rtl"` on `<html>` element
- [ ] Hebrew RTL: `lang="he"` on `<html>` element
- [ ] Keyboard: Tab navigates all interactive elements in logical order
- [ ] Keyboard: Enter/Space activates all buttons
- [ ] Screen reader: page title changes on route change
- [ ] `prefers-reduced-motion`: skeleton animation disabled, confetti disabled

---

## 9. Analytics Checklist

- [ ] All 12 analytics events verified firing in production:
  - `rsvp_viewed`, `rsvp_confirmed`, `rsvp_declined`
  - `gallery_photo_uploaded`, `memory_type_selected`
  - `onboarding_step_completed`, `onboarding_completed`
  - `time_capsule_viewed`, `survey_submitted`
  - `whatsapp_send_initiated`, `seating_saved`, `registration_completed`
- [ ] No PII in event properties (no email, phone, full name in analytics)
- [ ] Events fire with correct properties (token, event_id, etc.)
- [ ] Funnel: RSVP → Confirm/Decline trackable end-to-end
- [ ] Funnel: Onboarding Step 1 → Step 4 → Completion trackable
- [ ] No duplicate event fires on re-render

---

## 10. Marketing Checklist

- [ ] Landing page desktop (E1-S1): headline, CTA, social proof correct
- [ ] Landing page mobile (E1-S2): photography, "800+ זוגות", CTAs correct
- [ ] Pricing page (E1-S4): ₪299 plan visually dominant, ₪0 clearly secondary
- [ ] All CTAs use Hebrew copy from spec — no English visible
- [ ] Meta tags: title, description, og:image for social sharing
- [ ] Favicon: correct brand mark

---

## 11. Customer Success Checklist

- [ ] Onboarding: new couple can reach dashboard in < 5 minutes from registration
- [ ] Skip patterns: couples can skip guest import without friction
- [ ] Error messages: all use Hebrew warm copy — no raw technical messages visible
- [ ] "צד" label: "צד הכלה" / "צד החתן" / "משותף" — clear for parents and non-technical users
- [ ] RSVP decline: gracious copy, no guilt language
- [ ] Empty states: all 8 use warm botanical + helpful CTA — no blank screens
- [ ] Support escalation path exists: at minimum, a contact method visible in the app

---

# PART 4 — RELEASE EVIDENCE PACKAGE TEMPLATE

Every production release generates a Release Evidence Package before CEO approval.

```markdown
# Release Evidence Package
## Product: רגע לפני
## Release: [RELEASE NAME / VERSION]
## Date: [YYYY-MM-DD]
## Prepared by: Chief of Staff

---

## Product Summary
[What this release includes. What it does not include.]

## Design Summary
[Which screens were implemented. Spec reference. Stitch reference. Known deviations (must be approved by CEO).]

## Engineering Summary
[Files changed. DB migrations applied. APIs added/modified. Feature flags used.]

## QA Results
[Test matrix: screen × device × result. All regression items: pass/fail. Bug severity breakdown.]

## Accessibility Report
[Contrast ratios verified. Touch target audit. Keyboard navigation test results. Screen reader spot check.]

## Performance Report
[Lighthouse scores per page. Core Web Vitals per page. Bundle size change vs prior release.]

## Security Report
[OWASP checklist pass/fail. Auth audit. Data exposure check. Dependency vulnerability scan.]

## Analytics Checklist
[All 12 events verified: yes/no. Funnel instrumentation confirmed: yes/no. PII check: pass/fail.]

## Release Risks
[What could go wrong. Probability. Impact. Mitigation.]

## Rollback Plan
[Exact steps to revert this release in < 5 minutes. Who executes. How to verify rollback succeeded.]

## Success Metrics (Post-Release)
[What we will measure. What "success" looks like at 24h, 7d, 30d.]

## Monitoring Plan
[Which dashboards. Which alerts. Who is on-call. Escalation path if incident occurs.]

## Post-Release Tasks
[What must happen within 48 hours of deployment.]

---

## Release Readiness Board Approvals

| Discipline | Reviewer | Status | Evidence | Date |
|---|---|---|---|---|
| Chief of Staff | | ⬜ | | |
| Product | | ⬜ | | |
| Design | | ⬜ | | |
| Engineering | | ⬜ | | |
| QA | | ⬜ | | |
| Security | | ⬜ | | |
| Performance | | ⬜ | | |
| Accessibility | | ⬜ | | |
| Analytics | | ⬜ | | |
| Marketing | | ⬜ | | |
| Customer Success | | ⬜ | | |

**CEO RELEASE APPROVAL**

[ ] All disciplines: READY or READY WITH CONDITIONS (all conditions verified)
[ ] No P0 issues active in OIE Registry
[ ] Release Evidence Package reviewed

**CEO Decision:** APPROVED / NOT APPROVED
**Date:** ___________
```

---

# PART 5 — POST-RELEASE INTELLIGENCE

Deployment is not the end of the lifecycle.

## Monitoring Signals (First 48 Hours)

| Signal | Source | Alert Threshold |
|---|---|---|
| RSVP completion rate | Analytics | < 70% in first 100 RSVPs |
| Error rate | Sentry | > 1% of requests |
| Dashboard load failures | Sentry | Any ER-04 error state firing > 5×/hour |
| Performance regression | Vercel Analytics | RSVP FCP > 2.0s |
| Support messages | Customer Success | > 3 messages on same topic in 24h |
| Couple drop-off at onboarding step | Analytics | < 60% Step 4 completion |

## Automatic Opportunity Creation

Any unexpected pattern creates a new OIE opportunity:
- Error rate spike → OPP with source "Production Incident"
- Support volume on one topic → OPP with source "Customer Feedback"
- Funnel drop > 15% below baseline → OPP with source "Funnel Analytics"
- Performance regression → OPP with source "Performance Review"

Every post-release OPP is automatically P1 minimum until evidence determines otherwise.

## 7-Day Review

7 days post-release, generate a Post-Release Intelligence Report:
- Actual vs predicted funnel rates
- Bugs filed vs bugs resolved
- Support volume vs baseline
- Performance vs targets
- New opportunities created from production signals
- Delight moments observed in real data

---

*Release Readiness Board v1.0 | 2026-06-28*
*This board governs every production release. No exceptions.*
*It exists to protect real couples who depend on this system.*
