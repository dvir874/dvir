/** One message near the wedding, not two.
 *
 * "מחר מתחתנים" goes out the evening before; "היום מתחתנים" goes out on the
 * morning itself. Both were built, and a guest with both receives the same
 * four facts twice inside eighteen hours — which reads as a system that has
 * lost track rather than one taking care of them.
 *
 * Dvir, 06/09: "עדיף שתצא הודעה אחת — או היום זה קורה או מחר זה קורה", and he
 * asked שחר which she prefers. So it is the couple's choice, per wedding,
 * because the answer genuinely differs: a wedding an hour's drive from most of
 * its guests wants the evening before, and one where everybody is local wants
 * the morning of.
 *
 * "before" is the default and the current behaviour, so a wedding nobody has
 * asked keeps exactly what it has today.
 *
 * Import-free so the choice can be tested without a database — the cost of
 * getting this wrong is a wedding's guests hearing twice or not at all. */

export type DayMessage = "before" | "day_of";

export const DEFAULT_DAY_MESSAGE: DayMessage = "before";

/** What the column says, defended against everything a column can say.
 *
 * A missing column, a null, a value from a newer version of this list — all
 * mean "nobody has chosen", and nobody having chosen must never be silence.
 * The wedding is tomorrow either way. */
export function dayMessageChoice(raw: unknown): DayMessage {
  const v = String(raw ?? "").trim().toLowerCase();
  return v === "day_of" ? "day_of" : DEFAULT_DAY_MESSAGE;
}

/** May this wedding send the evening-before message? */
export function sendsDayBefore(raw: unknown): boolean {
  return dayMessageChoice(raw) === "before";
}

/** May this wedding send the wedding-morning message? */
export function sendsDayOf(raw: unknown): boolean {
  return dayMessageChoice(raw) === "day_of";
}
