import { createServerClient } from "@/lib/supabase-server";
import { getTheme } from "@/lib/themes";
import EventPageClient from "./EventPageClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EventPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const supabase = createServerClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, date, address, theme, bit_phone")
    .eq("id", id)
    .single();

  if (error || !event) return notFound();

  const theme = getTheme(event.theme);

  return (
    <EventPageClient
      event={event}
      theme={theme}
      isPreview={isPreview}
      bitPhone={event.bit_phone ?? null}
    />
  );
}
