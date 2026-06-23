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
  // Mark admin messages as read by couple
  await sb.from("chat_messages").update({ read_by_couple: true }).eq("event_id", eventId).eq("sender", "admin");

  const { data } = await sb.from("chat_messages")
    .select("id, sender, body, created_at, read_by_admin")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .limit(100);

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "body required" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb.from("chat_messages")
    .insert({ event_id: eventId, sender: "couple", body: body.trim() })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
