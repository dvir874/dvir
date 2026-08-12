/* Recording what went wrong, from inside the catch that used to drop it.
 *
 * Every rule in this file exists because of one day. On 12/08 the live system
 * reported success five separate times where there had been none — a swallowed
 * catch in the webhook, a "סיימת" over eleven waiting guests, a request race
 * that emptied a queue, a green "✅ נשלחו 0", and three phone numbers stored in
 * a shape that silently detached guests from their own replies. Not one of them
 * left a trace. Dvir found all five by eye, and each cost him an hour.
 *
 * So the contract here is narrow and absolute:
 *
 *   recordFailure never throws.
 *   recordFailure never blocks the caller's own recovery.
 *   If the database write fails, the failure still gets out — to the log.
 *
 * A failure recorder that can itself fail silently is the bug it was written to
 * fix, one level up.
 */

/* The writer is an interface, not a Supabase client, so the guarantees above can
   actually be tested — including the case where the write throws. */
export interface FailureWriter {
  insert(row: Record<string, unknown>): Promise<{ error?: unknown } | void>;
}

export interface FailureInput {
  scope: FailureScope;
  error: unknown;
  runId?: string;
  eventId?: string | null;
  guestId?: string | null;
  ref?: string | null;
  /* Anything that helps answer "why" later. Keep it small — this is written on
     a path that is already going badly. */
  context?: Record<string, unknown>;
  /* Meta's numeric error code, when the failure came from the provider. It is
     the only thing that separates an account-level emergency from an
     unavoidable one percent. */
  code?: number | null;
}

export type FailureScope =
  | "webhook.reply"
  | "webhook.status"
  | "webhook.unmatched"
  | "cron.send"
  | "admin.send"
  | "conversation";

export type FailureKind =
  | "provider_terminal"   /* the provider will never accept this — do not retry */
  | "provider_retryable"  /* throttling, 5xx, network — retry is meaningful */
  | "unmatched"           /* a real reply we could not attach to a guest */
  | "lookup"              /* a database read failed; we acted on partial truth */
  | "internal";           /* our own code threw */

/* Meta codes that are settled facts about a recipient, not transient trouble.
 *
 * 131026 the number has no WhatsApp · 131049 the recipient's marketing cap ·
 * 131050 opted out · 131048 the SENDING number is restricted.
 *
 * Retrying any of these spends quota to earn the same answer. Three guests hit
 * 131049 on the evening of 12/08; every future attempt to reach them through
 * the API is arithmetic with a known result, and the only route left is a
 * person sending from their own phone. */
const TERMINAL_CODES = new Set([131026, 131048, 131049, 131050]);

export function classify(input: { error: unknown; code?: number | null }): FailureKind {
  if (typeof input.code === "number") {
    return TERMINAL_CODES.has(input.code) ? "provider_terminal" : "provider_retryable";
  }
  const text = messageOf(input.error).toLowerCase();
  if (!text) return "internal";
  if (/rate|throttl|429|timeout|timed out|econnreset|socket|fetch failed|502|503|504/.test(text)) {
    return "provider_retryable";
  }
  if (/lookup_failed|dedupe|postgrest|column .* does not exist|relation .* does not exist/.test(text)) {
    return "lookup";
  }
  return "internal";
}

/* Errors arrive as Error, string, PostgrestError, or something Meta invented.
   Whatever it is, we want text — never "[object Object]" in the one column a
   human will read at two in the morning. */
export function messageOf(error: unknown): string {
  if (error == null) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === "object") {
    const o = error as Record<string, unknown>;
    for (const k of ["message", "error", "details", "hint", "title"]) {
      if (typeof o[k] === "string" && o[k]) return o[k] as string;
    }
    try { return JSON.stringify(error).slice(0, 500); } catch { return "unserialisable error"; }
  }
  return String(error);
}

/* One id per invocation. A cron run that fails forty times is one incident.
   Correlating them afterwards by timestamp is guesswork, and guesswork about
   which failures belong together is how you fix the wrong one. */
export function newRunId(prefix = "run"): string {
  const rand = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

/* The fallback. If the row cannot be written, the failure is still not allowed
   to disappear — it goes to the log as one line of JSON, which is greppable in
   Vercel's log search and survives the database being the thing that is broken.
   Deliberately console.error and not console.log: this is never routine. */
function logFallback(row: Record<string, unknown>, why: unknown): void {
  try {
    console.error(JSON.stringify({ wa_failure_fallback: row, write_error: messageOf(why) }));
  } catch { /* nothing left to try, and throwing here would defeat the purpose */ }
}

export async function recordFailure(
  writer: FailureWriter | null | undefined,
  input: FailureInput,
): Promise<void> {
  const row = {
    run_id: input.runId ?? null,
    scope: input.scope,
    kind: classify(input),
    event_id: input.eventId ?? null,
    guest_id: input.guestId ?? null,
    ref: input.ref ?? null,
    /* Bounded on the way in. An error that is a megabyte of HTML is a failure
       we would rather store truncated than not at all. */
    error: messageOf(input.error).slice(0, 2000),
    context: { ...(input.context ?? {}), ...(input.code != null ? { code: input.code } : {}) },
  };

  if (!writer) { logFallback(row, "no writer"); return; }

  try {
    const res = await writer.insert(row);
    /* Supabase reports failure by returning an error, not by throwing — the
       difference that made a "successful" write of nothing look like a success
       everywhere else in this codebase. */
    if (res && "error" in res && res.error) logFallback(row, res.error);
  } catch (e) {
    logFallback(row, e);
  }
}

/* Convenience binding for the Supabase client used across the routes, so call
   sites stay one line and nobody is tempted to skip recording because wiring it
   up was three lines of noise inside a catch block. */
type InsertableClient = {
  from: (table: string) => { insert: (row: Record<string, unknown>) => PromiseLike<{ error: unknown }> };
};

export function failureWriter(sb: unknown): FailureWriter {
  /* One deliberate cast, here and nowhere else. Supabase's generated insert
     signature is narrower than the row shape we build, and the alternative is
     dragging generated database types through a module whose whole job is to
     work when other things are broken. The cast is confined to this line; the
     FailureWriter interface above is what the rest of the file is tested
     against. */
  const client = sb as InsertableClient;
  return {
    insert: async (row) => {
      const { error } = await client.from("wa_failures").insert(row);
      return { error };
    },
  };
}
