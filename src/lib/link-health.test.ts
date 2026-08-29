import test from "node:test";
import assert from "node:assert/strict";
import { brokenSummary, type LinkCheck } from "./link-health.ts";

const ok = (label: string): LinkCheck => ({ label, status: "ok" });
const broken = (label: string, detail: string): LinkCheck => ({ label, status: "broken", detail });
const missing = (label: string): LinkCheck => ({ label, status: "missing" });

test("nothing wrong is silence, not a report", () => {
  /* An alert that fires on a healthy event is an alert nobody reads by the
     third day, and the whole point of this one is to be believed. */
  assert.equal(brokenSummary([ok("תמונת ההזמנה"), ok("קישור אישור הגעה")]), "");
});

test("missing is not broken", () => {
  /* A wedding with no rides group has no rides group. That is a choice, not a
     fault, and it must never look like one — ירון ואיילת have no invitation
     card yet because they have no guests yet. */
  assert.equal(brokenSummary([missing("קבוצת טרמפים"), ok("קישור אישור הגעה")]), "");
});

test("broken says which link and why", () => {
  const s = brokenSummary([
    ok("תמונת ההזמנה"),
    broken("קבוצת טרמפים", "וואטסאפ לא מזהה את הקישור כקבוצה"),
  ]);
  assert.match(s, /קבוצת טרמפים/);
  assert.match(s, /לא מזהה/, "the reason travels with the name — 'broken' alone sends nobody anywhere");
});

test("several failures are all named", () => {
  const s = brokenSummary([
    broken("תמונת ההזמנה", "שגיאה 404"),
    broken("דף העלאת תמונות", "שגיאה 500"),
  ]);
  assert.match(s, /תמונת ההזמנה/);
  assert.match(s, /דף העלאת תמונות/);
});
