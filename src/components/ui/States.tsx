"use client";
/**
 * EmptyState, ErrorState, SuccessState — every screen must guide, never dead-end.
 * Each takes an icon, a warm headline, supportive copy, and a clear next action.
 */
import React from "react";
import { color, radius, font, fontWeight } from "@/design/tokens";
import { Button } from "./Button";

export interface StateAction { label: string; onClick: () => void; }

interface BaseStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: StateAction;
  secondaryAction?: StateAction;
}

function StateShell({ icon, title, description, action, secondaryAction, chip }: BaseStateProps & { chip: { bg: string; fg: string } }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 24px", gap: 8 }}>
      {icon && (
        <div style={{ width: 64, height: 64, borderRadius: radius.xl, background: chip.bg, color: chip.fg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontFamily: font.serif, fontWeight: fontWeight.bold, fontSize: 20, color: color.text }}>{title}</h3>
      {description && <p style={{ fontFamily: font.sans, fontSize: 14, color: color.textMuted, maxWidth: 360, lineHeight: 1.6 }}>{description}</p>}
      {(action || secondaryAction) && (
        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {action && <Button onClick={action.onClick}>{action.label}</Button>}
          {secondaryAction && <Button variant="ghost" onClick={secondaryAction.onClick}>{secondaryAction.label}</Button>}
        </div>
      )}
    </div>
  );
}

export function EmptyState(props: BaseStateProps) {
  return <StateShell {...props} chip={{ bg: color.surface, fg: color.primary }} />;
}
export function ErrorState(props: BaseStateProps) {
  return <StateShell {...props} chip={{ bg: color.dangerContainer, fg: color.dangerText }} />;
}
export function SuccessState(props: BaseStateProps) {
  return <StateShell {...props} chip={{ bg: color.successContainer, fg: color.successText }} />;
}

export default EmptyState;
