# Stitch Integration Protocol v2.0
## רגע לפני AI Company OS | CEO Directive | 2026-06-26 | IMMUTABLE

---

## Hierarchy

```
Chief of Staff      — manages the process
Stitch              — Lead Product Designer (DESIGN AUTHORITY)
Claude              — Lead Engineer (implementation only)
```

---

## Golden Rules

```
❌ Never design a new screen without Stitch
❌ Never implement a screen without Design Review
❌ Never improvise UI
```

---

## Journey First

**אסור לעצב מסך בודד.**

Before any design, map the full User Journey.
Stitch must understand where each screen sits in the journey
and how it connects to screens before and after it.

Example guest journey:
```
WhatsApp Invitation → Invitation → RSVP → Confirmation →
Wedding Day → Gallery → Thank You
```

---

## 3 Design Directions Per Wave

```
Direction A — Luxury Editorial
Direction B — Modern Minimal
Direction C — Warm Romantic
```

CoS recommends → CEO chooses → only then: continue.

---

## Design Rationale (Required for Every Screen)

Stitch must explain:
- Why this layout was chosen
- Why the button is positioned there
- Why this hierarchy is correct
- Why this typography fits
- Why these spacings were chosen
- How the design serves business goals

---

## Design QA Checklist (Before Approval)

```
[ ] Premium
[ ] Trust
[ ] Mobile
[ ] RTL
[ ] Accessibility
[ ] Visual Hierarchy
[ ] Brand Consistency
[ ] Emotion
[ ] Simplicity
[ ] White Space
[ ] Delight
```

---

## Responsive Requirements

Every screen designed for:
```
375px   (iPhone SE, standard)
390px   (iPhone 14/15)
430px   (iPhone Plus)
Tablet  (768px)
Desktop (1280px)
```

---

## Interaction States (All Required)

```
Hover           Pressed         Focused
Loading         Success         Error
Disabled        Empty           Animation
Transition      Micro Interaction    Haptic Feedback
```

---

## Real Content

No Lorem Ipsum. Minimum 3 real scenarios per screen.

---

## Fallback (When Stitch MCP Unavailable)

1. Claude produces complete Design Pack (all prompts, ready to copy)
2. Claude STOPS
3. CEO runs prompts in Stitch
4. CEO returns results
5. Claude continues automatically from Implementation

---

## Design Pack (Required Before Every Wave)

Design Dependency Analysis first. Then prepare:
```
All screens
All components
All primitives
All states (all 12 interaction states)
All animations
All responsive variants
All empty states
All loading states
All error states
All success states
```

Only after ALL designs are ready → code begins.

---

## Final Goal

> "המשתמש לא צריך להרגיש שהוא עובר בין מסכים,
> אלא שהוא עובר בין רגעים במסע החתונה שלו."

Quality > Speed. Always.

---

*CEO directive | 2026-06-26 | Immutable*
