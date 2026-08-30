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
