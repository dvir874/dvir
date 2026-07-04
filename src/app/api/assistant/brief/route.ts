import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/assistant/brief — compact business summary for Dvir's personal
   AI assistant (OpenClaw). Read-only. Auth: Bearer ASSISTANT_API_TOKEN.

   Optional ?event=<name substring> for a single-event drill-down. */
export async function GET(req: NextRequest) {
  const expected = process.env.ASSISTANT_API_TOKEN;
  if (!expected) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = createServerClient();
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 3600_000).toISOString();

  const eventQuery = req.nextUrl.searchParams.get("event")?.trim();

  /* Single-event drill-down */
  if (eventQuery) {
    const { data: events } = await sb
      .from("events")
      .select("id, name, date")
      .ilike("name", `%${eventQuery}%`)
      .limit(1);
    const event = events?.[0];
    if (!event) return NextResponse.json({ error: "event not found", query: eventQuery });

    const { data: guests } = await sb
      .from("guests")
      .select("status, guest_count")
      .eq("event_id", event.id);
    const all = guests ?? [];
    const confirmedGuests = all.filter(g => g.status === "confirmed");
    return NextResponse.json({
      event: event.name,
      date: event.date,
      total_invited: all.length,
      confirmed_families: confirmedGuests.length,
      confirmed_attendees: confirmedGuests.reduce((s, g) => s + (g.guest_count ?? 1), 0),
      pending: all.filter(g => g.status === "pending").length,
      declined: all.filter(g => g.status === "declined").length,
    });
  }

  /* Global brief */
  const [leadsRes, eventsRes, rsvpsRes] = await Promise.all([
    sb.from("leads").select("name, created_at").eq("status", "new_lead"),
    sb.from("events").select("id, name, date, status"),
    sb.from("guests").select("name, status, guest_count, event_id").gte("response_time", dayAgo),
  ]);

  const events = eventsRes.data ?? [];
  const eventName = new Map(events.map(e => [e.id, e.name]));

  const upcoming = events
    .filter(e => e.date && new Date(e.date).getTime() > now - 86_400_000 && e.status !== "completed")
    .sort((a, b) => (a.date! < b.date! ? -1 : 1))
    .slice(0, 5)
    .map(e => ({
      name: e.name,
      date: e.date,
      days_left: Math.ceil((new Date(e.date!).getTime() - now) / 86_400_000),
    }));

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    new_leads: (leadsRes.data ?? []).map(l => l.name),
    upcoming_weddings: upcoming,
    rsvps_last_24h: (rsvpsRes.data ?? []).map(g => ({
      guest: g.name,
      status: g.status,
      count: g.guest_count ?? 1,
      event: eventName.get(g.event_id) ?? "",
    })),
  });
}
