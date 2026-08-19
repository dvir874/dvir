/* Reading the couple's WhatsApp message so Dvir does not have to retype it.
 *
 * Every event so far was created by hand: he read a message, opened the admin,
 * and typed the names, the date, the venue and two times into five fields. It
 * is the least valuable half-hour in the business — no couple was ever moved by
 * it — and it is the reason a third client means a third evening.
 *
 * THE RULE THIS FILE IS BUILT AROUND, in Dvir's words: "המערכת צריכה להיות
 * מדויקת מאוד... אנחנו לא רוצים להשמיט אף שם או מספר פלאפון או אורח או מיקום
 * ושעה". So the contract is not "extract as much as possible". It is:
 *
 *   1. Never guess. A field it is not sure about comes back null.
 *   2. Never silently drop. Every line it could not place is returned in
 *      `unparsed`, so the screen can show it and a human can decide.
 *   3. Say where each value came from, so a wrong one can be traced to the
 *      sentence that produced it rather than argued about.
 *
 * A parser that is right 80% of the time and silent about the rest is worse
 * than no parser: it moves the error from "Dvir has to type" to "a guest was
 * sent the wrong time and nobody knew".
 */

export interface IntakeField<T> {
  value: T | null;
  /** The exact text this was read from — shown beside the field for checking. */
  source: string | null;
}

export interface IntakeResult {
  couple:    IntakeField<string>;
  date:      IntakeField<string>;   // YYYY-MM-DD
  venue:     IntakeField<string>;
  address:   IntakeField<string>;
  reception: IntakeField<string>;   // HH:MM
  chuppah:   IntakeField<string>;   // HH:MM
  /** Lines that carried something and were not used. Never empty by accident. */
  unparsed: string[];
}

const none = <T,>(): IntakeField<T> => ({ value: null, source: null });

const HE_MONTHS: Record<string, number> = {
  ינואר: 1, פברואר: 2, מרץ: 3, מרס: 3, אפריל: 4, מאי: 5, יוני: 6,
  יולי: 7, אוגוסט: 8, ספטמבר: 9, אוקטובר: 10, נובמבר: 11, דצמבר: 12,
};

/* Two digits, or one padded. Rejects 24:00 and 7:99 rather than accepting them
   as "close enough" — a wrong hour reaches every guest. */
function normTime(h: string, m: string): string | null {
  const H = Number(h), M = Number(m);
  if (!Number.isInteger(H) || !Number.isInteger(M)) return null;
  if (H < 0 || H > 23 || M < 0 || M > 59) return null;
  return `${String(H).padStart(2, "0")}:${String(M).padStart(2, "0")}`;
}

/* A wedding is in the future and not in the next century. Anything outside
   that is a phone number or an address that happened to look like a date. */
function plausibleDate(y: number, m: number, d: number, now: Date): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;  // 31/02
  const days = (dt.getTime() - now.getTime()) / 86_400_000;
  if (days < -2 || days > 900) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function findDate(text: string, now: Date): IntakeField<string> {
  /* "14 בנובמבר 2026" / "14 בנובמבר" */
  const he = text.match(/(\d{1,2})\s*ב?(ינואר|פברואר|מרץ|מרס|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)\s*,?\s*(\d{4})?/);
  if (he) {
    const d = Number(he[1]), m = HE_MONTHS[he[2]];
    for (const y of he[3] ? [Number(he[3])] : [now.getUTCFullYear(), now.getUTCFullYear() + 1]) {
      const iso = plausibleDate(y, m, d, now);
      if (iso) return { value: iso, source: he[0].trim() };
    }
  }
  /* 14.11.2026 · 14/11/26 · 14-11-2026 — day first, as Israel writes it. */
  for (const mm of text.matchAll(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/g)) {
    const d = Number(mm[1]), m = Number(mm[2]);
    let y = Number(mm[3]);
    if (y < 100) y += 2000;
    const iso = plausibleDate(y, m, d, now);
    if (iso) return { value: iso, source: mm[0] };
  }
  return none<string>();
}

/* Times are labelled or they are not taken.
 *
 * An unlabelled "19:00" could be the reception, the chuppah, or when the
 * photographer arrives. Guessing by order — first time is reception — is the
 * kind of rule that works on four messages and then sends 300 people to the
 * wrong hour. Unlabelled times go to `unparsed` for a human to place. */
function findLabelledTime(text: string, labels: string[]): IntakeField<string> {
  for (const label of labels) {
    const re = new RegExp(`${label}[^\\d\\n]{0,18}(\\d{1,2})[:.](\\d{2})`);
    const m = text.match(re);
    if (m) {
      const t = normTime(m[1], m[2]);
      if (t) return { value: t, source: m[0].trim() };
    }
    /* "קבלת פנים ב-7 בערב" */
    const re2 = new RegExp(`${label}[^\\d\\n]{0,18}(\\d{1,2})\\s*(בערב|בלילה)`);
    const m2 = text.match(re2);
    if (m2) {
      let H = Number(m2[1]);
      if (H < 12) H += 12;
      const t = normTime(String(H), "00");
      if (t) return { value: t, source: m2[0].trim() };
    }
  }
  return none<string>();
}

/* "בעזרת ה' דביר ומירב מתחתנים" / "החתונה של תהל ואביב" / "אנחנו X ו-Y" */
function findCouple(text: string): IntakeField<string> {
  const pats = [
    /(?:החתונה של|חתונת|מתחתנים[:\s]+)\s*([^\n,.!?]{3,40}?\s+ו[^\n,.!?\s]{2,20})/,
    /([^\n,.!?]{2,30}?\s+ו[^\n,.!?\s]{2,20})\s+מתחתנים/,
  ];
  for (const p of pats) {
    const m = text.match(p);
    if (m) {
      /* Strip the words people put in front of their own names. "אנחנו שחר
         ואורי מתחתנים" is a sentence about a couple called שחר ואורי, and
         "אנחנו" would have gone into "בעזרת ה׳ *אנחנו שחר ואורי* מתחתנים". */
      const v = m[1].replace(/\s+/g, " ").trim()
        .replace(/^(?:אנחנו|אנו|זה|הזוג|שמנו|קוראים לנו)\s+/, "").trim();
      /* Must look like two names joined by ו — the same test the sender uses
         before it will put a value into "בעזרת ה׳ *{{1}}* מתחתנים". */
      if (/\sו\S/.test(v) && v.length <= 60) return { value: v, source: m[0].trim() };
    }
  }
  return none<string>();
}

function findVenue(text: string): { venue: IntakeField<string>; address: IntakeField<string> } {
  /* Labelled first: "באולם X", "המקום: X", "📍 X" */
  const venueRe = /(?:^|\n)\s*(?:📍|מקום|האולם|אולם|גן האירועים|המקום)\s*[:\-]?\s*([^\n]{3,80})/;
  const m = text.match(venueRe);
  if (!m) return { venue: none<string>(), address: none<string>() };
  const line = m[1].trim().replace(/[.,;]$/, "");

  /* "אולמי גאיה, רחוב האומן 12, חדרה" → venue + address.
     Split on the first comma only; everything after it is where to drive. */
  const i = line.indexOf(",");
  if (i > 0) {
    return {
      venue:   { value: line.slice(0, i).trim(), source: line },
      address: { value: line.slice(i + 1).trim(), source: line },
    };
  }
  return { venue: { value: line, source: line }, address: none<string>() };
}

/** Every line that still carries information and was not consumed. */
function leftovers(text: string, used: (string | null)[]): string[] {
  const consumed = used.filter(Boolean).map(s => (s as string).trim());
  return text
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 2)
    /* A line is "used" if any extracted source came out of it. */
    .filter(l => !consumed.some(c => l.includes(c) || c.includes(l)))
    /* Lines with no digits and no colon are usually greetings, not data. */
    .filter(l => /\d/.test(l) || l.includes(":"));
}

export function parseIntake(text: string, now: Date = new Date()): IntakeResult {
  const t = (text ?? "").replace(/‏|‎/g, "");
  if (!t.trim()) {
    return { couple: none(), date: none(), venue: none(), address: none(),
             reception: none(), chuppah: none(), unparsed: [] };
  }

  const couple = findCouple(t);
  const date   = findDate(t, now);
  const { venue, address } = findVenue(t);
  const reception = findLabelledTime(t, ["קבלת פנים", "קבלת־פנים", "קב\"פ", "🥂"]);
  const chuppah   = findLabelledTime(t, ["חופה וקידושין", "חופה", "💐", "קידושין"]);

  return {
    couple, date, venue, address, reception, chuppah,
    unparsed: leftovers(t, [couple.source, date.source, venue.source,
                            reception.source, chuppah.source]),
  };
}

/** Which required fields are still missing — what the screen must ask for. */
export function missingFields(r: IntakeResult): string[] {
  const need: [keyof IntakeResult, string][] = [
    ["couple", "שמות בני הזוג"], ["date", "תאריך"], ["venue", "מקום"],
    ["reception", "קבלת פנים"], ["chuppah", "חופה"],
  ];
  return need
    .filter(([k]) => !(r[k] as IntakeField<string>).value)
    .map(([, label]) => label);
}
