import test from "node:test";
import assert from "node:assert/strict";
import { coupleName, looksLikeCouple } from "./couple-name.ts";

test("the event title is not the couple's names", () => {
  /* The bug this file exists for. "בעזרת ה׳ *{{1}}* מתחתנים" with the title
     gives "בעזרת ה׳ חתונת אורי ושחר מתחתנים", to 327 of her guests. */
  assert.equal(coupleName({ name: "חתונת אורי ושחר" }), "אורי ושחר");
  assert.equal(coupleName({ name: "החתונה של תהל ואביב" }), "תהל ואביב");
  assert.equal(coupleName({ name: "מירב ודביר" }), "מירב ודביר", "no prefix, unchanged");
});

test("couple_names wins and nothing guesses over it", () => {
  assert.equal(
    coupleName({ name: "חתונת אורי ושחר", couple_names: "אורי דנן ושחר לוי" }),
    "אורי דנן ושחר לוי",
  );
  assert.equal(coupleName({ name: "חתונת אורי ושחר", couple_names: "   " }), "אורי ושחר",
    "blank is not an answer");
});

test("a title the stripper does not recognise is caught, not sent", () => {
  /* looksLikeCouple is the last thing between a missed prefix and
     "בעזרת ה׳ האירוע הגדול מתחתנים". */
  assert.ok(looksLikeCouple("אורי ושחר"));
  assert.ok(looksLikeCouple("דביר בן ברוך ומירב ברון"));
  assert.ok(!looksLikeCouple("האירוע הגדול"), "no ו — refuse and make someone fill the field");
  assert.ok(!looksLikeCouple(""));
  assert.ok(!looksLikeCouple(null));
});

test("nothing in, nothing out", () => {
  assert.equal(coupleName(null), null);
  assert.equal(coupleName({ name: "" }), null);
  assert.equal(coupleName({ name: "חתונת " }), null, "a bare prefix is not a couple");
});
