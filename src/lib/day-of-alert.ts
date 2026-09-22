/* The alert that goes to Dvir when the day-of run could not reach everybody.
 *
 * On 22/09 two weddings shared a Tuesday. The eve run filled the 250-recipient
 * ceiling, two confirmed guests of תהל ואביב were never told when to arrive,
 * and Dvir heard nothing about it — notifyDayOf returned early on `budget <= 0`
 * without ever counting them, so the alert whose own text reads "התקרה נגמרה —
 * צריך להתקשר אליהם" could not fire in the one situation it was written for.
 *
 * The count alone was never the deliverable. Three times in one week this
 * system reported a number with no way to act on it — שלמה's sixteen, איילת's
 * forty-one, and this — so the line carries the names, the numbers, and a link
 * that opens a WhatsApp draft already addressed to that guest.
 *
 * Import-free so it can be tested without a database, like send-window.ts and
 * day-of.ts, and single-line because it rides in a Meta template parameter: a
 * parameter containing a newline is rejected with error 132000 and takes the
 * whole alert down with it. Every join below is a separator, never a break.
 */

export interface WaitingGuest {
  name?: string | null;
  phone?: string | null;
  /** The guest's rsvp_token — what /s/<token> resolves. */
  token?: string | null;
}

/** How many guests to name before falling back to a count.
 *
 * Three rather than all of them: the parameter has a length limit, and a wall
 * of forty links on a phone is the same unusable report as a bare number. If
 * the tail is long the answer is not a longer alert, it is the admin screen. */
export const NAMED_IN_ALERT = 3;

/** Nothing in a template parameter may contain a newline — see 132000. */
const oneLine = (s: string) => s.replace(/\s*\n+\s*/g, " ").replace(/ {2,}/g, " ").trim();

/**
 * One line naming who still has not been told when to arrive.
 *
 * @param waiting  the guests the budget could not reach
 * @param base     APP_URL, for the /s/ redirect. Omitted, names and numbers
 *                 still come through — a phone number he can dial by hand is
 *                 worth more than an empty string.
 * @param max      how many to name before "ועוד N"
 *
 * Returns "" for an empty list, so the caller can treat it as falsy rather
 * than sending an alert about nobody.
 */
export function dayOfAlertLine(
  waiting: WaitingGuest[],
  base?: string | null,
  max: number = NAMED_IN_ALERT,
): string {
  const real = (waiting ?? []).filter(w => String(w?.name ?? "").trim() || String(w?.phone ?? "").trim());
  if (!real.length) return "";

  const cap = Math.max(1, max);
  const named = real.slice(0, cap).map(w => {
    const parts = [String(w.name ?? "").trim(), String(w.phone ?? "").trim()].filter(Boolean);
    /* The link last, so the name and number are still readable if a client
       truncates the line. */
    if (base && String(w.token ?? "").trim()) {
      parts.push(`${String(base).replace(/\/+$/, "")}/s/${String(w.token).trim()}`);
    }
    return parts.join(" ");
  });

  const rest = real.length - named.length;
  return oneLine(named.join(" · ") + (rest > 0 ? ` · ועוד ${rest}` : ""));
}

/**
 * The whole `attention` field: what happened, then who.
 *
 * Kept here rather than in the cron so the sentence and the list are tested
 * together — the list is useless without the reason, and the reason without
 * the list is the failure this file exists to end.
 */
export function dayOfAlertText(
  unreached: number,
  waiting: WaitingGuest[],
  base?: string | null,
  max: number = NAMED_IN_ALERT,
): string {
  const who = dayOfAlertLine(waiting, base, max);
  const head = unreached === 1
    ? "מוזמן אחד עדיין לא יודע מתי להגיע והחתונה היום."
    : `${unreached} מוזמנים עדיין לא יודעים מתי להגיע והחתונה היום.`;
  /* Named separately from the count: the count is every guest the budget
     missed, the list is as many as fit. They are allowed to disagree. */
  return oneLine(`${head} התקרה נגמרה — לחץ על הקישור ושלח מהטלפון שלך.${who ? " " + who : ""}`);
}
