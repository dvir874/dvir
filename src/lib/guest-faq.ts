/* Answering the questions a guest actually asks.
 *
 * The conversation handler understands one thing well — "are you coming, and
 * how many" — and everything else falls to "לא הצלחנו להבין". Twice in a row
 * and needs-human stops the automation and puts the guest in Dvir's pocket.
 * That escape hatch exists because of נעם חדד, who said he was not coming and
 * was answered with a complaint about arithmetic.
 *
 * But look at what guests are actually asking when that happens. "מתי זה
 * מתחיל?" "איפה זה?" "איך מגיעים?" "יש חניה?" "מה ללבוש?" "מי מתחתן בכלל?"
 * Every one of those answers is already sitting in the events row that the
 * invitation was built from. The system knows, and says it does not
 * understand.
 *
 * So this reads the question and hands back the fact. Not a chatbot and not a
 * model — a list of topics, each with one source of truth in the database
 * and one sentence. When it has nothing to say it says nothing, and the guest
 * takes the path they take today, to a person.
 *
 * WHERE IT RUNS. Last, after every other parse. A guest answering "2" is a
 * headcount and must never be read as a question, and one writing "אני לא
 * מגיע" is a decline; both are decided long before this file is reached. That
 * ordering is the whole safety argument, and it is why the patterns below can
 * afford to be generous.
 *
 * WHAT IT COSTS. Nothing. It only ever replies inside the 24-hour window the
 * guest opened by writing to us, so there is no template, no approval, and no
 * quota — the same reason wa-interactive exists.
 *
 * Import-free, and tested against the phrasings rather than the topics: a
 * question that finds the wrong fact is worse than one that finds none.
 */

export type FaqTopic =
  | "when" | "where" | "how_to_get" | "dress" | "parking"
  | "rides" | "couple" | "gift" | "kids";

/** Everything this file may say, drawn from the event the guest was invited to. */
export interface FaqFacts {
  couple?: string | null;
  /** Already written for a person: "יום שלישי, 22 בספטמבר 2026". */
  dateText?: string | null;
  reception?: string | null;
  chuppah?: string | null;
  /** venue_name and address, joined — see venueLine. */
  venue?: string | null;
  wazeUrl?: string | null;
  dressCode?: string | null;
  parking?: string | null;
  ridesUrl?: string | null;
  giftUrl?: string | null;
  /* Bit is a phone number, not a link, and it is the way most Israeli
     guests actually send money. */
  bitPhone?: string | null;
}

/* Each topic is a question a person asks out loud. Deliberately generous,
   because nothing reaches this file until every other reading has failed —
   and deliberately anchored on the interrogative, so a sentence that merely
   contains "שעה" is not treated as a question about the hour. */
const PATTERNS: [FaqTopic, RegExp][] = [
  ["how_to_get", /(איך מגיעים|איך להגיע|איך אני מגיע|ניווט|וייז|waze|לנווט)/i],
  ["parking",    /(חניה|חנייה|לחנות|איפה חונים|parking)/i],
  ["dress",      /(מה ללבוש|קוד לבוש|דרס ?קוד|dress ?code|לבוש|מה לובשים)/i],
  ["rides",      /(הסעה|הסעות|טרמפ|טרמפים|shuttle|מסיעים)/i],
  ["gift",       /(מתנה|מתנות|ביט|צ'ק|מעטפה|להעביר כסף|העברה בנקאית)/i],
  ["kids",       /(ילדים|ילד שלי|תינוק|עגלה|בייביסיטר|אפשר להביא את הילד)/i],
  ["couple",     /(מי מתחתן|של מי החתונה|מי המזמין|מי הזמין|חתונה של מי|מי זה)/i],
  ["where",      /(איפה|היכן|כתובת|מיקום|באיזה אולם|איזה אולם|מה המקום|איפה זה)/i],
  ["when",       /(מתי|באיזו שעה|באיזה שעה|מה השעה|שעה מתחיל|מתי מתחילים|מתי זה|באיזו שעה זה)/i],
];

/** Which of these, if any, the guest asked about. */
export function faqTopic(said: string): FaqTopic | null {
  const t = String(said ?? "").trim();
  /* Long enough to be a question, short enough not to be a story. */
  if (t.length < 2 || t.length > 300) return null;
  for (const [topic, re] of PATTERNS) if (re.test(t)) return topic;
  return null;
}

function timeLine(f: FaqFacts): string | null {
  const bits = [
    f.reception?.trim() ? `קבלת פנים ${f.reception.trim()}` : null,
    f.chuppah?.trim() ? `חופה ${f.chuppah.trim()}` : null,
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : null;
}

/**
 * The answer, or null when we do not actually know.
 *
 * Null matters as much as the sentence. A guest who asks about parking and is
 * told "אין לי מידע" has been answered by a machine that could not help; one
 * who is not answered at all reaches Dvir, who can. Never invent, never
 * apologise on the couple's behalf.
 */
export function faqAnswer(topic: FaqTopic, f: FaqFacts): string | null {
  switch (topic) {
    case "when": {
      const when = [f.dateText?.trim(), timeLine(f)].filter(Boolean);
      if (!when.length) return null;
      return `${when.join("\n")} 🤍`;
    }

    case "where": {
      if (!f.venue?.trim()) return null;
      return f.wazeUrl
        ? `${f.venue.trim()}\n\nניווט: ${f.wazeUrl}`
        : f.venue.trim();
    }

    case "how_to_get": {
      if (!f.wazeUrl) return f.venue?.trim() ? f.venue.trim() : null;
      return `${f.venue?.trim() ? `${f.venue.trim()}\n\n` : ""}ניווט בוויז: ${f.wazeUrl}`;
    }

    case "dress":
      return f.dressCode?.trim() ? `קוד הלבוש: ${f.dressCode.trim()}` : null;

    case "parking":
      return f.parking?.trim() ? f.parking.trim() : null;

    case "rides":
      return f.ridesUrl
        ? `יש לוח טרמפים לאירוע 🚗\n${f.ridesUrl}\n\nאפשר גם פשוט לכתוב לי מאיפה אתם ואם יש לכם מקום ברכב.`
        /* No board yet, but the conversation itself is one: detectRideIntent
           reads "אני נוסע מחדרה ויש לי מקום" out of ordinary words. */
        : `אפשר לכתוב לי מאיפה אתם ואם אתם מחפשים טרמפ או שיש לכם מקום ברכב, ואחבר ביניכם 🚗`;

    case "gift": {
      const ways = [
        f.giftUrl?.trim() ? f.giftUrl.trim() : null,
        f.bitPhone?.trim() ? `ביט: ${f.bitPhone.trim()}` : null,
      ].filter(Boolean);
      return ways.length ? `אפשר להעביר מתנה כאן:\n${ways.join("\n")}` : null;
    }

    case "couple":
      return f.couple?.trim() ? `החתונה של ${f.couple.trim()} 🤍` : null;

    case "kids":
      /* Never answered from data — whether children are invited is the
         couple's decision and it is not a column. Handing this to a person is
         the correct outcome, and saying so is better than silence. */
      return null;
  }
}

/** The whole thing: what they asked, and what we can say about it. */
export function answerQuestion(said: string, f: FaqFacts): string | null {
  const topic = faqTopic(said);
  return topic ? faqAnswer(topic, f) : null;
}
