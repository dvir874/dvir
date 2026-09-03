/* Seeing the ceiling before we hit it.
 *
 * Meta allows a fixed number of distinct recipients in any rolling 24 hours —
 * 250 at the current tier. Almost everything the system sends can wait a run:
 * an invitation, a reminder, a gallery link. One thing cannot.
 *
 * "מחר זה קורה" goes out on the eve of a wedding, carries the arrival time and
 * the table number, and is worthless a day late. It is the one send with a
 * date on it.
 *
 * WHAT THIS EXISTS FOR. תהל ואביב and טל ולאל are both on 22/09. On the
 * evening of 21/09 they need one message each per confirmed guest: 183 + 151 =
 * 334, against a cap of 250. The cron already knows to serve both weddings —
 * that was fixed when the dates first collided — but it has no idea it will run
 * out. It would send 250, stop mid-list, and 84 guests at whichever wedding
 * came second would arrive at a venue not knowing when or where to sit. The
 * first anyone would learn of it is on the night.
 *
 * Two Saturdays in an Israeli September is not an edge case, and the number
 * only grows: 210 guests across those two weddings have not answered yet, and
 * every one who says yes adds a message to the same evening.
 *
 * A cap you discover on the night is an outage. A cap you can see three weeks
 * out is a decision — raise the tier, move a send, or tell a couple. This turns
 * the first into the second, and nothing more: it does not send, defer or
 * reschedule anything. It counts, and it is honest about what it cannot know.
 *
 * Import-free, like phone-il.ts and send-window.ts. The arithmetic that
 * protects a wedding night should be testable without a database.
 */

export interface ForecastEvent {
  id: string;
  name: string;
  /** YYYY-MM-DD, the wedding day. */
  date: string;
  /** Guests who would receive the day-before message as things stand. */
  confirmed: number;
  /** Guests yet to answer. Every yes among them lands on the same evening. */
  pending: number;
  /** A wedding silenced past its own eve sends nothing. */
  pausedUntil?: string | null;
}

export interface DayForecast {
  /** The evening the messages go out — the day before the wedding. */
  date: string;
  /** Whole days from today. 0 is this evening. */
  inDays: number;
  weddings: { name: string; confirmed: number; pending: number }[];
  /** Messages needed as things stand. */
  required: number;
  /** Messages needed if every undecided guest says yes. */
  ceiling: number;
  cap: number;
  /** Guests who would receive nothing. Zero when it fits. */
  short: number;
  /** ...and if everyone still undecided says yes. */
  shortAtCeiling: number;
}

const DAY = 86_400_000;

/** Calendar days between two YYYY-MM-DD dates, timezone-free. */
function daysBetween(from: string, to: string): number {
  const a = Date.UTC(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10));
  const b = Date.UTC(+to.slice(0, 4), +to.slice(5, 7) - 1, +to.slice(8, 10));
  return Math.round((b - a) / DAY);
}

/** The day before a wedding, as YYYY-MM-DD. */
export function eveOf(weddingDate: string): string {
  const d = new Date(Date.UTC(
    +weddingDate.slice(0, 4), +weddingDate.slice(5, 7) - 1, +weddingDate.slice(8, 10)));
  return new Date(d.getTime() - DAY).toISOString().slice(0, 10);
}

/**
 * What each evening in the horizon demands, against what it is allowed.
 *
 * Weddings sharing a date share an evening, so they are summed — that being the
 * entire point. Returned nearest first, and only evenings that carry work.
 */
export function forecastDayBefore(
  events: ForecastEvent[],
  cap: number,
  today: string,
  horizonDays = 21,
): DayForecast[] {
  const byEve = new Map<string, ForecastEvent[]>();

  for (const ev of events) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ev.date)) continue;
    const eve = eveOf(ev.date);
    const inDays = daysBetween(today, eve);
    if (inDays < 0 || inDays > horizonDays) continue;

    /* A wedding still paused on its own eve sends nothing that evening, so it
       does not compete for the cap. It is also a problem of its own, and one
       alertIncompleteEvents is closer to than this is. */
    if (ev.pausedUntil && ev.pausedUntil.slice(0, 10) > eve) continue;

    const list = byEve.get(eve);
    if (list) list.push(ev); else byEve.set(eve, [ev]);
  }

  const out: DayForecast[] = [];
  for (const [eve, evs] of byEve) {
    const required = evs.reduce((a, e) => a + e.confirmed, 0);
    const ceiling = evs.reduce((a, e) => a + e.confirmed + e.pending, 0);
    out.push({
      date: eve,
      inDays: daysBetween(today, eve),
      weddings: evs.map(e => ({ name: e.name, confirmed: e.confirmed, pending: e.pending })),
      required, ceiling, cap,
      short: Math.max(0, required - cap),
      shortAtCeiling: Math.max(0, ceiling - cap),
    });
  }
  return out.sort((a, b) => a.inDays - b.inDays);
}

/**
 * The evenings worth waking someone for.
 *
 * An evening already over the cap is certain. One that only goes over if every
 * undecided guest says yes is not — but it is the one still worth acting on,
 * because the lead time is what makes it fixable. Both are reported; the
 * message says which is which.
 */
export function pressingDays(days: DayForecast[]): DayForecast[] {
  return days.filter(d => d.short > 0 || d.shortAtCeiling > 0);
}

/**
 * What Dvir reads on his phone.
 *
 * Names the date, the weddings, the shortfall and what raises it — a message
 * that says "capacity problem" and stops is one he has to go and investigate.
 */
export function forecastMessage(d: DayForecast): string {
  const when = d.date.slice(8, 10) + "/" + d.date.slice(5, 7);
  const who = d.weddings.map(w => `${w.name} (${w.confirmed})`).join(" + ");
  const certain = d.short > 0;

  const head = certain
    ? `בערב ${when} צריך ${d.required} הודעות "מחר זה קורה" והתקרה היא ${d.cap}. ${d.short} אורחים לא יקבלו כלום.`
    : `בערב ${when} צריך ${d.required} הודעות והתקרה היא ${d.cap}. עוד ${d.ceiling - d.required} אורחים טרם ענו — אם רובם יאשרו, ${d.shortAtCeiling} לא יקבלו כלום.`;

  const growth = certain && d.ceiling > d.required
    ? ` ועוד ${d.ceiling - d.required} טרם ענו, כך שזה רק יגדל.`
    : "";

  return `${head}${growth}\n${who}\nאימות עסקי במטא מעלה את התקרה ל-1,000.`;
}
