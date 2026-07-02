import { redirect } from "next/navigation";

/* Time-capsule feature removed from the product (July 2026).
   Old links redirect to the couple dashboard — DB data retained. */
export default async function CapsuleRedirect({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/couple/${token}`);
}
