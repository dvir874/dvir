import test from "node:test";
import assert from "node:assert/strict";
import {
  forecastDayBefore, pressingDays, forecastMessage, eveOf,
  type ForecastEvent,
} from "./send-forecast.ts";

const TODAY = "2026-09-03";
const CAP = 250;

const ev = (name: string, date: string, confirmed: number, pending = 0,
            pausedUntil: string | null = null): ForecastEvent =>
  ({ id: name, name, date, confirmed, pending, pausedUntil });

/* The two weddings that made this necessary, as they stood on 03/09. */
const REAL: ForecastEvent[] = [
  ev("שחר ואורי", "2026-09-08", 230, 60),
  ev("תהל ואביב", "2026-09-22", 183, 116),
  ev("טל ולאל",   "2026-09-22", 151, 94),
  ev("שלמה ואבישג", "2026-10-08", 0, 173),
];

test("two weddings on one date share one evening", () => {
  /* The whole reason this file exists. Counted apart, each fits; the evening
     they actually share does not. */
  const days = forecastDayBefore(REAL, CAP, TODAY);
  const collision = days.find(d => d.date === "2026-09-21");
  assert.ok(collision, "the shared evening must appear");
  assert.equal(collision.required, 334);
  assert.equal(collision.short, 84);
  assert.equal(collision.weddings.length, 2);
});

test("an evening that fits is not a shortfall", () => {
  const shahar = forecastDayBefore(REAL, CAP, TODAY).find(d => d.date === "2026-09-07");
  assert.equal(shahar?.required, 230);
  assert.equal(shahar?.short, 0);
});

test("the guests who have not answered yet are counted as the ceiling", () => {
  /* 210 undecided across the two weddings. Every yes lands on the same
     evening, so a forecast that reports only today's number understates a
     problem that is still growing. */
  const c = forecastDayBefore(REAL, CAP, TODAY).find(d => d.date === "2026-09-21")!;
  assert.equal(c.ceiling, 334 + 116 + 94);
  assert.equal(c.shortAtCeiling, 544 - 250);
});

test("an evening that only overflows if everyone says yes is still raised", () => {
  /* Certain is not the same as worth knowing. This is the case with the lead
     time to actually fix it. */
  const soft = [ev("א", "2026-09-20", 200, 90), ev("ב", "2026-09-20", 20, 10)];
  const d = forecastDayBefore(soft, CAP, TODAY)[0];
  assert.equal(d.short, 0);
  assert.ok(d.shortAtCeiling > 0);
  assert.deepEqual(pressingDays([d]), [d]);
});

test("nothing is raised when everything fits", () => {
  /* Deliberately not שחר. Hers is 230 confirmed with 60 undecided — 290 at the
     ceiling against a cap of 250 — so her evening IS pressing, four days out,
     and this assertion failed when it was written with her in it. The forecast
     was right and the expectation was wrong, which is the whole argument for
     writing it down rather than reasoning about it. */
  assert.deepEqual(pressingDays(forecastDayBefore([ev("קטנה", "2026-09-10", 40, 10)], CAP, TODAY)), []);
});

test("a wedding is pressing before it is over, not after", () => {
  /* שחר on the evening of 07/09: 230 confirmed, 60 undecided. Twenty more
     yeses and guests start receiving nothing — and every one of those twenty
     is a person actively trying to answer. */
  const d = forecastDayBefore([REAL[0]], CAP, TODAY)[0];
  assert.equal(d.short, 0, "not over the cap yet");
  assert.equal(d.shortAtCeiling, 40);
  assert.deepEqual(pressingDays([d]), [d], "and still worth waking someone for");
});

test("a wedding past the horizon is not in this month's problem", () => {
  const days = forecastDayBefore(REAL, CAP, TODAY, 21);
  assert.equal(days.some(d => d.date === "2026-10-07"), false);
  assert.equal(forecastDayBefore(REAL, CAP, TODAY, 40).some(d => d.date === "2026-10-07"), true);
});

test("an evening already past is not forecast", () => {
  assert.deepEqual(forecastDayBefore([ev("אתמול", "2026-09-01", 300)], CAP, TODAY), []);
});

test("tonight still counts", () => {
  /* A wedding tomorrow is the case where the warning is most urgent and the
     off-by-one most tempting. */
  const d = forecastDayBefore([ev("מחר", "2026-09-04", 400)], CAP, TODAY);
  assert.equal(d.length, 1);
  assert.equal(d[0].inDays, 0);
  assert.equal(d[0].short, 150);
});

test("a wedding still silenced on its own eve does not compete", () => {
  const paused = ev("מושהית", "2026-09-22", 300, 0, "2026-09-25T00:00:00Z");
  const d = forecastDayBefore([paused, ev("פעילה", "2026-09-22", 100)], CAP, TODAY);
  assert.equal(d[0].required, 100);
});

test("a pause that lapses before the eve does compete", () => {
  const lapses = ev("חוזרת", "2026-09-22", 300, 0, "2026-09-08T06:00:00Z");
  assert.equal(forecastDayBefore([lapses], CAP, TODAY)[0].required, 300);
});

test("the eve of the first of a month is the last of the one before", () => {
  assert.equal(eveOf("2026-10-01"), "2026-09-30");
  assert.equal(eveOf("2027-01-01"), "2026-12-31");
  assert.equal(eveOf("2026-03-01"), "2026-02-28");
});

test("the message names the date, the weddings and the way out", () => {
  /* An alert that says "capacity problem" is one he has to go and investigate,
     at the hour he is least able to. */
  const m = forecastMessage(forecastDayBefore(REAL, CAP, TODAY).find(d => d.date === "2026-09-21")!);
  assert.ok(m.includes("21/09"), m);
  assert.ok(m.includes("334"), m);
  assert.ok(m.includes("84"), m);
  assert.ok(m.includes("תהל ואביב"), m);
  assert.ok(m.includes("טל ולאל"), m);
  assert.ok(m.includes("1,000"), m);
});

test("an uncertain evening does not claim guests will be lost", () => {
  const soft = forecastDayBefore([ev("א", "2026-09-20", 200, 90)], CAP, TODAY)[0];
  const m = forecastMessage(soft);
  assert.ok(m.includes("טרם ענו"), m);
  assert.equal(m.includes("לא יקבלו כלום."), true);
  assert.ok(m.includes("אם רובם יאשרו"), m);
});
