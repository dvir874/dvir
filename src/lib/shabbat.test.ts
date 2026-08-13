import test from "node:test";
import assert from "node:assert/strict";
import { shabbatBlock } from "./shabbat.ts";

/* Times are given as UTC and read back in Asia/Jerusalem, which is what the
   sender actually runs against. August is UTC+3. */
const il = (iso: string) => new Date(iso);

test("the three runs that land inside Shabbat are all blocked", () => {
  /* Friday 19:30 Israel — candle-lighting in August is around 19:05 */
  assert.equal(shabbatBlock(il("2026-08-14T16:30:00Z")).blocked, true);
  /* Saturday 11:15 Israel */
  assert.equal(shabbatBlock(il("2026-08-15T08:15:00Z")).blocked, true);
  /* Saturday 19:30 Israel — havdalah is around 20:10. The least obvious one. */
  assert.equal(shabbatBlock(il("2026-08-15T16:30:00Z")).blocked, true);
});

test("Friday morning still sends", () => {
  /* 11:15 Israel on a Friday is hours before any candle-lighting, all year. */
  assert.equal(shabbatBlock(il("2026-08-14T08:15:00Z")).blocked, false);
});

test("the week resumes on Sunday", () => {
  assert.equal(shabbatBlock(il("2026-08-16T08:15:00Z")).blocked, false);
  assert.equal(shabbatBlock(il("2026-08-16T16:30:00Z")).blocked, false);
});

test("ordinary weekdays are untouched", () => {
  for (const d of ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20"]) {
    assert.equal(shabbatBlock(il(`${d}T08:15:00Z`)).blocked, false, d);
    assert.equal(shabbatBlock(il(`${d}T16:30:00Z`)).blocked, false, d);
  }
});

test("the reason distinguishes the eve from the day", () => {
  assert.equal(shabbatBlock(il("2026-08-14T16:30:00Z")).reason, "shabbat_eve");
  assert.equal(shabbatBlock(il("2026-08-15T08:15:00Z")).reason, "shabbat");
});

test("winter is covered by the same rule", () => {
  /* Israel is UTC+2 in January. Shabbat comes in around 16:20 and goes out
     around 17:25 — both inside the Friday-midday-to-Sunday window. */
  assert.equal(shabbatBlock(il("2027-01-15T15:00:00Z")).blocked, true);
  assert.equal(shabbatBlock(il("2027-01-16T17:30:00Z")).blocked, true);
});
