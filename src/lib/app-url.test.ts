import test from "node:test";
import assert from "node:assert/strict";
import { APP_URL, APP_HOST } from "./app-url.ts";

test("כתובת מלאה, בלי סלאש בסוף", () => {
  assert.ok(APP_URL.startsWith("https://"));
  assert.ok(!APP_URL.endsWith("/"), "סלאש כפול בקישור שובר חלק מהלקוחות");
});

test("APP_HOST הוא אותה כתובת בלי הסכימה", () => {
  assert.equal(APP_HOST, APP_URL.replace(/^https:\/\//, ""));
  assert.ok(!APP_HOST.includes("//"));
});

/* The domain was bought so Meta would verify the business. A default that
   still points at the shared host would quietly undo that. */
test("ברירת המחדל היא הדומיין שנקנה, לא vercel.app", () => {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    assert.ok(!APP_URL.includes("vercel.app"),
      "ברירת המחדל חייבת להיות הדומיין העסקי");
  }
});

/* The reason this file exists, stated as a test.
 *
 * The address was written literally in nineteen files. Nothing was wrong with
 * any one of them — each was correct on the day it was typed — and that is
 * precisely why the drift was invisible: a literal never disagrees with
 * itself, it only disagrees with the variable somebody else read. When the
 * domain changed, half the system would have moved and half would not, and the
 * half left behind was the half a guest sees.
 *
 * So the literal is banned rather than merely removed. This file may name it,
 * in the comment explaining why it was bought, and so may a test that passes a
 * base explicitly — a test that hands smsInvite a URL is checking what it does
 * with the one it is given, which is the opposite of the mistake. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) sourceFiles(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

test("אף קובץ לא כותב את הדומיין הישן בתוך הקוד", () => {
  const offenders = sourceFiles("src")
    .filter((p) => !p.endsWith(join("lib", "app-url.ts")) && !/\.test\.tsx?$/.test(p))
    .filter((p) => readFileSync(p, "utf8").includes("regalifnei.vercel.app"));

  assert.deepEqual(offenders, [],
    "כתובת קשיחה בקוד — להשתמש ב-APP_URL או ב-APP_HOST");
});
