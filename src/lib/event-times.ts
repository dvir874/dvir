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
