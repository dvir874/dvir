import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb
    .from("events")
    .select("id")
    .eq("couple_token", token)
    .single();

  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: tasks } = await sb
    .from("wedding_tasks")
    .select("id, title, completed, completed_at, category, due_date, sort_order, is_default")
    .eq("event_id", event.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return NextResponse.json(tasks ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createServerClient();
  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { title, category, due_date } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const { data, error } = await sb.from("wedding_tasks")
    .insert({ event_id: event.id, title: title.trim(), category: category ?? "general", due_date: due_date ?? null, completed: false, is_default: false, sort_order: 9999 })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
