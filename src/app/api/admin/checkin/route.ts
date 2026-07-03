import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* PATCH /api/admin/checkin — mark a guest arrived / undo.
   Body: { guest_id: string, arrived: boolean }
   Auth: middleware cookie on /api/admin/*. */
export async function PATCH(req: NextRequest) {
  const { guest_id, arrived } = await req.json();
  if (!guest_id) return NextResponse.json({ error: "guest_id required" }, { status: 400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from("guests")
    .update({ arrived_at: arrived ? new Date().toISOString() : null })
    .eq("id", guest_id)
    .select("id, arrived_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
