# 04-rsvp-form

**עדיפות:** P1
**מסך:** /rsvp/[token] — the guest answer screen (form state), mobile Hebrew RTL. The single highest-traffic surface in the product: every guest of every couple lands here.

## למה
Answers the confirmed findings on this screen: the decline card holds the primary RTL reading position while both cards are visual twins; the CTA label is white on gold at 2.37:1 and its disabled fill is 1.71:1; the /simple escape links sit between the answer and the next step in 2.26:1 gold; the confirm button is ~550px below the answer and nothing is saved until it is tapped; and guest.name is loaded but never shown, leaving "קיבלתם בטעות? זה לא אני" unanswerable.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design a mobile screen: a Hebrew wedding RSVP answer page. Mobile-first, 375px wide, full RTL.

IMAGERY — READ FIRST, APPLIES EVEN THOUGH NO PERSON IS REQUESTED. Any woman appearing in any placeholder photograph, illustration or generated image must be modestly dressed: shoulders covered, high neckline, back covered, nothing form-revealing. This applies above all to brides. Apply it even where no figure was asked for, because wedding screens attract figures by default. A render that does not meet this is regenerated, not cropped. Better still: do not add photographs of people at all. The only image on this screen is the couple's own printed invitation card, supplied by them — a landscape image of roughly 1.4:1. Use a tasteful placeholder invitation card (typography and botanical ornament, no people). Never substitute stock photography of a couple; showing strangers on someone's wedding page reads as contempt.

1. PURPOSE OF THE SCREEN
A wedding guest opens a personal link from WhatsApp and answers one question: are you coming, and with how many. Everything else on the screen is secondary to that single answer arriving in the couple's list.

2. WHO IS LOOKING AT IT, AND IN WHAT STATE OF MIND
An Israeli wedding guest, on a phone, usually inside WhatsApp's in-app browser, in the middle of doing something else. They have about fifteen seconds of attention. They are not a customer — they are a guest of the couple, and the screen is the couple's hospitality, not a form. Many are religious or traditional. Many are 50+ and read at arm's length in daylight.

3. THE PROBLEM THIS DESIGN SOLVES
Today the two answers are identical twins — same size, same cream fill, same border, same 15px serif — and the decline card sits first in the RTL grid, so the first words a guest reads on a wedding invitation are "מצטערים, לא נוכל". Nothing signals which answer is expected, and the confirm button sits roughly 550px below the answer, so a guest who taps כן and stops has left no trace at all.

4. THE FLOW
Open link → read who is getting married and when → tap כן or לא → (if כן) choose how many are coming → optionally write a blessing → confirm. Two taps minimum. No account, no password, no page changes.

5. EXACT CONTENT, IN THIS ORDER — use these Hebrew strings verbatim
A. The couple's invitation card image (landscape, ~1.4:1), rounded 14px corners, soft shadow.
B. A greeting line naming the guest — new, must exist: «שלום שירה,» Heebo 16px weight 400.
C. Hebrew calendar date: «כ״ו אלול תשפ״ו»
D. Ceremony hours: «קבלת פנים 19:00 · חופה וקידושין 20:00»
E. H1, the couple: «שחר & יונתן» — Frank Ruhl Libre 28px weight 700. The ampersand in gold.
F. Date and venue: «8.9.2026 | אולמי גאיה, חדרה»
G. A thin divider with a single gold ✦.
H. THE ANSWER. Two controls: «כן, נשמח להגיע» and «מצטערים, לא נוכל». See hierarchy rules below — this is the most important part of the screen.
I. Only after כן is chosen: «כמות אורחים» with the sub-line «כולל אתכם», then five round selectors 1 · 2 · 3 · 4 · 5+, and when 5+ is chosen a −/+ stepper up to 15.
J. Only after כן: a gift, not a request — an announcement card with a 📸 mark, heading «התמונות שלכם מהחתונה», body «אחרי האירוע נשלח לכם קישור להעלאת התמונות והסרטונים שצילמתם — הם מגיעים לזוג בלבד 🤍». Nothing to tick.
K. Only after כן: label «רוצים לאחל להם משהו?» (Frank Ruhl Libre 18px/700), hint «הם יראו את זה בדף שלהם», textarea placeholder «שיהיה לכם בית מלא אהבה…». Optional, no asterisk, no validation, must not look like a required field.
L. Primary confirm: «אישור והמשך». In flight: «שולח...».
M. Below the confirm, quiet: «לאישור בגרסה פשוטה» and «או כתבו לנו ונרשום אתכם 💬».
N. Last line, quiet: «לא שירה? קיבלתם בטעות»

6. HIERARCHY — THE BINDING RULES
· In this RTL grid the FIRST child lands on the right, where a Hebrew eye starts. «כן, נשמח להגיע» must occupy that position. Never place the decline first.
· The two answers must NOT be equal-weight twins at rest. Accept is the primary; decline stays available in one tap, ≥44px, and must never look punished, disabled or shameful — a guest who cannot come has to be able to say so comfortably.
· Gold fill #C5A46D is reserved for the SELECTED / confirmed state. Do not use a solid gold fill on a resting, unanswered control — it reads as already answered. Express the resting hierarchy with border weight, size, and glyph colour instead.
· The confirm button must be reachable the instant an answer is chosen. Design a sticky bottom bar, 56px tall, that slides in the moment either answer is tapped and stays until the guest submits: ivory ground, 1px #E8E0D4 hairline on its top edge, safe-area padding underneath. Distance from deciding to finishing must be zero on every device.
· Nothing may sit between the answer and the next step. The two quiet links (M) belong below the confirm, never above it.
· The invitation card is the thing the page exists to honour. Do not shrink it to a thumbnail and do not crop it.

7. BRAND — COLOURS AND FONTS BY NAME AND HEX
ivory #FDFAF5 (page ground) · cream #F6F1E8 (card fills) · gold #C5A46D (ornament, fills, borders, the ✦, selected state) · goldText #8B6914 (the ONLY gold permitted on any text under 24px) · olive #6B7B5A (confirmation and success) · ink #1C1008 (all primary text) · muted #8C7B6E (secondary text) · hairline #E8E0D4 (borders).
Fonts: Frank Ruhl Libre for headings and numerals, weights 700–900. Heebo for body, weights 300–600.
Hebrew is NEVER set in italic — the font has no italic face and the browser shears the letters. Get a softer voice from weight and colour at the same size. Hebrew also takes no Latin letter-spacing: never exceed 0.05em on Hebrew text.
Feel: premium, minimal, warm, generous white space. Printed-stationery calm, not SaaS form.

8. ACCESSIBILITY — HARD CONSTRAINTS, NOT PREFERENCES
· Every tappable target ≥ 44×44px.
· White #FFFFFF on gold #C5A46D measures 2.37:1 and is FORBIDDEN. Any label sitting on a gold fill must be ink #1C1008 (7.9:1).
· A disabled or in-flight button must never drop below 4.5:1. The current pale-gold #D4C4A8 with white sits at 1.71:1 — do not reproduce it.
· Any text under 15px must clear 4.5:1 against cream #F6F1E8 (the worst-case background), which means goldText #8B6914 or ink at 70% — never gold #C5A46D and never ink below 60%.
· No text under 12.5px anywhere on the screen.

9. REQUIRED STATES — draw every one
· RESTING: nothing chosen, no count, no blessing field, no sticky bar yet.
· ACCEPTED: כן selected, count/gallery/blessing revealed, sticky confirm bar present.
· DECLINED: לא selected, no count and no blessing, sticky confirm bar present.
· SUBMITTING: the confirm reads «שולח...» with a spinner, still legible, still ≥4.5:1.
· INLINE ALERT (guest taps confirm without answering): a warm, non-alarming card above the answers reading «בחרו קודם — מגיעים או לא מגיעים ☝️». Warm, not red-alert.
· OFFLINE: the same warm card shape, telling the guest their answer has not been sent yet.

10. DO NOT
Do not add a photograph of a couple. Do not add a progress bar or step counter — this is one screen, not a wizard. Do not add a navigation bar, logo header or menu. Do not use a red destructive colour on the decline. Do not make the blessing field look mandatory. Do not centre body copy in long paragraphs — RTL body text is right-aligned.

Produce a mobile screen at 375×812 with the resting, accepted and declined states shown side by side.
```

---

## שלושת הכיוונים
A — LUXURY EDITORIAL: the invitation as a framed plate with wide ivory margins and a hairline #E8E0D4 rule above and below it; the answer expressed typographically rather than as boxes — «כן, נשמח להגיע» as a single full-width line in Frank Ruhl Libre 22px/700 ink inside a hairline-bordered ivory field, and «מצטערים, לא נוכל» as a serif text line beneath it with a rule under it, no card at all; sticky confirm bar in ink #1C1008 with an ivory label (gold reserved entirely for the ✦ and the selected ring); no shadows anywhere; count selectors as small serif numerals separated by hairlines rather than circles.
B — MODERN MINIMAL: invitation edge-to-edge at the very top with a 16px radius and no frame; the answer as one full-width primary — cream fill, 2px gold #C5A46D border, gold ✓ glyph, ink label at 17px — with the decline directly beneath it at 70% of its height, hairline border, muted ✗ and muted label; count as a horizontal row of 52px circles; blessing textarea flat on cream with no label ornament; the sticky bar present from load in a dormant hairline state and filling gold with an ink label the moment an answer lands; the tightest possible vertical rhythm, 20px gaps, nothing decorative — the ✦ divider is deleted in this direction.
C — WARM ROMANTIC: soft radial ivory→cream wash behind everything; an olive #6B7B5A botanical sprig above the greeting; the guest's name greeting in Frank Ruhl Libre 20px as a genuine welcome rather than a system line; the two answers as asymmetric warm cream cards — accept wide with a gold border, gold ✓ and 16px label, decline narrower and quieter beside or beneath it, hairline only; the gallery announcement as a gold-tinted card with the 📸 mark; the blessing framed as an invitation with the sprig repeated small beside its label; sticky bar in gold #C5A46D with an ink #1C1008 label and a soft gold shadow.
