import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Legacy tokens (DO NOT remove — existing screens depend on them) ──
        cream: "#F6F1E8",
        olive: "#6B7B5A",
        gold: "#C5A46D",
        dark: "#333333",
        "cream-dark": "#EDE6D6",
        "gold-light": "#D4BC8A",
        "olive-dark": "#556249",

        // ── Wave 0 design foundation (additive, semantic — see src/design/tokens.ts) ──
        ink: "#1C1008",              // canonical brand near-black
        ivory: "#FDFAF5",
        surface: "#F6F1E8",
        "surface-raised": "#FFFFFF",
        primary: "#C5A46D",
        "primary-soft": "#E5C188",
        "primary-deep": "#A07840",
        secondary: "#6B7B5A",
        success: "#6B7B5A",
        "success-soft": "#DCE6D1",
        warning: "#A07840",
        "warning-soft": "rgba(197,164,109,0.18)",
        danger: "#B24C4C",
        "danger-soft": "#FFDAD6",
        info: "#5E7A99",
        "info-soft": "#E1E9F0",
        line: "rgba(197,164,109,0.20)",
      },
      fontFamily: {
        hebrew: ["var(--font-hebrew)", "David Libre", "Frank Ruhl Libre", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        // ── Wave 0 (additive) ──
        display: ["'Frank Ruhl Libre'", "serif"],
        body: ["'Heebo'", "sans-serif"],
      },
      boxShadow: {
        // ── Wave 0 elevation (additive named keys; Tailwind defaults preserved) ──
        card: "0 4px 20px rgba(28,16,8,0.04)",
        raised: "0 8px 28px rgba(28,16,8,0.08)",
        float: "0 16px 48px rgba(28,16,8,0.12)",
        modal: "0 24px 64px rgba(28,16,8,0.20)",
      },
      borderRadius: {
        // ── Wave 0 shape language (additive named keys only) ──
        field: "20px",
        card: "20px",
        hero: "32px",
        pill: "9999px",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        "out-soft": "cubic-bezier(0.0, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        base: "240ms",
        slow: "360ms",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        // ── Wave 0 motion (additive) ──
        "rl-scale-in": "rlScaleIn 240ms cubic-bezier(0.0,0,0.2,1) forwards",
        "rl-slide-up": "rlSlideUp 360ms cubic-bezier(0.0,0,0.2,1) forwards",
        "rl-toast-in": "rlToastIn 240ms cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // ── Wave 0 motion keyframes (additive) ──
        rlScaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        rlSlideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rlToastIn: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C5A46D 0%, #D4BC8A 50%, #C5A46D 100%)",
        "cream-gradient": "linear-gradient(180deg, #F6F1E8 0%, #EDE6D6 100%)",
        "hero-pattern": "radial-gradient(ellipse at center, rgba(197,164,109,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
