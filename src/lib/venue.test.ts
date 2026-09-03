import test from "node:test";
import assert from "node:assert/strict";
import { venueLine, wazeLink } from "./venue.ts";

test("both halves are joined — the bug that would have misdirected 310 guests", () => {
  /* תהל ואביב, exactly as entered. Reading address alone gave "מושב עג׳ור":
     a village, with no venue named in it, and nothing a driver can act on. */
  assert.equal(
    venueLine({ venue_name: "גן האירועים ארץ", address: "מושב עג׳ור" }),
    "גן האירועים ארץ, מושב עג׳ור",
  );
});

test("an address that already names the venue is not doubled", () => {
  /* שחר's row. It came out right before this existed, and must still. */
  assert.equal(
    venueLine({ venue_name: "חוות ארץ האיילים", address: "חוות ארץ האיילים, גוש עציון" }),
    "חוות ארץ האיילים, גוש עציון",
  );
});

test("either field alone still works", () => {
  assert.equal(venueLine({ address: "אולמי גאיה, האומן 12, חדרה" }), "אולמי גאיה, האומן 12, חדרה");
  assert.equal(venueLine({ venue_name: "אולמי פאלאסיו" }), "אולמי פאלאסיו");
  assert.equal(venueLine({ venue_name: "  ", address: "" }), null);
  assert.equal(venueLine(null), null);
});

test("Waze gets the whole destination, not half of it", () => {
  /* The link was built from address alone, so it pointed at the village too. */
  const l = wazeLink({ venue_name: "גן האירועים ארץ", address: "מושב עג׳ור" });
  assert.ok(l?.includes(encodeURIComponent("גן האירועים ארץ, מושב עג׳ור")));
  assert.equal(wazeLink({}), null);
});

test("the two halves of a location are joined wherever a person reads them", () => {
  /* THE BUG THIS FILE EXISTS FOR, and why it kept coming back.
   *
   * The schema allows two valid ways to record one location, and only luck
   * decided which a wedding got:
   *
   *   שחר   address = "חוות ארץ האיילים, גוש עציון"   venue_name = null
   *   תהל   address = "מושב עג׳ור"                     venue_name = "גן האירועים ארץ"
   *
   * Code that read `address` and stopped was right for שחר and wrong for תהל,
   * whose 310 guests would have been sent to a village with no venue named in
   * it. Same operator, same afternoon, two weddings, opposite outcomes.
   *
   * It was fixed in the automated sends on 01/09 and stayed broken in three
   * other places until 03/09 — the guest-facing join page and the client
   * agreement among them — because "fixed" meant "fixed where we looked". */
  assert.equal(
    venueLine({ venue_name: "גן האירועים ארץ", address: "מושב עג׳ור" }),
    "גן האירועים ארץ, מושב עג׳ור");
  assert.equal(
    venueLine({ venue_name: null, address: "חוות ארץ האיילים, גוש עציון" }),
    "חוות ארץ האיילים, גוש עציון");
  /* Not repeated when the address already carries the name. */
  assert.equal(
    venueLine({ venue_name: "חוות טל", address: "חוות טל, מושב תאשור" }),
    "חוות טל, מושב תאשור");
  /* Either half alone is still better than nothing. */
  assert.equal(venueLine({ venue_name: "אולמי גאיה", address: null }), "אולמי גאיה");
  assert.equal(venueLine({ venue_name: null, address: null }), null);
});
