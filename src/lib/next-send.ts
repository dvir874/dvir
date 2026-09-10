/* When does the next reminder actually go out?
 *
 * טל ולאל asked their wedding planner that question on 10/09. Dvir asked the
 * WhatsApp console and it answered "אין לי את זה במערכת" — truthfully, because
 * nothing had ever assembled the answer.
 *
 * The parts all existed. eligibility.ts has eligibleAt, whose own comment says
 * it was written because "the question Dvir actually asks is the other one —
 * מחר יישלחו הודעות? למי? — and it was answered by hand each time, wrongly at
 * least once". cron-schedule.ts has the eight slots. shabbat.ts knows which
 * days are closed. Nothing put the three together, so the one question a
 * client actually asks was the one question the system could not answer.
 *
 * What this does NOT promise. It gives the first slot at which somebody
 * becomes due, which is the earliest the message can go — not a guarantee that
 * it will. The daily ceiling is shared across every wedding, and on a day when
 * three weddings come due together the last of them waits for a later slot.
 * That is why `dueBy` is returned beside `at`: a caller who says "50 guests at
 * 16:00" and means "up to 50, if the quota holds" should say so.
 *
 * Import-free, like the three files it composes.
 */

/** The moment a single guest becomes eligible, or null for never again. */
export type EligibleAt = number | null;

export interface NextSend {
  /** Epoch ms of the first run that can carry it, or null. */
  at: number | null;
  /** How many guests are due by then. */
  dueBy: number;
  /** Guests who will never receive another reminder. */
  exhausted: number;
  /** Why there is no answer, when at is null. */
  reason?: "paused" | "nobody" | "no_slot";
}

/** UTC [hour, minute] of every scheduled run — pass CRON_UTC. */
export type Slots = readonly (readonly [number, number])[];

/**
 * The next run that can carry a reminder for one wedding.
 *
 * `blocked` is asked about each candidate slot, so Shabbat and חג are skipped
 * rather than assumed away. `pausedUntil` short-circuits: a paused wedding has
 * no next send, and saying "Sunday" when the pause runs to Wednesday is worse
 * than saying nothing.
 */
export function nextSend(
  eligible: EligibleAt[],
  slots: Slots,
  blocked: (at: Date) => boolean,
  nowMs: number,
  pausedUntil?: number | null,
  horizonDays = 21,
): NextSend {
  const exhausted = eligible.filter(e => e === null).length;
  const live = eligible.filter((e): e is number => e !== null);

  if (pausedUntil && pausedUntil > nowMs) return { at: null, dueBy: 0, exhausted, reason: "paused" };
  if (!live.length) return { at: null, dueBy: 0, exhausted, reason: "nobody" };

  /* The earliest anybody is due — never earlier than now, because a guest who
     came due yesterday and was not sent to is due at the next run, not in the
     past. */
  const from = Math.max(nowMs, Math.min(...live));

  for (let d = 0; d <= horizonDays; d++) {
    const day = new Date(from + d * 86_400_000);
    for (const [h, m] of slots) {
      const slot = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m);
      if (slot < from) continue;
      if (blocked(new Date(slot))) continue;
      return { at: slot, dueBy: live.filter(e => e <= slot).length, exhausted };
    }
  }
  return { at: null, dueBy: 0, exhausted, reason: "no_slot" };
}

/** How a person says it. */
export function nextSendText(n: NextSend, when: (ms: number) => string): string {
  if (n.at === null) {
    if (n.reason === "paused") return "השליחה מושהית — לא תצא תזכורת עד שתופעל מחדש.";
    if (n.reason === "nobody")
      return n.exhausted
        ? `אין תזכורת נוספת — כל ${n.exhausted} הממתינים כבר קיבלו את המקסימום.`
        : "אין למי לשלוח תזכורת.";
    return "לא מצאתי חלון שליחה בשלושת השבועות הקרובים.";
  }
  return `התזכורת הבאה: ${when(n.at)} — עד ${n.dueBy} אורחים`
    + (n.exhausted ? ` (${n.exhausted} כבר מיצו את המקסימום)` : "");
}
