# Stitch Prompt — the landing page, rebuilt at a third of the length

Prepared 2026-08-12 · Public · Mobile First
Route: `/` (restructure of 18 existing sections into 8)
Workflow halted at step 3 per stitch-design-authority.md — awaiting CEO's Stitch result.

The factual errors, type sizes and tap targets on the current page were fixed in
commit 51ba336. This prompt is only about the thing code cannot fix: the page
says one thing six times and is three times too long.

---

Design the **landing page for רגע לפני**, a wedding-management service run by one
person, in Hebrew (RTL), mobile first. **Eight sections. Not more.**

## 1. Purpose

Get an engaged couple to open WhatsApp and describe their wedding.

There is no signup, no trial and no price on the page. Every path ends in a
message to Dvir, who replies within a day with a quote. The page's whole job is
to make sending that message feel obvious and safe.

## 2. Audience

A couple, usually the bride first, three to twelve months out, on a phone, most
often at night. They have just started to grasp how much administration is coming
and they are looking for someone to take it. They are comparing against a free
spreadsheet and against doing nothing.

Roughly a third of the Israeli market is religious or traditional; the page must
not read as if it were built only for the other two-thirds.

## 3. The problem it solves

**The current page is 18 sections and 25,000px on a phone — 31 screens.** A
converting landing page is five to eight. The reader leaves around screen eight,
which is exactly where the page starts repeating itself.

It repeats because one idea is expressed six times: *"no more spreadsheets and
WhatsApp groups"* appears in the hero, in WhyUs, in the comparison table, in
Tools, in About and in the footer. Every device also appears twice — two numbered
three-step sections, three "why us" sections, two before/after comparisons, three
dashboard previews.

**Say each thing once, in its strongest position, and stop.**

## 4. User flow

Land → understand what this is in one sentence → understand that a **person**
runs it, not a platform → see the product once → see it applies to their kind of
event → ask a question or send a message.

## 5. Required components

Eight sections, in this order. The order carries the argument.

**1 · Hero.** What it is, one CTA, one photograph. The couple in the current
hero photo is right and stays: warm, real, modestly dressed.

**2 · "אדם אחד, לא מוקד".** *This is the differentiator and it is currently
section 13 of 18, twelve screens down.* Every competitor is software. This is a
named person who answers WhatsApp himself, sets the system up for the couple, and
enters their guest list. Second position, high contrast, hard to skim past.

**3 · The product, once.** One dashboard view. Not three.

**4 · How it works, once.** Three steps. Not two sets of three steps.

**5 · Every kind of event.** Wedding, henna, bar/bat mitzvah, brit, birthday.
Short.

**6 · The designs gallery.** Real invitation work — the only genuinely visual
proof on the page.

**7 · Questions.** Currently three questions, which is thin for a service with
no visible price. Design for six to eight, and assume the money question is one
of them even though the answer is "let's talk".

**8 · Contact.** The form, the WhatsApp button, the phone, the hours.

**Cut entirely:** one of ComparisonWarm / ToolsWarm, one of HowItWorks / Process,
one of the two EmotionalBand quotes, and two of the three dashboard previews.
Nothing in them is lost — every claim survives in a section above.

## 6. Business context

- **No pricing anywhere.** Deliberate. Every route ends at WhatsApp.
- Referral and this page are the only two channels. There is no ad budget.
- The strongest true copy already on the page is the plainest: *"תפסיקו לרדוף
  אחרי בני דודים שלא ענו בוואטסאפ."* That register should lead, not the
  "פלטפורמה שמרכזת" register.
- There are no testimonials yet and none may be invented. The page must be
  persuasive without social proof — which is exactly why section 2 is a person.

## 7. Design constraints

- **Target: under 8 screens on a 375×812 phone.** State the expected height.
- Minimum 12px type, minimum 44px tap targets — both are in CLAUDE.md and both
  were being broken across the current page.
- No section may restate a claim made in a section above it.
- Every section must survive the question "what does the reader now know that
  they did not know one section ago?"

## 8. Brand

```
ivory  #FDFAF5      cream  #F6F1E8      gold   #C5A46D
olive  #6B7B5A      ink    #1C1008      muted  #8C7B6E
Headings  Frank Ruhl Libre 700–900
Body      Heebo 300–600
```

**Imagery — required.** Any woman appearing in a placeholder or generated
photograph must be **modestly dressed**: shoulders covered, high neckline, back
covered, nothing form-revealing. This applies above all to brides. Apply it even
where no figure was asked for. A render that does not meet this is regenerated,
not cropped.

**Hebrew only in the interface.** The current page carries "פיצ'רים" and
"Wedding Mode" beside elegant Hebrew. Latin script is acceptable only when naming
an actual product (Excel, WhatsApp).

## 9. Platform

**Mobile First.** Desktop is a widening of the same column, not a second layout.

## 10. RTL

Full RTL. Phone numbers LTR, formatted `053-331-8177`. Arrows point right for
back, left for onward.

## 11. Accessibility

- Contrast ≥ 4.5:1 everywhere, including muted captions on ivory and any light
  text on the dark band
- A real heading outline — h1 once, h2 per section
- Content must not depend on scroll animation to become visible

## 12. Interaction states

Hero CTA · section CTAs · FAQ open/closed · form fields, focus, error, submitted ·
sticky mobile CTA appear/hide.

## 13. Empty state

None.

## 14. Success state

The form submitted, and the hand-off to WhatsApp. Design that moment — it is
where every path on the page ends and it currently just leaves.

## 15. Error states

Form validation, and the case where WhatsApp does not open. A couple who cannot
reach him is the only true failure on this page.

## 16. References

The existing palette and type pairing are good and stay. What changes is
editing. In spirit: a single well-set page in a good magazine, rather than a
brochure that repeats itself because nobody was willing to cut a paragraph.

## 17. UX goals

- What this is, and that a person runs it, inside two screens
- The whole page readable in under two minutes
- A couple can reach Dvir from any point without scrolling to the bottom
- Nothing on the page is read twice

## 18. Desired experience

The relief of finding someone who will take the admin off you — and being able
to tell, quickly, that they are real.

## 19. Emotions

**Relief** — someone does this so we don't have to.
**Trust** — there is a name and a phone number, not a support portal.
**Calm** — the page itself is not shouting, which is the promise it is making.

Design against: the sense of being sold to by a page that will not stop talking.
That is precisely what 18 sections produce.

## 20. Foundation

Use the Product Design Foundation. Deliver Direction A (Luxury Editorial),
Direction B (Modern Minimal) and Direction C (Warm Romantic) per Stitch
Integration Protocol v2.0, with all interaction states, and a written rationale
for every decision — in particular for what each direction cut, and where the
"one person, not a call centre" section sits in the scroll.
