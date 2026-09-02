/* Is this message a headcount and nothing else?
 *
 * Its own file with no imports at all, for the same reason phone-validate.ts
 * is: the test runner cannot resolve the @/lib alias, so a rule that needs
 * tests cannot live beside code that reaches for it.
 *
 * parseGuestCount is right where it is used — mid-question, when the guest was
 * just asked "how many" and anything they type is an answer to that. Replayed
 * over the 137 real free-text messages this system has received, it finds a
 * number in eight of them, and only two are counts:
 *
 *   "המון מזל טוב לזוג הצעיר"   → 2   (a blessing; "זוג")
 *   "אבל לא צריך חמש מנות."     → 5   (a negation, read as the opposite)
 *   "וגם לא חמישה מקומות"       → 5   (the same)
 *   "אשמח לטרמפ... מקום 1."     → 1   (a lift request)
 *   "2❤️"  "1 :)"               → 2,1 (actual answers)
 *
 * Nobody asked these guests anything; they wrote unprompted. So the bar is the
 * message being a number and nothing else — emoji and punctuation stripped,
 * what remains must be one or two digits. That keeps both real answers and
 * drops all six misreadings, including the two that mean the exact opposite of
 * what the parser returns. */
export function bareCount(raw: string): number | null {
  /* Extended_Pictographic only. Emoji_Component also matches the ASCII digits,
     because 0-9 are the base characters of the keycap emoji — stripping it
     deleted the number this function exists to find, and "2" came back null. */
  const stripped = String(raw ?? "")
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    .replace(/[\s.,!?:;()\-–—"'`~*]/g, "");
  if (!/^\d{1,2}$/.test(stripped)) return null;
  const n = parseInt(stripped, 10);
  return n >= 1 && n <= 20 ? n : null;
}

/* A sentence that says, in words, to change the number.
 *
 * bareCount above is deliberately strict: the message must be a number and
 * nothing else, because "אבל לא צריך חמש מנות" means the opposite of the 5 a
 * looser parser reads out of it.
 *
 * That strictness has a cost, and דליה ואלי רוזנברג paid it on 01/09. At 05:34
 * she wrote "אשמח לשנות את המספר ל- 5 שמגיעים" — as clear as a sentence gets —
 * and nothing happened. She tried again nine and a half hours later with a bare
 * "5", and only then was she asked and updated. Ten hours of silence for a
 * message that said exactly what she wanted.
 *
 * So: an explicit change verb, exactly one number, and no negation. Every one
 * of those three is load-bearing. Replayed over the 306 real free-text messages
 * received so far it fires on zero of them — it adds no new way to be wrong —
 * and it catches her sentence.
 *
 * Still only ever proposes. The caller asks "רשום אצלנו 4. לעדכן ל-5?" exactly
 * as it does for a bare number, because a sentence can be misread and a
 * headcount reaches a caterer. */
const CHANGE_VERB =
  /(לשנות|לעדכן|עדכנו|תעדכן|תעדכני|לתקן|במקום|להוסיף|נוסיף|מוסיף|מוסיפים|תוסיף|תוסיפי)/;

/* "לא צריך", "בלי", "לבטל" invert the sentence. Without this, "לא צריך לעדכן
   ל-5" reads as a request for five. */
const NEGATION = /(לא צריך|לא צריכים|לא רוצה|לא רוצים|בלי|לבטל|אל תוסיף|אל תעדכן)/;

export function changeIntent(raw: string): number | null {
  const s = String(raw ?? "");
  if (!CHANGE_VERB.test(s)) return null;
  if (NEGATION.test(s)) return null;
  const digits = s.match(/\d+/g);
  /* One number only. "לשנות מ-4 ל-5" is unambiguous to a person and ambiguous
     to this, and guessing which is which is how a caterer gets a wrong count. */
  if (!digits || digits.length !== 1) return null;
  const n = parseInt(digits[0], 10);
  return n >= 1 && n <= 20 ? n : null;
}

/* ── a number in a message nobody asked for ──────────────────────────────── */

/* Congratulation, not attendance. A guest who has not been asked anything
   writes these unprompted, and every one of them used to be read as an answer. */
const BLESSING = /(מזל טוב|מז\"ט|בשעה טובה|במזל טוב|מאחל|מאחלת|מאחלים|ברכות|איחולים|שנה טובה|בהצלחה|כל הכבוד|באהבה|מתרגש|מתרגשת|מתרגשים|כל טוב)/;

/* Not coming. Written out rather than using \b, which in JavaScript is defined
   against [A-Za-z0-9_] and therefore matches between every pair of Hebrew
   letters. */
const DECLINE_FREE = /(^|[\s\-–:(,.!])(לא\s*(נוכל|נגיע|מגיעים|מגיעה|מגיע|באים|באה|בא|יגיעו|יגיע|מצליחים)|לצערי|לצערנו|מצטער|מצטערת|מצטערים|בחו"?ל|בחול)/;

/**
 * A headcount from a guest who was never asked for one.
 *
 * parseGuestCount is right for a guest mid-question: it is generous because
 * the question has already narrowed what the message can mean. It is wrong for
 * an unprompted message, where it reads any lone number as a headcount and
 * substring-matches its word table — "מזל טוב לזוג המאושר" contains "זוג", so
 * a congratulation booked two seats and the guest was told "רשמנו 2 🤍".
 *
 * The same generosity turns a refusal into an acceptance: "לצערי לא נוכל
 * להגיע, אנחנו 2 בחו״ל" was recorded as confirmed for two.
 *
 * So: no word table at all here, and a message that is congratulating or
 * refusing is not a headcount whatever digits it contains. A guest whose
 * genuine answer is rejected is asked again, which is the failure this is
 * supposed to have — a wrong headcount reaches the caterer.
 */
export function unpromptedCount(raw: string): number | null {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  if (BLESSING.test(t)) return null;
  if (DECLINE_FREE.test(t)) return null;

  const digits = t.match(/\d+/g);
  if (!digits || digits.length > 1) return null;
  const n = parseInt(digits[0], 10);
  return n >= 1 && n <= 20 ? n : null;
}

/* ── a household described in parts ──────────────────────────────────────── */

export interface Composite { total: number; kids: number }

const KID_WORD = /(ילד(?:ים|ה)?|פעוט(?:ה|ות|ים)?|תינוק(?:ת|ות|ים)?|קטן|קטנה|בייבי)/;

/**
 * "1 + 2 ילדים", "זוג+פעוטה", "2 מבוגרים ו-3 ילדים".
 *
 * Guests answer the headcount question in parts as often as with a number,
 * and every one of those answers used to fall through to Dvir: שירה ואייל
 * wrote "3" and then "1+ 2 ילדים", and אילת ונתן wrote "2 מנות. 4 מקומות".
 * A composite answer is not a hard parse and it carries the most useful
 * information a guest ever volunteers — the split the caterer bills on.
 *
 * Returns the total and how many of it are children, in the same shape the
 * admin's own field writes. Null when the message is not of this form; a
 * misread here reaches a caterer as real meals, so anything ambiguous is
 * refused rather than guessed.
 */
export function compositeCount(raw: string): Composite | null {
  const t = String(raw ?? "")
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return null;
  /* A refusal that happens to contain numbers is not a headcount. */
  if (/(לא\s*(נוכל|נגיע|מגיע|מגיעים|באים)|לצערי|לצערנו)/.test(t)) return null;

  /* "זוג" and "אני" carry a count of their own. */
  const adultsFromWord = /(^|[\s+ו])זוג([\s+ו]|$)/.test(t) ? 2
    : /(^|[\s+ו])(אני|לבד|רק אני)([\s+ו]|$)/.test(t) ? 1
    : null;

  const nums = [...t.matchAll(/\d{1,2}/g)]
    .map(m => ({ n: parseInt(m[0], 10), at: m.index ?? 0, len: m[0].length }))
    .filter(x => x.n >= 0 && x.n <= 20);

  /* The child word has to sit immediately after the number, separated by
     nothing but spaces or a hyphen. A wider window reaches past the NEXT
     number: in "1+ 2 ילדים" the fourteen characters after the 1 contain
     "ילדים", so one adult was read as one child and the household came out
     wrong in both halves. */
  const kidsAfter = (x: { at: number; len: number }) =>
    /^[\s\-־ו]*(ילד(?:ים|ה)?|פעוט(?:ה|ות|ים)?|תינוק(?:ת|ות|ים)?|קטן|קטנה|בייבי)/
      .test(t.slice(x.at + x.len));

  const kidNum = nums.find(kidsAfter) ?? null;
  let kids = kidNum ? kidNum.n : null;

  /* "זוג+פעוטה" — the child is named without a number of its own. */
  if (kids === null && !nums.length && adultsFromWord !== null && KID_WORD.test(t)) kids = 1;
  if (kids === null) return null;

  /* Whoever is left. A number that is not the child number, or the word. */
  const adults = adultsFromWord !== null
    ? adultsFromWord
    : nums.find(x => x !== kidNum)?.n ?? null;
  if (adults === null) return null;

  const total = adults + kids;
  if (total < 1 || total > 20 || kids > total) return null;
  return { total, kids };
}
