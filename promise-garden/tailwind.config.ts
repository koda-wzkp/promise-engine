import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        serif: ["IBM Plex Serif", "ui-serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        garden: {
          earth: "#8B7355",
          earthLight: "#C4A882",
          earthDark: "#5C4A32",
          green: "#2D5016",
          greenLight: "#4A7C29",
          greenDark: "#1A3009",
          sky: "#87CEEB",
          skyLight: "#E0F6FF",
          skyMedium: "#B3E5FC",
          skyDark: "#4A90D9",
          gold: "#D4A017",
          goldLight: "#F5DEB3",
          amber: "#D97706",
          stress: "#DC2626",
          stressLight: "#FEF2F2",
          dead: "#6B7280",
          deadLight: "#9CA3AF",
        },
        domain: {
          health: "#1a5f4a",
          healthBg: "#ecfdf5",
          work: "#1e40af",
          workBg: "#eff6ff",
          relationships: "#9333ea",
          relationshipsBg: "#f5f3ff",
          creative: "#d97706",
          creativeBg: "#fffbeb",
          financial: "#059669",
          financialBg: "#f0fdf4",
        },
        status: {
          kept: "#14532d",
          keptBg: "#f0fdf4",
          partial: "#78350f",
          partialBg: "#fffbeb",
          missed: "#991b1b",
          missedBg: "#fef2f2",
          active: "#1e40af",
          activeBg: "#eff6ff",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
