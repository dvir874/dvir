import { redirect } from "next/navigation";

/* The board moved to /admin/rides on 26/08.
 *
 * Introducing two guests to each other is a judgement about people Dvir knows
 * and the couple are living through. He asked for it to be his call rather
 * than a button a couple presses at midnight on somebody they half remember,
 * and the same day שחר answered the question herself by opening a WhatsApp
 * group instead — which is what the system now sends a link to.
 *
 * A redirect rather than a deletion: the tab is gone from the nav, but a
 * couple who bookmarked this URL should land somewhere that exists.
 */
export default async function CoupleRidesMoved(
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  redirect(`/couple/${token}`);
}
