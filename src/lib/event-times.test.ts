import test from "node:test";
import assert from "node:assert/strict";
import { eventTimes, eventDay} from "./event-times.ts";

test("the times come from the event", () => {
  assert.equal(
    eventTimes({ reception_time: "17:30", chuppah_time: "18:15" }),
    "קבלת פנים 17:30 | חופה וקידושין 18:15",
  );
  assert.equal(
    eventTimes({ reception_time: "19:00", chuppah_time: "20:00" }),
    "קבלת פנים 19:00 | חופה וקידושין 20:00",
  );
});

test("a missing time is null, never a default", () => {
  /* The whole defect was a default. אורי ✧ שחר would have had Dvir's 19:00
     and 20:00 sent to 327 households under their own names. */
  assert.equal(eventTimes({ reception_time: "17:30", chuppah_time: null }), null);
  assert.equal(eventTimes({ reception_time: null, chuppah_time: "18:15" }), null);
  assert.equal(eventTimes({}), null);
  assert.equal(eventTimes(null), null);
  assert.equal(eventTimes({ reception_time: "  ", chuppah_time: "18:15" }), null);
});

/* ── eventDay ────────────────────────────────────────────────────────────── */

test("the date is local midnight, so every device renders the same day", () => {
  /* The bug: new Date("2026-09-08") is midnight UTC. Rendered with the DEVICE's
     timezone — which is what toLocaleDateString does with no timeZone option —
     anywhere west of UTC lands on the previous evening, and שחר's invitation
     printed "7 בספטמבר" to a guest whose phone was in New York.

     Israel is UTC+3 in September, so this is invisible from here. What can be
     checked from anywhere is the property that fixes it: the parts of the
     returned date match the string, in local time. */
  const d = eventDay("2026-09-08")!;
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 8);
  assert.equal(d.getDate(), 8);
  assert.equal(d.getHours(), 0, "must be local midnight, not a converted instant");

  /* And it is genuinely a different instant from the parse it replaces,
     wherever this runs — unless the machine happens to be on UTC. */
  const utcParsed = new Date("2026-09-08");
  if (utcParsed.getTimezoneOffset() !== 0) {
    assert.notEqual(d.getTime(), utcParsed.getTime());
  }

  /* Rendered the way the page renders it — no timeZone option — it reads as
     the 8th on whatever device this is. */
  assert.match(d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }), /^8\.9/);
});

test("the Google Calendar day is built from the same parts", () => {
  const d = eventDay("2026-09-08")!;
  const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  assert.equal(day, "20260908");
});

test("anything that is not a plain date returns null rather than Invalid Date", () => {
  for (const v of ["", null, undefined, "not a date", "08/09/2026"]) {
    assert.equal(eventDay(v as string), null, `should be null: ${JSON.stringify(v)}`);
  }
});

test("a timestamp keeps its date part", () => {
  /* Some rows carry a full ISO string. */
  assert.equal(eventDay("2026-09-08T00:00:00+03:00")!.getDate(), 8);
});
