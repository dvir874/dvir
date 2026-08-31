/* The wash behind the RSVP page, derived from the invitation itself.
 *
 * events.rsvp_bg exists so the page looks like it belongs to the card above it
 * — שחר's blue sky, תהל's dried autumn beige, לאל וטל's warm sand. It was
 * picked by hand per wedding, which means it is a step that gets forgotten:
 * שלמה's event was created with the default cool blue under an ivory
 * invitation bordered in green vine, and the page read as a different event.
 *
 * Nothing about the right colour is a judgement call. It is in the image, and
 * the image is uploaded anyway.
 *
 * Its own import-free file, for the same reason phone-validate.ts and
 * guest-count.ts are: the test runner cannot resolve the @/lib alias.
 */

export interface Rgb { r: number; g: number; b: number }

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const hex2 = (n: number) => clamp(n).toString(16).padStart(2, "0");

export const toHex = ({ r, g, b }: Rgb): string => `#${hex2(r)}${hex2(g)}${hex2(b)}`;

/** The page's own ivory. Every wash lands on it, so the card floats rather
    than sitting on a band that stops. */
export const PAGE_BOTTOM: Rgb = { r: 0xFD, g: 0xFA, b: 0xF5 };

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  const k = Math.max(0, Math.min(1, t));
  return {
    r: a.r + (b.r - a.r) * k,
    g: a.g + (b.g - a.g) * k,
    b: a.b + (b.b - a.b) * k,
  };
}

/**
 * Lift a sampled colour into something a page can sit under.
 *
 * An invitation's dominant colour is often near-white already, and sometimes —
 * a dark photograph, a deep green border — far too strong to put a page on.
 * Both are pulled toward the same narrow band: light enough to read black text
 * over, tinted enough to be recognisably this wedding and not the default.
 *
 * The three existing weddings, chosen by eye, all sit at 84–92% lightness.
 * That is the band this targets.
 */
export function washTop(sample: Rgb): Rgb {
  const lightness = (sample.r * 0.299 + sample.g * 0.587 + sample.b * 0.114) / 255;

  /* Already pale — nudge it down so it is visible against the ivory below,
     rather than leaving an invisible gradient. */
  if (lightness > 0.92) return mix(sample, { r: 0xC9, g: 0xD2, b: 0xD8 }, 0.35);

  /* Dark or saturated — lift it toward white, keeping the hue. */
  if (lightness < 0.86) return mix(sample, { r: 255, g: 255, b: 255 }, (0.88 - lightness) * 1.6);

  return sample;
}

/**
 * The full CSS value written to events.rsvp_bg.
 *
 * Same three-stop shape as the hand-picked ones, so a wedding that gets this
 * automatically is indistinguishable from one that was set by hand.
 */
export function washFrom(sample: Rgb): string {
  const top = washTop(sample);
  const mid = mix(top, PAGE_BOTTOM, 0.75);
  return `linear-gradient(180deg, ${toHex(top)} 0%, ${toHex(mid)} 46%, ${toHex(PAGE_BOTTOM)} 100%)`;
}
