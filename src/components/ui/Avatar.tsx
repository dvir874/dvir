"use client";
/** Avatar — always circular. Falls back to initials over a warm tint. */
import React from "react";
import { color, font, fontWeight } from "@/design/tokens";
import { cx } from "@/design";

type Size = "xs" | "sm" | "md" | "lg";
const DIM: Record<Size, number> = { xs: 28, sm: 36, md: 44, lg: 64 };

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
}

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const dim = DIM[size];
  return (
    <div
      className={cx("rl-avatar", className)}
      style={{
        width: dim, height: dim, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
        background: color.warningContainer, color: color.primaryHover,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: font.sans, fontWeight: fontWeight.bold, fontSize: dim * 0.36,
      }}
      aria-label={name ?? undefined}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials(name)
      )}
    </div>
  );
}

export default Avatar;
