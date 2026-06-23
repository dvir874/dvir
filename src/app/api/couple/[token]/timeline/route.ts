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
    .from("events")
    .select("timeline")
    .eq("id", eventId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data?.timeline ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const eventId = await getEventId(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { items } = await req.json();
  if (!Array.isArray(items)) return NextResponse.json({ error: "items must be array" }, { status: 400 });

  const sb = createServerClient();
  const { error } = await sb.from("events").update({ timeline: items }).eq("id", eventId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
