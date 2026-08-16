import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function icsEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function fmtUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/* Local wall-clock, for use with TZID. events.date is a bare date with no time,
   so the ceremony hour has to come from somewhere — and it must be the SAME
   source the RSVP page prints, or the calendar and the page disagree. */
/* The couple's real hour, not a constant.
   The card said 19:00 to everybody while the page beside it printed the true
   time from reception_time. אורי ושחר start at 17:30 and the chuppah is 18:15,
   so a guest who added it to their calendar was reminded 45 minutes after the
   ceremony. 19:00 stays only as the fallback when the field is empty. */
const RECEPTION_FALLBACK = "190000";
const hhmmss = (t: string | null | undefined) =>
  /^\d{1,2}:\d{2}$/.test(t ?? "") ? String(t).padStart(5, "0").replace(":", "") + "00"
                                  : RECEPTION_FALLBACK;
/* Ends before midnight rather than at 19+5=24, which is not a valid hour in
   RFC 5545 and made the whole VEVENT unparseable. Matches the end time the
   Google Calendar button on the RSVP page already used. */
const END_HHMM = '235900';

function fmtLocal(date: string, hhmm: string): string {
  const d = String(date).slice(0, 10).replace(/-/g, '');
  return `${d}T${hhmm}`;
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
    .select('name, date, address, venue_name, reception_time')
    .eq('id', guest.event_id)
    .single();
  if (!event?.date) return NextResponse.json({ error: 'No date' }, { status: 404 });

  /* Previously: `new Date(event.date)` parsed "2026-08-24" as midnight UTC and
     was written out as a bare UTC timestamp, so every guest's calendar showed
     the wedding at 03:00-08:00 Israel time and the reminder woke them at 03:00
     the night before. The Google Calendar button beside it said 19:00 — two
     adjacent buttons, sixteen hours apart.

     Fixed by naming the timezone instead of flattening it. VTIMEZONE is carried
     inline because Apple Calendar and Outlook will not resolve a bare TZID. */
  const location = [event.venue_name, event.address].filter(Boolean).join(', ');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rega Lifnei//RSVP//HE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Jerusalem',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0300',
    'TZNAME:IDT',
    'DTSTART:19700327T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1FR',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0200',
    'TZNAME:IST',
    'DTSTART:19701025T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${token}@regalifnei`,
    `DTSTAMP:${fmtUtc(new Date())}`,
    `DTSTART;TZID=Asia/Jerusalem:${fmtLocal(event.date, hhmmss(event.reception_time))}`,
    `DTEND;TZID=Asia/Jerusalem:${fmtLocal(event.date, END_HHMM)}`,
    `SUMMARY:${icsEscape(event.name ?? 'חתונה 💍')}`,
    ...(location ? [`LOCATION:${icsEscape(location)}`] : []),
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
