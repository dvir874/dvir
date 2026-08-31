import test from "node:test";
import assert from "node:assert/strict";
import { stateIsLive, STATE_TTL_H } from "./chat-state.ts";

/* Sixteen guests were sitting in an open question on 31/08, several for more
   than ten days. The state is checked before anything else in the handler, so
   the next number any of them sent would have been written to guest_count with
   none of the confirmation an ordinary message gets. */

const NOW = Date.parse("2026-08-31T09:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

test("a question asked minutes ago is still open", () => {
  assert.equal(stateIsLive({ chat_state: "awaiting_count", chat_state_at: hoursAgo(0.2) }, NOW), true);
});

test("a question asked ten days ago is not", () => {
  /* הרב אריאל אלמוג: awaiting_count, 247 hours, still confirmed. */
  assert.equal(stateIsLive({ chat_state: "awaiting_count", chat_state_at: hoursAgo(247) }, NOW), false);
});

test("the boundary falls where it is documented", () => {
  assert.equal(stateIsLive({ chat_state: "awaiting_count", chat_state_at: hoursAgo(STATE_TTL_H - 1) }, NOW), true);
  assert.equal(stateIsLive({ chat_state: "awaiting_count", chat_state_at: hoursAgo(STATE_TTL_H + 1) }, NOW), false);
});

test("no state is not a live state", () => {
  assert.equal(stateIsLive({ chat_state: null, chat_state_at: hoursAgo(1) }, NOW), false);
});

test("a row written before the timestamp column existed keeps its old behaviour", () => {
  /* Losing the state on those would drop a guest mid-answer, which is the
     failure this file was written to prevent. */
  assert.equal(stateIsLive({ chat_state: "awaiting_count", chat_state_at: null }, NOW), true);
});
