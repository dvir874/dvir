# Experience 3 — Couple Experience Intelligence Report
## Chief of Staff | 2026-06-26

---

## Executive Summary

The Couple Experience is the product's retention engine. Couples use it 3–5× per day from engagement to wedding. The design must sustain this habit by making every session feel purposeful, warm, and worth returning to.

**Key insight:** The couple is simultaneously excited and anxious. The dashboard must amplify the excitement while calmly organizing the anxiety. It is a companion, not a tool.

---

## Company Standards Established — E3

### Standard 1 — Circular Arc for Emotional Counts
Any count that represents an emotional milestone (RSVPs confirmed, tasks completed, guests seated) uses a circular SVG arc with the number at center in Frank Ruhl Libre 900 gold. The number is the hero; the percentage is the context.

**Technical spec:** SVG arc from 135° to -135° (270° total). Stroke-dasharray for fill. Gold stroke, cream empty portion. Center text: Frank Ruhl Libre 900, 48px, gold.

### Standard 2 — Live Preview is the Product's Value Proposition
The onboarding live preview ("חתונת [שם] ו[שם]" in Frank Ruhl Libre italic gold) must update on every keystroke without debounce. This is not a luxury — it is the 3-second demo of everything the product stands for.

### Standard 3 — Warm Dashboard Alerts, Never Clinical
Couple-facing alerts use amber/green warm tones and conversational Hebrew copy. The assistant voice is: "23 אורחים עדיין לא אישרו — שלחו תזכורת?" Never: "אזהרה: 23 לא אישרו." Max 3 alerts visible. Priority order: RSVP unseated > overdue tasks > vendor payments.

### Standard 4 — Milestone as Ritual Moment
Upcoming milestones (venue walkthrough, food tasting, rehearsal dinner) are presented as anticipated events, not calendar items. Card format: warm cream background, event name in Frank Ruhl Libre, "עוד X ימים" in gold, "הוסיפו תזכורת" button.

---

## Anti-Patterns Documented — E3

| Anti-Pattern | Why Rejected | Correct Approach |
|---|---|---|
| Linear progress bar for RSVPs | Percentage > achievement | Circular arc, number at center |
| Tab navigation within dashboard | Hierarchy signal wrong | 2×2 equal-weight grid |
| "Dashboard" as page title | Generic, not personal | "שלום [שם]" + date |
| Red alerts for normal in-progress states | Creates unnecessary anxiety | Amber warm cards, assistant voice |
| Debounced live preview | Breaks magic moment | Instant update every keystroke |
| Generic milestone as list item | Misses emotional opportunity | Ritual card with Frank Ruhl Libre |
| Static onboarding (no preview) | Couple doesn't see value until screen 7 | Live preview from step 2 |

---

## Technology Observations — E3

- **Stitch live preview simulation:** Stitch correctly renders the "חתונת ענבל ונדב" in italic Frank Ruhl Libre gold for the name preview card, without explicit italic styling in the prompt. The model inferred the elegant treatment from context.
- **Circular arc implementation:** Will require SVG with `stroke-dasharray` and `stroke-dashoffset`. Consider Framer Motion for the entrance animation. The arc should animate from 0 to fill over 800ms on first render.
- **Bottom navigation:** Stitch added bottom navigation to the couple dashboard correctly without it being explicitly specified. This confirms the model's understanding of mobile dashboard patterns. Keep it.

---

## Design Hypothesis — E3

**Hypothesis:** The live onboarding name preview ("חתונת ענבל ונדב") is the single highest-impact moment for new couple activation. Couples who see it are significantly more likely to complete onboarding.

**Hypothesis 2:** The circular RSVP progress arc creates a "game mechanic" effect — couples will check the dashboard more frequently to watch the number increase.

**Both should be verified with activation and retention analytics post-launch.**

---

## Remaining Design Work — E3

| Screen | Status | Priority |
|--------|--------|----------|
| Dashboard Above-Fold (hero countdown) | Existing — needs redesign | P0 |
| Dashboard Below-Fold (planning) | ✅ APPROVED | P0 |
| Onboarding — Welcome splash | Not yet designed | P1 |
| Onboarding — Names step | ✅ APPROVED | P0 |
| Onboarding — Date + Venue step | Not yet designed | P1 |
| Onboarding — Completion celebration | Not yet designed | P1 |
| Guest Center (mobile cards) | Not yet designed | P1 |
| Checklist with celebration | Not yet designed | P1 |
| Wedding Day Mode | Not yet designed | P0 |
| Post-event dashboard | Not yet designed | P2 |

---

*E3 Couple Experience Intelligence Report | Chief of Staff | 2026-06-26*
