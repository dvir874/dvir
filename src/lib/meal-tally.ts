/* Meals, as the caterer counts them.
 *
 * ai/assistant.ts names "כמה מנות ילדים יש לתהל?" in its own header as a
 * question it exists to answer, and the facts it was given carried no meal at
 * all — so the one question a caterer telephones about came back "אין לי את
 * זה". The columns were one line away from the query that was already being
 * made.
 *
 * PER PERSON, NEVER PER RECORD. "משפחת ביטון" is one row and ten plates, and a
 * tally that counts rows under-orders a wedding by the size of its families.
 * Every number here is people.
 *
 * Three states a record can be in, and the third is the one worth having:
 *   · meal_counts filled in — the guest split their own household, and that
 *     is the truth
 *   · one meal_preference — the whole household eats that
 *   · nothing — `unknown`, which is a list to chase, not a number to hide
 *
 * A guest may also fill in PART of the split: three of five chose, two did
 * not. The remainder falls to their preference, or to unknown. Rounding that
 * up to "five vegetarian" is how a caterer is told to make two meals nobody
 * eats.
 *
 * Confirmed guests only — that decision belongs to the caller, because a meal
 * is ordered for somebody who said yes.
 *
 * Import-free so it can be tested, like guest-count.ts and day-of.ts. The
 * number a caterer is billed from should be checkable without a database.
 */

export interface MealRow {
  guest_count?: number | null;
  meal_preference?: string | null;
  /** JSONB, default '{}' — see 20260702_meal_counts.sql. */
  meal_counts?: unknown;
}

export const MEAL_KEYS = ["regular", "vegetarian", "vegan", "mehadrin", "kids"] as const;
export type MealKey = typeof MEAL_KEYS[number];

export type MealTally = Record<MealKey | "unknown", number>;

export function mealTally(rows: readonly MealRow[]): MealTally {
  const out: MealTally = {
    regular: 0, vegetarian: 0, vegan: 0, mehadrin: 0, kids: 0, unknown: 0,
  };

  for (const r of rows ?? []) {
    /* A headcount of zero or nonsense is one person: they confirmed, so there
       is at least one plate. Bounded the way the importer bounds it. */
    const seats = Math.min(50, Math.max(1, Math.floor(Number(r.guest_count) || 1)));

    const counts = r.meal_counts && typeof r.meal_counts === "object" && !Array.isArray(r.meal_counts)
      ? r.meal_counts as Record<string, unknown>
      : null;

    let placed = 0;
    if (counts) {
      for (const k of MEAL_KEYS) {
        const n = Math.max(0, Math.floor(Number(counts[k]) || 0));
        out[k] += n;
        placed += n;
      }
    }

    /* More in the split than in the headcount means the guest changed their
       number after choosing meals. The split is what they actually chose, so
       it stands, and there is nothing left to assign. */
    if (placed >= seats) continue;

    const rest = seats - placed;
    const pref = String(r.meal_preference ?? "").trim();
    if ((MEAL_KEYS as readonly string[]).includes(pref)) out[pref as MealKey] += rest;
    else out.unknown += rest;
  }

  return out;
}

/** People accounted for, which is what a caterer's order adds up to. */
export function mealTotal(t: MealTally): number {
  return MEAL_KEYS.reduce((n, k) => n + t[k], 0) + t.unknown;
}
