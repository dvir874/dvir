import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { type, content, metadata } = await request.json();
  if (!type || !content) return NextResponse.json({ error: 'type and content required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('lead_activities')
    .insert({ lead_id: id, type, content, metadata: metadata ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update lead updated_at
  await supabase.from('leads').update({ updated_at: new Date().toISOString() }).eq('id', id);

  return NextResponse.json(data);
}
