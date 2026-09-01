import test from "node:test";
import assert from "node:assert/strict";
import { bareCount, changeIntent } from "./guest-count.ts";

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

/* ── a sentence that asks for the change in words ─────────────────────── */

test("the sentence that waited nine and a half hours is heard", () => {
  /* דליה ואלי רוזנברג, 01/09 05:34. She wrote this, nothing happened, and she
     tried again at 15:07 with a bare "5" — which is what finally worked. */
  assert.equal(changeIntent("אשמח לשנות את המספר ל- 5 שמגיעים"), 5);
  assert.equal(changeIntent("אפשר לעדכן ל-3?"), 3);
  assert.equal(changeIntent("תוסיף עוד 1 בבקשה"), 1);
  assert.equal(changeIntent("במקום 2 נהיה 4"), null);   // two numbers, refused
});

test("a negated sentence is not a request for the number it negates", () => {
  /* Both of these are real. Reading them as 5 confirms back the exact number
     the guest was objecting to. */
  assert.equal(changeIntent("אבל לא צריך חמש מנות."), null);
  assert.equal(changeIntent("לא צריך לעדכן ל-5"), null);
  assert.equal(changeIntent("בלי להוסיף 2"), null);
  assert.equal(changeIntent("אל תעדכן ל-3"), null);
});

test("a sentence with no change verb is left to bareCount", () => {
  /* A blessing, a lift request, a number inside an address. */
  assert.equal(changeIntent("המון מזל טוב לזוג הצעיר"), null);
  assert.equal(changeIntent("אשמח לטרמפ מאזור רחובות. מקום 1."), null);
  assert.equal(changeIntent("5"), null);
});

test("a number outside a plausible headcount is refused", () => {
  assert.equal(changeIntent("לעדכן ל-40"), null);
  assert.equal(changeIntent("לעדכן ל-0"), null);
});
