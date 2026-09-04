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
      .select("name, wa_header_image_url")
      .eq("id", guest.event_id)
      .single();

    if (event?.name) {
      const title = `${event.name} 💍 אישור הגעה`;
      const description = "נשמח לראותכם! לחצו לאישור הגעה.";

      /* The couple's own invitation in the WhatsApp link preview.
       *
       * This branch returned an openGraph object with no `images` key, and
       * Next REPLACES the root object rather than merging into it — so the
       * site-wide og.png went too. Every paying client's link opened as bare
       * text, while an unrecognised token fell through to `fallback` and got a
       * picture. The customer got the worse preview.
       *
       * ~1,100 guests have opened this link. It is the most-seen surface in
       * the business and the first thing a couple planning a wedding judges.
       *
       * Spread rather than `images: x ? [...] : undefined` — Next checks for
       * the key, and an explicit undefined still counts as present. No
       * width/height: the image is an arbitrary upload and stating dimensions
       * we have not measured is worse than omitting them. And deliberately not
       * og.png as a fallback — it is 676KB, well past the size at which
       * WhatsApp drops the thumbnail. */
      const card = (event.wa_header_image_url as string | null)?.trim();
      const images = card ? { images: [{ url: card, alt: String(event.name) }] } : {};

      return {
        title,
        description,
        openGraph: { title, description, type: "website", locale: "he_IL", ...images },
        ...(card ? { twitter: { card: "summary_large_image" as const, title, description, images: [card] } } : {}),
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
