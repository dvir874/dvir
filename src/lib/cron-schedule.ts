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
 */
export const CRON_UTC: readonly [number, number][] = [
  [6, 0], [7, 0], [8, 15], [10, 30], [13, 0], [16, 30], [18, 30], [18, 50],
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
