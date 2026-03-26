import { useState, useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";

// ─── DEMO DATA ───
const AGENTS = [
  { id: "aws", name: "Amazon Web Services", type: "provider", short: "AWS" },
  { id: "gcp", name: "Google Cloud Platform", type: "provider", short: "GCP" },
  { id: "azure", name: "Microsoft Azure", type: "provider", short: "AZR" },
  { id: "cloudflare", name: "Cloudflare", type: "provider", short: "CF" },
  { id: "datadog", name: "Datadog", type: "monitor", short: "DD" },
  { id: "customers", name: "Enterprise Customers", type: "stakeholder", short: "ENT" },
  { id: "startups", name: "Startup Customers", type: "stakeholder", short: "SU" },
];

const PROMISES = [
  { id: "SLA-001", promiser: "aws", promisee: "customers", body: "S3 availability >= 99.99% (four nines)", domain: "Uptime", status: "verified", progress: 99.997, target: 99.99, note: "S3 Standard achieved 99.997% availability over trailing 12 months. Well above SLA commitment. Last major incident: Feb 2024 (23 min)." },
  { id: "SLA-002", promiser: "aws", promisee: "customers", body: "EC2 compute availability >= 99.99%", domain: "Uptime", status: "degraded", progress: 99.96, target: 99.99, note: "EC2 us-east-1 had 3 incidents totaling 4.2 hours in trailing 12mo. Availability at 99.96% — below four-nines SLA." },
  { id: "SLA-003", promiser: "aws", promisee: "customers", body: "Lambda cold start under 200ms for P99", domain: "Latency", status: "violated", progress: 340, target: 200, note: "P99 cold start at 340ms — 70% over commitment. SnapStart helps for Java but Node.js and Python still lag. High-memory functions especially affected." },
  { id: "SLA-004", promiser: "gcp", promisee: "customers", body: "BigQuery 99.99% availability", domain: "Uptime", status: "verified", progress: 99.998, target: 99.99, note: "BigQuery achieved 99.998% over trailing 12mo. Zero multi-region outages. Single-region maintenance events handled via automatic failover." },
  { id: "SLA-005", promiser: "gcp", promisee: "customers", body: "Cloud Run request latency P95 under 100ms", domain: "Latency", status: "verified", progress: 78, target: 100, note: "P95 latency at 78ms — well within commitment. Consistent performance across all regions." },
  { id: "SLA-006", promiser: "gcp", promisee: "customers", body: "Vertex AI model serving availability 99.9%", domain: "Uptime", status: "degraded", progress: 99.82, target: 99.9, note: "Two GPU capacity incidents in Q4 2025 caused availability dips. 99.82% over trailing 12mo — below three-nines commitment." },
  { id: "SLA-007", promiser: "azure", promisee: "customers", body: "Azure AD authentication availability 99.99%", domain: "Uptime", status: "verified", progress: 99.995, target: 99.99, note: "Azure AD at 99.995% availability. Critical authentication infrastructure with redundancy across 6 regions." },
  { id: "SLA-008", promiser: "azure", promisee: "customers", body: "Cosmos DB single-region write latency under 10ms P99", domain: "Latency", status: "verified", progress: 7.2, target: 10, note: "P99 write latency at 7.2ms — strong performance. Consistent across Standard tier deployments." },
  { id: "SLA-009", promiser: "azure", promisee: "customers", body: "Azure OpenAI Service availability 99.9%", domain: "Uptime", status: "violated", progress: 99.71, target: 99.9, note: "Frequent capacity throttling and queue timeouts during peak demand. 99.71% effective availability — well below SLA. High demand for GPT-4 causing regional exhaustion." },
  { id: "SLA-010", promiser: "cloudflare", promisee: "customers", body: "CDN edge availability 99.999% (five nines)", domain: "Uptime", status: "verified", progress: 99.9994, target: 99.999, note: "Cloudflare's edge network at 99.9994% — exceeding five-nines commitment. 330+ PoPs with automatic failover." },
  { id: "SLA-011", promiser: "cloudflare", promisee: "customers", body: "DNS resolution under 15ms global median", domain: "Latency", status: "verified", progress: 11.2, target: 15, note: "Global median DNS resolution at 11.2ms. Fastest among major providers per DNSPerf benchmarks." },
  { id: "SLA-012", promiser: "cloudflare", promisee: "startups", body: "Free tier rate limits: 100K requests/day", domain: "Capacity", status: "verified", progress: null, target: null, note: "Free tier consistently honored. No reported degradation of free-tier service levels." },
];

const UPTIME_TREND = [
  { month: "Jul 25", aws: 99.98, gcp: 99.99, azure: 99.97, cloudflare: 99.999 },
  { month: "Aug 25", aws: 99.94, gcp: 99.99, azure: 99.98, cloudflare: 99.999 },
  { month: "Sep 25", aws: 99.99, gcp: 99.98, azure: 99.95, cloudflare: 99.999 },
  { month: "Oct 25", aws: 99.97, gcp: 99.99, azure: 99.92, cloudflare: 99.999 },
  { month: "Nov 25", aws: 99.99, gcp: 99.99, azure: 99.96, cloudflare: 99.998 },
  { month: "Dec 25", aws: 99.96, gcp: 99.99, azure: 99.98, cloudflare: 99.999 },
  { month: "Jan 26", aws: 99.98, gcp: 99.99, azure: 99.94, cloudflare: 99.999 },
];

const INCIDENT_DATA = [
  { month: "Jul 25", aws: 2, gcp: 1, azure: 3, cloudflare: 0 },
  { month: "Aug 25", aws: 4, gcp: 1, azure: 2, cloudflare: 0 },
  { month: "Sep 25", aws: 1, gcp: 2, azure: 3, cloudflare: 1 },
  { month: "Oct 25", aws: 2, gcp: 1, azure: 5, cloudflare: 0 },
  { month: "Nov 25", aws: 1, gcp: 0, azure: 3, cloudflare: 1 },
  { month: "Dec 25", aws: 3, gcp: 1, azure: 2, cloudflare: 0 },
  { month: "Jan 26", aws: 1, gcp: 1, azure: 4, cloudflare: 0 },
];

const INSIGHTS = [
  { severity: "positive", type: "Leader", title: "Cloudflare exceeds five-nines across all commitments",
    body: "Cloudflare's edge network, DNS, and free tier promises are all being kept with margin. At 99.9994% edge availability, the network exceeds its five-nines SLA. This is the strongest promise-keeping record in the infrastructure cohort.",
    promises: ["SLA-010", "SLA-011", "SLA-012"] },
  { severity: "critical", type: "Capacity", title: "Azure OpenAI Service can't keep up with demand",
    body: "Azure's OpenAI Service is significantly below its 99.9% SLA at 99.71% effective availability. The root cause is GPU capacity exhaustion during peak periods — demand for GPT-4 models regularly exceeds provisioned capacity in multiple regions. This is an infrastructure scaling problem, not a reliability problem.",
    promises: ["SLA-009"] },
  { severity: "warning", type: "Drift", title: "AWS Lambda cold starts trending wrong direction",
    body: "Lambda P99 cold start latency at 340ms is 70% above the 200ms commitment. The introduction of larger runtime images and ML-heavy workloads has pushed cold starts higher. SnapStart mitigates for Java but doesn't help the majority of serverless workloads.",
    promises: ["SLA-003"] },
  { severity: "warning", type: "Pattern", title: "AI/ML services are the weakest SLA category across all providers",
    body: "Both GCP's Vertex AI (99.82% vs 99.9% SLA) and Azure's OpenAI Service (99.71% vs 99.9% SLA) are below their commitments. GPU-dependent services have fundamentally different reliability characteristics than traditional cloud infrastructure. The industry may need different SLA frameworks for AI workloads.",
    promises: ["SLA-006", "SLA-009"] },
];

// ─── STYLES (dark ops theme) ───
const C = {
  bg: "#0f1419", surface: "#1a2332", surfaceDark: "#141c27",
  border: "#2a3a4a", text: "#e8e6e1", textMuted: "#8899aa", textLight: "#556677",
  accent: "#00d4aa", accentLight: "#0a2a22",
  verified: "#00d4aa", declared: "#6b7280", degraded: "#f59e0b",
  violated: "#ef4444", unverifiable: "#a78bfa",
  positive: "#00d4aa", warning: "#f59e0b", critical: "#ef4444",
  aws: "#ff9900", gcp: "#4285f4", azure: "#0078d4", cloudflare: "#f48120",
};

const STATUS_LABELS = { verified: "On Track", declared: "Declared", degraded: "Behind Schedule", violated: "Off Track", unverifiable: "No Verification" };
const agentTypeColors = { provider: "#d97706", monitor: "#0891b2", stakeholder: "#16a34a" };

function StatusBadge({ status }) {
  const c = C[status] || C.textMuted;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
      color: c, background: `${c}18`, border: `1px solid ${c}30`,
      fontFamily: "'IBM Plex Mono', monospace",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0 }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function generateNarrative() {
  const total = PROMISES.length;
  const verified = PROMISES.filter(p => p.status === "verified").length;
  const degraded = PROMISES.filter(p => p.status === "degraded").length;
  const violated = PROMISES.filter(p => p.status === "violated").length;

  return {
    headline: `${verified} of ${total} infrastructure SLAs are being met`,
    grade: violated >= 3 ? "C" : violated >= 1 ? "B" : degraded >= 2 ? "B+" : "A-",
    gradeColor: violated >= 3 ? C.violated : violated >= 1 ? C.degraded : C.verified,
    summary: `We verified ${total} SLA commitments across 4 major cloud providers — covering uptime, latency, and capacity. ${verified} are being met, ${degraded} are below committed levels, and ${violated} are significantly off track. AI/ML services are the weakest category.`,
  };
}

export default function InfraDemoDashboard() {
  const [tab, setTab] = useState("summary");
  const [domainFilter, setDomainFilter] = useState("All");

  const narrative = useMemo(generateNarrative, []);
  const domains = ["All", ...new Set(PROMISES.map(p => p.domain))];
  const filtered = domainFilter === "All" ? PROMISES : PROMISES.filter(p => p.domain === domainFilter);

  const domainHealth = domains.filter(d => d !== "All").map(d => {
    const ps = PROMISES.filter(p => p.domain === d);
    const rank = { verified: 3, declared: 2, degraded: 1, unverifiable: 0, violated: -1 };
    const avg = ps.reduce((a, p) => a + (rank[p.status] ?? 0), 0) / ps.length;
    return { domain: d, count: ps.length, health: avg, color: avg >= 2 ? C.verified : avg >= 1 ? C.degraded : avg >= 0 ? C.unverifiable : C.violated };
  });

  const tabDefs = [
    { id: "summary", label: "Summary" },
    { id: "uptime", label: "Uptime & Incidents" },
    { id: "promises", label: "All SLAs" },
    { id: "insights", label: "Key Findings" },
  ];

  const font = "'IBM Plex Sans', -apple-system, sans-serif";
  const mono = "'IBM Plex Mono', monospace";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      {/* ─── OPS HEADER ─── */}
      <header style={{ background: "#1a1a2e", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "#556677", fontFamily: mono, textTransform: "uppercase", letterSpacing: 1.5 }}>Promise Engine &middot; Infrastructure Demo</span>
                <span style={{
                  fontSize: 10, fontFamily: mono, padding: "2px 8px", borderRadius: 3,
                  color: C.degraded, background: `${C.degraded}18`, border: `1px solid ${C.degraded}30`,
                }}>DEMO DATA</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: mono, letterSpacing: -0.5, color: "#ffffff" }}>
                Are Cloud Providers Keeping Their SLAs?
              </h1>
            </div>
            {/* Provider status indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {[
                { name: "AWS", color: C.aws, id: "aws" },
                { name: "GCP", color: C.gcp, id: "gcp" },
                { name: "Azure", color: C.azure, id: "azure" },
                { name: "Cloudflare", color: C.cloudflare, id: "cloudflare" },
              ].map(p => {
                const ps = PROMISES.filter(pr => pr.promiser === p.id);
                const statusColor = ps.some(pr => pr.status === "violated") ? C.violated : ps.some(pr => pr.status === "degraded") ? C.degraded : C.verified;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: statusColor,
                      boxShadow: `0 0 6px ${statusColor}80`,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, fontFamily: mono, color: "#ffffff", fontWeight: 500 }}>{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <nav style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
          {tabDefs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "12px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
              color: tab === t.id ? C.accent : C.textMuted,
              background: "none", border: "none",
              borderBottom: tab === t.id ? `2px solid ${C.accent}` : "2px solid transparent",
              fontFamily: mono,
            }}>{t.label}</button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>

        {tab === "summary" && (
          <div>
            {/* ─── Metric status bar: 4 tiles side by side ─── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total SLAs", value: PROMISES.length, color: C.accent },
                { label: "On Track", value: PROMISES.filter(p => p.status === "verified").length, color: C.verified },
                { label: "Behind", value: PROMISES.filter(p => p.status === "degraded").length, color: C.degraded },
                { label: "Off Track", value: PROMISES.filter(p => p.status === "violated").length, color: C.violated },
              ].map(tile => (
                <div key={tile.label} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: "16px 20px", borderTop: `3px solid ${tile.color}`,
                }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: mono, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{tile.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, fontFamily: mono, color: tile.color }}>{tile.value}</div>
                </div>
              ))}
            </div>

            {/* ─── Narrative summary ─── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "20px 24px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: mono, marginBottom: 8, color: C.accent }}>
                {narrative.headline}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: C.textMuted, marginBottom: 0 }}>
                {narrative.summary}
              </p>
            </div>

            {/* ─── Provider cards: Cloudflare large + 3 small ─── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {/* Cloudflare - leader card spanning full width */}
              {(() => {
                const ps = PROMISES.filter(p => p.promiser === "cloudflare");
                const v = ps.filter(p => p.status === "verified").length;
                return (
                  <div style={{
                    gridColumn: "1 / -1",
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "24px 28px", borderLeft: `4px solid ${C.cloudflare}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: "50%", background: C.cloudflare,
                          boxShadow: `0 0 8px ${C.cloudflare}60`,
                        }} />
                        <span style={{ fontSize: 18, fontWeight: 600, fontFamily: mono, color: "#ffffff" }}>Cloudflare</span>
                        <span style={{
                          fontSize: 10, fontFamily: mono, padding: "2px 8px", borderRadius: 3,
                          color: C.verified, background: `${C.verified}18`, border: `1px solid ${C.verified}30`,
                          textTransform: "uppercase", letterSpacing: 0.8,
                        }}>Leader</span>
                      </div>
                      <span style={{ fontFamily: mono, fontSize: 18, color: C.cloudflare, fontWeight: 700 }}>{v}/{ps.length}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                      {ps.map(p => (
                        <div key={p.id} style={{
                          flex: 1, height: 8, borderRadius: 4,
                          background: C[p.status] || C.textMuted,
                          boxShadow: `0 0 4px ${(C[p.status] || C.textMuted)}40`,
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, fontFamily: mono }}>
                      {ps.map(p => p.domain).filter((d, i, a) => a.indexOf(d) === i).join(" / ")}
                    </div>
                  </div>
                );
              })()}
              {/* Other 3 providers in a row */}
              {[
                { name: "AWS", color: C.aws, id: "aws" },
                { name: "Google Cloud", color: C.gcp, id: "gcp" },
                { name: "Azure", color: C.azure, id: "azure" },
              ].map(provider => {
                const ps = PROMISES.filter(p => p.promiser === provider.id);
                const v = ps.filter(p => p.status === "verified").length;
                return (
                  <div key={provider.name} style={{
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                    padding: "16px 20px", borderLeft: `4px solid ${provider.color}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, fontFamily: mono, color: "#ffffff" }}>{provider.name}</span>
                      <span style={{ fontFamily: mono, fontSize: 14, color: provider.color, fontWeight: 700 }}>{v}/{ps.length}</span>
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {ps.map(p => (
                        <div key={p.id} style={{
                          flex: 1, height: 6, borderRadius: 3,
                          background: C[p.status] || C.textMuted,
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 8, fontFamily: mono }}>
                      {ps.map(p => p.domain).filter((d, i, a) => a.indexOf(d) === i).join(" / ")}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Domain health horizontal bars ─── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: mono, marginBottom: 16, color: C.accent, textTransform: "uppercase", letterSpacing: 1 }}>Domain Health</div>
              <div style={{ display: "grid", gap: 10 }}>
                {domainHealth.sort((a, b) => a.health - b.health).map(d => (
                  <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: C.text, minWidth: 90, fontWeight: 500, fontFamily: mono }}>{d.domain}</span>
                    <div style={{ flex: 1, height: 10, background: C.surfaceDark, borderRadius: 5, overflow: "hidden", border: `1px solid ${C.border}` }}>
                      <div style={{
                        width: `${Math.max(10, ((d.health + 1) / 4) * 100)}%`, height: "100%",
                        background: `linear-gradient(90deg, ${d.color}cc, ${d.color})`, borderRadius: 5,
                        boxShadow: `0 0 6px ${d.color}40`,
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: mono, color: d.color, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "uptime" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: mono, marginBottom: 6, color: C.accent }}>Monthly Composite Uptime</h2>
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.6, fontFamily: mono }}>
                Weighted average uptime across each provider's core services. The 99.99% line represents the four-nines standard. Cloudflare operates at five-nines scale (shown off the top of chart).
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={UPTIME_TREND} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <YAxis domain={[99.9, 100]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, background: C.surfaceDark, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }} formatter={(v) => [`${v}%`]} />
                  <ReferenceLine y={99.99} stroke={C.verified} strokeDasharray="8 4" strokeOpacity={0.5} label={{ value: "99.99% SLA", position: "right", fontSize: 10, fill: C.verified }} />
                  <Area type="monotone" dataKey="aws" stroke={C.aws} fill="none" strokeWidth={2} dot={{ r: 3 }} name="AWS" />
                  <Area type="monotone" dataKey="gcp" stroke={C.gcp} fill="none" strokeWidth={2} dot={{ r: 3 }} name="GCP" />
                  <Area type="monotone" dataKey="azure" stroke={C.azure} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Azure" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "28px 32px" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, fontFamily: mono, marginBottom: 6, color: C.accent }}>Monthly Incident Count</h2>
              <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.6, fontFamily: mono }}>
                Number of service-impacting incidents per provider per month. Includes both outages and significant degradations as reported on provider status pages.
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={INCIDENT_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <YAxis fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, background: C.surfaceDark, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text }} />
                  <Area type="monotone" dataKey="aws" stroke={C.aws} fill={`${C.aws}20`} strokeWidth={2} name="AWS" />
                  <Area type="monotone" dataKey="gcp" stroke={C.gcp} fill={`${C.gcp}20`} strokeWidth={2} name="GCP" />
                  <Area type="monotone" dataKey="azure" stroke={C.azure} fill={`${C.azure}20`} strokeWidth={2} name="Azure" />
                  <Area type="monotone" dataKey="cloudflare" stroke={C.cloudflare} fill={`${C.cloudflare}20`} strokeWidth={2} name="Cloudflare" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "promises" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {domains.map(d => (
                <button key={d} onClick={() => setDomainFilter(d)} style={{
                  padding: "5px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, cursor: "pointer",
                  background: domainFilter === d ? C.accent : C.surface,
                  color: domainFilter === d ? "#0f1419" : C.textMuted,
                  border: `1px solid ${domainFilter === d ? C.accent : C.border}`,
                  fontFamily: mono,
                }}>{d}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map(pr => {
                const promiser = AGENTS.find(a => a.id === pr.promiser);
                const promisee = AGENTS.find(a => a.id === pr.promisee);
                return (
                  <div key={pr.id} style={{
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "18px 22px", borderLeft: `4px solid ${C[pr.status] || C.textMuted}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: mono, fontSize: 12, color: C.accent, fontWeight: 600 }}>{pr.id}</span>
                        <span style={{ fontSize: 11, color: C.textMuted, background: C.surfaceDark, padding: "2px 8px", borderRadius: 3, border: `1px solid ${C.border}` }}>{pr.domain}</span>
                      </div>
                      <StatusBadge status={pr.status} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{pr.body}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: agentTypeColors[promiser?.type] }}>{promiser?.name}</span>
                      <span style={{ margin: "0 6px", color: C.textLight }}>promised to</span>
                      <span style={{ fontWeight: 600, color: agentTypeColors[promisee?.type] }}>{promisee?.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, fontStyle: "italic" }}>{pr.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "insights" && (
          <div style={{ display: "grid", gap: 20 }}>
            {INSIGHTS.map((ins, i) => (
              <div key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6,
                padding: "28px 32px", borderLeft: `4px solid ${C[ins.severity]}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.8,
                    color: C[ins.severity], background: `${C[ins.severity]}18`, border: `1px solid ${C[ins.severity]}30`,
                  }}>{ins.severity}</span>
                  <span style={{ fontSize: 11, color: C.textLight, fontFamily: mono }}>{ins.type}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, fontFamily: mono, marginBottom: 12, lineHeight: 1.3, color: C.text }}>{ins.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: C.textMuted, marginBottom: 16 }}>{ins.body}</p>
                {ins.promises.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ins.promises.map(pid => {
                      const pr = PROMISES.find(p => p.id === pid);
                      if (!pr) return null;
                      return (
                        <div key={pid} style={{
                          padding: "8px 12px", background: C.surfaceDark, borderRadius: 6,
                          borderLeft: `3px solid ${C[pr.status]}`, fontSize: 12,
                          border: `1px solid ${C.border}`,
                        }}>
                          <span style={{ fontFamily: mono, color: C.accent, fontWeight: 600, marginRight: 6 }}>{pr.id}</span>
                          <span style={{ color: C.text }}>{pr.body}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}
