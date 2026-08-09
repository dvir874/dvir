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

/* Deliberately slow, and slower than it used to be.

   Measured on this number, same day:
     68 messages in one run  →   6 blocked   ( 9%)
     24 messages an hour later → 22 blocked  (92%)
      9 messages four hours later → 4 blocked (44%)

   A 3-second gap did not prevent any of that. Meta's spam heuristic reacts to
   the volume of *new conversations from one number*, so the gap alone is not
   the lever — the day's cumulative total is. Hence a much larger gap, plus a
   daily budget the caller is expected to respect.

   Jitter matters too: a perfectly regular 3000ms cadence is itself a signal
   that no human is behind the number. */
const MIN_GAP_MS = 20_000;
const JITTER_MS  = 6_000;

/** Messages one number should send in a rolling 24h without drawing attention.
    Well under the 250 tier — the tier is a hard cap, this is a safe cruising
    speed. Raise only after weeks of clean delivery. */
export const SAFE_DAILY_LIMIT = 120;

let lastSendAt = 0;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function pace() {
  const gap = MIN_GAP_MS + Math.floor(Math.random() * JITTER_MS);
  const wait = lastSendAt + gap - Date.now();
  if (wait > 0) await sleep(wait);
  lastSendAt = Date.now();
}

/** Seconds one message costs, worst case — lets callers size a batch to fit
    inside a serverless invocation instead of being killed mid-run. */
export const SECONDS_PER_MESSAGE = (MIN_GAP_MS + JITTER_MS) / 1000;

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

/* Backoff is measured in tens of seconds, not seconds: when Meta says
   "slow down", answering immediately is how a throttle becomes a block. */
const BACKOFF_MS = [15000, 45000, 120000];

/* ── Asynchronous failures ───────────────────────────────────────────────
   The retry loop above only ever sees errors Meta returns *from the send
   call*. The failures that actually cost us guests do not arrive that way:
   Meta answers 200 with a message id, and reports "Spam Rate limit hit"
   through the webhook minutes later. Every one of those bypassed the retry
   logic entirely — 22 blocked messages in a single run, none retried once.

   These helpers let the webhook decide what deserves another attempt and
   when, so an async failure is no longer a silent dead end. */

/** True when a webhook-reported failure is worth sending again later. */
export function isRetryableFailure(err: string | null | undefined): boolean {
  const e = String(err ?? "").toLowerCase();
  if (!e) return false;
  /* Nothing about the recipient will change on a retry */
  if (e.includes("undeliverable")) return false;
  if (e.includes("invalid") || e.includes("not exist")) return false;
  return e.includes("spam")
      || e.includes("rate limit")
      || e.includes("healthy ecosystem")
      || e.includes("experiment")
      || e.includes("try again")
      || e.includes("temporar");
}

/* Hours, not minutes. A number that just tripped the spam heuristic needs to
   look quiet for a while; retrying in five minutes is how a throttle becomes
   a ban. The last step is a full day later. */
const RETRY_DELAYS_H = [2, 8, 24];

/** When to try again, or null once the attempts are exhausted. */
export function nextRetryAt(retryCount: number): Date | null {
  const h = RETRY_DELAYS_H[retryCount];
  return h === undefined ? null : new Date(Date.now() + h * 3_600_000);
}

export const MAX_RETRIES = RETRY_DELAYS_H.length;


export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  templateName: string;
  templateLang: string;
  /** Public URL of the template's header image (Meta re-fetches it per send) */
  headerImageUrl: string;
  /** Generic template whose body text is filled per couple */
  genericTemplateName: string;
}

/** The four body variables of the generic invitation template */
export interface EventDetails {
  couple: string;   // "דביר בן ברוך ומירב ברון"
  date: string;     // "יום שני, י״א אלול — 24.08.2026"
  venue: string;    // "אולמי גאיה, רחוב האומן 12, חדרה"
  times: string;    // "קבלת פנים 19:00 | חופה וקידושין 20:00"
}

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return null;

  return {
    phoneNumberId,
    accessToken,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME ?? "wedding_invitation_regalifnei",
    genericTemplateName: process.env.WHATSAPP_TEMPLATE_GENERIC ?? "wedding_invitation_v2",
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
  details?: EventDetails,
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
    last = await sendOnce(cfg, to, token, image, details);
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
  details?: EventDetails,
): Promise<SendResult> {

  /* With details we use the generic template and fill its four variables;
     without them we fall back to the fixed template built for Dvir's own
     wedding, whose names and date are baked into the approved text. */
  const useGeneric = !!details;
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: useGeneric ? cfg.genericTemplateName : cfg.templateName,
      language: { code: cfg.templateLang },
      components: [
        {
          type: "header",
          parameters: [{ type: "image", image: { link: image } }],
        },
        ...(details ? [{
          type: "body",
          parameters: [
            { type: "text", text: details.couple },
            { type: "text", text: details.date },
            { type: "text", text: details.venue },
            { type: "text", text: details.times },
          ],
        }] : []),
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
