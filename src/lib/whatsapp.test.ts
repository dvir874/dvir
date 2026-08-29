import test from "node:test";
import assert from "node:assert/strict";
import { toE164, warmupCap, policyFor, isRetryableFailure,
         WARMUP_COLD_START, WARMUP_MULTIPLIER, WARMUP_MAX_DAILY_STEP } from "./whatsapp.ts";

/* whatsapp.ts is 1,140 lines and decides who receives a message and who never
   does. It had no tests. These cover the pure decisions — the ones that have
   each already been wrong once in production. */

test("Israeli numbers reach E.164, in every shape people write them", () => {
  assert.equal(toE164("0501234567"),   "972501234567");
  assert.equal(toE164("050-123-4567"), "972501234567");
  assert.equal(toE164("972501234567"), "972501234567");
  assert.equal(toE164("+972 50 123 4567"), "972501234567");
  /* Bare local, no leading zero — assumed Israeli, which is the only sane
     guess for an 8-9 digit string in this product. */
  assert.equal(toE164("501234567"),    "972501234567");
});

test("a foreign number is passed through, not bent into an Israeli one", () => {
  /* חיים כצמן's Israeli number had no WhatsApp and was replaced with a US one
     on 26/08. Prefixing 972 to it would have sent the invitation to a stranger
     in Israel, and looked like a delivery failure rather than a wrong number. */
  assert.equal(toE164("13053439895"),  "13053439895");
  assert.equal(toE164("+1 (305) 343-9895"), "13053439895");
  assert.equal(toE164("16462841932"),  "16462841932");
});

test("nothing usable returns null rather than a plausible-looking number", () => {
  assert.equal(toE164(""), null);
  assert.equal(toE164("ללא טלפון"), null);
  assert.equal(toE164("—"), null);
});

test("Meta's ceiling always wins over our own brake", () => {
  /* WA_CAP_OVERRIDE is a brake, not a permit. On 26/08 Dvir asked whether
     raising it would lift the 250 limit; it cannot, and this is why. */
  const green = { posture: "open" as const, quality: "GREEN" as const,
                  tier: 250, cap: 250, reasons: [] };
  assert.ok(warmupCap(green, 1000) <= 250,
    "a huge recent peak must never push past what Meta allows");
});

test("a blocked account sends nothing, whatever the ramp says", () => {
  const blocked = { posture: "blocked" as const, quality: "GREEN" as const,
                    tier: 250, cap: 0, reasons: [] };
  assert.equal(warmupCap(blocked, 200), 0);
});

test("the warm-up climbs, but only one step at a time", () => {
  /* 9/8: the number was restricted at 82 recipients while the advertised tier
     said 250. Growth is capped at 1.6x the busiest clean day AND at a fixed
     step, so a single unusual day cannot become tomorrow's baseline. */
  const green = { posture: "open" as const, quality: "GREEN" as const,
                  tier: 250, cap: 250, reasons: [] };
  const fromFifty = warmupCap(green, 50);
  assert.ok(fromFifty <= 50 * WARMUP_MULTIPLIER + 0.01);
  assert.ok(fromFifty <= 50 + WARMUP_MAX_DAILY_STEP);
  assert.ok(warmupCap(green, 0) >= WARMUP_COLD_START,
    "a cold start still has to be able to move");
});

test("the four Meta codes that cost real guests are each handled differently", () => {
  /* Measured across three weddings: 131026 no WhatsApp, 130472 marketing
     experiment, 131049 recipient cap, 131050 opted out. Treating them alike is
     how a guest who asked to stop keeps being messaged. */
  assert.equal(policyFor(131026).action, "never",
    "no WhatsApp account — retrying forever burns quota on nobody");
  assert.equal(policyFor(131050).action, "never",
    "asked to stop receiving marketing — retrying is the fastest route to a spam report");
  assert.equal(policyFor(130472).action, "wait_for_inbound",
    "Meta's experiment group — only reachable if they write first");
  assert.equal(policyFor(131049).action, "retry_later",
    "per-recipient cap is temporary, so this one does come back");
});

test("a restriction stops the run, not just the message", () => {
  /* 131048 on 9/8 stopped sending for all three weddings for days. One guest's
     failure is not worth continuing into. */
  assert.equal(policyFor(131048).action, "stop_run");
});

test("permanent failures are not retried", () => {
  assert.equal(isRetryableFailure(131026), false);
  assert.equal(isRetryableFailure(131050), false);
});
