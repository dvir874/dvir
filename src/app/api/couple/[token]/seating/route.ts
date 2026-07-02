import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

async function getEventId(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return data?.id ?? null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const [tablesRes, assignmentsRes, guestsRes] = await Promise.all([
    sb.from("seating_tables").select("*").eq("event_id", eventId).order("sort_order"),
    sb.from("seating_assignments").select("*").eq("event_id", eventId),
    sb.from("guests").select("id, name, guest_count, status, phone").eq("event_id", eventId).order("name"),
  ]);

  return NextResponse.json({
    tables: tablesRes.data ?? [],
    assignments: assignmentsRes.data ?? [],
    guests: guestsRes.data ?? [],
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const { name, capacity, type, sort_order } = body;
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("seating_tables")
    .insert({ event_id: eventId, name, capacity: capacity ?? 10, type: type ?? "round", sort_order: sort_order ?? 0 })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
