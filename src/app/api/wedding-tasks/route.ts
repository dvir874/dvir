import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

const DEFAULT_TASKS = [
  { title: 'הזמנת אולם', category: 'venue', sort_order: 1 },
  { title: 'הזמנת צלם', category: 'vendors', sort_order: 2 },
  { title: 'הזמנת די-ג\'יי / להקה', category: 'vendors', sort_order: 3 },
  { title: 'הזמנת קייטרינג', category: 'vendors', sort_order: 4 },
  { title: 'הזמנת פרחים', category: 'vendors', sort_order: 5 },
  { title: 'רישום בנישואין ברבנות', category: 'legal', sort_order: 6 },
  { title: 'קבלת טבעות', category: 'personal', sort_order: 7 },
  { title: 'פגישה עם רב', category: 'legal', sort_order: 8 },
  { title: 'מקווה', category: 'personal', sort_order: 9 },
  { title: 'שליחת הזמנות', category: 'vendors', sort_order: 10 },
  { title: 'סגירת ספירת אורחים סופית', category: 'venue', sort_order: 11 },
  { title: 'סידורי הושבה', category: 'venue', sort_order: 12 },
  { title: 'תשלומים לספקים', category: 'vendors', sort_order: 13 },
  { title: 'הכנת ליסט שירים לדי-ג\'יי', category: 'day_of', sort_order: 14 },
  { title: 'הכנת תדריך ליום האירוע', category: 'day_of', sort_order: 15 },
];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('event_id');
  if (!eventId) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();

  // Auto-seed defaults if this event has no tasks yet
  const { data: existing } = await supabase
    .from('wedding_tasks')
    .select('id')
    .eq('event_id', eventId)
    .limit(1);

  if (!existing?.length) {
    await supabase.from('wedding_tasks').insert(
      DEFAULT_TASKS.map((t) => ({ ...t, event_id: eventId, is_default: true }))
    );
  }

  const { data, error } = await supabase
    .from('wedding_tasks')
    .select('*')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { event_id, title, category, due_date } = await request.json();
  if (!event_id || !title?.trim()) {
    return NextResponse.json({ error: 'event_id and title required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: last } = await supabase
    .from('wedding_tasks')
    .select('sort_order')
    .eq('event_id', event_id)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = (last?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from('wedding_tasks')
    .insert({ event_id, title: title.trim(), category: category || 'general', due_date: due_date || null, sort_order: nextOrder })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
