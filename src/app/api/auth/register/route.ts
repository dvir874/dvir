import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { DEFAULT_THEME_ID } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, "register", 10, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { bride_name, groom_name, email, password, wedding_date } = body as {
    bride_name?: string;
    groom_name?: string;
    email?: string;
    password?: string;
    wedding_date?: string;
  };

  if (!bride_name || !groom_name) {
    return NextResponse.json({ error: "bride_name and groom_name are required" }, { status: 400 });
  }

  const serviceClient = createServerClient();
  const coupleName = `חתונת ${bride_name} ו${groom_name}`;
  const defaultDate = wedding_date ||
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let userId: string | undefined;

  // If email + password provided, create Supabase Auth user
  if (email && password) {
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: authData, error: authError } = await anonClient.auth.signUp({
      email,
      password,
      options: {
        data: { bride_name, groom_name },
        emailRedirectTo: `${req.nextUrl.origin}/auth/callback`,
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "כתובת האימייל הזו כבר רשומה. רוצים להתחבר?" }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    userId = authData.user?.id;
  }

  // Create the event row
  const { data: event, error: eventError } = await serviceClient
    .from("events")
    .insert({
      name:        coupleName,
      date:        defaultDate,
      bride_name,
      groom_name,
      client_name: email ?? null,
      theme:       DEFAULT_THEME_ID,
      ...(userId ? { user_id: userId } : {}),
    })
    .select("id, couple_token")
    .single();

  if (eventError || !event) {
    console.error("[api/auth/register] insert error:", eventError?.message);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }

  return NextResponse.json({ couple_token: event.couple_token }, { status: 201 });
}
