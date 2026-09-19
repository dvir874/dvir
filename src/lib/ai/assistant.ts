/* The part of the console that answers what nobody wrote a screen for.
 *
 * Dvir, 09/09: "אני רוצה שהיא ממש תהיה העוזרת האישית שלי מהוואטסאפ בכל עניין
 * של רגע לפני."
 *
 * admin-ask.ts covers the six questions worth hard-coding — today, money, who
 * is waiting, who never got an invitation, and a named wedding. It answers
 * them exactly, from the database, and it should keep doing that: a number
 * that matters should never come from a guess.
 *
 * But "בכל עניין" is a bigger promise than six intents. "כמה אנשים בסך הכול
 * בכל החתונות?" "איזו חתונה הכי בסכנה?" "מי מהזוגות עוד לא שילם ומתחתן החודש?"
 * "כמה מנות ילדים יש לתהל?" Every one of those is answerable from facts the
 * system already holds, and none of them is a screen.
 *
 * So: the facts are gathered in code, and the sentence is written by a model.
 *
 * THE RULES THIS FILE IS BUILT AROUND
 *
 * 1. It reads. It never writes, never sends, never queues. Every action in
 *    this console — pausing, replying, marking paid, silencing — stays behind
 *    a tap. The assistant explains and points; the menu acts.
 *
 * 2. The answer goes to one number, Dvir's, and the caller passes it. There is
 *    no branch here that takes a recipient.
 *
 * 3. It is given structured facts, never raw guest text. A guest can write
 *    anything into this system, and a guest's words are not going to end up
 *    inside a prompt asking a model what to do. Names and counts and dates
 *    only.
 *
 * 4. What it is not given, it does not know. The instruction is to say so
 *    rather than to reason toward a plausible number, because a plausible
 *    number about a wedding is worse than "אין לי את זה".
 */

/** Facts, assembled by the caller. Everything here came out of a query. */
export interface AssistantFacts {
  today: string;
  blocked?: string | null;
  sentToday?: number;
  cap?: number;
  weddings: {
    couple: string;
    date: string;
    /** Negative when the wedding has already happened. */
    daysAway: number;
    over?: boolean;
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
    attendees: number;
    paused?: boolean;
    /* The one question a client actually asks. It was missing, and the
       assistant correctly said so — 'אין לי את זה במערכת' — to Dvir, who was
       standing in front of טל ולאל at the time. */
    nextReminder?: string;
    priceCharged?: number | null;
    paid?: boolean;
    /* What the caterer is being ordered against. The header of this file names
       "כמה מנות ילדים יש לתהל?" as a question it exists to answer, and the
       facts carried no meal at all — so it answered "אין לי את זה" to the one
       question a caterer telephones about. Only confirmed guests are counted:
       a meal is ordered for somebody who said yes. */
    meals?: { regular: number; vegetarian: number; vegan: number;
              mehadrin: number; kids: number; unknown: number };
    /* Seating, now that it is real. Couples seat in Excel and the app could
       not read it until the import; with a plan in the database, "כמה שולחנות
       יש לטל" and "מי עוד לא משובץ" are facts rather than guesses. */
    seating?: { tables: number; seatedRecords: number; unseatedConfirmed: number;
                numbersSent: boolean };
  }[];
  waiting?: number;
  optedOut?: number;
}

const SYSTEM = `את/ה העוזר/ת האישי/ת של דביר, שמנהל את "רגע לפני" — מערכת ישראלית לאישורי הגעה בוואטסאפ לחתונות.

דביר כותב לך מהפלאפון, בדרך כלל בין דברים אחרים. ענה/י בעברית, קצר, ישר, בלי הקדמות ובלי לחזור על השאלה. שורות קצרות שנוח לקרוא בוואטסאפ. מספרים מדויקים.

חוקים:
- ענה/י אך ורק מתוך העובדות שקיבלת. אם התשובה לא נמצאת שם — אמור/אמרי "אין לי את זה" והצע/י מה כן אפשר לראות. לעולם אל תשער/י מספר.
- אתה לא שולח הודעות ולא משנה כלום. אם דביר מבקש פעולה — לשלוח, לעצור, לסמן, למחוק — הפנה/י אותו לתפריט: "כתוב תפריט".
- אל תמציא/י שמות אורחים, שמות אולמות או תאריכים.
- חתונה עם over=true כבר התקיימה. אל תדבר/י עליה בלשון עתיד, אבל כן לכלול אותה בשאלות על כסף, תמונות או סיכומים.
- בלי אימוג'ים מלבד 🤍 במידת הצורך, ובלי סימני קריאה מיותרים.
- meals סופר רק מי שאישר הגעה, לפי מספר אנשים ולא לפי רשומות. unknown = אישרו ולא בחרו מנה.
- seating.seatedRecords הוא מספר ההזמנות שמשובצות לשולחן, לא מספר האנשים. numbersSent=false פירושו שהזוג עוד לא ביקש לשלוח לאורחים את מספר השולחן.
- ההודעות הקודמות של דביר בשיחה הזו מצורפות כדי שתבין/י המשך שיחה ("ומה עם תהל?"). ענה/י על ההודעה האחרונה בלבד.`;

/**
 * The answer, or null when there is no key, no question, or the call failed.
 *
 * Null is always safe: the caller falls back to the menu, which is what
 * happened before this file existed.
 */
export async function askAssistant(
  question: string, facts: AssistantFacts,
  /* What he asked just before this, oldest first.
   *
   * "ומה עם תהל?" is not a question on its own, and it is how a person writing
   * from a phone actually asks the second one. Without the turn before it the
   * model either guesses a subject or says it has nothing — and both read as a
   * tool that is not listening.
   *
   * HIS OWN MESSAGES ONLY, and deliberately. Our side of this thread carries
   * the alerts, and an alert quotes what a guest wrote ("מה שכתב: ..."). Rule
   * 3 of this file is that a guest's words never enter a prompt, so the replies
   * stay out and the questions come in. The facts are re-sent in full every
   * call, so nothing is lost by leaving our answers behind. */
  recent: readonly string[] = [],
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const q = String(question ?? "").trim();
  if (!q || q.length > 400) return null;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      /* Inside a webhook Meta retries when it is slow. Short and bounded. */
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        model: process.env.ANTHROPIC_ASSISTANT_MODEL ?? "claude-sonnet-5",
        max_tokens: 600,
        system: SYSTEM,
        /* The API is stateless, so the thread is rebuilt on every call. The
           facts go with the LAST message rather than the first: they change
           between turns, and an older copy sitting above a newer one is how a
           model answers with yesterday's number. */
        messages: [
          ...recent
            .map(t => String(t ?? "").trim().slice(0, 300))
            .filter(Boolean)
            .slice(-5)
            .map(text => ({ role: "user" as const, content: text })),
          {
            role: "user" as const,
            content: `העובדות הנוכחיות של המערכת:\n${JSON.stringify(facts, null, 1)}\n\nהשאלה של דביר:\n${q}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null) as
      { content?: { type?: string; text?: string }[] } | null;
    const text = (json?.content ?? [])
      .filter(c => c?.type === "text").map(c => c?.text ?? "").join("").trim();
    return text || null;
  } catch {
    return null;
  }
}
