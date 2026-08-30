/* Matching a name somebody typed to a guest already on the list.
 *
 * Guest lists arrive once as a clean file and are then corrected for weeks in
 * free text — a mother sends thirteen names down WhatsApp, a couple adds four
 * more, someone changes a headcount. Three times in one week that text was
 * matched to the list by hand, and hand-matching is where the expensive
 * mistakes live: the wrong row updated is a guest with the wrong meal, and
 * nobody finds out until the caterer counts.
 *
 * Its own import-free file so it can be tested, the same reason
 * phone-validate.ts and guest-count.ts are.
 *
 * The hard part is not finding matches. It is refusing the ones that look like
 * matches and are not — every false positive here silently rewrites a real
 * guest — so this scores on whole words and reports its confidence rather than
 * returning a best guess.
 */

export type Confidence = "exact" | "spelling" | "partial" | "ambiguous" | "none";

export interface Candidate<T> { row: T; name: string; score: number }

export interface MatchResult<T> {
  query: string;
  confidence: Confidence;
  /** Set only for exact/spelling/partial. Never set for ambiguous or none. */
  match?: T;
  /** Populated for ambiguous, so a human can choose. */
  candidates: Candidate<T>[];
}

/* Words that carry no identity. "דוד ותמי" and "דוד ומעין" share "דוד" and are
   different households; scoring on it makes every couple look like every other. */
const NOISE = new Set(["ו", "של", "בן", "בת", "בני", "משפחת", "הרב", "מר", "גב"]);

export function normalise(s: string): string {
  return String(s ?? "")
    .replace(/[֑-ׇ]/g, "")        /* niqqud and cantillation */
    .replace(/["'`׳״]/g, "")
    .replace(/[(),.\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(s: string): string[] {
  return normalise(s)
    .split(" ")
    .map(t => t.replace(/^ו(?=[א-ת]{2,})/, ""))   /* the "and" that glues names */
    .filter(t => t.length > 1 && !NOISE.has(t));
}

/* Hebrew is written with or without the vowel letters — קדר and קידר, לירן and
   לירון, are the same name. Dropping י and ו before comparing collapses the
   pair without also collapsing words that merely rhyme. */
const skeleton = (t: string) => t.replace(/[יו]/g, "");

function tokenScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  let hits = 0;
  for (const t of a) {
    if (b.includes(t)) { hits += 1; continue; }
    /* Whole words only. "תמר" must not score against "איתמר", and "עדי" must
       not score against "סעדיה" — both were produced by substring matching on
       a real list, and both would have rewritten the wrong guest. */
    if (b.some(y => skeleton(y) === skeleton(t))) hits += 0.9;
  }
  return hits / a.length;
}

/**
 * Match one typed name against a list.
 *
 * `nameOf` reads the name off whatever row shape the caller has, so this file
 * needs no knowledge of the guests table.
 */
export function matchGuest<T>(
  query: string,
  rows: T[],
  nameOf: (row: T) => string,
): MatchResult<T> {
  const q = normalise(query);
  const qt = tokens(query);
  if (!q || !qt.length) return { query, confidence: "none", candidates: [] };

  const exact = rows.filter(r => normalise(nameOf(r)) === q);
  if (exact.length === 1) return { query, confidence: "exact", match: exact[0], candidates: [] };
  if (exact.length > 1) {
    return {
      query, confidence: "ambiguous",
      candidates: exact.map(r => ({ row: r, name: nameOf(r), score: 1 })),
    };
  }

  const scored = rows
    .map(r => ({ row: r, name: nameOf(r), score: tokenScore(qt, tokens(nameOf(r))) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return { query, confidence: "none", candidates: [] };

  const best = scored[0].score;
  const top = scored.filter(c => c.score === best);

  /* More than one row scoring identically is not a match, however high the
     score. Picking one would be a coin toss written as a decision. */
  if (top.length > 1) {
    return { query, confidence: "ambiguous", candidates: top.slice(0, 5) };
  }

  /* Every typed word found, but the stored name carries more of them —
     "אביתר והילור" against "אביתר והילור ביטון". The surname the sender left
     off does not make it a different household. */
  if (best === 1) {
    return { query, confidence: "exact", match: top[0].row, candidates: [] };
  }
  if (best >= 0.9) {
    return { query, confidence: "spelling", match: top[0].row, candidates: [] };
  }
  /* Half the words matching is a coincidence more often than a person. It is
     reported so a human can look, and never applied. */
  if (best >= 0.6) {
    return { query, confidence: "partial", match: top[0].row, candidates: scored.slice(0, 3) };
  }
  return { query, confidence: "ambiguous", candidates: scored.slice(0, 4) };
}

/* ── reading the list somebody pasted ─────────────────────────────────── */

export interface ParsedLine {
  raw: string;
  name: string;
  /** A headcount, when the line carries one. */
  count?: number;
  /** True when the line says they are not coming. */
  declined?: boolean;
}

/* No \b anywhere: JavaScript word boundaries are defined against [A-Za-z0-9_],
   so every Hebrew letter reads as a boundary and the guard does nothing. The
   separators are written out instead. */
const DECLINE = /(^|[\s\-–:(])לא\s*(מגיעים|מגיעה|מגיע|באים|באה|בא|יגיעו|יגיע|נוכל|נגיע)(?=$|[\s.,!)])|(^|[\s\-–:])לא$/;

/**
 * Read a pasted block into entries.
 *
 * The real shapes, from three lists actually sent: "שם - 2", "שם – לא מגיעים",
 * "שם 3", "(הוספה) שם +972 5x-xxx-xxxx", and lines that are only a heading.
 */
export function parseList(text: string): ParsedLine[] {
  const out: ParsedLine[] = [];
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;

    /* Editorial markers the sender adds for himself. */
    const body = line.replace(/^\(?\s*(הוספה|תיקון|עדכון|חדש)\s*\)?\s*[-–:]?\s*/, "").trim();
    if (!body) continue;

    const declined = DECLINE.test(body);
    /* A standalone 1-2 digit number at the end. The leading separator is
       required and a digit before it disqualifies: "עדי לוי +972 54-431-7380"
       ends in "80", and reading that as a headcount would seat eighty people. */
    const m = body.match(/(?:^|[\s\-–:])(\d{1,2})\s*$/);
    const count = !declined && m ? parseInt(m[1], 10) : undefined;

    const name = (count !== undefined ? body.replace(/(?:^|[\s\-–:])\d{1,2}\s*$/, "") : body)
      .replace(DECLINE, "")
      .replace(/[\s\-–:]+$/, "")
      .trim();

    if (!name || tokens(name).length === 0) continue;
    out.push({ raw: line, name, ...(count ? { count } : {}), ...(declined ? { declined: true } : {}) });
  }
  return out;
}
