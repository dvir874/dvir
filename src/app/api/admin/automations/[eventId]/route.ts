import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import {
  DEFAULT_TEMPLATES, CAMPAIGN_ORDER, getScheduledDate, getDaysUntilEvent,
  type CampaignType,
} from '@/lib/automation/message-templates';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const sb = createServerClient();

  const [evRes, campRes, tmplRes, guestRes] = await Promise.all([
    sb.from('events').select('id,name,date,address,venue,theme').eq('id', eventId).single(),
    sb.from('guest_campaigns').select('*').eq('event_id', eventId),
    sb.from('message_templates').select('*').eq('event_id', eventId),
    sb.from('guests').select('id', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'confirmed'),
  ]);

  if (!evRes.data) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const event      = evRes.data;
  const campaigns  = campRes.data ?? [];
  const templates  = tmplRes.data ?? [];
  const confirmed  = guestRes.count ?? 0;
  const eventDate  = new Date(event.date);
  const daysUntil  = getDaysUntilEvent(event.date);

  const state = CAMPAIGN_ORDER.map((type) => {
    const campaign = campaigns.find((c) => c.type === type) ?? null;
    const template = templates.find((t) => t.type === type) ?? null;
    return {
      type,
      campaign,
      template: template ?? { body: DEFAULT_TEMPLATES[type].body, title: DEFAULT_TEMPLATES[type].title, is_active: true },
      scheduledDate: getScheduledDate(eventDate, type).toISOString(),
    };
  });

  return NextResponse.json({ event, state, daysUntil, confirmedCount: confirmed });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const body = await req.json() as Record<string, unknown>;
  const sb   = createServerClient();
  const action = body.action as string;

  if (action === 'save_template') {
    const { error } = await sb.from('message_templates').upsert({
      event_id: eventId,
      type:     body.type,
      title:    body.title,
      body:     body.templateBody,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'event_id,type' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'create_campaign') {
    const { count } = await sb.from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    const { data, error } = await sb.from('guest_campaigns').upsert({
      event_id:        eventId,
      type:            body.type,
      mode:            body.mode ?? 'manual',
      status:          'pending',
      scheduled_for:   body.scheduledFor ?? null,
      recipients_total: count ?? 0,
      updated_at:      new Date().toISOString(),
    }, { onConflict: 'event_id,type' }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ campaign: data });
  }

  if (action === 'mark_sent') {
    const { error } = await sb.from('guest_campaigns').update({
      status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('event_id', eventId).eq('type', body.type as string);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'cancel') {
    await sb.from('guest_campaigns').update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('event_id', eventId).eq('type', body.type as string);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
