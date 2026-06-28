# Wave 1 Reusable Patterns
## רגע לפני | Engineering Reference | 2026-06-28

All patterns below are extracted from Wave 1 RSVP implementation.
Wave 2 and beyond should inherit these automatically.

---

## 1. Layout Patterns

### PATTERN-L1: Full-Bleed Hero Photo with Gradient Overlay
**Use for:** Any page that opens with a warm photo and overlaid text.

```css
.hero-panel {
  position: relative;
  width: 100%;
  height: 300px;           /* adjust per screen */
  overflow: hidden;
}
.hero-panel img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center top;
}
.hero-panel::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    rgba(28,16,8,0.72) 0%,   /* dark base — text legible */
    rgba(28,16,8,0.35) 50%,
    rgba(28,16,8,0.05) 100%
  );
}
.hero-overlay {
  position: absolute; bottom: 0; left: 0; right: 0;
  z-index: 1;
  padding: 20px 24px 24px;
  text-align: center;
}
```

**RTL note:** All text inside `.hero-overlay` uses `color: #FFFFFF` (never muted). Font weights: eyebrow 300, heading 700, subtext 300.

---

### PATTERN-L2: Responsive Two-Column (Tablet+) / Stacked (Mobile)
**Use for:** Any guest-facing page where context + action should split on wider screens.

```css
/* Mobile default: stacked */
.split-page { min-height: 100dvh; background: #FDFAF5; }
.split-left  { /* hero content */ }
.split-right { /* form / action content */ }

/* Tablet 768px+: side-by-side */
@media (min-width: 768px) {
  .split-page  { display: flex; }
  .split-left  { flex: 1; position: sticky; top: 0; height: 100dvh; overflow: hidden; }
  .split-right { flex: 1; overflow-y: auto; display: flex; align-items: flex-start; justify-content: center; }
  .split-inner { max-width: 480px; width: 100%; padding: 48px 40px; }
}
```

**Key principle:** The sticky panel is the emotional/visual anchor; the scrollable panel is the action. Never reverse this.

---

### PATTERN-L3: Context-Aware Content (Mobile vs Tablet)
When the same information needs to appear differently per breakpoint:

```css
/* Show in hero overlay on mobile, hide on tablet */
.mobile-overlay-content { display: block; }
/* Show in form panel on tablet, hide on mobile */
.tablet-form-header { display: none; }

@media (min-width: 768px) {
  .mobile-overlay-content { display: none; }
  .tablet-form-header { display: block; }
}
```

Render both in the DOM. CSS toggles which version is visible. This avoids React conditionals that cause hydration mismatches.

---

## 2. Component Patterns

### PATTERN-C1: GoldCTA Button (COMP-02)
The primary action button. Always `minHeight: 56px`. Never an emoji-only label.

```tsx
<GoldCTA onClick={handler} loading={isSubmitting} disabled={isSubmitting} fullWidth>
  Label 🎉
</GoldCTA>
```

**Rules:**
- Gold CTA = primary action (confirm, submit, proceed)
- Outline/text CTA = secondary action (decline, cancel, back)
- Never two gold CTAs on the same screen
- `loading` prop shows spinner + reduced opacity; `disabled` prevents clicks
- Hover: `translateY(-1px)` + stronger shadow

---

### PATTERN-C2: WarmCard Container
Cream background, gold-tinted border, 16px radius. Used for any information group.

```tsx
<WarmCard style={{ marginBottom: "16px" }}>
  {/* grouped content */}
</WarmCard>
```

For the table number / seating highlight variant:
```tsx
<WarmCard style={{
  background: "linear-gradient(135deg, rgba(197,164,109,0.10), rgba(197,164,109,0.05))",
  border: "1.5px solid rgba(197,164,109,0.3)"
}}>
```

---

### PATTERN-C3: BotanicalSprig SVG
Used on: error, wrong-person, declined, loading screens. Always centered. Never in a sentence.

```tsx
<BotanicalSprig size={48} />
```

Always include `style={{ display: "block", margin: "0 auto" }}` on the `<svg>` element itself (RTL safe).

---

### PATTERN-C4: WarmAlertCard (COMP-05)
For API errors and validation feedback. Never use raw `<p>` for errors.

```tsx
{errorMsg && <WarmAlertCard message={errorMsg} />}
```

---

### PATTERN-C5: 3-Dot Loading Animation (E2-S1)
```css
@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
  40%            { transform: scale(1);   opacity: 1; }
}
.loading-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #C5A46D;
  animation: dotPulse 1.2s ease-in-out infinite;
}
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }
```

Always pair with `aria-live="polite"` + `role="status"` on the status text.

---

### PATTERN-C6: FadeUp Entrance Animation
Standard entrance for content blocks. `animation-fill-mode: both` ensures opacity starts at 0.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

```tsx
<div style={{ animation: "fadeUp 0.4s ease 0.08s both" }}>
```

Stagger: +0.08s per block. Maximum 0.35s delay. Do not animate more than 6 elements per page.

---

### PATTERN-C7: Confetti (CSS-only)
```tsx
<Confetti />  {/* place at top of confirmed screen, position: absolute */}
```

Always wrap the confirmed screen container in `position: relative; overflow: hidden`.
Always include `@media (prefers-reduced-motion: reduce) { .confetti-piece { opacity: 0.6; } }`.

---

## 3. RTL Patterns

### PATTERN-RTL-1: Always `dir="rtl"` at the page root
```tsx
<div dir="rtl" style={{ fontFamily: "'Heebo', sans-serif" }}>
```

Never set direction on individual elements. One declaration at the page root.

### PATTERN-RTL-2: SVG centering
Inline SVGs in RTL context are inline elements and flow from right. Always:
```tsx
<svg style={{ display: "block", margin: "0 auto" }} aria-hidden="true">
```

### PATTERN-RTL-3: Phone / numeric inputs
Always use `direction: ltr; textAlign: right` for phone fields in RTL:
```tsx
style={{ direction: "ltr", textAlign: "right" }}
```

Add `inputMode="numeric"` and `autoComplete="tel-national"` for mobile keyboards.

### PATTERN-RTL-4: `textAlign: center` in RTL
Works for block elements. Does NOT work for inline elements (use flex + justify-content instead).

---

## 4. Animation Patterns

| Pattern | Usage | Duration | Delay |
|---------|-------|----------|-------|
| `fadeUp` | Content entrance | 400ms | +80ms stagger |
| `dotPulse` | Loading state | 1200ms | 200ms stagger |
| `confettiFall` | Success celebration | 2500ms | 0-300ms |
| `spin` | Spinner (deprecated) | 900ms | — |
| `goldPulse` | Gold highlight | continuous | — |

**Rules:**
- Never animate more than 6 elements on a single screen
- Maximum stagger delay: 350ms (beyond this feels broken)
- Always use `animation-fill-mode: both` to prevent FOUC
- Always respect `prefers-reduced-motion`

---

## 5. Accessibility Patterns

### PATTERN-A1: WCAG Focus Ring
Already set globally in `globals.css`. Do not override on individual elements:
```css
:focus-visible {
  outline: 2px solid #8B6914; /* 4.7:1 on ivory */
  outline-offset: 2px;
  border-radius: 4px;
}
```

### PATTERN-A2: Live Regions for Dynamic Content
```tsx
<span aria-live="polite" role="status">
  {statusText}
</span>
```

Use for: loading state, guest count stepper, form errors.

### PATTERN-A3: Stepper Buttons
```tsx
<button aria-label="הוסף אורח" type="button">+</button>
<span aria-live="polite" aria-label={`${count} אורחים`}>{count}</span>
<button aria-label="הפחת אורח" type="button">−</button>
```

### PATTERN-A4: Decorative Elements
All decorative SVGs, images, botanical elements: `aria-hidden="true"`.
All purely decorative elements: `alt=""` (empty alt, not missing).

### PATTERN-A5: Minimum Touch Targets
All interactive elements: `minHeight: 44px`. Enforced globally via `globals.css` media query.

---

## 6. SYS-02 Token Usage Reference

```typescript
const T = {
  ivory:     "#FDFAF5",  // page background
  cream:     "#F6F1E8",  // card background, warm fills
  gold:      "#C5A46D",  // borders, decorative elements
  goldText:  "#8B6914",  // eyebrows, labels, link text, icon fills
  dark:      "#1C1008",  // headings, primary body text
  muted:     "#8C7B6E",  // secondary text, placeholders
  olive:     "#6B7B5A",  // botanical SVGs, secondary accents
  border:    "#E8E0D4",  // card borders, dividers
  shadowCard: "0 2px 8px rgba(28,16,8,0.06)",
  shadowCta:  "0 4px 12px rgba(197,164,109,0.4)",
} as const;
```

**White text on photo:** `color: "#FFFFFF"` and `rgba(255,255,255,0.8/0.65)` for subtitles.
**Overlay gradient:** `rgba(28,16,8,0.72)` at bottom → transparent at top.

---

## 7. QA Methodology (Wave 1 Protocol)

Run this checklist for every Wave before committing:

```
□ TypeScript: npx tsc --noEmit → zero errors
□ Build: next build → compiled successfully, zero errors
□ S1: Pending → confirm → success screen → calendar + waze links work
□ S2: Decline → "change my mind" → confirm → confirmed screen
□ S3: Pre-confirmed → opens confirmed screen immediately
□ S4: Invalid token → error screen renders
□ S5: [Feature-specific] — no unreachable code
□ S6: Tablet 768px → two-column renders correctly
□ Mobile 375px → form visible, no overflow, touch targets ≥ 44px
□ RTL → no broken alignment
□ DB writes → API POST returns success, Supabase record updated
□ Test data cleanup → zero [TEST] records remain
```

**Cleanup fallback (when browser auth blocks DELETE):**
```bash
curl -X DELETE "$SUPABASE_URL/rest/v1/guests?id=eq.$ID" \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY"
```

---

## 8. Stitch Implementation Workflow (Refined After Wave 1)

1. **Read E2-SCREENS.md in full** before writing a single line of code.
2. **Identify every screen state** — not just the happy path. Count: loading, error, empty, populated, success, edge cases.
3. **Check the DB schema** before referencing any column in SELECT. One wrong column name = silent null.
4. **Implement mobile first.** The spec gives mobile layout first — implement it first.
5. **Tablet breakpoint is additive** — add `@media (min-width: 768px)` on top of the mobile base.
6. **Create test data via RSVP POST**, not via guest creation API (status field ignored on POST).
7. **Run regression before cleanup.** Screenshots first, then delete test data.
8. **Never leave unreachable code.** If a feature requires infrastructure that doesn't exist, either build the infrastructure or delete the feature code.

---

*Wave 1 Reusable Patterns | Chief of Staff | 2026-06-28*
