"use client";
/** Switch, Checkbox, Radio — controlled toggles with 44px tap targets. */
import React from "react";
import { Check } from "lucide-react";
import { color, radius, font, duration, easing } from "@/design/tokens";
import { cx } from "@/design";

/* ── Switch ── */
export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}
export function Switch({ checked, onChange, label, disabled, id }: SwitchProps) {
  return (
    <label htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, minHeight: 44 }}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: 46, height: 28, borderRadius: radius.pill, padding: 3, flexShrink: 0,
          background: checked ? color.primary : "rgba(28,16,8,0.16)",
          transition: `background ${duration.base} ${easing.standard}`,
          display: "flex", alignItems: "center",
          justifyContent: checked ? "flex-start" : "flex-end", // RTL: on = thumb to start(right)
          cursor: "inherit",
        }}
      >
        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: `all ${duration.base} ${easing.standard}` }} />
      </button>
      {label && <span style={{ fontFamily: font.sans, fontSize: 15, color: color.text }}>{label}</span>}
    </label>
  );
}

/* ── Checkbox ── */
export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
}
export function Checkbox({ checked, onChange, label, disabled, id }: CheckboxProps) {
  return (
    <label htmlFor={id} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, minHeight: 44 }}>
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: 22, height: 22, borderRadius: radius.xs, flexShrink: 0,
          background: checked ? color.primary : color.surface,
          border: checked ? "none" : `1.5px solid ${color.borderStrong}`,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "inherit",
          transition: `background ${duration.fast} ${easing.standard}`,
        }}
      >
        {checked && <Check size={15} color={color.primaryText} strokeWidth={3} />}
      </button>
      {label && <span style={{ fontFamily: font.sans, fontSize: 15, color: color.text }}>{label}</span>}
    </label>
  );
}

/* ── Radio (single + group) ── */
export interface RadioOption<T extends string> { value: T; label: React.ReactNode; }
export interface RadioGroupProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: RadioOption<T>[];
  name: string;
  className?: string;
}
export function RadioGroup<T extends string>({ value, onChange, options, name, className }: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" className={cx("rl-radio-group", className)} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <label key={o.value} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", minHeight: 44 }}>
            <button
              type="button"
              role="radio"
              name={name}
              aria-checked={active}
              onClick={() => onChange(o.value)}
              style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${active ? color.primary : color.borderStrong}`,
                display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", cursor: "pointer",
              }}
            >
              {active && <span style={{ width: 10, height: 10, borderRadius: "50%", background: color.primary }} />}
            </button>
            <span style={{ fontFamily: font.sans, fontSize: 15, color: color.text }}>{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default Switch;
