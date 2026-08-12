import bidiFactory from "bidi-js";

const bidi = bidiFactory();

/* Satori (behind next/og ImageResponse) has no bidi support: it lays glyphs
   out in logical order, left to right. Hebrew therefore comes out reversed
   letter-by-letter — "החתונה שלנו" renders as "ונלש הנותחה".

   toVisualOrder runs the Unicode bidi algorithm and returns the string in
   *visual* order, so that Satori's LTR pass produces correct Hebrew. It
   handles mixed content too: "ענבל & Nadav" and "24 באוגוסט 2026" both
   survive, which a naive [...s].reverse() would destroy.

   Only use this for text that goes into an ImageResponse. Never for text
   rendered by the browser — the browser does bidi correctly on its own,
   and passing it visual order would break it. */
export function toVisualOrder(input: string): string {
  if (!input) return input;

  const levels = bidi.getEmbeddingLevels(input, "rtl");
  const chars = [...input];

  for (const [start, end] of bidi.getReorderSegments(input, levels)) {
    const segment = chars.slice(start, end + 1).reverse();
    for (let i = 0; i < segment.length; i++) chars[start + i] = segment[i];
  }

  return chars.join("");
}
