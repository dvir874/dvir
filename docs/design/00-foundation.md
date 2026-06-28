# רגע לפני · Product Design Foundation

> מקור-האמת העיצובי של כל המוצר. כל מסך, כל Feature, כל עיצוב חדש — נבנה אך ורק על התשתית הזו.
> נבנה ב-Wave 0. **שכבה additive בלבד** — לא משנה אף מסך קיים; מסכים מהגרים אליה גל-אחר-גל.

## מה זה כולל (12 Deliverables)

| # | Deliverable | איפה |
|---|-------------|------|
| 1 | **Design Tokens** | [`src/design/tokens.ts`](../../src/design/tokens.ts) · רפרנס: [`design-tokens.md`](design-tokens.md) |
| 2 | **Component Library** | [`src/components/ui/`](../../src/components/ui) · רפרנס: [`component-library.md`](component-library.md) |
| 3 | **Brand Guidelines** | [`brand-guidelines.md`](brand-guidelines.md) |
| 4 | **Experience Principles** | [`experience-principles.md`](experience-principles.md) |
| 5 | **Motion System** | [`motion-system.md`](motion-system.md) |
| 6 | **Iconography** | [`iconography.md`](iconography.md) |
| 7 | **Accessibility Guide** | [`accessibility.md`](accessibility.md) |
| 8 | **Mobile-First Guide** | [`mobile-first.md`](mobile-first.md) |
| 9 | **Desktop Guide** | [`desktop.md`](desktop.md) |
| 10 | **Stitch Guidelines** | [`stitch-guidelines.md`](stitch-guidelines.md) |
| 11 | **Design Governance** | [`governance.md`](governance.md) |
| 12 | **Migration Plan** | [`migration-plan.md`](migration-plan.md) |

## כללי הזהב

1. **טוקן אחד, מקור אחד.** אסור לכתוב hex/גודל/צל בתוך מסך. מייבאים מ-`@/design`.
2. **רכיב אחד, הגדרה אחת.** אסור לבנות כפתור/קלט/מודאל מקומי. משתמשים ב-`@/components/ui`.
3. **Stitch מעצב, Claude מיישם.** עיצוב חדש → Stitch → מימוש pixel-accurate. ([governance](governance.md))
4. **אזור הזוג Mobile First. אזור האדמין Desktop First** — שניהם Responsive מעולה.
5. **Zero Downtime.** שינויי UX/UI בלבד. אין נגיעה ב-Logic / DB / API / Routes / Auth.

## עקרון העיצוב הויזואלי

High-End Editorial · Minimalist with Tactile Accents · יוקרה רגועה.
לבן-שמנת נדיב (whitespace), טיפוגרפיה סריפית מעודנת, זהב וזית כמבטאים בלבד.
פחות "גיליון אקסל", יותר "שירות קונסיירז' של מותג יוקרה".

— הבסיס שעליו ייבנו Waves 1–6.
