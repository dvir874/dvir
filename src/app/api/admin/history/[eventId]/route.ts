import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { eventId } = await params;
  const sb = createServerClient();

  // Try activity_log table first
  const { data, error } = await sb
    .from("activity_log")
    .select("id, action, details, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    // Table might not exist yet — return empty
    return NextResponse.json([]);
  }

  return NextResponse.json(data ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { eventId } = await params;
  const { action, details } = await req.json();
  const sb = createServerClient();

  const { error } = await sb.from("activity_log").insert({ event_id: eventId, action, details: details ?? {} });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
