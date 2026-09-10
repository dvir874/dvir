import test from "node:test";
import assert from "node:assert/strict";
import { nextSend, nextSendText } from "./next-send.ts";

/* The eight real slots, in UTC — see cron-schedule.ts. */
const SLOTS = [[6,0],[7,0],[8,15],[10,30],[13,0],[16,30],[18,30],[19,30]] as const;
const open = () => false;
const H = 3_600_000;

/* Thursday 10/09/2026, 09:00 Israel = 06:00 UTC. */
const NOW = Date.UTC(2026, 8, 10, 6, 0);

test("הרוב לא מוכנים — התשובה היא הסלוט של הראשון שכן", () => {
  const n = nextSend([NOW + 6 * H, NOW + 30 * H, NOW + 100 * H], SLOTS, open, NOW);
  assert.ok(n.at !== null);
  /* 06:00 + 6h = 12:00 UTC; the first slot at or after that is 13:00. */
  assert.equal(new Date(n.at!).getUTCHours(), 13);
  assert.equal(n.dueBy, 1, "רק מי שכבר בשל נספר");
});

test("מי שכבר היה בשל אתמול נשלח בריצה הבאה, לא בעבר", () => {
  const n = nextSend([NOW - 50 * H, NOW - 2 * H], SLOTS, open, NOW);
  assert.ok(n.at !== null && n.at >= NOW, "אין תאריך בעבר");
  assert.equal(n.dueBy, 2);
});

test("יום חסום נדלג, ולא מוחזרת שעה בתוכו", () => {
  /* Everything on 10/09 is blocked; the answer must move to the 11th. */
  const day = (ms: number) => new Date(ms).getUTCDate();
  const n = nextSend([NOW], SLOTS, at => day(at.getTime()) === 10, NOW);
  assert.ok(n.at !== null);
  assert.equal(day(n.at!), 11);
});

test("חתונה מושהית אינה מקבלת תאריך משוער", () => {
  /* "יום ראשון" when the pause runs to Wednesday is worse than saying nothing. */
  const n = nextSend([NOW], SLOTS, open, NOW, NOW + 72 * H);
  assert.equal(n.at, null);
  assert.equal(n.reason, "paused");
  assert.match(nextSendText(n, () => ""), /מושהית/);
});

test("כולם מיצו — נאמר במפורש, לא 'אין למי'", () => {
  const n = nextSend([null, null, null], SLOTS, open, NOW);
  assert.equal(n.at, null);
  assert.equal(n.exhausted, 3);
  assert.match(nextSendText(n, () => ""), /כבר קיבלו את המקסימום/);
});

test("רשימה ריקה אינה קריסה", () => {
  const n = nextSend([], SLOTS, open, NOW);
  assert.equal(n.at, null);
  assert.equal(n.reason, "nobody");
});

test("הניסוח אומר 'עד', כי התקרה משותפת לכל החתונות", () => {
  const n = nextSend([NOW, NOW, NOW], SLOTS, open, NOW);
  const t = nextSendText(n, () => "היום 16:00");
  assert.match(t, /עד 3 אורחים/);
  assert.ok(!t.includes("בדיוק"), "אסור להבטיח מספר מדויק");
});
