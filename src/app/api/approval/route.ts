import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { event_id, version_name } = body as {
    event_id?: string;
    version_name?: string;
  };

  if (!event_id) {
    return NextResponse.json({ error: 'event_id required' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Auto-number version based on existing requests for this event
  const { count } = await supabase
    .from('approval_requests')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', event_id);

  const resolvedVersionName =
    version_name?.trim() || `גרסה ${(count ?? 0) + 1}`;

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({ event_id, version_name: resolvedVersionName, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update event status to waiting_approval
  await supabase
    .from('events')
    .update({ status: 'waiting_approval' })
    .eq('id', event_id);

  return NextResponse.json(data, { status: 201 });
}
