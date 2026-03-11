import { Agent, Promise, Insight, DashboardData } from "../types/promise";

export const AI_AGENTS: Agent[] = [
  { id: "openai", name: "OpenAI", type: "provider", short: "OAI" },
  { id: "anthropic", name: "Anthropic", type: "provider", short: "ANT" },
  { id: "deepmind", name: "Google DeepMind", type: "provider", short: "GDM" },
  { id: "meta-ai", name: "Meta AI", type: "provider", short: "MTA" },
  { id: "nist", name: "NIST AI Safety", type: "regulator", short: "NST" },
  { id: "eu-ai", name: "EU AI Act Authority", type: "regulator", short: "EUA" },
  { id: "users", name: "End Users", type: "community", short: "USR" },
  { id: "researchers", name: "AI Safety Researchers", type: "auditor", short: "RES" },
];

export const AI_PROMISES: Promise[] = [
  { id: "AI-001", promiser: "openai", promisee: "users", body: "Maintain hallucination rate below 3% on factual queries", domain: "Accuracy", status: "degraded", progress: 4.2, required: 3, note: "Rate drifted to 4.2% after latest model update. No public acknowledgment.", verification: { method: "benchmark", source: "Internal eval", metric: "hallucination_rate", threshold: { operator: "<=", value: 3 } }, depends_on: [] },
  { id: "AI-002", promiser: "anthropic", promisee: "users", body: "Harmful output rate below 0.1%", domain: "Safety", status: "verified", progress: 0.04, required: 0.1, note: "Consistently below threshold. Constitutional AI approach working.", verification: { method: "benchmark", source: "Internal + third-party", metric: "harmful_output_rate", threshold: { operator: "<=", value: 0.1 } }, depends_on: [] },
  { id: "AI-003", promiser: "deepmind", promisee: "eu-ai", body: "Comply with EU AI Act transparency requirements", domain: "Compliance", status: "declared", note: "Commitment made. Implementation pending Aug 2026 deadline.", verification: { method: "audit", source: "EU AI Act Authority", frequency: "annual" }, depends_on: [] },
  { id: "AI-004", promiser: "meta-ai", promisee: "users", body: "API response latency under 2 seconds (p95)", domain: "Performance", status: "violated", progress: 3.8, required: 2, note: "Latency consistently exceeds SLA. No remediation communicated.", verification: { method: "sensor", metric: "p95_latency_ms", threshold: { operator: "<=", value: 2000 } }, depends_on: [] },
  { id: "AI-005", promiser: "openai", promisee: "researchers", body: "Publish model cards for all production models", domain: "Transparency", status: "degraded", note: "Model cards published but incomplete. Missing bias evaluation data.", verification: { method: "self-report" }, depends_on: [] },
  { id: "AI-006", promiser: "anthropic", promisee: "researchers", body: "Publish safety benchmark results quarterly", domain: "Transparency", status: "verified", note: "Consistent quarterly publications.", verification: { method: "self-report", frequency: "quarterly" }, depends_on: [] },
  { id: "AI-007", promiser: "deepmind", promisee: "users", body: "No training on user conversations without consent", domain: "Privacy", status: "declared", note: "Policy stated. No independent verification.", verification: { method: "self-report" }, depends_on: [] },
  { id: "AI-008", promiser: "meta-ai", promisee: "researchers", body: "Open-source model weights for research", domain: "Openness", status: "verified", note: "Llama models released openly.", verification: { method: "self-report" }, depends_on: [] },
  { id: "AI-009", promiser: "nist", promisee: "users", body: "Publish AI safety evaluation framework", domain: "Compliance", status: "verified", note: "NIST AI RMF published and updated.", verification: { method: "filing", source: "NIST" }, depends_on: [] },
  { id: "AI-010", promiser: "eu-ai", promisee: "users", body: "Enforce AI Act penalties for non-compliance", domain: "Compliance", status: "declared", target: "2026-08-01", note: "Enforcement begins Aug 2026. Infrastructure being built.", verification: { method: "filing", source: "EU Commission" }, depends_on: [] },
  { id: "AI-011", promiser: "openai", promisee: "eu-ai", body: "Implement mandatory risk assessments for high-risk systems", domain: "Safety", status: "declared", note: "Compliance plans not yet public.", verification: { method: "audit", source: "EU AI Act Authority" }, depends_on: ["AI-010"] },
  { id: "AI-012", promiser: "anthropic", promisee: "users", body: "Maintain Constitutional AI alignment across model updates", domain: "Safety", status: "verified", note: "Alignment maintained through model generations.", verification: { method: "benchmark" }, depends_on: [] },
];

export const AI_INSIGHTS: Insight[] = [
  { severity: "warning", type: "Drift", title: "Safety commitments drift after model updates", body: "OpenAI's hallucination rate exceeded its stated threshold after a model update with no public acknowledgment. This pattern — commitments met at launch, degrading over time — is the central risk in AI safety accountability.", promises: ["AI-001", "AI-005"] },
  { severity: "critical", type: "Gap", title: "Transparency promises are self-assessed", body: "Most transparency commitments (model cards, safety reports) are self-reported by the providers themselves. No independent verification infrastructure exists.", promises: ["AI-005", "AI-007"] },
  { severity: "positive", type: "Working", title: "Constitutional AI demonstrates sustained safety", body: "Anthropic's harmful output rate remains well below threshold across model updates, suggesting architectural approaches to safety can be durable.", promises: ["AI-002", "AI-012"] },
];

export const AI_DASHBOARD: DashboardData = {
  title: "AI Safety Auditing",
  subtitle: "Promise Network Analysis — Major AI Providers",
  agents: AI_AGENTS,
  promises: AI_PROMISES,
  domains: [
    { name: "Accuracy", color: "#dc2626", promiseCount: 1, healthScore: 30 },
    { name: "Safety", color: "#059669", promiseCount: 3, healthScore: 73 },
    { name: "Compliance", color: "#2563eb", promiseCount: 3, healthScore: 73 },
    { name: "Transparency", color: "#7c3aed", promiseCount: 2, healthScore: 65 },
    { name: "Performance", color: "#d97706", promiseCount: 1, healthScore: 0 },
    { name: "Privacy", color: "#0891b2", promiseCount: 1, healthScore: 60 },
    { name: "Openness", color: "#9333ea", promiseCount: 1, healthScore: 100 },
  ],
  insights: AI_INSIGHTS,
  trajectories: [],
  grade: "C+",
  gradeExplanation: "Mixed results. Safety mechanisms work where they exist, but transparency and performance commitments are weak.",
};
