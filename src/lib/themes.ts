/**
 * Event Theme Registry
 *
 * To add a new theme:
 *   1. Add a new ThemeId literal
 *   2. Add the config object to THEMES
 *   3. Add it to THEME_LIST
 *
 * Nothing else needs to change.
 */

export type ThemeId =
  | "classic-light"
  | "luxury-dark"
  | "emerald-gold"
  | "modern-minimal"
  | "romantic-floral";

export interface EventTheme {
  id: ThemeId;
  nameHe: string;
  // ── Hero section ──────────────────────────────────
  heroBg: string;           // CSS background (gradient or color)
  heroNameColor: string;    // couple name color
  heroSubColor: string;     // subtitle color (e.g. "מתחתנים!")
  heroAccent: string;       // ornament / divider color
  heroMutedText: string;    // muted text (date, hebrew date)
  heroBadgeBg: string;      // event type badge background
  heroBadgeBorder: string;  // badge border
  heroBadgeText: string;    // badge text
  heroCountdownBg: string;  // countdown tile bg
  heroCountdownBorder: string;
  heroCountdownText: string;
  // ── Body ─────────────────────────────────────────
  bodyBg: string;           // main page background
  altSectionBg: string;     // alternating section (navigation, share)
  // ── Cards ────────────────────────────────────────
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  cardIconBg: string;       // icon wrapper inside cards
  // ── Typography ───────────────────────────────────
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  accentColor: string;      // gold equivalent
  accentBg: string;         // light tint of accent
  accentBorder: string;
  // ── Form inputs ──────────────────────────────────
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
  // ── Footer ───────────────────────────────────────
  footerBg: string;
  footerTextMuted: string;
  footerAccent: string;
  // ── Admin preview swatch (CSS gradient string) ───
  previewGradient: string;
  previewAccent: string;
}

const THEMES: Record<ThemeId, EventTheme> = {
  "classic-light": {
    id: "classic-light",
    nameHe: "לבן קלאסי",
    heroBg: "linear-gradient(160deg,#0D1B0C 0%,#1A2B18 55%,#0F2010 100%)",
    heroNameColor: "#FFFFFF",
    heroSubColor: "#C5A46D",
    heroAccent: "#C5A46D",
    heroMutedText: "rgba(255,255,255,0.50)",
    heroBadgeBg: "rgba(197,164,109,0.15)",
    heroBadgeBorder: "rgba(197,164,109,0.40)",
    heroBadgeText: "#C5A46D",
    heroCountdownBg: "rgba(197,164,109,0.10)",
    heroCountdownBorder: "rgba(197,164,109,0.35)",
    heroCountdownText: "#FFFFFF",
    bodyBg: "#FDFAF5",
    altSectionBg: "linear-gradient(160deg,#F6F1E8,#EDE6D6)",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(197,164,109,0.18)",
    cardShadow: "0 4px 20px rgba(0,0,0,0.05)",
    cardIconBg: "rgba(197,164,109,0.10)",
    headingColor: "#1a1a1a",
    bodyColor: "#1a1a1a",
    mutedColor: "rgba(26,26,26,0.50)",
    accentColor: "#C5A46D",
    accentBg: "rgba(197,164,109,0.10)",
    accentBorder: "rgba(197,164,109,0.25)",
    inputBg: "#FDFAF5",
    inputBorder: "rgba(197,164,109,0.25)",
    inputFocusBorder: "#C5A46D",
    footerBg: "#080F07",
    footerTextMuted: "rgba(255,255,255,0.25)",
    footerAccent: "#C5A46D",
    previewGradient: "linear-gradient(135deg,#1A2B18 0%,#FDFAF5 60%)",
    previewAccent: "#C5A46D",
  },

  "luxury-dark": {
    id: "luxury-dark",
    nameHe: "שחור יוקרתי",
    heroBg: "linear-gradient(160deg,#0A0A0A 0%,#1A1410 55%,#0D0A07 100%)",
    heroNameColor: "#FFFFFF",
    heroSubColor: "#C5A46D",
    heroAccent: "#C5A46D",
    heroMutedText: "rgba(255,255,255,0.45)",
    heroBadgeBg: "rgba(197,164,109,0.12)",
    heroBadgeBorder: "rgba(197,164,109,0.35)",
    heroBadgeText: "#D4BC8A",
    heroCountdownBg: "rgba(197,164,109,0.08)",
    heroCountdownBorder: "rgba(197,164,109,0.30)",
    heroCountdownText: "#FFFFFF",
    bodyBg: "#111111",
    altSectionBg: "linear-gradient(160deg,#1A1410,#0D0A07)",
    cardBg: "#1E1A16",
    cardBorder: "rgba(197,164,109,0.18)",
    cardShadow: "0 4px 24px rgba(0,0,0,0.35)",
    cardIconBg: "rgba(197,164,109,0.10)",
    headingColor: "#F5EFE5",
    bodyColor: "#E8DDD0",
    mutedColor: "rgba(232,221,208,0.50)",
    accentColor: "#C5A46D",
    accentBg: "rgba(197,164,109,0.10)",
    accentBorder: "rgba(197,164,109,0.25)",
    inputBg: "#1A1410",
    inputBorder: "rgba(197,164,109,0.22)",
    inputFocusBorder: "#C5A46D",
    footerBg: "#050503",
    footerTextMuted: "rgba(255,255,255,0.20)",
    footerAccent: "#C5A46D",
    previewGradient: "linear-gradient(135deg,#0A0A0A 0%,#1E1A16 100%)",
    previewAccent: "#C5A46D",
  },

  "emerald-gold": {
    id: "emerald-gold",
    nameHe: "ירוק וזהב",
    heroBg: "linear-gradient(160deg,#0C2416 0%,#163B25 55%,#0A1E12 100%)",
    heroNameColor: "#FFFFFF",
    heroSubColor: "#C5A46D",
    heroAccent: "#C5A46D",
    heroMutedText: "rgba(255,255,255,0.50)",
    heroBadgeBg: "rgba(107,163,90,0.18)",
    heroBadgeBorder: "rgba(107,163,90,0.40)",
    heroBadgeText: "#8FD4A0",
    heroCountdownBg: "rgba(107,163,90,0.12)",
    heroCountdownBorder: "rgba(197,164,109,0.35)",
    heroCountdownText: "#FFFFFF",
    bodyBg: "#F4FAF5",
    altSectionBg: "linear-gradient(160deg,#EAF3EB,#D8EBDA)",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(107,123,90,0.20)",
    cardShadow: "0 4px 20px rgba(0,0,0,0.06)",
    cardIconBg: "rgba(107,123,90,0.10)",
    headingColor: "#1a2e1a",
    bodyColor: "#1a2e1a",
    mutedColor: "rgba(26,46,26,0.50)",
    accentColor: "#3D8B5C",
    accentBg: "rgba(107,123,90,0.10)",
    accentBorder: "rgba(107,123,90,0.25)",
    inputBg: "#F4FAF5",
    inputBorder: "rgba(107,123,90,0.25)",
    inputFocusBorder: "#3D8B5C",
    footerBg: "#061208",
    footerTextMuted: "rgba(255,255,255,0.25)",
    footerAccent: "#C5A46D",
    previewGradient: "linear-gradient(135deg,#0C2416 0%,#F4FAF5 60%)",
    previewAccent: "#3D8B5C",
  },

  "modern-minimal": {
    id: "modern-minimal",
    nameHe: "מודרני נקי",
    heroBg: "#FFFFFF",
    heroNameColor: "#111111",
    heroSubColor: "#888888",
    heroAccent: "#CCCCCC",
    heroMutedText: "rgba(17,17,17,0.40)",
    heroBadgeBg: "rgba(17,17,17,0.05)",
    heroBadgeBorder: "rgba(17,17,17,0.15)",
    heroBadgeText: "#444444",
    heroCountdownBg: "rgba(17,17,17,0.04)",
    heroCountdownBorder: "rgba(17,17,17,0.12)",
    heroCountdownText: "#111111",
    bodyBg: "#FFFFFF",
    altSectionBg: "#F7F7F7",
    cardBg: "#FAFAFA",
    cardBorder: "rgba(0,0,0,0.08)",
    cardShadow: "0 2px 12px rgba(0,0,0,0.05)",
    cardIconBg: "rgba(0,0,0,0.05)",
    headingColor: "#111111",
    bodyColor: "#222222",
    mutedColor: "rgba(0,0,0,0.40)",
    accentColor: "#111111",
    accentBg: "rgba(0,0,0,0.04)",
    accentBorder: "rgba(0,0,0,0.12)",
    inputBg: "#FFFFFF",
    inputBorder: "rgba(0,0,0,0.15)",
    inputFocusBorder: "#111111",
    footerBg: "#111111",
    footerTextMuted: "rgba(255,255,255,0.30)",
    footerAccent: "#AAAAAA",
    previewGradient: "linear-gradient(135deg,#F7F7F7 0%,#FFFFFF 100%)",
    previewAccent: "#111111",
  },

  "romantic-floral": {
    id: "romantic-floral",
    nameHe: "פרחוני רומנטי",
    heroBg: "linear-gradient(160deg,#3D1A2A 0%,#5C2438 55%,#2E1220 100%)",
    heroNameColor: "#FFFFFF",
    heroSubColor: "#E8A4B8",
    heroAccent: "#E8A4B8",
    heroMutedText: "rgba(255,255,255,0.50)",
    heroBadgeBg: "rgba(232,164,184,0.15)",
    heroBadgeBorder: "rgba(232,164,184,0.40)",
    heroBadgeText: "#E8A4B8",
    heroCountdownBg: "rgba(232,164,184,0.10)",
    heroCountdownBorder: "rgba(232,164,184,0.35)",
    heroCountdownText: "#FFFFFF",
    bodyBg: "#FDF6F8",
    altSectionBg: "linear-gradient(160deg,#F9ECF0,#F0DDE4)",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(232,164,184,0.22)",
    cardShadow: "0 4px 20px rgba(200,100,130,0.07)",
    cardIconBg: "rgba(232,164,184,0.12)",
    headingColor: "#2D0F1A",
    bodyColor: "#2D0F1A",
    mutedColor: "rgba(45,15,26,0.50)",
    accentColor: "#C0547A",
    accentBg: "rgba(232,164,184,0.12)",
    accentBorder: "rgba(232,164,184,0.30)",
    inputBg: "#FDF6F8",
    inputBorder: "rgba(232,164,184,0.30)",
    inputFocusBorder: "#C0547A",
    footerBg: "#1A0810",
    footerTextMuted: "rgba(255,255,255,0.25)",
    footerAccent: "#E8A4B8",
    previewGradient: "linear-gradient(135deg,#3D1A2A 0%,#FDF6F8 60%)",
    previewAccent: "#C0547A",
  },
};

export const THEME_LIST: EventTheme[] = Object.values(THEMES);

export function getTheme(id?: string | null): EventTheme {
  return THEMES[(id as ThemeId) ?? "classic-light"] ?? THEMES["classic-light"];
}

export const DEFAULT_THEME_ID: ThemeId = "classic-light";
