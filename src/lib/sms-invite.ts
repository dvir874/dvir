/** The SMS a guest with no WhatsApp receives.
 *
 * It used to be two lines — the couple's names and a link — and that was a
 * deliberate choice, not an oversight. A Hebrew SMS is UCS-2, 70 characters to
 * a segment, and the full URL was 70 on its own; יעקב בן שושן reported on
 * 20/08 that he tapped a link with no address. Everything was cut until the
 * message and the link fitted one segment together.
 *
 * Dvir, 07/09, having opened one: "אני רוצה שזה יעשה טקסט מורחב יותר שהאורח
 * יבין לאן הוא מגיע — שזה חתונה, עם הפרטים, הכול." He is right, and the
 * reasoning that produced the short version is worth separating into its two
 * halves, because only one of them still holds.
 *
 * The half that does not: cost. These are sent from Dvir's own phone by
 * tapping a link, not through a paid gateway, so segments are free.
 *
 * The half that does: a URL must never be what a split lands in the middle of.
 * So the link goes LAST, alone on its own line, after every word of the
 * message — a break in the middle of Hebrew prose costs nothing, a break
 * inside a URL costs the guest. And the short /r/<8> form stays, 39 characters
 * rather than 70, so the link is comfortably inside whatever segment it ends
 * up in.
 *
 * Import-free, and shared by /admin/sms and the nightly report, because two
 * copies of the same message is how they drift — this file exists at all
 * because a message written twice was already written differently twice. */

export type SmsEvent = {
  couple: string;
  /** Already formatted for a person: "יום שלישי, 22 בספטמבר 2026". */
  date?: string | null;
  venue?: string | null;
  reception?: string | null;
  chuppah?: string | null;
};

/** The bare host, no scheme — phones linkify it and it saves nine characters. */
export function smsHost(appUrl: string | undefined): string {
  return (appUrl ?? "https://regalifnei.vercel.app").replace(/^https?:\/\//, "");
}

/**
 * `token` is the guest's rsvp_token; only its first eight characters travel,
 * which is what /r/ resolves.
 */
export function smsInvite(ev: SmsEvent, token: string, appUrl?: string): string {
  const lines: string[] = [
    `אתם מוזמנים לחתונה של ${ev.couple}`,
  ];

  /* Each detail only if we actually have it. A line reading "קבלת פנים
     undefined" is worse than a message that never mentions the hour. */
  const when: string[] = [];
  if (ev.date?.trim()) when.push(ev.date.trim());
  if (ev.venue?.trim()) when.push(ev.venue.trim());

  const times = [
    ev.reception?.trim() ? `קבלת פנים ${ev.reception.trim()}` : null,
    ev.chuppah?.trim() ? `חופה ${ev.chuppah.trim()}` : null,
  ].filter(Boolean).join(" | ");
  if (times) when.push(times);

  if (when.length) lines.push("", ...when);

  /* Last, and alone. See the note at the top of this file. */
  lines.push("", "לאישור הגעה:", `${smsHost(appUrl)}/r/${token.slice(0, 8)}`);

  return lines.join("\n");
}
