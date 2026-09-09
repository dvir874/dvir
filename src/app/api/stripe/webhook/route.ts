import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as import("stripe").Stripe.Checkout.Session;
    const event_id = session.metadata?.event_id;
    if (event_id) {
      // Use Stripe's verified amount_total (in agorot) — not the client-controlled metadata
      const amountFromStripe = session.amount_total != null
        ? session.amount_total / 100
        : (session.metadata?.amount ? Number(session.metadata.amount) : null);

      const sb = createServerClient();

      /* paid_at / price_charged. This block named payment_status,
         payment_amount and payment_date, and none of those columns exist on
         events — so the select answered 42703, `existing` came back undefined,
         the guard `existing && …` was false, and the update never ran at all.
         A couple could pay through Stripe and the event stayed "טרם שולם"
         forever, silently, with a 200 returned to Stripe so it never retried.

         paid_at doubles as the idempotency flag: it is null until money
         arrives and a timestamp after, so a repeated webhook is a no-op
         without needing a separate status column. */
      const { data: existing } = await sb
        .from("events")
        .select("paid_at")
        .eq("id", event_id)
        .single();

      if (existing && !existing.paid_at) {
        await sb.from("events").update({
          paid_at:        new Date().toISOString(),
          price_charged:  amountFromStripe,
          payment_method: "stripe",
        }).eq("id", event_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
