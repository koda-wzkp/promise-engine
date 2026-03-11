import { PromiseStatus } from "../types/promise";

export const statusColors: Record<PromiseStatus, string> = {
  verified: "#1a5f4a",
  declared: "#2563eb",
  degraded: "#b45309",
  violated: "#b91c1c",
  unverifiable: "#7c3aed",
};

export const statusBgColors: Record<PromiseStatus, string> = {
  verified: "#ecfdf5",
  declared: "#eff6ff",
  degraded: "#fffbeb",
  violated: "#fef2f2",
  unverifiable: "#f5f3ff",
};

export const statusLabels: Record<PromiseStatus, string> = {
  verified: "Verified",
  declared: "Declared",
  degraded: "Degraded",
  violated: "Violated",
  unverifiable: "Unverifiable",
};

export const agentColors: Record<string, string> = {
  legislator: "#1e40af",
  utility: "#2563eb",
  regulator: "#7c3aed",
  community: "#059669",
  auditor: "#d97706",
  provider: "#dc2626",
  stakeholder: "#6b7280",
  certifier: "#0891b2",
  brand: "#9333ea",
  monitor: "#64748b",
};

export const hb2021DomainColors: Record<string, string> = {
  Emissions: "#dc2626",
  Planning: "#2563eb",
  Verification: "#7c3aed",
  Equity: "#059669",
  Affordability: "#d97706",
  Tribal: "#9333ea",
  Workforce: "#0891b2",
};

export const skyColors = {
  lightest: "#E0F6FF",
  light: "#B3E5FC",
  medium: "#87CEEB",
  accent: "#4A90D9",
  dark: "#1a1a2e",
  darkAccent: "#2d2d44",
};

export const dashboardThemes = {
  hb2021: { bg: "#faf9f6", accent: "#1a5f4a" },
  ai: { bg: "#f5f0eb", accent: "#1a1a2e" },
  infrastructure: { bg: "#0f1419", accent: "#00d4aa" },
  supplyChain: { bg: "#faf9f6", accent: "#2d5016" },
};

// Status health weights for network health calculation
export const statusWeights: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
};
