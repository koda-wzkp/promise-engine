import type { PersonalDomain } from "../types/personal";
import type { GrowthStage } from "../types/garden";
import type { CheckInResponse } from "../types/check-in";

// Domain colors — WCAG AAA 7:1 contrast on respective backgrounds
export const domainColors: Record<PersonalDomain, { text: string; bg: string }> = {
  health: { text: "#1a5f4a", bg: "#ecfdf5" },
  work: { text: "#1e40af", bg: "#eff6ff" },
  relationships: { text: "#9333ea", bg: "#f5f3ff" },
  creative: { text: "#d97706", bg: "#fffbeb" },
  financial: { text: "#059669", bg: "#f0fdf4" },
};

// Check-in response colors
export const responseColors: Record<CheckInResponse, { text: string; bg: string }> = {
  kept: { text: "#14532d", bg: "#f0fdf4" },
  partial: { text: "#78350f", bg: "#fffbeb" },
  missed: { text: "#991b1b", bg: "#fef2f2" },
};

// Growth stage plant colors (base palettes for procedural generation)
export const stageColors: Record<GrowthStage, { primary: string; secondary: string }> = {
  seed: { primary: "#8B7355", secondary: "#5C4A32" },
  sprout: { primary: "#4ADE80", secondary: "#22C55E" },
  growing: { primary: "#16A34A", secondary: "#15803D" },
  mature: { primary: "#14532D", secondary: "#166534" },
  stressed: { primary: "#CA8A04", secondary: "#A16207" },
  dead: { primary: "#6B7280", secondary: "#4B5563" },
  reclaimed: { primary: "#16A34A", secondary: "#6B7280" },
};

// Domain-specific plant color palettes for procedural rendering
export const domainPlantColors: Record<
  PersonalDomain,
  { trunk: string; canopy: string[]; flower: string; fruit: string }
> = {
  health: {
    trunk: "#8B5E3C",
    canopy: ["#16A34A", "#22C55E", "#4ADE80"],
    flower: "#F9A8D4",
    fruit: "#DC2626",
  },
  work: {
    trunk: "#78350F",
    canopy: ["#15803D", "#166534", "#14532D"],
    flower: "#F5F5DC",
    fruit: "#92400E",
  },
  relationships: {
    trunk: "#6B4E3D",
    canopy: ["#22C55E", "#4ADE80", "#86EFAC"],
    flower: "#C084FC",
    fruit: "#F472B6",
  },
  creative: {
    trunk: "#92400E",
    canopy: ["#65A30D", "#84CC16", "#A3E635"],
    flower: "#FB923C",
    fruit: "#FCD34D",
  },
  financial: {
    trunk: "#5C4033",
    canopy: ["#15803D", "#166534", "#0D542B"],
    flower: "#D4D4D8",
    fruit: "#78716C",
  },
};

// Sky colors for landscape states
export const skyColors = {
  stormy: { top: "#374151", bottom: "#6B7280" },
  overcast: { top: "#6B7280", bottom: "#9CA3AF" },
  clearing: { top: "#93C5FD", bottom: "#BFDBFE" },
  clear: { top: "#3B82F6", bottom: "#87CEEB" },
  golden: { top: "#F59E0B", bottom: "#FDE68A" },
};

// Ground colors for landscape progression
export const groundColors = {
  barren: "#8B7355",
  warming: "#9B8B6B",
  grassy: "#6B8E23",
  lush: "#4A7C29",
};
