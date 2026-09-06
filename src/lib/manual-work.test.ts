import test from "node:test";
import assert from "node:assert/strict";
import { classifyManualWork, manualWorkMessage, manualWorkLines, WORK_TEXT, type WorkGuest, type LastContact } from "./manual-work.ts";

const g = (id: string, o: Partial<WorkGuest> = {}): WorkGuest =>
  ({ id, name: id, phone: "0501234567", status: "pending", category: "general", do_not_contact: false, ...o });

const c = (o: Partial<LastContact> = {}): LastContact =>
  ({ lastOutAt: "2026-09-03T10:00:00Z", lastCode: null, arrived: false, lastInAt: null, ...o });

test("a guest who wrote and got nothing back comes first", () => {
  /* נעם חדד asked for a human at 14:58 and the thread never showed in
     "ממתין לך". Someone waiting right now outranks a wrong number. */
  const items = classifyManualWork(
    [g("שאלה"), g("מנותק")],
    new Map([
      ["שאלה", c({ lastInAt: "2026-09-03T14:58:00Z", lastOutAt: "2026-09-03T10:00:00Z" })],
      ["מנותק", c({ lastCode: 131026 })],
    ]));
  assert.equal(items[0].kind, "waiting_reply");
  assert.equal(items[0].name, "שאלה");
});

test("a guest who already answered can still be waiting for a reply", () => {
  /* The question does not stop mattering because the RSVP is in. */
  const items = classifyManualWork(
    [g("אישר", { status: "confirmed" })],
    new Map([["אישר", c({ lastInAt: "2026-09-03T15:00:00Z", lastOutAt: "2026-09-03T10:00:00Z" })]]));
  assert.equal(items.length, 1);
  assert.equal(items[0].kind, "waiting_reply");
});

test("each Meta failure a person can act on is named", () => {
  const items = classifyManualWork(
    [g("הפסיקו"), g("איןוואטסאפ"), g("חסום")],
    new Map([
      ["הפסיקו", c({ lastCode: 131050 })],
      ["איןוואטסאפ", c({ lastCode: 131026 })],
      ["חסום", c({ lastCode: 130472 })],
    ]));
  assert.deepEqual(items.map(x => x.kind), ["opted_out", "no_whatsapp", "template_blocked"]);
});

test("the failures that retry themselves are never listed", () => {
  /* 131049 comes back tomorrow on its own. A list containing things nobody has
     to do is a list nobody reads. */
  const items = classifyManualWork(
    [g("מכסה"), g("תקלה")],
    new Map([["מכסה", c({ lastCode: 131049 })], ["תקלה", c({ lastCode: 500 })]]));
  assert.deepEqual(items, []);
});

test("a guest nothing was ever sent to is the most serious and the quietest", () => {
  /* Nothing failed, so nothing reported it. אשר כהן and חיים כצמן sat like
     this at שחר's wedding. */
  const items = classifyManualWork([g("איש")], new Map());
  assert.equal(items[0].kind, "never_sent");
});

test("a guest the message reached is not work", () => {
  const items = classifyManualWork([g("קיבל")], new Map([["קיבל", c({ arrived: true })]]));
  assert.deepEqual(items, []);
});

test("demo guests, silenced guests and guests with no number are not work", () => {
  const items = classifyManualWork([
    g("דמו", { category: "demo" }),
    g("שקט", { do_not_contact: true }),
    g("בלימספר", { phone: "" }),
  ], new Map());
  assert.deepEqual(items, []);
});

test("the message carries names and numbers, not counts", () => {
  /* "2 מטא חוסמת" sends him to the admin to find out who. */
  const items = classifyManualWork(
    [g("דנה כהן", { phone: "0501111111" }), g("רון לוי", { phone: "0502222222" })],
    new Map([["דנה כהן", c({ lastCode: 131026 })], ["רון לוי", c({ lastCode: 131026 })]]));
  const m = manualWorkMessage("שחר ואורי", 5, items)!;
  assert.ok(m.includes("דנה כהן 0501111111"), m);
  assert.ok(m.includes("רון לוי 0502222222"), m);
  assert.ok(m.includes("בעוד 5 ימים"), m);
  assert.ok(m.includes(WORK_TEXT.no_whatsapp), m);
  /* Never a newline — one in a Meta parameter fails the whole send. */
  assert.equal(/[\n\t]/.test(m), false);
});

test("a long list is capped and says how many it did not name", () => {
  const many = Array.from({ length: 20 }, (_, i) => g(`אורח${i}`));
  const items = classifyManualWork(many, new Map());
  const m = manualWorkMessage("תהל ואביב", 19, items)!;
  assert.ok(m.includes("ועוד 14"), m);
});

test("nothing to do produces no message at all", () => {
  assert.equal(manualWorkMessage("שחר", 5, []), null);
});

test("every name carries a link that opens WhatsApp with their message ready", () => {
  /* A bare phone number in a WhatsApp message opens a dialler. Dvir asked for
     what the admin screen has always had: one tap to a draft. The full wa.me
     URL carries the encoded invitation and runs to ~700 characters, so several
     cannot fit a Meta template parameter — this is the short form. */
  const items = classifyManualWork(
    [{ ...g("דנה כהן", { phone: "0501111111" }), rsvp_token: "abc-123" }], new Map());
  const m = manualWorkMessage("שחר ואורי", 4, items, 6, "https://x.co")!;
  assert.ok(m.includes("https://x.co/s/abc-123"), m);
  assert.ok(m.includes("דנה כהן 0501111111"), m);
});

test("a guest with no token is still named, just without a link", () => {
  const items = classifyManualWork([g("בלי טוקן")], new Map());
  const m = manualWorkMessage("שחר", 4, items, 6, "https://x.co")!;
  assert.ok(m.includes("בלי טוקן"), m);
  assert.equal(m.includes("/s/"), false, m);
});

test("a number that refuses every attempt goes to a person, not to the queue", () => {
  /* סטיב ומריאן: fourteen attempts across eleven days, every one returning
     131049. The attempt cap counts what Meta ACCEPTED, so a recipient who
     refuses everything never reaches it and is tried for ever. */
  const items = classifyManualWork(
    [g("סטיב ומריאן")],
    new Map([["סטיב ומריאן", c({ lastCode: 131049, refusals: 14 })]]));
  assert.equal(items[0].kind, "always_refused");
});

test("a couple of refusals is still just a throttle", () => {
  const items = classifyManualWork(
    [g("מכסה")], new Map([["מכסה", c({ lastCode: 131049, refusals: 2 })]]));
  assert.deepEqual(items, [], "two refusals is Meta throttling, not an answer");
});

/* שחר's wedding, 06/09. Seven guests had confirmed and none of their numbers
   would take a message — five in one of Meta's experiment groups. They were
   about to arrive at a wedding without ever being told the time or the place,
   because the day-before and day-of messages go to confirmed guests and would
   fail for every one of them.
   
   The evening report said there was nothing to do. Dvir found them by asking.
   The rule was "a guest who has already answered needs nothing", which was
   true until the two sends with no second chance were added. */
test("מאושר הגעה שלא ניתן להשיג — עולה לדוח, עם קישור", () => {
  const guests = [{ id: "1", name: "כוכי", phone: "0524886378", status: "confirmed", rsvp_token: "tok" }];
  const contact = new Map([["1", { lastOutAt: "2026-09-01T09:00:00Z", lastCode: 130472, arrived: false }]]);

  const near = classifyManualWork(guests, contact, 2);
  assert.equal(near.length, 1);
  assert.equal(near[0].kind, "coming_unreachable");
  assert.equal(near[0].send, "tok", "בלי קישור זו רשימה ולא פעולה");
});

/* Further out the automation still has time, and saying it early turns the one
   report that is about people into noise. */
test("אותו אורח, שבועיים לפני — לא מציקים", () => {
  const guests = [{ id: "1", name: "כוכי", phone: "0524886378", status: "confirmed", rsvp_token: "tok" }];
  const contact = new Map([["1", { lastOutAt: "2026-09-01T09:00:00Z", lastCode: 130472, arrived: false }]]);
  assert.equal(classifyManualWork(guests, contact, 14).length, 0);
});

/* The common case must stay silent: a confirmed guest we reached fine is not
   manual work, however close the wedding is. */
test("מאושר הגעה שההודעות מגיעות אליו — לא עולה", () => {
  const guests = [{ id: "1", name: "רותם", phone: "0521111111", status: "confirmed", rsvp_token: "t" }];
  const contact = new Map([["1", { lastOutAt: "2026-09-05T09:00:00Z", arrived: true }]]);
  assert.equal(classifyManualWork(guests, contact, 1).length, 0);
});

/* And a guest who wrote to us still outranks everything, answered or not —
   that check runs before this one and must keep running before it. */
test("מאושר הגעה שכתב לנו — עדיין 'כתבו ולא נענו', לא הקטגוריה החדשה", () => {
  const guests = [{ id: "1", name: "רותם", phone: "0521111111", status: "confirmed", rsvp_token: "t" }];
  const contact = new Map([["1", {
    lastOutAt: "2026-09-01T09:00:00Z", lastInAt: "2026-09-05T09:00:00Z", lastCode: 130472,
  }]]);
  assert.equal(classifyManualWork(guests, contact, 1)[0].kind, "waiting_reply");
});

/* The report Dvir actually receives. He asked more than once for a link per
   person and kept getting a paragraph, because the template parameter that
   carried it cannot hold a newline. */
test("שורה לאדם, שורה לקישור — לא פסקה אחת", () => {
  const items = classifyManualWork(
    [{ id: "1", name: "כוכי", phone: "0524886378", status: "confirmed", rsvp_token: "aaa" },
     { id: "2", name: "נעמי", phone: "0543934450", status: "confirmed", rsvp_token: "bbb" }],
    new Map([["1", { lastOutAt: "2026-09-01T09:00:00Z", lastCode: 130472 }],
             ["2", { lastOutAt: "2026-09-01T09:00:00Z", lastCode: 131026 }]]),
    2);
  const msg = manualWorkLines("אורי ושחר", 2, items, "https://x.app");
  assert.ok(msg);
  const lines = msg.split("\n");
  assert.ok(lines.includes("https://x.app/s/aaa"), "הקישור על שורה משלו");
  assert.ok(lines.includes("https://x.app/s/bbb"));
  assert.ok(lines.some(l => l.startsWith("כוכי")));
  /* The failure being prevented: everything on one line. */
  assert.ok(lines.length > 6, "לא פסקה");
});

test("אין עבודה ידנית — לא נשלחת הודעה", () => {
  assert.equal(manualWorkLines("אורי ושחר", 2, [], "https://x.app"), null);
});

/* Without a base URL there is nothing to tap, and a name with no link is a
   list rather than an action — but it must still be said. */
test("בלי כתובת בסיס עדיין מדווח, פשוט בלי קישורים", () => {
  const msg = manualWorkLines("אורי ושחר", 2,
    [{ id: "1", name: "כוכי", phone: "052", kind: "coming_unreachable", send: "aaa" }], "");
  assert.ok(msg?.includes("כוכי"));
  assert.ok(!msg.includes("/s/"));
});
