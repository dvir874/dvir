import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get('event_id');
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();

  const [tablesRes, assignmentsRes, guestsRes] = await Promise.all([
    supabase.from('seating_tables').select('*').eq('event_id', event_id).order('sort_order'),
    supabase.from('seating_assignments').select('*').eq('event_id', event_id),
    supabase.from('guests').select('id, name, guest_count, status, category').eq('event_id', event_id).order('name'),
  ]);

  if (tablesRes.error) return NextResponse.json({ error: tablesRes.error.message }, { status: 500 });

  return NextResponse.json({
    tables: tablesRes.data ?? [],
    assignments: assignmentsRes.data ?? [],
    guests: guestsRes.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_id, name, capacity, type, sort_order } = body;
  if (!event_id || !name) return NextResponse.json({ error: 'event_id and name required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('seating_tables')
    .insert({ event_id, name, capacity: capacity ?? 10, type: type ?? 'round', sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
