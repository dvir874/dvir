# Wave 1 — Design Pack
## The Guest Journey | רגע לפני
## Chief of Staff | 2026-06-26

---

## Status

```
[✅] Research Complete
[✅] Executive Brief Complete
[✅] User Journey Mapped
[✅] Design Dependency Analysis Complete
[✅] 3 Stitch Prompts Ready (copy → paste)
[⏳] Awaiting: CEO runs prompts in Stitch → returns results
[  ] Design Review
[  ] CEO Approval
[  ] Implementation
[  ] QA + Accessibility + Performance
[  ] Release
```

---

## Full User Journey Map

```
Guest Journey (Wave 1 scope):
═══════════════════════════════════════════════════════

[COUPLE side — out of scope for Wave 1]
  Admin sends RSVP → WhatsApp message sent

[GUEST side — Wave 1 scope]
  1. WhatsApp message arrives         (not designed — system default)
  2. Guest taps link
  3. → RSVP LOADING SCREEN            [Screen A]
  4. → RSVP FORM                      [Screen B] ← main experience
       Guest sees: couple name, their name, event date/venue
       Guest chooses: ✓ מגיע  or  ✗ לא יכול
       If YES → guest count + meal preference → submit
       If NO  → single tap submit
  5a. → CONFIRMED STATE               [Screen C]
       Table number (if assigned)
       Add to calendar
       Waze navigation
  5b. → DECLINED STATE                [Screen D]
       Warm, gracious, not empty
  6.  Guest re-opens link:
       → ALREADY RESPONDED STATE      [Screen E]
  7.  Invalid link:
       → ERROR STATE                  [Screen F]

Post-RSVP guest journey (Wave 2+ scope):
  8.  Wedding day arrives
  9.  Guest arrives at venue
  10. Memory upload: /memory/[token]   [Future wave]
  11. Gallery view: /gallery/[token]   [Future wave]
  12. Thank you message after event    [Future wave]

═══════════════════════════════════════════════════════
```

---

## Design Dependency Analysis

### Screens (6 total)
```
A. Loading Screen         — spinner + brand mark
B. RSVP Form             — main experience (2 states: before/after choice)
C. Confirmed State        — celebration, table, calendar, waze
D. Declined State         — gracious, warm
E. Already Responded      — shows their answer, calendar/waze if confirmed
F. Error State            — invalid link, warm language
```

### Components
```
BrandMark          — "רגע לפני" wordmark, small and elegant
EventCard          — couple name + date + venue display
GuestGreeting      — "שמחים להזמין אתכם, [name]"
ChoiceButton       — confirm (gold filled) + decline (outlined)
GuestCountStepper  — 1–8 selection, elegant
MealChips          — 4 meal options as chips
SubmitButton       — full width, gold, loading state
ConfirmationHero   — celebration moment header
TableBadge         — "שולחן 7" styled display
ActionButton       — calendar + waze variants
DeclinedHero       — gracious decline header
StatusCard         — "already responded" with their previous answer
ErrorIllustration  — brand-consistent error visual
```

### States per Interactive Component
```
ChoiceButton:
  default / hover / selected-confirm / selected-decline / disabled

GuestCountStepper:
  1 selected / 2 selected / max=8 reached / increment / decrement

MealChips:
  default / selected / multiple selected (none mandatory)

SubmitButton:
  idle / loading / success

ActionButton (calendar/waze):
  default / hover / pressed
```

### Animations
```
Page load:      brand mark fades in → content slides up (300ms ease)
Choice select:  button expands to fill → sub-options slide down (250ms)
Form submit:    button shows spinner → screen transitions to confirmation (400ms)
Confirmation:   hero content fades in sequentially (stagger 80ms)
Table badge:    scale in with subtle bounce (350ms)
```

### Responsive Variants
```
375px:  primary design
390px:  identical (same breakpoint)
430px:  slight padding increase
768px:  centered card (max 480px), rest of screen = brand background
1280px: same as tablet — this is a mobile-only experience
```

### Real Content Scenarios
```
Scenario 1 — Large family:
  Guest: "משפחת כהן" (family group)
  Count: 4 guests
  Meal: mixed (some regular, some mehadrin)
  Table: 7

Scenario 2 — Solo young guest:
  Guest: "גלי לוי"
  Count: 1 guest
  Meal: vegetarian
  Table: 12

Scenario 3 — Declining guest:
  Guest: "דוד ורות ברק"
  Status: declined
  Reason: no reason given (private)
```

---

## 3 Stitch Prompts — Ready to Copy

---

### PROMPT A — Luxury Editorial
*Copy this entire block into Stitch*

```
Design a premium Hebrew mobile RSVP experience for an Israeli wedding app.

BRAND: "רגע לפני" (Rega Lifnei) — luxury Israeli wedding management SaaS.

DESIGN DIRECTION: Luxury Editorial
Inspired by: high-end wedding magazine editorial design, luxury print invitation cards, Condé Nast aesthetics applied to mobile.
Feel: refined, quiet confidence, old-money luxury. Every element earns its place.
Visual language: generous white space, strong typographic hierarchy, restrained use of gold as a luxury signal — not decoration.
Typography leads. Layout breathes. Nothing unnecessary.

BRAND TOKENS (use exactly):
  Background: #FDFAF5 (ivory)
  Surface/cards: #F6F1E8 (cream)
  Primary accent: #C5A46D (gold)
  Secondary: #6B7B5A (olive)
  Text: #1C1008 (near black)
  Fonts: Frank Ruhl Libre (headings, serif, 700-900) + Heebo (body, 300-600)
  Direction: RTL (Hebrew, right-to-left)
  Radius: 16px cards, 12px buttons
  Shadow: 0 2px 12px rgba(28,16,8,0.08)

DEVICE: 375px mobile, portrait. Max width 480px centered.

DESIGN 6 FRAMES:

FRAME 1 — Loading
  Center: "רגע לפני" brand wordmark (Frank Ruhl Libre, gold, elegant)
  Below: single thin gold horizontal line animating (not a spinner — editorial loading)
  Background: ivory #FDFAF5
  No other elements.

FRAME 2 — RSVP Form (before choice)
  Top: "רגע לפני" small wordmark (10px, gold, spaced letters: ר ג ע  ל פ נ י)
  Divider: single gold line
  Couple name: "חתונת ענבל ונדב" — Frank Ruhl Libre, 900 weight, 32px, dark #1C1008, centered
  Date: "יום שישי | כ״ה בתמוז | 20.07.2026" — Heebo 300, 13px, muted gold, centered, letter-spaced
  Venue: "אולם טל שרון, רמת גן" — Heebo 400, 14px, olive #6B7B5A, centered
  Divider: thin gold line
  Guest greeting: "שמחים להזמין אתכם" — Heebo 300, 16px, muted
                  "משפחת כהן" — Frank Ruhl Libre 700, 20px, dark
  Large space
  Two choice cards (stacked, full width):
    Card 1 — CONFIRM: cream background, gold left border (4px), "כן, נשמח להגיע ✓" — Frank Ruhl Libre 700, 18px, dark. Height: 64px.
    Card 2 — DECLINE: ivory background, very subtle border, "מצטערים, לא נוכל ✗" — Heebo 400, 16px, muted. Height: 56px.

FRAME 3 — RSVP Form (after choosing YES, showing sub-options)
  Same header as Frame 2.
  CONFIRM card: now selected state — full gold background, white text, checkmark icon.
  Below CONFIRM card, slides down:
    "מספר אורחים" label — Heebo 600, 12px, uppercase, letter-spaced
    Guest count chips: 1  2  3  4  5  6  7  8 (horizontal scroll if needed)
    "1" chip selected by default (gold bg, white text). Others: cream bg, dark text.
    Spacer
    "העדפת מנה" label — same style
    Meal chips (2×2 grid):
      🍽️ רגיל   🥗 צמחוני
      🌱 טבעוני  ✡️ כשר מהדרין
    "אישור" button — full width, gold background, white Heebo 600, 18px, 56px height, radius 12px

FRAME 4 — Confirmed State
  Full screen: ivory background
  Top section (cream surface, no hard edge — gentle transition):
    Small: "✦" centered, gold
    "תודה שאישרתם! 💛" — Frank Ruhl Libre 900, 28px, dark, centered
    "מחכים לכם ביום המיוחד" — Heebo 300, 16px, muted, centered
  Event summary card (cream bg, 16px radius, gold left accent line):
    "חתונת ענבל ונדב"
    "יום שישי, 20.07.2026 | אולם טל שרון"
  Table badge (centered, prominent):
    Cream card, gold border 1.5px
    "מקום ישיבה שלכם" — 11px, muted, uppercase
    "שולחן 7" — Frank Ruhl Libre 900, 36px, gold
  Two action buttons (stacked):
    "📅 הוסיפו ליומן Google" — outlined gold button, full width
    "🚗 נווטו לאולם — Waze" — outlined olive button, full width
  Footer: "2 אורחים רשומים" — 12px, muted, centered

FRAME 5 — Declined State
  Ivory background, calm and warm.
  Top: thin gold line
  Icon: a soft diamond/rhombus in muted gold (not an X, not an error icon)
  "קיבלנו את תגובתכם" — Frank Ruhl Libre 700, 24px, dark, centered
  "חבל שלא תוכלו להגיע —" — Heebo 300, 16px, muted
  "מאחלים לכם כל טוב 💛" — Heebo 400, 16px, warm
  Spacer
  Event card (smaller, more subdued than confirmed state):
    "חתונת ענבל ונדב | 20.07.2026"
  Bottom: nothing. Respect the decision. No CTA.

FRAME 6 — Error State
  Center screen:
  "רגע לפני" brand mark
  Thin gold line
  "הקישור אינו תקין" — Frank Ruhl Libre 700, 24px
  "ייתכן שהקישור פג תוקפו." — Heebo 300, 15px, muted
  "פנו לזוג לקבל קישור חדש." — Heebo 400, 15px
  Nothing else. Clean.

DESIGN RATIONALE to include:
Explain why the editorial approach serves the goal of feeling like a physical invitation.
Explain the typographic hierarchy choices.
Explain the choice to use cards vs form fields.
Explain why the decline state has no CTA.

DESIGN QA — verify before submitting:
[ ] Premium
[ ] Trust
[ ] Mobile RTL
[ ] Accessibility (44px targets, AA contrast)
[ ] Visual hierarchy clear
[ ] Brand consistent (#FDFAF5 #F6F1E8 #C5A46D #6B7B5A #1C1008)
[ ] Emotional (confirmed feels like celebration, declined feels gracious)
[ ] Simplicity (nothing unnecessary)
[ ] White space generous
[ ] Delight (one unexpected moment of beauty per screen)
```

---

### PROMPT B — Modern Minimal
*Copy this entire block into Stitch*

```
Design a premium Hebrew mobile RSVP experience for an Israeli wedding app.

BRAND: "רגע לפני" (Rega Lifnei) — luxury Israeli wedding management SaaS.

DESIGN DIRECTION: Modern Minimal
Inspired by: Apple Human Interface, Linear's product design, Notion's clarity.
Feel: confident whitespace, precision, nothing decorative that doesn't serve function.
Visual language: large text, plenty of breathing room, one strong accent moment per screen.
The gold is used ONCE per screen as the primary signal — not scattered.

BRAND TOKENS (use exactly):
  Background: #FDFAF5 (ivory)
  Surface/cards: #F6F1E8 (cream)
  Primary accent: #C5A46D (gold)
  Secondary: #6B7B5A (olive)
  Text: #1C1008 (near black)
  Fonts: Frank Ruhl Libre (headings, serif, 700-900) + Heebo (body, 300-600)
  Direction: RTL (Hebrew, right-to-left)

DEVICE: 375px mobile, portrait.

DESIGN 6 FRAMES:

FRAME 1 — Loading
  White screen. Center: gold diamond "✦" symbol only.
  Below: "רגע לפני" in Heebo 300, 11px, letter-spaced, muted gold.
  Minimal. Confident.

FRAME 2 — RSVP Form (main)
  Large top padding (40px+).
  "רגע לפני" — Heebo 300, 11px, gold, letter-spaced. Top right.
  Headline block:
    "חתונת ענבל ונדב" — Frank Ruhl Libre 900, 38px, dark, RTL
    "יום שישי, 20 ביולי 2026" — Heebo 300, 15px, olive
    "אולם טל שרון, רמת גן" — Heebo 300, 14px, muted
  Large spacer.
  Greeting: "משפחת כהן, אנחנו שמחים להזמין אתכם" — Heebo 400, 16px
  Large spacer.
  Two large tap targets (full width, 72px height each, stacked with 12px gap):
    "אגיע ✓" — Frank Ruhl Libre 700, 22px. Default: cream bg + dark border. Selected: gold bg, white text.
    "לא אגיע" — Heebo 400, 18px. Default: ivory bg + subtle border. Selected: dark bg, white text.
  [After YES selected, animate in below:]
    Clean segmented control for guest count (1-2-3-4-5+)
    4 full-width meal selection rows (icon + label + checkbox)
    "אישור" — full width gold button, 56px

FRAME 3 — YES selected + sub-options shown
  (same as FRAME 2 with YES button in selected state + options revealed below)

FRAME 4 — Confirmed
  Large number/stat: "✓" in 64px gold Frank Ruhl Libre — the single gold moment.
  "אישרתם הגעה" — Frank Ruhl Libre 700, 28px, dark
  "2 אורחים | חתונת ענבל ונדב" — Heebo 300, 15px, muted
  Spacer
  If table: minimal badge:
    "שולחן ★ 7" — Frank Ruhl Libre 900, 40px, gold, centered
    "מקום ישיבה שלכם" — 11px muted below
  Spacer
  Two minimal action rows (not buttons — tappable rows with arrow):
    📅 הוסיפו ליומן
    🚗 נווטו לאולם

FRAME 5 — Declined
  Generous space.
  "קיבלנו" — Frank Ruhl Libre 700, 36px, dark (large, confident)
  "חבל שלא תוכלו הפעם 💛" — Heebo 300, 18px, muted
  Spacer
  "חתונת ענבל ונדב | 20.07.2026" — Heebo 300, 14px, olive. Understated.
  Nothing else.

FRAME 6 — Error
  "הקישור אינו תקין" — Frank Ruhl Libre 700, 28px, centered
  "פנו לזוג לקישור חדש" — Heebo 300, 16px, muted

DESIGN RATIONALE to include:
Why minimal design creates trust (less noise = more signal).
Why the large type makes the couple's name the hero.
Why segmented controls vs chip grids.
Why action rows vs buttons in confirmation.

DESIGN QA — verify:
[ ] Premium [ ] Trust [ ] Mobile RTL [ ] A11y [ ] Hierarchy
[ ] Brand [ ] Emotion [ ] Simplicity [ ] White Space [ ] Delight
```

---

### PROMPT C — Warm Romantic
*Copy this entire block into Stitch*

```
Design a premium Hebrew mobile RSVP experience for an Israeli wedding app.

BRAND: "רגע לפני" (Rega Lifnei) — luxury Israeli wedding management SaaS.

DESIGN DIRECTION: Warm Romantic
Inspired by: physical wedding invitations with wax seals, artisan stationery, the warmth of handwritten notes.
Feel: intimate, personal, like receiving a letter written just for you.
Visual language: warm cream surfaces, soft gold accents, delicate ornamental details (thin lines, small diamonds), generous warm tone.
The background is not cold white — it's the color of warm paper.

BRAND TOKENS (use exactly):
  Background: #FDFAF5 (ivory)
  Surface/cards: #F6F1E8 (cream)
  Primary accent: #C5A46D (gold)
  Secondary: #6B7B5A (olive)
  Text: #1C1008 (near black)
  Fonts: Frank Ruhl Libre (headings, serif, 700-900) + Heebo (body, 300-600)
  Direction: RTL (Hebrew, right-to-left)

DEVICE: 375px mobile, portrait.

DESIGN 6 FRAMES:

FRAME 1 — Loading
  Cream background (#F6F1E8).
  Center: animated gold ring / wedding band illustration (simple, thin line art).
  Below: "רגע לפני" — Frank Ruhl Libre 400, 16px, gold.
  Warmth from the background itself.

FRAME 2 — RSVP Form
  Cream (#F6F1E8) background — feels like paper.
  Top ornament: thin gold line + "✦" + thin gold line (centered decorative divider)
  "רגע לפני" — 10px, gold, letter-spaced
  Second ornamental divider
  Couple name: "חתונת ענבל ונדב" — Frank Ruhl Libre 900, 30px, dark. Centered.
  Below couple name: two thin gold lines framing the date:
    "יום שישי, כ״ה בתמוז תשפ״ו" — Heebo 300, 13px, muted gold, centered
    "20 ביולי 2026 | אולם טל שרון, רמת גן" — Heebo 300, 13px, olive, centered
  Ornamental divider (thinner)
  Guest greeting (centered):
    "שמחים להזמין אתכם" — Heebo 300, 15px, muted italic
    "משפחת כהן" — Frank Ruhl Libre 700, 22px, dark
    "❤️" centered below name
  Large spacer
  Two rounded choice buttons (full width, 64px, 24px radius — rounder = warmer):
    CONFIRM: "כן, נשמח להגיע!" — gold background, ivory text, Frank Ruhl Libre 700, 18px
    DECLINE: "מצטערים, לא נוכל" — ivory background with cream border, dark text, Heebo 400, 16px
  [After YES:]
    "כמה אורחים?" — Heebo 600, 14px, muted, centered
    Round chip row: 1  2  3  4  5  6  7  8 (gold selected chip)
    "העדפת מנה (לא חובה):" — Heebo 300, 13px
    4 chips: 🍽️ רגיל | 🥗 צמחוני | 🌱 טבעוני | ✡️ כשר מהדרין
    Gold submit button

FRAME 3 — YES + sub-options
  Same as FRAME 2 with revealed options.

FRAME 4 — Confirmed
  Cream background.
  Top: small floating hearts or gold sparkles (3–5, very subtle, not tacky)
  Ornamental divider
  "תודה שאישרתם!" — Frank Ruhl Libre 900, 28px, dark, centered
  "❤️" — centered, 24px
  "מחכים לכם ביום המיוחד" — Heebo 300, 16px, muted, centered
  Ornamental divider
  Event detail card (ivory surface on cream bg, rounded 20px):
    "חתונת ענבל ונדב"
    "יום שישי, 20.07.2026"
    "אולם טל שרון, רמת גן"
  If table (warm badge):
    Cream oval with gold border:
      "שולחן שלכם" — 11px muted
      "7" — Frank Ruhl Libre 900, 48px, gold
  Two warm buttons:
    "📅 הוסיפו ליומן Google"
    "🚗 נווטו לאולם — Waze"
  Footer: ornamental divider + "2 אורחים רשומים" — 12px muted

FRAME 5 — Declined
  Cream background, warm and unhurried.
  Ornamental divider (very thin)
  "קיבלנו את תגובתכם" — Frank Ruhl Libre 700, 24px, dark, centered
  "חבל שלא תוכלו הפעם." — Heebo 300, 16px, muted, centered
  "מאחלים לכם כל טוב 💛" — Heebo 400, 16px, warm gold, centered
  Small spacer
  Thin divider
  Event name + date (subtle, small, olive text)
  Thin divider
  Blank space. Let it breathe.

FRAME 6 — Error
  Cream background.
  Ornamental divider
  "הקישור אינו תקין" — Frank Ruhl Libre 700, 24px, centered
  "ייתכן שהקישור פג תוקפו." — Heebo 300, 15px, muted, centered
  "פנו לזוג לקבל קישור חדש." — Heebo 400, 15px, centered
  Ornamental divider

DESIGN RATIONALE to include:
Why cream background instead of ivory creates warmth.
Why ornamental dividers evoke printed invitations.
Why round buttons (24px radius) feel more inviting.
Why the table number is shown as a large number — it becomes a reveal moment.

DESIGN QA — verify:
[ ] Premium [ ] Trust [ ] Mobile RTL [ ] A11y [ ] Hierarchy
[ ] Brand [ ] Emotion [ ] Simplicity [ ] White Space [ ] Delight
```

---

## CoS Recommendation (Before CEO Direction)

| Direction | Strength | Risk |
|-----------|---------|------|
| A — Luxury Editorial | Highest perceived quality, timeless | May feel cold to older guests |
| **B — Modern Minimal** | **Most universally accessible, fastest to read** | **May feel too plain for wedding context** |
| C — Warm Romantic | Most emotionally resonant for the occasion | Risk of ornamental overload |

**CoS recommends: Direction C (Warm Romantic)** as primary, with specific restraint guidelines.

Rationale: The RSVP page is experienced at a moment of emotional excitement (just received wedding invite). The warm romantic direction meets that emotional context. The ornaments are a proven convention in wedding design. Accessibility risk is manageable with careful execution.

**CEO makes the final call.**

---

## What Happens After CEO Returns Stitch Results

1. CoS runs Design QA (11-point checklist)
2. CoS prepares Implementation Plan
3. CEO reviews Implementation Plan
4. CEO approves → Claude implements Pixel Accurate
5. QA + Accessibility + Performance review
6. Executive Review
7. Release

---

*Wave 1 Design Pack | Chief of Staff | 2026-06-26*
