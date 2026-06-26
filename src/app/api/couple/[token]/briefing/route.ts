import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { computeWeddingScore, generateAlerts, getBriefingPhase, PHASE_LABELS } from '@/lib/wedding-score';

type Params = { params: Promise<{ token: string }> };

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: Params) {
  const { token }  = await params;
  const supabase   = createServerClient();
  const now        = Date.now();

  const { data: event } = await supabase
    .from('events')
    .select('id, name, date, client_name')
    .eq('couple_token', token)
    .single();

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const daysUntilEvent = Math.max(0, Math.ceil((new Date(event.date).getTime() - now) / 86_400_000));

  // Parallel fetch everything needed for score
  const [guestsRes, tasksRes, seatingRes, assignRes, budgetRes, vendorsRes, snapshotRes] = await Promise.all([
    supabase.from('guests').select('id, status, guest_count').eq('event_id', event.id),
    supabase.from('wedding_tasks').select('id, completed').eq('event_id', event.id),
    supabase.from('seating_tables').select('id, capacity').eq('event_id', event.id),
    supabase.from('seating_assignments').select('guest_id, guests(guest_count)').eq('event_id', event.id),
    supabase.from('budget_items').select('planned_amount, actual_amount').eq('event_id', event.id),
    supabase.from('wedding_vendors').select('id, confirmed').eq('event_id', event.id),
    supabase.from('wedding_score_snapshots')
      .select('score, snapped_at')
      .eq('event_id', event.id)
      .order('snapped_at', { ascending: false })
      .limit(2),
  ]);

  const guests    = guestsRes.data ?? [];
  const tasks     = tasksRes.data ?? [];
  const tables    = seatingRes.data ?? [];
  const assigns   = assignRes.data ?? [];
  const budget    = budgetRes.data ?? [];
  const vendors   = vendorsRes.data ?? [];
  const snapshots = snapshotRes.data ?? [];

  const confirmed  = guests.filter((g) => g.status === 'confirmed');
  const declined   = guests.filter((g) => g.status === 'declined').length;
  const confirmedAttendees = confirmed.reduce((s, g) => s + (g.guest_count ?? 1), 0);

  // Assigned seats = sum of guest_count for assigned guests
  const assignedSeats = assigns.reduce((s, a) => {
    const gc = Array.isArray(a.guests) ? a.guests[0]?.guest_count : (a.guests as { guest_count: number } | null)?.guest_count;
    return s + (gc ?? 1);
  }, 0);

  const budgetPlanned = budget.reduce((s, b) => s + (b.planned_amount ?? 0), 0);
  const budgetActual  = budget.reduce((s, b) => s + (b.actual_amount ?? 0), 0);

  const previousScore = snapshots.length >= 2 ? snapshots[1].score : snapshots[0]?.score;

  const scoreInput = {
    totalGuests:        guests.length,
    confirmedGuests:    confirmed.length,
    declinedGuests:     declined,
    daysUntilEvent,
    totalTasks:         tasks.length,
    completedTasks:     tasks.filter((t) => t.completed).length,
    confirmedAttendees,
    assignedSeats,
    budgetItemCount:    budget.length,
    budgetActual,
    budgetPlanned,
    totalVendors:       vendors.length,
    confirmedVendors:   vendors.filter((v) => v.confirmed).length,
    previousScore,
  };

  const score  = computeWeddingScore(scoreInput);
  const alerts = generateAlerts(scoreInput);
  const phase  = getBriefingPhase(daysUntilEvent);

  // Wedding Readiness Meter (weighted %)
  const rsvpPct     = guests.length > 0 ? (confirmed.length + declined) / guests.length : 0;
  const tasksPct    = tasks.length > 0 ? tasks.filter(t => t.completed).length / tasks.length : 0;
  const vendorsPct  = vendors.length > 0 ? vendors.filter(v => v.confirmed).length / vendors.length : 0;
  const seatingPct  = confirmedAttendees > 0 ? Math.min(assignedSeats / confirmedAttendees, 1) : 0;
  const budgetPct   = budget.length > 0 ? 1 : 0;
  const readinessPct = Math.round(
    rsvpPct * 25 + tasksPct * 20 + vendorsPct * 20 + seatingPct * 20 + budgetPct * 15
  );

  // Greeting by time of day
  const coupleName = event.client_name?.trim() || null;
  const hour = new Date().getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? "בוקר טוב"
    : hour >= 12 && hour < 17 ? "צהריים טובים"
    : hour >= 17 && hour < 21 ? "ערב טוב"
    : "לילה טוב";
  const greeting = coupleName ? `${timeGreeting}, ${coupleName}` : timeGreeting;

  // Phase-aware message
  const phaseMessage: Record<typeof phase, string> = {
    planning:     "עוד זמן לתכנן הכל בשלווה — התמקדו בקבלת אישורים.",
    organizing:   "הגיע הזמן לאשר ספקים ולהתחיל בסידור ההושבה.",
    accelerating: "האצה לפני הגמר — שלחו תזכורות לאורחים שטרם ענו.",
    finalizing:   "פחות משלושה שבועות — הגיע הזמן לסגור את כל הפרטים.",
    countdown:    "ספירה לאחור! בדקו שהכל מוכן ליום הגדול.",
    imminent:     "ממש בקרוב! אנחנו שמחים בשמחתכם 🤍",
  };

  // Store snapshot if last one is >6 days old or none exists
  const lastSnapshot = snapshots[0];
  const shouldSnapshot = !lastSnapshot ||
    now - new Date(lastSnapshot.snapped_at).getTime() > 6 * 86_400_000;

  if (shouldSnapshot) {
    await supabase.from('wedding_score_snapshots').insert({
      event_id:   event.id,
      score:      score.total,
      components: Object.fromEntries(score.components.map((c) => [c.key, c.points])),
    });
  }

  return NextResponse.json({
    greeting,
    phase,
    phaseLabel:    PHASE_LABELS[phase],
    phaseMessage:  phaseMessage[phase],
    daysUntilEvent,
    eventName:     event.name,
    score,
    alerts,
    readinessPct,
    event: {
      id:             event.id,
      name:           event.name,
      date:           event.date,
      service_steps:  (event as Record<string, unknown>).service_steps ?? [],
    },
    keyFacts: [
      guests.length > 0
        ? `${guests.filter(g => g.status === 'confirmed').length + declined} מתוך ${guests.length} ענו`
        : 'עדיין אין אורחים',
      tasks.length > 0
        ? `${tasks.filter(t => t.completed).length} מתוך ${tasks.length} משימות הושלמו`
        : 'עדיין אין משימות',
      daysUntilEvent > 0
        ? `${daysUntilEvent} ימים עד החתונה`
        : 'יום החתונה הגיע!',
    ],
  });
}

// PATCH — one-tap actions: send_reminder | mark_vendor_contacted | dismiss_alert
export async function PATCH(req: NextRequest, { params }: Params) {
  const { token }  = await params;
  const supabase   = createServerClient();
  const body       = await req.json();
  const { action } = body;

  const { data: event } = await supabase
    .from('events')
    .select('id, name')
    .eq('couple_token', token)
    .single();

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Generic event field update (gift methods, payment links, etc.)
  if (!action) {
    const { bit_phone, paybox_link, easy2give_link, custom_gift_link } = body;
    const patch: Record<string, unknown> = {};
    if (bit_phone !== undefined) patch.bit_phone = bit_phone;
    if (paybox_link !== undefined) patch.paybox_link = paybox_link;
    if (easy2give_link !== undefined) patch.easy2give_link = easy2give_link;
    if (custom_gift_link !== undefined) patch.custom_gift_link = custom_gift_link;
    if (Object.keys(patch).length > 0) {
      await supabase.from('events').update(patch).eq('id', event.id);
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'send_reminder') {
    // Fetch pending guests and mark reminder_sent timestamp
    const { data: pending } = await supabase
      .from('guests')
      .select('id, name, phone')
      .eq('event_id', event.id)
      .eq('status', 'pending')
      .not('phone', 'is', null);

    if (!pending || pending.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 });
    }

    // Mark reminder sent time (could trigger actual WhatsApp in future)
    await supabase
      .from('guests')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('event_id', event.id)
      .eq('status', 'pending');

    return NextResponse.json({ ok: true, sent: pending.length });
  }

  if (action === 'mark_vendor_contacted') {
    const { category } = body;
    await supabase
      .from('wedding_vendors')
      .upsert(
        { event_id: event.id, category, confirmed: false },
        { onConflict: 'event_id,category' }
      );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'unknown action' }, { status: 400 });
}

// POST — update vendor confirmed status
export async function POST(_req: NextRequest, { params }: Params) {
  const { token }  = await params;
  const supabase   = createServerClient();
  const body       = await _req.json();

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('couple_token', token)
    .single();

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { category, vendor_name, confirmed } = body;
  const { data, error } = await supabase
    .from('wedding_vendors')
    .upsert({ event_id: event.id, category, vendor_name, confirmed }, { onConflict: 'event_id,category' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
