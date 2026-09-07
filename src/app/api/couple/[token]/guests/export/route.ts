import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createServerClient } from "@/lib/supabase-server";
import { guestExport, exportFilename, EXPORT_HEADERS } from "@/lib/guest-export";
import { coupleName } from "@/lib/couple-name";

export const dynamic = "force-dynamic";

/* The couple's own guest list, as a file they can hand to a vendor.
 *
 * Asked for twice in one day, by two different couples, and both times Dvir
 * built it by hand: תהל needed everyone who confirmed for her seating site,
 * and the same list with the unanswered rows to chase. Every seating tool in
 * Israel imports a spreadsheet.
 *
 * Two sheets, because those are two questions. "מאושרי הגעה" is the one that
 * gets uploaded — names and, critically, how many people each row stands for.
 * "כל האורחים" is the one that gets read.
 *
 * Guarded by couple_token, exactly like every other route in this folder: the
 * token is already the couple's key to their own dashboard, and this contains
 * nothing they cannot already see on the guest screen. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<NextResponse> {
  const { token } = await params;
  const sb = createServerClient();

  const { data: ev } = await sb.from("events")
    .select("id, name, couple_names, bride_name, groom_name")
    .eq("couple_token", token).maybeSingle();
  if (!ev?.id) return NextResponse.json({ error: "not found" }, { status: 404 });

  /* Paged, because a list of 550 is normal here and PostgREST caps a plain
     select at a thousand rows without saying so. */
  const guests: Parameters<typeof guestExport>[0] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("guests")
      .select("name, phone, status, guest_count, side, source_group, category")
      .eq("event_id", ev.id as string)
      .range(from, from + 999);
    if (error) return NextResponse.json({ error: "read_failed" }, { status: 500 });
    guests.push(...((data ?? []) as typeof guests));
    if ((data?.length ?? 0) < 1000) break;
  }

  const out = guestExport(guests);

  /* Which sheet the couple asked for. The screen offers two downloads with two
     different counts beside them — "רק מאושרים · 158 נפשות" and "כל הרשימה" —
     and a file that silently contains both makes those two buttons a lie.
     Anything unrecognised gives both, which is what a bare link should do. */
  const scope = req.nextUrl.searchParams.get("scope");
  const sheets = (
    scope === "confirmed" ? [["מאושרי הגעה", out.confirmed]] :
    scope === "all"       ? [["כל האורחים", out.all]] :
    [["מאושרי הגעה", out.confirmed], ["כל האורחים", out.all]]
  ) as readonly (readonly [string, typeof out.all])[];

  const wb = XLSX.utils.book_new();
  for (const [title, rows] of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([[...EXPORT_HEADERS], ...rows]);
    /* Widths in characters. Without them every column opens at the default and
       the names — the one column anybody reads — arrive truncated. */
    ws["!cols"] = [{ wch: 26 }, { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 22 }];
    ws["!freeze"] = { xSplit: "0", ySplit: "1", topLeftCell: "A2", activePane: "bottomLeft", state: "frozen" };
    XLSX.utils.book_append_sheet(wb, ws, title);
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const name = coupleName(ev as Parameters<typeof coupleName>[0]) ?? String(ev.name ?? "");
  const filename = exportFilename(
    scope === "confirmed" ? `${name} — מאושרי הגעה`
    : scope === "all"     ? `${name} — כל האורחים`
    : name,
    new Date().toISOString());

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      /* Both forms: the plain one for old clients, the RFC 5987 one so the
         Hebrew filename survives. Without the second, a couple downloads a file
         called "____.xlsx". */
      "Content-Disposition":
        `attachment; filename="guests.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
