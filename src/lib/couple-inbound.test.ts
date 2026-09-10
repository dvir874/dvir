import test from "node:test";
import assert from "node:assert/strict";
import { coupleIntent } from "./couple-inbound.ts";

/* Every string below is a real message from תהל שלוש to the business number,
   quoted from wa_failures. All four were recorded as delivery failures and
   dropped — including the last one, sent yesterday. */

test("מה שתהל כתבה בפועל, ואף אחד לא ראה", () => {
  assert.equal(coupleIntent("כל המספרים נכונים"), "numbers_ok");
  assert.equal(coupleIntent("זה נכון"), "numbers_ok");
  assert.equal(coupleIntent("אלו המספרים של האנשים הם נכונים אז מוזר.."), "numbers_ok");
  /* Three contact cards. The webhook renders them as "[contacts]". */
  assert.equal(coupleIntent("[contacts]", "media"), "numbers_sent");
});

test("תיקון נקרא לפני אישור, גם כששניהם באותה הודעה", () => {
  /* Reading this as a confirmation tells Dvir the list is fine while a number
     he was just handed sits unused. */
  assert.equal(
    coupleIntent("כל המספרים נכונים אבל תוסיפו את 050-1234567"), "numbers_sent");
  assert.equal(coupleIntent("הנה המספר של סבתא: 0521234567"), "numbers_sent");
});

test("שאלה על החתונה שלהם", () => {
  for (const s of ["כמה אישרו?", "מה המצב עם הרשימה", "כמה מגיעים בסוף"])
    assert.equal(coupleIntent(s), "status", s);
});

test("כל השאר מגיע לדביר ולא נופל", () => {
  for (const s of ["היי", "תודה רבה על הכול!", "אפשר לדבר?", ""])
    assert.equal(coupleIntent(s), "other", JSON.stringify(s));
});
