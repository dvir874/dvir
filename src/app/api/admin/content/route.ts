import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { FORMATS, GOALS, STATUSES } from "@/lib/content-brief";

export const dynamic = "force-dynamic";

/* GET  /api/admin/content — every content item, newest first.
   POST /api/admin/content — a new item (title/format/goal/idea optional).
   Internal to Dvir; middleware guards /api/admin/*, requireAdmin is the
   second layer. */

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await createServerClient()
    .from("content_items").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const row = {
    title: typeof body.title === "string" ? body.title.slice(0, 200) : "",
    format: FORMATS.includes(body.format as never) ? body.format : "A",
    status: STATUSES.includes(body.status as never) ? body.status : "IDEA",
    content_goal: GOALS.includes(body.content_goal as never) ? body.content_goal : null,
    pain_point: typeof body.pain_point === "string" ? body.pain_point : null,
  };
  const { data, error } = await createServerClient().from("content_items").insert(row).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
