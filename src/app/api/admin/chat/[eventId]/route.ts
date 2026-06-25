import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { eventId } = await params;
  const sb = createServerClient();

  await sb.from("chat_messages").update({ read_by_admin: true }).eq("event_id", eventId).eq("sender", "couple");

  const { data } = await sb.from("chat_messages")
    .select("id, sender, body, created_at, read_by_couple")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true })
    .limit(100);

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { eventId } = await params;
  const { body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: "body required" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb.from("chat_messages")
    .insert({ event_id: eventId, sender: "admin", body: body.trim() })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
