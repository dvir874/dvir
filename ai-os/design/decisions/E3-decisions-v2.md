# E3 Couple Experience — Design Decision Log (Extended)
## Additional Decisions from Wave 2 | Chief of Staff | 2026-06-27

> Extends E3-decisions.md (6 original decisions). These 6 additional decisions cover the remaining E3 screens.

---

## Decision 7 — Wedding Day Mode = Complete State Override

**Chosen:** When `daysLeft === 0`, the entire couple dashboard is replaced by a distinct Wedding Day Mode. The normal dashboard (budget, checklist, vendors, readiness meter) is completely hidden.

**Rationale:** On the wedding day, planning is over. The couple needs three things: navigation (Waze), timeline (what happens when), and communication (contacts). Showing them the checklist or budget on their wedding day would be a UX failure — it implies something is still pending. Wedding Day Mode has its own visual identity (real photo hero, dark overlay) that makes the state transition unmistakable.

**Rule:** `daysLeft === 0` → early return `<WeddingDayScreen>`. Planning tools must not be visible.

---

## Decision 8 — Post-Event Mode = Memory Archive, Not Farewell Screen

**Chosen:** When `daysLeft < 0`, the dashboard becomes a memory archive (gallery, blessings, gifts, vendor ratings). It does not show a "wedding is over" empty state.

**Rationale:** The product relationship does not end at midnight on the wedding day. The couple will return to view photos, collect blessings from the time capsule on their anniversary, and manage gift tracking. Post-event mode is a new phase of the product, not a graceful exit. The headline "✨ החתונה הייתה מושלמת!" reframes the dashboard from planning mode to celebration mode.

---

## Decision 9 — Checklist Uses Same Circular Arc as Dashboard

**Chosen:** The checklist's progress indicator is a circular SVG arc (same component as the RSVP count arc on the dashboard) showing percentage complete.

**Rationale:** Using the same visual component for progress across the product creates visual literacy. When a couple sees the gold circular arc, they immediately know what it means. Consistency reduces cognitive load.

---

## Decision 10 — Onboarding Provides Emotional Return at Every Step

**Chosen:** Each onboarding step provides immediate emotional feedback: step 2 shows live couple name preview, step 3 shows countdown days immediately after date entry, step 5 shows "הכל מוכן!" celebration with couple name in gold.

**Rationale:** Onboarding must not feel like form-filling. Each piece of information the couple provides should create a moment of "this is becoming our wedding." The live preview is the hook; the celebration is the reward. If any step is purely administrative with no emotional return, it should be restructured.

---

## Decision 11 — Guest Center Has Proactive Seating Nudge

**Chosen:** At the bottom of the Guest Center, an amber nudge banner: "43 אורחים עדיין לא שובצו → עברו להושבה" appears when unseated guests exist.

**Rationale:** The couple dashboard is the product acting as an assistant. The assistant notices when a meaningful task is incomplete and surfaces it at the right moment. The guest center is where the couple is already thinking about guests — it's the right place to prompt the seating action. The amber color communicates "attention needed" without alarm.

---

## Decision 12 — Botanical Illustrations as Onboarding Visual Language

**Chosen:** Onboarding welcome splash uses botanical illustration (olive branches, white flowers) rather than photography or abstract shapes.

**Rationale:** Photography is the right choice for hero sections and emotional peaks. But onboarding is a set-up flow — photography here would compete for attention with the form content. Botanical illustration provides warmth and brand alignment while staying visually quiet enough to support the content above it.

---

*E3 Extended Decisions | 6 additional decisions | Chief of Staff | 2026-06-27*
