import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createServerClient();

  // Look up event_id via couple_token on events table
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("couple_token", token)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const eventId = event.id;

  // Check if a vault_token exists for this event_id
  const { data: existing } = await supabase
    .from("vault_tokens")
    .select("token")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ vault_token: existing.token });
  }

  // Create a new vault token
  const newToken = crypto.randomUUID();
  const { data: created, error: createError } = await supabase
    .from("vault_tokens")
    .insert({ token: newToken, event_id: eventId })
    .select("token")
    .single();

  if (createError || !created) {
    return NextResponse.json({ error: "Failed to create vault token" }, { status: 500 });
  }

  return NextResponse.json({ vault_token: created.token });
}
