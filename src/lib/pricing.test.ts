import test from "node:test";
import assert from "node:assert/strict";
import {
  quoteFor, costFor, PER_RECORD_BASIC, PER_RECORD_FULL,
  MIN_CHARGE_BASIC, MIN_CHARGE_FULL, SILENT_SHARE,
  recordsFromGuests,
} from "./pricing.ts";

/* The rates are measured, not chosen — see the comment in pricing.ts. These
   lock the arithmetic that turns them into a number said out loud on a call. */

test("a record is the unit, not a guest", () => {
  /* One phone number carrying a family of six is one record. That is what the
     sender spends, what Meta's daily ceiling counts, and what is billed. */
  assert.equal(quoteFor(400, "basic").total, 400);
  assert.equal(quoteFor(400, "full").total, 800);
});

test("the minimum protects a small wedding, and says so", () => {
  /* Setup costs the same at 90 records as at 250. */
  const small = quoteFor(90, "basic");
  assert.equal(small.total, MIN_CHARGE_BASIC);
  assert.equal(small.atMinimum, true);

  const big = quoteFor(500, "basic");
  assert.equal(big.total, 500);
  assert.equal(big.atMinimum, false);
});

test("the minimum applies per package, not once", () => {
  assert.equal(quoteFor(100, "full").total, MIN_CHARGE_FULL);
  assert.equal(quoteFor(300, "full").total, 300 * PER_RECORD_FULL);
});

test("the rides group is priced on top and has its own floor", () => {
  const q = quoteFor(400, "basic", true);
  assert.deepEqual(q.lines.map(l => l.amount), [400, 200]);
  assert.equal(q.total, 600);

  /* 100 records × 0.5 is 50, below the floor. */
  assert.equal(quoteFor(100, "basic", true).lines[1].amount, 100);
});

test("the full package states how many calls it is buying", () => {
  /* 33% of 922 real records were still silent after every reminder. Selling
     the package without that number is selling an unknown number of evenings. */
  assert.equal(quoteFor(250, "full").calls, Math.round(250 * SILENT_SHARE));
  assert.equal(quoteFor(600, "full").calls, 198);
  assert.equal(quoteFor(250, "basic").calls, 0);
});

test("every quote clears its own cost", () => {
  /* The cheapest possible sale — the minimum, on the largest list that still
     falls under it — must still be worth doing. */
  for (const n of [90, 200, 250, 400, 600]) {
    for (const rides of [false, true]) {
      const q = quoteFor(n, "basic", rides);
      assert.ok(q.total > costFor(n, rides) * 3, `${n} records, rides=${rides}`);
    }
  }
});

test("nonsense input does not produce a nonsense price", () => {
  assert.equal(quoteFor(0, "basic").total, MIN_CHARGE_BASIC);
  assert.equal(quoteFor(-50, "basic").total, MIN_CHARGE_BASIC);
  assert.equal(quoteFor(NaN, "basic").total, MIN_CHARGE_BASIC);
  assert.equal(PER_RECORD_BASIC * 250, 250);
});

/* ── quoting from a guest count ───────────────────────────────────────────── */

test("a guest count is converted to records before it is priced", () => {
  /* The mistake this exists to stop: אמיר said "430 מוזמנים" and was quoted
     420 ₪, the price of 430 records — an 800-person wedding. */
  const records = recordsFromGuests(430);
  assert.ok(records > 200 && records < 260, `${records} records for 430 people`);
  assert.equal(quoteFor(records, "basic", false).total, 290);
});

test("the floor covers every wedding until about six hundred people", () => {
  /* Worth knowing before negotiating: below this, the price is the same
     number whatever the couple answers, so the question barely matters. */
  for (const people of [150, 200, 300, 430, 500]) {
    assert.equal(quoteFor(recordsFromGuests(people), "basic", false).total, 290,
      `${people} people should still be at the floor`);
  }
  assert.ok(quoteFor(recordsFromGuests(800), "basic", false).total > 290);
});

test("a quote still clears its own message cost", () => {
  /* 290 ₪ is a floor, not a loss-leader — it has to beat what Meta charges. */
  for (const people of [150, 430, 800]) {
    const r = recordsFromGuests(people);
    assert.ok(quoteFor(r, "basic", false).total > costFor(r) * 1.5,
      `${people} people: ${quoteFor(r, "basic", false).total} vs cost ${costFor(r).toFixed(0)}`);
  }
});
