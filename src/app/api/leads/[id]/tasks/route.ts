import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('lead_tasks')
    .select('*')
    .eq('lead_id', id)
    .order('due_date', { nullsFirst: false })
    .order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { title, due_date, priority } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('lead_tasks')
    .insert({ lead_id: id, title: title.trim(), due_date: due_date || null, priority: priority || 'medium' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
