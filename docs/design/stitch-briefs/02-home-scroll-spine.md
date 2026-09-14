# 02-home-scroll-spine

**עדיפות:** P2
**מסך:** Home page — full mobile scroll spine below the hero: which sections exist, in what order, and how tall each is allowed to be. Covers src/app/page.tsx from LiveSnapshot to FooterWarm.

## למה
The page is 25,807px — about 32 phone screens — with the same five-item feature list told four times across 12,028px, two separate dashboard sections making the same claim, the founder promise written twice in adjacent sections, and only three conversion moments in the whole scroll.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design the full mobile home page of "רגע לפני" — a Hebrew wedding-management and RSVP service — from immediately below the hero down to the footer. Mobile-first, 375px wide, full right-to-left Hebrew. The hero itself is designed separately; start below it.

MODESTY REQUIREMENT — READ FIRST, APPLIES TO EVERY IMAGE IN EVERY VARIANT: this page contains photographs of couples and wedding scenes. Every woman in every image must be modestly dressed — shoulders covered, high neckline, back covered, a non-clinging dress — including background figures. A large share of this product's market is religious. Build it in up front; do not produce something that needs correcting later.

WHO IS LOOKING: an engaged Israeli couple, usually the bride, on a phone. She has already read the hero and is now scrolling to decide whether to message a stranger on WhatsApp about her wedding. She is looking for two things and nothing else: does this actually work, and is there a real person behind it. She will scroll for maybe 90 seconds.

THE PROBLEM YOU ARE SOLVING: the page today is 32 phone screens long. The same feature list — אישורי הגעה · תזכורות בוואטסאפ · תכנון הושבה · מעקב תקציב ומתנות · לוח בקרה זוגי — is told four separate times, in four different visual devices, across 12,000 pixels. Two different sections both show the product dashboard. The founder's promise sentence appears twice in two adjacent sections. There are only three places in the entire page where anything can be tapped.

YOUR TARGET: no more than 14 phone screens from hero to footer, and no single section taller than 2.5 phone screens (≈1,650px at 375px). Every section must earn its height.

THE SECTION ORDER TO DESIGN, in this sequence. Heading copy is given verbatim — do not rewrite the Hebrew.
1. PRODUCT PROOF — one section, not two. Merge the current live-countdown card and the dark dashboard band into a single moment. Eyebrow: כל האירוע במסך אחד. H2: זה לא מוקאפ. / ככה נראה לנהל חתונה נכון. Dek: אורחים, אישורי הגעה, הושבה, תקציב ותזכורות — הכל מסונכרן, בזמן אמת, מכל מכשיר. It shows one dashboard card: a live countdown, and four KPI tiles reading 287 מוזמנים · 214 אישרו · 41 ממתינים · 86% אחוז מענה. CRITICAL: the words נתוני דוגמה must appear on that card at 13px in ink at 70% opacity — legible, not a whisper. A section headed "this is not a mockup" showing invented numbers has to say so plainly or it destroys the trust it is trying to build.
2. HOW IT WORKS — three steps. Eyebrow: איך זה עובד. H2: פשוט, אישי, מלא. Keep the small row of capability chips here; it is cheap and it is the only place the full list should appear as labels.
3. THE PLATFORM, SHOWN NOT LISTED — the product's strongest asset: real artifacts, not bullet points. Eyebrow: כך השירות שלנו עובד. H2: מההזמנה הראשונה / ועד ליום האירוע. Three numbered steps, each with a real image — an actual invitation design, a seating plan, a guest list — beside a short paragraph. Design this as the tallest permitted section (2.5 screens). Do not turn it into a list of features.
4. A CONVERSION MOMENT — the page currently has nothing tappable between the hero and roughly screen 26. Place a full-width band here with one line and one gold button: קבלו הצעת מחיר תוך 24 שעות. Not a section, a beat: maximum 0.6 of a screen.
5. YOU VS DOING IT YOURSELVES — ONE section, merged from what are currently two that make the identical argument with the identical bullet list. Eyebrow: ההבדל. H2: ניהול חתונה לבד / לעומת ניהול עם רגע לפני. Lead with a visual of the chaos side (scattered app icons: WhatsApp, Excel, notes, calendar, a paper list), then a two-column comparison table. On a 375px phone a two-column table is the hard problem here — solve it properly; do not let Hebrew wrap into four-line cells.
6. AN EMOTIONAL BEAT — one only, on a dark ink #1C1008 band, maximum 0.5 screen. Quote: ביום החתונה אתם צריכים להתרגש, לא לנהל אקסלים. Sub: אנחנו לוקחים את הלוגיסטיקה. לכם נשאר הרגע.
7. FOR EVERY EVENT — Eyebrow: לכל אירוע. H2: לכל אירוע. ניהול מלא. Cards for חתונה, בר/בת מצווה, ברית, אירוע עסקי.
8. GALLERY — Eyebrow: עיצובים נבחרים. H2: הגלריה שלנו. Invitation designs, horizontally scrollable on mobile.
9. THE PERSON BEHIND IT — Eyebrow: מי מאחורי המערכת. The founder's story, ending on his promise, stated ONCE, as the closing beat of this section, on an olive #6B7B5A card: "רגע לפני" הוא לא רק שם. זו ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל, ואתם פשוט נוכחים ונהנים. — attributed דביר · מייסד רגע לפני. Beneath it exactly THREE pillars, not four: אדם אחד. לא מוקד. / זמינים בוואטסאפ / כל פרט מטופל.
10. FINAL CTA — H2: מוכנים להתחיל? One gold button, one WhatsApp button.
11. FAQ — Eyebrow: יש שאלות?. H2: שאלות נפוצות. Accordion; every row ≥44px; design the open and closed states.
12. CONTACT — Eyebrow: בואו נדבר. H2: צרו קשר. A five-field form plus three tappable direct-contact cards (WhatsApp, phone 053-331-8177, email). The form needs three states drawn: idle; sending (button reads שולח…, disabled, spinner, fields at 60% opacity); and success, which REPLACES the card in place with an olive #6B7B5A check circle, the line קיבלנו — דביר יחזור אליכם, the couple's own phone number echoed back so they can see it was typed correctly, and a quiet secondary link לא נפתח לכם וואטסאפ? לחצו כאן. That last link is the single most important element in the form — it is the only recovery path for a guest whose WhatsApp handoff was blocked by an in-app browser.
13. FOOTER.

WHAT TO DELETE OUTRIGHT: the standalone "our platform" section whose six check-marked items repeat the comparison table word for word; the second emotional band; the fourth trust pillar; and the duplicate founder promise sentence.

BRAND COLOURS, by name and hex, no others: ivory #FDFAF5 · cream #F6F1E8 · ink #1C1008 · olive #6B7B5A · gold #C5A46D. Gold is an OBJECT colour — fills, hairlines, icon circles, button backgrounds — and may never carry text on ivory or cream (2.26:1, fails). Gold text under 24px is #8B6914 only. A gold accent word inside a heading of 24px or larger may be #A07840. Gold buttons carry ink #1C1008 labels, never white. On the dark ink band, gold #C5A46D text is correct and passes — keep it there. Muted text: ink 100% primary, ink 70% secondary, ink 60% is the floor for 15px and above, and anything under 15px steps UP to ink 70%. ink 40% is for non-text only.

TYPOGRAPHY: Frank Ruhl Libre 700–900 for headings — this family has no italic, so never set Hebrew in italic anywhere. Heebo 300–600 for body; section deks at weight 400, not 300. Section eyebrows are Heebo 13px weight 600 in #8B6914, letter-spacing no greater than 0.05em, never uppercase — Hebrew has no capitals and wide tracking destroys Hebrew word shapes.

TOUCH TARGETS: every tappable element ≥44px. Generous white space between sections; the brand is premium and minimal, not dense.

DELIVER: the full page as one continuous 375px-wide mobile design, plus a labelled scroll map showing each section with its height in phone screens so the 14-screen budget can be checked at a glance.
```

---

## שלושת הכיוונים
A — Luxury Editorial: the page as a printed brochure. One continuous ivory run broken only by hairline gold rules and generous 64px gutters; sections numbered 01–08 in the right-hand RTL margin in Frank Ruhl Libre; exactly ONE full-bleed ink #1C1008 spread in the whole page (the emotional beat), so darkness is an event rather than a rhythm; no cards, no shadows — content sits directly on the paper. Tests whether restraint alone can carry 14 screens. B — Modern Minimal: the most aggressive cut — get to 10 sections by also folding the gallery into the platform section and the event-types cards into a single horizontally-scrolling row. Alternating ivory/cream grounds, no ornament, no photography except the invitation artifacts, everything in flat cards with 1px #E8E0D4 hairlines, and a persistent sticky bottom CTA bar throughout the scroll. Reads as a product page, not a wedding page. C — Warm Romantic: keeps the current mood but disciplines it — a photograph acts as the transition between each pair of argument sections (couple, venue detail, invitation in hand), curved 24–32px card corners, the olive branch mark recurring at section boundaries, cream and ivory alternating warmly, and the ink band plus the olive founder card as the only two saturated moments. Every argument section still capped at 2.5 screens, so the softness is bought with tighter copy rather than more pixels.
