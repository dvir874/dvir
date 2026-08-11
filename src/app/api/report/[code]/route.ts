import { NextRequest, NextResponse } from "next/server";
import { buildReport, eventIdForReportCode, loadRows, toCsv } from "@/lib/rsvp-report";

export const dynamic = "force-dynamic";

/* GET /api/report/[code]        → live RSVP report as JSON
   GET /api/report/[code]?csv=1  → the same data as an Excel-safe CSV

   Read-only, and deliberately narrower than the couple dashboard token: this
   is the link a couple forwards to a partner or a parent. It can show numbers;
   it cannot change an answer or reach any other part of the system. */

export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const eventId = await eventIdForReportCode(code);
  if (!eventId) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (req.nextUrl.searchParams.get("csv")) {
    const rows = await loadRows(eventId);
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rsvp-${eventId.slice(0, 8)}.csv"`,
      },
    });
  }

  const report = await buildReport(eventId);
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(report);
}
