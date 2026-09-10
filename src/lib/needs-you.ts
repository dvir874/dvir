/* The guest messages that are Dvir's to answer, and nothing else.
 *
 * 10/09: "יש המון הודעות מאורחים של שחר שפספסתי כי המערכת לא שולחת לי אותן
 * לפלאפון", and then, precisely: "רק הודעות שהן נועדות לטיפול שלי — עם מה
 * בדיוק האורח כתב שם וקישור לענות לו."
 *
 * The rule already existed. /api/admin/inbox computes `needsYou` per thread —
 * the guest wrote last, nobody answered after them, Dvir has not opened it,
 * and either no automatic reply went out or the automation itself gave up. It
 * has been right all along and lived on a screen he does not open.
 *
 * WHY THIS IS NOT "SEND ME EVERY GUEST MESSAGE". 917 inbound messages have
 * reached this system, most of them "מגיע", "2", "מזל טוב". A phone that buzzes
 * for those is a phone he silences, and then the one that mattered is silent
 * too. The filter is the feature.
 *
 * Import-free, so the rule can be tested without a database — this decides
 * whether a person waiting for an answer is seen or not.
 */

export interface ThreadView {
  guestId: string;
  name: string;
  phone: string;
  /** The guest's own rsvp_token — becomes the one-tap reply link. */
  token?: string | null;
  /** What they last wrote, verbatim. */
  said: string;
  /** When they wrote it. */
  saidAt: string;
  /** Anything we sent after that which was actually an answer — a broadcast
      that happened to land later is not one. See isBroadcast. */
  answeredAt?: string | null;
  /** Dvir opened the thread. */
  seen?: boolean;
  /** The guest's own answer was recorded after they wrote. */
  recorded?: boolean;
  /** needs-human fired on this message — an automatic reply does not clear it. */
  humanNeeded?: boolean;
  /** We already put this exact message on his phone. */
  alertedAt?: string | null;
}

/* A broadcast is not an answer.
 *
 * צורית וצופיה asked "הי, יש דרך להעביר מתנה תשלום?" on 09/09 at 08:25. Two
 * hours later the gallery announcement went out to all 231 of שחר's guests,
 * her included — and because something outbound now sat after her question,
 * the thread looked answered and she vanished from every list. She is still
 * waiting, and the couple did not get her gift.
 *
 * Every message this system sends in bulk is logged under a fixed label, so
 * the list is short, closed, and checkable against wa_messages. Anything else
 * outbound — a status "auto" reply, or free text Dvir typed — really is an
 * answer to whatever they said. */
const BROADCAST = /^(הזמנה לחתונה|תזכורת אישור הגעה|היום מתחתנים|מחר מתחתנים|גלריית התמונות מוכנה|בקשת תמונות|תודה על התמונות|קישור לטרמפים|מספר שולחן|תזכורת|בקשת תשלום|בקשת המלצה)/;

export function isBroadcast(body: string | null | undefined): boolean {
  return BROADCAST.test(String(body ?? "").trim());
}

export interface Waiting {
  guestId: string;
  name: string;
  phone: string;
  token?: string | null;
  said: string;
  saidAt: string;
  humanNeeded: boolean;
}

/**
 * Which threads are his to answer.
 *
 * `alertedAt` is compared against the message time rather than counted, so a
 * guest who writes again after being alerted about is raised again — and one
 * who does not is never raised twice.
 */
export function waitingForYou(threads: ThreadView[]): Waiting[] {
  const out: Waiting[] = [];
  for (const t of threads) {
    if (!t.said?.trim()) continue;
    if (t.seen) continue;
    if (t.recorded) continue;
    /* An automatic reply closes an ordinary thread and does NOT close one the
       automation gave up on — that is the whole point of needsHuman. */
    if (t.answeredAt && t.answeredAt >= t.saidAt && !t.humanNeeded) continue;
    if (t.alertedAt && t.alertedAt >= t.saidAt) continue;
    out.push({
      guestId: t.guestId, name: t.name, phone: t.phone, token: t.token,
      said: t.said, saidAt: t.saidAt, humanNeeded: !!t.humanNeeded,
    });
  }
  return out;
}

/** One guest, as it reads on a phone: who, what they wrote, and how to answer. */
export function waitingLine(w: Waiting, base: string): string {
  const said = w.said.replace(/\s+/g, " ").trim();
  const quote = said.length > 220 ? `${said.slice(0, 219)}…` : said;
  return `${w.humanNeeded ? "🙋 " : ""}${w.name} ${w.phone}\n`
    + `"${quote}"\n`
    + (w.token ? `${base}/s/${w.token}` : "אין קישור — אין טוקן לאורח הזה");
}

/** The heading, which has to say how many without being read as an alarm. */
export function waitingHeader(n: number): string {
  return n === 1 ? "🙋 אורח אחד מחכה לתשובה ממך:" : `🙋 ${n} אורחים מחכים לתשובה ממך:`;
}
