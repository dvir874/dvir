# Product Design Master Plan
## רגע לפני — Complete Visual & UX Redesign
## Design Sprint Mode | Chief of Staff | 2026-06-26

---

> "When a user moves from the Landing Page to the RSVP to the Couple Dashboard to Wedding Mode
> to the Gallery, it should feel like one continuous premium experience —
> designed by one world-class team, with one visual language,
> one interaction philosophy, and one emotional vision."

---

## The Mission

This is not a redesign project.

This is a product unification project.

The objective: every experience in "רגע לפני" — from the first marketing page
a potential customer sees, to the post-wedding survey a couple fills out —
must feel like it belongs to one product, designed by one team, at one standard of quality.

---

## Product Audit — Complete Route Map

**Total routes discovered:** 52
**Grouped into:** 5 Experiences + 1 Design System

---

## Scope Control — What Gets Designed

| Category | Routes | Design Priority |
|----------|--------|----------------|
| Guest Experience | 7 screens | 🔴 P0 — Highest reach (100–400 guests per wedding) |
| Couple Experience | 13 screens | 🔴 P0 — Daily users, retention driver |
| Marketing Experience | 16 screens | 🟠 P1 — Acquisition, first impression |
| Admin Experience | 14 screens | 🟡 P2 — Internal team, power users |
| Special Flows | 3 screens | 🟡 P2 — Occasional, but emotionally significant |
| Design System | 1 screen (internal) | 🟢 P3 — Enabler of all other design |

---

---

# EXPERIENCE 1
## Marketing Experience
### "הרגע שמישהו מחפש ומוצא אותנו"

---

### Screens

| Screen | Route | Status |
|--------|-------|--------|
| Landing Page | `/` | Exists — redesign needed |
| Pricing | `/pricing` | Exists — redesign needed |
| Features | `/features` | Exists — redesign needed |
| FAQ | `/faq` | Exists — redesign needed |
| How It Works | `/how-it-works` | Exists — redesign needed |
| Get a Quote | `/quote` | Exists — redesign needed |
| Themes Gallery | `/themes` | Exists — redesign needed |
| Invitation Gallery | `/invitations` | Exists — redesign needed |
| Single Invitation | `/invitations/[slug]` | Exists — redesign needed |
| Start / Register | `/start` | Exists — redesign needed |
| Payment Success | `/payment/success` | Exists — redesign needed |
| Referral Landing | `/ref/[code]` | Exists — redesign needed |
| Event Type SEO | `/event-type/[category]` | Exists — SEO, design needed |
| City SEO Pages | `/wedding-city/[city]` | Exists — SEO, design needed |
| Demo | `/demo` | Exists — redesign needed |
| Dashboard Demo | `/dashboard-demo` | Exists — redesign needed |

---

### Business Goal

Convert Israeli couples who are searching for a wedding management platform
into paying customers.

The product is competing with: WhatsApp groups, Excel spreadsheets, and 2–3 local competitors.
The differentiator is: premium feel, beautiful design, emotional intelligence.

If the marketing site does not immediately feel more premium than the competition,
the couple will not register. A beautiful product that markets itself poorly loses to an average product that markets itself well.

---

### Target Users

**Primary:** Israeli couples, ages 25–35, recently engaged or in early planning
**Secondary:** Wedding planners evaluating tools for their clients
**Tertiary:** Parents of couples, often involved in the initial research

**Device split:** Mobile 70% (Instagram/WhatsApp referrals), Desktop 30% (serious research)

---

### Customer Journey

```
Instagram ad / Google / Friend recommendation
    ↓
Landing page — "Is this real? Is it premium?" (5 seconds)
    ↓
Features / How It Works — "Can it actually do what I need?"
    ↓
Themes / Gallery — "How will MY wedding look?"
    ↓
Pricing — "Can we afford this? Is it worth it?"
    ↓
Start / Quote — "Let's register."
    ↓
Payment Success — "We're in."
```

---

### User Emotions (by stage)

| Stage | Target Emotion |
|-------|---------------|
| Landing page — first 5 seconds | "This is different. This feels premium." |
| Seeing the demo | "This is exactly what I was looking for." |
| Themes / Gallery | "I can imagine OUR wedding here." |
| Pricing | "This is worth it. It's not expensive — it's an investment." |
| Registering | "I feel like I'm starting something beautiful." |
| Payment success | "We made the right choice." |

---

### Pain Points (current state)

- Landing page: sections feel independent, not like a narrative
- Pricing: lacks emotional justification — reads as a table, not a value proposition
- Themes / Gallery: shows potential but doesn't feel immersive
- Mobile experience: multiple sections break or compress awkwardly
- No clear emotional climax — the user never reaches a "wow" moment before registering
- Hebrew copy is functional but not premium — reads like a service, not an experience

---

### Desired Outcome

A couple lands on the site and within 90 seconds:
1. Understands what the product does
2. Feels it is premium and trustworthy
3. Sees themselves using it for their wedding
4. Takes action (register, book demo, or call)

---

### Business Value

Every 1% improvement in landing-to-register conversion directly impacts monthly revenue.
With 50–200 visitors/day, improving conversion from 3% to 5% = 40–60 additional trials/month.

---

### Success Metrics

| Metric | Baseline | Target |
|--------|---------|--------|
| Landing → Register conversion | Unknown | Measure, then +20% |
| Time on landing page | Unknown | Increase |
| Bounce rate | Unknown | Decrease |
| Quote form completions | Unknown | Increase |
| Demo booking rate | Unknown | Increase |

---

### Design Language

**Direction A — Luxury Editorial:**
Think: high-end Israeli lifestyle magazine. Full-bleed photography. Serif headlines. White space as a design element. Premium without being cold.

**Direction B — Modern Minimal:**
Think: Notion meets Figma meets Israeli startup. Clean, confident, functional. Shows the product is modern and serious.

**Direction C — Warm Romantic:**
Think: the product itself, extended to the marketing site. Same cream palette, same Frank Ruhl Libre, same emotional warmth. Coherent brand from the first impression.

**CoS Recommendation: Direction C.**
The marketing site should feel like the product's home. If the couple has already seen a demo or an RSVP, the marketing site should feel familiar and consistent. Direction C creates brand coherence from first impression to daily use.

---

### Interaction Principles

- Desktop: full-scroll narrative experience. One thought per viewport. Progressive disclosure.
- Mobile: card-based sections. Large tap targets. No horizontal scroll.
- Animations: entrance animations (fade up) as the user scrolls. Never distracting.
- CTAs: always gold, always Hebrew, always specific ("התחילו עכשיו" not "Submit")
- Social proof: testimonials must feel real — real couple names, specific quotes, not generic 5-star reviews

---

### Accessibility Notes

- Contrast ratios: all text on cream must meet WCAG AA (4.5:1)
- Font size: body minimum 16px on desktop, 17px on mobile
- CTA touch targets: minimum 44px height
- Language: `lang="he" dir="rtl"` on all pages

---

### Mobile Priority: HIGH
### Desktop Priority: MEDIUM-HIGH

---

---

# EXPERIENCE 2
## Guest Experience
### "הרגע שאתה מרגיש שמוזמנים אותך"

---

### Screens

| Screen | Route | States | Status |
|--------|-------|--------|--------|
| Mini Website / Invitation | `/event/[id]` | 1 | Exists — redesign needed |
| RSVP | `/rsvp/[token]` | 7 | Design complete (Wave 1) |
| Photo Gallery | `/gallery/[token]` | 3 (loading, empty, populated) | Exists — redesign needed |
| Memory Upload | `/memory/[token]` | 7 (loading, name, choose, upload, audio, capsule, done) | Exists — redesign needed |
| Memory Wall | `/memory/[token]/wall` | 3 (loading, empty, populated) | Exists — redesign needed |
| Time Capsule | `/couple/[token]/capsule` | 3 (locked, countdown, open) | Exists — redesign needed |
| Post-Event Survey | `/survey/[token]` | 4 (loading, form, done, error) | Exists — redesign needed |

---

### Business Goal

Every guest who experiences this product forms an impression of both the couple and the platform.

The RSVP page reaches 100–400 people per wedding.
The gallery is shared with family after the wedding.
The memory upload is a viral moment — guests film themselves, send blessings, share.

This is the product's highest-reach surface.
Word-of-mouth starts here.

---

### Target Users

**Primary:** Wedding guests — diverse age range (18–75), diverse tech literacy, mobile-only
**Secondary:** Parents of the couple — may forward the gallery link to extended family
**Tertiary:** The couple themselves — they view the gallery and memory wall

---

### Customer Journey

```
[Guest] receives WhatsApp/SMS with link
    ↓
Mini Website — "Oh, what's this? What a beautiful invitation."
    ↓
RSVP — "I'm confirming my attendance. I have a table!"
    ↓
[Wedding Day]
    ↓
Memory Upload — "I want to send them a blessing and some photos."
    ↓
Gallery — "I can see all the photos from the wedding!"
    ↓
Memory Wall — "I can see all the messages everyone left."
    ↓
[Months later]
    ↓
Time Capsule — "It's been a year. Let's open the messages."
    ↓
Survey — "The organizers want feedback. This took 30 seconds."
```

---

### User Emotions

| Screen | Target Emotion |
|--------|---------------|
| Mini Website | "This couple has taste. I'm excited." |
| RSVP — arriving | "I'm invited to something beautiful." |
| RSVP — form | "This feels meaningful, not mechanical." |
| RSVP — confirmed | "I'm really going. I have a seat." |
| RSVP — declined | "They understand. I still feel close to them." |
| Memory Upload — choosing | "I want to contribute something special." |
| Memory Upload — done | "I gave them something they'll treasure." |
| Gallery | "This is beautiful. I want to share this." |
| Time Capsule | "This is magical. Reading this brought me to tears." |

---

### Pain Points (current state)

- Mini Website: exists but not premium — doesn't create the "wow" before the RSVP
- Gallery: functional but not immersive — doesn't create the post-wedding emotional experience
- Memory Upload: the flow works but lacks the ceremony of the moment (guests feel like they're filling a form)
- Memory Wall: exists but not shareable, not visually beautiful
- Time Capsule: exists but feels like a feature, not a ritual
- Survey: generic, no emotional connection to the experience
- All screens: inconsistent design — each was built at a different time

---

### Desired Outcome

A guest who goes through this full experience (invitation → RSVP → memory upload → gallery → capsule) should:
1. Remember the product by name
2. Mention it to their own family when they get married
3. Feel the couple's wedding was organized at a premium level

---

### Business Value

Every wedding creates 100–400 brand impressions through the guest experience.
With 50 active weddings, that is 5,000–20,000 brand impressions per month — without any marketing spend.

The guest experience is the product's primary organic marketing channel.

---

### Success Metrics

| Metric | Baseline | Target |
|--------|---------|--------|
| RSVP completion rate | 85% | 90%+ |
| Memory upload rate (% of guests who upload) | Unknown | Measure, then +15% |
| Gallery views per event | Unknown | Measure, then +20% |
| Survey completion rate | Unknown | 40%+ |
| Guest-to-couple compliments about design | Occasional | Consistent |

---

### Design Language

**Direction A — Luxury Editorial:** Immersive, full-bleed photography, editorial typography. Feels like a luxury wedding magazine dedicated to this couple.

**Direction B — Modern Minimal:** Clean, app-like, fast. Feels like a premium consumer app (think: Instagram Stories quality).

**Direction C — Warm Romantic:** Paper invitation, cream backgrounds, Frank Ruhl Libre, gold accents. Already validated in Wave 1. Feels like being held by the couple's taste.

**CoS Recommendation: Direction C.**
Already validated for the RSVP (Wave 1). The entire guest experience must be visually consistent with the RSVP — same palette, same fonts, same emotional warmth.

---

### Interaction Principles

- Zero navigation chrome on all guest screens — single-purpose, zero distraction
- No authentication, no account creation
- Touch targets: 56px minimum (fingers, not pointers)
- Loading states: always branded — never blank white
- Error states: warm, human language — no technical errors ever shown to guests
- Animations: entrance only — no ongoing animations that distract from content
- Share: native share sheet on mobile (navigator.share) for all shareable moments

---

### Accessibility Notes

- Text on cream must meet WCAG AA
- All media uploads have accessible alternatives
- Audio blessing: visual waveform feedback during recording
- No time-limited interactions (guests may be elderly or have motor limitations)

---

### Mobile Priority: CRITICAL (guests access 95%+ on mobile)
### Desktop Priority: LOW (view-only for gallery, no key actions)

---

---

# EXPERIENCE 3
## Couple Experience
### "הבית שהם חוזרים אליו כל יום"

---

### Screens

| Screen | Route | States | Status |
|--------|-------|--------|--------|
| Dashboard | `/couple/[token]` | 4 (planning / wedding day / post-event / empty) | Exists — redesign needed |
| Onboarding | `/couple/[token]/onboarding` | 7 steps + completion | Exists — redesign needed |
| Journey / Timeline | `/couple/[token]/journey` | 2 (timeline, empty) | Exists — redesign needed |
| Guest Center | `/couple/[token]/guests` | 3 (populated, empty, loading) | Exists — redesign needed |
| Checklist | `/couple/[token]/checklist` | 3 (progress states) | Exists — redesign needed |
| Budget | `/couple/[token]` (tab) | 3 | Built into dashboard |
| Vendors | `/couple/[token]/vendors` | 3 | Exists — redesign needed |
| Seating | `/couple/[token]/seating` | 2 | Exists (links to admin) |
| Help / Requests | `/couple/[token]/requests` | 3 | Exists — redesign needed |
| Service Center | `/couple/[token]/service` | 2 | Exists — redesign needed |
| Print Center | `/couple/[token]/print` | 1 | Exists — redesign needed |
| Post-Wedding Recap | `/couple/[token]/recap` | 2 (loading, data) | Exists — redesign needed |
| Time Capsule | `/couple/[token]/capsule` | 3 (locked, countdown, open) | Exists — redesign needed |

---

### Business Goal

The couple is the paying customer. They use the product 3–7x per week during peak planning (weeks 4–16 before the wedding).

The product retains couples who are engaged with it. Couples who stop opening the app stop recommending it.

The goal: make the couple dashboard feel like a home, not a tool. A place they want to return to. A place that makes them feel organized, excited, and supported.

---

### Target Users

**Primary:** The couple — usually one partner leads the planning, the other checks in
**Age:** 25–35
**Device:** 75% mobile, 25% desktop
**Frequency:** Daily in final 4 weeks, 3–4x/week in months 2–5, weekly before that

---

### Customer Journey

```
Registration
    ↓
Onboarding (7 steps: date, venue, guests, invitation, RSVP, budget, manager)
    ↓
Dashboard — Hero (premium first impression of their planning home)
    ↓
Daily Planning Loop:
  Check readiness / countdown
  → See what needs attention
  → Act: manage guests / check tasks / review budget / contact vendors
  → Feel in control and proud
    ↓
4 weeks before: daily use, higher urgency
    ↓
Wedding Day: Wedding Mode (full-screen, mobile-first)
    ↓
Post-wedding: Recap + Gallery + Capsule + Survey
```

---

### User Emotions

| Stage | Target Emotion |
|-------|---------------|
| First dashboard load (post-onboarding) | "This is ours. It's beautiful. We're doing this." |
| Checking readiness daily | "We're making progress. We're going to be ready." |
| Managing guests | "I have everything under control." |
| Completing a task | "One more thing done. We're getting there." |
| Vendor confirmed | "Our team is coming together." |
| Seating completed | "We thought of everyone." |
| The night before: Wedding Mode | "It's real. Tomorrow is the day." |
| Post-wedding Recap | "Look at what we did. Look at our numbers." |
| Opening the Time Capsule (1 year later) | "I'm crying. This is the most beautiful thing." |

---

### Pain Points (current state)

- Dashboard hero: already strong. Below the fold: drops to utilitarian quality
- Onboarding: functional steps, not an emotionally significant beginning
- Guest Center: table-based, not mobile-optimized
- Checklist: works but has no celebration moments (completing a task feels like crossing a line, not achieving something)
- Vendors: exists but lacks visual polish and the "team" metaphor
- Journey / Timeline: exists but unclear role in the product
- The dashboard feels like multiple pages from different eras stitched together

---

### Desired Outcome

A couple who opens the dashboard in week 8 of planning should:
1. Immediately see where they are in their journey
2. Know what the most important next action is
3. Feel calm and organized, not overwhelmed
4. Want to share the app with their engaged friends

---

### Business Value

- Retention: a couple who opens the app daily → refers friends → reviews → testimonials
- Upsell: couples engaged with the platform are more likely to purchase premium services
- NPS: daily-use couples give significantly higher NPS scores

---

### Success Metrics

| Metric | Baseline | Target |
|--------|---------|--------|
| Sessions per week per couple | ~4 | 5+ |
| Onboarding completion rate | ~65% | 80%+ |
| Feature adoption (checklist/vendors/seating) | Low | +20% |
| Couple NPS | ≥8 | ≥9 |
| Referral rate | Unknown | +10% |

---

### Design Language

**Direction A — Luxury Editorial:**
The dashboard as a lifestyle product. Think: Headspace meets a wedding magazine. Dark luxury hero, cream content sections, editorial typography.

**Direction B — Modern Minimal:**
The dashboard as a professional planning tool. Think: Linear meets Notion meets premium SaaS. Everything is clear, fast, purposeful.

**Direction C — Warm Romantic:**
The dashboard as a scrapbook come alive. Think: warm, personal, full of their details — photos, their names, their countdown. Every section feels like it's for them specifically.

**CoS Recommendation: Hybrid of A + C.**
The hero (already strong in A) + below-the-fold in C.
The emotional warmth of C makes couples feel at home.
The dark luxury of A gives the hero the gravitas the occasion deserves.
Together they create: premium first impression → warm daily home.

This requires CEO direction. We will design all three and let the CEO choose.

---

### Interaction Principles

- Bottom navigation on mobile (max 5 tabs: Home / Guests / Checklist / Vendors / More)
- Cards over tables (mobile)
- Progressive disclosure: show what's relevant for today's stage, hide what isn't
- Celebration moments: milestone toasts at 25% / 50% / 75% / 100% readiness
- Empty states: warm, personalized, with a suggested first action
- All fixed elements: `padding-bottom: env(safe-area-inset-bottom)` — iPhone-safe
- Wedding Mode: full-screen takeover, zero planning chrome, day-of-only features

---

### Accessibility Notes

- Color is never the only signal (status uses icon + color + text)
- All interactive elements: 44px minimum touch target
- Readiness scores have text alternatives to the visual bar
- Time Capsule: emotional content, generous font sizes

---

### Mobile Priority: CRITICAL
### Desktop Priority: MEDIUM

---

---

# EXPERIENCE 4
## Admin Experience
### "הכלי שבאמצעותו אנחנו מנהלים הכל"

---

### Screens

| Screen | Route | Status |
|--------|-------|--------|
| Main Admin (multi-tab) | `/admin` | Exists — cleanup + mobile needed |
| Admin Dashboard | `/admin/dashboard` | Exists — redesign needed |
| Login | `/admin/login` | Exists — minor redesign |
| CRM | `/admin/crm` | Exists — redesign needed |
| Seating | `/admin/seating` | Exists — functional |
| Seating Print | `/admin/seating/print` | Exists |
| Gallery Management | `/admin/gallery/[eventId]` | Exists |
| Budget | `/admin/budget` | Exists |
| Gifts | `/admin/gifts` | Exists |
| Reminders | `/admin/reminders` | Exists |
| WhatsApp Center | `/admin/whatsapp` | Exists — redesign needed |
| Event Wizard | `/admin/wizard` | Exists |
| Automation | `/admin/automation` + `/admin/automations` | Exists |
| Memory Admin | `/admin/memory` | Exists |
| Client Approval | `/approval/[eventId]` | Exists |

---

### Business Goal

The admin interface is the product that the company (Dvir + team) uses every day.
It must be fast, clear, and powerful — not pretty.

However, the Admin experience is also what a client sees when Dvir shares screen or grants access.
Some admin screens (Approval, CRM) are externally visible.

Goal: a professional, fast admin experience that does not embarrass the product when shared with clients.

---

### Target Users

**Primary:** Dvir (CEO) — daily use, full access, all events
**Secondary:** Team members — limited access, specific events
**Occasional:** Clients viewing the approval screen

---

### Customer Journey

```
Daily:
  Login → Dashboard → Event selector → Active event
  → Check guest counts / RSVPs / alerts
  → Send reminders (WhatsApp)
  → Answer couple requests
  → Manage seating

Pre-wedding:
  → Print seating / guest list
  → Set up reminder automations
  → Upload event gallery
  → Confirm vendor list

Post-wedding:
  → Mark event complete
  → Trigger thank-you messages
  → Export data
  → Archive event
```

---

### User Emotions

| Stage | Target Emotion |
|-------|---------------|
| Opening admin | "I have full visibility of everything." |
| Seeing guest stats | "I know exactly what's happening." |
| Sending WhatsApp reminders | "This is fast and professional." |
| Managing seating | "This is powerful and intuitive." |
| Handling a couple's request | "I'm giving them a premium service." |

---

### Pain Points (current state)

- The main admin page is a single massive file (~3000 lines) with too many tabs
- Mobile experience is difficult — tabs overflow, tables are too wide
- No unified design system — each tab was built independently
- WhatsApp center is functional but not elegant enough for screen-sharing with clients
- Dashboard KPIs exist but lack visual organization
- The multi-event selector is good; event-specific navigation could be clearer

---

### Design Language

**For admin screens:**
**Direction A — Professional Dark:**
Dark header, sidebar navigation, data-dense cards. Think: Linear, Vercel Dashboard, Railway. Fast, powerful, unmistakably professional.

**Direction B — Clean Light:**
White/light gray, left sidebar, clear tables. Think: standard SaaS admin. Conventional but reliable.

**Direction C — Brand-Adjacent:**
Same brand fonts and colors, adapted for data density. Not as warm as the couple area, but recognizably "רגע לפני."

**CoS Recommendation: Direction A for the admin dashboard, Direction C for client-facing admin screens (Approval, CRM).**

---

### Interaction Principles

- Desktop First (this is the exception in the product — admin is desktop-first)
- Mobile: at least readable and navigable on 390px (F1 Mobile Admin from release plan)
- Data tables: sortable, searchable, with column visibility controls
- Bulk actions: select multiple guests / events / tasks
- Keyboard shortcuts for power users
- Confirmation modals for destructive actions

---

### Accessibility Notes

- Admin is internal — WCAG AA required but not the top constraint
- Color coding for status must always have a text fallback

---

### Mobile Priority: MEDIUM (functional on mobile, not primary)
### Desktop Priority: HIGH

---

---

# EXPERIENCE 5
## Shared Design System
### "שפה אחת לכל המוצר"

---

### Components

| Category | Components |
|----------|-----------|
| Navigation | Bottom Nav (mobile) · Side Nav (desktop admin) · Top Bar · Breadcrumbs · Tabs |
| Layout | Page Shell · Content Container · Section Divider · Safe Area Wrapper |
| Data Display | Cards · Tables · Charts · Stats Pills · KPI Cards · Progress Bars |
| Forms | Input · Textarea · Select · Checkbox · Radio · Toggle · Stepper · Date Picker · File Upload |
| Feedback | Toast · Alert Banner · Badge · Status Pill |
| Overlays | Modal · Bottom Sheet · Drawer · Popover · Tooltip |
| Loading States | Skeleton Screens · Spinner · Progress Indicator · Branded Loading Screen |
| Empty States | First-Use Empty · No Results · Error Recovery · Offline |
| Success States | Celebration · Confirmation · Milestone Toast · Table Reveal |
| Error States | Page Error · Inline Validation · Network Error · Auth Error |
| Actions | Primary Button · Secondary Button · Ghost Button · Icon Button · FAB |
| Typography | Heading Scale (H1–H4) · Body · Label · Caption · Meta |
| Icons | System Icons · Wedding Icons · Status Icons · Action Icons |
| Imagery | Photo treatment · Illustration style · Icon illustration · Empty state illustration |
| Animation | Entrance · Transition · Celebration · Loading · Micro-interaction |

---

### Business Goal

Without a shared design system, every new screen is built from scratch.
Every developer makes independent decisions about spacing, color, typography, and interaction.
The result is a product that looks different on every page.

With a design system, every new screen starts from a validated foundation.
Consistency is free. Speed increases. Quality is automatic.

---

### Target Users

Every developer and designer who touches the product.
Every future Stitch prompt must reference system tokens.

---

### Design Language

The design system is not a direction — it is the foundation from which all directions are built.

**Token System:**

```
Colors:
  --ivory:  #FDFAF5
  --cream:  #F6F1E8
  --gold:   #C5A46D
  --gold-light: rgba(197,164,109,0.12)
  --olive:  #6B7B5A
  --dark:   #1C1008
  --muted:  rgba(28,16,8,0.52)
  --border: rgba(197,164,109,0.22)
  --error:  #BA1A1A
  --success: #4A7C3F

Typography:
  --font-display: "Frank Ruhl Libre", serif — headings, numbers, names
  --font-body: "Heebo", sans-serif — all body text, labels, captions

Spacing:
  --space-xs: 4px
  --space-sm: 8px
  --space-md: 16px
  --space-lg: 24px
  --space-xl: 40px
  --space-2xl: 64px

Border Radius:
  --radius-sm: 8px
  --radius-md: 16px
  --radius-lg: 24px
  --radius-full: 9999px

Shadow:
  --shadow-card: 0 2px 16px rgba(28,16,8,0.08)
  --shadow-elevated: 0 8px 32px rgba(28,16,8,0.12)

Motion:
  --duration-fast: 150ms
  --duration-normal: 250ms
  --duration-slow: 400ms
  --easing: cubic-bezier(0.16, 1, 0.3, 1)
```

---

### Interaction Principles

- Every interactive element has all states: default / hover / pressed / focused / disabled / loading
- Touch targets: 44px minimum on mobile, 32px on desktop
- Animations: entrance fade (250ms), transitions slide or fade (not both), celebrations are the exception
- RTL-first: every component is designed RTL, then adapted for LTR (not the reverse)

---

---

# DESIGN SPRINT — Execution Plan

## Phase 1 — Master Plan (CURRENT PHASE)
Complete the audit and organization of all experiences.
**Status:** ✅ This document.

---

## Phase 2 — Design Pack Creation (per Experience)

For each experience, prepare a complete Design Pack:
- User Journey Map
- All screens listed with all states
- 3 Stitch prompts (Direction A / B / C)
- Design rationale per direction
- CoS recommendation

**Order (by priority):**

| Priority | Experience | Reason |
|----------|-----------|--------|
| P0 — Wave 1 | Guest Experience — RSVP | Complete. Design approved. Awaiting CEO implementation decision. |
| P0 — Wave 2 | Guest Experience — Remaining (Mini Site, Gallery, Memory, Capsule, Survey) | Highest reach. Complete the guest experience. |
| P1 — Wave 3 | Couple Experience — Dashboard + Onboarding | Retention. Daily users. |
| P2 — Wave 4 | Couple Experience — Sub-pages (Guests, Checklist, Vendors, etc.) | Power user coherence. |
| P3 — Wave 5 | Marketing Experience | Acquisition. High leverage. |
| P4 — Wave 6 | Admin Experience | Internal. Lower design priority. |
| P5 — Wave 7 | Design System | Foundation. Enables all future waves. |

---

## Phase 3 — Stitch Design (per Experience)

Each Design Pack → complete Stitch prompts → CEO runs in Stitch → returns designs.

One Stitch brief per direction × per experience.

**Stitch brief format (required for every submission):**

```
Context: [user journey before this experience]
Experience: [name]
User: [who they are, what they just did]
Goal: [what they need to accomplish]
Emotion: [what they should feel at each step]
Brand: [tokens, fonts, RTL, cream background, gold CTAs]
Screens: [list all screens with all states]
After: [where they go next]
```

---

## Phase 4 — Design Review (per Experience)

For each received Stitch design:
- Review all 16 criteria across 7 lenses
- Design Decision Log (all significant decisions)
- Design Memory update (new patterns discovered)
- Design Library update (new patterns)
- Experience Intelligence report
- CEO presentation and approval

---

## Phase 5 — Implementation Roadmap

After all experiences have approved Design Packs:
- Consolidate all approved designs into one Implementation Roadmap
- Sequence by business impact and technical dependency
- Estimate effort per wave
- Define release milestones
- Begin implementation (experience by experience, wave by wave)

---

## Implementation Gate (per Experience)

```
✓ Design Review: all 16 criteria passed
✓ Design Decision Log: all significant decisions documented
✓ Design Memory: updated with new patterns
✓ Design Library: new patterns added
✓ Experience Intelligence Report: completed
✓ CEO approval: received
```

Only then: write Implementation Plan for that experience.

---

---

# VISUAL LANGUAGE — The Single Thread

Every experience must share these visual constants:

## Non-Negotiable Design Constants

| Constant | Value | Applies To |
|----------|-------|-----------|
| Background (primary) | Cream #F6F1E8 or Ivory #FDFAF5 | Guest + Couple areas |
| Primary CTA color | Gold #C5A46D | All experiences |
| Heading font | Frank Ruhl Libre 700–900 | All experiences |
| Body font | Heebo 300–600 | All experiences |
| Dark color | #1C1008 (not pure black) | Text, admin backgrounds |
| Border style | `rgba(197,164,109,0.22)` | All card borders |
| RTL | Always | All screens |
| Mobile First | Always | Guest + Couple areas |
| Zero navigation chrome | Always | Guest Experience |

## Visual Thread (how the product feels like one thing)

A guest receives an RSVP link.
They see: cream background, "רגע לפני" in Frank Ruhl Libre, a gold button.

Three months later, they're at the gallery.
They see: cream background, Frank Ruhl Libre event name, gold accents.

The couple opens their dashboard every morning.
They see: the same cream, the same gold, the same warmth.

They share the link on Instagram.
The marketing landing page has the same aesthetic.

**One product. One thread. One feeling.**

---

---

# CEO DECISIONS REQUIRED

Before Design Pack creation begins for the next experience:

## Decision 1 — Implementation priority confirmation

| Wave | Experience | Scope |
|------|-----------|-------|
| Wave 1 RSVP | Guest — RSVP | Awaiting photo decision + CEO approval |
| Wave 2 | Guest — Remaining guest experience (Mini Site, Gallery, Memory, Wall, Capsule, Survey) | Ready to begin design |
| Wave 3 | Couple — Dashboard + Onboarding | Ready to begin design |

Confirm the order is correct, or redirect.

## Decision 2 — RSVP Photography (Wave 1, pending)

Option A: Static brand images (`/public/rsvp/`) — olive branch, wedding rings, warm interior.
Option B: Text-only luxury — no photography dependency.

**Recommend: Option A.**

## Decision 3 — Couple Dashboard design direction

The dashboard hybrid (Direction A hero + Direction C below-fold) needs CEO input before designing.
Or: design all three directions in Stitch and choose after seeing them.

**Recommend: Design all three in Stitch. Choose after visual review.**

## Decision 4 — Design System priority

Should the Design System be designed before experiences (foundation-first) or after (pattern-first, extract from experience designs)?

**Recommend: Pattern-first.**
Design experiences 1–4. Extract patterns into the Design System as they emerge.
A Design System built before the experiences it serves is abstract and often wrong.

---

---

*Product Design Master Plan | Version 1.0*
*Chief of Staff | Design Sprint Mode | 2026-06-26*
*Covers: 52 routes · 5 experiences · complete design language*
*Next: CEO approval → Wave 2 Design Pack*
