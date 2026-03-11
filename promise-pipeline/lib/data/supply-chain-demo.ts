import { Agent, Promise, Insight, DashboardData } from "../types/promise";

export const SC_AGENTS: Agent[] = [
  { id: "brand-a", name: "Global Apparel Co.", type: "brand", short: "GAC" },
  { id: "brand-b", name: "Electronics Corp.", type: "brand", short: "ELC" },
  { id: "tier1-textiles", name: "Tier 1 — TextileCo", type: "provider", short: "T1T" },
  { id: "tier1-assembly", name: "Tier 1 — AssemblyCo", type: "provider", short: "T1A" },
  { id: "tier2-cotton", name: "Tier 2 — CottonFarm", type: "provider", short: "T2C" },
  { id: "tier2-minerals", name: "Tier 2 — MineralSource", type: "provider", short: "T2M" },
  { id: "certifier-fsc", name: "Fair Trade Certified", type: "certifier", short: "FTC" },
  { id: "consumers", name: "Consumers", type: "community", short: "CON" },
  { id: "workers-sc", name: "Supply Chain Workers", type: "community", short: "WRK" },
];

export const SC_PROMISES: Promise[] = [
  { id: "SC-001", promiser: "brand-a", promisee: "consumers", body: "100% sustainably sourced cotton by 2027", domain: "Sustainability", status: "degraded", progress: 62, required: 100, target: "2027-12-31", note: "62% sourced sustainably. Rate of progress slowing.", verification: { method: "audit", source: "Fair Trade Certified", frequency: "annual" }, depends_on: ["SC-005"] },
  { id: "SC-002", promiser: "brand-a", promisee: "workers-sc", body: "Living wage for all Tier 1 supplier workers", domain: "Labor", status: "degraded", note: "60% of Tier 1 workers at living wage. Gap in southeast Asia facilities.", verification: { method: "audit", source: "Fair Labor Association", frequency: "annual" }, depends_on: ["SC-006"] },
  { id: "SC-003", promiser: "brand-b", promisee: "consumers", body: "Conflict-free mineral sourcing", domain: "Ethics", status: "declared", note: "Policy published. Third-party audit not yet completed.", verification: { method: "audit", source: "Responsible Minerals Initiative" }, depends_on: ["SC-008"] },
  { id: "SC-004", promiser: "brand-a", promisee: "consumers", body: "Full supply chain traceability by 2026", domain: "Transparency", status: "violated", target: "2026-12-31", progress: 34, required: 100, note: "Only 34% of supply chain mapped. Tier 2+ remains opaque.", verification: { method: "self-report" }, depends_on: ["SC-005", "SC-006"] },
  { id: "SC-005", promiser: "tier1-textiles", promisee: "brand-a", body: "Source only certified sustainable cotton", domain: "Sustainability", status: "degraded", progress: 75, required: 100, note: "75% certified. Remaining 25% from uncertified sources during shortage.", verification: { method: "audit", source: "Fair Trade Certified" }, depends_on: ["SC-009"] },
  { id: "SC-006", promiser: "tier1-textiles", promisee: "brand-a", body: "Disclose all Tier 2 suppliers", domain: "Transparency", status: "degraded", note: "Major suppliers disclosed. Subcontractors often undisclosed.", verification: { method: "self-report" }, depends_on: [] },
  { id: "SC-007", promiser: "tier1-assembly", promisee: "brand-b", body: "Zero child labor in assembly facilities", domain: "Labor", status: "verified", note: "Third-party audits confirm compliance.", verification: { method: "audit", source: "SA8000 Certification", frequency: "annual" }, depends_on: [] },
  { id: "SC-008", promiser: "tier2-minerals", promisee: "tier1-assembly", body: "Provide conflict-free mineral certificates", domain: "Ethics", status: "declared", note: "Certificates provided but sourcing chain not independently verified.", verification: { method: "self-report" }, depends_on: [] },
  { id: "SC-009", promiser: "tier2-cotton", promisee: "tier1-textiles", body: "Organic and fair trade cotton production", domain: "Sustainability", status: "verified", note: "Certified by Fair Trade International.", verification: { method: "audit", source: "Fair Trade International", frequency: "annual" }, depends_on: [] },
  { id: "SC-010", promiser: "certifier-fsc", promisee: "consumers", body: "Independent verification of sustainability claims", domain: "Verification", status: "verified", note: "Operating as independent third-party certifier.", verification: { method: "audit" }, depends_on: [] },
  { id: "SC-011", promiser: "brand-a", promisee: "consumers", body: "Net zero Scope 3 emissions by 2030", domain: "Emissions", status: "declared", target: "2030-12-31", note: "Target set. No interim milestones published.", verification: { method: "self-report" }, depends_on: ["SC-001", "SC-004"] },
  { id: "SC-012", promiser: "brand-b", promisee: "consumers", body: "Zero deforestation supply chain by 2025", domain: "Sustainability", status: "violated", target: "2025-12-31", note: "Deadline passed. Deforestation still detected in palm oil supply chain.", verification: { method: "audit", source: "Global Forest Watch" }, depends_on: [] },
];

export const SC_INSIGHTS: Insight[] = [
  { severity: "critical", type: "Cascade", title: "Tier 2 opacity blocks brand-level promises", body: "Brand-level sustainability and traceability promises depend on Tier 1 suppliers who depend on Tier 2 sources. When Tier 2 is opaque (SC-006), every downstream promise is structurally unverifiable.", promises: ["SC-004", "SC-006", "SC-005"] },
  { severity: "warning", type: "Gap", title: "Self-reported claims dominate ethics promises", body: "Conflict-free sourcing (SC-003) and Scope 3 emissions (SC-011) are self-assessed against self-selected metrics. Only 6% of companies have end-to-end supply chain visibility.", promises: ["SC-003", "SC-011", "SC-008"] },
  { severity: "positive", type: "Working", title: "Independent certification creates real accountability", body: "Where third-party certifiers operate (Fair Trade, SA8000), promise verification is credible. The pattern: independent verification > self-reporting.", promises: ["SC-009", "SC-010", "SC-007"] },
];

export const SC_DASHBOARD: DashboardData = {
  title: "Supply Chain Transparency",
  subtitle: "Corporate Supply Chain Promise Network Analysis",
  agents: SC_AGENTS,
  promises: SC_PROMISES,
  domains: [
    { name: "Sustainability", color: "#059669", promiseCount: 4, healthScore: 48 },
    { name: "Labor", color: "#dc2626", promiseCount: 2, healthScore: 65 },
    { name: "Ethics", color: "#7c3aed", promiseCount: 2, healthScore: 60 },
    { name: "Transparency", color: "#2563eb", promiseCount: 2, healthScore: 15 },
    { name: "Verification", color: "#d97706", promiseCount: 1, healthScore: 100 },
    { name: "Emissions", color: "#0891b2", promiseCount: 1, healthScore: 60 },
  ],
  insights: SC_INSIGHTS,
  trajectories: [],
  grade: "C",
  gradeExplanation: "Independent certification works where it exists. Self-reported claims and Tier 2 opacity undermine most brand-level commitments.",
};
