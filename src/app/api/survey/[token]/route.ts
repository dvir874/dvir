import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const supabase = createServerClient();

  const { data: survey, error } = await supabase
    .from('satisfaction_surveys')
    .select('*, events(name, date, client_name)')
    .eq('survey_token', token)
    .single();

  if (error || !survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(survey);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const { rating, review_text, platform_clicked } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating 1-5 required' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Fetch survey to get event_id
  const { data: survey } = await supabase
    .from('satisfaction_surveys')
    .select('id, event_id, responded_at')
    .eq('survey_token', token)
    .single();

  if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
  if (survey.responded_at) return NextResponse.json({ error: 'Already responded' }, { status: 409 });

  let ref_code_generated: string | null = null;

  // For happy customers (4-5 stars), generate a referral code
  if (rating >= 4) {
    const { data: event } = await supabase
      .from('events')
      .select('client_name')
      .eq('id', survey.event_id)
      .single();

    if (event?.client_name) {
      // Generate code from first name + random suffix
      const firstName = event.client_name.trim().split(' ')[0].toLowerCase()
        .replace(/[^a-z0-9א-ת]/g, '');
      const suffix = Math.random().toString(36).slice(2, 6);
      ref_code_generated = `${firstName}-${suffix}`;

      // Create referral code record (upsert to handle duplicate codes)
      await supabase.from('referral_codes').upsert({
        code: ref_code_generated,
        event_id: survey.event_id,
        referrer_name: event.client_name,
      }, { onConflict: 'code', ignoreDuplicates: true });
    }
  }

  const { error } = await supabase
    .from('satisfaction_surveys')
    .update({
      rating,
      review_text: review_text || null,
      platform_clicked: platform_clicked || null,
      responded_at: new Date().toISOString(),
      ref_code_generated,
    })
    .eq('survey_token', token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, ref_code: ref_code_generated });
}
