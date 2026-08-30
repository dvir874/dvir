import test from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { generateIplanXls } from "./xlsx-utils.ts";

/* iplan rejected four different versions of this file before דביר sent the
   real template on 24/08. Each assertion below is one of the things that was
   wrong, so none of them can be wrong again. */

const guests = [
  { name: "אופיר",  phone: "0586850990", guest_count: 1, status: "confirmed", side: "groom" },
  { name: "אוריין", phone: "0533350489", guest_count: 2, status: "confirmed", side: "bride" },
  { name: "לא ענה", phone: "0500000000", guest_count: 3, status: "pending",   side: "groom" },
  { name: "לא מגיע", phone: "0500000001", guest_count: 4, status: "declined", side: "bride" },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as any[];

const read = () => {
  const wb = XLSX.read(generateIplanXls(guests), { type: "buffer" });
  const sheet = wb.SheetNames[0];
  return { sheet, rows: XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1 }) as unknown[][] };
};

test("the sheet is named הזמנות", () => {
  /* It was "אורחים" first. iplan looks the sheet up by name and finds nothing. */
  assert.equal(read().sheet, "הזמנות");
});

test("there are two header rows, not one", () => {
  /* With one, every guest shifted up a row and the first was read as a header
     and lost. Row 0 carries no data and iplan does not read it — but the file
     is rejected without it. */
  const { rows } = read();
  assert.equal(rows[0][2], "שיוך");
  assert.equal(rows[1][0], "הזמנה לכבוד");
  assert.equal(rows[2][0], "אופיר");
});

test("the name column is הזמנה לכבוד", () => {
  /* "הזמנה עבור" reads correctly to a person and not at all to iplan. */
  assert.deepEqual(read().rows[1].slice(0, 5),
    ["הזמנה לכבוד", "מס' אורחים שהוזמנו", "צד", "קבוצה", "סלולרי"]);
});

test("only confirmed guests are written", () => {
  /* The chair and the meal are both ordered off this file, so seating someone
     who has not answered is the one mistake here that costs money. */
  const names = read().rows.slice(2).map(r => r[0]);
  assert.deepEqual(names, ["אופיר", "אוריין"]);
});

test("headcount and side survive the round trip", () => {
  const [a, b] = read().rows.slice(2);
  assert.equal(a[1], 1); assert.equal(a[2], "חתן"); assert.equal(a[4], "0586850990");
  assert.equal(b[1], 2); assert.equal(b[2], "כלה");
});
