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
  | "distress"           /* something is wrong and it is not an RSVP */
  | "grief";             /* somebody has died, and no machine should answer */

/* Explicit, and deliberately narrow. "נציג", "בן אדם", "מישהו אמיתי" — the
   words somebody reaches for when a bot has stopped being useful. Not "אפשר
   לשאול משהו?", which is a question we can often answer. */
const ASKS_FOR_HUMAN =
  /(נציג|בן ?אדם|בנאדם|אנושי|מישהו (אמיתי|אנושי)|לדבר עם (מישהו|אחד|בן ?אדם)|יש שם מישהו|אתם רובוט|זה בוט)/;

/* A death. Nothing automatic may answer this, ever.
 *
 * THE CONVERSATION THIS COMES FROM. הרבנית מרים דיין, a guest of תהל ואביב's,
 * on 05/09. Her first message:
 *
 *   18:33  "סליחה, בסוף לצערי לא אגיע, כי אנחנו בשנת אבל על אמא היקרה שלנו."
 *   18:33  us: "לא הצלחנו להבין את המספר 🙏 כתבו בבקשה מספר בלבד — למשל 2"
 *   18:37  "מרים דיין, אמא נפטרה בתחילת חודש אב, ולכן כשאישרתי את הגעתי
 *           לחתונה, היה זה לפני פטירתה של אימנו היקרה."
 *   18:37  us: "לא הצלחנו להבין את המספר 🙏 …"
 *   18:55  "0"
 *   18:55  us: "לא הצלחנו להבין את המספר 🙏 …"
 *   18:59  "לא מגיעה בכלל ולכן כתבתי לך את הסיפרה 0 כי אני בשנת אבל על אימי
 *           היקר"
 *
 * A woman in her year of mourning told us four times, and was answered three
 * times with a complaint about arithmetic. Every other bug in this file costs
 * somebody an inconvenience. This one was cruel.
 *
 * Checked FIRST, before the guest has even asked for a person, because by the
 * time they ask it has already happened.
 *
 * The words are chosen to be unambiguous on their own. "אבל" is deliberately
 * absent — in Hebrew it is also the word "but", and "אבל אנחנו מגיעים" is a
 * confirmation. It appears only inside "שנת אבל", "בית אבל" and "אבל על".
 * Run over all 917 messages this system has ever received, this matches
 * exactly three: hers. */
const GRIEF =
  /(נפטר|נפטרה|נפטרו|הלווי|לוויה|אזכרה|שנת אבל|בית אבל|אבל על|ז״ל|ז"ל|יושבים שבעה|שבעה על|שכול|מתאבל)/;

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
  /* Before everything. See GRIEF. */
  if (t && GRIEF.test(t)) return { needed: true, reason: "grief" };
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
  grief: "🕯️ כתב/ה על פטירה או אבל — צריך תשובה אישית ממך, לא מהמערכת",
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
/* First person future was missing, and it is the most natural way to say it.
 *
 * "לא אגיע" — two words, unambiguous, and the pattern did not know the verb.
 * מרים דיין opened with "סליחה, בסוף לצערי לא אגיע" and was answered "לא
 * הצלחנו להבין את המספר". Over the whole history this addition catches exactly
 * one more message: hers. That is not an argument that it is rare — it is an
 * argument that the list was written from the phrasings we had already seen. */
const DECLINES = /(^|\s)(אני |אנחנו |אנו |לא נוכל|לא נגיע)?\s*לא\s*(מגיע|מגיעים|מגיעות|נגיע|מגיעה|אגיע|אבוא|נבוא|נוכל|אוכל|יכול|יכולה|יכולים|נצליח|אצליח|נשתתף|אשתתף|משתתפ)/;
/* Guarded — and the guard was worse than the thing it guarded against.
 *
 * It read /(מגיע לי|מגיע לנו|לא מגיע ל)/, and ל is a Hebrew PREFIX: "לא מגיע ל"
 * is the opening of "לא מגיע לחתונה", "לא מגיע לאירוע", "לא מגיע לצערי". So
 * the most natural way in Hebrew to say you are not coming was the one phrasing
 * that never counted. The guest stayed confirmed, was answered with "לא הצלחנו
 * להבין את המספר", and the caterer was told to cook for them.
 *
 * Now only the complaint idiom itself — "מגיע לי", "מגיע לנו" — and only when
 * no Hebrew letter follows, so "לא מגיע לילדים" is still a refusal. The range
 * is written as escapes rather than literal letters so that an invisible bidi
 * character pasted into this line cannot quietly change what it matches. */
const NOT_A_DECLINE = /מגיע ל(?:י|נו)(?![֐-׿])/;

/** A refusal to attend, written rather than tapped. */
export function saysNotComing(said: string): boolean {
  const t = String(said ?? "").trim();
  /* 80 stays.
   *
   * I raised this to 160 while fixing מרים דיין's conversation and it was the
   * wrong fix: her opening sentence is 63 characters and would have been
   * caught by the old guard the moment "אגיע" was in the list. The length was
   * never what failed her.
   *
   * And the guard is deliberate — see the test that asserts it. A long message
   * usually carries more than an RSVP, and recording a decline out of it and
   * replying "תודה שעדכנתם 🤍 נתגעגע" answers the one sentence a machine could
   * find and ignores everything else the person wrote. */
  if (!t || t.length > 80) return false;
  if (NOT_A_DECLINE.test(t)) return false;
  return DECLINES.test(t);
}
