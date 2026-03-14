// ─── BILL SELECTION CRITERIA & PRIORITY QUEUE ───
// Codified from the Civic Promise Extraction Workflow specification.

import type { BillCandidate, JurisdictionLevel } from "../types/training";

// ─── SELECTION CRITERIA ───

export interface SelectionScore {
  candidate: BillCandidate;
  score: number;
  breakdown: {
    mustHave: number;       // 0-5 (count of must-have criteria met)
    strongPrefer: number;   // 0-5 (count of strong-prefer criteria met)
    datasetGap: number;     // 0-3 (fills domain/jurisdiction/agent-type gaps)
  };
  disqualified: boolean;
  disqualifyReason?: string;
}

export function scoreBillCandidate(
  candidate: BillCandidate,
  existingDomains: Set<string>,
  existingJurisdictions: Set<string>,
  existingAgentTypes: Set<string>,
): SelectionScore {
  let mustHave = 0;
  let strongPrefer = 0;
  let datasetGap = 0;
  let disqualified = false;
  let disqualifyReason: string | undefined;

  // ── Must-Have Criteria ──
  // 1. Passed and enacted (year_enacted > 0 implies this)
  if (candidate.year_enacted > 0) mustHave++;

  // 2. 5+ years old
  const age = new Date().getFullYear() - candidate.year_enacted;
  if (age >= 5) mustHave++;

  // 3. Named agents with specific commitments (proxy: agent_types.length > 1)
  if (candidate.agent_types.length > 1) mustHave++;

  // 4. Verifiable outcomes
  if (candidate.verification_sources.length > 0) mustHave++;

  // 5. Multiple agents and domains
  if (candidate.domains.length >= 2 && candidate.agent_types.length >= 2) mustHave++;

  // ── Strong Prefer ──
  // 1. Known controversies
  if (candidate.known_controversies.length > 0) strongPrefer++;

  // 2. Cross-domain dependencies
  if (candidate.domains.length >= 3) strongPrefer++;

  // 3. Active public data sources
  if (candidate.verification_sources.length >= 3) strongPrefer++;

  // 4. 10-20+ extractable promises
  if (candidate.estimated_promise_count >= 10) strongPrefer++;

  // 5. Implicit — legislative history (candidate exists means we found it)
  strongPrefer++;

  // ── Dataset Gap Bonus ──
  const newDomains = candidate.domains.filter((d) => !existingDomains.has(d));
  if (newDomains.length > 0) datasetGap++;

  if (!existingJurisdictions.has(candidate.jurisdiction)) datasetGap++;

  const newAgentTypes = candidate.agent_types.filter((t) => !existingAgentTypes.has(t));
  if (newAgentTypes.length > 0) datasetGap++;

  // ── Disqualification Checks ──
  if (candidate.estimated_promise_count < 5) {
    disqualified = true;
    disqualifyReason = "Fewer than 5 extractable promises";
  }
  if (candidate.agent_types.length <= 1) {
    disqualified = true;
    disqualifyReason = "Single agent type — no network structure";
  }

  const score = (mustHave * 20) + (strongPrefer * 10) + (datasetGap * 15);

  return {
    candidate,
    score,
    breakdown: { mustHave, strongPrefer, datasetGap },
    disqualified,
    disqualifyReason,
  };
}

// ─── PRIORITY BILL QUEUE ───
// First 10 candidates ordered by training value.

export const PRIORITY_BILL_QUEUE: BillCandidate[] = [
  // ── Tier 1: High Value, Well-Documented ──
  {
    title: "Clean Air Act Amendments of 1990",
    jurisdiction: "United States",
    level: "federal",
    year_enacted: 1990,
    section_count: 11,
    estimated_promise_count: 35,
    known_controversies: [
      "Acid rain trading program debate",
      "Ozone non-attainment extensions",
      "Mobile source emissions standards contested by auto industry",
    ],
    verification_sources: [
      "EPA Acid Rain Program data",
      "EPA Air Quality System (AQS)",
      "EIA electricity generation data",
      "State DEQ compliance reports",
    ],
    domains: ["Emissions", "Air Quality", "Acid Rain", "Ozone", "Mobile Sources", "Enforcement", "Market Mechanisms"],
    agent_types: ["legislator", "regulator", "utility", "community", "stakeholder"],
    training_value_notes: "30+ years of EPA compliance data. Rich multi-agent network. Known successes (acid rain cap-and-trade) and known struggles (ozone non-attainment). Diverse mechanisms: command-and-control, market-based, technology-forcing.",
    selection_status: "extracted",
  },
  {
    title: "Dodd-Frank Wall Street Reform and Consumer Protection Act",
    jurisdiction: "United States",
    level: "federal",
    year_enacted: 2010,
    section_count: 16,
    estimated_promise_count: 40,
    known_controversies: [
      "Volcker Rule implementation delays",
      "CFPB authority challenges",
      "Rollbacks under Economic Growth Act of 2018",
      "Derivatives regulation contested by financial industry",
    ],
    verification_sources: [
      "SEC enforcement data",
      "CFPB complaint database",
      "Federal Reserve stress test results",
      "OCC annual reports",
      "FSOC annual reports",
    ],
    domains: ["Financial Regulation", "Consumer Protection", "Systemic Risk", "Derivatives", "Banking", "Enforcement", "Reporting"],
    agent_types: ["legislator", "regulator", "stakeholder", "executive", "judiciary"],
    training_value_notes: "15+ years of implementation data. Many provisions delayed, watered down, or repealed. Good degradation/violation labels. Named agencies with deadlines. Rulemaking completion data available from Davis Polk tracker.",
    selection_status: "extracted",
  },
  {
    title: "No Child Left Behind Act / Every Student Succeeds Act",
    jurisdiction: "United States",
    level: "federal",
    year_enacted: 2001,
    estimated_promise_count: 30,
    known_controversies: [
      "Adequate Yearly Progress standards",
      "Teaching to the test concerns",
      "Unfunded mandate allegations",
      "NCLB → ESSA transition disruption",
    ],
    verification_sources: [
      "NCES data",
      "State education department report cards",
      "NAEP scores",
      "ED.gov compliance reports",
    ],
    domains: ["Education", "Accountability", "Assessment", "Equity", "Teacher Quality", "Funding", "State Flexibility"],
    agent_types: ["legislator", "regulator", "community", "provider", "executive"],
    training_value_notes: "20+ years of outcome data. Eventually replaced by ESSA (2015) — natural experiment in promise network evolution. Measurable targets at state level. Known failures (AYP impossibility) alongside structural successes.",
    selection_status: "extracted",
  },
  {
    title: "California SB 100 — 100% Clean Energy Act of 2018",
    jurisdiction: "California",
    level: "state",
    year_enacted: 2018,
    estimated_promise_count: 20,
    known_controversies: [
      "Reliability concerns during heat waves",
      "Cost impact on ratepayers",
      "Natural gas phase-out timeline",
    ],
    verification_sources: [
      "CPUC filings",
      "CEC integrated energy reports",
      "CARB emissions data",
      "California ISO generation data",
    ],
    domains: ["Emissions", "Clean Energy", "Planning", "Reliability", "Affordability", "Equity"],
    agent_types: ["legislator", "regulator", "utility", "community"],
    training_value_notes: "Direct structural parallel to HB 2021 but different jurisdiction, different utilities, different timeline. Good for testing cross-jurisdiction transfer. Same policy domain, different implementation.",
    selection_status: "candidate",
  },

  // ── Tier 2: Domain Expansion ──
  {
    title: "Americans with Disabilities Act of 1990",
    jurisdiction: "United States",
    level: "federal",
    year_enacted: 1990,
    estimated_promise_count: 25,
    known_controversies: [
      "Reasonable accommodation scope",
      "Web accessibility requirements",
      "Employment discrimination enforcement gaps",
      "Public transit compliance timelines",
    ],
    verification_sources: [
      "DOJ enforcement data",
      "EEOC charge statistics",
      "FTA compliance reports",
      "Census disability data",
    ],
    domains: ["Civil Rights", "Employment", "Public Accommodations", "Transportation", "Communications", "Enforcement"],
    agent_types: ["legislator", "regulator", "stakeholder", "community", "judiciary"],
    training_value_notes: "35 years of enforcement data. Civil rights domain — equity verification patterns. Multiple agent types including employers, public entities, transport agencies. Known enforcement gaps.",
    selection_status: "candidate",
  },
  {
    title: "Sarbanes-Oxley Act of 2002",
    jurisdiction: "United States",
    level: "federal",
    year_enacted: 2002,
    estimated_promise_count: 20,
    known_controversies: [
      "Section 404 compliance costs for small companies",
      "PCAOB independence challenges",
      "Whistleblower protection effectiveness",
    ],
    verification_sources: [
      "SEC enforcement data",
      "PCAOB inspection reports",
      "GAO reports on SOX compliance",
      "Corporate annual reports (10-K)",
    ],
    domains: ["Corporate Governance", "Audit", "Financial Reporting", "Whistleblower", "Enforcement", "Certification"],
    agent_types: ["legislator", "regulator", "auditor", "stakeholder", "executive"],
    training_value_notes: "New agent type: corporate officers with personal certification. Well-documented compliance and violation data. 20+ years. Auditor oversight (PCAOB) is itself a promise network.",
    selection_status: "candidate",
  },
  {
    title: "National Environmental Policy Act (NEPA) of 1970",
    jurisdiction: "United States",
    level: "federal",
    year_enacted: 1970,
    estimated_promise_count: 15,
    known_controversies: [
      "Environmental review delays (average 4.5 years for EIS)",
      "Permitting reform efforts (2023-present)",
      "Categorical exclusion expansions",
      "Climate change analysis requirements",
    ],
    verification_sources: [
      "CEQ NEPA statistics",
      "EPA EIS filing data",
      "Federal court case database",
      "GAO NEPA implementation reports",
    ],
    domains: ["Environmental Review", "Permitting", "Public Participation", "Agency Coordination", "Litigation"],
    agent_types: ["legislator", "regulator", "community", "judiciary", "executive"],
    training_value_notes: "50+ year track record. Known for delays and litigation. Procedural promises — models a different kind of commitment than substantive targets. Recent reform attempts provide natural experiment.",
    selection_status: "candidate",
  },

  // ── Tier 3: State-Level Diversity ──
  {
    title: "Massachusetts Health Reform (Chapter 58 of 2006)",
    jurisdiction: "Massachusetts",
    level: "state",
    year_enacted: 2006,
    estimated_promise_count: 20,
    known_controversies: [
      "Individual mandate effectiveness",
      "Commonwealth Health Insurance Connector implementation",
      "Cost containment challenges",
    ],
    verification_sources: [
      "MA Division of Insurance data",
      "MA Health Connector enrollment reports",
      "CHIA annual reports",
      "Census ACS data for MA",
    ],
    domains: ["Coverage Expansion", "Individual Mandate", "Insurance Reform", "Affordability", "Medicaid", "Enforcement"],
    agent_types: ["legislator", "regulator", "insurer", "community", "provider"],
    training_value_notes: "Precursor to ACA. Individual mandate, exchange, Medicaid expansion. State-level health policy with 20 years of outcome data. Direct comparison with federal ACA implementation.",
    selection_status: "candidate",
  },
  {
    title: "Washington Climate Commitment Act (SB 5126)",
    jurisdiction: "Washington",
    level: "state",
    year_enacted: 2021,
    estimated_promise_count: 25,
    known_controversies: [
      "I-2117 repeal initiative (2024)",
      "Allowance price volatility",
      "Revenue allocation disputes",
      "Tribal consultation requirements",
    ],
    verification_sources: [
      "WA Ecology cap-and-invest data",
      "WA Commerce clean energy reports",
      "WA DOR revenue data",
      "Climate Commitment Account spending reports",
    ],
    domains: ["Emissions", "Cap-and-Invest", "Revenue Allocation", "Equity", "Tribal", "Transportation", "Workforce"],
    agent_types: ["legislator", "regulator", "utility", "community", "stakeholder"],
    training_value_notes: "Another HB 2021 parallel with different mechanism (cap-and-invest vs. utility mandates). Recently under political threat via ballot initiative. Good for modeling promise degradation in real time.",
    selection_status: "candidate",
  },
  {
    title: "Colorado HB 19-1261 — Climate Action Plan to Reduce Pollution",
    jurisdiction: "Colorado",
    level: "state",
    year_enacted: 2019,
    estimated_promise_count: 18,
    known_controversies: [
      "2030 target achievability",
      "Oil and gas sector resistance",
      "Environmental justice community engagement",
    ],
    verification_sources: [
      "CDPHE emissions inventory",
      "CO PUC clean energy plan filings",
      "CO Energy Office reports",
      "AQCC rulemaking records",
    ],
    domains: ["Emissions", "Clean Energy", "Transportation", "Oil and Gas", "Equity", "Planning", "Enforcement"],
    agent_types: ["legislator", "regulator", "utility", "community", "stakeholder"],
    training_value_notes: "7 years of implementation data. Multiple state agencies, cross-sector commitments. Oil and gas sector creates unique agent dynamics not present in OR/WA/CA bills.",
    selection_status: "candidate",
  },
];

// ─── BILL SOURCING REFERENCES ───

export const BILL_SOURCES = {
  federal: {
    "congress.gov": "Full text, legislative history, status tracking",
    "GovInfo API": "Bulk access to enrolled bills, committee reports, CRS summaries",
    "ProPublica Congress API": "Bill metadata, vote records, sponsor info",
    "GovTrack.us": "Bill tracking with structured data, historical archive back to 1973",
  },
  state: {
    "LegiScan API": "All 50 states, bill text, status, votes, sponsors",
    "NCSL": "Curated policy databases by topic",
    "Ballotpedia": "Legislation tracking with context",
  },
  verification_by_domain: {
    "Environment/Emissions": ["EPA", "State DEQs", "EIA", "Utility PUC filings"],
    "Health": ["CMS", "HHS reports", "State health departments", "CDC WONDER"],
    "Education": ["NCES", "State education department report cards"],
    "Housing": ["HUD", "Census Bureau ACS", "State housing finance agencies"],
    "Infrastructure": ["DOT", "FHWA", "State DOTs", "Army Corps of Engineers"],
    "Criminal Justice": ["BJS", "State corrections departments", "Court records"],
    "Labor/Workforce": ["BLS", "State workforce agencies", "OSHA"],
    "Finance/Budget": ["CBO", "State budget offices", "Comptroller reports"],
  },
} as const;
