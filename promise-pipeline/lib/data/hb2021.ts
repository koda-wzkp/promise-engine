import { Agent, Promise, Insight, Trajectory, Domain } from "../types/promise";
import { DashboardData } from "../types/promise";
import { hb2021DomainColors } from "../utils/colors";

// ─── AGENTS ───
// 11 agents mapped from the statutory text of Oregon HB 2021
export const HB2021_AGENTS: Agent[] = [
  { id: "or-legislature", name: "Oregon Legislature", type: "legislator", short: "LEG" },
  { id: "pge", name: "Portland General Electric", type: "utility", short: "PGE" },
  { id: "pacificorp", name: "PacifiCorp / Pacific Power", type: "utility", short: "PAC" },
  { id: "or-deq", name: "Oregon DEQ", type: "regulator", short: "DEQ" },
  { id: "or-puc", name: "Oregon PUC", type: "regulator", short: "PUC" },
  { id: "ess", name: "Electricity Service Suppliers", type: "utility", short: "ESS" },
  { id: "ej-communities", name: "Environmental Justice Communities", type: "community", short: "EJ" },
  { id: "ratepayers", name: "Oregon Ratepayers", type: "community", short: "RP" },
  { id: "tribes", name: "Federally Recognized Tribes", type: "community", short: "TRB" },
  { id: "workers", name: "Clean Energy Workforce", type: "community", short: "WRK" },
  { id: "cub", name: "Citizens' Utility Board", type: "auditor", short: "CUB" },
];

// ─── PROMISES ───
// 20 promises decomposed from Oregon HB 2021.
// Each promise has depends_on edges with comments explaining the dependency.
export const HB2021_PROMISES: Promise[] = [
  {
    id: "P001",
    ref: "§3(1)(a)",
    promiser: "pge",
    promisee: "ratepayers",
    body: "Reduce GHG emissions 80% below baseline by 2030",
    domain: "Emissions",
    status: "degraded",
    target: "2030-12-31",
    progress: 27,
    required: 80,
    note: "27% below baseline as of 2022. Must reach 80% by 2030. On track but questions remain about Colstrip, gas plants, and market accounting.",
    verification: { method: "audit", source: "Oregon DEQ", metric: "emissions_reduction_pct", threshold: { operator: ">=", value: 80 }, frequency: "annual" },
    // PGE's emissions reduction depends on having an approved clean energy plan (P008)
    // and on DEQ's verification infrastructure being in place (P010)
    depends_on: ["P008", "P010"],
  },
  {
    id: "P002",
    ref: "§3(1)(b)",
    promiser: "pge",
    promisee: "ratepayers",
    body: "Reduce GHG emissions 90% below baseline by 2035",
    domain: "Emissions",
    status: "declared",
    target: "2035-12-31",
    progress: 27,
    required: 90,
    note: "Depends on P001 trajectory.",
    verification: { method: "audit", source: "Oregon DEQ", metric: "emissions_reduction_pct", threshold: { operator: ">=", value: 90 }, frequency: "annual" },
    // Sequential: must hit 2030 target before 2035 target
    depends_on: ["P001"],
  },
  {
    id: "P003",
    ref: "§3(1)(c)",
    promiser: "pge",
    promisee: "ratepayers",
    body: "100% clean electricity by 2040",
    domain: "Emissions",
    status: "declared",
    target: "2040-12-31",
    progress: 27,
    required: 100,
    note: "Terminal target. Depends on full cascade.",
    verification: { method: "audit", source: "Oregon DEQ", metric: "emissions_reduction_pct", threshold: { operator: ">=", value: 100 }, frequency: "annual" },
    // Sequential: must hit 2035 target before 2040
    depends_on: ["P002"],
  },
  {
    id: "P004",
    ref: "§3(1)(a)",
    promiser: "pacificorp",
    promisee: "ratepayers",
    body: "Reduce GHG emissions 80% below baseline by 2030",
    domain: "Emissions",
    status: "violated",
    target: "2030-12-31",
    progress: 13,
    required: 80,
    note: "Only 13% below baseline. Canceled 1.5GW renewables. Coal-to-gas conversion. Clean Energy Plan rejected by PUC.",
    verification: { method: "audit", source: "Oregon DEQ", metric: "emissions_reduction_pct", threshold: { operator: ">=", value: 80 }, frequency: "annual" },
    // PacifiCorp's emissions depend on having an approved plan (P009, which is violated)
    // and DEQ verification (P010)
    depends_on: ["P009", "P010"],
  },
  {
    id: "P005",
    ref: "§3(1)(b)",
    promiser: "pacificorp",
    promisee: "ratepayers",
    body: "Reduce GHG emissions 90% below baseline by 2035",
    domain: "Emissions",
    status: "violated",
    target: "2035-12-31",
    progress: 13,
    required: 90,
    note: "Dependent on P004. Current trajectory far short.",
    verification: { method: "audit", source: "Oregon DEQ", metric: "emissions_reduction_pct", threshold: { operator: ">=", value: 90 }, frequency: "annual" },
    depends_on: ["P004"],
  },
  {
    id: "P006",
    ref: "§3(1)(c)",
    promiser: "pacificorp",
    promisee: "ratepayers",
    body: "100% clean electricity by 2040",
    domain: "Emissions",
    status: "violated",
    target: "2040-12-31",
    progress: 13,
    required: 100,
    note: "Entire PacifiCorp chain at risk.",
    verification: { method: "audit", source: "Oregon DEQ", metric: "emissions_reduction_pct", threshold: { operator: ">=", value: 100 }, frequency: "annual" },
    depends_on: ["P005"],
  },
  {
    id: "P007",
    ref: "§3(1)",
    promiser: "ess",
    promisee: "ratepayers",
    body: "Meet same clean energy targets (80/90/100%)",
    domain: "Emissions",
    status: "declared",
    target: "2040-12-31",
    note: "Lighter oversight. No Clean Energy Plan required.",
    verification: { method: "self-report", frequency: "annual" },
    // ESS targets depend on DEQ verification infrastructure
    depends_on: ["P010"],
  },
  {
    id: "P008",
    ref: "§4(1-2)",
    promiser: "pge",
    promisee: "or-puc",
    body: "Submit Clean Energy Plan with each IRP",
    domain: "Planning",
    status: "degraded",
    note: "Partially accepted Jan 2024. Short-term ok, long-term revisions needed.",
    verification: { method: "filing", source: "Oregon PUC", frequency: "biennial" },
    // PGE's plan should incorporate tribal consultation input
    depends_on: ["P018"],
  },
  {
    id: "P009",
    ref: "§4(1-2)",
    promiser: "pacificorp",
    promisee: "or-puc",
    body: "Submit Clean Energy Plan with each IRP",
    domain: "Planning",
    status: "violated",
    note: "Clean Energy Plan fully rejected by PUC.",
    verification: { method: "filing", source: "Oregon PUC", frequency: "biennial" },
    // PacifiCorp's plan should incorporate tribal consultation input
    depends_on: ["P018"],
  },
  {
    id: "P010",
    ref: "§5(1)",
    promiser: "or-deq",
    promisee: "or-puc",
    body: "Verify emissions and establish baselines",
    domain: "Verification",
    status: "verified",
    note: "DEQ has published verification orders for both utilities.",
    verification: { method: "filing", source: "Oregon DEQ", frequency: "annual" },
    // No upstream dependencies — DEQ acts independently
    depends_on: [],
  },
  {
    id: "P011",
    ref: "§5(2)",
    promiser: "or-puc",
    promisee: "ratepayers",
    body: "Acknowledge CEPs only if in public interest",
    domain: "Verification",
    status: "verified",
    note: "PUC exercised authority: partially accepted PGE, rejected PacifiCorp.",
    verification: { method: "filing", source: "Oregon PUC", frequency: "as-needed" },
    // PUC review depends on DEQ providing verified emissions data
    depends_on: ["P010"],
  },
  {
    id: "P012",
    ref: "§2(4)",
    promiser: "or-legislature",
    promisee: "ej-communities",
    body: "Minimize burdens for environmental justice communities",
    domain: "Equity",
    status: "unverifiable",
    note: "Policy declaration. No measurable standard or verification mechanism.",
    verification: { method: "none" },
    // Equity outcomes depend on the clean energy transition actually proceeding
    // (PGE and PAC emissions targets) and advisory groups operating (P014, P015)
    depends_on: ["P014", "P015"],
  },
  {
    id: "P013",
    ref: "§2(2)",
    promiser: "or-legislature",
    promisee: "workers",
    body: "Create living wage jobs and promote workforce equity",
    domain: "Equity",
    status: "unverifiable",
    note: "Qualified 'to the maximum extent practicable.' No standard defined.",
    verification: { method: "none" },
    // Workforce development depends on the transition proceeding (plans approved)
    // and labor standards being applied (P019)
    depends_on: ["P019"],
  },
  {
    id: "P014",
    ref: "§6(1)",
    promiser: "pge",
    promisee: "ej-communities",
    body: "Convene Community Benefits Advisory Group",
    domain: "Equity",
    status: "verified",
    note: "UCBIAG convened. Biennial reports filed.",
    verification: { method: "filing", source: "Oregon PUC", frequency: "biennial" },
    depends_on: [],
  },
  {
    id: "P015",
    ref: "§6(1)",
    promiser: "pacificorp",
    promisee: "ej-communities",
    body: "Convene Community Benefits Advisory Group",
    domain: "Equity",
    status: "verified",
    note: "UCBIAG convened.",
    verification: { method: "filing", source: "Oregon PUC", frequency: "biennial" },
    depends_on: [],
  },
  {
    id: "P016",
    ref: "§4(4)(f)",
    promiser: "pge",
    promisee: "ratepayers",
    body: "Affordable, reliable, clean electric system",
    domain: "Affordability",
    status: "degraded",
    note: "Significant rate increases. Residential bills reportedly doubled 2023→2024.",
    verification: { method: "filing", source: "Oregon PUC", metric: "rate_impact_pct", threshold: { operator: "<=", value: 6 }, frequency: "annual" },
    // Affordability is affected by the cost of clean energy compliance
    // Structural conflict with emissions targets — not a dependency but a tension
    depends_on: [],
  },
  {
    id: "P017",
    ref: "§4(4)(f)",
    promiser: "pacificorp",
    promisee: "ratepayers",
    body: "Affordable, reliable, clean electric system",
    domain: "Affordability",
    status: "degraded",
    note: "Wildfire liabilities constraining finances.",
    verification: { method: "filing", source: "Oregon PUC", metric: "rate_impact_pct", threshold: { operator: "<=", value: 6 }, frequency: "annual" },
    depends_on: [],
  },
  {
    id: "P018",
    ref: "§2(3)",
    promiser: "or-legislature",
    promisee: "tribes",
    body: "Meaningful tribal consultation on energy facility siting",
    domain: "Tribal",
    status: "unverifiable",
    note: "Policy promise with no compliance standard.",
    verification: { method: "none" },
    depends_on: [],
  },
  {
    id: "P019",
    ref: "§26",
    promiser: "or-legislature",
    promisee: "workers",
    body: "Responsible contractor standards for ≥10MW projects",
    domain: "Workforce",
    status: "declared",
    note: "Sub-10MW projects have no workforce protections.",
    verification: { method: "filing", source: "Oregon PUC", frequency: "per-project" },
    // Labor standards apply to projects arising from the clean energy transition
    // so they depend on plans being approved and projects proceeding
    depends_on: ["P008", "P009"],
  },
  {
    id: "P020",
    ref: "§18",
    promiser: "or-deq",
    promisee: "or-legislature",
    body: "Report on small-scale renewables by Sep 2022",
    domain: "Planning",
    status: "verified",
    target: "2022-09-30",
    progress: 100,
    required: 100,
    note: "Completed and delivered.",
    verification: { method: "filing", source: "Oregon DEQ", frequency: "one-time" },
    depends_on: [],
  },
];

// ─── TRAJECTORIES ───
export const HB2021_TRAJECTORIES: Trajectory[] = [
  {
    agentId: "pge",
    label: "Portland General Electric",
    data: [
      { year: 2012, actual: 0 },
      { year: 2018, actual: 15 },
      { year: 2020, actual: 22 },
      { year: 2022, actual: 27 },
      { year: 2026, projected: 45 },
      { year: 2030, target: 80, projected: 60 },
      { year: 2035, target: 90, projected: 78 },
      { year: 2040, target: 100, projected: 92 },
    ],
  },
  {
    agentId: "pacificorp",
    label: "PacifiCorp / Pacific Power",
    data: [
      { year: 2012, actual: 0 },
      { year: 2018, actual: 5 },
      { year: 2022, actual: 13 },
      { year: 2026, projected: 20 },
      { year: 2030, target: 80, projected: 32 },
      { year: 2035, target: 90, projected: 48 },
      { year: 2040, target: 100, projected: 62 },
    ],
  },
];

// ─── INSIGHTS ───
export const HB2021_INSIGHTS: Insight[] = [
  {
    severity: "critical",
    type: "Cascade",
    title: "PacifiCorp's entire promise chain is off track",
    body: "PacifiCorp's Clean Energy Plan was rejected by the PUC. Without an approved plan, the utility has no defined pathway to its 2030, 2035, or 2040 targets. Compounding factors: canceled 1.5GW of renewable procurement after wildfire liabilities, and a decision to convert coal plants to natural gas instead of renewables. At 13% emissions reduction (2022), PacifiCorp needs to cut another 67 percentage points in under 4 years to meet the 2030 target.",
    promises: ["P004", "P005", "P006", "P009"],
  },
  {
    severity: "critical",
    type: "Gap",
    title: "Equity promises have no accountability mechanism",
    body: "Three promises — to environmental justice communities (P012), workers (P013), and tribes (P018) — have no defined way to verify them. The law makes commitments to Oregon's most vulnerable populations but provides no measurable standard, no reporting requirement, and no compliance determination. The communities HB 2021 claims to protect have the least structured way to know if the promises are being kept.",
    promises: ["P012", "P013", "P018"],
  },
  {
    severity: "warning",
    type: "Conflict",
    title: "Clean energy targets vs. affordability: the law's built-in tension",
    body: "If cumulative rate increases from clean energy investments exceed 6% of annual revenue, the PUC must exempt utilities from further compliance (§10). Ratepayers report bills doubling. The 100%-by-2040 promise is conditional on the cost of keeping it — and the safety valve favors affordability over emissions. Both PGE and PacifiCorp's affordability promises (P016, P017) are degraded.",
    promises: ["P001", "P004", "P016", "P017"],
  },
  {
    severity: "positive",
    type: "Working",
    title: "The verification system caught the problem",
    body: "DEQ established baselines and verified emissions as required. The PUC exercised its authority — accepting PGE's plan partially and rejecting PacifiCorp's entirely. The accountability mechanism designed into HB 2021 is functioning. The law's oversight caught PacifiCorp's non-compliance. The open question is what happens next.",
    promises: ["P010", "P011"],
  },
];

// ─── DOMAINS ───
function computeDomainHealth(promises: Promise[], domain: string): number {
  const domainPromises = promises.filter((p) => p.domain === domain);
  if (domainPromises.length === 0) return 0;
  const weights: Record<string, number> = {
    verified: 100, declared: 60, degraded: 30, violated: 0, unverifiable: 20,
  };
  const total = domainPromises.reduce((sum, p) => sum + (weights[p.status] ?? 0), 0);
  return Math.round(total / domainPromises.length);
}

export const HB2021_DOMAINS: Domain[] = [
  "Emissions", "Planning", "Verification", "Equity", "Affordability", "Tribal", "Workforce",
].map((name) => ({
  name,
  color: hb2021DomainColors[name] ?? "#6b7280",
  promiseCount: HB2021_PROMISES.filter((p) => p.domain === name).length,
  healthScore: computeDomainHealth(HB2021_PROMISES, name),
}));

// ─── ASSEMBLED DASHBOARD ───
export const HB2021_DASHBOARD: DashboardData = {
  title: "Oregon HB 2021",
  subtitle: "100% Clean Electricity by 2040 — Promise Network Analysis",
  agents: HB2021_AGENTS,
  promises: HB2021_PROMISES,
  domains: HB2021_DOMAINS,
  insights: HB2021_INSIGHTS,
  trajectories: HB2021_TRAJECTORIES,
  grade: "C-",
  gradeExplanation:
    "7 of 20 promises are verified or on track. 4 are violated, 4 are degraded, 3 are unverifiable, and 2 are declared but unproven. The PacifiCorp cascade and equity verification gaps drive the low grade.",
};
