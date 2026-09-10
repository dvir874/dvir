import test from "node:test";
import assert from "node:assert/strict";
import { shabbatBlock, eveningBeforeBlocked } from "./shabbat.ts";

/* Times are given as UTC and read back in Asia/Jerusalem, which is what the
   sender actually runs against. August is UTC+3. */
const il = (iso: string) => new Date(iso);

test("the three runs that land inside Shabbat are all blocked", () => {
  /* Friday 19:30 Israel — candle-lighting in August is around 19:05 */
  assert.equal(shabbatBlock(il("2026-08-14T16:30:00Z")).blocked, true);
  /* Saturday 11:15 Israel */
  assert.equal(shabbatBlock(il("2026-08-15T08:15:00Z")).blocked, true);
  /* Saturday 19:30 Israel — havdalah is around 20:10. The least obvious one. */
  assert.equal(shabbatBlock(il("2026-08-15T16:30:00Z")).blocked, true);
});

test("Friday morning still sends", () => {
  /* 11:15 Israel on a Friday is hours before any candle-lighting, all year. */
  assert.equal(shabbatBlock(il("2026-08-14T08:15:00Z")).blocked, false);
});

test("the week resumes on Sunday", () => {
  assert.equal(shabbatBlock(il("2026-08-16T08:15:00Z")).blocked, false);
  assert.equal(shabbatBlock(il("2026-08-16T16:30:00Z")).blocked, false);
});

test("ordinary weekdays are untouched", () => {
  for (const d of ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20"]) {
    assert.equal(shabbatBlock(il(`${d}T08:15:00Z`)).blocked, false, d);
    assert.equal(shabbatBlock(il(`${d}T16:30:00Z`)).blocked, false, d);
  }
});

test("the reason distinguishes the eve from the day", () => {
  assert.equal(shabbatBlock(il("2026-08-14T16:30:00Z")).reason, "shabbat_eve");
  assert.equal(shabbatBlock(il("2026-08-15T08:15:00Z")).reason, "shabbat");
});

test("winter is covered by the same rule", () => {
  /* Israel is UTC+2 in January. Shabbat comes in around 16:20 and goes out
     around 17:25 — both inside the Friday-midday-to-Sunday window. */
  assert.equal(shabbatBlock(il("2027-01-15T15:00:00Z")).blocked, true);
  assert.equal(shabbatBlock(il("2027-01-16T17:30:00Z")).blocked, true);
});

test("מוצ״ש opens at 21:00 — the run Dvir asked for is not eaten by the guard", () => {
  /* 15/08/2026 is a Saturday. Shabbat goes out around 20:10 that night. */
  assert.equal(shabbatBlock(new Date("2026-08-15T17:30:00Z")).blocked, true,  "20:30 — still blocked");
  assert.equal(shabbatBlock(new Date("2026-08-15T18:15:00Z")).blocked, false, "21:15 — the מוצ״ש cron may send");
  assert.equal(shabbatBlock(new Date("2026-08-15T20:00:00Z")).blocked, false, "23:00 — open");
});

test("Friday evening and Saturday morning stay shut", () => {
  /* The whole reason the guard exists. Widening מוצ״ש must not widen these. */
  assert.equal(shabbatBlock(new Date("2026-08-14T16:30:00Z")).blocked, true, "Friday 19:30");
  assert.equal(shabbatBlock(new Date("2026-08-15T08:15:00Z")).blocked, true, "Saturday 11:15");
});

test("in winter 21:00 is late, not early — never inside Shabbat", () => {
  /* Shabbat leaves around 17:15 in January. The guard is over-cautious here by
     design; what must never happen is the reverse. */
  assert.equal(shabbatBlock(new Date("2026-01-17T15:00:00Z")).blocked, true,  "17:00 IST — still Shabbat");
  assert.equal(shabbatBlock(new Date("2026-01-17T19:15:00Z")).blocked, false, "21:15 IST — open");
});

/* ── The חגים ────────────────────────────────────────────────────────────
 *
 * September 2026 is Tishrei 5787, and three of its dates were about to be sent
 * on. The last test in this block is the one that matters most: a guard that
 * swallows the wedding itself is worse than no guard. */

test("ראש השנה — שני הימים חסומים, גם זה שאינו שבת", () => {
  /* 12/09 is Saturday and was already covered; 13/09 is a SUNDAY, and on that
     morning איילת's pause expired and 253 first-contact invitations were due. */
  assert.equal(shabbatBlock(il("2026-09-13T06:15:00Z")).blocked, true, "13/09 08:15 IL");
  assert.equal(shabbatBlock(il("2026-09-13T06:15:00Z")).reason, "yom_tov");
  assert.equal(shabbatBlock(il("2026-09-12T08:15:00Z")).blocked, true, "12/09");
});

test("יום כיפור — היום שבו הייתה יוצאת 'מחר מתחתנים' ל-361 אורחים", () => {
  const v = shabbatBlock(il("2026-09-21T06:15:00Z")); // Monday 09:15 IL
  assert.equal(v.blocked, true);
  assert.equal(v.reason, "yom_tov");
  /* And the evening run of the same day, which is when the message goes. */
  assert.equal(shabbatBlock(il("2026-09-21T16:30:00Z")).blocked, true);
});

test("ערב חג חסום מהצהריים, כמו ערב שבת", () => {
  /* 20/09 is ערב יום כיפור, a Sunday. Morning sends, afternoon does not. */
  assert.equal(shabbatBlock(il("2026-09-20T06:15:00Z")).blocked, false, "בוקר ערב כיפור");
  assert.equal(shabbatBlock(il("2026-09-20T16:30:00Z")).blocked, true, "ערב כיפור אחה״צ");
  assert.equal(shabbatBlock(il("2026-09-20T16:30:00Z")).reason, "yom_tov_eve");
});

test("יום החתונה עצמו לא נבלע — 22/09 שולח כרגיל", () => {
  /* Both weddings are on 22/09, the day after יום כיפור. A guard that blocked
     it would replace "a message on Yom Kippur" with "no message at all", which
     is the failure this whole file exists to avoid. */
  assert.equal(shabbatBlock(il("2026-09-22T06:15:00Z")).blocked, false);
  assert.equal(shabbatBlock(il("2026-09-22T16:30:00Z")).blocked, false);
});

test("חול המועד אינו חג — סוכות ממשיך לשלוח", () => {
  /* 28/09–01/10 are chol hamoed. Weddings happen then and messages are
     ordinary; blocking a whole week would cost more than it protects. */
  for (const d of ["2026-09-28", "2026-09-29", "2026-09-30"]) {
    assert.equal(shabbatBlock(il(`${d}T06:15:00Z`)).blocked, false, d);
  }
});

test("שנה שאינה בטבלה נפתחת ולא נסגרת", () => {
  /* The list ends after 5790. When it runs out the guard must send, not go
     quiet — a table nobody renewed should cost a courtesy, never a wedding. */
  assert.equal(shabbatBlock(il("2031-09-17T06:15:00Z")).blocked, false);
});

/* ── The fallback ──────────────────────────────────────────────────────── */

test("ערב שחסום מדווח ככזה, לפי תאריך החתונה", () => {
  /* 22/09 — the eve is יום כיפור */
  assert.equal(eveningBeforeBlocked("2026-09-22").blocked, true);
  assert.equal(eveningBeforeBlocked("2026-09-22").reason, "yom_tov");
  /* A Sunday wedding — the eve is Saturday, and the 21:30 run is after
     havdalah, so it is NOT blocked. This asserted the opposite while
     EVE_SEND_HOUR was 19: the guard reported a failure that never happened,
     and the wedding-morning fallback stayed open for every Sunday wedding for
     ever, overriding the couple's own "מחר מתחתנים" choice. */
  assert.equal(eveningBeforeBlocked("2026-08-16").blocked, false);
  /* But an eve that really is a חג still reports blocked — see below. */
  assert.equal(eveningBeforeBlocked("2026-09-22").blocked, true);
  /* An ordinary Tuesday wedding — the eve is a Monday and sends normally. */
  assert.equal(eveningBeforeBlocked("2026-08-18").blocked, false);
  /* Garbage in the column is not a reason to change behaviour. */
  assert.equal(eveningBeforeBlocked("").blocked, false);
});

test("חג חוסם את כל היום, גם אחרי צאת החג", () => {
  /* Shabbat opens at 21:00 because Dvir asked for מוצ״ש — the best sending
     hour of the week. A חג has no such case, and the symmetry had a price:
     the 21:30 cron on 21/09 is מוצאי יום כיפור, and it would have carried
     "מחר מתחתנים" to 361 confirmed guests while people were breaking the fast. */
  assert.equal(shabbatBlock(il("2026-09-21T18:30:00Z")).blocked, true, "21:30 IL ביום כיפור");
  assert.equal(shabbatBlock(il("2026-09-21T20:30:00Z")).blocked, true, "23:30 IL ביום כיפור");
  /* And מוצ״ש is still open, which is the whole reason the two differ. */
  assert.equal(shabbatBlock(il("2026-08-15T18:30:00Z")).blocked, false, "21:30 IL במוצ״ש");
});

test("ערב חתונה שנופל בחג מדווח חסום, וערב שבת של חתונת ראשון לא", () => {
  /* The question is "could the eve message have gone out AT ALL", so the hour
     asked about is the last one that can carry it — 21:00, since real runs
     land at 21:30 and 22:30 Israel time. */
  assert.equal(eveningBeforeBlocked("2026-09-22").blocked, true, "הערב הוא יום כיפור");
  assert.equal(eveningBeforeBlocked("2026-09-22").reason, "yom_tov");
  assert.equal(eveningBeforeBlocked("2026-08-16").blocked, false, "ערב שבת של חתונת ראשון — 21:30 שולח");
});
