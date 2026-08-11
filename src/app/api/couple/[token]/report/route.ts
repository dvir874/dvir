import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { buildReport, loadRows, toCsv } from "@/lib/rsvp-report";

export const dynamic = "force-dynamic";

/* GET /api/couple/[token]/report        → live RSVP report as JSON
   GET /api/couple/[token]/report?csv=1  → the same data as an Excel-safe CSV

   The couple's own door to the report. The shareable variant lives at
   /api/report/[code] and both are built from src/lib/rsvp-report so the
   numbers can never disagree. */

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const sb = createServerClient();

  const { data: event } = await sb
    .from("events").select("id").eq("couple_token", token).single();
  if (!event) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (req.nextUrl.searchParams.get("csv")) {
    const rows = await loadRows(event.id);
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rsvp-${event.id.slice(0, 8)}.csv"`,
      },
    });
  }

  const report = await buildReport(event.id);
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(report);
}
