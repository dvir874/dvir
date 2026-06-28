# E4 — Admin Experience Screen Specifications
## רגע לפני | Engineering Source of Truth | 2026-06-27
## Admin is Desktop-First. All screens optimised for 1280px. Must work at 768px.

---

# SHARED — Admin Area Layout

All admin screens share a persistent two-panel layout at `xl`:

```
[Sidebar — 240px fixed left]  |  [Main content — flex-1]
```

At `md` (768px):
- Sidebar collapses to hamburger menu
- Main content is full-width
- Sidebar opens as off-canvas drawer (300ms slide from right — RTL)

At `sm` (390px):
- Same as `md` — hamburger + drawer
- KPI cards stack to single column
- Tables collapse to card layout

## Admin Sidebar (from SYS-09)
> **Design Authority Override (2026-06-28):** Approved Stitch render shows dark olive sidebar (`#586151`), which takes precedence over this written spec's `--color-ivory`. Implementation follows Stitch render. Spec updated to match.

- Background: `#586151` (dark olive — per approved Stitch render)
- Logo: "רגע לפני" Frank Ruhl Libre 700 24px `#E5C188` (gold-light on dark)
- Navigation items (Heebo 500 14px, padding 12px 16px):
  - Groups: ניהול | תקשורת | מעקב | שירות | כלים
  - Active: background rgba(255,255,255,0.10), border-right 4px `#E5C188` (RTL), white text
  - Inactive: rgba(255,255,255,0.62) text
- Admin name at bottom: "שלום, דביר" Heebo 300 14px muted

---

# SCREEN E4-S1 — Admin Dashboard

**Admin sidebar active item: "דשבורד"** (OPP-006)

## Purpose
Gives the admin situational awareness across all active events at a glance.

## Entry Points
- Direct: `/admin`
- Authentication required — redirects to `/admin/login` if not authenticated

## Authentication
- Admin token in cookie or header: `x-admin-token`
- No couple token — admin authentication is separate

## States

| State | Description |
|---|---|
| Default | Events loaded, KPIs visible |
| Loading | KPI card skeletons + list row skeletons |
| Empty (no events) | See empty state below |

## Layout (1280px desktop)

```
[Admin sidebar — left]
[Main content — right]
  [Header: "שלום, [admin_name]" Frank Ruhl Libre 700 24px dark + date string]
  [KPI Cards row: 4 cards]
    ["X אירועים פעילים"]
    ["X אישורי הגעה השבוע"]
    ["X תמונות הועלו"]
    ["X אירועים השבוע הקרוב"]
  [Event Cards list]
    [EventCard × N — see spec below]
```

## KPI Cards Specification

```
Card: cream background, 16px radius, border 1px --color-border-default
Primary number: Frank Ruhl Libre 700 36px --color-gold
Label: Heebo 300 13px --color-muted
Responsive: 4 columns at xl → 2 columns at md → 1 column at sm
```

Data sources (all from admin API):
- אירועים פעילים: `events.count WHERE status='active'`
- אישורים השבוע: sum of `guests.count WHERE rsvp_status='confirmed' AND updated_at > 7 days ago`
- תמונות: `gallery_photos.count WHERE created_at > 7 days ago`
- אירועים קרובים: `events.count WHERE date BETWEEN today AND today+7`

## Event Card Specification

```
Card: cream background, 16px radius, border 1px --color-border-default, padding 20px
Row layout:
  [Couple names — Frank Ruhl Libre 700 18px dark]
  [Date — Heebo 300 14px muted]
  [Guest progress bar: X/Y אורחים — linear bar (admin only — not couple area)]
  [RSVP pill: "X% אישרו" StatusPill confirmed]
  [Action buttons: "פרטים" | "WhatsApp" | "הושבה"]
```

Note: Linear progress bar IS used in the admin event card — this is the admin area, NOT the couple area. The circular arc rule (SYS-05) applies only to the couple and guest experiences. Admin may use linear bars for data-dense contexts.

## Multi-Event Navigation — Fix P1-006, 2026-06-28

The admin dashboard shows multiple event cards. An independent certification review found this navigation path was unspecified. It is now specified here.

**Active event context:**
All event-specific screens (guests, seating, WhatsApp) operate on a single "active event" selected by the admin. This is stored in React context, updated by URL param `?event=[event-id]`.

**Event selector dropdown (in admin header bar, always visible on event-specific screens):**
```
[Dropdown trigger: "[Couple names] — [date] ▾"]
  Items: all active events sorted by date ascending
    ✓ [active event — gold checkmark]
    [other events — no checkmark]
  Divider
  "+ צרו אירוע חדש"
```
- Switching events updates context; no page reload
- Selected event persists in URL: `/admin?event=[id]&tab=[tab-name]`
- Dropdown hidden on the dashboard overview (`/admin` with no event param)

**"← כל האירועים" back link:**
- Appears in admin header when any event-specific tab is active
- Heebo 400 14px `--color-muted`
- Click → clears active event → returns to `/admin` dashboard

**Event card action buttons:**
- "פרטים" → sets event as active → opens guests tab
- "WhatsApp" → sets event as active → opens WhatsApp Center tab
- "הושבה" → sets event as active → opens seating tab

## Empty State (no events)

```
[BotanicalDivider branch — centered, 60px]
"אין אירועים עדיין" — Frank Ruhl Libre 700 24px dark
"צרו את האירוע הראשון שלכם" — Heebo 300 14px muted
[GoldCTA: "+ צרו אירוע חדש"]
```

## Loading States
- 4 KPI card skeletons: cream rectangles, 120px height, animate-pulse
- 3 event card skeletons: 100px height rows

## Analytics Events
- `admin_dashboard_viewed`
- `admin_event_opened` → property: event_id

---

# SCREEN E4-S2 — WhatsApp Center

**Admin sidebar active item: "WhatsApp"** — gold left border (RTL: right border), cream background highlight. Sidebar also shows "🚀 מצב שליחה" badge per SYS-09 and DEC-012. (OPP-006)

## Purpose
Admin composes, previews, and queues WhatsApp messages to specific audience segments.

## Sidebar State: FOCUSED TASK MODE

Per SYS-09: same ivory sidebar, adds "🚀 מצב שליחה" badge in sidebar header.

## Layout (1280px desktop)

```
[Sidebar — ivory, with focused mode badge]
[Main content]
  [Header: "מרכז ה-WhatsApp" Frank Ruhl Libre 700 24px]
  ---
  [4-step wizard — horizontal steps indicator]
    ①תבנית → ②קהל → ③תצוגה מקדימה → ④שליחה
  ---
  [Step content area — left 60%]
  [Phone Mockup — right 40%]
```

## Step Indicator Specification

```
Steps row: horizontal, right-to-left (step 1 rightmost — RTL)
Active step: gold circle with white number + label below gold
Completed step: olive circle with white checkmark + grey label
Upcoming step: muted circle + muted label
Connector line between steps: dashed for upcoming, solid for completed
```

## Wizard Navigation — Back & Forward (OPP-003)

```
Step 1: No back button (entry point to wizard)
Step 2+: "← חזרה" text link — top-left (RTL: top-right) above step indicator
         Heebo 400 14px --color-muted, chevron icon 16px
         Tap: return to previous step. All data entered in current step is preserved.
         All data from previous step is also preserved (state never cleared on back).
Forward: "המשיכו →" GoldCTA button — enabled when step is complete
```

**State preservation rule:** Wizard state is held in a single React context/reducer. Navigating back never resets data. Admin can move freely between completed steps to review/edit.

## Step 1 — Template Selection

```
[Title: "בחרו תבנית" H3]
[6 template cards in 2×3 grid]
  [💍 הזמנה ל-RSVP]
  [⏰ תזכורת לאישור]
  [🪑 שובצתם לשולחן X]
  [❤️ תודה שבאתם]
  [📸 העלו תמונות לגלריה]
  [✏️ תבנית מותאמת אישית]

Each template card:
  - Cream background, 16px radius, border 1px --color-border-default
  - Emoji 32px + label Heebo 600 14px dark
  - On select: gold border 1.5px + background --color-gold at 8% opacity
  - "עריכה" link on selected card to modify text

[→ המשיכו button — enabled when template selected]
```

**CRITICAL RULE — enforced in all templates:**
All templates must begin with: `💍 משפחה וחברים יקרים!`
Never with a personal name (e.g. `שלום משה,`).
This rule is enforced in `PhoneMockup` component (auto-prepends if missing) AND in the admin API (validates before queue insertion).

## Step 2 — Audience Selection

```
[Title: "למי שולחים?" H3]
[FilterChipRow — multi-select mode]
  "כולם" | "צד הכלה" | "צד החתן" | "לא ענו" | "VIP"
[Count: "הודעה תישלח ל-42 אורחים" — dynamic, Heebo 400 14px muted]
[Phone number preview table — first 5 in audience]
```

## Step 3 — Preview

```
[Title: "כך תיראה ההודעה" H3]
[PhoneMockup component — 320px width]
  [Live preview of composed message]
[Edit mode: textarea below mockup to modify message text]
```

## Step 4 — Send / Queue

```
[Title: "מוכנים לשלוח?" H3]
[Summary: "X הודעות לX אורחים"]
[Audience list scrollable — names + phone numbers]
---
Per guest row:
  [Name] [Phone] [wa.me link button: "שלח WhatsApp"]
  [Status pill: pending / sent]
---
[Mark All Sent button — secondary]
```

**WhatsApp send mechanism:** Opens `https://wa.me/972[phone]?text=[encoded_message]` in new tab per guest. Admin manually confirms each send. No automated sending (Israeli regulations + best practices).

## Accessibility
- Step indicator: `role="tablist"` with `role="tab"` per step, `aria-selected`, `aria-current="step"`
- PhoneMockup: `aria-label="תצוגה מקדימה של הודעת WhatsApp"`

---

# SCREEN E4-S3 — Guest Management Table

**Admin sidebar active item: "אורחים"** (OPP-006)

## Purpose
Admin views and manages all guests for a selected event.

## Entry Points
- Sidebar "אורחים" nav
- Event card "פרטים" button

## Layout (1280px desktop)

```
[Header: "ניהול אורחים — [event name]" H2]
[KPI strip: "124 סה"כ" | "98 מגיעים" | "18 ממתינים" | "8 לא מגיעים" | "62 שובצו"]
---
[Toolbar row]
  [FilterChipRow — status filter]
  [Search input]
  [GoldCTA sm: "+ הוסיפו אורח"]  ← ONE CTA, in header/toolbar only
  [Import Excel button — secondary]
---
[Data table]
  [Columns: שם | טלפון | סטטוס | צד | שולחן | פעולות]
  [Rows: per guest]
  [Pagination: 50 per page, "עמוד 1 מתוך 3"]
---
```

## Table Column Specifications

| Column | Width | Content |
|---|---|---|
| שם | 200px flex | Name (Heebo 600 15px dark) + email (Heebo 300 12px muted) below |
| טלפון | 150px | Formatted phone + wa.me icon link |
| סטטוס | 120px | StatusPill (confirmed/pending/declined) |
| צד | 80px | "כלה" / "חתן" badge or empty |
| שולחן | 80px | TableNumberChip |
| פעולות | 120px | Edit icon + Delete icon |

## CTA Fix (Validation Report)

**ONLY ONE WAY TO ADD A GUEST:**
- GoldCTA sm in the toolbar area: `+ הוסיפו אורח`
- The sticky floating bottom CTA that was previously a duplicate is REMOVED

## Responsive — Mobile Table (sm breakpoint)

Each table row becomes a card:
```css
@media (max-width: 640px) {
  thead { display: none; }
  tr {
    display: flex;
    flex-direction: column;
    background: var(--color-cream);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 8px;
  }
  td::before {
    content: attr(data-label);
    font-size: 11px;
    color: var(--color-muted);
    display: block;
  }
}
```

## Loading States
- 10 table row skeletons: horizontal cream bars, 56px height each, animate-pulse

## Empty State (no guests for this event)

```
[BotanicalDivider sprig — centred]
"עדיין אין אורחים" — Frank Ruhl Libre 700 24px dark
"הוסיפו אורחים ידנית או ייבאו מ-Excel" — Heebo 300 14px muted
[GoldCTA: "+ הוסיפו אורח ראשון"]
[text link: "ייבוא מ-Excel"]
```

## Add Guest Modal — Field Specification (OPP-009)

```
Modal title: "הוסיפו אורח" Frank Ruhl Libre 700 22px
---
FloatingLabelInput: "שם מלא" — required
FloatingLabelInput: "מספר טלפון" — inputMode="numeric", type="tel", optional
[Select dropdown: "מאיזה צד?"]
  Options (Hebrew, explicit):
  - "צד הכלה"
  - "צד החתן"  
  - "משותף / לא ידוע"  ← default
[NumberStepper: "כמה אנשים?" default 1, range 1–10]
  Label below stepper: "כולל האורח הזה"
---
[GoldCTA lg fullWidth: "הוסיפו אורח"]
[text link centred: "ביטול"]
```

**"צד" field rationale:** The label "צד" alone is ambiguous. Parents and non-technical users cannot infer the reference frame. "מאיזה צד?" with explicit options "צד הכלה" / "צד החתן" / "משותף" is unambiguous in Hebrew wedding context.

**Accessibility:** Modal uses focus trap (COMP pattern). Escape closes. Focus returns to "+ הוסיפו אורח" on close.

## Error States
- Delete guest: confirmation dialog before deletion
- Import fails: WarmAlertCard urgency='high' with specific error (row number, reason)

## Business Rules
- Delete requires confirmation: "אתם בטוחים שאתם רוצים למחוק את [name]? פעולה זו לא ניתנת לביטול."
- Guest with confirmed RSVP: delete button shows warning icon instead of direct delete — requires extra confirmation
- Phone numbers: stored without formatting, displayed formatted

---

# SCREEN E4-S4 — Seating Management

**Admin sidebar active item: "הושבה"** (OPP-006)

## Purpose
Admin assigns guests to tables using a visual drag-and-drop floor plan.

## Entry Points
- Sidebar "הושבה" nav
- Event card "הושבה" button

## Layout (1280px desktop — two-panel)

```
[Right panel — 320px — Unassigned guests]  |  [Left panel — flex — Floor plan]

Right panel:
  [Header: "ממתינים להושבה (26)" H3]
  [Search input]
  [Guest list — GuestCard sm × N, draggable]

Left panel:
  [Header: "תרשים אולם" H3 + "שמרו" GoldCTA sm]
  [Table count: "14 שולחנות · 62/124 שובצו"]
  [Floor plan grid — scroll container]
    [Round table cards × N — see spec below]
```

## RTL Drag Direction Note
In RTL layout: unassigned list is on the RIGHT, floor plan is on the LEFT.
Drag direction: RIGHT → LEFT (natural RTL drag).
This is correct — engineer must configure dnd-kit or react-beautiful-dnd for RTL direction.

## Round Table Card Specification

```
Card: circle shape (equal width/height), 100px diameter
Variants:
  empty (0 seats assigned): cream background, dashed border --color-border-default
  partial: cream background, solid border --color-border-default, opacity 1.0
  full (all seats assigned): StatusPill 'confirmed' colours, slightly pulsing border
  selected (drop target active): gold border 2px, gold glow box-shadow 0 0 12px rgba(197,164,109,0.4)

Inside circle:
  Table number: Frank Ruhl Libre 700 18px --color-dark, centered
  Seat count: "4/8" Heebo 300 12px --color-muted, below number
```

## Floor Plan Grid Fix (Validation Report)

All table cards must be visible without horizontal clipping.

```css
.floor-plan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
  max-height: calc(100vh - 200px);
}
```

This ensures tables reflow to show all cards without clipping at any viewport width within the left panel.

## Drag & Drop Behaviour
- Guest card from right panel: draggable
- Table card: drop target
- On successful drop: guest moves to table, guest count updates, table card re-renders with new count
- On over-capacity drop: table card shows red flash + "שולחן מלא" tooltip, guest returns to right panel
- On drag cancel (Escape): guest returns to original position

## Unassigned Guest List
- Shows only guests with `rsvp_status = 'confirmed'` and `seating_assignment = null`
- Sorted by side (bride/groom) then name
- If all confirmed guests are seated: empty state "כל האורחים שובצו! 🎉"

## Save Behaviour
- Seating assignments are NOT auto-saved
- "שמרו" CTA triggers batch save of all current assignments
- Optimistic update during save: CTA shows loading, floor plan disabled
- On success: WarmAlertCard urgency='low' — "השינויים נשמרו ✓"

## Loading States
- Right panel: 5 GuestCard skeletons
- Left panel: grid of circular grey placeholders, animate-pulse

## Accessibility
- Drag and drop: keyboard alternative — each guest card has a "הושיבו" button that opens a popover with table number selector
- Drop zones: `aria-dropeffect="move"`, `aria-label="שולחן [number], [count] מתוך [capacity] מקומות"`

---

*E4 Screen Specifications | Chief of Staff | 2026-06-27*
