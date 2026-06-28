# System Specifications
## רגע לפני | Engineering Source of Truth | 2026-06-27
## These specifications resolve all 5 blocking issues from Validation Report

---

# SYS-01 — BREAKPOINTS

The product uses Next.js 14 with Tailwind CSS. Breakpoints align to Tailwind defaults.

| Name | Min Width | Use Case |
|---|---|---|
| `sm` | 390px | Minimum supported mobile (iPhone SE) |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / laptop |
| `xl` | 1280px | Desktop (primary admin breakpoint) |
| `2xl` | 1536px | Wide desktop |

**Rules:**
- Guest experience (E2): designed for mobile → `sm`. Usable at `md`. Not optimised above.
- Couple experience (E3): designed for mobile → `sm`. Usable at `md`. Not optimised above.
- Marketing (E1): designed for desktop → `xl`. Must be usable at `sm` with graceful degradation.
- Admin (E4): designed for desktop → `xl`. Must be usable at `md` (priority). Basic at `sm`.

**Viewport meta (all pages):**
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**WCAG 1.4.4 COMPLIANCE NOTE (Fix P0-001, 2026-06-28):** `maximum-scale=1` was removed. It prevented users from zooming on any device, violating WCAG 2.1 SC 1.4.4 (Resize Text, Level AA). Do NOT re-add `maximum-scale`, `user-scalable=no`, or any equivalent zoom-prevention attribute. Pinch-to-zoom must remain enabled on all pages.

---

# SYS-02 — COLOUR TOKENS

These are the only colours used in the product. No inline hex values in components.

```css
/* Brand palette */
--color-ivory:   #FDFAF5;   /* page backgrounds */
--color-cream:   #F6F1E8;   /* card backgrounds, input backgrounds */
--color-gold:    #C5A46D;   /* primary actions, accents, countdown */
--color-gold-dark: #A8873A; /* gold pressed / hover state */
--color-olive:   #6B7B5A;   /* secondary actions, botanical elements, category-complete state */
--color-dark:    #1C1008;   /* primary text, dark sidebar */
--color-muted:   #9A8878;   /* secondary text, captions, placeholders */

/* Semantic colours — status system */
--color-status-confirmed:  #4A7C59;  /* guest confirmed / task complete */
--color-status-pending:    #C5A46D;  /* awaiting — reuses gold */
--color-status-declined:   #9A8878;  /* declined — reuses muted */
--color-status-urgent:     #B85C38;  /* alerts, overdue, critical tasks */
--color-status-info:       #5B7FA6;  /* informational, non-urgent */

/* Semantic colours — UI states */
--color-gold-text:         #8B6914;  /* gold TEXT on ivory — WCAG AA compliant (4.7:1) */
--color-focus-ring:        #8B6914;  /* focus outline, 2px solid — also WCAG compliant */
--color-border-default:    #E8E0D4;  /* card borders, input borders */
--color-border-strong:     #C5A46D;  /* selected state borders */
--color-overlay:           rgba(28, 16, 8, 0.6);  /* modal backdrop */

/* Shadow tokens (Fix P1-007, 2026-06-28) — aligned with SYS-07 card spec */
--shadow-card:       0 2px 8px rgba(28, 16, 8, 0.06);    /* default card — matches SYS-07 */
--shadow-card-hover: 0 4px 12px rgba(197, 164, 109, 0.2); /* interactive hover — matches SYS-07 */
--shadow-featured:   0 4px 16px rgba(197, 164, 109, 0.35); /* pricing/featured card — matches SYS-07 */
--shadow-modal:      0 8px 32px rgba(28, 16, 8, 0.16);   /* modal, bottom sheet */
--shadow-cta:        0 4px 12px rgba(197, 164, 109, 0.4); /* GoldCTA hover — matches COMP-02 */
```

**RULE — Green semantic conflict resolution:**
- `--color-status-confirmed` (#4A7C59) is ONLY used for: RSVP confirmed status pill, guest confirmed status pill, completed task checkmarks, completed milestone indicators.
- `--color-olive` (#6B7B5A) is used for: completed checklist category chips, botanical illustrations, secondary CTAs.
- These two greens must never appear in the same context to mean the same thing.
- NEVER use raw `green` or Tailwind's `green-*` classes.

**WCAG Contrast — RESOLVED (External Validation R1):**
- `#C5A46D` on `#FDFAF5` = contrast ratio 2.25:1 — FAILS WCAG AA for all text sizes.
- Resolution: gold TEXT uses `--color-gold-text: #8B6914` (ratio 4.7:1 against ivory — passes AA).
- Gold as non-text (borders, arc strokes, icons, backgrounds) remains `#C5A46D`.
- Gold CTAs: white (#FFFFFF) on `--color-gold` (#C5A46D) background = 3.0:1 — acceptable for large CTA text (≥18px bold). Use `font-weight: 700` minimum.
- Rule: `--color-gold` (#C5A46D) = accent, borders, strokes, fills. `--color-gold-text` (#8B6914) = any text on light background.

---

# SYS-03 — TYPOGRAPHY SCALE

Two typefaces only. No exceptions.

| Role | Family | Weight | Size | Line Height | Usage |
|---|---|---|---|---|---|
| Display | Frank Ruhl Libre | 900 | 64px | 1.0 | Countdown number, time capsule "365" |
| H1 | Frank Ruhl Libre | 700 | 32px | 1.2 | Page hero headlines ("שלום ענבל ונדב") |
| H2 | Frank Ruhl Libre | 700 | 24px | 1.3 | Section headers, card titles |
| H3 | Frank Ruhl Libre | 700 | 20px | 1.4 | Sub-section headers |
| Body Large | Heebo | 400 | 18px | 1.6 | Primary body text |
| Body | Heebo | 400 | 16px | 1.6 | Default body text |
| Body Small | Heebo | 300 | 14px | 1.5 | Secondary content, captions |
| Label | Heebo | 600 | 14px | 1.3 | Form labels, chip labels, pill labels |
| Caption | Heebo | 300 | 12px | 1.4 | Timestamps, meta, counts |
| Gold Italic | Frank Ruhl Libre | 700 | 22px | 1.3 | Couple name in emotional moments |

**Font loading (next/font or preconnect):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```
Frank Ruhl Libre must be loaded before LCP render — use `display: 'swap'` and preload the 700+900 weights.

**RTL Rule:** All text is Hebrew. Document direction is `dir="rtl"` on `<html>`. All component text-align defaults to `right`. Do NOT override with `text-align: left` unless showing non-Hebrew content (phone numbers, prices in LTR format are acceptable as inline-start).

---

# SYS-04 — BOTTOM NAVIGATION (MOBILE)

This specification applies to all authenticated couple (E3) and guest (E2) area screens.

**Structure: 4 icons, fixed positions, fixed labels**

| Position | Icon | Label Hebrew | Route | Active Condition |
|---|---|---|---|---|
| 1 (rightmost in RTL) | 🏠 Home | בית | `/couple/[token]` | path === `/couple/[token]` |
| 2 | 👥 Guests | אורחים | `/couple/[token]/guests` | path.startsWith guests |
| 3 | ✅ Checklist | משימות | `/couple/[token]/checklist` | path.startsWith checklist |
| 4 (leftmost in RTL) | 🔧 More | עוד | opens bottom sheet menu | never active |

**Visual specification:**
- Height: 64px (including safe area padding)
- Background: `--color-ivory` with `border-top: 1px solid --color-border-default`
- Safe area: `padding-bottom: env(safe-area-inset-bottom)` — required for iPhone notch/Dynamic Island
- Icon size: 24×24px SVG
- Active state: icon fills to `--color-gold`, label changes to `--color-gold`, font-weight 600
- Inactive state: icon stroke `--color-muted`, label `--color-muted`, font-weight 300
- Tab indicator: 2px gold line at top of active tab (not bottom — consistent with RTL reading direction)
- Label font: Heebo 300 → 600 active, 10px, no truncation

**"עוד" (More) bottom sheet contents:**
- גלריה → `/gallery/[token]`
- קפסולת הזמן → `/couple/[token]/time-capsule`
- ספקים → `/couple/[token]/vendors`
- מתנות → `/couple/[token]/gifts`
- הדפסה → `/couple/[token]/print`
- יציאה → logout

**Post-event state override (daysLeft < 0):**
Bottom nav replaces "משימות" with "זכרונות" → `/couple/[token]/memory-wall`

**Guest experience navigation (E2):**
Guest area screens do NOT use this bottom nav. Guest experiences are single-purpose flows with back navigation only. No persistent bottom nav in E2.

---

# SYS-05 — PROGRESS VISUALIZATION

**DECISION: Circular arc only. Linear progress bar is eliminated.**

The circular SVG arc is the single progress visualization system for this product.

**Specification:**

```
Size:          120×120px (large) / 80×80px (medium) / 48×48px (small)
Track:         stroke-width 8px, color --color-border-default
Fill arc:      stroke-width 8px, color --color-gold
Start angle:   -90° (12 o'clock position)
Direction:     clockwise
Center text:   percentage value in Frank Ruhl Libre 700 24px (large) / 16px (small)
Sub-text:      label in Heebo 300 12px below percentage
Animation:     stroke-dashoffset transition 0.8s ease-out on mount
```

**Usage per screen:**

| Screen | Size | Label | Value source |
|---|---|---|---|
| Dashboard hero | large 120px | "מוכנות" | `readinessPct` from briefing API |
| Checklist page | large 120px | "הושלם" | `completedTasks / totalTasks * 100` |
| Guest center | medium 80px | "אישרו" | `confirmedGuests / totalGuests * 100` |
| RSVP confirmation | small 48px | "מגיעים" | static from event data |

**What replaces the former linear bar on the dashboard:**
The readiness meter at the top of the below-fold couple dashboard switches from a `<progress>` element to the 120px circular arc. The arc appears centered above the 2×2 quick action grid with "מוכנות — 71%" below the percentage.

---

# SYS-06 — FORM FIELD SPECIFICATION (FLOATING LABEL PATTERN)

All form inputs in the product must use the floating label pattern.

**States:**

| State | Label position | Label size | Label colour | Border |
|---|---|---|---|---|
| Empty (unfocused) | Inside field, vertically centred | 16px Heebo 400 | `--color-muted` | 1px `--color-border-default` |
| Focused (empty) | Floated to top, 8px from top | 12px Heebo 600 | `--color-gold` | 1.5px `--color-gold` |
| Filled (unfocused) | Floated to top, 8px from top | 12px Heebo 600 | `--color-muted` | 1px `--color-border-default` |
| Error | Floated to top | 12px Heebo 600 | `--color-status-urgent` | 1.5px `--color-status-urgent` |
| Disabled | Inside field | 16px Heebo 400 | `--color-muted` at 50% | 1px dashed `--color-border-default` |

**Dimensions:**
- Height: 56px
- Border radius: 12px
- Background: `--color-cream`
- Padding: 16px horizontal, 24px top (when filled), 16px top (when empty)
- Label transition: `transform 0.15s ease, font-size 0.15s ease`

**Error message:**
- Appears below the field, not inside it
- Heebo 300 12px `--color-status-urgent`
- Prefixed with "⚠ " glyph
- aria-describedby links input to error message element

**Required fields:**
- Required indicator: gold asterisk (*) appended to the label text, not a separate element
- Never show "Required" as placeholder text

---

# SYS-07 — CARD SPECIFICATION

**Standard card:**
- Background: `--color-cream`
- Border: 1px solid `--color-border-default`
- Border radius: 16px
- Padding: 20px
- Box shadow: `0 2px 8px rgba(28,16,8,0.06)`

**Compact card (filter chips, status pills, table chips):**
- Border radius: 12px
- Padding: 8px 12px

**Featured card (pricing ₪299, selected state):**
- Background: `--color-gold`
- Border: 2px solid `--color-gold-dark`
- Text: white (#FFFFFF)
- Box shadow: `0 4px 16px rgba(197,164,109,0.35)`

**Interactive card (tap to select, checklist item):**
- Hover/focus: border changes to `--color-gold`, box-shadow increases to `0 4px 12px rgba(197,164,109,0.2)`
- Active/pressed: `transform: scale(0.98)`, transition 0.1s

---

# SYS-08 — ILLUSTRATION USAGE RULES

Two illustration modes. Engineers must know when each is used to implement fallback states correctly.

**Mode A — Real Photography:**
Used for: wedding day hero, post-event couple photo, memory wall backgrounds, RSVP confirmation screens, gallery.
Fallback when no photo: warm gradient `linear-gradient(135deg, #C5A46D22, #6B7B5A22)` on `--color-cream` background with couple initials in Frank Ruhl Libre 900 48px centered.

**Mode B — Botanical Illustration:**
Used for: welcome splash, survey header, declined RSVP, empty states, time capsule ornate elements.
Source: SVG assets, inline — not external images.
These are always present (never need a fallback).

---

# SYS-09 — ADMIN SIDEBAR SPECIFICATION

**Primary sidebar (all admin screens except WhatsApp Center):**
- Width: 240px (desktop), 0px + hamburger (tablet/mobile)
- Background: `--color-ivory`
- Border-right: 1px solid `--color-border-default`
- Logo area: 64px height, "רגע לפני" in Frank Ruhl Libre 700 18px `--color-dark`
- Nav items: Heebo 400 16px, padding 12px 20px, border-radius 8px
- Active nav item: background `--color-cream`, text `--color-dark`, left border 3px `--color-gold`
- Hover: background `--color-cream` at 60%

**Focused Task Mode sidebar (WhatsApp Center only):**
- Same width and position as primary
- Background: `--color-ivory` (NOT dark — this resolves blocker B3 from Validation Report)
- Adds: mode badge in nav header area — "🚀 מצב שליחה" — Heebo 600 12px, gold background, border-radius 20px, padding 4px 12px
- This is the ONLY difference between primary and focused task mode sidebar

**⚠️ STITCH IMAGE OVERRIDE (Fix P1-001, 2026-06-28):**
The Stitch reference image `/tmp/e4_whatsapp_warm.png` shows a DARK sidebar. This is WRONG. The Stitch image failed to render the ivory sidebar despite explicit prompting. **This spec (SYS-09) is authoritative. The Stitch image is incorrect. Implement ivory sidebar as specified above — do not follow the Stitch image for sidebar color.**
Engineer verification: sidebar background must be `--color-ivory` (#FDFAF5), not `--color-dark` (#1C1008).

---

# SYS-10 — MOTION & ANIMATION

**Timing functions:**
- Entrance: `cubic-bezier(0.0, 0.0, 0.2, 1)` (ease-out) — things entering the screen
- Exit: `cubic-bezier(0.4, 0.0, 1, 1)` (ease-in) — things leaving the screen
- Transition: `cubic-bezier(0.4, 0.0, 0.2, 1)` (ease-in-out) — state changes

**Duration:**
- Micro (button press, checkbox): 100ms
- Short (state change, hover): 150ms
- Medium (modal entrance, card expand): 250ms
- Long (page transition, circular arc fill): 400ms
- Celebration (confetti, fireworks): 600ms

**Entrance animations per component:**
- Progress arc: stroke-dashoffset from 100% to target, 800ms ease-out, delay 200ms after mount
- Counter number: count up from 0 to target over 600ms, ease-out
- Status pills: fade-in + slide from right (RTL), 200ms staggered per item
- Modal: fade-in + scale from 0.95, 250ms ease-out
- Bottom sheet: slide up from bottom, 300ms ease-out

**Reduced motion:** All animations must respect `prefers-reduced-motion: reduce`. When set, disable all transitions and animations.

---

# SYS-11 — FOCUS STATES

All interactive elements must have a visible focus state. This is an accessibility requirement (WCAG 2.1 AA).

**Standard focus ring:**
- `outline: 2px solid var(--color-focus-ring)` — resolves to `#8B6914` (4.7:1 contrast, WCAG AA ✅). NOT `--color-gold` (#C5A46D, which fails SC 1.4.11).
- `outline-offset: 2px`
- `border-radius` matches the element's border-radius

**Tailwind CSS utility (add to globals.css):**
```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring); /* #8B6914 — 4.7:1 on ivory, WCAG 2.1 SC 1.4.11 ✅ */
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```

**WCAG 1.4.11 COMPLIANCE NOTE (Fix P0-002, 2026-06-28):** The previous value was `#C5A46D` (contrast ratio 2.25:1 against ivory). WCAG 2.1 SC 1.4.11 requires 3:1 for non-text UI components including focus rings. The correct value is `var(--color-focus-ring)` which resolves to `#8B6914` (4.7:1). Do NOT hardcode `#C5A46D` here — always use the CSS variable. SYS-02 is the authoritative source for this token.

The `:focus:not(:focus-visible)` pattern removes the ring on mouse/tap (where it looks wrong) but keeps it for keyboard navigation.

**Skip link:**
Every page must include a skip-to-main-content link as the first focusable element:
```html
<a href="#main-content" class="sr-only focus:not-sr-only">דלג לתוכן הראשי</a>
```

---

# SYS-12 — LOADING STATES

Every data-dependent screen must implement a loading state that matches the warm brand.

**Skeleton pattern (recommended):**
- Use `animate-pulse` on placeholder elements
- Skeleton elements: rounded-full/rectangle in `--color-cream` on `--color-ivory` background
- Do NOT use grey skeletons — use the warm ivory/cream palette

**Loading state per screen:**

| Screen | Loading behaviour |
|---|---|
| RSVP flow | Full-screen branded loader (existing — keep as-is) |
| Couple dashboard | Skeleton: greeting line + arc placeholder + 2×2 card skeletons |
| Gallery | Masonry grid of cream rectangles at varying heights |
| Admin dashboard | KPI card skeletons + list row skeletons |
| Guest management | Table row skeletons (5 rows) |
| Seating | Two-panel skeleton: list on right, grid placeholders on left |
| Checklist | Arc skeleton + 3 category row skeletons |

**Loading copy (when skeleton is not appropriate):**
- Hebrew loading messages in Frank Ruhl Libre italic, centre of screen
- Examples: "מכינים את הפלטפורמה..." / "טוענים את האורחים שלכם..." / "מאחזרים את הנתונים..."
- Never show "Loading..." in English

---

*System Specifications v1.0 | Chief of Staff | 2026-06-27*
*These specifications override any prior design document on system-level decisions.*
*Update this document when any system-level decision changes.*
