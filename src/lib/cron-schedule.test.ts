import test from "node:test";
import assert from "node:assert/strict";
import { CRON_UTC, RUNS_PER_DAY, slotOf, israelHourOf, israelClock, israelDay, israelHour } from "./cron-schedule.ts";

test("the schedule is the one in vercel.json", () => {
  /* The alarm that reports a missed run knew two of these eight. Six could
     have stopped firing without a word. */
  assert.equal(RUNS_PER_DAY, 8);
  assert.deepEqual(CRON_UTC[0], [6, 0]);
  assert.deepEqual(CRON_UTC[RUNS_PER_DAY - 1], [19, 30]);
});

test("a run belongs to the slot it followed, not the nearest one", () => {
  /* A symmetric window would award a late 18:30 run to the following slot and
     then report 18:30 itself as missed. */
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 18, 31))), 6);
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 19, 29))), 6);
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 19, 31))), 7);
});

test("a run before the first slot belongs to none", () => {
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 5, 59))), null);
  assert.equal(slotOf(new Date(Date.UTC(2026, 8, 4, 6, 0))), 0);
});

test("Israel time is converted, not assumed to be +3", () => {
  /* Winter is +2. Adding three would print every alarm an hour late for four
     months of the year. */
  assert.equal(israelHourOf(6, 0), "08:00");   // January — +2
  assert.equal(israelHourOf(19, 30), "21:30");
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

/* The property, not the numbers.
 *
 * Sending is blocked on Saturday until 21:00 Israel, so מוצ״ש needs a slot
 * landing between 21:00 and 21:59 — late enough to be allowed, early enough
 * that HOUR_END_IL does not refuse it. In summer 18:30 and 18:50 UTC both did.
 * From 25/10/2026 they land at 20:30 and 20:50 and neither does, which would
 * have removed the best sending hour of the Israeli week with no error
 * anywhere and nothing to notice it.
 *
 * Written as a property because the arithmetic is what changes underneath: a
 * future slot edit that is fine in September and empty in November fails here
 * in September. */
test("מוצ״ש has a slot in both halves of the year", () => {
  const covers = (month: number) => CRON_UTC.some(([h, m]) => {
    const hour = Number(new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false,
    }).format(new Date(Date.UTC(2026, month, 15, h, m))));
    return hour >= 21 && hour <= 21;   /* MOTZASH_HOUR .. HOUR_END_IL */
  });
  assert.ok(covers(8), "קיץ — ספטמבר");
  assert.ok(covers(10), "חורף — נובמבר");
});

/* The same trap in the other direction: a slot before HOUR_START_IL is a run
   that silently does nothing. One is tolerated — 06:00 UTC is 08:00 Israel in
   winter — but the morning must still be served. */
test("a run lands in the 09:00 hour in both halves of the year", () => {
  const nine = (month: number) => CRON_UTC.some(([h, m]) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false,
    }).format(new Date(Date.UTC(2026, month, 15, h, m))) === "09");
  assert.ok(nine(8), "קיץ — ספטמבר");
  assert.ok(nine(10), "חורף — נובמבר");
});
