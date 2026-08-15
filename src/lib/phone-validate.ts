/* Is this a number someone can actually be reached at?
 *
 * There were two answers to that question and they disagreed. The importer
 * accepted foreign numbers in E.164 — סטיב ומריאן live abroad and their row was
 * corrected to +1 646 284 1932 on 13/08 — while the couple's own guest list
 * demanded ten digits starting 05 and told שחר the number was invalid.
 *
 * It was not invalid. toE164 passes it through untouched and the invitation
 * sends. But that warning is on HER screen, so a correct number looked broken
 * to the client, who would either worry about a guest who is fine or "fix" the
 * number into one that really is.
 *
 * Its own file, with no imports at all. It cannot live in phone.ts, which
 * reaches for the @/lib alias that the test runner cannot resolve, and it
 * cannot live in xlsx-blocks.ts, which would pull the whole spreadsheet library
 * into a page the couple opens on their phone. One rule, importable from both.
 */

/* Israeli mobile (10 digits, 05x), Israeli landline (9 digits, 0x), or a
   foreign number in E.164 without the plus. A leading zero on anything longer
   than ten digits is a local number we misread, not an international one. */
export function isPlausiblePhone(raw: string | number | null | undefined): boolean {
  const n = String(raw ?? "").replace(/\D/g, "");
  if (!n) return false;
  if (n.startsWith("0")) return n.length === 10 || n.length === 9;
  return n.length >= 10 && n.length <= 15;
}
