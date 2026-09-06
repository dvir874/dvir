/** Does the message we are about to build fit the template Meta approved?
 *
 * This exists because of nineteen lost reminders. wedding_rsvp_followup_utility
 * was approved with no header, three variables and quick-reply buttons; sendOnce
 * builds an image header, four variables and a url button. Both halves were
 * correct on their own — valid TypeScript, valid template — and every code
 * review passed, because the defect was not in either half. It was in the
 * relationship between the repo and a remote system whose state the repo does
 * not contain. Reading the code could not find it and never will.
 *
 * So the shape is measured on both sides and compared, once per run, before
 * the first message rather than after the nineteenth. The point is that neither
 * side is described by hand here: one is measured from the components we are
 * actually about to send, the other from what Meta actually stores. A
 * description would drift; a measurement cannot. */

export type Shape = {
  header: string;   /* "IMAGE" | "TEXT" | ... | "NONE" */
  bodyVars: number;
  button: "URL" | "QUICK_REPLY" | "NONE";
};

type AnyComp = Record<string, unknown>;

const arr = (v: unknown): AnyComp[] => (Array.isArray(v) ? (v as AnyComp[]) : []);
const typeOf = (c: AnyComp) => String(c?.type ?? "").toUpperCase();

/** What we are about to put on the wire, measured from the real components
    array — not from a second description of it that could fall out of date. */
export function shapeOfOutgoing(components: unknown): Shape {
  const comps = arr(components);

  const header = comps.find(c => typeOf(c) === "HEADER");
  const headerParam = header ? arr(header.parameters)[0] : undefined;

  const body = comps.find(c => typeOf(c) === "BODY");
  const button = comps.find(c => typeOf(c) === "BUTTON");

  return {
    header: header ? String(headerParam?.type ?? "TEXT").toUpperCase() : "NONE",
    bodyVars: body ? arr(body.parameters).length : 0,
    button: button
      ? (String(button.sub_type ?? "").toLowerCase() === "url" ? "URL" : "QUICK_REPLY")
      : "NONE",
  };
}

/** What Meta stores, measured from the template definition the Graph API
    returns. Variables are counted distinctly: a body may repeat {{1}}, and
    Meta still expects one parameter for it. */
export function shapeOfMeta(components: unknown): Shape {
  const comps = arr(components);

  const header = comps.find(c => typeOf(c) === "HEADER");
  const body = comps.find(c => typeOf(c) === "BODY");
  const buttons = comps.find(c => typeOf(c) === "BUTTONS");

  const text = String(body?.text ?? "");
  const vars = new Set(text.match(/\{\{\s*\d+\s*\}\}/g) ?? []);

  const kinds = arr(buttons?.buttons).map(b => String(b?.type ?? "").toUpperCase());

  return {
    header: header ? String(header.format ?? "TEXT").toUpperCase() : "NONE",
    bodyVars: vars.size,
    /* A url button must be sent as a component and carries the token; quick
       replies are fixed at approval and must NOT be sent. That asymmetry is
       what makes getting this wrong fail the whole run. */
    button: kinds.includes("URL") ? "URL" : kinds.length ? "QUICK_REPLY" : "NONE",
  };
}

/** The disagreement, in the words Dvir would need to fix it — or null when the
    two shapes fit. Every branch names both sides, because "template mismatch"
    with no numbers is how the last one stayed unexplained for a day. */
export function shapeMismatch(sending: Shape, stored: Shape): string | null {
  const problems: string[] = [];

  if (sending.header !== "NONE" && stored.header === "NONE") {
    problems.push(`אנחנו שולחים כותרת ${sending.header} והתבנית מוגדרת בלי כותרת`);
  } else if (sending.header === "NONE" && stored.header !== "NONE") {
    problems.push(`התבנית דורשת כותרת ${stored.header} ואנחנו לא שולחים כותרת`);
  }

  if (sending.bodyVars !== stored.bodyVars) {
    problems.push(`אנחנו שולחים ${sending.bodyVars} פרמטרים והתבנית מצפה ל-${stored.bodyVars}`);
  }

  /* Buttons are not symmetric, and that asymmetry is the whole trap. A url
     button must be sent as a component, because it carries the guest's token.
     Quick replies must NOT be sent: they are fixed at approval and carry
     nothing, so a component for them is rejected — and Meta rejects the run,
     not the message. So "we send nothing" is the CORRECT answer to a
     quick-reply template, and comparing the two sides directly would report a
     healthy template as broken. */
  const shouldSend = stored.button === "URL" ? "URL" : "NONE";
  if (sending.button !== shouldSend) {
    if (sending.button === "URL") {
      const theirs = stored.button === "QUICK_REPLY" ? "כפתורי מענה" : "בלי כפתורים";
      /* This is the half of the last failure that came from a template name
         missing from QUICK_REPLY_TEMPLATES in whatsapp.ts. */
      problems.push(`אנחנו שולחים כפתור קישור והתבנית מוגדרת עם ${theirs} — צריך להוסיף את השם ל-QUICK_REPLY_TEMPLATES`);
    } else {
      problems.push(`התבנית דורשת כפתור קישור ואנחנו לא שולחים אותו — צריך להוריד את השם מ-QUICK_REPLY_TEMPLATES`);
    }
  }

  return problems.length ? problems.join(" · ") : null;
}

/** The full preflight verdict for one template, status included. An unapproved
    template fails every send just as surely as a wrong parameter count, and
    swapping an env var to a template still pending review is the most likely
    way to repeat this outage. */
export function templateProblem(
  templateName: string,
  stored: { status?: string; components?: unknown } | null | undefined,
  sending: Shape,
): string | null {
  if (!stored) return `התבנית ${templateName} לא קיימת במטא`;

  const status = String(stored.status ?? "").toUpperCase();
  if (status && status !== "APPROVED") {
    return `התבנית ${templateName} במצב ${status} ולא ניתן לשלוח בה`;
  }

  const mismatch = shapeMismatch(sending, shapeOfMeta(stored.components));
  return mismatch ? `${templateName}: ${mismatch}` : null;
}
