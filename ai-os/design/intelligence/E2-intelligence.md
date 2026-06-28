# Experience 2 — Guest Experience Intelligence Report
## Chief of Staff | 2026-06-26

---

## Executive Summary

The Guest Experience is the product's most public face. Every RSVP link, mini website, and gallery page is seen by people who are NOT customers — they are the customers' guests. The design quality of these screens directly affects how the couple is perceived by their social circle.

**Key insight:** The guest experience is not a form. It is a digital extension of the wedding invitation. Every design decision must answer: "Does this feel like an invitation or a web form?"

---

## Company Standards Established — E2

### Standard 1 — Premium Photography as Primary Signal
Premium photography at the top of any invitation-context screen is mandatory. It cannot be replaced by typography alone. The moment between "opening a link" and "reading content" must be filled with visual warmth. Photography achieves this; colored backgrounds do not.

**Applies to:** Mini Website, RSVP page (hero section), Memory upload landing.

### Standard 2 — The Countdown is a Ritual Reveal
The days-remaining countdown on any guest-facing page is NOT a utility. It is an emotional device. "24 ימים" in large gold Frank Ruhl Libre creates imminence. Display it as a focal card, never as a small header element.

**Applies to:** Mini Website, RSVP hero, Couple dashboard.

### Standard 3 — Type Selection Before File Picker
Any upload or contribution flow must begin with intent selection, not with a file picker. The type selection step (Photo / Video / Blessing / Voice) transforms the action from "file upload" to "memory sharing." This is a non-negotiable UX standard for any guest contribution flow.

**Applies to:** Memory Upload, Photo Challenge (future feature).

### Standard 4 — Gracious States for Difficult Moments
Any state where the user must deliver disappointing information (declining, missing RSVP deadline, already responded) must be wrapped in warmth and acknowledgment. The visual language: olive branch / botanical illustration, gold or warm amber tones, copy that expresses understanding.

**Anti-pattern confirmed and rejected:** Red error screens for the declined state. The decline is not an error. It is a sad but valid response. Design must acknowledge sadness with grace, not alarm.

---

## Anti-Patterns Documented — E2

| Anti-Pattern | Why Rejected | Correct Approach |
|---|---|---|
| Navigation chrome on guest pages | Guests have nowhere to navigate to | Zero chrome — single-purpose screens |
| Generic form labels ("Select option") | Breaks invitation metaphor | Hebrew copy: "האם תגיעו?" |
| File picker without type selection | Transactional feel | Intent step first (Photo/Video/Blessing/Voice) |
| White background for invitation screen | Hospital/form feel | Cream/ivory always |
| "אזהרה" / red for declined state | Guest feels punished | Olive branch + warm copy + gracious exit |
| English CTA on Hebrew pages | Brand authenticity | Hebrew everywhere, no exceptions |

---

## Technology Observations — E2

- Stitch generates fully RTL-correct HTML for Hebrew content including form inputs, direction attributes, and font stacks
- Photography from Stitch's image generation is warm-toned by default when the prompt specifies "warm romantic" — no post-processing needed
- Mobile layout auto-optimizes for 390px viewport — full-width CTAs, appropriate font scaling
- The cream background (#F6F1E8 / #FDFAF5) renders correctly on both iOS Safari and Android Chrome without color shift

---

## Design Hypothesis for Future Testing

**Hypothesis:** A guest who sees the Mini Website before clicking the RSVP link has a 20%+ higher RSVP completion rate than a guest who receives only the direct RSVP link.

**Rationale:** The Mini Website sets context (couple, date, venue, countdown) before the guest is asked to make a decision. Decision-making is easier when context is established.

**Recommendation:** Track UTM parameters on Mini Website views vs direct RSVP link clicks. Compare completion rates when post-launch analytics are available.

---

## Next Wave Recommendations — E2

1. **Gallery upload experience** — the current gallery page needs a premium redesign that matches the invitation quality of the RSVP
2. **Post-event Memory Wall** — when photos accumulate, the wall needs a grid design that makes guests proud to have contributed
3. **Time Capsule unlock moment** — one of the product's most emotional potential moments. Needs dedicated design attention
4. **Post-event Survey** — currently undesigned. Must feel like a warm thank-you, not a customer satisfaction survey

---

*E2 Guest Experience Intelligence Report | Chief of Staff | 2026-06-26*
