/* Splitting an alert to Dvir into pieces WhatsApp will actually deliver.
 *
 * Measured on 22/09 across every admin message sent since 15/09, and the split
 * is absolute — no overlap, not one exception:
 *
 *     up to    947 bytes → 41 of 41 arrived
 *     from   1,387 bytes → 15 of 15 failed, "Message undeliverable"
 *
 * Which means the alert that names the people only a person can reach —
 * "🙋 ירון פטיניו ואיילת דוד · בעוד 23 ימים", 1,387 bytes — has never once
 * reached him. Nor has "📵 27 מספרים מחכים להודעה ממך" at 4,186. They were
 * built, they were sent on every run, and they failed in silence for four
 * weddings. On 22/09 he asked why he had never seen them.
 *
 * sendAdminText capped at `body.slice(0, 4000)`, which is where the belief
 * lived that 4,096 was the limit. Two mistakes in one line: the ceiling for
 * this account is far lower, and slice counts CHARACTERS while the limit is in
 * BYTES — Hebrew is two bytes a letter, so 4,000 characters is 8,000 bytes and
 * the cap never bound anything.
 *
 * So: measure in bytes, split on line boundaries, and send a short series
 * rather than one message nobody receives. Import-free and pure, like
 * wa-decide.ts and day-of.ts — the rule that decides whether Dvir hears about
 * his own business should not need a database to test.
 */

/** Comfortably under the smallest observed failure (1,387) and above the
 *  largest observed success (947). Not a documented Meta limit — a measured
 *  one — so it is deliberately not tight. */
export const ADMIN_MAX_BYTES = 900;

const bytes = (s: string) => new TextEncoder().encode(s).length;

/** Cut a single over-long line to fit, on a word boundary where one exists. */
function hardSplit(line: string, max: number): string[] {
  const out: string[] = [];
  let rest = line;
  while (bytes(rest) > max) {
    /* Walk back from a byte-safe upper bound to the last space. Character
       indices are fine here because we only ever shrink. */
    let cut = Math.min(rest.length, max);
    while (cut > 0 && bytes(rest.slice(0, cut)) > max) cut--;
    const space = rest.lastIndexOf(" ", cut);
    const at = space > max / 2 ? space : cut;
    out.push(rest.slice(0, at).trimEnd());
    rest = rest.slice(at).trimStart();
  }
  if (rest) out.push(rest);
  return out;
}

/**
 * Split an alert into messages that will be delivered.
 *
 * Splits between lines, never inside one, because every one of these alerts is
 * a list — a name, a number and a link per line — and a name cut in half is
 * worse than a second message.
 *
 * @param body  the whole alert
 * @param max   byte ceiling per message
 * @returns one or more parts, each within `max`. Empty input gives [].
 */
export function splitAdminText(body: string, max: number = ADMIN_MAX_BYTES): string[] {
  const text = String(body ?? "").replace(/\r\n?/g, "\n").trim();
  if (!text) return [];
  const cap = Math.max(80, max);
  if (bytes(text) <= cap) return [text];

  /* Room for the "(2/3)" marker appended below. Reserved up front rather than
     discovered afterwards, because adding it later is what would push a part
     back over the limit. */
  const room = cap - 12;

  const parts: string[] = [];
  let cur = "";
  for (const raw of text.split("\n")) {
    for (const line of bytes(raw) > room ? hardSplit(raw, room) : [raw]) {
      const next = cur ? `${cur}\n${line}` : line;
      if (bytes(next) <= room) { cur = next; continue; }
      if (cur) parts.push(cur);
      cur = line;
    }
  }
  if (cur) parts.push(cur);

  /* Numbered, so a series that arrives out of order or stops early is still
     readable as a series — and so a missing part is visible rather than
     mistaken for the end of the list. */
  return parts.map((p, i) => `${p}\n(${i + 1}/${parts.length})`);
}
