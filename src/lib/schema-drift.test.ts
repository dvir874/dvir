import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/* Three column names that have never existed on `events`.
 *
 * payment_status, payment_amount and payment_date are columns on `vendors`.
 * The Event interface declared all three anyway, which meant every reader
 * typechecked and every reader got undefined — and the places that named them
 * to PostgREST fared worse than that:
 *
 *   /api/manager/overview   selected them → 42703 → 500 on every call, and
 *                           /admin/dashboard rendered zeros for as long as it
 *                           has existed
 *   /api/admin/today        selected them → the whole "היום שלי" screen empty
 *   /api/stripe/webhook     selected then wrote them → a couple could pay and
 *                           the event stayed "טרם שולם", with 200 returned to
 *                           Stripe so it never retried
 *   /api/events/[id]        allowed them in PATCH
 *
 * Five places, one wrong belief, and a type that made the belief compile. The
 * real columns are price_charged, paid_at, payment_method, payment_note and
 * payment_asked_at.
 *
 * They are real on `vendors`, and the three vendor surfaces read them
 * correctly, so this guard exempts any file that talks about vendors at all.
 * That is deliberately loose: no file today touches both tables, and the day
 * one does, the looser rule is the one that fails open rather than blocking a
 * commit over a column that is genuinely there.
 *
 * A comment may name them — this file is nothing but. Code may not. */
const GONE = ["payment_status", "payment_amount", "payment_date"];

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

/** Comments are prose about the mistake; only code can repeat it. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

test("אף קובץ לא מבקש מהדאטהבייס עמודות תשלום שלא קיימות", () => {
  const offenders: string[] = [];
  for (const p of sourceFiles("src")) {
    if (p.endsWith(join("lib", "schema-drift.test.ts"))) continue;
    const code = stripComments(readFileSync(p, "utf8"));
    if (/vendor/i.test(code)) continue;
    for (const col of GONE) if (code.includes(col)) offenders.push(`${p} → ${col}`);
  }
  assert.deepEqual(offenders, [],
    "עמודה שלא קיימת ב-events — להשתמש ב-price_charged / paid_at");
});
