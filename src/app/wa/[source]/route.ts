import { NextRequest, NextResponse } from "next/server";
import { channelFromPath, channelLink } from "@/lib/lead-source";

/* /wa/facebook · /wa/instagram · /wa/tiktok → WhatsApp on the 077 sales
 * number with the channel's prefilled first line.
 *
 * Deliberately writes nothing. A visit is not a lead: the lead, and its
 * source, are created only when a WhatsApp message actually arrives at the
 * webhook (wa-lead.ts). An unknown channel goes to the home page rather than
 * guessing which number or text it meant. */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ source: string }> }) {
  const ch = channelFromPath((await params).source);
  if (!ch) return NextResponse.redirect(new URL("/", req.url), 302);
  return NextResponse.redirect(channelLink(ch), 302);
}
