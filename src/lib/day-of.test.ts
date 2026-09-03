import test from "node:test";
import assert from "node:assert/strict";
import { dayOfWindow, dayOfTargets, DAY_OF_FROM_HOUR, DAY_OF_UNTIL_HOUR, type DayOfGuest } from "./day-of.ts";

test("only on the wedding day itself", () => {
  assert.equal(dayOfWindow("2026-09-22", "2026-09-22", 10).send, true);
  assert.equal(dayOfWindow("2026-09-22", "2026-09-21", 10).reason, "not_today");
  assert.equal(dayOfWindow("2026-09-22", "2026-09-23", 10).reason, "not_today");
});

test("morning, which is the only time the arithmetic allows", () => {
  /* Not a preference. The eve's batch went out at 09:00 the day before and
     occupies the rolling window until 09:00 today, so 08:00 is the hour with
     the LEAST room, not the most. Ten is the first run with a clean window. */
  assert.equal(dayOfWindow("2026-09-22", "2026-09-22", DAY_OF_FROM_HOUR).send, true);
  assert.equal(dayOfWindow("2026-09-22", "2026-09-22", DAY_OF_FROM_HOUR - 1).reason, "too_early");
  assert.equal(dayOfWindow("2026-09-22", "2026-09-22", DAY_OF_UNTIL_HOUR - 1).send, true);
  assert.equal(dayOfWindow("2026-09-22", "2026-09-22", DAY_OF_UNTIL_HOUR).reason, "too_late");
  assert.equal(dayOfWindow("2026-09-22", "2026-09-22", 22).reason, "too_late");
});

const g = (id: string, o: Partial<DayOfGuest> = {}): DayOfGuest =>
  ({ id, status: "confirmed", phone: "0501234567", category: "general", do_not_contact: false, ...o });

test("only the guests the eve did not reach", () => {
  /* The 84 at whichever wedding came second when the cap ran out. */
  const guests = [g("a"), g("b"), g("c")];
  assert.deepEqual(dayOfTargets(guests, new Set(["a"]), new Set()), ["b", "c"]);
});

test("nobody hears it twice, however many runs the morning has", () => {
  /* Six runs between 08:00 and 15:00, all calling this. */
  const guests = [g("a"), g("b")];
  assert.deepEqual(dayOfTargets(guests, new Set(), new Set(["a", "b"])), []);
});

test("a guest who is not coming is not told when to arrive", () => {
  const guests = [g("yes"), g("no", { status: "declined" }), g("maybe", { status: "pending" })];
  assert.deepEqual(dayOfTargets(guests, new Set(), new Set()), ["yes"]);
});

test("the guests no send path may ever touch are still excluded here", () => {
  /* Every other sender checks these three and this one has to as well — a
     catch-up that catches up on the exclusions too is a new bug, not a fix. */
  const guests = [
    g("ok"),
    g("demo", { category: "demo" }),
    g("stop", { do_not_contact: true }),
    g("nophone", { phone: "" }),
    g("nullphone", { phone: null }),
  ];
  assert.deepEqual(dayOfTargets(guests, new Set(), new Set()), ["ok"]);
});

test("a wedding where the eve reached everybody sends nothing", () => {
  const guests = [g("a"), g("b")];
  assert.deepEqual(dayOfTargets(guests, new Set(["a", "b"]), new Set()), []);
});
