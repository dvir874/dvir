import { test } from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "./rate-limit.ts";

/* Deterministic proof that the limiter does what the PR claims.
   No framework: node --test is built in, and adding Jest or Vitest to a
   production app twelve days before a live wedding buys nothing this file
   cannot already show. */

const WINDOW = 60_000;

test("allows up to max, blocks the one after", () => {
  const key = `ip-a-${Date.now()}`;
  for (let i = 1; i <= 5; i++) {
    assert.equal(checkRateLimit(key, "t", 5, WINDOW).ok, true, `request ${i} should pass`);
  }
  assert.equal(checkRateLimit(key, "t", 5, WINDOW).ok, false, "the 6th must be blocked");
  assert.equal(checkRateLimit(key, "t", 5, WINDOW).ok, false, "and so must the 7th");
});

test("a different IP gets its own bucket", () => {
  const a = `ip-b-${Date.now()}`;
  const b = `ip-c-${Date.now()}`;
  for (let i = 0; i < 5; i++) checkRateLimit(a, "t", 5, WINDOW);
  assert.equal(checkRateLimit(a, "t", 5, WINDOW).ok, false, "first IP exhausted");
  assert.equal(checkRateLimit(b, "t", 5, WINDOW).ok, true, "second IP unaffected");
});

test("onboarding and design_request do not share a bucket", () => {
  const key = `ip-d-${Date.now()}`;
  for (let i = 0; i < 5; i++) checkRateLimit(key, "onboarding", 5, WINDOW);
  assert.equal(checkRateLimit(key, "onboarding", 5, WINDOW).ok, false, "onboarding exhausted");
  assert.equal(checkRateLimit(key, "design_request", 5, WINDOW).ok, true, "design_request independent");
});

test("the window expires and the caller is allowed again", async () => {
  const key = `ip-e-${Date.now()}`;
  assert.equal(checkRateLimit(key, "t", 1, 60).ok, true);
  assert.equal(checkRateLimit(key, "t", 1, 60).ok, false, "blocked inside the window");
  await new Promise(r => setTimeout(r, 90));
  assert.equal(checkRateLimit(key, "t", 1, 60).ok, true, "allowed once the window has passed");
});
