import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* The couple asking us to tell everyone where they sit.
 *
 * It replaces a button that opened one wa.me tab per seated guest — 229 for
 * שחר, each needing a click, sent from the couple's own WhatsApp, with every
 * emoji arriving as a replacement character because the URL was built inline
 * rather than through waPrefill.
 *
 * This only records the request. The cron sends them through the business
 * number in budget-sized batches, on a template Meta approved weeks ago and
 * nothing has ever called, with delivery reports like every other message.
 *
 * Idempotent by design: guest_events carries table_number_sent per guest, so
 * pressing it again reaches only people seated since, or moved since.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: ev } = await sb.from("events")
    .select("id").eq("couple_token", token).maybeSingle();
  if (!ev) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { count: seated } = await sb.from("seating_assignments")
    .select("guest_id", { count: "exact", head: true }).eq("event_id", ev.id as string);
  if (!seated) {
    return NextResponse.json({ error: "צריך קודם לסדר את השולחנות" }, { status: 400 });
  }

  const { error } = await sb.from("events")
    .update({ tables_send_requested_at: new Date().toISOString() })
    .eq("id", ev.id as string);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, seated });
}
