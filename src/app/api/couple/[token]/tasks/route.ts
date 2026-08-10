import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: event } = await sb
    .from("events")
    .select("id")
    .eq("couple_token", token)
    .single();

  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data: tasks } = await sb
    .from("wedding_tasks")
    .select("id, title, completed, completed_at, category, due_date, sort_order, is_default")
    .eq("event_id", event.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return NextResponse.json(tasks ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = createServerClient();
  const { data: event } = await sb.from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { title, category, due_date } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const { data, error } = await sb.from("wedding_tasks")
    .insert({ event_id: event.id, title: title.trim(), category: category ?? "general", due_date: due_date ?? null, completed: false, is_default: false, sort_order: 9999 })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/* PATCH and DELETE live here, scoped by couple token.
 *
 * The checklist screen used to call /api/wedding-tasks/[id], which sits behind
 * the admin middleware — so every tick returned 401, the optimistic UI showed a
 * checkmark and a milestone toast anyway, and nothing was written. 126 tasks
 * across two couples, not one of them ever marked done. A product that
 * celebrates a save that did not happen is worse than one that has no
 * checklist.
 *
 * Every statement filters on event_id as well as task id, so a token can only
 * ever reach its own couple's tasks. */

async function eventFor(token: string) {
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("couple_token", token).single();
  return { sb, eventId: data?.id as string | undefined };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { sb, eventId } = await eventFor(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const id: string | undefined = body?.id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.completed === "boolean") {
    patch.completed = body.completed;
    patch.completed_at = body.completed ? new Date().toISOString() : null;
  }
  if (typeof body.title === "string" && body.title.trim())
    patch.title = body.title.trim().slice(0, 200);
  if ("due_date" in body) patch.due_date = body.due_date || null;
  if (!Object.keys(patch).length)
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const { data, error } = await sb.from("wedding_tasks")
    .update(patch).eq("id", id).eq("event_id", eventId).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const { sb, eventId } = await eventFor(token);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { data, error } = await sb.from("wedding_tasks")
    .delete().eq("id", id).eq("event_id", eventId).select("id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ deleted: data.length });
}
