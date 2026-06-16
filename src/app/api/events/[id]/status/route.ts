import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import type { EventStatus } from '@/lib/types';

const VALID_STATUSES: EventStatus[] = [
  'draft', 'waiting_approval', 'approved',
  'ready_for_invitations', 'invitations_sent', 'rsvp_active', 'completed',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status?: string };

  if (!status || !VALID_STATUSES.includes(status as EventStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
