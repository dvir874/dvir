# Stitch Prompt — the couple's dashboard, the first screen behind their private link

Prepared 2026-08-12 · Couple-facing · Mobile First
Route: `/couple/[token]`
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

The duplicate navigation, the missing heading structure, the dead menu button and
69 instances of 9–11px type were fixed in commit 5f6d35f. This prompt is about
what the screen is for.

---

Design the **home screen a couple reaches from the private link sent to them when
they sign up**, in Hebrew (RTL), mobile first.

## 1. Purpose

Tell two people, in one screen, whether their wedding is on track — and give them
the single next thing to do.

## 2. Audience

An engaged couple, months out, on a phone. Not project managers. They open this
between other things: on the bus, in bed, in a break at work. They will look at
it for twenty seconds and want to leave feeling either "we're fine" or "right,
that's the thing to do next".

Both partners use it, often separately, and they see the same data.

## 3. The problem it solves

The screen currently shows **thirty-six interactive elements** in about 1,400px.
Every one of them is a door. Sixty-three tasks are outstanding; readiness reads
15%; the countdown, the confirmations, the seating, the checklist and the budget
all shout at once, and beneath them sit eight more destinations under "עוד
אפשרויות".

**Nothing on the screen is bigger than anything else, so the couple has to do the
prioritising the product was bought to do.**

The data to fix that already exists and is unused: the API returns `phase`,
`phaseLabel`, `phaseMessage`, `readinessPct`, `alerts`, `score` and
`daysUntilEvent`. The product already knows what matters this week. The screen
does not act like it.

## 4. User flow

Open the link → within three seconds know how long is left and whether anything
is wrong → do or dismiss one suggested action → leave. Deeper work
(guests, seating, budget) is a deliberate second step, not competition for the
first.

## 5. Required components

**A. Where we are.** Days remaining, and whether that is comfortable or not.
A number alone does not say which.

**B. One next action.** The single most useful thing right now, chosen by the
product, stated as a sentence and not a menu. This is the screen's centre of
gravity and should be unmistakably the largest thing on it. There is already a
"הצעד הבא שלכם" block; it is currently 12px and buried under four stat tiles.

**C. Is anything wrong.** Alerts, when there are any — and **nothing at all when
there are not.** An always-present empty alert strip trains people to ignore the
place alerts appear.

**D. The numbers, quieter.** Confirmed, seated, tasks, budget. Four figures the
couple wants to check, not four calls to action. Today each is a tile with an
arrow, giving them the same visual weight as B.

**E. Everything else.** Guests, seating, checklist, budget, gifts, vendors,
rides, meal report, gallery, journey, contact. Twelve destinations that must be
reachable and must not compete with B. There is a bottom nav with five slots and
an "עוד" sheet; the split between them should be argued, not inherited.

**F. Getting Dvir.** One tap to a person, always available, never shouting.

## 6. Business context

- This screen **is** the product for the months between signing and the wedding.
  A couple who stops opening it is a couple who does not recommend him.
- Every couple is set up by hand: Dvir enters the guests and configures the
  system. So the screen is rarely truly empty, but it **is** often early — 15%
  readiness and 63 open tasks is the normal starting state, and must not read as
  failure.
- Same screen for every couple; nothing may be specific to one wedding.

## 7. Design constraints

- Works at 63 days out and at 3 days out. Those are different screens
  emotionally, and `phase` already distinguishes them.
- Works with zero confirmations and with 300.
- Minimum 12px type, minimum 44px tap targets (CLAUDE.md).
- Bottom nav is fixed; content must clear it, including
  `env(safe-area-inset-bottom)`.
- No horizontal scroll at 375px.

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      dark   #1C1008      muted  #8C7B6E
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```
The current screen uses emoji as its entire icon set (👥 🪑 📋 💰 🎁 🤝 🚗 🍽️ 📸
🗺️ 💬). They render differently on every device and they are the main reason a
premium palette reads as a hobby project. **Propose a real icon treatment.**

**Imagery — required.** Any woman appearing in a placeholder or generated
photograph must be **modestly dressed**: shoulders covered, high neckline, back
covered, nothing form-revealing. Applies above all to brides, and even where no
figure was asked for.

## 9. Platform

**Mobile First**, per CLAUDE.md — one-handed, thumb-reachable, minimum taps.
Desktop is a widening of the column.

## 10. RTL

Full RTL. Numerals LTR within Hebrew sentences. Dates in Hebrew convention.
Currency as ₪57,000 — the current screen writes "₪57K", which mixes a Latin
abbreviation into Hebrew.

## 11. Accessibility

- A real heading outline; the screen had none until today
- The countdown must be announced meaningfully, not as a bare number
- Contrast ≥ 4.5:1, including gold on ivory, which is the palette's weak pair
- Any status conveyed by colour must also be conveyed by text

## 12. Interaction states

Loading (first paint) · one action pending · action completed · alerts present /
absent · "עוד" sheet open · offline.

## 13. Empty state

The hour after signup: no guests, no confirmations, nothing done. It must read as
*the beginning*, not as *broken*. This is the couple's first impression of what
they paid for.

## 14. Success state

Two of them, and they are different: **a task completed** (small, warm, does not
interrupt), and **the wedding is ready** in the final days — the screen's whole
purpose, and currently indistinguishable from any other day.

## 15. Error states

Data fails to load; an action fails to save. Both must keep the countdown
visible, because that is the one thing the couple came for.

## 16. References

In spirit: a good hotel concierge's morning note. One sentence about today, the
details available if you want them, and no attempt to show you everything it
knows.

## 17. UX goals

- Days remaining and whether anything is wrong, in under three seconds
- Exactly one thing that is obviously the next thing
- The four numbers checkable without being pushed
- Twelve destinations reachable without any of them competing with the one action

## 18. Desired experience

Opening it and thinking "good, we're fine" — or "right, that's what we do next" —
and closing it. Never "there is so much here".

## 19. Emotions

**Reassurance** — someone is holding this.
**Momentum** — one clear thing, not sixty-three.
**Pride** — this is ours, and it looks like our wedding.

Design against: the feeling of opening a project-management tool. The couple did
not hire a project-management tool.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0, with all interaction states, and a written rationale
for every decision — in particular for how the one next action is made
unmistakably primary, what replaces the emoji, and which five destinations earn
the bottom nav.
