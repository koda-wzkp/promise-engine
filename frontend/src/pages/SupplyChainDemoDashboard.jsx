import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

// ─── DEMO DATA ───
const AGENTS = [
  { id: "patagonia", name: "Patagonia", type: "brand", short: "PAT" },
  { id: "nike", name: "Nike", type: "brand", short: "NKE" },
  { id: "nestle", name: "Nestl\u00e9", type: "brand", short: "NES" },
  { id: "unilever", name: "Unilever", type: "brand", short: "UNL" },
  { id: "fairtrade", name: "Fairtrade International", type: "certifier", short: "FT" },
  { id: "rainforest", name: "Rainforest Alliance", type: "certifier", short: "RA" },
  { id: "farmers", name: "Smallholder Farmers", type: "producer", short: "FRM" },
  { id: "workers", name: "Factory Workers", type: "producer", short: "WRK" },
  { id: "consumers", name: "Consumers", type: "stakeholder", short: "CON" },
];

const PROMISES = [
  { id: "SC-001", promiser: "patagonia", promisee: "consumers", body: "100% traceable down supply chain by 2025", domain: "Provenance", status: "verified", progress: 98, target: 100, note: "98% of Tier 1-3 supply chain mapped. Remaining 2% is raw material sub-suppliers in remote regions. Footprint Chronicles platform publicly tracks origins." },
  { id: "SC-002", promiser: "patagonia", promisee: "workers", body: "Fair Trade Certified sewing for 100% of products", domain: "Ethics", status: "degraded", progress: 86, target: 100, note: "86% of products now Fair Trade Certified sewn. Some specialty lines (technical mountaineering) still produced in non-certified facilities. Timeline extended to mid-2026." },
  { id: "SC-003", promiser: "nike", promisee: "consumers", body: "Publish supplier list with factory-level transparency", domain: "Provenance", status: "verified", progress: null, target: null, note: "Manufacturing Map published and updated quarterly. 500+ Tier 1 factories listed with addresses, worker counts, and product types." },
  { id: "SC-004", promiser: "nike", promisee: "workers", body: "Zero excessive overtime in Tier 1 factories", domain: "Ethics", status: "degraded", progress: null, target: null, note: "18% of Tier 1 factories still report >60 hour work weeks during peak production. Concentrated in Vietnam and Indonesia. Down from 32% in 2022." },
  { id: "SC-005", promiser: "nike", promisee: "consumers", body: "50% recycled polyester in all products by 2025", domain: "Sustainability", status: "verified", progress: 54, target: 50, note: "54% recycled polyester achieved across product line. Flyknit and Move to Zero lines at 78%. On track." },
  { id: "SC-006", promiser: "nestle", promisee: "farmers", body: "100% responsibly sourced cocoa through Cocoa Plan", domain: "Ethics", status: "degraded", progress: 62, target: 100, note: "62% of cocoa supply verified through Cocoa Plan. West African supply chains remain difficult to fully trace. Child labor monitoring covers 92% of direct suppliers but sub-supplier visibility is limited." },
  { id: "SC-007", promiser: "nestle", promisee: "consumers", body: "Deforestation-free supply chain for palm oil by 2023", domain: "Sustainability", status: "violated", progress: null, target: null, note: "Deadline passed. Satellite monitoring shows ongoing deforestation links in Indonesian palm oil supply chain. 89% verified deforestation-free but remaining 11% includes high-risk concessions." },
  { id: "SC-008", promiser: "nestle", promisee: "consumers", body: "Full ingredient traceability via blockchain pilot", domain: "Provenance", status: "degraded", progress: null, target: null, note: "Blockchain pilot covers 5 product lines (Zoégas coffee, Mousline potatoes). Scaling challenges — data entry at farm level unreliable in developing regions. Full rollout delayed." },
  { id: "SC-009", promiser: "unilever", promisee: "consumers", body: "100% recyclable, reusable, or compostable packaging by 2025", domain: "Sustainability", status: "violated", progress: 67, target: 100, note: "67% of packaging meets criteria. Sachet packaging in developing markets (India, SE Asia) remains non-recyclable. Represents 20% of total packaging volume." },
  { id: "SC-010", promiser: "unilever", promisee: "farmers", body: "Living wage for direct agricultural suppliers", domain: "Ethics", status: "unverifiable", progress: null, target: null, note: "Living wage benchmarks established for 8 crops. Actual wage verification depends on local partners. No independent audit mechanism in place for smallholder supplier networks." },
  { id: "SC-011", promiser: "fairtrade", promisee: "farmers", body: "Minimum price guarantee above market rate for certified producers", domain: "Economics", status: "verified", progress: null, target: null, note: "Fairtrade minimum prices consistently above market for coffee, cocoa, and bananas. Premium payments of $228M distributed to producer organizations in 2024." },
  { id: "SC-012", promiser: "rainforest", promisee: "consumers", body: "Certified farms meet 100% critical criteria in sustainability standard", domain: "Sustainability", status: "verified", progress: null, target: null, note: "Annual audits verify critical criteria compliance. 2024 audit cycle: 97.8% first-pass compliance, remaining farms given corrective action plans." },
];

const TRACEABILITY_TREND = [
  { quarter: "Q1 24", patagonia: 91, nike: 85, nestle: 42, unilever: 55 },
  { quarter: "Q2 24", patagonia: 93, nike: 87, nestle: 46, unilever: 58 },
  { quarter: "Q3 24", patagonia: 95, nike: 89, nestle: 50, unilever: 60 },
  { quarter: "Q4 24", patagonia: 96, nike: 91, nestle: 53, unilever: 62 },
  { quarter: "Q1 25", patagonia: 97, nike: 93, nestle: 56, unilever: 64 },
  { quarter: "Q2 25", patagonia: 98, nike: 94, nestle: 58, unilever: 65 },
  { quarter: "Q3 25", patagonia: 98, nike: 95, nestle: 60, unilever: 67 },
];

const ETHICS_SCORES = [
  { quarter: "Q1 24", patagonia: 88, nike: 72, nestle: 51, unilever: 60 },
  { quarter: "Q2 24", patagonia: 89, nike: 75, nestle: 54, unilever: 62 },
  { quarter: "Q3 24", patagonia: 90, nike: 77, nestle: 56, unilever: 61 },
  { quarter: "Q4 24", patagonia: 91, nike: 79, nestle: 58, unilever: 63 },
  { quarter: "Q1 25", patagonia: 92, nike: 80, nestle: 59, unilever: 64 },
  { quarter: "Q2 25", patagonia: 93, nike: 82, nestle: 61, unilever: 64 },
  { quarter: "Q3 25", patagonia: 94, nike: 83, nestle: 62, unilever: 65 },
];

const INSIGHTS = [
  { severity: "positive", type: "Leader", title: "Patagonia sets the standard for supply chain transparency",
    body: "With 98% supply chain traceability and 86% Fair Trade Certified sewing, Patagonia leads the cohort on both provenance and ethics. The Footprint Chronicles platform makes supply chain data publicly accessible — a level of transparency most brands haven't attempted.",
    promises: ["SC-001", "SC-002"] },
  { severity: "critical", type: "Missed Deadline", title: "Nestl\u00e9's deforestation-free palm oil deadline has passed",
    body: "Nestl\u00e9 committed to a deforestation-free palm oil supply chain by 2023. That deadline has passed with 11% of the supply chain still linked to high-risk concessions in Indonesia. Satellite monitoring confirms ongoing deforestation in supplier concession areas. This is a clear case of a deadline-specific promise that was not kept.",
    promises: ["SC-007"] },
  { severity: "warning", type: "Gap", title: "Living wage promises are structurally unverifiable",
    body: "Unilever's living wage commitment to agricultural suppliers has no independent verification mechanism. Living wage benchmarks exist on paper, but actual wage data depends on local partner reporting with no third-party audit. The promise to farmers cannot be confirmed or denied with available data.",
    promises: ["SC-010"] },
  { severity: "warning", type: "Pattern", title: "Last-mile traceability remains the industry's blind spot",
    body: "All four brands show strong Tier 1 factory visibility but rapidly declining transparency at Tier 2-3 (raw materials, processing). Nestl\u00e9's cocoa and Unilever's palm oil supply chains both lose visibility at the smallholder farm level — exactly where labor and environmental risks are highest.",
    promises: ["SC-006", "SC-008"] },
];

// ─── STYLES ───
const C = {
  bg: "#faf9f6", surface: "#ffffff", surfaceDark: "#f5f3ee",
  border: "#e2ddd5", text: "#2d2a26", textMuted: "#7a7267", textLight: "#a09889",
  accent: "#1a5f4a", accentLight: "#e8f2ee",
  verified: "#1a5f4a", declared: "#6b7280", degraded: "#b45309",
  violated: "#b91c1c", unverifiable: "#7c3aed",
  positive: "#1a5f4a", warning: "#b45309", critical: "#b91c1c",
  patagonia: "#1a1a2e", nike: "#111111", nestle: "#7B3F00", unilever: "#1F36C7",
};

const STATUS_LABELS = { verified: "On Track", declared: "Declared", degraded: "Behind Schedule", violated: "Off Track", unverifiable: "No Verification" };
const agentTypeColors = { brand: "#d97706", certifier: "#0891b2", producer: "#16a34a", stakeholder: "#6366f1" };

function StatusBadge({ status }) {
  const c = C[status] || C.textMuted;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
      color: c, background: `${c}12`, border: `1px solid ${c}28`,
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
  const unverifiable = PROMISES.filter(p => p.status === "unverifiable").length;

  return {
    headline: `${verified} of ${total} supply chain promises are being kept`,
    grade: violated >= 3 ? "C" : violated >= 1 ? "C+" : degraded >= 3 ? "B-" : "B",
    gradeColor: violated >= 3 ? C.violated : violated >= 1 ? C.degraded : C.verified,
    summary: `We tracked ${total} supply chain commitments across 4 major brands and 2 certification bodies — covering provenance, ethics, sustainability, and economics. ${verified} are on track, ${degraded} are behind schedule, ${violated} have missed their deadlines, and ${unverifiable} have no way to verify.`,
  };
}

export default function SupplyChainDemoDashboard() {
  const [tab, setTab] = useState("summary");
  const [domainFilter, setDomainFilter] = useState("All");

  const narrative = useMemo(generateNarrative, []);
  const domains = ["All", ...new Set(PROMISES.map(p => p.domain))];
  const filtered = domainFilter === "All" ? PROMISES : PROMISES.filter(p => p.domain === domainFilter);

  const statusCounts = [
    { name: "On Track", value: PROMISES.filter(p => p.status === "verified").length, color: C.verified },
    { name: "Behind", value: PROMISES.filter(p => p.status === "degraded").length, color: C.degraded },
    { name: "Off Track", value: PROMISES.filter(p => p.status === "violated").length, color: C.violated },
    { name: "No Verification", value: PROMISES.filter(p => p.status === "unverifiable").length, color: C.unverifiable },
  ];

  const domainHealth = domains.filter(d => d !== "All").map(d => {
    const ps = PROMISES.filter(p => p.domain === d);
    const rank = { verified: 3, declared: 2, degraded: 1, unverifiable: 0, violated: -1 };
    const avg = ps.reduce((a, p) => a + (rank[p.status] ?? 0), 0) / ps.length;
    return { domain: d, count: ps.length, health: avg, color: avg >= 2 ? C.verified : avg >= 1 ? C.degraded : avg >= 0 ? C.unverifiable : C.violated };
  });

  const tabDefs = [
    { id: "summary", label: "Summary" },
    { id: "tracking", label: "Traceability & Ethics" },
    { id: "promises", label: "All Promises" },
    { id: "insights", label: "Key Findings" },
  ];

  const font = "'IBM Plex Sans', -apple-system, sans-serif";
  const serif = "'IBM Plex Serif', Georgia, serif";
  const mono = "'IBM Plex Mono', monospace";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: C.textLight, fontFamily: mono, textTransform: "uppercase", letterSpacing: 1.5 }}>Promise Engine &middot; Supply Chain Demo</span>
            <span style={{
              fontSize: 10, fontFamily: mono, padding: "2px 8px", borderRadius: 3,
              color: C.degraded, background: `${C.degraded}12`, border: `1px solid ${C.degraded}28`,
            }}>DEMO DATA</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: serif, letterSpacing: -0.5, marginBottom: 4 }}>
            Are Brands Keeping Their Supply Chain Promises?
          </h1>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            Tracking 12 commitments across provenance, ethics, sustainability, and fair economics
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
              fontFamily: font,
            }}>{t.label}</button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>

        {tab === "summary" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "32px 36px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "start", gap: 32, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center", minWidth: 100 }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: "50%",
                    border: `4px solid ${narrative.gradeColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, fontWeight: 700, fontFamily: mono, color: narrative.gradeColor,
                    margin: "0 auto 8px",
                  }}>{narrative.grade}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Overall</div>
                </div>
                <div style={{ flex: 1, minWidth: 300 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: serif, marginBottom: 12, color: C.text, lineHeight: 1.3 }}>
                    {narrative.headline}
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.8, color: C.text, marginBottom: 0 }}>
                    {narrative.summary}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: serif, marginBottom: 16 }}>Promise Status Breakdown</div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <ResponsiveContainer width={140} height={140}>
                    <PieChart>
                      <Pie data={statusCounts.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={36} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {statusCounts.filter(s => s.value > 0).map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "grid", gap: 6, flex: 1 }}>
                    {statusCounts.filter(s => s.value > 0).map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{s.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: mono, color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: serif, marginBottom: 16 }}>Health by Domain</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {domainHealth.sort((a, b) => a.health - b.health).map(d => (
                    <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: C.text, minWidth: 100, fontWeight: 500 }}>{d.domain}</span>
                      <div style={{ flex: 1, height: 8, background: C.surfaceDark, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.max(10, ((d.health + 1) / 4) * 100)}%`, height: "100%",
                          background: d.color, borderRadius: 4,
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: mono, color: d.color, fontWeight: 600, minWidth: 20, textAlign: "right" }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand scorecards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { name: "Patagonia", color: C.patagonia, id: "patagonia" },
                { name: "Nike", color: C.nike, id: "nike" },
                { name: "Nestl\u00e9", color: C.nestle, id: "nestle" },
                { name: "Unilever", color: C.unilever, id: "unilever" },
              ].map(brand => {
                const ps = PROMISES.filter(p => p.promiser === brand.id);
                const v = ps.filter(p => p.status === "verified").length;
                return (
                  <div key={brand.name} style={{
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                    padding: "20px 24px", borderLeft: `4px solid ${brand.color}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, fontFamily: serif }}>{brand.name}</span>
                      <span style={{ fontFamily: mono, fontSize: 13, color: brand.color, fontWeight: 700 }}>{v}/{ps.length}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {ps.map(p => (
                        <div key={p.id} style={{
                          flex: 1, height: 6, borderRadius: 3,
                          background: C[p.status] || C.textMuted,
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                      {ps.map(p => p.domain).filter((d, i, a) => a.indexOf(d) === i).join(" · ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "tracking" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: serif, marginBottom: 6 }}>Supply Chain Traceability Score</h2>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                Percentage of supply chain (Tier 1-3) that is independently traceable. Higher scores mean more visibility into raw material origins, processing, and manufacturing.
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={TRACEABILITY_TREND} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="quarter" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <YAxis domain={[30, 100]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 6 }} formatter={(v) => [`${v}%`]} />
                  <Area type="monotone" dataKey="patagonia" stroke={C.patagonia} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Patagonia" />
                  <Area type="monotone" dataKey="nike" stroke={C.nike} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Nike" />
                  <Area type="monotone" dataKey="nestle" stroke={C.nestle} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Nestl\u00e9" />
                  <Area type="monotone" dataKey="unilever" stroke={C.unilever} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Unilever" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: serif, marginBottom: 6 }}>Ethical Sourcing Composite Score</h2>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                Composite index of labor standards compliance, fair wage verification, and third-party audit results. Score of 100 = full compliance across all ethical sourcing commitments.
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={ETHICS_SCORES} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="quarter" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <YAxis domain={[40, 100]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 6 }} />
                  <Area type="monotone" dataKey="patagonia" stroke={C.patagonia} fill={`${C.patagonia}15`} strokeWidth={2} dot={{ r: 3 }} name="Patagonia" />
                  <Area type="monotone" dataKey="nike" stroke={C.nike} fill={`${C.nike}15`} strokeWidth={2} dot={{ r: 3 }} name="Nike" />
                  <Area type="monotone" dataKey="nestle" stroke={C.nestle} fill={`${C.nestle}15`} strokeWidth={2} dot={{ r: 3 }} name="Nestl\u00e9" />
                  <Area type="monotone" dataKey="unilever" stroke={C.unilever} fill={`${C.unilever}15`} strokeWidth={2} dot={{ r: 3 }} name="Unilever" />
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
                  color: domainFilter === d ? "#fff" : C.textMuted,
                  border: `1px solid ${domainFilter === d ? C.accent : C.border}`,
                  fontFamily: font,
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
                        <span style={{ fontSize: 11, color: C.textMuted, background: C.surfaceDark, padding: "2px 8px", borderRadius: 3 }}>{pr.domain}</span>
                      </div>
                      <StatusBadge status={pr.status} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{pr.body}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: agentTypeColors[promiser?.type] }}>{promiser?.name}</span>
                      <span style={{ margin: "0 6px", color: C.textLight }}>promised to</span>
                      <span style={{ fontWeight: 600, color: agentTypeColors[promisee?.type] }}>{promisee?.name}</span>
                    </div>
                    {pr.progress !== null && pr.target !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ flex: 1, maxWidth: 300, height: 6, background: C.surfaceDark, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(pr.progress, 100)}%`, height: "100%", background: C[pr.status], borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: mono, fontSize: 12, color: C[pr.status], fontWeight: 600 }}>{pr.progress}%</span>
                        <span style={{ fontFamily: mono, fontSize: 11, color: C.textLight }}>of {pr.target}%</span>
                      </div>
                    )}
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
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                padding: "28px 32px", borderLeft: `4px solid ${C[ins.severity]}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: 0.8,
                    color: C[ins.severity], background: `${C[ins.severity]}12`, border: `1px solid ${C[ins.severity]}28`,
                  }}>{ins.severity}</span>
                  <span style={{ fontSize: 11, color: C.textLight, fontFamily: mono }}>{ins.type}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, fontFamily: serif, marginBottom: 12, lineHeight: 1.3 }}>{ins.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, marginBottom: 16 }}>{ins.body}</p>
                {ins.promises.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ins.promises.map(pid => {
                      const pr = PROMISES.find(p => p.id === pid);
                      if (!pr) return null;
                      return (
                        <div key={pid} style={{
                          padding: "8px 12px", background: C.surfaceDark, borderRadius: 6,
                          borderLeft: `3px solid ${C[pr.status]}`, fontSize: 12,
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
