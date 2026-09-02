import test from "node:test";
import assert from "node:assert/strict";
import { planSeating, DEFAULT_CAPACITY, type PlanGuest } from "./seating-plan.ts";

/* Built from שחר's real list: 229 confirmed records, 427 people, four groups —
   משפחת ביטון, מוזמנים אורי, מוזמנים שחר, מוזמנים פורת — at 97% coverage, with
   households from one person to ten. */
const shachar = (): PlanGuest[] => {
  const out: PlanGuest[] = [];
  const groups = ["משפחת ביטון", "מוזמנים אורי", "מוזמנים שחר", "מוזמנים פורת"];
  let i = 0;
  for (const g of groups) {
    for (let k = 0; k < 55; k++) {
      i += 1;
      out.push({ id: `g${i}`, name: `אורח ${i}`, seats: (i % 4) + 1, group: g });
    }
  }
  /* The seven with no group, and משפחת ביטון at ten. */
  for (let k = 0; k < 7; k++) {
    i += 1;
    out.push({ id: `g${i}`, name: `ללא ${i}`, seats: 2, group: null });
  }
  out.push({ id: "biton", name: "משפחת ביטון", seats: 10, group: "משפחת ביטון" });
  return out;
};

const seatsOf = (gs: PlanGuest[]) => gs.reduce((s, g) => s + g.seats, 0);

test("every person is seated exactly once", () => {
  /* The failure that matters most: a guest who arrives and has no chair, or is
     written at two tables and takes someone else's. */
  const gs = shachar();
  const plan = planSeating(gs);
  const placed = plan.tables.flatMap(t => t.guestIds);
  assert.equal(new Set(placed).size, placed.length, "a record was seated twice");
  assert.equal(placed.length, gs.length, "a record was left out");
  assert.equal(plan.totals.people, seatsOf(gs));
});

test("no table is over capacity", () => {
  for (const cap of [8, 10, 12, 14]) {
    const plan = planSeating(shachar(), cap);
    for (const t of plan.tables) {
      assert.ok(t.seats <= cap, `${t.name} has ${t.seats} at a table of ${cap}`);
    }
  }
});

test("a household is never split", () => {
  /* משפחת ביטון is one record and ten people. Ten people at one table or the
     plan is wrong — a family split across the room is the complaint a couple
     actually makes. */
  const plan = planSeating(shachar(), 12);
  const table = plan.tables.find(t => t.guestIds.includes("biton"));
  assert.ok(table, "the ten-person household was dropped");
  assert.ok(table!.seats <= 12);
});

test("a household larger than a table is reported, not silently dropped", () => {
  const plan = planSeating([
    { id: "big", name: "משפחה גדולה", seats: 14, group: "משפחה" },
    { id: "a", name: "א", seats: 2, group: "משפחה" },
  ], 12);
  assert.equal(plan.oversized.length, 1);
  assert.equal(plan.oversized[0].id, "big");
  assert.ok(!plan.tables.flatMap(t => t.guestIds).includes("big"));
  /* And everyone else is still seated. */
  assert.ok(plan.tables.flatMap(t => t.guestIds).includes("a"));
});

test("groups are kept together where they fit", () => {
  const gs: PlanGuest[] = [
    { id: "a1", name: "א1", seats: 4, group: "משפחת א" },
    { id: "a2", name: "א2", seats: 4, group: "משפחת א" },
    { id: "b1", name: "ב1", seats: 4, group: "משפחת ב" },
    { id: "b2", name: "ב2", seats: 4, group: "משפחת ב" },
  ];
  const plan = planSeating(gs, 8);
  assert.equal(plan.tables.length, 2);
  for (const t of plan.tables) {
    assert.equal(new Set(t.guestIds.map(id => id[0])).size, 1, "two groups were mixed with room to spare");
  }
});

test("half-empty remainders are merged rather than left as their own tables", () => {
  /* Three groups of three people each, tables of twelve. Three tables at 25%
     is a room that looks empty; one table at 75% is a room that looks full. */
  const gs: PlanGuest[] = ["א", "ב", "ג"].map((g, i) =>
    ({ id: `x${i}`, name: g, seats: 3, group: `קבוצה ${g}` }));
  const plan = planSeating(gs, 12);
  assert.equal(plan.tables.length, 1);
  assert.equal(plan.tables[0].group, null, "a merged table belongs to no single group");
});

test("a wedding with no groups at all still gets a plan", () => {
  /* תהל ואביב carries no source_group on any record. */
  const gs: PlanGuest[] = Array.from({ length: 40 }, (_, i) =>
    ({ id: `t${i}`, name: `אורח ${i}`, seats: (i % 3) + 1, group: null }));
  const plan = planSeating(gs, 12);
  assert.equal(plan.totals.people, seatsOf(gs));
  assert.ok(plan.tables.every(t => t.seats <= 12));
  assert.ok(plan.tables.every(t => /^שולחן \d+$/.test(t.name)), "tables should be plainly numbered");
});

test("table names read like a person wrote them", () => {
  const one = planSeating([{ id: "a", name: "א", seats: 4, group: "משפחת ביטון" }], 12);
  assert.equal(one.tables[0].name, "משפחת ביטון", "a single table needs no number");

  const many = planSeating(
    Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, name: `א${i}`, seats: 6, group: "משפחת ביטון" })),
    12);
  assert.deepEqual(many.tables.map(t => t.name), ["משפחת ביטון 1", "משפחת ביטון 2", "משפחת ביטון 3"]);
});

test("children are carried onto the table they sit at", () => {
  const plan = planSeating([
    { id: "a", name: "שירה ואייל", seats: 3, group: "חברים", kids: 2 },
    { id: "b", name: "אחר", seats: 2, group: "חברים" },
  ], 12);
  assert.equal(plan.tables[0].kids, 2);
  assert.equal(plan.totals.kids, 2);
});

test("the plan is stable — the same list gives the same room twice", () => {
  /* A couple who presses the button twice and gets a different room stops
     trusting it. */
  const a = planSeating(shachar());
  const b = planSeating(shachar());
  assert.deepEqual(a.tables.map(t => [t.name, t.guestIds]), b.tables.map(t => [t.name, t.guestIds]));
});

test("an empty list is a plan with no tables, not a crash", () => {
  const plan = planSeating([]);
  assert.deepEqual(plan.tables, []);
  assert.equal(plan.totals.tables, 0);
  assert.equal(DEFAULT_CAPACITY, 12);
});
