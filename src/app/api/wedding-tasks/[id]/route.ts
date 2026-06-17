import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  const update: Record<string, unknown> = {};
  if ('completed' in body) {
    update.completed = body.completed;
    update.completed_at = body.completed ? new Date().toISOString() : null;
  }
  if ('title'    in body) update.title    = body.title;
  if ('due_date' in body) update.due_date = body.due_date;
  if ('category' in body) update.category = body.category;

  const { data, error } = await supabase
    .from('wedding_tasks')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from('wedding_tasks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
