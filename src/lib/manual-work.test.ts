import test from "node:test";
import assert from "node:assert/strict";
import { classifyManualWork, manualWorkMessage, WORK_TEXT, type WorkGuest, type LastContact } from "./manual-work.ts";

const g = (id: string, o: Partial<WorkGuest> = {}): WorkGuest =>
  ({ id, name: id, phone: "0501234567", status: "pending", category: "general", do_not_contact: false, ...o });

const c = (o: Partial<LastContact> = {}): LastContact =>
  ({ lastOutAt: "2026-09-03T10:00:00Z", lastCode: null, arrived: false, lastInAt: null, ...o });

test("a guest who wrote and got nothing back comes first", () => {
  /* נעם חדד asked for a human at 14:58 and the thread never showed in
     "ממתין לך". Someone waiting right now outranks a wrong number. */
  const items = classifyManualWork(
    [g("שאלה"), g("מנותק")],
    new Map([
      ["שאלה", c({ lastInAt: "2026-09-03T14:58:00Z", lastOutAt: "2026-09-03T10:00:00Z" })],
      ["מנותק", c({ lastCode: 131026 })],
    ]));
  assert.equal(items[0].kind, "waiting_reply");
  assert.equal(items[0].name, "שאלה");
});

test("a guest who already answered can still be waiting for a reply", () => {
  /* The question does not stop mattering because the RSVP is in. */
  const items = classifyManualWork(
    [g("אישר", { status: "confirmed" })],
    new Map([["אישר", c({ lastInAt: "2026-09-03T15:00:00Z", lastOutAt: "2026-09-03T10:00:00Z" })]]));
  assert.equal(items.length, 1);
  assert.equal(items[0].kind, "waiting_reply");
});

test("each Meta failure a person can act on is named", () => {
  const items = classifyManualWork(
    [g("הפסיקו"), g("איןוואטסאפ"), g("חסום")],
    new Map([
      ["הפסיקו", c({ lastCode: 131050 })],
      ["איןוואטסאפ", c({ lastCode: 131026 })],
      ["חסום", c({ lastCode: 130472 })],
    ]));
  assert.deepEqual(items.map(x => x.kind), ["opted_out", "no_whatsapp", "template_blocked"]);
});

test("the failures that retry themselves are never listed", () => {
  /* 131049 comes back tomorrow on its own. A list containing things nobody has
     to do is a list nobody reads. */
  const items = classifyManualWork(
    [g("מכסה"), g("תקלה")],
    new Map([["מכסה", c({ lastCode: 131049 })], ["תקלה", c({ lastCode: 500 })]]));
  assert.deepEqual(items, []);
});

test("a guest nothing was ever sent to is the most serious and the quietest", () => {
  /* Nothing failed, so nothing reported it. אשר כהן and חיים כצמן sat like
     this at שחר's wedding. */
  const items = classifyManualWork([g("איש")], new Map());
  assert.equal(items[0].kind, "never_sent");
});

test("a guest the message reached is not work", () => {
  const items = classifyManualWork([g("קיבל")], new Map([["קיבל", c({ arrived: true })]]));
  assert.deepEqual(items, []);
});

test("demo guests, silenced guests and guests with no number are not work", () => {
  const items = classifyManualWork([
    g("דמו", { category: "demo" }),
    g("שקט", { do_not_contact: true }),
    g("בלימספר", { phone: "" }),
  ], new Map());
  assert.deepEqual(items, []);
});

test("the message carries names and numbers, not counts", () => {
  /* "2 מטא חוסמת" sends him to the admin to find out who. */
  const items = classifyManualWork(
    [g("דנה כהן", { phone: "0501111111" }), g("רון לוי", { phone: "0502222222" })],
    new Map([["דנה כהן", c({ lastCode: 131026 })], ["רון לוי", c({ lastCode: 131026 })]]));
  const m = manualWorkMessage("שחר ואורי", 5, items)!;
  assert.ok(m.includes("דנה כהן 0501111111"), m);
  assert.ok(m.includes("רון לוי 0502222222"), m);
  assert.ok(m.includes("בעוד 5 ימים"), m);
  assert.ok(m.includes(WORK_TEXT.no_whatsapp), m);
  /* Never a newline — one in a Meta parameter fails the whole send. */
  assert.equal(/[\n\t]/.test(m), false);
});

test("a long list is capped and says how many it did not name", () => {
  const many = Array.from({ length: 20 }, (_, i) => g(`אורח${i}`));
  const items = classifyManualWork(many, new Map());
  const m = manualWorkMessage("תהל ואביב", 19, items)!;
  assert.ok(m.includes("ועוד 14"), m);
});

test("nothing to do produces no message at all", () => {
  assert.equal(manualWorkMessage("שחר", 5, []), null);
});
