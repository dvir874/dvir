import test from "node:test";
import assert from "node:assert/strict";
import { eventTimes } from "./event-times.ts";

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
