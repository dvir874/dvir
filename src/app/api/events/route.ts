import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { DEFAULT_THEME_ID } from '@/lib/themes';

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { name, date, address, theme } = body as {
    name?: string;
    date?: string;
    address?: string;
    theme?: string;
  };
  if (!name || !date)
    return NextResponse.json({ error: 'name and date are required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('events')
    .insert({ name, date, address, theme: theme ?? DEFAULT_THEME_ID })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
