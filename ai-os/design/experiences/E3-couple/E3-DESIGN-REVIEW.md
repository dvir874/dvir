# Experience 3 — Couple Experience
## Design Review
## Chief of Staff | 2026-06-26

---

## Screen 1: Dashboard Below-Fold (Planning Mode)
**Stitch Direction: Warm Romantic | Mobile 390px**

### Visual Review

**What Stitch produced:**
- Alert strip: amber card "23 אורחים לא אישרו — שלחו תזכורת!" + green "5 משימות לקרוב"
- RSVP Progress card: cream bg, circular gold progress arc with "89" Frank Ruhl Libre 900 at center, "31 ממתינים · 7 לא מגיעים" below
- 2×2 quick action grid: 4 equal cream cards (✓ משימות 12 / הושבה 6 / תקציב 90% / ספקים 2)
- Milestone card at bottom: "הבא לאולם עוד 5 ימים" in large Frank Ruhl Libre gold
- Bottom navigation bar with 4 icons

### Design QA

| Criterion | Score | Notes |
|-----------|-------|-------|
| Planning Clarity | ✅ 10/10 | At a glance: RSVP status, action items, what's next |
| Warm Tone | ✅ | No red alerts, warm amber/green, assistant style |
| Typography | ✅ | 89 in gold Frank Ruhl Libre — immediate recognition |
| Progress Visualization | ✅ | Circular arc is the right choice (better than bar) |
| Action Grid | ✅ | 2×2 gives equal weight, no hierarchy confusion |
| Milestone Card | ✅ 10/10 | "עוד 5 ימים" in large Frank Ruhl Libre gold — ritual moment |
| Bottom Nav | ✅ | Appropriate for couple dashboard |
| Brand Tokens | ✅ | Ivory, cream, gold — exact match |
| RTL | ✅ | Correct throughout |
| Density | ✅ | Not cramped, breathing room between sections |

### Verdict: **APPROVED** ✅

### Implementation Notes
1. Alert cards: show max 3. Priority: RSVP unseated > tasks > vendors. Never show red.
2. Circular progress: use SVG arc. Gold stroke, cream background circle.
3. 2×2 grid: each card is a tap target → navigate to that section
4. Milestone: powered by upcoming `event_timeline` JSONB field

---

## Screen 2: Onboarding — Couple Names Step
**Stitch Direction: Warm Romantic | Mobile 390px**

### Visual Review

**What Stitch produced:**
- Progress dots: 5 dots, step 2 active (gold), others outlined
- "רגע לפני" brand mark subtly visible
- "מה השמות שלכם?" — Frank Ruhl Libre, large, dark, right-aligned
- Two labeled input fields: שם החתן (נדב) / שם הכלה (ענבל) — cream bg, filled
- Live preview card below inputs: heart icon + "חתונת ענבל ונדב" — Frank Ruhl Libre italic, gold
- Gold full-width CTA: "המשיכו ←"

### Design QA

| Criterion | Score | Notes |
|-----------|-------|-------|
| First Impression | ✅ 10/10 | "The app knows this is our wedding. Right now." |
| Live Preview | ✅ 10/10 | Seeing "חתונת ענבל ונדב" appear as you type is magic |
| Brand Mark | ✅ | Subtle presence — brand is guide, not intrusion |
| Typography | ✅ | Frank Ruhl Libre for the live preview — correct |
| Input Design | ✅ | Clean, large, cream — premium not generic |
| Progress | ✅ | 5 dots clear, not overwhelming |
| CTA | ✅ | Gold, full-width, clear — "keep going" feel |
| RTL | ✅ | Labels and inputs right-aligned |
| Warmth | ✅ | Heart icon in preview — emotional intelligence |

### Verdict: **APPROVED** ✅

### Implementation Notes
1. Live preview updates on every keystroke — no debounce delay
2. Heart icon in preview card — always shown, even if one name empty
3. Progress dots: tappable to go back to previous steps
4. "המשיכו" disabled until both names filled (min 2 chars each)

---

## Pattern Intelligence Capture

**New pattern confirmed: Live couple name preview during onboarding**
Seeing your own wedding name appear in real-time, in Frank Ruhl Libre italic gold, is the single most effective onboarding moment in the product. It transforms an input form into a declaration: "This is real."

**Circular progress arc > horizontal progress bar** for emotional RSVP counts.
The circular arc (89 at center) creates a focal reveal — the number reads first, then context. A bar reads left to right, which is secondary in emotional weight.

**Warm milestone card with Frank Ruhl Libre countdown** is approved as a product-wide pattern for upcoming events. "עוד 5 ימים" at 24px gold Frank Ruhl Libre — not a clinical countdown, a ritual moment.

---

*E3 Couple Experience Design Review | 2 screens approved | Chief of Staff | 2026-06-26*
