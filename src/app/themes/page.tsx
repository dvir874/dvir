import { createServerClient } from "@/lib/supabase-server";
import ThemesClient from "./ThemesClient";

export default async function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event: eventId } = await searchParams;

  let coupleName = "שמכם כאן";
  let coupleDate = "22.08.2026";

  if (eventId) {
    const sb = createServerClient();
    const { data } = await sb
      .from("events")
      .select("name, date")
      .eq("id", eventId)
      .single();

    if (data) {
      coupleName = data.name;
      coupleDate = new Date(data.date).toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).replace(/\//g, ".");
    }
  }

  return (
    <ThemesClient
      coupleName={coupleName}
      coupleDate={coupleDate}
      eventId={eventId ?? null}
    />
  );
}
