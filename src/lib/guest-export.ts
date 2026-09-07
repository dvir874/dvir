/** The guest list as a couple needs it elsewhere.
 *
 * תהל, 07/09: "לאתר של ההושבה אני צריכה להכין דוקס של כל מי שאישר — יש לך
 * אפשרות להוציא לי אחד כזה?"
 *
 * It is the second thing in one day a couple asked for that the product could
 * not do and Dvir had to do by hand. Every seating tool in Israel imports a
 * spreadsheet, and the column it cannot work without is how many people each
 * row stands for — a guest who confirmed for four is four chairs, and a list
 * of names alone is unusable.
 *
 * Two sheets rather than one, because the couple asked two questions in the
 * same breath: who is coming (for the seating site) and who has not answered
 * (to chase). One sheet answers either badly.
 *
 * Import-free: the shape of this file is what a couple hands to a vendor, and
 * getting a count wrong there is a wrong number of chairs at a real wedding. */

export type ExportGuest = {
  name?: string | null;
  phone?: string | null;
  status?: string | null;
  guest_count?: number | null;
  side?: string | null;
  source_group?: string | null;
  category?: string | null;
};

export const EXPORT_HEADERS = ["שם", "טלפון", "סטטוס", "כמות", "צד", "קבוצה"] as const;

const STATUS: Record<string, string> = {
  confirmed: "מגיעים",
  declined: "לא מגיעים",
  pending: "טרם ענו",
};

export type ExportRow = (string | number)[];

function row(g: ExportGuest): ExportRow {
  const status = STATUS[String(g.status ?? "")] ?? String(g.status ?? "");
  return [
    String(g.name ?? "").trim(),
    String(g.phone ?? ""),
    status,
    /* Only for people who are actually coming. A count beside "טרם ענו" is a
       number the couple did not give us, and a seating tool would read it as
       chairs to reserve. */
    g.status === "confirmed" ? Math.max(1, Number(g.guest_count) || 1) : "",
    String(g.side ?? ""),
    String(g.source_group ?? ""),
  ];
}

/** Everything a couple's export contains, ready to become two sheets.
 *
 * Demo rows are dropped here as they are everywhere else — a preview guest
 * with nobody behind them must never reach a caterer's headcount. Rows without
 * a name are dropped too: an empty row in a seating import is a chair for
 * nobody. */
export function guestExport(guests: ExportGuest[]): {
  confirmed: ExportRow[];
  all: ExportRow[];
  souls: number;
  counts: { confirmed: number; declined: number; pending: number };
} {
  const real = guests.filter(g =>
    g.category !== "demo" && String(g.name ?? "").trim().length > 0);

  /* Sorted by name in Hebrew, because the couple reads this looking for a
     person rather than scrolling a database order. */
  const sorted = [...real].sort((a, b) =>
    String(a.name ?? "").localeCompare(String(b.name ?? ""), "he"));

  const confirmed = sorted.filter(g => g.status === "confirmed");

  return {
    confirmed: confirmed.map(row),
    all: sorted.map(row),
    souls: confirmed.reduce((n, g) => n + Math.max(1, Number(g.guest_count) || 1), 0),
    counts: {
      confirmed: confirmed.length,
      declined: sorted.filter(g => g.status === "declined").length,
      pending: sorted.filter(g => g.status === "pending").length,
    },
  };
}

/** The file a couple downloads, named so it is still identifiable in a folder
    of twenty attachments a month from now. */
export function exportFilename(coupleOrEvent: string, today: string): string {
  const name = String(coupleOrEvent ?? "").trim().replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
  const d = today.slice(0, 10).split("-").reverse().join(".");
  return `${name || "רשימת אורחים"} — רשימת אורחים ${d}.xlsx`;
}
