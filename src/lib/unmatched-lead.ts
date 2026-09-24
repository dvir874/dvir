/* Somebody wrote to the business number who is on nobody's guest list.
 *
 * Until now that message was stored and then lost. /api/admin/inbox requires
 * an event_id and refuses without one, and a stranger has no event — so the
 * row sat in wa_messages with a null event_id, appeared on no screen, and was
 * recorded in wa_failures as `webhook.unmatched`, a debugging table nobody
 * reads. Five of those already exist, and every one of them is תהל ואביב's own
 * contact number writing in and getting nothing back.
 *
 * It stopped being a debugging curiosity on 24/09, when איילת asked to
 * recommend the service in a WhatsApp group of brides. A recommendation that
 * generates enquiries nobody can see is worse than no recommendation: the
 * business pays in reputation for leads that vanished, and never learns it.
 *
 * So the unmatched message becomes an alert with the number, what they wrote,
 * and a link that opens a reply — the same shape manual-work.ts and
 * day-of-alert.ts already use, for the same reason.
 *
 * Import-free and pure, like those two, so what Dvir is told about a stranger
 * can be tested without a webhook.
 */

/** Trim to something that reads on a phone without swallowing the alert. */
const clip = (s: string, n: number) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
};

/** E.164 digits → a wa.me link that opens a reply to them. */
export function replyLink(phone: string): string | null {
  const d = String(phone ?? "").replace(/\D/g, "");
  return d.length >= 9 && d.length <= 15 ? `https://wa.me/${d}` : null;
}

/** Local Israeli shape, because that is what he will recognise and dial. */
export function readablePhone(phone: string): string {
  const d = String(phone ?? "").replace(/\D/g, "");
  const local = d.startsWith("972") ? `0${d.slice(3)}` : d;
  return /^0\d{9}$/.test(local) ? `${local.slice(0, 3)}-${local.slice(3)}` : local || "—";
}

/**
 * The alert.
 *
 * @param phone  the sender, as Meta gives it (E.164 digits, no plus)
 * @param body   what they wrote
 * @param name   their WhatsApp profile name, when the webhook has it
 *
 * Single line by construction: this can ride in a Meta template parameter,
 * and a parameter containing a newline fails the whole send with 132000. The
 * free-text path can afford newlines, but one shape that works everywhere
 * beats two shapes that each work somewhere.
 */
export function unmatchedLeadAlert(
  phone: string,
  body: string,
  name?: string | null,
): string {
  const who = clip(String(name ?? "").trim(), 40);
  const said = clip(body, 140) || "(ללא טקסט)";
  const link = replyLink(phone);
  const parts = [
    "📞 פנייה ממספר שלא ברשימות",
    who ? `${who} · ${readablePhone(phone)}` : readablePhone(phone),
    `«${said}»`,
    link ?? "",
    "אם זו פנייה חדשה — היא לא תופיע בתיבת ההודעות.",
  ].filter(Boolean);
  return parts.join(" · ").replace(/\s*\n+\s*/g, " ");
}

/** How long before the same number is worth alerting about again.
 *
 * Somebody asking three questions in a row is one enquiry, not three alerts.
 * An hour is long enough to collapse a conversation and short enough that a
 * genuine second enquiry the next morning still arrives. */
export const LEAD_ALERT_COOLDOWN_MS = 60 * 60 * 1000;

/** Should this sender be alerted about, given when they last were? */
export function shouldAlert(lastAlertAt: string | null | undefined, nowMs: number): boolean {
  if (!lastAlertAt) return true;
  const t = Date.parse(lastAlertAt);
  return !Number.isFinite(t) || nowMs - t >= LEAD_ALERT_COOLDOWN_MS;
}
