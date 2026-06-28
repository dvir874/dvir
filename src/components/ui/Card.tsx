"use client";
/**
 * Card — the floating surface (level-2). StatCard — KPI unit.
 */
import React, { forwardRef } from "react";
import { color, radius, shadow, font, fontWeight, type as typeScale, duration, easing } from "@/design/tokens";
import { cx } from "@/design";

type Pad = "none" | "sm" | "md" | "lg";
const PAD: Record<Pad, number> = { none: 0, sm: 16, md: 24, lg: 32 };

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  pad?: Pad;
  interactive?: boolean;
  /** elevated = floating shadow; flat = bordered only. */
  variant?: "elevated" | "flat";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { pad = "md", interactive, variant = "elevated", children, style, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("rl-card", interactive && "rl-card--interactive", className)}
      style={{
        background: color.surfaceRaised,
        border: `1px solid ${color.border}`,
        borderRadius: radius.lg,
        boxShadow: variant === "elevated" ? shadow.card : "none",
        padding: PAD[pad],
        transition: interactive ? `transform ${duration.base} ${easing.standard}, box-shadow ${duration.base} ${easing.standard}` : undefined,
        cursor: interactive ? "pointer" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** icon chip tone */
  tone?: "primary" | "secondary" | "neutral";
  delta?: { text: string; tone?: "success" | "warning" | "danger" | "neutral" };
}

const TONE_CHIP: Record<NonNullable<StatCardProps["tone"]>, { bg: string; fg: string }> = {
  primary:   { bg: color.warningContainer, fg: color.primaryHover },
  secondary: { bg: color.successContainer, fg: color.secondary },
  neutral:   { bg: color.surface, fg: color.textSoft },
};
const DELTA_FG = {
  success: color.successText, warning: color.warningText, danger: color.dangerText, neutral: color.textMuted,
};

export function StatCard({ label, value, icon, tone = "primary", delta }: StatCardProps) {
  const chip = TONE_CHIP[tone];
  return (
    <Card pad="md">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        {icon && (
          <div style={{ width: 48, height: 48, borderRadius: radius.md, background: chip.bg, color: chip.fg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
        )}
        {delta && (
          <span style={{ fontSize: 13, fontWeight: fontWeight.bold, color: DELTA_FG[delta.tone ?? "neutral"], fontFamily: font.sans }}>
            {delta.text}
          </span>
        )}
      </div>
      <p style={{ color: color.textMuted, fontSize: 13, marginBottom: 4, fontFamily: font.sans }}>{label}</p>
      <h3 style={{ fontFamily: typeScale.headlineLg.family, fontWeight: fontWeight.bold, fontSize: 32, color: color.text, lineHeight: 1.1 }}>{value}</h3>
    </Card>
  );
}

export default Card;
