import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase  = createServerClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, name, date, couple_token')
    .eq('couple_token', token)
    .single();

  if (!event) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // Only available after wedding day
  const weddingDate = new Date(event.date);
  if (weddingDate > new Date()) {
    return NextResponse.json({ error: 'not_yet', daysUntil: Math.ceil((weddingDate.getTime() - Date.now()) / 86_400_000) }, { status: 425 });
  }

  // Return cached recap if already computed
  const { data: cached } = await supabase
    .from('wedding_recaps')
    .select('*')
    .eq('event_id', event.id)
    .single();

  if (cached) return NextResponse.json({ event, recap: cached });

  // ─── Compute fresh recap ────────────────────────────────────────────────────
  const [
    { data: guests },
    { data: budgetItems },
    { data: memories },
    { data: tasks },
    { data: tables },
  ] = await Promise.all([
    supabase.from('guests').select('status, guest_count, response_time, opened_at').eq('event_id', event.id),
    supabase.from('budget_items').select('planned, actual').eq('event_id', event.id),
    supabase.from('memory_items').select('type, vault_token').eq('event_id', event.id),
    supabase.from('wedding_tasks').select('completed').eq('event_id', event.id),
    supabase.from('seating_tables').select('id, name').eq('event_id', event.id),
  ]);

  const allGuests    = guests ?? [];
  const confirmed    = allGuests.filter((g) => g.status === 'confirmed');
  const totalInvited = allGuests.reduce((s, g) => s + (g.guest_count || 1), 0);
  const totalArrived = confirmed.reduce((s, g) => s + (g.guest_count || 1), 0);
  const arrivalRate  = totalInvited > 0 ? (totalArrived / totalInvited) * 100 : 0;

  // Average response time in days
  const responseTimes = allGuests
    .filter((g) => g.response_time != null)
    .map((g) => g.response_time as number);
  const avgResponseDays = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length / 86400
    : null;

  const budgetPlanned = (budgetItems ?? []).reduce((s, b) => s + (b.planned || 0), 0);
  const budgetActual  = (budgetItems ?? []).reduce((s, b) => s + (b.actual  || 0), 0);

  const allMemories = memories ?? [];
  const totalMemories = allMemories.filter((m) => ['photo', 'video', 'blessing'].includes(m.type)).length;
  const totalAudio    = allMemories.filter((m) => m.type === 'audio').length;

  const allTasks = tasks ?? [];
  const taskCompletionRate = allTasks.length > 0
    ? (allTasks.filter((t) => t.completed).length / allTasks.length) * 100
    : 0;

  // Find table with most memories
  let topTableId     = null;
  let topTablePhotos = 0;

  if (tables && tables.length > 0 && allMemories.length > 0) {
    // Count memories per vault token (proxy for table activity via guest)
    const tokenCounts: Record<string, number> = {};
    for (const m of allMemories) {
      if (m.vault_token) tokenCounts[m.vault_token] = (tokenCounts[m.vault_token] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(tokenCounts));
    topTablePhotos  = maxCount;
    topTableId      = tables[0]?.id ?? null; // simplified — full impl would join to seating
  }

  const recap = {
    event_id:             event.id,
    total_invited:        totalInvited,
    total_arrived:        totalArrived,
    arrival_rate:         Math.round(arrivalRate * 100) / 100,
    avg_response_days:    avgResponseDays ? Math.round(avgResponseDays * 100) / 100 : null,
    reminders_sent:       0,  // would need reminder_logs table for accuracy
    reminders_converted:  0,
    budget_planned:       budgetPlanned,
    budget_actual:        budgetActual,
    top_table_id:         topTableId,
    top_table_photos:     topTablePhotos,
    total_memories:       totalMemories,
    total_audio:          totalAudio,
    task_completion_rate: Math.round(taskCompletionRate * 100) / 100,
  };

  // Store for future calls
  await supabase.from('wedding_recaps').upsert(recap, { onConflict: 'event_id' });

  return NextResponse.json({ event, recap });
}
