import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string }> };

export type ActivityEventType =
  | 'invitation_sent'
  | 'reminder_sent'
  | 'rsvp_opened'
  | 'rsvp_submitted';

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('guest_events')
    .select('id, event_type, created_at')
    .eq('guest_id', id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { event_type } = body as { event_type?: string };

  const validTypes: ActivityEventType[] = [
    'invitation_sent', 'reminder_sent', 'rsvp_opened', 'rsvp_submitted',
  ];
  if (!event_type || !validTypes.includes(event_type as ActivityEventType)) {
    return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guest_events')
    .insert({ guest_id: id, event_type })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
