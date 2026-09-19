# Stitch Prompt — "טעינת הושבה מאקסל" (Seating Import)

Prepared 2026-09-19 · Couple area · **Mobile First** · RTL
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

Backend is built and merged (`/api/couple/[token]/seating/import`, `seating-grid.ts`).
No screen exists. This prompt is the screen.

---

Design a **mobile-first flow in Hebrew (RTL)** for a wedding-planning product,
inside the couple's own area. It takes the seating plan a family already made
in Excel and puts it into the app, in place of seating 371 people by hand.

## 1. Purpose

Turn a spreadsheet into a seating plan the product can use — and, before
anything is saved, show the couple exactly what was understood from their file
so they can say "yes, that's my wedding" or stop.

## 2. Audience

The bride or groom, on a phone, usually in the evening, usually tired. Not
technical. They did not make this spreadsheet to be read by software — they
made it for themselves, and a cousin's family added a column to it.

The real quote this screen exists because of, from טל, 19/09:

> "משפחת החתן הצליחה לשבץ בשולחנות, אני לא הצלחתי - האפליקציה ממש קשה"

She had already finished the work. The app simply had no door.

## 3. The problem it solves

Every couple seats their wedding in Excel first. The app has had a seating
screen for months and production holds **two** table rows across every wedding
on the system, because the only way in was dragging households into tables one
at a time on a phone.

The screen must make three things true:

- Getting a finished plan in is **one action**, not 371.
- The couple **sees what was read** before anything is written. A guest sent to
  the wrong table cannot be helped at the door.
- Whatever could not be read is **shown by name**, never silently dropped. A
  household missing from the plan is how somebody arrives to no chair.

## 4. User flow

Entry: the seating screen's empty state, and a secondary entry from its menu
once a plan exists.

```
מסך הושבה (ריק) → "יש לי את זה באקסל" → בחירת קובץ
   → קריאה (2-4 שניות)
   → מסך אישור: מה נקרא · מה לא · מה לא התאים
   → [אישור] → נשמר → חוזר למסך ההושבה מלא
```

Four screens. The third is the one that matters and needs the most design.

**Screen 3 must be scannable in ten seconds on a phone** and expandable for
someone who wants every row. The couple should be able to approve without
scrolling, and to dig without leaving.

## 5. Components required

**Screen 1 — entry (inside the existing empty state)**
- Primary: "טעינת הושבה מאקסל". Secondary, quieter: "לבנות שולחנות כאן"
- One line of reassurance: "אפשר לטעון את הקובץ שכבר עשיתם. לא נמחק כלום."

**Screen 2 — file picker**
- Large drop/tap target; on mobile opens the native file sheet
- Accepts .xlsx/.xls/.csv; says so
- Names what it will and will not use: "נשתמש במי יושב איפה. כמה אנשים בכל
  הזמנה נשאר מה שהאורחים אישרו"

**Screen 3 — the readback (the heart of this design)**
- A headline verdict: "נקראו 28 שולחנות · 208 הזמנות · 367 מקומות"
- A trust line, because the number came from the couple's own file:
  "המספרים מסתדרים עם שורות הסה\"כ שבקובץ"
- **Table cards** — scrollable, one per table: number, seat count, group name,
  and the households at it. Collapsed by default, tap to open.
- **Three attention groups**, visually distinct from the tables and never
  hidden behind a tap:
  1. `לא זוהו ברשימת המוזמנים` — name, which sheet and row, and up to three
     suggestions from the guest list ("אולי: …"), each selectable
  2. `אותו מוזמן בשתי שורות` — both rows shown, neither applied
  3. `אישרו הגעה ואינם בקובץ` — a count with names behind a tap
- A quieter fourth: `כמות בקובץ שונה ממה שהאורח אישר` — shown, explicitly
  marked as **not** being changed
- Sticky bottom bar: primary "לאשר ולשמור", secondary "ביטול". Safe area.

**Screen 4 — result**
- Short success, the numbers written, and one next action:
  "לשלוח לכל אורח את מספר השולחן שלו"

## 6. Business context Stitch needs

- A row in the file is a **household**, not a person: "ימית וספי קנריק" is one
  row and eleven people. Cards must show both counts without confusing them.
- Tables are **numbered by the venue** — the number is what a sign in the hall
  says. It is the single most important character on this screen.
- Real scale, from the file this was built on: 28 tables, 96 + 112 rows, 371
  people, two family sheets in two different layouts.
- Nothing is destructive. Tables already in the app are matched by name; a
  guest the file does not mention keeps their seat. The design should say this
  once, calmly, and not belabour it.

## 7. Design constraints

- Mobile 375px is the design target. Tablet and desktop are widened versions
  of the same screen, not different screens.
- No drag-and-drop anywhere in this flow. That mechanic is what failed.
- Screen 3 must work with 28 table cards and 40 problem rows without becoming
  a wall. Assume the worst case, not the demo.
- All touch targets ≥ 44px.
- Sticky elements respect `env(safe-area-inset-bottom)`.
- Gentle motion only.

## 8. Brand guidelines

- Colours, only these: ivory `#FDFAF5` · cream `#F6F1E8` · gold `#C5A46D` ·
  olive `#6B7B5A` · dark ink `#1C1008`
- Type: **Frank Ruhl Libre** for headings (700–900), **Heebo** for body
  (300–600)
- Premium, minimal, generous white space, modern cards, soft corners, restrained
  use of gold as accent rather than fill
- Feeling: a quiet concierge, not a data tool

> **Imagery — required.** Any woman appearing in a placeholder or generated
> photograph must be **modestly dressed**: shoulders covered, high neckline,
> back covered, nothing form-revealing. This applies above all to brides. Apply
> it even where no figure was asked for, since wedding screens attract them by
> default. A render that does not meet this is regenerated, not cropped.

## 9. Mobile First / Desktop First

**Mobile First.** Most couples do this from a phone. One-handed, thumb-reachable
primary actions. Cards, never tables.

## 10. RTL

Full RTL Hebrew. Numbers stay LTR inside RTL lines — a table number and a
headcount must never flip. Icons, chevrons and progress mirror.

## 11. Accessibility

- Contrast ≥ 4.5:1 for all text, including gold on ivory (gold is an accent,
  not a text colour, wherever it cannot hold the ratio)
- Targets ≥ 44px; the file picker larger still
- The three attention groups must be distinguishable **without colour alone** —
  icon plus label
- Every count is also a readable sentence for a screen reader

## 12. Interaction states

Design all of: default · tap/press · focus · loading · disabled ·
expanded/collapsed card · selected suggestion · scrolled sticky bar ·
long name truncation · very long list.

## 13. Empty states

- Seating screen with no plan at all — this is where the flow starts and it is
  the single highest-value frame in the set
- A file that parsed but contained no seating at all
- No guest list imported yet: the import cannot run; say what to do first

## 14. Success states

- Saved: what was written, in the couple's terms ("28 שולחנות · 208 הזמנות")
- Saved with leftovers: success that still shows the unresolved rows, without
  reading as failure

## 15. Error states

- Unreadable file — with the reason, per sheet
- **A sheet whose numbers do not add up to its own total.** The reader refuses
  it deliberately rather than guessing. This needs a state that reads as
  careful, not broken: "בגיליון 'קנריק' הספירה מגיעה ל-104 והקובץ כותב 108.
  לא שיבצנו אותו כדי לא להושיב מישהו במקום הלא נכון."
- Network failure mid-save
- Wrong file entirely (a budget sheet)

## 16. Design references

The product's own existing couple screens are the reference: the dashboard, the
guest screen, the current seating screen. Nothing here should look imported
from another product. Airbnb's booking-review step is the right *posture* for
screen 3 — a calm summary before commitment.

## 17. UX goals

- A finished plan goes in in **under 60 seconds**
- Screen 3 is **understood** — the couple can answer "how many tables?" and
  "what needs my attention?" without scrolling
- Zero destructive surprises
- Nobody needs to edit their spreadsheet to make it acceptable

## 18. Desired experience

Someone competent took the file and read it properly. The couple's job is to
confirm, not to work.

## 19. Emotions

Relief, first and mostly. Then trust — the numbers match what they wrote, so
the system clearly *read* their file rather than guessed at it. Then
lightness: the biggest remaining task on their list just finished.

Explicitly not: pride in the technology, cleverness, or anything that asks the
couple to admire the import.

## 20. Product Design Foundation

Use the Product Design Foundation (`ai-os/design/library/`, `layout-patterns.md`)
for spacing scale, card treatment, button hierarchy and typography ramp. Do not
invent new primitives. Where this flow needs something the Foundation lacks,
mark it and explain why.

---

## Deliverables requested from Stitch

Per Stitch Integration Protocol v2.0 — three directions:
**A · Luxury Editorial · B · Modern Minimal · C · Warm Romantic**

Frames, each at 375px:
1. Seating empty state with the import entry
2. File picker
3. Readback — clean case (nothing needing attention)
4. Readback — real case (28 tables, 11 unmatched, 2 duplicates)
5. Readback — one table card expanded
6. Unreconciled-sheet refusal state
7. Success
8. Unreadable-file error

Plus the 12 interaction states and a rationale line per decision.
