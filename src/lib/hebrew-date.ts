/* The Hebrew date, written the way it is written on an invitation.
 *
 * Intl can produce the Hebrew calendar — "26 באלול 5786" — but nobody writes it
 * that way. Her card says כ״ו אלול תשפ״ו, in letters, and a guest who reads
 * "26 באלול 5786" underneath a hand-painted כ״ו is being shown a translation of
 * their own date back to them.
 *
 * So Intl supplies the calendar arithmetic, which is the part worth trusting to
 * a library, and the numerals are rendered here in gematria, which is the part
 * it does not do.
 *
 * The year drops its thousands the way every invitation does: 5786 is written
 * תשפ״ו, not ה׳תשפ״ו — the millennium is not in question at a wedding.
 */

const ONES     = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS     = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש", "ת"];

/* Numbers as letters. 15 and 16 are written טו and טז rather than יה and יו,
   because those spell divine names. This is not a formatting preference. */
export function gematria(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  let out = "";
  let rest = n;

  while (rest >= 400) { out += "ת"; rest -= 400; }
  if (rest >= 100) { out += HUNDREDS[Math.floor(rest / 100)]; rest %= 100; }

  if (rest === 15) out += "טו";
  else if (rest === 16) out += "טז";
  else {
    if (rest >= 10) { out += TENS[Math.floor(rest / 10)]; rest %= 10; }
    if (rest > 0) out += ONES[rest];
  }
  return out;
}

/* The gershayim go before the final letter — כ״ו, תשפ״ו — and a single geresh
   after a lone letter, as in ה׳ or ט׳. */
export function withGershayim(letters: string): string {
  if (letters.length === 0) return "";
  if (letters.length === 1) return letters + "׳";
  return letters.slice(0, -1) + "״" + letters.slice(-1);
}

/* Month names as they are said, not as Intl spells them. Intl returns "באלול"
   with the prefix attached, which reads wrong in "כ״ו באלול תשפ״ו". */
const MONTHS: Record<string, string> = {
  Tishri: "תשרי", Heshvan: "חשוון", Kislev: "כסלו", Tevet: "טבת",
  Shevat: "שבט", Adar: "אדר", "Adar I": "אדר א׳", "Adar II": "אדר ב׳",
  Nisan: "ניסן", Iyar: "אייר", Sivan: "סיוון", Tamuz: "תמוז",
  Av: "אב", Elul: "אלול",
};

export function hebrewDate(input: Date | string): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";

  /* Midday, so a date stored without a time cannot slip across the Hebrew day
     boundary at sunset when the server is in another zone. */
  const noon = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12));

  const parts = new Intl.DateTimeFormat("en-u-ca-hebrew", {
    timeZone: "UTC", day: "numeric", month: "long", year: "numeric",
  }).formatToParts(noon);

  const day   = Number(parts.find(p => p.type === "day")?.value ?? 0);
  const month = MONTHS[parts.find(p => p.type === "month")?.value ?? ""] ?? "";
  const year  = Number(parts.find(p => p.type === "year")?.value ?? 0);
  if (!day || !month || !year) return "";

  return `${withGershayim(gematria(day))} ${month} ${withGershayim(gematria(year % 1000))}`;
}

/* Both calendars, in the order an invitation uses them. */
export function weddingDateLine(input: Date | string): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const civil = d.toLocaleDateString("he-IL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const heb = hebrewDate(d);
  return heb ? `${civil} · ${heb}` : civil;
}
