import test from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";
import { parseBlockedGuests, normalisePhone, isPlausiblePhone } from "./xlsx-blocks.ts";

/* Built to the shape of the real file for אורי ✧ שחר: two header rows, four
   families side by side, spacer columns between them — and, crucially, the
   first family listing headcount before phone while the rest do the opposite. */
function sheet(): Buffer {
  const rows = [
    ["מוזמנים פורת", "", "", "", "משפחת ביטון", "", "", "", "מוזמנים שחר", "", ""],
    ["שם", "מס' מוזמנים", "מס' טלפון", "", "שם", "מס' טלפון", "מס מוזמנים", "", "שם ", "מס טלפון ", "מוזמנים "],
    ["לינה ומנש שגיא", 2, "055-8838607", "", "איציק וגילה ביטון", "052-2962397", 2, "", "טל דורות", "0 52-868-8437", 1],
    ["ליאת וחזי ליפשיץ", 2, "052-3641679", "", "שירה ואייל", "052-6551107", 2, "", "עדו רוזנברג", 586855990, 1],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "גיליון1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

test("each block finds its own columns — the order is NOT assumed", () => {
  const r = parseBlockedGuests(sheet());
  const by = Object.fromEntries(r.blocks.map(b => [b.group, b.columns]));

  /* This is the whole point. פורת puts the headcount in B and the phone in C;
     ביטון does the reverse. Reading the first block's layout and applying it to
     the rest would give sixty-five people the phone number "2". */
  assert.deepEqual(by["מוזמנים פורת"], { name: "A", count: "B", phone: "C" });
  assert.deepEqual(by["משפחת ביטון"], { name: "E", phone: "F", count: "G" });
});

test("a swapped block does not put a headcount in the phone field", () => {
  const r = parseBlockedGuests(sheet());
  const lina = r.guests.find(g => g.name.startsWith("לינה"));
  assert.equal(lina?.phone, "0558838607");
  assert.equal(lina?.guest_count, 2, "2 is the headcount, not the phone");
  assert.ok(r.guests.every(g => g.phone.length >= 9), "no guest ends up with a phone of '2'");
});

test("the family a guest belongs to survives the import", () => {
  const r = parseBlockedGuests(sheet());
  assert.equal(r.guests.find(g => g.name.startsWith("לינה"))?.source_group, "מוזמנים פורת");
  assert.equal(r.guests.find(g => g.name.startsWith("איציק"))?.source_group, "משפחת ביטון");
});

test("Excel's eaten leading zero is restored", () => {
  /* 586855990 is stored as a NUMBER in the real file — eighty-seven rows of one
     family look like this. It imports without complaint and can never be
     matched to that guest's own WhatsApp reply. */
  assert.equal(normalisePhone(586855990), "0586855990");
  const r = parseBlockedGuests(sheet());
  assert.equal(r.guests.find(g => g.name === "עדו רוזנברג")?.phone, "0586855990");
});

test("a space after the zero is not a different number", () => {
  assert.equal(normalisePhone("0 52-868-8437"), "0528688437");
  assert.equal(normalisePhone("055-8838607"), "0558838607");
  assert.equal(normalisePhone("+972-52-3641679"), "0523641679");
  assert.equal(normalisePhone(""), "");
});

test("an unusable number is reported by name and row, never dropped", () => {
  const rows = [
    ["מוזמנים אורי", "", ""],
    ["שם", "מס טלפון", "מוזמנים"],
    ["איתי בשירי", " 50-590-220", 1],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "s");
  const r = parseBlockedGuests(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer);

  assert.equal(r.guests.length, 0);
  assert.equal(r.problems.length, 1);
  assert.equal(r.problems[0].name, "איתי בשירי");
  assert.match(r.problems[0].why, /לא תקין/);
  /* The row still counts towards the total, so 327 records stays 327 and the
     couple can see that one of them needs fixing rather than wondering where
     a guest went. */
  assert.equal(r.totals.records, 1);
});

test("plausibility rejects what is merely digits", () => {
  assert.ok(isPlausiblePhone("0528688437"));
  assert.ok(isPlausiblePhone("021234567"), "landline: 02 + 7 digits");
  assert.ok(!isPlausiblePhone("50590220"), "eight digits reaches nobody");
  assert.ok(!isPlausiblePhone(""));
  /* "1234567890" is deliberately NOT asserted either way any more. Ten digits
     with no leading zero was implausible while only Israeli numbers were
     accepted; with foreign numbers it is inside the E.164 range and cannot be
     ruled out from its shape alone. Where the two rules disagree, accepting is
     the safer error: a guest with an odd-looking number is reported to the
     couple, while one rejected here is simply gone. */
});

test("headcount defaults to one and is bounded", () => {
  const rows = [
    ["רשימה", "", ""],
    ["שם", "טלפון", "מוזמנים"],
    ["בלי כמות", "0521111111", ""],
    ["מוגזם", "0522222222", 900],
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "s");
  const r = parseBlockedGuests(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer);
  assert.equal(r.guests.find(g => g.name === "בלי כמות")?.guest_count, 1);
  assert.equal(r.guests.find(g => g.name === "מוגזם")?.guest_count, 20);
});

test("a plain single-table sheet still works", () => {
  /* The blocked reader must not be worse than the old one at the easy case. */
  const rows = [["שם", "טלפון", "מוזמנים"], ["דנה כהן", "0501234567", 3]];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "אורחים");
  const r = parseBlockedGuests(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer);
  assert.equal(r.guests.length, 1);
  assert.equal(r.guests[0].phone, "0501234567");
  assert.equal(r.guests[0].guest_count, 3);
});

test("a foreign number is kept, not rejected as malformed", () => {
  /* סטיב ומריאן live abroad. The client corrected their row to +1 646 284 1932
     on 13/08 and the parser called it invalid — refusing every foreign number
     would quietly drop them, and every overseas relative after them. */
  assert.equal(normalisePhone(" 16462841932 +"), "16462841932");
  assert.ok(isPlausiblePhone("16462841932"), "US");
  assert.ok(isPlausiblePhone("447911123456"), "UK");
  assert.ok(isPlausiblePhone("33612345678"), "France");
});

test("Israeli numbers still keep their local shape", () => {
  /* The rest of the system stores and matches on 0XX, so this must not change. */
  assert.equal(normalisePhone("+972-52-3641679"), "0523641679");
  assert.equal(normalisePhone("972537171556"), "0537171556");
  assert.equal(normalisePhone("055-8838607"), "0558838607");
});

test("a number that is merely digits is still refused", () => {
  assert.ok(!isPlausiblePhone("50590220"), "too short");
  assert.ok(!isPlausiblePhone("1234"), "far too short");
  assert.ok(!isPlausiblePhone("0123456789012"), "leading zero is a local number we misread");
  assert.ok(!isPlausiblePhone(""));
});

test("a sheet of just name and phone is read, not silently ignored", () => {
  /* תהל ואביב sent 309 rows of שם | פלאפון with no headcount column at all.
     The reader required all three and returned zero without saying why — the
     worst possible answer, because it looks like an empty file. Every row is
     one person until the guest says otherwise, which is the same default a
     blank count cell already had. */
  const rows = [["שם", "", "פלאפון"], ["אחינועם דוראני", "", "0556690775"], ["יעל ללום", "", "972587902074"]];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "גיליון1");
  const r = parseBlockedGuests(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer);
  assert.equal(r.guests.length, 2);
  assert.equal(r.guests[0].guest_count, 1);
  assert.equal(r.guests[1].phone, "0587902074", "972 prefix still normalised");
  assert.equal(r.blocks[0].columns.count, "—", "reported as absent, not guessed");
});
