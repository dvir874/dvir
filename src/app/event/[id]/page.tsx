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
    .select("id, name, date, address, theme, bit_phone, dress_code, parking_info, greeting, mini_site_hero_path, event_timeline, couple_token, bride_name, groom_name")
    .eq("id", id)
    .single();

  // If query fails due to missing optional columns, retry with base columns only
  if (error || !event) {
    const { data: base, error: baseErr } = await supabase
      .from("events")
      .select("id, name, date, address, theme")
      .eq("id", id)
      .single();
    if (baseErr || !base) return notFound();
    return (
      <EventPageClient
        event={{ ...base, bit_phone: null, dress_code: null, parking_info: null, greeting: null }}
        theme={getTheme(base.theme)}
        isPreview={isPreview}
        bitPhone={null}
      />
    );
  }

  const theme = getTheme(event.theme);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const heroPublicUrl = event.mini_site_hero_path
    ? `${supabaseUrl}/storage/v1/object/public/gallery/${event.mini_site_hero_path}`
    : null;

  return (
    <EventPageClient
      event={{
        ...event,
        mini_site_hero_path: heroPublicUrl,
        event_timeline:      event.event_timeline ?? null,
        couple_token:        event.couple_token ?? null,
        partner1_name:       (event as Record<string, unknown>).bride_name as string ?? null,
        partner2_name:       (event as Record<string, unknown>).groom_name as string ?? null,
      }}
      theme={theme}
      isPreview={isPreview}
      bitPhone={event.bit_phone ?? null}
    />
  );
}
