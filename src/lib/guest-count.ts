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
