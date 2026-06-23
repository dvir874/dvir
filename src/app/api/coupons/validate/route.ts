import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { code } = await req.json();

  if (!code) return NextResponse.json({ valid: false, error: "קוד חסר" }, { status: 400 });

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (error || !data) return NextResponse.json({ valid: false, error: "קוד לא קיים" }, { status: 404 });

  if (data.used_by_event_id) return NextResponse.json({ valid: false, error: "קוד כבר נוצל" });
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "קוד פג תוקף" });
  }

  return NextResponse.json({
    valid: true,
    discount_pct: data.discount_pct,
    description: data.description ?? "",
  });
}
