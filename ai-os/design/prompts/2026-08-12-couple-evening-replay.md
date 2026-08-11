# Stitch Prompt — the couple's private view of their own evening

Prepared 2026-08-12 · Couple-facing · Mobile First
Route: `/memory/[owner_token]/wall` (rebuild of the existing memory wall)
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

Data and access are already built (commit a054e8e). This prompt covers the
screen only.

---

Design the screen where **a newly married couple sees, for the first time, the
photographs their guests took of their wedding**, in Hebrew (RTL), mobile
first. Not a gallery. A replay of one evening, in the order it happened, in
which every photograph says who gave it.

## 1. Purpose

Give the couple their own wedding back.

They were the two people at that wedding who saw the least of it. They were
being married, photographed, seated, toasted and pulled between tables. The
dancing they remember is the twenty minutes they were in it.

## 2. Audience

Two people, two to five days after their wedding, on a phone, probably in bed,
probably together. Exhausted. Happy. Quietly deflated in the way nobody warns
you about — the thing they planned for a year ended and now there is nothing in
the calendar.

Their professional photographs are four to eight weeks away. **This is the only
thing they have.** They will open it more than once, and they will open it
alone as well as together.

## 3. The problem it solves

An album sorted by upload time is a pile. It arrives in the order people got
round to it: the end of the night first, three versions of the same table, the
chuppah somewhere in the middle.

Two things fix that, and both are already in the data:

**Order.** Every photograph carries the moment its shutter fired. Sorted by
that, the pile becomes the evening: guests arriving, the chuppah, the first
dance, the part that got loud, the end.

**Attribution.** Every item carries the name of the guest who sent it. A
photographer's picture is beautiful and anonymous. **Their aunt's picture is a
gift from their aunt** — and if that same aunt also wrote them a blessing, her
photograph and her words belong together on the screen. Nobody else can give
them that pairing. Not the photographer, not a shared phone album.

## 4. User flow

Couple opens their private link → the evening begins at its beginning → they
scroll forward through the night → tap any photograph to see it full-screen →
back → keep going. They reach the end and know they have reached the end.

No login, no album picker, no folders, no filters. One long evening.

## 5. Required components

**A. Opening.** Their names, the date, and how much is here — expressed as
something felt rather than counted. It should read closer to *"מאה ושמונים
רגעים, מארבעים ושבעה אנשים"* than to a file count.

**B. The evening, in order.** The spine of the screen. Chronological, and the
passage of time must be legible without the couple doing arithmetic — the
design decides how (a quiet time marker as the hour turns, a change in rhythm,
a heading when a new part of the night begins). Photographs at their natural
size and shape; vertical phone photos are the majority and must not be cropped
into squares.

**C. The credit on every item.** The guest's name, on every photograph and
every video, always present, never louder than the picture. This is the emotional
core of the screen and also the thing most likely to be designed into
insignificance — treat it as caption, not metadata.

**D. The pairing.** When a guest sent both a photograph and a blessing, the two
appear together as one thing: what they saw and what they wrote. Design this
deliberately. It is the single most valuable moment on the screen.

**E. Blessings without a photograph.** Guests who only wrote. These need a
place in the flow that does not feel like a lesser card — a letter is not a
failed photograph.

**F. The tail.** Videos, screenshots and anything forwarded through WhatsApp
arrive with no capture time and cannot be placed in the evening honestly, so
they follow at the end. **Expect this to be a large share — possibly half.**
Give it an honest, warm heading of its own rather than letting it read as the
evening continuing into an impossible hour.

**G. Full-screen view.** Tap any photograph. Swipe between them. Download. The
name of whoever took it stays visible here too.

**H. The end.** The evening ends. Say so.

## 6. Business context

- Sent only to the couple. No self-promotion anywhere on this screen — they
  paid for it, and it is about them. The signature block belongs on the guest
  upload screen, not here.
- This arrives weeks before the professional photographs. It is the first
  impression of what was bought, and it is what they will show people.
- The same screen serves every couple.

## 7. Design constraints

- Between roughly 20 and 600 items. Both extremes must feel intentional.
- Mixed quality is guaranteed: dark dance-floor blur, someone's thumb,
  duplicates, a wall. **Design so a bad photograph sits comfortably** — this is
  not a portfolio, and a layout that flatters only good pictures will make
  three quarters of the evening look like a mistake.
- Images arrive on a phone connection. Progressive loading, no layout jump.
- No infinite scroll that loses their place. They will return to this.

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      dark   #1C1008      muted  #8C7B6E
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```
The photographs are the colour on this screen. Everything the design adds
should be ivory, gold hairlines and restraint.

## 9. Platform

**Mobile First.** Nearly every view is a phone. Desktop is a widening of the
same column, not a grid dashboard.

## 10. RTL

Full RTL Hebrew. Times and dates in Hebrew convention. Swipe direction in the
full-screen view must follow RTL: forward through the evening is leftward.

## 11. Accessibility

- Every tap target ≥ 44px; full-screen close reachable one-handed
- Contrast ≥ 4.5:1 for the credit line over ivory — it is small and it matters
- Photographs need alt text built from the guest's name and time
- Full-screen view must be escapable by keyboard and by swipe-down

## 12. Interaction states

Loading (first paint, and images arriving) · photograph pressed · full-screen
open / between / closing · download pressed · end-of-evening reached.

## 13. Empty state

**Design this properly — it will be seen.** The couple will open the link the
morning after, before anyone has uploaded. It must promise rather than
apologise, and it must not look broken.

## 14. Success state

The screen is the success state.

## 15. Error states

- A photograph that fails to load: hold its place, keep the credit line, never
  collapse the layout
- Nothing at all loads: this is their wedding, so the message must be warm and
  the recovery obvious

## 16. References

The time capsule's gold padlock illustration sets the register for anything
drawn. In spirit: a box of prints that came back from the chemist, sorted by
the order they were taken, each with a name pencilled on the back.

## 17. UX goals

- Within five seconds they are inside the evening, not inside an interface
- At any photograph they know **when** it was and **who** gave it, without tapping
- Reaching a guest's photo beside that guest's blessing lands as a small event
- They get to the end and feel the evening closed, not that the page ran out

## 18. Desired experience

Being handed a hundred photographs of a night you were the centre of and barely
saw, by the people who were watching you.

## 19. Emotions

**Recognition** — so *that* is what that hour looked like.
**Tenderness** — someone stood there and chose to keep this for us.
**Gratitude, by name** — it was רינה. It was דוד.

The counter-emotion to design against: scrolling a feed. If a single moment of
this feels like Instagram, the evening becomes content and the screen has
failed. The couple should feel looked after, never audienced.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0, with all interaction states, and a written rationale
for every decision — in particular for how time is made legible while
scrolling, how the credit line stays present without competing with the
photograph, and how the photo-and-blessing pairing is composed.
