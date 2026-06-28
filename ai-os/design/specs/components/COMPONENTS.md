# Component Specifications
## רגע לפני | Shared Component Library | 2026-06-27
## All components are Hebrew/RTL-first. No exceptions.

---

# COMP-01 — StatusPill

**Purpose:** Communicates a guest's RSVP status or a task's completion status. Single-line, read-only.

## API

```typescript
interface StatusPillProps {
  status: 'confirmed' | 'pending' | 'declined' | 'urgent' | 'info';
  label: string;  // Hebrew text
  size?: 'sm' | 'md';  // default 'md'
}
```

## States

| `status` | Background | Text | Border | Icon |
|---|---|---|---|---|
| `confirmed` | #4A7C5922 | #4A7C59 | #4A7C5944 | ✓ (checkmark) |
| `pending` | #C5A46D22 | #C5A46D | #C5A46D44 | ○ (circle outline) |
| `declined` | #9A887822 | #9A8878 | #9A887844 | — (dash) |
| `urgent` | #B85C3822 | #B85C38 | #B85C3844 | ! (exclamation) |
| `info` | #5B7FA622 | #5B7FA6 | #5B7FA644 | ℹ |

## Dimensions

- `md`: height 28px, padding 4px 10px, border-radius 20px, font Heebo 600 13px
- `sm`: height 20px, padding 2px 8px, border-radius 20px, font Heebo 600 11px

## Spacing
- Icon: 4px gap from text, 14×14px

## Accessibility
- `role="status"` or `role="img"` with `aria-label`
- Example: `aria-label="סטטוס: אישר הגעה"`
- Not keyboard-interactive (display only)

## Do
- Use for RSVP status, task status, vendor payment status
- Keep label under 12 characters for `md` size

## Don't
- Don't use for actions — StatusPill is display only, not a button
- Don't use raw hex colours — always use the `status` prop
- Don't use green StatusPill for checklist category states — use olive colour via CategoryChip

---

# COMP-02 — GoldCTA (Primary Button)

**Purpose:** The primary call to action. One per screen at maximum.

## API

```typescript
interface GoldCTAProps {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}
```

## Variants

| Variant | Background | Text | Border |
|---|---|---|---|
| Primary (default) | `--color-gold` | white #FFFFFF | none |
| Secondary | transparent | `--color-gold` | 1.5px `--color-gold` |
| Destructive | `--color-status-urgent` | white | none |

## Dimensions

| Size | Height | Min-width | Padding | Font |
|---|---|---|---|---|
| `sm` | 36px | 80px | 0 16px | Heebo 600 14px |
| `md` | 48px | 120px | 0 24px | Heebo 600 16px |
| `lg` | 56px | 200px | 0 32px | Heebo 600 18px |

- Border radius: 12px
- `fullWidth`: width 100%, min-width overridden

## States

- **Default:** gold fill, white text
- **Hover:** `--color-gold-dark`, `transform: translateY(-1px)`, box-shadow `0 4px 12px rgba(197,164,109,0.4)`
- **Active/Pressed:** `transform: translateY(0)`, box-shadow removed, 80ms transition
- **Disabled:** `opacity: 0.4`, `cursor: not-allowed`, no hover effects
- **Loading:** disabled behaviour + spinner (white, 16px, centered) replacing label

## Accessibility
- `type="button"` by default, `type="submit"` when inside a form
- Focus ring: gold outline 2px, offset 2px
- `aria-disabled="true"` when disabled (not `disabled` attribute alone — preserves focusability for screen readers to announce state)
- `aria-busy="true"` when loading

## Do
- One GoldCTA per screen (the primary action)
- Use `size="lg"` for mobile screens
- `fullWidth` on all mobile forms

## Don't
- Never use for navigation — use `<Link>` with gold styling for nav links
- Never stack two GoldCTA primaries
- Never use grey/dark background on GoldCTA

---

# COMP-03 — CircularProgressArc

**Purpose:** Visualises a percentage completion value. The ONLY progress visualization in this product.

## API

```typescript
interface CircularProgressArcProps {
  value: number;       // 0–100
  size?: 'sm' | 'md' | 'lg';  // default 'lg'
  label?: string;      // Hebrew sub-label below percentage (e.g. "מוכנות")
  animated?: boolean;  // default true
  color?: string;      // override gold (rare — only for non-standard uses)
}
```

## Dimensions

| Size | Diameter | Stroke width | Font (%) | Font (label) |
|---|---|---|---|---|
| `lg` | 120px | 8px | Frank Ruhl Libre 700 24px | Heebo 300 12px |
| `md` | 80px | 6px | Frank Ruhl Libre 700 18px | Heebo 300 10px |
| `sm` | 48px | 4px | Frank Ruhl Libre 700 13px | hidden |

## SVG Geometry

```
r = (size - strokeWidth) / 2
cx = cy = size / 2
circumference = 2 × π × r
dasharray = circumference
dashoffset = circumference × (1 - value/100)
```

Starting at top (-90° rotation on the SVG element).

## Animation

On mount: dashoffset animates from `circumference` (0%) to target value over 800ms `cubic-bezier(0.0, 0.0, 0.2, 1)`, delayed 200ms.

`prefers-reduced-motion`: skip animation, render final state immediately.

## Accessibility

```html
<svg role="img" aria-label={`${label}: ${value}%`}>
```

## Do
- Use for: dashboard readiness, checklist completion, guest confirmation rate
- Always provide a `label` prop for context

## Don't
- Never use a `<progress>` element — use this component
- Never render below 48px (sm is minimum legible size)
- Never use two arcs of the same size on the same screen

---

# COMP-04 — GuestCard (Mobile)

**Purpose:** Displays a single guest in a list or grid. Tappable to expand or navigate.

## API

```typescript
interface GuestCardProps {
  name: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'declined';
  side?: 'bride' | 'groom';
  tableNumber?: number;
  guestCount?: number;
  onTap?: () => void;
}
```

## Layout (mobile)

```
┌────────────────────────────────┐
│ [Initial]  שם האורח      [pill]│
│            📞 050-xxx   שולחן 3 │
└────────────────────────────────┘
```

- Card height: 64px minimum, auto-expanding
- Initial circle: 40×40px, background `--color-cream`, border 1px `--color-border-default`, Frank Ruhl Libre 700 18px `--color-dark`
- Name: Heebo 600 16px `--color-dark`
- Phone + table: Heebo 300 13px `--color-muted`, in-line with 16px gap
- StatusPill: rightmost (RTL start) — `sm` size

## States

- **Default:** card background `--color-cream`
- **Tapped/active:** scale 0.97, 100ms
- **Selected:** border 1.5px `--color-gold`

## Accessibility

```html
<article role="article" aria-label={`${name}, ${statusLabel}`} tabIndex={0}>
```

Focus state: gold border 2px.

---

# COMP-05 — FilterChipRow

**Purpose:** Horizontal scrollable row of mutually-exclusive filter chips. Displays a count badge.

## API

```typescript
interface FilterChip {
  key: string;
  label: string;   // Hebrew
  count?: number;
  icon?: React.ReactNode;
}

interface FilterChipRowProps {
  chips: FilterChip[];
  selected: string;
  onChange: (key: string) => void;
  scrollable?: boolean;  // default true
}
```

## Visual

- Chip visual height: 36px
- **Touch target height: 44px minimum** — achieve via `padding-top: 4px; padding-bottom: 4px` on the row, or `min-height: 44px` on each chip button (OPP-004)
- Padding: 0 14px
- Border radius: 20px (pill shape)
- Inactive: background `--color-cream`, border 1px `--color-border-default`, text `--color-muted` Heebo 400 14px
- Active: background `--color-gold`, border `--color-gold`, text white Heebo 600 14px
- Count badge: inside chip, 4px gap from label, Heebo 400 12px, muted on inactive / white on active
- Row: `display: flex`, `gap: 8px`, `overflow-x: auto`, `scrollbar-width: none`, `-webkit-overflow-scrolling: touch`
- First chip stickily visible (don't clip with padding)

## Accessibility

```html
<div role="group" aria-label="סנן לפי סטטוס">
  <button role="radio" aria-checked={selected === chip.key}>
```

---

# COMP-06 — FloatingLabelInput

**Purpose:** Form field with floating label. Implements the floating label pattern from SYS-06.

## API

```typescript
interface FloatingLabelInputProps {
  label: string;         // Hebrew label text
  name: string;
  type?: string;         // default 'text'
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;        // Hebrew error message
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  inputMode?: string;    // 'tel', 'email', 'numeric', etc.
  maxLength?: number;
}
```

## Behaviour

1. On mount: label is inside field, vertically centred, 16px Heebo 400 `--color-muted`
2. On focus OR when value is non-empty: label floats to top (8px from top), 12px Heebo 600 `--color-gold`
3. On blur with value: label stays floated, changes to `--color-muted`
4. On blur empty: label returns to centred position

## Validation

- `required` fields show gold `*` in label
- Error message renders below field with `aria-describedby` link
- Error state overrides border and label colour

## Accessibility

```html
<div>
  <input id={name} aria-required={required} aria-describedby={error ? `${name}-error` : undefined} />
  <label htmlFor={name}>{label}{required && <span aria-hidden="true">*</span>}</label>
  {error && <span id={`${name}-error`} role="alert">{error}</span>}
</div>
```

---

# COMP-07 — StarRating

**Purpose:** 5-star rating input. Default: 5 stars selected. User taps to deselect from right.

## API

```typescript
interface StarRatingProps {
  value: number;        // 0–5, default 5
  onChange: (value: number) => void;
  label?: string;       // aria-label for the group
  readOnly?: boolean;
}
```

## Visual

- 5 star icons in a row, right-to-left (RTL — first star is rightmost)
- Filled star: `--color-gold`, 28×28px
- Empty star: `--color-border-default` outline, 28×28px
- Gap: 4px between stars
- Tap target: 44×44px per star (invisible extended area)

**Default state: value=5 (all 5 stars filled gold)**

**⚠️ STITCH IMAGE OVERRIDE (Fix P1-002, 2026-06-28):**
The Stitch reference image `/tmp/e2_survey.png` shows 5 EMPTY star outlines. This is WRONG. **This spec (COMP-07) is authoritative. Default must be `value=5` — all 5 stars filled gold.** The user taps to reduce from the maximum. An empty default communicates zero satisfaction before the user has expressed anything. Do not follow the Stitch image for star default state.

## Behaviour
- Tap on star N from right: sets value to (6-N) in RTL
- Stars fill from right to left (RTL natural direction)

## Accessibility

```html
<fieldset>
  <legend>{label}</legend>
  {[5,4,3,2,1].map(n => (
    <label>
      <input type="radio" name="rating" value={n} checked={value === n} />
      <span aria-label={`${n} כוכבים`}>★</span>
    </label>
  ))}
</fieldset>
```

---

# COMP-08 — BottomNav

**Purpose:** Persistent 4-tab navigation for authenticated couple experience. Implements SYS-04.

## API

```typescript
interface BottomNavProps {
  token: string;
  activePath: string;  // current pathname for active state
  postEvent?: boolean; // if true, replaces "משימות" with "זכרונות"
}
```

## Tab Structure

```typescript
const tabs = [
  { key: 'home',      label: 'בית',      icon: HomeIcon,      href: `/couple/${token}` },
  { key: 'guests',    label: 'אורחים',   icon: GuestsIcon,    href: `/couple/${token}/guests` },
  { key: 'checklist', label: 'משימות',   icon: ChecklistIcon, href: `/couple/${token}/checklist` },
  { key: 'more',      label: 'עוד',      icon: MoreIcon,      onClick: openMoreSheet },
]
```

## Visual

- Height: `calc(64px + env(safe-area-inset-bottom))` — **safe area is mandatory, not optional** (OPP-004)
- Background: `--color-ivory`
- Border-top: 1px solid `--color-border-default`
- Active indicator: 2px `--color-gold` line at top of tab
- Tab content: icon 24px above, label 10px Heebo 300→600 active below, 4px gap
- **Each tab touch target: minimum 44×44px** — with full height of nav bar, this is guaranteed at 64px

## Responsive

- `md: (768px+)`: BottomNav is **suppressed**. Navigation moves to sidebar or inline within screen layout. This is required for tablet RSVP two-column layout (OPP-002).

## "עוד" Bottom Sheet

```typescript
const moreItems = [
  { label: 'גלריה',        href: `/gallery/${token}` },
  { label: 'קפסולת הזמן',  href: `/couple/${token}/time-capsule` },
  { label: 'ספקים',        href: `/couple/${token}/vendors` },
  { label: 'מתנות',        href: `/couple/${token}/gifts` },
  { label: 'הדפסה',        href: `/couple/${token}/print` },
  { label: 'יציאה',        action: 'logout' },
]
```

Bottom sheet: slides up from bottom, 300ms ease-out, handle bar at top, ivory background, 16px item list with border separator.

## Accessibility

```html
<nav aria-label="ניווט ראשי">
  <ul role="list">
    <li><a aria-current={active ? 'page' : undefined}>...</a></li>
  </ul>
</nav>
```

---

# COMP-09 — WarmAlertCard

**Purpose:** Displays a proactive nudge or warning without alarming the user. Warm, not clinical.

## API

```typescript
interface WarmAlertCardProps {
  type: 'seating' | 'rsvp' | 'vendor' | 'budget' | 'custom';
  message: string;       // Hebrew message text
  ctaLabel?: string;
  ctaHref?: string;
  onDismiss?: () => void;
  urgency?: 'low' | 'medium' | 'high';  // default 'low'
}
```

## Visual

| urgency | Left border colour | Background |
|---|---|---|
| `low` | `--color-gold` | `--color-cream` |
| `medium` | `#E8A84A` (amber) | `#FDF8F0` |
| `high` | `--color-status-urgent` | `#FDF5F0` |

- Card: border-radius 12px, padding 16px, border 1px `--color-border-default`, left border 3px (coloured)
- Message: Heebo 400 14px `--color-dark`
- CTA: text link, Heebo 600 14px `--color-gold`, underline on hover
- Dismiss X: top-right corner, 16×16px, `--color-muted`

## Behaviour

- Dismissable via X button
- Dismissed state persisted to localStorage by `type` key — does not re-appear in same session
- Dismissed alert reappears if underlying data condition persists after 48 hours

---

# COMP-10 — TableNumberChip

**Purpose:** Displays a table assignment for a guest or seating context.

## API

```typescript
interface TableNumberChipProps {
  number: number | string;
  variant?: 'default' | 'selected' | 'full' | 'empty';
}
```

## Visual

| variant | Background | Text | Border |
|---|---|---|---|
| `default` | `--color-cream` | `--color-dark` | 1px `--color-border-default` |
| `selected` | `--color-gold` | white | 2px `--color-gold-dark` |
| `full` | #4A7C5922 | #4A7C59 | 1px #4A7C5944 |
| `empty` | transparent | `--color-muted` | 1px dashed `--color-border-default` |

- Shape: rounded circle (min-width = height)
- Size `md`: 32×32px, Frank Ruhl Libre 700 14px
- Size `lg` (seating floor plan): 48×48px, Frank Ruhl Libre 700 18px

---

# COMP-11 — BotanicalDivider

**Purpose:** Decorative SVG botanical element used as a section separator or illustration accent. Never functional.

## API

```typescript
interface BotanicalDividerProps {
  variant?: 'branch' | 'wreath' | 'sprig';  // default 'sprig'
  size?: 'sm' | 'md' | 'lg';
  color?: string;  // default '--color-olive'
}
```

## Behaviour
- `aria-hidden="true"` always — purely decorative
- `role="presentation"`
- SVG inline, no external request

## Usage contexts
- Between onboarding steps
- Survey page header (wreath)
- Declined RSVP (branch)
- Section separators in guest experience

## Do
- Use at section boundaries to add warmth without adding content weight
- Max one botanical divider per screen scroll viewport

## Don't
- Never use as a loading indicator
- Never use in admin area (warm-but-functional, not decorative)

---

# COMP-12 — PhoneMockup

**Purpose:** Renders a preview of a WhatsApp message inside a stylised phone frame.

## API

```typescript
interface PhoneMockupProps {
  messageText: string;   // Hebrew WhatsApp message text
  senderName?: string;   // default "💍 רגע לפני"
  time?: string;         // default "עכשיו"
}
```

## Layout

- Phone frame: 320px width, 580px height, border-radius 32px, border 6px `--color-dark`
- Screen background: #E5DDD5 (WhatsApp chat background — warm beige, non-brand colour for realism)
- Message bubble: right-aligned (simulating sent message), background #DCF8C6 (WhatsApp green — intentionally off-brand for realism), border-radius 12px 12px 2px 12px, padding 10px 14px
- Message text: Heebo 400 14px `--color-dark`
- Timestamp: Heebo 300 11px `--color-muted`, bottom-right inside bubble

## Business Rule (CRITICAL)

WhatsApp message text shown in the preview must always begin with:
`💍 משפחה וחברים יקרים!`

If `messageText` does not begin with this prefix, the component prepends it automatically and logs a console warning:
```
[PhoneMockup] Warning: message must begin with "💍 משפחה וחברים יקרים!" — prefix auto-added.
```

---

*Component Specifications v1.0 | Chief of Staff | 2026-06-27*
*All components are Hebrew/RTL-first. No exceptions.*
*New components require CEO approval before creation.*
