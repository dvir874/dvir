import test from "node:test";
import assert from "node:assert/strict";
import { isRsvpMessage, isInvitation, didArrive } from "./rsvp-contact.ts";

test("the rides board is not an invitation", () => {
  /* אשר כהן's only message, status "read", four days before שחר's wedding.
     It put him in the contacted set, which moved him out of the group that
     would have invited him. */
  assert.equal(isRsvpMessage("קבוצת טרמפים (תבנית)"), false);
  assert.equal(isInvitation("קבוצת טרמפים (תבנית)"), false);
});

test("neither is anything else the system sends", () => {
  for (const b of [
    "מחר מתחתנים (תבנית)",
    "היום מתחתנים (תבנית)",
    "בקשת תמונות",
    "גלריה מוכנה",
    "🪑 שולחן 12",
    "בקשה לזוג לבדוק 4 מספרים",
  ]) {
    assert.equal(isRsvpMessage(b), false, b);
  }
});

test("the invitation and its reminders are", () => {
  assert.equal(isInvitation("הזמנה לחתונה (תבנית)"), true);
  assert.equal(isRsvpMessage("הזמנה לחתונה (תבנית)"), true);
  assert.equal(isRsvpMessage("תזכורת אישור הגעה"), true);
  /* A reminder is contact, but it is not the invitation — a reminder to
     somebody never invited is its own bug, not evidence against one. */
  assert.equal(isInvitation("תזכורת אישור הגעה"), false);
});

test("arrival is what Meta confirmed, not what we sent", () => {
  assert.equal(didArrive("read"), true);
  assert.equal(didArrive("delivered"), true);
  for (const s of ["sent", "accepted", "failed", "auto", null, undefined]) {
    assert.equal(didArrive(s), false, String(s));
  }
});

test("nothing at all is not an invitation", () => {
  for (const b of [null, undefined, ""]) assert.equal(isRsvpMessage(b), false);
});
