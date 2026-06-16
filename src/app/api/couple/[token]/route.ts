import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import type { Forecast, HealthScore } from '@/lib/types';

type Params = { params: Promise<{ token: string }> };

// Shared forecast + health logic (pure functions, duplicated here to avoid
// importing client-only code from the admin page into a server route)
function computeForecastServer(guests: {
  status: string; guest_count: number
}[]): Forecast {
  const confirmed  = guests.filter((g) => g.status === 'confirmed');
  const declined   = guests.filter((g) => g.status === 'declined').length;
  const pending    = guests.filter((g) => g.status === 'pending').length;
  const total      = guests.length;
  const responders = confirmed.length + declined;
  const confirmedAttendees = confirmed.reduce((s, g) => s + g.guest_count, 0);
  const avgSeats   = confirmed.length > 0 ? confirmedAttendees / confirmed.length : 1;
  const confirmRate = responders > 0
    ? Math.round((confirmed.length / responders) * 100)
    : 50;
  const responseRate = total > 0 ? Math.round((responders / total) * 100) : 0;
  const pendingConfirm = pending * (confirmRate / 100);
  return {
    confirmedAttendees,
    responseRate,
    confirmRate,
    pendingGuests: pending,
    expected:      Math.round(confirmedAttendees + pendingConfirm * avgSeats),
    optimistic:    Math.round(confirmedAttendees + pendingConfirm * avgSeats * 1.15),
    conservative:  Math.round(confirmedAttendees + pendingConfirm * avgSeats * 0.75),
    hasEnoughData: responders >= 5,
  };
}

function computeHealthServer(guests: {
  status: string; opened_at: string | null; response_time: string | null
}[], eventDate: string): HealthScore {
  const now        = Date.now();
  const total      = guests.length;
  const confirmed  = guests.filter((g) => g.status === 'confirmed').length;
  const declined   = guests.filter((g) => g.status === 'declined').length;
  const responders = confirmed + declined;
  const opened     = guests.filter((g) => g.opened_at).length;
  const pendingPct = total > 0 ? (guests.filter((g) => g.status === 'pending').length / total) : 1;

  const rateScore    = total > 0 ? Math.round((responders / total) * 40) : 0;
  const openScore    = total > 0 ? Math.round((opened / total) * 20) : 0;
  const pendingScore = Math.round(Math.max(0, 1 - pendingPct / 0.6) * 20);

  const daysLeft = Math.ceil((new Date(eventDate).getTime() - now) / 86_400_000);
  const timeScore = daysLeft > 60 ? 10 : daysLeft > 30 ? 7 : daysLeft > 14 ? 5 : daysLeft > 0 ? 2 : 0;

  const recentCount  = guests.filter(
    (g) => g.response_time && now - new Date(g.response_time).getTime() < 7 * 86_400_000
  ).length;
  const activityScore = Math.min(10, Math.round((recentCount / Math.max(total * 0.1, 1)) * 10));

  const score = rateScore + openScore + pendingScore + timeScore + activityScore;
  const tier  = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';
  const labelMap = {
    green:  'האירוע במצב מצוין.',
    yellow: 'יש מקום לשיפור — שווה לשלוח תזכורות.',
    red:    'מספר רב של מוזמנים עדיין לא ענו.',
  };

  return {
    score,
    tier,
    label: labelMap[tier],
    breakdown: [
      { factor: 'אחוז מענה',              points: rateScore,     max: 40 },
      { factor: 'אחוז פתיחת קישור',       points: openScore,     max: 20 },
      { factor: 'אחוז נמוך של ממתינים',   points: pendingScore,  max: 20 },
      { factor: 'זמן עד האירוע',           points: timeScore,     max: 10 },
      { factor: 'פעילות אחרונה',           points: activityScore, max: 10 },
    ],
  };
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase  = createServerClient();

  // Validate couple_token → find event
  const { data: event, error: eventErr } = await supabase
    .from('events')
    .select('id, name, date, address, couple_token, created_at')
    .eq('couple_token', token)
    .single();

  if (eventErr || !event)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch guests — strip phone/token from couple response
  const { data: rawGuests } = await supabase
    .from('guests')
    .select('id, status, guest_count, opened_at, response_time, created_at')
    .eq('event_id', event.id);

  const guests = rawGuests ?? [];
  const total     = guests.length;
  const confirmed = guests.filter((g) => g.status === 'confirmed').length;
  const declined  = guests.filter((g) => g.status === 'declined').length;
  const pending   = guests.filter((g) => g.status === 'pending').length;
  const attendees = guests.filter((g) => g.status === 'confirmed').reduce((s: number, g) => s + g.guest_count, 0);
  const responseRate = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;

  const forecast = total > 0 ? computeForecastServer(guests) : null;
  const health   = total > 0 ? computeHealthServer(guests, event.date) : null;

  return NextResponse.json({
    event,
    stats: { total, confirmed, declined, pending, attendees, responseRate },
    forecast,
    health,
  });
}
