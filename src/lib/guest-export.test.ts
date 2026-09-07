import test from "node:test";
import assert from "node:assert/strict";
import { guestExport, exportFilename, EXPORT_HEADERS } from "./guest-export.ts";

const g = (o: Record<string, unknown>) => ({ name: "אורח", status: "pending", ...o });

test("גיליון המאושרים מכיל רק מי שאישר", () => {
  const e = guestExport([
    g({ name: "אבי", status: "confirmed", guest_count: 2 }),
    g({ name: "בני", status: "declined" }),
    g({ name: "גדי", status: "pending" }),
  ]);
  assert.equal(e.confirmed.length, 1);
  assert.equal(e.all.length, 3);
  assert.equal(e.confirmed[0][0], "אבי");
});

/* The column a seating tool cannot work without: a guest who confirmed for
   four is four chairs. */
test("כמות נספרת רק למי שמגיע", () => {
  const e = guestExport([
    g({ name: "אבי", status: "confirmed", guest_count: 4 }),
    g({ name: "בני", status: "pending", guest_count: 3 }),
    g({ name: "גדי", status: "declined", guest_count: 2 }),
  ]);
  assert.equal(e.souls, 4, "רק המאושרים נספרים כנפשות");
  const pending = e.all.find(r => r[0] === "בני");
  assert.equal(pending?.[3], "", "כמות ליד 'טרם ענו' היא מספר שהזוג לא נתן");
  assert.equal(e.all.find(r => r[0] === "גדי")?.[3], "");
});

test("מאשר בלי כמות נספר כאחד", () => {
  assert.equal(guestExport([g({ status: "confirmed" })]).souls, 1);
  assert.equal(guestExport([g({ status: "confirmed", guest_count: 0 })]).souls, 1);
});

/* A preview guest with nobody behind them must never reach a caterer's
   headcount, and an empty row is a chair for nobody. */
test("אורחי דמו ושורות בלי שם לא נכנסים", () => {
  const e = guestExport([
    g({ name: "אבי", status: "confirmed" }),
    g({ name: "דמו", status: "confirmed", category: "demo" }),
    g({ name: "   ", status: "confirmed" }),
  ]);
  assert.equal(e.confirmed.length, 1);
  assert.equal(e.souls, 1);
});

test("סטטוס מתורגם לעברית, ומיון לפי שם", () => {
  const e = guestExport([g({ name: "תמר" }), g({ name: "אבי" })]);
  assert.deepEqual(e.all.map(r => r[0]), ["אבי", "תמר"]);
  assert.equal(e.all[0][2], "טרם ענו");
});

test("הסיכום סופר את שלושת הסטטוסים", () => {
  const e = guestExport([
    g({ name: "א", status: "confirmed" }), g({ name: "ב", status: "confirmed" }),
    g({ name: "ג", status: "declined" }), g({ name: "ד", status: "pending" }),
  ]);
  assert.deepEqual(e.counts, { confirmed: 2, declined: 1, pending: 1 });
});

test("שם הקובץ נשאר מזוהה, ובלי תווים שפוסלים אותו", () => {
  const f = exportFilename("תהל ואביב", "2026-09-07");
  assert.ok(f.includes("תהל ואביב"));
  assert.ok(f.includes("07.09.2026"));
  assert.ok(f.endsWith(".xlsx"));
  assert.ok(!/[\\/:*?"<>|]/.test(exportFilename('א/ב:ג*', "2026-09-07").replace(".xlsx", "")));
});

test("שש עמודות, בסדר שאתרי הושבה מצפים לו", () => {
  assert.equal(EXPORT_HEADERS.length, 6);
  assert.equal(EXPORT_HEADERS[3], "כמות");
});
