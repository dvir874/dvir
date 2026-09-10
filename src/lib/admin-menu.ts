/* The console as a menu, because a blank prompt is what leaked.
 *
 * Dvir, 09/09: "אני רוצה לבנות את זה ממש בצורה כזאת שזה ייתן לי תפריט אופציות
 * מה לעשות ממש מסודר מקצה לקצה והכול בפלאפון שלי בוואטסאפ של רגע לפני."
 *
 * He is right, and the reason is stronger than convenience. The console's
 * default was "anything I do not recognise is a message for the guest we last
 * raised". Run the real parser on what a person actually types and five of
 * seven plausible instructions — "כמה אישרו", "מי לא אישר", "תראה לי סטטוס",
 * "איזה אורחים לא יודעי", "שלח לכולם תזכורת" — are forwarded verbatim to a
 * stranger. One of them did go out, on 08/09 at 07:24, to the guest who had
 * written "אל תחזרו" the day before; it failed only because Meta's 24-hour
 * window had closed 75 minutes earlier.
 *
 * A blocklist cannot fix that. It was tried on 08/09 at 00:54 and "איזה
 * אורחים לא יודעי" arrived six and a half hours later. You cannot enumerate
 * what somebody will type; you can enumerate what they may tap.
 *
 * So: taps carry ids, ids are the grammar, and free text stops being an
 * address. Over all 1,035 outbound messages since the console shipped there
 * were exactly five free-text sends — four leaks and one real reply, and the
 * real one went through the explicit-marker path. The allowlist route is the
 * only one that has ever worked.
 *
 * Import-free. This decides where a message Dvir typed ends up.
 */

/** Every screen the console can be on. `arg` is an event or guest id. */
export type MenuAction =
  | { screen: "root" }
  | { screen: "weddings" }
  | { screen: "wedding"; id: string }
  | { screen: "pause"; id: string }
  | { screen: "resume"; id: string }
  | { screen: "missing"; id?: string }
  | { screen: "opened"; id?: string }     /* saw the page, never answered */
  | { screen: "waiting" }                 /* מחכים לי */
  | { screen: "pick_reply" }              /* choose whom to answer */
  | { screen: "reply_to"; id: string }    /* arm a reply to one guest */
  | { screen: "mute"; id: string }        /* do_not_contact, by hand */
  | { screen: "unmute"; id: string }      /* and the way back */
  | { screen: "today" }                   /* מה יוצא היום */
  | { screen: "money" }                   /* מי שילם ומי לא */
  | { screen: "mark_paid"; id: string }
  | { screen: "help" };

const PREFIX = "m:";

/** The id carried by a button or list row. */
export function menuId(a: MenuAction): string {
  switch (a.screen) {
    case "root":       return `${PREFIX}root`;
    case "weddings":   return `${PREFIX}wed`;
    case "wedding":    return `${PREFIX}wed:${a.id}`;
    case "pause":      return `${PREFIX}pause:${a.id}`;
    case "resume":     return `${PREFIX}go:${a.id}`;
    case "missing":    return a.id ? `${PREFIX}miss:${a.id}` : `${PREFIX}miss`;
    case "opened":     return a.id ? `${PREFIX}open:${a.id}` : `${PREFIX}open`;
    case "waiting":    return `${PREFIX}wait`;
    case "pick_reply": return `${PREFIX}rep`;
    case "reply_to":   return `${PREFIX}rep:${a.id}`;
    case "mute":       return `${PREFIX}mute:${a.id}`;
    case "unmute":     return `${PREFIX}unmute:${a.id}`;
    case "today":      return `${PREFIX}today`;
    case "money":      return `${PREFIX}money`;
    case "mark_paid":  return `${PREFIX}paid:${a.id}`;
    case "help":       return `${PREFIX}help`;
  }
}

/* Ids are ours and arrive back from WhatsApp untouched, but they arrive over
   the network all the same. An id that does not parse is not a screen and is
   certainly not an instruction to message anybody. */
const SAFE_ID = /^[A-Za-z0-9-]{1,64}$/;

/** The screen a tap asked for, or null if this was not a tap of ours.
 *
 * An argument that is present and malformed answers null rather than falling
 * back to the argument-less screen. Quietly reinterpreting a bad id as "show
 * me the list" would be harmless here and is exactly the habit that produced
 * the leak: when the input is not what we issued, the answer is no action. */
export function parseMenuId(raw: string | null | undefined): MenuAction | null {
  const t = String(raw ?? "").trim();
  if (!t.startsWith(PREFIX)) return null;
  const rest = t.slice(PREFIX.length);
  const cut = rest.indexOf(":");
  const screen = cut < 0 ? rest : rest.slice(0, cut);
  const arg    = cut < 0 ? undefined : rest.slice(cut + 1);
  if (arg !== undefined && !SAFE_ID.test(arg)) return null;
  const id = arg;

  switch (screen) {
    case "root": return id ? null : { screen: "root" };
    case "wed":  return id ? { screen: "wedding", id } : { screen: "weddings" };
    case "pause": return id ? { screen: "pause", id } : null;
    case "go":    return id ? { screen: "resume", id } : null;
    case "miss":  return id ? { screen: "missing", id } : { screen: "missing" };
    case "open":  return id ? { screen: "opened", id } : { screen: "opened" };
    case "wait":  return id ? null : { screen: "waiting" };
    case "rep":   return id ? { screen: "reply_to", id } : { screen: "pick_reply" };
    case "mute":  return id ? { screen: "mute", id } : null;
    case "unmute": return id ? { screen: "unmute", id } : null;
    case "today": return id ? null : { screen: "today" };
    case "money": return id ? null : { screen: "money" };
    case "paid":  return id ? { screen: "mark_paid", id } : null;
    case "help":  return id ? null : { screen: "help" };
    default: return null;
  }
}

/* The words that open the menu by typing rather than tapping. Kept short and
   obvious: this is the one thing he should be able to reach without
   remembering anything. */
const OPENS_MENU =
  /^(תפריט|מenu|menu|היי|הי|שלום|אהלן|בוקר טוב|ערב טוב|מה יש|מה אפשר|\?|\/|\/menu|\/start|start)$/i;

export function asksForMenu(said: string): boolean {
  return OPENS_MENU.test(String(said ?? "").trim());
}

/** Labels, in one place, because WhatsApp truncates a button at 20 characters
    and a list row at 24 and there is no way to see that until it is on a
    phone. Every string here is inside both limits. */
export const LABEL = {
  weddings:  "📊 מצב החתונות",
  waiting:   "🙋 מחכים לי",
  missing:   "📵 לא קיבלו הזמנה",
  /* The warmest list in the system and the one with no screen: 81 guests
     across three weddings tapped their invitation, read the page, and never
     answered — 52 of them at שלמה's alone. They are not unreachable and they
     are not uninterested; they were interrupted. */
  opened:    "👀 פתחו ולא ענו",
  pickReply: "✉️ לענות לאורח",
  help:      "❓ עזרה",
  pause:     "⏸ עצור שליחה",
  resume:    "▶️ המשך שליחה",
  back:      "⬅️ תפריט",
  mute:      "🔕 להסיר מהרשימה",
  /* Every action in this console must be undoable in one more message —
     admin-command.ts states that rule and the mute was the one that broke
     it. A mistap on a moving phone flagged a confirmed guest for ever, and
     the only undo was a web page this whole week was built to stop needing. */
  unmute:    "↩️ ביטול ההסרה",
  today:     "📅 מה יוצא היום",
  money:     "💰 כסף",
  markPaid:  "✓ סמן כשולם",
} as const;

/** The one sentence at the top of the root menu. */
export const ROOT_TEXT = "רגע לפני — מה לעשות?";
