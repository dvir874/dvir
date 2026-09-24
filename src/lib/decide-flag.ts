/* Whether wa-decide.ts decides, or only watches.
 *
 * decide() has been a shadow since it was written: wa-conversation.ts keeps
 * its own branching and decide() runs beside it, logging where the two differ.
 * Turning that around touches every inbound message on every live wedding, so
 * it is not turned around — it is opened, one wedding at a time, behind a
 * value that can be cleared in Vercel without a deploy.
 *
 * Dvir's conditions, 23–24/09, and they are the whole design of this file:
 *
 *   · one event first — the one with the fewest active guests
 *   · a flag that turns off without a deploy
 *   · three clean days before widening
 *   · clean means zero disagreements AND at least twenty free-text messages
 *     actually evaluated, because zero out of zero is what a broken pipe looks
 *     like and it would otherwise read as success
 *   · off on 05/10 regardless of results — three days before שלמה's wedding,
 *     so the highest-stakes week runs on the code we already trust
 *
 * Import-free, like wa-decide.ts and day-of.ts, so the rule that decides
 * whether a parser is live can be tested without a database or an environment.
 */

/** The environment variable. Cleared or unset means shadow everywhere. */
export const DECIDE_FLAG = "WA_DECIDE_LIVE_EVENT_ID";

/** Everyone. Only after three clean days, and never before 05/10 has passed. */
export const ALL = "*";

/** Off on this date whatever the numbers say — שלמה marries on 08/10. */
export const SHUTDOWN_ON = "2026-10-05";

/** Below this, "no disagreements" is not evidence of anything. */
export const MIN_FREE_TEXT = 20;

/**
 * Is decide() authoritative for this event right now?
 *
 * @param eventId  the guest's event, or null/undefined when unknown — which
 *                 resolves to false, because an unknown event is not the one
 *                 event that was opened.
 * @param raw      the value of WA_DECIDE_LIVE_EVENT_ID.
 *
 * Unset, empty, or whitespace → false. That is today's behaviour exactly, and
 * it is what clearing the variable in Vercel restores in the next request.
 */
export function decideIsLive(
  eventId: string | null | undefined,
  raw: string | null | undefined,
): boolean {
  const flag = String(raw ?? "").trim();
  if (!flag) return false;
  if (flag === ALL) return true;
  const id = String(eventId ?? "").trim();
  return !!id && flag === id;
}

/** Has the unconditional shutdown date arrived? `today` is YYYY-MM-DD in Israel. */
export function shutdownDue(today: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(today) && today >= SHUTDOWN_ON;
}

export interface DecideTally {
  /** Unresolved disagreements in the window. */
  disagreements: number;
  /** Free-text messages evaluated in the window. */
  freeText: number;
}

/**
 * Whether the window counts as clean.
 *
 * Both halves, and the second is the one that was easy to forget: a pipe that
 * silently stopped writing rows produces a perfect score.
 */
export function windowIsClean(t: DecideTally, min: number = MIN_FREE_TEXT): boolean {
  return t.disagreements === 0 && t.freeText >= min;
}

/** The line Dvir reads in alertManualWork. Null when there is nothing to say. */
export function decideTallyLine(t: DecideTally, min: number = MIN_FREE_TEXT): string | null {
  if (!t.freeText && !t.disagreements) return null;
  const head = `⚖️ אי-הסכמות: ${t.disagreements} מתוך ${t.freeText} הודעות`;
  if (t.disagreements > 0) return `${head} — לבדוק לפני הרחבה`;
  return t.freeText >= min
    ? `${head} — נקי`
    : `${head} — עוד ${min - t.freeText} הודעות לפני שזה אומר משהו`;
}

/** The 05/10 reminder, once it is due. Null before. */
export function shutdownLine(today: string, flagIsSet: boolean): string | null {
  if (!flagIsSet || !shutdownDue(today)) return null;
  return `🛑 ${SHUTDOWN_ON}: לכבות את ${DECIDE_FLAG} בוורסל — שלושה ימים לחתונה של שלמה, בלי קשר לתוצאות`;
}
