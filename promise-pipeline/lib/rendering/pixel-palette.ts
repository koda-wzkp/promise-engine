/**
 * Shared Pixel Art Palette — Status color ramps, terrain, sky, and wood colors.
 *
 * Each status has a 4-color ramp (shadow → mid → light → highlight).
 * All pixel art uses only these ramps plus shared terrain/UI colors.
 * This constraint is what makes it feel like pixel art rather than
 * downscaled vector graphics.
 */

export const pixelPalettes = {
  verified: {
    shadow: "#0f3d2e",
    mid: "#1a5f4a",
    light: "#2d8a6a",
    highlight: "#4aba8a",
  },
  degraded: {
    shadow: "#4a2106",
    mid: "#78350f",
    light: "#a65d1a",
    highlight: "#d4922e",
  },
  violated: {
    shadow: "#5c0e0e",
    mid: "#991b1b",
    light: "#c53030",
    highlight: "#e25555",
  },
  unverifiable: {
    shadow: "#3b1080",
    mid: "#5b21b6",
    light: "#7c3aed",
    highlight: "#a78bfa",
  },
  declared: {
    shadow: "#122b6e",
    mid: "#1e40af",
    light: "#3b6ce8",
    highlight: "#6b9cf0",
  },
  terrain: {
    dirt: "#8B7355",
    grass: "#5a7247",
    stone: "#7a7a7a",
    deepStone: "#4a4a4a",
    sand: "#c2b280",
    water: "#3b7dd8",
    waterDeep: "#1e4f8a",
    waterFoam: "#a8d4f0",
  },
  sky: {
    clear: "#87CEEB",
    clearLight: "#E0F6FF",
    overcast: "#9ca3af",
    stormy: "#4b5563",
  },
  wood: {
    trunk: "#5c3d2e",
    trunkDark: "#3d2519",
    bark: "#7a5540",
    branch: "#6b4530",
  },
} as const;

export type StatusPalette = {
  shadow: string;
  mid: string;
  light: string;
  highlight: string;
};

export function getStatusPalette(status: string): StatusPalette {
  return (
    pixelPalettes[status as keyof typeof pixelPalettes] as StatusPalette ??
    pixelPalettes.declared
  );
}
