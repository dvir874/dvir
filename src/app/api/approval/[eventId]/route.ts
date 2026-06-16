import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? null);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const body = await request.json();
  const { status, client_comment } = body as {
    status?: 'approved' | 'changes_requested';
    client_comment?: string;
  };

  if (!status || !['approved', 'changes_requested'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Get latest request for this event
  const { data: latest } = await supabase
    .from('approval_requests')
    .select('id')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!latest) {
    return NextResponse.json({ error: 'No approval request found' }, { status: 404 });
  }

  const updates: Record<string, unknown> = { status };
  if (client_comment) updates.client_comment = client_comment;
  if (status === 'approved') updates.approved_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('approval_requests')
    .update(updates)
    .eq('id', latest.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Sync event status
  const eventStatus = status === 'approved' ? 'approved' : 'draft';
  await supabase.from('events').update({ status: eventStatus }).eq('id', eventId);

  return NextResponse.json(data);
}
