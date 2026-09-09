import test from "node:test";
import assert from "node:assert/strict";
import { smsInvite, smsHost } from "./sms-invite.ts";
import { APP_HOST } from "./app-url.ts";

const ev = {
  couple: "תהל שלוש ואביב אדרעי",
  date: "יום שלישי, 22 בספטמבר 2026",
  venue: "גן האירועים ארץ, מושב עג'ור",
  reception: "17:45",
  chuppah: "18:45",
};

test("האורח מבין לאן הוא מגיע", () => {
  const msg = smsInvite(ev, "26498e56-aaaa", "https://regalifnei.vercel.app");
  assert.ok(msg.includes("חתונה"));
  assert.ok(msg.includes("תהל שלוש ואביב אדרעי"));
  assert.ok(msg.includes("22 בספטמבר"));
  assert.ok(msg.includes("מושב עג'ור"));
  assert.ok(msg.includes("קבלת פנים 17:45"));
});

/* יעקב בן שושן, 20/08: tapped a link with no address. A Hebrew SMS breaks
   every 70 characters, and a break inside a URL costs the guest the whole
   message — so the URL is never in the middle of anything. */
test("הקישור אחרון, לבד בשורה, אחרי כל מילה אחרת", () => {
  const lines = smsInvite(ev, "26498e56-aaaa", "https://regalifnei.vercel.app").split("\n");
  const last = lines[lines.length - 1];
  assert.equal(last, "regalifnei.vercel.app/r/26498e56");
  assert.ok(!lines.slice(0, -1).some(l => l.includes("regalifnei")), "אין URL בשום מקום אחר");
});

test("צורה קצרה של הקישור — 39 תווים ולא 70", () => {
  const link = smsInvite(ev, "26498e56-aaaa-bbbb-cccc", "https://regalifnei.vercel.app")
    .split("\n").pop()!;
  assert.ok(link.length < 45, `הקישור ${link.length} תווים`);
  assert.ok(!link.startsWith("http"), "בלי סכימה — הטלפון מזהה ומקצר ב-9 תווים");
});

/* "קבלת פנים undefined" is worse than never naming the hour. */
test("פרט חסר פשוט לא מופיע", () => {
  const msg = smsInvite({ couple: "א וב" }, "tok12345");
  assert.ok(msg.includes("א וב"));
  assert.ok(!msg.includes("undefined") && !msg.includes("null"));
  assert.ok(!msg.includes("קבלת פנים"));
  assert.ok(msg.trimEnd().endsWith("/r/tok12345"));
});

test("חופה בלי קבלת פנים — עדיין שורה תקינה", () => {
  const msg = smsInvite({ couple: "א וב", chuppah: "19:00" }, "tok12345");
  assert.ok(msg.includes("חופה 19:00"));
  assert.ok(!msg.includes("|"), "בלי מפריד כשיש צד אחד בלבד");
});

test("smsHost מוריד את הסכימה", () => {
  assert.equal(smsHost("https://x.app"), "x.app");
  assert.equal(smsHost(undefined), APP_HOST);
});
