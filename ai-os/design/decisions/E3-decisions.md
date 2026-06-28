# E3 Couple Experience — Design Decision Log
## Chief of Staff | 2026-06-26

---

## Decision 1 — Circular Progress Arc for RSVP Count, Not Linear Bar

**Chosen:** Circular SVG arc with the number (89) at the center, in gold Frank Ruhl Libre 900.

**Alternatives considered:**
- A: Horizontal progress bar (left → right fill)
- B: Percentage text only
- **C: Circular arc with number at center — CHOSEN**

**Rationale:** The circular arc puts the number at the focal point of the card. You read "89" first, then see the arc as confirmation. A linear bar puts the fill percentage as primary (how far we've gone) instead of the absolute achievement (89 people confirmed). For an emotional milestone like RSVPs, the count is more meaningful than the percentage.

**Encoded:** Progress cards for high-stakes counts (RSVPs, tasks, seats) should use circular arc by default.

---

## Decision 2 — Alert Strip: Warm, Never Clinical

**Chosen:** Amber-tinted "warm" alert cards with assistant-style language.

**Anti-pattern rejected:** Red alerts. "אזהרה: 23 לא אישרו" style.

**Rationale:** The couple is stressed. They don't need their dashboard to add to that stress. The assistant voice is: "23 אורחים עדיין לא אישרו — שלחו תזכורת?" This is the same information delivered as a caring nudge, not an alarm. The dashboard is their partner, not a compliance monitor.

**Rule:** Maximum 3 alerts visible. Priority order: unseated guests > overdue tasks > vendor payments. Never red borders or backgrounds in couple-facing alerts.

---

## Decision 3 — 2×2 Quick Action Grid Over Tab Navigation

**Chosen:** 2×2 equal-size cards (הושבה / משימות / תקציב / ספקים) below the RSVP card.

**Alternatives considered:**
- A: Bottom tab bar for each section
- B: Horizontal scroll of section cards
- **C: 2×2 grid — CHOSEN**

**Rationale:** The 2×2 grid gives equal visual weight to all four key sections. No section is "more important" in the grid — the couple decides. Tab bars create primary/secondary hierarchy. Bottom nav belongs on the outer shell, not within the planning content. The 2×2 grid is scannable, tappable, and teaches the product's four main verbs (Seat / Plan / Budget / Vendors) in one glance.

---

## Decision 4 — Onboarding Live Preview is the Product's Most Important Moment

**Chosen:** Live preview of "חתונת ענבל ונדב" appears below the name inputs, updating as the couple types.

**Rationale:** The moment the couple sees their own wedding name rendered in Frank Ruhl Libre italic gold — before they've done anything else — they understand what the product is. Not "wedding planning software" but "your wedding, made beautiful." This single moment justifies the entire product positioning. The live preview is not a nice-to-have; it is the product's value proposition in 3 seconds.

**Implementation requirement:** Update on every keystroke. No debounce. No loading state. The update must feel instant.

---

## Decision 5 — Milestone Card with Frank Ruhl Libre Countdown

**Chosen:** Upcoming milestone shown as a warm card with "עוד 5 ימים" in large Frank Ruhl Libre gold.

**Rationale:** Milestones in wedding planning are ritual moments: the venue walkthrough, the rehearsal dinner, the food tasting. They deserve more than a calendar row. By displaying the next milestone as a named card with a beautiful countdown, the dashboard turns operational planning into a sequence of anticipated events. The couple is not managing tasks — they are living through a journey.

**Extends:** The countdown/reveal pattern from Wave 1 RSVP (table number reveal, loading screen). Frank Ruhl Libre + gold = ritual moment.

---

## Decision 6 — Welcome Moment for Admin: Personalized Greeting

**Chosen:** "שלום דביר" as the first large text the admin sees — Frank Ruhl Libre, prominent.

**Rationale:** The admin dashboard is opened every morning. It should say good morning, not "Dashboard." The personalized greeting establishes the right emotional register for the rest of the session: "this tool knows who I am and why I'm here." The KPIs that follow are more actionable when they're presented after a human greeting.

**Pattern encoded:** Personalized greeting as dashboard hero text. All dashboards (admin + couple) should lead with "שלום, [שם]" or equivalent before surfacing data.

---

*E3 Couple Experience Design Decisions | 6 decisions | Chief of Staff | 2026-06-26*
