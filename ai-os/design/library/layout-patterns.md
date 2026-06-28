# Design Library — Layout Patterns
## רגע לפני | Approved Patterns Only | Updated Per Wave

---

> Every pattern here was approved by CEO after Design Review.
> Use these before inventing anything new.
> Reference the wave that produced each pattern.

---

## Pattern: Guest-Facing Single-Purpose Page

**First appeared:** Wave 1 — RSVP page
**Status:** Approved ✅

### Description
A full-screen mobile page designed for a user with a single purpose.
No authentication. No account. No navigation history.

### Anatomy
```
┌─────────────────────────┐
│   Brand Mark (centered) │  ← "רגע לפני" only. No hamburger. No bell.
├─────────────────────────┤
│   Event Photo (circle)  │  ← Optional. If missing: hide gracefully.
│   Couple Name (hero)    │  ← Frank Ruhl Libre 900, large
│   Date + Venue          │  ← Heebo 400, muted
│   Guest Greeting        │  ← Heebo 500, warm copy
├─────────────────────────┤
│   Primary Content       │  ← The single task
│   (cards / choices)     │
├─────────────────────────┤
│   Primary CTA           │  ← Full width, gold, 56px height minimum
│   Secondary Link        │  ← Text only, smaller, below CTA
└─────────────────────────┘
```

### Rules
- Background: cream (#F6F1E8) or ivory (#FDFAF5)
- Zero navigation elements (no bottom nav, no hamburger, no tabs)
- Brand mark: top center, no interactive elements
- Primary CTA: always full width, always gold, always at the bottom of the primary content
- Maximum one primary CTA visible at a time
- All content RTL

### When to Use
- Any page where a guest (non-authenticated) is the user
- Any single-purpose flow (RSVP, gallery upload, memory upload)
- Any page sent via WhatsApp/SMS link

### When NOT to Use
- Couple dashboard (authenticated, multi-purpose)
- Admin panel (multi-purpose, data-heavy)
- Any page with multiple task types

---

## Pattern: State-Based Page (Multiple States, One Route)

**First appeared:** Wave 1 — RSVP page (7 states)
**Status:** Approved ✅

### Description
A single route that renders different full-page states based on data.
Each state is a complete, self-contained experience — not a partial view.

### States Discovered in Wave 1
```
Loading        — branded, minimal, no content flash
Form           — the primary interaction state
Form-expanded  — after first choice, reveals sub-options
Confirmed      — attending, with celebration + table reveal
Declined       — not attending, with gracious warmth
Already-done   — repeat visit, shows their previous response
Error          — invalid or expired link, branded
```

### Rules
- Each state must be visually complete — no "this state is missing"
- Loading state is always branded (never blank white, never raw spinner)
- Error state is always warm — not clinical, not technical
- Already-done state surfaces the guest's prior response clearly
- Transitions between states: fade only (0.2s), not slide (slide implies navigation)

### Implementation Pattern
```typescript
if (isLoading) return <LoadingState />;
if (hasError) return <ErrorState message={error} />;
if (alreadyResponded) return <AlreadyRespondedState response={prior} />;
if (isConfirmed) return <ConfirmedState table={table} event={event} />;
if (isDeclined) return <DeclinedState event={event} />;
return <FormState event={event} guest={guest} />;
```

---

## Pattern: Celebration Reveal

**First appeared:** Wave 1 — Table Number in Confirmed state
**Status:** Approved ✅

### Description
The moment when a user receives something they were waiting for —
presented as the dominant visual element of the screen.

### Anatomy
```
┌─────────────────────────┐
│   Celebration header    │  ← "תודה שאישרתם! ❤️" — Frank Ruhl, large
│   Sub-header            │  ← "מחכים לכם ביום המיוחד" — Heebo, muted
├─────────────────────────┤
│                         │
│   ┌─────────────────┐   │
│   │  [Big Number]   │   │  ← The reveal. Frank Ruhl 900. Gold. Centered.
│   │   שולחן 7       │   │
│   └─────────────────┘   │
│                         │
├─────────────────────────┤
│   Event details         │  ← Date, venue, time — supporting info
│   Action buttons        │  ← Calendar, Waze, Share
└─────────────────────────┘
```

### Rules
- The revealed item must be the largest text element on screen
- Surrounding white space is mandatory — the reveal needs room to breathe
- Supporting details come after, in smaller type
- Action buttons are secondary to the reveal — they enable next steps, not the emotional moment

### When to Use
- Table number reveal
- Ticket number / booking number
- Any "here is the thing you were waiting for" moment

---

## Pattern: Gracious State

**First appeared:** Wave 1 — Declined state
**Status:** Approved ✅

### Description
When a user delivers information that could create social friction,
the design absorbs the emotional weight and releases them gracefully.

### Anatomy
```
┌─────────────────────────┐
│   Brand mark            │
├─────────────────────────┤
│   [Warm image]          │  ← Nature, paper, soft textures. Not sad.
├─────────────────────────┤
│   Gracious headline     │  ← "קיבלנו את תגובתכם" — acknowledges, doesn't lament
│   Warm message          │  ← "חבל שלא תוכלו הפעם. מאחלים לכם כל טוב 💛"
├─────────────────────────┤
│   Event details         │  ← Reminds them what the event was, subtly
└─────────────────────────┘
```

### Rules
- No sad imagery. No empty states. No disappointed copy.
- The headline acknowledges the response without judgment
- The message is warm, not guilting, not excessive
- A single warm emoji is acceptable (💛, 🌿) — not celebratory (❤️, 🎉)
- Static brand imagery is preferred over no imagery

### When to Use
- Declined RSVP
- Cancelled booking
- Any "I can't make it" moment

---

*Design Library — Layout Patterns | Version 1 | Wave 1 | Chief of Staff | 2026-06-26*
