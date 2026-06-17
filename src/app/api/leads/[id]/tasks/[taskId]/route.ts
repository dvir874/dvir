import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string; taskId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { taskId } = await params;
  const body = await request.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('lead_tasks')
    .update(body)
    .eq('id', taskId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { taskId } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from('lead_tasks').delete().eq('id', taskId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
