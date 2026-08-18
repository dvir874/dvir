import test from "node:test";
import assert from "node:assert/strict";
import { isEligibleNow, cooldownHours, FIRST_CONTACT_COOLDOWN_H, REMINDER_COOLDOWN_H } from "./eligibility.ts";

const NOW = Date.parse("2026-08-18T21:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

test("never messaged — always eligible", () => {
  assert.equal(isEligibleNow({ delivered: false, lastOutboundAt: null }, NOW), true);
  assert.equal(isEligibleNow({ delivered: true, lastOutboundAt: null }, NOW), true);
});

test("the two floors are 24 and 72, and they apply to different people", () => {
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
  assert.equal(isEligibleNow({ delivered: true,  lastOutboundAt: hoursAgo(71) }, NOW), false);
  assert.equal(isEligibleNow({ delivered: true,  lastOutboundAt: hoursAgo(73) }, NOW), true);
});

test("a failed send still counts as contact", () => {
  /* lastOutboundAt is every outbound row, not only the successful ones — a
     guest whose message failed an hour ago must not be retried immediately. */
  assert.equal(isEligibleNow({ delivered: false, lastOutboundAt: hoursAgo(1) }, NOW), false);
});
