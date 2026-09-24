import test from "node:test";
import assert from "node:assert/strict";
import {
  unmatchedLeadAlert, replyLink, readablePhone, shouldAlert, LEAD_ALERT_COOLDOWN_MS,
} from "./unmatched-lead.ts";

test("the alert carries the number, the words, and a way to answer", () => {
  /* A count with no way to act on it is the failure this system keeps
     repeating — שלמה's sixteen, איילת's forty-one, the day-of gap. */
  const a = unmatchedLeadAlert("972501234567", "היי, ראיתי המלצה בקבוצה, כמה זה עולה?", "מיכל");
  assert.match(a, /מיכל/);
  assert.match(a, /050-1234567/);
  assert.match(a, /כמה זה עולה/);
  assert.match(a, /https:\/\/wa\.me\/972501234567/);
});

test("never contains a newline — a template parameter with one is 132000", () => {
  const a = unmatchedLeadAlert("972501234567", "שורה\nשנייה\nשלישית", "שם\nעם\nשורות");
  assert.equal(a.includes("\n"), false);
});

test("a long message is trimmed, not dropped", () => {
  const a = unmatchedLeadAlert("972501234567", "א".repeat(600));
  assert.ok(a.length < 300, `${a.length}`);
  assert.match(a, /…/);
});

test("an empty message still produces an alert", () => {
  /* A photo or a sticker from a stranger is still an enquiry. */
  assert.match(unmatchedLeadAlert("972501234567", ""), /ללא טקסט/);
});

test("an unusable number loses the link but keeps the alert", () => {
  /* Better a number he can read than silence because a link would not build. */
  const a = unmatchedLeadAlert("123", "היי");
  assert.equal(a.includes("wa.me"), false);
  assert.match(a, /היי/);
});

test("Israeli numbers read the way he dials them", () => {
  assert.equal(readablePhone("972526071865"), "052-6071865");
  assert.equal(readablePhone("0526071865"), "052-6071865");
  assert.equal(replyLink("972526071865"), "https://wa.me/972526071865");
  assert.equal(replyLink("12"), null);
});

test("three questions in a row are one enquiry, not three alerts", () => {
  const now = 1_700_000_000_000;
  assert.equal(shouldAlert(null, now), true, "never alerted");
  assert.equal(shouldAlert(new Date(now - 60_000).toISOString(), now), false, "a minute ago");
  assert.equal(shouldAlert(new Date(now - LEAD_ALERT_COOLDOWN_MS - 1).toISOString(), now), true);
});

test("an unreadable timestamp alerts rather than swallows", () => {
  /* Failing closed here would lose the lead, which is the whole point. */
  assert.equal(shouldAlert("not a date", Date.now()), true);
});
