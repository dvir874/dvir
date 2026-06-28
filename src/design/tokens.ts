/**
 * ─────────────────────────────────────────────────────────────────────────
 *  רגע לפני · Product Design Foundation — DESIGN TOKENS
 *  The single source of truth for every visual decision in the product.
 *
 *  Derived from the Stitch-authored design language ("Regal Wedding" designMd)
 *  and the brand palette in CLAUDE.md. Stitch is the designer; this file is the
 *  canonical implementation of that language.
 *
 *  RULES
 *  • Nothing in the product should hardcode a hex/size/shadow. Import from here.
 *  • This layer is ADDITIVE. It does not change any existing screen. Screens are
 *    migrated onto it wave-by-wave (see docs/design/migration-plan.md).
 *  • The canonical brand "ink" is #1C1008 (NOT the legacy #333333).
 * ─────────────────────────────────────────────────────────────────────────
 */

/* ===========================================================================
 * 1 · COLOR
 * Semantic-first. Reach for `color.*` semantic roles, not raw `palette.*`.
 * =========================================================================== */

/** Raw brand palette — the only place raw hexes live. */
export const palette = {
  // Neutrals (warm, never pure black/white)
  ink:        "#1C1008", // canonical brand near-black (warm charcoal-brown)
  ink80:      "rgba(28,16,8,0.80)",
  ink62:      "rgba(28,16,8,0.62)",
  ink45:      "rgba(28,16,8,0.45)",
  ink25:      "rgba(28,16,8,0.25)",
  ink12:      "rgba(28,16,8,0.12)",

  ivory:      "#FDFAF5", // page background
  cream:      "#F6F1E8", // grouped sections / level-1 surface
  creamDark:  "#EDE6D6",
  white:      "#FFFFFF", // floating cards / level-2 surface

  // Gold (primary)
  gold:       "#C5A46D",
  goldLight:  "#D4BC8A",
  goldSoft:   "#E5C188", // primary-fixed-dim — accents on dark surfaces
  goldDeep:   "#A07840", // readable gold text on light
  goldInk:    "#755A2A", // darkest gold (text/links on cream)

  // Olive (secondary)
  olive:      "#6B7B5A",
  oliveDark:  "#556249",
  oliveSoft:  "#DCE6D1", // healthy badge bg

  // Semantic accents
  red:        "#B24C4C", // urgent / danger (warm, brand-tuned)
  redDeep:    "#93000A",
  redSoft:    "#FFDAD6",
  amber:      "#A07840", // attention / warning text
  amberSoft:  "rgba(197,164,109,0.18)",
  blue:       "#5E7A99", // info (calm slate)
  blueSoft:   "#E1E9F0",
} as const;

/** Semantic color roles — use THESE in components. */
export const color = {
  // Brand
  primary:          palette.gold,
  primaryHover:     palette.goldDeep,
  primaryText:      palette.ink,      // text ON a gold button
  primarySoft:      palette.goldSoft,
  onDarkAccent:     palette.goldSoft, // gold accent placed on a dark surface

  secondary:        palette.olive,
  secondaryHover:   palette.oliveDark,
  secondaryText:    palette.white,

  // Surfaces / background (elevation tiers)
  bg:               palette.ivory,    // level-0 page
  surface:          palette.cream,    // level-1 grouped section
  surfaceRaised:    palette.white,    // level-2 floating card
  surfaceInverse:   palette.ink,      // dark hero / sidebar

  // Text
  text:             palette.ink,
  textSoft:         palette.ink62,
  textMuted:        palette.ink45,
  textFaint:        palette.ink25,
  textOnDark:       palette.ivory,
  textOnDarkSoft:   "rgba(253,250,245,0.66)",

  // Lines / borders (gold-tinted, used sparingly)
  border:           "rgba(197,164,109,0.20)",
  borderStrong:     "rgba(197,164,109,0.38)",
  borderFaint:      "rgba(197,164,109,0.10)",

  // Status — each role has a foreground + a soft container
  success:          palette.olive,
  successContainer: palette.oliveSoft,
  successText:      palette.oliveDark,

  warning:          palette.amber,
  warningContainer: palette.amberSoft,
  warningText:      palette.amber,

  danger:           palette.red,
  dangerContainer:  palette.redSoft,
  dangerText:       palette.redDeep,

  info:             palette.blue,
  infoContainer:    palette.blueSoft,
  infoText:         "#3C5A78",

  // Focus ring (accessibility)
  focus:            "rgba(197,164,109,0.55)",
} as const;

/* ===========================================================================
 * 2 · TYPOGRAPHY
 * Two families. Frank Ruhl Libre (serif) = display/headings. Heebo = UI/body.
 * Sizes are a deliberate scale; never invent an off-scale size.
 * =========================================================================== */

export const font = {
  serif: "'Frank Ruhl Libre', serif",
  sans:  "'Heebo', sans-serif",
} as const;

export const fontWeight = {
  light:    300,
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
  black:    900,
} as const;

/**
 * Type scale — each role = [size, lineHeight, weight, family, letterSpacing?].
 * `*Mobile` variants down-shift display sizes on small screens.
 */
export const type = {
  displayLg:       { size: "48px", line: "1.1",  weight: fontWeight.black,    family: font.serif, tracking: "-0.02em" },
  displayLgMobile: { size: "32px", line: "1.15", weight: fontWeight.black,    family: font.serif, tracking: "-0.01em" },
  headlineLg:      { size: "32px", line: "1.25", weight: fontWeight.bold,     family: font.serif, tracking: "-0.01em" },
  headlineMd:      { size: "24px", line: "1.35", weight: fontWeight.bold,     family: font.serif },
  headlineSm:      { size: "20px", line: "1.4",  weight: fontWeight.bold,     family: font.serif },
  titleLg:         { size: "18px", line: "1.45", weight: fontWeight.semibold, family: font.sans },
  bodyLg:          { size: "18px", line: "1.6",  weight: fontWeight.regular,  family: font.sans },
  bodyMd:          { size: "16px", line: "1.6",  weight: fontWeight.regular,  family: font.sans },
  bodySm:          { size: "14px", line: "1.5",  weight: fontWeight.regular,  family: font.sans },
  label:           { size: "14px", line: "1.2",  weight: fontWeight.semibold, family: font.sans, tracking: "0.02em" },
  labelSm:         { size: "12px", line: "1.2",  weight: fontWeight.medium,   family: font.sans, tracking: "0.04em" },
  eyebrow:         { size: "12px", line: "1.2",  weight: fontWeight.bold,     family: font.sans, tracking: "0.12em" }, // UPPERCASE
} as const;

export type TypeRole = keyof typeof type;

/* ===========================================================================
 * 3 · SPACING  (8px base rhythm)
 * =========================================================================== */

export const space = {
  0: "0",
  px: "1px",
  0.5: "2px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

/* ===========================================================================
 * 4 · RADIUS  (highly rounded / organic-luxury shape language)
 * =========================================================================== */

export const radius = {
  xs:    "8px",
  sm:    "12px",
  md:    "16px",
  lg:    "20px",  // default for cards, inputs, large buttons
  xl:    "24px",
  "2xl": "32px",  // hero banners, feature cards
  pill:  "9999px",
} as const;

/* ===========================================================================
 * 5 · ELEVATION / SHADOWS  (soft, diffused, warm-tinted)
 * =========================================================================== */

export const shadow = {
  none:  "none",
  xs:    "0 1px 2px rgba(28,16,8,0.04)",
  card:  "0 4px 20px rgba(28,16,8,0.04)",   // level-2 floating card
  raised:"0 8px 28px rgba(28,16,8,0.08)",
  float: "0 16px 48px rgba(28,16,8,0.12)",  // popovers
  modal: "0 24px 64px rgba(28,16,8,0.20)",  // dialogs (+ backdrop blur)
  focus: `0 0 0 3px ${color.focus}`,
} as const;

/** Modal/popover backdrop. */
export const backdrop = {
  scrim:   "rgba(28,16,8,0.32)",
  blur:    "blur(8px)",
} as const;

/* ===========================================================================
 * 6 · MOTION  (luxurious, calm, never flashy)
 * =========================================================================== */

export const duration = {
  instant: "80ms",
  fast:    "150ms",
  base:    "240ms",  // default UI transition
  slow:    "360ms",
  slower:  "560ms",  // page / sheet transitions
} as const;

export const easing = {
  /** Standard — most enter/exit & hovers. */
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Entrance — decelerate (calm settle). */
  out:      "cubic-bezier(0.0, 0, 0.2, 1)",
  /** Exit — accelerate. */
  in:       "cubic-bezier(0.4, 0, 1, 1)",
  /** Emphasized — subtle spring for delight moments (success). */
  spring:   "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export const transition = {
  base:  `all ${duration.base} ${easing.standard}`,
  fast:  `all ${duration.fast} ${easing.standard}`,
  enter: `all ${duration.base} ${easing.out}`,
} as const;

/* ===========================================================================
 * 7 · Z-INDEX  (named scale — never use magic numbers)
 * =========================================================================== */

export const z = {
  base:      0,
  raised:    10,
  sticky:    20,
  header:    30,
  overlayBg: 40,
  drawer:    45,
  sidebar:   50,
  dropdown:  60,
  dialog:    70,
  toast:     80,
  tooltip:   90,
  max:       9999,
} as const;

/* ===========================================================================
 * 8 · OPACITY
 * =========================================================================== */

export const opacity = {
  disabled: 0.45,
  muted:    0.62,
  hover:    0.92,
  scrim:    0.32,
} as const;

/* ===========================================================================
 * 9 · LAYOUT — breakpoints, containers, RTL, safe areas
 * =========================================================================== */

/** Mobile-first breakpoints (min-width), matching Tailwind defaults we rely on. */
export const breakpoint = {
  sm:  "640px",
  md:  "768px",  // tablet ≥ this; admin sidebar appears at md
  lg:  "1024px", // desktop
  xl:  "1280px",
} as const;

export const container = {
  prose:   "640px",
  content: "1024px",
  wide:    "1280px",
  max:     "1440px",
} as const;

/** Minimum interactive target — WCAG / thumb reach. */
export const tapTarget = {
  min:        "44px", // never below this for couple/guest (mobile)
  comfy:      "48px",
} as const;

export const safeArea = {
  bottom: "env(safe-area-inset-bottom)",
  top:    "env(safe-area-inset-top)",
} as const;

/** Logical (RTL-safe) direction helpers — prefer these over left/right. */
export const rtl = {
  start: "right", // inline-start in an RTL doc
  end:   "left",  // inline-end in an RTL doc
} as const;

/* ===========================================================================
 * 10 · DARK THEME (prepared, not yet enabled)
 * Mirror of `color` for a future dark mode. Components should read from
 * `color`; when dark mode ships, a provider swaps the active map.
 * =========================================================================== */

export const colorDark = {
  bg:             "#15110C",
  surface:        "#1F1A13",
  surfaceRaised:  "#272019",
  surfaceInverse: palette.ivory,
  text:           palette.ivory,
  textSoft:       "rgba(253,250,245,0.72)",
  textMuted:      "rgba(253,250,245,0.50)",
  border:         "rgba(229,193,136,0.18)",
  primary:        palette.goldSoft,
  primaryText:    palette.ink,
  secondary:      "#8FA37C",
} as const;

/* ===========================================================================
 *  Aggregate export — the foundation object.
 * =========================================================================== */

export const tokens = {
  palette, color, colorDark,
  font, fontWeight, type,
  space, radius, shadow, backdrop,
  duration, easing, transition,
  z, opacity,
  breakpoint, container, tapTarget, safeArea, rtl,
} as const;

export type Tokens = typeof tokens;
export default tokens;
