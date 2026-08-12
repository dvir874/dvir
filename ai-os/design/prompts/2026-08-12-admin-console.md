# Stitch Prompt — the operator console

Prepared 2026-08-12 · Internal · Desktop First
Route: `/admin`
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

The missing tab title, the missing heading and 119 instances of 9–11px type were
fixed in commit eeee498. This prompt is about the shape of the screen.

---

Design the **console from which one person runs every wedding at once**, in
Hebrew (RTL), desktop first.

## 1. Purpose

Let one operator see, across all live events, what needs a human today — and act
on it without navigating.

## 2. Audience

Dvir. One person, every day, often at 01:00, usually while something is
mid-flight: a send running, a guest who did not receive an invitation, a couple
waiting on an answer. He knows the system completely. He is not confused; he is
outnumbered.

This is the only screen in the product with an expert user, and it should be
designed like one — density is a feature here, not a failing.

## 3. The problem it solves

One screen currently holds **148 interactive elements** and thirteen tabs, and
nothing on it distinguishes *the four things that need a person right now* from
*the hundred things that are simply available*.

What already exists but is scattered across separate routes: delivery status,
sending centre, inbox, quote, CRM, marketing kit, tips, automations, messages —
nine destinations in the top nav alone, plus a wizard, plus tools menus.

The daily reality this must serve, from today's operations:
- messages that stall in `accepted` and never reach anyone
- guests with no WhatsApp who need a phone call
- helpers with assignments outstanding
- a daily send cap that must not be exceeded and must not be wasted
- couples whose requests are waiting

**These are the screen. Everything else is a drawer.**

## 4. User flow

Open → see what needs a person today across all events → act, or assign it →
watch a send run without leaving → move to the next thing. Per-event detail is a
deliberate second step.

## 5. Required components

**A. Today, across all events.** Not a tab per event. The operator's unit of work
is the day, not the wedding.

**B. Needs a human.** The queue: failures, unreachable guests, stalled sends,
unanswered couple requests. Each row must be actionable in place — call, retry,
mark done, assign — without navigation. This is the screen's reason to exist.

**C. What is running.** Sends in flight, the cap consumed and remaining, next
scheduled run, and whether the last run happened. `/admin/sending` does this well
already; the question is whether it belongs here rather than one click away.

**D. The events.** Three live weddings today, at 12, 41 and 63 days. Each needs a
one-line state, not a dashboard.

**E. Everything else.** Nine or more destinations that must stay reachable and
must stop competing with B.

## 6. Business context

- Internal, one user, never indexed. **No visual marketing burden at all** — this
  screen has no one to impress and should be judged only on speed.
- Mistakes here are expensive in a way they are not elsewhere: a wrong send goes
  to hundreds of real guests at somebody's wedding and cannot be recalled.
  **Destructive and bulk actions must be visually distinct from safe ones**, and
  anything that sends must state how many people it will reach before it is
  pressed.
- The operator is often on a phone, away from a desk, during an event. Desktop
  first, but the "needs a human" queue must survive at 375px.

## 7. Design constraints

- Density is correct here. Whitespace that costs a scroll costs time.
- Live data must update without a manual refresh, and must show when it last did.
- Minimum 12px type, ≥ 44px tap targets on anything reachable on a phone.
- 148 interactive elements is the current count. Propose a target and defend it.

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      ink    #1C1008      danger #B24C4C
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```
Same palette as the product, but this screen may be plainer and tighter — it is a
cockpit, not a showroom. The current navigation is emoji-led (🧭 📊 📤 💬 🧮 ☀️
📋 📣 🎓); propose a real icon treatment.

## 9. Platform

**Desktop First** per CLAUDE.md — tables, dense lists and multi-column are all
correct. Define the phone behaviour of the "needs a human" queue explicitly.

## 10. RTL

Full RTL, including tables and any chart axis. Numbers, phone numbers and
timestamps LTR inside Hebrew.

## 11. Accessibility

- A heading outline; there was none until today
- Status never by colour alone — this screen is read tired
- Every row action keyboard-reachable; the queue should be workable without a
  mouse
- Live regions announce completion without stealing focus mid-task

## 12. Interaction states

Idle · loading · send in progress · send blocked by cap · action failed · row
resolved · offline / stale data.

## 13. Empty state

**The best day: nothing needs a human.** Design it properly and make it feel
earned, because it is the state the whole system is trying to produce and the
operator should be able to recognise it instantly and close the tab.

## 14. Success state

The queue emptied. Quiet, unmistakable, not celebratory — it will be seen daily.

## 15. Error states

Data stale or failed to load. Critically: **the screen must never imply that all
is well when it simply does not know.** A silent failure here means a wedding
invitation that never arrives.

## 16. References

Air traffic control, not a marketing dashboard. Everything that matters visible
at once, nothing decorative, and the exceptions louder than the norms.

## 17. UX goals

- What needs a person today, in under five seconds, across all events
- Each queue item actionable without navigating away
- A send observable start to finish from this screen
- Nothing that sends to real guests reachable by accident

## 18. Desired experience

Sitting down, seeing the four things, doing them, and closing the laptop.

## 19. Emotions

**Control** — nothing is happening that I cannot see.
**Trust** — if it says all clear, it is all clear.
**Speed** — no ceremony between noticing and acting.

Design against: the feeling of hunting through tabs for something you know is
wrong somewhere.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0 — and note that for this screen B is the likely
winner; carry the other two only if they earn it. Include all interaction states
and a written rationale, in particular for what left the first screen, what
replaces the emoji, and how a bulk send is made hard to press by accident.
