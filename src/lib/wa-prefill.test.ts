import test from "node:test";
import assert from "node:assert/strict";
import { waPrefill } from "./wa-prefill.ts";

/* What actually survives: WhatsApp Desktop mangles anything past two UTF-8
   bytes on its way in from a wa.me link. Hebrew is two, ✨ is three. */
const wide = (s: string) => [...s].filter(c => Buffer.byteLength(c, "utf8") > 2);

test("nothing that would arrive as U+FFFD is left in", () => {
  const real = `✨ *הזמנה רשמית* ✨

משפחה וחברים יקרים!

אתם מוזמנים לחגוג איתנו 🎊

לחצו על הקישור לפרטים מלאים ואישור הגעה:
👇
https://regalifnei.vercel.app/rsvp/abc

נשמח לראותכם! 🤍`;
  const out = waPrefill(real);
  assert.deepEqual(wide(out), [], `would break: ${wide(out).join(" ")}`);
});

test("the Hebrew, the bold and the link are untouched", () => {
  const out = waPrefill("✨ *הזמנה רשמית* ✨\n\nhttps://x.co/a?b=1&c=2");
  assert.match(out, /\*הזמנה רשמית\*/);
  assert.match(out, /https:\/\/x\.co\/a\?b=1&c=2/);
});

test("a line that was only an arrow disappears instead of going blank", () => {
  /* The invitation pointed at its link with a lone 👇. Left as an empty line
     it reads as a mistake in the message. */
  const out = waPrefill("לחצו כאן:\n👇\nhttps://x.co/a");
  assert.equal(out, "לחצו כאן:\nhttps://x.co/a");
});

test("paragraph breaks that were written on purpose survive", () => {
  const out = waPrefill("שורה\n\nשורה");
  assert.equal(out, "שורה\n\nשורה");
});

test("typography is folded, not dropped", () => {
  /* — and … and ──── are all past two bytes and would break too. This is not
     only an emoji problem. */
  assert.equal(waPrefill("א — ב"), "א - ב");
  assert.equal(waPrefill("רגע…"), "רגע...");
  assert.equal(waPrefill("────"), "----");
  assert.equal(waPrefill("“ציטוט”"), '"ציטוט"');
});

test("no trailing space where an emoji was removed", () => {
  assert.equal(waPrefill("נשמח לראותכם! 🤍"), "נשמח לראותכם!");
});

test("empty in, empty out", () => {
  for (const v of ["", "   ", "🤍", null, undefined]) {
    assert.equal(waPrefill(v as string), "");
  }
});

test("no leading space where a line's opening emoji was removed", () => {
  /* Dvir pasted the day-of draft on 22/09 and every line under the greeting
     began with a space, because the emoji that opened it was stripped and the
     gap stayed. Five of those in a row read as a message pasted wrong. */
  assert.equal(waPrefill("📍 גן האירועים ארץ"), "גן האירועים ארץ");
  assert.equal(waPrefill("🥂 קבלת פנים 17:45"), "קבלת פנים 17:45");
  assert.equal(
    waPrefill("💍 משפחה וחברים יקרים!\n\n🚗 ניווט: https://a.co/x"),
    "משפחה וחברים יקרים!\n\nניווט: https://a.co/x");
});

test("a line the author indented keeps its indent", () => {
  /* The gap is closed only when the strip created it — what the line STARTED
     with is the test, not what is left of it.
     An interior line, deliberately: a lone indented line loses its indent to
     the closing trim() no matter what happens here, so it would prove nothing. */
  assert.equal(
    waPrefill("כותרת\n  שורה מוזחת\n📍 מקום"),
    "כותרת\n שורה מוזחת\nמקום");
});
