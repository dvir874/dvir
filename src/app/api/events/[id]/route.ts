import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  const body = await req.json();
  const allowed = ['name', 'date', 'address', 'theme', 'bit_phone', 'notes', 'client_name', 'client_phone', 'client_email', 'venue_name', 'dress_code', 'parking_info', 'greeting'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.from('events').update(update).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing event id' }, { status: 400 });

  const supabase = createServerClient();

  // Get guest count before deletion (for response info)
  const { count: guestCount } = await supabase
    .from('guests')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id);

  // Cascade delete all related data in correct FK order
  const tables = [
    'seating_assignments',
    'seating_tables',
    'guest_activity',
    'guests',
    'wedding_vendor_contacts',
    'wedding_tasks',
    'budget_items',
    'budget_categories',
    'gift_items',
    'memory_items',
    'memory_capsules',
    'approval_requests',
    'referral_codes',
    'event_surveys',
    'vendor_recommendations',
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table as string).delete().eq('event_id', id);
    // Non-fatal: table may not exist or column may differ — log and continue
    if (error) console.warn(`[DELETE /api/events/${id}] ${table}: ${error.message}`);
  }

  // Finally delete the event itself
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true, guestCount: guestCount ?? 0 });
}
