# Stitch Prompt — "מרכז השליחה" (Sending Control)

Prepared 2026-08-11 · Admin area · Desktop First
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

---

Design a **desktop-first admin screen in Hebrew (RTL)** for a wedding-guest
management SaaS. The screen answers one question that the product currently
cannot answer at all: **"did the automatic invitation sender actually run, and
what did it do?"**

## 1. Purpose

A wedding has ~320 guests. Invitations go out automatically twice a day over
WhatsApp, in batches, throttled by limits Meta imposes and changes without
notice. This screen is where the operator sees whether that machine is alive,
what it did on each run, and what it is about to do next.

## 2. Audience

The service operator — one person, running several weddings at once, checking
this on a laptop between other work. Not technical. Should never have to reason
about API errors, quotas or retry logic; the screen must translate all of it.

## 3. The problem it solves

Today the sender reports everything it did into a server log nobody opens. When
the operator asks "did the 15:00 run send anything?" the only way to find out is
to query the database by hand. Twice this month a silent failure went unnoticed
for two days while 55 guests sat with no invitation and every existing screen
reported a healthy system.

The screen must make three things impossible to miss:
- a run that **did not happen at all** (the scheduler stopped firing — the one
  failure the sender itself can never report)
- a run that **ran but sent nothing**, and why
- guests the automation has **given up on**, who now need a human

## 4. User flow

Entry (from the admin sidebar) → the top of the screen answers "is it healthy?"
in under two seconds → below it, the history of runs, newest first → clicking a
run expands to the guest names it sent to and the ones that failed with reasons
→ a persistent side panel shows what the next run will face → from a failed
guest, one action: "someone needs to call them".

Target: the health question answered without a click. Any single run's detail:
one click.

## 5. Required components

**A. Health header** — the whole state in one strip:
- status (healthy / limited / blocked) with the reason in plain Hebrew
- `דירוג איכות` GREEN / YELLOW / RED — Meta's rating of how recipients react
- `תקרה יומית` e.g. 90, and `נותרו היום` e.g. 42
- when the last run happened, and when the next is due (10:00 / 15:00)

**B. Missed-run warning** — appears only when scheduled runs are missing.
This is the highest-severity element on the screen and must look it.

**C. Run history** — a row per run, newest first:
- time · sent · failed · `healed` (records the system repaired on its own)
- outcome: sent normally / `window_full` / `budget_exhausted` /
  `outside_sending_hours` / `meta_blocked` / `nothing_due`
- a row that sent 0 must read as *deliberate*, not broken — unless it was

**D. Expanded run detail** — names, not counts:
- who received it
- who failed, each with a human reason and what to do:
  · "מכסת הנמען — ננסה שוב מחר" (automatic, no action)
  · "הנמען בקבוצת ניסוי של מטא — צריך שליחה מטלפון אישי" (needs a human)
  · "אין וואטסאפ במספר — צריך להתקשר" (needs a human)

**E. "What's next" panel** — for the upcoming run:
- `לא קיבלו כלום` 74 ← always sent first
- `קיבלו ולא ענו` 112 ← reminders, only after the first group empties
- `מוקצים לעוזרות` 21 ← the automation will not touch these
- remaining quota, and the resulting estimate: "יסתיים בעוד יומיים"

**F. Needs-a-human list** — guests the automation has permanently given up on.
Small, always visible, never buried.

## 6. Business context

- Meta caps unique recipients per rolling 24 hours; exceeding it restricts the
  number for every client at once. The cap is not a setting — it is read from
  Meta on each run and can change overnight.
- The sender sends in a strict order: guests with no invitation at all, then
  failed attempts, then reminders. This order is the product's core promise and
  should be legible on the screen.
- Quality rating dropping to YELLOW is an early warning of restriction. It
  should feel like a warning before anything has gone wrong yet.

## 7. Design constraints

- Desktop first, ~1280px working width; must not break at 1024
- No horizontal scrolling on the page body; wide tables scroll inside themselves
- Dense is acceptable here — this is an operator tool, not a guest experience
- No decorative illustration; every pixel carries information
- Must remain readable at a glance from ~1m away (checked in passing, often)

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      dark   #1C1008
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```
Brand colours only. Status colours must be derived from this palette rather
than introduced — olive for healthy, gold for attention, and a muted brick that
sits inside this world for failure. Nothing neon; the product's register is
warm and premium even in an operations screen.

## 9. Platform

Desktop First. The admin area is explicitly desktop-first in this product
(tables, density and multiple data points are welcome). A usable 768px layout
is desirable but secondary.

## 10. RTL

Full RTL Hebrew. Numbers stay LTR. Timestamps in Hebrew 24-hour format.
Phone numbers LTR inside RTL rows. Icons and progress directions mirror.

## 11. Accessibility

- Status must never be carried by colour alone — always colour + label + shape
- Minimum 44px touch targets on interactive rows
- Contrast ≥ 4.5:1 for all text, including muted secondary text
- Expandable rows keyboard reachable, focus visible

## 12. Interaction states

Default · hover on a run row · expanded · loading (initial fetch) · refreshing
(background poll) · disabled action · focus.

## 13. Empty state

No runs recorded yet — the feature is new and this will genuinely be the first
thing the operator sees. It must reassure ("the recorder is on, the first run
will appear at 10:00") rather than look broken.

## 14. Success state

A run that reached everyone due, with nothing left needing a human. This should
feel like a quiet, earned calm — not a celebration. The operator sees this
twice a day; it must not become noise.

## 15. Error states

Three distinct kinds, and they must not look alike:
- **the scheduler did not fire** — nothing arrived, the most severe
- **Meta blocked or restricted us** — the machine is fine, the account is not
- **individual guests failed** — the run was healthy, some people need a call

## 16. References

The product's own admin already uses cards on ivory with gold rules and Frank
Ruhl Libre headings; this screen should read as part of it. In spirit: an
aircraft status board — one glance for "everything is fine", detail on demand,
and anything abnormal impossible to walk past.

## 17. UX goals

- "Is it working?" answered in under 2 seconds without a click
- Any run's full detail in one click
- A missed run is noticed the same day, not two days later
- The operator never needs to know what a Meta error code is

## 18. Desired experience

Calm and trustworthy. The operator opens it, sees green, and closes it. On the
day something is wrong, the screen tells them exactly what and exactly what to
do — without them having to hunt.

## 19. Emotions

**Control** — someone is minding this while I sleep.
**Honesty** — when it did not send, it says so plainly and says why.
**Relief** — the guest who fell through is *named*, not buried in a number.

The counter-emotion to design against: the false calm of a screen that reports
health because it never looked. That has already happened here twice.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0, with all 12 interaction states, and a written
rationale for every layout decision.
