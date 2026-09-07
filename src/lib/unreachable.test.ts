import test from "node:test";
import assert from "node:assert/strict";
import { unreachableGuests, unreachableReport, askedOutcome, REASON_TEXT } from "./unreachable.ts";

const g = (id: string, o: Record<string, unknown> = {}) =>
  ({ id, name: "אורח " + id, phone: "05" + id.padStart(8, "0"), rsvp_token: "tok" + id, ...o });

/* The distinction that was got wrong on 07/09, and the reason this file exists.
   A wamid means Meta ACCEPTED the message. Meta accepts and then reports the
   delivery failure separately. Asking the easier question produced a message to
   a couple claiming all 195 of their guests had been reached, when 16 never
   were. */
test("התקבל אצל מטא זה לא הגיע לאורח", () => {
  const items = unreachableGuests([g("1")], new Map([["1", { reached: false, lastCode: 131026 }]]));
  assert.equal(items.length, 1);
  assert.equal(items[0].reason, "no_whatsapp");

  /* And a delivery report that says it arrived ends the matter. */
  assert.equal(unreachableGuests([g("1")],
    new Map([["1", { reached: true, lastCode: 131026 }]])).length, 0);
});

/* 131049 is the recipient's own daily cap and resolves by itself. Listing it
   is how six people Dvir must phone became sixteen he would learn to ignore. */
test("כישלון זמני לא נכנס לרשימה", () => {
  for (const code of [131049, 500, 131047, null]) {
    assert.equal(unreachableGuests([g("1")],
      new Map([["1", { reached: false, lastCode: code }]])).length, 0, `קוד ${code}`);
  }
});

test("שלוש הסיבות הקבועות, ממוינות לפי דחיפות", () => {
  const items = unreachableGuests(
    [g("1"), g("2"), g("3")],
    new Map([
      ["1", { reached: false, lastCode: 130472 }],
      ["2", { reached: false, lastCode: 131026 }],
      ["3", { reached: false, lastCode: 131050 }],
    ]));
  assert.deepEqual(items.map(i => i.reason), ["no_whatsapp", "opted_out", "experiment"]);
});

/* Untried is not unreachable — that guest belongs to the sender. */
test("אורח שמעולם לא נוסה אינו 'לא ניתן להשגה'", () => {
  assert.equal(unreachableGuests([g("1")], new Map()).length, 0);
});

test("דמו, בלי שם או בלי טלפון — לא נכנסים", () => {
  const d = new Map([["1", { reached: false, lastCode: 131026 }]]);
  assert.equal(unreachableGuests([g("1", { category: "demo" })], d).length, 0);
  assert.equal(unreachableGuests([g("1", { name: "  " })], d).length, 0);
  assert.equal(unreachableGuests([g("1", { phone: null })], d).length, 0);
});

/* שלמה was asked about 24 numbers on 04/09. Seventeen were fixed. Nobody was
   told — Dvir found it by hand three days later. */
test("סגירת הלולאה — כמה מהמספרים שביקשנו נפתרו", () => {
  const d = new Map([
    ["1", { reached: true }], ["2", { reached: true }],
    ["3", { reached: false, lastCode: 131026 }],
  ]);
  assert.deepEqual(askedOutcome(["1", "2", "3"], d),
    { asked: 3, resolved: 2, stillStuck: ["3"] });
});

test("לא ביקשנו כלום — אין מה לסגור", () => {
  assert.deepEqual(askedOutcome(null, new Map()), { asked: 0, resolved: 0, stillStuck: [] });
});

const stuck = (id: string, code: number) =>
  unreachableGuests([g(id)], new Map([[id, { reached: false, lastCode: code }]]));

test("הדוח נותן שורה לאדם, קישור לשורה, ואומר מה לעשות", () => {
  const msg = unreachableReport(
    [{ wedding: "אבישג ושלמה", items: stuck("1", 131026), outcome: { asked: 24, resolved: 17 } }],
    "https://x.app");
  assert.ok(msg);
  /* 131026 has one channel left, so the link is an SMS one — see channelLink. */
  assert.ok(msg.split("\n").some(l => l.startsWith("sms:")), "הקישור על שורה משלו");
  assert.ok(msg.includes(REASON_TEXT.no_whatsapp));
  assert.ok(msg.includes("SMS"), "אומר מה לעשות, לא רק מה קרה");
  assert.ok(msg.includes("17 מתוך 24"), "סוגר את הלולאה");
});

/* Dvir, 07/09: "אני רוצה שזה לא יגיע רק על לקוח אחד ולא ספציפית על לקוח שנשלח
   היום — אלא בכללי אם יש מספרים שמחכים להודעה." */
test("הודעה אחת על כל החתונות, לא אחת לכל לקוח", () => {
  const msg = unreachableReport([
    { wedding: "אבישג ושלמה", items: stuck("1", 131026) },
    { wedding: "אורי ושחר", items: stuck("2", 131026) },
  ], "https://x.app");
  assert.ok(msg);
  assert.ok(msg.includes("אבישג ושלמה") && msg.includes("אורי ושחר"), "שתיהן בהודעה אחת");
  assert.ok(msg.includes("2 מספרים"), "הסכום חוצה חתונות");
  assert.ok(msg.includes("ב-2 חתונות"));
});

/* Grouped by what needs doing rather than by couple: the action is identical
   for everyone in a group, and that is how the list gets worked through. */
test("קיבוץ לפי פעולה, עם שם החתונה ליד כל אורח", () => {
  const msg = unreachableReport([
    { wedding: "חתונה א", items: stuck("1", 131026) },
    { wedding: "חתונה ב", items: stuck("2", 130472) },
  ], "https://x.app")!;
  const lines = msg.split("\n");
  assert.equal(lines.filter(l => l.startsWith("*אין וואטסאפ")).length, 1);
  assert.ok(lines.some(l => l.includes("אורח 1") && l.includes("חתונה א")));
  assert.ok(lines.some(l => l.includes("אורח 2") && l.includes("חתונה ב")));
});

/* A wedding with nothing stuck is exactly the one nobody would think to
   check, so it is read every night — and says nothing when it is clean. */
test("חתונה נקייה לא מופיעה, ואם כולן נקיות אין הודעה", () => {
  const msg = unreachableReport([
    { wedding: "תקועה", items: stuck("1", 131026) },
    { wedding: "נקייה", items: [] },
  ], "https://x.app")!;
  assert.ok(!msg.includes("נקייה"));
  assert.equal(unreachableReport([{ wedding: "נקייה", items: [] }], "https://x.app"), null);
  assert.equal(unreachableReport([], "https://x.app"), null);
});

/* A list silently cut at the bottom reads as "that is all of them", which is
   the one thing this report must never say. */
test("רשימה ארוכה נחתכת במפורש, לא בשקט", () => {
  const many = Array.from({ length: 20 }, (_, i) => ({
    id: String(i), name: "אורח " + i, phone: "0500000000",
    reason: "no_whatsapp" as const, send: "t" + i,
  }));
  const msg = unreachableReport([{ wedding: "חתונה", items: many }], "https://x.app", 12)!;
  assert.ok(msg.includes("(20)"), "המספר האמיתי בכותרת");
  assert.ok(msg.includes("ועוד 8"), "מה שלא נכנס נאמר בקול");
  assert.ok(msg.includes("אורח 11") && !msg.includes("אורח 12"));
});

/* שלמה, 07/09: send an SMS to the numbers with no WhatsApp — the whole נגר
   family. And the bug that request exposed: the report was handing every one
   of them a wa.me link, which opens a chat with a number that will never see
   it. Worse than no link, because it looks like it worked. */
test("אין וואטסאפ → קישור SMS, לא קישור וואטסאפ", () => {
  const msg = unreachableReport(
    [{ wedding: "אבישג ושלמה", items: stuck("1", 131026) }], "https://x.app")!;
  const link = msg.split("\n").find(l => l.startsWith("sms:") || l.startsWith("https://"));
  assert.ok(link?.startsWith("sms:"), "ל-131026 יש ערוץ אחד בלבד");
  assert.ok(link.includes("body="));
  assert.ok(decodeURIComponent(link).includes("אבישג ושלמה"), "הזוג בגוף ההודעה");
  assert.ok(decodeURIComponent(link).includes("/r/tok1"), "קישור קצר, SMS מחויב באורך");
});

/* Those two numbers DO have WhatsApp. The restriction is on the BUSINESS
   number, and a personal message from Dvir's own phone reaches them normally. */
test("ביקשו להפסיק וקבוצת ניסוי → קישור וואטסאפ, ההגבלה היא על המספר העסקי", () => {
  for (const code of [131050, 130472]) {
    const msg = unreachableReport([{ wedding: "ח", items: stuck("1", code) }], "https://x.app")!;
    assert.ok(msg.includes("https://x.app/s/tok1"), `קוד ${code}`);
    assert.ok(!msg.includes("sms:"), `קוד ${code} — לא SMS`);
  }
});
