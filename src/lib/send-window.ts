/* Which weddings a single send run is allowed to consider.
 *
 * One run serves one wedding, nearest first. This picks the shortlist it
 * chooses from, and it exists as its own file because the way it failed was
 * silence.
 *
 * THE BUG IT ENCODES. The rule "three weddings per run" was applied to the
 * three nearest BY DATE, and the ones that could not be sent to — paused, or
 * not set up yet — were removed from that three afterwards. A wedding nobody
 * could message still held a slot.
 *
 * On 03/09 that read: שחר (08/09), תהל (22/09), לאל (22/09, paused until
 * 08/09). One of three slots spent on a wedding deliberately silenced, and
 * שלמה's — 08/10, 173 guests who had never been contacted — fourth, outside
 * the query, unreachable for five days. Importing his list would have sent
 * nothing and looked exactly like an import that failed.
 *
 * So the window is over weddings that can be sent to, not over dates. Read
 * wider, then take the nearest three that are actually sendable.
 *
 * Import-free for the same reason phone-il.ts and wa-decide.ts are: the test
 * runner cannot resolve @/lib, and this is logic whose failure is invisible.
 */

export interface WindowEvent {
  id: string;
  /** ISO date of the wedding. The caller supplies these already sorted. */
  date: string;
  send_paused_until?: string | null;
  wa_header_image_url?: string | null;
}

export interface SkippedEvent<E> {
  event: E;
  reason: "paused" | "no_image";
  /** Present when the reason is a pause. */
  pausedUntil?: string;
}

export interface EventWindow<E> {
  /** At most `max`, nearest first — the run picks one of these. */
  active: E[];
  /** Why a nearer wedding was passed over. Only those actually in contention. */
  skipped: SkippedEvent<E>[];
}

export const MAX_EVENTS_PER_RUN = 3;

/**
 * The shortlist, and the reason for every wedding ahead of it that was passed.
 *
 * `events` must already be ordered nearest-first — the caller orders in SQL.
 * A wedding is sendable when it is not paused and has an invitation image;
 * everything else is a setup problem, not a scheduling one.
 */
export function chooseEvents<E extends WindowEvent>(
  events: E[], nowMs: number, max: number = MAX_EVENTS_PER_RUN,
): EventWindow<E> {
  const isPaused = (e: E) =>
    !!e.send_paused_until && new Date(e.send_paused_until).getTime() > nowMs;

  const sendable = events.filter(e => e.wa_header_image_url && !isPaused(e));
  const active = sendable.slice(0, max);

  /* Only weddings nearer than the last one chosen were ever competing for this
     run. A wedding two months out that has not been set up yet was not, and
     naming it here would turn a line that explains a quiet run into a list
     nobody reads — alertIncompleteEvents is where an unfinished setup belongs.

     With nothing sendable at all, every wedding read was in contention, and
     the reason each one failed is the entire explanation for a silent run. */
  const last = active.length ? active[active.length - 1] : null;
  const cutoff = last ? events.indexOf(last) + 1 : events.length;

  const skipped: SkippedEvent<E>[] = [];
  for (const e of events.slice(0, cutoff)) {
    if (isPaused(e)) skipped.push({ event: e, reason: "paused", pausedUntil: e.send_paused_until! });
    else if (!e.wa_header_image_url) skipped.push({ event: e, reason: "no_image" });
  }
  return { active, skipped };
}
