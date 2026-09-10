import test from "node:test";
import assert from "node:assert/strict";
import { needsHuman, saysNotComing, HUMAN_REASON_TEXT } from "./needs-human.ts";

test("a guest asking for a person gets one", () => {
  /* נעם חדד asked this at 14:58 on 03/09 and was answered twice with
     "לא הצלחנו להבין את המספר". */
  for (const m of [
    "יש אפשרות לדבר עם נציג אנושי??",
    "אפשר לדבר עם מישהו?",
    "אני רוצה לדבר עם בן אדם",
    "יש שם מישהו?",
    "זה בוט?",
  ]) {
    const r = needsHuman(m);
    assert.equal(r.needed, true, m);
    assert.equal(r.reason, "asked_for_human", m);
  }
});

test("telling a guest twice that we did not understand ends the automation", () => {
  /* One is a parser missing a phrasing. Two is a guest told twice, by a
     machine, that their own words are wrong. */
  assert.equal(needsHuman("3 אולי", 1).needed, false);
  const r = needsHuman("3 אולי", 2);
  assert.equal(r.needed, true);
  assert.equal(r.reason, "twice_not_understood");
});

test("a guest who does not know who we are reaches a person", () => {
  for (const m of ["מי אתם בכלל", "לא ביקשתי כלום", "תפסיקו לשלוח לי", "סורי לא מזהה"]) {
    assert.equal(needsHuman(m).needed, true, m);
  }
});

test("an ordinary answer does not wake anybody", () => {
  for (const m of ["3", "מגיע", "תודה רבה 🤍", "מזל טוב!", "אנחנו 2 ועוד ילד", "איפה זה בדיוק?"]) {
    assert.equal(needsHuman(m).needed, false, m);
  }
});

test("every reason has words Dvir can read on his phone", () => {
  for (const k of ["asked_for_human", "twice_not_understood", "distress"] as const) {
    assert.ok(HUMAN_REASON_TEXT[k]?.length > 8, k);
  }
});

/* ── the refusal that was read as a number ──────────────────────────────── */

test("a refusal written in a guest's own words is a refusal", () => {
  /* The guard was `said === "לא מגיע"` — the button's exact label. נעם wrote
     "אני לא מגיע" and it went to the number parser. */
  for (const m of [
    "אני לא מגיע", "לא מגיע", "אנחנו לא מגיעים", "לא נגיע",
    "לא נוכל להגיע", "לא מגיעה", "לצערי לא נוכל",
  ]) {
    assert.equal(saysNotComing(m), true, m);
  }
});

test("an acceptance is never read as a refusal", () => {
  for (const m of ["מגיע", "אנחנו מגיעים", "בטח שנגיע", "3", "מגיעים 2", "כן"]) {
    assert.equal(saysNotComing(m), false, m);
  }
});

test("a complaint about something else is not a refusal", () => {
  /* "לא מגיע לי" is somebody who feels wronged, not somebody declining. */
  for (const m of ["לא מגיע לי יחס כזה", "לא מגיע לנו"]) {
    assert.equal(saysNotComing(m), false, m);
  }
});

test("a long message is left to a person rather than parsed as a refusal", () => {
  const essay = "היי, רציתי להגיד שאנחנו ממש שמחים בשבילכם אבל בדיוק באותו שבוע "
    + "אנחנו בחו״ל אז לא נוכל להגיע, נשמח להתראות אחרי";
  assert.equal(saysNotComing(essay), false);
});

test("the ordinary Hebrew way of saying it is a refusal", () => {
  /* ל is a prefix. The old guard excluded "לא מגיע ל" and therefore excluded
     "לא מגיע לחתונה" — the phrasing most guests actually use. They stayed
     confirmed and the caterer cooked for them. */
  for (const m of [
    "אני לא מגיע לחתונה", "לא מגיע לאירוע", "לא מגיע לצערי",
    "לא נגיע לחתונה", "לא מגיע לילדים שלי",
  ]) {
    assert.equal(saysNotComing(m), true, m);
  }
  /* And the complaint idiom is still not a refusal. */
  for (const m of ["לא מגיע לי יחס כזה", "זה לא מגיע לי", "לא מגיע לנו"]) {
    assert.equal(saysNotComing(m), false, m);
  }
});

/* ── הרבנית מרים דיין, 05/09 ───────────────────────────────────────────
 *
 * Every string here is quoted from wa_messages. She wrote four times that she
 * was not coming, because her mother had died and she is in her year of
 * mourning, and was answered three times with "לא הצלחנו להבין את המספר".
 *
 * Two separate failures, and either alone would have prevented it. */

test("משפט על פטירה אף פעם לא נענה על ידי מכונה", () => {
  const a = needsHuman("סליחה, בסוף לצערי לא אגיע, כי אנחנו בשנת אבל על אמא היקרה שלנו.");
  assert.equal(a.needed, true);
  assert.equal(a.reason, "grief");

  assert.equal(needsHuman("מרים דיין, אמא נפטרה בתחילת חודש אב, ולכן כשאישרתי את הגעתי לחתונה, היה זה לפני פטירתה של אימנו היקרה.").reason, "grief");
  assert.equal(needsHuman("לא מגיעה בכלל ולכן כתבתי לך את הסיפרה 0  כי אני בשנת אבל על אימי היקר").reason, "grief");
});

test("'אבל' לבדה היא מילת חיבור, לא אבל", () => {
  /* The single most common word this pattern could have swallowed. */
  for (const s of ["אבל אנחנו מגיעים!", "מגיעים אבל רק שנינו", "אבל מתי זה מתחיל?"])
    assert.notEqual(needsHuman(s).reason, "grief", s);
});

test("'לא אגיע' — הצורה הטבעית ביותר, ולא הייתה ברשימה", () => {
  for (const s of ["לא אגיע", "אני לא אגיע", "לצערי לא אגיע", "לא אבוא", "לא אוכל להגיע",
                   "סליחה, בסוף לצערי לא אגיע, כי אנחנו בשנת אבל על אמא היקרה שלנו."])
    assert.equal(saysNotComing(s), true, s);
});

test("המשפט שלה נכנס בגבול האורך — האורך אף פעם לא היה הבעיה", () => {
  /* 63 characters. The 80-character guard, which exists on purpose, would have
     let it through from the start. The only thing that failed her was that the
     list of verbs did not contain the one she used. */
  const hers = "סליחה, בסוף לצערי לא אגיע, כי אנחנו בשנת אבל על אמא היקרה שלנו.";
  assert.ok(hers.length <= 80, `${hers.length} תווים`);
  assert.equal(saysNotComing(hers), true);
});
