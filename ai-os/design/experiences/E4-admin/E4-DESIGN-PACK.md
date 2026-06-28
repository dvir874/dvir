# Experience 4 — Admin Experience
## Design Pack
## Chief of Staff | 2026-06-26

---

## Audit Summary

**The Admin Experience is different from every other experience in the product.**

It is:
- Desktop-first (not mobile-first)
- Data-dense (tables, not cards)
- Power-user focused (multiple events, complex operations)
- Partially client-visible (Approval screen is seen by couples)

**The current state:**
The main admin page (`/admin`) is a single ~3000-line file containing all tabs.
Each tab was built independently at different times.
No unified visual system. Each section has slightly different spacings, card styles, and typography decisions.

**The goal:**
A professional, fast, clear admin experience that:
1. Gives Dvir (and team) complete visibility at a glance
2. Can be screen-shared with clients without embarrassment
3. Works on mobile when needed (F1 Mobile Admin goal)
4. Feels like it belongs to the same product family

---

## Design Direction

**Direction A — Professional Dark** for the primary admin dashboard
**Direction C — Warm Romantic accents** for client-facing admin sections (Approval, CRM profile views)

The admin experience should not feel cold — it should feel like a premium professional tool that is also unmistakably "רגע לפני."

---

## Admin Navigation Architecture

**Current problem:** Too many tabs in one massive page.

**Proposed architecture:**
```
/admin                    — Dashboard (KPIs, event cards, tasks)
/admin/[eventId]          — Event-specific view (replaces multi-tab)
  ├── Guests              — Guest management
  ├── Messages            — WhatsApp Center
  ├── Seating             — Seating management
  ├── Budget              — Budget overview
  ├── Gallery             — Photo gallery
  ├── Requests            — Couple requests
  └── Settings            — Event settings
/admin/crm                — Cross-event CRM (all couples)
/admin/automations        — Automation rules
```

This is an architectural proposal only — implementation later. Design the screens first.

---

## Screens to Design

| Screen | Priority | Note |
|--------|----------|------|
| Admin Dashboard (command center) | P0 | Daily first screen |
| Guest Management tab | P0 | Most-used tab |
| WhatsApp Center | P0 | High usage, client-visible copy |
| Seating Management | P1 | Complex, specialized |
| CRM — Client list | P1 | External-visible |
| Approval page | P2 | Client-visible |
| Login | P3 | One-time |

---

## Admin Dashboard — Design Anatomy

```
┌──────────────────────────────────────────────────────┐
│  ADMIN HEADER (dark #1C1008, sticky)                 │
│  "רגע לפני" logo · Event selector · Notifications   │
│  [Admin user avatar] · [Quick add button]            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  KPI STRIP (4 cards, horizontal)                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │  127   │ │   89   │ │   43   │ │  12    │        │
│  │מוזמנים │ │מגיעים  │ │ לא ענו│ │בקשות  │        │
│  └────────┘ └────────┘ └────────┘ └────────┘        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  ACTIVE EVENTS (card grid)                           │
│  ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ חתונת ענבל ונדב     │ │ חתונת שרה ויוסי      │  │
│  │ 20.07.2026 · 47 ימים│ │ 03.08.2026 · 61 ימים │  │
│  │ ████████ 71% מוכן   │ │ ████░░░░ 43% מוכן    │  │
│  │ 127 מוזמנים · 89 ✓  │ │ 85 מוזמנים · 31 ✓   │  │
│  │ [פתח] [הודעה] [⋯]  │ │ [פתח] [הודעה] [⋯]   │  │
│  └──────────────────────┘ └──────────────────────┘  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  MY TASKS TODAY                                      │
│  □ שלחו תזכורת ל-43 שלא ענו — חתונת ענבל           │
│  □ אשרו תפריט עם קייטרינג — חתונת שרה              │
│  ✓ סיימו הושבה — חתונת משפחת כהן                   │
└──────────────────────────────────────────────────────┘
```

---

## Guest Management Tab — Design

```
┌────────────────────────────────────────────────────┐
│  [Event name + date]                               │
│  TAB BAR: מוזמנים | הודעות | הושבה | תקציב | ...  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  TOOLBAR                                           │
│  [🔍 חיפוש] [+ הוסף] [↑ ייבא] [↓ ייצא]          │
│  FILTERS: הכל | מגיע | ממתין | לא מגיע | לא שובץ  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  TABLE (desktop)                                   │
│  ┌────┬──────────┬──────┬────────┬──────┬──────┐   │
│  │    │ שם        │ מוזמ│ סטטוס  │שולחן │פעולות│   │
│  ├────┼──────────┼──────┼────────┼──────┼──────┤   │
│  │ □  │ משפחת כהן│  3   │ ✓ מגיע│  7   │📞💬⋯ │   │
│  │ □  │ שרה לוי  │  2   │ ⏳ ממתין│  —  │📞💬⋯ │   │
│  └────┴──────────┴──────┴────────┴──────┴──────┘   │
│                                                    │
│  MOBILE (cards, same data):                        │
│  ┌──────────────────────────────────┐              │
│  │ משפחת כהן · 3 אנשים              │              │
│  │ [✓ מגיע] [שולחן 7]               │              │
│  │ [📞] [💬] [עריכה]               │              │
│  └──────────────────────────────────┘              │
└────────────────────────────────────────────────────┘
```

---

## WhatsApp Center — Design

The most important communication tool. Couples can see screenshots of this.

```
┌────────────────────────────────────────────────────┐
│  WhatsApp Center — חתונת ענבל ונדב                │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  STEP 1: בחרו תבנית                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │💌 הזמנה  │ │⏰ תזכורת │ │🪑 שולחן  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │❤️ תודה   │ │📸 גלריה  │ │✏️ מותאם  │            │
│  └──────────┘ └──────────┘ └──────────┘            │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  STEP 2: תצוגה מקדימה                              │
│  ┌──────────────────┐                              │
│  │ [Phone mockup]   │  Template preview as it      │
│  │ 💍 משפחה         │  will look on WhatsApp       │
│  │ וחברים יקרים!   │                              │
│  │ ...              │                              │
│  └──────────────────┘                              │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  STEP 3: בחרו קהל                                  │
│  [הכל 127] [צד חתן 61] [צד כלה 66]                │
│  [לא ענו 43] [VIP 8]                               │
│  → נשלח ל-43 איש                                  │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│  STEP 4: שלחו                                       │
│  ┌──────────────────────────────────────┐           │
│  │ יוסי כהן · 050-000-0000             │           │
│  │ [פתחו WhatsApp ←]                   │           │
│  └──────────────────────────────────────┘           │
│  [+ הוסף לתור] — schedule for later               │
└────────────────────────────────────────────────────┘
```

---

## Stitch Prompts

### PROMPT 1 — Admin Dashboard

```
Design a professional admin dashboard in Hebrew (RTL) for "רגע לפני" wedding management platform. This is an internal tool used daily by the company team. Desktop-first (1280px). Dark professional aesthetic with brand gold accents.

CONTEXT: The admin (Dvir) opens this every morning to see all active weddings, what needs attention today, and the health of each event.

DIRECTION: Professional Dark — dark #1C1008 header/sidebar, cream/white content areas, gold accents.

SCREENS TO DESIGN:
1. Dashboard main view (desktop 1280px)
2. Same dashboard condensed for mobile (390px)

DESKTOP LAYOUT:
Left sidebar (240px, dark #1C1008):
  - "רגע לפני" logo at top (gold)
  - Navigation: דאשבורד / CRM / אוטומציות / הגדרות
  - Active event list (5-6 events, with status dots)
  - Bottom: profile + settings

Main content (remaining width, ivory #FDFAF5 background):
  Top bar: event selector dropdown + "הוסף אירוע" button + notification bell
  
  KPI row (4 cards):
    Total guests across all events | Total confirmed | Events this week | Pending requests
    Each: number (Frank Ruhl Libre 700, large) + label (Heebo 400, muted) + trend arrow
  
  Events grid (2 columns):
    Each event card (cream background, gold border, rounded 16px):
      Event name (Frank Ruhl Libre 600) + couple names + date
      Days remaining (gold pill)
      Readiness progress bar (gold fill)
      Guest stats: X מוזמנים · Y מגיעים · Z ממתינים
      3 quick action buttons: פתח / הודעה / ⋯
  
  My Tasks Today (right panel or bottom):
    Checkbox list, sorted by urgency
    Each: event name tag + task description + action link

PALETTE: Sidebar dark #1C1008, content ivory #FDFAF5, accent gold #C5A46D, text dark #1C1008
FONTS: Frank Ruhl Libre (numbers, event names) + Heebo (labels, body)
RTL: always.
FEEL: "I have complete visibility. I know what needs attention. I'm in control."
```

---

### PROMPT 2 — Guest Management (with WhatsApp Center)

```
Design a Hebrew RTL admin guest management screen and WhatsApp messaging center for "רגע לפני" wedding platform.

CONTEXT: Admin manages 100-400 guests per event. Most-used daily feature. WhatsApp is the primary communication channel with guests. The messaging center must look professional enough to screenshot and share with clients.

DIRECTION: Clean professional with brand gold accents.

SCREENS TO DESIGN:
1. Guest list (desktop with data table + mobile with cards)
2. WhatsApp Center (4-step: template → preview → audience → send)

GUEST LIST (desktop):
Sticky header: event name + tab navigation (מוזמנים / הודעות / הושבה / תקציב / ...)
Toolbar: search input + Add button + Import + Export + bulk actions
Filter chips: הכל / מגיע / ממתין / לא מגיע / לא שובץ
Stats summary bar: 127 סה"כ · 89 מגיעים · 31 ממתינים · 7 לא מגיעים

Data table (sortable columns):
  Checkbox | שם | כמות | סטטוס | שולחן | העדפת ארוחה | פעולות
  Status: colored pill (green=מגיע, amber=ממתין, red=לא מגיע)
  Actions per row: call icon + WhatsApp icon + edit icon
  
MOBILE version of guest list:
  Cards instead of table rows
  Each card: name + count + status pill + table badge
  Swipe left: quick actions (call / message)

WHATSAPP CENTER:
4-step wizard in a right panel or full-screen modal:
Step 1 — Templates: 6 cards in 2x3 grid, each with emoji + label:
  💌 הזמנה ל-RSVP | ⏰ תזכורת לאישור | 🪑 שובצתם לשולחן | ❤️ תודה שבאתם | 📸 העלו תמונות | ✏️ מותאם אישית
Step 2 — Preview: phone mockup showing WhatsApp message
  Message must start with "💍 משפחה וחברים יקרים!" — never a personal name
Step 3 — Audience: chips (הכל / צד חתן / צד כלה / לא ענו / VIP) + count
Step 4 — Send: list of recipients with WhatsApp link button per person + "הוסף לתור" option

PALETTE: White/ivory content, gold accents #C5A46D, dark text #1C1008
FONTS: Frank Ruhl Libre (headings) + Heebo (data, labels)
RTL: always. Desktop-first (1280px).
FEEL: "I have total control. This is a professional tool."
```

---

*Experience 4 Design Pack | 2 Stitch prompts | Chief of Staff | 2026-06-26*
