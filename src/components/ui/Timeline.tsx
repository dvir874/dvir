"use client";
/** Timeline — vertical activity feed (RTL: spine on the right). */
import React from "react";
import { color, font, fontWeight } from "@/design/tokens";

export interface TimelineItem {
  id: string;
  title: React.ReactNode;
  time?: string;
  tone?: "primary" | "success" | "neutral";
}
const DOT: Record<NonNullable<TimelineItem["tone"]>, string> = {
  primary: color.primary, success: color.success, neutral: color.borderStrong,
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div
      style={{
        position: "relative", paddingInlineStart: 24, display: "flex", flexDirection: "column", gap: 24,
      }}
    >
      {/* spine */}
      <span style={{ position: "absolute", insetInlineStart: 7, top: 6, bottom: 6, width: 2, background: color.border }} />
      {items.map((it) => (
        <div key={it.id} style={{ position: "relative" }}>
          <span style={{ position: "absolute", insetInlineStart: -21, top: 5, width: 10, height: 10, borderRadius: "50%", background: DOT[it.tone ?? "neutral"], boxShadow: `0 0 0 4px ${color.bg}` }} />
          <p style={{ fontFamily: font.sans, fontSize: 14, color: color.textSoft }}>{it.title}</p>
          {it.time && <p style={{ fontFamily: font.sans, fontSize: 12, color: color.textFaint, marginTop: 2 }}>{it.time}</p>}
        </div>
      ))}
    </div>
  );
}

export default Timeline;
