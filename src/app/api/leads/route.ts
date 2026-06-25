import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth-guard';
import { LeadCreateSchema, parseBody } from '@/lib/schemas';
import { withRetry } from '@/lib/retry';

export const dynamic = 'force-dynamic';

// GET — admin only: list all leads with task counts
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
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
  const { checkRateLimit, getClientIp, LIMITS } = await import('@/lib/rate-limit');
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'leads', LIMITS.leads.max, LIMITS.leads.windowMs);
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  const rawBody = await request.json();
  const { data: body, error: validationError } = parseBody(LeadCreateSchema, rawBody);
  if (validationError || !body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const { name, phone, email, event_type, wedding_date, guest_count, source, ref_code, notes } = body;

  const supabase = createServerClient();

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      name: name,
      phone: phone,
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
    console.error('[leads:insert]', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  // Log form_submit activity
  await supabase.from('lead_activities').insert({
    lead_id: lead.id,
    type: 'form_submit',
    content: `פנייה נכנסה דרך ${source || 'אתר'}`,
    metadata: { event_type, wedding_date, guest_count, ref_code },
  });

  // Push notification via ntfy.sh (JSON format — supports Unicode/Hebrew correctly)
  withRetry(async () => {
    const dateStr   = wedding_date ? ` | חתונה: ${wedding_date}` : '';
    const sourceStr = source && source !== 'unknown' ? ` | ${source}` : '';
    const ntfyTopic = process.env.NTFY_TOPIC ?? 'regalifnei-leads';
    const ntfyRes = await fetch('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic:    ntfyTopic,
        title:    'פנייה חדשה מהאתר!',
        message:  `${name.trim()} | ${phone.trim()}${dateStr}${sourceStr}`,
        priority: 4,
        tags:     ['bell'],
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!ntfyRes.ok) throw new Error(`ntfy HTTP ${ntfyRes.status}`);
  }, { attempts: 3, baseDelayMs: 500, label: 'ntfy' }).catch(err => {
    console.error('[ntfy] all retries failed:', err);
  });

  // If came via referral, increment leads count on referral code
  if (ref_code) {
    await supabase
      .from('referral_clicks')
      .insert({ ref_code, converted_lead_id: lead.id })
      .then(() => {});
  }

  return NextResponse.json({ id: lead.id });
}
