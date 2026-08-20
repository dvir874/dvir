import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

/* "I have texted this person."
 *
 * The SMS fallback list rebuilds itself from delivery failures, so it showed
 * the same people whether or not they had already been contacted. Nothing
 * recorded the send, because an SMS sent from a phone leaves no trace in this
 * system — exactly the gap manual_sent already fills for helper sends.
 *
 * Reuses guest_events rather than adding a column, so there is nothing to
 * migrate and the sender's existing "reached by some other route" logic keeps
 * working unchanged. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { guest_id, sent } = (await req.json()) as { guest_id?: string; sent?: boolean };
  if (!guest_id) return NextResponse.json({ error: "guest_id required" }, { status: 400 });

  const sb = createServerClient();

  if (sent === false) {
    await sb.from("guest_events")
      .delete().eq("guest_id", guest_id).eq("event_type", "sms_sent");
    return NextResponse.json({ ok: true, sent: false });
  }

  /* Idempotent: tapping "send" twice must not write two rows. */
  const { data: existing } = await sb.from("guest_events")
    .select("id").eq("guest_id", guest_id).eq("event_type", "sms_sent").limit(1);
  if (!existing?.length) {
    await sb.from("guest_events").insert({ guest_id, event_type: "sms_sent" });
  }
  return NextResponse.json({ ok: true, sent: true });
}
