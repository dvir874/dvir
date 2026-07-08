import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/* POST /api/admin/open-link — get (or create) the open group-RSVP token for an event.
   Auth: middleware cookie on /api/admin/*. */
export async function POST(req: NextRequest) {
  const { event_id } = await req.json();
  if (!event_id) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();
  const { data: event, error } = await sb
    .from("events")
    .select("id, open_rsvp_token")
    .eq("id", event_id)
    .single();
  if (error || !event) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (event.open_rsvp_token) return NextResponse.json({ token: event.open_rsvp_token });

  const token = randomBytes(9).toString("base64url");
  const { error: upErr } = await sb.from("events").update({ open_rsvp_token: token }).eq("id", event_id);
  if (upErr) return NextResponse.json({ error: "הרץ את המיגרציה: open_rsvp_token חסר ב-DB" }, { status: 500 });
  return NextResponse.json({ token });
}
