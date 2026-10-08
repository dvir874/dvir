import test from "node:test";
import assert from "node:assert/strict";
import { firstNames, afterWeddingDraft, draftLink, nudgeWindow } from "./after-wedding-nudge.ts";

test("first names from full couple names", () => {
  assert.equal(firstNames("שלמה גור ואבישג בן שוהם"), "שלמה ואבישג");
  assert.equal(firstNames("ירון פטיניו ואיילת דוד"), "ירון ואיילת");
  assert.equal(firstNames("החתונה של דנה"), "החתונה של דנה");
});

test("the draft greets them by name and is signed by Dvir", () => {
  const d = afterWeddingDraft("שלמה גור ואבישג בן שוהם");
  assert.match(d, /^היי שלמה ואבישג/);
  assert.match(d, /דביר, רגע לפני$/);
  assert.ok(!d.includes("💒"));
});

test("the link opens a chat with the couple, text prefilled", () => {
  const l = draftLink("050-123-4567", "שלום")!;
  assert.ok(l.startsWith("https://wa.me/972501234567?text="));
  assert.equal(decodeURIComponent(l.split("text=")[1]), "שלום");
  assert.equal(draftLink("123", "x"), null);
});

test("window covers the last three days, not today", () => {
  assert.deepEqual(nudgeWindow("2026-10-09"), { from: "2026-10-06", before: "2026-10-09" });
});
