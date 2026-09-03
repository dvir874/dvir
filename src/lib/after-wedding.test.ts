import test from "node:test";
import assert from "node:assert/strict";
import { afterWeddingAsks, referralCodeFor, ASK_AFTER_DAYS, ASK_UNTIL_DAYS, type AfterWeddingEvent } from "./after-wedding.ts";

const ev = (o: Partial<AfterWeddingEvent> = {}): AfterWeddingEvent =>
  ({ id: "e", date: "2026-09-01", priceCharged: 335, paidAt: null,
     paymentAskedAt: null, referralAskedAt: null, ...o });

test("nothing on the morning after", () => {
  /* The couple is asleep and has not seen their photographs. A bill is the
     wrong first thing to hear from us. */
  assert.deepEqual(afterWeddingAsks(ev(), "2026-09-01"), []);
  assert.deepEqual(afterWeddingAsks(ev(), "2026-09-02"), []);
  assert.deepEqual(afterWeddingAsks(ev(), "2026-09-04"), ["payment"]);
});

test("money first, and never both at once", () => {
  /* Asking for a favour in the same breath as asking for money reads as a
     trade, and the favour is the one that gets refused. */
  assert.deepEqual(afterWeddingAsks(ev(), "2026-09-05"), ["payment"]);
  assert.deepEqual(afterWeddingAsks(ev({ paymentAskedAt: "2026-09-05" }), "2026-09-06"), []);
  assert.deepEqual(afterWeddingAsks(ev({ paidAt: "2026-09-06" }), "2026-09-07"), ["referral"]);
});

test("a couple who paid up front goes straight to the referral", () => {
  /* תהל paid before the wedding. */
  assert.deepEqual(afterWeddingAsks(ev({ paidAt: "2026-09-03" }), "2026-09-05"), ["referral"]);
});

test("each is asked exactly once", () => {
  assert.deepEqual(afterWeddingAsks(ev({ paidAt: "x", referralAskedAt: "y" }), "2026-09-05"), []);
});

test("a wedding with no agreed price is not billed, only thanked", () => {
  /* לאל וטל have no price yet. Inventing a number to chase is worse than
     chasing nothing. */
  assert.deepEqual(afterWeddingAsks(ev({ priceCharged: null }), "2026-09-05"), ["referral"]);
});

test("an old debt is a phone call, not another message", () => {
  const old = ev({ date: "2026-07-01" });
  assert.deepEqual(afterWeddingAsks(old, "2026-09-05"), []);
  assert.deepEqual(afterWeddingAsks(ev(), "2026-09-01"), []);
  /* The boundary itself: day 30 still asks, day 31 has missed its moment. */
  assert.deepEqual(afterWeddingAsks(ev(), "2026-10-01"), ["payment"], "day 30");
  assert.deepEqual(afterWeddingAsks(ev(), "2026-10-02"), [], "day 31");
  assert.equal(ASK_UNTIL_DAYS, 30);
});

test("a wedding that has not happened yet is left alone", () => {
  assert.deepEqual(afterWeddingAsks(ev({ date: "2026-12-01" }), "2026-09-05"), []);
  assert.equal(ASK_AFTER_DAYS, 3);
});

test("a referral code is a URL, so a Hebrew name falls back rather than guessing", () => {
  /* A wrong transliteration is a link that looks like somebody else's wedding. */
  const heb = referralCodeFor("תהל שלוש ואביב אדרעי", "2aa58430-c13d-4fc9");
  assert.match(heb, /^[a-z0-9]+$/);
  assert.ok(heb.length >= 6);
  const lat = referralCodeFor("Tahel and Aviv", "2aa58430-c13d");
  assert.ok(lat.startsWith("tahel"), lat);
});
