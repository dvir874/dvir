"use client";
/** Tabs — pill-style segmented control. Controlled. RTL-native, keyboard-accessible. */
import React from "react";
import { color, radius, font, fontWeight, shadow, duration, easing } from "@/design/tokens";
import { cx } from "@/design";

export interface TabItem<T extends string> {
  id: T;
  label: React.ReactNode;
  badge?: number;
}
export interface TabsProps<T extends string> {
  value: T;
  onChange: (id: T) => void;
  items: TabItem<T>[];
  className?: string;
}

export function Tabs<T extends string>({ value, onChange, items, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cx("rl-tabs", className)}
      style={{
        display: "flex", gap: 4, padding: 4, borderRadius: radius.md,
        background: color.borderFaint, overflowX: "auto", scrollbarWidth: "none",
      }}
    >
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: radius.sm, whiteSpace: "nowrap", flexShrink: 0,
              fontFamily: font.sans, fontSize: 14, fontWeight: fontWeight.medium, cursor: "pointer",
              background: active ? color.surfaceRaised : "transparent",
              color: active ? color.text : color.textMuted,
              boxShadow: active ? shadow.xs : "none",
              transition: `all ${duration.fast} ${easing.standard}`,
            }}
          >
            {it.label}
            {!!it.badge && it.badge > 0 && (
              <span style={{ fontSize: 10, fontWeight: fontWeight.bold, padding: "1px 6px", borderRadius: radius.pill, background: color.warningContainer, color: color.primaryHover }}>
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
