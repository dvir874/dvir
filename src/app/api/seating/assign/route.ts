import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/auth-guard';

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { guest_id, table_id, event_id } = await request.json();
  if (!guest_id || !event_id) return NextResponse.json({ error: 'guest_id and event_id required' }, { status: 400 });

  const supabase = createServerClient();

  if (!table_id) {
    // Unassign
    await supabase.from('seating_assignments').delete().eq('guest_id', guest_id);
    return NextResponse.json({ success: true });
  }

  // Upsert (guest can only be at one table)
  const { error } = await supabase.from('seating_assignments').upsert(
    { guest_id, table_id, event_id },
    { onConflict: 'guest_id' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
