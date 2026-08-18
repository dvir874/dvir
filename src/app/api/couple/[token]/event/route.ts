import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();
  const { data, error } = await sb
    .from("events")
    .select("id, name")
    .eq("couple_token", token)
    .single();
  if (error || !data) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: album } = await sb
    .from("gallery_albums")
    .select("public_token, owner_token")
    .eq("event_id", data.id)
    .maybeSingle();

  return NextResponse.json({ id: data.id, name: data.name, /* The owner token, not the public one.
     *
     * The album is deliberately is_public = false — guests upload, only the
     * couple views — so /api/gallery refuses the public token with a 404. The
     * dashboard was handing itself the one key that does not open its own door.
     * Falls back to public_token for any album created before owner tokens
     * existed. */
    gallery_token: album?.owner_token ?? album?.public_token ?? null });
}
