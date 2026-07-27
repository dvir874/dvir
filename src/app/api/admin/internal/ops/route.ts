import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* GET /api/admin/internal/ops?event_id=X
   Full operations aggregate for the internal Wedding Operations Center.
   Read-only. Auth: middleware cookie on /api/admin/*.
   Gracefully degrades if optional columns (side/notes) are absent. */
export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("event_id");
  if (!eventId) return NextResponse.json({ error: "event_id required" }, { status: 400 });

  const sb = createServerClient();

  const { data: event } = await sb
    .from("events")
    .select("id, name, date, address, client_phone, couple_token")
    .eq("id", eventId)
    .single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Try to include optional columns; fall back if they don't exist yet.
  let guests: Record<string, unknown>[] = [];
  const full = await sb
    .from("guests")
    .select("id, name, phone, status, guest_count, response_time, opened_at, side, notes, category, chuppah_only")
    .eq("event_id", eventId);
  if (full.error) {
    const basic = await sb
      .from("guests")
      .select("id, name, phone, status, guest_count, response_time, opened_at, category, chuppah_only")
      .eq("event_id", eventId);
    guests = basic.data ?? [];
  } else {
    guests = full.data ?? [];
  }

  const g = (k: string) => guests.map(x => x[k]);
  const val = (x: Record<string, unknown>, k: string) => (x[k] ?? null);

  const total = guests.length;
  const confirmed = guests.filter(x => x.status === "confirmed");
  const declined = guests.filter(x => x.status === "declined");
  const pending = guests.filter(x => x.status === "pending");
  const attendees = confirmed.reduce((s, x) => s + (Number(x.guest_count) || 1), 0);
  const responded = confirmed.length + declined.length;
  const confirmRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const bySide = (side: string) => guests.filter(x => x.side === side);
  const brideSide = bySide("bride");
  const groomSide = bySide("groom");

  const sorted = [...guests]
    .filter(x => x.response_time)
    .sort((a, b) => (String(b.response_time) < String(a.response_time) ? -1 : 1));

  const recentConfirmed = sorted.filter(x => x.status === "confirmed").slice(0, 8)
    .map(x => ({ name: x.name, count: Number(x.guest_count) || 1, at: x.response_time }));
  const recentDeclined = sorted.filter(x => x.status === "declined").slice(0, 8)
    .map(x => ({ name: x.name, at: x.response_time }));

  // Follow-up: pending, invitation opened but no answer (higher intent) first, then never opened
  const followUp = pending
    .map(x => ({ id: x.id, name: x.name, phone: x.phone, opened: !!x.opened_at }))
    .sort((a, b) => Number(b.opened) - Number(a.opened))
    .slice(0, 30);

  const noPhone = guests.filter(x => !String(x.phone ?? "").trim()).length;

  return NextResponse.json({
    event: { id: event.id, name: event.name, date: event.date, address: event.address, couple_token: event.couple_token, client_phone: event.client_phone },
    stats: {
      total, confirmed: confirmed.length, declined: declined.length, pending: pending.length,
      attendees, confirmRate,
      brideSide: brideSide.length, groomSide: groomSide.length,
      unassignedSide: total - brideSide.length - groomSide.length,
      noPhone,
    },
    recentConfirmed,
    recentDeclined,
    followUp,
  });
}
