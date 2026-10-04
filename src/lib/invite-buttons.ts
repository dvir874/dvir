/* Which weddings get the invitation with answer buttons.
 *
 * Dvir, 04/10/2026: guests answer far more readily by tapping inside WhatsApp
 * than by opening a link — at איילת's wedding the invitation (link only)
 * brought 10 replies in two days, the reminder (buttons) 97 in one. So the
 * invitation gains "כן, אגיע" / "לא אגיע" / "עדיין לא יודע/ת", and keeps the
 * link to the full invitation as a fourth button.
 *
 * For the next couples only, never one already mid-invitation: a guest who
 * received the link invitation must not get a second, different one. So it is
 * opt-in per wedding — an explicit list of event ids in INVITE_BUTTONS_EVENTS —
 * which is also the rollout rule for anything on the inbound path: one wedding
 * first, three days without opt-outs, then the next.
 *
 * Import-free so it can be tested without the app. */

export const INVITE_BUTTONS_ENV = "INVITE_BUTTONS_EVENTS";

export function inviteButtonsFor(eventId: string | null | undefined, envValue: string | undefined): boolean {
  if (!eventId || !envValue) return false;
  return envValue.split(",").map(s => s.trim()).filter(Boolean).includes(eventId);
}
