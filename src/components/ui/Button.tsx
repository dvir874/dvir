"use client";
/**
 * Button & IconButton — the one button in the product.
 * Variants: primary | secondary | outline | ghost | danger
 * Sizes: sm | md | lg.  Mobile-safe: md/lg meet the 44px tap target.
 */
import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { color, radius, shadow, font, fontWeight, duration, easing } from "@/design/tokens";
import { cx } from "@/design";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, React.CSSProperties> = {
  sm: { height: 38, padding: "0 16px", fontSize: 14, borderRadius: radius.sm, gap: 6 },
  md: { height: 44, padding: "0 22px", fontSize: 15, borderRadius: radius.lg, gap: 8 },
  lg: { height: 52, padding: "0 30px", fontSize: 16, borderRadius: radius.lg, gap: 10 },
};

function variantStyle(v: Variant): React.CSSProperties {
  switch (v) {
    case "primary":
      return { background: color.primary, color: color.primaryText, boxShadow: shadow.xs };
    case "secondary":
      return { background: color.secondary, color: color.secondaryText };
    case "outline":
      return { background: "transparent", color: color.primaryHover, border: `1.5px solid ${color.primary}` };
    case "ghost":
      return { background: "transparent", color: color.text };
    case "danger":
      return { background: color.danger, color: "#fff" };
  }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, leadingIcon, trailingIcon, disabled, children, style, className, ...rest },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cx("rl-btn", className)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: font.sans,
        fontWeight: fontWeight.semibold,
        width: fullWidth ? "100%" : undefined,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        transition: `transform ${duration.fast} ${easing.standard}, box-shadow ${duration.base} ${easing.standard}, background ${duration.base} ${easing.standard}`,
        whiteSpace: "nowrap",
        ...SIZES[size],
        ...variantStyle(variant),
        ...style,
      }}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});

/* ── IconButton ── */
type IconSize = "sm" | "md" | "lg";
const ICON_DIM: Record<IconSize, number> = { sm: 36, md: 44, lg: 48 };

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label — required (icon-only buttons must be labelled). */
  "aria-label": string;
  size?: IconSize;
  variant?: "ghost" | "soft" | "primary";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = "md", variant = "ghost", children, style, className, ...rest },
  ref,
) {
  const bg = variant === "primary" ? color.primary : variant === "soft" ? color.surface : "transparent";
  const fg = variant === "primary" ? color.primaryText : color.textSoft;
  return (
    <button
      ref={ref}
      className={cx("rl-icon-btn", className)}
      style={{
        width: ICON_DIM[size],
        height: ICON_DIM[size],
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
        background: bg,
        color: fg,
        cursor: "pointer",
        transition: `background ${duration.fast} ${easing.standard}`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
