import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";

// ─── DEMO DATA ───
const AGENTS = [
  { id: "openai", name: "OpenAI", type: "provider", short: "OAI" },
  { id: "anthropic", name: "Anthropic", type: "provider", short: "ANT" },
  { id: "google", name: "Google DeepMind", type: "provider", short: "GDM" },
  { id: "meta", name: "Meta AI", type: "provider", short: "META" },
  { id: "nist", name: "NIST AI Safety", type: "regulator", short: "NIST" },
  { id: "eu-ai-act", name: "EU AI Act Authority", type: "regulator", short: "EU" },
  { id: "users", name: "End Users", type: "stakeholder", short: "USR" },
  { id: "developers", name: "Developer Community", type: "stakeholder", short: "DEV" },
];

const PROMISES = [
  { id: "AI-001", promiser: "openai", promisee: "users", body: "GPT-4o hallucination rate below 3% on factual queries", domain: "Accuracy", status: "degraded", progress: 4.2, target: 3.0, note: "Current hallucination rate 4.2% — above declared threshold. Improved from 6.1% last quarter but still not meeting commitment." },
  { id: "AI-002", promiser: "openai", promisee: "eu-ai-act", body: "Comply with EU AI Act transparency requirements by Aug 2025", domain: "Compliance", status: "declared", progress: null, target: null, note: "Transparency report filed. Technical documentation in progress. Deadline approaching." },
  { id: "AI-003", promiser: "anthropic", promisee: "users", body: "Constitutional AI alignment: harmful output rate below 0.1%", domain: "Safety", status: "verified", progress: 0.04, target: 0.1, note: "Harmful output rate at 0.04% — well within declared threshold. Consistent improvement over 4 quarters." },
  { id: "AI-004", promiser: "anthropic", promisee: "nist", body: "Publish model cards with bias audits for all production models", domain: "Transparency", status: "verified", progress: null, target: null, note: "Model cards published for Claude 3.5 Sonnet, Opus, Haiku. Third-party bias audit completed Q1 2025." },
  { id: "AI-005", promiser: "google", promisee: "users", body: "Gemini factual grounding accuracy above 95%", domain: "Accuracy", status: "verified", progress: 96.2, target: 95, note: "Grounding accuracy at 96.2% with Google Search integration. Verified via independent benchmark." },
  { id: "AI-006", promiser: "google", promisee: "eu-ai-act", body: "Watermark all AI-generated images and video", domain: "Transparency", status: "degraded", progress: null, target: null, note: "SynthID applied to Imagen outputs. Gemini text-to-image partially covered. Third-party integrations inconsistent." },
  { id: "AI-007", promiser: "meta", promisee: "developers", body: "Keep Llama models open-weight with permissive license", domain: "Openness", status: "verified", progress: null, target: null, note: "Llama 3.1 released under permissive community license. Weights publicly available." },
  { id: "AI-008", promiser: "meta", promisee: "nist", body: "Red-team all models before public release", domain: "Safety", status: "degraded", progress: null, target: null, note: "Internal red-teaming confirmed. External red team engagement partial — only 2 of 4 planned assessments completed before Llama 3.1 release." },
  { id: "AI-009", promiser: "openai", promisee: "users", body: "Response latency under 2 seconds for 95th percentile", domain: "Performance", status: "violated", progress: 3.8, target: 2.0, note: "P95 latency at 3.8s — nearly double the declared commitment. Infrastructure scaling issues after rapid adoption growth." },
  { id: "AI-010", promiser: "anthropic", promisee: "users", body: "No training on user conversations without explicit opt-in", domain: "Privacy", status: "verified", progress: null, target: null, note: "Privacy policy and technical architecture verified by third-party audit. No opt-out training data pipeline exists." },
  { id: "AI-011", promiser: "google", promisee: "nist", body: "Publish safety evaluation results before deployment", domain: "Safety", status: "verified", progress: null, target: null, note: "Gemini safety evaluations published in technical reports. Pre-deployment review process documented." },
  { id: "AI-012", promiser: "meta", promisee: "users", body: "Llama models produce no CSAM or bioweapons content", domain: "Safety", status: "unverifiable", progress: null, target: null, note: "Guardrails implemented in reference implementation. Open-weight distribution means downstream compliance is unverifiable by Meta." },
];

// Drift over time (hallucination rate)
const HALLUCINATION_TREND = [
  { month: "Jan 25", openai: 6.1, anthropic: 2.8, google: 3.9, meta: 5.2 },
  { month: "Apr 25", openai: 5.4, anthropic: 2.1, google: 3.5, meta: 4.8 },
  { month: "Jul 25", openai: 4.8, anthropic: 1.6, google: 3.1, meta: 4.3 },
  { month: "Oct 25", openai: 4.2, anthropic: 1.2, google: 2.8, meta: 3.9 },
  { month: "Jan 26", openai: 4.0, anthropic: 0.9, google: 2.5, meta: 3.5 },
];

const SAFETY_TREND = [
  { month: "Jan 25", openai: 0.31, anthropic: 0.08, google: 0.22, meta: 0.45 },
  { month: "Apr 25", openai: 0.25, anthropic: 0.06, google: 0.18, meta: 0.38 },
  { month: "Jul 25", openai: 0.19, anthropic: 0.05, google: 0.14, meta: 0.29 },
  { month: "Oct 25", openai: 0.15, anthropic: 0.04, google: 0.11, meta: 0.22 },
  { month: "Jan 26", openai: 0.12, anthropic: 0.03, google: 0.09, meta: 0.18 },
];

const INSIGHTS = [
  { severity: "warning", type: "Drift", title: "OpenAI hallucination rate still above declared threshold",
    body: "GPT-4o's hallucination rate has improved from 6.1% to 4.2% over the past year, but remains above the declared 3% threshold. The trend is positive but the promise is not yet met. At current improvement rate, the threshold would be reached in ~Q3 2026.",
    promises: ["AI-001"] },
  { severity: "critical", type: "Performance", title: "OpenAI latency promise significantly missed",
    body: "The 95th percentile response latency of 3.8 seconds is nearly double the declared 2-second commitment. This appears driven by capacity constraints following rapid adoption growth rather than a technical regression.",
    promises: ["AI-009"] },
  { severity: "positive", type: "Leadership", title: "Anthropic leads on safety and privacy commitments",
    body: "Anthropic has the strongest promise-keeping record in this cohort: harmful output rate at 0.04% (target: 0.1%), verified privacy commitment, and published model cards with third-party audits. All 4 promises are on track or verified.",
    promises: ["AI-003", "AI-004", "AI-010"] },
  { severity: "warning", type: "Gap", title: "Open-weight models create an unverifiable safety gap",
    body: "Meta's commitment to prevent harmful content generation is structurally unverifiable for open-weight models. Once weights are released, downstream modifications are outside Meta's control. This isn't a failure — it's a fundamental tension between openness and safety verification.",
    promises: ["AI-012"] },
];

// ─── STYLES ───
const C = {
  bg: "#f5f0eb", surface: "#ffffff", surfaceDark: "#ece7e0",
  border: "#d5cfc6", text: "#1a1a2e", textMuted: "#5a5670", textLight: "#8a8599",
  accent: "#1a1a2e", accentLight: "#e8e6f0",
  verified: "#1a5f4a", declared: "#6b7280", degraded: "#b45309",
  violated: "#b91c1c", unverifiable: "#7c3aed",
  positive: "#1a5f4a", warning: "#b45309", critical: "#b91c1c",
  openai: "#10a37f", anthropic: "#d4a574", google: "#4285f4", meta: "#0668E1",
  rule: "#1a1a2e",
};

const STATUS_LABELS = { verified: "On Track", declared: "Declared", degraded: "Behind Schedule", violated: "Off Track", unverifiable: "No Verification" };
const agentTypeColors = { provider: "#d97706", regulator: "#0891b2", stakeholder: "#16a34a" };

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
    headline: `${verified} of ${total} AI promises are being kept`,
    grade: violated >= 2 ? "C" : violated >= 1 ? "B-" : degraded >= 2 ? "B" : "B+",
    gradeColor: violated >= 2 ? C.violated : violated >= 1 ? C.degraded : C.verified,
    summary: `We tracked ${total} promises across 4 major AI providers — covering accuracy, safety, transparency, privacy, and performance. ${verified} are verified, ${degraded} are behind schedule, ${violated} are off track, and ${unverifiable} are structurally unverifiable.`,
  };
}

// ─── MAIN ───
export default function AIDemoDashboard() {
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
    { name: "Declared", value: PROMISES.filter(p => p.status === "declared").length, color: C.declared },
  ];

  const domainHealth = domains.filter(d => d !== "All").map(d => {
    const ps = PROMISES.filter(p => p.domain === d);
    const rank = { verified: 3, declared: 2, degraded: 1, unverifiable: 0, violated: -1 };
    const avg = ps.reduce((a, p) => a + (rank[p.status] ?? 0), 0) / ps.length;
    return { domain: d, count: ps.length, health: avg, color: avg >= 2 ? C.verified : avg >= 1 ? C.degraded : avg >= 0 ? C.unverifiable : C.violated };
  });

  const tabDefs = [
    { id: "summary", label: "Summary" },
    { id: "drift", label: "Drift Tracking" },
    { id: "promises", label: "All Promises" },
    { id: "insights", label: "Key Findings" },
  ];

  const font = "'IBM Plex Sans', -apple-system, sans-serif";
  const serif = "'IBM Plex Serif', Georgia, serif";
  const mono = "'IBM Plex Mono', monospace";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={{ background: C.surface }}>
        {/* Thin top bar */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "6px 0" }}>
          <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, fontFamily: mono, textTransform: "uppercase", letterSpacing: 2, color: C.textLight }}>Promise Engine &middot; AI/ML</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: 10, fontFamily: mono, padding: "2px 8px", borderRadius: 3,
                color: C.degraded, background: `${C.degraded}12`, border: `1px solid ${C.degraded}28`,
              }}>DEMO DATA</span>
              <span style={{ fontSize: 10, fontFamily: mono, color: C.textLight, letterSpacing: 1 }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
        {/* Masthead */}
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 8px", textAlign: "center" }}>
          <div style={{ borderTop: `3px double ${C.rule}`, borderBottom: `1px solid ${C.rule}`, padding: "16px 0 14px", marginBottom: 10 }}>
            <h1 style={{ fontSize: 38, fontWeight: 700, fontFamily: serif, letterSpacing: -0.5, lineHeight: 1.15, color: C.text }}>
              Are AI Systems Keeping Their Promises?
            </h1>
          </div>
          <div style={{ fontSize: 14, color: C.textMuted, fontFamily: serif, fontStyle: "italic", paddingBottom: 12 }}>
            An accountability report tracking 12 promises across 4 major AI providers — accuracy, safety, transparency, and performance
          </div>
          <div style={{ borderBottom: `1px solid ${C.border}` }} />
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
            {/* Lead story — most critical insight as a featured card */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0,
              padding: "36px 40px", marginBottom: 28,
              borderTop: `4px solid ${C.accent}`,
            }}>
              <div style={{ fontSize: 10, fontFamily: mono, textTransform: "uppercase", letterSpacing: 2, color: C.textLight, marginBottom: 10 }}>Lead Story</div>
              <h2 style={{ fontSize: 30, fontWeight: 700, fontFamily: serif, lineHeight: 1.2, color: C.text, marginBottom: 14 }}>
                {narrative.headline}
              </h2>
              <div style={{ width: 60, height: 2, background: C.accent, marginBottom: 14 }} />
              <p style={{ fontSize: 16, lineHeight: 1.85, color: C.text, fontFamily: serif, maxWidth: 720 }}>
                {narrative.summary}
              </p>
            </div>

            {/* 3-column newspaper layout */}
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 220px", gap: 24, marginBottom: 24 }}>

              {/* LEFT COLUMN — Grade + Status Breakdown */}
              <div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: "24px", marginBottom: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontFamily: mono, textTransform: "uppercase", letterSpacing: 2, color: C.textLight, marginBottom: 12 }}>Overall Grade</div>
                  <div style={{
                    width: 88, height: 88, borderRadius: "50%",
                    border: `4px solid ${narrative.gradeColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, fontWeight: 700, fontFamily: mono, color: narrative.gradeColor,
                    margin: "0 auto 6px",
                  }}>{narrative.grade}</div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: "20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: serif, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>Status Breakdown</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={statusCounts.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={30} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {statusCounts.filter(s => s.value > 0).map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                    {statusCounts.filter(s => s.value > 0).map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{s.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: mono, color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MIDDLE COLUMN — Provider Scorecards stacked */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: serif, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>Provider Scorecards</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    { name: "OpenAI", color: C.openai, promises: PROMISES.filter(p => p.promiser === "openai"), icon: "O" },
                    { name: "Anthropic", color: C.anthropic, promises: PROMISES.filter(p => p.promiser === "anthropic"), icon: "A" },
                    { name: "Google DeepMind", color: C.google, promises: PROMISES.filter(p => p.promiser === "google"), icon: "G" },
                    { name: "Meta AI", color: C.meta, promises: PROMISES.filter(p => p.promiser === "meta"), icon: "M" },
                  ].map(provider => {
                    const v = provider.promises.filter(p => p.status === "verified").length;
                    const total = provider.promises.length;
                    return (
                      <div key={provider.name} style={{
                        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0,
                        padding: "16px 20px", borderLeft: `4px solid ${provider.color}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, fontFamily: serif }}>{provider.name}</span>
                          <span style={{ fontFamily: mono, fontSize: 13, color: provider.color, fontWeight: 700 }}>{v}/{total}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          {provider.promises.map(p => (
                            <div key={p.id} style={{
                              flex: 1, height: 6, borderRadius: 3,
                              background: C[p.status] || C.textMuted,
                            }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>
                          {provider.promises.map(p => p.domain).filter((d, i, a) => a.indexOf(d) === i).join(" · ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN — Domain Health */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: serif, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>Domain Health</div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0, padding: "20px" }}>
                  <div style={{ display: "grid", gap: 14 }}>
                    {domainHealth.sort((a, b) => a.health - b.health).map(d => (
                      <div key={d.domain}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{d.domain}</span>
                          <span style={{ fontSize: 11, fontFamily: mono, color: d.color, fontWeight: 600 }}>{d.count}</span>
                        </div>
                        <div style={{ height: 6, background: C.surfaceDark, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.max(10, ((d.health + 1) / 4) * 100)}%`, height: "100%",
                            background: d.color, borderRadius: 3,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {tab === "drift" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: serif, marginBottom: 6 }}>Hallucination Rate Drift</h2>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                Tracking factual hallucination rates over time. The dashed line at 3% represents a common declared threshold. All providers are trending down, but at different rates.
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={HALLUCINATION_TREND} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <YAxis domain={[0, 8]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 6 }} formatter={(v) => [`${v}%`]} />
                  <ReferenceLine y={3} stroke={C.violated} strokeDasharray="8 4" strokeOpacity={0.5} label={{ value: "3% threshold", position: "right", fontSize: 10, fill: C.violated }} />
                  <Area type="monotone" dataKey="openai" stroke={C.openai} fill="none" strokeWidth={2} dot={{ r: 3 }} name="OpenAI" />
                  <Area type="monotone" dataKey="anthropic" stroke={C.anthropic} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Anthropic" />
                  <Area type="monotone" dataKey="google" stroke={C.google} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Google" />
                  <Area type="monotone" dataKey="meta" stroke={C.meta} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px" }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: serif, marginBottom: 6 }}>Harmful Output Rate</h2>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                Percentage of responses flagged as harmful by independent red-team evaluators. The 0.1% line represents the strictest declared safety threshold (Anthropic's).
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={SAFETY_TREND} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="month" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                  <YAxis domain={[0, 0.5]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 6 }} formatter={(v) => [`${v}%`]} />
                  <ReferenceLine y={0.1} stroke={C.verified} strokeDasharray="8 4" strokeOpacity={0.5} label={{ value: "0.1% threshold", position: "right", fontSize: 10, fill: C.verified }} />
                  <Area type="monotone" dataKey="openai" stroke={C.openai} fill="none" strokeWidth={2} dot={{ r: 3 }} name="OpenAI" />
                  <Area type="monotone" dataKey="anthropic" stroke={C.anthropic} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Anthropic" />
                  <Area type="monotone" dataKey="google" stroke={C.google} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Google" />
                  <Area type="monotone" dataKey="meta" stroke={C.meta} fill="none" strokeWidth={2} dot={{ r: 3 }} name="Meta" />
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
                    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, fontStyle: "italic" }}>{pr.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "insights" && (
          <div>
            {/* Featured first insight — front-page story */}
            {INSIGHTS.length > 0 && (() => {
              const ins = INSIGHTS[0];
              return (
                <div style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0,
                  padding: "36px 40px", marginBottom: 28,
                  borderTop: `4px solid ${C[ins.severity]}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 0.8,
                      color: C[ins.severity], background: `${C[ins.severity]}12`, border: `1px solid ${C[ins.severity]}28`,
                    }}>{ins.severity}</span>
                    <span style={{ fontSize: 11, color: C.textLight, fontFamily: mono }}>{ins.type}</span>
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 700, fontFamily: serif, marginBottom: 14, lineHeight: 1.25, color: C.text }}>{ins.title}</h3>
                  <div style={{ width: 50, height: 2, background: C.accent, marginBottom: 14 }} />
                  <p style={{ fontSize: 16, lineHeight: 1.85, color: C.text, fontFamily: serif, maxWidth: 720, marginBottom: 18 }}>{ins.body}</p>
                  {ins.promises.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {ins.promises.map(pid => {
                        const pr = PROMISES.find(p => p.id === pid);
                        if (!pr) return null;
                        return (
                          <div key={pid} style={{
                            padding: "8px 12px", background: C.surfaceDark, borderRadius: 0,
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
              );
            })()}

            {/* Remaining insights in 2-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {INSIGHTS.slice(1).map((ins, i) => (
                <div key={i} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 0,
                  padding: "24px 28px", borderTop: `3px solid ${C[ins.severity]}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 0.8,
                      color: C[ins.severity], background: `${C[ins.severity]}12`, border: `1px solid ${C[ins.severity]}28`,
                    }}>{ins.severity}</span>
                    <span style={{ fontSize: 11, color: C.textLight, fontFamily: mono }}>{ins.type}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, fontFamily: serif, marginBottom: 10, lineHeight: 1.3 }}>{ins.title}</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: C.text, marginBottom: 14 }}>{ins.body}</p>
                  {ins.promises.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {ins.promises.map(pid => {
                        const pr = PROMISES.find(p => p.id === pid);
                        if (!pr) return null;
                        return (
                          <div key={pid} style={{
                            padding: "6px 10px", background: C.surfaceDark, borderRadius: 0,
                            borderLeft: `3px solid ${C[pr.status]}`, fontSize: 11,
                          }}>
                            <span style={{ fontFamily: mono, color: C.accent, fontWeight: 600, marginRight: 4 }}>{pr.id}</span>
                            <span style={{ color: C.text }}>{pr.body}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
