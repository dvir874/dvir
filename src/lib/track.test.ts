import { test } from "node:test";
import assert from "node:assert/strict";
import { leadSourceOf, withSourceLine } from "./track.ts";

function withStorage(utm: object | null, fn: () => void) {
  const store = new Map<string, string>();
  if (utm) store.set("rl_utm", JSON.stringify(utm));
  (globalThis as any).sessionStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) };
  try { fn(); } finally { delete (globalThis as any).sessionStorage; }
}

const WA = "https://wa.me/972533318177?text=" + encodeURIComponent("שלום דביר");

test("known social source adds one honest line", () => {
  withStorage({ source: "instagram" }, () => {
    const out = new URL(withSourceLine(WA)).searchParams.get("text");
    assert.equal(out, "שלום דביר\n(הגעתי דרך אינסטגרם)");
    assert.equal(withSourceLine(withSourceLine(WA)), withSourceLine(WA)); // idempotent
  });
});

test("no or unknown source leaves the link untouched", () => {
  withStorage(null, () => assert.equal(withSourceLine(WA), WA));
  withStorage({ source: "newsletter" }, () => assert.equal(withSourceLine(WA), WA));
});

test("lead_source maps only onto the closed enum", () => {
  assert.equal(leadSourceOf({ source: "IG" }), "instagram");
  assert.equal(leadSourceOf({ source: "fb" }), "facebook");
  assert.equal(leadSourceOf({ source: "tiktok" }), null);
});
