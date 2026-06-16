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
        cream: "#F6F1E8",
        olive: "#6B7B5A",
        gold: "#C5A46D",
        dark: "#333333",
        "cream-dark": "#EDE6D6",
        "gold-light": "#D4BC8A",
        "olive-dark": "#556249",
      },
      fontFamily: {
        hebrew: ["var(--font-hebrew)", "David Libre", "Frank Ruhl Libre", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-up": "fadeUp 0.8s ease-out forwards",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
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
