# Experience 3 — Couple Experience Intelligence Report (Extended)
## Wave 2 Completion | Chief of Staff | 2026-06-27

> Extends E3-intelligence.md. Covers remaining E3 screens: Above-Fold, Onboarding complete set, Checklist, Guest Center, Wedding Day Mode, Post-Event.

---

## New Standards Established — E3 Wave 2

### Standard 5 — Wedding Day Mode is a Complete Product State
The couple dashboard has three distinct states (Planning / Wedding Day / Post-Event) with completely different UIs. This is not a feature — it is a product architecture decision. Every new screen that touches the couple area must ask: "What does this look like in all three states?"

**Rule:** `daysLeft === 0` → WeddingDayScreen, `daysLeft < 0` → PostEventDashboard, `daysLeft > 0` → PlanningDashboard.

### Standard 6 — Onboarding Emotional Return at Every Step
Every onboarding step must provide an immediate emotional payoff. Step 2 shows live name preview. Step 3 shows days countdown instantly. Step 5 shows "הכל מוכן!" celebration. No step should feel like pure data entry.

**Rule:** If an onboarding step doesn't show the couple something about their wedding, it needs redesign.

### Standard 7 — Dashboard is a Proactive Assistant
The couple dashboard surfaces the next most important action the couple should take. It doesn't wait to be asked. The amber nudge ("43 אורחים לא שובצו") in the Guest Center, the milestone card in the dashboard, and the circular arc progress all serve one goal: guiding the couple to the next right action without requiring navigation.

### Standard 8 — Botanical Illustration for Form Contexts
When a screen is primarily a form (registration, onboarding steps with fields), botanical illustrations are the correct visual language — warm enough to feel premium, quiet enough to support the content. Photography would compete for attention.

---

## Anti-Patterns Documented — E3 Wave 2

| Anti-Pattern | Why Rejected | Correct Approach |
|---|---|---|
| Showing checklist on wedding day | Implies something is pending | Hide all planning tools in WeddingDayScreen |
| "Event is over" empty state | Wastes the post-event relationship | PostEventDashboard with gallery/blessings/ratings |
| Long onboarding (>5 steps) | Couples are excited, not patient | 5 steps maximum, each with emotional return |
| Static dashboard greeting | Generic, cold | "שלום ענבל ונדב" personalized on every load |
| NPS scale for wedding rating | Clinical, corporate | 5 stars, warm survey language |

---

## E3 Complete — Remaining Engineering Work

| Screen | Complexity | Key Technical Challenge |
|--------|-----------|------------------------|
| Dashboard Above-Fold | Medium | daysLeft calculation, readiness % engine |
| Onboarding Steps | Medium | Live preview (no debounce), step routing |
| Completion Celebration | Low | CSS confetti animation, celebration sequence |
| Checklist | Medium | Task categories, completion arcs, milestone toasts |
| Guest Center | Low | Guest list filtered view, reuse existing API |
| Wedding Day Mode | Low | Early return, timeline from `event_timeline` JSON |
| Post-Event Dashboard | Low | daysLeft < 0 early return, metrics from existing tables |

**E3 is ready for implementation planning once CEO approves the portfolio.**

---

*E3 Couple Experience Intelligence — Wave 2 | Chief of Staff | 2026-06-27*
