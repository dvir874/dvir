import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { generateTasks, suggestBudget, type OnboardingOpts } from '@/lib/task-templates';

export const dynamic = 'force-dynamic';

// GET — check onboarding status
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase  = createServerClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, onboarding_completed, guest_count_estimate, onboarding_style, onboarding_fears, onboarding_manager, onboarding_moment')
    .eq('couple_token', token)
    .single();

  if (!event) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ onboarding_completed: event.onboarding_completed, event });
}

// POST — complete onboarding: save preferences + generate tasks + seed budget
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body       = await req.json();
  const { guestCount, style, fears, moment, manager, bride_name, groom_name, venue_name, date } = body;

  const supabase = createServerClient();

  const { data: event, error: evErr } = await supabase
    .from('events')
    .select('id, date, onboarding_completed')
    .eq('couple_token', token)
    .single();

  if (evErr || !event) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (event.onboarding_completed) return NextResponse.json({ already: true });

  // Save onboarding preferences
  const coupleName = bride_name && groom_name ? `חתונת ${bride_name} ו${groom_name}` : undefined;
  await supabase.from('events').update({
    onboarding_completed: true,
    onboarding_style:     style     || null,
    onboarding_fears:     fears     || [],
    onboarding_moment:    moment    || null,
    onboarding_manager:   manager   || 'both',
    guest_count_estimate: guestCount || null,
    ...(bride_name  ? { bride_name }  : {}),
    ...(groom_name  ? { groom_name }  : {}),
    ...(venue_name  ? { venue_name }  : {}),
    ...(coupleName  ? { name: coupleName } : {}),
    ...(date        ? { date }         : {}),
  }).eq('id', event.id);

  const weddingDate = new Date(event.date);
  const daysUntil   = Math.max(0, Math.ceil((weddingDate.getTime() - Date.now()) / 86_400_000));

  const opts: OnboardingOpts = {
    daysUntil,
    guestCount: Number(guestCount) || 150,
    style:      style  || 'classic',
    fears:      fears  || [],
    manager:    manager || 'both',
  };

  // Generate personalized task list
  const taskRows = generateTasks(weddingDate, opts).map((t, i) => ({
    ...t,
    event_id:   event.id,
    sort_order: i,
  }));

  // Batch insert (ignore conflicts — idempotent)
  if (taskRows.length > 0) {
    await supabase.from('wedding_tasks').insert(taskRows);
  }

  // Seed budget categories from suggestion
  const budget = suggestBudget(opts.guestCount, opts.style);
  const budgetCategories = [
    { category: 'venue',       label: 'אולם וקייטרינג', planned: budget.venue + budget.catering },
    { category: 'photography', label: 'צילום',           planned: budget.photography },
    { category: 'music',       label: 'מוזיקה',          planned: budget.music },
    { category: 'flowers',     label: 'פרחים ועיצוב',   planned: budget.flowers },
    { category: 'dress',       label: 'שמלה וחליפה',    planned: budget.dress },
    { category: 'other',       label: 'שונות',           planned: budget.other },
  ];

  const { data: existingBudget } = await supabase
    .from('budget_items')
    .select('id')
    .eq('event_id', event.id)
    .limit(1);

  // Only seed if budget is completely empty
  if (!existingBudget || existingBudget.length === 0) {
    await supabase.from('budget_items').insert(
      budgetCategories.map((b) => ({
        event_id: event.id,
        category: b.category,
        label:    b.label,
        planned:  b.planned,
        actual:   0,
      }))
    );
  }

  return NextResponse.json({
    ok:         true,
    tasksCreated: taskRows.length,
    budget,
  });
}
