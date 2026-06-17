import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/seating/tags?event_id=X → { [guest_id]: string[] }
export async function GET(request: NextRequest) {
  const event_id = new URL(request.url).searchParams.get('event_id');
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guest_tags')
    .select('guest_id, tag')
    .eq('event_id', event_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by guest_id
  const grouped: Record<string, string[]> = {};
  for (const row of data ?? []) {
    if (!grouped[row.guest_id]) grouped[row.guest_id] = [];
    grouped[row.guest_id].push(row.tag);
  }
  return NextResponse.json(grouped);
}

// POST /api/seating/tags { guest_id, event_id, tag } → add tag
export async function POST(request: NextRequest) {
  const { guest_id, event_id, tag } = await request.json();
  if (!guest_id || !event_id || !tag) {
    return NextResponse.json({ error: 'guest_id, event_id, tag required' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('guest_tags')
    .upsert({ guest_id, event_id, tag }, { onConflict: 'guest_id,tag', ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/seating/tags { guest_id, tag } → remove tag
export async function DELETE(request: NextRequest) {
  const { guest_id, tag } = await request.json();
  if (!guest_id || !tag) return NextResponse.json({ error: 'guest_id and tag required' }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from('guest_tags')
    .delete()
    .eq('guest_id', guest_id)
    .eq('tag', tag);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
