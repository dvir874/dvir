# 09-weddings-proof

**עדיפות:** P3
**מסך:** /weddings — the proof and testimonial page (src/app/weddings/page.tsx). PORTFOLIO in src/lib/weddings-portfolio.ts is empty today, so the page renders only a live event/guest counter and a "החתונות הראשונות בדרך" holding card.

## למה
It is the only page that can carry third-party proof, it is reachable from one footer link, and it has no design for the states it will actually live in — one wedding, three weddings, a wedding whose couple gave numbers but no quote, or the DB counter failing — so real proof has nowhere to land as Dvir earns it.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design a mobile-first, right-to-left Hebrew PROOF / PORTFOLIO page for "רגע לפני", an Israeli wedding RSVP and guest-management service run by one person, Dvir. The page is called "החתונות שלנו".

=== 1. PURPOSE ===
The page a sceptical couple opens to answer one question: has anyone actually used this, and did it work? It must be convincing when the answer is "three weddings" and it must not look broken or desperate when the answer is "none yet".

=== 2. WHO IS LOOKING, AND HOW THEY FEEL ===
A couple on a phone, late in their decision, actively looking for a reason to say no. They are about to hand this business their entire guest list and a real sum of money, and the business is one person they have never met. They can smell an invented testimonial from across the room. The most persuasive thing available is a small number of real weddings with real figures, presented without inflation.

=== 3. THE CONSTRAINT THAT SHAPES THE WHOLE DESIGN ===
This is a young business. It has managed a handful of real weddings with measured numbers, and it may have zero written quotes from couples at any given moment. So the page must SEPARATE two kinds of proof and design each independently:
  · NUMBERS WE CAN PROVE — pulled from the system: how many events, how many guests managed, response rate per wedding. Always available.
  · WORDS A COUPLE SAID — verbatim quotes, published only with permission. Often absent.
A card with numbers and no quote must look complete, not truncated. The page must never have a state that invites filling a gap with something invented.

=== 4. FLOW ===
Arrive → one honest aggregate number within the first screen → scroll a short list of real weddings → one WhatsApp CTA. No filters, no pagination, no search.

=== 5. EXACT CONTENT (Hebrew, verbatim) ===
H1: החתונות שלנו
Sub: זוגות אמיתיים, מספרים אמיתיים
Aggregate line (values come live from the system): 🎉 {N} אירועים · {M} אורחים נוהלו במערכת

WEDDING ENTRY — fields, some optional:
  Couple name (e.g. שחר ועדי)
  Date and venue (e.g. אוגוסט 2026 · עדן על המים) — venue optional
  Guests (e.g. 421)
  Response rate (e.g. 96%) with the label אחוז מענה
  Quote — optional, verbatim, in quotation marks
  Photo — optional
  Permission note where a quote or photo appears: מתפרסם באישור הזוג

Section heading above the list: מה קרה בפועל
Section heading above quotes if they are grouped separately: מה הזוגות אמרו

EMPTY STATE (zero weddings published):
  Heading: החתונות הראשונות בדרך
  Body: אנחנו עסק צעיר שמלווה עכשיו את הזוגות הראשונים שלו — ובקרוב תראו כאן את הסיפורים והמספרים שלהם. רוצים להיות מהראשונים? מחכה לכם מחיר מייסדים.
  CTA: דברו איתי 💬

PAGE CTA at the end: רוצים שהחתונה שלכם תהיה כאן? · button: דברו איתי בוואטסאפ 💬

=== 6. HIERARCHY on a 375px phone ===
1. H1 + the aggregate number — both above the fold on a 375×667 phone (~553px usable)
2. The first wedding entry, at least partly visible above the fold
3. Per entry: couple name → response rate → guest count → quote → venue/date
4. The permission note
5. The closing CTA
The response rate is the number that persuades. Give it more weight than the guest count.

=== 7. BRAND — binding ===
Colours by name and hex:
ivory #FDFAF5 (page ground) · cream #F6F1E8 (raised panels) · gold #C5A46D · goldText #8B6914 · goldLarge #A07840 · olive #6B7B5A · ink #1C1008 · hairline #E8E0D4
GOLD RULE, absolute: #C5A46D is an OBJECT colour only — hairlines, rules, frames, icon backgrounds, the CTA pill background. It may never carry text on ivory or cream (2.26:1 there). Text gold is #8B6914; a heading accent at 24px+ may use #A07840. Never white text on a gold fill (2.37:1) — a gold pill carries an ink #1C1008 label.
Use olive #6B7B5A for the response-rate figure and any success indicator. Do not introduce a second green.
Fonts: Frank Ruhl Libre for headings, couple names and all numerals, 700–900. Heebo for body, 300–600. Nothing else.
Hebrew typography: no italic anywhere — Frank Ruhl Libre has no italic face and the browser shears the glyphs, which looks especially bad on a quotation. Set quotes upright, in Frank Ruhl at a larger size or against a gold hairline rule, never sheared. No uppercase (Hebrew has no case). Letter-spacing never above 0.05em.
Quotation marks: Hebrew opening quote first, closing quote second — do not invert them.
Imagery — required, and this page will attract photographs: any woman appearing in a placeholder or generated photograph must be modestly dressed — shoulders covered, high neckline, back covered, nothing form-revealing. This applies above all to brides. Apply it even where no figure was requested, because wedding screens attract them by default. A render that does not meet this is regenerated, not cropped. This is also a business requirement: a large share of the Israeli wedding market is religious, and an immodest image disqualifies the product before a word is read.

=== 8. LAYOUT & MOBILE ===
Mobile first at 375px, then 768, then 1280. Max content width 720px, centred. Cards or entries stack in one column on mobile — never a two-up grid at 375px. Tap targets ≥44px. Generous white space. No horizontal scroll at 375px.
The page must use the site's standard header, not a bespoke one-off bar.

=== 9. RTL ===
Full RTL. Couple name on the right of each entry, date and venue on the left. Quote rules/borders on the RIGHT edge of the quote block. Numerals LTR. Arrows point right (←).

=== 10. ACCESSIBILITY ===
Four text rungs, specified against cream #F6F1E8 as the worst case: ink #1C1008 · ink 70% · ink 60% as the floor for text 15px and up · ink 40% for NON-TEXT only.
Contrast rises as type shrinks: nothing under 15px below 4.5:1. The date, venue and permission note are small — they step UP to ink 70%, not down.
Visible focus rings. Any photo needs meaningful alt text.

=== 11. REQUIRED STATES — draw every one, this is the heart of the brief ===
ZERO WEDDINGS: the founders'-price holding screen above. It must read as an intentional, confident page — a young business being straight — not as an error or a blank slot. No skeleton cards, no "coming soon" placeholders shaped like content.
ONE WEDDING: the hardest state. A single entry must not look like a grid missing three items. Design a distinct one-entry layout that reads as a featured story.
TWO WEDDINGS: show how the one-entry layout resolves into a list.
THREE OR MORE: the standard stacked list.
ENTRY WITH NUMBERS BUT NO QUOTE: complete, balanced, no empty quote region.
ENTRY WITH A QUOTE BUT NO PHOTO: the quote carries the entry visually on its own.
ENTRY WITH PARTIAL PERMISSION: couple shown as initials only (e.g. ש׳ ו־ע׳) — design how that reads without looking anonymised or suspicious.
AGGREGATE COUNTER UNAVAILABLE (database call fails): the counter line disappears cleanly and the layout closes over the gap. Nothing shows a zero, a dash, or a spinner that never resolves.
LOADING: skeletons that hold the final layout exactly, no shift.
CTA hover / focus / pressed.

=== 12. DO NOT ===
Do not design a five-star rating widget, a review count, or a logo wall — none of it exists.
Do not design a carousel of testimonials. A short honest list beats a rotating one.
Do not create a state that displays sample or placeholder weddings styled to look real.
Do not put a large stock photo of an unnamed couple at the top pretending to be a client.
Do not use a plan/table comparison layout — this is a register of real events.

=== 13. EMOTION ===
Quiet credibility. "Small, but real, and they did not pad it." Understatement is the persuasion strategy here.

=== 14. DELIVERABLE ===
Three directions (A, B, C as separately specified), each at 375px and 1280px, and each showing at minimum: the ZERO state, the ONE-WEDDING state, and the THREE-OR-MORE state.
```

---

## שלושת הכיוונים
A — Luxury Editorial: a printed wedding register. No cards, no shadows, no rounded corners; each wedding is an entry beneath a hairline gold #C5A46D rule, couple name in Frank Ruhl Libre 900 ink, date and venue small in ink 70% on the opposite side, guests and response rate set as marginalia numerals rather than tiles. Quotes are pull-quotes in Frank Ruhl at 22px with a gold rule on the right edge. At one entry it reads like the title page of a book — which solves the sparse state by design. B — Modern Minimal: numbers lead. The top of the page is a band carrying the two aggregate figures at very large scale in Frank Ruhl 900 ink on ivory, with their labels beneath in Heebo. Below it a plain stacked list, one row per wedding, each with a thin olive #6B7B5A response-rate bar running its full width — so the page scans as a chart before it scans as prose. Quotes sit between rows as full-width ivory pull-outs, not inside the rows. Fastest to comprehend, least decorated, and completely photo-free, which makes it the safest state when no couple has given permission for images. C — Warm Romantic: photo-led and the most intimate. Each wedding is a cream #F6F1E8 card with one modest photograph (shoulders covered, high neckline, back covered, nothing form-revealing — regenerate rather than crop), the couple's names in Frank Ruhl over an ivory band beneath the image, the quote set as the card's closing beat, and the numbers as two small gold-hairline chips. The zero state is a single warm card with one modest photograph and Dvir's founders'-price invitation in his own first-person voice. Requires real permissioned photos to ship — brief it knowing that, and design the no-photo fallback for each card.
