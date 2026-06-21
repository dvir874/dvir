import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = createServerClient();

  // Get all referral codes with conversion counts
  const { data: codes } = await sb
    .from('referral_clicks')
    .select('ref_code, converted_lead_id')
    .order('ref_code');

  if (!codes) return NextResponse.json({ stats: [] });

  // Group by ref_code
  const grouped: Record<string, { clicks: number; conversions: number }> = {};
  for (const row of codes) {
    if (!grouped[row.ref_code]) grouped[row.ref_code] = { clicks: 0, conversions: 0 };
    grouped[row.ref_code].clicks++;
    if (row.converted_lead_id) grouped[row.ref_code].conversions++;
  }

  const stats = Object.entries(grouped).map(([code, data]) => ({
    code,
    ...data,
    conversion_rate: data.clicks > 0 ? Math.round((data.conversions / data.clicks) * 100) : 0,
  }));

  return NextResponse.json({ stats });
}
