import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const event_id = new URL(request.url).searchParams.get('event_id');
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guest_relationships')
    .select('*')
    .eq('event_id', event_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { event_id, guest_id_a, guest_id_b, type, notes } = await request.json();
  if (!event_id || !guest_id_a || !guest_id_b || !type) {
    return NextResponse.json({ error: 'event_id, guest_id_a, guest_id_b, type required' }, { status: 400 });
  }

  // Normalize order so UNIQUE constraint is consistent
  const [a, b] = [guest_id_a, guest_id_b].sort();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guest_relationships')
    .upsert(
      { event_id, guest_id_a: a, guest_id_b: b, type, notes: notes ?? null },
      { onConflict: 'guest_id_a,guest_id_b' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase.from('guest_relationships').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
