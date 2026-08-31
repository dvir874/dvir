/* Is an open question still open?
 *
 * Its own import-free file so it can be tested, the same reason
 * phone-validate.ts and guest-count.ts are.
 *
 * chat_state never expired. Sixteen guests are sitting in one right now, some
 * for more than ten days — tapped מגיע, were asked "כמה אתם?", and never
 * answered. The state is checked before anything else here, so the next number
 * any of them ever sends is written straight to guest_count as a headcount,
 * with none of the confirmation the same number would get from a guest whose
 * conversation had closed cleanly. A "5" in an address or a blessing becomes
 * five meals.
 *
 * 48 hours is generous for a question somebody meant to answer and short
 * enough that a stray number a week later is read as what it is. Past it the
 * message falls through to the ordinary handling below, which asks. */
export const STATE_TTL_H = 48;

export function stateIsLive(g: { chat_state: string | null; chat_state_at: string | null }, nowMs: number = Date.now()): boolean {
  if (!g.chat_state) return false;
  if (!g.chat_state_at) return true;    /* pre-migration rows keep old behaviour */
  return nowMs - new Date(g.chat_state_at).getTime() < STATE_TTL_H * 3_600_000;
}
