import test from "node:test";
import assert from "node:assert/strict";
import { parseAdminCommand, matchEvent, ADMIN_HELP } from "./admin-command.ts";

test("the everyday questions", () => {
  for (const m of ["סטטוס", "מה המצב", "status"]) {
    assert.equal(parseAdminCommand(m, false).kind, "status", m);
  }
  for (const m of ["מחכה לי", "משימות", "מי צריך אותי"]) {
    assert.equal(parseAdminCommand(m, false).kind, "work", m);
  }
  assert.equal(parseAdminCommand("עזרה", false).kind, "help");
});

test("pausing and resuming name the wedding", () => {
  assert.deepEqual(parseAdminCommand("עצור שלמה", false), { kind: "pause", event: "שלמה" });
  assert.deepEqual(parseAdminCommand("המשך תהל ואביב", false), { kind: "resume", event: "תהל ואביב" });
});

test("a reply addressed to a number goes to that number", () => {
  const c = parseAdminCommand("0527291130 היי נעם, אני כאן", true);
  assert.deepEqual(c, { kind: "reply", phone: "0527291130", text: "היי נעם, אני כאן" });
  assert.equal(parseAdminCommand("+972527291130, שלום", true).kind, "reply");
});

test("a phone inside a sentence is part of the sentence", () => {
  /* "תתקשר ל-0501234567" is something he is telling a guest, not an address. */
  const c = parseAdminCommand("אפשר להתקשר אליי ל0501234567", true);
  assert.equal(c.kind, "reply_last");
});

test("plain text answers whoever we last raised", () => {
  const c = parseAdminCommand("היי, מה קרה? אני כאן", true);
  assert.deepEqual(c, { kind: "reply_last", text: "היי, מה קרה? אני כאן" });
});

test("with nobody pointed at, free text is never sent to a stranger", () => {
  /* An unaddressed sentence becoming a message to somebody is the one failure
     this feature could actually produce. */
  assert.equal(parseAdminCommand("היי, מה קרה?", false).kind, "unknown");
  assert.equal(parseAdminCommand("", true).kind, "unknown");
});

test("the help text names every command it accepts", () => {
  for (const w of ["סטטוס", "מחכה לי", "עצור", "המשך"]) {
    assert.ok(ADMIN_HELP.includes(w), w);
  }
});

/* ── which wedding ──────────────────────────────────────────────────────── */

const EVENTS = [
  { id: "a", name: "חתונת שחר ואורי", couple_names: "אורי ביטון ושחר פודת" },
  { id: "b", name: "החתונה של תהל ואביב", couple_names: "תהל שלוש ואביב אדרעי" },
  { id: "c", name: "חתונת אבישג ושלמה", couple_names: "שלמה גור ואבישג בן שוהם" },
];

test("a partial name finds the wedding", () => {
  for (const q of ["שלמה", "אבישג", "שלמה גור", "החתונה של שלמה"]) {
    const r = matchEvent(q, EVENTS);
    assert.ok("event" in r, `${q} → ${JSON.stringify(r)}`);
    assert.equal(r.event.id, "c");
  }
});

test("a word matching two weddings acts on neither", () => {
  /* "עצור" on the wrong wedding silences one nobody meant to silence. */
  const r = matchEvent("חתונת", [
    ...EVENTS, { id: "d", name: "חתונת שלמה אחר", couple_names: "שלמה כהן ורות" }]);
  assert.ok("ambiguous" in matchEvent("שלמה", [
    ...EVENTS, { id: "d", name: "חתונת שלמה אחר", couple_names: "שלמה כהן ורות" }]),
    JSON.stringify(r));
});

test("a name matching nothing is not a near miss", () => {
  assert.ok("none" in matchEvent("ירון", EVENTS));
});

test("asking who never got an invitation", () => {
  /* He wants the list on his phone, with a way to send each one by hand —
     "בדיוק כמו שזה נותן לי לשלוח באדמין". */
  assert.deepEqual(parseAdminCommand("לא קיבלו", false), { kind: "missing", event: undefined });
  assert.deepEqual(parseAdminCommand("לא קיבלו שחר", false), { kind: "missing", event: "שחר" });
  assert.equal(parseAdminCommand("מי לא קיבל", false).kind, "missing");
});

test("a mistyped instruction never becomes a message to a guest", () => {
  /* The fallthrough sends anything unrecognised to whoever we last raised —
     right for "היי נעם, מה קרה?", catastrophic for a half-typed command
     arriving at a stranger as though Dvir had written it to them. */
  for (const m of ["סטטוס שחר", "עצור", "המשך", "מה קורה עם שחר", "help me"]) {
    assert.equal(parseAdminCommand(m, true).kind, "unknown", m);
  }
  /* And a command that IS complete still runs — "של" is a stopword the event
     matcher drops, so this finds שלמה rather than being blocked as a near-miss. */
  assert.equal(parseAdminCommand("לא קיבלו של שלמה", true).kind, "missing");
});

test("an ordinary sentence to a guest still goes through", () => {
  /* The guard must not swallow the thing the feature exists for. */
  for (const m of ["היי נעם, מה קרה? אני כאן", "אין בעיה, נעדכן", "מצטער על העיכוב 🤍"]) {
    assert.equal(parseAdminCommand(m, true).kind, "reply_last", m);
  }
});

test("a photograph is never forwarded to a guest as the word [image]", () => {
  /* The webhook renders media as a literal placeholder, and this file would
     have sent that string on with "נשלח בהצלחה" back to Dvir. */
  assert.equal(parseAdminCommand("[image]", true, "media").kind, "unknown");
  assert.equal(parseAdminCommand("היי נעם", true, "media").kind, "unknown");
  assert.equal(parseAdminCommand("היי נעם", true, "text").kind, "reply_last");
});

/* 07/09, three days after the console shipped. Dvir typed "אוקי", "/admin" and
   "Admin/" while learning it, and all three were forwarded verbatim to עירית
   סבן — who eighty-five minutes earlier had written "אל תחזרו · לא מכירה ·
   טעות במספר", and who read all three.

   A person who has already said the number is wrong is the likeliest in the
   database to report it, and this number has been restricted once already. */
test("ניחוש של פקודה לא מגיע לאורח", () => {
  /* The invariant is "never reaches a guest", not "is not understood" —
     status and help are real commands that work, and must keep working. */
  for (const guess of ["/admin", "Admin/", "/help", "/status", "\\admin",
                       "admin", "menu", "status", "ok", "OK", "help",
                       "אוקי", "אוקיי", "סבבה", "הבנתי", "קיבלתי"]) {
    assert.notEqual(parseAdminCommand(guess, true, "text").kind, "reply_last",
      `"${guess}" נשלח לאורח`);
  }
});

/* And the line the guard must not cross: a real message to a guest is Hebrew
   and is a sentence. Blocking those would break the console's only purpose. */
test("הודעה אמיתית לאורח עדיין עוברת", () => {
  for (const real of ["אין בעיה, נעדכן", "מצטער על הטעות!", "בשמחה 🤍",
                      "אנחנו נבדוק ונחזור אליך", "כן"]) {
    assert.equal(parseAdminCommand(real, true, "text").kind, "reply_last",
      `"${real}" נחסם בטעות`);
  }
});

/* An English word inside a Hebrew sentence is a sentence, not a command. */
test("מילה לועזית בתוך משפט עברי אינה פקודה", () => {
  assert.equal(parseAdminCommand("שלחתי לך ב-WhatsApp", true, "text").kind, "reply_last");
  assert.equal(parseAdminCommand("ok אין בעיה", true, "text").kind, "reply_last");
});

/* ── The contract after 09/09: the second argument means ARMED ────────────
 *
 * The blocklist above is a list of what Dvir had already guessed wrong. It
 * could never be the list of what he would guess NEXT, and on 08/09 at 07:24 —
 * six and a half hours after that commit — he typed "איזה אורחים לא יודעי" and
 * the system sent those four words to עירית סבן. It failed only because Meta's
 * 24-hour window had closed 75 minutes earlier.
 *
 * So the caller changed rather than the list. admin-console now passes true
 * only when he has tapped "לענות לאורח" and then tapped a name, within the last
 * half hour. Everything below is what a person types at a console, and none of
 * it is addressed to anybody. */
test("ניסוחים סבירים של דביר לא מגיעים לאורח כשלא נבחר יעד", () => {
  for (const typed of [
    "איזה אורחים לא יודעי",   /* the real one, 08/09 07:24 */
    "כמה אישרו",
    "מי לא אישר",
    "תראה לי סטטוס",
    "שלח לכולם תזכורת",
    "מה עם שלמה",
    "כמה נשאר לשלוח היום",
  ]) {
    assert.notEqual(parseAdminCommand(typed, false, "text").kind, "reply_last",
      `"${typed}" נשלח לאורח`);
  }
});

/* And the one path that has ever worked correctly. Across all 1,035 outbound
   messages since the console shipped there were five free-text sends: four
   leaks, and one real reply — which went out through this. */
test("מספר בראש ההודעה עדיין מכתובת במפורש, גם בלי יעד", () => {
  const c = parseAdminCommand("0508270014 היי בוקר טוב- האם תגיעו לחתונה?", false);
  assert.equal(c.kind, "reply");
});
