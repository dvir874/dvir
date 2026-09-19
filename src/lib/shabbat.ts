/* No messages on Shabbat, and none on a חג.
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
 *
 * ── The חגים, added 09/09/2026 ──
 *
 * The guard knew about Friday and Saturday and nothing else, which is fine for
 * eleven months of the year and catastrophic in Tishrei. Three dates were about
 * to go out:
 *
 *   13/09  ראש השנה ב׳, a Sunday   — איילת's send_paused_until expires 05:00
 *                                    that morning, so her 253 invitations were
 *                                    her wedding's first contact with 253
 *                                    strangers, on חג
 *   21/09  יום כיפור, a Monday     — "מחר מתחתנים" for BOTH 22/09 weddings,
 *                                    361 confirmed guests
 *   26/09, 03/10                    — Shabbat as well, so already covered
 *
 * From a number that is TIER_250 and not_verified and has already been
 * restricted once, on 9/8, for two days. A wedding invitation arriving on the
 * morning of יום כיפור is the single likeliest message in this system to be
 * reported as spam, and the report would land on the account every client
 * depends on.
 *
 * The table is explicit Gregorian dates rather than a runtime conversion. A
 * חג begins at sunset the evening before, so a date-to-date conversion is
 * wrong by half a day in exactly the direction that hurts, and a hardcoded
 * list is the only version of this that can be read and checked by a person.
 * It runs out after 5790 and when it does the guard opens rather than closes:
 * a missing year sends normally, which is the failure worth having.
 */

/* Israel's latest Shabbat exit is ~20:30; 21:00 clears it year-round, and the
   same hour clears the end of a חג. */
const MOTZASH_HOUR = 21;

/* Friday is blocked from midday.
 *
 * Deliberately far from the actual זמן: Israel's earliest candle-lighting is
 * around 16:15 on a late-December Friday, and one number has to clear every
 * Friday of the year without computing anything. In summer it is six hours
 * early, which is the error worth making — a message that waits is a message,
 * one that lands after candle-lighting is a phone call. */
const EVE_HOUR = 12;

/* Erev חג is blocked from 16:00, not from midday.
 *
 * It shared EVE_HOUR with Friday, and Dvir asked on 19/09 whether a send could
 * still go out at 14:00 or 15:00 on ערב יום כיפור. It could not, and the noon
 * cutoff was costing two of the eight daily runs on the one afternoon that
 * mattered — 13:30 and 16:00 Israel — in a window already narrowed by the חג
 * that follows.
 *
 * The two dates are not the same problem. Every חג in the Jewish year falls in
 * spring or autumn, so the earliest a חג has ever begun in Israel is around
 * 17:00 — a late-October Simchat Torah after the clock change. A December
 * Friday at 16:15 has no equivalent among them, which is the whole reason
 * Friday keeps the earlier hour.
 *
 * 16:00 leaves an hour on the earliest חג of any year and nearly two on Yom
 * Kippur 2026, and a run finishes in minutes. The 13:30 run now sends; the
 * 16:00 run does not, and that margin is the point. */
const YOM_TOV_EVE_HOUR = 16;

/* Days on which work is forbidden in Israel: ראש השנה (two days), יום כיפור,
   סוכות א׳, שמיני עצרת, פסח א׳ ו-ז׳, שבועות. Chol HaMoed is not here on
   purpose — weddings are held then and messages are ordinary.
   Generated from the Hebrew calendar and checked against 5787's known dates:
   Rosh Hashana 12–13/09/2026, Yom Kippur 21/09/2026, Pesach 22/04/2027. */
const YOM_TOV: ReadonlySet<string> = new Set([
  "2026-09-12", // שבת   א׳ תשרי — ראש השנה א׳
  "2026-09-13", // ראשון ב׳ תשרי — ראש השנה ב׳
  "2026-09-21", // שני   י׳ תשרי — יום כיפור
  "2026-09-26", // שבת   ט״ו תשרי — סוכות א׳
  "2026-10-03", // שבת   כ״ב תשרי — שמיני עצרת
  "2027-04-22", // חמישי ט״ו ניסן — פסח א׳
  "2027-04-28", // רביעי כ״א ניסן — שביעי של פסח
  "2027-06-11", // שישי  ו׳ סיוון — שבועות
  "2027-10-02", // שבת   א׳ תשרי — ראש השנה א׳
  "2027-10-03", // ראשון ב׳ תשרי — ראש השנה ב׳
  "2027-10-11", // שני   י׳ תשרי — יום כיפור
  "2027-10-16", // שבת   ט״ו תשרי — סוכות א׳
  "2027-10-23", // שבת   כ״ב תשרי — שמיני עצרת
  "2028-04-11", // שלישי ט״ו ניסן — פסח א׳
  "2028-04-17", // שני   כ״א ניסן — שביעי של פסח
  "2028-05-31", // רביעי ו׳ סיוון — שבועות
  "2028-09-21", // חמישי א׳ תשרי — ראש השנה א׳
  "2028-09-22", // שישי  ב׳ תשרי — ראש השנה ב׳
  "2028-09-30", // שבת   י׳ תשרי — יום כיפור
  "2028-10-05", // חמישי ט״ו תשרי — סוכות א׳
  "2028-10-12", // חמישי כ״ב תשרי — שמיני עצרת
  "2029-03-31", // שבת   ט״ו ניסן — פסח א׳
  "2029-04-06", // שישי  כ״א ניסן — שביעי של פסח
  "2029-05-20", // ראשון ו׳ סיוון — שבועות
]);

export type ShabbatVerdict = { blocked: boolean; reason?: string };

/** The day after an ISO calendar date, as an ISO calendar date. */
function nextDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** 0 = Sunday. Computed from the calendar date, never from a timezone. */
function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/**
 * The whole rule, as a function of an Israeli calendar date and hour — so the
 * same logic answers "may I send right now" and "would last night's run have
 * been allowed to send", which is what the wedding-morning fallback needs.
 */
export function blockedAt(dateIL: string, hour: number): ShabbatVerdict {
  const day = weekdayOf(dateIL);

  /* A חג is blocked until 21:00, the same as Shabbat.
   *
   * This used to run to midnight, and the reasoning written here was that
   * מוצאי חג has no equivalent claim to מוצ״ש: the 21:30 run on 21/09 would
   * have carried "מחר מתחתנים" to hundreds of confirmed guests while people
   * were breaking the Yom Kippur fast, which is the message in this system
   * most likely to be reported, from a number Meta is reviewing.
   *
   * Dvir was shown that argument on 19/09 and decided against it: he wants
   * תהל ואביב's details going out at 21:00 on מוצאי כיפור. It is his number
   * and his risk, and the reasoning above is left in full so the trade is
   * visible to whoever reads this next rather than buried in a diff.
   *
   * 21:00 and not the actual זמן, for the same reason Shabbat uses 21:00: Yom
   * Kippur ends around 19:30 in September and the latest חג in the year leaves
   * well before 21:00, so one number clears every date without computing
   * anything, and erring late is the error worth making.
   *
   * The fall-through below stays correct for a chained חג: if tomorrow is also
   * יום טוב, or this is a Friday, the eve rules catch hour 21 and block it.
   *
   * Consequence worth knowing: eveningBeforeBlocked asks about hour 21, so a
   * wedding whose eve is a חג no longer reports its evening as blocked, and
   * the wedding-morning fallback no longer fires for it. The day-before send
   * at 21:00 is what covers those guests now. */
  if (YOM_TOV.has(dateIL) && hour < MOTZASH_HOUR) return { blocked: true, reason: "yom_tov" };
  if (YOM_TOV.has(nextDay(dateIL)) && hour >= YOM_TOV_EVE_HOUR) return { blocked: true, reason: "yom_tov_eve" };

  if (day === 5 && hour >= EVE_HOUR) return { blocked: true, reason: "shabbat_eve" };
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
  if (day === 6 && hour < MOTZASH_HOUR) return { blocked: true, reason: "shabbat" };

  return { blocked: false };
}

/* Friday midday through the end of Saturday, and every חג, Israel time —
   whatever the server's own clock is set to. */
export function shabbatBlock(now: Date = new Date()): ShabbatVerdict {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const dateIL = `${get("year")}-${get("month")}-${get("day")}`;
  /* Intl renders midnight as "24" in some ICU versions; 24 and 0 are the same
     hour and both are inside every block that starts at 12 and ends at 21. */
  const hour = Number(get("hour")) % 24;
  return blockedAt(dateIL, hour);
}

/** The LAST hour on the eve at which a message can still go out.
 *
 * This asked about 19:00, and the sending window runs to 21:00 — the crons put
 * real runs at 21:30 and 22:30 Israel time. So a Saturday eve was reported
 * blocked (Shabbat is blocked until 21:00) when the 21:30 run would in fact
 * have sent, and every Sunday wedding was told its eve had failed. The
 * wedding-morning fallback then stayed open for them permanently, which turns
 * a couple's explicit "מחר מתחתנים" choice into "היום מתחתנים" for anybody who
 * confirmed overnight.
 *
 * The question this file is asked is "could the eve message have gone out at
 * all", so the hour must be the last one that could carry it, not the first. */
export const EVE_SEND_HOUR = 21;

/**
 * Would the evening-before run, the night before this wedding, have been
 * allowed to send?
 *
 * A wedding whose eve falls on יום כיפור or on Shabbat gets no "מחר מתחתנים",
 * and until now that was the end of it: the guests simply never learned what
 * time to arrive. The guard turned a bad message into no message, which is not
 * an improvement. The wedding-morning send reads this and covers the gap.
 *
 * `weddingDate` is the events.date column — an Israeli calendar date.
 */
export function eveningBeforeBlocked(weddingDate: string): ShabbatVerdict {
  const clean = String(weddingDate ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return { blocked: false };
  const [y, m, d] = clean.split("-").map(Number);
  const eve = new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
  return blockedAt(eve, EVE_SEND_HOUR);
}
