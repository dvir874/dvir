import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { syncToGoogleSheets } from '@/lib/sheets';
import { checkRateLimit, getClientIp, LIMITS } from '@/lib/rate-limit';
import { z } from 'zod';

const RsvpPostSchema = z.object({
  status:          z.enum(['confirmed', 'declined']),
  guest_count:     z.number().int().min(0).max(20).optional(),
  meal_preference: z.string().max(200).optional().nullable(),
  meal_note:       z.string().max(500).optional().nullable(),
});

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const ip = getClientIp(_request);
  const rl = checkRateLimit(ip, 'rsvp', LIMITS.rsvp.max, LIMITS.rsvp.windowMs);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
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
    .select('name, date, address, theme, mini_site_hero_path')
    .eq('id', guest.event_id)
    .single();

  const { data: album } = await supabase
    .from('gallery_albums')
    .select('public_token')
    .eq('event_id', guest.event_id)
    .maybeSingle();

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

  return NextResponse.json({ guest, event: event ?? null, tableName, memoryToken: album?.public_token ?? null });
}

export async function POST(request: NextRequest, { params }: Params) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'rsvp', LIMITS.rsvp.max, LIMITS.rsvp.windowMs);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const { token } = await params;
  const raw = await request.json();
  const parsed = RsvpPostSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { status, guest_count, meal_preference, meal_note } = parsed.data;

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

  // Note: WhatsApp couple notification is handled client-side via wa.me deep links.
  // Server-side fetch to wa.me does not work (it's a redirect, not an API).

  return NextResponse.json({ success: true });
}
