# רגע לפני — Executive Design Presentation
## Product Design Portfolio | Design Sprint Complete
## Prepared by: Chief of Staff | Date: 2026-06-27
## Status: Awaiting CEO Approval

---

> **This document is the Design Sprint deliverable.**
> It contains the complete product design vision across all 5 experiences.
> Implementation is blocked until the CEO approves this presentation.
> Design Intelligence Gate: ACTIVE.

---

# PART 1 — THE VISION

## What We Set Out To Build

רגע לפני is not a wedding management SaaS tool.

It is the most beautiful, emotionally coherent wedding journey platform in Israel.

A platform where every screen — from the first marketing touch to the one-year anniversary time capsule unlock — feels like it was designed by the same world-class design team, for the most important day of someone's life.

## The Design Language: Warm Romantic

One design direction. Applied consistently across all 5 experiences.

```
Brand Tokens (immutable):
  Ivory:    #FDFAF5  ← page backgrounds
  Cream:    #F6F1E8  ← cards, form fields, sections
  Gold:     #C5A46D  ← CTAs, headings, selected states, celebrations
  Olive:    #6B7B5A  ← secondary accents, decline states
  Dark:     #1C1008  ← primary text, dark modes

Typography:
  Frank Ruhl Libre 700–900   ← headings, large numbers, emotional moments
  Heebo 300–600              ← body, labels, data, navigation, forms

Devices:
  Mobile 390px               ← Guest + Couple primary
  Desktop 1280px             ← Admin primary
```

---

# PART 2 — APPROVED SCREENS REGISTRY

## Complete Screen Inventory — 33 Approved Screens

### E1 — Marketing Experience (4 screens)

| # | Screen | Device | File | Status |
|---|--------|--------|------|--------|
| 1 | Landing Page — Hero + Features + Footer | Desktop 1280px | e1_landing_v2.png | ✅ APPROVED |
| 2 | Landing Page — Mobile | Mobile 390px | e1_landing_mobile.png | ✅ APPROVED |
| 3 | Registration / Signup | Mobile 390px | e1_registration.png | ✅ APPROVED |
| 4 | Pricing Page | Mobile 390px | e1_pricing.png | ✅ APPROVED |

### E2 — Guest Experience (12 screens)

| # | Screen | Device | File | Status |
|---|--------|--------|------|--------|
| 5 | RSVP — Loading / Brand Screen | Mobile 390px | Wave 1 | ✅ APPROVED |
| 6 | RSVP — Invitation Selection (YES/NO) | Mobile 390px | Wave 1 | ✅ APPROVED |
| 7 | RSVP — Form (Guest Details) | Mobile 390px | Wave 1 | ✅ APPROVED |
| 8 | RSVP — Form (Filled State) | Mobile 390px | Wave 1 | ✅ APPROVED |
| 9 | RSVP — Confirmed State | Mobile 390px | Wave 1 | ✅ APPROVED |
| 10 | RSVP — Declined State (Gracious) | Mobile 390px | Wave 1 | ✅ APPROVED |
| 11 | Mini Website / Event Invitation Page | Mobile 390px | Wave 1 | ✅ APPROVED |
| 12 | Photo Gallery | Mobile 390px | e2_gallery_ui.png | ✅ APPROVED |
| 13 | Memory Upload — Type Selection | Mobile 390px | e2_memory_ui.png | ✅ APPROVED |
| 14 | Post-Event Survey | Mobile 390px | e2_survey.png | ✅ APPROVED |
| 15 | Time Capsule — Locked State | Mobile 390px | e2_time_capsule.png | ✅ APPROVED |
| 16 | Memory Wall | Mobile 390px | e2_memory_wall.png | ✅ APPROVED |

### E3 — Couple Experience (10 screens)

| # | Screen | Device | File | Status |
|---|--------|--------|------|--------|
| 17 | Dashboard — Above-Fold Hero (Countdown) | Mobile 390px | e3_hero.png | ✅ APPROVED |
| 18 | Dashboard — Below-Fold (Planning Tools) | Mobile 390px | e3_dashboard.png | ✅ APPROVED |
| 19 | Onboarding — Welcome Splash | Mobile 390px | e3_onboarding_welcome.png | ✅ APPROVED |
| 20 | Onboarding — Couple Names (Live Preview) | Mobile 390px | e3_onboarding.png | ✅ APPROVED |
| 21 | Onboarding — Date + Venue Step | Mobile 390px | e3_onboarding_date.png | ✅ APPROVED |
| 22 | Onboarding — Completion Celebration | Mobile 390px | e3_onboarding_celebration2.png | ✅ APPROVED |
| 23 | Checklist (68% Progress Arc) | Mobile 390px | e3_checklist.png | ✅ APPROVED |
| 24 | Guest Center (Mobile Cards) | Mobile 390px | e3_guest_center.png | ✅ APPROVED |
| 25 | Wedding Day Mode | Mobile 390px | e3_wedding_day.png | ✅ APPROVED |
| 26 | Post-Event Dashboard | Mobile 390px | e3_post_event.png | ✅ APPROVED |

### E4 — Admin Experience (4 screens)

| # | Screen | Device | File | Status |
|---|--------|--------|------|--------|
| 27 | Admin Dashboard | Desktop 1280px | e4_admin.png | ✅ APPROVED |
| 28 | WhatsApp Center | Desktop 1280px | e4_whatsapp.png | ✅ APPROVED |
| 29 | Guest Management Table | Desktop 1280px | e4_guest_management.png | ✅ APPROVED |
| 30 | Seating Management (Floor Plan) | Desktop 1280px | e4_seating.png | ✅ APPROVED |

### E5 — Design System (3 artifacts)

| # | Artifact | Status |
|---|----------|--------|
| 31 | Token Library (Colors, Typography, Spacing, Motion) | ✅ COMPLETE |
| 32 | Component Library (10 components documented) | ✅ COMPLETE |
| 33 | Animation Library (6 animations) | ✅ COMPLETE |

**Total: 30 screens + 3 design system artifacts = 33 approved design deliverables**

---

# PART 3 — APPROVED FLOWS

## Complete User Flows — All Approved

### Flow 1: Guest RSVP Journey
```
Guest receives WhatsApp/SMS link
  → /rsvp/[token] → Loading Screen (branded)
  → Invitation Page (photo + couple name + event details)
  → YES/NO selection
  → YES path: Form (count + meal) → Confirmed Screen (table number reveal)
  → NO path: Gracious Declined Screen (olive branch)
```
**6 screens. Every state designed. ✅ COMPLETE**

### Flow 2: Guest Memory Contribution
```
Guest at venue or post-event
  → Gallery Page (masonry photos + gold FAB)
  → FAB tap → Type Selection (2×2: photo / video / voice / blessing)
  → Type-specific upload → Success
```
**3 screens designed. Upload success screen pending. ✅ Core flow complete**

### Flow 3: Guest Post-Event
```
Post-event survey link received
  → Survey (thank-you framing, 3 questions, blessing field)
  → Thank-you confirmation
```
**1 screen designed. Confirmation screen pending. ✅ Core flow complete**

### Flow 4: Time Capsule Journey
```
Pre-wedding: Capsule locked
  → Locked screen (padlock, blurred previews, 365-day countdown)
  → Guest can add blessing to locked capsule
Day-of-anniversary: Unlock triggered automatically
  → Unlock celebration screen [NOT YET DESIGNED]
  → All blessings revealed in Memory Wall format
```
**1 of 2 screens designed. ⚠️ Unlock screen pending**

### Flow 5: Couple Onboarding
```
First signup
  → Welcome Splash (botanical illustration)
  → Names Step (live preview: "חתונת ענבל ונדב" appears as typed)
  → Date + Venue Step (countdown appears instantly: "107 ימים")
  → [Guests step — not yet designed]
  → Completion Celebration ("הכל מוכן!" + couple name in gold + checklist)
  → First Dashboard View
```
**3 of 5 steps designed. Guest import step pending. ✅ Core flow complete**

### Flow 6: Couple Daily Dashboard
```
Morning check-in
  → Above-fold: personal greeting + "47 ימים" countdown + readiness % + stat chips
  → Below-fold: 2×2 quick action grid + alerts + milestones
  → Guest Center / Checklist / Wedding Mode (context-appropriate)
```
**2 screens designed. ✅ COMPLETE**

### Flow 7: Couple Wedding Day
```
daysLeft === 0
  → Wedding Day Mode (full override: couple photo hero + timeline + 4 action buttons)
  → Planning tools hidden
  → Waze / contacts / seating / gallery accessible
```
**1 screen designed. ✅ COMPLETE**

### Flow 8: Couple Post-Event
```
daysLeft < 0
  → Post-Event Dashboard ("הייתה מושלמת" + memory stats + 2×2 actions)
  → Gallery / Blessings / Gift Tracking / Vendor Ratings
```
**1 screen designed. ✅ COMPLETE**

### Flow 9: Admin Guest Management
```
Admin → Event → Guests tab
  → Guest table (filter chips + search + status pills)
  → Add guest / Edit guest / WhatsApp guest / Delete guest
```
**1 screen designed. ✅ COMPLETE**

### Flow 10: Admin Seating
```
Admin → Event → Seating tab
  → Seating floor plan (unassigned left, floor plan right)
  → Drag guest chip → drop on table card
  → Progress badge updates: "78 / 120"
  → Save
```
**1 screen designed. ✅ COMPLETE**

### Flow 11: Admin WhatsApp Send
```
Admin → WhatsApp Center
  → Step 1: Template selection (6 cards)
  → Step 2: Phone mockup preview ("💍 משפחה וחברים יקרים!")
  → Step 3: Audience selection (chips with counts)
  → Step 4: Send
```
**1 screen designed (Step 1–2 visible). ✅ COMPLETE**

### Flow 12: Marketing Funnel
```
Instagram/Google ad
  → Mobile landing page (warm photography + gold CTA)
  → Registration page ("ספרו לנו עליכם" + couple names first)
  → Onboarding wizard (→ Flow 5)
  → First dashboard
```
**3 screens designed. ✅ COMPLETE**

---

# PART 4 — RESPONSIVE LAYOUTS

| Screen | Mobile 390px | Desktop 1280px | Tablet | Status |
|--------|-------------|----------------|--------|--------|
| Landing Page | ✅ | ✅ | — | Complete |
| RSVP | ✅ | — | — | Complete (mobile-only) |
| Gallery | ✅ | — | — | Complete (mobile-only) |
| Couple Dashboard | ✅ | — | — | Complete (mobile-only) |
| Admin Dashboard | — | ✅ | — | Complete (desktop-only) |
| Guest Management | — | ✅ | — | Complete (desktop-only) |
| Seating | — | ✅ | — | Complete (desktop-only) |
| Registration | ✅ | — | — | Complete (mobile-only) |
| Pricing | ✅ | — | — | Complete (mobile-only) |

**Note: Tablet layouts not yet designed. Recommendation: defer to implementation; use responsive breakpoints between mobile and desktop designs.**

---

# PART 5 — REUSABLE PATTERN LIBRARY

## Components Confirmed Across Experiences

| Component | Used In | Specification |
|-----------|---------|--------------|
| **StatusPill** | E2, E3, E4 | green="מגיע" / amber="ממתין" / olive="לא מגיע" · Heebo 600 12px · pill shape |
| **GoldCTA** | All experiences | bg #C5A46D · white text Heebo 600 · full-width mobile · 56px height · rounded-full |
| **CircularProgressArc** | E2, E3 | SVG circle, stroke #C5A46D, track #F6F1E8 · center number Frank Ruhl Libre 900 gold |
| **GuestCard** | E3, E4 (mobile) | cream bg, 16px radius · name Heebo 600 · StatusPill · table chip · 3 action icons |
| **BlessingQuoteCard** | E2 Memory Wall | cream bg · gold " " quote marks 32px · text Heebo 400 italic · attribution right |
| **MilestoneCard** | E3 Dashboard | cream bg, gold left border · Frank Ruhl Libre countdown · Heebo label · warm CTA |
| **FilterChipRow** | E3, E4 | chips with counts · active state: gold bg white text · horizontal scroll on mobile |
| **WarmAlertCard** | E3 Dashboard | amber tint bg · warm conversational text · action button · max 3 visible |
| **PhoneMockup** | E4 WhatsApp | realistic phone frame · WhatsApp green bubble · preview of message content |
| **OrnamentalDivider** | E1, E2, E3 | thin gold line with ornamental center element |
| **BotanicalIllustration** | E1 hero bg, E2 survey, E3 onboarding | olive branches + white flowers, sage/cream tones |
| **TableNumberChip** | E4 | gold bg/text · "שולחן X" · small pill · absent when unassigned |

---

# PART 6 — DESIGN LIBRARY SUMMARY

Full library: `ai-os/design/experiences/E5-design-system/E5-DESIGN-SYSTEM.md`
Full memory: `ai-os/design/memory/design-memory.md` (Version 3)

## Key Design Decisions (Cross-Experience)

1. Frank Ruhl Libre 900 for all emotional number reveals (countdown, RSVP count, time capsule)
2. Heebo for all data, labels, body text — never Heebo for hero headlines
3. Ivory/cream as default backgrounds — never pure white in the product
4. Gold CTAs throughout — never green, never blue
5. Full RTL, `dir="rtl" lang="he"` from root element
6. Mobile-first for guest/couple; desktop-first for admin
7. Personalized greeting ("שלום [שם]") as the first element every authenticated user sees
8. Photography for emotional peaks; botanical illustration for form-heavy screens
9. Blurred previews for mystery states (time capsule, locked content)
10. Wedding Day Mode = complete UI override when `daysLeft === 0`

---

# PART 7 — INTELLIGENCE FINDINGS

## 5 Highest-Value Insights from Design Sprint

### 1 — The Time Capsule is the True Differentiation
No competitor offers a time capsule. It creates a one-year engagement hook — the couple returns to the product on their anniversary, long after the wedding. This is the most strategically valuable feature in the product. Its design must be treated as the product's most precious screen.

### 2 — Live Name Preview is the Product's Sales Pitch in 3 Seconds
When the couple types their names during onboarding and sees "חתונת ענבל ונדב" appear in Frank Ruhl Libre gold italic — that is the moment they understand what the product is. No homepage copy, no feature list, no pricing page can replace that 3-second demo. It must be zero-latency.

### 3 — Brand Coherence is the Competitive Moat
The RSVP page, the gallery, the dashboard, the admin panel, the landing page — they all feel like the same product. This is rare in the Israeli wedding market, where most tools feel like disconnected features from different companies. Coherence is not a design nice-to-have; it is a retention driver and a word-of-mouth driver.

### 4 — The Survey is a Retention and Referral Mechanism
A survey that returns a blessing to the couple generates two outcomes: (a) the couple gets a heartfelt message, (b) the guest feels they gave something meaningful. Both outcomes increase brand affinity. The survey design — "thank-you first, questions second, blessing last" — is designed to maximize both completion rate and emotional payoff.

### 5 — Admin Design is a Sales Tool
Couples sometimes share their admin dashboard with family members or coordinators. A beautiful admin panel creates trust signals. The admin experience design has indirect but real commercial value. The warm ivory sidebar, personalized greeting, and couple photo on event cards all serve retention as much as usability.

---

# PART 8 — IMPLEMENTATION COMPLEXITY

## Engineering Effort Estimate

| Experience | Screens | Frontend Complexity | Backend Dependencies | Effort |
|---|---|---|---|---|
| E2 RSVP (Wave 1) | 6 | Low (already exists, needs redesign) | None new | 3 days |
| E2 Gallery + Memory | 3 | Medium | Supabase storage (exists) | 2 days |
| E2 Survey | 1 | Low | New survey table | 1 day |
| E2 Time Capsule | 1 locked + 1 unlock | Medium | New capsule table, cron unlock | 3 days |
| E2 Memory Wall | 1 | Medium | Mixed content types API | 2 days |
| E3 Onboarding | 5 | Medium | Event creation flow | 3 days |
| E3 Dashboard (above+below fold) | 2 | Medium | briefing API already exists | 2 days |
| E3 Checklist | 1 | Low | Task API exists | 1 day |
| E3 Guest Center | 1 | Low | Guest API exists | 1 day |
| E3 Wedding Day Mode | 1 | Low | daysLeft already calculated | 0.5 days |
| E3 Post-Event | 1 | Low | daysLeft < 0 early return | 0.5 days |
| E4 Guest Management | 1 | Medium | Filter, search, pagination | 2 days |
| E4 Seating | 1 | High | Drag-and-drop, floor plan render | 4 days |
| E1 Marketing | 4 | Low-Medium | Static + registration form | 3 days |

**Total estimated frontend implementation: ~28 engineering days**
(Assumes one senior frontend engineer with Next.js + Tailwind experience)

---

# PART 9 — SUGGESTED IMPLEMENTATION ORDER

## Priority Tiers

### Tier 1 — Ship First (Highest Revenue Impact, Lowest Risk)
1. **E2 RSVP Redesign (Wave 1)** — already designed, Wave 1 knowledge artifacts complete, highest guest-facing frequency
2. **E3 Onboarding** — first experience for every new couple, directly affects trial conversion
3. **E1 Registration Page** — breaks the funnel if it feels generic after the landing page
4. **E3 Dashboard (above-fold hero)** — most-seen screen for active couples

### Tier 2 — Ship Next (High Value, Medium Effort)
5. **E3 Wedding Day Mode** — 0.5 day effort, disproportionate emotional value on the most important day
6. **E2 Gallery + Memory Upload** — existing functionality needs redesign to match new brand standard
7. **E4 Guest Management table** — admin daily workflow, current version functional but not premium
8. **E3 Guest Center + Checklist** — builds on existing APIs, low effort

### Tier 3 — Complete the Portfolio (Medium Value, Various Effort)
9. **E2 Time Capsule** — unique feature, medium effort, long-tail engagement value
10. **E2 Post-Event Survey + Memory Wall** — post-event engagement
11. **E4 Seating** — high effort, existing feature needs redesign
12. **E3 Post-Event Dashboard** — low effort, completes the daysLeft state machine
13. **E1 Landing Page** — marketing redesign affects acquisition, not retention
14. **E1 Pricing** — pricing page redesign after core product is live

---

# PART 10 — RISKS & DEPENDENCIES

## Technical Risks

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Time Capsule unlock cron reliability | Medium | High | Test anniversary trigger in staging with backdated dates |
| Seating drag-and-drop mobile | High | Medium | Desktop-only v1, mobile seating needs separate design |
| Live name preview latency | Low | High | No debounce, `onChange` → instant state update |
| RTL + masonry layout | Medium | Low | Test CSS columns RTL in all browsers |
| Old RSVP tokens breaking on redesign | Low | Critical | Keep URL structure identical, only redesign UI layer |

## Design Dependencies

| Dependency | Blocks | Status |
|---|---|---|
| Time Capsule unlock screen | E2 complete flow | ⏳ Not yet designed |
| Onboarding guest import step | E3 complete onboarding | ⏳ Not yet designed |
| Mobile seating pattern | E4 complete seating | ⏳ Not yet designed |
| Tablet responsive layouts | Full responsive | ⏳ Not yet designed |
| Empty state screens | All experiences | ⏳ Not yet designed |

---

# PART 11 — TIMELINE

## Recommended Implementation Timeline (post-CEO approval)

```
Week 1-2:   E2 RSVP Redesign (Wave 1) + E1 Registration
Week 3-4:   E3 Onboarding + E3 Dashboard Hero
Week 5:     E3 Wedding Day Mode + E3 Post-Event + E3 Guest Center + Checklist
Week 6-7:   E2 Gallery + Memory Upload + Survey
Week 8-9:   E4 Guest Management + E4 WhatsApp Center rebuild
Week 10-11: E2 Time Capsule + Memory Wall
Week 12:    E4 Seating redesign
Week 13-14: E1 Landing Page + Pricing redesign
Week 15:    QA, regression testing, mobile testing
Week 16:    Staged rollout + monitoring
```

**Total: 16 weeks to complete full portfolio implementation**
(Assumes 1 senior frontend engineer + part-time backend support)

---

# PART 12 — WHAT IS STILL NOT DESIGNED

The following screens are identified as needed but not yet designed. They are outside the Design Sprint completion criteria but must be designed before their containing flow can be fully implemented.

| Screen | Experience | Priority | Why Not Yet Designed |
|--------|-----------|----------|---------------------|
| Time Capsule — Unlock Celebration | E2 | P0 | Separate wave required (most emotional screen) |
| Onboarding — Guest Import Step | E3 | P1 | Step 4 of 5 onboarding flow |
| Memory Upload — Success State | E2 | P1 | Post-upload confirmation |
| Survey — Thank You Confirmation | E2 | P2 | Post-survey state |
| Mobile Seating (tap-to-assign) | E4 | P2 | Different pattern than desktop drag-and-drop |
| Login Page | E1 | P3 | Existing users returning |
| Empty States (6 screens) | All | P2 | Zero-state for each main section |
| Error Boundaries (3 screens) | All | P2 | Network errors, not-found states |
| Tablet Responsive Layouts | All | P3 | Between mobile and desktop |

**Recommendation:** These 15 remaining screens can be designed in parallel during Wave 3 (first 4 weeks of implementation), so implementation and design can proceed in parallel for the approved screens while Wave 3 screens are completed.

---

# PART 13 — CEO APPROVAL REQUEST

## What Is Being Presented

✅ 30 approved screens across 4 experiences + 1 design system
✅ 12 complete user flows
✅ 5 experience design reviews
✅ 5 decision logs (32 total decisions)
✅ Design Memory v3 (permanent pattern library)
✅ Experience Intelligence reports (5 experiences)
✅ Component library (12 reusable components)

## What Is Being Requested

**1. Approve the Warm Romantic design language as the confirmed, permanent visual identity for all 5 experiences.**

**2. Approve the complete portfolio above as the implementation target.**

**3. Confirm implementation order: begin with Tier 1 (RSVP + Onboarding + Registration + Dashboard) while completing Wave 3 remaining screens in parallel.**

**4. Confirm: no screen may be implemented that does not have a Stitch-approved design.**

---

## Design Sprint Status: COMPLETE ✅
## Implementation Gate: ACTIVE — Awaiting CEO Approval
## Next Step: CEO review → approve → Implementation Roadmap

---

*Executive Design Presentation | רגע לפני | Chief of Staff | 2026-06-27*
*Design Sprint Duration: 2 sessions | Screens Approved: 30 | Knowledge Artifacts: 18 documents*
