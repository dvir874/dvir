import test from "node:test";
import assert from "node:assert/strict";
import { waitingForYou, waitingLine, waitingHeader, isBroadcast } from "./needs-you.ts";

const base = {
  guestId: "g1", name: "נעם חדד", phone: "0527291130", token: "tok-1",
  said: "יש אפשרות לדבר עם נציג אנושי??", saidAt: "2026-09-10T12:00:00Z",
};

test("אורח שכתב ואף אחד לא ענה — מחכה", () => {
  assert.equal(waitingForYou([base]).length, 1);
});

test("מה שנסגר לבד לא מגיע לטלפון", () => {
  /* 917 inbound messages, most of them "מגיע" and "2". A phone that buzzes for
     those is a phone he silences. */
  assert.equal(waitingForYou([{ ...base, answeredAt: "2026-09-10T12:00:01Z" }]).length, 0);
  assert.equal(waitingForYou([{ ...base, recorded: true }]).length, 0);
  assert.equal(waitingForYou([{ ...base, seen: true }]).length, 0);
  assert.equal(waitingForYou([{ ...base, said: "   " }]).length, 0);
});

test("תשובה אוטומטית לא סוגרת שיחה שהאוטומציה ויתרה עליה", () => {
  /* נעם חדד asked for a human and was sent "לא הצלחנו להבין את המספר" twice.
     Something went out after him, and he was still waiting. */
  const t = { ...base, answeredAt: "2026-09-10T12:00:01Z", humanNeeded: true };
  assert.equal(waitingForYou([t]).length, 1);
});

test("לא מתריעים פעמיים על אותה הודעה", () => {
  assert.equal(waitingForYou([{ ...base, alertedAt: "2026-09-10T12:00:05Z" }]).length, 0);
});

test("אבל אם כתב שוב אחרי ההתראה — מתריעים שוב", () => {
  const t = { ...base, alertedAt: "2026-09-10T12:00:05Z", said: "?", saidAt: "2026-09-10T14:00:00Z" };
  assert.equal(waitingForYou([t]).length, 1);
});

test("השורה נושאת בדיוק מה שהאורח כתב, וקישור לענות", () => {
  const [w] = waitingForYou([base]);
  const line = waitingLine(w, "https://regalifnei.com");
  assert.ok(line.includes("נעם חדד"), "מי");
  assert.ok(line.includes("0527291130"), "המספר");
  assert.ok(line.includes("יש אפשרות לדבר עם נציג אנושי??"), "מילה במילה");
  assert.ok(line.includes("https://regalifnei.com/s/tok-1"), "קישור לענות");
  assert.ok(line.startsWith("🙋") === false, "רק מי שהאוטומציה ויתרה עליו מסומן");
});

test("הודעה ארוכה נחתכת, לא מפילה את ההתראה", () => {
  const [w] = waitingForYou([{ ...base, said: "א".repeat(500) }]);
  const line = waitingLine(w, "https://x.co");
  assert.ok(line.length < 400, `${line.length} תווים`);
  assert.ok(line.includes("…"));
});

test("אורח בלי טוקן אומר זאת במקום לתת קישור שבור", () => {
  const [w] = waitingForYou([{ ...base, token: null }]);
  assert.ok(!waitingLine(w, "https://x.co").includes("/s/"));
});

test("הכותרת בעברית תקינה גם לאחד", () => {
  assert.match(waitingHeader(1), /אורח אחד/);
  assert.match(waitingHeader(4), /4 אורחים/);
});

test("שידור לכל האורחים אינו תשובה לשאלה של אחד מהם", () => {
  /* צורית וצופיה asked how to send a gift on 09/09 at 08:25. Two hours later
     the gallery announcement went out to all 231 guests, her included, and the
     thread looked answered. She is still waiting and the couple never got the
     gift. */
  assert.equal(isBroadcast("גלריית התמונות מוכנה"), true);
  assert.equal(isBroadcast("הזמנה לחתונה (תבנית)"), true);
  assert.equal(isBroadcast("תזכורת אישור הגעה"), true);
  assert.equal(isBroadcast("היום מתחתנים (תבנית)"), true);

  /* And a real reply still is one. */
  assert.equal(isBroadcast("מעולה, רשמנו 2 🤍"), false);
  assert.equal(isBroadcast("היי צורית, אפשר להעביר בביט ל…"), false);
  assert.equal(isBroadcast(""), false);
});
