import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase-server';

export default async function RefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  // Log the click and set cookie in parallel
  const supabase = createServerClient();
  const jar = await cookies();

  // Track click (fire-and-forget — don't block redirect)
  /* One row per click, and that is the whole record.
   *
   * There used to be a second write here that set referral_codes.clicks to 0
   * on every visit — an increment someone meant to come back and finish, left
   * as a literal zero. It did not fail to count; it actively erased. Every
   * click a referral ever earned reset the counter that was supposed to prove
   * it worked, which is worse than never having counted at all.
   *
   * A total is a question referral_clicks can answer at any time. A stored
   * counter is a second copy that can only drift from it. */
  supabase.from('referral_clicks').insert({ ref_code: code }).then(() => {});

  // Set referral cookie for 30 days so contact form picks it up
  jar.set('ref_code', code, {
    httpOnly: false, // readable by JS for form attribution
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  });

  redirect('/?ref=' + code);
}
