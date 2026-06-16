import type { Forecast, HealthScore } from "./types";

export interface VenueReportData {
  eventName: string;
  eventDate: string;
  eventAddress?: string | null;
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  attendees: number;
  forecast: Forecast | null;
  health: HealthScore | null;
  generatedAt: string;
}

export async function generateVenueReportPdf(data: VenueReportData): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const W   = 210;
  const M   = 20;
  const TW  = W - M * 2;
  let   y   = 25;

  type RGB = [number, number, number];
  const gold:  RGB = [197, 164, 109];
  const dark:  RGB = [51, 51, 51];
  const muted: RGB = [120, 110, 95];
  const olive: RGB = [107, 123, 90];

  const line = (color = muted, width = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(M, y, W - M, y);
    y += 4;
  };

  const text = (
    str: string,
    x: number,
    yy: number,
    opts?: { size?: number; color?: readonly [number, number, number]; bold?: boolean; align?: "left" | "right" | "center" }
  ) => {
    doc.setFontSize(opts?.size ?? 11);
    doc.setTextColor(...(opts?.color ?? dark));
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.text(str, x, yy, { align: opts?.align ?? "left" });
  };

  // ── Header bar ──────────────────────────────────────
  doc.setFillColor(...gold);
  doc.rect(0, 0, W, 14, "F");
  text("VENUE REPORT", W / 2, 9, { size: 10, color: [255, 255, 255], bold: true, align: "center" });

  y = 25;

  // ── Event title ──────────────────────────────────────
  text(data.eventName, W / 2, y, { size: 20, color: dark, bold: true, align: "center" });
  y += 8;

  const dateStr = data.eventDate
    ? new Date(data.eventDate).toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })
    : "";
  text(dateStr, W / 2, y, { size: 11, color: muted, align: "center" });
  y += 5;

  if (data.eventAddress) {
    text(data.eventAddress, W / 2, y, { size: 10, color: gold, align: "center" });
    y += 5;
  }

  y += 3;
  line(gold, 0.6);

  // ── Guest summary ────────────────────────────────────
  text("GUEST SUMMARY", M, y, { size: 8, color: gold, bold: true });
  y += 7;

  const stats: [string, number | string, string?][] = [
    ["Total Invited",     data.total,     "guests"],
    ["Confirmed",         data.confirmed, "guests"],
    ["Declined",          data.declined,  "guests"],
    ["Pending Response",  data.pending,   "guests"],
    ["Expected Attendees (seats)", data.attendees, "people"],
    ["Response Rate",     `${data.total > 0 ? Math.round(((data.confirmed + data.declined) / data.total) * 100) : 0}%`],
  ];

  stats.forEach(([label, value, unit]) => {
    text(`${label}:`, M + 2, y, { size: 10, color: muted });
    text(`${value}${unit ? " " + unit : ""}`, M + TW, y, { size: 10, color: dark, bold: true, align: "right" });
    y += 6;
  });

  y += 2;
  line();

  // ── Attendance Forecast ──────────────────────────────
  text("ATTENDANCE FORECAST", M, y, { size: 8, color: gold, bold: true });
  y += 7;

  if (data.forecast && data.forecast.pendingGuests > 0) {
    const f = data.forecast;
    const cols: [string, number, readonly [number,number,number]][] = [
      ["Conservative", f.conservative, muted],
      ["Expected",     f.expected,     olive],
      ["Optimistic",   f.optimistic,   gold],
    ];
    const colW = TW / 3;
    cols.forEach(([label, val, color], i) => {
      const cx = M + colW * i + colW / 2;
      text(`${val}`, cx, y + 5, { size: 18, color, bold: true, align: "center" });
      text(label, cx, y + 11, { size: 8, color: muted, align: "center" });
    });
    y += 18;
    text(
      `Model: ${f.confirmRate}% confirmation rate among ${100 - data.pending}% of responders`,
      M, y, { size: 8, color: muted }
    );
    y += 7;
  } else {
    text("All guests have responded — no forecast needed.", M + 2, y, { size: 10, color: muted });
    y += 7;
  }

  y += 2;
  line();

  // ── Health Score ─────────────────────────────────────
  text("EVENT HEALTH SCORE", M, y, { size: 8, color: gold, bold: true });
  y += 7;

  if (data.health) {
    const h = data.health;
    const scoreColor: RGB =
      h.tier === "green" ? olive : h.tier === "yellow" ? gold : [180, 50, 50];

    text(`${h.score}/100`, M + 2, y + 4, { size: 22, bold: true, color: scoreColor });
    text(
      h.tier === "green" ? "Excellent" : h.tier === "yellow" ? "Fair" : "Needs Attention",
      M + 28, y + 2, { size: 11, color: scoreColor, bold: true }
    );
    text(h.label, M + 28, y + 8, { size: 9, color: muted });
    y += 16;

    // Breakdown bars (text-only for PDF)
    h.breakdown.forEach(({ factor, points, max }) => {
      const pct = Math.round((points / max) * 100);
      text(`${factor}:`, M + 2, y, { size: 9, color: muted });
      text(`${points}/${max}  (${pct}%)`, M + TW, y, { size: 9, color: dark, align: "right" });
      y += 5;
    });
  }

  y += 4;
  line();

  // ── Footer ───────────────────────────────────────────
  text(`Generated: ${data.generatedAt}`, M, y, { size: 8, color: muted });
  text("Raga Lifnei — Digital Wedding Invitations", W - M, y, { size: 8, color: gold, align: "right" });

  // Save
  const filename = `venue-report-${data.eventName.replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
