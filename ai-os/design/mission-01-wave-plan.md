# Mission 1 — Product-First Wave Plan
## Transform רגע לפני into Israel's most premium wedding platform
## Chief of Staff | 2026-06-26

---

> "Components and screens are implementation details.
> The Wave is defined by the customer experience and the business outcome."

---

## The Business Mission

Turn "רגע לפני" into the most premium, emotionally engaging,
and beautifully designed wedding management platform in Israel.

This is not a redesign project.
This is a product transformation.

---

---

# WAVE 1
## "הרגע שבו מישהו מרגיש שהוא מוזמן"
### The Moment Someone Feels Truly Invited

---

### 1. What business problem are we solving?

Every couple sends their RSVP links to 100–400 guests.
Each of those guests forms an impression — of the couple, and of the platform.

Today, that impression is: *"I filled out a form."*

The opportunity: if a guest opens the RSVP and thinks *"וואו, כמה יפה"* —
they tell people. The couple gets compliments. They feel proud of their choice of platform.
Word-of-mouth begins at the moment of beautiful design, not at the moment of signup.

**The business problem: the product's highest-reach surface is not premium.**

---

### 2. Which stage of the customer journey?

**Guest Journey — The Moment of Invitation**

```
[Couple] → sends WhatsApp/SMS →
[Guest opens link] ← this is Wave 1
[Guest responds RSVP]
[Guest sees confirmation]
[Guest arrives on wedding day]
```

This is the only moment in the product where the audience is not the paying customer.
It is the product's widest reach — every guest, at every wedding, every time.

---

### 3. Which emotions are we trying to create?

| Moment | Target Emotion |
|--------|---------------|
| Page loads | "This is beautiful. This couple has good taste." |
| Sees their name | "This was made for me." Feeling of being personally invited. |
| Makes their choice | "This felt meaningful, not mechanical." |
| Confirmed | "I'm excited. I want to be there." |
| Declined | "I feel respected. I still think well of the couple." |
| Sees table number | A small delight — like finding your seat card at a real event. |

---

### 4. What measurable business outcome do we expect?

| Metric | Current | Target (30 days post-release) |
|--------|---------|-------------------------------|
| RSVP Completion Rate | ~85% | 90%+ |
| Guest-to-Couple compliments (qualitative) | Occasional | Consistent |
| Couple NPS | ≥ 8 | ≥ 8.5 |
| Unsolicited "how do you have this?" moments | Low | Increasing trend |

**Primary outcome:** Guests complete RSVP feeling good about the experience.
**Secondary outcome:** Couples are proud to share the link — social signal for brand.

---

### 5. Which screens are affected?

```
/rsvp/[token]                  — RSVP page (main)
  States:
  A. Loading
  B. Form (before choice)
  C. Form (after YES — showing sub-options)
  D. Confirmed (attending)
  E. Declined (not attending)
  F. Already responded
  G. Error / invalid link
```

That is the complete scope of Wave 1.
One route. Seven states. All must be designed.

---

### 6. Which components are required?

```
New or redesigned:
  BrandMark         — "רגע לפני" mark, positioned for mobile
  EventHero         — couple name + date + venue display
  GuestGreeting     — personalized invitation text
  ChoiceCards       — confirm / decline selection (large, premium)
  GuestCountPicker  — 1–8 selector
  MealChips         — 4 meal options
  SubmitButton      — with loading state
  ConfirmHero       — celebration header (confirmed state)
  TableReveal       — table number display (a premium moment)
  ActionButton      — calendar + waze variants
  DeclineHero       — gracious decline header
  AlreadyHero       — "you've already responded" state
  ErrorState        — invalid link, warm language

All states:
  Loading, Default, Selected, Hover, Pressed, Disabled,
  Submitting, Success, Error, Empty, Already-done
```

---

### 7. Which Design Pack is needed?

**Wave 1 Design Pack** — [`ai-os/design/wave-01-design-pack.md`](wave-01-design-pack.md)

Contains: User Journey Map, Design Dependency Analysis,
3 complete Stitch Prompts (Direction A / B / C).

Status: ✅ READY — awaiting CEO to run in Stitch and return results.

---

### 8. Which Stitch prompts are required?

All 3 are ready in Wave 1 Design Pack:

```
Direction A — Luxury Editorial    (think: high-end wedding magazine)
Direction B — Modern Minimal      (think: Apple clarity)
Direction C — Warm Romantic       (think: physical paper invitation) ← CoS recommends
```

CEO chooses one direction → design is finalized → then Implementation Plan is created.

---

### 9. Which implementation work follows?

After Stitch design is approved:

```
File: src/app/rsvp/[token]/page.tsx  (current: 653 lines)

Work:
1. Redesign the Shell component (wrapper, background, fonts)
2. Redesign the Form state (ChoiceCards + sub-options layout)
3. Redesign the Confirmed state (ConfirmHero + TableReveal + actions)
4. Redesign the Declined state (gracious, warm, no empty space)
5. Add the Already Responded state (currently rudimentary)
6. Redesign the Error state (branded, not generic)
7. Redesign the Loading state (branded)

Zero behavior changes.
Zero API changes.
Zero route changes.
Visual layer only.
npx tsc --noEmit must pass.
```

---

### 10. How will success be measured after release?

```
Week 1:
  [ ] No regression in RSVP completion rate
  [ ] Zero TypeScript errors
  [ ] Zero production incidents
  [ ] All 7 states render correctly on iPhone SE, 14, Plus + Android

Week 2-4:
  [ ] CEO (Dvir) actively monitors for "wow" reactions from couples
  [ ] Customer Success logs any compliments about the RSVP experience
  [ ] Analytics: time-on-RSVP-page (target: down or stable — faster = better UX)

Month 1:
  [ ] NPS trend — any improvement?
  [ ] Couple feedback themes (watch for "guests loved it")
  [ ] Company Brain entry: any new patterns from this release?
```

---

---

# WAVE 2
## "הבית שהם חוזרים אליו כל יום"
### The Home They Come Back to Every Day

---

### 1. What business problem are we solving?

The couple dashboard is visited 3–7 times per week during peak planning.
The hero (dark luxury) is already premium.
But below the fold — the content area — drops to utilitarian quality.

The emotional temperature collapses after the hero.
Couples go from *feeling special* to *feeling managed*.

A couple who loves their dashboard checks it daily.
A couple who tolerates it checks it when they have to.

**Business problem: the most-used screen loses its premium feeling after the first scroll.**

---

### 2. Which stage of the customer journey?

**Couple Journey — The Planning Phase (daily use, weeks 1–16)**

```
Couple logs in
→ Hero (already good)
→ Scrolls down ← this is Wave 2
→ Sees their data
→ Takes action (or doesn't)
→ Leaves
```

This is not one moment — it is every session, for months.

---

### 3. Which emotions are we trying to create?

| Moment | Target Emotion |
|--------|---------------|
| First scroll past hero | Continuation of premium feeling, not a drop |
| Seeing readiness score | Pride when high, gentle motivation when low |
| Seeing alerts | "My assistant is watching out for me" not "warnings" |
| Seeing vendor list | "My team is coming together" |
| Taking an action | "That was easy. I trust this." |
| Leaving the app | "I feel organized. I'm in control." |

---

### 4. What measurable business outcome do we expect?

| Metric | Current | Target |
|--------|---------|--------|
| Sessions per week per couple | ~4 | ~5+ |
| Average session depth (scrolls) | Unknown | Increase |
| Task completion in-session | Unknown | Increase |
| 30-day retention | Unknown | Increase |
| Couple NPS after Wave 2 | ≥ 8.5 | ≥ 9 |

---

### 5. Which screens are affected?

```
/couple/[token]                — main dashboard (below-the-fold only)
  Sections:
  A. Personal Wedding Assistant card (already exists, needs redesign)
  B. Updates Center (alerts) — redesign emotional language + visual
  C. Readiness Score / Health card — redesign as celebration, not metric
  D. Countdown + Stats section — already good, minor polish
  E. Vendors section — redesign as "team", not checklist
  F. Tasks section — premium feel, completion celebration
  G. RSVP summary — clean, emotional
  H. Budget card — clean, trustworthy
  I. Daily tip (F8) — surface it better
  J. Empty states for each section — currently missing warmth
  K. Stage-aware messaging (200 days vs 14 days voice) — content design
```

---

### 6. Which components are required?

```
Redesigned:
  SectionHeader       — consistent premium section label system
  AlertCard           — from clinical to warm (3 levels: urgent/watch/celebrate)
  ReadinessHero       — score as celebration, not number
  VendorTeamCard      — vendor as "team member joining", not checklist item
  TaskRow             — with satisfying completion interaction
  RSVPSummaryCard     — visual, emotional (not just numbers)
  EmptyState          — warm, personalized, with a suggested action
  StageVoice          — content system: different copy at each stage

New:
  ProgressMilestone   — celebrate 25% / 50% / 75% / 100% completion
  DailyTipCard        — surfaced as a gift, not a footnote
```

---

### 7. Which Design Pack is needed?

Wave 2 Design Pack — to be created after Wave 1 ships.

---

### 8–10.

To be defined after Wave 1 Post Release Review.

---

---

# WAVE 3
## "הרגע שהזוג אומר: 'אנחנו מוכנים'"
### The Moment a Couple Says "We're Ready"

---

### 1. What business problem are we solving?

~35% of couples who start onboarding don't complete it.
They don't see the value fast enough.
The onboarding feels like setup, not the beginning of a journey.

A couple who completes onboarding becomes a daily user.
A couple who drops off at step 3 may never return.

**Business problem: the product's activation gate is not inspiring enough to walk through.**

---

### 2. Which stage of the customer journey?

**Couple Journey — First 10 Minutes (activation)**

```
Couple signs up
→ Arrives at onboarding wizard ← this is Wave 3
→ 7 steps: date, venue, guests, invitation, RSVP, budget, manager
→ Completes → lands on dashboard
→ (or drops off)
```

This is the highest-leverage retention moment in the product.

---

### 3. Which emotions are we trying to create?

| Moment | Target Emotion |
|--------|---------------|
| Step 1 loads | "This feels special. This is the beginning of something." |
| Progress through steps | "Each step feels meaningful, not bureaucratic." |
| Step completion | Micro-celebration. "I did something important." |
| Final step | "We are ready. This is real." |
| Land on dashboard | "Wow. This is ours." |

---

### 4. What measurable business outcome do we expect?

| Metric | Current | Target |
|--------|---------|--------|
| Onboarding completion rate | ~65% | ≥ 80% |
| Time to first dashboard visit | Unknown | Decrease |
| 7-day retention (couples who onboarded) | Unknown | Increase |

---

### 5. Screens affected

```
/couple/[token]/onboarding     — 7-step wizard
  Each step needs: premium header, progress indicator,
  completion state, transition to next step
```

---

### 6–10.

To be defined after Wave 2 Post Release Review.

---

---

# WAVE 4
## "המוצר מרגיש כמו מוצר אחד"
### The Product Feels Like One Product

---

### 1. What business problem are we solving?

Power users navigate beyond the main dashboard.
Today, each sub-page was built at a different time with different visual decisions.

The couple visiting Guests → Checklist → Seating → Vendors
experiences 4 different products.

Trust erodes when a product feels inconsistent.
Premium requires coherence across the entire experience.

**Business problem: the product doesn't feel like one designed thing — it feels assembled.**

---

### 2. Which stage of the customer journey?

**Couple Journey — Power User Phase (weeks 4–16)**

```
Couple has been using the product for a while
→ Explores sub-pages: guests, checklist, vendors, seating, gifts
← this is Wave 4
→ Manages their wedding in detail
→ Refers friends / renews / leaves reviews
```

---

### 3. Which emotions are we trying to create?

| Moment | Target Emotion |
|--------|---------------|
| Navigate from dashboard to sub-page | Seamless. "I'm still in the same place." |
| Use any sub-page | "This was designed for me." |
| Return to dashboard | "Everything is connected." |
| Finish planning | "This product understood what I needed." |

---

### 4. What measurable business outcome do we expect?

| Metric | Current | Target |
|--------|---------|--------|
| Sub-page usage per session | Unknown | Increase |
| Feature adoption (checklist/vendors/seating) | Low | +20% |
| Referral rate | Unknown | +10% |
| "Felt like one product" sentiment | Not measured | Positive trend |

---

### 5. Screens affected

```
/couple/[token]/guests         — Guest Center
/couple/[token]/checklist      — Wedding Checklist
/couple/[token]/vendors        — Vendor Manager
/couple/[token]/seating        — Seating (link to admin)
/couple/[token]/gifts          — Gift Center
/couple/[token]/requests       — Help / Requests
/couple/[token]/service        — Service Center
```

All need: consistent header pattern, consistent empty states,
consistent loading states, consistent action patterns.

---

### 6–10.

To be defined after Wave 3 Post Release Review.

---

---

## Wave Summary

| Wave | Business Goal | Journey Stage | Primary Emotion | Scope |
|------|--------------|--------------|----------------|-------|
| **1** | Convert guest reach into brand love | Guest — invitation moment | Excitement, honored, trust | `/rsvp/[token]` — 7 states |
| **2** | Make the daily home feel worth coming back to | Couple — daily planning | Pride, calm, momentum | `/couple/[token]` — below fold |
| **3** | Turn the beginning into a beginning | Couple — activation | Hope, excitement, confidence | `/couple/[token]/onboarding` |
| **4** | Make the product feel like one product | Couple — power user | Trust, mastery, coherence | All sub-pages |

---

## Current Status

```
Wave 1: DESIGN INTELLIGENCE COMPLETE → awaiting CEO implementation approval
  ✅ Stitch Design — Direction C (Warm Romantic) — Stitch Project 7980168406882022650
  ✅ Design Review — 5 screens reviewed, 11/11 criteria pass (4 implementation notes)
  ✅ Design Decision Log — ai-os/design/decisions/wave-01-decisions.md (8 decisions)
  ✅ Design Memory — ai-os/design/memory/design-memory.md (first entry)
  ✅ Design Library — ai-os/design/library/layout-patterns.md (3 patterns)
  ✅ Experience Intelligence — ai-os/design/intelligence/wave-01-intelligence.md
  ⏳ CEO Approval — pending
  ⏳ Implementation Plan — pending approval
  ⏳ Implementation — pending
Wave 2: Defined → starts after Wave 1 Post Release Review
Wave 3: Defined → starts after Wave 2 Post Release Review
Wave 4: Defined → starts after Wave 3 Post Release Review
```

---

*Mission 1 Wave Plan | Chief of Staff | Product-First Framework | 2026-06-26*
