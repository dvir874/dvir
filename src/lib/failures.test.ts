import test from "node:test";
import assert from "node:assert/strict";
import { classify, messageOf, newRunId, recordFailure } from "./failures.ts";

/* The point of these is not that the happy path writes a row. It is that the
   unhappy paths cannot go quiet — which is the entire reason the module exists. */

test("terminal provider codes are never classified as retryable", () => {
  for (const code of [131026, 131048, 131049, 131050]) {
    assert.equal(classify({ error: "failed", code }), "provider_terminal",
      `${code} must be terminal — retrying it spends quota for a known answer`);
  }
  /* 130472 is the unavoidable one percent, not an account emergency. */
  assert.equal(classify({ error: "failed", code: 130472 }), "provider_retryable");
});

test("throttling and transport errors are retryable, our own bugs are not", () => {
  assert.equal(classify({ error: new Error("Request throttled, please retry") }), "provider_retryable");
  assert.equal(classify({ error: new Error("fetch failed") }), "provider_retryable");
  assert.equal(classify({ error: new Error("504 Gateway Timeout") }), "provider_retryable");
  assert.equal(classify({ error: new Error("Cannot read properties of undefined") }), "internal");
});

test("a failed database read is its own kind — we acted on partial truth", () => {
  assert.equal(classify({ error: { message: "lookup_failed" } }), "lookup");
  assert.equal(
    classify({ error: { message: 'column wa_messages.template_name does not exist' } }),
    "lookup",
  );
});

test("messageOf never returns [object Object]", () => {
  assert.equal(messageOf(new Error("boom")), "boom");
  assert.equal(messageOf("plain"), "plain");
  /* The shape PostgREST actually returns. */
  assert.equal(messageOf({ message: "duplicate key", details: null, hint: null }), "duplicate key");
  assert.equal(messageOf({ hint: "set WHATSAPP_ACCESS_TOKEN" }), "set WHATSAPP_ACCESS_TOKEN");
  assert.match(messageOf({ weird: 1 }), /weird/);
  assert.equal(messageOf(null), "");
});

test("recordFailure does not throw when the writer throws", async () => {
  const writer = { insert: async () => { throw new Error("database is down"); } };
  const logged: unknown[] = [];
  const orig = console.error;
  console.error = (m: unknown) => { logged.push(m); };
  try {
    await recordFailure(writer, { scope: "webhook.reply", error: new Error("original problem") });
  } finally {
    console.error = orig;
  }
  assert.equal(logged.length, 1, "a write failure must still reach the log");
  assert.match(String(logged[0]), /original problem/);
  assert.match(String(logged[0]), /database is down/);
});

test("recordFailure falls back when the writer returns an error instead of throwing", async () => {
  /* Supabase reports failure by returning, not raising. Treating a returned
     error as success is the exact defect this module was written to end. */
  const writer = { insert: async () => ({ error: { message: "permission denied" } }) };
  const logged: unknown[] = [];
  const orig = console.error;
  console.error = (m: unknown) => { logged.push(m); };
  try {
    await recordFailure(writer, { scope: "cron.send", error: "send failed" });
  } finally {
    console.error = orig;
  }
  assert.equal(logged.length, 1, "a returned error is a failed write, not a write");
  assert.match(String(logged[0]), /permission denied/);
});

test("recordFailure survives a missing writer", async () => {
  const orig = console.error;
  let logged = 0;
  console.error = () => { logged++; };
  try {
    await recordFailure(null, { scope: "admin.send", error: "no client" });
  } finally {
    console.error = orig;
  }
  assert.equal(logged, 1);
});

test("the row carries the code and stays inside its column", async () => {
  let row: Record<string, unknown> | null = null;
  const writer = { insert: async (r: Record<string, unknown>) => { row = r; return {}; } };
  await recordFailure(writer, {
    scope: "cron.send", error: "x".repeat(5000), code: 131049,
    guestId: "g1", eventId: "e1", ref: "wamid.123", runId: "run_abc",
  });
  const written = row as unknown as Record<string, unknown>;
  assert.equal(written.kind, "provider_terminal");
  assert.equal(written.guest_id, "g1");
  assert.equal(written.ref, "wamid.123");
  assert.equal(written.run_id, "run_abc");
  assert.equal((written.error as string).length, 2000, "error text is bounded, not dropped");
  assert.deepEqual(written.context, { code: 131049 });
});

test("run ids are unique so one incident is not read as forty", () => {
  const ids = new Set(Array.from({ length: 200 }, () => newRunId("cron")));
  assert.equal(ids.size, 200);
  assert.match([...ids][0], /^cron_/);
});
