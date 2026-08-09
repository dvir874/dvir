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
  /* dress_code, parking_info and greeting do not exist on events. Selecting
     them made PostgREST reject the whole query, so the "retry with base
     columns" fallback below ran on EVERY request and silently dropped the hero
     image, the timeline and bit_phone — a page permanently serving its own
     degraded mode while looking like it worked.

     couple_token is deliberately absent too: it was spread into a public client
     component that never used it, which put the couple's dashboard token in the
     HTML of a page anyone can open. Removing the dead columns without removing
     the token would have turned a masked leak into a live one. */
  const { data: event } = await supabase
    .from("events")
    .select("id, name, date, address, venue_name, theme, bit_phone, mini_site_hero_path, event_timeline, bride_name, groom_name")
    .eq("id", id)
    .single();

  if (!event) return notFound();

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
        partner1_name:       (event as Record<string, unknown>).bride_name as string ?? null,
        partner2_name:       (event as Record<string, unknown>).groom_name as string ?? null,
      }}
      theme={theme}
      isPreview={isPreview}
      bitPhone={event.bit_phone ?? null}
    />
  );
}
