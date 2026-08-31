import test from "node:test";
import assert from "node:assert/strict";
import { washFrom, washTop, mix, toHex, PAGE_BOTTOM } from "./invitation-wash.ts";

/* The three washes below were chosen by eye, one per wedding, and are what this
   function has to be indistinguishable from:
     שחר      #D8E7EC → #F1F4F5 → #FDFAF5   (the pale blue sky on her card)
     תהל      #E2DDD6 → #F4F3F2 → #FDFAF5   (dried autumn beige)
     לאל וטל  #EBDBCE → #F6F3F0 → #FDFAF5   (warm sand)
   Each is a soft tint at the top, a near-neutral at 46%, and the page's own
   ivory at the bottom. */

const luminance = ({ r, g, b }: { r: number; g: number; b: number }) =>
  (r * 0.299 + g * 0.587 + b * 0.114) / 255;

test("the shape matches the washes that were set by hand", () => {
  const css = washFrom({ r: 0xD8, g: 0xE7, b: 0xEC });
  assert.match(css, /^linear-gradient\(180deg, #[0-9a-f]{6} 0%, #[0-9a-f]{6} 46%, #fdfaf5 100%\)$/);
});

test("every wash ends on the page's own ivory", () => {
  /* Anything else leaves a visible band where the gradient stops. */
  for (const s of [{ r: 20, g: 30, b: 40 }, { r: 250, g: 250, b: 250 }, { r: 200, g: 40, b: 40 }]) {
    assert.ok(washFrom(s).endsWith("#fdfaf5 100%)"));
  }
});

test("a dark invitation does not produce a page nobody can read", () => {
  /* A photograph, or a deep green border. Left alone it would put black Hebrew
     text on a dark wash. */
  const dark = washTop({ r: 0x1E, g: 0x3A, b: 0x28 });
  assert.ok(luminance(dark) > 0.55, `too dark: ${toHex(dark)}`);
});

test("a near-white invitation still gets a visible wash", () => {
  /* שלמה's card is ivory. Passed through unchanged it would make the gradient
     invisible, which is the same as having no wash at all. */
  const pale = washTop({ r: 0xFC, g: 0xF7, b: 0xEF });
  assert.ok(luminance(pale) < 0.96, `no tint at all: ${toHex(pale)}`);
  assert.notEqual(toHex(pale), toHex(PAGE_BOTTOM));
});

test("the hue of the invitation survives", () => {
  /* A green card must not come back blue. That is the whole point — the page
     should look like it belongs to the card above it. */
  const green = washTop({ r: 0x4A, g: 0x7C, b: 0x3A });
  assert.ok(green.g > green.r && green.g > green.b, `lost the green: ${toHex(green)}`);

  const warm = washTop({ r: 0xC8, g: 0x9B, b: 0x6A });
  assert.ok(warm.r > warm.b, `lost the warmth: ${toHex(warm)}`);
});

test("the middle stop sits between the top and the ivory", () => {
  const top = washTop({ r: 0xD8, g: 0xE7, b: 0xEC });
  const mid = mix(top, PAGE_BOTTOM, 0.75);
  assert.ok(luminance(mid) > luminance(top));
  assert.ok(luminance(mid) < luminance(PAGE_BOTTOM));
});
