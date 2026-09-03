import test from "node:test";
import assert from "node:assert/strict";
import { readInvitation, missingFromInvitation, INVITATION_PROMPT } from "./invitation.ts";

const TODAY = new Date(2026, 8, 3);   // 03/09/2026

const good = {
  couple:    { value: "שלמה ואבישג", source: "שלמה גור ואבישג בן שוהם" },
  date:      { value: "2026-10-08", source: "יום חמישי, כ״ו בתשרי, 8.10.2026" },
  venue:     { value: "אולמי גאיה", source: "אולמי גאיה" },
  address:   { value: "הרצליה", source: "רח׳ הנדיב 12, הרצליה" },
  reception: { value: "19:00", source: "קבלת פנים 19:00" },
  chuppah:   { value: "20:00", source: "חופה וקידושין 20:00" },
};

test("a well-quoted invitation comes through whole", () => {
  const r = readInvitation(good, TODAY);
  assert.equal(r.couple.value, "שלמה ואבישג");
  assert.equal(r.date.value, "2026-10-08");
  assert.equal(r.reception.value, "19:00");
  assert.equal(r.chuppah.value, "20:00");
  assert.deepEqual(r.rejected, []);
  assert.deepEqual(missingFromInvitation(r), []);
});

test("a value with no quote is dropped, because that is what an invented one looks like", () => {
  /* The dangerous shape: perfectly formed and read from nothing. A model that
     fills in "19:00" because weddings start at seven produces exactly this. */
  const r = readInvitation({ ...good, chuppah: { value: "20:30", source: null } }, TODAY);
  assert.equal(r.chuppah.value, null);
  assert.ok(r.rejected.some(x => x.includes("בלי ציטוט")), r.rejected.join(" | "));
});

test("a quote the model could not turn into a field is still shown", () => {
  /* A Hebrew-only date is the common case. The line is handed back so a person
     can read what the model saw. */
  const r = readInvitation({
    ...good,
    date: { value: null, source: "יום שלישי, כ״ו באלול התשפ״ו" },
  }, TODAY);
  assert.equal(r.date.value, null);
  assert.ok(r.rejected.some(x => x.includes("כ״ו באלול")));
});

test("nothing is ever silently missing", () => {
  const r = readInvitation({ couple: good.couple }, TODAY);
  assert.deepEqual(missingFromInvitation(r).sort(),
    ["כתובת", "שם המקום", "שעת חופה", "שעת קבלת פנים", "תאריך"].sort());
});

test("an impossible hour is refused rather than rounded", () => {
  for (const bad of ["24:00", "7:99", "19", "19.00", "טז:00"]) {
    const r = readInvitation({ ...good, reception: { value: bad, source: "קבלת פנים" } }, TODAY);
    assert.equal(r.reception.value, null, `accepted ${bad}`);
  }
});

test("a date outside the window a wedding can be in is refused", () => {
  /* A model reading "2025" off a decorative motif produces a date the whole
     sending schedule is then built on. */
  for (const bad of ["2020-01-01", "2031-01-01", "2026-13-01", "2026-02-30"]) {
    const r = readInvitation({ ...good, date: { value: bad, source: "התאריך" } }, TODAY);
    assert.equal(r.date.value, null, `accepted ${bad}`);
  }
  assert.equal(readInvitation({ ...good, date: { value: "2026-09-04", source: "מחר" } }, TODAY).date.value, "2026-09-04");
});

test("a chuppah before the reception discards both, because either could be the wrong one", () => {
  const r = readInvitation({
    ...good,
    reception: { value: "20:00", source: "קבלת פנים 20:00" },
    chuppah:   { value: "19:00", source: "חופה 19:00" },
  }, TODAY);
  assert.equal(r.reception.value, null);
  assert.equal(r.chuppah.value, null);
  assert.ok(r.rejected.some(x => x.includes("לא הגיוניות")));
});

test("JSON wrapped in prose or a code fence is still read", () => {
  const wrapped = "בטח! הנה הפרטים:\n```json\n" + JSON.stringify(good) + "\n```\nמקווה שעזרתי";
  assert.equal(readInvitation(wrapped, TODAY).couple.value, "שלמה ואבישג");
});

test("garbage produces an empty result and says so, never a half-filled form", () => {
  for (const junk of ["לא הצלחתי לקרוא", "", null, undefined, 42, "{ניחוש"]) {
    const r = readInvitation(junk, TODAY);
    assert.equal(r.couple.value, null);
    assert.ok(r.rejected.length > 0, `silent on: ${JSON.stringify(junk)}`);
  }
});

test("the prompt states the rule the validator enforces", () => {
  /* If these two drift apart the model is being asked for one contract and
     judged by another. */
  assert.ok(INVITATION_PROMPT.includes("null"));
  assert.ok(INVITATION_PROMPT.includes("source"));
  assert.ok(INVITATION_PROMPT.includes("אל תשלים ואל תנחש"));
});
