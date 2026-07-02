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
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("budget_items")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { category, description, planned_amount } = await req.json();
  if (!category || !planned_amount) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("budget_items")
    .insert({ event_id: eventId, category, description: description || category, planned_amount })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { id, actual_amount, planned_amount, description } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (actual_amount !== undefined) patch.actual_amount = actual_amount;
  if (planned_amount !== undefined) patch.planned_amount = planned_amount;
  if (description !== undefined) patch.description = description;
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("budget_items")
    .update(patch)
    .eq("id", id)
    .eq("event_id", eventId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = createServerClient();
  const { error } = await sb.from("budget_items").delete().eq("id", id).eq("event_id", eventId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
