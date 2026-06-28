"use client";
/**
 * Form fields — Field (label+hint+error wrapper), Input, Textarea, Select.
 * Cream surface, no border, 20px radius, gold focus ring. RTL-native.
 */
import React, { forwardRef, useId } from "react";
import { color, radius, font, fontWeight } from "@/design/tokens";
import { cx } from "@/design";

const fieldBase: React.CSSProperties = {
  width: "100%",
  background: color.surface,
  border: "1.5px solid transparent",
  borderRadius: radius.lg,
  padding: "12px 16px",
  fontFamily: font.sans,
  fontSize: 15,
  color: color.text,
  outline: "none",
  transition: "border-color 150ms cubic-bezier(0.4,0,0.2,1), box-shadow 150ms",
};

function focusHandlers(): Pick<React.HTMLAttributes<HTMLElement>, "onFocus" | "onBlur"> {
  return {
    onFocus: (e) => {
      (e.currentTarget as HTMLElement).style.borderColor = color.primary;
      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${color.focus}`;
    },
    onBlur: (e) => {
      (e.currentTarget as HTMLElement).style.borderColor = "transparent";
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
    },
  };
}

/* ── Field wrapper ── */
export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}
export function Field({ label, hint, error, required, htmlFor, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={htmlFor} style={{ fontFamily: font.sans, fontSize: 13, fontWeight: fontWeight.semibold, color: color.text }}>
          {label}{required && <span style={{ color: color.danger }}> *</span>}
        </label>
      )}
      {children}
      {error
        ? <span role="alert" style={{ fontSize: 12, color: color.dangerText, fontFamily: font.sans }}>{error}</span>
        : hint && <span style={{ fontSize: 12, color: color.textMuted, fontFamily: font.sans }}>{hint}</span>}
    </div>
  );
}

/* ── Input ── */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ invalid, style, ...rest }, ref) {
  const h = focusHandlers();
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      style={{ ...fieldBase, borderColor: invalid ? color.danger : "transparent", ...style }}
      {...h}
      {...rest}
    />
  );
});

/* ── Textarea ── */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, style, rows = 4, ...rest }, ref) {
  const h = focusHandlers();
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      style={{ ...fieldBase, resize: "vertical", minHeight: 96, borderColor: invalid ? color.danger : "transparent", ...style }}
      {...h}
      {...rest}
    />
  );
});

/* ── Select ── */
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ invalid, style, children, ...rest }, ref) {
  const h = focusHandlers();
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      style={{ ...fieldBase, appearance: "none", cursor: "pointer", borderColor: invalid ? color.danger : "transparent", ...style }}
      {...h}
      {...rest}
    >
      {children}
    </select>
  );
});

/** Convenience: a labelled input in one shot. */
export function TextField({ label, hint, error, required, id, invalid, ...input }: InputProps & Omit<FieldProps, "children" | "htmlFor"> & { id?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={fieldId}>
      <Input id={fieldId} invalid={invalid || !!error} required={required} {...input} />
    </Field>
  );
}

export default Input;
