import test from "node:test";
import assert from "node:assert/strict";
import { askIntent, stripPrefixes } from "./admin-ask.ts";

test("שאלות על היום", () => {
  for (const s of ["מה יוצא היום", "מה נשלח היום?", "כמה נשלחו", "מה קורה היום"])
    assert.equal(askIntent(s)?.kind, "today", s);
});

test("שאלות על כסף", () => {
  for (const s of ["כמה כסף פתוח", "מי לא שילם", "מה עם התשלום של שחר", "חובות"])
    assert.equal(askIntent(s)?.kind, "money", s);
});

test("שאלות על מה מחכה", () => {
  for (const s of ["מי מחכה לי", "מה דחוף", "מי צריך אותי"])
    assert.equal(askIntent(s)?.kind, "waiting", s);
});

test("שם חתונה נשלף מתוך המשפט", () => {
  /* The real phrasing that was forwarded to a guest on 08/09. */
  const a = askIntent("איזה אורחים לא יודעי");
  assert.notEqual(a, null, "משפט של דביר אינו הודעה לאורח");

  const b = askIntent("כמה אישרו לשלמה");
  assert.equal(b?.kind, "wedding");
  /* The word is offered exactly as he wrote it. Stripping the ל here would
     turn "שלמה" into "למה" for anyone who typed the name on its own, so the
     prefix comes off only on the second attempt — see stripPrefixes. */
  assert.equal((b as { needle: string }).needle, "לשלמה");
  assert.equal(stripPrefixes("לשלמה"), "שלמה");

  const c = askIntent("מה עם תהל ואביב");
  assert.equal(c?.kind, "wedding");
  assert.equal((c as { needle: string }).needle, "תהל ואביב");

  const d = askIntent("סטטוס");
  assert.equal(d?.kind, "weddings", "שאלה בלי שם היא כל החתונות");
});

test("שם לבדו הוא שאלה על החתונה הזאת", () => {
  assert.deepEqual(askIntent("שלמה"), { kind: "wedding", needle: "שלמה" });
  assert.deepEqual(askIntent("איילת"), { kind: "wedding", needle: "איילת" });
});

test("מי שלא קיבל, עם שם ובלי", () => {
  assert.equal(askIntent("מי לא קיבל הזמנה")?.kind, "missing");
  const withName = askIntent("מי לא קיבל אצל שלמה");
  assert.equal(withName?.kind, "missing");
  assert.equal((withName as { needle?: string }).needle, "שלמה");
});

test("נימוסים אינם חתונות", () => {
  for (const s of ["", "תודה", "בבקשה", "אוקי", "סבבה", "הבנתי", "🤍"])
    assert.equal(askIntent(s), null, JSON.stringify(s));
});

test("שם שאינו קיים נגמר בתפריט ולא בהודעה", () => {
  /* "איזה אורחים לא יודעי" — the sentence that went to עירית סבן. It resolves
     to a lookup for a wedding called "איזה יודעי", which matches nothing, and
     the console then shows the menu. What it can never do is reach a person. */
  const a = askIntent("איזה אורחים לא יודעי");
  assert.equal(a?.kind, "wedding");
  assert.ok(!("phone" in (a as object)), "אין כאן נמען, ולא יכול להיות");
});

test("שם עם קידומת נמצא בניסיון השני", () => {
  assert.equal(stripPrefixes("לשלמה"), "שלמה");
  assert.equal(stripPrefixes("בתהל ואביב"), "תהל אביב");
  /* And a name that merely begins with one of those letters survives the
     first attempt untouched, which is why the order matters. */
  assert.equal(askIntent("שלמה")?.kind, "wedding");
  assert.equal((askIntent("שלמה") as { needle: string }).needle, "שלמה");
});

test("שום ניסוח אינו הופך להודעה לאורח", () => {
  /* The point of the whole file: this returns an intent or null. There is no
     branch anywhere in it that addresses a person. */
  for (const s of ["שלח לכולם תזכורת", "כמה אישרו", "מי לא אישר", "תראה לי סטטוס"]) {
    const a = askIntent(s);
    assert.ok(a === null || ["today","money","waiting","missing","opened","wedding","weddings"].includes(a.kind), s);
  }
});

test("הרשימה החמה — מי פתח ולא ענה", () => {
  /* 81 guests across three weddings tapped their invitation, read the page and
     never answered — 52 of them at שלמה's. Every other list in this console is
     about a failure; this one is about attention already given. */
  for (const s of ["מי פתח ולא ענה", "מי ראה ולא אישר", "מי נכנס ולא ענה", "מי פתחו ולא ענו"])
    assert.equal(askIntent(s)?.kind, "opened", s);

  const withName = askIntent("מי פתח ולא ענה אצל שלמה");
  assert.equal(withName?.kind, "opened");
  assert.equal((withName as { needle?: string }).needle, "שלמה");

  /* And it must not swallow the other list: "לא קיבלו" has no opening in it. */
  assert.equal(askIntent("מי לא קיבל הזמנה")?.kind, "missing");
});

test("שתי הרשימות החדשות — תקועים וחסרי מספר", () => {
  for (const s of ["מי לא אמר כמה", "מי תקוע", "מי תקועים באמצע שיחה", "מי לא אמרו כמה"])
    assert.equal(askIntent(s)?.kind, "stuck", s);
  for (const s of ["למי אין מספר", "מי בלי מספר טלפון", "חסר מספר למי"])
    assert.equal(askIntent(s)?.kind, "nophone", s);

  /* STUCK is tested before STANDING, which matches the bare word "כמה" —
     without that ordering "מי לא אמר כמה" becomes a wedding lookup for a
     wedding called "אמר". */
  assert.equal(askIntent("כמה אישרו לשלמה")?.kind, "wedding");
});

test("מתי יוצאת התזכורת הבאה", () => {
  /* His clients asked him this on 10/09 and the console had no answer at all. */
  const a = askIntent("מהחתונה של טל ולאל שואלים מתי נשלחת עוד תזכורת");
  assert.equal(a?.kind, "wedding");
  assert.equal((a as { needle: string }).needle, "טל ולאל",
    "כל מילות השאלה נופלות, כולל אלה שהודבקה להן אות בהתחלה");

  for (const s of ["מתי התזכורת הבאה", "מתי יוצאות תזכורות", "מתי נשלחת עוד תזכורת"])
    assert.equal(askIntent(s)?.kind, "weddings", s);

  /* And it must not swallow the counting question. */
  assert.equal(askIntent("כמה אישרו לשלמה")?.kind, "wedding");
});

test("מי בלי מספר טלפון — לפי צורת השאלה, לא לפי רשימת ניסוחים", () => {
  /* The list version missed the first sentence Dvir typed at it, on 10/09:
     it knew "בלי" and not "ללא", "מספר" and not "מספרי". He was answered
     "אין לי את זה" while a screen listing those six people already existed. */
  const a = askIntent("מי הם אלו ללא מספרי טלפון מהחתונה של לאל וטל");
  assert.equal(a?.kind, "nophone");
  assert.equal((a as { needle: string }).needle, "לאל וטל", "והחתונה ששאל עליה נשמרת");

  for (const s of [
    "מי בלי מספר טלפון", "למי אין מספר", "מי אין לו טלפון",
    "תן לי את השמות של מי שאין לו מספר", "חסר מספר למי",
  ]) assert.equal(askIntent(s)?.kind, "nophone", s);
});
