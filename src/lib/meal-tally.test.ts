import test from "node:test";
import assert from "node:assert/strict";
import { mealTally, mealTotal } from "./meal-tally.ts";

test("סופרים אנשים, לא רשומות", () => {
  /* "משפחת ביטון" היא שורה אחת ועשר מנות. ספירה לפי שורות מזמינה לחתונה
     פחות מנות בדיוק בגודל המשפחות שבה. */
  const t = mealTally([
    { guest_count: 10, meal_preference: "regular" },
    { guest_count: 2, meal_preference: "vegetarian" },
  ]);
  assert.equal(t.regular, 10);
  assert.equal(t.vegetarian, 2);
  assert.equal(mealTotal(t), 12);
});

test("מי שפירט מנות בעצמו — הפירוט שלו הוא האמת", () => {
  const t = mealTally([
    { guest_count: 5, meal_counts: { regular: 2, kids: 3 } },
  ]);
  assert.equal(t.regular, 2);
  assert.equal(t.kids, 3);
  assert.equal(t.unknown, 0);
  assert.equal(mealTotal(t), 5);
});

test("פירוט חלקי — היתרה הולכת להעדפה, לא לעיגול כלפי מעלה", () => {
  /* שלושה מתוך חמישה בחרו. עיגול ל"חמישה צמחוניים" הוא שתי מנות שאיש לא אוכל. */
  const t = mealTally([
    { guest_count: 5, meal_preference: "vegetarian", meal_counts: { kids: 3 } },
  ]);
  assert.equal(t.kids, 3);
  assert.equal(t.vegetarian, 2);
  assert.equal(mealTotal(t), 5);
});

test("פירוט חלקי בלי העדפה — היתרה היא רשימה לרדוף אחריה", () => {
  const t = mealTally([{ guest_count: 4, meal_counts: { kids: 1 } }]);
  assert.equal(t.kids, 1);
  assert.equal(t.unknown, 3);
});

test("מי שלא בחר כלום נספר ב-unknown ולא נעלם", () => {
  const t = mealTally([{ guest_count: 3 }, { guest_count: 2, meal_preference: "" }]);
  assert.equal(t.unknown, 5);
  assert.equal(mealTotal(t), 5);
});

test("העדפה שאינה מוכרת אינה ממציאה קטגוריה", () => {
  const t = mealTally([{ guest_count: 2, meal_preference: "גלוטן" }]);
  assert.equal(t.unknown, 2);
  assert.equal(mealTotal(t), 2);
});

test("פירוט גדול מהכמות — הבחירה של האורח עומדת, ואין מה להוסיף", () => {
  /* אורח שעדכן את הכמות כלפי מטה אחרי שבחר מנות. */
  const t = mealTally([
    { guest_count: 2, meal_preference: "regular", meal_counts: { vegan: 4 } },
  ]);
  assert.equal(t.vegan, 4);
  assert.equal(t.regular, 0);
  assert.equal(t.unknown, 0);
});

test("כמות חסרה או שבורה היא איש אחד, כי הוא אישר הגעה", () => {
  assert.equal(mealTotal(mealTally([{ meal_preference: "regular" }])), 1);
  assert.equal(mealTotal(mealTally([{ guest_count: 0 }])), 1);
  assert.equal(mealTotal(mealTally([{ guest_count: -3 }])), 1);
  assert.equal(mealTotal(mealTally([{ guest_count: 2.7, meal_preference: "kids" }])), 2);
});

test("ערכים זרים ב-meal_counts לא מזייפים מנות", () => {
  const t = mealTally([
    { guest_count: 3, meal_preference: "regular",
      meal_counts: { kids: "2", vegan: null, שטות: 9 } as unknown },
  ]);
  assert.equal(t.kids, 2, "מחרוזת מספרית עדיין מספר");
  assert.equal(t.vegan, 0);
  assert.equal(t.regular, 1);
  assert.equal(mealTotal(t), 3, "סך הכול נשאר מספר האנשים");
});

test("meal_counts שאינו אובייקט לא מפיל את הספירה", () => {
  for (const bad of [null, "regular", 4, [1, 2], undefined]) {
    const t = mealTally([{ guest_count: 2, meal_preference: "kids", meal_counts: bad }]);
    assert.equal(t.kids, 2, String(bad));
  }
});

test("רשימה ריקה היא אפס, ולא שגיאה", () => {
  assert.equal(mealTotal(mealTally([])), 0);
});
