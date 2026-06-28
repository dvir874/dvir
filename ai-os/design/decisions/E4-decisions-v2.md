# E4 Admin Experience — Design Decision Log (Extended)
## Additional Decisions from Wave 2 | Chief of Staff | 2026-06-27

> Extends E4-decisions.md (6 original decisions). These 3 additional decisions cover Guest Management and Seating.

---

## Decision 7 — Filter Chips with Live Counts on Guest Table

**Chosen:** Guest table filter chips show live counts: "הכל 120 / מגיע 69 / ממתין 23 / לא מגיע 8 / לא שובץ 43." Tapping a chip filters and the count updates dynamically.

**Rationale:** The admin's primary cognitive task is understanding their event state at a glance. "43 לא שובצו" is not just a filter — it is an alert. Embedding counts in filter chips means the admin never needs to count rows to understand their situation. The "לא שובץ" filter is the most important one: it answers "who still needs to be seated?"

---

## Decision 8 — Seating Floor Plan as Round Table Grid

**Chosen:** Tables in the seating view are represented as round cards (not rectangles, not abstract). Each shows: table number, current/capacity count, and color status.

**Rationale:** Wedding venue tables are round. The physical metaphor should match. Using rounded cards (as opposed to rectangular table representations) means the admin's mental model of the floor plan matches the real room. Color coding (green=full, cream=partial, lighter=empty) gives instant saturation status without requiring interaction.

**Color system:**
- Green tint: table full or near-full
- Cream: partially filled (primary state during seating)
- Light cream / white: empty (needs guests assigned)
- Gold glow: currently selected

---

## Decision 9 — Drag-and-Drop as Primary Seating Interaction

**Chosen:** The seating interface is built around drag-from-unassigned-panel → drop-on-table-card. Not a form, not a dropdown, not a bulk assign.

**Rationale:** Seating a wedding is a spatial, hands-on task. The admin thinks "I want this family at that table" — a drag-and-drop interaction matches that mental model exactly. Dropdowns or bulk actions feel administrative and slow. The two-panel layout (unassigned left, floor plan right) creates a natural left-to-right drag direction that is intuitive on desktop.

**Mobile exception:** On mobile, seating uses a different pattern (guest card → table selector) since drag-and-drop is unreliable on touch. Mobile seating design is a separate screen not yet designed.

---

*E4 Extended Decisions | 3 additional decisions | Chief of Staff | 2026-06-27*
