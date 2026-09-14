# 03-section-header-buttons

**עדיפות:** P3
**מסך:** Component sheet — the section header unit (eyebrow + H2 + dek) and the button family, on ivory, cream and ink grounds. Repeats 14+ times on the home page and governs every marketing page.

## למה
Nineteen section eyebrows ship at 2.26:1 with 0.22em tracking on Hebrew, the muted-text ladder has nine rungs of which the bottom three fail AA, the same headline role renders 36px/900 on the home page and 26.4px/700 on /features, and both hero CTA labels fail contrast — so the new section order cannot be built consistently until this one repeating unit is fixed.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design a component sheet — not a page — for "רגע לפני", a Hebrew wedding-management service. Right-to-left Hebrew, mobile-first at 375px, with a 1440px desktop column beside it. Everything on this sheet repeats 14 or more times across the site, so it has to be right once.

No humans and no photography appear in this design.

WHY THIS EXISTS: the same section-heading role currently renders at 36px weight 900 on one page and 26.4px weight 700 on another; the small gold label above every section sits at 2.26:1 contrast with 0.22em letter-spacing, which is unreadable and which pulls Hebrew words apart; and the supporting sentence under each heading is 18px Heebo Light at 55% ink, below the accessibility floor. This sheet replaces all of that with one system.

PART 1 — THE SECTION HEADER UNIT. Three stacked elements, one rank, used identically everywhere:
• EYEBROW — Heebo 13px, weight 600, colour #8B6914, letter-spacing no more than 0.05em, NEVER uppercase (Hebrew has no capitals; the uppercase setting does nothing and the wide tracking actively breaks Hebrew letterforms). Sample strings to typeset: למה רגע לפני · איך זה עובד · ההבדל · מי מאחורי המערכת · יש שאלות?
• H2 — Frank Ruhl Libre, weight 900, 36px on mobile / 52px on desktop, line-height 1.1, colour ink #1C1008. Optional second line in accent colour #A07840. Sample: תמונת מצב אחת. / בכל רגע נתון.
• DEK — Heebo 17px, WEIGHT 400 (not 300), colour ink at 70%, maximum 2 lines at 375px. Sample: ספירה לאחור, אישורי הגעה, אחוז מענה ותזכורות — הכל חי ומעודכן, זמין לכם ולבן/בת הזוג מכל מכשיר.
Draw this unit three times: on ivory #FDFAF5, on cream #F6F1E8, and on ink #1C1008. On the ink ground the eyebrow becomes gold #C5A46D (which passes there at 7.9:1), the H2 becomes ivory #FDFAF5 — not pure white — and the dek becomes white at 75%.

PART 2 — THE TEXT LADDER. Show it as a labelled swatch strip, and check it against CREAM #F6F1E8, which is the worst case, not ivory. Exactly four named rungs on light grounds — primary ink #1C1008 · secondary ink 70% · tertiary ink 60% · non-text ink 40% — and four on ink grounds — ivory #FDFAF5 · white 75% · white 60% · non-text white 40%. The governing law, print it on the sheet: CONTRAST RISES AS TYPE SHRINKS. ink 60% is the floor for text at 15px and above; anything under 15px steps UP to ink 70%; ink 40% never carries a word a person is meant to read — it is for hairlines, dividers, disabled chrome and decorative step numerals only. There are to be no rungs at 45%, 50%, 55% or 65%. Show a worked example of the rule doing real work: the small print נתוני דוגמה at 13px and the line הטופס ישלח אתכם ישירות לוואטסאפ של דביר at 12px must be drawn at ink 70%, because disclosure text has to be the most readable small text on a page, not the least.

PART 3 — THE BUTTON FAMILY. Colours are fixed by law: gold #C5A46D is a FILL colour only and may never carry text on ivory or cream; #8B6914 is the only gold permitted on text under 24px; ink #1C1008 is the label colour on any gold fill (7.9:1). White on gold measures 2.37:1 and is banned everywhere in this product, including on disabled states.
• PRIMARY — gold #C5A46D pill, ink #1C1008 label, Heebo 15px weight 600, 56px tall, full width on mobile. Label sample: קבלו הצעת מחיר.
• SECONDARY — outline pill, 2px #A07840 border, #8B6914 label. Label sample: ראו איך זה עובד. (A #C5A46D border with a #C5A46D label is the current bug; do not reproduce it.)
• WHATSAPP — filled #25D366, white label, WhatsApp glyph. Label sample: דברו עם דביר בוואטסאפ.
• QUIET LINK — Heebo 13px, ink 70%, no gold, single underline on press only.
Every button ≥44px tall. Draw all five states for each: default · hover · pressed · focus-visible (a 2px ink #1C1008 ring — never a removed outline) · disabled. For DISABLED specifically: the current disabled fill is #D4C4A8 with a white label at 1.71:1, which is the least legible text in the entire product and it appears at the exact moment a user is waiting for confirmation. Solve it — darken the fill or drop the label to ink — and show the loading label שולח… with a spinner inside the disabled state.

PART 4 — SECTION TRANSITIONS. Show the three permitted ways one section meets the next, at mobile spacing: a 1px gold #C5A46D hairline at 15% opacity; a ground change from ivory to cream with no rule; and a hard edge into a full-bleed ink band. Give the vertical rhythm in numbers — space above an eyebrow, between eyebrow and H2, between H2 and dek, and between the dek and the section body.

BRAND: colours are ivory #FDFAF5 · cream #F6F1E8 · gold #C5A46D · olive #6B7B5A · ink #1C1008, plus the two derived text golds #8B6914 (small text) and #A07840 (accent words 24px and above). Fonts are Frank Ruhl Libre 700–900 for display and Heebo 300–600 for body. Frank Ruhl Libre has NO italic face — never show Hebrew in italic anywhere on this sheet, and if a heading needs a softer secondary voice, express it with weight and colour at the same size. Generous white space; premium and minimal.

Annotate every element on the sheet with its hex, size, weight and measured contrast ratio against the ground it sits on, so a screen can be reviewed against this sheet at a glance.
```

---

## שלושת הכיוונים
A — Luxury Editorial: the header unit built on a strong right-hand RTL baseline with a hairline rule above the eyebrow, H2 at 44px on mobile with wide leading, dek indented to a narrower measure than the heading — the eyebrow reads as a running head in a printed book. Buttons are wide rectangles with 4px corner radii rather than pills. Test this if the site should feel like stationery. B — Modern Minimal: no eyebrow at all as the default — the rank is carried by H2 size and a 15px ink/70 dek alone, with the eyebrow demoted to an optional element used only where a section genuinely needs a category label. This directly tests the finding that each eyebrow is redundant with the H2 directly beneath it. Everything centred-left to the RTL grid, buttons as flat pills with no shadow, transitions by ground change only, no rules. C — Warm Romantic: the eyebrow keeps its gold but is paired with a small olive #6B7B5A dot or olive-branch tick instead of tracking, so it reads as an ornament that happens to be a word; H2 at 38px with the second line in #A07840; deks a touch wider and warmer; buttons are soft 28px pills with a low warm shadow; transitions favour ivory-to-cream washes over hard rules. Closest to today's site, but with every contrast failure removed.
