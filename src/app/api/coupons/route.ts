import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

function generateCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 2; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("coupons")
    .select(`
      *,
      created_by_event:created_by_event_id(name),
      used_by_event:used_by_event_id(name)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const body = await req.json();

  const {
    code: rawCode,
    discount_pct = 10,
    description,
    created_by_event_id,
    expires_at,
  } = body;

  const code = (rawCode as string | undefined)?.trim().toUpperCase() || generateCode();

  const { data, error } = await supabase
    .from("coupons")
    .insert({ code, discount_pct, description, created_by_event_id: created_by_event_id || null, expires_at: expires_at || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
