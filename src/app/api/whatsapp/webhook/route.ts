import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { handleGuestReply } from "@/lib/wa-conversation";
import { isRetryableFailure, nextRetryAt } from "@/lib/whatsapp";
import { failureWriter, newRunId, recordFailure } from "@/lib/failures";

export const dynamic = "force-dynamic";

/* WhatsApp Cloud API webhook.

   Meta calls this for every status change on a message we sent
   (sent → delivered → read, or failed) and for every inbound reply.

   Why this exists: the send API only tells us Meta *accepted* a message.
   Acceptance is not delivery — a guest was once marked "sent" from the manual
   station and never actually received anything. These callbacks are the only
   source of truth for what really arrived.

   Everything lands in wa_messages: outbound rows get their status updated by
   wamid, inbound rows become the admin inbox. Writes degrade quietly if the
   table is missing so a half-applied migration can't break delivery. */

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "regalifnei-wa-hook";

/* Who is allowed to speak here.
 *
 * This endpoint took anyone's word for it. It is public by design — Meta has
 * to reach it — and it was never checking that Meta was the caller. An audit
 * on 18/08 sent two forged requests with no credential of any kind: the first
 * wrote a row, the second moved a guest from pending to confirmed and left a
 * guest_events row that looks exactly like a real answer.
 *
 * Guest phone numbers are not secret. They are printed on invitations and the
 * shuttle list shows names. So anyone could confirm or cancel any guest at any
 * wedding, and the number the caterer is given — 322 here, 550 at תהל — is
 * what would move.
 *
 * The fix is the signature Meta already sends and nobody read.
 *
 * THE RAMP. Getting this wrong is worse than the bug: a mistyped secret
 * rejects Meta itself, every RSVP stops being recorded, and it stops SILENTLY
 * five days before Dvir's wedding. So enforcement is not the default and
 * cannot be reached by accident —
 *
 *   no META_APP_SECRET          → today's behaviour exactly, nothing rejected
 *   secret set                  → verify, log the verdict, still process
 *   secret + ENFORCE=true       → reject what fails
 *
 * He turns it on after watching real callbacks report `ok` in the log, not
 * before. Always 200, at every stage: a rejection must look boring to Meta, or
 * Meta disables the hook and takes the real traffic with it. */
const APP_SECRET = process.env.META_APP_SECRET ?? "";
const ENFORCE = process.env.META_WEBHOOK_ENFORCE === "true";

async function signatureVerdict(
  raw: string, header: string | null,
): Promise<"unconfigured" | "ok" | "bad" | "missing"> {
  if (!APP_SECRET) return "unconfigured";
  if (!header?.startsWith("sha256=")) return "missing";
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const mine = createHmac("sha256", APP_SECRET).update(raw, "utf8").digest("hex");
  const theirs = header.slice(7);
  /* Same length before comparing — timingSafeEqual throws on a mismatch. */
  if (mine.length !== theirs.length) return "bad";
  return timingSafeEqual(Buffer.from(mine), Buffer.from(theirs)) ? "ok" : "bad";
}

/* GET — Meta's one-time subscription handshake */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === VERIFY_TOKEN) {
    return new NextResponse(p.get("hub.challenge") ?? "", { status: 200 });
  }
  return new NextResponse("forbidden", { status: 403 });
}

interface WaStatus {
  id?: string;
  status?: string;
  recipient_id?: string;
  errors?: { code?: number; title?: string; message?: string }[];
}
interface WaMedia { id?: string; mime_type?: string; caption?: string }
interface WaMessage {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string; payload?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
  /* Meta sends only an id; the file itself is fetched separately and expires.
     Storing "[video]" and dropping the id, as this used to, threw away the
     only handle to a guest's own evidence. */
  image?: WaMedia; video?: WaMedia; audio?: WaMedia;
  document?: WaMedia; sticker?: WaMedia;
}

function mediaOf(m: WaMessage): WaMedia | null {
  return m.image ?? m.video ?? m.audio ?? m.document ?? m.sticker ?? null;
}

/* Israeli numbers are stored locally (05X…) but arrive as 9725X… */
const localise = (wa: string) => (wa.startsWith("972") ? "0" + wa.slice(3) : wa);

/* Pull readable text out of whichever message shape Meta sent */
function bodyOf(m: WaMessage): string {
  return m.text?.body
    ?? m.button?.text
    ?? m.interactive?.button_reply?.title
    ?? m.interactive?.list_reply?.title
    ?? `[${m.type ?? "הודעה"}]`;
}

export async function POST(req: NextRequest) {
  /* Always 200 — a non-200 makes Meta retry and eventually disable the hook */
  try {
    /* The raw text, before anything parses it. HMAC is computed over the exact
       bytes Meta signed; JSON.stringify of a parsed object reorders keys and
       drops whitespace, so a check built on req.json() fails 100% of the time
       and would read as "Meta is forging its own callbacks". */
    const raw = await req.text();
    const verdict = await signatureVerdict(raw, req.headers.get("x-hub-signature-256"));

    if (verdict !== "ok" && verdict !== "unconfigured") {
      console.warn(`[webhook] signature ${verdict}${ENFORCE ? " — rejected" : " — observed only"}`);
      if (ENFORCE) return NextResponse.json({ ok: true });
    } else if (verdict === "ok" && !ENFORCE) {
      /* The line he is waiting to see before flipping the switch. */
      console.log("[webhook] signature ok");
    }

    const body = JSON.parse(raw);

    /* EVERY entry and EVERY change, not just the first of each.
       Meta batches: one POST can carry several entries, each with several
       changes. Reading entry[0].changes[0] processed the first and silently
       dropped the rest — and an account_update landing at index 0 voided the
       whole payload, statuses and replies together. Sixteen delivery reports
       were lost this way, which is why messages sat at "accepted" for 55 hours
       with nothing to age them out. */
    const values = (body?.entry ?? [])
      .flatMap((e: { changes?: { value?: unknown }[] }) => e?.changes ?? [])
      .map((c: { value?: unknown }) => c?.value)
      .filter(Boolean) as { statuses?: WaStatus[]; messages?: WaMessage[] }[];
    if (!values.length) return NextResponse.json({ ok: true });

    const statuses: WaStatus[] = values.flatMap(v => v.statuses ?? []);
    const messages: WaMessage[] = values.flatMap(v => v.messages ?? []);
    if (!statuses.length && !messages.length) return NextResponse.json({ ok: true });

    const sb = createServerClient();
    /* One id for this delivery. Meta batches, so a single POST can fail for
       several guests at once — that is one incident, not several. */
    const runId = newRunId("hook");

    /* Resolve phone numbers to guests in one query */
    const phones = [...statuses.map(s => s.recipient_id), ...messages.map(m => m.from)]
      .filter(Boolean)
      .map(p => localise(p as string));

    const { data: guests } = phones.length
      ? await sb.from("guests").select("id, event_id, phone").in("phone", [...new Set(phones)])
      : { data: [] };
    const byPhone = new Map((guests ?? []).map(g => [g.phone, g]));

    /* ---- delivery status on messages we sent ---- */
    for (const s of statuses) {
      if (!s.id || !s.status) continue;
      /* Per-status isolation. A single throw used to abandon every remaining
         status AND the whole inbound block, and still answer 200 — so Meta
         never retried and the rest of the batch was gone for good. */
      try {
      const err = s.errors?.[0]?.title ?? s.errors?.[0]?.message ?? null;
      /* The numeric code is the only thing that distinguishes an account-level
         emergency (131048) from an unavoidable 1% (130472). Storing just the
         title made both look like one undifferentiated failure, and every
         policy built on top applied the wrong response to one of them. */
      const code = s.errors?.[0]?.code ?? null;

      /* A failure reported here is the ONLY notice we get that a guest never
         received their invitation — the send call already returned success.
         Schedule another attempt rather than let it die in a status column. */
      let retry: Record<string, unknown> = {};
      if (s.status === "failed" && isRetryableFailure(code, err)) {
        const { data: prev } = await sb
          .from("wa_messages").select("retry_count").eq("wamid", s.id).maybeSingle();
        const when = nextRetryAt(prev?.retry_count ?? 0, code, err);
        if (when) retry = { retry_after: when.toISOString() };
      }

      const base = {
        status: s.status, error: err, error_code: code,
        updated_at: new Date().toISOString(),
      };
      /* .select() so we can see how many rows were actually touched. Without
         it PostgREST reports success for updating nothing, which is exactly
         what happens when the report wins the race against the INSERT that
         records the send. */
      const { data: hit, error } = await sb
        .from("wa_messages").update({ ...base, ...retry }).eq("wamid", s.id).select("id");

      /* error_code and the retry columns arrive by migration. Until each has
         run, recording the delivery status still matters more than the extras
         — fall back rather than lose the status entirely. */
      let rows = hit?.length ?? 0;
      if (error) {
        const { data: hit2 } = await sb.from("wa_messages")
          .update({ status: s.status, error: err, updated_at: new Date().toISOString() })
          .eq("wamid", s.id).select("id");
        rows = hit2?.length ?? 0;
      }

      /* No such message yet. The row is written after the send call returns and
         Meta can report delivery in milliseconds, so the report sometimes
         arrives first — and this is the ONLY notice we ever get that a guest
         did or did not receive their invitation. Park it; the scheduled sender
         applies it later. Late is fine, lost is not. */
      if (!rows) {
        await sb.from("wa_status_orphans").upsert({
          wamid: s.id, status: s.status, error: err, error_code: code,
        }, { onConflict: "wamid" });
      }
      } catch { /* this status is lost; the next one need not be */ }
    }

    /* ---- inbound replies ---- */
    const inbound = messages.map(m => {
      const g = byPhone.get(localise(m.from ?? ""));
      const media = mediaOf(m);
      return {
        event_id: g?.event_id ?? null,
        guest_id: g?.id ?? null,
        wa_phone: m.from ?? "",
        direction: "in",
        body: media?.caption?.trim() || bodyOf(m),
        wamid: m.id ?? null,
        status: "received",
        media_id: media?.id ?? null,
        media_mime: media?.mime_type ?? null,
      };
    }).filter(r => r.wa_phone);

    if (inbound.length) {
      const { error } = await sb.from("wa_messages").upsert(inbound, { onConflict: "wamid" });
      /* The media columns arrive by migration. Until it has run, keeping the
         message matters more than keeping the attachment. */
      if (error) {
        await sb.from("wa_messages").upsert(
          inbound.map(({ media_id: _m, media_mime: _t, ...rest }) => rest),
          { onConflict: "wamid" },
        );
      }
    }

    /* ---- answering by tapping a button ----

       The reminder template carries "מגיע" / "לא מגיע" quick replies, and a tap
       arrives here as an ordinary inbound message. Without this it was stored
       in the inbox and nothing else: the guest would believe they had answered
       and the couple would never know — the exact failure that cost a whole day
       when a page hung and a guest thought she had replied.

       Recording happens after the message is stored, so a tap is never lost
       even if the exchange below fails, and each guest is isolated so one
       failure cannot swallow the rest of the batch. */
    /* Every outcome is written down, including the ones that go wrong.
     *
     * This loop used to end in `catch {}` with a comment explaining that one
     * guest's failure must not swallow the batch. That part was right. What it
     * left out is that the failure was not recorded anywhere either — and the
     * message row is written above, so the tap appears in the inbox looking
     * perfectly handled while the guest stays pending for ever.
     *
     * On 12/08 that cost eight guests. עומר tapped לא מגיע and was recorded in
     * one second; עדיאל sent the identical two messages six hours later and
     * nothing happened at all. Same input, opposite outcome, no trace of the
     * difference — so there was nothing to debug, and Dvir marked them by hand
     * in two batches of five and three without knowing why he had to.
     *
     * Answers are not something we can afford to drop quietly. If handling
     * throws we retry once, and whatever happens we leave a row saying so. */
    /* Last night this wrote into wa_runs with sent:0 and a reply_* reason,
       because there was nowhere else. wa_runs is the cron's run log, and every
       future reader of "did the send run?" would have had to know to filter
       rows that are not runs. wa_failures is that debt paid back. */
    const w = failureWriter(sb);

    for (const m of messages) {
      const g = byPhone.get(localise(m.from ?? ""));
      if (!m.from) continue;
      if (!g?.id) {
        /* Answered from a number that is not on the list. Previously a silent
           `continue`: the reply sat in the inbox under the sender's WhatsApp
           profile name, indistinguishable from a guest who had been counted. */
        await recordFailure(w, {
          scope: "webhook.unmatched", runId, ref: m.from,
          error: "reply from a number that is not on any guest list",
          context: { body: bodyOf(m).slice(0, 120) },
        });
        continue;
      }
      try {
        await handleGuestReply(sb, g.id, m.from, bodyOf(m), m.button?.payload);
      } catch (e1) {
        /* One retry. The most likely cause is a slow or throttled Graph call
           inside the exchange — the evening batch failed in the minutes right
           after the cron pushed 72 messages — and that kind of failure usually
           does not repeat a second later. */
        try {
          await handleGuestReply(sb, g.id, m.from, bodyOf(m), m.button?.payload);
          await recordFailure(w, {
            scope: "webhook.reply", runId, guestId: g.id, eventId: g.event_id, error: e1,
            context: { recovered: true },
          });
        } catch (e2) {
          await recordFailure(w, {
            scope: "webhook.reply", runId, guestId: g.id, eventId: g.event_id, error: e2,
            context: { recovered: false, attempts: 2 },
          });
        }
      }
    }
  } catch {
    /* Swallow — never let a malformed payload disable the subscription */
  }
  return NextResponse.json({ ok: true });
}
