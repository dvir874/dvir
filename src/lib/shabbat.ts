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

/* Israel's latest Shabbat exit is ~20:30; 21:00 clears it year-round. */
const MOTZASH_HOUR = 21;

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
  /* Saturday is blocked until 21:00, not until midnight.
   *
   * It used to run to the end of the civil day, which was the safe thing to
   * write and the wrong thing to keep: Shabbat goes out around 20:10 in August
   * and the block ran four more hours past it, so מוצ״ש — the best sending hour
   * of the Israeli week, when everyone is back and holding their phone — was
   * unreachable. Dvir asked for 21:00 on מוצ״ש and the guard would have eaten
   * it in silence.
   *
   * 21:00 rather than the actual זמן, deliberately. The latest Shabbat leaves
   * in Israel is about 20:30, so this clears every week of the year without
   * computing anything. In winter it is over-cautious by a few hours, which is
   * the error worth making: a message that goes out late is a message, and one
   * that goes out during Shabbat is a phone call from a guest. */
  if (day === "Sat" && hour < MOTZASH_HOUR) {
    return { blocked: true, reason: "shabbat" };
  }
  return { blocked: false };
}
