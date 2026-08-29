/**
 * Does everything a guest is about to receive actually work?
 *
 * On 30/08 שחר's guests were sent a rides-group link with one wrong character
 * — a capital I read as a lowercase l off a screenshot. It had the right host,
 * the right shape, and answered 200. 175 messages went out before she noticed,
 * and the first diagnosis blamed her for resetting a link she had never
 * touched.
 *
 * Nothing checked. Every guest-facing link in this product — the invitation
 * card, the RSVP page, the upload page, the rides group — is a value somebody
 * pasted once, and a message is the worst possible place to discover a typo.
 *
 * So they are asked, before a run rather than after a complaint. Each check
 * answers with what a guest would experience, not with an HTTP status: a
 * WhatsApp invite that returns 200 with an empty og:title is a dead link, and
 * an image URL that returns an HTML error page is a broken card.
 */

export type LinkStatus = "ok" | "broken" | "missing";

export interface LinkCheck {
  label: string;
  status: LinkStatus;
  detail?: string;
  url?: string;
}

const TIMEOUT_MS = 8_000;

async function head(url: string): Promise<Response | null> {
  try {
    return await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: "follow" });
  } catch { return null; }
}

/** An image URL that answers with a web page is a card the guest never sees. */
async function checkImage(url: string | null | undefined, label: string): Promise<LinkCheck> {
  if (!url?.trim()) return { label, status: "missing", detail: "לא הוגדרה" };
  const r = await head(url.trim());
  if (!r) return { label, status: "broken", detail: "לא נענה", url };
  if (!r.ok) return { label, status: "broken", detail: `שגיאה ${r.status}`, url };
  const type = r.headers.get("content-type") ?? "";
  if (!type.startsWith("image/"))
    return { label, status: "broken", detail: `מחזיר ${type.split(";")[0] || "תוכן לא מזוהה"} ולא תמונה`, url };
  return { label, status: "ok", url };
}

async function checkPage(url: string, label: string): Promise<LinkCheck> {
  const r = await head(url);
  if (!r)     return { label, status: "broken", detail: "לא נענה", url };
  if (!r.ok)  return { label, status: "broken", detail: `שגיאה ${r.status}`, url };
  return { label, status: "ok", url };
}

/**
 * A WhatsApp invite, judged the way a phone judges it.
 *
 * WhatsApp answers an invite it recognises with the group's name in og:title
 * and a dead one with that field empty — both with 200. The status code is
 * the one thing that cannot tell them apart, which is exactly why the wrong
 * link survived every check that was run on it.
 */
export async function checkWhatsAppGroup(
  url: string | null | undefined, label = "קבוצת טרמפים",
): Promise<LinkCheck> {
  if (!url?.trim()) return { label, status: "missing", detail: "לא הוגדרה" };
  try {
    const r = await fetch(url.trim(), {
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const html = await r.text();
    const name = (html.match(/property="og:title" content="([^"]*)"/)?.[1] ?? "")
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .trim();
    if (!name)
      return { label, status: "broken", url,
               detail: "וואטסאפ לא מזהה את הקישור כקבוצה — ייתכן שתו אחד שגוי" };
    return { label, status: "ok", detail: name, url };
  } catch {
    /* Unreachable is not the same as wrong, and must not raise a false alarm. */
    return { label, status: "ok", detail: "לא ניתן לאמת כרגע", url };
  }
}

export interface EventLinks {
  headerImage?: string | null;
  ridesGroupUrl?: string | null;
  /** A real guest's token, so the link checked is a link that exists. */
  sampleRsvpToken?: string | null;
  vaultToken?: string | null;
  baseUrl: string;
}

/** Every guest-facing link for one wedding, checked in parallel. */
export async function checkEventLinks(ev: EventLinks): Promise<LinkCheck[]> {
  const checks: Promise<LinkCheck>[] = [
    checkImage(ev.headerImage, "תמונת ההזמנה"),
  ];
  if (ev.sampleRsvpToken)
    checks.push(checkPage(`${ev.baseUrl}/rsvp/${ev.sampleRsvpToken}`, "קישור אישור הגעה"));
  if (ev.vaultToken)
    checks.push(checkPage(`${ev.baseUrl}/memory/${ev.vaultToken}`, "דף העלאת תמונות"));
  if (ev.ridesGroupUrl !== undefined)
    checks.push(checkWhatsAppGroup(ev.ridesGroupUrl));
  return Promise.all(checks);
}

/** The one line worth waking somebody for. Empty when nothing is wrong. */
export function brokenSummary(checks: LinkCheck[]): string {
  const bad = checks.filter(c => c.status === "broken");
  if (!bad.length) return "";
  return bad.map(c => `${c.label}${c.detail ? ` — ${c.detail}` : ""}`).join(" · ");
}
