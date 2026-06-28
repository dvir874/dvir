"use client";
/**
 * Toast — non-blocking feedback. Wrap the app (or a subtree) in <ToastProvider>
 * and call useToast().show({ tone, message }).
 */
import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { color, radius, shadow, font, fontWeight, z, safeArea } from "@/design/tokens";

type Tone = "success" | "warning" | "danger" | "info";
interface ToastItem { id: number; tone: Tone; message: string; }

const ICONS: Record<Tone, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  danger:  <XCircle size={18} />,
  info:    <Info size={18} />,
};
const FG: Record<Tone, string> = {
  success: color.successText, warning: color.warningText, danger: color.dangerText, info: color.infoText,
};

interface ToastCtx { show: (t: { tone?: Tone; message: string }) => void; }
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback(({ tone = "info", message }: { tone?: Tone; message: string }) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4200);
  }, []);
  const dismiss = (id: number) => setItems((prev) => prev.filter((t) => t.id !== id));

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: "fixed", insetInlineStart: 16, bottom: `calc(16px + ${safeArea.bottom})`, zIndex: z.toast,
          display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, pointerEvents: "none",
        }}
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12,
              background: color.surfaceRaised, border: `1px solid ${color.border}`, borderRadius: radius.md,
              boxShadow: shadow.float, padding: "12px 14px",
              animation: "rlToastIn 240ms cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            <span style={{ color: FG[t.tone], display: "flex" }}>{ICONS[t.tone]}</span>
            <span style={{ flex: 1, fontFamily: font.sans, fontSize: 14, fontWeight: fontWeight.medium, color: color.text }}>{t.message}</span>
            <button aria-label="סגירה" onClick={() => dismiss(t.id)} style={{ color: color.textMuted, cursor: "pointer", display: "flex" }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export default ToastProvider;
