import { createServerClient } from "@/lib/supabase-server";
import { getTheme } from "@/lib/themes";
import { notFound } from "next/navigation";
import ApprovalClient from "./ApprovalClient";
import type { ApprovalRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ApprovalPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = createServerClient();

  const [{ data: event }, { data: approval }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, date, address, theme")
      .eq("id", eventId)
      .single(),
    supabase
      .from("approval_requests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!event) return notFound();

  const theme = getTheme(event.theme);

  return (
    <ApprovalClient
      event={event}
      theme={theme}
      initialApproval={(approval as ApprovalRequest | null) ?? null}
    />
  );
}
