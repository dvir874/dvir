# Migration Plan · מעבר המוצר לתשתית

> התשתית (Wave 0) **additive** — היא קיימת לצד הקוד הישן ולא משנה אף מסך. ההגירה מתבצעת גל-אחר-גל,
> כל גל עומד בפני עצמו, עם Review של לפני/אחרי ואישור דביר לפני הגל הבא.

## 🔒 Mandatory Wave Execution Pipeline (Stitch-First — מחייב)

**כל Wave חייב להתחיל בעיצוב ב-Stitch. אסור Implementation לפני Design מאושר + CEO Approval.**
מיושר ל-[`ai-os/workflows/feature-workflow.md`](../../ai-os/workflows/feature-workflow.md) ול-[Stitch Design Authority](stitch-guidelines.md).

```
Research → Executive Brief → Stitch Design Brief → Stitch Design → Design Review
   → CEO Approval ⛔(שער חוסם) → Implementation → QA → Accessibility Review
   → Performance Review → Executive Review → Release
```

- **⛔ שער חוסם:** אין לעבור ל-Implementation בלי Stitch Design מאושר + CEO Approval.
- **אם Stitch אינו זמין:** לא לדלג על שלב העיצוב. (1) Claude מכין Prompt מקצועי ל-Stitch (פורמט 20 הנקודות), (2) **עוצר** את ה-pipeline, (3) ממתין שדביר יחזיר את תוצאת Stitch, (4) ממשיך משם **אוטומטית** מ-Implementation. אסור לאלתר עיצוב.
- **Stitch = מקור הסמכות היחיד לכל החלטה עיצובית.** ([authority](stitch-guidelines.md))

## 🎨 Design Pack Workflow (לכל Wave — מחייב)

כל Wave עובד כמו ספרינט של צוות Product אמיתי: **קודם מתכננים, אחר כך מעצבים, ורק כשכל העיצובים אושרו — כותבים קוד.**

**שלב א' — Design Dependency Analysis:** לפני תחילת הגל, לזהות מראש את **כל** המסכים, הרכיבים והתבניות שיידרשו.

**שלב ב' — Design Pack (מסמך אחד)** עם 12 הרשימות:
1. כל המסכים בגל · 2. Primitives חדשים דרושים · 3. Components דרושים · 4. States דרושים · 5. Mobile Screens · 6. Desktop Screens · 7. Responsive Variants · 8. Animations · 9. Empty States · 10. Loading States · 11. Error States · 12. Success States.

**שלב ג' — Stitch Prompts:** Prompt מקצועי **נפרד ומלא** לכל פריט, מוכן להעתקה ל-Stitch. אין לקצר, אין להחסיר. כל Prompt כולל: Business Context · User Goals · UX Goals · Brand Guidelines · Product Design Foundation · Accessibility · RTL · Mobile/Desktop First · Interaction States · Motion · Design Constraints · Acceptance Criteria.

**שלב ד' — Execution gate:** רק לאחר ש**כל** עיצובי Stitch של הגל חזרו ואושרו → Implementation. **אסור** להתחיל מימוש כשחלק מהעיצובים חסר.

**Fallback (Stitch MCP לא זמין):** לא לעצור. (1) ליצור את כל ה-Prompts של הגל, (2) לסדר לפי עדיפות, (3) להציג כמסמך אחד, (4) להמתין שדביר יחזיר את כל תוצאות Stitch, (5) להמשיך אוטומטית ל-Implementation.

> הרכיבים החסרים (Accordion/Table/Dropdown/…) מתועצבים כחלק מ-Design Pack של הגל שצורך אותם — אין "סגירת Wave 0" נפרדת.

## עקרון: Strangler Fig (חניקה הדרגתית)

מסך מהוגר = (א) מחליף `const C` מקומי בייבוא מ-`@/design`, (ב) מחליף כפתורים/קלטים/מודאלים מקומיים ברכיבי `@/components/ui`, (ג) מיישר את ה-UI לעיצוב Stitch המאושר. **בלי לגעת** ב-data fetching / handlers / routes / API.

## בטיחות (Zero Downtime) בכל גל

- שינויי UX/UI בלבד. אסור: Logic · DB · API · Auth · Routes · URLs · Data model.
- כל מסך נשאר עובד מקצה-לקצה (regression מלא).
- `npx tsc --noEmit` נקי לפני commit; `git push` בסוף גל.
- מהגרים מסך-מסך; אפשר לעצור באמצע גל בלי לשבור כלום.

## 🎯 Product-First Wave Planning (מחייב)

**לעולם לא לארגן גלים לפי דפים / רכיבים / routes. כל גל מאורגן סביב יעד עסקי ושלב במסע הלקוח.** מסכים ורכיבים הם פרטי-מימוש שנגזרים מהיעד. ה-AI Company OS חושב כמו חברת מוצר, לא כמו פרויקט תוכנה.

**כל גל חייב לענות על 10 השאלות:**
1. איזו בעיה עסקית אנחנו פותרים? · 2. איזה שלב במסע הלקוח משתפר? · 3. אילו רגשות אנחנו יוצרים? · 4. איזו תוצאה עסקית מדידה צפויה? · 5. אילו מסכים מושפעים? · 6. אילו רכיבים נדרשים? · 7. איזה Design Pack נדרש? · 8. אילו Stitch prompts נדרשים? · 9. איזו עבודת Implementation נגזרת? · 10. איך נמדוד הצלחה אחרי Release?

**הסדר המחייב (תמיד):**
```
Business Goal → Customer Journey → Experience Pack → Design Pack
   → Implementation Plan → Implementation → QA → Executive Review → Release → Post-Release Review
```

### מפת גלים לפי יעד עסקי (הצעה — טעון אישור CEO; הסדר הוא החלטת עדיפות עסקית)

| Wave | יעד עסקי | שלב במסע | רגש | תוצאה נמדדת |
|------|----------|----------|-----|--------------|
| **מבקר → זוג** | להמיר מבקרים ללקוחות משלמים | Discovery → Purchase | אמון · "פרימיום וקל" | Conversion rate (ליד/הרשמה) |
| **זוג חדש → ערך ראשון** | להפעיל זוגות מהר, להפחית נטישה | Onboarding/Activation | הקלה · מומנטום | Activation rate · time-to-first-action |
| **תכנון רגוע ושליטה** | לספק את ערך הליבה, לשמר | Planning (core) | שליטה · רוגע | Retention · אימוץ פיצ'רים · פחות תמיכה |
| **אורחים מאושרים → הפניות** | להנעים לאורחים, ויראליות | The Event | שמחה · חגיגה | RSVP rate · referral rate |
| **מהרגע → שגרירים** | להפוך זוגות לממליצים | Post-event/Advocacy | הכרת תודה · נוסטלגיה | Testimonials · הפניות |
| **המפעיל מנהל בלי מאמץ** | יעילות תפעולית לעסק | Operations | שליטה תפעולית | זמן-תפעול שנחסך |

> Polish/Motion ו-Shared Components אינם גלים — הם נטמעים בכל גל דרך ה-Design Pack.
> **אין להתחיל גל עד ש-Wave 0 אושר ועד שה-Business Goal + Design Pack של הגל אושרו ע"י CEO.**

## חוב קיים שמתפנה תוך כדי

- **27 פלטות `const C`** → ייבוא טוקנים (יורד גל-אחר-גל).
- **התנגשות `#1C1008` מול `#333333`** → הטוקן הקנוני `ink #1C1008` מנצח; השימושים מתעדכנים בהגירה. (ה-`dark` הישן ב-tailwind נשאר עד שכל השימושים בו יהגרו, ואז יוסר בבטחה.)
- **1,100+ `fontFamily` inline** → `font-display`/`font-body` או `textStyle()`.
- **קבצי-ענק** (admin 4.6k, couple 2.7k) → פירוק לרכיבים ב-Waves 2–3 ו-5.

## הגדרת "גל הושלם"

- [ ] כל מסכי הגל מהוגרים לטוקנים + רכיבי ספרייה
- [ ] עוברים 5 Reviews ([governance](governance.md)) ו-4 מצבים לכל מסך
- [ ] regression: כל מסך עובד מקצה-לקצה, אפס שבירה ללקוחות קיימים
- [ ] before/after מוצג לדביר
- [ ] אישור דביר → ממשיכים לגל הבא
