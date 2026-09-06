/** Why a send run failed, and whether it is worth waking Dvir for.
 *
 * The nineteen reminders that failed #132000 between 05/09 and 06/09 were
 * recorded correctly — in wa_runs.details.failed, which is a JSON column no
 * screen reads. Two of the three runs said nothing at all, because the summary
 * spoke only when more than five messages failed and those runs failed three
 * each. Dvir found them in a screenshot he happened to open.
 *
 * Counting failures is the wrong test. Three guests failing 131026 is three
 * wrong phone numbers, and the nightly digest is soon enough. Three guests
 * failing 132000 is the template not matching what the sender builds, which
 * means the next run fails too, and every run after it, until an env var
 * changes. Same count, different emergency.
 *
 * So the question is not how many failed. It is whether the failure describes
 * the guest or describes us. */

export type FailedRow = { name?: string; error?: string };

/** Meta prefixes its codes: "(#132000) Number of parameters does not match". */
export function errorCode(error?: string): number | null {
  const m = /\(#(\d{4,6})\)/.exec(error ?? "");
  return m ? Number(m[1]) : null;
}

/* Failures that describe the message we built rather than the guest we built
   it for. Every recipient in the run gets the identical rejection, and every
   future run repeats it, because the guest was never the problem. */
const CONFIG_CODES = new Map<number, string>([
  [131008, "חסר פרמטר בתבנית"],
  [132000, "מספר הפרמטרים בתבנית לא תואם למה שהמערכת שולחת"],
  [132001, "התבנית לא קיימת בשם או בשפה שביקשנו"],
  [132005, "תוכן התבנית השתנה במטא"],
  [132007, "התבנית מפרה את כללי מטא"],
  [132012, "פורמט פרמטר לא תקין"],
  [132015, "התבנית מושהית במטא"],
  [132016, "התבנית הושבתה במטא"],
  [133010, "המספר לא רשום במטא"],
]);

/* Failures that belong to one phone number. Normal in every run, and only
   interesting in bulk. */
const GUEST_CODES = new Map<number, string>([
  [130472, "הנמען בקבוצת ניסוי של מטא"],
  [131026, "אין וואטסאפ במספר"],
  [131047, "חלון 24 השעות נסגר"],
  [131048, "המספר שלנו מוגבל אצל מטא"],
  [131049, "מכסת שיווק יומית אצל הנמען"],
  [131050, "הנמען ביטל קבלת הודעות"],
]);

/** True when the failure will repeat for every guest and every future run. */
export function isConfigFailure(error?: string): boolean {
  const c = errorCode(error);
  return c !== null && CONFIG_CODES.has(c);
}

export function reasonText(error?: string): string {
  const c = errorCode(error);
  if (c !== null) {
    const known = CONFIG_CODES.get(c) ?? GUEST_CODES.get(c);
    if (known) return known;
  }
  /* Unknown code: Meta's own words, trimmed to fit one WhatsApp line rather
     than dropped. An unrecognised failure is exactly the one worth reading. */
  const raw = (error ?? "").replace(/\s+/g, " ").trim();
  return raw ? raw.slice(0, 70) : "שגיאה לא מזוהה";
}

/** The failure that best explains the run: any config failure first — one is
    enough to condemn every later run — otherwise the most common one. */
function dominant(failed: FailedRow[]): FailedRow | null {
  const config = failed.find(f => isConfigFailure(f.error));
  if (config) return config;

  const tally = new Map<string, { row: FailedRow; n: number }>();
  for (const f of failed) {
    const key = String(errorCode(f.error) ?? f.error ?? "");
    const hit = tally.get(key);
    if (hit) hit.n += 1;
    else tally.set(key, { row: f, n: 1 });
  }
  let best: { row: FailedRow; n: number } | null = null;
  for (const v of tally.values()) if (!best || v.n > best.n) best = v;
  return best?.row ?? null;
}

/** How loudly a run's failures deserve to be reported, or null for "quietly,
    in the digest, like every ordinary bad phone number".
 *
 * Three separate triggers, because three separate things go wrong:
 *   · a config failure — the run is broken and so is the next one
 *   · nothing sent at all — never normal when something was attempted
 *   · failures in bulk — one guest is noise, many are a pattern */
export function failureAlert(failed: FailedRow[], sent: number): string | null {
  if (failed.length === 0) return null;

  const top = dominant(failed);
  const why = reasonText(top?.error);
  const n = failed.length;

  if (isConfigFailure(top?.error)) {
    return `🚨 ${n} נכשלו — ${why}. גם הריצות הבאות ייכשלו עד שנתקן.`;
  }
  if (sent === 0) return `🚨 כל ${n} ההודעות נכשלו — ${why}`;
  if (n > 5) return `⚠️ ${n} נכשלו — ${why}`;
  return null;
}
