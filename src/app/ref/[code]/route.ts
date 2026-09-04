import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* Where a referral link lands.
 *
 * This was a Server Component calling cookies().set(). Next does not allow a
 * render to write cookies — only a Route Handler or a Server Action can — so
 * the cookie was never set, and every lead that arrived through a referral
 * looked exactly like one that arrived from Google. Both counters existed;
 * neither could ever agree with the other, because one counted clicks and the
 * other counted leads that were never tagged.
 *
 * A Route Handler can set cookies on the response, which is the whole reason
 * for the conversion. The ?ref= parameter is kept as well, so a browser that
 * refuses the cookie still carries the attribution in the URL — the form reads
 * whichever it finds.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code } = await ctx.params;
  const clean = String(code ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app";
  const res = NextResponse.redirect(
    clean ? `${base}/?ref=${encodeURIComponent(clean)}` : base, 302);

  if (!clean) return res;

  /* One row per click, and that is the whole record — a stored total is a
     second copy that can only drift from it. Awaited rather than
     fire-and-forget: a serverless function can be frozen the moment it
     responds, and an un-awaited insert is a click that sometimes counts. */
  try {
    const sb = createServerClient();
    await sb.from("referral_clicks").insert({ ref_code: clean });
  } catch { /* a lost click must never cost the visitor their redirect */ }

  res.cookies.set("ref_code", clean, {
    httpOnly: false,          /* the contact form reads it from JS */
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}
