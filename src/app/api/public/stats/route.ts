import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/* Public counters for social proof — no sensitive data */
export async function GET() {
  const sb = createServerClient();
  const [{ count: events }, { count: guests }] = await Promise.all([
    sb.from("events").select("id", { count: "exact", head: true }),
    sb.from("guests").select("id", { count: "exact", head: true }),
  ]);
  return NextResponse.json({ events: events ?? 0, guests: guests ?? 0 });
}
