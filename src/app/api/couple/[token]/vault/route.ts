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
  /* owner_token too — the couple's own way into their memories.
   *
   * The audit stopped here deliberately on 17/08: couple/[token]/page.tsx
   * already reads d.owner_token, and adding it to this select before confirming
   * the column existed risked `existing` coming back null, a SECOND vault row
   * being created for the event, and maybeSingle() in rsvp-load then erroring —
   * which would have removed the memories link from every one of 1,400 guests'
   * invitations. The column is present (20260812_memory_owner_and_taken_at), so
   * it is safe now.
   *
   * Without it the couple's day-after cards render "—" and link nowhere, and
   * those blocks light up when daysLeft reaches zero: 24/08. */
  const { data: existing } = await supabase
    .from("vault_tokens")
    .select("token, owner_token")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      vault_token: existing.token,
      owner_token: existing.owner_token ?? null,
    });
  }

  // Create a new vault token
  const newToken = crypto.randomUUID();
  const { data: created, error: createError } = await supabase
    .from("vault_tokens")
    .insert({ token: newToken, event_id: eventId, owner_token: crypto.randomUUID() })
    .select("token, owner_token")
    .single();

  if (createError || !created) {
    return NextResponse.json({ error: "Failed to create vault token" }, { status: 500 });
  }

  return NextResponse.json({ vault_token: created.token, owner_token: created.owner_token ?? null });
}
