/* The one line of a wedding invitation that cannot be defaulted.
 *
 * It used to be a constant — "קבלת פנים 19:00 | חופה וקידושין 20:00" — written
 * when there was one wedding in the system and left in place when the template
 * was made generic. Three of the template's four variables were wired to the
 * event; this was the fourth.
 *
 * אורי ✧ שחר receive at 17:30 and stand under the chuppah at 18:15, set before
 * sunset on purpose. Sending their 327 households 19:00 and 20:00 would have
 * put some of them in the car while the chuppah was happening — and nothing
 * downstream would have flagged it, because a wrong time is a valid string.
 *
 * Returns null when either time is missing, and the callers refuse to send.
 * That mirrors wa_header_image_url: a missing invitation image already stops a
 * send rather than falling back to another couple's card. Guessing is what
 * produced this line in the first place. */

export interface EventTimeFields {
  reception_time?: string | null;
  chuppah_time?: string | null;
}

export function eventTimes(event: EventTimeFields | null | undefined): string | null {
  const reception = String(event?.reception_time ?? "").trim();
  const chuppah   = String(event?.chuppah_time ?? "").trim();
  if (!reception || !chuppah) return null;
  return `קבלת פנים ${reception} | חופה וקידושין ${chuppah}`;
}

/* ── the date, on a device that is not in Israel ─────────────────────────── */

/**
 * events.date as a calendar day, not an instant.
 *
 * It is stored as "2026-09-08" and every screen passed it straight to
 * `new Date(...)`, which parses a bare date as midnight UTC. Rendering that
 * with toLocaleDateString then uses the DEVICE's timezone, so anywhere west of
 * UTC it lands on the previous evening: שחר's invitation printed "7 בספטמבר"
 * to a guest whose phone was in New York, and the Google Calendar button beside
 * it booked the 7th.
 *
 * Israel is UTC+3 in September, so nothing about this is visible from here —
 * which is exactly why it survived.
 *
 * Building the date from its parts gives local midnight instead, and a
 * calendar day rendered from local midnight is the same day everywhere.
 * Returns null for anything that is not a plain YYYY-MM-DD, so a caller can
 * fall back rather than print "Invalid Date".
 */
export function eventDay(date: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(date ?? "").trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}
