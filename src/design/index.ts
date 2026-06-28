/**
 * רגע לפני · Product Design Foundation — public entry point.
 * Import design tokens and helpers from "@/design".
 */
export * from "./tokens";
export { default as tokens } from "./tokens";
export { textStyle } from "./typography";

/** Tiny classnames joiner used across the UI library. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
