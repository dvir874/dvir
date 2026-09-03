/* "היום מתחתנים" — the message for guests the eve could not reach.
 *
 * Meta counts distinct recipients in a ROLLING 24 hours. תהל and לאל married
 * on the same Tuesday, so the evening of 21/09 needs 334 day-before messages
 * against a cap of 250: the send fills the cap, stops mid-list, and 84 people
 * arrive at a venue not knowing when to come or where to sit.
 *
 * The window is rolling, not daily. Those 84 can be told the next morning, by
 * which time the eve's batch has aged out and the whole allowance is free
 * again — see send-forecast.ts for the arithmetic that predicts the shortfall.
 *
 * This is deliberately a CATCH-UP and not a schedule. Nothing here decides in
 * advance which wedding gets pushed to the morning; it asks, on the day, who
 * did not get the message, and sends to exactly those. That covers the cap
 * running out and every other reason a guest was missed — a transient failure,
 * a guest confirming after the eve's send, an event unpaused too late — none of
 * which a planner would have predicted.
 *
 * Import-free, like send-window.ts and send-forecast.ts. The decision about who
 * has still not been told when to arrive should be testable without a database.
 */

/** Israel hours during which a "today" message is worth sending. */
export const DAY_OF_FROM_HOUR = 8;
/* Not the whole day. By mid-afternoon the couple is at the venue, guests are
   dressing, and a message about a reception at 17:45 stops being information
   and becomes noise at the worst possible moment. Anyone still unreached after
   this needs a phone call, and the run report says so. */
export const DAY_OF_UNTIL_HOUR = 15;

export interface DayOfWindow {
  send: boolean;
  /** Why not, for the run record. Absent when sending. */
  reason?: "not_today" | "too_early" | "too_late";
}

/**
 * Whether this run should carry the day-of message.
 *
 * `hour` is the hour in Israel, `weddingDate` and `today` are YYYY-MM-DD in
 * Israel. Both are passed in rather than read, because a function that decides
 * on the wedding day must not depend on the timezone the server happens to be
 * in — that exact bug once sent "tomorrow" messages a day early in UTC.
 */
export function dayOfWindow(weddingDate: string, today: string, hour: number): DayOfWindow {
  if (weddingDate !== today) return { send: false, reason: "not_today" };
  if (hour < DAY_OF_FROM_HOUR) return { send: false, reason: "too_early" };
  if (hour >= DAY_OF_UNTIL_HOUR) return { send: false, reason: "too_late" };
  return { send: true };
}

export interface DayOfGuest {
  id: string;
  /** Confirmed guests only — the message carries an arrival time. */
  status: string;
  phone?: string | null;
  category?: string | null;
  do_not_contact?: boolean | null;
}

/**
 * Who still has not been told when to arrive.
 *
 * A guest is a target only if they were never sent the eve message AND never
 * sent this one. The second half is what makes the function safe to call on
 * every run of the wedding day: six runs between 08:00 and 15:00, and nobody
 * hears it twice.
 */
export function dayOfTargets(
  guests: DayOfGuest[],
  gotDayBefore: Set<string>,
  gotDayOf: Set<string>,
): string[] {
  return guests
    .filter(g =>
      g.status === "confirmed"
      && String(g.phone ?? "").trim()
      && g.category !== "demo"
      && !g.do_not_contact
      && !gotDayBefore.has(g.id)
      && !gotDayOf.has(g.id))
    .map(g => g.id);
}
