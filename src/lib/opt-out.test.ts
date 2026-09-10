import test from "node:test";
import assert from "node:assert/strict";
import { optOutRequest } from "./opt-out.ts";

/* Every string below is a real inbound message from wa_messages, quoted
   exactly. All six are what needs-human's DISTRESS pattern matches across the
   917 messages this system has received; two must silence a guest and four
   must not. A rule that cannot separate these six is not safe to run. */

test("עירית סבן — שתי ההודעות שבגללן הקובץ הזה קיים", () => {
  const a = optOutRequest("בבקשה לא לשלוח לי שוב\nטעות במספר");
  assert.equal(a.optOut, true);
  assert.ok(a.phrase, "הציטוט נשמר ליד הדגל");

  const b = optOutRequest("אל תחזרו\nלא מכירה\nטעות במספר");
  assert.equal(b.optOut, true);
});

test("שמואל סבן — מספר לא נכון, בניסוח רופף", () => {
  /* "לא מכיר" plus "טעות" in one short message. Neither half alone is enough;
     together they are a wrong number. */
  assert.equal(optOutRequest("בוקר טוב אני לא מכיר .טעות אשלח אותי").optOut, true);
});

test("'טעות' לבדה אינה בקשה להסרה", () => {
  /* Sent by עירית herself on 03/09, four days before she actually asked. One
     word is not a request, and treating it as one would have silenced her
     before she said anything. */
  assert.equal(optOutRequest("טעות").optOut, false);
});

test("אורחת חמה ששואלת מי הזמין אותה נשארת ברשימה", () => {
  assert.equal(
    optOutRequest("מזל טוב ורק בשמחות מי המזמין ? סורי לא מזהה").optOut, false,
    "'לא מזהה' לבדו הוא שאלה, לא בקשה");
});

test("אורחת מאושרת שמדווחת על ז׳קט אבוד נשארת ברשימה", () => {
  /* תחיה ואילן סופר, status=confirmed, the morning after שחר's wedding. The
     word "בטעות" appears; silencing them would be the worst outcome this file
     could produce. */
  assert.equal(optOutRequest(
    "הי!\nכנראה מישהו מהאורחים לקח בטעות ז׳קט אפור וסוודר שחור שהיו מונחים על אחד הספסלים מיד אחרי שער הכניסה למתחם "
  ).optOut, false);
});

/* ── The phrasings a person actually reaches for ──────────────────────── */

test("בקשות הסרה מפורשות נתפסות", () => {
  for (const s of [
    "אל תשלחו לי יותר",
    "בבקשה לא לשלוח",
    "תסירו אותי מהרשימה",
    "הסירו אותי",
    "תורידו אותי בבקשה",
    "תפסיקו לשלוח לי הודעות",
    "STOP",
    "מספר לא נכון",
    "טעות בטלפון",
  ]) assert.equal(optOutRequest(s).optOut, true, s);
});

test("מה שנשמע דומה ואינו בקשה — נשאר", () => {
  for (const s of [
    "לא מגיע",                       /* a decline, not an opt-out */
    "לא מעוניין בטרמפ תודה",         /* declining a ride */
    "מזל טוב!! נגיע בשמחה",
    "אפשר לשנות ל-3 אנשים?",
    "מי אתם בכלל",                   /* distress, yes — a request, no */
    "לא מזהה את השם של האולם",
    "סליחה על הטעות שלי, אנחנו כן מגיעים",
  ]) assert.equal(optOutRequest(s).optOut, false, s);
});

test("תווי כיווניות בלתי נראים לא מבטלים את הזיהוי", () => {
  /* A phone keyboard pastes U+200F around Hebrew and it has broken matching in
     this codebase twice already. */
  assert.equal(optOutRequest("‏אל תחזרו‎").optOut, true);
});

test("הודעה ארוכה אינה בקשת הסרה", () => {
  assert.equal(optOutRequest("שלום, ".repeat(40) + "טעות במספר").optOut, false);
});

test("המילה שהאתר עצמו אומר לאורח לשלוח", () => {
  /* /contact tells guests, in writing: השיבו "הסר" להודעה. Nothing matched a
     bare הסר — the pattern needs "הסר אותי" — so a guest who did exactly what
     the website told them to do stayed on the list. */
  for (const s of ["הסר", "הסירו", "להסיר", "תסירו", "עצור", "הסר."])
    assert.equal(optOutRequest(s).optOut, true, s);

  /* Only as the whole message. Inside a sentence the same word is ordinary. */
  assert.equal(optOutRequest("אפשר להסיר את המנה הצמחונית?").optOut, false);
  assert.equal(optOutRequest("תסירו לי את הילד מהרשימה, הוא לא מגיע").optOut, false);
});
