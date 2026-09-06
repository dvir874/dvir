/* What the automation cannot do, and a person must.
 *
 * Every send path in this system ends in one of two places: it worked, or it
 * produced a guest who now needs hands. The first is reported everywhere. The
 * second existed only as coloured chips on /admin — "ביקשו להפסיק (1)",
 * "מטא חוסמת זמנית (2)", "לא מקבלים תבניות (2)" — which is to say it existed
 * only for somebody already looking at the screen.
 *
 * Dvir, on 03/09, starting a new job: "כל אלה אני בסוף צריך לעבוד עליהם ידנית
 * אבל אני לא יודע את זה מבלי להיכנס לאדמין ואני רוצה לדעת את זה גם כשאני לא
 * באדמין שיש דברים לטיפול."
 *
 * A business that runs itself is not one that hides what it could not finish.
 * It is one that finishes what it can and then says, out loud and without being
 * asked, exactly what is left — with names and numbers, so the answer is a
 * phone call rather than an investigation.
 *
 * Import-free, like wa-decide.ts and needs-human.ts, because the list of people
 * nobody has managed to reach is not something to discover from production.
 */

export type WorkKind =
  | "never_sent"        /* no message ever left for them */
  | "always_refused"    /* every attempt refused — the number will not take ours */
  | "no_whatsapp"       /* 131026 — that number cannot receive */
  | "opted_out"         /* 131050 — they asked us to stop */
  | "template_blocked"  /* 130472 — Meta will only allow it if they write first */
  | "waiting_reply";    /* they wrote and nothing has gone back */

export interface WorkGuest {
  id: string;
  /** The guest's own RSVP token — becomes the one-tap send link. */
  rsvp_token?: string | null;
  name?: string | null;
  phone?: string | null;
  status?: string | null;
  category?: string | null;
  do_not_contact?: boolean | null;
}

export interface LastContact {
  /** How many sends Meta refused outright. */
  refusals?: number;
  /** Latest outbound, if any. */
  lastOutAt?: string | null;
  lastCode?: number | null;
  /** Meta confirmed delivered or read at least once. */
  arrived?: boolean;
  /** Latest inbound, if any. */
  lastInAt?: string | null;
}

export interface WorkItem {
  id: string;
  name: string;
  phone: string;
  kind: WorkKind;
  /** Short link that opens WhatsApp with this guest's own message ready. */
  send?: string;
}

/* Ordered by how much a person is needed, not by how many there are. A guest
   who wrote to us and got nothing back is waiting right now; a wrong number is
   a task for this evening. */
const ORDER: WorkKind[] = ["waiting_reply", "opted_out", "no_whatsapp", "always_refused", "template_blocked", "never_sent"];

export const WORK_TEXT: Record<WorkKind, string> = {
  waiting_reply:    "כתבו ולא נענו",
  opted_out:        "ביקשו להפסיק — רק הודעה אישית",
  no_whatsapp:      "אין וואטסאפ במספר — לוודא מול הזוג",
  template_blocked: "מטא חוסמת — יגיע רק אם יכתבו קודם",
  never_sent:       "לא יצאה אליהם הודעה",
  always_refused:   "מטא דוחה כל ניסיון — רק הודעה מהטלפון שלך",
};

/**
 * The guests a person has to handle, and why.
 *
 * `contact` is what is known about each guest's last exchange. A guest missing
 * from it has never been messaged at all — which is the most serious of these
 * and the easiest to miss, because nothing failed.
 */
export function classifyManualWork(
  guests: WorkGuest[],
  contact: Map<string, LastContact>,
): WorkItem[] {
  const out: WorkItem[] = [];

  for (const g of guests) {
    if (g.category === "demo") continue;
    const phone = String(g.phone ?? "").trim();
    const name = String(g.name ?? "").trim();
    if (!name) continue;

    const c = contact.get(g.id);
    const token = String(g.rsvp_token ?? "").trim();

    /* Somebody wrote to us and nothing went back. Checked first and for
       everyone, answered or not: a guest who has already confirmed can still
       be asking a question nobody read. */
    if (c?.lastInAt && (!c.lastOutAt || c.lastInAt > c.lastOutAt)) {
      out.push({ id: g.id, name, phone, kind: "waiting_reply", ...(token ? { send: token } : {}) });
      continue;
    }

    /* Past here it is about reaching them at all, so a guest who has already
       answered needs nothing. */
    if (g.status && g.status !== "pending") continue;
    if (g.do_not_contact) continue;
    if (!phone) continue;

    if (!c || !c.lastOutAt) {
      out.push({ id: g.id, name, phone, kind: "never_sent", ...(token ? { send: token } : {}) });
      continue;
    }
    /* Every attempt refused. The automation has stopped trying, so a person
       has to — and the link beside the name is how. */
    if ((c.refusals ?? 0) >= 6) {
      out.push({ id: g.id, name, phone, kind: "always_refused", ...(token ? { send: token } : {}) });
      continue;
    }
    if (c.arrived) continue;                       /* it got there; they just have not answered */

    switch (c.lastCode) {
      case 131050: out.push({ id: g.id, name, phone, kind: "opted_out", ...(token ? { send: token } : {}) }); break;
      case 131026: out.push({ id: g.id, name, phone, kind: "no_whatsapp", ...(token ? { send: token } : {}) }); break;
      case 130472: out.push({ id: g.id, name, phone, kind: "template_blocked", ...(token ? { send: token } : {}) }); break;
      /* 131049 and the unclassified failures retry themselves. They are not
         work for a person and must not appear here — a list that includes
         things nobody has to do is a list nobody reads. */
      default: break;
    }
  }

  return out.sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}

/**
 * One WhatsApp message: what is waiting, for which wedding, with the names.
 *
 * Names and numbers rather than counts. "2 מטא חוסמת" sends him to the admin
 * to find out who; the number in the message means he can act from the message.
 * Separated by · because a newline in a Meta parameter fails the whole send.
 */
export function manualWorkMessage(
  wedding: string, daysAway: number, items: WorkItem[], perKind = 6,
  /* Where a one-tap link points. Passed in rather than read from env, so this
     file stays testable without one. */
  base = "",
): string | null {
  if (!items.length) return null;

  const byKind = new Map<WorkKind, WorkItem[]>();
  for (const it of items) {
    const list = byKind.get(it.kind) ?? [];
    list.push(it);
    byKind.set(it.kind, list);
  }

  const parts: string[] = [];
  for (const kind of ORDER) {
    const list = byKind.get(kind);
    if (!list?.length) continue;
    /* Name, number, and a link that opens WhatsApp with their own message
       already written — the thing the admin screen has always had and the
       alert did not. A bare phone number in WhatsApp opens a dialler; this
       opens a draft. Kept short deliberately: the full wa.me URL carries the
       encoded invitation and runs to about seven hundred characters, and
       several of those do not fit in a Meta template parameter. */
    const who = list.slice(0, perKind)
      .map(x => `${x.name}${x.phone ? " " + x.phone : ""}`
        + (base && x.send ? ` ${base}/s/${x.send}` : "")).join(" · ");
    parts.push(`${WORK_TEXT[kind]} (${list.length}): ${who}`
      + (list.length > perKind ? ` ועוד ${list.length - perKind}` : ""));
  }

  return `${wedding} · בעוד ${daysAway} ימים · ${items.length} דורשים אותך. ${parts.join(" | ")}`;
}
