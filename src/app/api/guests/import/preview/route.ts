import { NextRequest, NextResponse } from "next/server";
import { parseGuestsFromXlsx } from "@/lib/xlsx-utils";
import { requireAdmin } from "@/lib/auth-guard";

interface PreviewRow {
  row: number;
  name: string;
  phone: string;
  guest_count: number;
  status: "ok" | "warn" | "error";
  issues: string[];
}

function validateRow(row: { name: string; phone: string; guest_count: number }, index: number): PreviewRow {
  const issues: string[] = [];
  let status: "ok" | "warn" | "error" = "ok";

  if (!row.name || row.name.trim().length < 2) {
    issues.push("שם קצר מדי");
    status = "error";
  }
  if (!row.phone || row.phone.trim().length < 9) {
    issues.push("טלפון חסר או קצר");
    status = status === "error" ? "error" : "warn";
  }
  if (row.guest_count < 1 || row.guest_count > 20) {
    issues.push(`מספר מוזמנים חריג: ${row.guest_count}`);
    status = status === "error" ? "error" : "warn";
  }

  return { row: index + 2, name: row.name, phone: row.phone, guest_count: row.guest_count, status, issues };
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const buffer = await file.arrayBuffer();
  let parsed: { name: string; phone: string; guest_count: number }[];
  try {
    parsed = parseGuestsFromXlsx(buffer);
  } catch {
    return NextResponse.json({ error: "Could not parse Excel file. Check the format." }, { status: 422 });
  }

  if (parsed.length === 0)
    return NextResponse.json({ error: "No valid rows found." }, { status: 422 });

  const rows = parsed.map((r, i) => validateRow(r, i));
  const okCount    = rows.filter(r => r.status === "ok").length;
  const warnCount  = rows.filter(r => r.status === "warn").length;
  const errorCount = rows.filter(r => r.status === "error").length;

  return NextResponse.json({ rows, summary: { total: rows.length, ok: okCount, warn: warnCount, errors: errorCount } });
}
