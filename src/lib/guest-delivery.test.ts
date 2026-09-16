import test from "node:test";
import assert from "node:assert/strict";
import { coupleDelivery, inProgressLine } from "./guest-delivery.ts";

test("only a number with no WhatsApp is the couple's to answer", () => {
  /* The one failure where a different phone number is a real fix, and the one
     thing only they know. */
  assert.equal(coupleDelivery(131026), "needs_number");
});

test("Meta's own failures are ours, never theirs", () => {
  /* 131049 is the per-recipient quota and retries itself; 130472 is an
     experiment group; 131053 is a media error; 131047 is a closed window.
     Not one of them is fixed by the couple finding another number, and שלמה
     was handed sixteen of these and wrote back asking who we meant. */
  for (const code of [131049, 130472, 131053, 131047, 131048]) {
    assert.equal(coupleDelivery(code), "in_progress", `code ${code}`);
  }
});

test("someone who asked to stop is never shown to the couple as a task", () => {
  /* A second number for a guest who opted out routes around a stop request.
     Its own bucket precisely so it cannot be counted into the "give us another
     number" list by a later edit. */
  assert.equal(coupleDelivery(131050), "stopped");
});

test("a guest who was reached is fine, whatever failed earlier", () => {
  /* Failed at 06:00, delivered at 13:00. Judged on arrival, not on history. */
  assert.equal(coupleDelivery(131026, true), "ok");
  assert.equal(coupleDelivery(131049, true), "ok");
});

test("no error means nothing to report", () => {
  assert.equal(coupleDelivery(null), "ok");
  assert.equal(coupleDelivery(undefined), "ok");
});

test("the in-progress line is a sentence, and disappears at zero", () => {
  assert.equal(inProgressLine(0), null);
  assert.equal(inProgressLine(-3), null);
  assert.match(inProgressLine(1)!, /לא צריך אתכם/);
  assert.match(inProgressLine(16)!, /^16 מוזמנים/);
});
