# Design Governance

כל עיצוב חדש עובר שערים מוגדרים לפני מימוש. עיצוב שלא עבר — לא נכנס לקוד.

## חמשת ה-Reviews

1. **Design Review** — האם העיצוב מאושר ע"י Stitch ודביר? Layout, היררכיה, מרווחים.
2. **UX Review** — עומד ב-[Experience Principles](experience-principles.md)? ≤3 קליקים, אין dead ends, 4 מצבים מטופלים.
3. **Accessibility Review** — עומד ב-[Accessibility](accessibility.md)? ניגודיות, מקלדת, מטרות מגע, RTL.
4. **Brand Review** — קול, microcopy, צבע וטיפוגרפיה לפי [Brand](brand-guidelines.md)?
5. **Consistency Review** — משתמש בטוקנים ורכיבי הספרייה? אפס hex/גודל/רכיב מקומי חדש?

רק לאחר חמשתם → מימוש.

## חוקי ברזל

- **טוקנים בלבד.** `grep` חדש ל-`#` hex בקוד מסך = דגל אדום. מייבאים מ-`@/design`.
- **רכיבי ספרייה בלבד.** אסור כפתור/קלט/מודאל/באדג' מקומי חדש. אם חסר רכיב — מוסיפים ל-`@/components/ui` (אחרי Stitch), לא מקומית.
- **לא משכפלים פלטה.** אסור `const C = {…}` חדש. (החוב הקיים: 27 כאלה — מהוגרים ב-Waves.)
- **Zero Downtime.** UX/UI בלבד; אין נגיעה ב-Logic/DB/API/Routes/Auth. ([migration](migration-plan.md))

## הגדרת "Done" לרכיב/מסך

- [ ] עבר 5 Reviews
- [ ] `npx tsc --noEmit` נקי
- [ ] טוקנים בלבד, רכיבי ספרייה בלבד
- [ ] 4 מצבים (Loading/Empty/Error/Success)
- [ ] QA: Desktop + iPhone + Android + RTL + Keyboard
- [ ] Backward compatible — לא שובר מסך/לקוח קיים

## הוספת רכיב חדש לספרייה

1. ודא שאין רכיב קיים שמכסה את הצורך.
2. עיצוב ב-Stitch (אם ויזואלי).
3. מימוש token-driven + RTL + a11y ב-`src/components/ui`, ייצוא ב-`index.ts`.
4. תיעוד ב-`component-library.md`.

## בעלות

עיצוב: Stitch (+ אישור דביר). מימוש ותחזוקת התשתית: Claude. אישור סופי לכל Wave: דביר.
