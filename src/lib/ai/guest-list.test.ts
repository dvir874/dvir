import test from "node:test";
import assert from "node:assert/strict";
import { readGuestList, guestListSummary, looksLikeGuestLine, GUEST_LIST_PROMPT } from "./guest-list.ts";

/* שלמה's real list, in the shape it actually arrived in. */
const SOURCE = `רשימת מוזמנים

איתיאל ברקוביץ 0556624331
איתן סטולוביץ 0587994907
דוד לאוב 055688126
שוקי מאירסון 0526071083
פיני בראון 447981828250+
משפחת נגר 0556780585`;

const model = (guests: unknown[]) => ({ guests });

test("a clean list comes through whole", () => {
  const r = readGuestList(model([
    { name: "איתיאל ברקוביץ", phone: "0556624331", source: "איתיאל ברקוביץ 0556624331" },
    { name: "איתן סטולוביץ", phone: "0587994907", source: "איתן סטולוביץ 0587994907" },
    { name: "דוד לאוב", phone: "055688126", source: "דוד לאוב 055688126" },
    { name: "שוקי מאירסון", phone: "0526071083", source: "שוקי מאירסון 0526071083" },
    { name: "פיני בראון", phone: "447981828250", source: "פיני בראון 447981828250+" },
    { name: "משפחת נגר", phone: "0556780585", source: "משפחת נגר 0556780585" },
  ]), SOURCE);
  assert.equal(r.guests.length, 6);
  assert.deepEqual(r.missed, []);
  assert.deepEqual(r.rejected, []);
});

test("a guest the model skipped is reported, in the couple's own words", () => {
  /* THE FAILURE THIS FILE EXISTS FOR. Nobody counts 174 names; a dropped guest
     is discovered at the wedding, by not being there. The source is the only
     thing that can prove the model did not lose somebody. */
  const r = readGuestList(model([
    { name: "איתיאל ברקוביץ", phone: "0556624331", source: "איתיאל ברקוביץ 0556624331" },
  ]), SOURCE);
  assert.equal(r.guests.length, 1);
  assert.equal(r.missed.length, 5, r.missed.join(" | "));
  assert.ok(r.missed.includes("דוד לאוב 055688126"));
  assert.ok(guestListSummary(r).includes("לא נקראו"));
});

test("a number the model improved is refused, not stored", () => {
  /* דוד לאוב's line has nine digits. A model that completes it to ten produces
     a row that is well formed, plausible, and somebody else's phone. */
  const r = readGuestList(model([
    { name: "דוד לאוב", phone: "0556881260", source: "דוד לאוב 055688126" },
  ]), SOURCE);
  assert.equal(r.guests.length, 0);
  assert.ok(r.rejected[0].why.includes("לא מופיע בשורה"), JSON.stringify(r.rejected));
});

test("a foreign number is kept", () => {
  /* סטיב ומריאן live abroad and the strict Israeli check called them invalid.
     Refusing every foreign number drops the relatives hardest to reach. */
  const r = readGuestList(model([
    { name: "פיני בראון", phone: "447981828250", source: "פיני בראון 447981828250+" },
  ]), "פיני בראון 447981828250+");
  assert.equal(r.guests[0].phone, "447981828250");
});

test("a household size is kept when the line says one", () => {
  const src = "משפחת כהן 4 0501234567";
  const r = readGuestList(model([
    { name: "משפחת כהן", phone: "0501234567", source: src, count: 4 },
  ]), src);
  assert.equal(r.guests[0].count, 4);
  /* And never invented for an ordinary line. */
  const one = readGuestList(model([
    { name: "דנה", phone: "0501234567", source: "דנה 0501234567" },
  ]), "דנה 0501234567");
  assert.equal(one.guests[0].count, undefined);
});

test("an invented guest with no line behind them is refused", () => {
  const r = readGuestList(model([
    { name: "מישהו", phone: "0500000000", source: "" },
  ]), SOURCE);
  /* No source to check against, so the number cannot be shown to come from the
     list — and every real line is still reported missing. */
  assert.equal(r.guests.length, 1);
  assert.equal(r.missed.length, 6);
});

test("a row with no name or no number is shown, never dropped", () => {
  const r = readGuestList(model([
    { name: "", phone: "0501234567", source: "0501234567" },
    { name: "שם בלי מספר", phone: "", source: "שם בלי מספר" },
  ]), "0501234567");
  assert.equal(r.guests.length, 0);
  assert.equal(r.rejected.length, 2);
});

test("nothing usable back is never read as an empty list", () => {
  /* The dangerous silence: a failed parse and a list of nobody look identical
     on screen unless this is true. */
  for (const junk of ["לא הצלחתי", "", null, undefined, 42, "{"]) {
    const r = readGuestList(junk, SOURCE);
    assert.equal(r.guests.length, 0);
    assert.equal(r.missed.length, 6, `silent on: ${JSON.stringify(junk)}`);
  }
});

test("headers and blank lines are not people who went missing", () => {
  assert.equal(looksLikeGuestLine("רשימת מוזמנים"), false);
  assert.equal(looksLikeGuestLine(""), false);
  assert.equal(looksLikeGuestLine("חברים מהצבא"), false);
  assert.equal(looksLikeGuestLine("איתיאל ברקוביץ 0556624331"), true);
});

test("the same line read twice becomes one guest", () => {
  const src = "דנה כהן 0501234567";
  const r = readGuestList(model([
    { name: "דנה כהן", phone: "0501234567", source: src },
    { name: "דנה כהן", phone: "050-123-4567", source: src },
  ]), src);
  assert.equal(r.guests.length, 1);
});

test("two people sharing one handset are both kept", () => {
  /* עידן אבידרור and שרה שחר share a number, as couples do. */
  const src = "עידן אבידרור 0501234567\nשרה שחר 0501234567";
  const r = readGuestList(model([
    { name: "עידן אבידרור", phone: "0501234567", source: "עידן אבידרור 0501234567" },
    { name: "שרה שחר", phone: "0501234567", source: "שרה שחר 0501234567" },
  ]), src);
  assert.equal(r.guests.length, 2);
});

test("the prompt states the rules the validator enforces", () => {
  assert.ok(GUEST_LIST_PROMPT.includes("source"));
  assert.ok(GUEST_LIST_PROMPT.includes("אל תתקן מספרי טלפון"));
  assert.ok(GUEST_LIST_PROMPT.includes("שורה אחת = רשומה אחת"));
});
