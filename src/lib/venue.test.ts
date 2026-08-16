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
