/* Which outbound message means "this guest was invited".
 *
 * THE BUG THIS FILE EXISTS FOR. On 04/09, four days before שחר's wedding, she
 * told Dvir that אשר כהן had never received his invitation. He had not. The
 * only message ever sent to him was the rides-board notice — and its status was
 * "read", so the cron's `contacted` set included him, which moved him out of
 * the first-contact group and into the reminder group. A guest who was never
 * invited was treated as a guest who had not answered.
 *
 * The system sends at least six different things to a guest: the invitation,
 * reminders, the rides board, the photo request, "מחר זה קורה", and the
 * gallery. Only the first two are the RSVP conversation. Every other one
 * arriving is proof of nothing about whether they know they are invited.
 *
 * Matched on the body the senders write, because wa_messages does not store
 * which template was used. That is the weak point of this file and worth
 * saying out loud: a sender that starts writing a different body silently
 * stops counting. The bodies are listed here, in one place, so that change is
 * a one-line edit rather than an archaeology exercise.
 *
 * Import-free so the rule can be tested without a database, like every other
 * decision library here.
 */

/** The exact bodies the RSVP senders write. See wa-send/route.ts. */
export const INVITATION_BODY = "הזמנה לחתונה";
export const REMINDER_BODY = "תזכורת";

/** Did this message ask the guest to confirm their attendance? */
export function isRsvpMessage(body: string | null | undefined): boolean {
  const b = String(body ?? "");
  return b.includes(INVITATION_BODY) || b.includes(REMINDER_BODY);
}

/** The invitation itself, not a reminder about one. */
export function isInvitation(body: string | null | undefined): boolean {
  return String(body ?? "").includes(INVITATION_BODY);
}

/** Meta confirmed it reached the handset. */
export function didArrive(status: string | null | undefined): boolean {
  return status === "delivered" || status === "read";
}

/* How far along a delivery is. Higher wins.
 *
 * Meta reports out of order and re-reports what it has already said. A "sent"
 * that arrived before our row existed is parked as an orphan and replayed on
 * the next cron run — which, without this, overwrote the "read" that had since
 * been written. The guest then failed didArrive, re-entered the first-contact
 * group, and was invited a second time. Worse: a row correctly marked failed
 * with 131050, the code meaning the recipient asked us to stop, had its
 * error_code cleared by the same replay and was messaged again.
 *
 * failed ranks with read rather than above it: both are final, and a stale
 * failure must not erase a delivery any more than the reverse. */
const STATUS_RANK: Record<string, number> = {
  auto: 0, accepted: 0, sent: 1, delivered: 2, read: 3, failed: 3,
};

/** -1 for anything unknown or missing, so it never overwrites a known state. */
export function statusRank(status: string | null | undefined): number {
  const r = STATUS_RANK[String(status ?? "")];
  return r === undefined ? -1 : r;
}

/** Should `incoming` be written over `current`? */
export function isNewerStatus(
  incoming: string | null | undefined,
  current: string | null | undefined,
): boolean {
  return statusRank(incoming) > statusRank(current);
}
