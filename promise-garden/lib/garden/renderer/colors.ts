import type { PersonalDomain } from "../../types/personal";

// ─── DOMAIN PALETTES ───

export interface DomainPalette {
  trunk: string[];     // 2–3 bark colors for trunk texture variation
  leaf: string[];      // 3–4 leaf greens (domain-specific hue)
  flower: string[];    // 0–4 flower colors (empty for work/financial)
  accent: string;      // Fruit/highlight color
  deadTrunk: string;   // Grey for dead state
  deadBranch: string;  // Lighter grey for dead branches
}

export const DOMAIN_PALETTES: Record<PersonalDomain, DomainPalette> = {
  health: {
    trunk: ["#5D4037", "#6D4C41", "#4E342E"],
    leaf: ["#2E7D32", "#43A047", "#66BB6A", "#81C784"],
    flower: ["#EF5350", "#E53935", "#F44336"],
    accent: "#C62828",
    deadTrunk: "#9E9E9E",
    deadBranch: "#BDBDBD",
  },
  work: {
    trunk: ["#4E342E", "#3E2723", "#5D4037"],
    leaf: ["#1B5E20", "#2E7D32", "#388E3C", "#4CAF50"],
    flower: [],
    accent: "#33691E",
    deadTrunk: "#9E9E9E",
    deadBranch: "#BDBDBD",
  },
  relationships: {
    trunk: ["#5D4037", "#6D4C41", "#795548"],
    leaf: ["#388E3C", "#43A047", "#4CAF50"],
    flower: ["#EC407A", "#F48FB1", "#CE93D8", "#E91E63"],
    accent: "#AD1457",
    deadTrunk: "#9E9E9E",
    deadBranch: "#BDBDBD",
  },
  creative: {
    trunk: ["#6D4C41", "#8D6E63", "#A1887F"],
    leaf: ["#00695C", "#00897B", "#26A69A", "#4DB6AC"],
    flower: ["#7E57C2", "#9575CD", "#B39DDB"],
    accent: "#4527A0",
    deadTrunk: "#9E9E9E",
    deadBranch: "#BDBDBD",
  },
  financial: {
    trunk: ["#4E342E", "#3E2723", "#5D4037"],
    leaf: ["#1B5E20", "#2E7D32", "#33691E", "#558B2F"],
    flower: [],
    accent: "#827717",
    deadTrunk: "#9E9E9E",
    deadBranch: "#BDBDBD",
  },
};

// ─── RGB HELPERS ───

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRGB(hex: string): RGB {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Apply stress desaturation to a hex color.
 * stressLevel 0 = full color. stressLevel 1 = 70% towards greyscale.
 */
export function desaturateForStress(hex: string, stressLevel: number): RGB {
  const { r, g, b } = hexToRGB(hex);
  const gray = (r + g + b) / 3;
  const desat = stressLevel * 0.7;
  return {
    r: Math.round(r + (gray - r) * desat),
    g: Math.round(g + (gray - g) * desat),
    b: Math.round(b + (gray - b) * desat),
  };
}

/**
 * Shift leaf color toward amber/brown as it falls.
 * fallProgress 0 = just detached (original color).
 * fallProgress 1 = on the ground (dead-leaf brown).
 */
export function getLeafFallColor(originalHex: string, fallProgress: number): string {
  const original = hexToRGB(originalHex);
  // Dead-leaf brown
  const autumn: RGB = { r: 0x8b, g: 0x73, b: 0x55 };
  const r = Math.round(original.r + (autumn.r - original.r) * fallProgress);
  const g = Math.round(original.g + (autumn.g - original.g) * fallProgress);
  const b = Math.round(original.b + (autumn.b - original.b) * fallProgress);
  return rgbToHex({ r, g, b });
}

/**
 * Interpolate between two RGB colors.
 * t=0 returns a, t=1 returns b.
 */
export function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

/**
 * Apply streak glow: lighten a color slightly.
 * Used when consecutiveKept >= 3 to show the plant is thriving.
 */
export function applyStreakGlow(rgb: RGB, intensity: number): RGB {
  const amt = Math.min(intensity * 0.3, 0.3);
  return {
    r: Math.round(Math.min(255, rgb.r + (255 - rgb.r) * amt)),
    g: Math.round(Math.min(255, rgb.g + (255 - rgb.g) * amt)),
    b: Math.round(Math.min(255, rgb.b + (255 - rgb.b) * amt)),
  };
}
