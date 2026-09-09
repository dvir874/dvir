import test from "node:test";
import assert from "node:assert/strict";
import { askAssistant } from "./assistant.ts";

const facts = { today: "2026-09-09", weddings: [] };

/* The contract that matters is the failure one. Every path that cannot produce
   a grounded answer must produce null, because null means "show the menu" —
   the behaviour this console had before the assistant existed. */

test("בלי מפתח אין תשובה, ויש תפריט", async () => {
  const had = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    assert.equal(await askAssistant("כמה אישרו בסך הכול?", facts), null);
  } finally {
    if (had !== undefined) process.env.ANTHROPIC_API_KEY = had;
  }
});

test("שאלה ריקה או ארוכה מדי לא נשלחת בכלל", async () => {
  const had = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "not-a-real-key-and-never-used";
  try {
    /* Neither of these should reach the network — an empty question has no
       answer, and 400 characters is a paste, not a question. */
    assert.equal(await askAssistant("", facts), null);
    assert.equal(await askAssistant("   ", facts), null);
    assert.equal(await askAssistant("א".repeat(401), facts), null);
  } finally {
    if (had === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = had;
  }
});
