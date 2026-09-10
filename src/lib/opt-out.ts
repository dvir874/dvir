/* A guest who asked us to stop.
 *
 * 1,391 guests are in this database and not one of them is marked
 * do_not_contact. Eleven places in the sender check that flag and every one of
 * them honours it — the only code that ever WRITES it is a button on an admin
 * web page, and Dvir runs this business from a phone. So the flag has been a
 * switch with no handle since the day it was added.
 *
 * Meanwhile, on 07/09, עירית סבן wrote twice in one minute:
 *
 *   06:08  "בבקשה לא לשלוח לי שוב / טעות במספר"
 *   06:09  "אל תחזרו / לא מכירה / טעות במספר"
 *
 * She is still status=pending on שלמה גור's wedding, still has a phone and a
 * token, and the reminder query selects exactly pending + phone + token +
 * !do_not_contact. She matches all four. She is in the queue for the next one.
 *
 * A person who has said "wrong number, I don't know you, don't come back" is
 * the likeliest name in the whole list to press "report spam", and that report
 * lands on the one business number every client depends on — the number that
 * was already restricted once, on 9/8, and stopped every wedding for two days.
 *
 * ── Why this is not needs-human.ts ──
 *
 * The language is already detected. needs-human's DISTRESS pattern caught both
 * of her messages and both guests got "קיבלנו 🤍 מישהו מאיתנו יחזור אליכם".
 * Detection was never the gap; writing was.
 *
 * But DISTRESS must not be the trigger for silence, because it is built to be
 * wide — it routes a person to a person, and its cost is an interruption. Run
 * it over all 917 inbound messages this system has ever received and it
 * matches six. Two are the ones above. The other four are:
 *
 *   "טעות"                                        — one word, no request
 *   "מזל טוב ורק בשמחות מי המזמין? סורי לא מזהה"  — a warm guest, asking
 *   "כנראה מישהו לקח בטעות ז׳קט אפור וסוודר שחור" — תחיה סופר, status=confirmed,
 *                                                   reporting a lost jacket the
 *                                                   morning after the wedding
 *   "בוקר טוב אני לא מכיר .טעות אשלח אותי"        — a real wrong number
 *
 * Silencing a confirmed guest forever, on a rule whose only undo is a web page
 * nobody opens, is worse than the problem it solves. So this file is a
 * separate, deliberately narrow list, and it never fires on a bare "טעות" or a
 * bare "לא מזהה". Everything it does not catch still reaches Dvir through the
 * distress alert, where a person decides.
 *
 * Import-free: this decides whether somebody is never contacted again.
 */

/** Bidi and zero-width marks arrive invisibly from phone keyboards and have
    already broken matching in this codebase twice. Nothing here should ever
    depend on a character a person cannot see. */
function clean(said: string): string {
  return String(said ?? "")
    .replace(/[‎‏‪-‮⁦-⁩​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* Someone telling us, in an imperative, to stop. The verb is what makes it a
   request rather than a remark. */
const ASKS_TO_STOP =
  /(אל ת(שלח|שלחו|חזרו|פנו|צרו)|לא לשלוח|לא לפנות|תפסיקו לשלוח|הפסיקו לשלוח|(תסירו|הסירו|תסיר|הסר|תורידו|תוריד|הורד)\s*(אותי|אותנו)|הסירו אותי|תסירו אותי|^stop$|^unsubscribe$)/i;

/* The word the site tells them to send.
 *
 * /contact says, to guests: 'השיבו "הסר" להודעה'. Nothing matched a bare
 * "הסר" — the pattern above needs "הסר אותי" — so a guest who followed the
 * instruction printed on the website was not removed, and the page was the
 * only place that had promised they would be. On its own, as the whole
 * message, it can only mean one thing; inside a sentence it cannot, which is
 * why this is anchored and the pattern above is not. */
const BARE_STOP = /^(הסר|הסירו|להסיר|תסיר|תסירו|הסירני|עצור|עצרו)[.!]?$/;

/* Someone telling us we have the wrong person. "טעות" alone is not this —
   it is also how you report a jacket taken by mistake. */
const WRONG_NUMBER =
  /(טעות במספר|טעות בטלפון|מספר לא נכון|המספר לא נכון|לא נכון המספר|מספר שגוי)/;

/* The looser wrong-number reading, allowed only when BOTH halves are present:
   a denial of knowing us AND the word mistake. "אני לא מכיר .טעות" is a wrong
   number; "סורי לא מזהה" on its own is a guest asking who invited her. */
const DOES_NOT_KNOW_US = /(לא מכיר|לא מכירה|לא מכירים)/;
const MISTAKE = /טעות/;

export interface OptOut {
  optOut: boolean;
  /** The words they used, for the note stored beside the flag. */
  phrase?: string;
}

/**
 * Did this guest ask us to stop contacting them?
 *
 * Answers true only for an explicit request or an explicit wrong number. When
 * in doubt it answers false, because the cost of a miss is one more message
 * and the cost of a false positive is a guest who is never written to again.
 */
export function optOutRequest(said: string): OptOut {
  const t = clean(said);
  if (!t) return { optOut: false };

  /* A long message is a person telling us something, not asking to leave. The
     lost-jacket report is 110 characters; every real opt-out here is under 40. */
  if (t.length > 200) return { optOut: false };

  if (BARE_STOP.test(t)) return { optOut: true, phrase: t };

  const stop = t.match(ASKS_TO_STOP);
  if (stop) return { optOut: true, phrase: stop[0] };

  const wrong = t.match(WRONG_NUMBER);
  if (wrong) return { optOut: true, phrase: wrong[0] };

  if (DOES_NOT_KNOW_US.test(t) && MISTAKE.test(t))
    return { optOut: true, phrase: t.slice(0, 60) };

  return { optOut: false };
}

/** What the guest hears back. An apology and a fact, not a promise to look
    into it — they asked to be left alone and the reply should be the last
    thing they receive. */
export const OPT_OUT_REPLY =
  "הסרנו אתכם מהרשימה ולא נשלח שוב. מתנצלים על ההפרעה 🤍";
