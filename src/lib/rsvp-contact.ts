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
