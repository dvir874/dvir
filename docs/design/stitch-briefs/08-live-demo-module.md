# 08-live-demo-module

**עדיפות:** P2
**מסך:** The live-demo module on the home page — replacing the two that ship today: LiveSnapshot (src/components/LiveSnapshot.tsx, light, ticking countdown, 287/214/41/86%) and ShowcaseBand (src/components/ShowcaseBand.tsx, dark ink band, headline "זה לא מוקאפ", 287/214/41/26 + ₪48,200). Same fictional wedding, same numbers, two sections apart.

## למה
The largest type on the darkest band of the home page asserts "זה לא מוקאפ" over a CSS-drawn mockup, the same invented figures appear twice in two different visual languages, and the section once rendered 0 מוזמנים · 0 אישרו · ₪0 under that sentence — so the module built to prove the product is real is the one element most likely to be disbelieved.

---

## פרומפט לסטיץ׳ — להעתיק מכאן ולמטה, בלי לערוך

```
Design ONE mobile-first, right-to-left Hebrew PRODUCT DEMO MODULE for the home page of "רגע לפני", an Israeli wedding RSVP and guest-management service. It replaces two existing sections that currently show the same invented wedding twice, one in a light section and one in a dark band, roughly two screens apart.

=== 1. PURPOSE ===
One module, appearing once, that lets a couple SEE the dashboard they would get — and believe it. It has two jobs in this order: show the product, and be visibly honest about what it is showing.

=== 2. WHO IS LOOKING, AND HOW THEY FEEL ===
A couple on a phone at 375px, roughly one screen into a very long home page. They have read a headline and nothing else. They are sceptical of screenshots: every service they have looked at shows a beautiful dashboard, and they assume all of them are drawings. They are not going to sign up to find out.

=== 3. THE FAILURE THIS MODULE MUST FIX ===
The current dark band's headline reads "זה לא מוקאפ. ככה נראה לנהל חתונה נכון." over what is, in fact, a mockup, built entirely in CSS with invented figures for a wedding that does not exist. That is the one sentence this product cannot afford to have doubted, since its whole differentiator is "a real person, not a call centre." The replacement must either (a) label itself as an example, prominently and beautifully, or (b) become a genuine door into the live example event. Design it so that the label is a first-class designed element — a chip on the card frame, at 13px minimum in ink at 70% — never 11px grey small print apologising at the bottom.

=== 4. FLOW ===
Scroll in → read one headline → understand within 2 seconds that this is a dashboard for a wedding → see one label telling the truth about the data → one tap on a single CTA that opens the real example event. One destination only.

=== 5. EXACT CONTENT (Hebrew, verbatim) ===
Eyebrow: לוח הבקרה שלכם
Headline (two lines, second line is the accent):
  כל האירוע במסך אחד.
  בכל רגע נתון.
Dek: אורחים, אישורי הגעה, הושבה, תקציב ותזכורות — הכל מסונכרן, בזמן אמת, מכל מכשיר. תמונת מצב אחת ברורה במקום עשרה קבצים.
HONESTY LABEL — a designed chip, on or beside the card frame: דוגמה · חתונה להמחשה
CTA (one, and only one): פתחו את לוח הבקרה לדוגמה ←

INSIDE THE DASHBOARD CARD:
Event title: חתונת נועה ואורי
Countdown label: זמן נותר
Countdown value: 36:14:22:08 (days:hours:minutes:seconds)
KPI tiles:
  מוזמנים — 287
  אישרו — 214
  ממתינים — 41
  אחוז מענה — 86%
Guest rows, list titled אישורי הגעה:
  משפחת כהן — אישרו · 4
  יובל ודנה — ממתינים
  משפחת לוי — אישרו · 2
  רון אברהם — לא מגיע
Side widgets:
  תקציב ומתנות — ₪48,200 with a progress bar at 80%
  תזכורות — 17 תזכורות נשלחו אוטומטית השבוע
Footer chips beneath the module: מתעדכן בזמן אמת · לשני בני הזוג · מכל מכשיר

=== 6. HIERARCHY on a 375px phone ===
1. The dashboard card itself — it is the argument
2. The headline
3. The honesty label (must be found without hunting; it sits ON the card, not below the section)
4. The CTA
5. The dek
6. The trust chips
On mobile the card stacks BELOW the headline and must be legible at 375px — if the four KPI tiles cannot hold their numerals at that width, drop to two tiles and let the rest be revealed on tap. Never shrink the numerals below 20px to make four fit.

=== 7. BRAND — binding ===
Colours by name and hex:
ivory #FDFAF5 · cream #F6F1E8 · gold #C5A46D · goldText #8B6914 · goldLarge #A07840 · olive #6B7B5A · ink #1C1008 · goldSoft #E5C188 (for gold text on ink) · successSoft #DCE6D1 · danger #B24C4C · hairline #E8E0D4
GOLD RULE, absolute: #C5A46D is an OBJECT colour — fills, borders, hairlines, glows, icon backgrounds. It may not carry text on ivory or cream (2.26:1 there). Text gold on light is #8B6914; a heading accent at 24px+ may use #A07840. On an ink #1C1008 ground, gold text is fine — use #C5A46D or #E5C188.
If this module sits on a dark ground, there is exactly ONE dark: ink #1C1008. No gradients between unnamed browns. Headings on ink are ivory #FDFAF5, never pure #FFF; body on ink is white at 75%; the floor for readable text on ink is white at 60%; white at 40% is for non-text only.
Fonts: Frank Ruhl Libre for headings and all numerals, 700–900. Heebo for body, 300–600.
Hebrew typography: no italic (the font has no italic face; the browser shears the letters), no uppercase (a no-op in Hebrew), letter-spacing never above 0.05em.
Imagery — required, even though this module asks for no figures: any woman appearing in a placeholder or generated photograph must be modestly dressed — shoulders covered, high neckline, back covered, nothing form-revealing. This applies above all to brides. Apply it even where no figure was requested, because wedding screens attract them by default. A render that does not meet this is regenerated, not cropped.

=== 8. LAYOUT & MOBILE ===
Mobile first at 375px, then 768, then 1280. On desktop a two-column split (copy on the right in RTL, card on the left) is acceptable; on mobile it is a single column. Tap targets ≥44px. Section height on mobile must not exceed roughly 1.5 screens — this page is already far too long. No horizontal scroll at 375px; if the card is wider than the viewport it scrolls inside its own container, never the page.

=== 9. RTL ===
Full RTL. In an RTL grid the first child lands on the RIGHT. Guest names on the right of each row, status pills on the left. Numerals and the countdown stay LTR with tabular figures so the digits do not jitter. Arrows point right (←).

=== 10. ACCESSIBILITY ===
Four text rungs on light, specified against cream #F6F1E8: ink #1C1008 · ink 70% · ink 60% as the floor for text 15px and up · ink 40% NON-TEXT only. On ink: ivory #FDFAF5 · white 75% · white 60% floor · white 40% non-text only.
Contrast rises as type shrinks: nothing under 15px below 4.5:1. This applies with force to the honesty label — the sentence that says "this is example data" must be among the MOST readable text in the module, not the least.
Animated counters must respect prefers-reduced-motion and render their final values immediately when it is set.

=== 11. REQUIRED STATES — draw every one ===
FIRST PAINT / pre-animation: the card shows its FINAL numbers. It must never be designed to start at zero — a state where this module reads 0 מוזמנים · 0 אישרו · ₪0 under a headline about seeing everything is the exact failure being fixed.
IN VIEW: counters may count up, gently, once. Design the resting state as the canonical one.
REDUCED MOTION: identical to the resting state, no countdown ticking.
HOVER / FOCUS on the CTA and on the card if it is tappable.
LOADING, if the module is ever wired to live data: skeleton tiles that hold the exact final layout, no layout shift, and never a zero.
ERROR / OFFLINE: the card falls back to the labelled example rather than showing empty tiles or dashes. Draw this.
SMALL SCREEN (320px): show what is dropped and what survives.

=== 12. DO NOT ===
Do not write "זה לא מוקאפ" or any equivalent claim of liveness over drawn data.
Do not design two demo modules. One.
Do not put a laptop or browser chrome frame around it — this product is used on a phone.
Do not add fake logos, press badges, or "trusted by" strips.
Do not use a red/green traffic-light palette for the guest statuses; use olive #6B7B5A for confirmed, gold #C5A46D for waiting, danger #B24C4C sparingly for declined.

=== 13. EMOTION ===
Recognition and calm competence. "Oh — that is what I would actually be looking at, and they are not pretending it is more than it is." Premium, quiet, credible.

=== 14. DELIVERABLE ===
Three directions (A, B, C as separately specified), each at 375px and 1280px, each showing the resting state, the reduced-motion state, and the offline/fallback state.
```

---

## שלושת הכיוונים
A — Luxury Editorial: the dashboard as a plate in a printed magazine. Full-bleed ink #1C1008 ground, the card sitting inside a single hairline gold #C5A46D frame with no glow, no blur, no glassmorphism. Numbers set in Frank Ruhl Libre 900 in goldSoft #E5C188. Nothing moves — no ticking countdown, no counting up; the countdown is set as a fixed typographic figure. Beneath the frame, a small centred figure-caption in ivory at 75%: "דוגמה · חתונה להמחשה". Reads as a considered artefact rather than a running app. B — Modern Minimal: no dark band at all — one white card on the ivory #FDFAF5 page, flat, no shadow beyond a soft card lift, no gold glow. Above the card a segmented control (אורחים · הושבה · תקציב) that swaps the card's contents in place, so the demo is something the couple operates rather than watches. The honesty chip is a quiet outlined pill in the card's top-right corner. Shortest of the three and the only interactive one. C — Warm Romantic: the dashboard shown as the couple actually meets it — held in a hand, on a phone, on a cream #F6F1E8 ground, with a modest photograph of a couple looking at the screen together (shoulders covered, high neckline, back covered, nothing form-revealing — regenerate rather than crop). Caption in Dvir's first-person voice on ivory beneath: "ככה זה נראה אצל נועה ואורי — דוגמה שבניתי כדי שתראו בדיוק מה מקבלים." The honesty label is carried by that sentence, which is set at body size, not as small print.
