import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get('event_id');
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('event_id', event_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  const { event_id, guest_id, guest_name, amount, notes, received_at } = body;
  if (!event_id || !guest_name) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('gifts')
    .insert({ event_id, guest_id: guest_id ?? null, guest_name, amount: amount ?? 0, notes: notes ?? null, received_at: received_at ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
