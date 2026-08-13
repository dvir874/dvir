import { loadRsvp } from "@/lib/rsvp-load";
import RsvpClient from "./RsvpClient";

export const dynamic = "force-dynamic";

/* Server wrapper for the invitation.
 *
 * The page used to arrive empty and ask the server who the guest was before it
 * could render anything. That request had a catch but no timeout, and a request
 * that never settles never rejects — so a guest sat on the loading screen
 * indefinitely. One reported exactly that, on her phone, her husband's phone
 * and a computer, and concluded the invitation was broken. Nothing in any log
 * would have shown it: from the server's side the request simply never
 * completed.
 *
 * Now the invitation is already inside the HTML when it reaches the guest.
 * There is no first request to hang on.
 *
 * Deliberately additive: loadRsvpData returns null rather than throwing, and
 * RsvpClient keeps its own fetch for that case, so a bad read here costs a
 * slower first paint and nothing else. The client still calls the API too —
 * that is what marks opened_at, and keeping it in the browser is what stops
 * WhatsApp's link-preview crawler from marking every guest as having looked.
 */
export default async function RsvpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const res = await loadRsvp(token);
  return (
    <>
      {/* The way out when scripts do not run.
       *
       * On 13/08 שיר opened her invitation, screenshotted it, and told Mirav
       * nothing was clickable. Her opened_at is null: the page reached her
       * screen and no call reached the server. Whatever the cause — WhatsApp's
       * in-app browser, a content blocker, a phone too old for the bundle — the
       * page looks perfect and every tap does nothing, and the couple learns
       * about it only if a guest happens to mention it.
       *
       * <noscript> is rendered as HTML and needs nothing to work. A guest whose
       * browser runs scripts never sees this line; one whose browser does not
       * sees the only link on the page that can still help them. */}
      <noscript>
        <div dir="rtl" style={{
          background: "#FDFAF5", borderBottom: "1px solid #E8E0D4",
          padding: "16px 18px", textAlign: "center",
          fontFamily: "Heebo, system-ui, sans-serif", fontSize: 16, color: "#1C1008",
        }}>
          <a href={`/rsvp/${token}/simple`} style={{ color: "#6B7B5A", fontWeight: 700 }}>
            👈 לאישור הגעה — לחצו כאן
          </a>
        </div>
      </noscript>
    <RsvpClient
      token={token}
      initialData={res.kind === "ok" ? res.data : null}
      /* A link that matches no guest is a dead link, and the server already
         knows it. Saying so immediately beats showing a spinner while the
         browser asks a question that has already been answered. */
      notFound={res.kind === "not_found"}
    />
    </>
  );
}
