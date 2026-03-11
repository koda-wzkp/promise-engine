import { Agent, Promise, Insight, DashboardData } from "../types/promise";

export const INFRA_AGENTS: Agent[] = [
  { id: "aws", name: "Amazon Web Services", type: "provider", short: "AWS" },
  { id: "gcp", name: "Google Cloud Platform", type: "provider", short: "GCP" },
  { id: "azure", name: "Microsoft Azure", type: "provider", short: "AZR" },
  { id: "cloudflare", name: "Cloudflare", type: "provider", short: "CF" },
  { id: "datadog", name: "Datadog", type: "monitor", short: "DD" },
  { id: "enterprise", name: "Enterprise Customers", type: "stakeholder", short: "ENT" },
  { id: "sre-team", name: "SRE Teams", type: "auditor", short: "SRE" },
];

export const INFRA_PROMISES: Promise[] = [
  { id: "SLA-001", promiser: "aws", promisee: "enterprise", body: "99.99% uptime for S3 Standard", domain: "Uptime", status: "verified", progress: 99.995, required: 99.99, note: "Consistently exceeds SLA.", verification: { method: "sensor", source: "Independent monitors", metric: "uptime_pct", threshold: { operator: ">=", value: 99.99 } }, depends_on: [] },
  { id: "SLA-002", promiser: "aws", promisee: "enterprise", body: "99.9% uptime for EC2 single AZ", domain: "Uptime", status: "degraded", progress: 99.82, required: 99.9, note: "Two incidents in Q4 2025 brought below threshold.", verification: { method: "sensor", metric: "uptime_pct", threshold: { operator: ">=", value: 99.9 } }, depends_on: [] },
  { id: "SLA-003", promiser: "gcp", promisee: "enterprise", body: "99.95% uptime for Cloud Run", domain: "Uptime", status: "verified", progress: 99.97, required: 99.95, note: "Within SLA.", verification: { method: "sensor", metric: "uptime_pct", threshold: { operator: ">=", value: 99.95 } }, depends_on: [] },
  { id: "SLA-004", promiser: "azure", promisee: "enterprise", body: "99.99% uptime for Cosmos DB", domain: "Uptime", status: "verified", progress: 99.993, required: 99.99, note: "Meeting SLA.", verification: { method: "sensor", metric: "uptime_pct", threshold: { operator: ">=", value: 99.99 } }, depends_on: [] },
  { id: "SLA-005", promiser: "cloudflare", promisee: "enterprise", body: "100% uptime for CDN", domain: "Uptime", status: "degraded", progress: 99.98, required: 100, note: "Two brief outages. 100% SLA is aspirational.", verification: { method: "sensor", metric: "uptime_pct", threshold: { operator: ">=", value: 100 } }, depends_on: [] },
  { id: "SLA-006", promiser: "aws", promisee: "enterprise", body: "API latency under 100ms (p99)", domain: "Latency", status: "verified", progress: 78, required: 100, note: "Well within target.", verification: { method: "sensor", metric: "p99_latency_ms", threshold: { operator: "<=", value: 100 } }, depends_on: [] },
  { id: "SLA-007", promiser: "gcp", promisee: "enterprise", body: "BigQuery results under 30s for standard queries", domain: "Latency", status: "violated", progress: 45, required: 30, note: "Query times increasing with data volume. SLA breach pattern.", verification: { method: "sensor", metric: "query_time_s", threshold: { operator: "<=", value: 30 } }, depends_on: [] },
  { id: "SLA-008", promiser: "aws", promisee: "enterprise", body: "Data durability 99.999999999% (11 nines) for S3", domain: "Durability", status: "verified", note: "No known data loss events.", verification: { method: "audit", source: "AWS SOC2 report" }, depends_on: [] },
  { id: "SLA-009", promiser: "azure", promisee: "enterprise", body: "Data residency compliance for EU customers", domain: "Compliance", status: "verified", note: "EU data boundary controls deployed.", verification: { method: "audit", source: "Third-party compliance audit", frequency: "annual" }, depends_on: [] },
  { id: "SLA-010", promiser: "aws", promisee: "enterprise", body: "SLA credit within 60 days of approved claim", domain: "Remediation", status: "degraded", note: "Credits often delayed. Process friction reported.", verification: { method: "self-report" }, depends_on: ["SLA-002"] },
  { id: "SLA-011", promiser: "datadog", promisee: "sre-team", body: "Independent monitoring with 1-minute resolution", domain: "Monitoring", status: "verified", note: "Operating as expected.", verification: { method: "sensor" }, depends_on: [] },
  { id: "SLA-012", promiser: "cloudflare", promisee: "enterprise", body: "DDoS mitigation within 10 seconds", domain: "Security", status: "verified", note: "Automated mitigation consistently fast.", verification: { method: "sensor", metric: "mitigation_time_s", threshold: { operator: "<=", value: 10 } }, depends_on: [] },
];

export const INFRA_INSIGHTS: Insight[] = [
  { severity: "warning", type: "Gap", title: "SLA credits don't compensate actual losses", body: "Cloud SLA credits typically cover <1% of actual downtime costs. The remediation promise (SLA-010) is structurally inadequate even when honored.", promises: ["SLA-002", "SLA-010"] },
  { severity: "positive", type: "Working", title: "Independent monitoring enables promisee-side verification", body: "Datadog's independent monitoring allows customers to verify uptime claims without relying on provider self-reporting.", promises: ["SLA-011"] },
];

export const INFRA_DASHBOARD: DashboardData = {
  title: "Infrastructure SLA Auditing",
  subtitle: "Cloud Provider Promise Network Analysis",
  agents: INFRA_AGENTS,
  promises: INFRA_PROMISES,
  domains: [
    { name: "Uptime", color: "#059669", promiseCount: 5, healthScore: 72 },
    { name: "Latency", color: "#2563eb", promiseCount: 2, healthScore: 50 },
    { name: "Durability", color: "#7c3aed", promiseCount: 1, healthScore: 100 },
    { name: "Compliance", color: "#d97706", promiseCount: 1, healthScore: 100 },
    { name: "Remediation", color: "#dc2626", promiseCount: 1, healthScore: 30 },
    { name: "Monitoring", color: "#0891b2", promiseCount: 1, healthScore: 100 },
    { name: "Security", color: "#9333ea", promiseCount: 1, healthScore: 100 },
  ],
  insights: INFRA_INSIGHTS,
  trajectories: [],
  grade: "B-",
  gradeExplanation: "Most uptime SLAs are met. Latency and remediation are weak points. Independent monitoring is the bright spot.",
};
