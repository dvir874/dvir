import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* POST — couple-facing wrapper around the admin ai-generate seating engine.
   Verifies the couple token, then calls the internal engine with server credentials. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return NextResponse.json({ error: "not configured" }, { status: 500 });

  const origin = req.nextUrl.origin;
  const res = await fetch(`${origin}/api/seating/ai-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // middleware authenticates protected APIs via this session cookie
      cookie: `raga_admin_session=${adminToken}`,
    },
    body: JSON.stringify({ event_id: event.id, apply: true }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return NextResponse.json({ error: data?.error ?? "שגיאה" }, { status: res.status });
  return NextResponse.json(data);
}
