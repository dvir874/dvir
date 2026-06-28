# Experience Intelligence Report — Wave 1
## "הרגע שבו מישהו מרגיש שהוא מוזמן"
## Chief of Staff | 2026-06-26

---

## Experience Summary

Wave 1 redesigns the RSVP guest experience from a functional form
into an emotionally resonant invitation moment.

Direction: Warm Romantic
Screens reviewed: 5 (Loading, Form, Confirmed, Declined, Error)
Design source: Stitch Project 7980168406882022650
Review date: 2026-06-26

---

## What Works Well

**The cream background.** The moment it loads, the page feels different from any RSVP form guests have seen. It has the quality of paper. This is a pre-attentive signal that something premium is happening before a single word is processed.

**Frank Ruhl Libre at scale.** When the couple's name appears in a large serif Hebrew typeface, guests instinctively treat it with the same respect they would give a printed name on a physical invitation. Typography as emotional signal.

**The olive branch.** The most surprising design decision — and the strongest. Using a natural, peaceful image in the declined state is genuinely sophisticated. It signals: "we are gracious hosts, not disappointed ones." No other Israeli wedding platform handles the declined state with this kind of care.

**The table number reveal.** Taking a functional piece of information (your table number) and turning it into a designed moment (a large serif numeral on cream, surrounded by space) replicates the experience of finding your seat card at a physical wedding. This is the kind of detail that couples will hear about from their guests.

**Zero navigation chrome.** The decision to remove all navigation elements from the RSVP page is correct and unusual. It says: "you are here for one thing, and this experience is for that one thing." Premium through restraint.

---

## What Feels Premium

- Cream background — the most immediate premium signal
- Frank Ruhl Libre for the couple name — editorial, Hebrew, timeless
- Gold CTA buttons — celebratory without being loud
- White space — the breathing room signals quality
- The declined state photography — unexpected warmth signals sophistication
- No lorem ipsum — real Hebrew copy in every screen

---

## What Creates Trust

- Personalized guest greeting ("שמחים להזמין אתכם, משפחת כהן") — feels intentional
- Consistent brand mark at the top of every state — continuity
- Complete information in the confirmed state (date, venue, table, Waze, calendar) — nothing left to guess
- Warm error state with a clear next step — no dead ends
- The declined state treating the guest with dignity — earns trust from non-attendees

---

## What Creates Emotion

- The warm load screen — the first moment of the experience creates anticipation
- The couple name rendered beautifully — pride for the couple, honor for the guest
- The gold CTA button — the act of confirming feels like participating in something special
- The table number reveal — a small delight that replicates a physical ritual
- The olive branch in the declined state — unexpected warmth creates gratitude
- "תודה שאישרתם! ❤️" — simple but genuine

---

## Company Standards (should become permanent)

**Standard 1: Guest-facing pages have zero navigation chrome.**
No bottom nav. No hamburger. No tabs. Guest pages are single-purpose experiences.
→ Document in: `ai-os/design/library/layout-patterns.md`

**Standard 2: Cream is the default background for premium experiences.**
Not white. Not gray. Cream (#F6F1E8 / #FDFAF5).
→ Document in: `ai-os/design/memory/design-memory.md`

**Standard 3: The declined state is always warm.**
Gracious copy. Nature imagery. No guilt. No sadness.
→ Document in: `ai-os/design/library/layout-patterns.md`

**Standard 4: Ritual moments must be designed.**
Whenever a user receives something they were waiting for (table number, confirmation, ticket), design it as a reveal — not as a form field.
→ Document in: `ai-os/design/library/layout-patterns.md`

**Standard 5: Hebrew-only in the primary experience.**
No English copy in the emotional core. Brand names (Waze, Google) are exceptions.
→ Document in: `ai-os/design/memory/design-memory.md`

---

## Anti-patterns (should never be used again)

**Anti-pattern 1: Navigation chrome on guest pages.**
The Stitch first-draft included a bottom navigation bar and hamburger menu. These were identified and flagged for removal. They break the single-purpose experience and signal "this is an app" instead of "this is your invitation."

**Anti-pattern 2: English taglines on Hebrew experiences.**
"MAZAL TOV EXPERIENCE" appeared in the loading screen. Correct decision to remove it. English on a Hebrew primary experience breaks authenticity.

**Anti-pattern 3: Generic confirmation copy.**
"הטופס נשלח" is not acceptable. Every confirmation state must be warm, specific, and celebratory in proportion to the moment.

**Anti-pattern 4: Functionality without emotional design in error states.**
The Stitch design correctly avoided this — the error state has imagery, warm copy, and a branded button. This standard must be held for all future error states.

---

## Technology Finding

Stitch-generated HTML (2026-06-26) is production-grade:

- `dir="rtl" lang="he"` from line 1
- Brand fonts (Frank Ruhl Libre + Heebo) loaded from Google Fonts
- Brand colors in Tailwind configuration (`primary-container: "#c5a46d"`)
- Tailwind CSS with RTL utilities
- 237 lines per screen — clean and adaptable

**Conclusion:** Stitch HTML is a strong foundation, not a mockup. Implementation adapts it to Next.js; it does not rebuild from scratch.

---

## Questions for Future Waves

1. Should the guest experience include a light animation on the table number reveal? (Fade in from below, 0.3s — adds delight without excess.) Decision for Wave 1 implementation or Wave 2 review.

2. Should the confirmed state include the couple's photo behind the table number (at low opacity, as a background)? Could be beautiful. Could be clutter. Requires Stitch direction.

3. Should the RSVP confirmed state allow the guest to update their response? Currently: once submitted, read-only. Consider adding "שינוי תגובה" as a subtle link for the Already Responded state.

---

*Experience Intelligence Report | Wave 1 | Chief of Staff | 2026-06-26*
*Feeds into: Design Memory, Design Library, Company Brain*
