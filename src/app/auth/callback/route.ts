import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { DEFAULT_THEME_ID } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    // Exchange the auth code for a session
    const { createClient } = await import("@supabase/supabase-js");
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: sessionData, error } = await anonClient.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] code exchange error:", error.message);
      return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`);
    }

    const user = sessionData?.user;
    if (!user) return NextResponse.redirect(`${origin}/auth/login`);

    // Check if this user already has an event
    const serviceClient = createServerClient();
    const { data: existingEvent } = await serviceClient
      .from("events")
      .select("couple_token")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (existingEvent?.couple_token) {
      return NextResponse.redirect(`${origin}/couple/${existingEvent.couple_token}/onboarding`);
    }

    // New Google OAuth user — create their event
    const meta = user.user_metadata ?? {};
    const brideName = (meta.bride_name as string) || (meta.full_name as string)?.split(" ")[0] || "";
    const groomName = (meta.groom_name as string) || "";

    const coupleName = brideName && groomName
      ? `חתונת ${brideName} ו${groomName}`
      : brideName || groomName || "חתונה חדשה";

    const defaultDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: newEvent, error: eventError } = await serviceClient
      .from("events")
      .insert({
        name:        coupleName,
        date:        defaultDate,
        bride_name:  brideName || null,
        groom_name:  groomName || null,
        client_name: user.email ?? null,
        theme:       DEFAULT_THEME_ID,
        user_id:     user.id,
      })
      .select("couple_token")
      .single();

    if (eventError || !newEvent) {
      console.error("[auth/callback] event creation error:", eventError?.message);
      return NextResponse.redirect(`${origin}/auth/register?error=event_failed`);
    }

    return NextResponse.redirect(`${origin}/couple/${newEvent.couple_token}/onboarding`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
