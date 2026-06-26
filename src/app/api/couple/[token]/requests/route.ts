import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

type Params = { params: Promise<{ token: string }> };

async function getEvent(token: string) {
  const supabase = createServerClient();
  const { data } = await supabase.from("events").select("id").eq("couple_token", token).single();
  return data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const event = await getEvent(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("couple_requests")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const event = await getEvent(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { category, title, description } = body;
  if (!category || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("couple_requests")
    .insert({ event_id: event.id, category, title, description: description ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
