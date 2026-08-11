# Stitch Prompt — the screen a guest reaches after uploading a photo

Prepared 2026-08-12 · Guest-facing · Mobile First
Supersedes 2026-08-12-gallery-cta.md, which targeted the wrong surface.
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

---

Design the **confirmation screen a wedding guest sees immediately after
uploading a photo or video**, in Hebrew (RTL), mobile first. It carries three
things in one view, in this order of importance: their upload is safe, they did
something generous, and — quietly, last — who built this.

## 1. Purpose

Close the most generous moment a guest will have with this product, and place
the only piece of self-promotion the product is allowed exactly there.

An earlier version of this block was designed for the foot of the photo
gallery. That was wrong: guests are never sent to the gallery — it is the
couple's private space — so the block would have been seen by two people and no
prospective customer. **This screen is the only one every uploading guest is
guaranteed to reach.** They do not navigate to it, scroll to it or choose it;
finishing an upload puts them here.

## 2. Audience

A wedding guest on their phone, days after the event, who has just given
something away for free — a photograph of a moment the couple never saw. They
are warm, briefly proud, and about to close the tab. Perhaps one in ten is
themselves engaged.

## 3. The problem it solves

Two problems, and the order matters.

**First, uploads stop after one.** A guest who uploads a single photo and gets a
bare "נשלח" has no reason to add the other eleven in their camera roll. The
screen must make the next upload feel obvious and easy.

**Second, the service is invisible to the people best placed to recommend it.**
It cannot be advertised in the WhatsApp message that brought them here — that
template is submitted as UTILITY, and one promotional sentence would have Meta
reclassify it as MARKETING, subject to the recipient cap that stopped sixteen
invitations in a single day. The page is the only place this can live.

## 4. User flow

Guest taps the WhatsApp link → chooses "photo" → picks from their camera roll →
upload completes → **this screen** → either uploads another (primary path), or
leaves, or — a small minority — taps to make contact.

## 5. Required components

In this vertical order:

**A. Confirmation.** Their upload arrived. Warm, brief, and unmistakable — a
guest who is not sure it worked will upload it again or give up.

**B. Why it mattered.** One or two lines, and this is the heart of the screen.
The idea to express, in the designer's own words: *the couple did not see most
of their own evening — they were busy getting married. What you just sent is a
moment they missed.* Not thanks-for-participating; thanks-for-something-real.

**C. Add another.** The primary action, and visually the strongest thing on the
screen. Most guests have more than one photo and will never return once they
leave.

**D. The signature.** Last, smallest, and separated from everything above:
- a line of credit, in the register of *"ההזמנות, אישורי ההגעה והגלריה של החתונה הזאת נוהלו ברגע לפני"*
- a soft question — *"מתחתנים בקרוב?"*
- two equal actions: call `053-331-8177` · visit `regalifnei.co.il`

The three Stitch directions already produced for this block (Luxury Editorial,
Modern Minimal, Warm Romantic) were approved in principle — the block itself is
right, only its context changes. Reuse its structure.

## 6. Business context

- The guests belong to the couple, not to us. The signature must read as a
  credit on a piece of work, never as an advertisement inserted into someone
  else's wedding. If a couple seeing this on their own gallery would wince, it
  is wrong.
- Referral is the only growth channel; there is no ad budget.
- The same screen serves every couple, so nothing may reference a particular
  wedding.

## 7. Design constraints

- One screen, no scrolling required to reach "add another"
- The signature may sit below the fold — it is the one element allowed to
- Nothing modal, nothing that blocks leaving
- No badge, no offer, no urgency, no exclamation mark on the signature

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      dark   #1C1008
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```
The upload flow before it is ivory with gold accents and a soft fade-up
animation; this must be the last beat of the same piece.

## 9. Platform

**Mobile First.** Nearly every view is a phone opened from WhatsApp. Desktop is
a widening of the same column.

## 10. RTL

Full RTL Hebrew. Phone number LTR. Tap targets reachable one-handed with a
thumb on a large phone.

## 11. Accessibility

- Every action ≥ 44px, and the call action well separated from "add another" —
  a mis-tap that dials a stranger's phone is worse than one that does nothing
- Contrast ≥ 4.5:1 including the muted credit line
- Real `tel:` and `https:` links, keyboard reachable, labelled
- Confirmation announced to screen readers, not conveyed by colour alone

## 12. Interaction states

Default · "add another" hover / pressed / focus · signature actions
hover / pressed / focus.

## 13. Empty state

None — this screen only exists after a successful upload.

## 14. Success state

This screen IS the success state. It should feel like a small, warm full stop —
not a celebration. A guest may see it eight times in a row while uploading a
camera roll, so anything triumphant becomes exhausting by the third.

## 15. Error states

Not this screen's job — a failed upload never reaches it. But design the
confirmation so that it could not possibly be mistaken for "maybe".

## 16. References

The upload flow's own gold padlock illustration for the time capsule sets the
register: a single, quiet, well-drawn mark rather than an icon set. In spirit:
the printer's mark on the last page of a beautiful book — easy to ignore, and
unmistakably proud of the work.

## 17. UX goals

- The guest knows their photo arrived, without reading a word twice
- Uploading another is the easiest thing on the screen
- A guest who is not getting married leaves without irritation — this outranks
  every other goal
- A guest who IS getting married can reach a person in one tap

## 18. Desired experience

The feeling of handing someone a photograph you took of them, and being thanked
properly for it.

## 19. Emotions

**Relief** — it arrived.
**Pride** — I gave them something they did not have.
**Warmth** — and whoever built this cared about the details.

The counter-emotion to design against: realising, at the end of a generous act,
that you have been walked into a sales funnel. If the signature produces that
even once it costs more than every lead it could win.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0, with all interaction states, and a written rationale
for every decision — in particular for how far the signature separates itself
from the thanks above it, and how "add another" stays dominant without shouting.
