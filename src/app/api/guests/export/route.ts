import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { generateGuestsXlsx } from '@/lib/xlsx-utils';
import type { Guest } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const event_id = searchParams.get('event_id');
  if (!event_id)
    return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', event_id)
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const buffer = generateGuestsXlsx((data ?? []) as Guest[]);
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="guests.xlsx"',
    },
  });
}
