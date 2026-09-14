# 06-rsvp-states

**עדיפות:** P3
**מסך:** /rsvp/[token] — the four supporting states a guest can land in instead of the form: loading, invitation-not-found, wrong-person report, and the reusable inline alert card used across the flow.

## למה
These states are what a guest sees when the product is failing them, and they are currently the least designed screens in the flow — /rsvp/demo server-renders «לא מצאנו את ההזמנה» to anyone who opens the public demo link, and the same warm-alert card is needed for the form's inline errors.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design four supporting states of a Hebrew wedding RSVP page. Mobile-first, 375px wide, full RTL. These are the screens a guest sees when something is not working, plus one reusable component.

IMAGERY — READ FIRST, APPLIES EVEN THOUGH NO PERSON IS REQUESTED. Any woman appearing in any placeholder photograph, illustration or generated image must be modestly dressed: shoulders covered, high neckline, back covered, nothing form-revealing. This applies above all to brides. Apply it even where no figure was asked for, because wedding screens attract figures by default. A render that does not meet this is regenerated, not cropped. These four states should carry no photographs at all — botanical ornament and typography only.

1. PURPOSE
A guest tapped a link from a wedding invitation on WhatsApp and did not get the form. Each of these screens has to do one thing: tell them plainly what happened and give them exactly one thing to do next. None of them may look like a technical error page. The couple's hospitality still owns this screen even when the product is failing.

2. WHO IS LOOKING AT IT
A guest on a phone, often 50+, often inside WhatsApp's in-app browser on a weak connection. They do not know what a token is. Their instinct on a broken page is to try another device and then to phone the couple — which is the outcome all four of these screens exist to prevent. One real guest tried three devices before writing to anyone.

3. THE FOUR STATES — exact content, verbatim Hebrew

STATE 1 — LOADING. Wordmark «רגע לפני» in Frank Ruhl Libre 22px/900 goldText #8B6914; an olive #6B7B5A botanical sprig; three pulsing gold dots; and the line «מכינים את ההזמנה שלך...» in Heebo 14px muted. Calm and short. It must never look frozen — the motion is the whole message.

STATE 2 — INVITATION NOT FOUND. Heading «לא מצאנו את ההזמנה» (Frank Ruhl Libre 22px/700 ink). Body: «ייתכן שהחיבור נקטע באמצע.» / «נסו שוב — לרוב זה פותר את זה.» A single clear action, ≥48px: «נסו שוב». Then a quiet closing line: «אם זה חוזר — פנו ישירות לבעלי השמחה.» The retry button is the point of this screen; a guest with no button phones the couple instead.

STATE 3 — WRONG PERSON. Heading «קיבלתם בטעות?». Body: «ייתכן שהקישור נשלח למספר הטלפון הלא נכון.» / «כתבו לנו כאן ובעלי השמחה יתקנו את זה.» A textarea, placeholder «למשל: זה לא המספר של דוד — נסו 05X-XXXXXXX». Primary action «שליחה לבעלי השמחה», in flight «שולח...». After sending, the same shell shows heading «תודה שהודעתם 🙏» and body «ההודעה נשלחה לבעלי השמחה והם יתקנו את הפרטים.» / «מצטערים על ההפרעה!». This screen must feel apologetic toward the guest, never accusatory — they did nothing wrong.

STATE 4 — THE REUSABLE INLINE ALERT CARD. A small warm card that appears inside the form above the content it refers to. Draw it with three sample messages, one per severity: «בחרו קודם — מגיעים או לא מגיעים ☝️» (a nudge), «נראה שאין חיבור לאינטרנט — התשובה שלכם עדיין לא נשלחה» (a warning), «לא הצלחנו לשמור — נסו שוב בעוד רגע» (a failure with a retry link). This card replaces native browser alerts everywhere in the product, so it has to be generous enough to carry a sentence and an optional inline action.

4. HIERARCHY
One heading, one or two lines of body, one action. Nothing else. The action is always the most prominent element after the heading. Never present two competing actions on a failure screen.

5. BRAND
ivory #FDFAF5 (ground) · cream #F6F1E8 · gold #C5A46D (ornament only) · goldText #8B6914 (any gold text under 24px) · olive #6B7B5A (the botanical sprig, success) · ink #1C1008 (headings and body) · muted #8C7B6E (secondary) · hairline #E8E0D4.
For the alert card use a warm caution tone rather than a system red: a soft warm ground with a #B85C38 hairline and ink text. Do not introduce a saturated web red such as #C0392B or a green such as #22c55e — the product has no such colours.
Fonts: Frank Ruhl Libre 700–900 for headings, Heebo 300–600 for body. Hebrew is never italic and is never letter-spaced above 0.05em.
Feel: warm, calm, apologetic, quiet. A failure on a wedding page should feel like a person saying sorry, not like a server saying 500.

6. MOBILE / RTL / ACCESSIBILITY
375px first; content in a max 420px column with 28px 20px padding; the block sits in the upper third, not vertically centred, so it is visible before any scroll. Full RTL. Every action ≥ 48px tall. White on gold #C5A46D is 2.37:1 and is FORBIDDEN — labels on a gold fill are ink #1C1008. No text under 12.5px, and nothing under 15px below 4.5:1 on cream #F6F1E8. The loading state must respect prefers-reduced-motion by holding the dots still rather than removing the message.

7. DO NOT
Do not use an error illustration of a broken robot, a 404 number, a sad face, or any mascot. Do not use technical wording — no 'token', no 'server', no error codes. Do not offer two buttons on a failure screen. Do not add photographs of people.

Produce a mobile sheet at 375×812 showing all four states side by side, plus the alert card in its three severities.
```

---

## שלושת הכיוונים
A — LUXURY EDITORIAL: the failure states as printed notices — a single centred hairline rule above the heading, Frank Ruhl Libre at 24px, wide ivory margins, no card and no container at all; the sprig replaced by a small typographic ✦; the retry action as an ink-bordered ivory button with an ink label; the alert card is a rule-bordered notice with the message in serif rather than a filled tinted box.
B — MODERN MINIMAL: no botanical ornament anywhere; a single 28px line-drawn glyph per state (a hairline circle-slash for not-found, a hairline envelope for wrong-person); heading 20px, one body line only, one full-width gold button with an ink label; everything left to a strict 24px vertical rhythm; the loading state is three dots and one line, no wordmark; the alert card is a flat 12px-radius block with a 3px warm bar along its right edge (RTL leading edge) and no icon.
C — WARM ROMANTIC: the olive botanical sprig at 48px above every heading and repeated small in the alert card; soft radial ivory→cream wash behind all four states; body copy at line-height 1.7 with a gentler, more personal register; the retry button in gold #C5A46D with an ink label and a soft gold shadow; the wrong-person 'sent' state adds a small olive check beside the sprig; the alert card is a warm gold-tinted panel with a rounded 14px radius and a 1.5px warm border.
