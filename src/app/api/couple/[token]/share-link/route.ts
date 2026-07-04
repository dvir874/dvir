import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

/* POST — get (or create) the read-only share token for this event */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event, error } = await sb
    .from("events")
    .select("id, share_token")
    .eq("couple_token", token)
    .single();
  if (error || !event) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (event.share_token) return NextResponse.json({ share_token: event.share_token });

  const newToken = randomBytes(9).toString("base64url");
  const { error: upErr } = await sb.from("events").update({ share_token: newToken }).eq("id", event.id);
  if (upErr) return NextResponse.json({ error: "עדיין לא זמין — נסו שוב מאוחר יותר" }, { status: 500 });
  return NextResponse.json({ share_token: newToken });
}
