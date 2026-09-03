/* Reading a guest list that arrived as whatever the couple happened to have.
 *
 * The import that exists reads .xlsx, .xls and .csv. What couples actually
 * send is none of those. שלמה sent a Google Doc of 174 free-text lines —
 * "איתיאל ברקוביץ 0556624331" — and it was turned into rows by hand, one
 * afternoon, by Dvir. ירון's list is next, and after him everyone else.
 *
 * A model reads the shape. What it must not do is lose anybody.
 *
 * THE RULE, in Dvir's words and unchanged from intake-parser.ts: "אנחנו לא
 * רוצים להשמיט אף שם או מספר פלאפון או אורח". A guest list is the one input
 * where a silent omission is invisible by construction — nobody counts 174
 * names, and the missing person is discovered at the wedding, by not being
 * there.
 *
 * So this does something the invitation reader does not have to: it checks the
 * model's output back against the ORIGINAL TEXT. Every line of the source that
 * carries a phone number must appear in the result. A line that does not is
 * reported in `missed`, by its own words, and a person decides.
 *
 * That check is the reason to trust the feature. Without it, "the model read
 * 170 of 174 lines" and "the list had 170 people" are the same screen.
 *
 * Import-free, like invitation.ts. Normalisation to the stored 05X shape stays
 * where it already is — toLocalPhone, in the import route — so this file never
 * becomes a second opinion about what a phone number is.
 */

export interface ReadGuest {
  name: string;
  /** As written. The import route normalises; this only judges plausibility. */
  phone: string;
  /** The exact line of the source this was read from. */
  source: string;
  /** Household size, when the line says one ("משפחת כהן 4"). */
  count?: number;
}

export interface GuestListRead {
  guests: ReadGuest[];
  /** Returned by the model and refused here, with the reason. */
  rejected: { source: string; why: string }[];
  /** In the source, carrying a phone, and absent from the result. */
  missed: string[];
}

export const GUEST_LIST_PROMPT = `אתה קורא רשימת מוזמנים לחתונה.

החזר JSON בלבד, במבנה:
{ "guests": [ { "name": "שם", "phone": "מספר", "source": "השורה המדויקת", "count": 1 } ] }

כללים מחייבים:
- שורה אחת = רשומה אחת. אל תאחד ואל תפצל.
- source חייב להיות השורה כפי שהיא מופיעה, מילה במילה.
- אל תתקן מספרי טלפון, אל תוסיף ואל תוריד ספרות. העתק כפי שכתוב.
- אל תמציא שמות ואל תמציא מספרים. אם שורה לא ברורה — החזר אותה בכל זאת עם מה שיש.
- count רק אם השורה אומרת כמה אנשים (למשל "משפחת כהן 4"). אחרת 1.
- כותרות, שורות ריקות וטקסט שאינו מוזמן — לדלג.
- אל תוסיף טקסט מחוץ ל-JSON.`;

const MAX_NAME = 120;
const MAX_LINE = 200;

const clean = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, " ").trim();
  return s && s.length <= max ? s : null;
};

/** Digits a line carries, as one string, for comparing a line to a result. */
const digitsOf = (s: string): string => s.replace(/\D/g, "");

/* Plausible enough to be somebody's number, and nothing stricter.
   סטיב ומריאן live abroad and the strict Israeli check called +1 646 284 1932
   invalid — refusing every foreign number quietly drops the relatives who are
   hardest to reach in the first place. */
function plausiblePhone(raw: string): boolean {
  const d = digitsOf(raw);
  return d.length >= 9 && d.length <= 15;
}

/* A line worth accounting for: it carries something that could be a phone.
   Headers, blank lines and "רשימת מוזמנים" carry no long digit run and are
   not people who could go missing. */
export function looksLikeGuestLine(line: string): boolean {
  return /\d[\d\s\-+().]{7,}/.test(line);
}

/**
 * Turn what the model returned into rows that can be trusted, and say what it
 * lost.
 *
 * `sourceText` is the original list. It is not optional and it is not
 * decoration: it is the only thing that can prove the model did not skip
 * somebody, and skipping somebody is the failure this feature has.
 */
export function readGuestList(raw: unknown, sourceText: string): GuestListRead {
  const out: GuestListRead = { guests: [], rejected: [], missed: [] };

  let obj: { guests?: unknown } | null = null;
  if (typeof raw === "string") {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { obj = JSON.parse(m[0]) as { guests?: unknown }; } catch { /* below */ } }
  } else if (raw && typeof raw === "object") {
    obj = raw as { guests?: unknown };
  }

  const rows = Array.isArray(obj?.guests) ? obj!.guests as unknown[] : null;
  if (!rows) {
    /* Nothing usable came back. Every line that looked like a person is
       reported missing — the caller must never read this as an empty list. */
    out.missed = sourceText.split(/\r?\n/).map(l => l.trim()).filter(looksLikeGuestLine);
    return out;
  }

  const seen = new Set<string>();
  for (const r of rows) {
    const cell = r as { name?: unknown; phone?: unknown; source?: unknown; count?: unknown };
    const source = clean(cell.source, MAX_LINE) ?? "";
    const name = clean(cell.name, MAX_NAME);
    const phone = clean(cell.phone, 40);

    if (!name) { out.rejected.push({ source: source || "(ללא שורה)", why: "אין שם" }); continue; }
    if (!phone || !plausiblePhone(phone)) {
      out.rejected.push({ source: source || name, why: "אין מספר טלפון תקין" });
      continue;
    }
    /* The number must actually appear in the line it claims to come from. A
       model that "helpfully" completes a nine-digit number to ten produces a
       row that is well formed, plausible, and somebody else's phone. */
    if (source && !digitsOf(source).includes(digitsOf(phone))) {
      out.rejected.push({ source, why: `המספר ${phone} לא מופיע בשורה` });
      continue;
    }

    const n = Number(cell.count);
    const count = Number.isFinite(n) && n >= 1 && n <= 20 ? Math.floor(n) : 1;

    const key = `${name}|${digitsOf(phone)}`;
    if (seen.has(key)) continue;      /* the same line read twice */
    seen.add(key);
    out.guests.push({ name, phone, source: source || `${name} ${phone}`, ...(count > 1 ? { count } : {}) });
  }

  /* ── The check the whole feature rests on ──────────────────────────────
     Every line of the source carrying a phone must be accounted for, either
     as a guest or as a rejection. What is left is what the model dropped, and
     it is handed back in the couple's own words. */
  const accounted = new Set<string>();
  for (const g of out.guests) accounted.add(digitsOf(g.phone));
  for (const r of out.rejected) if (r.source) accounted.add(digitsOf(r.source));

  for (const line of sourceText.split(/\r?\n/)) {
    const t = line.trim();
    if (!looksLikeGuestLine(t)) continue;
    const d = digitsOf(t);
    /* Accounted for if any recorded number appears in this line's digits. */
    let found = false;
    for (const a of accounted) {
      if (a && (d.includes(a) || a.includes(d))) { found = true; break; }
    }
    if (!found) out.missed.push(t.slice(0, MAX_LINE));
  }

  return out;
}

/** One line a person can act on, never a silent success. */
export function guestListSummary(r: GuestListRead): string {
  const parts = [`${r.guests.length} מוזמנים נקראו`];
  if (r.rejected.length) parts.push(`${r.rejected.length} שורות דורשות בדיקה`);
  if (r.missed.length) parts.push(`⚠️ ${r.missed.length} שורות לא נקראו כלל`);
  return parts.join(" · ");
}
