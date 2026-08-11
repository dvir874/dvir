import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* A guest tapped the small "getting married?" line at the bottom of an RSVP.
   Recorded as a guest_event on the referring guest, so we can tell which
   wedding produced which enquiries without adding a table — and so a couple
   can eventually be rewarded for the leads their own wedding generated. */

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return NextResponse.json({ ok: true });

  const sb = createServerClient();
  const { data: guest } = await sb
    .from("guests").select("id").eq("rsvp_token", token).maybeSingle();

  if (guest) {
    await sb.from("guest_events")
      .insert({ guest_id: guest.id, event_type: "referral_click" });
  }
  return NextResponse.json({ ok: true });
}
