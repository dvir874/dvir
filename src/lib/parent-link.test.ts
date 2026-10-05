import test from "node:test";
import assert from "node:assert/strict";
import { parentToken, readParentToken } from "./parent-link.ts";

const S = "secret";
const E = "6b94de7b-d796-4ed4-910f-f98770187487";

test("a token reads back as its event and side", () => {
  assert.deepEqual(readParentToken(S, parentToken(S, E, "bride")), { eventId: E, side: "bride" });
  assert.deepEqual(readParentToken(S, parentToken(S, E, "groom")), { eventId: E, side: "groom" });
});

test("editing the side, the event or the secret breaks it", () => {
  const t = parentToken(S, E, "bride");
  assert.equal(readParentToken(S, t.replace(".b.", ".g.")), null, "bride's link cannot be turned into the groom's");
  assert.equal(readParentToken(S, t.replace(E, E.replace(/^6/, "7"))), null);
  assert.equal(readParentToken("other", t), null);
  assert.equal(readParentToken(S, "nonsense"), null);
  assert.equal(readParentToken(S, ""), null);
});
