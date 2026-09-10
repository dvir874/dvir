import test from "node:test";
import assert from "node:assert/strict";
import { menuId, parseMenuId, asksForMenu, LABEL } from "./admin-menu.ts";

test("כל מסך שנשלח חוזר כמו שהוא", () => {
  const screens = [
    { screen: "root" }, { screen: "weddings" },
    { screen: "wedding", id: "7e1a56b5-1083-4afd-8317-9cd52557534d" },
    { screen: "pause", id: "7e1a56b5-1083-4afd-8317-9cd52557534d" },
    { screen: "resume", id: "7e1a56b5-1083-4afd-8317-9cd52557534d" },
    { screen: "missing" }, { screen: "missing", id: "7e1a56b5-1083-4afd-8317-9cd52557534d" },
    { screen: "waiting" }, { screen: "pick_reply" },
    { screen: "reply_to", id: "eb625f65-8f6d-4d54-bdb1-e11c27a8e015" },
    { screen: "mute", id: "eb625f65-8f6d-4d54-bdb1-e11c27a8e015" },
    { screen: "unmute", id: "eb625f65-8f6d-4d54-bdb1-e11c27a8e015" },
    { screen: "today" }, { screen: "money" },
    { screen: "mark_paid", id: "7e1a56b5-1083-4afd-8317-9cd52557534d" },
    { screen: "help" },
  ] as const;
  for (const s of screens) {
    assert.deepEqual(parseMenuId(menuId(s)), s, JSON.stringify(s));
  }
});

test("מה שאינו לחיצה שלנו אינו מסך", () => {
  /* The whole point: a sentence must never resolve to an action. */
  for (const s of [
    "", "שלח לכולם תזכורת", "כמה אישרו", "היי נעם מה קרה?",
    "m", "m:", "m:nope", "menu", "0501234567 היי",
  ]) assert.equal(parseMenuId(s), null, JSON.stringify(s));
});

test("מזהה מזויף לא הופך לפעולה על אורח", () => {
  /* Ids come back over the network. One that is not the shape we issue is
     refused rather than passed to a query. */
  assert.equal(parseMenuId("m:mute:'; drop table guests--"), null);
  assert.equal(parseMenuId("m:rep:../../etc/passwd"), null);
  /* A screen that REQUIRES an id gets none, so it is not a screen. */
  assert.equal(parseMenuId("m:pause"), null);
  assert.equal(parseMenuId("m:mute"), null);
  assert.equal(parseMenuId("m:unmute"), null);
  assert.equal(parseMenuId("m:paid"), null);
  assert.equal(parseMenuId("m:today:x"), null);
  /* One that treats a missing id as "the list" still works. */
  assert.deepEqual(parseMenuId("m:miss"), { screen: "missing" });
  /* And a screen that takes no argument refuses one rather than ignoring it. */
  assert.equal(parseMenuId("m:root:anything"), null);
});

test("מילים שפותחות את התפריט", () => {
  for (const s of ["תפריט", "menu", "היי", "שלום", "?", "/", "בוקר טוב"])
    assert.equal(asksForMenu(s), true, s);
  for (const s of ["היי נעם", "תפריט של האולם", "שלום, מתי החתונה?"])
    assert.equal(asksForMenu(s), false, s);
});

test("כל תווית נכנסת במגבלות של וואטסאפ", () => {
  /* A button is truncated at 20 characters and a list row at 24, silently, and
     there is no way to see it until it is on a phone. Emoji count as two. */
  for (const [k, v] of Object.entries(LABEL)) {
    assert.ok([...v].length <= 20, `${k} ארוך מדי: ${v}`);
  }
});
