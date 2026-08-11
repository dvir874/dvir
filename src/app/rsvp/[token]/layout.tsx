import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase-server";

/* Per-guest WhatsApp/link preview for RSVP links.
   dvir_list guests → the couple's invitation image + wedding title, so the
   invitation stays visible in the chat (WiWi-style) before anyone taps.
   Every other event → its event name with the default site image.
   Any failure falls back to generic metadata — never blocks the page. */

type Props = { params: Promise<{ token: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const fallback: Metadata = {
    title: "אישור הגעה 💍",
    description: "נשמח לראותכם! לחצו לאישור הגעה.",
  };

  try {
    const { token } = await params;
    const supabase = createServerClient();

    const { data: guest } = await supabase
      .from("guests")
      .select("event_id, source_group")
      .eq("rsvp_token", token)
      .single();

    if (!guest) return fallback;

    if (["dvir_list", "horim_list", "horim_tveria"].includes(guest.source_group ?? "")) {
      const title = "דביר & מירב 💍 24.08.2026";
      const description = "הוזמנתם לחתונה שלנו! יום שני · אולמי גאיה, חדרה · לחצו לאישור הגעה 🤍";
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          /* Lightweight copy (~175KB) — WhatsApp drops the thumbnail above ~300KB.
             The ?v= token busts WhatsApp's link-preview cache when the art changes. */
          images: [{ url: "/wedding/invitation-card.jpg", width: 1200, height: 848, alt: "הזמנה לחתונה של דביר ומירב" }],
          type: "website",
          locale: "he_IL",
        },
        twitter: { card: "summary_large_image", title, description, images: ["/wedding/invitation-card.jpg"] },
      };
    }

    const { data: event } = await supabase
      .from("events")
      .select("name")
      .eq("id", guest.event_id)
      .single();

    if (event?.name) {
      const title = `${event.name} 💍 אישור הגעה`;
      return {
        title,
        description: "נשמח לראותכם! לחצו לאישור הגעה.",
        openGraph: { title, description: "נשמח לראותכם! לחצו לאישור הגעה.", type: "website", locale: "he_IL" },
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export default function RsvpLayout({ children }: Props) {
  return children;
}
