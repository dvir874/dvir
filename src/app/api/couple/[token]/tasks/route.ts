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
    .select("id, title, completed, category, due_date, priority")
    .eq("event_id", event.id)
    .order("completed", { ascending: true })
    .order("priority", { ascending: false });

  return NextResponse.json(tasks ?? []);
}
