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

   Six seconds did not buy that window, though — it only looked like it. A
   webhook failure arrives MINUTES after the send call returns, so no gap short
   enough to fit inside a 60-second invocation ever sees one. What six seconds
   did buy was a hard ceiling of five messages per run: floor((60 - 12) / 9).
   Two scheduled runs a day made the automatic sender's real capacity TEN
   MESSAGES A DAY — an order of magnitude below what Meta permitted even while
   restricting us, and the reason 55 guests were still sitting with nothing
   while every screen reported a healthy system.

   The original intent is served properly by sending in small concurrent
   batches and re-reading the outcome between them: a 131048 in the first batch
   stops the second, which is the only failure worth reacting to mid-run. Cloud
   API permits 80 messages a second, so any of these numbers is orders of
   magnitude below the throughput limit and none has ever produced a 130429.

   Why these values and not the fastest ones that fit.

   Rate is not what gets a number restricted — 131048 comes from recipients
   blocking and reporting, and the failure table above shows the restriction
   already in place at 11:00 regardless of spacing. But spacing does bound the
   BLAST RADIUS, and that is worth paying for: a restriction that arrives after
   twelve sends costs twelve guests, the same restriction during a burst of
   sixty costs sixty. Four seconds a message with two in flight puts ~24 into a
   single invocation — enough that the day's allowance is reachable, slow
   enough that a bad run is a small run.

   Spreading across the DAY is a scheduling problem, not a pacing one, and the
   answer is more runs rather than slower ones: this function cannot outlive its
   60-second maxDuration no matter how patient the gap is.

   Four in flight rather than two, for a scheduling reason rather than a pacing
   one. The daily cap is 90 and a run fits floor(48 / 4) * CONCURRENCY, so at
   two the run holds 24 and the day needs four scheduled runs — but Vercel's
   Hobby plan grants two. Every route to more runs cost something real: a third
   service holding CRON_SECRET, or a scheduler that had never once fired. At
   four the run holds 48, two runs cover 96, and the cap is reached with the one
   scheduler that has actually delivered messages.

   The cost is shape, not volume: two bursts a day instead of a trickle. That
   is acceptable because rate is not what restricts a number — 131048 comes
   from recipients reporting — and because the run re-checks between batches, so
   a restriction is caught within four sends rather than at the end. */
const MIN_GAP_MS = 2_500;
const JITTER_MS  = 1_500;

/** Sends allowed in flight at once — see the pacing note above.

    Six rather than four so that two scheduled runs can reach the daily cap.
    At four a run held 48 and the day held 96, while Meta's cap had grown to
    118 — the difference was simply never sent, and a third run is not
    available: Vercel's Hobby plan grants two cron jobs.

    This raises how fast the day's allowance is spent, never the allowance
    itself. The cap, the rolling window and the warm-up ramp are unchanged and
    still decide how many messages exist to send; this only stops the clock
    from being the thing that limits them. A run still finishes in 48 seconds,
    inside the same 60-second budget it always had. */
export const SEND_CONCURRENCY = 6;

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

/* Templates whose only buttons are quick replies.

   A quick reply is fixed at approval time and carries nothing per message, so
   these take no button component at all — sending the url component built for
   the older templates is rejected outright, and every message in the run would
   fail together. Listed explicitly rather than inferred from the name: an
   unrecognised template falls back to the url shape, which is what every
   template before these two used. */
const QUICK_REPLY_TEMPLATES = new Set([
  "wedding_reminder_buttons_v1",
  "wedding_reminder_buttons_generic",
]);

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
  /* The ceiling is an argument rather than a constant because Meta moves it.
     Omitted, it falls back to the hardcoded floor, so every existing caller
     keeps the behaviour it had. */
  cap: number = ROLLING_24H_RECIPIENT_CAP,
): Promise<WindowUsage> {
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { data, error } = await sb
    .from("wa_messages").select("wa_phone")
    .eq("direction", "out").gte("created_at", since)
    .returns<{ wa_phone: string }[]>();
  if (error || !data) return { recipients: cap, remaining: 0, blocked: true };

  const recipients = new Set(data.map(r => r.wa_phone).filter(Boolean)).size;
  const remaining = Math.max(0, cap - recipients);
  return { recipients, remaining, blocked: remaining === 0 };
}


/* ── What Meta will actually let us do today ─────────────────────────────

   Every ceiling above this line is a number I typed on the afternoon the
   number was restricted, and a number typed on the worst day is wrong in both
   directions. It throttled us to a tenth of the real allowance once the
   restriction lifted — quality_rating went back to GREEN and nobody noticed
   for two days — and it would have gone on sending at exactly the same rate
   had the restriction deepened instead.

   Meta publishes the answer on every one of these, and we were not reading it:

     health_status.can_send_message   BLOCKED | LIMITED | AVAILABLE, plus the
                                      reason: display name not yet approved,
                                      business verification not passed
     quality_rating                   GREEN | YELLOW | RED, from recipient
                                      blocks and reports over the last 7 days
     messaging_limit_tier             the nominal ceiling for the window

   Reading those three before each run is what makes the sender self-adjusting:
   it raises its own limit the morning the display name is approved, and lowers
   it the morning recipients start reporting — with nobody editing this file on
   either day.

   Fails closed. Any network error, any missing field, any tier string Meta
   invents later, and we return the hardcoded floor that is already known to be
   survivable. A sender that guesses high when it cannot see is how this number
   got restricted in the first place. */

export type SendPosture = "blocked" | "limited" | "open";

export interface AccountHealth {
  posture: SendPosture;
  quality: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  /** Nominal ceiling Meta advertises for the rolling window */
  tier: number;
  /** What we will actually allow ourselves, after posture and quality */
  cap: number;
  /** Plain Hebrew, for the admin screen and the cron's own response */
  reasons: string[];
}

const TIER_CEILING: Record<string, number> = {
  TIER_50: 50, TIER_250: 250, TIER_1K: 1_000,
  TIER_10K: 10_000, TIER_100K: 100_000, TIER_UNLIMITED: 100_000,
};

/** The cap we know from experience is survivable while Meta is still gating
    us — 60 recipients, against the 82 at which 131048 first appeared. */
const FLOOR_CAP = ROLLING_24H_RECIPIENT_CAP;

export async function fetchAccountHealth(cfg: WhatsAppConfig): Promise<AccountHealth> {
  const unknown = (why: string): AccountHealth => ({
    posture: "limited", quality: "UNKNOWN", tier: FLOOR_CAP,
    cap: FLOOR_CAP, reasons: [why],
  });

  let json: Record<string, unknown>;
  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${cfg.phoneNumberId}` +
      `?fields=health_status,quality_rating,messaging_limit_tier`,
      {
        headers: { Authorization: `Bearer ${cfg.accessToken}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return unknown(`מטא לא השיבה (${res.status}) — נשארים בתקרת הבטיחות`);
    json = await res.json();
  } catch {
    return unknown("לא הצלחנו לקרוא את מצב החשבון במטא — נשארים בתקרת הבטיחות");
  }

  const quality = (["GREEN", "YELLOW", "RED"] as const)
    .find(q => q === json.quality_rating) ?? "UNKNOWN";
  const tier = TIER_CEILING[String(json.messaging_limit_tier)] ?? FLOOR_CAP;

  /* can_send_message at the top level is the roll-up, but the reason lives on
     the individual entities — the phone number, the WABA, the business and the
     app each answer separately, and it is the BUSINESS entity that carries
     141010. Reporting the roll-up without the reason is how "LIMITED" looked
     for weeks like something we had done wrong. */
  const hs = (json.health_status ?? {}) as {
    can_send_message?: string;
    entities?: { can_send_message?: string; errors?: { error_description?: string }[];
                 additional_info?: string[] }[];
  };
  const reasons: string[] = [];
  for (const e of hs.entities ?? []) {
    if (e.can_send_message === "AVAILABLE") continue;
    /* SIP/calling errors ride along on the same payload and say nothing about
       whether a template can be delivered. */
    (e.errors ?? []).forEach(err => {
      const d = err.error_description ?? "";
      if (!/SIP|calling/i.test(d)) reasons.push(d);
    });
    (e.additional_info ?? []).forEach(i => reasons.push(i));
  }

  const roll = hs.can_send_message;
  const posture: SendPosture =
    roll === "AVAILABLE" ? "open" : roll === "BLOCKED" ? "blocked" : "limited";

  /* LIMITED is not a number, it is a reason — "business not verified" — and the
     published ceiling for the tier still applies underneath it. Clamping
     LIMITED to FLOOR_CAP, as this first did, threw away both the tier AND the
     warm-up ramp below, which exists precisely so a cap can be raised without
     guessing: it pinned us to 60 a day on a GREEN number whose tier says 250,
     which is the same mistake as the hardcoded constants it replaced, made one
     level further in.

     The ramp is what keeps this safe, and quality is what overrides it. The
     tier is a ceiling, never a target. */
  let cap = posture === "blocked" ? 0 : tier;

  /* Quality is the only signal that reflects what RECIPIENTS think, and it is
     the one that precedes a restriction rather than following it. YELLOW is
     the warning shot 131048 gives before it arrives. */
  if (quality === "RED") {
    cap = 0;
    reasons.push("דירוג האיכות אדום — עצירה מלאה עד שיתאושש");
  } else if (quality === "YELLOW") {
    cap = Math.floor(cap / 2);
    reasons.push("דירוג האיכות צהוב — חצי תקרה");
  }

  return { posture, quality, tier, cap, reasons };
}

/** Warm-up.

    A number that sent 58 messages yesterday and 250 today looks to Meta's spam
    heuristics like a different business, and that is the exact shape that
    restricted us on 9/8 at 82 recipients while the advertised tier said 250.
    Growth is therefore capped at 1.6× the busiest of the recent days, with a
    floor low enough that a cold start can still move.

    This is the piece that makes "raise the limit" safe to do automatically:
    the ceiling can jump the moment Meta lifts a gate, but the actual send rate
    can only climb one day at a time. */
export const WARMUP_MULTIPLIER = 1.6;
export const WARMUP_COLD_START = 30;

/* The multiplier alone compounds, and compounding is the wrong shape here.

   From 56 it reaches Meta's ceiling in three days: 56 → 90 → 144 → 231 → 250.
   Each of those steps is justified only by the step before it, so a single
   unusual day — 11/8 went out at 93 because a silent command was started twice
   — becomes the floor everything after it grows from. 1.6× an accident is how
   an accident gets made permanent.

   Growth is therefore whichever is SMALLER: 1.6× at low volume, where a
   proportional step is small in absolute terms, or +25 recipients once the
   numbers get real. Linear rather than geometric, so every step stands on a
   full day that finished intact.

   Nothing is lost by it. The remaining work is about 182 messages: two days at
   90, a day and a half at 144. The larger cap buys half a day and spends it on
   ground nobody has walked — and 131048 does not restrict one guest, it stops
   every client for days. */
export const WARMUP_MAX_DAILY_STEP = 25;

export function warmupCap(health: AccountHealth, recentPeak: number): number {
  if (health.cap === 0) return 0;
  const ramp = Math.max(
    WARMUP_COLD_START,
    Math.min(
      Math.ceil(recentPeak * WARMUP_MULTIPLIER),
      recentPeak + WARMUP_MAX_DAILY_STEP,
    ),
  );
  return Math.min(health.cap, ramp);
}

/** Busiest CLEAN day in the recent past, in unique recipients — the input the
    ramp grows from.

    Clean matters more than busy. Our busiest day is 9/8 at 80 recipients, and
    9/8 is the day the number was restricted: growing 1.6× from there would set
    tomorrow's allowance at 128 by reasoning forward from a failure. A day that
    produced a 131048 is evidence of the ceiling, not of headroom, so it is
    excluded and the ramp grows from the busiest day that finished intact —
    10/8 at 56.

    Fails closed to 0, leaving the cold-start floor as the only allowance. */
export async function recentPeakRecipients(
  sb: SupabaseClient<never, "public", "public", never, never>,
  days = 7,
): Promise<number> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  /* `error` as well as `error_code`, because the rows that matter most predate
     the code column. Every one of the 28 failures on 9/8 — the day this ramp
     must not learn from — carries error_code NULL and the text "Spam Rate limit
     hit", and policyFor already knows how to read that. Selecting only the
     numeric column let the worst day in our history pass as a clean one. */
  const { data, error } = await sb
    .from("wa_messages").select("wa_phone, created_at, error_code, error")
    .eq("direction", "out").gte("created_at", since)
    .returns<{ wa_phone: string; created_at: string; error_code: number | null; error: string | null }[]>();
  if (error || !data) return 0;

  const burned = new Set<string>();
  for (const r of data) {
    if (policyFor(r.error_code, r.error).action === "stop_run") burned.add(r.created_at.slice(0, 10));
  }

  /* Today is excluded, and this is the whole safety of the ramp.

     It was not, and the consequence showed up within the hour: two runs a
     minute apart on 11/8: the first sent 48, that became the new peak, and the
     second granted itself a cap of 114 on the strength of what it had just
     done. 91 unique recipients went out in sixty seconds against a ceiling
     that had been 90 a moment earlier — and 82 is where this number was
     restricted on 9/8.

     A ramp that learns from the day it is governing does not limit that day at
     all; it ratifies it. Growth may only ever be justified by a day that
     finished intact, which means yesterday at the earliest. */
  const todayKey = new Date().toISOString().slice(0, 10);

  const byDay = new Map<string, Set<string>>();
  for (const r of data) {
    if (!r.wa_phone) continue;
    const d = r.created_at.slice(0, 10);
    if (burned.has(d) || d === todayKey) continue;
    (byDay.get(d) ?? byDay.set(d, new Set()).get(d)!).add(r.wa_phone);
  }
  return Math.max(0, ...[...byDay.values()].map(s => s.size));
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
  /* Approved reminder for guests who already have the invitation and have not
     answered. Same shape as the invitation — image header, one token variable
     in the URL button — so it goes through the same send path. */
  reminderTemplateName: string;
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
    /* The approved template with "מגיע" / "לא מגיע" quick replies.

       A tap answers the invitation without opening anything — which removes,
       in one stroke, every failure this system spent a day on: the page that
       hung, the submit with no timeout, the envelope nobody knew to tap. The
       plain template was still in use while this one sat approved and unused.

       Requires the webhook to record the taps. Sending buttons that nothing
       listens to is worse than sending none: the guest believes they have
       answered and we never know. */
    reminderTemplateName: process.env.WHATSAPP_TEMPLATE_REMINDER ?? "wedding_reminder_buttons_v1",
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
  /* "reminder" is for guests whose invitation is confirmed delivered and who
     have not answered. Sending the invitation again to them reads as a system
     that lost track of them; sending it to someone who never received one is
     the whole job. The two must not share a template. */
  kind: "invitation" | "reminder" = "invitation",
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
    last = await sendOnce(cfg, to, token, image, details, kind);
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
  kind: "invitation" | "reminder" = "invitation",
): Promise<SendResult> {

  /* With details we use the generic template and fill its four variables;
     without them we fall back to the fixed template built for Dvir's own
     wedding, whose names and date are baked into the approved text. */
  const useGeneric = !!details;
  const templateName =
    kind === "reminder" ? cfg.reminderTemplateName
    : useGeneric        ? cfg.genericTemplateName
    :                     cfg.templateName;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
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
        /* Quick-reply buttons take no parameters — they are fixed at approval
           time and carry nothing per-message. Sending a url button component
           for one of those templates is rejected outright, so every message in
           the run would fail. The list above is explicit rather than inferred
           from the name: an unrecognised template falls back to the url shape,
           which is what every template before these two used. */
        ...(QUICK_REPLY_TEMPLATES.has(templateName) ? [] : [{
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: token }],
        }]),
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
