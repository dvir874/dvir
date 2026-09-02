/* Text handed to WhatsApp through a wa.me link.
 *
 * wa.me?text=… is how every manual message in this system reaches Dvir's
 * WhatsApp: the invitation he sends by hand to a guest Meta refused, the
 * thank-you, the weekly summary. The link is built correctly — the source is
 * UTF-8, the emoji are intact, and encodeURIComponent round-trips exactly —
 * and WhatsApp Desktop then mangles it on the way into the compose box.
 *
 * What Dvir saw on 02/09, pasted back:
 *     � *הזמנה רשמית* �
 *     אתם מוזמנים לחגוג איתנו �
 *
 * Hebrew survived and every emoji became U+FFFD. Hebrew is two UTF-8 bytes;
 * ✨ is three and 🎊 is four. Anything past two bytes comes through broken,
 * which takes the em dash and the ellipsis and the ──── separators with it —
 * this is not only an emoji problem.
 *
 * It is their bug, and it is still our message: these go to the guests who
 * already failed automated delivery, so a message full of � is the worst place
 * for it to happen. The fix belongs here, at the boundary, rather than in
 * seven message strings that the next one added would not inherit.
 *
 * Its own import-free file so it can be tested, the same reason
 * phone-validate.ts and guest-count.ts are.
 */

/** Typography with a plain equivalent — kept, not dropped. */
const FOLD: Array<[RegExp, string]> = [
  [/[—–‒―]/g, "-"],
  [/[─━]/g, "-"],
  [/…/g, "..."],
  [/[“”„]/g, '"'],
  [/[‘’‚]/g, "'"],
  [/[   ]/g, " "],
  [/[•·]/g, "-"],
];

/**
 * Fold text down to what survives the trip into WhatsApp's compose box.
 *
 * A line that held nothing but emoji is dropped rather than left blank — the
 * invitation pointed at its link with a lone 👇, and an empty line where that
 * was reads as a mistake. A line that was already blank is kept, because the
 * paragraph breaks are what make these messages readable.
 */
export function waPrefill(text: string): string {
  const lines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");

  const out = lines.map(line => {
    let s = line;
    for (const [re, to] of FOLD) s = s.replace(re, to);
    s = s
      .replace(/[\p{Extended_Pictographic}️‍⃣]/gu, "")
      .replace(/ {2,}/g, " ")
      .replace(/ +$/g, "");
    /* Emptied by the strip rather than written empty. */
    return line.trim() && !s.trim() ? null : s;
  }).filter(s => s !== null) as string[];

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
