import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/* The hop between an approved template and a WhatsApp group.
 *
 * Meta refuses chat.whatsapp.com in a template button (2388273), so the button
 * points here. This used to answer with a 307 straight to the invite, and שחר's
 * guests reported the link was broken.
 *
 * They were right, and the redirect was why. The tap happens INSIDE WhatsApp,
 * which opens its own in-app browser; that browser follows the redirect to
 * chat.whatsapp.com and has no way to hand the user back to the app it is
 * running inside. What they saw was WhatsApp's own fallback page — "Looks like
 * you don't have WhatsApp installed!" — on a phone with WhatsApp open behind
 * it. Six people tapped and every one of them landed there.
 *
 * An automatic redirect cannot escape that browser. A finger can: a tap is a
 * user gesture, and the OS honours it where it ignores a Location header. So
 * this renders one button and lets the guest press it, and shows the raw link
 * underneath for the case where even that fails.
 *
 * The click is still recorded, and now it is recorded when they arrive rather
 * than when they leave — which is the number that was always meant: how many
 * people the message actually moved.
 */
export default async function RidesRedirect(
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sb = createServerClient();

  const { data: guest } = await sb.from("guests")
    .select("id, name, event_id, events(name, couple_names, rides_group_url)")
    .eq("rsvp_token", token).maybeSingle();

  const ev = guest?.events as unknown as
    { name?: string | null; couple_names?: string | null; rides_group_url?: string | null } | null;
  const url = ev?.rides_group_url?.trim();
  const couple = (ev?.couple_names || ev?.name || "").trim();

  if (url && guest) {
    await sb.from("guest_events")
      .insert({ guest_id: guest.id, event_type: "rides_group_click" })
      .then(() => {}, () => {});
  }

  const T = { ivory: "#FDFAF5", gold: "#C5A46D", dark: "#1C1008",
              muted: "rgba(28,16,8,0.6)", border: "#E8E0D4" };

  return (
    <div dir="rtl" style={{
      minHeight: "100dvh", background: T.ivory, display: "flex",
      alignItems: "center", justifyContent: "center", padding: "32px 24px",
      fontFamily: "Heebo, system-ui, sans-serif", textAlign: "center",
    }}>
      <div style={{ maxWidth: 400, width: "100%" }}>
        <p style={{ fontSize: 44, margin: "0 0 14px" }}>🚗</p>
        <h1 style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif",
                     fontSize: 23, fontWeight: 700, color: T.dark, margin: "0 0 10px" }}>
          {url ? "קבוצת הטרמפים" : "קבוצת הטרמפים עוד לא נפתחה"}
        </h1>

        {url ? (
          <>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: T.muted, margin: "0 0 26px" }}>
              {couple ? `לחתונה של ${couple}` : ""}
              <br />מי שמחפש נסיעה ומי שיש לו מקום ברכב — כולם כאן.
            </p>

            {/* The whole point of this page. A tap, not a Location header. */}
            <a href={url}
               style={{ display: "block", background: "#25D366", color: "#fff",
                        borderRadius: 14, padding: "16px 20px", fontSize: 17,
                        fontWeight: 700, textDecoration: "none", minHeight: 54,
                        lineHeight: "22px", boxShadow: "0 6px 20px rgba(37,211,102,0.30)" }}>
              הצטרפו לקבוצה בוואטסאפ
            </a>

            <p style={{ fontSize: 12.5, color: T.muted, margin: "22px 0 6px", lineHeight: 1.7 }}>
              הכפתור לא נפתח? העתיקו את הקישור והדביקו בדפדפן:
            </p>
            <p dir="ltr" style={{
              fontSize: 12, color: T.dark, background: "#fff",
              border: `1px solid ${T.border}`, borderRadius: 10,
              padding: "10px 12px", margin: 0, wordBreak: "break-all",
            }}>{url}</p>
          </>
        ) : (
          <p style={{ fontSize: 15, lineHeight: 1.8, color: T.muted, margin: 0 }}>
            {couple ? `לחתונה של ${couple} — ` : ""}הקבוצה תיפתח בקרוב.
            <br />שווה לנסות שוב מאוחר יותר 🤍
          </p>
        )}
      </div>
    </div>
  );
}
