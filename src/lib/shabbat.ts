/* No messages on Shabbat.
 *
 * The sender runs at 11:15 and 19:30 Israel time, every day. In August, Shabbat
 * comes in around 19:05 and goes out around 20:10, so three of the week's runs
 * land inside it: Friday evening, Saturday morning and Saturday evening. The
 * Saturday evening one is the least obvious and the most certain — 19:30 is
 * before havdalah every summer week of the year.
 *
 * This does not compute candle-lighting. Zmanim shift by an hour across the
 * year and by minutes across the country, and a guest receiving a wedding
 * invitation eight minutes into Shabbat is the kind of mistake that is not
 * repaired by an apology. The rule is therefore deliberately wider than Shabbat
 * itself: nothing goes out from Friday midday until Sunday. It can never be
 * wrong, it needs no table to maintain, and it costs two of the week's ten runs.
 *
 * Dvir's own guest list is army friends and family from Hadera; the client's is
 * a religious wedding in Gush Etzion whose chuppah is set before sunset. For one
 * of them this is a courtesy. For the other it is the difference between being
 * trusted with their guests and not.
 */

export type ShabbatVerdict = { blocked: boolean; reason?: string };

/* Friday midday through the end of Saturday, Israel time — whatever the server's
   own clock is set to. */
export function shabbatBlock(now: Date = new Date()): ShabbatVerdict {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem", weekday: "short", hour: "2-digit", hour12: false,
  }).formatToParts(now);
  const day  = parts.find(p => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find(p => p.type === "hour")?.value ?? "0");

  if (day === "Fri" && hour >= 12) {
    return { blocked: true, reason: "shabbat_eve" };
  }
  if (day === "Sat") {
    return { blocked: true, reason: "shabbat" };
  }
  return { blocked: false };
}
