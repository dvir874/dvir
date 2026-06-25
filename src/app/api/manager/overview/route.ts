import { NextResponse }          from 'next/server';
import { createServerClient }    from '@/lib/supabase-server';
import { computeEventHealth }    from '@/lib/automation/health';
import type { EventSummary }     from '@/lib/types';
import { requireAdmin } from '@/lib/auth-guard';

export type { EventSummary };

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[api/overview] Missing env vars — NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, 'SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    return NextResponse.json({ error: 'Server misconfiguration: missing Supabase env vars' }, { status: 500 });
  }
  const supabase = createServerClient();
  const now = Date.now();

  const { data: events, error } = await supabase
    .from('events')
    .select('id, name, date, address, couple_token, created_at, status, client_name, client_phone, event_type, payment_status, payment_amount')
    .order('date');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!events?.length) return NextResponse.json([]);

  // Fetch ALL guests in one query, group client-side
  const eventIds = events.map((e) => e.id);
  const { data: allGuests } = await supabase
    .from('guests')
    .select('id, event_id, status, guest_count, phone, opened_at, response_time')
    .in('event_id', eventIds);

  const guestsByEvent: Record<string, typeof allGuests> = {};
  (allGuests ?? []).forEach((g) => {
    if (!guestsByEvent[g.event_id]) guestsByEvent[g.event_id] = [];
    guestsByEvent[g.event_id]!.push(g);
  });

  const summaries: EventSummary[] = events.map((ev) => {
    const guests     = guestsByEvent[ev.id] ?? [];
    const total      = guests.length;
    const confirmed  = guests.filter((g) => g.status === 'confirmed');
    const declined   = guests.filter((g) => g.status === 'declined').length;
    const pending    = guests.filter((g) => g.status === 'pending').length;
    const responders = confirmed.length + declined;
    const attendees  = confirmed.reduce((s, g) => s + g.guest_count, 0);
    const responseRate   = total > 0 ? Math.round((responders / total) * 100) : 0;
    const openedCount    = guests.filter((g) => g.opened_at).length;
    const openedPending  = guests.filter((g) => g.opened_at && g.status === 'pending').length;
    const noPhone        = guests.filter((g) => !g.phone).length;
    const recentActivity = guests.filter(
      (g) => g.response_time && now - new Date(g.response_time).getTime() < 7 * 86_400_000
    ).length;
    const daysUntilEvent = Math.ceil((new Date(ev.date).getTime() - now) / 86_400_000);

    // Use centralised health engine
    const health = computeEventHealth({
      total, confirmed: confirmed.length, declined, pending,
      openedCount, responseRate, daysUntilEvent, recentActivity,
    });

    const needsAttention =
      (daysUntilEvent <= 14 && daysUntilEvent > 0 && pending > total * 0.2) ||
      health.tier === 'red' ||
      openedPending >= 5;

    return {
      id: ev.id, name: ev.name, date: ev.date,
      address: ev.address, couple_token: ev.couple_token,
      status: ((ev as Record<string, unknown>).status as import('@/lib/types').EventStatus | null) ?? null,
      client_name: ((ev as Record<string, unknown>).client_name as string | null) ?? null,
      client_phone: ((ev as Record<string, unknown>).client_phone as string | null) ?? null,
      event_type: ((ev as Record<string, unknown>).event_type as string | null) ?? null,
      total, confirmed: confirmed.length, declined, pending,
      attendees, responseRate, openedCount, openedPending, noPhone,
      healthScore: health.score, healthTier: health.tier, recentActivity,
      daysUntilEvent, needsAttention,
    };
  });

  return NextResponse.json(summaries);
}
