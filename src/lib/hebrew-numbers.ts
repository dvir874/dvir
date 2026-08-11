/**
 * Numbers written out in Hebrew words.
 *
 * "180 רגעים מ-47 אנשים" is a file count. "מאה ושמונים רגעים, מארבעים ושבעה
 * אנשים" is a sentence about an evening. The couple's own album gets the
 * sentence — everywhere else digits are the right answer.
 *
 * Masculine forms only, which is what the nouns here need (רגעים, אנשים,
 * אורחים). Above 999 it gives up and returns digits, because at that point the
 * words are longer than the number and stop reading as language.
 */

const ONES = ['', 'אחד', 'שניים', 'שלושה', 'ארבעה', 'חמישה', 'שישה', 'שבעה', 'שמונה', 'תשעה'];
const TEENS = ['עשרה', 'אחד עשר', 'שנים עשר', 'שלושה עשר', 'ארבעה עשר',
               'חמישה עשר', 'שישה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר'];
const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים'];
const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות',
                  'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות'];

/**
 * `n` in Hebrew words, e.g. 147 → "מאה ארבעים ושבעה".
 * The conjunction attaches to the final part, which is where Hebrew puts it:
 * 180 is "מאה ושמונים", not "ומאה שמונים".
 */
export function hebrewNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return String(n);
  if (n === 0) return 'אפס';
  if (n > 999) return n.toLocaleString('he-IL');

  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;

  if (h) parts.push(HUNDREDS[h]);

  if (rest >= 10 && rest <= 19) {
    parts.push(TEENS[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t) parts.push(TENS[t]);
    if (o) parts.push(ONES[o]);
  }

  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(' ') + ' ו' + parts[parts.length - 1];
}

/**
 * The same word with the מ־ prefix attached correctly: "מארבעים ושבעה".
 * Hebrew doubles the vav when the word already starts with one, so ושבעה
 * would become מ+ושבעה — hence the prefix goes on the whole phrase, not the
 * last part.
 */
export function hebrewFrom(n: number): string {
  const w = hebrewNumber(n);
  return n > 999 ? `מ-${w}` : `מ${w}`;
}
