import { smsInvite, type SmsEvent } from "./sms-invite.ts";

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
  no_whatsapp: "SMS — הקישור פותח הודעה מוכנה בטלפון שלך",
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

/** The link that actually reaches this person.
 *
 * Not one link for everyone, and this was wrong when the report was first
 * written. A guest whose number has no WhatsApp account cannot be reached by a
 * WhatsApp link — /s/ opens a chat with a number that will never see it, which
 * is worse than no link at all because it looks like it worked.
 *
 * 131026 has exactly one remaining channel and it is SMS. שלמה asked for it by
 * name on 07/09 for the whole נגר family, six numbers out of one imported
 * list. The body is deliberately tiny — SMS is billed by length and read on a
 * lock screen — so it is the couple, and a short link.
 *
 * 131050 and 130472 are different: those numbers DO have WhatsApp. One asked
 * Meta to stop hearing from businesses and the other is in one of Meta's
 * experiments, and both restrictions are about the BUSINESS number. A personal
 * message from Dvir's own phone reaches them normally, so they keep /s/. */
function channelLink(
  g: UnreachableItem, wedding: string, base: string, ev?: Omit<SmsEvent, "couple">,
): string | null {
  if (!base || !g.send) return null;

  if (g.reason === "no_whatsapp") {
    /* The same message /admin/sms sends, from the one builder — see
       sms-invite.ts. Written twice it was already written differently twice. */
    const body = smsInvite({ couple: wedding, ...(ev ?? {}) }, g.send, base);
    /* "&body=" and not "?body=", matching /admin/sms, which is what actually
       works on the phone Dvir sends from. */
    return `sms:${g.phone}&body=${encodeURIComponent(body)}`;
  }
  return `${base}/s/${g.send}`;
}

/** One wedding's worth of stuck numbers, as a section of the nightly report. */
export type ReportSection = {
  wedding: string;
  items: UnreachableItem[];
  outcome?: { asked: number; resolved: number };
  /* The details that go into an SMS, so a guest with no WhatsApp gets the same
     invitation everyone else got rather than a bare link. Optional: without
     them the message still names the couple. */
  event?: Omit<SmsEvent, "couple">;
};

/** The whole report, across every upcoming wedding, as one message.
 *
 * One message and not one per wedding. Dvir, 07/09: "אני רוצה שזה לא יגיע רק
 * על לקוח אחד ולא ספציפית על לקוח שנשלח היום — אלא בכללי אם יש מספרים שמחכים
 * להודעה." Four separate messages on a phone is four notifications to dismiss
 * and no sense of how much is actually waiting; one is a list he can work
 * through and finish.
 *
 * It is also deliberately independent of what was sent today. A number that
 * cannot receive is stuck whether or not its wedding had a run — and the
 * wedding with nothing going out is exactly the one nobody would otherwise
 * think to check.
 *
 * Free text, so newlines are allowed: a template parameter rejects them, and a
 * list of people to message is unusable as a paragraph. */
export function unreachableReport(
  sections: ReportSection[], base = "",
  /* WhatsApp cuts a text message at about 4,000 characters, and each guest
     here costs two lines and a URL — roughly ninety characters. Twelve per
     reason keeps a four-wedding report inside the limit with room to grow.
     Anything dropped is COUNTED OUT LOUD: a list silently cut at the bottom
     reads as "that is all of them", which is the one thing it must never say. */
  perReason = 12,
): string | null {
  const live = sections.filter(s => s.items.length);
  if (!live.length) return null;

  const total = live.reduce((n, s) => n + s.items.length, 0);
  const out: string[] = [
    `📵 ${total} מספרים מחכים להודעה ממך`,
    live.length > 1 ? `ב-${live.length} חתונות` : live[0].wedding,
  ];

  /* Grouped by reason ACROSS weddings, because the action is the same for
     everyone in a group and Dvir works through it by action, not by couple.
     The wedding is named beside each guest instead. */
  for (const reason of ORDER) {
    const rows = live.flatMap(s => s.items
      .filter(i => i.reason === reason)
      .map(i => ({ ...i, wedding: s.wedding, event: s.event })));
    if (!rows.length) continue;

    out.push("", `*${REASON_TEXT[reason]}* (${rows.length})`, `_${REASON_ACTION[reason]}_`);
    for (const g of rows.slice(0, perReason)) {
      out.push(`${g.name} · ${g.phone}${live.length > 1 ? `  ·  ${g.wedding}` : ""}`);
      /* Its own line: a URL sharing a line with Hebrew text is where
         WhatsApp's link detection gives up. */
      const link = channelLink(g, g.wedding, base, g.event);
      if (link) out.push(link);
    }
    if (rows.length > perReason) {
      out.push(`ועוד ${rows.length - perReason} — הרשימה המלאה ב-/admin`);
    }
  }

  /* The loop the couple-check opened, closed per wedding at the end rather
     than at the top — it is good news, and good news does not lead. */
  const closed = live.filter(s => (s.outcome?.asked ?? 0) > 0);
  if (closed.length) {
    out.push("", "*מהמספרים ששלחנו לזוגות לבדיקה*");
    for (const s of closed) {
      out.push(`${s.wedding}: ${s.outcome!.resolved} מתוך ${s.outcome!.asked} כבר נפתרו`);
    }
  }

  return out.join("\n");
}
