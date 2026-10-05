/* Where a visitor came from, and what they pressed.
 *
 * Until 05/10/2026 the site loaded GA4 and measured nothing but page views:
 * every WhatsApp button opened the same chat with the same text, and the
 * waUrl(source) argument in constants.ts was ignored whenever a message was
 * given — which was always. A lead from a Reel and a lead from Google looked
 * identical in GA4 and in Dvir's phone.
 *
 * Two things fix that, both without touching guest pages (Analytics.tsx
 * already refuses to load on them, and this only runs where it loads):
 *   1. First-touch UTM is kept for the session, so a visitor who lands from
 *      ?utm_source=instagram and presses a button three pages later is still
 *      counted as Instagram.
 *   2. Every wa.me click fires a GA4 event, and — only when the source is a
 *      known social channel — the prefilled message gains one honest line
 *      ("הגעתי דרך אינסטגרם") so Dvir sees the channel in the chat itself.
 */

const KEY = "rl_utm";

export type Utm = { source?: string; medium?: string; campaign?: string };

const SOURCE_LABEL: Record<string, string> = {
  instagram: "אינסטגרם",
  ig: "אינסטגרם",
  facebook: "פייסבוק",
  fb: "פייסבוק",
  tiktok: "טיקטוק",
  mit4mit: "מתחתנים למען מתחתנים",
  google: "גוגל",
};

/** The lead_source enum on /api/leads is closed; map onto it or fall through. */
export function leadSourceOf(utm: Utm): "instagram" | "facebook" | "google" | null {
  const s = (utm.source ?? "").toLowerCase();
  if (s === "instagram" || s === "ig") return "instagram";
  if (s === "facebook" || s === "fb") return "facebook";
  if (s === "google") return "google";
  return null;
}

export function captureUtm(): void {
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch wins
    const q = new URLSearchParams(window.location.search);
    const source = q.get("utm_source");
    if (!source) return;
    const utm: Utm = {
      source: source.slice(0, 40),
      medium: q.get("utm_medium")?.slice(0, 40) ?? undefined,
      campaign: q.get("utm_campaign")?.slice(0, 60) ?? undefined,
    };
    sessionStorage.setItem(KEY, JSON.stringify(utm));
  } catch {
    /* private mode / blocked storage — measurement is best-effort */
  }
}

export function readUtm(): Utm {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? "{}") as Utm;
  } catch {
    return {};
  }
}

type Gtag = (...args: unknown[]) => void;

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g !== "function") return;
  const utm = readUtm();
  g("event", name, {
    ...params,
    first_source: utm.source ?? "(direct)",
    first_campaign: utm.campaign ?? undefined,
  });
}

/** Adds "הגעתי דרך X" to a wa.me link's text, once, for known social sources. */
export function withSourceLine(href: string): string {
  const label = SOURCE_LABEL[(readUtm().source ?? "").toLowerCase()];
  if (!label) return href;
  try {
    const u = new URL(href);
    const text = u.searchParams.get("text") ?? "";
    if (text.includes("הגעתי דרך")) return href;
    u.searchParams.set("text", `${text}\n(הגעתי דרך ${label})`.trim());
    return u.toString();
  } catch {
    return href;
  }
}

/** Where on the page a link sits: an explicit data-cta, else the nearest id. */
function locationOf(a: HTMLAnchorElement): string {
  const explicit = a.closest<HTMLElement>("[data-cta]")?.dataset.cta;
  if (explicit) return explicit;
  const withId = a.closest<HTMLElement>("[id]");
  const block = a.closest("header") ? "header" : a.closest("footer") ? "footer" : withId?.id ?? "page";
  return `${window.location.pathname}#${block}`;
}

/** One document-level listener instead of an onClick on every button. */
export function installClickTracking(): () => void {
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.("a") as HTMLAnchorElement | null;
    if (!a?.href) return;
    if (a.href.includes("wa.me/") || a.href.includes("api.whatsapp.com")) {
      a.href = withSourceLine(a.href);
      const params = { link_location: locationOf(a), link_text: a.textContent?.trim().slice(0, 40) };
      trackEvent("whatsapp_click", params);
      trackEvent("generate_lead", { ...params, method: "whatsapp" });
    } else if (a.href.startsWith("tel:")) {
      trackEvent("phone_click", { link_location: locationOf(a) });
    } else if (a.pathname === "/try" || a.pathname.startsWith("/event/demo")) {
      trackEvent("demo_open", { link_location: locationOf(a) });
    }
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
