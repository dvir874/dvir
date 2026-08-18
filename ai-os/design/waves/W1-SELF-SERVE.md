# Wave 1 — להוציא את דביר מהאונבורדינג ומהגבייה

**סטטוס:** חסום על Stitch. הקוד לא נכתב ולא ייכתב עד שיאושר עיצוב.
**נכתב:** 19–20/08/2026, לילה.

---

## למה זה חסום ולא "עוד לא הספקתי"

CLAUDE.md, Stitch Design Authority: *"אסור להמציא עיצוב. אסור להמשיך בלי
עיצוב מאושר."* ומה לעשות כש-Stitch לא זמין: *"הכן Prompt מקצועי ל-Stitch ·
עצור את ה-Workflow לחלוטין · המתן שה-CEO יחזיר תוצאת Stitch."*

אונבורדינג עצמאי וגבייה הם מסכים חדשים, טפסים, Empty States ו-Success
States — כולם ברשימת "Stitch חובה". אז זה מה שיש כאן: שני פרומפטים מוכנים,
ולא קוד.

**מה כן מותר לי בלי Stitch, וייכתב ברגע שהעיצוב יאושר:** ה-API, הסכמה,
הטוקנים, הוולידציה, החיובים. זה הרוב. מה שחסר זה המסך.

---

## למה דווקא זה, ולמה עכשיו

היום אף לקוחה לא יכולה להיכנס למוצר בלי שדביר יעשה זאת עבורה: יצירת אירוע,
ייבוא אורחים, העלאת תמונת ההזמנה, אישור התבנית מול מטא. שלוש חתונות = שלוש
פעמים שדביר היה הצוואר. זה גם התקרה העסקית וגם הסיכון התפעולי.

והמחיר עוד לא קיים במוצר בכלל. אין תמחור, אין גבייה, אין מה שמפריד בין
"חבר שעושה טובה" ל"ספק".

---

## Stitch Prompt 1 — אונבורדינג עצמאי לזוג

```
Product:      "רגע לפני" — Israeli wedding management SaaS
Screen:       Self-serve onboarding wizard, first run, couple side
Language:     Hebrew, FULL RTL
Platform:     Mobile first (375px), must also work at 1280px
Direction:    Produce A (Luxury Editorial) + B (Modern Minimal) + C (Warm Romantic)

Brand:
  ivory #FDFAF5 · cream #F6F1E8 · gold #C5A46D · olive #6B7B5A · dark #1C1008
  Headings: Frank Ruhl Libre 700–900 · Body: Heebo 300–600
  Premium, minimal, generous white space, soft animation only.

Goal:
  A couple who received a link from a friend reaches a working event
  WITHOUT the founder touching anything. Target: under 6 minutes.

Steps (each its own screen, one question per screen):
  1. Names of the couple + wedding date
  2. Venue name + address (this feeds Waze — both fields matter)
  3. Reception time + chuppah time
  4. Upload the invitation image (this is the WhatsApp header — REQUIRED,
     sending refuses without it). Show why it is required.
  5. Import the guest list — Excel/CSV upload, plus "I will do this later"
  6. Review everything, then confirm

States required (all 12):
  empty · loading · success · error · partial/resumable · disabled
  upload-in-progress · upload-failed · file-wrong-format
  no-guests-yet · duplicate-detected · review-before-send

Critical constraints:
  - Progress must survive leaving and coming back. Couples do this in bed
    on a phone and half of them will not finish in one sitting.
  - Step 4 is the single hardest blocker in the real product. Two clients
    stalled here. Design it as the hero moment, not a file input.
  - Step 5 must show what was understood: "312 שורות · 517 אורחים · 3
    טלפונים שלא הצלחנו לקרוא" — never a silent success.
  - NO pricing anywhere in this flow. Payment is a separate wave.

Imagery:
  If any person appears, women MUST be modestly dressed — covered
  shoulders, high neckline, covered back, non-tight dress. This applies
  especially to brides. Non-negotiable.

Do NOT design: the admin side, the guest side, the dashboard.
```

## Stitch Prompt 2 — תמחור וגבייה

```
Product:      "רגע לפני" — Israeli wedding management SaaS
Screens:      (a) public pricing page  (b) in-product upgrade/checkout
Language:     Hebrew, FULL RTL
Platform:     Mobile first (375px) and 1280px
Direction:    A (Luxury Editorial) + B (Modern Minimal) + C (Warm Romantic)

Brand: as above.

What is actually being sold — describe honestly, do not inflate:
  WhatsApp invitations with real delivery reports · RSVP tracking ·
  reminders that respect who already answered · a guest list that stays
  correct · a private post-wedding photo gallery only the couple sees.

Pricing page must answer, in this order:
  1. What do I get
  2. What does it cost
  3. What happens if guests do not answer
  4. Who else used it

States: empty · loading · success · error · payment-failed ·
        already-subscribed · plan-comparison · post-purchase-confirmation

Constraints:
  - Israeli market. Prices in ₪.
  - One clear recommended plan, not a wall of tiers.
  - The couple is 4–10 months from the most emotional day of their life.
    No dark patterns, no countdowns, no fake scarcity.
  - Checkout must be reachable in ONE tap from anywhere in the product.

Imagery: modest women only, as above.

Do NOT design: the actual card form. Payment fields will be handled by a
PCI-compliant provider's hosted widget — design the frame around it.
```

---

## מה מוכן להיכתב ברגע שיש עיצוב

- `POST /api/onboarding/start` — יוצר אירוע + טוקן זוג, בלי אדמין
- טבלת `onboarding_progress` — כדי שאפשר יהיה לעזוב באמצע ולחזור
- ולידציה של תמונת ההזמנה מול מה שמטא מקבלת, בזמן ההעלאה ולא בשליחה
- הייבוא כבר קיים ועובד — צריך רק להיפתח לצד הזוג
- ספק תשלומים ישראלי: לבדוק, לא נבדק כלל

---

## מה עוד לא נחקר, ואי אפשר לתמחר בלעדיו

מהאודיט: *"pricing · competitors · SEO · ads · sales · retention · analytics
— לא נחקרו. אין לי אף ראיה על מה גובים, מה גובים אחרים, ומה שווי הכאב."*

זה עדיין נכון. הפרומפט לתמחור למעלה מכין את המסך, אבל **המספר שייכנס לתוכו
לא קיים.** לפני שקובעים מחיר צריך: מה גובים מקסיקו/Bridebook/הישראליות
המקומיות, וכמה זוג משלם היום למישהו שעושה את זה ידנית.
