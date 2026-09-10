/* Understanding what Dvir asked, in his own words.
 *
 * 09/09: "אני חושב שעדיין אין מספיק הדדיות בינינו" — about the thread between
 * his phone and the business number.
 *
 * He is right, and the menu did not fix it. A menu is a kiosk: he types a
 * sentence and is handed a list. The console has always been able to answer
 * "כמה אישרו לשלמה" — the numbers are two queries away — and what it actually
 * did with those words was, until this morning, send them to a stranger, and
 * since this morning, show him a menu. Neither is a conversation.
 *
 * So free text becomes a QUESTION rather than an address. That is the same
 * inversion the menu made, carried one step further: the default reading of
 * anything Dvir types is now "he is talking to me", and a guest can only be
 * reached by tapping a name. There is no phrasing of "כמה אישרו" that can
 * reach anybody, because reaching somebody is not what typing does any more.
 *
 * Deliberately not a language model. Every answer here already exists as a
 * screen; this file only decides which one. A wrong guess costs him one screen
 * he did not want and a tap to go back — and it never sends anything.
 *
 * Import-free, so the grammar can be tested without a database.
 */

export type AskIntent =
  | { kind: "today" }
  | { kind: "money" }
  | { kind: "waiting" }
  | { kind: "missing"; needle?: string }
  | { kind: "opened"; needle?: string }
  | { kind: "stuck"; needle?: string }
  | { kind: "nophone"; needle?: string }
  /** A named wedding — the console resolves the name with matchEvent. */
  | { kind: "wedding"; needle: string }
  | { kind: "weddings" };

/* The words a question is made of, which are never part of a wedding's name.
   Stripped before the remainder is offered to matchEvent, because "כמה אישרו
   לשלמה" contains one name and four words of grammar. */
const FILLER = new Set([
  "מה", "מי", "כמה", "איך", "איפה", "מתי", "האם", "יש", "אין",
  "עם", "של", "את", "לי", "לך", "אצל", "על", "עוד", "כבר", "רק",
  "תגיד", "תראה", "תבדוק", "תן", "בבקשה", "נו", "אז", "וגם",
  "מצב", "סטטוס", "המצב", "עומד", "עומדת", "נשאר", "נשארו",
  "אישרו", "אישר", "מגיעים", "מגיע", "ממתינים", "ממתין", "ענו", "ענה",
  "אורחים", "אורח", "חתונה", "החתונה", "חתונת", "אירוע", "האירוע",
  "היום", "מחר", "אתמול", "השבוע",
  "קיבל", "קיבלו", "הזמנה", "הזמנות", "נשלח", "נשלחו", "שלחנו", "לא", "כן",
  "פתח", "פתחו", "ראו", "ראה", "ענו", "ענה", "אישרו", "החליטו", "עדיין",
  "נכנס", "נכנסו", "אישר", "השיבו", "התלבט", "צריך", "ידנית", "איזה", "אילו",
  "אמרו", "אמר", "תקוע", "תקועים", "מספר", "טלפון", "להם", "אנשים", "מוזמנים",
  "מתי", "תזכורת", "תזכורות", "נשלחת", "נשלחות", "יוצאת", "יוצאות", "הבאה", "שואלים",
  "חתונה", "חתונת", "שואל", "שואלת", "עוד",
]);

/* Things a person says to a machine, which are not questions and not names.
   admin-command already refuses to forward these to a guest; here they must
   also not be mistaken for a wedding called "תודה". */
const COURTESY = /^(תודה|תודה רבה|אוקי|אוקיי|סבבה|הבנתי|קיבלתי|יופי|מעולה|טוב|בסדר|בבקשה|כן|לא|👍|🙏|🤍)$/;

/* Hebrew glues its prepositions onto the noun: "לשלמה", "בתהל", "משחר".
 *
 * Stripping the first letter unconditionally is destructive — it turns "שלמה"
 * into "למה" — so it is NOT applied while the sentence is being read. It is
 * offered to the caller as a second attempt: match the words as they were
 * written, and only if no wedding is found, try again without the prefix.
 * matchEvent decides, because matchEvent is the one holding the names. */
export function stripPrefixes(needle: string): string {
  return needle.split(/\s+/).map(w => w.replace(/^[ולבכמ]/, "")).filter(w => w.length > 1).join(" ");
}

const TODAY   = /(מה יוצא|מה נשלח|מה יצא|כמה נשלחו|מה קורה היום|מה יש היום|מה התוכנית|היום יוצא|כמה שלחנו)/;
const MONEY   = /(כסף|שילם|שילמו|שולם|לא שולם|חוב|חובות|גבייה|לגבות|תשלום|תשלומים|כמה פתוח|כמה נכנס|הכנסות)/;
const WAITING = /(מחכה לי|מחכים לי|מי מחכה|צריך אותי|צריכים אותי|טיפול ידני|מה דחוף)/;
const MISSING = /(לא קיבל|לא קיבלו|לא הגיע להם|חסרים|לא נשלח להם|מי לא קיבל)/;
/* Checked BEFORE missing, because "פתחו ולא ענו" contains "לא ענו" and not
   "לא קיבלו" — but "מי ראה את ההזמנה ולא קיבל החלטה" contains both. The
   opened list is the more specific question, so it wins. */
/* Tested before STANDING, which matches on the bare word "כמה". */
const STUCK = /(לא אמרו כמה|לא אמר כמה|לא יודעים כמה|תקוע|תקועים|באמצע שיחה|בלי מספר אנשים|כמה הם מגיעים)/;
const NOPHONE = /(אין מספר|בלי מספר טלפון|חסר מספר|אין להם מספר|למי אין|בלי טלפון)/;
/* "מהחתונה של טל ולאל שואלים מתי נשלחת עוד תזכורת" — 10/09. Checked before
   STANDING so that "מתי" wins over the bare "כמה" that a longer sentence
   often also contains. */
const WHEN_NEXT = /(מתי.*(תזכורת|נשלח|יוצא|שולח)|תזכורת הבאה|התזכורת הבאה|מתי הבאה|מתי עוד|השליחה הבאה|מתי יוצאות)/;
const OPENED = /(פתח|פתחו|ראו|ראה|נכנס|נכנסו|לא ענו|לא אישרו|לא השיבו|התלבט)/;
/* A question about where a wedding stands. Broad on purpose — nothing reaches
   this file until every command and every menu id has already failed. */
const STANDING = /(כמה|מצב|סטטוס|מה עם|איך הולך|כמה אישרו|כמה מגיעים|כמה ממתינים|כמה ענו)/;

/**
 * What he is asking about, or null when this is not a question we can answer.
 *
 * Null is a real answer: it means the menu, which is a fine thing to be shown
 * and a terrible thing to be shown instead of the numbers you asked for.
 */
export function askIntent(said: string): AskIntent | null {
  const t = String(said ?? "").trim();
  if (!t || t.length > 200) return null;
  if (COURTESY.test(t)) return null;

  if (TODAY.test(t))   return { kind: "today" };
  if (MONEY.test(t))   return { kind: "money" };
  if (WAITING.test(t)) return { kind: "waiting" };

  /* The name, if he named one: everything that is not grammar. */
  const rest = t
    .split(/[\s,.?!״"'־-]+/)
    /* Also without the letters Hebrew glues onto the front of a word. "ולא",
       "וצריך", "התזכורת" and "מהחתונה" are all grammar wearing a disguise, and
       leaving one in the needle is enough to lose the wedding he named —
       matchEvent requires every remaining word to hit.
    
       Safe because FILLER is a fixed allowlist: a name is dropped only if the
       stripped form is itself a filler word, and no name in this business
       reduces to one. */
    .filter(w => w.length > 1
      && !FILLER.has(w)
      && !FILLER.has(w.replace(/^[והבלמכש]/, ""))
      && !FILLER.has(w.replace(/^[ומ]?ה/, "")))
    .join(" ")
    .trim();

  if (WHEN_NEXT.test(t)) return rest ? { kind: "wedding", needle: rest } : { kind: "weddings" };
  if (NOPHONE.test(t)) return rest ? { kind: "nophone", needle: rest } : { kind: "nophone" };
  if (STUCK.test(t)) return rest ? { kind: "stuck", needle: rest } : { kind: "stuck" };
  if (OPENED.test(t)) return rest ? { kind: "opened", needle: rest } : { kind: "opened" };
  if (MISSING.test(t)) return rest ? { kind: "missing", needle: rest } : { kind: "missing" };
  if (STANDING.test(t)) return rest ? { kind: "wedding", needle: rest } : { kind: "weddings" };

  /* A bare name with no question around it — "שלמה", "תהל ואביב" — is him
     asking about that wedding. Only when something is left after the grammar
     is stripped, so "בבקשה" and "תודה" are not weddings. */
  if (rest && rest.length >= 2 && rest.split(" ").length <= 4 && t.split(/\s+/).length <= 4)
    return { kind: "wedding", needle: rest };

  return null;
}
