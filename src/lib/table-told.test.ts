import test from "node:test";
import assert from "node:assert/strict";
import { foldTold, tableAction, tableSentEvent, TABLE_SENT } from "./table-told.ts";

test("מי שטרם נשלח אליו — נשלח ונרשם", () => {
  const a = tableAction(foldTold([]), "12");
  assert.deepEqual(a, { send: true, record: "table_number_sent:12" });
});

test("מי שכבר קיבל את השולחן הזה — לא נשלח שוב", () => {
  const told = foldTold([tableSentEvent("12")]);
  assert.deepEqual(tableAction(told, "12"), { send: false, record: null });
});

test("מי שהוזז — מקבל את המספר החדש", () => {
  /* הבאג. האורח קיבל "שולחן 12", הזוג העביר אותו ל-7, והשומר הבוליאני
     השתיק את התיקון. */
  const told = foldTold([tableSentEvent("12")]);
  const a = tableAction(told, "7");
  assert.equal(a.send, true);
  assert.equal(a.record, "table_number_sent:7");
});

test("הוזז פעמיים וחזר — לא נשלח שוב, כי את המספר הזה הוא כבר מחזיק", () => {
  const told = foldTold([tableSentEvent("12"), tableSentEvent("7")]);
  assert.equal(tableAction(told, "12").send, false);
  assert.equal(tableAction(told, "7").send, false);
  assert.equal(tableAction(told, "3").send, true);
});

test("שורה ישנה בלי שולחן — לא נשלח, אבל נרשם השולחן הנוכחי", () => {
  /* אחרת כל מי שכבר קיבל הודעה היה מקבל אותה שוב ברגע הדפלוי. */
  const told = foldTold([TABLE_SENT]);
  assert.deepEqual(tableAction(told, "12"), { send: false, record: "table_number_sent:12" });
});

test("אחרי שהשורה הישנה אומצה — הזזה כבר נתפסת", () => {
  const told = foldTold([TABLE_SENT, tableSentEvent("12")]);
  assert.equal(tableAction(told, "12").send, false, "עדיין מחזיק את 12");
  assert.equal(tableAction(told, "7").send, true, "הוזז — וזה כבר נתפס");
});

test("שורות של אירועים אחרים לא מבלבלות", () => {
  const told = foldTold(["day_before_sent", "rsvp_opened", tableSentEvent("9")]);
  assert.deepEqual([...told.tables], ["9"]);
  assert.equal(told.legacy, false);
});

test("שם שולחן ריק לא גורם לשליחה", () => {
  assert.deepEqual(tableAction(foldTold([]), "   "), { send: false, record: null });
  assert.deepEqual([...foldTold([`${TABLE_SENT}:`]).tables], [], "שורה פגומה אינה שולחן");
});

test("שולחן בשם ולא במספר — נשמר כמו שהוא", () => {
  /* השליחה עצמה חוסמת שם לא-מספרי במקום אחר (venueTableNumbers); כאן רק
     חשוב שההשוואה לא תאבד אותו. */
  const told = foldTold([tableSentEvent("משפחת ביטון")]);
  assert.equal(tableAction(told, "משפחת ביטון").send, false);
  assert.equal(tableAction(told, "ביטון").send, true);
});
