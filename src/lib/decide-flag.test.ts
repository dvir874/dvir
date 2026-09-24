import test from "node:test";
import assert from "node:assert/strict";
import {
  decideIsLive, shutdownDue, windowIsClean, decideTallyLine, shutdownLine,
  ALL, SHUTDOWN_ON, MIN_FREE_TEXT, DECIDE_FLAG,
} from "./decide-flag.ts";

const SHLOMO = "7e1a56b5-1083-4afd-8317-9cd52557534d";
const AYELET = "b296a896-b2d7-4371-8078-5c6152036e4b";

test("unset is today's behaviour, and clearing it in Vercel restores that", () => {
  /* The whole point of one variable: emptying it is the off switch, and it
     takes effect on the next request rather than the next deploy. */
  for (const v of [undefined, null, "", "   "]) {
    assert.equal(decideIsLive(SHLOMO, v), false, JSON.stringify(v));
  }
});

test("one event means one event", () => {
  assert.equal(decideIsLive(SHLOMO, SHLOMO), true);
  assert.equal(decideIsLive(AYELET, SHLOMO), false);
  assert.equal(decideIsLive(SHLOMO, ` ${SHLOMO} `), true);
});

test("an unknown event is never the opened one", () => {
  /* A guest row without event_id must not inherit the experiment. */
  for (const id of [null, undefined, ""]) assert.equal(decideIsLive(id, SHLOMO), false);
});

test("the star opens everything, and only after the three clean days", () => {
  assert.equal(decideIsLive(AYELET, ALL), true);
  assert.equal(decideIsLive(null, ALL), true);
});

test("05/10 arrives whatever the numbers say", () => {
  assert.equal(shutdownDue("2026-10-04"), false);
  assert.equal(shutdownDue(SHUTDOWN_ON), true);
  assert.equal(shutdownDue("2026-10-08"), true);
  assert.equal(shutdownDue("not a date"), false);
});

test("zero out of zero is not clean — that is what a broken pipe looks like", () => {
  assert.equal(windowIsClean({ disagreements: 0, freeText: 0 }), false);
  assert.equal(windowIsClean({ disagreements: 0, freeText: MIN_FREE_TEXT - 1 }), false);
  assert.equal(windowIsClean({ disagreements: 0, freeText: MIN_FREE_TEXT }), true);
  assert.equal(windowIsClean({ disagreements: 1, freeText: 500 }), false);
});

test("the line says which of the two numbers is short", () => {
  assert.match(decideTallyLine({ disagreements: 0, freeText: 7 })!, /עוד 13 הודעות/);
  assert.match(decideTallyLine({ disagreements: 0, freeText: 31 })!, /נקי$/);
  assert.match(decideTallyLine({ disagreements: 2, freeText: 40 })!, /לבדוק לפני הרחבה/);
  assert.match(decideTallyLine({ disagreements: 2, freeText: 40 })!, /2 מתוך 40/);
});

test("nothing evaluated yet says nothing at all", () => {
  assert.equal(decideTallyLine({ disagreements: 0, freeText: 0 }), null);
});

test("the shutdown reminder appears only while the flag is still set", () => {
  assert.equal(shutdownLine("2026-10-05", false), null, "already off — nothing to remind");
  assert.equal(shutdownLine("2026-10-04", true), null, "not due yet");
  const l = shutdownLine("2026-10-05", true)!;
  assert.match(l, new RegExp(DECIDE_FLAG));
  assert.match(l, /שלמה/);
});
