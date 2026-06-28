# Accessibility Standards

נגישות אינה תוספת — היא חלק מ-"איכות". כל מסך עובר Accessibility Review לפני מימוש. ([governance](governance.md))

## Contrast

- טקסט גוף על רקע: יחס ≥ **4.5:1**. טקסט גדול (≥24px/בולד 19px): ≥ **3:1**.
- `ink #1C1008` על `ivory/cream/white` — עובר בגדול. ⚠️ זהב `#C5A46D` על לבן **לא** עובר לטקסט גוף — להשתמש ב-`primary-deep #A07840` או כהה יותר לטקסט; הזהב הבהיר נשמר לרקעים/מבטאים.
- מצב (success/warning/danger) לעולם לא מועבר בצבע בלבד — תמיד גם אייקון/טקסט.

## Keyboard Navigation

- כל אינטראקטיבי נגיש ב-Tab, בסדר לוגי.
- Enter/Space מפעילים כפתורים; Escape סוגר Dialog/Sheet (ממומש ב-`Overlay`).
- אסור `tabindex` חיובי. אסור "מלכודות פוקוס" מחוץ למודאל.

## Focus States

- Focus ring גלוי תמיד: `0 0 0 3px rgba(197,164,109,0.55)` (טוקן `shadow.focus`).
- לעולם לא `outline: none` בלי חלופה גלויה.

## Touch Targets

- מינימום **44×44px** לכל אלמנט אינטראקטיבי (טוקן `tapTarget.min`). חובה מוחלטת באזורי הזוג/אורח.
- מרווח ≥ 8px בין מטרות מגע סמוכות.

## Screen Readers

- כל כפתור אייקון-בלבד חייב `aria-label` (אכוף ב-`IconButton`).
- מודאלים: `role="dialog"`, `aria-modal`, `aria-label`.
- מצבים חיים: Toast = `aria-live="polite"`; שגיאות = `role="alert"`.
- תמונות תוכן עם `alt`; דקורטיביות עם `alt=""`/`aria-hidden`.

## RTL

- כל הפריסות זורמות ימין→שמאל. שימוש ב-`inset-inline-start/end`, `padding-inline`, `margin-inline` — לא left/right קשיח.
- אייקוני כיוון ממורכזים ([iconography](iconography.md)).

## Responsive & Mobile

- ללא גלילה אופקית בשום breakpoint.
- טקסט מתכווץ בחן; ללא חיתוך/חפיפה ב-360px.
- `prefers-reduced-motion` מכובד ([motion](motion-system.md)).

## צ'קליסט מהיר (לכל מסך)

- [ ] ניווט מקלדת מלא + focus ring גלוי
- [ ] ניגודיות עוברת AA
- [ ] מטרות מגע ≥ 44px (מובייל)
- [ ] aria-label לכל אייקון-בלבד
- [ ] מצב לא מועבר בצבע בלבד
- [ ] RTL תקין, אין גלילה אופקית
