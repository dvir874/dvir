import test from "node:test";
import assert from "node:assert/strict";
import { inviteButtonsFor } from "./invite-buttons.ts";

test("off unless the wedding is listed", () => {
  assert.equal(inviteButtonsFor("a", undefined), false);
  assert.equal(inviteButtonsFor("a", ""), false);
  assert.equal(inviteButtonsFor(null, "a"), false);
  assert.equal(inviteButtonsFor("a", "b,c"), false);
  assert.equal(inviteButtonsFor("a", "b, a ,c"), true);
});
