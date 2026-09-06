import test from "node:test";
import assert from "node:assert/strict";
import { dayMessageChoice, sendsDayBefore, sendsDayOf, DEFAULT_DAY_MESSAGE } from "./day-message.ts";

test("ברירת המחדל היא ההתנהגות הקיימת — ערב לפני", () => {
  assert.equal(DEFAULT_DAY_MESSAGE, "before");
  assert.equal(dayMessageChoice(null), "before");
  assert.equal(dayMessageChoice(undefined), "before");
  assert.equal(dayMessageChoice(""), "before");
});

test("בחירה מפורשת בבוקר החתונה", () => {
  assert.equal(dayMessageChoice("day_of"), "day_of");
  assert.equal(dayMessageChoice(" DAY_OF "), "day_of");
});

/* The whole point: exactly one of them, never both, never neither. */
test("תמיד בדיוק אחת מהשתיים", () => {
  for (const raw of [null, "", "before", "day_of", "  ", "בוקר", 7, {}]) {
    const both = sendsDayBefore(raw) && sendsDayOf(raw);
    const neither = !sendsDayBefore(raw) && !sendsDayOf(raw);
    assert.ok(!both, `שתיהן יצאו עבור ${JSON.stringify(raw)}`);
    assert.ok(!neither, `אף אחת לא יצאה עבור ${JSON.stringify(raw)}`);
  }
});

/* A column that does not exist yet reads as undefined, and a wedding whose
   couple was never asked must still be told about their own wedding. */
test("ערך לא מוכר או עמודה חסרה — לא משתיקים חתונה", () => {
  assert.equal(sendsDayBefore(undefined), true);
  assert.equal(sendsDayBefore("something_new"), true);
});
