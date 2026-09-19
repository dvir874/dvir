import test from "node:test";
import assert from "node:assert/strict";
import { parseSeatingSheets, tableCapacity, type Grid } from "./seating-grid.ts";

/* Both fixtures are the real file טל sent on 19/09, trimmed to the rows that
   carry a shape. The numbers in them are the ones the family wrote. */

/* שפירא: three guest blocks across the page, then a per-table summary. */
const shapira: Grid = [
  ["שפירא"],
  ["שם", "כמות", "קבוצה", "שולחן", null, null,
   "שם", "כמות", "קבוצה", "שולחן", null,
   "שם", "כמות", "קבוצה", "שולחן", null,
   "שולחן", "כמות", "קבוצה"],
  ["אביה גלז", 1, "חברות טל", 1, "הזורעים", null,
   "אמנה ורן שדה", 7, "פורת", 6, null,
   "בועז ואיה מילוא", 2, "חברים תרצה", 20, null,
   1, 17, "חברות טל"],
  ["אוריה אסולין", 1, "חברות טל", 1, "לימודים", null,
   "תני וענת פורת", 5, "פורת", 6, null,
   "ברז'ית מילוא", 1, "חברים תרצה", 20, null,
   6, 12, "פורת"],
  ["אווה", 1, "חברות טל", 2, "שירות", null,
   null, null, null, null, null,
   "אתי ואבי טייך", 2, "הזורעים", 26, null,
   20, 10, "מילוא"],
  [null, null, null, null, null, null, null, null, null, null, null,
   null, null, null, null, null, null, 212],
];

/* קנריק: no headers. A bare table number opens a block, the households under
   it are the table, and the number beside the last of them closes it. */
const kanrik: Grid = [
  ["קנריק", null, null, "חברים חתן"],
  [16, null, null, 4],
  ["ימית וספי קנריק", "משפחה ימית", null, "אהרון נויק", "מצפה"],
  ["עמוס ורחל כהן", null, null, "אליעד החל"],
  ["איילון ורות כהן", null, null, "אלקנה"],
  ["אוריה ואייל גרינהוט ", 11, null, "אפרתי"],
  [15, null, null, "מרקס"],
  ["שולי ועליזה גדסי", "משפחה ימית", null, "בר לב"],
  ["חגית ומרדכי  אהרון", 9, null, "אטלני", 11],
  [null, null, null, 3],
  ["רוחמה ודביר כהן", 4, null, "ליכטמן", "צוות מלכה"],
  ["בשולחן של שפירא", "מבקש להצמיד לשולחן האבירים של דולב", null, "ביטון", 18],
  ['סה"כ ', 24, null, null, 29],
];

test("גיליון עם כותרות — שלושה בלוקים זה לצד זה", () => {
  const { entries, warnings } = parseSeatingSheets([{ name: "שפירא", grid: shapira }]);

  assert.equal(entries.length, 8, "כל בלוק נקרא, ולא רק הראשון");
  assert.deepEqual(
    entries.filter(e => e.sheet === "שפירא" && e.row === 3).map(e => [e.name, e.table]),
    [["אביה גלז", "1"], ["אמנה ורן שדה", "6"], ["בועז ואיה מילוא", "20"]],
  );
  const shade = entries.find(e => e.name === "אמנה ורן שדה");
  assert.equal(shade?.count, 7);
  assert.equal(shade?.group, "פורת");
  assert.equal(warnings.length, 0, "קובץ תקין לא מייצר אזהרות");
});

test("בלוק הסיכום נותן את התפוסה, ולא נקרא כאורחים", () => {
  const { entries, tables } = parseSeatingSheets([{ name: "שפירא", grid: shapira }]);

  assert.equal(entries.some(e => /^\d+$/.test(e.name)), false, "מספרים אינם שמות");
  assert.deepEqual(
    tables.map(t => [t.table, t.statedSeats]),
    [["1", 17], ["6", 12], ["2", null], ["20", 10], ["26", null]]
      .sort((a, b) => Number(a[0]) - Number(b[0])),
  );
  /* 212 סוגר את הגיליון בלי מספר שולחן לידו — סכום, לא שולחן. */
  assert.equal(tables.some(t => t.table === "212"), false);
});

test("גיליון בלי כותרות — מספר שולחן פותח בלוק, כמות סוגרת אותו", () => {
  const { entries, tables } = parseSeatingSheets([{ name: "קנריק", grid: kanrik }]);

  const at = (name: string) => entries.find(e => e.name.trim() === name)?.table;
  assert.equal(at("ימית וספי קנריק"), "16");
  assert.equal(at("אוריה ואייל גרינהוט"), "16", "השם שלצד הכמות עדיין יושב בשולחן");
  assert.equal(at("שולי ועליזה גדסי"), "15");
  assert.equal(at("אהרון נויק"), "4", "זוג העמודות השני נקרא גם הוא");
  assert.equal(at("ליכטמן"), "3");

  assert.equal(entries.find(e => e.name === "ימית וספי קנריק")?.group, "משפחה ימית");
  assert.equal(
    tables.find(t => t.table === "16")?.statedSeats, 11,
    "הכמות של הבלוק היא תפוסת השולחן, לא של משק בית",
  );
  assert.equal(
    entries.find(e => e.name === "ימית וספי קנריק")?.count, null,
    "הגיליון הזה לא סופר לפי משק בית, ולא ממציאים לו מספר",
  );
});

test("מי שהגיליון לא שיבץ חוזר בלי שולחן, ולא נדבק לשולחן הקודם", () => {
  const { entries, warnings } = parseSeatingSheets([{ name: "קנריק", grid: kanrik }]);

  assert.equal(entries.find(e => e.name === "רוחמה ודביר כהן")?.table, null);
  assert.match(warnings.join(" "), /בלי שולחן/);
  assert.equal(
    entries.some(e => e.name === "קנריק"), false,
    "שם הגיליון בפינה אינו מוזמן",
  );
});

test('קריאה שלא מסתדרת עם ה"סה"כ" של הגיליון לא מיובאת', () => {
  /* אותו גיליון, כש-11 הוחלף ב-12: הקריאה תגיע ל-25 והגיליון כותב 24. */
  const broken = kanrik.map(r => [...r]);
  broken[5][1] = 12;

  const ok = parseSeatingSheets([{ name: "קנריק", grid: kanrik }]);
  const bad = parseSeatingSheets([{ name: "קנריק", grid: broken }]);

  assert.ok(ok.entries.some(e => e.table === "16"));
  assert.equal(bad.entries.some(e => e.table === "16"), false, "לא משבצים על סמך קריאה שלא אומתה");
  assert.match(bad.skipped.map(s => s.reason).join(" "), /סה"כ 24/);
});

test("אותו שם בשני שולחנות מדווח", () => {
  const grid: Grid = [
    ["שם", "שולחן"],
    ["משפחת ביטון", 3],
    ["משפחת ביטון", 7],
  ];
  const { warnings } = parseSeatingSheets([{ name: "רשימה", grid }]);
  assert.match(warnings.join(" "), /משפחת ביטון.*3, 7/);
});

test("שולחן בלי מספר מדווח, כי הוא משתיק את ההודעה לכל האורחים", () => {
  const grid: Grid = [
    ["שם", "שולחן"],
    ["דוד ותמי", "משפחת ביטון"],
    ["יוסי", 4],
  ];
  const { entries, warnings } = parseSeatingSheets([{ name: "רשימה", grid }]);
  assert.equal(entries[0].table, "משפחת ביטון", "עדיין מייבאים — זה שיבוץ תקין");
  assert.match(warnings.join(" "), /בלי מספר/);
});

test("סימני כיווניות מ-RTL לא הופכים מספר שולחן לשם", () => {
  const grid: Grid = [
    ["שם", "שולחן"],
    ["דוד ותמי", "‏12"],
  ];
  const { tables, warnings } = parseSeatingSheets([{ name: "רשימה", grid }]);
  assert.equal(tables[0].table, "12");
  assert.equal(warnings.length, 0);
});

test("גיליון שאי אפשר לקרוא חוזר עם סיבה, ולא בשקט", () => {
  const grid: Grid = [["תקציב"], ["אולם", 45000], ["צלם", 9000]];
  const { entries, skipped } = parseSeatingSheets([{ name: "תקציב", grid }]);
  assert.equal(entries.length, 0);
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].reason, /לא נמצאו עמודות/);
});

test("תפוסה: מה שהמשפחה כתבה, ולעולם לא פחות ממי שיושב שם", () => {
  assert.equal(tableCapacity({ table: "1", statedSeats: 17, group: null }, 9), 17);
  assert.equal(tableCapacity({ table: "1", statedSeats: null, group: null }, 9), 9);
  assert.equal(tableCapacity({ table: "1", statedSeats: 4, group: null }, 9), 9);
  assert.equal(tableCapacity({ table: "1", statedSeats: 900, group: null }, 9), 40);
});
