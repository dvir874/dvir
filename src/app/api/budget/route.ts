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
    .from('budget_items')
    .select('*')
    .eq('event_id', event_id)
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = await request.json();
  const { event_id, category, description, planned_amount, actual_amount, notes } = body;
  if (!event_id || !category || !description) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('budget_items')
    .insert({ event_id, category, description, planned_amount: planned_amount ?? 0, actual_amount: actual_amount ?? null, notes: notes ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
