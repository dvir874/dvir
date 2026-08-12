import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerClient } from "@/lib/supabase-server";
import { handleGuestReply } from "@/lib/wa-conversation";
import { isRetryableFailure, nextRetryAt } from "@/lib/whatsapp";

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

/* Meta signs every delivery with HMAC-SHA256 of the RAW body.
 *
 * Without this check the endpoint accepted anything: a forged messages[]
 * payload carrying "מגיע" moved a real guest from pending to confirmed and
 * wrote an rsvp_submitted event, indistinguishable from a genuine reply. Guest
 * phone numbers are not secret — they are on the invitations — so anyone could
 * have rewritten the caterer's headcount.
 *
 * The comparison is constant-time. A === on a hex digest leaks, one byte at a
 * time, how much of a guess was right.
 */
function verifyMetaSignature(raw: string, header: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", secret).update(raw, "utf8").digest();
  let received: Buffer;
  try {
    received = Buffer.from(header.slice(7), "hex");
  } catch { return false; }

  /* timingSafeEqual throws on a length mismatch, which would itself be a
     timing signal — so the lengths are compared first and equally. */
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export async function POST(req: NextRequest) {
  /* Always 200 — a non-200 makes Meta retry and eventually disable the hook */
  try {
    /* The raw text, before anything parses it. HMAC over a re-serialised
       object would compare a different byte sequence and never match. */
    const raw = await req.text();

    if (!verifyMetaSignature(raw, req.headers.get("x-hub-signature-256"))) {
      /* Still 200: a 4xx here teaches Meta the endpoint is broken and it
         eventually stops delivering. Refused, logged, and nothing is written. */
      console.warn("[wa:webhook] rejected — signature missing or invalid");
      return NextResponse.json({ ok: true });
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

    /* Which of these we have never seen before.
     *
     * Meta redelivers on timeout, and until today this file had no fetch
     * timeout at all — so redelivery was likely, and handleGuestReply ran again
     * on each one: a second confirmation message to the guest and a duplicate
     * guest_events row. wa_messages was already idempotent; the business logic
     * was not.
     *
     * The database decides, not a local Set: two retries can arrive at two
     * instances at the same moment and both would pass an in-memory check.
     * A plain insert either wins the unique index on wamid or conflicts. */
    const firstSeen = new Set<string>();
    for (const row of inbound) {
      if (!row.wamid) continue;
      const { error: dupErr } = await sb.from("wa_messages").insert(row).select("id");
      if (!dupErr) firstSeen.add(row.wamid);
    }

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
    for (const m of messages) {
      const g = byPhone.get(localise(m.from ?? ""));
      if (!g?.id || !m.from) continue;
      /* A redelivery of a tap already acted on. Storing it again is harmless;
         answering it again is not. */
      if (m.id && !firstSeen.has(m.id)) continue;
      try {
        await handleGuestReply(sb, g.id, m.from, bodyOf(m), m.button?.payload);
      } catch { /* this guest's tap is unhandled; the next one need not be */ }
    }
  } catch {
    /* Swallow — never let a malformed payload disable the subscription */
  }
  return NextResponse.json({ ok: true });
}
