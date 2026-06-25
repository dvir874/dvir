import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sb = createServerClient();

  // Get all unread couple messages grouped by event
  const { data: msgs } = await sb
    .from("chat_messages")
    .select("event_id, created_at")
    .eq("sender", "couple")
    .eq("read_by_admin", false)
    .order("created_at", { ascending: false });

  if (!msgs || msgs.length === 0) return NextResponse.json([]);

  const eventIds = [...new Set(msgs.map((m) => m.event_id))];

  const { data: events } = await sb
    .from("events")
    .select("id, name, client_name")
    .in("id", eventIds);

  const result = eventIds.map((eventId) => {
    const event = events?.find((e) => e.id === eventId);
    const count = msgs.filter((m) => m.event_id === eventId).length;
    const lastMsg = msgs.find((m) => m.event_id === eventId);
    return {
      eventId,
      eventName: event?.name ?? "אירוע לא ידוע",
      clientName: event?.client_name ?? null,
      unreadCount: count,
      lastAt: lastMsg?.created_at,
    };
  });

  return NextResponse.json(result);
}
