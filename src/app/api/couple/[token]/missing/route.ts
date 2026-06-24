import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb
    .from("events")
    .select("id, name, date, address, venue_name, dress_code, client_phone, bit_phone")
    .eq("couple_token", token)
    .single();

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const eventId = event.id;
  const missing: { label: string; severity: "high" | "medium" | "low" }[] = [];

  // Check address
  if (!event.address && !event.venue_name) missing.push({ label: "לא הוגדרה כתובת אולם", severity: "high" });

  // Check dress code
  if (!event.dress_code) missing.push({ label: "לא הוגדר קוד לבוש", severity: "low" });

  // Check bit phone for gifts
  if (!event.bit_phone) missing.push({ label: "לא הוגדר מספר ביט למתנות", severity: "medium" });

  // Check guests
  const { count: totalGuests } = await sb.from("guests").select("id", { count: "exact", head: true }).eq("event_id", eventId);
  if ((totalGuests ?? 0) === 0) missing.push({ label: "לא הוזנו אורחים", severity: "high" });

  // Check seating
  const { data: tables } = await sb.from("seating_tables").select("id").eq("event_id", eventId).limit(1);
  if (!tables?.length) missing.push({ label: "לא נוצרו שולחנות להושבה", severity: "medium" });

  // Check tasks completion
  const { data: tasks } = await sb.from("wedding_tasks").select("completed").eq("event_id", eventId);
  if (tasks && tasks.length > 0) {
    const pending = tasks.filter(t => !t.completed).length;
    if (pending > 3) missing.push({ label: `${pending} משימות לא הושלמו`, severity: "medium" });
  }

  // Check budget
  const { data: budgetItems } = await sb.from("budget_items").select("id").eq("event_id", eventId).limit(1);
  if (!budgetItems?.length) missing.push({ label: "לא הוזנו פריטי תקציב", severity: "low" });

  // Sort by severity
  const order = { high: 0, medium: 1, low: 2 };
  missing.sort((a, b) => order[a.severity] - order[b.severity]);

  return NextResponse.json({ missing, total: missing.length });
}
