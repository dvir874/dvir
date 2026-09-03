/* When a person has to take over.
 *
 * THE CONVERSATION THIS COMES FROM. נעם חדד, a guest of שחר's, on 03/09:
 *
 *   11:46  נעם   "אני לא מגיע"
 *   11:46  אנחנו  "לא הצלחנו להבין את המספר 🙏 כתבו מספר בלבד — למשל 2"
 *   14:58  נעם   "יש אפשרות לדבר עם נציג אנושי??"
 *   14:58  אנחנו  "לא הצלחנו להבין את המספר 🙏 כתבו מספר בלבד — למשל 2"
 *   14:58  אנחנו  "לא הצלחנו להבין את המספר 🙏 כתבו מספר בלבד — למשל 2"
 *
 * He said he was not coming and was answered with a complaint about
 * arithmetic. He then asked for a human, in plain words, and was answered with
 * the same sentence twice. The thread did not appear in "ממתין לך" — because
 * something HAD gone out after his message, and an automatic reply counted as
 * an answer.
 *
 * Three failures, one shape: the system could not tell the difference between
 * replying and helping.
 *
 * Two things end an automated conversation and neither was detected:
 *   1. the guest asks for a person, in so many words
 *   2. we have already told them twice that we did not understand
 *
 * The second matters more than it looks. One "we did not understand" is a
 * parser missing an unusual phrasing. Two in a row is a guest who has now been
 * told twice, by a machine, that their own words are wrong — and the third
 * will not go better.
 *
 * Import-free, like wa-decide.ts, and for the same reason: this decides
 * whether a real person gets read.
 */

export type HumanReason =
  | "asked_for_human"     /* "אפשר לדבר עם נציג" */
  | "twice_not_understood" /* we said "we did not understand" twice */
  | "distress";           /* something is wrong and it is not an RSVP */

/* Explicit, and deliberately narrow. "נציג", "בן אדם", "מישהו אמיתי" — the
   words somebody reaches for when a bot has stopped being useful. Not "אפשר
   לשאול משהו?", which is a question we can often answer. */
const ASKS_FOR_HUMAN =
  /(נציג|בן ?אדם|בנאדם|אנושי|מישהו (אמיתי|אנושי)|לדבר עם (מישהו|אחד|בן ?אדם)|יש שם מישהו|אתם רובוט|זה בוט)/;

/* Not an RSVP and not a question — a guest telling us something is wrong.
   Kept tight: these route a person to a person, and a false positive costs
   Dvir an interruption at a moment he has very few of. */
const DISTRESS =
  /(טעות|לא ביקשתי|הפסיקו|תפסיקו|למה אתם|מי אתם|לא מכיר|לא מזהה|הוסר|הסירו אותי|תסירו)/;

export interface HumanCheck {
  needed: boolean;
  reason?: HumanReason;
}

/**
 * Does this message need a person?
 *
 * `notUnderstoodInARow` is how many times in a row we have already replied
 * "we could not understand" to this guest, counting the reply we are about to
 * send. At two, the automation stops and a person is told.
 */
export function needsHuman(said: string, notUnderstoodInARow = 0): HumanCheck {
  const t = String(said ?? "").trim();
  if (t && ASKS_FOR_HUMAN.test(t)) return { needed: true, reason: "asked_for_human" };
  if (notUnderstoodInARow >= 2) return { needed: true, reason: "twice_not_understood" };
  if (t && DISTRESS.test(t)) return { needed: true, reason: "distress" };
  return { needed: false };
}

/** What Dvir reads on his phone, in one line. */
export const HUMAN_REASON_TEXT: Record<HumanReason, string> = {
  asked_for_human: "ביקש לדבר עם בן אדם",
  twice_not_understood: "אמרנו לו פעמיים שלא הבנו — הוא תקוע",
  distress: "כתב משהו שנשמע כמו בעיה, לא כמו אישור הגעה",
};

/* ── The other half of the same conversation ──────────────────────────────
 *
 * "אני לא מגיע" was read as an unreadable NUMBER, because the guard was
 * `said === "לא מגיע"` — an exact match on the button's label. A guest typing
 * the same thing in their own words fell straight through to the number
 * parser.
 *
 * Deliberately not a general sentiment reader. It matches a refusal to ATTEND
 * and nothing else, and it is applied only while a headcount question is open,
 * where the alternative reading is "a number" and there is no number here. */
const DECLINES = /(^|\s)(אני |אנחנו |אנו |לא נוכל|לא נגיע)?\s*לא\s*(מגיע|מגיעים|נגיע|מגיעה|נוכל|אוכל|יכול|יכולים|נצליח|משתתפ)/;
/* Guarded: "לא מגיע לי" is a complaint, and "בטח שאנחנו מגיעים" is not a
   refusal because it never matches at all. */
const NOT_A_DECLINE = /(מגיע לי|מגיע לנו|לא מגיע ל)/;

/** A refusal to attend, written rather than tapped. */
export function saysNotComing(said: string): boolean {
  const t = String(said ?? "").trim();
  if (!t || t.length > 80) return false;
  if (NOT_A_DECLINE.test(t)) return false;
  return DECLINES.test(t);
}
