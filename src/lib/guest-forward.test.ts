import test from "node:test";
import assert from "node:assert/strict";
import { forwardEnabled, isTypedMessage, guestForwardText } from "./guest-forward.ts";

test("off unless the flag says so", () => {
  assert.equal(forwardEnabled(undefined, "e1"), false);
  assert.equal(forwardEnabled("", "e1"), false);
  assert.equal(forwardEnabled("all", "e1"), true);
  assert.equal(forwardEnabled("ALL", null), true);
});

test("a list of events forwards only those weddings", () => {
  assert.equal(forwardEnabled("e1, e2", "e2"), true);
  assert.equal(forwardEnabled("e1,e2", "e3"), false);
  assert.equal(forwardEnabled("e1", null), false);
});

test("taps are not forwarded, typing and media are", () => {
  assert.equal(isTypedMessage("button"), false);
  assert.equal(isTypedMessage("interactive"), false);
  assert.equal(isTypedMessage("reaction"), false);
  assert.equal(isTypedMessage("text"), true);
  assert.equal(isTypedMessage("image"), true);
  assert.equal(isTypedMessage(undefined), true);
});

test("the forward carries who, which wedding, the words in full, and a way to answer", () => {
  const t = guestForwardText({ guestName: "סבא ניסן", couple: "שלמה גור ואבישג בן שוהם",
    phone: "972501234567", body: "האם יש חנייה ליד האולם? ".repeat(5) });
  assert.match(t, /סבא ניסן/);
  assert.match(t, /שלמה גור ואבישג בן שוהם/);
  assert.match(t, /0501234567/);
  assert.match(t, /https:\/\/wa\.me\/972501234567/);
  assert.ok(t.includes("האם יש חנייה ליד האולם? ".repeat(5).trim()));
});
