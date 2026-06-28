# Opportunity Intelligence Engine
## רגע לפני | Continuous Discovery & Prioritization | 2026-06-28
## Purpose: Discover highest-value opportunities. Execute with excellence. Learn from real users.

---

# PART 1 — ENGINE DEFINITION

## Signal Sources

Every signal is evidence. Never opinion alone.

| Source | Type | Signal Examples |
|---|---|---|
| Internal Design Validation | Design | Category scores, blocking criteria, validation history |
| External Validation Board | Design | Reviewer scores, independent findings |
| Independent Review Board | Design | Re-validation findings |
| Red Team | Design | Blocking issues found, mitigations evaluated |
| Reality Check | UX | Persona friction points, task failures, delight moments |
| Design Reviews | Design | Stitch/spec divergence, component inconsistency |
| Engineering Reviews | Engineering | Implementation blockers, spec ambiguity |
| QA Reviews | Engineering | Bug severity, regression patterns |
| Accessibility Reviews | Accessibility | WCAG failures, screen reader issues |
| Performance Reviews | Performance | FCP, LCP, CLS, bundle size regressions |
| Product Analytics | Product | Funnel drop-off, feature adoption, session depth |
| Funnel Analytics | Product | Conversion rates per step, abandonment points |
| Customer Feedback | Product | Qualitative signals from real couples and guests |
| Customer Success | Product | Recurring support requests, onboarding friction |
| Support Tickets | Product | Bug reports, usability failures, feature requests |
| Bug Reports | Engineering | Reproducible defects with user impact |
| Sales Feedback | Business | Objections, deal blockers, competitor mentions |
| Marketing Insights | Business | Landing page bounce, CTA performance |
| Sprint Retrospectives | Process | Delivery friction, spec gaps, estimation misses |
| Production Incidents | Engineering | System failures, data integrity issues |
| Executive Reviews | Strategy | Direction changes, priority shifts, new constraints |

## Signal Correlation Rules

**Automatic P0 Promotion (no approval required):**
- Same opportunity identified by 3+ independent sources
- 1 critical source (Red Team, Security, Accessibility) + objective product evidence
- Any production incident affecting real users
- Any WCAG critical violation

**Signal Weights:**
- Red Team finding: 3× weight
- Reality Check critical: 3× weight
- External Validation finding: 2× weight
- Engineering Review finding: 2× weight
- Internal Validation: 1× weight
- Single opinion without evidence: 0 weight (discarded)

## Priority Levels

| Level | Definition | Response Time |
|---|---|---|
| P0 | Blocks release or causes user harm | Immediate — same sprint |
| P1 | Major friction or business impact | Current sprint |
| P2 | Improvement with clear value | Next sprint |
| P3 | Low-impact enhancement | Backlog |
| DEFERRED | Valid but not actionable now | Re-evaluate in 2 cycles |
| ARCHIVED | Resolved or superseded | Permanent record |

## ICE Scoring

**ICE = Impact × Confidence ÷ Effort**

| Factor | 1 | 5 | 10 |
|---|---|---|---|
| Impact | Cosmetic | Notable UX or metric improvement | Core user flow or revenue |
| Confidence | Hunch | Some evidence | Multiple independent sources |
| Effort | < 1 hour | 1 day | 1 week+ |

## Opportunity Lifecycle

```
Detected → Validated → Prioritized → Assigned → Designed → Implemented → Verified → Released → Measured → Archived
```

Every opportunity is permanently searchable at every lifecycle stage.

---

# PART 2 — OPPORTUNITY REGISTRY

## Current Status Summary

| Priority | Count | Blocking Design Freeze? |
|---|---|---|
| P0 | 2 | Yes |
| P1 | 6 | Yes (unresolved P1s block Design Freeze) |
| P2 | 5 | No |
| P3 | 0 | No |

---

## OPP-001 — RSVP Flow Friction Elimination

| Field | Value |
|---|---|
| **ID** | OPP-001 |
| **Status** | 🔵 Prioritized |
| **Priority** | P0 |
| **ICE** | 45.0 (Impact 9, Confidence 9, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | UX · Mobile Experience |

**Title:** Eliminate every friction point in the RSVP guest flow

**Description:** The RSVP flow (E2-S1 through E2-S5) is the highest-traffic surface. Every guest at every wedding uses it. Friction here affects hundreds of users per event.

**Root Cause:** No persona-based walkthrough was performed before design. The flow was designed from a designer's perspective, not a guest's.

**Evidence:**
- Reality Check (2026-06-28): Moshe persona (67, non-technical) identified 3 friction points
- Internal Validation v2.0: Mobile Experience scored 6.0/10
- Red Team: R1 through R5 all resolved, but guest flow friction was not specifically tested

**Source(s):** Reality Check · Internal Design Validation · Red Team

**Affected Experiences:** Guest RSVP
**Affected Screens:** E2-S1, E2-S2, E2-S3, E2-S4, E2-S5

**User Impact:** RSVP completion rate is the product's primary guest-facing metric. Every friction point reduces completion.

**Business Impact:** Lower RSVP completion → couple frustration → churn.

**Engineering Impact:** Low — copy/attribute changes, no architecture change.

**Design Impact:** Low — targeted spec corrections, no screen rebuild.

**Risk:** Low.

**Dependencies:** Reality Check complete ✅

**Resolution Required:**
1. E2-S3: "כמה מגיעים" label → "כמה אנשים מגיעים (כולל אתך)?"
2. E2-S3: Phone field → `inputMode="numeric"` confirmed in spec
3. E2-S2: Microcopy near decline CTA → "אפשר לעדכן מאוחר יותר"
4. E2-S1: Loading screen copy → "מכינים את ההזמנה שלך..."
5. E2-S3: Phone field reassurance → "הטלפון רק לתיאום ישיר עם הזוג"

**Success Criteria:** Guest persona (Moshe) completes RSVP in ≤ 4 taps with zero confusion moments.

**Validation History:**
- 2026-06-28: Detected via Reality Check (Persona 2 — Moshe). 3 friction points identified. Promoted to P0.

---

## OPP-002 — Tablet RSVP Layout (Critical Breakpoint)

| Field | Value |
|---|---|
| **ID** | OPP-002 |
| **Status** | 🔵 Prioritized |
| **Priority** | P0 |
| **ICE** | 38.5 (Impact 8, Confidence 9, Effort 2.5) |
| **Owner** | Chief of Staff |
| **Category** | Responsiveness · Mobile Experience |

**Title:** Fix RSVP Invitation rendering on tablet (768px)

**Description:** The RSVP Invitation screen (E2-S2) has no tablet breakpoint. On a 768px device, the mobile 375px column renders centred with empty space on both sides. This looks broken.

**Root Cause:** All Stitch iterations were generated as MOBILE or DESKTOP. No TABLET device type was used for any guest-facing screen.

**Evidence:**
- Reality Check (2026-06-28): Rami persona (72, tablet user) confirmed broken layout — rated CRITICAL
- Internal Validation v2.0: Responsiveness scored 3.5/10 (lowest single category)
- Engineering Review: No responsive Tailwind variants exist for md: breakpoint in E2 screens

**Source(s):** Reality Check (critical) · Internal Design Validation · Engineering Review → **AUTO-PROMOTED TO P0** (2 sources, 1 critical + objective evidence)

**Affected Experiences:** Guest RSVP
**Affected Screens:** E2-S2 (highest priority), E2-S3, E2-S4

**User Impact:** ~12% of web traffic is tablet. Guests opening RSVP on iPad/tablet see broken layout.

**Business Impact:** Per-event: if 200 guests, ~24 see broken layout. Couple is embarrassed.

**Engineering Impact:** Low — Tailwind `md:` variants on existing component.

**Design Impact:** Medium — new Stitch screen at tablet device type required.

**Risk:** Low — additive responsive improvement.

**Dependencies:** None.

**Resolution Required:**
1. Stitch iteration at tablet (768px): two-column RSVP layout — photo left (55%), form right (45%)
2. E2-SCREENS.md: add `md:` breakpoint specification
3. SYS-01: confirm `md: 768px` breakpoint behaviour for RSVP specifically
4. BottomNav: suppressed at md:, actions in right column

**Success Criteria:** Rami persona (tablet) sees correct two-column layout. No horizontal overflow. CTAs accessible.

**Validation History:**
- 2026-06-28: Detected via Reality Check (Persona 5 — Rami). Auto-promoted P0 (critical source + objective score evidence).

---

## OPP-003 — WhatsApp Center Back Navigation

| Field | Value |
|---|---|
| **ID** | OPP-003 |
| **Status** | 🔵 Prioritized |
| **Priority** | P1 |
| **ICE** | 31.5 (Impact 7, Confidence 9, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | UX · Navigation |

**Title:** Add backward navigation to WhatsApp Center 4-step wizard

**Description:** The WhatsApp Center wizard is linear — no back navigation. Admin who selects wrong template in Step 1 must restart the entire flow.

**Root Cause:** Wizard pattern in E4-SCREENS.md specified forward flow only. Backward case not considered.

**Evidence:**
- Reality Check (2026-06-28): Dvir persona (Event Manager) identified as P0 daily workflow friction

**Source(s):** Reality Check

**Affected Experiences:** Admin WhatsApp Center
**Affected Screens:** E4-S2 (all 4 wizard steps)

**User Impact:** Admin uses WhatsApp Center multiple times per day. Each restart wastes 2–3 minutes.

**Business Impact:** Admin efficiency loss. Risk of admin abandoning the WhatsApp Center for manual WhatsApp.

**Engineering Impact:** Low — step state management, "← חזרה" link.

**Design Impact:** Very low — single spec addition.

**Risk:** Very low.

**Dependencies:** None.

**Resolution Required:**
1. E4-SCREENS.md: add "← חזרה" link above wizard step indicator (Step 2 onward)
2. State preservation: template selection persists when returning from Step 2 → Step 1
3. COMPONENTS.md: document wizard back-navigation pattern

**Success Criteria:** Admin can return to Step 1 from any subsequent step without losing entered data.

**Validation History:**
- 2026-06-28: Detected via Reality Check (Persona 4 — Dvir). Confirmed P1.

---

## OPP-004 — Mobile Touch Target & Safe Area Audit

| Field | Value |
|---|---|
| **ID** | OPP-004 |
| **Status** | 🔵 Prioritized |
| **Priority** | P1 |
| **ICE** | 36.0 (Impact 8, Confidence 9, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | Mobile Experience · Accessibility |

**Title:** Audit all interactive elements for 44px minimum touch target and safe area compliance

**Description:** CLAUDE.md mandates 44px minimum touch targets and `env(safe-area-inset-bottom)`. Component specs define visual dimensions but not touch hitbox sizes for all elements.

**Root Cause:** Specs written at visual design level. Touch hitbox and safe area padding not explicitly confirmed per component.

**Evidence:**
- CLAUDE.md: "Minimum touch targets ≥ 44px" — binding rule
- Apple HIG: 44×44pt minimum — industry standard
- Internal Validation: Mobile Experience 6.0/10

**Source(s):** Internal Validation · CLAUDE.md policy · Apple HIG

**Affected Experiences:** All couple/guest mobile screens
**Affected Screens:** All E2, E3 screens + COMP-02, COMP-05, COMP-07, COMP-08, COMP-09, COMP-10

**Resolution Required:**
1. COMPONENTS.md: add explicit touch target dimensions per component
2. BottomNav: confirm `height: 64px + env(safe-area-inset-bottom)` in spec
3. FilterChipRow: confirm chip height ≥ 44px (currently specified as `height: 36px` — likely fails)
4. StarRating: confirm each star tap zone ≥ 44px

**Success Criteria:** Every tappable element in couple/guest area has ≥ 44×44px touch area confirmed in spec.

**Validation History:**
- 2026-06-28: Identified from Reality Check + CLAUDE.md policy + Internal Validation score.

---

## OPP-005 — Guest Import Step — Clarity & Skip Visibility

| Field | Value |
|---|---|
| **ID** | OPP-005 |
| **Status** | 🔵 Prioritized |
| **Priority** | P1 |
| **ICE** | 28.0 (Impact 8, Confidence 7, Effort 4) |
| **Owner** | Chief of Staff |
| **Category** | UX · Product Consistency |

**Title:** Fix two usability failures in onboarding guest import step

**Description:** Two MAJOR issues confirmed by Reality Check: (1) "Excel" label confusing for non-spreadsheet users; (2) Skip option not visually equal to import options — couples with no list yet cannot easily skip.

**Root Cause:** Screen designed from admin perspective, not couple perspective. "Excel" is a technical term. "Skip" was deprioritized visually without intent.

**Evidence:**
- Reality Check (2026-06-28): Yoni persona (moderately technical) confused by "Excel" label
- Reality Check (2026-06-28): Dana persona found skip option subordinate to import cards

**Source(s):** Reality Check (2 persona signals)

**Affected Experiences:** Couple Onboarding
**Affected Screens:** E3-S4

**Resolution Required:**
1. "ייבוא מ-Excel" → "ייבוא מקובץ" with subtext "Excel, Google Sheets, CSV"
2. "ייבוא מאנשי קשר" → add reassurance: "בוחרים מי נכנס — לא מעלים הכל"
3. Skip: promote to a 4th outline card — "אין רשימה עדיין — דלגו לשלב הבא" — equal visual weight
4. Disabled CTA: add inline copy "בחרו אפשרות כדי להמשיך — או דלגו למטה"
5. New Stitch iteration required with above corrections

**Success Criteria:** Non-technical user persona completes or confidently skips Step 3 without asking for help.

**Validation History:**
- 2026-06-28: 2 persona signals from Reality Check. Promoted to P1.

---

## OPP-006 — Navigation Consistency Visual Audit

| Field | Value |
|---|---|
| **ID** | OPP-006 |
| **Status** | 🔵 Prioritized |
| **Priority** | P1 |
| **ICE** | 18.7 (Impact 7, Confidence 8, Effort 3) |
| **Owner** | Chief of Staff |
| **Category** | Navigation · Design System |

**Title:** Verify active tab state and nav suppression across all 31 screens

**Description:** Bottom nav spec exists. Admin sidebar spec exists. But no cross-screen audit confirms each screen declares the correct active nav state, and that nav is correctly suppressed on Wedding Day Mode and Post-Event screens.

**Root Cause:** Each screen specified individually. Nav state was not cross-audited.

**Evidence:**
- Internal Validation: Navigation Consistency 4.5/10
- External Validation Board: navigation reviewer noted inconsistency signals

**Source(s):** Internal Validation · External Validation Board

**Affected Screens:** All E2, E3 (BottomNav), all E4 (sidebar), E3-S10 (Wedding Day), E3-S11 (Post-Event)

**Resolution Required:**
1. E2-SCREENS.md: each screen declares active BottomNav tab
2. E3-SCREENS.md: each screen declares active BottomNav tab
3. E4-SCREENS.md: each screen declares active sidebar item
4. E3-S10: confirm BottomNav suppressed (Wedding Day Mode)
5. E3-S11: confirm BottomNav suppressed (Post-Event)
6. "עוד" bottom sheet contents confirmed identical across all screens that show it

**Success Criteria:** Any engineer reading a screen spec knows exactly which nav item is active and what the bottom sheet contains.

**Validation History:**
- 2026-06-28: From Internal Validation score (4.5) + External Board signal.

---

## OPP-007 — Design System Cross-Screen Consistency Audit

| Field | Value |
|---|---|
| **ID** | OPP-007 |
| **Status** | 🔵 Prioritized |
| **Priority** | P1 |
| **ICE** | 18.7 (Impact 8, Confidence 7, Effort 3) |
| **Owner** | Chief of Staff |
| **Category** | Design System · Product Consistency |

**Title:** Verify all 31 screens apply WCAG-corrected gold text token and consistent design system

**Description:** `--color-gold-text: #8B6914` was added in Phase 5. Earlier Stitch screens (E1, E2) may still show `#C5A46D` for text. Additionally, spacing, type scale, and border radius must be audited across all screens.

**Root Cause:** Design system evolved. Earlier screens not retroactively audited.

**Evidence:**
- Internal Validation: Design System Consistency 5.0/10
- WCAG correction (Phase 5): new token added after most screens were designed

**Source(s):** Internal Validation · Phase 5 WCAG correction

**Affected Screens:** All 31, especially E1-S1, E1-S2, E2-S2

**Resolution Required:**
1. Each Stitch screen: confirm gold text instances use `#8B6914` not `#C5A46D`
2. Card border radius: confirm 12px throughout (not mixed 8px/12px/16px)
3. Body text: confirm Heebo throughout (no Arial/system font fallback visible in Stitch)
4. Focus ring: confirm `#8B6914` where visible in Stitch
5. Document findings in per-screen notes in E-SCREENS.md files

**Validation History:**
- 2026-06-28: From Internal Validation score (5.0) + known WCAG token gap.

---

## OPP-008 — Phone Field Reassurance Copy (Cross-Screen)

| Field | Value |
|---|---|
| **ID** | OPP-008 |
| **Status** | 🔵 Prioritized |
| **Priority** | P2 |
| **ICE** | 16.0 (Impact 4, Confidence 8, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | UX · Product Consistency |

**Title:** Add 1-line reassurance copy near phone fields in Registration and RSVP Form

**Description:** Both Dana (couple) and Moshe (guest) hesitated at the phone field. Israeli users are privacy-sensitive. A single line of microcopy eliminates the hesitation.

**Root Cause:** Phone field spec does not include helper text for privacy reassurance.

**Evidence:**
- Reality Check: 2 independent persona signals (Dana + Moshe) — same friction, different screens

**Source(s):** Reality Check (2 persona signals) → promoted from minor to P2

**Affected Screens:** E1-S3 (Registration), E2-S3 (RSVP Form)

**Resolution Required:**
1. E1-S3: under phone field → "הטלפון שלך לשימוש בלעדי לאימות — לא לשיווק"
2. E2-S3: under phone field → "הטלפון רק לתיאום ישיר עם הזוג"
3. COMPONENTS.md: FloatingLabelInput to support optional `helperText` prop

**Validation History:**
- 2026-06-28: 2 Reality Check signals. P2.

---

## OPP-009 — "צד" Label Clarity in Guest Forms

| Field | Value |
|---|---|
| **ID** | OPP-009 |
| **Status** | 🔵 Prioritized |
| **Priority** | P1 |
| **ICE** | 22.5 (Impact 5, Confidence 9, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | UX · Product Consistency |

**Title:** Clarify "צד" (side) selector in Add Guest form

**Description:** Miriam (58, parent) did not understand whether "צד" meant "our side" or "their side." The label must be explicit: dropdown shows "צד החתן" / "צד הכלה" / "משותף".

**Root Cause:** "צד" is an internal product term. Users think "which side?" without knowing the frame of reference.

**Evidence:**
- Reality Check (2026-06-28): Miriam persona (parent, moderate technical) — MAJOR confusion signal

**Source(s):** Reality Check

**Affected Screens:** E3-S9 (Guest Center) — Add Guest modal, E4-S3 (Admin Guest Management)

**Resolution Required:**
1. "צד" selector → options: "צד הכלה", "צד החתן", "משותף / לא ידוע"
2. Add Guest modal: label "מאיזה צד?" with placeholder "בחרו צד"
3. Filter chips in guest list: "צד הכלה" / "צד החתן" instead of generic "צד A/B"

**Validation History:**
- 2026-06-28: Reality Check (Miriam). P1.

---

## OPP-010 — WhatsApp Center Stitch Re-Generation (Ivory Sidebar)

| Field | Value |
|---|---|
| **ID** | OPP-010 |
| **Status** | 🔵 Prioritized |
| **Priority** | P2 |
| **ICE** | 12.0 (Impact 4, Confidence 6, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | Visual Design · Design System |

**Title:** Third Stitch iteration for WhatsApp Center to achieve ivory sidebar

**Description:** Two attempts failed to override Stitch's default dark sidebar. DEC-012 specifies ivory. The spec is authoritative, but the visual conflict creates implementation ambiguity. A targeted prompt resolves this.

**Root Cause:** Stitch default rendering applies dark sidebar to admin-layout screens.

**Evidence:**
- DEC-012: ivory sidebar is a binding decision
- e4_whatsapp_warm.png: sidebar is still dark

**Source(s):** Design Review · Internal Validation

**Affected Screens:** E4-S2

**Resolution Required:**
1. Stitch re-generation with more explicit ivory override prompt
2. Save as e4_whatsapp_v3.png
3. Update E4-SCREENS.md reference

**Validation History:**
- 2026-06-27: 2 failed attempts. Noted as P2.
- 2026-06-28: Added to OIE registry.

---

## OPP-011 — Keyboard Navigation Completeness

| Field | Value |
|---|---|
| **ID** | OPP-011 |
| **Status** | 🔵 Prioritized |
| **Priority** | P2 |
| **ICE** | 10.5 (Impact 6, Confidence 7, Effort 4) |
| **Owner** | Chief of Staff |
| **Category** | Accessibility |

**Title:** Specify complete keyboard Tab order and focus trap behaviour

**Description:** Accessibility score 4.0/10. WCAG contrast resolved. Remaining gap: Tab order, focus trap for modals, Enter/Space activation, Escape dismissal.

**Root Cause:** Component specs include Accessibility sections but at high level. No Tab order map per screen.

**Evidence:**
- Internal Validation: Accessibility 4.0/10
- WCAG AA: keyboard navigation is a Level A requirement

**Source(s):** Internal Validation · WCAG AA requirement

**Affected Screens:** All screens with modals, bottom sheets, and forms

**Resolution Required:**
1. COMPONENTS.md: specify focus trap for all modal + bottom sheet components
2. Escape key = close confirmed for all modals
3. Tab order map for RSVP form, Add Guest modal, WhatsApp wizard
4. All icon-only buttons: confirm `aria-label` in spec

**Validation History:**
- 2026-06-28: From Internal Validation score. P2.

---

## OPP-012 — wa.me Batch Limitation Transparency

| Field | Value |
|---|---|
| **ID** | OPP-012 |
| **Status** | 🔵 Prioritized |
| **Priority** | P2 |
| **ICE** | 8.0 (Impact 4, Confidence 8, Effort 2) |
| **Owner** | Chief of Staff |
| **Category** | UX · Product Consistency |

**Title:** Surface wa.me batch limitation to admin before they commit to large sends

**Description:** Admin who queues 200 messages will need to tap 200 wa.me links manually. This is the architectural constraint of the wa.me approach (no WhatsApp Business API). Admin must understand this before committing.

**Root Cause:** The wa.me constraint is architectural. The spec does not surface this to admin in the UI.

**Evidence:**
- Reality Check (2026-06-28): Dvir persona — discovered limitation only at Step 4 (too late)

**Source(s):** Reality Check

**Affected Screens:** E4-S2 Step 2 (Audience selection)

**Resolution Required:**
1. E4-S2 Step 2: info badge → "שליחה ידנית דרך WhatsApp — לחצו על כל מספר בנפרד"
2. If audience > 50 guests: show WarmAlertCard → "שליחה ל-[N] אורחים — ייקח כ-[N×30sec] דקות"
3. Suggest batching strategy in UI for large sends

**Validation History:**
- 2026-06-28: Reality Check (Dvir). P2.

---

# PART 3 — DESIGN FREEZE EXIT CRITERIA

All 8 conditions must be satisfied simultaneously. Not sequentially.

| # | Condition | Status | Evidence Required |
|---|---|---|---|
| 1 | Product Design Validation ≥ 9.5 | ❌ Current: 9.1 | Independent re-validation after opportunity fixes |
| 2 | Internal Validation passes | ✅ | Framework v2.0 score |
| 3 | External Validation passes | ⏳ Re-validation pending | Board re-score after P0/P1 fixes |
| 4 | Independent Review Board passes | ⏳ Pending | Re-validation cycle |
| 5 | Red Team finds zero blockers | ✅ | 0 remaining |
| 6 | Reality Check: no critical usability issues | ❌ C1 + C2 active | OPP-001 + OPP-002 resolved |
| 7 | Two consecutive clean validation cycles | ❌ 1 of 2 complete | Second cycle after fixes |
| 8 | No P0 or P1 issues remain | ❌ OPP-001 through OPP-006, OPP-009 | All resolved |

**Design Freeze is not a milestone the company chooses. It is the outcome of satisfying all 8 conditions.**

---

# PART 4 — SPRINT EXECUTION ORDER

**This sprint — resolve in order:**

1. **OPP-001** (P0, ICE 45.0) — RSVP copy/attribute fixes in spec
2. **OPP-002** (P0, ICE 38.5) — Tablet RSVP: Stitch + spec
3. **OPP-004** (P1, ICE 36.0) — Touch target audit: spec corrections
4. **OPP-003** (P1, ICE 31.5) — WhatsApp back navigation: spec update
5. **OPP-009** (P1, ICE 22.5) — "צד" label clarity: spec correction
6. **OPP-005** (P1, ICE 28.0) — Guest import: Stitch re-gen + spec
7. **OPP-006** (P1, ICE 18.7) — Navigation consistency: cross-screen audit
8. **OPP-007** (P1, ICE 18.7) — Design system audit: colour/type/spacing check

**Next sprint (P2):**
9. OPP-008 — Phone field reassurance copy
10. OPP-010 — WhatsApp Stitch re-gen
11. OPP-011 — Keyboard navigation spec
12. OPP-012 — wa.me batch transparency

---

*Opportunity Intelligence Engine v1.0 | 2026-06-28*
*Sources: Internal Validation · External Validation · Red Team · Reality Check · Design Review*
*Next update: after P0 + P1 resolution and independent re-validation*
