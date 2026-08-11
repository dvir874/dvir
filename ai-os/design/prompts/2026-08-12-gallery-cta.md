# Stitch Prompt — CTA block, foot of the guest photo gallery

Prepared 2026-08-12 · Guest-facing · Mobile First
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

---

Design a **single closing block for the bottom of a wedding photo gallery**, in
Hebrew (RTL), mobile first. It is the last thing a guest sees after scrolling
through photographs of a wedding they attended and enjoyed.

## 1. Purpose

Turn a guest into the next customer, without ever feeling like an
advertisement. Roughly one guest in ten at any Israeli wedding is themselves
engaged or about to be. They have just spent several minutes enjoying
something this product made, and this is the only moment they will ever be
this warm toward it.

## 2. Audience

A wedding guest on their phone, days after the event, looking at photos of
people they love. Not shopping. Not in a buying frame of mind at all — and the
design has to respect that or it will be scrolled past and resented.

## 3. The problem it solves

The service is invisible to the people best placed to recommend it. The gallery
carries a small "רגע לפני" mark in the top bar and nothing else; a guest who
loved the whole experience — the invitation, the one-tap RSVP, the gallery —
has no idea any of it has a name, and no way to ask.

There is also a constraint that makes this block the ONLY place the pitch can
live: the WhatsApp message that brings guests here is an approved UTILITY
template. Adding a single promotional sentence to it would have Meta reclassify
it as MARKETING, which subjects it to the recipient's marketing cap — the same
cap that stopped sixteen invitations reaching guests in one day. **The message
must stay clean. The page carries the invitation to talk.**

## 4. User flow

Guest opens the gallery from WhatsApp → browses, downloads, perhaps uploads
their own photos → reaches the end of the grid → meets this block → either
scrolls past it without friction, or taps to call / open the site.

It must never interrupt the browsing. No modal, no sticky bar, no overlay.

## 5. Required components

One block, and it should feel like a closing note rather than a banner:

- a quiet transition from the photo grid — this is a different kind of content
  and the eye should be told so
- **a line of credit**, tying what they just enjoyed to a name. Something in the
  register of: *"ההזמנות, אישורי ההגעה והגלריה של החתונה הזאת נוהלו ברגע לפני"*
- **a soft question** rather than a pitch: *"מתחתנים בקרוב?"*
- **two actions, equal in weight**:
  · call — `053-331-8177`
  · visit — `regalifnei.co.il`
- optionally one line of what the service is, for a guest who has no idea

Under six lines of text in total. If it needs more, it is the wrong block.

## 6. Business context

- The couple paid for this gallery; the block must never make THEIR gallery
  look like an advertising surface. Their guests are their guests.
- Referral is how this business grows. There is no ad budget.
- The same block will sit at the foot of every couple's gallery, so it cannot
  reference any particular wedding.

## 7. Design constraints

- Bottom of an existing page; not a section that competes with the photos
- Must read as a footer note, not as a banner or a card that demands attention
- No badge, no "special offer", no urgency, no exclamation mark
- Works under a grid of photographs of any colour without clashing
- Total height on mobile: aim for under 200px

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      dark   #1C1008
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```
The gallery above it is already ivory with gold accents; this must belong to the
same page rather than announce itself as a new one.

## 9. Platform

**Mobile First** — nearly every view is a phone, opened from WhatsApp. Desktop
is a widening of the same block, not a different layout.

## 10. RTL

Full RTL Hebrew. The phone number stays LTR. Any arrow points right (back /
onward in RTL). Tap targets reachable with a thumb on a large phone.

## 11. Accessibility

- Both actions ≥ 44px, comfortably apart — a mis-tap that dials a phone number
  is worse than a mis-tap that does nothing
- Contrast ≥ 4.5:1 against ivory, including the muted credit line
- The call action is a real `tel:` link and the site a real link, both
  keyboard-reachable and labelled

## 12. Interaction states

Default · hover · pressed · focus-visible on both actions.

## 13. Empty state

None — the block is static and always present.

## 14. Success state

None. Tapping leaves the page. Nothing here should confirm anything.

## 15. Error states

None.

## 16. References

The gallery's own top bar already carries the "רגע לפני" mark in Frank Ruhl
Libre gold; this closes the page in the same voice. In spirit: the printer's
mark on the last page of a beautiful book — quiet, confident, easy to ignore,
and unmistakably proud of the work.

## 17. UX goals

- A guest who does not care scrolls past without irritation — this is the
  primary requirement, and it outranks every other
- A guest who IS getting married finds a way to make contact in one tap
- The couple, seeing it on their own gallery, feels credited rather than sold
  through

## 18. Desired experience

The feeling of noticing the name of the florist on a card at the end of a
beautiful evening. Not a sales moment; a small, well-placed signature.

## 19. Emotions

**Pride** — this was well made, and here is who made it.
**Warmth** — a continuation of the evening, not a break from it.
**Ease** — one tap to talk to a person, no form, no funnel.

The counter-emotion to design against: the sinking feeling of realising a
beautiful thing was a funnel all along. If the block produces that even once,
it costs more than every lead it could win.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0, with all interaction states, and a written rationale
for every decision — in particular for how far the block separates itself from
the photographs above it.
