# Opportunity Backlog
## רגע לפני | Opportunity-Driven Design | 2026-06-27
## Driver: Maximum value to real users. Not maximum score.

---

## Scoring Method

**ICE Score = Impact × Confidence ÷ Effort**

| Factor | Scale | Definition |
|---|---|---|
| Impact | 1–10 | How much does this improve the actual user experience or business outcome? |
| Confidence | 1–10 | How certain are we this will have the described effect? |
| Effort | 1–10 | Design + implementation cost. 10 = very high. |

Higher ICE = execute first.

---

## World-Class Benchmark Questions (per opportunity)

Before designing any solution, ask:
- **Apple:** How would they handle clarity, minimal friction, trust?
- **Stripe:** How would they handle the information hierarchy, precision?
- **Linear:** How would they handle the interaction model, feedback, state?
- **Airbnb:** How would they handle emotional connection, photography, warmth?
- **Notion:** How would they handle flexibility, progressive disclosure?

Extract the principle. Do not copy the pattern.

---

# OPPORTUNITY BACKLOG — RANKED BY ICE

---

## OPP-001 — RSVP Flow Friction Elimination

| Field | Value |
|---|---|
| **Category** | UX · Mobile Experience |
| **Impact** | 10 |
| **Confidence** | 9 |
| **Effort** | 2 |
| **ICE Score** | **45.0** |
| **Priority** | 🔴 P0 — Execute First |

**Title:** Eliminate every friction point in the RSVP flow for guests who arrive from WhatsApp

**Description:** The RSVP flow (E2-S1 through E2-S5) is the highest-traffic surface in the product. Every guest at every wedding uses it. A single friction point — a slow load, a confusing CTA, a tapped-but-not-responding button — is experienced by hundreds of guests per event. This opportunity identifies and eliminates all friction before the flow is implemented.

**Root Cause:** No first-time user simulation has been performed on the RSVP flow. The design was created in isolation by the Chief of Staff and Stitch. No guest persona has walked through it.

**Affected Experiences:** E2-S1 (Loading), E2-S2 (Invitation), E2-S3 (RSVP Form), E2-S4 (Confirmed), E2-S5 (Declined)

**Business Impact:** RSVP completion rate is the primary metric for product success at launch. Every percentage point of completion affects couple satisfaction and word-of-mouth.

**User Impact:** A guest arriving from a WhatsApp message has no context, no patience, and is likely on a mobile device in a noisy environment. The flow must work in 3 taps.

**Implementation Effort:** Low — this is a pre-implementation audit, not a rebuild.

**Design Effort:** Low — identification of friction points, then targeted Stitch iterations on specific moments only.

**Risk:** Low — improving an existing design.

**Dependencies:** First-Time User Review (OPP-004)

**Expected Improvement:** +0.5 to +1.0 on UX Simplicity and Mobile Experience categories.

**Success Criteria:**
- Guest persona completes RSVP in ≤3 taps
- No moment of confusion on any screen (identified via Reality Check)
- Form validation does not block on Hebrew phone format edge cases
- "Declined" state does not feel like an error to the guest
- Load screen duration < 1.5s (or skeleton state is warm enough to feel intentional)

**World-Class Principle:**
- **Airbnb:** The booking confirmation screen is the most-invested screen in the product. Design the RSVP confirmation with the same investment.
- **Apple:** One thing per screen. The RSVP form has 3 fields maximum — do not add.
- **Linear:** Instant feedback on every action. The tap confirmation should be sub-100ms visual.

---

## OPP-002 — First-Time User Reality Check

| Field | Value |
|---|---|
| **Category** | UX · Product Consistency · Emotional Design |
| **Impact** | 9 |
| **Confidence** | 9 |
| **Effort** | 2 |
| **ICE Score** | **40.5** |
| **Priority** | 🔴 P0 — Execute Immediately |

**Title:** Perform a structured First-Time User Simulation across 5 personas before Design Freeze

**Description:** The CEO directive requires a simulated First-Time User Review evaluating: Newly engaged couple, Wedding guest, Parent, Event manager, Non-technical user. Each persona walks through their primary flow. Friction is logged, not fixed immediately — it enters this backlog.

**Root Cause:** All validation to date has been from the perspective of a product designer evaluating design quality. No persona-based walkthrough has been performed.

**Affected Experiences:** All 31 screens.

**Business Impact:** Prevents shipping a product that scores well internally but confuses real users.

**User Impact:** Every usability issue caught here prevents a real user from failing a task.

**Implementation Effort:** None — pure review activity.

**Design Effort:** Low — structured review against each persona's goals.

**Risk:** Low.

**Dependencies:** None — must be completed before Design Freeze.

**Expected Improvement:** Identifies friction. Fixes enter backlog. Drives last-mile improvements toward 9.5.

**Success Criteria:**
- All 5 personas walk through their primary flow without critical confusion
- Any issue rated "blocks task completion" → automatically P0 in this backlog
- Report produced: `FIRST-TIME-USER-REVIEW.md`

**Status:** ✅ Completed — see `FIRST-TIME-USER-REVIEW.md`

---

## OPP-003 — Mobile Touch Target & Safe Area Audit

| Field | Value |
|---|---|
| **Category** | Mobile Experience · Accessibility |
| **Impact** | 8 |
| **Confidence** | 9 |
| **Effort** | 2 |
| **ICE Score** | **36.0** |
| **Priority** | 🟠 P1 |

**Title:** Audit every interactive element in the couple and guest experience for touch target compliance and safe area correctness

**Description:** CLAUDE.md mandates 44px minimum touch targets and `env(safe-area-inset-bottom)` on all fixed elements. This audit verifies the spec enforces both. Several components in the spec do not explicitly state their height — this opportunity closes those gaps.

**Root Cause:** Component specs define visual dimensions but not always the touch hitbox. A 32px icon button may look right in Stitch but fail the 44px touch target requirement on implementation.

**Affected Experiences:** All mobile screens — especially BottomNav (COMP-08), GoldCTA (COMP-02), FilterChipRow (COMP-05), StarRating (COMP-07), WarmAlertCard (COMP-09), TableNumberChip (COMP-10)

**Business Impact:** Low touch target compliance = missed taps = couple frustration on the most-used daily screens.

**User Impact:** Couples managing their wedding on iPhone while cooking dinner. One thumb. Moving. A 36px button is unusable in that context.

**Implementation Effort:** Low — spec correction only.

**Design Effort:** Low — dimensional audit against existing Stitch screens.

**Risk:** Low.

**Dependencies:** None.

**Expected Improvement:** +0.5 on Mobile Experience. Closes a category gap from 6.0.

**Success Criteria:**
- Every tappable element in couple/guest area ≥ 44×44px touch area (visual may be smaller, padding compensates)
- BottomNav: `height: 64px + env(safe-area-inset-bottom)` confirmed in spec
- All modals and bottom sheets: first tappable element ≥ 44px from screen edge
- Spec updated with explicit touch target sizes per component

**World-Class Principle:**
- **Apple HIG:** 44×44pt minimum touch target. Not recommended. Minimum.

---

## OPP-004 — Navigation Consistency Visual Audit

| Field | Value |
|---|---|
| **Category** | Navigation · Design System |
| **Impact** | 7 |
| **Confidence** | 8 |
| **Effort** | 3 |
| **ICE Score** | **18.7** |
| **Priority** | 🟠 P1 |

**Title:** Visual audit confirming that navigation patterns are consistent across all 31 screens

**Description:** SYS-04 specifies the 4-tab BottomNav for all couple/guest screens. COMP-08 fully specifies the component. However, no cross-screen visual audit has verified that: (a) every screen in E2/E3 shows the same BottomNav, (b) the active tab logic is correct per screen, (c) the WhatsApp admin sidebar is consistent across all 4 admin tabs, (d) post-event and wedding-day mode screens correctly suppress/override navigation.

**Root Cause:** Each screen was designed individually. Navigation was specified globally but never audited cross-screen.

**Affected Experiences:** All E2 and E3 screens (BottomNav), all E4 screens (sidebar), E3-S10 (wedding day — nav suppressed), E3-S11 (post-event — nav suppressed)

**Business Impact:** Inconsistent navigation destroys user trust and mental model.

**User Impact:** A couple who taps "בית" and lands somewhere different than expected loses orientation. This breaks the product's sense of intelligence and quality.

**Implementation Effort:** Low — spec correction, not UI rebuild.

**Design Effort:** Medium — screen-by-screen audit, corrections to E-SCREENS.md files.

**Risk:** Low.

**Dependencies:** None.

**Expected Improvement:** +1.0 on Navigation Consistency (4.5 → 5.5+).

**Success Criteria:**
- Every E2/E3 screen explicitly declares which BottomNav tab is active
- "עוד" bottom sheet contents confirmed consistent across all screens
- Admin sidebar: active tab per screen confirmed in E4-SCREENS.md
- Wedding Day Mode and Post-Event states: nav suppression confirmed in spec

**World-Class Principle:**
- **Linear:** The sidebar is always the same. The active item is always obvious. There is never ambiguity about where you are.

---

## OPP-005 — Design System Cross-Screen Visual Consistency Audit

| Field | Value |
|---|---|
| **Category** | Design System · Product Consistency |
| **Impact** | 8 |
| **Confidence** | 7 |
| **Effort** | 3 |
| **ICE Score** | **18.7** |
| **Priority** | 🟠 P1 |

**Title:** Verify that all 31 screens apply the design system tokens consistently — colour, type, spacing

**Description:** The design system is fully specified in SYSTEMS.md. But 31 screens were designed at different points in time. The earlier Stitch screens (E2, E1) may use slightly different colour values, spacing rhythms, or type scales than the latest specifications. This audit identifies all divergences.

**Root Cause:** Design system evolved during the design process. Earlier screens were not retroactively updated when new tokens were added (e.g. `--color-gold-text: #8B6914` added in Phase 5).

**Affected Experiences:** All 31 screens, especially E1 (earliest design) and E2 (first wave).

**Business Impact:** Inconsistency signals low quality at implementation time. Engineers implement what they see in Stitch — if Stitch is inconsistent, the built product will be too.

**User Impact:** A user who sees gold text in one place and slightly-different gold in another perceives the product as unpolished.

**Implementation Effort:** Low — spec corrections and Stitch regenerations for divergent screens only.

**Design Effort:** Medium — systematic cross-screen colour, type, and spacing check.

**Risk:** Low.

**Dependencies:** None.

**Expected Improvement:** +1.0 on Design System Consistency (5.0 → 6.0+).

**Success Criteria:**
- All gold text on ivory backgrounds: `#8B6914` confirmed or corrected
- All body text: Heebo confirmed (no Arial/Rubik fallback appearing)
- Spacing rhythm consistent: 4px grid confirmed on all card interiors
- Focus ring colour: `#8B6914` confirmed on all interactive elements

**World-Class Principle:**
- **Stripe:** Every pixel follows the same system. The documentation is as precise as the product. No designer can deviate from the system — it is not optional.

---

## OPP-006 — Responsive Design — Tablet Breakpoint (768px–1024px)

| Field | Value |
|---|---|
| **Category** | Desktop Experience · Responsiveness |
| **Impact** | 6 |
| **Confidence** | 7 |
| **Effort** | 7 |
| **ICE Score** | **6.0** |
| **Priority** | 🟡 P2 |

**Title:** Design tablet-breakpoint layouts for the 5 most important screens

**Description:** The product has mobile designs (Stitch, full spec) and desktop designs (admin panel, landing page). The tablet range (768px–1024px) has no dedicated Stitch screens. SYS-01 specifies breakpoints but no visual designs exist for md: (768px) layout. This is the single largest cause of the 3.5/10 Responsiveness score.

**Root Cause:** All Stitch iterations were generated as MOBILE or DESKTOP — no TABLET device type was used.

**Affected Experiences:** E2-S2 (RSVP Invitation), E3-S6 (Couple Dashboard), E3-S7 (Dashboard Below), E4-S1 (Admin Dashboard), E1-S1 (Landing Desktop)

**Business Impact:** Couples who plan their wedding from an iPad — a very common pattern — currently receive either the phone layout (too narrow) or the desktop layout (too wide).

**User Impact:** iPad users see an unoptimized layout. This reads as "this product doesn't care about me."

**Implementation Effort:** High — requires Tailwind responsive variants on all major layout components.

**Design Effort:** High — 5 new Stitch iterations at TABLET device type.

**Risk:** Low — additive, does not break existing layouts.

**Dependencies:** OPP-005 (design system consistency) should be complete first.

**Expected Improvement:** +1.5 to +2.0 on Responsiveness (3.5 → 5.0+). Single largest score gap.

**Success Criteria:**
- 5 Stitch screens generated at 768px–1024px
- Two-column layout for RSVP invitation at md:
- Admin dashboard KPIs: 2×2 grid at md:, 4×1 at lg:
- Couple dashboard: countdown remains hero, cards adapt to 2-column

**World-Class Principle:**
- **Airbnb:** The same emotional quality exists at every breakpoint. The layout adapts — the experience does not degrade.
- **Notion:** Sidebar collapses gracefully. Content breathes. No horizontal scroll at any breakpoint.

---

## OPP-007 — Onboarding Step 3 Drop-off Reduction

| Field | Value |
|---|---|
| **Category** | UX · Product Consistency |
| **Impact** | 8 |
| **Confidence** | 7 |
| **Effort** | 4 |
| **ICE Score** | **14.0** |
| **Priority** | 🟡 P2 |

**Title:** Reduce friction at guest import step — the highest predicted onboarding drop-off point

**Description:** Onboarding Step 3 (E3-S4) is the guest import decision. The couple must choose between importing from contacts, Excel, or manually. This is the moment of maximum cognitive load in the entire onboarding. The couple is excited (just named their wedding, just chose their date) and now must make a technical decision. This is the highest-risk drop-off point.

**Root Cause:** The spec identifies 3 import options but does not address the couple's emotional state at this point or the cognitive cost of each choice.

**Affected Experiences:** E3-S4 (Onboarding Guest Import)

**Business Impact:** Every couple who drops off at onboarding = lost activation. The product is free to try, so friction is the only barrier.

**User Impact:** A 60-year-old parent helping their child set up the wedding account will not know what "ייבוא מ-Excel" means in context.

**Implementation Effort:** Low — single screen.

**Design Effort:** Medium — targeted Stitch iteration with clearer copy and visual affordance.

**Risk:** Low.

**Dependencies:** OPP-002 (First-Time User Review should confirm this hypothesis first).

**Expected Improvement:** Activation rate improvement. Score impact: UX Simplicity +0.3.

**Success Criteria:**
- "Non-technical user" persona (from Reality Check) completes Step 3 without confusion
- "Skip" option is as visually prominent as the import options — no guilt for skipping
- Each option has a secondary explanation of what happens after they choose (e.g. "יפתח אנשי קשר של הטלפון")
- Parent persona understands all 3 options without explanation from another person

**World-Class Principle:**
- **Apple:** When the user doesn't know what to choose, make the right choice the default. The "skip" is not failure — it is the right choice for many users.

---

## OPP-008 — Keyboard Navigation Completeness

| Field | Value |
|---|---|
| **Category** | Accessibility |
| **Impact** | 6 |
| **Confidence** | 7 |
| **Effort** | 4 |
| **ICE Score** | **10.5** |
| **Priority** | 🟡 P2 |

**Title:** Verify and spec complete keyboard navigation for all interactive elements

**Description:** Accessibility score is 4.0/10. The WCAG contrast issue was resolved. The remaining gap is keyboard navigation — Tab order, focus states, Enter/Space activation, Escape dismissal for modals and bottom sheets. The component specs mention keyboard navigation but do not specify Tab order or focus trap behaviour for modals.

**Root Cause:** Each component spec includes an Accessibility section but it was written at a high level. No Tab order map exists for any screen.

**Affected Experiences:** All screens with modals, bottom sheets, forms, filter chips

**Business Impact:** Required for WCAG AA compliance. Legal risk in some markets.

**User Impact:** Users who navigate by keyboard or use screen readers are completely excluded if this is not implemented.

**Implementation Effort:** Medium — React focus-trap library + aria attributes.

**Design Effort:** Low — Tab order map written in spec, no Stitch changes needed.

**Risk:** Low.

**Dependencies:** None.

**Expected Improvement:** +0.5 to +1.0 on Accessibility (4.0 → 5.0+).

**Success Criteria:**
- Tab order specified for: RSVP form, Add Guest modal, WhatsApp Center steps, Seating floor plan
- Focus trap specified for all modal and bottom sheet components
- Escape key = close for all modals, confirmed in COMPONENTS.md
- Screen reader label strategy confirmed: all icon-only buttons have `aria-label`

**World-Class Principle:**
- **Stripe:** Every interactive element in the Stripe dashboard is keyboard-navigable. They treat keyboard users as first-class users, not an afterthought.

---

## OPP-009 — WhatsApp Center Sidebar — Warm Ivory Visual Validation

| Field | Value |
|---|---|
| **Category** | Visual Design · Design System |
| **Impact** | 4 |
| **Confidence** | 6 |
| **Effort** | 2 |
| **ICE Score** | **12.0** |
| **Priority** | 🟡 P2 |

**Title:** Re-generate WhatsApp Center Stitch screen with confirmed ivory sidebar

**Description:** The WhatsApp Center (e4_whatsapp_warm.png) was generated with a dark sidebar despite two attempts. DEC-012 and SYS-09 specify ivory. The spec is the authority — but the Stitch visual conflict creates ambiguity for future engineers who see both the design file and the spec. A third Stitch iteration with a more precise prompt should close this.

**Root Cause:** Stitch's default rendering for admin-style layouts applies a dark sidebar. The prompt override did not override this default behaviour fully.

**Affected Experiences:** E4-S2 (WhatsApp Center)

**Business Impact:** Low immediate impact — spec is authoritative. Medium risk at implementation time.

**User Impact:** None — this is an engineer-facing issue.

**Implementation Effort:** Very low — one Stitch API call.

**Design Effort:** Very low — one refined prompt.

**Risk:** Very low.

**Dependencies:** None.

**Expected Improvement:** Eliminates spec/design visual conflict. Minor contribution to Design System Consistency.

**Success Criteria:**
- Generated screen shows ivory (#FDFAF5) left sidebar
- "🚀 מצב שליחה" mode badge visible in sidebar
- Screen saved as e4_whatsapp_v3.png and referenced in E4-SCREENS.md

---

## OPP-010 — Tablet Breakpoint for RSVP (Priority Slice of OPP-006)

| Field | Value |
|---|---|
| **Category** | Responsiveness · Mobile Experience |
| **Impact** | 7 |
| **Confidence** | 8 |
| **Effort** | 3 |
| **ICE Score** | **18.7** |
| **Priority** | 🟠 P1 |

**Title:** Generate tablet-breakpoint Stitch screen for the RSVP Invitation — the highest-traffic surface

**Description:** Separated from OPP-006 because the RSVP flow has 10× higher traffic than any other screen. A guest opening their RSVP link on an iPad needs an experience that fits the screen. This single iteration has the highest return on Responsiveness improvement.

**Root Cause:** Same as OPP-006 — no TABLET Stitch screens exist.

**Affected Experiences:** E2-S2 (RSVP Invitation) — highest traffic.

**Business Impact:** Couples send RSVP links to hundreds of guests. A measurable percentage open on iPad (tablets represent ~12% of web traffic). A broken layout for 12% of guests is a meaningful UX failure.

**User Impact:** Guest opens link on iPad, sees a narrow phone layout in the centre of a large screen. Reads as low quality.

**Implementation Effort:** Low — single responsive breakpoint addition.

**Design Effort:** Low — one Stitch iteration at tablet size.

**Risk:** Very low.

**Dependencies:** None.

**Expected Improvement:** +0.5 on Responsiveness. Proof point for the tablet strategy.

**Success Criteria:**
- Stitch screen generated at 768px device type showing two-column RSVP layout
- Couple photo: left column (55%). Form/CTA: right column (45%).
- BottomNav suppressed at tablet — actions move to right column
- Saved as e2_rsvp_tablet.png

---

---

## OPP-011 — WhatsApp Center Back Navigation (from Reality Check)

| Field | Value |
|---|---|
| **Category** | UX · Navigation |
| **Impact** | 7 |
| **Confidence** | 9 |
| **Effort** | 2 |
| **ICE Score** | **31.5** |
| **Priority** | 🟠 P1 |

**Title:** Add backward navigation to the WhatsApp Center 4-step wizard

**Description:** The WhatsApp Center wizard (E4-S2) is linear — "המשיכו ←" advances forward, but there is no back action specified. An admin who selects the wrong template in Step 1 must restart the entire wizard to correct it. This is a critical workflow failure for daily admin use.

**Root Cause:** The wizard pattern in E4-SCREENS.md specifies the forward flow but omits the backward navigation. First-Time User Review (Persona 4: Event Manager) confirmed this as a P0 daily workflow issue.

**Affected Experiences:** E4-S2 (WhatsApp Center), all 4 wizard steps

**Business Impact:** The admin uses WhatsApp Center multiple times per day per event. A wizard with no back button increases error cost and frustration.

**User Impact:** Admin must restart a 4-step flow to fix a Step 1 mistake. For a product that prides itself on warm, efficient UX, this is a contradiction.

**Implementation Effort:** Very low — "← חזרה" link, step state management.

**Design Effort:** Very low — single line spec addition.

**Risk:** Very low.

**Dependencies:** None.

**Expected Improvement:** Eliminates a confirmed daily admin friction point. +0.3 on UX Simplicity, +0.3 on Desktop Experience.

**Success Criteria:**
- "← חזרה" link visible above wizard step indicator from Step 2 onward
- Tapping back preserves data entered in the previous step (template selection preserved when returning from Step 2 → Step 1)
- Step 1: no back button (user entered the wizard intentionally)
- Spec update: E4-SCREENS.md + COMPONENTS.md wizard pattern

**World-Class Principle:**
- **Linear:** You can always go back. No state is permanently lost. The mental model is always recoverable.

---

# SPRINT PLANNING — CURRENT SPRINT

## Selected Opportunities (Ranked by ICE)

| Rank | OPP | ICE | Action |
|---|---|---|---|
| 1 | OPP-001 RSVP Friction Elimination | 45.0 | In progress — findings from Reality Check |
| 2 | OPP-002 First-Time User Review | 40.5 | ✅ Completed — FIRST-TIME-USER-REVIEW.md |
| 3 | OPP-003 Touch Target Audit | 36.0 | Next |
| 4 | OPP-011 WhatsApp Back Navigation | 31.5 | Next — spec update + Stitch |
| 5 | OPP-004 Navigation Consistency | 18.7 | Next |
| 6 | OPP-005 Design System Audit | 18.7 | Next |
| 7 | OPP-010 Tablet RSVP Breakpoint | 18.7 | P1 — confirmed critical by Reality Check |

## Deferred (ICE < 15 or high effort)

- OPP-006 Full Tablet Design (7 effort) — deferred to Sprint 2
- OPP-007 Onboarding Step 3 (4 effort) — after Reality Check confirms hypothesis
- OPP-008 Keyboard Navigation (4 effort) — after visual layer is stable
- OPP-009 WhatsApp Stitch re-gen (2 effort) — quick win, can be batched

---

# EXIT CRITERIA — DESIGN MODE

Design Mode ends only when ALL conditions are satisfied:

| Condition | Status |
|---|---|
| Overall Validation Score ≥ 9.5 | ❌ Current: 9.1 |
| Internal Validation passes | ✅ |
| External Validation passes | ✅ (7.17 at time of review, all blockers resolved) |
| Independent Review Board passes | ⏳ Awaiting re-validation after opportunity fixes |
| Red Team finds zero blockers | ✅ 0 remaining |
| Reality Check: no critical usability issues | ❌ 2 critical issues found — C1 (tablet RSVP) + C2 (wizard back nav) |
| Two consecutive validation cycles with no new critical findings | ❌ Only one cycle complete |
| No P0 or P1 design issues remain | ❌ C1 + C2 active |

---

*Opportunity Backlog v1.0 | Chief of Staff | 2026-06-27*
*Updated after every validation cycle.*
*Priorities recalculated at the start of every sprint.*
