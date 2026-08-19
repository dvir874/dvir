import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  /* Same shape as onboarding: public, unauthenticated, writes rows. */
  const rl = checkRateLimit(getClientIp(request), 'design_request',
                            LIMITS.design_request.max, LIMITS.design_request.windowMs);
  if (!rl.ok) {
    return NextResponse.json({ error: "יותר מדי בקשות. נסו שוב בעוד דקה." }, { status: 429 });
  }

  try {
    const body = await request.json() as {
      invitation_slug: string;
      invitation_name: string;
      name?: string;
      phone: string;
      message?: string;
    };

    const { invitation_slug, invitation_name, name, phone, message } = body;

    if (!phone || !invitation_slug) {
      return NextResponse.json({ error: "phone and invitation_slug required" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase.from("design_requests").insert({
      invitation_slug,
      invitation_name,
      name:    name    ?? null,
      phone,
      message: message ?? null,
      status:  "new",
    });

    if (error) {
      console.error("[design-requests] insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  /* The cookie, like every other admin route.
   *
   * This compared an x-admin-token header against ADMIN_TOKEN, and the only
   * caller — the בקשות עיצוב tab — sends process.env.NEXT_PUBLIC_ADMIN_TOKEN,
   * which is not set in production and therefore compiles to "". So the tab
   * has answered 401 to its own admin every time it was opened, while the POST
   * beside it kept accepting submissions from the public invitation pages.
   *
   * Nobody noticed because the table is still empty. The first person to ask
   * for a design would have been invisible. */
  const denied = await requireAdmin();
  if (denied) return denied;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("design_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}
