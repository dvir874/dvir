import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

type Params = { params: Promise<{ token: string }> };

async function resolveEvent(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return data?.id ?? null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const eventId = await resolveEvent(token);
  if (!eventId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const sb = createServerClient();
  const { data } = await sb
    .from("event_announcements")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(20);
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const eventId = await resolveEvent(token);
  if (!eventId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });
  const sb = createServerClient();
  const { data, error } = await sb
    .from("event_announcements")
    .insert({ event_id: eventId, message: message.trim() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const eventId = await resolveEvent(token);
  if (!eventId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const sb = createServerClient();
  await sb.from("event_announcements").delete().eq("id", id).eq("event_id", eventId);
  return NextResponse.json({ deleted: true });
}
