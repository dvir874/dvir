import test from "node:test";
import assert from "node:assert/strict";
import { CRON_UTC, RUNS_PER_DAY, slotOf, israelHourOf } from "./cron-schedule.ts";

test("the schedule is the one in vercel.json", () => {
  /* The alarm that reports a missed run knew two of these eight. Six could
     have stopped firing without a word. */
  assert.equal(RUNS_PER_DAY, 8);
  assert.deepEqual(CRON_UTC[0], [6, 0]);
  assert.deepEqual(CRON_UTC[RUNS_PER_DAY - 1], [18, 50]);
});

test("a run belongs to the slot it followed, not the nearest one", () => {
  /* 18:30 and 18:50 are twenty minutes apart. A symmetric window would award a
     late 18:30 run to the 18:50 slot and then report 18:30 as missed. */
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 18, 31))), 6);
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 18, 49))), 6);
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 18, 51))), 7);
});

test("a run before the first slot belongs to none", () => {
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 5, 59))), null);
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 6, 0))), 0);
});

test("Israel time is converted, not assumed to be +3", () => {
  /* Winter is +2. Adding three would print every alarm an hour late for four
     months of the year. */
  assert.equal(israelHourOf(6, 0), "08:00");   // January — +2
  assert.equal(israelHourOf(18, 50), "20:50");
});
