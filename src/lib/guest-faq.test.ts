import test from "node:test";
import assert from "node:assert/strict";
import { faqTopic, faqAnswer, answerQuestion } from "./guest-faq.ts";

const tahel = {
  couple: "תהל שלוש ואביב אדרעי",
  dateText: "יום שלישי, 22 בספטמבר 2026",
  reception: "19:00",
  chuppah: "20:00",
  venue: "גן האירועים ארץ, מושב עג׳ור",
  wazeUrl: "https://waze.com/ul?q=%D7%92%D7%9F",
  dressCode: "אלגנטי ערב",
  parking: "חניה חינם בכניסה למתחם",
  ridesUrl: "https://chat.whatsapp.com/abc",
  giftUrl: "https://paybox.co.il/abc",
};

test("השאלות שאורח באמת שואל מוצאות את העובדה", () => {
  const cases: [string, string][] = [
    ["מתי זה מתחיל?", "19:00"],
    ["באיזו שעה החופה?", "20:00"],
    ["איפה זה?", "עג׳ור"],
    ["מה הכתובת?", "עג׳ור"],
    ["איך מגיעים?", "waze.com"],
    ["מה ללבוש?", "אלגנטי"],
    ["יש חניה?", "חניה חינם"],
    ["יש הסעות?", "chat.whatsapp.com"],
    ["איך מעבירים מתנה?", "paybox"],
    ["של מי החתונה?", "תהל שלוש"],
  ];
  for (const [q, expect] of cases) {
    const a = answerQuestion(q, tahel);
    assert.ok(a, `לא נענה: ${q}`);
    assert.ok(a.includes(expect), `${q} → ${a}`);
  }
});

test("שאלה שאין עליה תשובה במאגר לא נענית בכלל", () => {
  /* A machine that says "אין לי מידע" has ended the conversation. Returning
     null sends the guest to a person, who can actually ask the couple. */
  const bare = { couple: "אורי ושחר" };
  assert.equal(answerQuestion("מה ללבוש?", bare), null);
  assert.equal(answerQuestion("יש חניה?", bare), null);
  assert.equal(answerQuestion("איך מעבירים מתנה?", bare), null);
  /* Whether children are invited is the couple's decision, never a column. */
  assert.equal(answerQuestion("אפשר להביא את הילדים?", tahel), null);
});

test("תשובת אישור הגעה לעולם אינה נקראת כשאלה", () => {
  /* This file runs last, after the count parser and the decline reader, but
     the patterns must still not claim what is plainly an answer. */
  for (const s of ["2", "3 אנשים", "אנחנו 2", "מגיעים!", "לא מגיע",
                   "כן", "אני ועוד אחת", "בשמחה נגיע"])
    assert.equal(faqTopic(s), null, s);
});

test("סדר החיפוש — 'איך מגיעים' אינו 'איפה'", () => {
  /* Both patterns can match the same sentence; the more specific must win, or
     a guest asking for navigation gets an address and no link. */
  assert.equal(faqTopic("איך מגיעים לאולם? מה הכתובת"), "how_to_get");
  assert.equal(faqTopic("איפה האולם"), "where");
  /* And a question about the hour is not a question about the place. */
  assert.equal(faqTopic("באיזו שעה מתחילים"), "when");
});

test("בלי לוח טרמפים עדיין יש תשובה — השיחה עצמה היא הלוח", () => {
  const a = faqAnswer("rides", { couple: "אורי ושחר" });
  assert.ok(a && a.includes("מאיפה אתם"),
    "detectRideIntent קורא טרמפ מתוך מילים רגילות, אז יש מה להציע");
});

test("שעה בלי תאריך ותאריך בלי שעה — שניהם עונים", () => {
  assert.ok(faqAnswer("when", { reception: "19:30" })?.includes("19:30"));
  assert.ok(faqAnswer("when", { dateText: "יום שני" })?.includes("יום שני"));
  assert.equal(faqAnswer("when", {}), null);
});
