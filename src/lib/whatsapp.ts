/* WhatsApp Cloud API client (Meta, no BSP middleman).

   Used by the admin send station to deliver RSVP invitations as approved
   template messages. Unlike the wa.me flow, a template carries a real image
   header that always renders — WhatsApp never has to crawl our page for a
   link preview, so the invitation art is guaranteed to show.

   Configuration lives entirely in env; if it is absent every call returns a
   disabled result and the caller falls back to the manual wa.me flow. Nothing
   here can break the existing send station. */

import type { SupabaseClient } from "@supabase/supabase-js";

const API_VERSION = "v21.0";

/* ── Throughput guard ────────────────────────────────────────────────────
   Meta throttles new numbers hard: a burst of 66 invitations produced three
   "Spam Rate limit hit" failures. Guests never learn a message was blocked,
   so the only acceptable behaviour is to go slower than the limit and retry
   anything that still bounces. Minutes of extra wall-clock are cheap; a
   wedding guest who never got an invitation is not. */

/* Pacing — and what it is actually for.

   An earlier version of this comment claimed Meta's spam heuristic reacts to
   the day's cumulative volume, and set a 20-second gap on that basis. The
   failure data says otherwise:

     09:00  67 sent   5 failed  ( 7%)   mixed causes
     10:00   1 sent   1 failed  (100%)  131048
     11:00  20 sent  18 failed  ( 90%)  13× 131048
     15:00   9 sent   4 failed  ( 44%)   4× 131048

   131048 is a restriction on OUR NUMBER, raised because recipients blocked or
   reported earlier messages. It is not a rate. The daily cap of 120 never
   stopped anything — we sent 100 — and by 11:00 the number was already
   restricted, so every further send failed regardless of spacing. Cloud API
   permits 80 messages/second; at one per 20 seconds we were ~1600× under the
   throughput limit and never once saw 130429.

   So why keep a gap at all? A different reason, and the honest one: delivery
   failures arrive by webhook minutes after the send call returns 200. The gap
   buys time for the first failure to be reported before the rest of the list
   has already gone out. It is an observability window, not a spam defence.

   Six seconds is enough for that and keeps a batch inside one serverless
   invocation. At the old 20s, SECONDS_PER_MESSAGE was 26 and the send route's
   time budget computed to exactly ONE message per request — 550 guests would
   have needed 550 clicks. */
const MIN_GAP_MS = 6_000;
const JITTER_MS  = 3_000;

/* What Meta actually counts, measured rather than assumed.

   The API advertises messaging_limit_tier TIER_250, but health_status returned
   BLOCKED with error 141015 — "reached the limit for business-initiated
   conversations for this 24 hour rolling period" — at 82 unique recipients.
   The advertised 250 belongs to a verified business; ours has
   business_verification_status = not_verified and its real ceiling is far
   lower. 141010 sits alongside it in the same payload.

   Two things follow, and the second is what the old code got wrong:

   1. The ceiling is ~82 until Business Verification passes. 25/day keeps at
      most ~50 recipients inside any 24h window — 40% below where we broke.
   2. The unit is UNIQUE RECIPIENTS IN A ROLLING 24 HOURS, not messages since
      midnight. Counting messages per calendar day, as SAFE_DAILY_LIMIT did,
      measures something Meta does not enforce: three retries to one guest
      spent three units of a budget that Meta charges one for, while a batch
      sent at 23:00 and another at 01:00 looked like two separate days to us
      and like one window to Meta. */
export const SAFE_DAILY_LIMIT = 25;

/** Hard stop. Above this many unique recipients in the rolling window, Meta
    starts refusing — observed at 82, so this leaves real headroom. */
export const ROLLING_24H_RECIPIENT_CAP = 60;

/** Concentration is the part the failure data could not rule out, so it keeps
    its own limit. Enforce it with a query, never with the module-level clock
    below: each serverless invocation starts a fresh module, so lastSendAt does
    not survive between requests. */
export const MAX_PER_HOUR = 4;

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

/* What to do about a failure depends entirely on WHICH failure it is, and the
   four we see behave nothing alike:

     131048  restriction on OUR number, from recipient blocks and spam reports
     131049  the RECIPIENT's own cap on marketing templates, across all senders
     130472  the recipient is in Meta's marketing-experiment control group
     131026  the number cannot receive: wrong, not on WhatsApp, or terms unaccepted

   The previous policy — a 2h / 8h / 24h timer applied to all of them by
   substring match — was wrong in both directions. Meta documents that a
   marketing template must not be resent to a capped user for at least 24
   hours, and that retrying sooner may suppress delivery to them for a further
   24; the 2h step sat squarely inside that window. In the other direction it
   treated 130472 as retryable, so it queued attempts that cannot succeed on a
   timer no matter how long the timer is. */

export type FailureAction = "stop_run" | "retry_later" | "wait_for_inbound" | "never";

export interface FailurePolicy {
  action: FailureAction;
  /** Hours to wait, for retry_later */
  delayH?: number;
  maxAttempts?: number;
  human: string;
}

export function policyFor(code: number | null | undefined, err?: string | null): FailurePolicy {
  /* Fall back to the message text for rows written before error_code existed */
  const c = code ?? codeFromText(err);

  switch (c) {
    case 131048:
      /* The number itself is restricted. The next guest will fail too, so
         sending on is pure damage — stop and resume on a later day. */
      return { action: "stop_run", human: "המספר שלנו מוגבל — עצירת ההרצה" };
    case 131049:
      /* Meta: wait at least 24h. 26 leaves room for clock skew. */
      return { action: "retry_later", delayH: 26, maxAttempts: 2, human: "מכסת הנמען — ניסיון בעוד 26 שעות" };
    case 130472:
      /* No timer can fix this. It becomes sendable only inside a 24h window
         opened by the guest messaging us first. */
      return { action: "wait_for_inbound", human: "הנמען בקבוצת ניסוי — רק אם יכתוב לנו" };
    case 131026:
      return { action: "never", human: "המספר לא יכול לקבל — צריך אימות מול הזוג" };
    case 131050:
      return { action: "never", human: "הנמען ביקש להפסיק לקבל — לעולם לא לשלוח שוב" };
    default:
      return { action: "never", human: "כשל לא מסווג — לטיפול ידני" };
  }
}

/* Rows written before error_code was captured only have Meta's title text. */
function codeFromText(err: string | null | undefined): number | null {
  const e = String(err ?? "").toLowerCase();
  if (!e) return null;
  if (e.includes("spam") || e.includes("rate limit")) return 131048;
  if (e.includes("healthy ecosystem")) return 131049;
  if (e.includes("experiment")) return 130472;
  if (e.includes("undeliverable")) return 131026;
  return null;
}

/** True when a webhook-reported failure should go on the retry timer. */
export function isRetryableFailure(code: number | null | undefined, err?: string | null): boolean {
  return policyFor(code, err).action === "retry_later";
}

/** When to try again, or null when this failure does not belong on a timer. */
export function nextRetryAt(
  retryCount: number,
  code: number | null | undefined,
  err?: string | null,
): Date | null {
  const p = policyFor(code, err);
  if (p.action !== "retry_later") return null;
  if (retryCount >= (p.maxAttempts ?? 1)) return null;
  return new Date(Date.now() + (p.delayH ?? 26) * 3_600_000);
}

export const MAX_RETRIES = 2;

/* Meta's send response carries a message_status we were discarding. Two of
   its three values mean the message may never arrive — treating them as
   success is how a held message looks identical to a delivered one. */
export const HELD_STATUSES = new Set(["held_for_quality_assessment", "paused"]);


export interface WindowUsage {
  /** Unique recipients messaged in the last 24 hours — the unit Meta enforces */
  recipients: number;
  /** How many more may be contacted before hitting our own ceiling */
  remaining: number;
  blocked: boolean;
}

/** Occupancy of the rolling 24h window, in the unit Meta actually counts.
    Fails closed: if the count cannot be read we report the window as full,
    because sending blind is what produced a 90%-failure run. */
export async function rollingWindowUsage(
  sb: SupabaseClient<never, "public", "public", never, never>,
): Promise<WindowUsage> {
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { data, error } = await sb
    .from("wa_messages").select("wa_phone")
    .eq("direction", "out").gte("created_at", since)
    .returns<{ wa_phone: string }[]>();
  if (error || !data) return { recipients: ROLLING_24H_RECIPIENT_CAP, remaining: 0, blocked: true };

  const recipients = new Set(data.map(r => r.wa_phone).filter(Boolean)).size;
  const remaining = Math.max(0, ROLLING_24H_RECIPIENT_CAP - recipients);
  return { recipients, remaining, blocked: remaining === 0 };
}

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
    /* Kept only so existing callers still typecheck; nothing reads it as a
       fallback any more. The comment used to say there was deliberately no
       fallback while three call sites did `?? cfg.headerImageUrl` — which is
       exactly how one couple's card would have reached another's guest list.
       The image now comes from events.wa_header_image_url or the send stops. */
    headerImageUrl: "",
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
  const image = headerImageUrl;
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
