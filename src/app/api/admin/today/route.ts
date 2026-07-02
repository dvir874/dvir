import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/admin/today — one aggregate for the "My Day" screen.
   Auth: enforced by middleware (raga_admin_session cookie on /api/admin/*). */
export async function GET(_req: NextRequest) {
  const sb = createServerClient();
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 3600_000).toISOString();
  const weekAhead = new Date(now + 7 * 86_400_000).toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [leadsRes, eventsRes, rsvpsRes, requestsRes] = await Promise.all([
    sb.from("leads").select("id, name, created_at, status").eq("status", "new_lead"),
    sb.from("events").select("id, name, date, status, payment_status, payment_amount, payment_date, client_phone, couple_token"),
    sb.from("guests").select("id, name, status, guest_count, response_time, event_id").gte("response_time", dayAgo),
    sb.from("couple_requests").select("id, title, status, created_at, event_id").neq("status", "done"),
  ]);

  const events = eventsRes.data ?? [];
  const eventName = new Map(events.map(e => [e.id, e.name]));

  /* Weddings in the next 7 days */
  const upcoming = events
    .filter(e => e.date && new Date(e.date).getTime() >= now - 86_400_000 && e.date <= weekAhead)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map(e => ({ id: e.id, name: e.name, date: e.date, client_phone: e.client_phone, couple_token: e.couple_token }));

  /* "Morning after" — weddings that happened in the last ~36h: send the couple their recap */
  const justMarried = events.filter(e => {
    if (!e.date) return false;
    const t = new Date(e.date).getTime();
    return t < now && now - t < 36 * 3600_000;
  });
  const morningAfter = await Promise.all(justMarried.map(async e => {
    const [guestsRes, albumRes] = await Promise.all([
      sb.from("guests").select("status, guest_count").eq("event_id", e.id),
      sb.from("gallery_albums").select("id, public_token, photo_count").eq("event_id", e.id).maybeSingle(),
    ]);
    const attendees = (guestsRes.data ?? [])
      .filter(g => g.status === "confirmed")
      .reduce((s, g) => s + (g.guest_count ?? 1), 0);
    let blessings = 0;
    const { count } = await sb.from("memory_items").select("id", { count: "exact", head: true }).eq("event_id", e.id).eq("type", "blessing");
    blessings = count ?? 0;
    return {
      id: e.id, name: e.name, client_phone: e.client_phone,
      attendees, photos: albumRes.data?.photo_count ?? 0, blessings,
      gallery_token: albumRes.data?.public_token ?? null,
    };
  }));

  /* Past weddings not yet closed */
  const needsClosing = events
    .filter(e => e.date && new Date(e.date).getTime() < now - 86_400_000 && e.status !== "completed")
    .sort((a, b) => (b.date < a.date ? -1 : 1))
    .slice(0, 5)
    .map(e => ({ id: e.id, name: e.name, date: e.date, client_phone: e.client_phone }));

  /* RSVPs in last 24h */
  const recentRsvps = (rsvpsRes.data ?? [])
    .sort((a, b) => (b.response_time! < a.response_time! ? -1 : 1))
    .slice(0, 12)
    .map(g => ({ name: g.name, status: g.status, count: g.guest_count ?? 1, event: eventName.get(g.event_id) ?? "", at: g.response_time }));

  /* Revenue: paid this month + outstanding */
  const paidThisMonth = events
    .filter(e => e.payment_status === "paid" && e.payment_date && e.payment_date >= monthStart)
    .reduce((s, e) => s + (e.payment_amount ?? 0), 0);
  const outstanding = events
    .filter(e => e.payment_status !== "paid" && (e.payment_amount ?? 0) > 0)
    .reduce((s, e) => s + (e.payment_amount ?? 0), 0);

  /* Stale leads: waiting over 24h */
  const staleLeads = (leadsRes.data ?? []).filter(l => new Date(l.created_at).getTime() < now - 24 * 3600_000);

  return NextResponse.json({
    newLeads: (leadsRes.data ?? []).length,
    staleLeads: staleLeads.map(l => l.name),
    upcoming,
    needsClosing,
    recentRsvps,
    morningAfter,
    openRequests: (requestsRes.data ?? []).map(r => ({ id: r.id, title: r.title, event: eventName.get(r.event_id) ?? "" })).slice(0, 8),
    revenue: { paidThisMonth, outstanding },
  });
}
