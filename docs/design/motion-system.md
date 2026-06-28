# Motion System · שפת אנימציות

> יוקרתי · רגוע · אלגנטי. אנימציה מבהירה ומלטפת — לעולם לא מסיחה. אם שמים לב לאנימציה עצמה, היא מוגזמת.
> מקור הערכים: [`tokens.ts`](../../src/design/tokens.ts) (`duration`, `easing`).

## Durations

| טוקן | ערך | שימוש |
|------|-----|-------|
| `instant` | 80ms | משוב מיידי (active press) |
| `fast` | 150ms | hover, צבע, focus ring |
| `base` | 240ms | רוב מעברי ה-UI, dialogs |
| `slow` | 360ms | progress fills, פתיחת אקורדיון |
| `slower` | 560ms | page / sheet transitions |

## Easing

| טוקן | עקומה | שימוש |
|------|-------|-------|
| `standard` | `0.4, 0, 0.2, 1` | ברירת מחדל — hover, מעברים |
| `out` | `0, 0, 0.2, 1` | כניסה (האטה, "מתיישב") — dialogs, sheets |
| `in` | `0.4, 0, 1, 1` | יציאה (האצה) |
| `spring` | `0.34, 1.56, 0.64, 1` | רגעי delight בלבד — toast, success |

## מתכונים מאושרים

- **Hover (card):** `translateY(-4px)` + `shadow.card → shadow.raised`, `base/standard`.
- **Button press:** `scale(0.97)`, `instant`.
- **Dialog enter:** `rlScaleIn` (opacity 0→1, scale .96→1), `base/out`.
- **Bottom sheet enter:** `rlSlideUp` (translateY 16px→0), `slow/out`.
- **Toast enter:** `rlToastIn` עם `spring`.
- **Progress fill:** width transition, `slow/out`.
- **Page transition:** fade + 8px rise, `slower/out`.

## איסורים

- ❌ Bounce על אלמנטים יומיומיים (רק delight).
- ❌ אנימציות > 600ms על אינטראקציה (מרגיש איטי).
- ❌ פרלקס כבד, סיבובים, הבהובים.
- ❌ קונפטי על כל קליק — שמור לרגע שיא אמיתי (RSVP הושלם, חתונה נסגרה).

## Accessibility

חובה לכבד `prefers-reduced-motion: reduce` → לבטל translate/scale, להשאיר fade עדין בלבד.
