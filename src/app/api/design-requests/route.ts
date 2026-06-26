import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      invitation_slug: string;
      invitation_name: string;
      name?: string;
      phone: string;
      message?: string;
    };

    const { invitation_slug, invitation_name, name, phone, message } = body;

    if (!phone || !invitation_slug) {
      return NextResponse.json({ error: "phone and invitation_slug required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase.from("design_requests").insert({
      invitation_slug,
      invitation_name,
      name:    name    ?? null,
      phone,
      message: message ?? null,
      status:  "new",
    });

    if (error) {
      console.error("[design-requests] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminToken = request.headers.get("x-admin-token");
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("design_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}
