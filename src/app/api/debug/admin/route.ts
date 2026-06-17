import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function testRoute(label: string, fn: () => Promise<unknown>) {
  try {
    const result = await fn();
    return { label, ok: true, result };
  } catch (e) {
    return { label, ok: false, error: String(e) };
  }
}

export async function GET() {
  const supabase = createServerClient();
  const errors: string[] = [];

  // 1. Test /api/events equivalent
  const eventsTest = await testRoute('events table', async () => {
    const { data, error } = await supabase.from('events').select('*').order('date');
    if (error) throw new Error(error.message);
    return { isArray: Array.isArray(data), count: data?.length ?? 0, firstRow: data?.[0] ?? null };
  });

  // 2. Test guests table
  const guestsTest = await testRoute('guests table', async () => {
    const { data, error } = await supabase.from('guests').select('id, status').limit(5);
    if (error) throw new Error(error.message);
    const statuses = (data ?? []).map((g) => g.status);
    const unexpected = statuses.filter((s) => !['pending', 'confirmed', 'declined'].includes(s));
    return { isArray: Array.isArray(data), count: data?.length ?? 0, statuses, unexpectedStatuses: unexpected };
  });

  // 3. Test approval_requests table (migration 002)
  const approvalTest = await testRoute('approval_requests table', async () => {
    const { data, error } = await supabase.from('approval_requests').select('id').limit(1);
    if (error) throw new Error(`Table may not exist: ${error.message}`);
    return { ok: true, count: data?.length ?? 0 };
  });

  // 4. Test manager/overview columns
  const overviewTest = await testRoute('events with new columns', async () => {
    const { data, error } = await supabase
      .from('events')
      .select('id, status, client_name, client_phone, event_type')
      .limit(1);
    if (error) throw new Error(`Missing columns? ${error.message}`);
    return { ok: true, row: data?.[0] ?? null };
  });

  // 5. Report any unexpected guest statuses
  if (guestsTest.ok) {
    const res = guestsTest.result as { unexpectedStatuses: string[] };
    if (res.unexpectedStatuses.length > 0) {
      errors.push(`Guests with unexpected status values: ${JSON.stringify(res.unexpectedStatuses)} — these crash the admin render`);
    }
  }

  if (!eventsTest.ok) errors.push(`events: ${eventsTest.error}`);
  if (!guestsTest.ok) errors.push(`guests: ${guestsTest.error}`);
  if (!approvalTest.ok) errors.push(`approval_requests: ${approvalTest.error}`);
  if (!overviewTest.ok) errors.push(`new columns: ${overviewTest.error}`);

  return NextResponse.json({
    events: eventsTest,
    guests: guestsTest,
    managerOverview: overviewTest,
    approvalRequests: approvalTest,
    errors,
    verdict: errors.length === 0 ? 'All admin dependencies OK' : `${errors.length} issue(s) found`,
  });
}
