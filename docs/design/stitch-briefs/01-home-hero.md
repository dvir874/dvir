# 01-home-hero

**עדיפות:** P1
**מסך:** Home page — hero / above the fold (mobile 375×667 first, then 390×844 and desktop 1440). Replaces src/components/HeroWarm.tsx top block.

## למה
Nothing is tappable above the fold on a 25,807px page; the H1 is cut mid-phrase so the couple reads "כל החתונה שלכם" with no predicate; the eyebrow that names the category is the least legible text on the page (#C5A46D = 2.28:1) and is tracked 0.22em, which breaks Hebrew word shapes; the value sentence is 18px Light at ink/60; the word שלכם is set in a synthetic italic Frank Ruhl Libre does not have; and the secondary CTA label sits at 2.26:1.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design the top of the home page (hero) for "רגע לפני" — a Hebrew wedding-management and RSVP service. Mobile-first, full right-to-left Hebrew.

IMAGE / MODESTY REQUIREMENT — READ THIS FIRST AND APPLY IT TO EVERY VARIANT: this screen contains a photograph of a couple. Every woman in every image you generate must be modestly dressed — shoulders covered, high neckline, back covered, a dress that does not cling. This applies to background figures too. It is a hard business requirement: a large share of this product's market is religious. Do not produce a version that needs fixing afterwards.

WHO IS LOOKING AND IN WHAT STATE OF MIND: an engaged Israeli couple, usually the bride, alone on her phone in the evening, three to nine months before the wedding. She is comparison-shopping between a ₪500 RSVP form and a full personal service. She has roughly eight seconds and she is deciding one thing: is this a real business run by a real person, or a template. She will not scroll to find out what the product is.

THE ONE JOB OF THIS SCREEN: on a 375×667 phone — 553 visible CSS pixels once browser chrome is counted — she must read what the product is AND be able to tap the primary action without scrolling. Today the photo owns the whole first screen, the headline is cut mid-sentence, and there is no tappable CTA above the fold at all. That is the defect you are fixing.

HARD PIXEL BUDGET at 375×667 — do not exceed it. If a direction does not fit, cut content; never shrink type below the sizes given.
• Fixed header, 80px tall, overlaying the top of the content.
• Photograph (or product frame): maximum 200px tall.
• Eyebrow + H1 together: maximum 100px.
• Value sentence: maximum 2 lines, 56px.
• Primary CTA: 56px tall, full width, minimum 44px tap height.
• Vertical gaps between blocks: 24px. Not 32px.
That totals about 484px and leaves headroom. Everything else in the hero goes BELOW 553px.

EXACT CONTENT ABOVE THE FOLD, in this order, copy verbatim, do not rewrite the Hebrew:
1. Eyebrow: ניהול חתונות · ליווי אישי
2. H1, two lines, both lines must be fully visible: כל החתונה שלכם / במערכת אחת
3. Value sentence, maximum two lines at 375px: מהרגע שהתארסתם ועד הרבה אחרי האירוע — מערכת אחת במקום אקסלים וקבוצות וואטסאפ.
4. Primary CTA button: קבלו הצעת מחיר
5. One 13px line directly under the button: מענה מדביר תוך 24 שעות · ללא התחייבות

BELOW THE FOLD, still part of this hero, design it but it may scroll: the secondary action ראו איך זה עובד; the phone line 053-331-8177 · זמין 07:00–22:00; and a trust strip of four tiles laid out 2×2 on mobile, each an icon in a circle plus a bold title and a light sub-line — (א) מאובטח ומוצפן / רשימת האורחים שלכם לא יוצאת מכאן, (ב) אדם אחד, לא מוקד / דביר מלווה אתכם מהיום הראשון, (ג) תזכורות אוטומטיות / המערכת רודפת אחרי האורחים, לא אתם, (ד) זמינות בוואטסאפ / תשובה מאדם, לא טופס. Keep all four; they are the only checkable claims on the page.

HIERARCHY, in strict order of visual weight: H1 → primary CTA → value sentence → eyebrow → everything else. The eyebrow must never out-shout the sentence beneath it.

BRAND COLOURS — use these hexes by name, no others:
• ivory #FDFAF5 (page ground) · cream #F6F1E8 (alternate ground) · ink #1C1008 (primary text) · olive #6B7B5A (secondary accent)
• gold #C5A46D is an OBJECT colour only: button fills, hairlines, icon backgrounds, dots. It may never carry text on ivory or cream — it measures 2.26:1 there and fails.
• gold-text #8B6914 is the ONLY gold allowed on text under 24px: the eyebrow, the 13px promise line, any gold link or outline-button label.
• gold-large #A07840 may be used for an accent WORD inside the H1 only, at 24px and above.
• The primary CTA is a gold #C5A46D pill with its label in ink #1C1008 (7.9:1). Never white text on gold — that is 2.37:1 and is banned everywhere in this product.
• A secondary outline button uses a 2px #A07840 border with a #8B6914 label. Never a #C5A46D border with a #C5A46D label.
• Muted text ladder, and contrast must RISE as type shrinks: ink 100% for primary; ink at 70% for secondary; ink at 60% is the floor for anything 15px or larger; anything under 15px steps UP to ink 70%, never down. ink at 40% is for non-text only (hairlines, decorative numerals).

TYPOGRAPHY:
• Headings: Frank Ruhl Libre, weights 700–900. This family has NO italic face. Never set Hebrew in italic anywhere in this design — a browser will shear the glyphs. If a headline line needs a softer, secondary voice, get it from weight and colour at the same size, never from slant.
• Body: Heebo, weights 300–600. The value sentence is Heebo 17–18px at weight 400 — not weight 300 — in ink at 80%.
• The eyebrow is Heebo 13px, weight 600, letter-spacing no more than 0.05em, in #8B6914. Do not set it uppercase and do not track it wide: Hebrew has no capitals and Hebrew letterforms break apart when tracked like Latin small caps.

REQUIRED STATES, draw all of them:
1. Header at rest, over the hero: transparent-to-ivory, logo mark + wordmark רגע לפני with ניהול חתונה beneath it on the right, hamburger on the left, both ≥44px.
2. Header scrolled: solid ivory 95%, a gold hairline at 20% opacity along the bottom, soft shadow.
3. Mobile menu drawer open: full-width ivory sheet dropping from the top with rounded bottom corners, six links — ✨ נסו בעצמכם · פיצ'רים · מחשבון מחיר · הזמנות · שאלות · צור קשר — each row ≥44px, and the gold CTA קבלו הצעת מחיר pinned at the bottom of the sheet.
4. Primary CTA: default / pressed / focus-visible (a visible 2px ink focus ring, not a removed outline).
5. A sticky bottom CTA bar for mobile that appears only AFTER the in-hero primary CTA has scrolled out of view — full-width, 56px, gold #C5A46D fill, ink label, with safe-area padding at the bottom. It must never overlap the in-hero CTA.

RESPONSIVE: design 375 first, then show 390×844 and a 1440 desktop where the photo may become a large side column and the type sits in the right-hand (RTL) column.

DO NOT: put the photo full-bleed across the entire first viewport; put any CTA below the fold on mobile; use white text on gold; use italic Hebrew; use letter-spacing above 0.05em on Hebrew; or introduce any colour outside the palette above.
```

---

## שלושת הכיוונים
A — Luxury Editorial: type-first, like a magazine title page. The first thing on the screen is Hebrew type on ivory, not a photograph: a 1px gold hairline, the eyebrow, then the H1 in Frank Ruhl Libre 900 at 42–44px with במערכת אחת in #A07840, the value sentence, the CTA — and the photograph enters BELOW the type as a 200px letterbox band with a thin ivory margin around it, like a plate in a printed brochure. Composition aligned hard to the RTL right margin, no centring, no rounded corners on the photo. B — Modern Minimal: no photograph above the fold at all. The top 200px is a single cropped product frame — one clean card of the couple's dashboard (a countdown and two KPI tiles: 287 מוזמנים · 214 אישרו) on cream, with a small 12px ink/70 caption נתוני דוגמה so it can never be mistaken for live data. H1 at 36px in ink only, with the accent line separated by weight (900 vs 400), not by colour. Dek at 17px ink/70. CTA a gold pill with a quiet text-link ראו איך זה עובד directly beneath it. The photograph of the couple moves below the fold entirely. This is the most software-like, most credible-to-a-comparison-shopper direction. C — Warm Romantic: the photograph stays at the top as a 200px full-bleed band, cropped to the couple's faces and hands rather than a wide venue shot, with a soft ivory gradient dissolving into the type so there is no hard seam. H1 at 40px with במערכת אחת in #A07840, a small hand-drawn olive #6B7B5A olive-branch mark as the only ornament, and the CTA a gold pill with a WhatsApp glyph. Closest to the site as it stands today — it should prove that the fold can be won without abandoning the current mood.
