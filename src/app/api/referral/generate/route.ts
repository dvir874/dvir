import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// POST — admin creates a survey + referral for a completed event
export async function POST(request: NextRequest) {
  const { event_id } = await request.json();
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();

  // Check if survey already exists
  const { data: existing } = await supabase
    .from('satisfaction_surveys')
    .select('id, survey_token')
    .eq('event_id', event_id)
    .single();

  if (existing) {
    return NextResponse.json({ survey_token: existing.survey_token, already_existed: true });
  }

  const { data, error } = await supabase
    .from('satisfaction_surveys')
    .insert({ event_id, sent_at: new Date().toISOString() })
    .select('survey_token')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ survey_token: data.survey_token });
}
