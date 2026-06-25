import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { generateAISeating } from '@/lib/seating-ai';
import type { GuestNode, Relationship, TableSlot } from '@/lib/seating-ai';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { event_id, apply = false } = await request.json();
  if (!event_id) return NextResponse.json({ error: 'event_id required' }, { status: 400 });

  const supabase = createServerClient();

  // Fetch all required data in parallel
  const [guestsRes, tablesRes, tagsRes, relsRes] = await Promise.all([
    supabase.from('guests').select('id, name, guest_count, status').eq('event_id', event_id).eq('status', 'confirmed'),
    supabase.from('seating_tables').select('id, name, capacity').eq('event_id', event_id).order('sort_order'),
    supabase.from('guest_tags').select('guest_id, tag').eq('event_id', event_id),
    supabase.from('guest_relationships').select('guest_id_a, guest_id_b, type').eq('event_id', event_id),
  ]);

  if (guestsRes.error) return NextResponse.json({ error: guestsRes.error.message }, { status: 500 });
  if (tablesRes.error) return NextResponse.json({ error: tablesRes.error.message }, { status: 500 });

  // Build tag map
  const tagMap: Record<string, string[]> = {};
  for (const row of tagsRes.data ?? []) {
    if (!tagMap[row.guest_id]) tagMap[row.guest_id] = [];
    tagMap[row.guest_id].push(row.tag);
  }

  const guests: GuestNode[] = (guestsRes.data ?? []).map((g) => ({
    id: g.id,
    name: g.name,
    guest_count: g.guest_count ?? 1,
    tags: tagMap[g.id] ?? [],
  }));

  const tables: TableSlot[] = (tablesRes.data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    capacity: t.capacity,
  }));

  const relationships: Relationship[] = (relsRes.data ?? []).map((r) => ({
    guest_id_a: r.guest_id_a,
    guest_id_b: r.guest_id_b,
    type: r.type as Relationship['type'],
  }));

  // Run AI algorithm
  const result = generateAISeating(guests, relationships, tables);

  // If apply=true, persist the assignments to the DB
  if (apply && result.assignments.length > 0) {
    // Clear existing assignments for this event
    await supabase.from('seating_assignments').delete().eq('event_id', event_id);

    // Insert new AI-generated assignments
    const rows = result.assignments.map((a) => ({
      guest_id: a.guest_id,
      table_id: a.table_id,
      event_id,
    }));
    const { error: insertErr } = await supabase.from('seating_assignments').insert(rows);
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ...result, applied: apply });
}
