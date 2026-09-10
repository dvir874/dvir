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
    daysAway: number;
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
- בלי אימוג'ים מלבד 🤍 במידת הצורך, ובלי סימני קריאה מיותרים.`;

/**
 * The answer, or null when there is no key, no question, or the call failed.
 *
 * Null is always safe: the caller falls back to the menu, which is what
 * happened before this file existed.
 */
export async function askAssistant(
  question: string, facts: AssistantFacts,
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
        messages: [{
          role: "user",
          content: `העובדות הנוכחיות של המערכת:\n${JSON.stringify(facts, null, 1)}\n\nהשאלה של דביר:\n${q}`,
        }],
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
