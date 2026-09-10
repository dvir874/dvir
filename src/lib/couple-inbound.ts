/* The couple writes to the business number, and until now nothing happened.
 *
 * couple_check_numbers_v1 — an approved template this system sends — ends with
 * the sentence "ואם המספר דווקא נכון — כתבו לנו כאן ונטפל בזה אחרת." It asks
 * the couple, in writing, to reply. The reply had nowhere to go.
 *
 * From wa_failures, scope webhook.unmatched, all from 972586996888 — תהל שלוש,
 * a paying client:
 *
 *   03/09 13:03  [contacts] ×3      the corrected numbers, as contact cards
 *   03/09 13:03  "אלו המספרים של האנשים הם נכונים אז מוזר.."
 *   03/09 13:03  "כל המספרים נכונים"
 *   09/09 16:52  "זה נכון"
 *
 * She answered the question the system asked her. Three times, the last one
 * yesterday. Every one of them was recorded as a delivery failure and dropped.
 *
 * WHAT THIS FILE DOES AND DOES NOT DO
 *
 * It classifies. It does not decide anything on the couple's behalf and it
 * cannot send anything to a guest. A couple's message is data: it is written
 * by somebody outside this system, and the only actions it can produce are an
 * acknowledgement to them and a message to Dvir.
 *
 * Import-free.
 */

export type CoupleIntent =
  /** "כל המספרים נכונים" — the loop the template opened, closed. */
  | "numbers_ok"
  /** They sent numbers, corrections, or contact cards. */
  | "numbers_sent"
  /** "כמה אישרו?" — about their own wedding, and nobody else's. */
  | "status"
  /** Anything else a person says. Dvir reads it. */
  | "other";

const NUMBERS_OK =
  /(כל המספרים נכונים|המספרים נכונים|זה נכון|הם נכונים|נכונים|בדקתי.*(תקין|נכון)|הכל תקין|הכול תקין|המספר נכון)/;

const NUMBERS_SENT =
  /(\d{2,3}-?\d{7}|הנה המספר|המספר שלו|המספר שלה|מספר חדש|תעדכנו|תעדכן|לתקן|תיקון)/;

const STATUS =
  /(כמה אישרו|כמה מגיעים|כמה ענו|כמה ממתינים|מה המצב|כמה יש|כמה אנשים|סטטוס|מה קורה עם הרשימה)/;

/**
 * What the couple just said.
 *
 * Order matters: a message can hold both a confirmation and a phone number,
 * and "כל המספרים נכונים אבל תוסיפו את 0501234567" is a correction, not a
 * confirmation. Corrections are read first because acting on the wrong one
 * means telling Dvir the list is fine when it is not.
 */
export function coupleIntent(said: string, kind: "text" | "media" = "text"): CoupleIntent {
  /* A contact card carries no text this file can read, and it is almost always
     the numbers. media arrives as "[contacts]". */
  if (kind === "media") return "numbers_sent";

  const t = String(said ?? "").trim();
  if (!t) return "other";

  if (NUMBERS_SENT.test(t)) return "numbers_sent";
  if (NUMBERS_OK.test(t)) return "numbers_ok";
  if (STATUS.test(t)) return "status";
  return "other";
}

/** What the couple hears back. Never a promise the system cannot keep. */
export const COUPLE_REPLY: Record<CoupleIntent, string> = {
  numbers_ok:
    "תודה 🤍 רשמנו שהמספרים נכונים — נטפל בהם בדרך אחרת ולא נטריד אתכם עוד בעניין הזה.",
  numbers_sent:
    "קיבלנו, תודה 🤍 נעדכן את הרשימה ונשלח להם.",
  status:
    "",   /* filled with their own numbers by the caller */
  other:
    "קיבלנו 🤍 דביר יחזור אליכם.",
};
