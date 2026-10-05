import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/* GET /api/rsvp/[token]/calendar — one "add to calendar" link for WhatsApp.
 *
 * Sent to a guest the moment they confirm (wa-conversation.ts). A chat link
 * cannot offer the RSVP page's two buttons, so it picks for them: an Apple
 * device gets the .ics (Calendar opens it directly), everything else gets
 * Google Calendar, because Android saves an .ics as a download and stops.
 *
 * Same hours as the .ics and the RSVP page — reception_time, 19:00 when empty —
 * so the three never disagree about when the wedding starts. */

const pad = (t: string | null | undefined) =>
  /^\d{1,2}:\d{2}$/.test(t ?? '') ? String(t).padStart(5, '0').replace(':', '') + '00' : '190000';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ua = req.headers.get('user-agent') ?? '';
  if (/iPhone|iPad|iPod|Macintosh/i.test(ua)) {
    return NextResponse.redirect(new URL(`/api/rsvp/${encodeURIComponent(token)}/ics`, req.url), 302);
  }

  const sb = createServerClient();
  const { data: guest } = await sb.from('guests').select('event_id').eq('rsvp_token', token).maybeSingle();
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data: ev } = await sb.from('events')
    .select('name, couple_names, date, address, venue_name, reception_time')
    .eq('id', guest.event_id).maybeSingle();
  if (!ev?.date) return NextResponse.json({ error: 'No date' }, { status: 404 });

  const day = String(ev.date).slice(0, 10).replace(/-/g, '');
  const title = ev.couple_names ? `החתונה של ${ev.couple_names}` : String(ev.name ?? 'חתונה');
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${day}T${pad(ev.reception_time)}/${day}T235900`,
    ctz: 'Asia/Jerusalem',
    location: [ev.venue_name, ev.address].filter(Boolean).join(', '),
  });
  return NextResponse.redirect(`https://calendar.google.com/calendar/render?${q}`, 302);
}
