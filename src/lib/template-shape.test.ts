import test from "node:test";
import assert from "node:assert/strict";
import { shapeOfOutgoing, shapeOfMeta, shapeMismatch, templateProblem } from "./template-shape.ts";

/* Exactly what sendOnce builds for a reminder with event details, for a
   template name it does not recognise as quick-reply. */
const OUTGOING_URL = [
  { type: "header", parameters: [{ type: "image", image: { link: "x" } }] },
  { type: "body", parameters: [{ type: "text", text: "a" }, { type: "text", text: "b" },
                               { type: "text", text: "c" }, { type: "text", text: "d" }] },
  { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: "t" }] },
];

/* The same, for a name listed in QUICK_REPLY_TEMPLATES — no button component. */
const OUTGOING_QR = OUTGOING_URL.slice(0, 2);

/* wedding_rsvp_followup_utility, as Meta actually stores it. */
const META_FOLLOWUP_UTILITY = {
  status: "APPROVED",
  components: [
    { type: "BODY", text: "שלום, החתונה של {{1}} ב-{{2}} ב-{{3}}. מאשרים?" },
    { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "מגיע" },
                                 { type: "QUICK_REPLY", text: "לא מגיע" }] },
  ],
};

/* wedding_reminder_buttons_generic, the one that has always worked. */
const META_GENERIC = {
  status: "APPROVED",
  components: [
    { type: "HEADER", format: "IMAGE" },
    { type: "BODY", text: "{{1}} · {{2}} · {{3}} · {{4}}" },
    { type: "FOOTER", text: "..." },
    { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "מגיע" },
                                 { type: "QUICK_REPLY", text: "לא מגיע" }] },
  ],
};

test("מודדים את מה שאנחנו באמת שולחים", () => {
  assert.deepEqual(shapeOfOutgoing(OUTGOING_URL), { header: "IMAGE", bodyVars: 4, button: "URL" });
  assert.deepEqual(shapeOfOutgoing(OUTGOING_QR), { header: "IMAGE", bodyVars: 4, button: "NONE" });
});

test("מודדים את מה שמטא באמת מאחסנת", () => {
  assert.deepEqual(shapeOfMeta(META_FOLLOWUP_UTILITY.components),
    { header: "NONE", bodyVars: 3, button: "QUICK_REPLY" });
  assert.deepEqual(shapeOfMeta(META_GENERIC.components),
    { header: "IMAGE", bodyVars: 4, button: "QUICK_REPLY" });
});

/* The whole reason this file exists. 19 reminders, three runs, one day of
   silence — and all three faults are named before a single message goes out. */
test("התקלה של 05-06/09 נתפסת מראש, על שלושת מרכיביה", () => {
  const problem = templateProblem("wedding_rsvp_followup_utility",
    META_FOLLOWUP_UTILITY, shapeOfOutgoing(OUTGOING_URL));
  assert.ok(problem);
  assert.ok(problem.includes("כותרת"), "הכותרת שאין לתבנית");
  assert.ok(problem.includes("4 פרמטרים") && problem.includes("ל-3"), "ספירת הפרמטרים");
  assert.ok(problem.includes("כפתור קישור"), "כפתור הקישור שלא קיים בתבנית");
});

test("התבנית שעובדת בייצור עוברת נקי", () => {
  assert.equal(templateProblem("wedding_reminder_buttons_generic",
    META_GENERIC, shapeOfOutgoing(OUTGOING_QR)), null);
});

/* Half the original bug was the name missing from QUICK_REPLY_TEMPLATES, which
   silently added a url button to a template that has none. */
test("שם שנשכח מרשימת כפתורי המענה נתפס בנפרד", () => {
  const problem = templateProblem("wedding_reminder_buttons_generic",
    META_GENERIC, shapeOfOutgoing(OUTGOING_URL));
  assert.ok(problem?.includes("כפתור קישור"));
});

/* The most likely way to repeat the outage: pointing the env var at a template
   Meta has not finished reviewing. wedding_rsvp_followup_v2 is PENDING today. */
test("תבנית שטרם אושרה נחסמת לפני השליחה הראשונה", () => {
  const problem = templateProblem("wedding_rsvp_followup_v2",
    { status: "PENDING", components: META_GENERIC.components }, shapeOfOutgoing(OUTGOING_QR));
  assert.ok(problem?.includes("PENDING"));
});

test("שם שלא קיים במטא בכלל נאמר במפורש", () => {
  assert.ok(templateProblem("typo_v9", null, shapeOfOutgoing(OUTGOING_QR))?.includes("לא קיימת"));
});

test("חסרה כותרת שהתבנית דורשת — גם זה כיוון של כישלון", () => {
  const problem = shapeMismatch({ header: "NONE", bodyVars: 4, button: "QUICK_REPLY" },
                                shapeOfMeta(META_GENERIC.components));
  assert.ok(problem?.includes("דורשת כותרת IMAGE"));
});

/* Meta counts a repeated {{1}} once. Counting occurrences instead of distinct
   variables would invent a mismatch on a template that is perfectly fine. */
test("משתנה שחוזר בגוף ההודעה נספר פעם אחת", () => {
  assert.equal(shapeOfMeta([{ type: "BODY", text: "{{1}} ... {{1}} ... {{2}}" }]).bodyVars, 2);
});

/* The correction of 06/09. templateProblem is a WARNING, and callers must not
   treat "not found" as authoritative: an empty name filter is far more often a
   wrong query — an untrimmed env value, a paging quirk — than a template that
   stopped existing, because the send path keeps proving the template works.
   The 19:30 run stopped a wedding's reminders on exactly that reasoning, three
   hours after the same templates had sent without a single failure. */
test("תבנית שלא נמצאה מדווחת, ולא נחשבת הוכחה שהיא נעלמה", () => {
  const problem = templateProblem("wedding_reminder_buttons_generic", null,
    { header: "IMAGE", bodyVars: 4, button: "NONE" });
  assert.ok(problem?.includes("לא קיימת"));
  /* Phrased as a fact about our lookup, not an instruction to stop sending —
     the caller decides, and it decides to warn. */
  assert.ok(!problem.includes("נעצר"));
});

/* The two corrections of 06/09, as one rule.
 *
 * 19:30 — the check could not find the template and stopped a healthy run for
 * תהל with 89 guests eligible. 21:31 — the check DID find it, said exactly
 * what was wrong, was treated as a warning, and 90 reminders failed #132000.
 *
 * Both were the same code and opposite mistakes, so the rule cannot be "always
 * stop" or "never stop". It is whether Meta gave us the definition: a stored
 * shape that disagrees is proof, an empty lookup is not. */
test("מבנה שמטא מסרה וסותר — הוכחה. חיפוש שחזר ריק — לא הוכחה", () => {
  const sending = { header: "IMAGE", bodyVars: 4, button: "URL" as const };

  /* 21:31: Meta stored it, and it disagrees on all three counts. */
  const known = templateProblem("wedding_rsvp_followup_utility", {
    status: "APPROVED",
    components: [
      { type: "BODY", text: "{{1}} {{2}} {{3}}" },
      { type: "BUTTONS", buttons: [{ type: "QUICK_REPLY", text: "מגיע" }] },
    ],
  }, sending);
  assert.ok(known?.includes("כותרת"));
  assert.ok(known?.includes("4 פרמטרים"));
  assert.ok(known?.includes("כפתור קישור"));

  /* 19:30: nothing came back. The message is still worth saying out loud, but
     it describes our lookup, not the template. */
  const unknown = templateProblem("wedding_reminder_buttons_generic", null, sending);
  assert.ok(unknown?.includes("לא קיימת"));
  assert.ok(!unknown.includes("פרמטרים"), "אין מה להשוות בלי הגדרה מצד מטא");
});
