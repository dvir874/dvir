import test from "node:test";
import assert from "node:assert/strict";
import { CRON_UTC, RUNS_PER_DAY, slotOf, israelHourOf, israelClock, israelDay, israelHour } from "./cron-schedule.ts";

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

test("Israel time survives the changeover on 25/10/2026", () => {
  /* Three places added three hours to a UTC timestamp and called it Israel
     time. From that Sunday they read an hour early — and the 06:00 UTC cron
     would land at 08:00 Israel and be refused by HOUR_START_IL = 9: a run that
     stops happening, on schedule, with no error anywhere. */
  const summer = Date.UTC(2026, 8, 4, 6, 0);   // 04/09 — +3
  const winter = Date.UTC(2026, 10, 4, 6, 0);  // 04/11 — +2
  assert.equal(israelClock(summer), "09:00");
  assert.equal(israelClock(winter), "08:00");
  assert.equal(israelHour(winter), 8);
});

test("the Israeli day is the Israeli day, not the UTC one", () => {
  /* 21:30 UTC is already tomorrow in Israel. A digest keyed on the UTC date
     files the evening's runs under the wrong day. */
  assert.equal(israelDay(Date.UTC(2026, 8, 4, 21, 30)), "2026-09-05");
  assert.equal(israelDay(Date.UTC(2026, 8, 4, 10, 0)), "2026-09-04");
});
