import test from "node:test";
import assert from "node:assert/strict";
import { parseAreas, isShuttle, buildRideBoard, introMessage } from "./rides.ts";

/* The board reads free text people typed into an RSVP form. Every rule here
   exists because a real entry broke the previous one. */

test("the same place written differently is one place", () => {
  /* "חדרה" and "חדרה /אולגה" were two areas, and nobody in one could ever be
     matched with anybody in the other. */
  assert.deepEqual(parseAreas("אולגה"), ["חדרה"]);
  assert.deepEqual(parseAreas("גבעת אולגה"), ["חדרה"]);
  assert.deepEqual(parseAreas("י-ם"), ["ירושלים"]);
  assert.deepEqual(parseAreas("ירושליים"), ["ירושלים"]);
});

test("one person naming two places is two pickup points, not one place", () => {
  /* "בני ברק , רמת גן ( אזור קניון אילון )" is somebody saying where they can
     be collected from, and reading it as a single area hid both. */
  const areas = parseAreas("בני ברק , רמת גן");
  assert.ok(areas.includes("בני ברק"));
  assert.ok(areas.includes("רמת גן"));
});

test("an organised coach is not a carpool", () => {
  /* Eleven of sixteen "seeking" rows were the Tiberias shuttle — people
     already on a bus list. They made demand look three times larger than it
     was and hid that only five guests actually wanted a lift. */
  assert.equal(isShuttle("הסעה מטבריה"), true);
  assert.equal(isShuttle("ירושלים"), false);
});

test("a match needs both sides of the same area", () => {
  const board = buildRideBoard([
    { name: "מחפש",  ride_from: "ירושלים", ride_role: "seek"  },
    { name: "נהג",   ride_from: "ירושלים", ride_role: "offer" },
    { name: "בודד",  ride_from: "אילת",    ride_role: "seek"  },
  ]);
  assert.equal(board.matches.length, 1);
  assert.equal(board.matches[0].area, "ירושלים");
  assert.equal(board.matches[0].seeker.name, "מחפש");
  assert.equal(board.matches[0].driver.name, "נהג");
});

test("an area with only seekers produces no match and no false hope", () => {
  /* תהל has twelve ride entries across eleven areas and zero matches. The
     board must say nothing rather than invent a pairing. */
  const board = buildRideBoard([
    { name: "א", ride_from: "תקוע",   ride_role: "seek" },
    { name: "ב", ride_from: "אריאל",  ride_role: "seek" },
  ]);
  assert.equal(board.matches.length, 0);
});

test("a row missing either half is ignored entirely", () => {
  /* Marking somebody a driver because they mentioned a town would put a
     stranger's name in front of them. Both intent and place, or nothing. */
  const board = buildRideBoard([
    { name: "בלי תפקיד", ride_from: "חיפה", ride_role: null },
    { name: "בלי מקום",  ride_from: null,   ride_role: "offer" },
  ]);
  assert.equal(board.matches.length, 0);
  assert.equal(board.counts.seekers + board.counts.drivers, 0);
});

test("the introduction asks permission and carries no phone number", () => {
  /* Whether the two exchange numbers is theirs to decide. The message that
     hands one guest another guest's number without asking is the one thing
     this feature must never send. */
  const m = { area: "ירוחם",
              seeker: { name: "אורי חמו", phone: "0501111111" },
              driver: { name: "מתנאל",   phone: "0502222222" } };
  for (const side of ["seeker", "driver"] as const) {
    const text = introMessage(m, side);
    assert.match(text, /רוצים שנחבר ביניכם/);
    assert.ok(!text.includes("0501111111"), "a seeker's number must not travel");
    assert.ok(!text.includes("0502222222"), "a driver's number must not travel");
  }
});
