/* May we message this guest right now?
 *
 * One rule, one file, because it was four copies and they drifted.
 *
 * On 17/08 a cooldown was added so nobody receives six messages in a day. It
 * has two floors: 24 hours before a first contact, 72 before a reminder. The
 * first-contact group got them, the reminder group got them, and the event
 * selection — written an hour later — got only the 24. A guest last messaged
 * thirty hours earlier passed selection and failed the send, so on the evening
 * of 18/08 two runs chose an event with nobody to message while another wedding
 * had 204 eligible guests and 204 of the day's quota expired unused.
 *
 * The bug was mine and the shape is familiar: the same question answered in
 * more than one place, agreeing until the day it mattered. It happened this
 * week with the venue address, the couple's names, the reminder template, and
 * the "next run" line. In each case the cure was the same — one function, every
 * caller importing it — and none of those has broken since.
 *
 * So the floors live here. A future change to either of them lands everywhere
 * or nowhere; there is no third option any more.
 */

/** Hours of quiet before a guest who has never received anything is contacted. */
export const FIRST_CONTACT_COOLDOWN_H = 24;

/** Hours of quiet before a guest who already has the invitation is reminded.
 *
 * 120 and not 72, measured on 26/08 over 1,000 reminders actually sent: a
 * guest who receives one answers 93% of the time, and a guest who receives a
 * second answers 25%. Three days was close enough to the first reminder that
 * the second arrived while the first was still being ignored, and at ~0.48₪ a
 * message the difference is real money spent on people who had already decided
 * not to answer yet.
 *
 * Five days also puts the second reminder further from the first without
 * pushing it past the wedding: every event here is booked months out. */
export const REMINDER_COOLDOWN_H = 120;

/** How many reminders one guest may receive, ever.
 *
 * Three, and the number was chosen from what a cap would actually do rather
 * than from the conversion table alone.
 *
 * The table says reminders one and two produced 276 of 312 answers, which
 * argues for two. But every pending guest across the three live weddings has
 * had 0, 1 or 2 — nobody has had three. A cap of two therefore does not
 * "stop the waste"; it silences 209 of 413 people the same afternoon, 91 of
 * them at a wedding thirteen days away, and those 209 received their second
 * reminder under the old 72-hour floor, so none of them has yet been asked
 * once at the new five-day spacing.
 *
 * Three gives each of them exactly one more attempt, properly spaced, and
 * then stops for good. Nobody ever receives a fourth.
 *
 * The 90% answer rate in the 3+ rows of that table is not evidence against
 * this: those buckets hold five to twelve people each and are the guests Dvir
 * was also chasing by hand.
 *
 * Not a refusal to ever contact them again — the manual station still lists
 * them, and a person choosing to call is a different act from a system
 * sending a fourth identical template. */
export const MAX_REMINDERS_PER_GUEST = 3;

export interface ContactState {
  /** A delivery report actually arrived — delivered or read. Accepted is not enough. */
  delivered: boolean;
  /** ISO timestamp of the last outbound message, successful or failed, or null. */
  lastOutboundAt: string | null;
  /** Reminders already sent to this guest. Omitted means "not counted", and
      the cap is then not applied — every existing caller keeps its behaviour
      until it passes the number. */
  remindersSent?: number;
}

/** The floor that applies to this guest, in hours. */
export function cooldownHours(c: ContactState): number {
  return c.delivered ? REMINDER_COOLDOWN_H : FIRST_CONTACT_COOLDOWN_H;
}

/**
 * True when enough quiet has passed to message this guest again.
 *
 * Deliberately says nothing about WHICH message: the caller decides that from
 * `delivered`, and the two are separate questions. `nowMs` is injectable so the
 * tests do not depend on the clock.
 */
export function isEligibleNow(c: ContactState, nowMs: number = Date.now()): boolean {
  /* Only ever caps reminders. A guest nothing reached is not "reminded" no
     matter how many attempts failed, and must stay reachable. */
  if (c.delivered && (c.remindersSent ?? 0) >= MAX_REMINDERS_PER_GUEST) return false;
  if (!c.lastOutboundAt) return true;
  const floor = new Date(nowMs - cooldownHours(c) * 3_600_000).toISOString();
  return c.lastOutboundAt < floor;
}

/**
 * When does this guest become eligible? Null when never again.
 *
 * `isEligibleNow` answers "now", and every screen and every send has only ever
 * needed that. But the question Dvir actually asks is the other one — "מחר
 * יישלחו הודעות? למי?" — and it was answered by hand each time, wrongly at
 * least once: on 27/08 the reply was "150-180 tomorrow", computed from the
 * quota still available rather than from the guests actually due. Thirteen
 * were due. Quota is what we may spend; this is what there is to spend it on,
 * and only the second one is an answer.
 */
export function eligibleAt(c: ContactState): number | null {
  if (c.delivered && (c.remindersSent ?? 0) >= MAX_REMINDERS_PER_GUEST) return null;
  if (!c.lastOutboundAt) return 0;               /* due now, and always has been */
  return new Date(c.lastOutboundAt).getTime() + cooldownHours(c) * 3_600_000;
}

/**
 * How many of these guests come due inside a window.
 *
 * Counts the ones whose floor lifts before `untilMs` — including those already
 * past it, because a guest who was due yesterday and did not get a message is
 * still waiting today. That is the whole point: the number is a backlog, not a
 * schedule.
 */
export function dueWithin(
  guests: ContactState[], untilMs: number, nowMs: number = Date.now(),
): { now: number; soon: number; never: number } {
  let now = 0, soon = 0, never = 0;
  for (const g of guests) {
    const at = eligibleAt(g);
    if (at === null) { never++; continue; }
    if (at <= nowMs) now++;
    else if (at <= untilMs) soon++;
  }
  return { now, soon, never };
}
