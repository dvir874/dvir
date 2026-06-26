import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const supabase = createServerClient();

  const [eventRes, guestsRes, vendorsRes, tasksRes, budgetRes, seatingRes, assignRes, giftsRes] = await Promise.all([
    supabase.from("events").select("*").eq("id", eventId).single(),
    supabase.from("guests").select("*").eq("event_id", eventId),
    supabase.from("wedding_vendors").select("*").eq("event_id", eventId),
    supabase.from("wedding_tasks").select("*").eq("event_id", eventId),
    supabase.from("budget_items").select("*").eq("event_id", eventId),
    supabase.from("seating_tables").select("*").eq("event_id", eventId),
    supabase.from("seating_assignments").select("*, guests(name)").eq("event_id", eventId),
    supabase.from("gifts").select("*").eq("event_id", eventId),
  ]);

  const bundle = {
    exported_at: new Date().toISOString(),
    event: eventRes.data,
    guests: guestsRes.data ?? [],
    vendors: vendorsRes.data ?? [],
    tasks: tasksRes.data ?? [],
    budget: budgetRes.data ?? [],
    seating_tables: seatingRes.data ?? [],
    seating_assignments: assignRes.data ?? [],
    gifts: giftsRes.data ?? [],
    meta: {
      total_guests: guestsRes.data?.length ?? 0,
      total_vendors: vendorsRes.data?.length ?? 0,
      total_tasks: tasksRes.data?.length ?? 0,
      total_budget_items: budgetRes.data?.length ?? 0,
    },
  };

  const json = JSON.stringify(bundle, null, 2);
  const eventName = (eventRes.data as { name?: string })?.name ?? "event";
  const filename = `backup-${eventName.replace(/[^a-zA-Z0-9֐-׿]/g, "_")}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
