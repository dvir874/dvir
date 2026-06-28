# Stitch Guidelines · אינטגרציית Stitch

> **Stitch = Lead Product Designer. Claude = Lead Engineer.** מהרגע הזה, Stitch הוא מקור-האמת לכל עיצוב חדש.

## 🔒 Design Authority Policy (מחייב)

> **מקור-אמת קנוני:** [`ai-os/governance/stitch-design-authority.md`](../../ai-os/governance/stitch-design-authority.md) (IMMUTABLE) + [`CLAUDE.md`](../../CLAUDE.md) → "Stitch Design Authority — SUPREME DESIGN LAW". המסמך כאן הוא ההיבט ההנדסי-מימושי של אותה מדיניות.

**Stitch הוא הסמכות העליונה היחידה לכל החלטה עיצובית. Claude אינו מעצב — הוא Lead Engineer.**

**Golden Rule — אסור ל-Claude:** להמציא עיצוב · ליצור Layout/Dashboard/Wizard/Navigation/Sidebar/Header/Footer/Dialog/Sheet/Card/Form/Gallery/Timeline/Empty·Success·Error State/Mobile screen/Responsive layout/Component משמעותי/Design System חדשים — **אלא אם מבוססים על עיצוב שאושר ע"י Stitch.**

**חובה לעבור דרך Stitch** כל שינוי חזותי מהותי (הרשימה למעלה + כל מסך/flow/קומפוננטה מרכזית).

- **Stitch זמין** → לקבל עיצוב → Design Review → אישור דביר → מימוש Pixel Accurate.
- **Stitch לא זמין** → **אסור לאלתר.** להכין Prompt מקצועי (20 נקודות, ראה למטה) ולהמתין לעיצוב מאושר.
- **עיצוב Stitch נראה בעייתי** → אסור לשנות לבד. להסביר מה/למה → להכין Prompt משופר → להמתין לעיצוב חדש.

**Pixel Accuracy:** מטרת Claude אינה "לעצב" אלא **לשחזר** את Stitch — Layout · Typography · Colors · Spacing · Icons · Components · Motion · Hierarchy · White Space · Responsive. אין שינויים יצירתיים ללא הצדקה הנדסית ברורה.

**Final Rule:** Stitch = סמכות עליונה לעיצוב. Claude = סמכות עליונה להנדסה. עובדים יחד, לעולם לא בנפרד.

## הזרימה (7 שלבים — ללא דילוג)

1. **Product Thinking** (Claude) — מה המשתמש באמת צריך? (Founder + PM + UX + Wedding Planner)
2. **UX Flow** (Claude) — מיפוי המסע: כניסה → פעולה ראשונה → השלמה. ספירת קליקים.
3. **Stitch Design** (Stitch) — Layout · היררכיה · מרווחים · טיפוגרפיה · Mobile UX. **בלי קוד.**
4. **Review** (דביר) — פרימיום? ברור? מינימלי? זורם? אם לא — איטרציה ב-Stitch.
5. **Implementation** (Claude) — שכפול **pixel-accurate** של העיצוב המאושר. לא "דומה" — מדויק.
6. **QA** (Claude) — Desktop / Tablet / iPhone / Android / RTL / Accessibility / Responsive.
7. **Production Review** (דביר) — Backward compatible? Mobile First? תחושת מוצר אחיד?

## חובה Stitch

מסכים חדשים · Dashboards · Landing · Couple/Guest experience · RSVP · Wizards · Navigation · Dialogs · Bottom Sheets · Empty/Success/Error States · Cards · Timelines · Galleries · Pricing · כל זרימת משתמש · כל קומפוננטה מרכזית.

## לא חובה Stitch

Backend · DB · API · Auth · Security · Business Logic · Bug Fixes · Refactoring · תיקוני CSS קטנים · שינויי מרווח/צבע זעירים · תחזוקה.

## אם Stitch אינו זמין — תבנית Prompt מקצועי (20 נקודות)

**אסור להמציא עיצוב גנרי.** לעצור, ולהכין עבור דביר Prompt ל-Stitch הכולל את **כל** 20 הנקודות:

1. **מטרת המסך** — מה הוא עושה.
2. **קהל היעד** — זוג / אורח / אדמין.
3. **הבעיה שהמסך פותר**.
4. **User Flow מלא** — כניסה → פעולה → השלמה (כולל ספירת קליקים).
5. **כל הרכיבים הנדרשים**.
6. **מידע עסקי רלוונטי** — נתונים אמיתיים שמוצגים.
7. **Design Constraints**.
8. **Brand Guidelines** — ([brand](brand-guidelines.md)).
9. **Mobile First / Desktop First** — לפי האזור.
10. **RTL** — עברית, זרימה ימין→שמאל.
11. **Accessibility** — ([accessibility](accessibility.md)).
12. **Interaction States** — hover/active/focus/disabled.
13. **Empty States**.
14. **Success States**.
15. **Error States**.
16. **Design References** — מסכים/מוצרים להשראה.
17. **מטרות UX** — ([experience-principles](experience-principles.md)).
18. **חוויית המשתמש הרצויה**.
19. **רגשות שהמסך צריך להעביר** — (רגוע / שולט / חוגג…).
20. **הוראה מפורשת:** להשתמש ב-Product Design Foundation — הטוקנים והרכיבים הקיימים ([design-tokens](design-tokens.md), [component-library](component-library.md)).

לאחר קבלת העיצוב מדביר: לנתח · לוודא התאמה ל-Foundation/Brand/Accessibility/Mobile · להכין Implementation Plan · לממש Pixel Accurate.

### פורמט תגובה חובה כש-Stitch MCP אינו זמין

**אסור** לומר רק "Stitch לא זמין". חובה להחזיר Prompt מוכן-להעתקה בפורמט הבא **בדיוק**:

```
❌ Stitch MCP אינו זמין כרגע.

כדי להמשיך, העתק את ה-Prompt הבא ל-Stitch.

[Prompt מלא — 20 הנקודות שלמעלה, מותאם למסך הספציפי]

לאחר שתקבל את העיצוב,
החזר אותו לכאן.

אני אמשיך אוטומטית משלב ה-Implementation.
```

הכלל: כשדביר מחזיר את תוצאת Stitch → להמשיך **אוטומטית** מ-Step 5 (Implementation) בלי לבקש אישור נוסף להתחיל, תוך מעבר ב-Design/Brand/A11y review של העיצוב שחזר.

## גזירת התשתית מ-Stitch

ה-Design Tokens והרכיבים ב-Wave 0 **נגזרו מ-`designMd` של Stitch** (פרויקט "Regal Wedding"). לכן מימוש רכיבי הספרייה נחשב "מימוש שפת Stitch", לא "עיצוב עצמאי".

## המרות בעת מימוש (סטיות מאושרות)

- אייקונים: Material Symbols (Stitch) → lucide המקביל ([iconography](iconography.md)).
- טוקני צבע של Stitch → טוקני המותג שלנו ב-`tokens.ts` (אותם ערכים, שמות סמנטיים).
- תוכן דמה (Lorem/שמות אקראיים) → דאטה אמיתי עם fallback חינני.

## Stitch MCP — כלים בשימוש

`list_projects`, `get_project`, `list_screens`, `get_screen` (לקבלת HTML+צילום), `generate_screen_from_text`, `create_design_system`. תמיד למשוך את ה-HTML **ואת** צילום המסך, ולממש לפי שניהם.
