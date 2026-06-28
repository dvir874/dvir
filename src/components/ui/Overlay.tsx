"use client";
/**
 * Dialog (centered modal, desktop-leaning) and Sheet (bottom sheet, mobile-leaning).
 * Both: scrim + blur, Escape to close, scroll-lock, focus on open, safe-area aware.
 */
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { color, radius, shadow, backdrop, font, fontWeight, z, duration, easing, safeArea } from "@/design/tokens";
import { IconButton } from "./Button";

function useOverlay(open: boolean, onClose: () => void, ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, onClose, ref]);
}

interface BaseProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** footer actions row */
  footer?: React.ReactNode;
}

/* ── Dialog ── */
export function Dialog({ open, onClose, title, children, footer }: BaseProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, ref);
  if (!open) return null;
  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: z.dialog, background: backdrop.scrim, backdropFilter: backdrop.blur,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        animation: "fadeIn 160ms ease-out",
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", outline: "none",
          background: color.surfaceRaised, borderRadius: radius.xl, boxShadow: shadow.modal,
          animation: `rlScaleIn ${duration.base} ${easing.out} forwards`,
        }}
      >
        <Header title={title} onClose={onClose} />
        <div style={{ padding: "0 24px 8px" }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 10, justifyContent: "flex-start", padding: 24 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── Bottom Sheet (mobile-first) ── */
export function Sheet({ open, onClose, title, children, footer }: BaseProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, ref);
  if (!open) return null;
  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: z.dialog, background: backdrop.scrim, backdropFilter: backdrop.blur,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "fadeIn 160ms ease-out",
      }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", outline: "none",
          background: color.surfaceRaised, borderTopLeftRadius: radius["2xl"], borderTopRightRadius: radius["2xl"],
          boxShadow: shadow.modal, paddingBottom: safeArea.bottom,
          animation: `rlSlideUp ${duration.slow} ${easing.out} forwards`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <span style={{ width: 40, height: 4, borderRadius: 2, background: color.borderStrong }} />
        </div>
        <Header title={title} onClose={onClose} />
        <div style={{ padding: "0 20px 12px" }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 10, padding: 20 }}>{footer}</div>}
      </div>
    </div>
  );
}

function Header({ title, onClose }: { title?: string; onClose: () => void }) {
  if (!title) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px 0" }}>
        <IconButton aria-label="סגירה" size="sm" onClick={onClose}><X size={18} /></IconButton>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 12px" }}>
      <h3 style={{ fontFamily: font.serif, fontWeight: fontWeight.bold, fontSize: 20, color: color.text }}>{title}</h3>
      <IconButton aria-label="סגירה" size="sm" onClick={onClose}><X size={18} /></IconButton>
    </div>
  );
}

export default Dialog;
