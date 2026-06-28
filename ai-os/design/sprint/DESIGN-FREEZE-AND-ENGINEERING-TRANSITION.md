# Design Freeze & Engineering Transition
## רגע לפני | Final Engineering Readiness Layer | 2026-06-27
## This is the last architectural document before implementation begins.
## No additional governance systems may be created without explicit CEO approval.

---

# ═══════════════════════════════════════════
# PART 1 — DESIGN TRACEABILITY MATRIX
# ═══════════════════════════════════════════

Every significant design decision has a permanent ID.
When a future engineer or designer asks "why does this work this way?" — they look it up here.
When a future change touches a decision — they check what else is connected.

---

## DEC-001 — Frank Ruhl Libre + Heebo Typography System

| Field | Value |
|---|---|
| **Decision** | Two typefaces only: Frank Ruhl Libre (headings, emotional moments, large numbers) + Heebo (body, labels, data, navigation) |
| **Screens** | All 31 screens |
| **Components** | All 12 components |
| **Spec Reference** | SYS-03 |
| **Design Token** | `--font-display: 'Frank Ruhl Libre'`, `--font-body: 'Heebo'` |
| **Business Rule** | No third typeface may be introduced without CEO approval |
| **Analytics** | N/A |
| **API** | N/A |
| **QA Test** | Visual regression on all screens verifying no Rubik, Arial, or system font appears |

---

## DEC-002 — Gold (#C5A46D) as Primary Accent Colour

| Field | Value |
|---|---|
| **Decision** | Warm desaturated gold as primary action colour, countdown colour, and brand accent |
| **Screens** | All 31 screens |
| **Components** | GoldCTA, CircularProgressArc, StatusPill (pending), BottomNav (active), FilterChip (active) |
| **Spec Reference** | SYS-02 |
| **Design Token** | `--color-gold: #C5A46D`, `--color-gold-dark: #A8873A` |
| **Business Rule** | Gold used only for: primary CTAs, active states, countdown number, couple name in emotional moments, progress arc. NOT for decorative backgrounds at large scale. |
| **CRITICAL NOTE** | Gold text on ivory fails WCAG AA (2.25:1 contrast). Resolution: gold TEXT must use `#8B6914` (4.7:1 contrast). Gold as non-text (borders, arcs, icons) remains `#C5A46D`. This change is required before design freeze. |
| **Analytics** | N/A |
| **QA Test** | Contrast audit tool on all gold text instances |

---

## DEC-003 — Circular Arc as Single Progress Visualization

| Field | Value |
|---|---|
| **Decision** | Circular SVG arc is the only progress visualization in the couple and guest experience. Linear progress bars are eliminated from E2/E3. Admin (E4) may use linear bars for data-dense contexts only. |
| **Screens** | E3-S6 (dashboard), E3-S8 (checklist), E3-S9 (guest center) |
| **Components** | CircularProgressArc |
| **Spec Reference** | SYS-05 |
| **Design Token** | Arc stroke: `--color-gold`, track: `--color-border-default` |
| **Business Rule** | No new `<progress>` HTML element or linear bar component in couple/guest area without CEO approval |
| **Analytics** | N/A |
| **QA Test** | Search codebase for `<progress>`, `progress-bar`, `linear-gradient` in progress context — flag any found in E2/E3 files |

---

## DEC-004 — Bottom Navigation: 4 Tabs, Fixed Structure

| Field | Value |
|---|---|
| **Decision** | Couple area bottom nav has exactly 4 tabs: בית / אורחים / משימות / עוד. Post-event replaces "משימות" with "זכרונות". |
| **Screens** | All E3 couple screens except onboarding and full-screen modals |
| **Components** | BottomNav |
| **Spec Reference** | SYS-04 |
| **Design Token** | Height: 64px + `env(safe-area-inset-bottom)` |
| **Business Rule** | Adding a 5th tab requires CEO approval + new Stitch design. Removing a tab requires CEO approval. |
| **Analytics** | N/A |
| **QA Test** | All E3 authenticated screens render identical bottom nav. Post-event state verified separately. |

---

## DEC-005 — Countdown Number as Product Heartbeat

| Field | Value |
|---|---|
| **Decision** | The number of days until the wedding — in Frank Ruhl Libre 900, gold — is the primary hero element of the couple dashboard and appears in onboarding, time capsule, and wedding day mode |
| **Screens** | E3-S3 (date step), E3-S6 (dashboard), E3-S9 (time capsule), E3-S10 (wedding day) |
| **Components** | Countdown display (inline, not a separate component) |
| **Spec Reference** | E3-SCREENS.md — E3-S6 |
| **Design Token** | `font-family: Frank Ruhl Libre`, `font-weight: 900`, `font-size: 80px`, `color: --color-gold-text` (DEC-002 fix) |
| **Business Rule** | `daysLeft = Math.ceil((event.date - now) / 86_400_000)`. Never show negative numbers in the countdown hero — switch to post-event mode when `daysLeft < 0`. |
| **Analytics** | `dashboard_viewed` event captures `days_left` property |
| **API** | `/api/couple/[token]/briefing` returns `daysLeft` |
| **QA Test** | Verify countdown with date set to today (should show 0, switch to wedding day mode), tomorrow (should show 1), past (should switch to post-event) |

---

## DEC-006 — Floating Label Pattern for All Forms

| Field | Value |
|---|---|
| **Decision** | All form inputs use the floating label pattern — label lives inside field, floats to top on focus or fill |
| **Screens** | E1-S3 (registration), E3-S2 (names), E3-S3 (date/venue), E4-S3 (guest add), E4-S1 (add event) |
| **Components** | FloatingLabelInput |
| **Spec Reference** | SYS-06, COMP-06 |
| **Design Token** | Label transition: `0.15s ease`, field height: `56px`, border-radius: `12px` |
| **Business Rule** | No form field in the product may use placeholder-only identification. Placeholders are permitted for supplementary examples only (never the only label). |
| **Analytics** | N/A |
| **QA Test** | Type into each form field and verify label floats and persists above content. Blur empty field and verify label returns to center. Check error state renders below field. |

---

## DEC-007 — WhatsApp Template Opening Rule

| Field | Value |
|---|---|
| **Decision** | All WhatsApp templates must begin with `💍 משפחה וחברים יקרים!`. Never with a personal name (`שלום [שם]`). |
| **Screens** | E4-S2 (WhatsApp Center) |
| **Components** | PhoneMockup (enforces rule with auto-prepend + console warning) |
| **Spec Reference** | COMP-12, E4-S2 |
| **Design Token** | N/A |
| **Business Rule** | Enforced in 2 places: (1) PhoneMockup component auto-prepends prefix if missing. (2) `/api/admin/message-queue` validates before inserting to queue — returns 400 if missing. Both enforcements required. |
| **Analytics** | `whatsapp_send_initiated` event includes `template_key` |
| **API** | `/api/admin/message-queue` POST — validates `message_text.startsWith('💍 משפחה וחברים יקרים!')` |
| **QA Test** | Attempt to queue a message without the prefix — API must return 400. PhoneMockup must show the prefix auto-prepended with console warning. |

---

## DEC-008 — One-Time Pricing (₪299, Not Subscription)

| Field | Value |
|---|---|
| **Decision** | Premium tier is ₪299 one-time, not recurring. No monthly or annual subscription model. |
| **Screens** | E1-S4 (pricing), E1-S2 (landing mobile — in copy) |
| **Components** | GoldCTA (featured plan) |
| **Spec Reference** | E1-SCREENS.md — E1-S4 |
| **Design Token** | N/A |
| **Business Rule** | Display "תשלום חד-פעמי בלבד" prominently on the pricing page. Never display "לחודש" or "לשנה". No auto-renewal. |
| **Analytics** | `pricing_plan_selected` → `plan: 'premium'` |
| **API** | Payment API (not yet implemented) — must not create recurring charges |
| **QA Test** | Pricing page copy audit: verify "חד-פעמי" appears, verify no recurring language appears |

---

## DEC-009 — Wedding Day Mode as Complete State Override

| Field | Value |
|---|---|
| **Decision** | When `daysLeft === 0`, the entire couple dashboard is replaced by Wedding Day Mode. No partial display — full screen override. |
| **Screens** | E3-S10 (Wedding Day Mode), overrides E3-S6 and E3-S7 |
| **Components** | All couple area components hidden except: BottomNav, WeddingDayScreen |
| **Spec Reference** | E3-SCREENS.md — E3-S10 |
| **Design Token** | N/A |
| **Business Rule** | Check: `if (daysLeft === 0) return <WeddingDayScreen />` before rendering normal dashboard. daysLeft is rechecked every 60 minutes. State persists for the full calendar day (00:00–23:59 of the wedding date in Israel/Jerusalem timezone). |
| **Analytics** | `wedding_day_mode_viewed` |
| **API** | `daysLeft` from `/api/couple/[token]/briefing` |
| **QA Test** | Set event date to today in DB → verify WeddingDayScreen renders instead of dashboard |

---

## DEC-010 — Time Capsule Blur Security Pattern

| Field | Value |
|---|---|
| **Decision** | Time capsule preview shows sender names (visible) but NOT blessing content (blurred). Content is NOT rendered in the DOM — placeholder characters are used instead. |
| **Screens** | E2-S9 (Time Capsule locked state) |
| **Components** | Time capsule blessing preview (inline implementation) |
| **Spec Reference** | E2-SCREENS.md — E2-S9, STATES.md — ES-06 |
| **Design Token** | `filter: blur(4px)` on `.blessing-preview-content` |
| **Business Rule** | SECURITY: Actual blessing content must NOT appear in the HTML source of the locked page, even blurred. Use placeholder characters. A determined user inspecting source code must not be able to read blessings before the anniversary. |
| **Analytics** | `time_capsule_viewed` → `days_until_unlock` |
| **API** | `/api/time-capsule/[token]` — must NOT return `blessing_text` in response when locked. Return only: `sender_name`, `created_at`, `id`. |
| **QA Test** | On locked time capsule page: inspect page source for any blessing text → must be absent. API response in Network tab → must not include `blessing_text`. |

---

## DEC-011 — Status Pill Colour Semantics

| Field | Value |
|---|---|
| **Decision** | Green (#4A7C59) = confirmed/complete (guests, tasks, vendors). Olive (#6B7B5A) = category complete (checklist). Amber/gold = pending. Muted = declined/inactive. These meanings are product-wide and must not conflict. |
| **Screens** | All RSVP screens, E3-S8 (checklist), E3-S9 (guest center), E4-S3 (guest management) |
| **Components** | StatusPill, FilterChipRow, CategoryChip |
| **Spec Reference** | SYS-02, COMP-01 |
| **Design Token** | `--color-status-confirmed: #4A7C59`, `--color-olive: #6B7B5A` |
| **Business Rule** | Green (#4A7C59) is ONLY for: guest confirmed, task complete, vendor confirmed, milestone achieved. Never for: checklist category states (use olive), decorative purposes, any other semantic meaning. |
| **Analytics** | N/A |
| **QA Test** | Visual audit: any green element in the product must be a guest/task/vendor confirmed state. Checklist category complete chip must render olive, not green. |

---

## DEC-012 — Admin Sidebar: Ivory, Never Dark

| Field | Value |
|---|---|
| **Decision** | Admin sidebar is ivory (`--color-ivory`) in all states. WhatsApp Center adds a "מצב שליחה" mode badge — it does NOT change sidebar to dark. |
| **Screens** | E4-S1 (dashboard), E4-S2 (WhatsApp Center), E4-S3 (guest management), E4-S4 (seating) |
| **Components** | Admin sidebar layout |
| **Spec Reference** | SYS-09 |
| **Design Token** | Sidebar background: `--color-ivory`, border: `1px solid --color-border-default` |
| **Business Rule** | The dark sidebar in the approved Stitch screen for E4-S2 is superseded by this decision. The spec is the source of truth. The warm ivory sidebar maintains brand consistency across all admin states. |
| **Analytics** | N/A |
| **QA Test** | Navigate to WhatsApp Center — sidebar must remain ivory. Mode badge "🚀 מצב שליחה" must appear in the sidebar header. |

---

## DEC-013 — Botanical Illustration as Form Support

| Field | Value |
|---|---|
| **Decision** | Botanical illustrations appear in contexts where the user must do something non-emotional (fill a form, choose a type, etc.) to warm the experience. Never in data-dense admin contexts. |
| **Screens** | E3-S1 (welcome), E2-S8 (survey), E2-S5 (declined), all empty states |
| **Components** | BotanicalDivider |
| **Spec Reference** | SYS-08, COMP-11 |
| **Design Token** | SVG inline, `--color-olive` default |
| **Business Rule** | Max 1 botanical element per scroll viewport. Never in admin area. Always `aria-hidden="true"`. |
| **Analytics** | N/A |
| **QA Test** | Visual audit: no botanical illustrations in E4 admin screens |

---

## DEC-014 — Declined RSVP: Gracious, Not an Error State

| Field | Value |
|---|---|
| **Decision** | A declined RSVP is treated as a gracious farewell, not a rejection or error. The screen uses warm copy, botanical imagery, and does not ask the guest to reconsider. |
| **Screens** | E2-S5 (RSVP Declined) |
| **Components** | BotanicalDivider (branch), GoldCTA secondary |
| **Spec Reference** | E2-SCREENS.md — E2-S5 |
| **Design Token** | N/A |
| **Business Rule** | Copy: "מצטערים שלא תוכלו להיות שם / תמיד תהיו קרובים לליבנו ❤️". No "try again" CTA. No "are you sure?" dialog. Guest decision is respected immediately. |
| **Analytics** | `rsvp_declined` |
| **API** | RSVP decline is saved immediately when the "לא אוכל להגיע" button is tapped on E2-S2 — before the declined screen is even shown |
| **QA Test** | Tap decline → verify guest status = 'declined' in DB before the declined screen fully renders |

---

## DEC-015 — Custom Gold Ring SVG (Not Emoji)

| Field | Value |
|---|---|
| **Decision** | The 💍 ring emoji is not used in the product. All ring representations use a custom warm-gold SVG icon. |
| **Screens** | E3-S5 (onboarding celebration), any future use |
| **Components** | RingIcon (SVG, inline) |
| **Spec Reference** | E3-SCREENS.md — E3-S5, Validation Report |
| **Design Token** | Ring stroke: `--color-gold`, 4px stroke-width, diamond fill: `--color-gold` |
| **Business Rule** | The 💍 emoji renders as a blue diamond ring on some Android versions and older iOS. This breaks the warm-gold palette at a critical emotional moment. The SVG must be used everywhere a ring is intended. |
| **Analytics** | N/A |
| **QA Test** | Verify on Android 12+ Chrome that no blue ring emoji appears on the celebration screen |

---

# ═══════════════════════════════════════════
# PART 2 — IMPACT ANALYSIS TEMPLATE
# ═══════════════════════════════════════════

When any future change is proposed — use this template.
Complete it before writing a single line of code.

---

## IMPACT ANALYSIS — [CHANGE NAME] — [DATE]

**Proposed change:** [1-sentence description]
**Requestor:** [CEO / Engineering / Design]
**Priority:** [P0 / P1 / P2]

### Affected Screens
List every screen where this change will be visible.
| Screen | Impact | Change required |
|---|---|---|
| E#-S# | High / Medium / Low | What changes |

### Affected Components
List every shared component that must be modified or that receives a prop change.
| Component | Impact | Change required |
|---|---|---|
| COMP-0# | High / Medium / Low | What changes |

### Affected Design Decisions
List any DEC-0## IDs that this change touches or contradicts.
| Decision ID | Conflict? | Resolution |
|---|---|---|
| DEC-0## | Yes / No | — |

### Affected Business Rules
List any business rules from the spec that this change violates or modifies.

### Affected Tests
| Test | Impact | Update required? |
|---|---|---|
| | | |

### Affected Documentation
- [ ] SYSTEMS.md needs update
- [ ] COMPONENTS.md needs update
- [ ] Screen spec needs update
- [ ] CLAUDE.md needs update
- [ ] Design Traceability Matrix needs update

### Engineering Assessment

| Dimension | Assessment | Notes |
|---|---|---|
| Backward Compatibility | Safe / Risk / Breaking | |
| Existing Customer Impact | None / Minor / Major | |
| Design Consistency | Consistent / Inconsistent | Which DEC-## does it affect? |
| Engineering Complexity | Hours / Days / Weeks | |
| Performance Impact | None / Minor / Must test | |
| Accessibility Impact | None / Must verify / Risk | |
| Mobile Impact | None / Minor / Major | |
| Risk Level | Low / Medium / High / Critical | |
| Migration Required | None / Data / Code / Both | |
| Rollback Plan | [describe in 1-2 sentences] | |

### Deployment Risk: LOW / MEDIUM / HIGH / CRITICAL

### Recommendation: APPROVE / REJECT / DEFER

---

# ═══════════════════════════════════════════
# PART 3 — DECISION RATIONALE
# The "Why" behind the 5 most consequential decisions
# ═══════════════════════════════════════════

---

## DR-001 — Why Frank Ruhl Libre?

**Decision:** Frank Ruhl Libre (Hebrew) as the display typeface.

**Business Goal:** Communicate premium, warmth, and Hebrew cultural specificity in a market where competitors default to Rubik (the safe, generic Hebrew web font).

**User Problem:** Israeli couples planning a wedding want to feel that the tools they use understand their culture and celebrate their language. A product that looks like a bank or a government form does not feel like a wedding product.

**Alternatives Considered:**
- Rubik — the most common Hebrew web font. Rejected: too common, no premium connotation, round forms feel friendly but not celebratory
- Assistant — modern, clean. Rejected: too neutral, no emotional weight
- Noto Serif Hebrew — scholarly. Rejected: academic, not celebratory
- Secular One — strong but geometric. Rejected: not warm enough

**Evidence Supporting the Decision:** Frank Ruhl Libre 900 at 80px gold creates an emotional weight that no other Hebrew typeface achieves at this scale. The serif structure gives authority; the slight warmth in the letterforms gives intimacy. This is the one design choice most likely to make a competitor who sees the product feel envy.

**Expected User Impact:** Couples feel the product was designed specifically for them, not adapted from a generic SaaS template.

**Expected Business Impact:** Visual differentiation in a market where all competitors look similar. First-impression premium signals increase conversion rate.

---

## DR-002 — Why One-Time Pricing for a Seasonal Product?

**Decision:** ₪299 one-time, not monthly/annual subscription.

**Business Goal:** Maximize conversion in a market where the product is used for exactly one finite event.

**User Problem:** A wedding is not a recurring need. Couples will not use this product after their wedding. A subscription model forces them to pay for months they don't use, creates cancellation friction, and generates resentment — which destroys word-of-mouth.

**Alternatives Considered:**
- Monthly subscription (₪49/month) — Rejected: average engagement period is 3–6 months; a couple who uses 6 months at ₪49 pays ₪294 — similar to one-time, but with 6 payment events and the psychological weight of recurring billing
- Annual subscription — Rejected: couple pays for 12 months, uses 6; other 6 months feel wasted
- Freemium forever — Rejected: no clear monetization trigger
- Commission on RSVPs — Rejected: creates perverse incentive to inflate guest lists

**Evidence:** Israeli SaaS products with one-time pricing in finite-use categories (tax software, document signing) consistently show higher conversion and higher satisfaction than subscription equivalents in the same category.

**Expected User Impact:** Couple pays once, uses fully, pays nothing afterward. Zero cancellation anxiety. Positive final memory of the product.

**Expected Business Impact:** Higher conversion rate than subscription alternatives. Referrals are the primary growth channel — satisfied couples recommend to engaged friends.

---

## DR-003 — Why Circular Arc Instead of Linear Progress Bar?

**Decision:** Circular SVG arc as the single progress visualization in couple/guest experience.

**Business Goal:** Create a visually distinctive and emotionally engaging way to communicate planning progress.

**User Problem:** A linear progress bar communicates "this is a task to complete." A circular arc communicates "this is a journey." The framing changes the emotional relationship to the number. 68% as a linear bar feels like "32% left to do." 68% as a circular arc feels like "we've come a long way."

**Alternatives Considered:**
- Linear progress bar — Rejected: feels like a loading screen, not a life event. Also: the product had both (dashboard hero had linear bar, checklist had circular arc) — the inconsistency was identified in the Design Validation Report as a structural issue
- Percentage number only (no visualization) — Rejected: number without visual context lacks emotional resonance
- Step-by-step checklist summary — Rejected: reduces a wedding to a task list

**Evidence:** The circular arc as a completion visualization is associated with wellness apps (fitness rings, meditation streaks) — products that track meaningful personal journeys, not productivity tools. The association is intentional.

**Expected User Impact:** Couple opens the dashboard and sees a gold arc at 68% — they feel "look how far we've come," not "we still have 32% to do."

**Expected Business Impact:** Daily engagement increases when the progress visualization is emotionally rewarding. Users who feel progress are more likely to return.

---

## DR-004 — Why a Time Capsule Feature?

**Decision:** Include a pre-wedding digital time capsule with anniversary unlock.

**Business Goal:** Create a feature with no direct competitor equivalent that generates word-of-mouth from an emotional payoff that occurs 365 days after the wedding.

**User Problem:** Wedding memories fade. Guest blessings are scattered across WhatsApp messages, cards, and verbal moments — none captured. The time capsule creates a structured, emotional way for guests to leave a permanent message to the couple, experienced on their anniversary.

**Alternatives Considered:**
- Standard blessing wall (unlocked immediately) — Built, exists. But lacks the anticipation dimension.
- Video messages — Too high a barrier for most guests
- Physical guestbook (digital version) — No unlock mechanism, no anniversary connection

**Evidence:** The product's unique insight is that the wedding has two emotional peaks: the day itself, and the one-year anniversary. Products that connect both moments create a reason for couples to think about the platform a year later — when they may recommend it to newly-engaged friends.

**Expected User Impact:** On their first anniversary, the couple opens a collection of messages they didn't know existed. This is the highest-value emotional moment the product creates — and it happens without any action from the couple.

**Expected Business Impact:** Anniversary unlock creates a natural word-of-mouth trigger at 12 months. "We got access to our time capsule" is a story couples share. This feature is the product's primary retention of long-term brand memory.

---

## DR-005 — Why Botanical Illustrations Instead of Abstract Icons?

**Decision:** Use botanical (leaf, branch, wreath) illustrations as emotional context markers, not abstract icons.

**Business Goal:** Differentiate from the geometric icon language of generic SaaS products while maintaining warmth and Hebrew cultural resonance.

**User Problem:** Icons communicate function. Botanical illustrations communicate feeling. A declined RSVP screen that uses a warning icon (⚠️) communicates error. A declined RSVP screen that uses an olive branch communicates peace and dignity. The couple's product for managing their wedding should feel like a wedding — not a dashboard.

**Alternatives Considered:**
- Abstract geometric icons — Rejected: feel corporate, wrong emotional temperature
- Wedding-specific emojis (💒, 💒, 🥂) — Rejected: platform-dependent rendering, non-premium connotation
- Photography in all contexts — Rejected: photos require content (couple photo, venue photo) that may not exist; botanical illustrations are always present

**Evidence:** Botanical motifs are strongly associated with Israeli wedding culture — olive branches, Mediterranean herbs, and wildflowers are common in Israeli wedding photography and design. Using botanical illustration as the design language creates cultural specificity that photographs cannot (photographs show specific couples; botanical illustrations belong to all couples).

**Expected User Impact:** Users experience empty states, declined states, and form-supporting contexts as warm and intentional — not as missing content or errors.

**Expected Business Impact:** Botanical illustrations become a brand signature element — recognizable in screenshots, shareable on social, associated with the "רגע לפני" brand.

---

# ═══════════════════════════════════════════
# PART 4 — ENGINEERING CHANGE SAFETY
# Checklist for every future change request
# ═══════════════════════════════════════════

Copy this checklist for every change proposed after Design Freeze.
A change may not proceed to engineering without completing this checklist.

```
ENGINEERING CHANGE SAFETY CHECKLIST
=====================================
Change: [name]
Date: [date]
Requestor: [name]
Engineer: [name]

□ BACKWARD COMPATIBILITY
  Does this change break any existing couple's experience?
  → If YES: require explicit CEO approval + migration plan before proceeding

□ EXISTING CUSTOMER IMPACT
  Are any live couples currently on a screen or flow that this change touches?
  → If YES: schedule change for off-peak hours (not during a wedding day)

□ DESIGN CONSISTENCY
  Does this change contradict any DEC-### decision?
  → If YES: note which decisions and whether the DEC must be updated

□ ZERO-DOWNTIME
  Does this change require DB migrations, schema changes, or environment variable changes?
  → If YES: use ADD COLUMN IF NOT EXISTS + DEFAULT, never DROP or ALTER without approval

□ ENGINEERING COMPLEXITY
  Estimate: Hours / Days / Weeks
  → Changes over 1 week require CEO review before starting

□ PERFORMANCE IMPACT
  Does this change add data fetching, images, or client-side JavaScript to a critical path?
  → If YES: measure FCP before and after with Vercel analytics

□ ACCESSIBILITY IMPACT
  Does this change affect contrast, focus order, or screen reader output?
  → If YES: run contrast check and keyboard navigation test before merging

□ MOBILE IMPACT
  Has this been tested at 390px (iPhone SE) and 375px (iPhone 14)?
  → Required for any E2/E3 change

□ RISK LEVEL: LOW / MEDIUM / HIGH / CRITICAL
  LOW: Deploy immediately after local test
  MEDIUM: Deploy with monitoring for 1 hour
  HIGH: CEO approval + rollback plan ready before deploy
  CRITICAL: Never deploy without CEO review + staged rollout

□ MIGRATION PLAN
  If DB changes: SQL file in supabase/migrations/ ready?
  If route changes: old route redirect ready?

□ ROLLBACK PLAN
  Can this change be reverted in < 5 minutes?
  → If NO: document the recovery procedure before proceeding

APPROVED BY: _______________
DATE: _____________________
```

---

# ═══════════════════════════════════════════
# PART 5 — DESIGN FREEZE
# ═══════════════════════════════════════════

---

## ══════════════════════════════════════════
## DESIGN FREEZE — PENDING CEO RATIFICATION
## ══════════════════════════════════════════

**Score Achieved: 9.6 / 10 (≥ 9.5 required). Execution Sprint 1 complete. All 7 objective conditions satisfied. Awaiting CEO ratification.**

### All 8 Exit Criteria — Status

| Condition | Status | Evidence |
|---|---|---|
| WCAG AA contrast | ✅ | `--color-gold-text: #8B6914` (4.7:1 ratio) — SYS-02 |
| Welcome splash: Hebrew | ✅ | `/tmp/e3_welcome_v2.png` |
| Mobile landing: UI overlay | ✅ | `/tmp/e1_landing_v2.png` |
| Pricing: featured plan dominant | ✅ | `/tmp/e1_pricing_dominant.png` |
| WhatsApp Center: warm sidebar spec | ✅ | DEC-012, SYS-09 |
| Guest import onboarding step | ✅ | `/tmp/e3_onboarding_import_v2.png` |
| Tablet RSVP layout | ✅ | `/tmp/e2_rsvp_tablet_v2.png` — OPP-002 |
| Touch targets ≥ 44px | ✅ | COMPONENTS.md — OPP-004 |
| Navigation active states declared | ✅ | All 31 screens — OPP-006 |
| WhatsApp wizard back navigation | ✅ | E4-SCREENS.md — OPP-003 |
| Gold text audit complete | ✅ | 7 instances corrected — OPP-007 |
| Product Design Validation ≥ 9.5 | ✅ | **9.6 / 10** — Execution Sprint 1 Validation Report |
| 2 consecutive clean validation cycles | ✅ | Prior cycle (9.1) + this cycle (9.6), 0 new criticals |
| 0 P0 / P1 issues | ✅ | All 8 OPPs resolved |
| Red Team: 0 blockers | ✅ | Execution Sprint 1 Red Team |
| Reality Check: 0 critical issues | ✅ | C1 + C2 both resolved |
| CEO Ratification | ⏳ | PENDING — Requesting authorization |

**Design Freeze: NOT YET DECLARED. Engineering Mode: NOT YET ACTIVE.**
**Requesting CEO Design Freeze authorization.**

---

## When Design Freeze Is Declared — What Changes

### ALLOWED after Design Freeze:
- Bug fixes (production issues, regressions)
- Accessibility fixes (contrast, focus, aria-label corrections)
- Performance improvements (bundle size, FCP, lazy loading)
- Copy corrections (typos, grammar, factual errors)
- Analytics instrumentation (adding events, not changing UI)
- Security fixes

### REQUIRES CEO APPROVAL after Design Freeze:
- Any new screen (including empty/error states not yet designed)
- Any change to an existing screen's layout, hierarchy, or visual design
- Any new component
- Any change to a DEC-### decision
- Any new user flow

### PERMANENTLY PROHIBITED after Design Freeze:
- New visual ideas that were not in the approved design
- Redesigns of approved screens
- Scope expansion (adding features)
- New design systems or patterns

### Design Freeze Declaration Template:
```
DESIGN FREEZE — DECLARED
Product: רגע לפני
Date: [DATE]
Declared by: CEO
Conditions met: All 8 (listed above)
Design Validation Score: [SCORE] / 10
Engineering Readiness Score: [SCORE] / 10
External Review Board Score: [SCORE] / 10

From this moment:
→ Engineering Mode is ACTIVE
→ No new UI or design decisions
→ Implementation of the approved product begins
→ This document is the final design authority
```

---

# ═══════════════════════════════════════════
# PART 6 — TRANSITION TO ENGINEERING MODE
# ═══════════════════════════════════════════

When Design Freeze is declared, the following transition takes effect immediately.

---

## Engineering Mode — What It Means

**Engineering implements. Product decides. Design guides.**

An engineer implementing any screen has three references, in this priority order:

1. **Product Specification Pack** (source of truth for behavior, states, business rules)
2. **Stitch design screen** (source of truth for visual appearance, spacing, typography)
3. **CLAUDE.md** (source of truth for engineering policy, security rules, deployment rules)

If these three conflict: stop. Flag the conflict in a GitHub issue. Do not invent a resolution. Wait for a decision from Product/Design before proceeding.

---

## Implementation Order (Tier 1 — First to Build)

These screens are fully specified, design-approved, and should be built first:

| Priority | Screen | Why First |
|---|---|---|
| 1 | RSVP Flow (E2-S1 through E2-S5) | Highest user traffic. Revenue-generating. |
| 2 | Registration (E1-S3) | Required for all new couples. |
| 3 | Onboarding Names + Date+Venue (E3-S2, E3-S3) | Required immediately after registration. |
| 4 | Couple Dashboard (E3-S6, E3-S7) | Daily-use surface. |
| 5 | Admin Dashboard (E4-S1) | Required for admin operations. |

---

## Engineering Non-Negotiables

These rules apply to every line of code written during engineering mode:

1. **Pixel-accurate implementation.** "Close enough" is not acceptable. Measure spacing in px. Match font weights exactly. Match border-radius values from spec.

2. **Component-first.** Build the 12 shared components before implementing any screen. A screen built without its shared components will drift.

3. **Hebrew RTL from day one.** Every component is built with `dir="rtl"` context from the first line. Do not build LTR and "add RTL support later."

4. **States are not optional.** Every screen's loading, empty, and error states are built at the same time as the default state. Not "we'll add them later." At the same time.

5. **Mobile tested before desktop.** For E2/E3 screens: test at 390px before testing at 1280px.

6. **Accessibility from the first line.** `aria-label`, `role`, `tabIndex`, and focus management are added when the component is first built. Not retrofitted.

7. **Analytics events fire on day one.** Every event defined in ENGINEERING-READINESS-DASHBOARD.md is instrumented at the time the screen is built.

8. **Security enforced in the API.** Time capsule locking, WhatsApp template validation, admin auth — these are API-level enforcements, not UI suggestions.

---

## The Transition Mantra

> Engineering does not decide what the product should be.
> Engineering decides how to build what the product has already become.

The product has been designed. The states have been specified. The components have been defined. The business rules have been documented. The accessibility requirements have been set.

Engineering's job — the most important job — is to build exactly what has been designed, exactly as it was specified, with craftsmanship that matches the ambition of the design.

The product deserves that. The couples who will use it deserve that.

---

# FINAL STATEMENT

This document closes the Product Design architecture of רגע לפני.

The governance systems are in place.
The design decisions are documented and traceable.
The specifications are complete.
The engineering transition is ready.

**What remains:** resolve the 7 blockers identified by the External Validation. Declare Design Freeze. Begin engineering.

**After this:** no new architecture documents, no new governance systems, no new workflow layers. The only documents that matter are: the screens, the specification, and the code.

**Build the product.**

---

*Design Freeze & Engineering Transition Document | Chief of Staff | 2026-06-27*
*This is the final architectural document of the Product Design phase.*
*No additions without explicit CEO approval.*
