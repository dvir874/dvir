import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { DEFAULT_THEME_ID } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, "register", 10, 60 * 60 * 1000); // 10 registrations per hour per IP
  if (!rl.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const { bride_name, groom_name, email, wedding_date } = body as {
    bride_name?: string;
    groom_name?: string;
    email?: string;
    wedding_date?: string;
  };

  if (!bride_name || !groom_name) {
    return NextResponse.json({ error: "bride_name and groom_name are required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Build couple name for event.name
  const coupleName = `חתונת ${bride_name} ו${groom_name}`;

  // Default date: 1 year from now (updated in onboarding step 1)
  const defaultDate = wedding_date ||
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      name:         coupleName,
      date:         defaultDate,
      bride_name:   bride_name,
      groom_name:   groom_name,
      client_name:  email ?? null,
      theme:        DEFAULT_THEME_ID,
    })
    .select("id, couple_token")
    .single();

  if (error || !event) {
    console.error("[api/auth/register] insert error:", error?.message);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }

  return NextResponse.json({ couple_token: event.couple_token }, { status: 201 });
}
