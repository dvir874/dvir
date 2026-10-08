import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { EDITABLE } from "@/lib/content-brief";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

/* GET   — one item.
   PATCH — any editable fields; unknown keys are dropped, never written.
   POST  — { action: "duplicate" }: a copy back at IDEA, without results. */

export async function GET(_req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const { data, error } = await createServerClient().from("content_items").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) if (EDITABLE.has(k)) patch[k] = v === "" ? null : v;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  // Publishing stamps the date once, unless one was given.
  if (patch.status === "PUBLISHED" && !("published_at" in patch)) {
    const { data: cur } = await createServerClient().from("content_items").select("published_at").eq("id", id).maybeSingle();
    if (cur && !cur.published_at) patch.published_at = new Date().toISOString();
  }
  patch.updated_at = new Date().toISOString();
  const { data, error } = await createServerClient().from("content_items").update(patch).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function POST(req: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action !== "duplicate") return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const sb = createServerClient();
  const { data: src } = await sb.from("content_items").select("*").eq("id", id).maybeSingle();
  if (!src) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copy: Record<string, unknown> = {};
  for (const k of EDITABLE) copy[k] = src[k];
  // The copy is a new video: same creative, fresh status, no borrowed results.
  for (const k of ["customers", "revenue", "leads", "whatsapp_clicks", "website_clicks", "shares", "saves",
                   "views", "likes", "comments", "profile_visits", "published_at", "production_cost",
                   "production_time_minutes", "notes"]) copy[k] = null;
  copy.status = "IDEA";
  copy.title = `${src.title} (עותק)`;

  const { data, error } = await sb.from("content_items").insert(copy).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
