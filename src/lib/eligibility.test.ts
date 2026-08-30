import test from "node:test";
import assert from "node:assert/strict";
import { isEligibleNow, cooldownHours, FIRST_CONTACT_COOLDOWN_H, REMINDER_COOLDOWN_H, MAX_REMINDERS_PER_GUEST, eligibleAt, dueWithin } from "./eligibility.ts";
import type { ContactState } from "./eligibility.ts";

const NOW = Date.parse("2026-08-18T21:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

test("never messaged — always eligible", () => {
  assert.equal(isEligibleNow({ delivered: false, lastOutboundAt: null }, NOW), true);
  assert.equal(isEligibleNow({ delivered: true, lastOutboundAt: null }, NOW), true);
});

test("the two floors are 24 and 120, and they apply to different people", () => {
  assert.equal(cooldownHours({ delivered: false, lastOutboundAt: null }), FIRST_CONTACT_COOLDOWN_H);
  assert.equal(cooldownHours({ delivered: true, lastOutboundAt: null }), REMINDER_COOLDOWN_H);
});

test("the thirty-hour guest — the exact case that lost an evening", () => {
  /* 18/08: selection asked only "messaged in the last 24 hours?" and said yes;
     the reminder group asked 72 and said no. The event was chosen and sent
     nothing, and 204 of the day's quota expired. One function, one answer. */
  const g = { delivered: true, lastOutboundAt: hoursAgo(30) };
  assert.equal(isEligibleNow(g, NOW), false, "delivered 30h ago is NOT eligible");
  assert.equal(isEligibleNow({ ...g, delivered: false }, NOW), true, "undelivered 30h ago is");
});

test("boundaries", () => {
  assert.equal(isEligibleNow({ delivered: false, lastOutboundAt: hoursAgo(23) }, NOW), false);
  assert.equal(isEligibleNow({ delivered: false, lastOutboundAt: hoursAgo(25) }, NOW), true);
  /* 120 since 26/08, not 72 — a second reminder three days after the first
     arrived while the first was still being ignored. */
  assert.equal(isEligibleNow({ delivered: true,  lastOutboundAt: hoursAgo(119) }, NOW), false);
  assert.equal(isEligibleNow({ delivered: true,  lastOutboundAt: hoursAgo(121) }, NOW), true);
});

test("two reminders is the limit, and it applies to nobody else", () => {
  /* Measured over 1,000 sent: reminders one and two produced 276 of 312
     answers. The third onwards is a message to somebody who has ignored two,
     and it costs a slot in a 250-a-day ceiling another wedding is waiting on. */
  const old = { delivered: true, lastOutboundAt: hoursAgo(200) };
  assert.equal(isEligibleNow({ ...old, remindersSent: 1 }, NOW), true);
  assert.equal(isEligibleNow({ ...old, remindersSent: MAX_REMINDERS_PER_GUEST }, NOW), false);
  assert.equal(isEligibleNow({ ...old, remindersSent: 9 }, NOW), false);

  /* Omitted means not counted — every caller that has not been taught to count
     keeps the behaviour it had. */
  assert.equal(isEligibleNow(old, NOW), true);

  /* A guest nothing ever reached is not "reminded", however many attempts
     failed, and must stay reachable. */
  assert.equal(
    isEligibleNow({ delivered: false, lastOutboundAt: hoursAgo(200), remindersSent: 9 }, NOW),
    true,
  );
});

test("a failed send still counts as contact", () => {
  /* lastOutboundAt is every outbound row, not only the successful ones — a
     guest whose message failed an hour ago must not be retried immediately. */
  assert.equal(isEligibleNow({ delivered: false, lastOutboundAt: hoursAgo(1) }, NOW), false);
});

/* ── looking forward ─────────────────────────────────────────────────── */

const T0 = Date.parse("2026-08-31T09:00:00.000Z");
const H = 3_600_000;
const back = (h: number) => new Date(T0 - h * H).toISOString();

test("a guest nothing has reached is due now, not in 24 hours", () => {
  assert.equal(eligibleAt({ delivered: false, lastOutboundAt: null }), 0);
});

test("the floor that applies is the one for what they already got", () => {
  /* Same last message, two different guests: one never received it, one did.
     24 hours for the first, 120 for the second. */
  assert.equal(
    eligibleAt({ delivered: false, lastOutboundAt: back(10) }),
    T0 - 10 * H + FIRST_CONTACT_COOLDOWN_H * H);
  assert.equal(
    eligibleAt({ delivered: true, lastOutboundAt: back(10) }),
    T0 - 10 * H + REMINDER_COOLDOWN_H * H);
});

test("a guest who has had every reminder is never due again", () => {
  assert.equal(
    eligibleAt({ delivered: true, lastOutboundAt: back(500), remindersSent: 3 }),
    null);
});

test("someone due yesterday still counts as due today", () => {
  /* The number is a backlog, not a schedule. A guest the quota ran out on is
     still waiting, and dropping them is how a wedding goes quiet while the
     screen says everything is fine. */
  const { now } = dueWithin([{ delivered: true, lastOutboundAt: back(300) }], T0 + 24 * H, T0);
  assert.equal(now, 1);
});

test("tomorrow's count is the guests due, not the quota available", () => {
  /* 27/08, the answer that was wrong: "150-180 tomorrow" came from the cap.
     Of these five, two are due now, one comes due inside the window, one is
     still cooling, and one is finished. Four are reachable in the next day —
     and that is the answer regardless of how much quota exists. */
  const guests: ContactState[] = [
    { delivered: false, lastOutboundAt: null },                          // due now
    { delivered: true,  lastOutboundAt: back(200) },                      // due now
    { delivered: true,  lastOutboundAt: back(110) },                      // due in 10h
    { delivered: true,  lastOutboundAt: back(2) },                        // due in 118h
    { delivered: true,  lastOutboundAt: back(300), remindersSent: 3 },    // never
  ];
  assert.deepEqual(dueWithin(guests, T0 + 24 * H, T0), { now: 2, soon: 1, never: 1 });
});
