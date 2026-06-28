# Experience 4 — Admin Experience Intelligence Report (Extended)
## Wave 2 Completion | Chief of Staff | 2026-06-27

> Extends E4-intelligence.md. Covers Guest Management table and Seating Management.

---

## New Standards Established — E4 Wave 2

### Standard 5 — Filter Chips With Counts Are Alerts, Not Just Filters
The guest table filter chips ("מגיע 89 / ממתין 23 / לא שובץ 43") serve dual purpose: they filter the table, AND they communicate event health at a glance. The admin sees "לא שובץ 43" and immediately knows there is seating work to do — before clicking anything.

**Rule:** Any data table with actionable states must have filter chips with live counts above it.

### Standard 6 — Physical Metaphors for Physical Tasks
The seating floor plan uses round table cards because wedding tables are round. The unassigned panel is to the left of the floor plan because drag-direction is left-to-right. These spatial metaphors make the admin feel like they are physically arranging a room, not filling in a form.

**Rule:** When designing interaction for a physical task (seating, floor plan, timeline), the digital interface should mirror the physical mental model as closely as possible.

---

## E4 Complete — Remaining Engineering Work

| Screen | Complexity | Key Technical Challenge |
|--------|-----------|------------------------|
| Admin Dashboard | Done | — |
| WhatsApp Center | Done | — |
| Guest Management Table | Medium | Search, filter, status pills, pagination |
| Seating Management | High | Drag-and-drop, floor plan grid, capacity tracking |

**Mobile seating is still undesigned.** On mobile, the drag-and-drop model doesn't work reliably. The mobile seating pattern (guest card → table selector) needs a separate Stitch design. Recommendation: defer mobile seating to Phase 2 implementation.

---

*E4 Admin Experience Intelligence — Wave 2 | Chief of Staff | 2026-06-27*
