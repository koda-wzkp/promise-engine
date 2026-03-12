import { Agent, Promise, Insight, DashboardData } from "../types/promise";

// ─── AGENTS ───
// 12 agents representing the key promisers and promisees in federal drug policy
export const WOD_AGENTS: Agent[] = [
  { id: "congress", name: "U.S. Congress", type: "legislator", short: "CON" },
  { id: "dea", name: "Drug Enforcement Administration", type: "federal", short: "DEA" },
  { id: "ondcp", name: "Office of National Drug Control Policy", type: "federal", short: "OND" },
  { id: "doj", name: "Department of Justice", type: "federal", short: "DOJ" },
  { id: "hhs", name: "Department of Health & Human Services", type: "federal", short: "HHS" },
  { id: "samhsa", name: "Substance Abuse & Mental Health Services Admin", type: "federal", short: "SAM" },
  { id: "bop", name: "Federal Bureau of Prisons", type: "federal", short: "BOP" },
  { id: "ussc", name: "U.S. Sentencing Commission", type: "judiciary", short: "USC" },
  { id: "public", name: "General Public", type: "community", short: "PUB" },
  { id: "communities-of-color", name: "Communities of Color", type: "community", short: "COC" },
  { id: "gao", name: "Government Accountability Office", type: "auditor", short: "GAO" },
  { id: "states", name: "State Governments", type: "regulator", short: "STA" },
];

// ─── PROMISES ───
// 20 promises extracted from major federal drug policy legislation and commitments.
// Each maps a specific, attributable commitment to a falsifiable outcome.
export const WOD_PROMISES: Promise[] = [
  // ── Controlled Substances Act (1970) ──
  {
    id: "WOD-001",
    promiser: "congress",
    promisee: "public",
    body: "Establish a rational drug scheduling system based on medical and scientific findings",
    domain: "Scheduling",
    status: "degraded",
    note: "The CSA (P.L. 91-513) created five schedules based on abuse potential and accepted medical use. However, cannabis remains Schedule I despite FDA-acknowledged medical applications and 38 states legalizing medical use. The DEA has resisted rescheduling despite multiple petitions. In 2024, DEA proposed rescheduling cannabis to Schedule III but has not finalized the rule. Source: Congressional Research Service R44782; DEA docket DEA-2024-0059.",
    verification: { method: "filing", source: "DEA Scheduling Actions" },
    depends_on: [],
  },
  {
    id: "WOD-002",
    promiser: "dea",
    promisee: "public",
    body: "Reduce drug availability through enforcement of controlled substance laws",
    domain: "Enforcement",
    status: "violated",
    note: "DEA's core mission per CSA §201. Illicit drug supply has not decreased. Cocaine purity-adjusted price fell ~80% from 1981-2012. Heroin price per pure gram dropped from $3,260 (1981) to $465 (2012), adjusted for inflation, while purity increased. Source: ONDCP STRIDE data via RAND OP-369-ONDCP (2014). DEA budget grew from $65.2M (1972) to $3.3B (2024) without measurable supply reduction.",
    verification: { method: "data", source: "ONDCP STRIDE data; RAND drug price studies" },
    depends_on: ["WOD-001"],
  },

  // ── Nixon's "War on Drugs" (1971) ──
  {
    id: "WOD-003",
    promiser: "ondcp",
    promisee: "public",
    body: "Eradicate drug abuse as 'public enemy number one'",
    domain: "Prevention",
    status: "violated",
    note: "Nixon press conference, June 17, 1971. Created the Special Action Office for Drug Abuse Prevention (SAODAP). Past-month illicit drug use: 13.2% of Americans aged 12+ reported in 2022 (SAMHSA NSDUH 2022), up from 12.3% in 2002. Drug overdose deaths reached 107,941 in 2022 (CDC WONDER). The stated goal of eradication was not achieved over 50+ years.",
    verification: { method: "data", source: "SAMHSA NSDUH; CDC WONDER" },
    depends_on: ["WOD-002", "WOD-007"],
  },
  {
    id: "WOD-004",
    promiser: "ondcp",
    promisee: "public",
    body: "Invest in drug treatment and rehabilitation as primary response",
    domain: "Treatment",
    status: "degraded",
    note: "Nixon initially allocated two-thirds of drug-control funding to treatment. By FY2022, treatment/prevention received ~45% ($20.7B) vs supply reduction ~55% ($24.5B) of the $45.2B federal drug control budget. The original 2:1 treatment-to-enforcement ratio inverted over time. Source: ONDCP FY2022 National Drug Control Budget.",
    verification: { method: "filing", source: "ONDCP National Drug Control Budget" },
    depends_on: [],
  },

  // ── Anti-Drug Abuse Act (1986) — Mandatory Minimums ──
  {
    id: "WOD-005",
    promiser: "congress",
    promisee: "public",
    body: "Deter drug trafficking through mandatory minimum sentences",
    domain: "Sentencing",
    status: "violated",
    note: "P.L. 99-570 established mandatory minimums (5g crack = 5 years; 500g powder cocaine = 5 years, a 100:1 disparity). USSC found mandatory minimums 'apply too broadly, are too severe, and are applied inconsistently.' Drug trafficking activity did not decrease measurably. Source: USSC Report to Congress: Mandatory Minimum Penalties in the Federal Criminal Justice System (2011, 2017).",
    verification: { method: "data", source: "USSC Reports on Mandatory Minimums" },
    depends_on: [],
  },
  {
    id: "WOD-006",
    promiser: "doj",
    promisee: "communities-of-color",
    body: "Apply drug sentencing equitably regardless of race",
    domain: "Equity",
    status: "violated",
    note: "The 100:1 crack/powder disparity disproportionately impacted Black Americans. In FY2010 (pre-Fair Sentencing Act), 82.6% of federal crack cocaine offenders were Black despite roughly equal usage rates across races. Black Americans were incarcerated for drug offenses at 5.6x the rate of whites. Source: USSC 2010 Report; BJS Prisoners Series; SAMHSA NSDUH (comparable usage rates).",
    verification: { method: "data", source: "USSC Annual Reports; BJS Prisoners in 2020" },
    depends_on: ["WOD-005"],
  },

  // ── Anti-Drug Abuse Act (1988) — ONDCP & "Drug-Free America" ──
  {
    id: "WOD-007",
    promiser: "congress",
    promisee: "public",
    body: "Create a 'Drug-Free America' through ONDCP coordination",
    domain: "Prevention",
    status: "violated",
    note: "P.L. 100-690 §1002 stated the goal of 'a Drug-Free America' and created ONDCP. 35 years later, 59.3 million Americans aged 12+ used illicit drugs in the past year (SAMHSA NSDUH 2022). The explicit goal of a drug-free society was not achieved. GAO has repeatedly found ONDCP unable to demonstrate that its national strategy reduced drug use. Source: GAO-03-264; SAMHSA 2022 NSDUH.",
    verification: { method: "data", source: "SAMHSA NSDUH; GAO-03-264" },
    depends_on: ["WOD-004", "WOD-002"],
  },
  {
    id: "WOD-008",
    promiser: "ondcp",
    promisee: "public",
    body: "Reduce youth drug use through national media campaign",
    domain: "Prevention",
    status: "violated",
    note: "ONDCP's National Youth Anti-Drug Media Campaign (1998-2012) spent $1.4 billion on anti-drug advertising. A congressionally mandated evaluation by Westat/Annenberg found no evidence the campaign reduced youth drug use and some evidence it may have increased pro-drug attitudes among some youth. The campaign was defunded. Source: GAO-06-818; Hornik et al. (2008) American Journal of Public Health.",
    verification: { method: "audit", source: "GAO-06-818; Westat/Annenberg evaluation" },
    depends_on: ["WOD-007"],
  },

  // ── DARE Program ──
  {
    id: "WOD-009",
    promiser: "doj",
    promisee: "public",
    body: "Prevent youth drug use through school-based DARE education program",
    domain: "Prevention",
    status: "violated",
    note: "DARE (Drug Abuse Resistance Education) operated from 1983 to present, reaching 75% of U.S. school districts at its peak. Multiple meta-analyses found DARE had no statistically significant effect on drug use. GAO concluded in 2003 that DARE was 'unable to demonstrate effectiveness.' Cost ~$1-1.3B in state/local funding annually at peak. Source: GAO-03-172R; West & O'Neal (2004) meta-analysis in AJPH.",
    verification: { method: "audit", source: "GAO-03-172R; peer-reviewed meta-analyses" },
    depends_on: [],
  },

  // ── Clinton Crime Bill (1994) ──
  {
    id: "WOD-010",
    promiser: "congress",
    promisee: "public",
    body: "Reduce drug-related crime through expanded enforcement and drug courts",
    domain: "Enforcement",
    status: "degraded",
    note: "Violent Crime Control and Law Enforcement Act (P.L. 103-322) provided $30.2B including drug court funding and additional police officers. Drug courts have shown 8-14% recidivism reduction where implemented (NADCP). However, the law also expanded federal death penalty for drug kingpins and added mandatory minimums, contributing to mass incarceration. Federal drug prisoners grew from ~30,000 (1994) to ~81,000 (2013). Source: BJS Federal Justice Statistics; NADCP fact sheets.",
    verification: { method: "data", source: "BJS Federal Justice Statistics; NADCP" },
    depends_on: ["WOD-005"],
  },

  // ── Incarceration Promises ──
  {
    id: "WOD-011",
    promiser: "bop",
    promisee: "public",
    body: "House drug offenders safely and prepare them for reentry",
    domain: "Incarceration",
    status: "degraded",
    note: "Federal prisons operated at 12-38% over capacity from 2006-2016. Drug offenders constitute 45.3% of federal prisoners (BOP statistics, 2024). Recidivism rate for drug offenders released from federal prison: 46.9% rearrested within 5 years. Source: BOP population statistics; USSC Recidivism Among Federal Drug Trafficking Offenders (2022).",
    verification: { method: "data", source: "BOP Statistics; USSC Recidivism Studies" },
    depends_on: ["WOD-005", "WOD-010"],
  },
  {
    id: "WOD-012",
    promiser: "congress",
    promisee: "communities-of-color",
    body: "Reduce mass incarceration of nonviolent drug offenders",
    domain: "Incarceration",
    status: "degraded",
    note: "Despite reform rhetoric, the U.S. incarcerated ~350,000 people for drug offenses in state and federal prisons in 2021 (down from ~450,000 in 2006). Black Americans remain 3.7x more likely to be arrested for marijuana possession despite comparable usage rates. Source: BJS Prisoners Series 2021; ACLU 2020 marijuana arrest report; FBI UCR.",
    verification: { method: "data", source: "BJS Prisoners in 2021; FBI UCR data" },
    depends_on: ["WOD-006"],
  },

  // ── Fair Sentencing Act (2010) ──
  {
    id: "WOD-013",
    promiser: "congress",
    promisee: "communities-of-color",
    body: "Reduce crack-powder sentencing disparity from 100:1 to 18:1",
    domain: "Equity",
    status: "verified",
    progress: 82,
    required: 100,
    note: "Fair Sentencing Act (P.L. 111-220) reduced the disparity from 100:1 to 18:1 and eliminated the 5-year mandatory minimum for simple possession of crack. USSC data confirms the new ratios are being applied. However, the law was not retroactive until the First Step Act (2018) partially addressed this. Source: USSC 2015 Report; P.L. 111-220.",
    verification: { method: "filing", source: "USSC Sourcebook of Federal Sentencing Statistics" },
    depends_on: ["WOD-005", "WOD-006"],
  },

  // ── Combat Methamphetamine Epidemic Act (2005) ──
  {
    id: "WOD-014",
    promiser: "congress",
    promisee: "public",
    body: "Reduce methamphetamine production by restricting precursor chemicals",
    domain: "Enforcement",
    status: "degraded",
    note: "CMEA (Title VII of P.L. 109-177) restricted pseudoephedrine sales. Domestic meth lab seizures fell 80%+ (DEA: 23,829 in 2004 to 3,036 in 2009). However, production shifted to Mexican cartel super-labs using P2P synthesis, which produces higher-purity, more neurotoxic d-methamphetamine. Total meth availability increased post-restriction. Meth-involved overdose deaths rose from ~4,500 (2014) to ~34,000 (2022). Source: DEA National Clandestine Lab Register; CDC WONDER; Brunt et al. (2022).",
    verification: { method: "data", source: "DEA Clandestine Lab Register; CDC WONDER" },
    depends_on: [],
  },

  // ── 21st Century Cures Act (2016) ──
  {
    id: "WOD-015",
    promiser: "hhs",
    promisee: "public",
    body: "Expand opioid treatment and prevention through $1B State Targeted Response grants",
    domain: "Treatment",
    status: "degraded",
    note: "21st Century Cures Act (P.L. 114-255) authorized $1B for opioid State Targeted Response (STR) grants over two years. Grants were distributed to all 50 states. However, the opioid crisis accelerated: overdose deaths rose from 42,249 (2016) to 107,941 (2022), driven by illicit fentanyl. Treatment capacity expanded but did not keep pace with the evolving crisis. Source: SAMHSA STR/SOR grant reports; CDC WONDER.",
    verification: { method: "filing", source: "SAMHSA grant reports; CDC WONDER" },
    depends_on: ["WOD-004"],
  },

  // ── SUPPORT Act (2018) ──
  {
    id: "WOD-016",
    promiser: "congress",
    promisee: "public",
    body: "Expand access to medication-assisted treatment (MAT) for opioid use disorder",
    domain: "Treatment",
    status: "degraded",
    note: "SUPPORT for Patients and Communities Act (P.L. 115-271) expanded MAT access by allowing more providers to prescribe buprenorphine. The X-waiver requirement was eventually eliminated in 2023. As of 2022, an estimated 22.7M Americans needed substance use treatment but only 6.3M received any treatment at a specialty facility (28% treatment rate). Source: SAMHSA NSDUH 2022; P.L. 115-271.",
    verification: { method: "data", source: "SAMHSA NSDUH; SAMHSA Treatment Episode Data" },
    depends_on: ["WOD-015", "WOD-004"],
  },
  {
    id: "WOD-017",
    promiser: "congress",
    promisee: "public",
    body: "Reduce opioid overdose deaths through comprehensive federal response",
    domain: "Public Health",
    status: "violated",
    note: "Multiple federal acts (Cures Act 2016, SUPPORT Act 2018) promised to address the opioid crisis. Opioid-involved overdose deaths: 33,091 (2015) → 49,860 (2019) → 80,411 (2021) → ~82,000 (2022). The primary driver shifted from prescription opioids to illicit fentanyl, which federal policy did not anticipate or effectively counter. Source: CDC WONDER; NIDA Overdose Death Rates.",
    verification: { method: "data", source: "CDC WONDER; NIDA" },
    depends_on: ["WOD-015", "WOD-016", "WOD-002"],
  },

  // ── Supply Reduction / International ──
  {
    id: "WOD-018",
    promiser: "dea",
    promisee: "public",
    body: "Reduce drug supply through international interdiction and source-country programs",
    domain: "Supply Reduction",
    status: "violated",
    note: "Plan Colombia (2000-2015) spent $10B+ in counter-narcotics aid. Despite eradication of ~1.6 million hectares of coca, Colombian cocaine production reached record 1,738 metric tons in 2023 (UNODC). U.S. cocaine-related overdose deaths rose from ~5,000 (2014) to ~28,000 (2022). Drug seizures at the border increased but so did flow volume. Source: UNODC World Drug Report 2024; DEA National Drug Threat Assessment.",
    verification: { method: "data", source: "UNODC World Drug Report; DEA NDTA" },
    depends_on: [],
  },

  // ── Treatment Gap ──
  {
    id: "WOD-019",
    promiser: "samhsa",
    promisee: "public",
    body: "Ensure treatment access for all Americans with substance use disorders",
    domain: "Treatment",
    status: "violated",
    note: "SAMHSA's stated mission includes ensuring substance use treatment access. In 2022, 46.8 million Americans aged 12+ had a substance use disorder; only 24.1% received any treatment. The treatment gap has persisted for decades. Among those who did not receive treatment, 96.8% did not feel they needed it — indicating systemic failure in screening and referral, not just capacity. Source: SAMHSA 2022 NSDUH.",
    verification: { method: "data", source: "SAMHSA 2022 NSDUH" },
    depends_on: ["WOD-004", "WOD-016"],
  },

  // ── Federal Spending Accountability ──
  {
    id: "WOD-020",
    promiser: "ondcp",
    promisee: "public",
    body: "Demonstrate measurable outcomes from federal drug control spending",
    domain: "Accountability",
    status: "violated",
    note: "Cumulative federal drug control spending from 1971-2024 exceeds $1 trillion (inflation-adjusted estimates from ONDCP budget data and academic analyses). GAO has repeatedly found ONDCP unable to link spending to measurable drug use reduction (GAO-03-264, GAO-06-818, GAO-18-205). FY2024 federal drug control budget: $46.1B. Source: ONDCP budget documents; GAO reports.",
    verification: { method: "audit", source: "GAO-03-264; GAO-06-818; GAO-18-205" },
    depends_on: ["WOD-002", "WOD-003", "WOD-007"],
  },
];

// ─── INSIGHTS ───
export const WOD_INSIGHTS: Insight[] = [
  {
    severity: "critical",
    type: "Cascade",
    title: "Enforcement-first approach cascaded into mass incarceration without reducing supply",
    body: "The foundational promise — that enforcement would reduce drug availability (WOD-002) — has been consistently violated for 50+ years. Every downstream promise dependent on supply reduction (WOD-003, WOD-007, WOD-017) has also failed. Meanwhile, enforcement spending crowded out treatment funding (WOD-004), and mandatory minimums (WOD-005) drove incarceration of 350,000+ people for drug offenses without measurable deterrence.",
    promises: ["WOD-002", "WOD-003", "WOD-005", "WOD-011"],
  },
  {
    severity: "critical",
    type: "Gap",
    title: "Racial equity was never structurally addressed until 2010",
    body: "From 1986 to 2010, the 100:1 crack/powder disparity was known to be racially discriminatory, documented by the USSC in four separate reports to Congress recommending reform. Congress took no action for 24 years. The Fair Sentencing Act (WOD-013) reduced but did not eliminate the disparity. Arrest-rate disparities persist.",
    promises: ["WOD-005", "WOD-006", "WOD-013", "WOD-012"],
  },
  {
    severity: "warning",
    type: "Drift",
    title: "Treatment-to-enforcement spending ratio inverted from Nixon's original promise",
    body: "Nixon's 1971 framework allocated two-thirds of drug control funding to treatment. By FY2022, enforcement/interdiction received 55% of the $45.2B federal drug budget. The policy drifted from a public health frame to a criminal justice frame, and treatment access remains at 24% of those who need it.",
    promises: ["WOD-004", "WOD-019", "WOD-020"],
  },
  {
    severity: "critical",
    type: "Conflict",
    title: "Prevention programs spent billions with no demonstrated effectiveness",
    body: "Both DARE ($1B+/year at peak) and ONDCP's National Youth Anti-Drug Media Campaign ($1.4B total) were evaluated by independent researchers and the GAO. Neither demonstrated measurable reductions in drug use. The media campaign showed some evidence of iatrogenic effects — increasing pro-drug attitudes among exposed youth.",
    promises: ["WOD-008", "WOD-009"],
  },
  {
    severity: "warning",
    type: "Drift",
    title: "Pseudoephedrine restrictions shifted meth production to more dangerous methods",
    body: "The Combat Methamphetamine Epidemic Act (2005) successfully reduced domestic small-lab production by 80%+. However, production shifted to Mexican cartel super-labs using P2P synthesis, producing higher-purity, more neurotoxic methamphetamine. Meth-involved overdose deaths increased 7.5x from 2014-2022. The intervention achieved its proximate goal while worsening the ultimate outcome.",
    promises: ["WOD-014"],
  },
  {
    severity: "positive",
    type: "Working",
    title: "Fair Sentencing Act demonstrates that reform can be implemented",
    body: "The Fair Sentencing Act (2010) is the clearest example of a kept promise in this network. Congress reduced the crack/powder disparity from 100:1 to 18:1, the USSC applied the new guidelines, and the First Step Act (2018) made the change partially retroactive. This shows the system can self-correct when it has political will and data.",
    promises: ["WOD-013"],
  },
  {
    severity: "critical",
    type: "Gap",
    title: "Federal response failed to anticipate or counter the fentanyl transition",
    body: "Federal drug policy was designed for plant-based drugs (heroin, cocaine, cannabis). The shift to synthetic fentanyl — which is cheaper, more potent, and harder to interdict — rendered supply-side strategies structurally obsolete. Overdose deaths more than tripled from 2015-2022 despite record enforcement spending.",
    promises: ["WOD-017", "WOD-018", "WOD-002"],
  },
];

// ─── DASHBOARD ───
export const WOD_DASHBOARD: DashboardData = {
  title: "US War on Drugs",
  subtitle: "Federal Drug Policy Promise Network Analysis (1970–Present)",
  agents: WOD_AGENTS,
  promises: WOD_PROMISES,
  domains: [
    { name: "Enforcement", color: "#dc2626", promiseCount: 3, healthScore: 10 },
    { name: "Sentencing", color: "#991b1b", promiseCount: 1, healthScore: 0 },
    { name: "Equity", color: "#7c3aed", promiseCount: 2, healthScore: 50 },
    { name: "Prevention", color: "#2563eb", promiseCount: 3, healthScore: 0 },
    { name: "Treatment", color: "#059669", promiseCount: 4, healthScore: 30 },
    { name: "Public Health", color: "#0891b2", promiseCount: 1, healthScore: 0 },
    { name: "Incarceration", color: "#78350f", promiseCount: 2, healthScore: 30 },
    { name: "Scheduling", color: "#d97706", promiseCount: 1, healthScore: 30 },
    { name: "Supply Reduction", color: "#b45309", promiseCount: 1, healthScore: 0 },
    { name: "Accountability", color: "#374151", promiseCount: 1, healthScore: 0 },
  ],
  insights: WOD_INSIGHTS,
  trajectories: [],
  grade: "F",
  gradeExplanation: "The federal War on Drugs has violated or degraded the vast majority of its stated commitments over 50+ years. Only the Fair Sentencing Act demonstrates a kept promise. $1T+ in spending has not reduced drug use, drug availability, or overdose deaths. Racial disparities in enforcement persist.",
};
