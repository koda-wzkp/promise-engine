import { PromiseStatus } from "../types/promise";

export const statusColors: Record<PromiseStatus, string> = {
  // Base statuses (HB 2021) — WCAG AAA 7:1 on respective backgrounds
  verified: "#1a5f4a",
  declared: "#1e40af",
  degraded: "#78350f",
  violated: "#991b1b",
  unverifiable: "#5b21b6",
  // Extended statuses (ACA) — WCAG AAA 7:1 on respective backgrounds
  kept: "#14532d",
  broken: "#991b1b",
  partial: "#78350f",
  delayed: "#713f12",
  modified: "#1e40af",
  legally_challenged: "#5b21b6",
  repealed: "#374151",
};

export const statusBgColors: Record<PromiseStatus, string> = {
  verified: "#ecfdf5",
  declared: "#eff6ff",
  degraded: "#fffbeb",
  violated: "#fef2f2",
  unverifiable: "#f5f3ff",
  kept: "#f0fdf4",
  broken: "#fef2f2",
  partial: "#fffbeb",
  delayed: "#fefce8",
  modified: "#eff6ff",
  legally_challenged: "#f5f3ff",
  repealed: "#f3f4f6",
};

export const statusLabels: Record<PromiseStatus, string> = {
  verified: "Verified",
  declared: "Declared",
  degraded: "Degraded",
  violated: "Violated",
  unverifiable: "Unverifiable",
  kept: "Kept",
  broken: "Broken",
  partial: "Partial",
  delayed: "Delayed",
  modified: "Modified",
  legally_challenged: "Challenged",
  repealed: "Repealed",
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
  executive: "#1e3a5f",
  insurer: "#0e7490",
  judiciary: "#6d28d9",
  federal: "#1e40af",
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

export const acaDomainColors: Record<string, string> = {
  "Coverage Expansion": "#15803d",
  "Insurance Market Reform": "#0e7490",
  "Affordability & Subsidies": "#d97706",
  "Medicare & Medicaid": "#7c3aed",
  "Delivery System Reform": "#2563eb",
  "Public Health & Prevention": "#059669",
  "Consumer Protections": "#0891b2",
  "Employer Requirements": "#b45309",
  "Political & Legal Challenges": "#dc2626",
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
  aca: { bg: "#f8fafc", accent: "#1e40af" },
};

// Status health weights for network health calculation
export const statusWeights: Record<PromiseStatus, number> = {
  verified: 100,
  declared: 60,
  degraded: 30,
  violated: 0,
  unverifiable: 20,
  kept: 100,
  broken: 0,
  partial: 50,
  delayed: 40,
  modified: 55,
  legally_challenged: 25,
  repealed: 0,
};
