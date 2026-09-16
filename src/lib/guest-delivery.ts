/** What a COUPLE should be told about a guest who has not received the invitation.
 *
 * unreachable.ts already classifies the same failures, but it answers a
 * different question: what must DVIR do. All three of its reasons are his —
 * an SMS, a personal message, a channel Meta will only open if the guest
 * writes first. None of them is work a couple can do.
 *
 * The couple's version has to answer one question and no others: is this ours
 * to fix, or yours. Getting that split wrong is not a cosmetic failure —
 * שלמה was handed sixteen numbers of which ten were perfectly fine and wrote
 * back asking who we meant, and on 15/09 איילת was told "41 מספרים" with no
 * way to see them and asked for a list. Both times the system reported a count
 * it could not make actionable.
 *
 * So: exactly one bucket is theirs, and it is the only one where a different
 * phone number is a real answer.
 */

export type CoupleDelivery =
  /** Arrived, or on its way with nothing wrong. Nothing to show. */
  | "ok"
  /** The number is real but has no WhatsApp on it. A different number would
      genuinely fix this, and only the couple knows whether one exists. */
  | "needs_number"
  /** Failed for a reason that is ours: Meta's per-recipient quota, an
      experiment group, a media error, a closed window. Shown as a count, never
      as a task. */
  | "in_progress"
  /** They asked Meta to stop hearing from businesses.
   *
   * Deliberately its own bucket rather than folded into in_progress, because
   * it must never reach the couple as "give us another number". A second
   * number for someone who opted out routes around a stop request — which is
   * both a promise broken and the fastest way back to the spam reports that
   * restricted this number on 09/09. Neither a task nor a statistic: the
   * couple is told nothing, and Dvir already sees it in his own report. */
  | "stopped";

/** 131026 — no WhatsApp account on that number. */
const NO_WHATSAPP = 131026;
/** 131050 — the recipient asked Meta to stop. */
const OPTED_OUT = 131050;

/**
 * @param lastCode  error code of the guest's MOST RECENT outbound message,
 *                  or null if the latest one carried no error.
 * @param reached   a delivery report arrived at some point. A number that
 *                  failed this morning and delivered this afternoon is not
 *                  stuck, and naming it sends someone after a guest who is
 *                  fine — the same mistake the couple-check made before it was
 *                  narrowed.
 */
export function coupleDelivery(
  lastCode: number | null | undefined,
  reached = false,
): CoupleDelivery {
  if (reached) return "ok";
  if (lastCode == null) return "ok";
  if (lastCode === NO_WHATSAPP) return "needs_number";
  if (lastCode === OPTED_OUT) return "stopped";
  return "in_progress";
}

/** One line for the bucket that is ours, or null when there is nothing to say.
 *
 * A sentence and not a list, on purpose. These resolve without anybody doing
 * anything, and a list invites work that would be wasted. */
export function inProgressLine(n: number): string | null {
  if (n <= 0) return null;
  return n === 1
    ? "מוזמן אחד עדיין בדרך — אנחנו מטפלים, לא צריך אתכם."
    : `${n} מוזמנים עדיין בדרך — אנחנו מטפלים, לא צריך אתכם.`;
}
