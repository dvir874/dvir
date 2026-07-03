import { redirect, notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";

/* Pretty link: /w/inbal-nadav → event mini-site.
   Slug is set per event (events.slug). */
export default async function PrettyLink({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id").eq("slug", slug.toLowerCase()).maybeSingle();
  if (!data) notFound();
  redirect(`/event/${data.id}`);
}
