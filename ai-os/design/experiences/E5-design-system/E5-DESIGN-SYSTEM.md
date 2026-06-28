# Experience 5 — Shared Design System
## Definition & Token Library
## Chief of Staff | 2026-06-26

---

## Philosophy

The Design System is the foundation of one coherent product.

Every component documented here was extracted from real, approved designs —
not invented in the abstract.

Pattern-first: the system grows from the product. Not the other way around.

Every token, every component, every pattern in this document was validated
by at least one approved Stitch design before being added here.

---

## Design Tokens

### Color Tokens

```
/* Brand */
--color-ivory:          #FDFAF5    /* Page background — warm, never pure white */
--color-cream:          #F6F1E8    /* Card background, section fill */
--color-gold:           #C5A46D    /* Primary actions, accents, highlights */
--color-gold-light:     rgba(197,164,109,0.12)  /* Hover state, selection bg */
--color-gold-muted:     rgba(197,164,109,0.22)  /* Borders */
--color-olive:          #6B7B5A    /* Secondary brand color */
--color-dark:           #1C1008    /* Primary text, admin backgrounds */
--color-dark-muted:     rgba(28,16,8,0.52)      /* Secondary text, placeholders */
--color-dark-faint:     rgba(28,16,8,0.12)      /* Dividers, subtle backgrounds */

/* Semantic */
--color-success:        #4A7C3F    /* Completed states */
--color-success-bg:     rgba(74,124,63,0.10)
--color-warning:        #D97706    /* Attention, not urgent */
--color-warning-bg:     rgba(217,119,6,0.10)
--color-error:          #BA1A1A    /* Errors only — use sparingly */
--color-error-bg:       #FFDAD6

/* Neutrals (for admin/desktop) */
--color-white:          #FFFFFF
--color-gray-100:       #F5F5F5
--color-gray-200:       #E5E5E5
--color-gray-500:       #737373
```

### Typography Tokens

```
/* Font Families */
--font-display: "Frank Ruhl Libre", serif   /* Headings, couple names, numbers, emotional moments */
--font-body: "Heebo", sans-serif             /* All body text, labels, inputs, navigation */

/* Display Scale (Frank Ruhl Libre) */
--text-display-xl:  font-size: 3.5rem;  font-weight: 900;  /* Couple names, hero headlines */
--text-display-lg:  font-size: 2.5rem;  font-weight: 900;  /* Page heroes, celebration states */
--text-display-md:  font-size: 2rem;    font-weight: 700;  /* Section headlines */
--text-display-sm:  font-size: 1.5rem;  font-weight: 700;  /* Card titles */
--text-display-num: font-size: 4rem;    font-weight: 900;  /* Table number reveals, countdowns */

/* Body Scale (Heebo) */
--text-body-xl:  font-size: 1.25rem;  font-weight: 500;   /* Featured body text */
--text-body-lg:  font-size: 1.125rem; font-weight: 400;   /* Primary body text */
--text-body-md:  font-size: 1rem;     font-weight: 400;   /* Standard body text */
--text-body-sm:  font-size: 0.875rem; font-weight: 400;   /* Labels, secondary text */
--text-body-xs:  font-size: 0.75rem;  font-weight: 300;   /* Captions, metadata */

/* Label Scale (Heebo) */
--text-label-lg: font-size: 0.875rem; font-weight: 600;   /* Section headers, tab labels */
--text-label-md: font-size: 0.75rem;  font-weight: 500;   /* Pill labels, badge text */
--text-label-sm: font-size: 0.625rem; font-weight: 400;   /* Fine print */
```

### Spacing Tokens

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px

/* Semantic */
--space-section:      64px   /* Between page sections */
--space-card:         24px   /* Card internal padding */
--space-card-sm:      16px   /* Small card internal padding */
--space-content:      20px   /* Page horizontal margin (mobile) */
--space-content-lg:   40px   /* Page horizontal margin (desktop) */
```

### Border Radius

```
--radius-xs:   4px    /* Chips, tags */
--radius-sm:   8px    /* Small cards, inputs */
--radius-md:   16px   /* Standard cards */
--radius-lg:   24px   /* Large cards, buttons */
--radius-xl:   32px   /* Modals, sheets */
--radius-full: 9999px /* Pills, avatars, FABs */
```

### Shadow

```
--shadow-card:      0 2px 16px rgba(28,16,8,0.06)   /* Standard card elevation */
--shadow-elevated:  0 8px 32px rgba(28,16,8,0.10)   /* Modals, floating elements */
--shadow-gold:      0 4px 16px rgba(197,164,109,0.20) /* Gold button hover */
--shadow-none:      none
```

### Motion

```
/* Duration */
--duration-instant: 0ms
--duration-fast:    150ms   /* Micro-interactions: checkbox fill, button press */
--duration-normal:  250ms   /* Standard transitions: fade, color change */
--duration-slow:    400ms   /* Page transitions, modals */
--duration-xslow:   600ms   /* Celebration animations */

/* Easing */
--ease-standard:    cubic-bezier(0.16, 1, 0.3, 1)      /* Overshoot — spring-like */
--ease-in:          cubic-bezier(0.4, 0, 1, 1)          /* Elements leaving */
--ease-out:         cubic-bezier(0, 0, 0.2, 1)           /* Elements arriving */
--ease-linear:      linear                                /* Progress bars */
```

---

## Component Library

### Component 1 — PrimaryButton

**Usage:** Every primary call-to-action across the entire product.

```
Visual:
  Background:   gold #C5A46D
  Text:         white, Heebo 600, 16px
  Height:       56px (mobile) / 48px (desktop)
  Width:        Full width on mobile, auto on desktop
  Radius:       24px
  
States:
  Default:      Gold background
  Hover:        Gold + shadow-gold (desktop only)
  Pressed:      Gold, scale(0.98), 150ms
  Loading:      White spinner in center, gold bg, text hidden
  Disabled:     Gold opacity 0.4, cursor-not-allowed

RTL:            Text right-aligned when Hebrew
```

**Examples in product:**
- "אישרו הגעה" — RSVP form
- "אטמו את הקפסולה" — Memory Upload capsule
- "התחילו עכשיו" — Landing page
- "המשיכו" — Onboarding wizard

---

### Component 2 — BrandLoadingScreen

**Usage:** Every page that fetches data before rendering. Never show blank white.

```
Visual:
  Background:   ivory #FDFAF5
  Center:       "רגע לפני" brand mark (Frank Ruhl Libre, dark, 24px)
  Below mark:   Animated gold line (width: 40px → 80px → 40px, 1.5s loop)
  
Animation:
  Line pulse:   opacity 0.4 → 1 → 0.4, ease-in-out, 1.5s, infinite
  
No text other than the brand mark.
No spinner. No progress bar. Just the brand mark and the pulse.
```

**Examples in product:**
- RSVP loading state (approved, Wave 1)
- Gallery loading
- Memory Upload loading
- Couple dashboard initial load

---

### Component 3 — OrnamentalDivider

**Usage:** Between major sections in guest-facing experiences.

```
Visual:
  Type:         "◆" diamond character
  Color:        gold #C5A46D
  Size:         16px
  Surrounding:  Thin lines (1px, gold opacity 0.3) extending left and right
  Height:       24px total
  Margin:       16px top and bottom
  
RTL:            Center-aligned, symmetric, direction-neutral
```

---

### Component 4 — StatusPill

**Usage:** Guest status, vendor status, task status throughout the product.

```
Visual:
  Height:       28px
  Padding:      0 10px
  Radius:       full (999px)
  Font:         Heebo 500, 13px

Variants:
  confirmed:  bg rgba(74,124,63,0.12), text #4A7C3F, "מגיע"
  pending:    bg rgba(217,119,6,0.12), text #D97706, "ממתין"
  declined:   bg rgba(186,26,26,0.10), text #BA1A1A, "לא מגיע"
  table:      bg rgba(197,164,109,0.15), text #C5A46D, "שולחן 7"
  done:       bg rgba(74,124,63,0.12), text #4A7C3F, "הושלם"
  locked:     bg rgba(28,16,8,0.08), text rgba(28,16,8,0.4), "🔒 נעול"
```

---

### Component 5 — GuestCard (Mobile)

**Usage:** Guest Center, mobile view.

```
Visual:
  Background:   white #FFFFFF
  Border:       1px solid rgba(197,164,109,0.20)
  Radius:       16px
  Padding:      16px
  Shadow:       shadow-card
  
Layout (RTL):
  Top row:      Guest name (Heebo 600, 16px) | StatusPill (right)
  Middle row:   Contact name + guest count (Heebo 400, 14px, muted) | TablePill
  Bottom row:   Call icon · WhatsApp icon · Edit icon (evenly spaced)
  
Tap:           Expand to show: meal preference, side, notes, phone
```

---

### Component 6 — CountdownCard

**Usage:** Mini Website, Couple Dashboard hero.

```
Visual (Mini Website version):
  Background:   cream #F6F1E8
  Radius:       16px
  Padding:      16px 24px
  Border:       1px solid rgba(197,164,109,0.22)
  
Layout:
  Top:    "נותרו עוד" (Heebo 400, 12px, muted)
  Center: [number] (Frank Ruhl Libre 900, 48px, gold) + "ימים" (Frank Ruhl Libre 700, 24px, gold)
  
Animation:
  Countdown ticks every second (minutes/hours/seconds optional)
```

---

### Component 7 — AlertCard (Warm Style)

**Usage:** Couple dashboard alerts section. Never clinical, always warm.

```
Variants:

ATTENTION (amber):
  Left border: 4px solid #D97706
  Background:  rgba(217,119,6,0.06)
  Icon:        ⚠️ or relevant emoji
  Title:       Heebo 600, 15px, dark
  Body:        Heebo 400, 14px, muted
  
CELEBRATION (green):
  Left border: 4px solid #4A7C3F
  Background:  rgba(74,124,63,0.06)
  Icon:        ✅ or 🎉
  Title:       Heebo 600, 15px, dark
  Body:        Heebo 400, 14px, muted
  
NEVER USE: Red borders, red backgrounds, clinical warning language
ALWAYS USE: Warm, assistant-like language. "יש 23 אורחים שממתינים" not "אזהרה: 23 לא שובצו"
```

---

### Component 8 — BlessingQuoteCard

**Usage:** Memory Wall, Time Capsule — for text blessings and messages.

```
Visual:
  Background:   cream #F6F1E8
  Radius:       16px
  Padding:      20px
  Border:       1px solid rgba(197,164,109,0.22)
  
Layout:
  Top:    Opening quote mark "  (gold, Frank Ruhl Libre, 40px, opacity 0.6)
  Middle: Blessing text (Frank Ruhl Libre 400, 18px, dark, line-height 1.7)
  Bottom: Closing quote mark " + "— [Guest Name]" (Heebo 400, 14px, muted)
  
This is the most typographically significant card in the product.
Blessing text must never be in Heebo — always Frank Ruhl Libre.
```

---

### Component 9 — EmptyState

**Usage:** Every empty state in the product. Never a blank void.

```
Structure:
  Brand asset:   Warm photography or illustration (from Brand Asset Library)
  Headline:      Frank Ruhl Libre 700, 22px — warm, human
  Body:          Heebo 400, 16px, muted — explaining what will appear here
  CTA:           PrimaryButton — the first action to take
  
Tone rules:
  ✅ "הגלריה עדיין ריקה — היו הראשונים להעלות!"
  ✅ "עדיין אין ספקים — הוסיפו את הראשון"
  ❌ "No data found"
  ❌ "לא נמצאו תוצאות"
  ❌ Empty white rectangle
```

---

### Component 10 — MemoryTypeCard

**Usage:** Memory Upload — type selection step.

```
Visual:
  Background:   ivory #FDFAF5 (default) / gold-light (selected)
  Border:       1.5px solid rgba(197,164,109,0.22) (default) / gold (selected)
  Radius:       16px
  Padding:      16px
  
Layout:
  Top:    Emoji (48px)
  Middle: Label (Heebo 600, 16px, dark)
  Bottom: Description (Heebo 300, 13px, muted — 1 line)
  
Selected:
  Border: gold #C5A46D
  Background: rgba(197,164,109,0.10)
  Shadow: shadow-gold
```

---

## Animation Library

### Animation 1 — Page Entrance
```
All page content: opacity 0 → 1, translateY 16px → 0
Duration: 400ms, ease-out
Stagger: 50ms between elements
```

### Animation 2 — Task Completion
```
Checkmark draw:   strokeDashoffset animation, 150ms, ease-out
Text strikethrough: width 0 → 100%, 250ms, ease-in
Color fade:       text color → muted, 250ms
Confetti burst:   3-4 particles, gold + olive, 600ms, upward arc
```

### Animation 3 — Celebration Toast
```
Enter:  translateY 100% → 0, 400ms, ease (spring)
Hold:   4000ms
Exit:   translateY 0 → 100%, 300ms, ease-in
```

### Animation 4 — Table Number Reveal
```
Initial: opacity 0, scale 0.8
Enter: opacity 0 → 1, scale 0.8 → 1, 500ms, ease (spring)
Hold: static
Optional: golden glow pulse, 2s, ease-in-out, 2 cycles
```

### Animation 5 — Loading Pulse
```
Brand mark line: opacity 0.4 → 1 → 0.4
Duration: 1.5s, ease-in-out, infinite
```

### Animation 6 — Capsule Unlock
```
Lock icon: rotation 0 → -30deg, 300ms, ease
Padlock shackle: opens (SVG path animation), 400ms
Envelope: seal breaks (SVG path + opacity), 500ms
Content: fade in, 400ms, 200ms delay
```

---

## Pattern Index

### Layout Patterns (→ ai-os/design/library/layout-patterns.md)
- Guest-Facing Single-Purpose Page ✅ (Wave 1)
- State-Based Page ✅ (Wave 1)
- Celebration Reveal ✅ (Wave 1)
- Gracious State ✅ (Wave 1)
- Dashboard Below-Fold (pending E3 approval)
- Admin Data Table (pending E4 approval)

### Interaction Patterns (→ ai-os/design/library/interaction-patterns.md)
- Full-width CTA at page bottom ✅
- 2×2 choice card grid ✅
- Guest count stepper (+ / −) ✅
- Star rating with emoji reaction (pending E2 survey approval)
- Task completion with confetti (pending E3 approval)

### Typography Patterns (→ ai-os/design/library/typography-patterns.md)
- Frank Ruhl Libre 900 for couple names / hero headlines ✅
- Frank Ruhl Libre for blessing/message content ✅
- Heebo for all data, labels, inputs ✅
- Mixed scale: display headline + body label in same card ✅

---

## Design System Status

| Category | Status |
|----------|--------|
| Color tokens | ✅ Defined |
| Typography tokens | ✅ Defined |
| Spacing tokens | ✅ Defined |
| Border radius | ✅ Defined |
| Shadow | ✅ Defined |
| Motion | ✅ Defined |
| Components (10 documented) | ✅ Defined |
| Animation library | ✅ Defined |
| Layout patterns | 🔄 4 approved, more pending |
| Interaction patterns | 🔄 3 approved, more pending |
| Icon library | 📋 To be defined |
| Illustration style | 📋 To be defined |
| Brand asset usage rules | ✅ (→ brand-assets/BRAND-ASSET-LIBRARY.md) |

---

*Design System v1.0 | Pattern-First | Chief of Staff | 2026-06-26*
*Grows with every approved wave — never invented without a real design to extract from*
