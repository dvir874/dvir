import test from "node:test";
import assert from "node:assert/strict";
import { unreachableGuests, unreachableReport, askedOutcome, REASON_TEXT } from "./unreachable.ts";

const g = (id: string, o: Record<string, unknown> = {}) =>
  ({ id, name: "אורח " + id, phone: "05" + id.padStart(8, "0"), rsvp_token: "tok" + id, ...o });

/* The distinction that was got wrong on 07/09, and the reason this file exists.
   A wamid means Meta ACCEPTED the message. Meta accepts and then reports the
   delivery failure separately. Asking the easier question produced a message to
   a couple claiming all 195 of their guests had been reached, when 16 never
   were. */
test("התקבל אצל מטא זה לא הגיע לאורח", () => {
  const items = unreachableGuests([g("1")], new Map([["1", { reached: false, lastCode: 131026 }]]));
  assert.equal(items.length, 1);
  assert.equal(items[0].reason, "no_whatsapp");

  /* And a delivery report that says it arrived ends the matter. */
  assert.equal(unreachableGuests([g("1")],
    new Map([["1", { reached: true, lastCode: 131026 }]])).length, 0);
});

/* 131049 is the recipient's own daily cap and resolves by itself. Listing it
   is how six people Dvir must phone became sixteen he would learn to ignore. */
test("כישלון זמני לא נכנס לרשימה", () => {
  for (const code of [131049, 500, 131047, null]) {
    assert.equal(unreachableGuests([g("1")],
      new Map([["1", { reached: false, lastCode: code }]])).length, 0, `קוד ${code}`);
  }
});

test("שלוש הסיבות הקבועות, ממוינות לפי דחיפות", () => {
  const items = unreachableGuests(
    [g("1"), g("2"), g("3")],
    new Map([
      ["1", { reached: false, lastCode: 130472 }],
      ["2", { reached: false, lastCode: 131026 }],
      ["3", { reached: false, lastCode: 131050 }],
    ]));
  assert.deepEqual(items.map(i => i.reason), ["no_whatsapp", "opted_out", "experiment"]);
});

/* Untried is not unreachable — that guest belongs to the sender. */
test("אורח שמעולם לא נוסה אינו 'לא ניתן להשגה'", () => {
  assert.equal(unreachableGuests([g("1")], new Map()).length, 0);
});

test("דמו, בלי שם או בלי טלפון — לא נכנסים", () => {
  const d = new Map([["1", { reached: false, lastCode: 131026 }]]);
  assert.equal(unreachableGuests([g("1", { category: "demo" })], d).length, 0);
  assert.equal(unreachableGuests([g("1", { name: "  " })], d).length, 0);
  assert.equal(unreachableGuests([g("1", { phone: null })], d).length, 0);
});

/* שלמה was asked about 24 numbers on 04/09. Seventeen were fixed. Nobody was
   told — Dvir found it by hand three days later. */
test("סגירת הלולאה — כמה מהמספרים שביקשנו נפתרו", () => {
  const d = new Map([
    ["1", { reached: true }], ["2", { reached: true }],
    ["3", { reached: false, lastCode: 131026 }],
  ]);
  assert.deepEqual(askedOutcome(["1", "2", "3"], d),
    { asked: 3, resolved: 2, stillStuck: ["3"] });
});

test("לא ביקשנו כלום — אין מה לסגור", () => {
  assert.deepEqual(askedOutcome(null, new Map()), { asked: 0, resolved: 0, stillStuck: [] });
});

test("הדוח נותן שורה לאדם וקישור לשורה, ואומר מה לעשות", () => {
  const items = unreachableGuests([g("1")], new Map([["1", { reached: false, lastCode: 131026 }]]));
  const msg = unreachableReport("אבישג ושלמה", items, "https://x.app", { asked: 24, resolved: 17 });
  assert.ok(msg);
  const lines = msg.split("\n");
  assert.ok(lines.includes("https://x.app/s/tok1"), "הקישור על שורה משלו");
  assert.ok(msg.includes(REASON_TEXT.no_whatsapp));
  assert.ok(msg.includes("צריך מספר אחר"), "אומר מה לעשות, לא רק מה קרה");
  assert.ok(msg.includes("17 כבר נפתרו"), "סוגר את הלולאה");
});

test("אין מספרים תקועים — לא נשלחת הודעה", () => {
  assert.equal(unreachableReport("אבישג ושלמה", [], "https://x.app"), null);
});
