import test from "node:test";
import assert from "node:assert/strict";
import {
  decide, ASK_COUNT, ASK_DECLINE, ASK_CHANGE,
  type GuestView, type Parsers,
} from "./wa-decide.ts";
import { unpromptedCount, compositeCount, bareCount, changeIntent } from "./guest-count.ts";

/* The real parsers wherever they are import-free, and the generous mid-question
   one reproduced from wa-interactive, so these tests exercise the same reading
   of a message that production does. */
const WORDS: Record<string, number> = {
  "אחד": 1, "אחת": 1, "לבד": 1, "רק אני": 1,
  "שניים": 2, "שתיים": 2, "שנינו": 2, "זוג": 2,
  "שלושה": 3, "שלוש": 3, "ארבעה": 4, "ארבע": 4,
  "חמישה": 5, "חמש": 5, "שישה": 6, "שש": 6,
  "שבעה": 7, "שבע": 7, "שמונה": 8, "תשעה": 9, "תשע": 9, "עשרה": 10, "עשר": 10,
};
const promptedCount = (raw: string): number | null => {
  const t = String(raw ?? "").trim();
  if (!t) return null;
  const d = t.match(/\d+/g);
  if (d) {
    if (d.length > 1) return null;
    const n = parseInt(d[0], 10);
    return n >= 1 && n <= 20 ? n : null;
  }
  for (const [w, n] of Object.entries(WORDS)) if (t.includes(w)) return n;
  return null;
};

const TOWNS = ["ירושלים", "תל אביב", "חיפה", "מודיעין", "ירוחם"];
const ride: Parsers["ride"] = raw => {
  const t = String(raw ?? "");
  const town = TOWNS.find(x => t.includes(x));
  if (!town) return null;
  if (/(יש לי מקום|מציע|נוסע ו|פנוי ברכב)/.test(t)) return { area: town, role: "offer" };
  if (/(מחפש|צריך טרמפ|אשמח לטרמפ|בלי רכב)/.test(t)) return { area: town, role: "seek" };
  return null;
};

const P: Parsers = {
  promptedCount, unpromptedCount, composite: compositeCount,
  bare: bareCount, changeIntent, ride,
};

const guest = (o: Partial<GuestView> = {}): GuestView => ({
  status: "pending", guestCount: 1, liveState: null, hasToken: true, ...o,
});

/* ── while a question of ours is open ───────────────────────────────────── */

test("a button is never read as an answer to \"how many\"", () => {
  /* דור ענף tapped מגיע and לא מגיע in the same second on 12/08. The second
     reached the number parser, came back as "לא הצלחנו להבין את המספר", and he
     stayed recorded as attending — a guest saying he was not coming answered
     with a complaint about arithmetic. */
  const mid = guest({ liveState: ASK_COUNT });
  assert.equal(decide(mid, "rsvp_no", P).kind, "decline_confirm_ask");
  assert.equal(decide(mid, "לא מגיע", P).kind, "decline_confirm_ask");
  assert.equal(decide(mid, "rsvp_yes", P).kind, "count_ask_again");
});

test("a number mid-question is recorded", () => {
  const d = decide(guest({ liveState: ASK_COUNT }), "3", P);
  assert.equal(d.kind, "count_recorded");
  assert.equal(d.count, 3);
});

test("a split mid-question is recorded with the split", () => {
  /* שירה ואייל answered "3" and then "1+ 2 ילדים". The three is what seating
     needs; the two is what the caterer bills differently. */
  const d = decide(guest({ liveState: ASK_COUNT }), "1+ 2 ילדים", P);
  assert.equal(d.kind, "count_with_kids");
  assert.equal(d.count, 3);
  assert.equal(d.kids, 2);
});

test("something unreadable mid-question asks again rather than guessing", () => {
  assert.equal(decide(guest({ liveState: ASK_COUNT }), "מה קורה", P).kind, "count_ask_again");
});

test("only a clear yes changes a headcount we proposed", () => {
  const asked = guest({ status: "confirmed", guestCount: 2, liveState: `${ASK_CHANGE}:5` });
  assert.deepEqual(decide(asked, "כן", P), { kind: "change_yes", count: 5 });
  assert.equal(decide(asked, "yes_change", P).kind, "change_yes");
  for (const m of ["לא", "רגע", "אולי", "😊"]) {
    assert.equal(decide(asked, m, P).kind, "change_no", `"${m}" must not change an answer`);
  }
});

test("a decline is only recorded once it is confirmed", () => {
  const asked = guest({ liveState: ASK_DECLINE });
  assert.equal(decide(asked, "כן", P).kind, "decline_recorded");
  assert.equal(decide(asked, "yes_decline", P).kind, "decline_recorded");
  assert.equal(decide(asked, "לא", P).kind, "decline_cancelled");
});

/* ── with no question open ──────────────────────────────────────────────── */

test("a first tap is never recorded as final on its own", () => {
  /* "coming" opens the count question; "not coming" is always double-checked,
     because a tap cannot be taken back and a guest declining by accident is
     removed from a wedding they meant to attend. */
  assert.equal(decide(guest(), "rsvp_yes", P).kind, "yes_first_tap");
  assert.equal(decide(guest(), "מגיע", P).kind, "yes_first_tap");
  assert.equal(decide(guest(), "rsvp_no", P).kind, "no_first_tap");
  assert.equal(decide(guest(), "לא מגיע", P).kind, "no_first_tap");
});

test("a list selection is honoured even with no state", () => {
  /* WhatsApp delivers count_N after the state has been cleared, if the guest
     answered twice. */
  const d = decide(guest(), "count_4", P);
  assert.equal(d.kind, "list_pick");
  assert.equal(d.count, 4);
});

test("a congratulation from a waiting guest is never a headcount", () => {
  /* "מזל טוב לזוג המאושר" contains "זוג", which the generous parser reads as
     two — a blessing booked two seats and answered "רשמנו 2 🤍". */
  for (const m of ["מזל טוב לזוג המאושר!", "שיהיה במזל טוב, שנינו מאחלים", "בשעה טובה 🤍"]) {
    assert.equal(decide(guest(), m, P).kind, "human", `booked seats: ${m}`);
  }
});

test("a refusal carrying a number is never an acceptance", () => {
  assert.equal(decide(guest(), "לצערי לא נוכל להגיע, אנחנו 2 בחו\"ל", P).kind, "human");
});

test("the answers this must not lose still get through", () => {
  /* אמא של שחר answered from a second handset with no chat_state: "תודה רבה\n1".
     Dropping it sent her a reminder for an answer she had already given. */
  assert.deepEqual(decide(guest(), "תודה רבה\n1", P), { kind: "unprompted_count", count: 1 });
  assert.deepEqual(decide(guest(), "3", P), { kind: "unprompted_count", count: 3 });
  const c = decide(guest(), "זוג+פעוטה", P);
  assert.equal(c.kind, "unprompted_composite");
  assert.equal(c.count, 3);
  assert.equal(c.kids, 1);
});

/* ── after they have answered ───────────────────────────────────────────── */

test("a number from somebody who already answered is proposed, never applied", () => {
  /* A guest whose count changes silently is a guest whose caterer count changes
     silently. */
  const d = decide(guest({ status: "confirmed", guestCount: 2 }), "4", P);
  assert.equal(d.kind, "change_proposed");
  assert.equal(d.count, 4);
});

test("repeating the same number is not a change", () => {
  assert.equal(decide(guest({ status: "confirmed", guestCount: 2 }), "2", P).kind, "change_same");
});

test("a change asked for in words is understood", () => {
  const d = decide(guest({ status: "confirmed", guestCount: 2 }), "אפשר לעדכן ל-5?", P);
  assert.equal(d.kind, "change_proposed");
  assert.equal(d.count, 5);
});

test("a declined guest sending a number is offered the change too", () => {
  assert.equal(decide(guest({ status: "declined", guestCount: 1 }), "3", P).kind, "change_proposed");
});

/* ── the tail ───────────────────────────────────────────────────────────── */

test("a broken link is answered with the link", () => {
  /* Four guests wrote this and one waited fifteen hours. They are the guests
     actively trying to answer and unable to. */
  for (const m of ["הקישור לא עובד", "היי זה נכשל לי", "יכולים לשלוח קישור שוב בבקשה?"]) {
    assert.equal(decide(guest(), m, P).kind, "link_resend", m);
  }
});

test("a guest with no token is not offered a link", () => {
  assert.equal(decide(guest({ hasToken: false }), "הקישור לא עובד", P).kind, "human");
});

test("the word קישור alone is not a complaint about the link", () => {
  assert.equal(decide(guest(), "קיבלתי את הקישור תודה", P).kind, "human");
});

test("a lift is recognised only with both a town and an intent", () => {
  const offer = decide(guest(), "יש לי מקום ברכב, נוסע מירושלים", P);
  assert.equal(offer.kind, "ride");
  assert.deepEqual(offer.ride, { area: "ירושלים", role: "offer" });
  const seek = decide(guest(), "מחפש טרמפ מתל אביב", P);
  assert.deepEqual(seek.ride, { area: "תל אביב", role: "seek" });
  /* Merely saying where they live is not an offer. */
  assert.equal(decide(guest(), "אנחנו גרים בחיפה", P).kind, "human");
});

test("anything else reaches a person", () => {
  for (const m of ["מה שלומך", "קולולולו", "לא הבנתי מי זה ?", ""]) {
    assert.equal(decide(guest(), m, P).kind, "human", m);
  }
});

/* ── the ordering itself ────────────────────────────────────────────────── */

test("an open question outranks every guess about free text", () => {
  /* "3" is a headcount mid-question and a proposed change afterwards. Same
     message, different meaning, and the state is what decides. */
  assert.equal(decide(guest({ liveState: ASK_COUNT }), "3", P).kind, "count_recorded");
  assert.equal(decide(guest({ status: "confirmed", guestCount: 2 }), "3", P).kind, "change_proposed");
});

test("an expired question is no question at all", () => {
  /* liveState is null once the 48h TTL has passed, and the message then has to
     stand on its own. */
  assert.equal(decide(guest({ liveState: null }), "3", P).kind, "unprompted_count");
});
