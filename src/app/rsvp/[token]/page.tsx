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
    <RsvpClient
      token={token}
      initialData={res.kind === "ok" ? res.data : null}
      /* A link that matches no guest is a dead link, and the server already
         knows it. Saying so immediately beats showing a spinner while the
         browser asks a question that has already been answered. */
      notFound={res.kind === "not_found"}
    />
  );
}
