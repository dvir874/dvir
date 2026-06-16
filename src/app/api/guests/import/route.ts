import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { parseGuestsFromXlsx } from '@/lib/xlsx-utils';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const event_id = formData.get('event_id') as string | null;

  if (!file || !event_id)
    return NextResponse.json(
      { error: 'file and event_id are required' },
      { status: 400 }
    );

  const buffer = await file.arrayBuffer();
  let parsed: { name: string; phone: string; guest_count: number }[];
  try {
    parsed = parseGuestsFromXlsx(buffer);
  } catch {
    return NextResponse.json(
      { error: 'Could not parse Excel file. Check the format.' },
      { status: 422 }
    );
  }

  if (parsed.length === 0)
    return NextResponse.json(
      { error: 'No valid rows found. Ensure columns: שם, טלפון, מספר מוזמנים' },
      { status: 422 }
    );

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('guests')
    .insert(parsed.map((g) => ({ ...g, event_id, status: 'pending' })))
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ imported: data?.length ?? 0 });
}
