# Experience 3 — Couple Experience
## Product Design Audit
## Chief of Staff | 2026-06-26

---

## Experience Summary

The Couple Experience is the product's retention engine.
Couples use it 3–7x per week during the 16 weeks before their wedding.
It is the only experience where the user has an ongoing relationship with the product.

Unlike the Guest Experience (one-time arrivals), couples return. They form habits.
The dashboard is their wedding headquarters. It must earn their daily trust.

---

## Screens In Scope

| Screen | Route | States | Current Quality |
|--------|-------|--------|----------------|
| Dashboard | `/couple/[token]` | Planning / Wedding Day / Post-event / Empty | Hero: 8/10 · Below fold: 5/10 |
| Onboarding | `/couple/[token]/onboarding` | 7 steps + completion | Functional but not ceremonial: 5/10 |
| Journey / Timeline | `/couple/[token]/journey` | Timeline + empty | Exists but unclear purpose: 4/10 |
| Guest Center | `/couple/[token]/guests` | Table + empty + loading | Desktop-quality, mobile-poor: 5/10 |
| Checklist | `/couple/[token]/checklist` | Progress states | Works, no celebration: 5/10 |
| Vendors | `/couple/[token]/vendors` | Grid + empty + loading | Premium feel, needs polish: 6/10 |
| Seating | `/couple/[token]/seating` | Link to admin | Minimal couple view: 3/10 |
| Help / Requests | `/couple/[token]/requests` | List + form | Functional, not premium: 4/10 |
| Service Center | `/couple/[token]/service` | Timeline | Basic: 4/10 |
| Print Center | `/couple/[token]/print` | Cards | Minimal: 5/10 |
| Post-Wedding Recap | `/couple/[token]/recap` | Data view | Exists: 5/10 |
| Time Capsule | `/couple/[token]/capsule` | See E2 | 3/10 (also in E2) |

---

## Screen-by-Screen Audit

---

### Dashboard — `/couple/[token]`

**Current architecture:**
The dashboard has 4 distinct modes based on `daysUntilEvent`:
- Planning mode (normal): countdown, readiness, alerts, tips, quick actions
- Wedding Day mode (`daysLeft === 0`): WeddingDayScreen component
- Post-event mode (`daysLeft < 0`): post-wedding content
- Empty state: new couple, no data

**Hero (already strong):**
- Dark luxury (#1C1008) background
- Couple name in Frank Ruhl Libre
- Countdown timer (days/hours/minutes/seconds)
- Readiness progress bar
- Score: 8/10 — keep as foundation, minor polish only

**Below the fold (needs redesign):**
The below-fold content drops from premium to utilitarian:
- Section headers: plain Heebo text, no hierarchy
- Alert cards: clinical (red/yellow/green text on white boxes)
- Quick action tiles: generic icon grid
- Daily quote: random, not beautifully styled
- Stats: number-heavy, no visual warmth
- Feature tabs: many visible simultaneously, overwhelming

**Emotional Opportunities — Dashboard:**

| Current | Opportunity |
|---------|-------------|
| Alert: "לא שיבצת 23 אורחים" | Alert as assistant message: "יש 23 אורחים שעדיין ממתינים למקום" |
| Score as percentage | Readiness as milestone: "75% מוכנים — הגעתם לחצי הדרך! 🎉" |
| Generic section headers | Section headers with context: "מי מגיע?" / "מה עוד נשאר?" |
| Daily quote: small text block | Quote as full-width premium card, Frank Ruhl Libre |
| Quick actions: icon grid | Stage-aware "הפעולה הבאה שלכם" — single prominent action |
| Multiple tabs visible | Progressive disclosure: show what's relevant to today's stage |

**Wedding Day Mode:**
Currently a component called `WeddingDayScreen`.
The concept is right. The execution needs premium design:
- Full-screen dark background (like the hero)
- "היום הגדול הגיע" as a ceremony
- 5 action buttons that are stage-appropriate
- Timeline of the day (if set)
- Feel: calm, clear, powerful — not busy

**Post-Event Mode:**
Currently rudimentary.
Opportunity: the post-event dashboard is an emotional transition.
The couple has crossed over. They need to feel: "We did it. That was real."

---

### Onboarding — `/couple/[token]/onboarding`

**Current architecture:**
7-step wizard (date → venue → guest count → invitation link → RSVP setup → budget → event manager)
Progress bar at top.
SelectCard components for choices.
Simple text inputs.

**Current quality: 5/10**
The mechanic works. But it doesn't feel like the beginning of something meaningful.
Step 1 is entering a date. That feels administrative.
The opportunity: make each step feel like the couple is constructing their wedding, not filling a form.

**Emotional Opportunities:**

| Current Step | Current Feel | Opportunity |
|-------------|-------------|-------------|
| Step 1: Enter date | "When is the wedding?" | "כמה ימים נותרו עד היום הגדול?" |
| Step 2: Enter venue | "Where is the venue?" | "איפה תתחתנו?" — with a map preview |
| Step 3: Guest count | "How many guests?" | "כמה אנשים יחגגו אתכם?" |
| Step 4: Invitation link | Technical setup | "הקישור שלכם מוכן — שתפו עם המוזמנים" |
| Step 5: RSVP | Technical setup | "אורחים יוכלו לאשר הגעה בקלות" |
| Step 6: Budget | "Enter budget" | "מה התקציב שלכם?" — with encouragement |
| Step 7: Manager | "Who manages?" | "מי מסייע לכם?" |
| Completion | Redirect to dashboard | "הכל מוכן — ברוכים הבאים למסע החתונה שלכם!" |

The completion moment is the most important.
After 7 steps, the couple should land on a "your wedding headquarters is ready" screen
with their wedding date prominently displayed and a first recommended action.

---

### Journey / Timeline — `/couple/[token]/journey`

**Current:**
Step-based timeline (Setup → Guests → Invites → RSVPs → Seating → Final Prep → Event Day → After)
Status per step: done / active / pending / locked
Each step has a description and optional link

**Current quality: 4/10**
The concept is right. The execution lacks premium design.
The journey is a horizontal list of steps — it reads as a checklist, not a story.

**Opportunity:**
The journey should feel like a map of a meaningful trip.
Each stage is not a checkbox — it is a chapter.
"You're here. Look how far you've come. Look what's ahead."

---

### Guest Center — `/couple/[token]/guests`

**Current:**
- Summary cards: total / confirmed / pending / declined / seated
- Table with search + filter (status, side)
- Guest detail panel (slide-in)
- HelpButton floating

**Current quality: 5/10**
The table works. On desktop it's clear.
On mobile: the table becomes very cramped. Cards would be better.

**Pain Points:**
- Table-based on mobile (poor)
- No milestone celebration (first 50 confirmed, 100 confirmed)
- No visual for "only 23 guests left to confirm"
- Stats at top are numbers — could be progress-oriented

---

### Checklist — `/couple/[token]/checklist`

**Current:**
- Category chips for filtering
- Task rows with completion toggle
- Add task modal
- Category icons

**Current quality: 5/10**
Checking off a task is one of the best feelings in planning.
The current implementation doesn't celebrate it.

**Pain Points:**
- No animation on completion
- No milestone toast (25% / 50% / 75% / done!)
- No "today's focus" suggestion (stage-aware)
- No visual distinction between overdue / urgent / normal

---

### Vendors — `/couple/[token]/vendors`

**Current:**
- Category grid with icons
- Vendor cards: name, category, status, payment status
- Add vendor modal
- Quick actions: call, WhatsApp, notes

**Current quality: 6/10** — the best sub-page currently
The vendor category icon system is good.
The card design has warmth.
Still needs: payment summary header, rating system, more premium cards.

---

## Summary of Redesign Priorities

| Screen | Priority | Key Change |
|--------|----------|-----------|
| Dashboard below-fold | 🔴 Critical | Redesign all sections: alerts as assistant, stats as progress, actions as stage-aware |
| Dashboard Wedding Day | 🔴 Critical | Premium ceremony design — the biggest day deserves the best screen |
| Dashboard Post-event | 🟠 High | Emotional transition: "you did it" |
| Onboarding | 🟠 High | Make each step feel like a chapter, completion as a ritual |
| Journey | 🟡 Medium | Map metaphor — story, not checklist |
| Guest Center | 🟠 High | Mobile-first card design |
| Checklist | 🟡 Medium | Celebration on completion |
| Vendors | 🟡 Medium | Polish and payment header |
| Others | 🟢 Lower | Polish pass |

---

*Experience 3 Audit | Chief of Staff | 2026-06-26*
