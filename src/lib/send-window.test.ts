import test from "node:test";
import assert from "node:assert/strict";
import { chooseEvents, MAX_EVENTS_PER_RUN, type WindowEvent } from "./send-window.ts";

const NOW = new Date("2026-09-03T12:00:00Z").getTime();

const ev = (id: string, date: string, o: Partial<WindowEvent> = {}): WindowEvent =>
  ({ id, date, wa_header_image_url: "img", send_paused_until: null, ...o });

/* The five weddings as they actually stood on 03/09. */
const REAL: WindowEvent[] = [
  ev("shahar", "2026-09-08"),
  ev("tahel",  "2026-09-22"),
  ev("lael",   "2026-09-22", { send_paused_until: "2026-09-08T06:00:00Z" }),
  ev("shlomo", "2026-10-08"),
  ev("yaron",  "2026-10-14", { wa_header_image_url: null }),
];

test("a paused wedding does not hold a slot", () => {
  /* The whole bug. Taking three by date and filtering after gave two — שחר and
     תהל — while שלמה's 173 uninvited guests sat outside the window. */
  const { active } = chooseEvents(REAL, NOW);
  assert.deepEqual(active.map(e => e.id), ["shahar", "tahel", "shlomo"]);
});

test("neither does a wedding that has not been set up", () => {
  const { active } = chooseEvents([
    ev("a", "2026-09-08", { wa_header_image_url: null }),
    ev("b", "2026-09-09", { wa_header_image_url: null }),
    ev("c", "2026-09-10"),
  ], NOW);
  assert.deepEqual(active.map(e => e.id), ["c"]);
});

test("still at most three, and still nearest first", () => {
  const many = Array.from({ length: 9 }, (_, i) => ev(`e${i}`, `2026-09-0${i + 1}`));
  const { active } = chooseEvents(many, NOW);
  assert.equal(active.length, MAX_EVENTS_PER_RUN);
  assert.deepEqual(active.map(e => e.id), ["e0", "e1", "e2"]);
});

test("a pause that has lapsed is no pause at all", () => {
  const past = ev("x", "2026-09-08", { send_paused_until: "2026-09-01T00:00:00Z" });
  assert.deepEqual(chooseEvents([past], NOW).active.map(e => e.id), ["x"]);
});

test("a wedding passed over is named, with the reason", () => {
  /* A silent run must never be unexplained — it is the only signal Dvir has
     that the cron ran and chose to do nothing. */
  const { skipped } = chooseEvents(REAL, NOW);
  const lael = skipped.find(s => s.event.id === "lael");
  assert.ok(lael, "the paused wedding must be reported");
  assert.equal(lael.reason, "paused");
  assert.equal(lael.pausedUntil, "2026-09-08T06:00:00Z");
});

test("a wedding that was never in contention is not reported as skipped", () => {
  /* ירון is 14/10 with no invitation image. Three sendable weddings were found
     ahead of him, so he was not passed over — he was simply not reached, and
     listing him turns the line that explains a quiet run into noise. */
  const { skipped } = chooseEvents(REAL, NOW);
  assert.equal(skipped.some(s => s.event.id === "yaron"), false, "reported a wedding nobody was waiting on");
});

test("when nothing can be sent, every reason is given", () => {
  /* The one case where the list is the entire explanation. */
  const { active, skipped } = chooseEvents([
    ev("a", "2026-09-08", { send_paused_until: "2026-12-01T00:00:00Z" }),
    ev("b", "2026-09-09", { wa_header_image_url: null }),
  ], NOW);
  assert.deepEqual(active, []);
  assert.deepEqual(skipped.map(s => [s.event.id, s.reason]), [["a", "paused"], ["b", "no_image"]]);
});

test("no weddings at all is not an error", () => {
  assert.deepEqual(chooseEvents([], NOW), { active: [], skipped: [] });
});
