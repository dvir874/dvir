import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function fmtDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/* GET /api/rsvp/[token]/ics — downloadable calendar event (Apple/Outlook) */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data: guest } = await supabase
    .from('guests')
    .select('event_id')
    .eq('rsvp_token', token)
    .single();
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: event } = await supabase
    .from('events')
    .select('name, date, address')
    .eq('id', guest.event_id)
    .single();
  if (!event?.date) return NextResponse.json({ error: 'No date' }, { status: 404 });

  const start = new Date(event.date);
  const end = new Date(start.getTime() + 5 * 3600_000); // 5h default

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rega Lifnei//RSVP//HE',
    'BEGIN:VEVENT',
    `UID:${token}@regalifnei`,
    `DTSTAMP:${fmtDate(new Date())}`,
    `DTSTART:${fmtDate(start)}`,
    `DTEND:${fmtDate(end)}`,
    `SUMMARY:${icsEscape(event.name ?? 'חתונה 💍')}`,
    ...(event.address ? [`LOCATION:${icsEscape(event.address)}`] : []),
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:מחר החתונה! 💍',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="wedding.ics"`,
    },
  });
}
