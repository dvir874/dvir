import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { normalizePhone } from '@/lib/phone';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get('event_id');
  if (!event_id)
    return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
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
  const { event_id, name, phone, guest_count } = body as {
    event_id?: string;
    name?: string;
    phone?: string;
    guest_count?: number;
  };

  if (!event_id || !name)
    return NextResponse.json({ error: 'event_id and name required' }, { status: 400 });

  // Normalize phone to international format if provided
  const normalizedPhone = phone && phone.trim()
    ? normalizePhone(phone.trim())
    : '';

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
    .insert({ event_id, name: name.trim().slice(0, 255), phone: normalizedPhone, guest_count: Math.max(1, Math.min(50, guest_count ?? 1)) })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
