import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/* The hop between an approved template and a WhatsApp group.
 *
 * Meta refuses chat.whatsapp.com in a template button outright — error 2388081,
 * "קישורים ישירים ל-WhatsApp אינם זמינים עבור לחצנים" — so the button cannot
 * carry the invite. It points here and this sends the guest on.
 *
 * The constraint turned out to be worth having twice over.
 *
 * A direct link would have been invisible: 334 messages out and no way to know
 * whether four people joined or ninety, which is the same blindness that made
 * the referral counter worthless.
 *
 * And the variable is the guest's own rsvp_token rather than the event id, so
 * the row written here names the person. guest_events.guest_id is NOT NULL —
 * an event-level click could not have been stored at all, and would have failed
 * silently on every tap. Now "who has not joined yet" is a question with an
 * answer, which is the one thing a group cannot tell you about itself.
 *
 * The token opens no dashboard and reveals nothing: it is the same token
 * already in every RSVP link the guest has received. */
export default async function RidesRedirect(
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: guest } = await sb.from("guests")
    .select("id, event_id, events(name, rides_group_url)")
    .eq("rsvp_token", token).maybeSingle();

  const ev = guest?.events as unknown as
    { name?: string | null; rides_group_url?: string | null } | null;
  const url = ev?.rides_group_url?.trim();

  if (url) {
    /* Before the redirect, because redirect() throws by design and nothing
       after it runs. Never allowed to cost the guest their join. */
    await sb.from("guest_events")
      .insert({ guest_id: guest!.id, event_type: "rides_group_click" })
      .then(() => {}, () => {});
    redirect(url);
  }

  /* A guest tapped a real button. A 404 would read as a broken invitation. */
  return (
    <div dir="rtl" style={{
      minHeight: "100dvh", background: "#FDFAF5", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "32px 24px",
      fontFamily: "Heebo, system-ui, sans-serif", textAlign: "center",
    }}>
      <div style={{ maxWidth: 380 }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>🚗</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif",
                     fontSize: 22, fontWeight: 700, color: "#1C1008", margin: "0 0 10px" }}>
          קבוצת הטרמפים עוד לא נפתחה
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(28,16,8,0.6)", margin: 0 }}>
          {ev?.name ? `לחתונה של ${ev.name} — ` : ""}הקבוצה תיפתח בקרוב.
          <br />שווה לנסות שוב מאוחר יותר 🤍
        </p>
      </div>
    </div>
  );
}
