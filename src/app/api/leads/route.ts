import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET — admin only: list all leads with task counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // optional filter

  const supabase = createServerClient();
  let query = supabase
    .from('leads')
    .select('*, lead_tasks(id, completed), lead_activities(id)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — public: contact form submission creates a lead
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, phone, email, event_type, wedding_date, guest_count, source, ref_code, notes } = body;

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'name and phone required' }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      event_type: event_type || null,
      wedding_date: wedding_date || null,
      guest_count: guest_count ? Number(guest_count) : null,
      source: source || 'unknown',
      ref_code: ref_code || null,
      notes: notes?.trim() || null,
      status: 'new_lead',
    })
    .select()
    .single();

  if (error) {
    console.error('[api/leads POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log form_submit activity
  await supabase.from('lead_activities').insert({
    lead_id: lead.id,
    type: 'form_submit',
    content: `פנייה נכנסה דרך ${source || 'אתר'}`,
    metadata: { event_type, wedding_date, guest_count, ref_code },
  });

  // Push notification via ntfy.sh
  try {
    const dateStr   = wedding_date ? `\n📅 חתונה: ${wedding_date}` : '';
    const sourceStr = source && source !== 'unknown' ? `\n📍 מקור: ${source}` : '';
    const ntfyTopic = process.env.NTFY_TOPIC ?? 'regalifnei-leads';
    const ntfyRes = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: 'POST',
      headers: {
        'Title': '✦ פנייה חדשה מהאתר!',
        'Priority': 'high',
        'Tags': 'wedding,bell',
        'Content-Type': 'text/plain; charset=utf-8',
      },
      body: `👤 ${name.trim()}\n📞 ${phone.trim()}${dateStr}${sourceStr}`,
      signal: AbortSignal.timeout(6000),
    });
    if (!ntfyRes.ok) {
      console.error('[ntfy] failed:', ntfyRes.status, await ntfyRes.text().catch(() => ''));
    }
  } catch (ntfyErr) {
    console.error('[ntfy] exception:', ntfyErr);
  }

  // If came via referral, increment leads count on referral code
  if (ref_code) {
    await supabase
      .from('referral_clicks')
      .insert({ ref_code, converted_lead_id: lead.id })
      .then(() => {});
  }

  return NextResponse.json({ id: lead.id });
}
