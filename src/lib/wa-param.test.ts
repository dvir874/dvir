import test from "node:test";
import assert from "node:assert/strict";
import { safeParam } from "./whatsapp.ts";

/* Meta rejects the whole template message when a body parameter contains a
   newline, a tab, or four or more consecutive spaces. Every string below is
   one a guest actually sent. */

test("a line break becomes a separator, not a rejection", () => {
  assert.equal(safeParam("שדה בוקר\nמצפה רמון"), "שדה בוקר · מצפה רמון");
});

test("several blank lines collapse to one separator", () => {
  /* "שלום וצהריים טובים,\n \nמזל טוב ושפע ברכות." — the blank line between
     paragraphs is two newlines around a space. */
  assert.equal(safeParam("שלום,\n\nמזל טוב"), "שלום, · מזל טוב");
  assert.ok(!/[\r\n]/.test(safeParam("א\r\nב\r\nג")));
});

test("four spaces in a row are reduced", () => {
  assert.ok(!/ {4}/.test(safeParam("מזל טוב      מזל טוב")));
});

test("a tab is not left in", () => {
  assert.ok(!/\t/.test(safeParam("שם\tערך")));
});

test("an empty parameter becomes a dash rather than an empty string", () => {
  /* Meta rejects an empty body parameter too, and an alert that fails is an
     alert nobody knows was needed. */
  assert.equal(safeParam(""), "—");
  assert.equal(safeParam("\n\n"), "—");
});

test("ordinary text is untouched", () => {
  assert.equal(safeParam("יש מישהו שמגיע מתל אביב?"), "יש מישהו שמגיע מתל אביב?");
});
