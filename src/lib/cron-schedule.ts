/* When the cron actually runs. One list, because there were two.
 *
 * vercel.json schedules eight runs a day. /api/admin/morning knew all eight;
 * /api/admin/wa-runs — the screen and the alarm that report a MISSED run —
 * knew two, [8, 16]. So six of the eight were invisible to the only thing
 * watching for a run that did not happen, and any of them could stop firing
 * without a word.
 *
 * The two lists lived in two files and drifted, which is what a schedule
 * written down twice always does. This is the one place it is written.
 *
 * In UTC, because that is what Vercel schedules in. Israel is UTC+3 in summer
 * and +2 in winter, so anything showing these to a person must convert through
 * Intl rather than adding three — see israelHourOf below.
 *
 * The last slot is 19:30 and not 18:50 because of מוצ״ש. Sending is blocked on
 * Saturday until 21:00 Israel (see shabbat.ts). In summer 18:30 and 18:50 UTC
 * land at 21:30 and 21:50, so both served מוצ״ש; from 25/10/2026 they land at
 * 20:30 and 20:50, and מוצ״ש — the best sending hour of the Israeli week —
 * would have had no run at all, silently, on the schedule. No single UTC time
 * is after 21:00 Israel in both seasons, so the pair splits the year instead:
 * 18:30 serves מוצ״ש in summer and 19:30 serves it in winter, each refused by
 * the hour guard in the other season. The cost is twenty minutes off the last
 * summer run.
 *
 * 06:00 goes the same way in reverse — 09:00 Israel in summer, 08:00 in winter,
 * where HOUR_START_IL refuses it. That one is left alone: 07:00 UTC is 09:00
 * Israel in winter, so the morning is still served and only a slot is lost.
 */
export const CRON_UTC: readonly [number, number][] = [
  [6, 0], [7, 0], [8, 15], [10, 30], [13, 0], [16, 30], [18, 30], [19, 30],
];

/** How many runs a full day should contain. */
export const RUNS_PER_DAY = CRON_UTC.length;

/** The hour a person would call it, honouring daylight saving. */
export function israelHourOf(utcHour: number, utcMinute = 0): string {
  const d = new Date(Date.UTC(2026, 0, 1, utcHour, utcMinute));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d);
}

/**
 * The scheduled slot a run at `at` belongs to, as an index into CRON_UTC.
 *
 * Matched forward — a run belongs to the last slot at or before it, up to the
 * next slot — rather than to whichever slot is nearest. 18:30 and 18:50 are
 * twenty minutes apart, and a symmetric window would award a late 18:30 run to
 * the 18:50 slot and then report 18:30 as missed.
 */
export function slotOf(at: Date): number | null {
  const mins = at.getUTCHours() * 60 + at.getUTCMinutes();
  let found: number | null = null;
  for (let i = 0; i < CRON_UTC.length; i++) {
    const [h, m] = CRON_UTC[i];
    if (mins >= h * 60 + m) found = i; else break;
  }
  return found;
}

/* ── Israel time, honestly ────────────────────────────────────────────────
 *
 * Israel is UTC+3 in summer and +2 in winter, and the changeover on
 * 25/10/2026 is the sort of date that arrives while nobody is looking. Three
 * places added three hours to a UTC timestamp and called the result Israel
 * time; from that Sunday they would all read an hour early, and the 06:00 UTC
 * cron would land at 08:00 Israel and be refused by HOUR_START_IL = 9 — a run
 * that simply stops happening, on the schedule, with no error anywhere.
 *
 * Intl knows the rule. These do the same jobs the arithmetic did.
 */

const IL = "Asia/Jerusalem";

/** "HH:MM" in Israel, for a moment in time. */
export function israelClock(at: Date | number): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IL, hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(at);
}

/** "YYYY-MM-DD" — the Israeli calendar day a moment falls in. */
export function israelDay(at: Date | number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IL, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(at);
}

/** The hour of the Israeli day, 0-23. */
export function israelHour(at: Date | number): number {
  return Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: IL, hour: "2-digit", hour12: false,
  }).format(at));
}
