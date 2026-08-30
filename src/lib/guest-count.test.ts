import test from "node:test";
import assert from "node:assert/strict";
import { bareCount } from "./guest-count.ts";

/* Every string below is one this system actually received. The corpus is 306
   inbound messages across four weddings, replayed on 31/08. */

test("a guest who already answered and writes only a number is heard", () => {
  /* משה כץ was recorded as 1 on 20/08 and sent "2" on 27/08 — doing exactly
     what the confirmation message told him to do. It was dropped in silence. */
  for (const [raw, n] of [["2", 2], ["1 :)", 1], ["2❤️", 2], [" 4 ", 4]] as const) {
    assert.equal(bareCount(raw), n, `נכשל על ${JSON.stringify(raw)}`);
  }
});

test("a blessing is not a headcount", () => {
  /* parseGuestCount reads 2 out of both of these, because "זוג" is in its
     word list. Nobody asked these guests anything — they wrote to congratulate
     the couple, and answering them with "רשום אצלנו 2" is a non sequitur. */
  assert.equal(bareCount("המון מזל טוב לזוג הצעיר ול הורים !"), null);
  assert.equal(bareCount("מרגש! שקם בית נוסף במישפחתנו המורחבת"), null);
});

test("a negation is not read as the number it negates", () => {
  /* אילת ונתן, 20/08. They had just been recorded as 5 and wrote to say that
     was too many. Reading these as "5" confirms back the very number they were
     objecting to. */
  assert.equal(bareCount("אבל לא צריך חמש מנות."), null);
  assert.equal(bareCount("וגם לא חמישה מקומות"), null);
});

test("a sentence that merely contains a digit is not an answer", () => {
  assert.equal(bareCount("אשמח לטרמפ מאזור רחובות. מקום 1."), null);
  assert.equal(bareCount("2 מנות. 4 מקומות"), null);   // two numbers, two meanings
  assert.equal(bareCount("שיגעתם בהודעותתתת"), null);
});

test("a number outside any plausible headcount is refused", () => {
  /* יוחאי גאון typed 40 straight after complaining about the messages. */
  assert.equal(bareCount("40"), null);
  assert.equal(bareCount("0"), null);
  assert.equal(bareCount(""), null);
});
