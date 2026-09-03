/* Reading a wedding invitation that arrived as a photograph.
 *
 * Dvir, on how events actually arrive: "במקרה של שלמה הוא שלח לי דווקא את
 * ההזמנה שלו כתמונה ותאמת שזה מה שקורה עם רוב הזוגות — ומתוכה אני מוציא את
 * הפרטים". Every event so far was created by reading a picture and typing five
 * fields into a form. It is the least valuable half-hour in the business and it
 * repeats per client, which is exactly the kind of work he is about to stop
 * having time for.
 *
 * A model can read the picture. What it must not do is decide.
 *
 * THE RULE, unchanged from intake-parser.ts and in Dvir's words: "המערכת צריכה
 * להיות מדויקת מאוד... אנחנו לא רוצים להשמיט אף שם או מספר פלאפון או אורח או
 * מיקום ושעה". So a value survives only if it is well formed AND the model
 * quoted the text it read it from. A field it invented has no quote, and a
 * field with no quote is dropped.
 *
 * That is the whole design. A parser that is right most of the time and silent
 * about the rest is worse than none: it moves the error from "Dvir has to type"
 * to "every guest was sent the wrong time and nobody knew".
 *
 * Import-free so it can be tested, the same reason phone-validate.ts is. The
 * network call lives in the route; everything that decides lives here.
 */

export interface ReadField<T> {
  value: T | null;
  /** The exact words on the invitation this came from. */
  source: string | null;
}

export interface InvitationRead {
  couple:    ReadField<string>;
  date:      ReadField<string>;   // YYYY-MM-DD
  venue:     ReadField<string>;
  address:   ReadField<string>;
  reception: ReadField<string>;   // HH:MM
  chuppah:   ReadField<string>;   // HH:MM
  /** Anything the model returned that did not survive. Never silently empty. */
  rejected: string[];
}

/** What the model is asked for. Kept here so the contract and its validator
    cannot drift apart. */
export const INVITATION_PROMPT = `אתה קורא הזמנה לחתונה מתמונה.

החזר JSON בלבד, במבנה הבא:
{
  "couple":    { "value": "שם הזוג", "source": "הטקסט המדויק מההזמנה" },
  "date":      { "value": "YYYY-MM-DD", "source": "..." },
  "venue":     { "value": "שם האולם", "source": "..." },
  "address":   { "value": "כתובת", "source": "..." },
  "reception": { "value": "HH:MM", "source": "..." },
  "chuppah":   { "value": "HH:MM", "source": "..." }
}

כללים מחייבים:
- אם פרט לא מופיע בהזמנה — value הוא null. אל תשלים ואל תנחש.
- source חייב להיות ציטוט מילולי מההזמנה. בלי ציטוט, השדה ייפסל.
- תאריך עברי בלבד בלי לועזי — החזר null בשדה date וכתוב את הציטוט ב-source.
- שעות בפורמט 24 שעות.
- אל תוסיף טקסט מחוץ ל-JSON.`;

const empty = <T,>(): ReadField<T> => ({ value: null, source: null });

const MAX_SOURCE = 120;
const MAX_VALUE = 120;

function text(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim();
  return s && s.length <= MAX_VALUE ? s : null;
}

function quote(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim();
  return s && s.length <= MAX_SOURCE ? s : null;
}

/* Rejects 24:00 and 7:99 rather than accepting them as close enough — a wrong
   hour reaches every guest. Same check intake-parser makes. */
function time(v: unknown): string | null {
  const s = text(v);
  const m = s && /^(\d{1,2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const H = Number(m[1]), M = Number(m[2]);
  if (H < 0 || H > 23 || M < 0 || M > 59) return null;
  return `${String(H).padStart(2, "0")}:${m[2]}`;
}

/**
 * A date the invitation actually carries.
 *
 * Bounded rather than merely well formed: an invitation is for a wedding that
 * has not happened, and a model that reads "2025" off a decorative motif
 * produces a date the whole sending schedule is then built on.
 */
function date(v: unknown, today: Date): string | null {
  const s = text(v);
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const parsed = new Date(y, m - 1, d);
  if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) return null;
  const days = (parsed.getTime() - today.getTime()) / 86_400_000;
  if (days < -1 || days > 730) return null;
  return s;
}

/**
 * Turn whatever the model returned into fields that can be trusted.
 *
 * Every value needs two things: a shape this system can use, and a quote from
 * the invitation. Missing either, it is dropped into `rejected` where a person
 * sees it — never into a field where a person would not.
 */
export function readInvitation(raw: unknown, today: Date = new Date()): InvitationRead {
  const out: InvitationRead = {
    couple: empty(), date: empty(), venue: empty(),
    address: empty(), reception: empty(), chuppah: empty(),
    rejected: [],
  };

  let obj: Record<string, unknown>;
  if (typeof raw === "string") {
    /* Models wrap JSON in prose and in code fences however firmly they are
       asked not to. Take the outermost object and nothing else. */
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) { out.rejected.push("לא הוחזר JSON"); return out; }
    try { obj = JSON.parse(m[0]) as Record<string, unknown>; }
    catch { out.rejected.push("JSON לא תקין"); return out; }
  } else if (raw && typeof raw === "object") {
    obj = raw as Record<string, unknown>;
  } else {
    out.rejected.push("לא הוחזר כלום");
    return out;
  }

  const take = <T,>(key: keyof InvitationRead, parse: (v: unknown) => T | null) => {
    const cell = obj[key as string] as { value?: unknown; source?: unknown } | undefined;
    if (!cell || typeof cell !== "object") return;
    const value = parse(cell.value);
    const source = quote(cell.source);
    if (value === null) {
      /* A source with no usable value is still worth showing: it is the line
         the model saw and could not turn into a field, and a person reading it
         often can. */
      if (source) out.rejected.push(`${key}: ${source}`);
      return;
    }
    if (!source) {
      /* Well formed and unquoted is the dangerous combination — it is what an
         invented value looks like. */
      out.rejected.push(`${key}: ${String(value)} (בלי ציטוט מההזמנה)`);
      return;
    }
    (out[key] as ReadField<T>) = { value, source };
  };

  take("couple", text);
  take("date", v => date(v, today));
  take("venue", text);
  take("address", text);
  take("reception", time);
  take("chuppah", time);

  /* The chuppah cannot precede the reception. When it does, one of the two was
     misread and there is no way to know which, so both are handed back. */
  const r = out.reception.value, c = out.chuppah.value;
  if (r && c && c <= r) {
    out.rejected.push(`שעות לא הגיוניות: קבלת פנים ${r}, חופה ${c}`);
    out.reception = empty();
    out.chuppah = empty();
  }

  return out;
}

/** What a person still has to supply. */
export function missingFromInvitation(r: InvitationRead): string[] {
  const label: Record<string, string> = {
    couple: "שמות הזוג", date: "תאריך", venue: "שם המקום",
    address: "כתובת", reception: "שעת קבלת פנים", chuppah: "שעת חופה",
  };
  return Object.entries(label)
    .filter(([k]) => (r[k as keyof InvitationRead] as ReadField<unknown>).value === null)
    .map(([, v]) => v);
}
