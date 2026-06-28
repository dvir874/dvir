"use client";
/** Alert (inline banner), ProgressBar, Spinner, Skeleton. */
import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";
import { color, radius, font, fontWeight } from "@/design/tokens";
import { cx } from "@/design";

/* ── Alert ── */
type Tone = "success" | "warning" | "danger" | "info";
const A: Record<Tone, { bg: string; fg: string; icon: React.ReactNode }> = {
  success: { bg: color.successContainer, fg: color.successText, icon: <CheckCircle size={18} /> },
  warning: { bg: color.warningContainer, fg: color.warningText, icon: <AlertTriangle size={18} /> },
  danger:  { bg: color.dangerContainer, fg: color.dangerText, icon: <XCircle size={18} /> },
  info:    { bg: color.infoContainer, fg: color.infoText, icon: <Info size={18} /> },
};
export interface AlertProps { tone?: Tone; title?: string; children?: React.ReactNode; }
export function Alert({ tone = "info", title, children }: AlertProps) {
  const a = A[tone];
  return (
    <div role="alert" style={{ display: "flex", gap: 12, background: a.bg, borderRadius: radius.md, padding: "14px 16px" }}>
      <span style={{ color: a.fg, display: "flex", flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
      <div style={{ fontFamily: font.sans, fontSize: 14, color: color.text }}>
        {title && <p style={{ fontWeight: fontWeight.bold, marginBottom: children ? 2 : 0 }}>{title}</p>}
        {children && <p style={{ color: color.textSoft }}>{children}</p>}
      </div>
    </div>
  );
}

/* ── ProgressBar ── */
export interface ProgressBarProps { value: number; tone?: "primary" | "success"; height?: number; showLabel?: boolean; }
export function ProgressBar({ value, tone = "primary", height = 8, showLabel }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const fill = tone === "success" ? color.success : color.primary;
  return (
    <div>
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        style={{ width: "100%", height, background: color.borderFaint, borderRadius: radius.pill, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: fill, borderRadius: radius.pill, transition: "width 360ms cubic-bezier(0.0,0,0.2,1)" }} />
      </div>
      {showLabel && <p style={{ fontSize: 12, color: color.textMuted, marginTop: 4, fontFamily: font.sans, textAlign: "start" }}>{pct}%</p>}
    </div>
  );
}

/* ── Spinner ── */
export function Spinner({ size = 24, label = "טוען…" }: { size?: number; label?: string }) {
  return (
    <span role="status" aria-label={label} style={{ display: "inline-flex" }}>
      <Loader2 size={size} className="animate-spin" style={{ color: color.primary }} />
    </span>
  );
}

/* ── Skeleton ── */
export interface SkeletonProps { width?: number | string; height?: number | string; radius?: number; className?: string; }
export function Skeleton({ width = "100%", height = 16, radius: r = 8, className }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cx("rl-skeleton", className)}
      style={{
        display: "block", width, height, borderRadius: r,
        background: "linear-gradient(90deg, rgba(28,16,8,0.05) 25%, rgba(28,16,8,0.09) 50%, rgba(28,16,8,0.05) 75%)",
        backgroundSize: "200% 100%", animation: "shimmer 1.6s linear infinite",
      }}
    />
  );
}

export default Alert;
