import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
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

  const [evRes, tmplRes, guestRes] = await Promise.all([
    sb.from('events').select('id,name,date,address,venue').eq('id', eventId).single(),
    type ? sb.from('message_templates').select('body').eq('event_id', eventId).eq('type', type).maybeSingle() : Promise.resolve({ data: null }),
    sb.from('guests').select('id,name,phone,status').eq('event_id', eventId).eq('status', 'confirmed'),
  ]);

  if (!evRes.data || !type) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const event   = evRes.data;
  const guests  = guestRes.data ?? [];
  const bodyTpl = (tmplRes.data as { body?: string } | null)?.body ?? DEFAULT_TEMPLATES[type]?.body ?? '';
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';
  const dateStr = new Date(event.date).toLocaleDateString('he-IL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const wazeLink = event.address ? `https://waze.com/ul?q=${encodeURIComponent(event.address)}` : '';

  const sample   = guests[0];
  const rendered = renderTemplate(bodyTpl, {
    guest_name:      sample?.name ?? 'שם האורח',
    couple_name:     event.name,
    event_date:      dateStr,
    event_time:      '19:00',
    venue:           (event as { venue?: string }).venue ?? event.address ?? '',
    address:         event.address ?? '',
    event_link:      `${appUrl}/event/${eventId}`,
    navigation_link: wazeLink,
    gallery_link:    `${appUrl}/gallery/[token]`,
  });

  const links = guests.map((g) => {
    const msg = renderTemplate(bodyTpl, {
      guest_name:      g.name,
      couple_name:     event.name,
      event_date:      dateStr,
      event_time:      '19:00',
      venue:           (event as { venue?: string }).venue ?? event.address ?? '',
      event_link:      `${appUrl}/event/${eventId}`,
      navigation_link: wazeLink,
    });
    return { id: g.id, name: g.name, phone: g.phone, link: buildWaLink(g.phone, msg) };
  });

  return NextResponse.json({ rendered, links, count: links.length });
}
