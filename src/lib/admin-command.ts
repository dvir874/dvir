/* Running the business from the phone, because that is where Dvir now is.
 *
 * 03/09: "אני עכשיו מתחיל עבודה חדשה... רוב היום אני לא במחשב אבל כן זמין
 * בפלאפון... המטרה העיקרית שלי שכל האוטומציה תהיה דרך הפלאפון שלי."
 *
 * Half of that already worked: every alert this system produces arrives on his
 * WhatsApp. What was missing is the other direction. A guest asks for a person
 * at 14:58, the alert reaches his pocket in seconds, and answering it meant
 * finding a computer.
 *
 * So the business number listens. A message from the admin's own phone is not
 * a guest reply — it is an instruction, and this file is the whole grammar.
 *
 * WHAT IS DELIBERATELY NOT HERE. No delete, no import, no send-to-everyone.
 * The rule is that a mistyped word must never cost anything that cannot be
 * undone in one more message: pausing is reversible, replying to one guest is
 * one guest. Anything that spends the day's quota or touches the guest list
 * stays behind a screen, where it can be read twice before it is done.
 *
 * Import-free, like wa-decide.ts. This decides what happens when the owner of
 * the business types something into his phone; it should be testable without
 * one.
 */

export type AdminCommand =
  | { kind: "status" }                                   /* how is everything */
  | { kind: "work" }                                     /* who needs me */
  | { kind: "missing"; event?: string }                   /* who never got an invitation */
  | { kind: "pause"; event: string }
  | { kind: "resume"; event: string }
  | { kind: "reply"; phone: string; text: string }        /* to a named number */
  | { kind: "reply_last"; text: string }                  /* to whoever we last flagged */
  | { kind: "help" }
  | { kind: "unknown" };

/* Israeli mobile or an E.164 number at the head of the message. Anchored: a
   phone in the MIDDLE of a sentence is part of what he is saying to a guest,
   not an address. */
const LEADING_PHONE = /^\+?(972\d{9}|0\d{8,9})[\s,:־-]+([\s\S]+)$/;

const STATUS = /^(סטטוס|מצב|status|מה קורה|מה המצב)\??$/i;
const WORK   = /^(מחכה לי|מי צריך אותי|משימות|טיפול|work)\??$/i;
/* The list he can act on from the phone — every guest with no invitation,
   each with a tap-to-send link. */
const MISSING = /^(לא קיבלו|מי לא קיבל|לא קיבל|חסרים|missing)\s*(.{0,40})$/i;
const HELP   = /^(עזרה|פקודות|\?|help)$/i;
const PAUSE  = /^(עצור|השהה|stop|pause)\s+(.{2,40})$/i;
const RESUME = /^(המשך|תמשיך|חדש|resume|start)\s+(.{2,40})$/i;

/**
 * What the admin just asked for.
 *
 * `hasTarget` is whether a guest is currently pointed at — the person the last
 * alert was about. Without one, free text is not a reply to anybody and must
 * not be guessed at: an unaddressed sentence becoming a message to a stranger
 * is the one failure this whole feature could produce.
 */
/* A sentence that BEGINS like a command but did not parse as one.
 *
 * The fallthrough sends anything unrecognised to the guest we last raised, and
 * that is right for "היי נעם, מה קרה?" and catastrophic for "סטטוס שחר",
 * "עצור", or "מה קורה עם שחר" — a mistyped instruction arriving at a stranger
 * as though Dvir had written it to them.
 *
 * Matched on the opening PHRASE rather than a word list, because "מה קורה עם
 * שחר" opens with "מה", which is also how half of an ordinary sentence starts.
 * When one of these does not parse, the answer is the help text. */
const NEAR_COMMAND =
  /^(סטטוס|מצב|status|מחכה לי|מי צריך|משימות|לא קיבלו|מי לא קיבל|חסרים|עצור|השהה|stop|pause|המשך|תמשיך|resume|start|עזרה|פקודות|help|מה קורה|מה המצב)(?=\s|$)/i;
/* (?=\s|$) and not \b — JavaScript's \b is defined over ASCII word
   characters, so a Hebrew letter is not a word character and "סטטוס " never
   produced a boundary at all. The guard silently matched nothing, which is the
   worst possible outcome for a guard. */

export function parseAdminCommand(
  said: string, hasTarget: boolean,
  /* Media carries no text this file can read — see handleAdminMessage. */
  kind: "text" | "media" = "text",
): AdminCommand {
  const t = String(said ?? "").trim();
  if (!t) return { kind: "unknown" };

  if (HELP.test(t)) return { kind: "help" };
  if (STATUS.test(t)) return { kind: "status" };
  if (WORK.test(t)) return { kind: "work" };
  const ms = MISSING.exec(t);
  if (ms) return { kind: "missing", event: ms[2].trim() || undefined };

  const p = PAUSE.exec(t);
  if (p) return { kind: "pause", event: p[2].trim() };
  const r = RESUME.exec(t);
  if (r) return { kind: "resume", event: r[2].trim() };

  const ph = LEADING_PHONE.exec(t);
  if (ph) {
    const text = ph[2].trim();
    return text ? { kind: "reply", phone: ph[1], text } : { kind: "unknown" };
  }

  /* A photograph, a voice note, a contact card: the webhook renders these as
     "[image]" and this file would have forwarded that literal string to a
     guest, with "נשלח בהצלחה" back to Dvir. Enforced on the argument rather
     than by matching "[...]", because the next media type added upstream would
     silently slip past a pattern. */
  if (kind === "media") return { kind: "unknown" };

  /* Something that opens like an instruction is an instruction he got wrong,
     never a message meant for a guest. */
  if (NEAR_COMMAND.test(t)) return { kind: "unknown" };

  /* Anything else is what he wants said to the guest we last raised. Only
     when there IS one — see above. */
  if (hasTarget) return { kind: "reply_last", text: t };
  return { kind: "unknown" };
}

/** The reply to `עזרה`, and to anything that was not understood. */
export const ADMIN_HELP =
  "פקודות: סטטוס · מחכה לי · עצור <שם חתונה> · המשך <שם חתונה> · "
  + "לא קיבלו <שם חתונה> · או פשוט ענה להודעה על אורח ואעביר לו. "
  + "לענות למישהו אחר: 0501234567 ואז הטקסט.";

/**
 * Which event a name refers to.
 *
 * Deliberately forgiving on input and strict on outcome: "שלמה", "שלמה
 * ואבישג" and "החתונה של שלמה" all find the same wedding, and a word matching
 * two weddings finds neither. Acting on the wrong wedding is worse than asking
 * again, and "עצור" on the wrong one silences a wedding nobody meant to
 * silence.
 */
export function matchEvent<E extends { id: string; name?: string | null; couple_names?: string | null }>(
  needle: string, events: E[],
): { event: E } | { ambiguous: E[] } | { none: true } {
  /* Word overlap, not substring. He types the wedding the way he says it —
     "שלמה", "החתונה של שלמה", "שלמה ואבישג" — and a substring test fails the
     middle one, because no field contains the words "החתונה של". The words
     that appear in every wedding's title carry no information and are dropped
     before matching. */
  const STOP = new Set(["החתונה", "חתונת", "חתונה", "של", "אירוע", "האירוע"]);
  const words = needle.toLowerCase().split(/[\s,־-]+/)
    .map(w => w.replace(/^ו/, ""))          /* "ואבישג" is "אבישג" */
    .filter(w => w.length > 1 && !STOP.has(w));
  if (!words.length) return { none: true };

  const hits = events.filter(e => {
    const hay = `${e.couple_names ?? ""} ${e.name ?? ""}`.toLowerCase();
    return words.every(w => hay.includes(w));
  });

  if (hits.length === 1) return { event: hits[0] };
  if (hits.length > 1) return { ambiguous: hits };
  return { none: true };
}
