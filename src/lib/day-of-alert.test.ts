import test from "node:test";
import assert from "node:assert/strict";
import { dayOfAlertLine, dayOfAlertText } from "./day-of-alert.ts";

const W = [
  { name: "ישי לרר", phone: "0545849470", token: "aaa" },
  { name: "יגל בן חיים", phone: "0522624899", token: "bbb" },
];

test("names, numbers and a link that opens a draft", () => {
  /* The count alone was the failure — שלמה's sixteen and איילת's forty-one
     were both numbers nobody could act on. */
  const line = dayOfAlertLine(W, "https://regalifnei.com");
  assert.match(line, /ישי לרר 0545849470 https:\/\/regalifnei\.com\/s\/aaa/);
  assert.match(line, /יגל בן חיים 0522624899 https:\/\/regalifnei\.com\/s\/bbb/);
});

test("never contains a newline — a template parameter with one is error 132000", () => {
  const many = Array.from({ length: 9 }, (_, i) => ({ name: `א\nב${i}`, phone: "050", token: "t" }));
  for (const s of [dayOfAlertLine(many, "https://x.co"), dayOfAlertText(9, many, "https://x.co")]) {
    assert.equal(s.includes("\n"), false);
  }
});

test("caps the list and says how many were left out", () => {
  const five = Array.from({ length: 5 }, (_, i) => ({ name: `אורח ${i}`, phone: "050", token: "t" }));
  assert.match(dayOfAlertLine(five, "https://x.co", 3), /ועוד 2$/);
  assert.equal(/ועוד/.test(dayOfAlertLine(W, "https://x.co", 3)), false);
});

test("a missing base still yields the number he can dial", () => {
  /* A phone number by hand beats an empty alert. */
  const line = dayOfAlertLine(W, null);
  assert.match(line, /ישי לרר 0545849470/);
  assert.equal(line.includes("/s/"), false);
});

test("nothing to report is empty, not a sentence about nobody", () => {
  assert.equal(dayOfAlertLine([], "https://x.co"), "");
  assert.equal(dayOfAlertLine([{ name: " ", phone: "" }], "https://x.co"), "");
});

test("one guest is singular", () => {
  assert.match(dayOfAlertText(1, [W[0]], "https://x.co"), /^מוזמן אחד עדיין לא יודע/);
  assert.match(dayOfAlertText(2, W, "https://x.co"), /^2 מוזמנים עדיין לא יודעים/);
});

test("the reason comes before the list", () => {
  /* A list with no reason is as useless as a reason with no list. */
  const t = dayOfAlertText(2, W, "https://regalifnei.com");
  assert.ok(t.indexOf("התקרה נגמרה") < t.indexOf("ישי לרר"));
});
