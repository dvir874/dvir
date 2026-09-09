import test from "node:test";
import assert from "node:assert/strict";
import { chunkBlocks, SAFE_LIMIT, WA_TEXT_LIMIT } from "./wa-chunk.ts";

test("שום הודעה לא עוברת את המגבלה של מטא", () => {
  const blocks = Array.from({ length: 60 }, (_, i) => `אורח ${i} 050123456${i % 10}\nhttps://x.co/s/abc-${i}`);
  const out = chunkBlocks(blocks);
  assert.ok(out.length > 0);
  for (const m of out) assert.ok(m.length <= SAFE_LIMIT, `הודעה באורך ${m.length}`);
  assert.ok(SAFE_LIMIT < WA_TEXT_LIMIT, "יש מרווח מתחת לתקרה של מטא");
});

test("אף בלוק לא נחתך באמצע, ואף אחד לא נעלם", () => {
  const blocks = Array.from({ length: 25 }, (_, i) => `בלוק-${i}-${"א".repeat(200)}`);
  const out = chunkBlocks(blocks, 900);
  for (let i = 0; i < 25; i++)
    assert.ok(out.some(m => m.includes(`בלוק-${i}-`)), `בלוק ${i} נעלם`);
  /* And nothing was cut: every block appears whole. */
  const joined = out.join("\n\n");
  for (const b of blocks) assert.ok(joined.includes(b));
});

test("בלוק בודד גדול מהמגבלה יוצא לבדו ולא נזרק", () => {
  /* One guest whose link is somehow enormous. A message Meta refuses is a
     visible failure; a guest quietly missing from the list is not. */
  const huge = "x".repeat(5000);
  const out = chunkBlocks(["קטן", huge, "קטן2"], 100);
  assert.ok(out.some(m => m === huge), "הבלוק הארוך נשמר");
  assert.equal(out.length, 3);
});

test("רשימה ריקה היא אפס הודעות, לא הודעה ריקה", () => {
  assert.deepEqual(chunkBlocks([]), []);
  assert.deepEqual(chunkBlocks(["", "  ".trim(), ""]), []);
});
