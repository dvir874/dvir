"use client";
/**
 * Badge — status pill (בריא / תשומת לב / דחוף …).
 * Chip — selectable/filter pill.  Tag — neutral label.
 */
import React from "react";
import { color, radius, font, fontWeight } from "@/design/tokens";
import { cx } from "@/design";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const TONES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: color.successContainer, fg: color.successText },
  warning: { bg: color.warningContainer, fg: color.warningText },
  danger:  { bg: color.dangerContainer, fg: color.dangerText },
  info:    { bg: color.infoContainer, fg: color.infoText },
  neutral: { bg: color.surface, fg: color.textSoft },
  primary: { bg: color.warningContainer, fg: color.primaryHover },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: React.ReactNode;
}

export function Badge({ tone = "neutral", icon, children, style, className, ...rest }: BadgeProps) {
  const t = TONES[tone];
  return (
    <span
      className={cx("rl-badge", className)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: t.bg, color: t.fg,
        fontFamily: font.sans, fontSize: 12, fontWeight: fontWeight.bold,
        padding: "4px 11px", borderRadius: radius.pill, whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, children, style, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx("rl-chip", className)}
      style={{
        fontFamily: font.sans, fontSize: 14, fontWeight: fontWeight.medium,
        padding: "6px 16px", borderRadius: radius.pill, cursor: "pointer",
        background: active ? color.primary : color.surface,
        color: active ? color.primaryText : color.textSoft,
        border: active ? "none" : `1px solid ${color.border}`,
        transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Tag({ children, style, className, ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx("rl-tag", className)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: color.surface, color: color.textSoft,
        fontFamily: font.sans, fontSize: 12, fontWeight: fontWeight.medium,
        padding: "3px 9px", borderRadius: radius.xs,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;
