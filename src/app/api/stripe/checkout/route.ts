import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { event_id, amount, description } = await req.json();

  if (!event_id || !amount || amount <= 0) {
    return NextResponse.json({ error: "event_id and amount required" }, { status: 400 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const { default: Stripe } = await import("stripe");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });

  const sb = createServerClient();
  const { data: event } = await sb.from("events").select("name, client_email, client_phone").eq("id", event_id).single();

  const origin = req.headers.get("origin") ?? "https://regalifnei.vercel.app";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "ils",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "ils",
        unit_amount: Math.round(amount * 100),
        product_data: {
          name: description ?? `רגע לפני — ${event?.name ?? "ניהול חתונה"}`,
          description: "ניהול דיגיטלי לאירוע החתונה שלכם",
        },
      },
    }],
    customer_email: event?.client_email ?? undefined,
    metadata: { event_id, amount: String(amount) },
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}&event_id=${event_id}`,
    cancel_url:  `${origin}/payment/cancel`,
    locale: "auto",
  });

  return NextResponse.json({ url: session.url, session_id: session.id });
}
