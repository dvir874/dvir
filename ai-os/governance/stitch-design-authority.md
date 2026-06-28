# Stitch Design Authority Policy
## רגע לפני AI Company OS — Permanent Governance Rule
## Issued by CEO | 2026-06-26 | IMMUTABLE

---

> "Stitch הוא הסמכות העליונה לעיצוב. Claude הוא הסמכות העליונה להנדסה."

---

## The Golden Rule

**Claude אינו מעצב. Claude הוא Lead Engineer.**

**Stitch הוא Lead Product Designer.**

אסור ל-Claude:
- ❌ להמציא עיצוב חדש
- ❌ ליצור Layout חדש
- ❌ ליצור Dashboard חדש
- ❌ ליצור Wizard חדש
- ❌ ליצור Navigation חדש
- ❌ ליצור כל UI חדש

**אלא אם** הוא מבוסס על עיצוב שאושר על ידי Stitch.

---

## מתי חובה להשתמש ב-Stitch

כל שינוי הכולל אחד מהבאים:

```
מסך חדש                  Landing Page
Dashboard                 Wizard
Flow חדש                  Navigation
Sidebar                   Header
Footer                    Dialog
Bottom Sheet              Card חדש
Form חדש                  Gallery
Timeline                  Empty State
Success State             Error State
Mobile Screen             Responsive Layout
Component משמעותי         Design System
כל שינוי חזותי מהותי
```

**חייב לעבור קודם דרך Stitch. ללא יוצא מן הכלל.**

---

## אם Stitch זמין

```
1. Claude ישתמש ב-Stitch
2. יקבל את העיצוב
3. יבצע Design Review (brand / mobile / RTL / accessibility)
4. לאחר אישור CEO → ימש Pixel Accurate
```

---

## אם Stitch אינו זמין

Claude **אינו רשאי לאלתר עיצוב.**

במקום זאת, Claude חייב להכין Stitch Prompt מקצועי הכולל:

```
1.  מטרת המסך
2.  קהל היעד
3.  הבעיה שהמסך פותר
4.  User Flow מלא
5.  כל הרכיבים הנדרשים
6.  מידע עסקי רלוונטי
7.  Design Constraints
8.  Brand Guidelines (צבעים, פונטים, spacing)
9.  Mobile First / Desktop First
10. RTL
11. Accessibility
12. Interaction States
13. Empty States
14. Success States
15. Error States
16. Design References
17. מטרות UX
18. חוויית המשתמש הרצויה
19. רגשות שהמסך צריך להעביר
20. הוראות להשתמש ב-Product Design Foundation
```

---

## לאחר קבלת עיצוב מ-Stitch

Claude חייב לבצע Design Review לפני מימוש:

```
[ ] תואם ל-Design Foundation (colors, fonts, spacing)?
[ ] Mobile First?
[ ] RTL מלא?
[ ] כל מצבי ה-State מכוסים (empty/loading/success/error)?
[ ] Accessibility (touch targets ≥ 44px, contrast)?
[ ] תואם ל-Brand Voice?
```

אם עיצוב עובר Review → Implementation Plan → Pixel Accurate implementation.

אם עיצוב נכשל → Explain problem → Improved Stitch Prompt → New design.

---

## Pixel Accuracy

מטרת Claude אינה לעצב. מטרתו לשחזר:

```
Layout ✓    Typography ✓    Colors ✓
Spacing ✓   Icons ✓         Components ✓
Motion ✓    Hierarchy ✓     White Space ✓
Responsive Behavior ✓
```

**אין שינויים יצירתיים ללא הצדקה ברורה לכל Agent שצופה.**

---

## Design Governance

אם Claude מזהה בעיה בעיצוב Stitch:

```
❌ אסור לשנות לבד
✅ עליו:
   1. להסביר מה הבעיה ולמה
   2. להכין Prompt משופר ל-Stitch
   3. להמתין לעיצוב חדש
   4. לדווח ל-CoS
```

---

## Enforcement

**כל Agent שמממש UI חדש ללא עיצוב Stitch מאושר — מפר AI Law #4.**

```
AI Law #4: No significant UI change without Stitch design approval.
```

CoS מפקח. Autonomous Governance בודק שבועית.

---

## Summary

```
BEFORE CODE:   Stitch designs
AFTER STITCH:  Review (brand + mobile + RTL + a11y)
AFTER REVIEW:  CEO approval
AFTER CEO:     Claude implements Pixel Accurate
NEVER:         Claude invents design
```

---

*Policy issued by CEO | 2026-06-26 | Immutable*
