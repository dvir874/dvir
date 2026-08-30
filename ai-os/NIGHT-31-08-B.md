# לילה 31/08 (המשך) — המסך, והצעד הבא לאוטונומיה

## 1. "הבוקר של דביר" — מוטמע

`/admin/morning` · ראשון בתפריט האדמין, כי הוא היחיד שעונה על *"מה לעשות
עכשיו"* וכל השאר עונים על *"מה קרה"*.

עוצב ב-Stitch (ארבעה מצבים) והוטמע ממנו. **שתי סטיות מכוונות מהעיצוב שחזר:**

* Stitch שלח פלטת Material משלו ופונטים Libre Caslon / Work Sans. באדמין כבר
  יש 27 סטי צבעים inline, וקרם רביעי שנבדל בשלושה אחוזים נקרא כבאג רינדור ולא
  כעיצוב. **הפריסה, הריווח וההיררכיה הם של Stitch; הטוקנים הם של CLAUDE.md.**
* האדום שלו (`#ba1a1a`) הוא אדום של דיפלוי שנכשל. תקרה מלאה היא המצב הרגיל של
  אחר צהריים עובד, אז גוון האזהרה הוא הטרהקוטה המרוככת שכבר בשימוש
  ב-`/admin/today`.

**כרטיס התקרה ראשון** כי כשהיא מלאה אי אפשר לפעול על שום דבר אחר במסך. והוא
מדווח **מקומות פנויים לכל ריצה קרובה**, לא מספר אחד: "מלא" זו אמירה על הדקה
הזאת, והשאלה תמיד היא מתי זה מפסיק להיות נכון.

**"צריך אותך" מציג רק כשלים קבועים.** את הוויסותים הזמניים המערכת מנסה שוב
לבד, ורשימה שמערבבת אותם היא רשימה שבה שבעת האנשים שצריכים טלפון נבלעים בין
שמונה־עשר שלא צריכים כלום.

---

## 2. מנוע התאמת שמות — מוכן, מחכה לעיצוב

**מה שעדיין דרש אותי ספציפית:** רשימות שמגיעות כטקסט. שלוש פעמים בשבוע —
שלוש־עשרה שמות מאמא של שחר, אחת־עשרה תוספות, תיקוני כמויות — ובכל פעם הרצתי
סקריפט התאמה ידני.

`src/lib/guest-match.ts` עושה את זה עכשיו. **החלק הקשה הוא לא למצוא התאמות אלא
לסרב לאלה שנראות כמו התאמות:**

| מה שהתאמת־מחרוזת מצאה | האמת |
|---|---|
| עדי → **ס**עדי**ה** | אדם אחר |
| תמר → אי**תמר** | אדם אחר |
| הילה → ת**הילה** | אדם אחר |
| אריאל → **אריאל**ה | אדם אחר |
| יגל → ב**יגל** | אדם אחר |

חמש טעויות, כל אחת הייתה דורסת בשקט אורח אחר. המנוע מנקד **מילים שלמות בלבד**
ומחזיר **רמת ביטחון**, לא ניחוש. שתי שורות שמקבלות אותו ניקוד מדווחות כעמומות
ולעולם לא נבחרות.

**שני דברים שהוא יודע על שמות בעברית:**
* אותיות הניקוד אופציונליות — קדר/קידר, לירן/לירון הם אותו אדם
* שם פרטי משותף לשני בתי אב — "דוד ותמי", "דוד ומעין" — אינו נושא זהות ומנוקד
  כרעש

**האימות:** הרצתי אותו על שלוש־עשרה השמות של אמא של שחר. **13 מתוך 13, זהה
למה שעשיתי ביד**, כולל כל ארבעת המקרים ששקלתי — אפס להכרעה, אפס טעויות.

שני באגים שהבדיקות תפסו לפני שזה עבד: **`\b` לא עובד בעברית** (גבולות מילה
ב-JavaScript מוגדרים מול `[A-Za-z0-9_]`, אז כל אות עברית נקראת כגבול), ו-`\d{1,2}`
בסוף שורה קרא "80" מתוך הטלפון שנגמר ב-7380 — כלומר היה מושיב שמונים איש.

**זו לוגיקה בלבד. המסך צריך Stitch.** הפרומפט מוכן למטה.

---

## 3. הפרומפט הבא ל-Stitch

```text
Design a paste-a-list screen for the "רגע לפני" admin. RTL Hebrew, mobile-first.

THE PROBLEM: guest lists arrive as WhatsApp text for weeks after the file was
imported — a mother sends thirteen names, a couple adds four. Today the owner
forwards that text to his engineer. This screen replaces that.

FLOW — three steps on one page, no wizard:
  1. A large paste box. Placeholder shows the real shape:
       אביתר והילור - 1
       אילנה אלון - לא באה
       דני וענתי סגל - 6
     Below it, a wedding picker (3-5 active weddings) and one button: "בדוק".

  2. THE REVIEW — the important half of this screen. A row per parsed line,
     grouped by what the system decided, in this order:

     ✅ "יעודכנו אוטומטית" (12)   — confident matches, collapsed by default,
        expandable. Each row: typed name → matched guest → the change
        ("1 → 2", "ממתין → לא מגיע"). A per-row checkbox to skip one.

     ⚠️ "צריך שתחליט" (1)        — expanded by default, never auto-applied.
        Shows the typed name and 2-4 candidate guests as selectable cards, each
        with name, phone, current status. Plus a "לא ברשימה — הוסף חדש" option.

     ➕ "אורחים חדשים" (3)        — no match at all. Each becomes a new guest;
        editable name and headcount inline.

  3. A sticky bottom bar: "עדכן 12 אורחים · הוסף 3" and a secondary "בטל".
     The count must update live as rows are checked and unchecked.

STATES: empty (nothing pasted) · parsed-and-clean (no decisions needed, the
review is one green summary line) · needs-decisions · done (a receipt showing
what changed, with an undo).

VISUAL: the same warm paper language as the rest of the admin.
  page #F6F1E8 · card #FDFAF5 · border #E8E0D4 · text #1C1008
  gold #C5A46D · olive #6B7B5A (confirmed/success) · terracotta #B85C38 (needs
  attention — muted, never alarming)
  Headings Frank Ruhl Libre · body Heebo · cards 12px radius, soft shadow.
  Numbers tabular and large; labels small and quiet.
  No photographs.

The decisions section is the product. Design it so a person can clear five
ambiguous rows in under a minute without reading anything twice.
```

---

## מה שנשאר להחלטה שלך

1. **קונבנציית קומיטים** — CLAUDE.md דורש `feat|fix(scope):`. עשרה קומיטים שלי
   בשבוע האחרון כתובים כפרוזה. שמונה כבר דחפת, אז לא נגעתי בהיסטוריה; מכאן
   והלאה אני על הקונבנציה.
2. **`price_charged`** ריק אצל תהל ולאל וטל.
3. **`META_WEBHOOK_ENFORCE`** — הסוד כבר מוגדר, הוובהוק כבר מאמת ורושם
   `signature ok`. חסרה רק הדלקת המתג.
4. **`/api/admin/coverage`** — 6 קטגוריות בלי מסך, מול `/admin/delivery` עם 3.
5. **724 שורות קוד מת.**
