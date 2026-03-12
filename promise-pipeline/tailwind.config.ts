import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        serif: ["IBM Plex Serif", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "Menlo", "monospace"],
      },
      colors: {
        sky: {
          lightest: "#E0F6FF",
          light: "#B3E5FC",
          medium: "#87CEEB",
          accent: "#4A90D9",
          dark: "#1a1a2e",
          "dark-accent": "#2d2d44",
        },
        status: {
          verified: "#1a5f4a",
          "verified-bg": "#ecfdf5",
          declared: "#1e40af",
          "declared-bg": "#eff6ff",
          degraded: "#78350f",
          "degraded-bg": "#fffbeb",
          violated: "#991b1b",
          "violated-bg": "#fef2f2",
          unverifiable: "#5b21b6",
          "unverifiable-bg": "#f5f3ff",
        },
      },
    },
  },
  plugins: [],
};
export default config;
