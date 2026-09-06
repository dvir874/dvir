import test from "node:test";
import assert from "node:assert/strict";
import { errorCode, isConfigFailure, reasonText, failureAlert } from "./send-failure.ts";

const PARAMS = "(#132000) Number of parameters does not match the expected number of params";
const NO_WA  = "(#131026) Message undeliverable";

test("קוד נחלץ מהניסוח של מטא", () => {
  assert.equal(errorCode(PARAMS), 132000);
  assert.equal(errorCode(undefined), null);
  assert.equal(errorCode("unknown"), null);
});

test("שגיאת תבנית מסווגת כתקלה שלנו, שגיאת נמען לא", () => {
  assert.equal(isConfigFailure(PARAMS), true);
  assert.equal(isConfigFailure(NO_WA), false);
});

/* The run that started this: 13:31 on 06/09 sent nothing and failed three, and
   the summary stayed silent because three is not more than five. */
test("שלושה כישלוני תבנית מדברים, למרות שהם פחות מחמישה", () => {
  const failed = [1, 2, 3].map(i => ({ name: "אורח " + i, error: PARAMS }));
  const alert = failureAlert(failed, 0);
  assert.ok(alert && alert.includes("🚨"));
  assert.ok(alert.includes("הריצות הבאות"));
});

/* And the run before it, which did send: same broken template, still an
   emergency, even though the run looked partly successful. */
test("שגיאת תבנית צועקת גם כשחלק מההודעות כן יצאו", () => {
  const failed = [1, 2, 3].map(() => ({ error: PARAMS }));
  assert.ok(failureAlert(failed, 3)?.includes("🚨"));
});

test("שלושה מספרים בלי וואטסאפ, כשהשאר נשלחו — לא מעירים אף אחד", () => {
  const failed = [1, 2, 3].map(() => ({ error: NO_WA }));
  assert.equal(failureAlert(failed, 40), null);
});

test("ריצה שלא שלחה כלום ונכשלה — תמיד מדווחת", () => {
  assert.ok(failureAlert([{ error: NO_WA }], 0)?.includes("🚨"));
});

test("כישלונות בכמות מדווחים גם כשהם פר-נמען", () => {
  const failed = Array.from({ length: 9 }, () => ({ error: NO_WA }));
  const alert = failureAlert(failed, 30);
  assert.ok(alert?.startsWith("⚠️"));
  assert.ok(alert?.includes("אין וואטסאפ"));
});

test("ריצה נקייה שותקת", () => {
  assert.equal(failureAlert([], 40), null);
});

/* One config failure among many guest failures still decides the headline —
   the guest failures are a consequence, not the story. */
test("שגיאת תבנית אחת גוברת על רוב של שגיאות נמען", () => {
  const failed = [
    ...Array.from({ length: 8 }, () => ({ error: NO_WA })),
    { error: PARAMS },
  ];
  assert.ok(failureAlert(failed, 0)?.includes("מספר הפרמטרים"));
});

test("שגיאה לא מוכרת מדווחת במילים של מטא ולא נבלעת", () => {
  const odd = "(#999999) Something entirely new went wrong";
  assert.ok(reasonText(odd).includes("Something entirely new"));
  assert.ok(failureAlert([{ error: odd }], 0)?.includes("Something entirely new"));
});
