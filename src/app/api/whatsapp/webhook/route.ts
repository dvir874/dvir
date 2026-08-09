import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
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
  errors?: { title?: string; message?: string }[];
}
interface WaMessage {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
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
    const body = await req.json();
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    if (!value) return NextResponse.json({ ok: true });

    const statuses: WaStatus[] = value.statuses ?? [];
    const messages: WaMessage[] = value.messages ?? [];
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
      const err = s.errors?.[0]?.title ?? s.errors?.[0]?.message ?? null;

      /* A failure reported here is the ONLY notice we get that a guest never
         received their invitation — the send call already returned success.
         Schedule another attempt rather than let it die in a status column. */
      let retry: Record<string, unknown> = {};
      if (s.status === "failed" && isRetryableFailure(err)) {
        const { data: prev } = await sb
          .from("wa_messages").select("retry_count").eq("wamid", s.id).maybeSingle();
        const count = prev?.retry_count ?? 0;
        const when = nextRetryAt(count);
        if (when) retry = { retry_after: when.toISOString() };
      }

      const base = { status: s.status, error: err, updated_at: new Date().toISOString() };
      const { error } = await sb
        .from("wa_messages").update({ ...base, ...retry }).eq("wamid", s.id);

      /* The retry columns arrive in a migration. Until it has run, recording
         the delivery status still matters more than scheduling a retry — so
         fall back to the plain update rather than lose the status entirely. */
      if (error && Object.keys(retry).length) {
        await sb.from("wa_messages").update(base).eq("wamid", s.id);
      }
    }

    /* ---- inbound replies ---- */
    const inbound = messages.map(m => {
      const g = byPhone.get(localise(m.from ?? ""));
      return {
        event_id: g?.event_id ?? null,
        guest_id: g?.id ?? null,
        wa_phone: m.from ?? "",
        direction: "in",
        body: bodyOf(m),
        wamid: m.id ?? null,
        status: "received",
      };
    }).filter(r => r.wa_phone);

    if (inbound.length) {
      await sb.from("wa_messages").upsert(inbound, { onConflict: "wamid" });
    }
  } catch {
    /* Swallow — never let a malformed payload disable the subscription */
  }
  return NextResponse.json({ ok: true });
}
