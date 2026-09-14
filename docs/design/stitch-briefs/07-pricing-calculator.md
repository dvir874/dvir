# 07-pricing-calculator

**עדיפות:** P1
**מסך:** /pricing — the price calculator (src/app/pricing/page.tsx). Today it is a flat ₪249 + add-on checklist; the real price ladder is an 11.5px muted caption and the per-record model in src/lib/pricing.ts is shown nowhere.

## למה
It quotes one number to every wedding regardless of size, it bills phone numbers while couples count people (אמיר was quoted ~double, answered "לצערי זה יקר לי מידי"), and its only CTA is white-on-gold at 2.37:1 — the three audit findings on gold-as-text, the muted ladder, and templates that look filled when they hold no data all land on this one screen.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design a mobile-first, right-to-left Hebrew PRICE CALCULATOR screen for "רגע לפני", an Israeli wedding RSVP and guest-management service run by one person, Dvir.

=== 1. PURPOSE ===
One screen where an engaged couple discovers what THEIR wedding costs — not a starting price — and leaves with a total they trust enough to send to Dvir on WhatsApp. This screen is where trust is won or lost: it is the only page that names money.

=== 2. WHO IS LOOKING, AND HOW THEY FEEL ===
A couple, 25–35, engaged, on an iPhone at 375px, at night, in bed, with three other RSVP services open in other tabs. They are budget-anxious and have been burned by "מחיר מתחיל מ־". They know roughly how many PEOPLE they are inviting ("בערך 400 מוזמנים"). They have never heard the word "רשומה" (record). They will decide in under 90 seconds whether this outfit is straight with them.

=== 3. THE THREE FAILURES THIS SCREEN MUST FIX ===
(a) One price for every wedding. The screen shows ₪249 to a 150-person wedding and to a 600-person wedding alike. Size must be the FIRST thing the screen asks, not a footnote.
(b) People vs phone numbers. The service bills per phone number — one message to "משפחת ביטון" is one charge and ten people at the wedding. A real couple said "about 430 guests", was quoted for 430 numbers, and walked away over a price that was roughly double his real one. The screen must accept PEOPLE, convert to phone numbers itself, and say out loud that it did.
(c) A total that appears before any input. Never render a finished-looking price for a couple who has entered nothing.

=== 4. FLOW — three steps, no page loads ===
Step 1 "כמה אנשים אתם מזמינים?" → numeric input or slider.
Step 2 "רמת השירות" → choose one of two.
Step 3 "תוספות" → toggle any number.
A persistent total at the bottom of the viewport updates on every change. One tap on it opens WhatsApp with the built package pre-written. Target: total visible in 1 interaction, WhatsApp in 2.

=== 5. EXACT CONTENT (Hebrew, verbatim; numbers are illustrative — the layout must hold any values) ===
H1: כמה תעלה החתונה שלכם
Sub: אתם מזינים גודל, אנחנו מראים מחיר. בלי "מתחיל מ־", בלי מנוי.

STEP 1
Label: כמה אנשים אתם מזמינים?
Input placeholder: למשל 400
Helper under the input: מספר משוער מספיק — נעדכן לפי הרשימה האמיתית.
Conversion line, appears only after a number is entered: ≈ 215 מספרי טלפון · אנחנו מתמחרים לפי מספרי טלפון, כי משפחה שלמה מקבלת הודעה אחת.

STEP 2 — two selectable cards, mutually exclusive
Card 1 title: דיגיטלי — אנחנו שולחים, אתם עוקבים
Card 1 body: הזמנה, שלוש תזכורות, הודעת "מחר החתונה" ותודה עם גלריה. מעקב חי מכל מכשיר.
Card 1 price: ₪1 למספר · מינימום ₪290
Card 2 title: מלא — דביר מתקשר למי שלא ענה
Card 2 body: כל מה שבדיגיטלי, ובנוסף דביר מרים טלפון לכל מי ששותק אחרי כל התזכורות — בערך שליש מהרשימה.
Card 2 price: ₪2 למספר · מינימום ₪490
Card 2 needs a quiet "מומלץ" marker.

INCLUDED, not selectable — shown once as a short list with an olive ✓:
דף אירוע אישי (ניווט, לו״ז, קוד לבוש) · חבילת תכנון — תקציב, ספקים, צ'קליסט · אפשרות תשלום בביט לאורחים
Each carries a small olive pill: כלול

STEP 3 — toggle rows, label right, price left
עיצוב הזמנה אישית (קובץ להדפסה) — ₪150
הודעת Save the Date מעוצבת (3–4 חודשים לפני) — ₪60
סידור הושבה + שליחת מספרי שולחן לאורחים — ₪100
גלריית אורחים + קיר ברכות — ₪80
הודעות "מחר החתונה" + תודה לאורחים — ₪50
אירוע חינה נוסף — אישורי הגעה מלאים לאותם מוזמנים — ₪120
קבוצת טרמפים — ₪0.5 למספר · מינימום ₪100

SEPARATE GROUP, visually distinct — this one is a human coming to the venue:
Heading: שירות ביום החתונה
עמדת קבלה ביום החתונה — דביר מגיע לאולם, מקבל את האורחים ומכוון לשולחנות — ₪800

STICKY TOTAL BAR
Total: ₪1,240
Under it: תשלום חד-פעמי · ללא מנוי
CTA: שלחו לי הצעה 💬
Secondary text link: מה כלול במחיר?

=== 6. HIERARCHY — rank order on a 375px screen ===
1. The guest-count input (largest interactive element on first paint)
2. The total in the sticky bar
3. The two service cards
4. The conversion line (people → phone numbers)
5. The add-on rows
6. The included list
7. The on-site service
8. Legal / small print
The H1 and the input must both be fully visible above the fold on a 375×667 phone with a ~553px usable height. Nothing above the input except the header and the H1.

=== 7. BRAND — binding ===
Colours, by name and hex:
ivory #FDFAF5 (page ground) · cream #F6F1E8 (raised panels) · gold #C5A46D · goldText #8B6914 · goldLarge #A07840 · olive #6B7B5A · ink #1C1008 · hairline #E8E0D4 · danger #B24C4C
GOLD RULE, absolute: #C5A46D is an OBJECT colour only — fills, borders, hairlines, icon backgrounds, the CTA pill background. It may never carry a character of text on ivory or cream (it measures 2.26:1 there). Text gold is #8B6914. An accent word inside a heading at 24px or larger may use #A07840. Gold text is allowed at full #C5A46D ONLY on an ink #1C1008 ground.
NEVER white text on a gold fill — that is 2.37:1. A gold pill CTA carries ink #1C1008 (7.9:1).
Fonts: Frank Ruhl Libre for headings and for every price numeral, weights 700–900. Heebo for body, weights 300–600. Nothing else.
Hebrew typography: NO italic anywhere — Frank Ruhl Libre has no italic face and the browser shears the glyphs. NO uppercase (Hebrew has no case). Letter-spacing on Hebrew never above 0.05em.
Imagery — required, even though this screen asks for no figures: any woman appearing in a placeholder or generated photograph must be modestly dressed — shoulders covered, high neckline, back covered, nothing form-revealing. This applies above all to brides. Apply it even where no figure was requested, because wedding screens attract them by default. A render that does not meet this is regenerated, not cropped.

=== 8. LAYOUT & MOBILE ===
Mobile first at 375px, then 768, then 1280. Max content width 560px, centred. Every tap target ≥44px. The sticky bar sits at the bottom with padding-bottom: env(safe-area-inset-bottom). Generous white space — premium and minimal, not dense. Cards, never tables. The page must never scroll horizontally at 375px.

=== 9. RTL ===
Full RTL. Text right-aligned. Row labels on the right, prices on the left. In an RTL grid the FIRST child lands on the right — put the thing you want read first there. Numerals stay LTR (₪1,240). The ₪ sign sits before the digits. Back/forward arrows point right (←).

=== 10. ACCESSIBILITY — contrast law ===
Spec every value against cream #F6F1E8, which is the worst-case ground, not against white.
Four text rungs only: primary ink #1C1008 · secondary ink at 70% · tertiary ink at 60% as the FLOOR for text 15px and larger · ink at 40% for NON-TEXT only (hairlines, disabled chrome, decorative numerals).
Contrast rises as type shrinks: nothing under 15px may sit below 4.5:1. Small print, disclaimers and the "מינימום" note must be MORE readable than body copy, not less — they are the honesty of the page.
Visible focus ring on every control. Selected state must be distinguishable without relying on colour alone.

=== 11. REQUIRED STATES — draw every one ===
EMPTY (no guest count entered): NO total anywhere on screen. The sticky bar reads "הזינו מספר מוזמנים כדי לראות מחיר" and its CTA is a quiet outline, not a gold fill. Steps 2 and 3 are visible but visibly inert.
TYPING: total area shows a calm placeholder, not a flickering number.
VALID: total present, service card selected, add-ons live.
AT-MINIMUM (list too small for the rate to describe the work): an inline note beside the total — "ברשימה בגודל הזה המחיר נקבע לפי מינימום ההקמה, לא לפי מספר האורחים." Informational tone, olive or ink/70 — not an error colour.
OVER RANGE (more than 600 phone numbers): the price is replaced, not shown alongside — "מעל 600 מספרים זו הצעה אישית, לא מחירון. בואו נדבר." with a WhatsApp button.
ADD-ON SELECTED / UNSELECTED / FOCUSED / PRESSED — four distinct visuals.
INVALID INPUT (letters, 0, negative): inline message under the field in danger #B24C4C, field keeps what was typed, total does not blank out.
SENDING TO WHATSAPP: CTA shows a brief pending state before the handoff.
OFFLINE: an inline strip — "נראה שאין חיבור. המספר של דביר: 053-331-8177" — as a tel: link.

=== 12. DO NOT ===
Do not add a monthly-plan or subscription toggle — this is a single one-off payment.
Do not use a three-column plan-comparison table; two service cards stacked, on a phone.
Do not put a fake "₪899 ~~crossed out~~" anchor price anywhere.
Do not put the size ladder in a caption. It is the first control.
Do not invent testimonials, star ratings, review counts, or "X couples bought this week" badges.

=== 13. EMOTION THE SCREEN MUST CARRY ===
Relief, then confidence. "They told me the real number before I asked, and it was less frightening than I expected." Calm, premium, honest. Not a SaaS pricing table.

=== 14. DELIVERABLE ===
Three directions (A, B, C as separately specified), each as a 375px mobile screen plus a 1280px desktop, each showing at minimum: the EMPTY state, the VALID state with two add-ons selected, and the AT-MINIMUM state.
```

---

## שלושת הכיוונים
A — Luxury Editorial: the calculator as a letterpress rate card. No cards and no shadows; hairline #E8E0D4 rules separate the steps, wide margins, prices set in Frank Ruhl Libre 900 as large ink numerals in the outer margin like a printed price list. The service choice is two rules-separated entries, not boxes. The sticky bar is a single thin ivory band with the total in Frank Ruhl 32px ink and one gold #C5A46D pill with an ink label. Feels like a bespoke quotation being typeset. B — Modern Minimal: the guest-count input is the entire first screen — one very large numeral field on ivory with nothing else but the H1, and the price materialises beneath it as you type. Steps 2 and 3 are a segmented control and a borderless divider-only list that expand in place. Exactly one gold object on screen at a time (the selected state), everything else ink and hairline. Fastest to a number; the least decorated of the three. C — Warm Romantic: the calculator as a conversation in Dvir's voice — each step is a question on its own soft cream #F6F1E8 card with rounded 20px corners and a gold hairline, answered in sequence, the previous answers collapsing into one-line summaries above. The total is presented not as a bar but as "ההצעה שלכם" on a letter-like ivory card that echoes the couple's own numbers back to them, signed off with the WhatsApp CTA. Warmest, tallest, most reassuring.
