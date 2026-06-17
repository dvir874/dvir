import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server';

export default async function RefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // Log the click and set cookie in parallel
  const supabase = createServerClient();
  const jar = await cookies();

  // Track click (fire-and-forget — don't block redirect)
  supabase.from('referral_clicks').insert({ ref_code: code }).then(() => {});
  supabase.from('referral_codes').update({ clicks: 0 }).eq('code', code).then(() => {});
  // Use raw SQL increment via RPC if available, otherwise just log the click

  // Set referral cookie for 30 days so contact form picks it up
  jar.set('ref_code', code, {
    httpOnly: false, // readable by JS for form attribution
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  redirect('/?ref=' + code);
}
