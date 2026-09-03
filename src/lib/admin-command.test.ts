import test from "node:test";
import assert from "node:assert/strict";
import { parseAdminCommand, matchEvent, ADMIN_HELP } from "./admin-command.ts";

test("the everyday questions", () => {
  for (const m of ["סטטוס", "מה המצב", "status"]) {
    assert.equal(parseAdminCommand(m, false).kind, "status", m);
  }
  for (const m of ["מחכה לי", "מי לא קיבל", "מי צריך אותי"]) {
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
