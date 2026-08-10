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
  meal_counts:     z.record(z.string().max(30), z.number().int().min(0).max(20)).optional(),
  ride_from:       z.string().max(100).optional().nullable(),
  ride_role:       z.enum(['offer', 'seek']).optional().nullable(),
  /* Opt-in for the shared photo gallery after the event */
  wants_photos:    z.boolean().optional(),
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
    .select('id, name, guest_count, status, event_id, opened_at, source_group, category, phone')
    .eq('rsvp_token', token)
    .single();

  if (error || !guest)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  /* Demo guests (category='demo') reset on every open — the link always starts
     fresh so the couple can share a live preview that never keeps answers.

     The phone check is the guard that was missing, and it is not theoretical:
     one guest on the live 24.08 wedding carries category='demo' with a real
     phone number, and had already confirmed for two. Every condition above was
     true for them, so the next time they opened their own invitation this
     branch would have erased the answer they gave — silently, from a GET they
     triggered themselves, and then shown them "חבל שלא תוכלו להגיע".

     A demo record is a preview with nobody behind it. A row with a phone number
     is a person, whatever the category column says, and a destructive reset
     must never be one mislabelled field away from firing. */
  const isPreviewOnly = !String(guest.phone ?? '').trim();
  if (guest.category === 'demo' && isPreviewOnly && guest.status !== 'pending') {
    await supabase
      .from('guests')
      .update({ status: 'pending', response_time: null, guest_count: 1, meal_preference: null, meal_note: null })
      .eq('id', guest.id);
    guest.status = 'pending';
    guest.guest_count = 1;
  }

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
    .select('name, date, address, venue_name, theme, mini_site_hero_path, bit_phone, paybox_link')
    .eq('id', guest.event_id)
    .single();

  /* The blessing and photo screens live at /memory/[token], and that route
     authenticates against vault_tokens — not against the gallery album. Handing
     out the album's public_token sent every guest to a 404: 88 people had
     already tapped "כתבו ברכה לזוג" and memory_items was still empty, so not one
     blessing had ever reached the couple. */
  const { data: vault } = await supabase
    .from('vault_tokens')
    .select('token')
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

  return NextResponse.json({ guest, event: event ?? null, tableName, memoryToken: vault?.token ?? null });
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
  const { status, guest_count, meal_preference, meal_note, meal_counts, ride_from, ride_role, wants_photos } = parsed.data;

  const supabase = createServerClient();
  const basePatch = {
    status,
    guest_count: guest_count ?? 1,
    response_time: new Date().toISOString(),
    ...(meal_preference !== undefined ? { meal_preference } : {}),
    ...(meal_note !== undefined ? { meal_note } : {}),
  };

  const newColsPatch = {
    ...(meal_counts !== undefined ? { meal_counts } : {}),
    ...(ride_from !== undefined ? { ride_from } : {}),
    ...(ride_role !== undefined ? { ride_role } : {}),
    ...(wants_photos !== undefined ? { wants_photos } : {}),
  };

  let { data: updated, error } = await supabase
    .from('guests')
    .update({ ...basePatch, ...newColsPatch })
    .eq('rsvp_token', token)
    .select()
    .single();

  // Graceful fallback: new columns may not exist yet (pre-migration)
  if (error && Object.keys(newColsPatch).length > 0) {
    ({ data: updated, error } = await supabase
      .from('guests')
      .update(basePatch)
      .eq('rsvp_token', token)
      .select()
      .single());
  }

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
