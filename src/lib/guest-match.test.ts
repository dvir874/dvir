import test from "node:test";
import assert from "node:assert/strict";
import { matchGuest, parseList, tokens } from "./guest-match.ts";

/* Every case below is from a list somebody actually sent, matched by hand on
   30-31/08. The four that needed judgement and the five that were traps are
   the reason this file exists. */

/** שחר's guest list, the rows the mother's thirteen names had to land on. */
const LIST = [
  "אביתר והילור ביטון", "אילנה אלון", "איתי ולירן בן חורין", "אסנת ויוסי מסיקה",
  "דני וענתי סגל", "טליה ואשר מגנהיים", "יפה ומוטי דהן", "ישי שטקלר", "כוכי",
  "מרים ביטון", "מרים ואביגיל ביטון", "נועם קדר", "עידית ורועי",
  /* the traps — rows that share a fragment with a name on the list */
  "אלקנה סעדיה", "איתמר גילמור", "תהילה ומתנאל פינטו", "אריאלה ומיכאל אלגוזי",
  "הרב דניאל ביגל", "דוד ותמי ביטון", "דוד ומעין אביב",
];
const m = (q: string) => matchGuest(q, LIST, r => r);

test("a name typed exactly is matched exactly", () => {
  const r = m("אילנה אלון");
  assert.equal(r.confidence, "exact");
  assert.equal(r.match, "אילנה אלון");
});

test("a surname the sender left off is still the same household", () => {
  /* "אביתר והילור" and "מרים ואביגיל" — every typed word present, the stored
     row simply carries the family name too. */
  for (const [q, want] of [
    ["אביתר והילור", "אביתר והילור ביטון"],
    ["מרים ואביגיל", "מרים ואביגיל ביטון"],
  ] as const) {
    const r = m(q);
    assert.equal(r.confidence, "exact", q);
    assert.equal(r.match, want);
  }
});

test("Hebrew spelled with or without its vowel letters is one name", () => {
  /* נועם קידר / נועם קדר and לירון / לירן. Both were typed one way and stored
     the other, and both are the same person. */
  const a = m("נועם קידר");
  assert.equal(a.confidence, "spelling");
  assert.equal(a.match, "נועם קדר");

  const b = m("איתי ולירון בן חורין");
  assert.ok(b.confidence === "spelling" || b.confidence === "exact");
  assert.equal(b.match, "איתי ולירן בן חורין");
});

test("a fragment inside a longer word is not a match", () => {
  /* These five all came back from substring matching on the real list, and
     every one of them would have rewritten somebody else's row:
       עדי   inside סעדיה
       תמר   inside איתמר
       הילה  inside תהילה
       אריאל inside אריאלה
       יגל   inside ביגל  */
  for (const q of ["עדי לוי", "תמר אתנחתא", "הילה אוריה", "אריאל גלמן", "יגל בן חיים"]) {
    const r = m(q);
    assert.notEqual(r.confidence, "exact", q);
    assert.notEqual(r.confidence, "spelling", q);
  }
});

test("a shared first name does not make two households one", () => {
  /* דוד ותמי ביטון and דוד ומעין אביב are different people who share "דוד".
     Scoring on it would make either of them a confident match for the other. */
  assert.ok(!tokens("דוד ותמי ביטון").includes("ו"));
  const r = m("דוד וחנה כהן");
  assert.notEqual(r.confidence, "exact");
  assert.notEqual(r.confidence, "spelling");
});

test("a name that is on the list twice is never picked for the sender", () => {
  const r = matchGuest("ליאלי ותומר", ["ליאלי ותומר", "ליאלי ותומר"], x => x);
  assert.equal(r.confidence, "ambiguous");
  assert.equal(r.match, undefined);
  assert.equal(r.candidates.length, 2);
});

test("a name nobody on the list resembles returns nothing, not a guess", () => {
  const r = m("שלמה גור");
  assert.ok(r.confidence === "none" || r.confidence === "ambiguous");
  assert.equal(r.match, undefined);
});

/* ── reading the pasted text ──────────────────────────────────────────── */

test("the shapes people actually send are all read", () => {
  /* Line for line, the message שחר's mother sent on 31/08. */
  const parsed = parseList(`
אביתר והילור - 1
אילנה אלון - לא באה
דני וענתי סגל - 6
טליה ואשר מגנהיים - לא מגיעים
כוכי - 1
`);
  assert.equal(parsed.length, 5);
  assert.deepEqual(parsed[0], { raw: "אביתר והילור - 1", name: "אביתר והילור", count: 1 });
  assert.deepEqual(parsed[1], { raw: "אילנה אלון - לא באה", name: "אילנה אלון", declined: true });
  assert.equal(parsed[2].count, 6);
  assert.equal(parsed[3].declined, true);
});

test("the markers a sender writes for himself are not part of the name", () => {
  /* From the eleven names added to תהל on 30/08. */
  const parsed = parseList("(הוספה) מרינט\n(תיקון) עופרה דוראני\nרינה אבנציק");
  assert.deepEqual(parsed.map(p => p.name), ["מרינט", "עופרה דוראני", "רינה אבנציק"]);
});

test("a headline is not a guest", () => {
  const parsed = parseList("רשימה מעודכנת:\n\nאילנה אלון - 1");
  assert.equal(parsed.length, 2);          // the heading survives as a name…
  assert.equal(parsed[1].name, "אילנה אלון");
});

test("a phone number in the line is not a headcount", () => {
  const parsed = parseList("עדי לוי +972 54-431-7380");
  assert.equal(parsed[0].count, undefined);
  assert.ok(parsed[0].name.startsWith("עדי לוי"));
});
