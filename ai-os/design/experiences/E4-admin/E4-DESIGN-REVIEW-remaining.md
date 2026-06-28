# Experience 4 — Admin Experience
## Design Review: Guest Management + Seating Management
## Chief of Staff | 2026-06-27

---

## Screen 1: Guest Management Table
**Desktop 1280px | Warm Professional**

### Visual Review
- Left sidebar ivory: "רגע לפני" logo + full nav, "אורחים" active gold
- Event sub-tabs: סקירה / אורחים (active underline gold) / הושבה / תקציב / משימות
- "רשימת אורחים (120)" Frank Ruhl Libre 700 header
- Action buttons: "ייצוא Excel" outline + "הוספת אורח +" gold filled
- Search bar full-width cream
- Filter chips: הכל 100 / מגיע 69 / ממתין 23 / לא מגיע 8 / לא שובץ 43
- Data table: 6 columns (checkbox / שם / טלפון / צד / סטטוס / שולחן / פעולות)
- 6 rows with status pills: green "מגיע" / amber "ממתין" / red "לא מגיע"
- Table number gold chips: "שולחן 7" / "שולחן 2" etc.
- Action icons per row: [✏ 📞 🗑]
- Pagination footer: 1-6 מתוך 120 אורחים
- "הוסף אורח" gold sticky CTA bottom right

### QA
| Criterion | Score | Notes |
|---|---|---|
| Filter Chips | ✅ 10/10 | 5 filters with counts — instant segmentation |
| Status Pills | ✅ 10/10 | Color-coded: green/amber/red — matches full system |
| Table Number Chips | ✅ | Gold chips for seated, empty for unseated — clear state |
| Action Density | ✅ | 3 actions per row — not overwhelming |
| Search | ✅ | Full-width search above table — correct for large lists |
| RTL | ✅ | All columns right-aligned throughout |
| Excel Export | ✅ | Present and accessible — admin needs it |

### Verdict: **APPROVED** ✅
The guest table is the admin's primary daily interface. The filter chips + status pills combination gives complete situational awareness in one glance.

---

## Screen 2: Seating Management
**Desktop 1280px | Warm Professional**

### Visual Review
- "ניהול הושבה" Frank Ruhl Libre 700 header
- Progress badge: "77 / 120 שובצו (64%)" gold
- Two-panel layout:
  - LEFT: "ממתינים להושבה (43)" — unassigned guest chips with drag handles
  - RIGHT: floor plan grid 3×5 table cards (tables 1–14)
- Table cards: round shape, number centered, capacity "8/10" below
- Selected table (שולחן 4): gold glow/border
- Filter chips: הכל / ריק / חלקי
- "שמרו הושבה" gold full-width CTA

### QA
| Criterion | Score | Notes |
|---|---|---|
| Two-Panel Layout | ✅ 10/10 | Drag source (left) + drop target (right) — correct mental model |
| Progress Visibility | ✅ | 77/120 at top — admin always knows completion % |
| Table Cards | ✅ | Round shape suggests actual round tables — metaphor accurate |
| Selected State | ✅ | Gold glow on selected table — clear |
| Capacity Display | ✅ | "8/10" per table — admin sees fullness at a glance |
| Save CTA | ✅ | Gold full-width at bottom — explicit save required |

### Verdict: **APPROVED** ✅
The floor plan grid is the correct mental model for seating. The dual-panel drag-and-drop pattern is industry standard and implemented correctly here.

---

## New Patterns Confirmed — E4

**Event Sub-Navigation:** Every admin screen within an event has tabs: סקירה / אורחים / הושבה / תקציב / משימות. This is the event-specific workspace pattern established in E4.

**Status Pill System:** green "מגיע" / amber "ממתין" / red "לא מגיע" — consistent across guest table, guest cards, couple dashboard, seating. Same system throughout the product.

**Table Number as Gold Chip:** When a guest is assigned to a table, their assignment appears as a gold chip. Unassigned guests show empty/muted state. Gold = assigned = completed.

---

*E4 Admin Experience Design Review — 2 screens | All APPROVED | Chief of Staff | 2026-06-27*
