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

      // Idempotency: check if already marked paid to avoid duplicate processing
      const { data: existing } = await sb
        .from("events")
        .select("payment_status")
        .eq("id", event_id)
        .single();

      if (existing && existing.payment_status !== "paid") {
        await sb.from("events").update({
          payment_status: "paid",
          payment_amount: amountFromStripe,
          payment_date:   new Date().toISOString(),
        }).eq("id", event_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
