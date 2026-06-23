import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; tableId: string }> }
) {
  const { token, tableId } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Verify table belongs to this event
  const { data: table } = await sb.from("seating_tables").select("id").eq("id", tableId).eq("event_id", event.id).single();
  if (!table) return NextResponse.json({ error: "table not found" }, { status: 404 });

  await sb.from("seating_assignments").delete().eq("table_id", tableId);
  await sb.from("seating_tables").delete().eq("id", tableId);

  return NextResponse.json({ success: true });
}
