export const statusColors = {
  verified: "#1a5f4a",
  declared: "#2563eb",
  degraded: "#b45309",
  violated: "#b91c1c",
  unverifiable: "#7c3aed",
} as const;

export const statusBgColors = {
  verified: "#ecfdf5",
  declared: "#eff6ff",
  degraded: "#fffbeb",
  violated: "#fef2f2",
  unverifiable: "#f5f3ff",
} as const;

export const agentColors: Record<string, string> = {
  legislator: "#1e40af",
  utility: "#2563eb",
  regulator: "#7c3aed",
  community: "#059669",
  auditor: "#d97706",
  provider: "#dc2626",
  stakeholder: "#6b7280",
  certifier: "#0891b2",
  brand: "#db2777",
  monitor: "#4f46e5",
  "team-member": "#2563eb",
} as const;

export const hb2021DomainColors: Record<string, string> = {
  Emissions: "#dc2626",
  Planning: "#2563eb",
  Verification: "#7c3aed",
  Equity: "#059669",
  Affordability: "#d97706",
  Tribal: "#9333ea",
  Workforce: "#0891b2",
} as const;

export const skyColors = {
  lightest: "#E0F6FF",
  light: "#B3E5FC",
  medium: "#87CEEB",
  accent: "#4A90D9",
  dark: "#1a1a2e",
  darkAccent: "#2d2d44",
} as const;

export const jcpoaDomainColors: Record<string, string> = {
  Enrichment: "#dc2626",
  Facilities: "#b45309",
  Verification: "#7c3aed",
  Sanctions: "#2563eb",
  Cooperation: "#059669",
  Governance: "#0891b2",
} as const;

export const issDomainColors: Record<string, string> = {
  "Crew Safety": "#dc2626",
  Resupply: "#2563eb",
  "Crew Transport": "#7c3aed",
  "Station Maintenance": "#d97706",
  Research: "#059669",
  Deorbit: "#1a1a2e",
  Transition: "#0891b2",
  Funding: "#78350f",
  "Orbital Operations": "#9333ea",
} as const;

export const dashboardThemes = {
  hb2021: { bg: "#faf9f6", accent: "#1a5f4a" },
  ai: { bg: "#f5f0eb", accent: "#1a1a2e" },
  infrastructure: { bg: "#0f1419", accent: "#00d4aa" },
  supplyChain: { bg: "#faf9f6", accent: "#2d5016" },
  jcpoa: { bg: "#f5f0eb", accent: "#991b1b" },
  iss: { bg: "#f0f4f8", accent: "#1d4ed8" },
} as const;

export function getStatusColor(status: string): string {
  return statusColors[status as keyof typeof statusColors] || "#6b7280";
}

export function getStatusBgColor(status: string): string {
  return statusBgColors[status as keyof typeof statusBgColors] || "#f3f4f6";
}

// ── RPN priority colors (for pulse border on reduced-motion) ──
export const rpnColors = {
  critical: "#991b1b",
  high: "#78350f",
  medium: "#1e40af",
  low: "#1a5f4a",
} as const;

// ── Incentive compatibility colors ──
export const incentiveColors = {
  yes: "#1a5f4a",
  partial: "#78350f",
  no: "#991b1b",
} as const;

// ── Cascade ripple colors ──
export const cascadeRippleColors = {
  depth1: "hsla(40, 80%, 50%, 0.6)",
  depth2: "hsla(25, 80%, 50%, 0.4)",
  depth3: "hsla(10, 80%, 50%, 0.25)",
  depth4: "hsla(0, 80%, 45%, 0.15)",
} as const;

// ── Status color RGB values (for glow filters) ──
export const statusColorRgb: Record<string, string> = {
  verified: "26, 95, 74",
  declared: "37, 99, 235",
  degraded: "180, 83, 9",
  violated: "185, 28, 28",
  unverifiable: "124, 58, 237",
} as const;

export function getDomainColor(domain: string, vertical: string = "hb2021"): string {
  if (vertical === "hb2021") {
    return hb2021DomainColors[domain] || "#6b7280";
  }
  if (vertical === "jcpoa") {
    return jcpoaDomainColors[domain] || "#6b7280";
  }
  if (vertical === "iss") {
    return issDomainColors[domain] || "#6b7280";
  }
  return "#6b7280";
}
