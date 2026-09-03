# Stitch Prompt — Referral Footer (RSVP "done" + Gallery)

**Wave:** Growth · **Requested:** 03/09/2026 · **Status:** awaiting Stitch
**Rule:** 20-parameter prompt per `ai-os/governance/stitch-design-authority.md`

---

## 1 · Screen purpose

A small, quiet footer block that appears **after** a wedding guest has finished
what they came to do — confirmed or declined their attendance, or browsed the
couple's photo gallery. It is the only place where "רגע לפני", the service that
delivered the invitation, identifies itself to the guest.

It is **not** a banner, not a modal, not an interstitial. It sits at the very
bottom, below the couple's content, and is seen only by someone who scrolled
there.

## 2 · Audience

Israeli wedding guests, Hebrew-speaking, aged roughly 22–45, on a phone, inside
WhatsApp's in-app browser. A meaningful share are religious or traditional.
Many are themselves engaged or newly married — that is precisely why this
footer exists.

## 3 · The problem it solves

998 guests have used this product. 596 answered an RSVP through it. **Zero of
them ever saw who built it.** Every future customer is standing on this page
and leaving without a name to remember.

**But the tension is the whole design problem.** This page belongs to a couple
who paid for it. The guest is in the middle of an emotional moment — they have
just told a friend they will be at their wedding. A footer that interrupts,
sells, or competes with that moment damages the very thing being advertised.

**The brief is therefore restraint, not conversion.** It must read as a quiet
signature at the bottom of good work — the way a florist's card sits in the
arrangement — and never as an advertisement inside someone else's celebration.
If a direction has to choose between "more clicks" and "the couple would be
happy this is here", it chooses the couple every time.

## 4 · User flow

```
Guest taps the WhatsApp button
  → RSVP page opens
  → chooses "מגיעים" / "לא נוכל"
  → sees the confirmation screen ("done")
  → scrolls to the bottom
  → THIS BLOCK
  → taps → opens WhatsApp with a pre-filled message to Dvir
```

Same block, second placement: the bottom of the couple's photo gallery
(`/gallery/[token]`), reached after the wedding.

Tapping is the only action. There is no form, no email capture, no account.

## 5 · Required components

1. **A hairline divider** separating the couple's content from this block.
2. **Attribution line** — the service name, "רגע לפני", set as the brand mark.
3. **One sentence of copy.** Hebrew. Warm, not salesy. Suggested (Stitch may
   propose better within the same register):
   - `את ההזמנה הזאת שלחנו בשבילם 🤍`
   - `מתחתנים? נשמח לעשות את זה גם בשבילכם`
4. **One tap target** — a text link or a very low-emphasis button.
   Label: `דברו איתנו` or `רוצים כזה?`. **Not** a filled primary button; a
   primary button here competes with the couple's own call to action above it.
5. **Nothing else.** No logo grid, no testimonial, no price, no feature list,
   no social icons, no second link.

Give three directions per Protocol v2.0:
- **A · Luxury Editorial** — typographic, gold rule, wide letter-spacing, no icon
- **B · Modern Minimal** — smallest possible: one muted line, link underlined
- **C · Warm Romantic** — soft cream card, rounded, a single small heart motif

## 6 · Business context

Hebrew WhatsApp wedding-RSVP service. Five weddings live. Pricing is per guest
record (~0.28₪ cost per record). Growth is currently limited by Meta's messaging
tier, **not** by client count — so a channel that costs zero messages is worth
more than one that costs any. This footer is that channel.

## 7 · Design constraints

- **Vertical budget: ~90–130px.** It must never push the couple's content up.
- Must survive being the last element above `env(safe-area-inset-bottom)`.
- No fixed/sticky positioning — it scrolls with the page.
- No animation on entry. The screen above it already animates; this must be
  still, or it reads as an ad.
- Contrast lower than every element above it. It is the quietest thing on the
  page, deliberately.
- Renders correctly inside WhatsApp's in-app browser (no backdrop-filter, no
  CSS features newer than 2022).

## 8 · Brand guidelines

**Colours — these only.**
```
ivory   #FDFAF5      cream   #F6F1E8      gold      #C5A46D
gold-text #8B6914    olive   #6B7B5A      dark      #1C1008
divider #E8E0D4
```

**Type.** Frank Ruhl Libre (serif) for the brand mark, weight 700.
Heebo (sans) for body, weights 300–500. Body size 12–13px, brand mark 14–15px.

**Imagery — required.** Any woman appearing in a placeholder or generated
photograph must be **modestly dressed**: shoulders covered, high neckline, back
covered, nothing form-revealing. This applies above all to brides. Apply it even
where no figure was asked for, since wedding screens attract them by default. A
render that does not meet this is regenerated, not cropped.

**Emoji.** 🤍 and 💍 are permitted. **💒 is banned** — it renders as a church
with a cross on most platforms.

## 9 · Mobile First

Designed at **375px** first. Desktop is a centred column, max-width 420px —
identical component, more margin. Tap target ≥ 44px in height.

## 10 · RTL

Full RTL. Hebrew text right-aligned or centred. Any chevron points **left** (‹)
because that is "forward" in Hebrew. Latin brand marks, if any, stay LTR inside
an RTL block without breaking the line.

## 11 · Accessibility

- Text contrast ≥ 4.5:1 against its own background — quiet is not invisible.
- The tap target is a real `<a>` with a discernible accessible name.
- Works at 200% text zoom without clipping.
- Not conveyed by colour alone.

## 12 · Interaction states

`default` · `hover` (desktop only, gentle) · `active/pressed` · `focus-visible`
(2px olive ring, 2px offset) · `visited` (identical — a guest who tapped before
must not see a different page).

## 13 · Empty states

None — the block has no data dependency. Design it as always-present. If the
event has been deleted or the token is dead, the guest never reaches this
screen at all.

## 14 · Success states

Tapping leaves the page for WhatsApp. There is no in-page success state.
Show what the moment before departure looks like — pressed state only.

## 15 · Error states

None in the block itself. If WhatsApp fails to open, the browser handles it.
Do **not** design a fallback form; capturing details here would break the
restraint the whole component depends on.

## 16 · Design references

Match the existing screens exactly — this is an addition to a living product,
not a new surface:
- RSVP confirmation screen (Stitch `85f07f64`) — gold circle, Frank Ruhl
  heading, ivory ground, `fadeUp` entry
- Gallery top bar — "רגע לפני" already set in Frank Ruhl 700 at 17px, gold-text

The reference feeling: **the printed credit on the back of a wedding
invitation.** Present, findable, and never the thing you notice first.

## 17 · UX goals

1. A guest who wants to know who made this can find out in under two seconds.
2. A guest who does not care never notices it.
3. The couple, seeing it, feels credited rather than advertised on.
4. Zero measurable effect on RSVP completion rate.

## 18 · Desired experience

Reading it should feel like turning over a beautiful card and finding a small
name printed on the back. A moment of "ah — that's who did this", and nothing
more. The guest's next thought should return to the wedding, not to us.

## 19 · Emotions to convey

**Craft · discretion · warmth · trustworthiness.**
Explicitly NOT: urgency, promotion, cleverness, scarcity, excitement.
This is the only component in the product allowed to be forgettable.

## 20 · Product Design Foundation

Apply the רגע לפני Product Design Foundation: Premium · Modern · Elegant ·
Minimal · Mobile First · full RTL · generous white space · brand colours only ·
consistent typography · restrained motion. Where this component and the
Foundation disagree, the Foundation wins — except on emphasis, where this
component must always be **quieter** than the Foundation's default.
