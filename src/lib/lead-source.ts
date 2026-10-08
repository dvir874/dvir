/* A stranger writes to the business number — who are they, and where from?
 *
 * Until 09/10 an unknown number became one alert and a row in wa_failures.
 * The 077 number is now the sales channel: Facebook, Instagram and TikTok
 * each get a link (/wa/<channel>) that opens WhatsApp to it with a prefilled
 * first line, and the webhook turns the first real message into a lead.
 *
 * The source is decided from evidence in the MESSAGE, never from a page
 * visit — a click that never became a message is not a lead:
 *   1. Meta's referral object. Present only on click-to-WhatsApp ads and
 *      boosted posts; carries the ad's source_url, so it is reliable.
 *   2. The channel named in the first message. Our prefilled line says
 *      "הגעתי מפייסבוק"; a person who types "ראיתי אתכם באינסטגרם" says the
 *      same thing in their own words. Both are evidence.
 *   3. Otherwise whatsapp_direct. A visitor who deleted the prefilled text
 *      left nothing to read, and the plain Facebook Page WhatsApp button
 *      sends no referral — there is no reliable signal left, so no guess.
 *
 * Import-free and pure so every branch is tested without a webhook. */

export type LeadChannel = "facebook" | "instagram" | "tiktok";
/** Values of the leads.source enum this file writes. */
export type WaLeadSource = LeadChannel | "whatsapp_direct";

/** The sales number. Product pages keep 053 (constants.ts) — see the 09/10
 *  decision: only new marketing channels move here. */
export const SALES_WA_PHONE = "972775494850";

export const LEAD_CHANNELS: Record<LeadChannel, { label: string; prefill: string; marker: RegExp }> = {
  facebook: {
    label: "Facebook",
    prefill: "היי! הגעתי מפייסבוק 👋 אשמח לשמוע על רגע לפני",
    marker: /פייסבוק|פייסבוג|facebook|\bfb\b/i,
  },
  instagram: {
    label: "Instagram",
    prefill: "היי! הגעתי מאינסטגרם 👋 אשמח לשמוע על רגע לפני",
    marker: /אינסטגרם|אינסטה|instagram|\binsta\b|\big\b/i,
  },
  tiktok: {
    label: "TikTok",
    prefill: "היי! הגעתי מטיקטוק 👋 אשמח לשמוע על רגע לפני",
    marker: /טיקטוק|טיק טוק|tiktok|tik tok/i,
  },
};

export const SOURCE_LABEL: Record<WaLeadSource, string> = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok",
  whatsapp_direct: "WhatsApp ישיר",
};

export function channelFromPath(raw: string | null | undefined): LeadChannel | null {
  const k = String(raw ?? "").trim().toLowerCase();
  return k in LEAD_CHANNELS ? (k as LeadChannel) : null;
}

/** wa.me link to the sales number with the channel's first line. */
export function channelLink(ch: LeadChannel): string {
  return `https://wa.me/${SALES_WA_PHONE}?text=${encodeURIComponent(LEAD_CHANNELS[ch].prefill)}`;
}

/** Meta's referral block on an inbound message (click-to-WhatsApp). */
export interface WaReferral {
  source_url?: string;
  source_type?: string;
  source_id?: string;
  headline?: string;
  ctwa_clid?: string;
}

function channelFromUrl(url: string | undefined): LeadChannel | null {
  let host = "";
  try { host = new URL(String(url ?? "")).hostname.toLowerCase(); } catch { return null; }
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me|fb\.watch)$/.test(host)) return "facebook";
  return null;
}

export function detectLeadSource(v: { referral?: WaReferral | null; body?: string | null }): {
  source: WaLeadSource; via: "referral" | "message" | "none";
} {
  const fromRef = channelFromUrl(v.referral?.source_url);
  if (fromRef) return { source: fromRef, via: "referral" };
  const body = String(v.body ?? "");
  for (const ch of Object.keys(LEAD_CHANNELS) as LeadChannel[]) {
    if (LEAD_CHANNELS[ch].marker.test(body)) return { source: ch, via: "message" };
  }
  return { source: "whatsapp_direct", via: "none" };
}

/* The reply a new lead gets, once. Sent only as an answer to their own
   message, inside Meta's 24-hour service window — free text is allowed
   there, so no template is needed. */
export const LEAD_WELCOME = [
  "היי 👋",
  "ברוכים הבאים ל'רגע לפני' 💍",
  "",
  "אנחנו עוזרים לזוגות לנהל את אישורי ההגעה, האורחים וההושבה לקראת החתונה.",
  "",
  "כתבו לנו בכמה מילים מתי החתונה שלכם, ונשמח להסביר איך זה עובד 😊",
].join("\n");

const clip = (s: string, n: number) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
};

export function readableLocal(phone: string): string {
  const d = String(phone ?? "").replace(/\D/g, "");
  return d.startsWith("972") ? `0${d.slice(3)}` : d;
}

export function leadAlertText(v: {
  isNew: boolean; source: WaLeadSource; name?: string | null; phone: string; body: string;
  status?: string; at?: Date;
}): string {
  const d = String(v.phone ?? "").replace(/\D/g, "");
  const time = (v.at ?? new Date()).toLocaleTimeString("he-IL",
    { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit" });
  return [
    v.isNew ? "💍 ליד חדש — רגע לפני" : "💬 הודעה מליד — רגע לפני",
    "",
    `מקור: ${SOURCE_LABEL[v.source]}`,
    v.name ? `שם: ${clip(v.name, 40)}` : null,
    `טלפון: +${d}`,
    `הודעה: ${clip(v.body, 300) || "(ללא טקסט)"}`,
    `סטטוס: ${v.status ?? "NEW"}`,
    `זמן: ${time}`,
    "",
    "לענות מה-077: לחצו ✉️ למטה, או כתבו כאן את המספר ואחריו ההודעה.",
    `פתח שיחה: https://wa.me/${d}`,
  ].filter(l => l !== null).join("\n");
}

/** How often an EXISTING lead's messages re-alert. A conversation is one
 *  alert, not one per line. */
export const LEAD_REALERT_MS = 60 * 60 * 1000;

export function shouldRealert(prevLastMessageAt: string | null | undefined, nowMs: number): boolean {
  if (!prevLastMessageAt) return true;
  const t = Date.parse(prevLastMessageAt);
  return !Number.isFinite(t) || nowMs - t >= LEAD_REALERT_MS;
}
