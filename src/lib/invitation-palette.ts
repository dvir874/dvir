import sharp from "sharp";

/* The RSVP page in the couple's own colours.
 *
 * The wash behind the form was one gradient for everybody, and it was picked
 * under שחר's card — a cool blue echoing the green on it. Every couple since
 * has inherited it: תהל's dried autumn leaves sat on שחר's blue, and לאל וטל's
 * warm watercolour hills did too. events.rsvp_bg could override it, and doing
 * that by hand for each new couple is the kind of step that gets skipped once
 * and then never happens again.
 *
 * So it is derived from the invitation itself. The top strip of the image is
 * what sits directly under the card on screen, and averaging only its LIGHT
 * pixels gives the paper and the background rather than the lettering — which
 * is why a card with black text does not come out grey.
 *
 * Verified against the four real invitations: שחר reads blue (226,237,241),
 * which is exactly where the old hardcoded default came from; תהל warm grey;
 * לאל וטל peach. The extraction agrees with what a person would have picked.
 */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0))
          : max === g ? (b - r) / d + 2
          :             (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * v).toString(16).padStart(2, "0").toUpperCase();
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** A top-to-bottom wash that ends on the site's ivory, so the page still
    resolves into the same product no matter which invitation it started from. */
export async function paletteFromInvitation(input: Buffer | string): Promise<string | null> {
  try {
    const img = sharp(input);
    const meta = await img.metadata();
    if (!meta.width || !meta.height) return null;

    /* The top 18% — what a guest sees immediately below the card. */
    const strip = await img
      .extract({ left: 0, top: 0, width: meta.width, height: Math.max(1, Math.round(meta.height * 0.18)) })
      .resize(60, 20, { fit: "fill" })
      .raw().toBuffer({ resolveWithObject: true });

    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < strip.data.length; i += strip.info.channels) {
      const [pr, pg, pb] = [strip.data[i], strip.data[i + 1], strip.data[i + 2]];
      /* Light pixels only: the paper and the ground, not the lettering. */
      if ((pr + pg + pb) / 3 > 120) { r += pr; g += pg; b += pb; n++; }
    }
    if (!n) return null;

    const [h, s, l] = rgbToHsl(r / n, g / n, b / n);
    const top = hslToHex(h, Math.min(1, s * 1.05), Math.min(0.92, l * 0.97));
    const mid = hslToHex(h, s * 0.55, 0.955);
    return `linear-gradient(180deg, ${top} 0%, ${mid} 46%, #FDFAF5 100%)`;
  } catch {
    /* A wash is decoration. If it cannot be derived the page keeps its
       default and nothing about the invitation is affected. */
    return null;
  }
}
