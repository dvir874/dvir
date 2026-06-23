import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { guest_id, table_id } = await req.json();
  if (!guest_id) return NextResponse.json({ error: "guest_id required" }, { status: 400 });

  if (!table_id) {
    // Unassign
    await sb.from("seating_assignments").delete().eq("guest_id", guest_id);
    return NextResponse.json({ success: true });
  }

  const { error } = await sb.from("seating_assignments").upsert(
    { guest_id, table_id, event_id: event.id },
    { onConflict: "guest_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
