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
    .select('name, date, address, theme, rsvp_deadline')
    .eq('id', guest.event_id)
    .single();

  // Fetch table assignment if exists
  const { data: assignment } = await supabase
    .from('seating_assignments')
    .select('table_id')
    .eq('guest_id', guest.id)
    .maybeSingle();

  let tableName: string | null = null;
  if (assignment?.table_id) {
    const { data: table } = await supabase
      .from('seating_tables')
      .select('name')
      .eq('id', assignment.table_id)
      .single();
    tableName = table?.name ?? null;
  }

  return NextResponse.json({ guest, event: event ?? null, tableName });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await request.json();
  const { status, guest_count, meal_preference, meal_note } = body as {
    status?: string;
    guest_count?: number;
    meal_preference?: string | null;
    meal_note?: string | null;
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
      ...(meal_preference !== undefined ? { meal_preference } : {}),
      ...(meal_note !== undefined ? { meal_note } : {}),
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

  // Notify couple via WhatsApp (fire-and-forget)
  supabase
    .from('events')
    .select('name, client_phone, couple_token')
    .eq('id', updated.event_id)
    .single()
    .then(({ data: ev }) => {
      if (!ev?.client_phone) return;
      const phone = ev.client_phone.replace(/\D/g, '').replace(/^0/, '972');
      const emoji = status === 'confirmed' ? '✅' : '❌';
      const statusHe = status === 'confirmed' ? 'אישר/ה הגעה' : 'סירב/ה';
      const count = status === 'confirmed' && (guest_count ?? 1) > 1 ? ` (${guest_count} מגיעים)` : '';
      const msg = `${emoji} ${updated.name} ${statusHe}${count} ל${ev.name}`;
      fetch(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`).catch(() => {});
    });

  return NextResponse.json({ success: true });
}
