/** The guests the business number cannot reach, and the link to reach them.
 *
 * Dvir, 07/09: "אני רוצה שאני אדע את המספרים שהם לא קיבלו כי המספר העסקי לא
 * יכול לתת להם — והוא ישלח לי קישור אליהם באופן פרטי שאוכל לשלוח להם ממני.
 * לעשות את זה יותר מסודר ואוטונומי, כי כרגע זה די מבולגן."
 *
 * It was messy because it was three different things wearing one name. A guest
 * who has not answered, a guest whose reminder is still in its cooldown, and a
 * guest whose number physically cannot receive from us are not the same
 * problem, and only the last one is Dvir's to solve with his own phone.
 *
 * So this file answers exactly one question: whose number will never work,
 * automatically, no matter how long we wait. Everything else belongs to
 * manual-work.ts.
 *
 * The distinction that makes it correct — and the one that was got wrong on
 * 07/09 — is that a wamid means META ACCEPTED the message, not that the guest
 * received it. Meta accepts and then reports the delivery failure separately.
 * "Reached" therefore means a delivery report actually said delivered or read.
 * Asking the easier question produced a message to a couple claiming all 195
 * of their guests had been reached, when sixteen never were.
 */

export type Reason = "no_whatsapp" | "opted_out" | "experiment";

export type UnreachableGuest = {
  id: string;
  name?: string | null;
  phone?: string | null;
  rsvp_token?: string | null;
  category?: string | null;
};

export type Delivery = {
  /** A delivery report actually said delivered or read. Accepted is not it. */
  reached?: boolean;
  /** The error code on the most recent attempt, if it failed. */
  lastCode?: number | null;
};

export type UnreachableItem = {
  id: string;
  name: string;
  phone: string;
  reason: Reason;
  /** The guest's own token — becomes the one-tap link. */
  send?: string;
};

/* Only codes that no amount of waiting fixes.
 *
 * 131049 (the recipient's own daily marketing cap) and every transport error
 * are deliberately absent: those resolve by themselves, and putting them here
 * is how a list of six people Dvir must phone became a list of sixteen he
 * would learn to ignore. */
const TERMINAL: Record<number, Reason> = {
  131026: "no_whatsapp",   /* the number has no WhatsApp account */
  131050: "opted_out",     /* they asked Meta to stop hearing from businesses */
  130472: "experiment",    /* Meta will only deliver if they write to us first */
};

export const REASON_TEXT: Record<Reason, string> = {
  no_whatsapp: "אין וואטסאפ במספר",
  opted_out:   "ביקשו להפסיק לקבל הודעות מעסקים",
  experiment:  "מטא חוסמת — יגיע רק אם יכתבו לנו קודם",
};

/** What each reason actually asks of Dvir, so the report says what to DO. */
export const REASON_ACTION: Record<Reason, string> = {
  no_whatsapp: "צריך מספר אחר מהזוג, או שיחת טלפון",
  opted_out:   "רק הודעה אישית מהמספר שלך",
  experiment:  "הודעה אישית ממך תפתח להם את הערוץ",
};

/** Ordered by how badly a person is needed. */
const ORDER: Reason[] = ["no_whatsapp", "opted_out", "experiment"];

/**
 * Guests no automatic send will ever reach.
 *
 * `delivery` holds what is known per guest. A guest missing from it has never
 * been messaged at all — which is not unreachable, it is untried, and belongs
 * to the sender rather than here.
 */
export function unreachableGuests(
  guests: UnreachableGuest[],
  delivery: Map<string, Delivery>,
): UnreachableItem[] {
  const out: UnreachableItem[] = [];

  for (const g of guests) {
    if (g.category === "demo") continue;
    const name = String(g.name ?? "").trim();
    const phone = String(g.phone ?? "").trim();
    if (!name || !phone) continue;

    const d = delivery.get(g.id);
    if (!d) continue;                       /* never tried — not our problem */
    if (d.reached) continue;                /* a delivery report said it arrived */

    const reason = d.lastCode != null ? TERMINAL[d.lastCode] : undefined;
    if (!reason) continue;                  /* failed, but not permanently */

    const token = String(g.rsvp_token ?? "").trim();
    out.push({ id: g.id, name, phone, reason, ...(token ? { send: token } : {}) });
  }

  return out.sort((a, b) => ORDER.indexOf(a.reason) - ORDER.indexOf(b.reason));
}

/** Of the numbers we asked this couple to check, how many now work.
 *
 * The ask already existed and stopped there: unreachable_asked_ids records who
 * was named, and nothing ever reported back. שלמה was asked about 24 numbers
 * on 04/09 and seventeen of them were fixed — he was never told, and neither
 * was Dvir, who found it by running a query by hand three days later.
 *
 * A loop nobody closes teaches a couple that answering changes nothing. */
export function askedOutcome(
  askedIds: string[] | null | undefined,
  delivery: Map<string, Delivery>,
): { asked: number; resolved: number; stillStuck: string[] } {
  const asked = Array.isArray(askedIds) ? askedIds : [];
  const stillStuck = asked.filter(id => {
    const d = delivery.get(id);
    return !!d && !d.reached;
  });
  return { asked: asked.length, resolved: asked.length - stillStuck.length, stillStuck };
}

/** The report, one guest per line with its own link. Free text, so newlines
    are allowed — a template parameter rejects them, and a list of people to
    message is unusable as a paragraph. */
export function unreachableReport(
  wedding: string, items: UnreachableItem[], base = "",
  outcome?: { asked: number; resolved: number },
): string | null {
  if (!items.length) return null;

  const out: string[] = [
    `📵 ${wedding}`,
    `${items.length} מספרים שהמערכת לא יכולה להגיע אליהם`,
  ];

  if (outcome && outcome.asked > 0) {
    out.push("", `מתוך ${outcome.asked} ששלחנו לזוג לבדיקה — ${outcome.resolved} כבר נפתרו.`);
  }

  for (const reason of ORDER) {
    const list = items.filter(i => i.reason === reason);
    if (!list.length) continue;
    out.push("", `*${REASON_TEXT[reason]}* (${list.length})`, `_${REASON_ACTION[reason]}_`);
    for (const g of list) {
      out.push(`${g.name} · ${g.phone}`);
      /* Its own line: a URL sharing a line with Hebrew text is where
         WhatsApp's link detection gives up. */
      if (base && g.send) out.push(`${base}/s/${g.send}`);
    }
  }

  return out.join("\n");
}
