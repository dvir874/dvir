import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { syncToGoogleSheets } from '@/lib/sheets';

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, name, guest_count, status, event_id, opened_at')
    .eq('rsvp_token', token)
    .single();

  if (error || !guest)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Record first open — only if not already opened
  if (!guest.opened_at) {
    await supabase
      .from('guests')
      .update({ opened_at: new Date().toISOString() })
      .eq('rsvp_token', token)
      .is('opened_at', null);
    // Log activity (fire-and-forget)
    supabase.from('guest_events').insert({ guest_id: guest.id, event_type: 'rsvp_opened' }).then(() => {});
  }

  const { data: event } = await supabase
    .from('events')
    .select('name, date, address, theme')
    .eq('id', guest.event_id)
    .single();

  return NextResponse.json({ guest, event: event ?? null });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await request.json();
  const { status, guest_count } = body as {
    status?: string;
    guest_count?: number;
  };

  if (!status || !['confirmed', 'declined'].includes(status))
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const supabase = createServerClient();
  const { data: updated, error } = await supabase
    .from('guests')
    .update({
      status,
      guest_count: guest_count ?? 1,
      response_time: new Date().toISOString(),
    })
    .eq('rsvp_token', token)
    .select()
    .single();

  if (error || !updated)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });

  // Log activity + sync sheets in background
  supabase.from('guest_events').insert({ guest_id: updated.id, event_type: 'rsvp_submitted' }).then(() => {});
  supabase
    .from('guests')
    .select('*')
    .eq('event_id', updated.event_id)
    .then(({ data: all }) => {
      if (all) syncToGoogleSheets(all).catch(console.error);
    });

  return NextResponse.json({ success: true });
}
