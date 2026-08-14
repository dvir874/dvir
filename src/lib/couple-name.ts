/* The two names that go into "בעזרת ה׳ *{{1}}* מתחתנים".
 *
 * events.name is a label for the couple's dashboard — "חתונת אורי ושחר",
 * "החתונה של תהל ואביב" — and reads as a title, which is exactly what it is.
 * Dropped into that sentence it produces "בעזרת ה׳ חתונת אורי ושחר מתחתנים",
 * and 327 of her guests would have received it.
 *
 * couple_names is the real field. It is filled per event and nothing guesses
 * when it is set. The stripper below exists only so an event created before
 * this column did not lands on something sane rather than on the title, and it
 * is deliberately narrow: two known prefixes, nothing clever. A name it does
 * not recognise comes back unchanged, and the caller refuses to send.
 */

const PREFIXES = ["החתונה של ", "חתונת ", "האירוע של ", "חתונה של "];

export function coupleName(
  event: { name?: string | null; couple_names?: string | null } | null | undefined,
): string | null {
  const explicit = event?.couple_names?.trim();
  if (explicit) return explicit;

  const raw = event?.name?.trim();
  if (!raw) return null;

  for (const p of PREFIXES) {
    /* Compared without the trailing space too, so a title that is nothing but
       a prefix — "חתונת" — is nothing rather than a couple called "חתונת". */
    if (raw === p.trim()) return null;
    if (raw.startsWith(p)) {
      const rest = raw.slice(p.length).trim();
      return rest || null;
    }
  }
  return raw;
}

/* Does this read like two people, or like a title?
 *
 * The check is not clever and is not meant to be — it is the last thing
 * standing between a stripper that missed a prefix and a template that says
 * "בעזרת ה׳ האירוע הגדול מתחתנים". A couple is joined by ו, always: "אורי
 * ושחר", "דביר בן ברוך ומירב ברון". Something with no ו at all is far more
 * likely to be a label than a pair of names.
 *
 * When this fails the answer is to fill couple_names, not to loosen the rule.
 */
export function looksLikeCouple(name: string | null | undefined): boolean {
  if (!name) return false;
  const n = name.trim();
  if (n.length < 5 || n.length > 60) return false;
  /* A standalone ו — " ושחר", " ומירב" — and NOT a ו sitting inside a word.
     The first version of this also accepted /\Sו\S/, which matches the ו in
     "האירוע" and passed the exact title it was written to reject. */
  return /\sו\S/.test(n);
}
