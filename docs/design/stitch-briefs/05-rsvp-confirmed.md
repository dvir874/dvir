# 05-rsvp-confirmed

**עדיפות:** P2
**מסך:** /rsvp/[token] — the confirmed / answered screen, in two variants: a guest who just submitted, and a guest reopening the link weeks later.

## למה
Answers the finding that the largest words on the screen read «כבר אישרתם את הגעתכם!» — 'you have already confirmed' — to a guest who confirmed one second ago, because one flat headline serves both the fresh-submit path and the returning-visit path.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design a mobile screen: the confirmation screen of a Hebrew wedding RSVP, in TWO variants of the same layout. Mobile-first, 375px wide, full RTL.

IMAGERY — READ FIRST, APPLIES EVEN THOUGH NO PERSON IS REQUESTED. Any woman appearing in any placeholder photograph, illustration or generated image must be modestly dressed: shoulders covered, high neckline, back covered, nothing form-revealing. This applies above all to brides. Apply it even where no figure was asked for, because wedding screens attract figures by default. A render that does not meet this is regenerated, not cropped. Prefer no human figures at all: this screen is typography, a checkmark and the couple's own invitation card (typographic, botanical, no people).

1. PURPOSE
Two different jobs share one screen today, and they need two headlines.
VARIANT 1 — JUST ANSWERED. The guest tapped confirm one second ago. This is the couple saying thank you. It is a moment, not a receipt.
VARIANT 2 — CAME BACK. The same guest reopens the WhatsApp link three weeks later. They did not come back to be thanked; they came back for the date, the address and the hour. Everything practical must be at the top.

2. WHO IS LOOKING AT IT
A wedding guest on a phone. In variant 1 they feel a small warmth and are about to close the tab. In variant 2 they are standing somewhere, possibly already in the car, looking for one fact.

3. THE PROBLEM
One headline currently serves both: «כבר אישרתם את הגעתכם!» — literally 'you have ALREADY confirmed'. Shown to someone who just answered, the biggest words on the screen assert something false about what they just did, and the page reads as a records system flagging a duplicate rather than a couple saying thank you.

4. EXACT CONTENT — use these Hebrew strings verbatim
Shared header bar: the Latin words MAZAL TOV, Frank Ruhl Libre 16px/700, letter-spacing 0.12em (Latin only — never letter-space Hebrew), in goldText #8B6914, on a 1px #E8E0D4 hairline.
An olive #6B7B5A checkmark ✓ in an 80px circle of rgba(107,123,90,0.12).
VARIANT 1 HEADLINE: «תודה! נתראה ב־8.9.2026 🤍» — Frank Ruhl Libre 26px/700.
VARIANT 1 SUBHEAD: «אנחנו מחכים לראות אתכם ביום המאושר שלנו.»
VARIANT 2 HEADLINE: «אתם רשומים ✓» — same family, one step smaller, calmer.
VARIANT 2 SUBHEAD: «הנה כל הפרטים, שיהיו לכם ביד.»
If the guest left a blessing, one quiet olive line: «הברכה שלכם נשמרה 🤍» — a small acknowledgement, never a celebration.
Summary card A: label «כמות אורחים», value «3 אורחים».
Summary card B: «שחר & יונתן» / «8.9.2026» / «📍 אולמי גאיה, חדרה», with a gold pill reading «בעוד 42 ימים».
Seating card, when a table exists: label «מקום ישיבה», value «שולחן 14».
Actions, stacked full-width: primary «📅 הוסיפו ליומן Google», then «🍎 יומן iPhone / Outlook», then «🚗 ניווט עם Waze», then «💌 כתבו ברכה לזוג».
Footer line, deliberately the quietest text on the page, ink at 38%, 12.5px, no button: «מתחתנים בקרוב? רגע לפני ניהלה את אישורי ההגעה של החתונה הזו.» with the words «רגע לפני» as a goldText #8B6914 link on a soft gold underline.

5. HIERARCHY
· VARIANT 1: emotion first — checkmark, thank-you, then details, then actions, then the footer line.
· VARIANT 2: utility first — the same shell, but the details card and the calendar/Waze actions move ABOVE the summary block, because that is what a returning guest came for. The thank-you shrinks to a single acknowledgement line.
· The footer marketing line must be reachable only after everything the guest came for, must carry no colour and no button, and must be effortless to ignore. A guest who came to say they are coming must never feel sold to on the way out.

6. BRAND
ivory #FDFAF5 · cream #F6F1E8 · gold #C5A46D · goldText #8B6914 · olive #6B7B5A · ink #1C1008 · muted #8C7B6E · hairline #E8E0D4.
Frank Ruhl Libre 700–900 for headings and numerals; Heebo 300–600 for body. Hebrew is never italic — the font has no italic face and the browser shears the glyphs. Never letter-space Hebrew above 0.05em; MAZAL TOV is Latin and may be tracked.
Feel: warm, premium, minimal, generous white space.

7. MOBILE / RTL / ACCESSIBILITY
375px first. Full RTL: labels and body right-aligned, headline and checkmark centred. Every action ≥ 44px tall, and the primary at 56px. White on gold #C5A46D is 2.37:1 and is FORBIDDEN — labels on a gold fill are ink #1C1008. No text under 12.5px. Nothing under 15px may sit below 4.5:1 on cream #F6F1E8.

8. STATES TO DRAW
Variant 1 (just answered) · Variant 2 (returning) · the declined version of variant 1, where the tone is gracious rather than celebratory and the calendar and Waze actions are absent — content: headline «תודה שעדכנתם אותנו 🤍», subhead «נתגעגע — תודה שהודעתם לנו מראש.», plus a single quiet control «רוצים לשנות את התשובה?» · and the same screen with no seating card and no blessing line, so the layout must hold together when those are missing.

9. DO NOT
Do not use the word «כבר» in variant 1. Do not add a trailing ✓ to a headline that already sits under a checkmark. Do not add heavy confetti animation to variant 2. Do not add photographs of people. Do not turn the footer marketing line into a button or a card.

Produce a mobile screen at 375×812 showing variant 1 and variant 2 side by side.
```

---

## שלושת הכיוונים
A — LUXURY EDITORIAL: no confetti at all; the screen reads as a printed acknowledgement card — MAZAL TOV centred between two hairline rules, the thank-you in Frank Ruhl Libre 30px on generous ivory, and the details set as a typeset list separated by #E8E0D4 rules instead of bento cards (label in 12px muted Heebo on the right, value in Frank Ruhl on the left of each row); actions as full-width ivory buttons with a 1px ink border and ink labels, only the primary filled in ink #1C1008 with an ivory label; the checkmark drawn as a thin olive stroke, not a filled disc.
B — MODERN MINIMAL: a single olive ✓ at 32px with no surrounding circle; one headline, one subhead, then the actions IMMEDIATELY — before any summary — as four stacked 52px buttons on cream with hairline borders and the primary in gold with an ink label; all event details compressed into one flat card at the bottom with no icons; no confetti, no ornament, no gradient, no pill; variant 2 is the identical layout with only the headline and the details/actions order swapped, which is the point of this direction.
C — WARM ROMANTIC: gentle gold confetti on variant 1 only, settling and stopping; the soft radial ivory→cream wash; an olive botanical sprig under the headline; the couple's names in Frank Ruhl Libre with a gold ampersand; the days-left counter as a warm gold-tinted pill; the seating card in a soft gold gradient with a 1.5px rgba gold border; «הברכה שלכם נשמרה 🤍» in olive directly above the actions; on variant 2, the confetti is gone and the wash stays.
