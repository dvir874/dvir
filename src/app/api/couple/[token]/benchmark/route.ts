import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/couple/[token]/benchmark
   Real percentile of this event's response rate vs all events in the system.
   Returns nothing meaningful until there are enough events (>=3). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: guests } = await sb.from("guests").select("event_id, status");
  if (!guests) return NextResponse.json({ percentile: null });

  /* Response rate per event (min 10 guests to count) */
  const byEvent = new Map<string, { total: number; responded: number }>();
  for (const g of guests) {
    const e = byEvent.get(g.event_id) ?? { total: 0, responded: 0 };
    e.total += 1;
    if (g.status !== "pending") e.responded += 1;
    byEvent.set(g.event_id, e);
  }

  const rates: { id: string; rate: number }[] = [];
  for (const [id, v] of byEvent) {
    if (v.total >= 10) rates.push({ id, rate: v.responded / v.total });
  }

  const mine = rates.find(r => r.id === event.id);
  if (!mine || rates.length < 3) return NextResponse.json({ percentile: null });

  const below = rates.filter(r => r.rate < mine.rate).length;
  const percentile = Math.round((below / (rates.length - 1)) * 100);

  return NextResponse.json({ percentile, rate: Math.round(mine.rate * 100) });
}
