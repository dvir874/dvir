import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [tablesRes, assignmentsRes, guestsRes] = await Promise.all([
    sb.from("seating_tables").select("id, name, capacity, type").eq("event_id", event.id).order("sort_order"),
    sb.from("seating_assignments").select("guest_id, table_id").eq("event_id", event.id),
    sb.from("guests").select("id, name, guest_count").eq("event_id", event.id),
  ]);

  return NextResponse.json({
    tables: tablesRes.data ?? [],
    assignments: assignmentsRes.data ?? [],
    guests: guestsRes.data ?? [],
  });
}
