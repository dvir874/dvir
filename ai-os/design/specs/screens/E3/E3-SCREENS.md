# E3 — Couple Experience Screen Specifications
## רגע לפני | Engineering Source of Truth | 2026-06-27
## The couple experience is the product's daily use surface. Mobile First always.

---

# SHARED — Couple Area Header Pattern

All authenticated couple screens share a consistent header pattern.

**Mobile header (top bar):**
```
[Event name / "רגע לפני" — Frank Ruhl Libre 700 18px, right-aligned]
[Back arrow OR hamburger menu — leftmost position (RTL)]
```

**Personalization rule:**
On the main dashboard, the header is replaced by the large personal greeting ("שלום ענבל ונדב"). On all other couple screens, the top bar shows: section title (H2, right-aligned) + couple mini-greeting prefix.

**Mini-greeting prefix pattern:**
All couple sub-screens include below the page title:
```
"ענבל ונדב ·" — Heebo 300 13px muted, right-aligned, above the page title
```
This keeps the personalized feeling across all screens without making it feel like the main dashboard greeting.

---

# SCREEN E3-S1 — Onboarding Welcome Splash

## Purpose
First screen of the product after registration. Sets emotional tone. Communicates warmth and premium brand before asking for anything.

## Entry Points
- Auto-navigate from registration success

## Exit Points
- → E3-S2 (Onboarding Names) on CTA tap

## States
- Single state (no loading — static content)

## ⚠️ STITCH ITERATION REQUIRED BEFORE IMPLEMENTATION

**Current approved design has English text. New Stitch iteration must generate Hebrew version.**

**Hebrew text specification for Stitch:**
- Primary headline: "ברוכים הבאים לרגע לפני" — Frank Ruhl Libre 700 32px `--color-dark`
- Sub-headline: "המקום שבו חתונה הופכת לחוויה שלמה" — Heebo 300 18px `--color-muted`
- Botanical illustration: same direction as existing (warm, botanical, ivory background) — do NOT change illustration
- CTA: GoldCTA lg fullWidth "בואו נתחיל"

## Layout (after Hebrew Stitch iteration)

```
[Full-screen ivory background]
[Botanical illustration — centered, 240px height]
---
"ברוכים הבאים לרגע לפני" — Frank Ruhl Libre 700 32px dark, center
"המקום שבו חתונה הופכת לחוויה שלמה" — Heebo 300 18px muted, center
---
[GoldCTA lg fullWidth: "בואו נתחיל 💍"]
[safe area bottom padding]
```

## Animations
- Illustration: fade in 400ms, ease-out
- Text: fade in + slide from bottom 8px, 400ms, 100ms delay after illustration
- CTA: entrance 300ms, 200ms delay after text

## Accessibility
- `role="main"` on content area
- Illustration: `aria-hidden="true"`
- Skip: not applicable (no back navigation, first onboarding screen)

## Business Rules
- Only shown once — after registration, before onboarding step 1
- If couple navigates back to `/couple/[token]/onboarding` after completing it → redirect to dashboard

---

# SCREEN E3-S2 — Onboarding Names Step

## Purpose
Couple enters their Hebrew names. Product personalizes immediately with a live preview.

## User Goal
Enter names and see the product become "theirs" in real time.

## Progress State
Step 1 of 4.

## Layout

```
[Progress dots: 4 dots, 1st filled gold ●○○○]
"מה השמות שלכם?" — Frank Ruhl Libre 700 28px dark
---
[FloatingLabelInput: "שם הכלה" — auto-fills from registration data if available]
[FloatingLabelInput: "שם החתן" — same]
---
[LIVE PREVIEW CARD — cream background, gold border, 16px radius]
  "חתונת ענבל ונדב" — Frank Ruhl Libre 700 italic 22px `--color-gold-text` (#8B6914)
  [BotanicalDivider sprig sm]
---
[GoldCTA lg fullWidth: "המשך" — disabled until both names filled]
```

## Progress Dots Specification (replaces the dash rendering noted in validation)

```
Dot size: 10×10px circle (not dashes — full circles)
Active: ● filled `--color-gold`
Completed: ● filled `--color-olive` (slightly smaller, 8×8px)
Upcoming: ○ outline `--color-border-default`
Gap between dots: 8px
Animation: active dot has subtle pulse (scale 1.0 → 1.1 → 1.0, 1.5s loop)
```

## Component Behaviour

**Live preview:**
Updates on every keystroke with 100ms debounce.
- If only bride name: "חתונת ענבל"
- If only groom name: "חתונת נדב"
- If both: "חתונת ענבל ונדב"
- If neither: preview card hidden (not an empty state — card disappears)

## Business Rules
- Names are pre-filled from registration if already provided
- Names saved to `events.bride_name` and `events.groom_name` via PATCH `/api/events/[id]` on "המשך" tap
- Names used throughout the product — must be accurate

## Validation
- Both fields required to enable "המשך" CTA
- Min 2 chars each

---

# SCREEN E3-S3 — Onboarding Date + Venue Step

## Purpose
Couple enters wedding date and venue. Product shows first countdown.

## Progress State
Step 2 of 4.

## Layout

```
[Progress dots: ●●○○ — 2nd active]
"מתי ואיפה?" — Frank Ruhl Libre 700 28px dark
---
[FloatingLabelInput: "תאריך החתונה" — type=date, inputMode=none (native date picker)]
[FloatingLabelInput: "שם האולם / מקום"]
---
[COUNTDOWN PREVIEW — appears when date selected]
  [CircularProgressArc sm — decorative, shows 0%]
  "107 ימים עד היום הגדול" — Heebo 300 14px muted (days dynamically calculated)
---
[GoldCTA lg fullWidth: "המשך"]
```

## Component Behaviour

**Date input:**
- Opens native date picker (iOS date wheel, Android date picker)
- Min date: tomorrow (cannot set past date)
- Max date: +5 years
- After selection: immediately calculates and shows countdown preview

**Countdown preview:**
- Appears with fade-in 300ms after date selection
- Disappears if date is cleared
- `daysLeft = Math.ceil((weddingDate - today) / (1000 * 60 * 60 * 24))`

## Validation
- Date: required, must be in the future
- Venue: optional (can be added later)

## Analytics Events
- `onboarding_step_completed` → property: step_number=2, has_venue (boolean)

---

# SCREEN E3-S4 — Onboarding Guest Import Step

## Purpose
Couple adds their first guests (or skips). First interaction with the guest management system.

## Progress State
Step 3 of 4.

## ⚠️ This step was identified as missing in Validation Report.

**This screen must be designed before implementation of onboarding.**

**Stitch reference:** `/tmp/e3_onboarding_import_v2.png` (generated 2026-06-28, approved) — shows all 4 cards including skip option, correct "ייבוא מקובץ" label, reassurance copy

## Layout Specification (OPP-005 — corrected from Reality Check findings)

```
[Progress dots: 4 dots, dot 3 active — gold pulse ring]
---
Title: "הוסיפו את האורחים הראשונים שלכם" Frank Ruhl Libre 700 24px dark
Sub: "תוכלו להוסיף עוד מאוחר יותר" Heebo 300 14px muted
---
CARD 1: "ייבוא מאנשי קשר"
  - Sub: "בוחרים מי נכנס — לא מעלים הכל" ← reassurance copy (OPP-005)
  - Icon: contacts/people icon in olive circle
  
CARD 2: "ייבוא מקובץ" ← was "ייבוא מ-Excel" — too technical (OPP-005)
  - Sub: "Excel, Google Sheets, CSV"
  - Icon: spreadsheet icon in olive circle
  
CARD 3: "הכנסה ידנית"
  - Sub: "הוסיפו אחד אחד"
  - Icon: pencil icon in olive circle

CARD 4 (outline style — equal visual weight): "אין רשימה עדיין — דלגו לשלב הבא" ← OPP-005
  - Style: dashed border, transparent fill, muted text — visually equal to option cards
  - NOT a subordinate text link
---
GoldCTA: "המשיכו" — enabled when one of cards 1/2/3 tapped OR card 4 (skip) tapped
  If CTA is disabled: inline copy below — "בחרו אפשרות כדי להמשיך"
```

## Key Corrections from OPP-005

| Before | After | Reason |
|---|---|---|
| "ייבוא מ-Excel" | "ייבוא מקובץ" + sub "Excel, Google Sheets, CSV" | Non-spreadsheet users confused by "Excel" |
| Skip = subordinate text link | Skip = 4th outline card, equal weight | Couples with no list yet couldn't easily skip |
| No contacts reassurance | "בוחרים מי נכנס — לא מעלים הכל" | Users feared full contacts upload |
| CTA disabled, no explanation | Inline: "בחרו אפשרות כדי להמשיך" | Disabled state was unexplained |

---

# SCREEN E3-S5 — Onboarding Completion Celebration

## Purpose
The emotional peak of onboarding. The product is set up. The couple sees their wedding for the first time in branded form.

## Progress State
Step 4 of 4 → Complete.

## Layout

```
[Full-screen ivory]
[Gold confetti — 3-second burst, then settles]
[💍 custom gold ring SVG — 60×60px — NOT emoji]
"הכל מוכן! 🎉" — Frank Ruhl Libre 700 36px dark
"חתונת ענבל ונדב" — Frank Ruhl Libre 700 italic 28px `--color-gold-text` (#8B6914)
---
[BotanicalDivider sprig md]
---
"107 ימים עד היום הגדול" — Heebo 300 16px muted
---
[Checkmark list — 3 items]
  ✓ "פרטי החתונה נשמרו" — Heebo 400 14px
  ✓ "RSVP מוכן לשליחה" — Heebo 400 14px
  ✓ "הפלטפורמה מוכנה" — Heebo 400 14px
---
[GoldCTA lg fullWidth: "לדשבורד שלי"]
```

## RING ICON SPECIFICATION (Fix P1-003, 2026-06-28)

Do NOT use the 💍 emoji — it renders as a blue diamond ring on most Android devices and some iOS configurations, breaking the warm-gold brand at this emotional peak.

Implement as a custom inline SVG:

```svg
<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Ring band -->
  <circle cx="30" cy="34" r="14" stroke="#C5A46D" stroke-width="4" fill="none"/>
  <!-- Gem base (prongs) -->
  <path d="M22 20 L30 12 L38 20 L34 26 L26 26 Z" fill="#C5A46D"/>
  <!-- Gem facet lines -->
  <path d="M26 26 L30 20 L34 26" stroke="#FDFAF5" stroke-width="0.8" fill="none"/>
  <path d="M30 12 L30 20" stroke="#FDFAF5" stroke-width="0.8"/>
</svg>
```

`aria-hidden="true"` — the surrounding "הכל מוכן!" text carries the meaning. The ring is decorative.

This ensures warm-gold rendering across all devices/OS versions regardless of emoji font.

## Confetti Specification
- Particles: 30–50 small shapes (circles, rectangles, diamonds)
- Colours: `--color-gold`, `--color-cream`, `--color-olive`, white
- Animation: fall from top with slight horizontal drift, 3 seconds duration
- `prefers-reduced-motion`: show static confetti shapes, no animation

## Business Rules
- Checkmark list items are static — not dynamic (always show all 3 as checked)
- "לדשבורד שלי" navigates to `/couple/[token]`
- This screen is shown only once after onboarding completion — not re-accessible

## Analytics Events
- `onboarding_completed` → property: event_id, has_guests (boolean)

---

# SCREEN E3-S6 — Couple Dashboard (Above-Fold Hero)

**BottomNav active tab: `home` ("בית")** (OPP-006)

## Purpose
Daily emotional anchor. Couple sees how many days remain and feels the product is aware of their specific journey.

## Entry Points
- Direct: `/couple/[token]`
- Bottom nav "בית" tab from any couple screen

## States

| State | `daysLeft` | Description |
|---|---|---|
| Planning | `> 0` | Default — countdown visible |
| Wedding Day | `=== 0` | Full override — see E3-S9 |
| Post-Event | `< 0` | Archive mode — see E3-S10 |

## Planning State Layout (above-fold)

```
[Header: top bar — "רגע לפני" wordmark + hamburger menu]
---
[Personalized greeting section]
  "שלום ענבל ונדב" — Frank Ruhl Libre 700 32px dark, right-aligned
  "47" — Frank Ruhl Libre 900 80px `--color-gold-text` (#8B6914), right-aligned (countdown number)
  "ימים" — Heebo 300 20px muted, right-aligned (below number)
  "עד היום הגדול 💍" — Heebo 300 16px muted, right-aligned
---
[Readiness meter — CircularProgressArc lg, centred]
  value={readinessPct}
  label="מוכנות"
```

## Data Source
All from `/api/couple/[token]/briefing`:
- `daysLeft = Math.ceil((event.date - now) / (1000 * 60 * 60 * 24))`
- `readinessPct` = computed from briefing API (tasks%, RSVPs%, vendors%, seating%, budget%)

## Countdown Number Animation
On first load: count up from 0 to `daysLeft` over 600ms, Frank Ruhl Libre 900 gold.
`prefers-reduced-motion`: show final value immediately.

## Accessibility
- `aria-label="47 ימים עד ליום החתונה"` on the countdown block
- `role="timer"` on the countdown number
- Circular arc: `aria-label="מוכנות: 71%"`

---

# SCREEN E3-S7 — Couple Dashboard (Below-Fold)

**BottomNav active tab: `home` ("בית")** — same route as E3-S6, continuous scroll (OPP-006)

## Purpose
Surfaces the next actions and the current state of all major planning areas.

## Layout

```
--- [scrolled below fold] ---
[2×2 Quick Action Grid]
  [אורחים card: guest count + "124 מגיעים"]
  [הושבה card: "62 שובצו"]
  [צ'קליסט card: "14 משימות נותרו"]
  [תקציב card: "₪34,000 נותרו"]

[Smart Alert strip — WarmAlertCard if any alerts active]
  Example: "28 אורחים עדיין לא שובצו — בואו נסדר זאת ←"

[Milestone Cards — scrollable vertical list]
  [MilestoneCard: "תשלום לאולם" — "₪5,000 עד 1 אוגוסט" — "שלמו מקדמה" CTA]
  [MilestoneCard: "פגישה עם הצלם" — "15 יולי" — "קבעו פגישה" CTA]
  [MilestoneCard: "הזמנת קייטרינג" — "אושר ✓" — "עדכנו" CTA]

[BottomNav]
```

## 2×2 Grid Cards

Each quick action card:
- Card: cream background, 16px radius, border 1px `--color-border-default`
- Top-right: small icon (emoji or SVG, 24px)
- Center: primary number in Frank Ruhl Libre 700 28px `--color-dark`
- Bottom: label Heebo 300 13px `--color-muted`
- Tap: navigates to the relevant section

## Milestone Card Specification

```
Card: cream background, 12px radius, horizontal layout
Left (RTL end): [icon] [label Heebo 600 14px dark] [sub-text Heebo 300 12px muted]
Right (RTL start): [action CTA — Heebo 600 13px gold, underlined on tap]
Top: thin gold left-border 3px (urgency indicator — only if due_date < 14 days)
```

**Action CTA labels per milestone type (NOT generic "עדכנו סטטוס"):**

| Type | CTA label |
|---|---|
| venue | "קבעו מועד ביקור" |
| payment | "שלמו מקדמה" |
| vendor | "אשרו חוזה" |
| decoration | "אשרו פרטים" |
| catering | "סגרו תפריט" |
| completed | "עדכנו ✓" |

## Smart Alerts — Priority Logic

Show maximum 1 alert at a time (highest urgency):

| Condition | Alert text | Urgency |
|---|---|---|
| unseated > 0 AND daysLeft < 30 | "X אורחים לא שובצו — X ימים נותרו" | high |
| pending RSVPs AND daysLeft < 14 | "עדיין ממתינים ל-X אישורים" | high |
| upcoming payment due < 7 days | "תשלום ל[vendor] עד [date]" | medium |
| no guests added at all | "הוסיפו את האורחים הראשונים שלכם" | low |

## Loading States
- Above-fold: skeleton — grey bar for greeting, circular placeholder for arc
- Below-fold: 2×2 grid of cream card skeletons + 3 milestone row skeletons

## Empty States (individual sections)

**No milestones:**
```
"עוד אין אבני דרך" — Heebo 300 14px muted, centred in section
"הוסיפו ספקים ומשימות כדי שיופיעו כאן" — Heebo 300 12px muted
```

**Analytics Events:**
- `dashboard_viewed` → properties: days_left, readiness_pct, has_alerts

---

# SCREEN E3-S8 — Checklist

**BottomNav active tab: `checklist` ("משימות")** (OPP-006)

## Purpose
Couple manages all wedding tasks grouped by category, with visual progress feedback.

## Entry Points
- Bottom nav "משימות" tab
- Dashboard 2×2 grid "צ'קליסט" card

## Layout

```
[Header: "ענבל ונדב ·" muted prefix + "צ'קליסט החתונה" H2]
---
[CircularProgressArc lg — centred, value=68, label="הושלם"]
"32 מתוך 47 משימות הושלמו" — Heebo 300 14px muted, centred
---
[FilterChipRow — categories]
  "הכל" | "אולם וקבלת פנים" | "אוכל ושתיה" | "צוות" | "סגנון"
---
[Task list — grouped by active filter]
  [Category section header: olive color, Heebo 600 14px]
  [TaskRow × N]
---
[GoldCTA sm: "+ הוסיפו משימה"]
[BottomNav]
```

## Category Chip Colour Fix (Validation Report item)

Category chips must NOT use green (#4A7C59). Green is reserved exclusively for guest confirmed status.

**Category chip states:**
- Active filter (chip selected): gold background `--color-gold`, white text
- Inactive filter: cream background, muted text
- Category "complete" indicator (all tasks in category done): olive dot `--color-olive` before chip label — NOT green background

## Task Row Specification

```
[Checkbox 24×24px — unchecked: cream border / checked: gold fill + white checkmark]
[Task label — Heebo 400 15px dark, strikethrough when completed]
[Due date badge — Heebo 300 12px muted, right-aligned]
[Category icon — 16px, right of due date]
```

**Checkbox animation:**
On check: checkbox fills gold over 150ms, checkmark draws in, task label gets strikethrough over 200ms.

## Empty States

When no tasks in active category:
```
"אין משימות בקטגוריה זו" — Heebo 300 14px muted, centred
[GoldCTA sm: "+ הוסיפו משימה ראשונה"]
```

When 100% complete:
```
[BotanicalDivider wreath]
"כל המשימות הושלמו! 🎉" — Frank Ruhl Libre 700 24px dark
"אתם מוכנים לחתונה" — Heebo 300 16px muted
```

## Business Rules
- Tasks seeded from `src/lib/task-templates.ts` on event creation
- Custom tasks added via "+ הוסיפו משימה" bottom sheet form
- Task completion synced to server immediately (optimistic update + sync)
- Optimistic update: if sync fails, show WarmAlertCard and revert

## Accessibility
- Checkbox: `role="checkbox"` with `aria-checked`
- Task list: `role="list"` with `role="listitem"` per task
- Category filter: `role="group"` + `aria-label="סנן לפי קטגוריה"`

---

# SCREEN E3-S9 — Guest Center

**BottomNav active tab: `guests` ("אורחים")** (OPP-006)

## Purpose
Couple manages and monitors their guest list from a mobile-first interface.

## Entry Points
- Bottom nav "אורחים" tab
- Dashboard 2×2 grid "אורחים" card

## Layout

```
[Header: "ענבל ונדב ·" prefix + "מרכז האורחים" H2]
---
[Summary pills row]
  "124 אורחים" | "98 מגיעים" | "18 ממתינים" | "8 לא מגיעים"
---
[FilterChipRow — scroll]
  "כולם(124)" | "מגיעים(98)" | "ממתינים(18)" | "לא מגיעים(8)" | "לא שובצו(26)"
---
[Search input — cream, 40px height, magnifier icon RTL]
---
[Guest list — GuestCard × N, 8px gap]
---
[WarmAlertCard — if unseated > 0]
  "26 אורחים לא שובצו — שבצו אותם לשולחנות ←"
---
[GoldCTA lg floating: "+ הוסיפו אורח"]  ← ONE CTA ONLY (duplicate removed per validation)
[BottomNav]
```

## GoldCTA Positioning (Validation Report fix)
- ONE primary CTA only: floating sticky at bottom
- The header "+" button IS REMOVED (was duplicate)
- The floating CTA stacks above the bottom nav: `position: sticky; bottom: calc(80px + env(safe-area-inset-bottom))`

## Filter Chips — Counts
Counts update in real time from the guest list data. If all guests are confirmed, the "ממתינים" and "לא מגיעים" chips show `(0)` and are still visible (not removed).

## Loading States
- 5 GuestCard skeletons (cream rectangles, 64px height, pulse animation)

## Empty State (no guests at all)
```
[BotanicalDivider sprig]
"עדיין אין אורחים" — Frank Ruhl Libre 700 24px dark
"הוסיפו את האורחים שלכם כדי להתחיל" — Heebo 300 14px muted
[GoldCTA: "+ הוסיפו אורחים"]
[Text link: "ייבוא מ-Excel"]
```

## Accessibility
- Guest list: `role="list"` with `aria-label="רשימת אורחים"`
- Each GuestCard: `role="listitem"` with `aria-label`
- Filter group: `role="group"` with `aria-label="סנן אורחים"`

## Business Rules
- Maximum guests for free tier: 50. If count = 50, show: "הגעתם למגבלת האורחים. שדרגו לפרימיום לאורחים נוספים."
- Guest sort: by status (מגיע first), then by name alphabetically
- Phone numbers: display formatted as `050-000-0000`

---

# SCREEN E3-S10 — Wedding Day Mode

**BottomNav: SUPPRESSED** — full-screen override. No persistent navigation on wedding day. All actions are embedded in the screen. (OPP-006)

## Purpose
Complete dashboard override on the wedding day. Simplifies to only what matters today.

## Trigger
`daysLeft === 0` — checked at page load and re-checked every 60 minutes

## Layout

```
[Full-screen hero — couple photo (if uploaded) or warm gradient fallback]
[Gradient overlay: linear-gradient(180deg, rgba(28,16,8,0.2) 0%, rgba(28,16,8,0.7) 100%)]
---
"היום הגדול הגיע! ❤️" — Frank Ruhl Libre 700 32px white, centered
"חתונת ענבל ונדב" — Frank Ruhl Libre 700 italic 22px `--color-gold-text` (#8B6914), centered
"15 בספטמבר 2026" — Heebo 300 16px white 70% opacity, centered
---
[Scrollable content below hero]
[Event timeline cards — from events.event_timeline JSONB]
  [TimelineCard: "17:00 — קבלת פנים" / "19:00 — כניסה לחופה"]
---
[2×2 Action grid]
  [📍 נווט ב-Waze] [📞 אנשי קשר]
  [🪑 שולחנות] [📸 גלריה]
```

## Fallback State (no couple photo uploaded)

When `events.mini_site_hero_path === null`:
```
Hero background: linear-gradient(135deg, #C5A46D44, #6B7B5A22) on --color-cream
Center: couple initials in Frank Ruhl Libre 900 72px `--color-gold-text` (#8B6914)
(E.g., "ע · נ" for ענבל ונדב — first letter of each name separated by gold dot)
```

## Event Timeline

Source: `events.event_timeline` JSONB array of `{time: "17:00", title: "קבלת פנים"}`

If empty:
```
[WarmAlertCard urgency='low']
"הוסיפו לו"ז לאירוע" [small CTA → opens edit modal]
```

Timeline card:
- Time: Frank Ruhl Libre 700 18px `--color-gold-text` (#8B6914)
- Title: Heebo 400 16px `--color-dark`
- Active card (current time ± 30min): gold border, slightly larger
- Past events: muted opacity 0.5

## Action Grid

| Action | Label | Behaviour |
|---|---|---|
| Waze | "נווט ב-Waze" | Opens `https://waze.com/ul?q={event.address}` |
| אנשי קשר | "צוות האירוע" | Opens vendor list page |
| שולחנות | "הושבה" | Opens seating page |
| גלריה | "גלריה חיה" | Opens gallery (guest upload) |

## What is HIDDEN on Wedding Day Mode
- Checklist (irrelevant today)
- Budget tracker
- Readiness meter
- Milestone cards
- Smart alerts

## Analytics Events
- `wedding_day_mode_viewed` → property: event_id

---

# SCREEN E3-S11 — Post-Event Dashboard

**BottomNav: POST-EVENT variant** — "זכרונות" replaces "משימות". Active tab: `home` ("בית"). (OPP-006)

## Purpose
Memory archive mode. The wedding is over — the product becomes a keepsake.

## Trigger
`daysLeft < 0`

## Layout

```
[Header: "רגע לפני" wordmark + menu]
---
"✨ החתונה הייתה מושלמת!" — Frank Ruhl Libre 700 32px dark
"חתונת ענבל ונדב" — Frank Ruhl Libre 700 italic 24px `--color-gold-text` (#8B6914)
"15 בספטמבר 2026" — Heebo 300 14px muted
---
[Memory stats row]
  "120 תמונות" | "47 ברכות" | "38 זיכרונות"
---
[2×2 Action grid — post-event items]
  [📸 גלריה] [💌 ברכות]
  [📦 קפסולת זמן] [🌟 ריוו על רגע לפני]
---
[Couple photo section — if photo uploaded]
  OR
[Photo upload CTA — if no photo]
  "הוסיפו תמונה מהחתונה" — GoldCTA secondary
---
[BottomNav — POST EVENT variant: "זכרונות" replaces "משימות"]
```

## Post-Event Navigation (BottomNav variant)

| Position | Label | Route |
|---|---|---|
| 1 (rightmost) | בית | `/couple/[token]` |
| 2 | גלריה | `/gallery/[token]` |
| 3 | זכרונות | `/memories/[token]` |
| 4 | עוד | bottom sheet |

## Photo Fallback State (covers ~80% of couples)

When `events.mini_site_hero_path === null` AND in post-event mode:

```
[Card: cream background, dashed gold border, 16px radius, padding 24px, centred]
[Camera icon — 32px, --color-muted]
"הוסיפו תמונה מהחתונה" — Heebo 400 16px dark
"שמרו את הרגע הכי יפה" — Heebo 300 13px muted
[GoldCTA secondary sm: "העלו תמונה"]
```

"העלו תמונה" → opens native file picker filtered to images → uploads to Supabase storage → saves path to `events.mini_site_hero_path` → refreshes page.

## "ריוו על רגע לפני" Action Card

Post-event action that asks the couple to share their experience:
- Navigates to survey page `/survey/[token]`
- Label: "כתבו ביקורת"
- Sub-text: "עוזר לנו לצמוח"

## Business Rules
- Memory stats are real counts from DB (gallery_photos, blessings, memory_wall_items)
- Time capsule button shows days until unlock if `days_since_wedding < 365`
- After 365 days: time capsule button says "פתחו את הקפסולה! 🎉"

## Analytics Events
- `post_event_dashboard_viewed` → property: event_id, days_since_wedding

---

*E3 Screen Specifications | Chief of Staff | 2026-06-27*
