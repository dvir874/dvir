/* מה קורה אחרי שהחתונה נגמרה.
 *
 * Two things, both of which the business simply did not do.
 *
 * MONEY. On 04/09 there was 779 ILS agreed and uncollected across four
 * weddings, and nothing anywhere asked for it. Dvir's model is payment at the
 * end of the event, which means the gap between "agreed" and "received" is
 * most of the business at any moment — and it lived only in his head.
 *
 * REFERRALS. A couple whose wedding just worked knows other couples getting
 * married. It is the only acquisition channel that grows on its own and does
 * not touch the business number's reputation, because they are customers
 * rather than strangers. Cold outreach is what got this number restricted on
 * 9/8 and stopped every client for days; this is its opposite.
 *
 * Both are asked ONCE, days after the wedding — not on the morning after,
 * when the couple is asleep and has not yet seen their photographs.
 *
 * Import-free, like the rest of the decision libraries here.
 */

export interface AfterWeddingEvent {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  priceCharged?: number | null;
  paidAt?: string | null;
  paymentAskedAt?: string | null;
  referralAskedAt?: string | null;
}

export type AfterWeddingAsk = "payment" | "referral";

/* Not the morning after. The couple is asleep, the photographs have not
   arrived, and a bill is the wrong first thing to hear from us. Three days is
   long enough that the evening is a memory and short enough that we are still
   the people who ran it. */
export const ASK_AFTER_DAYS = 3;
/* And not for ever. A wedding two months gone whose payment never came is a
   phone call, not another automated message. */
export const ASK_UNTIL_DAYS = 30;

const DAY = 86_400_000;

function daysSince(date: string, today: string): number {
  const a = Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10));
  const b = Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10));
  return Math.round((b - a) / DAY);
}

/**
 * What this wedding is owed, in the order it should be sent.
 *
 * Payment before referral, and never both in the same run: asking somebody for
 * a favour in the same breath as asking them for money reads as a trade, and
 * the favour is the one that gets refused.
 */
export function afterWeddingAsks(ev: AfterWeddingEvent, today: string): AfterWeddingAsk[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ev.date)) return [];
  const since = daysSince(ev.date, today);
  if (since < ASK_AFTER_DAYS || since > ASK_UNTIL_DAYS) return [];

  const owes = ev.priceCharged != null && ev.priceCharged > 0 && !ev.paidAt;
  if (owes && !ev.paymentAskedAt) return ["payment"];

  /* The referral waits until the money is settled — either paid, or asked for
     and answered. A couple who still owes us is not the couple to ask for a
     recommendation. */
  if (owes) return [];
  if (!ev.referralAskedAt) return ["referral"];
  return [];
}

/** A short, memorable code from the couple's own name. */
export function referralCodeFor(coupleNames: string, id: string): string {
  const first = String(coupleNames ?? "").trim().split(/\s+/)[0] ?? "";
  const latin = first.replace(/[^A-Za-z0-9]/g, "");
  /* Hebrew names cannot go in a URL path cleanly, so fall back to the event's
     own id rather than transliterating — a wrong transliteration is a link
     that looks like somebody else's wedding. */
  const stem = latin.length >= 3 ? latin.toLowerCase() : "r";
  return `${stem}${String(id).replace(/-/g, "").slice(0, 6)}`;
}
