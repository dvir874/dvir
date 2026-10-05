/* Where a visitor came from, and what they pressed.
 *
 * Organic distribution means a link in a TikTok bio, a Reel, a Facebook group
 * post, a comment — each tagged ?utm_source=tiktok&utm_content=v07. Until now
 * nothing read those tags: GA4 saw a page view, the contact form sent a
 * hard-coded "organic", and a WhatsApp lead — which is most leads — arrived as
 * a bare "שלום דביר" with no way to tell which video earned it.
 *
 * First touch is kept, for 30 days, in localStorage: the video that brought
 * someone is the one that gets the credit when they come back a week later by
 * typing the address. Marketing pages only — Analytics.tsx, which calls
 * captureAttribution, never mounts on a guest page, and nothing here is sent
 * anywhere but GA4 and the couple's own enquiry.
 */

export type Attribution = {
  source: string;
  medium?: string;
  campaign?: string;
  content?: string;
  landing: string;
  at: number;
};

const KEY = "rl_attr";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

/* Short aliases so a link in a bio stays short: ?s=tt&c=v07 */
const ALIASES: Record<string, string> = {
  tt: "tiktok", ig: "instagram", fb: "facebook", fbg: "facebook-group", wa: "whatsapp", yt: "youtube",
};

const clean = (v: string | null, max = 40) =>
  v ? v.trim().toLowerCase().replace(/[^\p{L}\p{N}_\-./]/gu, "").slice(0, max) || undefined : undefined;

function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Attribution;
    return Date.now() - a.at < TTL_MS ? a : null;
  } catch { return null; }
}

/** Record the first tagged visit. Untagged visits never overwrite one. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(window.location.search);
  const rawSource = clean(q.get("utm_source") ?? q.get("s"));
  if (!rawSource) {
    /* No tag, but a referrer from a social app still says something. */
    if (read()) return;
    const ref = document.referrer;
    const host = (() => { try { return ref ? new URL(ref).hostname : ""; } catch { return ""; } })();
    if (!host || host.endsWith("regalifnei.com") || host === window.location.hostname) return;
    const guess =
      /tiktok/.test(host) ? "tiktok" :
      /instagram/.test(host) ? "instagram" :
      /facebook|fb\./.test(host) ? "facebook" :
      /google\./.test(host) ? "google" :
      /whatsapp|wa\.me/.test(host) ? "whatsapp" : host;
    write({ source: guess, medium: "referral", landing: window.location.pathname, at: Date.now() });
    return;
  }
  if (read()) return;
  write({
    source: ALIASES[rawSource] ?? rawSource,
    medium: clean(q.get("utm_medium") ?? q.get("m")),
    campaign: clean(q.get("utm_campaign") ?? q.get("k")),
    content: clean(q.get("utm_content") ?? q.get("c")),
    landing: window.location.pathname,
    at: Date.now(),
  });
}

function write(a: Attribution) {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* private mode: lose it, never break */ }
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  return read();
}

/** "tiktok/v07" — short enough to ride inside a WhatsApp message. */
export function attributionTag(): string {
  const a = getAttribution();
  if (!a) return "";
  return [a.source, a.content ?? a.campaign].filter(Boolean).join("/");
}

/** The closed lead_source enum, from a free-text source. */
export function leadSourceEnum(source: string | undefined): "facebook" | "instagram" | "google" | "whatsapp_direct" | "organic" {
  if (!source) return "organic";
  if (source.startsWith("facebook")) return "facebook";
  if (source.startsWith("instagram")) return "instagram";
  if (source.startsWith("google")) return "google";
  if (source.startsWith("whatsapp")) return "whatsapp_direct";
  return "organic";
}

type Gtag = (cmd: "event", name: string, params?: Record<string, unknown>) => void;

/** A GA4 event, carrying the first-touch source. Silent when GA is absent. */
export function track(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const a = getAttribution();
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  try {
    g?.("event", name, {
      ...params,
      first_source: a?.source ?? "direct",
      first_content: a?.content ?? a?.campaign ?? "",
    });
  } catch { /* analytics never breaks a click */ }
}
