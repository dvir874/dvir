import test from "node:test";
import assert from "node:assert/strict";
import { checkPhone, samePhone, toLocalPhone } from "./phone-il.ts";

/* The storage form is 05X…, always. This is not a style preference: the admin
   "add guest" route used to normalise the other way, and thirty-four guests
   across all four weddings were written as 972… — עופרה דוראני among them, the
   row דביר flagged by hand on 30/08. They were only ever reachable because the
   webhook happens to try both spellings before giving up. */

test("every shape a phone has actually arrived in stores as 05X", () => {
  for (const raw of [
    "0504299200",        // as typed in the admin
    "972504299200",      // as it was wrongly stored
    "+972504299200",     // as WhatsApp shows it
    "+972 50-429-9200",  // as it is pasted from a contact card
    "00972504299200",    // as some spreadsheets export it
    "504299200",         // missing its leading zero
  ]) {
    assert.equal(checkPhone(raw).local, "0504299200", `נכשל על ${raw}`);
  }
});

test("a landline is a valid guest, not a rejected one", () => {
  /* Older relatives are on the list with house numbers. Rejecting them would
     drop them from the send entirely rather than merely fail to WhatsApp. */
  assert.equal(checkPhone("039123456").local, "039123456");
  assert.equal(checkPhone("08-9123456").local, "089123456");
});

test("a number that cannot be dialled is refused, not stored broken", () => {
  /* Silently storing these is what makes a guest look like someone who was
     asked and said nothing. */
  for (const bad of ["", "05012", "0501234567890", "abc", "1234567890"]) {
    assert.equal(checkPhone(bad).valid, false, `היה צריך להיפסל: ${bad}`);
    assert.equal(checkPhone(bad).local, null);
  }
});

test("the same person in two formats is one person", () => {
  /* The duplicate this module was written for: one guest, two invitations,
     two different personal links. */
  assert.ok(samePhone("0534793515", "972534793515"));
  assert.ok(samePhone("+972-53-479-3515", "0534793515"));
  assert.ok(!samePhone("0534793515", "0534793516"));
});

test("toLocalPhone gives back null rather than a guess", () => {
  assert.equal(toLocalPhone("972523795704"), "0523795704");
  assert.equal(toLocalPhone("לא מספר"), null);
});
