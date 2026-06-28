/**
 * Typography helpers — turn a token type-role into a style object.
 * Keeps every text element on-scale without re-deriving sizes by hand.
 */
import type { CSSProperties } from "react";
import { type as typeScale, type TypeRole } from "./tokens";

/** Returns the CSSProperties for a type role (optionally uppercased eyebrow). */
export function textStyle(role: TypeRole, overrides?: CSSProperties): CSSProperties {
  const t = typeScale[role];
  return {
    fontFamily: t.family,
    fontSize: t.size,
    lineHeight: t.line,
    fontWeight: t.weight,
    letterSpacing: "tracking" in t ? (t as { tracking?: string }).tracking : undefined,
    textTransform: role === "eyebrow" ? "uppercase" : undefined,
    ...overrides,
  };
}
