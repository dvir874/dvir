/* WhatsApp Cloud API client (Meta, no BSP middleman).

   Used by the admin send station to deliver RSVP invitations as approved
   template messages. Unlike the wa.me flow, a template carries a real image
   header that always renders — WhatsApp never has to crawl our page for a
   link preview, so the invitation art is guaranteed to show.

   Configuration lives entirely in env; if it is absent every call returns a
   disabled result and the caller falls back to the manual wa.me flow. Nothing
   here can break the existing send station. */

const API_VERSION = "v21.0";

/* ── Throughput guard ────────────────────────────────────────────────────
   Meta throttles new numbers hard: a burst of 66 invitations produced three
   "Spam Rate limit hit" failures. Guests never learn a message was blocked,
   so the only acceptable behaviour is to go slower than the limit and retry
   anything that still bounces. Minutes of extra wall-clock are cheap; a
   wedding guest who never got an invitation is not. */

const MIN_GAP_MS = 900;      // never start two sends closer than this
let lastSendAt = 0;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function pace() {
  const wait = lastSendAt + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastSendAt = Date.now();
}

/* Errors worth retrying: throttling and transient transport problems.
   A bad phone number or a rejected template will never succeed on retry. */
function isTransient(err: string): boolean {
  const e = err.toLowerCase();
  return e.includes("rate limit")
      || e.includes("spam")
      || e.includes("too many")
      || e.includes("try again")
      || e.includes("timeout")
      || e.includes("network")
      || e.includes("(#131049)")     // healthy-ecosystem throttle
      || e.includes("(#130429)")     // cloud API rate limit
      || e.includes("(#80007)");     // rate limit issue
}

const BACKOFF_MS = [4000, 12000, 30000];


export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  templateName: string;
  templateLang: string;
  /** Public URL of the template's header image (Meta re-fetches it per send) */
  headerImageUrl: string;
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return null;

  return {
    phoneNumberId,
    accessToken,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME ?? "wedding_invitation_regalifnei",
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG ?? "he",
    /* Deliberately no fallback. This image is the invitation card that every
       recipient sees at the top of the message. A default here means one
       couple's invitation goes out to another couple's 550 guests — and a
       sent WhatsApp message cannot be recalled. Callers must pass the event's
       own image; see sendInvitation's headerImageUrl argument. */
    headerImageUrl: process.env.WHATSAPP_HEADER_IMAGE_URL ?? "",
  };
}

/* Israeli numbers arrive as 05X-XXXXXXX, 0X-XXXXXXX or already +972.
   Meta wants digits only, in full international form, with no leading +. */
export function toE164(raw: string): string | null {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  /* Bare local number with no leading zero — assume Israeli mobile/landline */
  if (digits.length >= 8 && digits.length <= 9) return `972${digits}`;
  return digits;
}

export interface SendResult {
  ok: boolean;
  /** Meta's message id, when accepted — lets us reconcile delivery reports */
  messageId?: string;
  error?: string;
  /** How many retries it took; absent means it went through first time */
  retries?: number;
}

/* Sends one template message.
   `token` fills the dynamic suffix of the URL button, so every guest gets
   their own RSVP link while sharing a single approved template. */
export async function sendInvitation(
  cfg: WhatsAppConfig,
  phone: string,
  token: string,
  headerImageUrl?: string,
): Promise<SendResult> {
  const to = toE164(phone);
  if (!to) return { ok: false, error: "invalid phone" };

  /* Refuse rather than guess: sending the wrong couple's invitation is worse
     than sending nothing, because it cannot be undone. */
  const image = headerImageUrl || cfg.headerImageUrl;
  if (!image) {
    return { ok: false, error: "לא הוגדרה תמונת הזמנה לאירוע — השליחה נעצרה" };
  }

  let last: SendResult = { ok: false, error: "unknown" };
  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    await pace();
    last = await sendOnce(cfg, to, token, image);
    if (last.ok) return attempt === 0 ? last : { ...last, retries: attempt };
    if (!isTransient(last.error ?? "")) return last;
    if (attempt < BACKOFF_MS.length) await sleep(BACKOFF_MS[attempt]);
  }
  return { ...last, retries: BACKOFF_MS.length };
}

async function sendOnce(
  cfg: WhatsAppConfig,
  to: string,
  token: string,
  image: string,
): Promise<SendResult> {

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: cfg.templateName,
      language: { code: cfg.templateLang },
      components: [
        {
          type: "header",
          parameters: [{ type: "image", image: { link: image } }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: token }],
        },
      ],
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      /* Meta nests the human-readable reason a few levels down */
      const err =
        json?.error?.error_user_msg ??
        json?.error?.message ??
        `HTTP ${res.status}`;
      return { ok: false, error: String(err) };
    }

    return { ok: true, messageId: json?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}
