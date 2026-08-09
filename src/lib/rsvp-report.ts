import { createServerClient } from "@/lib/supabase-server";
import { createHmac } from "crypto";

/* Shared builder for the live RSVP status report.

   Two doors lead here:
   - /api/couple/[token]/report  — the couple's own dashboard token
   - /api/report/[code]/…        — a share code that exposes ONLY this report

   The share code is derived, not stored, so adding it needed no migration on
   a live database. Rotating REPORT_LINK_SECRET invalidates every share link
   at once, which is the revocation story we actually want for a link that
   gets forwarded around a family. */

/* No fallback on purpose. A default secret is a public secret: the report
   code is derived from it, so anyone reading the source could mint a working
   link to a couple's full guest list. Failing loudly beats leaking quietly. */
function secret(): string {
  const s = process.env.REPORT_LINK_SECRET;
  if (!s) throw new Error("REPORT_LINK_SECRET is not set — refusing to serve report links");
  return s;
}

export function reportCodeFor(eventId: string): string {
  return createHmac("sha256", secret()).update(eventId).digest("hex").slice(0, 32);
}

/* Constant-time-ish compare is unnecessary here (the code is not a password
   and there is no oracle), but we still scan all events rather than trusting
   a client-supplied event id. */
export async function eventIdForReportCode(code: string): Promise<string | null> {
  if (!/^[a-f0-9]{32}$/.test(code)) return null;
  const sb = createServerClient();
  const { data } = await sb.from("events").select("id");
  return (data ?? []).find(e => reportCodeFor(e.id) === code)?.id ?? null;
}

export interface Row {
  id: string; name: string; phone: string | null; status: string;
  guest_count: number | null; source_group: string | null; category: string | null;
  notes: string | null; ride_from: string | null;
  response_time: string | null; opened_at: string | null;
}

export const GROUPS: Record<string, string> = {
  dvir_list: "שלי",
  mirav_list: "של מירב",
  nitza_list: "של ניצה",
  horim_list: "של ההורים",
  horim_tveria: "של ההורים · טבריה",
};

export const STATUS_HE: Record<string, string> = {
  confirmed: "מגיע",
  declined: "לא מגיע",
  pending: "טרם ענה",
};

/* Excel on Windows reads CSV as the system codepage unless there's a BOM,
   which turns Hebrew into gibberish — hence the ﻿ prefix. */
export function toCsv(rows: Row[]): string {
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const header = ["שם", "טלפון", "סטטוס", "כמות אורחים", "קבוצה", "הסעה", "הערות", "מועד תשובה"];
  const body = rows.map(r => [
    r.name,
    r.phone ?? "",
    STATUS_HE[r.status] ?? r.status,
    r.status === "confirmed" ? (r.guest_count ?? 1) : "",
    GROUPS[r.source_group ?? ""] ?? r.source_group ?? "",
    r.ride_from ?? "",
    (r.notes ?? "").replace(/\n/g, " "),
    r.response_time ? new Date(r.response_time).toLocaleString("he-IL") : "",
  ].map(esc).join(","));
  return "﻿" + [header.join(","), ...body].join("\n");
}

export async function loadRows(eventId: string): Promise<Row[]> {
  const sb = createServerClient();
  const { data } = await sb
    .from("guests")
    .select("id, name, phone, status, guest_count, source_group, category, notes, ride_from, response_time, opened_at")
    .eq("event_id", eventId);
  return ((data ?? []) as Row[])
    .filter(g => g.category !== "demo")          // demo guests never count
    .sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export async function buildReport(eventId: string) {
  const sb = createServerClient();
  const { data: event } = await sb
    .from("events").select("id, name, date, address").eq("id", eventId).single();
  if (!event) return null;

  const rows = await loadRows(eventId);
  const confirmed = rows.filter(r => r.status === "confirmed");
  const declined  = rows.filter(r => r.status === "declined");
  const pending   = rows.filter(r => r.status === "pending");
  const attendees = confirmed.reduce((s, r) => s + (Number(r.guest_count) || 1), 0);
  const answered  = confirmed.length + declined.length;

  const groups = [...new Set(rows.map(r => r.source_group).filter(Boolean))].map(g => {
    const inGroup = rows.filter(r => r.source_group === g);
    const c = inGroup.filter(r => r.status === "confirmed");
    return {
      key: g as string,
      label: GROUPS[g as string] ?? (g as string),
      total: inGroup.length,
      confirmed: c.length,
      declined: inGroup.filter(r => r.status === "declined").length,
      pending: inGroup.filter(r => r.status === "pending").length,
      attendees: c.reduce((s, r) => s + (Number(r.guest_count) || 1), 0),
    };
  }).sort((a, b) => b.total - a.total);

  return {
    event: { name: event.name, date: event.date, address: event.address },
    stats: {
      total: rows.length,
      confirmed: confirmed.length,
      declined: declined.length,
      pending: pending.length,
      attendees,
      opened: rows.filter(r => r.opened_at).length,
      responseRate: rows.length ? Math.round((answered / rows.length) * 100) : 0,
    },
    groups,
    shuttle: confirmed
      .filter(r => (r.ride_from ?? "").includes("טבריה"))
      .map(r => ({ name: r.name, count: Number(r.guest_count) || 1 })),
    notes: confirmed
      .filter(r => (r.notes ?? "").trim() && !(r.notes ?? "").includes("🚫"))
      .map(r => ({ name: r.name, note: (r.notes ?? "").trim() })),
    guests: rows.map(r => ({
      name: r.name,
      /* Phone numbers stay out of the shareable report — it gets forwarded
         around a family, and nobody needs 550 numbers to read a headcount. */
      status: r.status,
      statusHe: STATUS_HE[r.status] ?? r.status,
      count: r.status === "confirmed" ? (Number(r.guest_count) || 1) : 0,
      group: GROUPS[r.source_group ?? ""] ?? r.source_group ?? "",
      respondedAt: r.response_time,
    })),
  };
}
