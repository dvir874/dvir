import test from "node:test";
import assert from "node:assert/strict";
import { gematria, withGershayim, hebrewDate, weddingDateLine } from "./hebrew-date.ts";

test("the two weddings we have, against their own printed invitations", () => {
  /* Her card says כ״ו אלול תשפ״ו. That is the check that matters — the code is
     wrong if it disagrees with the card the guests will be holding. */
  assert.equal(hebrewDate("2026-09-08"), "כ״ו אלול תשפ״ו");
  assert.equal(hebrewDate("2026-08-24"), "י״א אלול תשפ״ו");
});

test("15 and 16 are טו and טז, never יה or יו", () => {
  /* Those spell divine names. This is not a formatting preference. */
  assert.equal(gematria(15), "טו");
  assert.equal(gematria(16), "טז");
  assert.equal(gematria(14), "יד");
  assert.equal(gematria(17), "יז");
});

test("gematria across the range a date needs", () => {
  assert.equal(gematria(1), "א");
  assert.equal(gematria(9), "ט");
  assert.equal(gematria(10), "י");
  assert.equal(gematria(26), "כו");
  assert.equal(gematria(30), "ל");
  assert.equal(gematria(786), "תשפו");
  assert.equal(gematria(787), "תשפז");
  assert.equal(gematria(800), "תת");
});

test("gershayim before the last letter, geresh after a lone one", () => {
  assert.equal(withGershayim("כו"), "כ״ו");
  assert.equal(withGershayim("תשפו"), "תשפ״ו");
  assert.equal(withGershayim("ה"), "ה׳");
  assert.equal(withGershayim(""), "");
});

test("the line carries both calendars, civil first", () => {
  const line = weddingDateLine("2026-09-08");
  assert.match(line, /יום שלישי/);
  assert.match(line, /8 בספטמבר 2026/);
  assert.match(line, /כ״ו אלול תשפ״ו/);
});

test("a bad date degrades to nothing, never to a wrong date", () => {
  assert.equal(hebrewDate("not a date"), "");
  assert.equal(weddingDateLine("not a date"), "");
});

test("the Hebrew day does not slip when the server is elsewhere", () => {
  /* A date stored as midnight must not land on the previous Hebrew day because
     the process happens to run in another zone. */
  assert.equal(hebrewDate("2026-09-08T00:00:00Z"), "כ״ו אלול תשפ״ו");
  assert.equal(hebrewDate("2026-09-08T23:00:00Z"), "כ״ו אלול תשפ״ו");
});
