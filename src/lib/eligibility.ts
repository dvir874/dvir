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

/** Hours of quiet before a guest who already has the invitation is reminded. */
export const REMINDER_COOLDOWN_H = 72;

export interface ContactState {
  /** A delivery report actually arrived — delivered or read. Accepted is not enough. */
  delivered: boolean;
  /** ISO timestamp of the last outbound message, successful or failed, or null. */
  lastOutboundAt: string | null;
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
  if (!c.lastOutboundAt) return true;
  const floor = new Date(nowMs - cooldownHours(c) * 3_600_000).toISOString();
  return c.lastOutboundAt < floor;
}
