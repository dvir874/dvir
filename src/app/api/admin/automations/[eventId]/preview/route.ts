import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { venueLine, wazeLink as wazeLinkFor } from '@/lib/venue';
import { coupleName } from '@/lib/couple-name';
import {
  DEFAULT_TEMPLATES, renderTemplate, buildWaLink, type CampaignType,
} from '@/lib/automation/message-templates';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const type   = req.nextUrl.searchParams.get('type') as CampaignType | null;
  const sb     = createServerClient();

  const [evRes, tmplRes, guestRes, albumRes] = await Promise.all([
    sb.from('events').select('id,name,couple_names,date,address,venue_name,reception_time').eq('id', eventId).single(),
    type ? sb.from('message_templates').select('body').eq('event_id', eventId).eq('type', type).maybeSingle() : Promise.resolve({ data: null }),
    sb.from('guests').select('id,name,phone,status').eq('event_id', eventId).eq('status', 'confirmed'),
    sb.from('gallery_albums').select('public_token').eq('event_id', eventId).maybeSingle(),
  ]);

  if (!evRes.data || !type) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const event   = evRes.data;
  const guests  = guestRes.data ?? [];
  const bodyTpl = (tmplRes.data as { body?: string } | null)?.body ?? DEFAULT_TEMPLATES[type]?.body ?? '';
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';
  const dateStr = new Date(event.date).toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const wazeLink = wazeLinkFor(event) ?? '';
  const galleryToken = (albumRes.data as { public_token?: string } | null)?.public_token ?? '[token]';

  /* Two values that were constants and should never have been.
   *
   * `event.name` is the dashboard title — "חתונת אורי ושחר" — and this lands
   * inside a sentence about the couple, so it read "בעזרת ה׳ חתונת אורי ושחר
   * מתחתנים". The cron and the manual send route were both corrected for this;
   * this route was left behind. See src/lib/couple-name.ts.
   *
   * '19:00' was simply Dvir's own reception time, written into the code and
   * then told to every other couple. תהל's guests would have been given an
   * hour nobody at that wedding had agreed to. */
  const couple    = coupleName(event) ?? event.name;
  const eventTime = (event.reception_time as string | null) ?? '19:00';

  const sample   = guests[0];
  const rendered = renderTemplate(bodyTpl, {
    guest_name:      sample?.name ?? 'שם האורח',
    couple_name:     couple,
    event_date:      dateStr,
    event_time:      eventTime,
    venue:           venueLine(event) ?? '',
    address:         event.address ?? '',
    event_link:      `${appUrl}/event/${eventId}`,
    navigation_link: wazeLink,
    gallery_link:    `${appUrl}/gallery/${galleryToken}`,
  });

  const links = guests.map((g) => {
    const msg = renderTemplate(bodyTpl, {
      guest_name:      g.name,
      couple_name:     couple,
      event_date:      dateStr,
      event_time:      eventTime,
      venue:           venueLine(event) ?? '',
      event_link:      `${appUrl}/event/${eventId}`,
      navigation_link: wazeLink,
    });
    return { id: g.id, name: g.name, phone: g.phone, link: buildWaLink(g.phone, msg) };
  });

  return NextResponse.json({ rendered, links, count: links.length });
}
