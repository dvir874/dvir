import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { paletteFromInvitation } from "@/lib/invitation-palette";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Derive the RSVP wash from an event's invitation and store it.
 *
 * Without event_id it does every wedding that has an invitation and no wash
 * yet — which is how the four existing couples were brought over, and how a
 * couple added before this existed gets fixed without anyone remembering to. */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { event_id, force } = (await req.json().catch(() => ({}))) as
    { event_id?: string; force?: boolean };

  const sb = createServerClient();
  let q = sb.from("events").select("id, name, wa_header_image_url, rsvp_bg")
    .not("wa_header_image_url", "is", null);
  if (event_id) q = q.eq("id", event_id);
  const { data: evs, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const done: { event: string; bg: string }[] = [];
  const skipped: { event: string; why: string }[] = [];

  for (const ev of evs ?? []) {
    if (ev.rsvp_bg && !force) { skipped.push({ event: ev.name, why: "כבר מוגדר" }); continue; }
    try {
      const res = await fetch(ev.wa_header_image_url as string, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) { skipped.push({ event: ev.name, why: `תמונה ${res.status}` }); continue; }
      const bg = await paletteFromInvitation(Buffer.from(await res.arrayBuffer()));
      if (!bg) { skipped.push({ event: ev.name, why: "לא ניתן לגזור גוון" }); continue; }
      await sb.from("events").update({ rsvp_bg: bg }).eq("id", ev.id);
      done.push({ event: ev.name as string, bg });
    } catch {
      skipped.push({ event: ev.name as string, why: "כשל בהורדת התמונה" });
    }
  }
  return NextResponse.json({ updated: done.length, done, skipped });
}
