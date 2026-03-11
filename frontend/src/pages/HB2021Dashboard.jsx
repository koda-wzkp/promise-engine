import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { api } from "../utils/api";

// ─── DATA ───
const AGENTS = [
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

const PROMISES = [
  { id: "P001", ref: "\u00a73(1)(a)", promiser: "pge", promisee: "ratepayers", body: "Reduce GHG emissions 80% below baseline by 2030", domain: "Emissions", target: "2030-12-31", status: "degraded", progress: 27, required: 80, note: "27% below baseline as of 2022. Must reach 80% by 2030. On track but questions remain about Colstrip, gas plants, and market accounting." },
  { id: "P002", ref: "\u00a73(1)(b)", promiser: "pge", promisee: "ratepayers", body: "Reduce GHG emissions 90% below baseline by 2035", domain: "Emissions", target: "2035-12-31", status: "declared", progress: 27, required: 90, note: "Depends on P001 trajectory." },
  { id: "P003", ref: "\u00a73(1)(c)", promiser: "pge", promisee: "ratepayers", body: "100% clean electricity by 2040", domain: "Emissions", target: "2040-12-31", status: "declared", progress: 27, required: 100, note: "Terminal target. Depends on full cascade." },
  { id: "P004", ref: "\u00a73(1)(a)", promiser: "pacificorp", promisee: "ratepayers", body: "Reduce GHG emissions 80% below baseline by 2030", domain: "Emissions", target: "2030-12-31", status: "violated", progress: 13, required: 80, note: "Only 13% below baseline. Canceled 1.5GW renewables. Coal-to-gas conversion. Clean Energy Plan rejected by PUC." },
  { id: "P005", ref: "\u00a73(1)(b)", promiser: "pacificorp", promisee: "ratepayers", body: "Reduce GHG emissions 90% below baseline by 2035", domain: "Emissions", target: "2035-12-31", status: "violated", progress: 13, required: 90, note: "Dependent on P004. Current trajectory far short." },
  { id: "P006", ref: "\u00a73(1)(c)", promiser: "pacificorp", promisee: "ratepayers", body: "100% clean electricity by 2040", domain: "Emissions", target: "2040-12-31", status: "violated", progress: 13, required: 100, note: "Entire PacifiCorp chain at risk." },
  { id: "P007", ref: "\u00a73(1)", promiser: "ess", promisee: "ratepayers", body: "Meet same clean energy targets (80/90/100%)", domain: "Emissions", target: "2040-12-31", status: "declared", progress: null, required: null, note: "Lighter oversight. No Clean Energy Plan required." },
  { id: "P008", ref: "\u00a74(1-2)", promiser: "pge", promisee: "or-puc", body: "Submit Clean Energy Plan with each IRP", domain: "Planning", target: null, status: "degraded", progress: null, required: null, note: "Partially accepted Jan 2024. Short-term ok, long-term revisions needed." },
  { id: "P009", ref: "\u00a74(1-2)", promiser: "pacificorp", promisee: "or-puc", body: "Submit Clean Energy Plan with each IRP", domain: "Planning", target: null, status: "violated", progress: null, required: null, note: "Clean Energy Plan fully rejected by PUC." },
  { id: "P010", ref: "\u00a75(1)", promiser: "or-deq", promisee: "or-puc", body: "Verify emissions and establish baselines", domain: "Verification", target: null, status: "verified", progress: null, required: null, note: "DEQ has published verification orders for both utilities." },
  { id: "P011", ref: "\u00a75(2)", promiser: "or-puc", promisee: "ratepayers", body: "Acknowledge CEPs only if in public interest", domain: "Verification", target: null, status: "verified", progress: null, required: null, note: "PUC exercised authority: partially accepted PGE, rejected PacifiCorp." },
  { id: "P012", ref: "\u00a72(4)", promiser: "or-legislature", promisee: "ej-communities", body: "Minimize burdens for environmental justice communities", domain: "Equity", target: null, status: "unverifiable", progress: null, required: null, note: "Policy declaration. No measurable standard or verification mechanism." },
  { id: "P013", ref: "\u00a72(2)", promiser: "or-legislature", promisee: "workers", body: "Create living wage jobs and promote workforce equity", domain: "Equity", target: null, status: "unverifiable", progress: null, required: null, note: "Qualified 'to the maximum extent practicable.' No standard defined." },
  { id: "P014", ref: "\u00a76(1)", promiser: "pge", promisee: "ej-communities", body: "Convene Community Benefits Advisory Group", domain: "Equity", target: null, status: "verified", progress: null, required: null, note: "UCBIAG convened. Biennial reports filed." },
  { id: "P015", ref: "\u00a76(1)", promiser: "pacificorp", promisee: "ej-communities", body: "Convene Community Benefits Advisory Group", domain: "Equity", target: null, status: "verified", progress: null, required: null, note: "UCBIAG convened." },
  { id: "P016", ref: "\u00a74(4)(f)", promiser: "pge", promisee: "ratepayers", body: "Affordable, reliable, clean electric system", domain: "Affordability", target: null, status: "degraded", progress: null, required: null, note: "Significant rate increases. Residential bills reportedly doubled 2023\u21922024." },
  { id: "P017", ref: "\u00a74(4)(f)", promiser: "pacificorp", promisee: "ratepayers", body: "Affordable, reliable, clean electric system", domain: "Affordability", target: null, status: "degraded", progress: null, required: null, note: "Wildfire liabilities constraining finances." },
  { id: "P018", ref: "\u00a72(3)", promiser: "or-legislature", promisee: "tribes", body: "Meaningful tribal consultation on energy facility siting", domain: "Tribal", target: null, status: "unverifiable", progress: null, required: null, note: "Policy promise with no compliance standard." },
  { id: "P019", ref: "\u00a726", promiser: "or-legislature", promisee: "workers", body: "Responsible contractor standards for \u226510MW projects", domain: "Workforce", target: null, status: "declared", progress: null, required: null, note: "Sub-10MW projects have no workforce protections." },
  { id: "P020", ref: "\u00a718", promiser: "or-deq", promisee: "or-legislature", body: "Report on small-scale renewables by Sep 2022", domain: "Planning", target: "2022-09-30", status: "verified", progress: 100, required: 100, note: "Completed and delivered." },
];

// Trajectory data
const PGE_TRAJECTORY = [
  { year: 2012, actual: 0, label: "Baseline" },
  { year: 2018, actual: 15, label: "" },
  { year: 2020, actual: 22, label: "Boardman closed" },
  { year: 2022, actual: 27, label: "Latest data" },
  { year: 2026, projected: 45, label: "Now" },
  { year: 2030, target: 80, projected: 60, label: "Target: 80%" },
  { year: 2035, target: 90, projected: 78, label: "Target: 90%" },
  { year: 2040, target: 100, projected: 92, label: "Target: 100%" },
];

const PAC_TRAJECTORY = [
  { year: 2012, actual: 0, label: "Baseline" },
  { year: 2018, actual: 5, label: "" },
  { year: 2022, actual: 13, label: "Latest data" },
  { year: 2026, projected: 20, label: "Now" },
  { year: 2030, target: 80, projected: 32, label: "Target: 80%" },
  { year: 2035, target: 90, projected: 48, label: "Target: 90%" },
  { year: 2040, target: 100, projected: 62, label: "Target: 100%" },
];

const INSIGHTS = [
  { severity: "critical", type: "Cascade", title: "PacifiCorp's entire promise chain is off track",
    body: "PacifiCorp's Clean Energy Plan was rejected by the PUC. Without an approved plan, the utility has no defined pathway to its 2030, 2035, or 2040 targets. Compounding factors: canceled 1.5GW of renewable procurement after wildfire liabilities, and a decision to convert coal plants to natural gas instead of renewables. At 13% emissions reduction (2022), PacifiCorp needs to cut another 67 percentage points in under 4 years to meet the 2030 target.",
    promises: ["P004","P005","P006","P009"] },
  { severity: "critical", type: "Gap", title: "Equity promises have no accountability mechanism",
    body: "Three promises \u2014 to environmental justice communities (P012), workers (P013), and tribes (P018) \u2014 have no defined way to verify them. The law makes commitments to Oregon's most vulnerable populations but provides no measurable standard, no reporting requirement, and no compliance determination. The communities HB 2021 claims to protect have the least structured way to know if the promises are being kept.",
    promises: ["P012","P013","P018"] },
  { severity: "warning", type: "Conflict", title: "Clean energy targets vs. affordability: the law's built-in tension",
    body: "If cumulative rate increases from clean energy investments exceed 6% of annual revenue, the PUC must exempt utilities from further compliance (\u00a710). Ratepayers report bills doubling. The 100%-by-2040 promise is conditional on the cost of keeping it \u2014 and the safety valve favors affordability over emissions. Both PGE and PacifiCorp's affordability promises (P016, P017) are degraded.",
    promises: ["P001","P004","P016","P017"] },
  { severity: "positive", type: "Working", title: "The verification system caught the problem",
    body: "DEQ established baselines and verified emissions as required. The PUC exercised its authority \u2014 accepting PGE's plan partially and rejecting PacifiCorp's entirely. The accountability mechanism designed into HB 2021 is functioning. The law's oversight caught PacifiCorp's non-compliance. The open question is what happens next.",
    promises: ["P010","P011"] },
];

// ─── STYLES ───
const C = {
  bg: "#faf9f6", surface: "#ffffff", surfaceDark: "#f5f3ee",
  border: "#e2ddd5", text: "#2d2a26", textMuted: "#7a7267", textLight: "#a09889",
  accent: "#1a5f4a", accentLight: "#e8f2ee",
  verified: "#1a5f4a", declared: "#6b7280", degraded: "#b45309",
  violated: "#b91c1c", unverifiable: "#7c3aed",
  positive: "#1a5f4a", warning: "#b45309", critical: "#b91c1c",
  pge: "#2563eb", pac: "#dc2626",
};

const STATUS_LABELS = { verified: "On Track", declared: "Declared", degraded: "Behind Schedule", violated: "Off Track", unverifiable: "No Verification" };
const agentTypeColors = { legislator: "#6366f1", utility: "#d97706", regulator: "#0891b2", community: "#16a34a", auditor: "#8b5cf6" };

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

// ─── NARRATIVE GENERATOR ───
function generateNarrative() {
  const total = PROMISES.length;
  const verified = PROMISES.filter(p => p.status === "verified").length;
  const degraded = PROMISES.filter(p => p.status === "degraded").length;
  const violated = PROMISES.filter(p => p.status === "violated").length;
  const unverifiable = PROMISES.filter(p => p.status === "unverifiable").length;

  return {
    headline: violated > 0
      ? `${violated} of ${total} promises are off track`
      : degraded > 0
        ? `Progress is mixed: ${degraded} promises behind schedule`
        : `${verified} of ${total} promises on track`,
    grade: violated >= 3 ? "C-" : violated >= 1 ? "C" : degraded >= 3 ? "B-" : "B",
    gradeColor: violated >= 3 ? C.violated : violated >= 1 ? C.degraded : C.verified,
    summary: `Oregon's HB 2021 made ${total} specific promises about clean electricity, environmental justice, affordability, and tribal rights. Five years in, ${verified} are on track, ${degraded} are behind schedule, ${violated} are off track, and ${unverifiable} have no way to verify them at all.`,
    pge: `PGE has reduced emissions 27% from its 2010\u20132012 baseline. That's progress, but the utility needs to reach 80% by 2030 \u2014 more than tripling its reduction in less than 4 years. Its Clean Energy Plan was partially accepted by regulators, with long-term revisions required. Closing the Boardman coal plant helped, but questions remain about its remaining gas plants, its share of the Colstrip coal plant in Montana, and how regional electricity market changes will affect emissions accounting.`,
    pac: `PacifiCorp is in trouble. At just 13% below baseline, it needs to cut emissions by another 67 percentage points by 2030. Its Clean Energy Plan was rejected outright by regulators. The utility canceled 1.5 gigawatts of planned renewable energy after wildfire liability damages, and is converting coal plants to natural gas instead of replacing them with renewables. As a six-state utility, PacifiCorp must balance Oregon's aggressive targets against states like Utah and Wyoming that have weaker climate goals. Independent analysis by the Citizens' Utility Board found that PacifiCorp's multi-state plans consistently overstate future emissions reductions.`,
    equity: `The law's promises to environmental justice communities, workers, and tribes are its weakest link \u2014 not because they've fallen off track, but because there's no way to tell. Three promises have no defined verification mechanism: the commitment to minimize burdens on EJ communities (\u00a72(4)), the workforce equity aspiration (\u00a72(2)), and the tribal consultation requirement (\u00a72(3)). Both utilities have convened their required Community Benefits Advisory Groups, but these are advisory bodies \u2014 they inform regulators, they don't determine compliance.`,
    bottom: `The good news: the oversight system is working. DEQ verified emissions. The PUC caught PacifiCorp's non-compliance and rejected its plan. The problem isn't that no one is watching \u2014 it's that what they're watching is uneven. The emissions promises have robust verification. The equity promises have almost none.`,
  };
}

// ─── MAIN ───
export default function HB2021Dashboard() {
  const [tab, setTab] = useState("summary");
  const [domainFilter, setDomainFilter] = useState("All");
  const [liveData, setLiveData] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading"); // loading | connected | offline

  // Fetch live data from API (falls back to hardcoded data gracefully)
  useEffect(() => {
    let cancelled = false;
    api.hb2021.dashboard()
      .then(data => {
        if (!cancelled && data.success) {
          setLiveData(data.dashboard);
          setApiStatus("connected");
        }
      })
      .catch(() => {
        if (!cancelled) setApiStatus("offline");
      });
    return () => { cancelled = true; };
  }, []);

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
    { id: "trajectory", label: "Emissions Trajectory" },
    { id: "promises", label: "All Promises" },
    { id: "insights", label: "Key Findings" },
    { id: "about", label: "About" },
  ];

  const font = "'IBM Plex Sans', -apple-system, sans-serif";
  const serif = "'IBM Plex Serif', Georgia, serif";
  const mono = "'IBM Plex Mono', monospace";

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: C.textLight, fontFamily: mono, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Promise Engine &middot; Civic Pilot</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: serif, letterSpacing: -0.5, marginBottom: 4 }}>
            Is Oregon's Clean Electricity Law Working?
          </h1>
          <div style={{ fontSize: 14, color: C.textMuted }}>
            Tracking the 20 promises in HB 2021 &mdash; who made them, to whom, and whether they're being kept
          </div>
        </div>
      </header>

      {/* TABS */}
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

        {/* SUMMARY */}
        {tab === "summary" && (
          <div>
            {/* Hero card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "32px 36px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "start", gap: 32, flexWrap: "wrap" }}>
                {/* Grade */}
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
                {/* Narrative */}
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

            {/* Infographic row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Status breakdown */}
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

              {/* Domain health */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "24px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: serif, marginBottom: 16 }}>Health by Domain</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {domainHealth.sort((a, b) => a.health - b.health).map(d => (
                    <div key={d.domain} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: C.text, minWidth: 90, fontWeight: 500 }}>{d.domain}</span>
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

            {/* Narrative sections */}
            <div style={{ display: "grid", gap: 20 }}>
              {[
                { title: "Portland General Electric", icon: "\u26a1", text: narrative.pge, color: C.pge },
                { title: "PacifiCorp / Pacific Power", icon: "\u26a0", text: narrative.pac, color: C.pac },
                { title: "Environmental Justice & Equity", icon: "\u2696", text: narrative.equity, color: C.unverifiable },
                { title: "The Bottom Line", icon: "\u2192", text: narrative.bottom, color: C.accent },
              ].map((section, i) => (
                <div key={i} style={{
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: "24px 28px", borderLeft: `4px solid ${section.color}`,
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: serif, marginBottom: 10, color: C.text }}>
                    <span style={{ marginRight: 8 }}>{section.icon}</span>{section.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>{section.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAJECTORY */}
        {tab === "trajectory" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, fontFamily: serif }}>Are utilities on track to meet their targets?</h2>
                {apiStatus !== "loading" && (
                  <span style={{
                    fontSize: 10, fontFamily: mono, padding: "3px 8px", borderRadius: 3,
                    color: apiStatus === "connected" ? C.verified : C.textLight,
                    background: apiStatus === "connected" ? `${C.verified}12` : C.surfaceDark,
                  }}>{apiStatus === "connected" ? "LIVE" : "STATIC"}</span>
                )}
              </div>
              <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
                The chart below shows actual emissions reductions (solid lines) and projected trajectories (dashed) against the statutory targets. The gap between the dashed line and the target line is the amount of additional reduction each utility needs to achieve.
                {liveData && ` Data verified by Promise Engine API — ${liveData.utilities?.length || 0} utilities tracked.`}
              </p>

              {/* PGE Chart */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: C.pge }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>Portland General Electric</span>
                  <StatusBadge status="degraded" />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={PGE_TRAJECTORY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                    <YAxis domain={[0, 105]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 6 }} formatter={(v) => [`${v}%`]} />
                    <Area type="monotone" dataKey="actual" stroke={C.pge} fill={`${C.pge}20`} strokeWidth={2.5} dot={{ r: 4, fill: C.pge }} name="Actual reduction" />
                    <Area type="monotone" dataKey="projected" stroke={C.pge} fill="none" strokeWidth={1.5} strokeDasharray="6 4" dot={{ r: 3, fill: "white", stroke: C.pge }} name="Projected" />
                    <Area type="monotone" dataKey="target" stroke={C.verified} fill="none" strokeWidth={2} strokeDasharray="2 2" dot={{ r: 4, fill: C.verified }} name="Required target" />
                    <ReferenceLine y={80} stroke={C.verified} strokeDasharray="8 4" strokeOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.6, fontStyle: "italic" }}>
                  PGE is 27% of the way to its 2030 target of 80%. Projections suggest it may reach ~60% by 2030 under current plans &mdash; a significant gap. Closing Boardman coal plant and developing Clearwater Wind Farm helped, but gas plants, the Colstrip stake, and market accounting remain open questions.
                </p>
              </div>

              {/* PacifiCorp Chart */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: C.pac }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>PacifiCorp / Pacific Power</span>
                  <StatusBadge status="violated" />
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={PAC_TRAJECTORY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="year" fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} />
                    <YAxis domain={[0, 105]} fontSize={11} fontFamily={mono} tick={{ fill: C.textMuted }} tickFormatter={v => `${v}%`} />
                    <Tooltip contentStyle={{ fontSize: 12, fontFamily: font, border: `1px solid ${C.border}`, borderRadius: 6 }} formatter={(v) => [`${v}%`]} />
                    <Area type="monotone" dataKey="actual" stroke={C.pac} fill={`${C.pac}20`} strokeWidth={2.5} dot={{ r: 4, fill: C.pac }} name="Actual reduction" />
                    <Area type="monotone" dataKey="projected" stroke={C.pac} fill="none" strokeWidth={1.5} strokeDasharray="6 4" dot={{ r: 3, fill: "white", stroke: C.pac }} name="Projected (current pace)" />
                    <Area type="monotone" dataKey="target" stroke={C.verified} fill="none" strokeWidth={2} strokeDasharray="2 2" dot={{ r: 4, fill: C.verified }} name="Required target" />
                    <ReferenceLine y={80} stroke={C.verified} strokeDasharray="8 4" strokeOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8, lineHeight: 1.6, fontStyle: "italic" }}>
                  PacifiCorp is dramatically off track. At 13% reduction, the utility would need to cut emissions by 67 more percentage points in under 4 years. Its projected trajectory under current pace reaches only ~32% by 2030 &mdash; less than half the required 80%. The rejected Clean Energy Plan, canceled renewables, and coal-to-gas conversions make this the most critical failure in the HB 2021 promise network.
                </p>
              </div>
            </div>

            {/* Live projections from API */}
            {liveData?.utilities && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "28px 32px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: serif, marginBottom: 16 }}>Promise Engine Projections (Live)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {liveData.utilities.map(u => (
                    <div key={u.id} style={{ padding: 16, background: C.surfaceDark, borderRadius: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                        Current: {u.emissions.actual_reduction_pct}% reduction (gap: {u.emissions.gap_pct}%)
                      </div>
                      {Object.entries(u.projections).map(([year, proj]) => (
                        <div key={year} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: mono, fontSize: 12, minWidth: 36 }}>{year}</span>
                          <div style={{ flex: 1, height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              width: `${Math.min(proj.projected_pct, 100)}%`, height: "100%",
                              background: proj.on_track ? C.verified : C.violated, borderRadius: 3,
                            }} />
                          </div>
                          <span style={{ fontFamily: mono, fontSize: 11, color: proj.on_track ? C.verified : C.violated, fontWeight: 600, minWidth: 44, textAlign: "right" }}>
                            {proj.projected_pct}%
                          </span>
                          <span style={{ fontFamily: mono, fontSize: 10, color: C.textLight, minWidth: 36, textAlign: "right" }}>
                            /{proj.target_pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ALL PROMISES */}
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
                        <span style={{ fontFamily: mono, fontSize: 11, color: C.textLight }}>{pr.ref}</span>
                        <span style={{ fontSize: 11, color: C.textMuted, background: C.surfaceDark, padding: "2px 8px", borderRadius: 3 }}>{pr.domain}</span>
                      </div>
                      <StatusBadge status={pr.status} />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 6, lineHeight: 1.4 }}>{pr.body}</div>
                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: agentTypeColors[promiser?.type] }}>{promiser?.name}</span>
                      <span style={{ margin: "0 6px", color: C.textLight }}>promised to</span>
                      <span style={{ fontWeight: 600, color: agentTypeColors[promisee?.type] }}>{promisee?.name}</span>
                      {pr.target && <span style={{ marginLeft: 10, fontFamily: mono, color: C.textLight }}>by {new Date(pr.target).getFullYear()}</span>}
                    </div>
                    {pr.progress !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ flex: 1, maxWidth: 300, height: 6, background: C.surfaceDark, borderRadius: 3, overflow: "visible", position: "relative" }}>
                          <div style={{ width: `${Math.min(pr.progress, 100)}%`, height: "100%", background: C[pr.status], borderRadius: 3 }} />
                          {pr.required && <div style={{ position: "absolute", left: `${pr.required}%`, top: -4, width: 2, height: 14, background: C.verified, borderRadius: 1, opacity: 0.5 }} />}
                        </div>
                        <span style={{ fontFamily: mono, fontSize: 12, color: C[pr.status], fontWeight: 600 }}>{pr.progress}%</span>
                        {pr.required && <span style={{ fontFamily: mono, fontSize: 11, color: C.textLight }}>of {pr.required}% target</span>}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, fontStyle: "italic" }}>{pr.note}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INSIGHTS */}
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

        {/* ABOUT */}
        {tab === "about" && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "36px 40px", maxWidth: 700, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: serif, marginBottom: 16 }}>What is this?</h2>
            <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              This dashboard tracks the specific promises embedded in Oregon's HB 2021 &mdash; the 100% Clean Electricity law signed in 2021. It shows who promised what to whom, whether those promises are being kept, and where the gaps are.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              Every fact comes from public sources: the enrolled text of HB 2021, Oregon PUC orders, DEQ verification reports, and independent analysis by the Oregon Citizens' Utility Board. No proprietary data is used.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
              The framework is called <strong>Promise Networks</strong>. It decomposes legislation into a structured graph of commitments &mdash; making accountability legible. The same approach can be applied to any institution that makes commitments to stakeholders.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
              This is a pilot project. The goal is to give Oregonians a tool for holding their institutions to the commitments those institutions have made.
            </p>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Built by Koda Nolan-Finkel &middot; Pleco / Promise Engine &middot; Portland, OR<br />
              Based on Promise Theory (Burgess, 2004) &middot; Open source &middot; Not affiliated with any government agency or utility
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
