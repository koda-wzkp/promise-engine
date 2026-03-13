import { Agent, Promise, Insight, Trajectory, Domain, DashboardData } from "../types/promise";
import { nclbEssaDomainColors } from "../utils/colors";

// ─── AGENTS ───
// 12 agents in the NCLB/ESSA promise network
export const NCLB_AGENTS: Agent[] = [
  { id: "congress-107", name: "107th U.S. Congress (NCLB)", type: "legislator", short: "CONG" },
  { id: "congress-114", name: "114th U.S. Congress (ESSA)", type: "legislator", short: "C114" },
  { id: "ed-dept", name: "U.S. Department of Education", type: "federal", short: "ED" },
  { id: "states-ed", name: "State Education Agencies", type: "regulator", short: "SEA" },
  { id: "districts", name: "Local School Districts (LEAs)", type: "provider", short: "LEA" },
  { id: "teachers", name: "Teachers", type: "provider", short: "TCH" },
  { id: "students", name: "K-12 Students", type: "community", short: "STU" },
  { id: "parents", name: "Parents & Families", type: "community", short: "FAM" },
  { id: "minority-students", name: "Minority & Low-Income Students", type: "community", short: "MIN" },
  { id: "swd", name: "Students with Disabilities", type: "community", short: "SWD" },
  { id: "ell", name: "English Language Learners", type: "community", short: "ELL" },
  { id: "obama-admin", name: "Obama Administration (waivers)", type: "executive", short: "WH" },
];

// ─── PROMISES ───
// 28 promises from NCLB (2001) and ESSA (2015) combined
export const NCLB_PROMISES: Promise[] = [
  // ── NCLB Core: Accountability ──
  {
    id: "NCLB-001",
    ref: "NCLB §1111(b)(2)(F)",
    promiser: "congress-107",
    promisee: "students",
    body: "100% of students proficient in reading and math by 2013-2014 school year",
    domain: "Accountability",
    status: "broken",
    target: "2014-06-30",
    progress: 0,
    required: 100,
    note: "The defining promise of NCLB — and its most spectacular failure. By 2014, no state came close to 100% proficiency. NAEP 2013: 35% of 4th graders proficient in reading, 42% in math. The target was structurally impossible — it assumed continuous linear improvement to a ceiling that educational research said was unreachable. By 2011, ED estimated 82% of schools would fail AYP. This failure drove the waiver system and ultimately ESSA.",
    verification: { method: "data", source: "NAEP / NCES", endpoint: "https://nces.ed.gov/nationsreportcard/", frequency: "biennial" },
    depends_on: ["NCLB-002", "NCLB-005", "NCLB-007"],
    outcomeData: [
      { metric: "4th grade reading proficiency (2013 NAEP)", target: "100%", actual: "35%", source: "NAEP" },
      { metric: "4th grade math proficiency (2013 NAEP)", target: "100%", actual: "42%", source: "NAEP" },
      { metric: "8th grade reading proficiency (2013 NAEP)", target: "100%", actual: "36%", source: "NAEP" },
      { metric: "8th grade math proficiency (2013 NAEP)", target: "100%", actual: "36%", source: "NAEP" },
    ],
  },
  {
    id: "NCLB-002",
    ref: "NCLB §1111(b)(2)(B-C)",
    promiser: "states-ed",
    promisee: "ed-dept",
    body: "Define Adequate Yearly Progress (AYP) with measurable annual objectives showing continuous improvement toward 100% proficiency",
    domain: "Accountability",
    status: "broken",
    note: "All 50 states defined AYP. But AYP's design was fatally flawed: any subgroup missing any target in any subject caused the entire school to fail. By 2011, 48% of schools failed AYP. Many states gamed the system by setting low initial proficiency bars and planning steep end-loaded increases. The system measured compliance, not learning.",
    verification: { method: "data", source: "ED Consolidated State Performance Reports", frequency: "annual" },
    depends_on: ["NCLB-003"],
    outcomeData: [
      { metric: "Schools failing AYP (2011)", target: "0%", actual: "48%", source: "CEP/NCES" },
    ],
  },
  {
    id: "NCLB-003",
    ref: "NCLB §1111(b)(3)",
    promiser: "states-ed",
    promisee: "ed-dept",
    body: "Adopt challenging academic content standards and aligned assessments in reading and math",
    domain: "Assessment",
    status: "partial",
    note: "All states adopted standards and assessments. But 'challenging' varied enormously — Mississippi proficiency ≠ Massachusetts proficiency. State standards ranged from genuinely rigorous to absurdly low. NAEP scores showed that some states rated 80%+ of students 'proficient' while NAEP showed <30% proficient. The Common Core initiative (2010) attempted to address this but was not required by NCLB.",
    verification: { method: "data", source: "NCES state assessment data / Mapping State Proficiency Standards", frequency: "annual" },
    depends_on: [],
    outcomeData: [
      { metric: "States with standards & assessments", target: 50, actual: 50, source: "ED" },
      { metric: "Correlation between state and NAEP proficiency", target: "High", actual: "Very low — massive variation", source: "NCES" },
    ],
  },
  {
    id: "NCLB-004",
    ref: "NCLB §1111(h)(1-2)",
    promiser: "states-ed",
    promisee: "parents",
    body: "Report achievement data disaggregated by race/ethnicity, income, disability, and English learner status",
    domain: "Accountability",
    status: "kept",
    note: "This is arguably NCLB's most lasting and important contribution. Before NCLB, many states reported only aggregate scores, hiding achievement gaps. Disaggregated reporting made it impossible to ignore gaps between White/Black, White/Hispanic, and income-based subgroups. The data infrastructure created by NCLB survives in ESSA and transformed education policy discourse.",
    verification: { method: "data", source: "State report cards / NCES EDFacts", frequency: "annual" },
    depends_on: ["NCLB-003"],
  },
  {
    id: "NCLB-005",
    ref: "NCLB §1111(b)(1)",
    promiser: "states-ed",
    promisee: "ed-dept",
    body: "Administer annual reading and math assessments in grades 3-8 and once in high school",
    domain: "Assessment",
    status: "kept",
    note: "Annual testing implemented in all 50 states by 2005-2006. Testing infrastructure remains under ESSA. Roughly 50M students tested annually. The testing mandate is NCLB's most durable structural change — it created the data backbone for accountability. Critics argue it led to 'teaching to the test' and narrowed curriculum, but the data it generates is indispensable.",
    verification: { method: "data", source: "NCES / state testing data", frequency: "annual" },
    depends_on: ["NCLB-003"],
    outcomeData: [
      { metric: "Students tested annually", target: ">40M", actual: "~50M", source: "NCES" },
    ],
  },

  // ── NCLB Core: Teacher Quality ──
  {
    id: "NCLB-006",
    ref: "NCLB §1119",
    promiser: "districts",
    promisee: "students",
    body: "Ensure all teachers in core academic subjects are 'highly qualified' (bachelor's degree, state certification, subject knowledge) by 2005-2006",
    domain: "Teacher Quality",
    status: "partial",
    target: "2006-06-30",
    note: "By 2006-2007, ~95% of core academic classes were taught by HQ teachers — up from ~87% in 2002. But the definition was loose: many states allowed alternative certification to count. Rural and high-poverty schools had the lowest HQ rates. The requirement raised awareness but didn't fundamentally change teacher distribution patterns.",
    verification: { method: "data", source: "ED Title II Teacher Quality Reports", frequency: "annual" },
    depends_on: [],
    outcomeData: [
      { metric: "Core classes taught by HQ teachers (2006-07)", target: "100%", actual: "~95%", source: "ED" },
      { metric: "HQ rate in high-poverty schools", target: "100%", actual: "~88%", source: "ED" },
    ],
  },

  // ── NCLB: School Choice & Intervention ──
  {
    id: "NCLB-007",
    ref: "NCLB §1116(b)",
    promiser: "districts",
    promisee: "parents",
    body: "Offer public school choice to students in schools failing AYP for 2+ consecutive years; supplemental educational services (tutoring) after 3+ years",
    domain: "School Improvement",
    status: "broken",
    note: "Uptake was dismal. Only 1-2% of eligible students transferred under school choice provisions. SES tutoring participation was higher (~20% of eligible) but quality was uneven and poorly monitored. In many districts, there were no higher-performing schools to transfer TO. The promise assumed a supply of good school options that didn't exist.",
    verification: { method: "data", source: "ED SES/School Choice data collections", frequency: "annual" },
    depends_on: ["NCLB-002"],
    outcomeData: [
      { metric: "Eligible students using school choice", target: ">20%", actual: "1-2%", source: "CEP/GAO" },
      { metric: "Eligible students using SES tutoring", target: ">50%", actual: "~20%", source: "CEP/GAO" },
    ],
  },
  {
    id: "NCLB-008",
    ref: "NCLB §1116(b)(7-8)",
    promiser: "districts",
    promisee: "students",
    body: "Schools failing AYP for 5+ years face corrective action; 6+ years face restructuring (reopen as charter, replace staff, state takeover)",
    domain: "School Improvement",
    status: "partial",
    note: "Restructuring was required by law but often implemented weakly. Many districts chose the least disruptive option. By 2010, ~5,000 schools were in restructuring status nationally. Evidence on effectiveness was mixed — IES found no consistent improvement from restructuring. The cascade was too blunt an instrument for the complexity of school improvement.",
    verification: { method: "data", source: "ED school improvement data / IES evaluations", frequency: "annual" },
    depends_on: ["NCLB-002", "NCLB-007"],
    outcomeData: [
      { metric: "Schools in restructuring (2010)", target: "0 (goal)", actual: "~5,000", source: "ED/CEP" },
    ],
  },

  // ── NCLB: Funding & Programs ──
  {
    id: "NCLB-009",
    ref: "NCLB §1001, §1002",
    promiser: "congress-107",
    promisee: "minority-students",
    body: "Close the achievement gap between high- and low-performing students, particularly minority and disadvantaged students",
    domain: "Equity",
    status: "partial",
    note: "The White-Black achievement gap narrowed modestly in math (NAEP 4th grade: 31 points in 2003 → 25 points in 2019). Reading gaps were largely unchanged. White-Hispanic math gap also narrowed slightly. However, COVID-19 reversed much of the progress — 2022 NAEP showed the first significant widening in decades. The gap persists and the aspiration remains unmet.",
    verification: { method: "data", source: "NAEP Long-Term Trend / Achievement Gap data", frequency: "biennial" },
    depends_on: ["NCLB-001", "NCLB-004"],
    outcomeData: [
      { metric: "White-Black 4th grade math gap (2003)", target: "0 points", actual: "31 points", source: "NAEP" },
      { metric: "White-Black 4th grade math gap (2019)", target: "0 points", actual: "25 points", source: "NAEP" },
      { metric: "White-Black 4th grade math gap (2022)", target: "0 points", actual: "28 points", source: "NAEP" },
    ],
  },
  {
    id: "NCLB-010",
    ref: "NCLB Title I-B (Reading First)",
    promiser: "ed-dept",
    promisee: "students",
    body: "Reading First: $1B/year in grants to states for evidence-based reading instruction in K-3",
    domain: "Funding",
    status: "broken",
    note: "Funded at ~$1B/year 2002-2008, then defunded. IES impact evaluation (2008) found Reading First increased instructional time on reading but did NOT improve reading comprehension scores. The program was also plagued by conflicts of interest — the inspector general found the selection process favored specific curricula. Defunded after negative evaluation and scandal.",
    verification: { method: "data", source: "IES Reading First Impact Study (2008)", frequency: "retrospective" },
    depends_on: [],
    outcomeData: [
      { metric: "Impact on reading comprehension", target: "Significant improvement", actual: "No statistically significant impact", source: "IES 2008" },
      { metric: "Total funding (2002-2008)", target: "$6B+", actual: "~$6B", source: "ED budget data" },
    ],
  },
  {
    id: "NCLB-011",
    ref: "NCLB Title I-A",
    promiser: "congress-107",
    promisee: "minority-students",
    body: "Increase Title I funding to support schools serving disadvantaged students",
    domain: "Funding",
    status: "partial",
    note: "Title I funding increased from $10.4B (FY2001) to $15.9B (FY2010) but never reached the authorized levels. NCLB authorized $25B for Title I by FY2007 — actual appropriation was $12.8B. The 'unfunded mandate' critique was valid: NCLB imposed costly requirements without fully funding them. States and districts bore significant compliance costs.",
    verification: { method: "data", source: "ED Budget Service / Congressional Appropriations", frequency: "annual" },
    depends_on: [],
    outcomeData: [
      { metric: "Title I funding (FY2001)", target: "$25B (FY2007 auth)", actual: "$10.4B", source: "ED" },
      { metric: "Title I funding (FY2010)", target: "$25B", actual: "$15.9B", source: "ED" },
    ],
  },

  // ── NCLB → ESSA Transition: Obama Waivers ──
  {
    id: "NCLB-012",
    ref: "ESEA §9401 (waiver authority)",
    promiser: "obama-admin",
    promisee: "states-ed",
    body: "Grant NCLB flexibility waivers to states that adopt college-and-career-ready standards and new accountability systems (2011-2015)",
    domain: "Federal Authority",
    status: "kept",
    nodeType: "modifier",
    effectiveDate: "2011-09-23",
    note: "43 states received waivers by 2015, essentially replacing NCLB's accountability framework with state-designed alternatives. Waivers required states to adopt college-ready standards (most chose Common Core), create teacher evaluation systems, and identify lowest-performing schools. The waivers were a bridge to ESSA but were criticized as executive overreach — using waiver authority to rewrite the law.",
    verification: { method: "filing", source: "ED ESEA Flexibility documents", frequency: "annual" },
    depends_on: ["NCLB-001", "NCLB-002"],
    outcomeData: [
      { metric: "States receiving waivers", target: "N/A", actual: "43 states + DC", source: "ED" },
    ],
  },

  // ── ESSA (2015): Replacing NCLB ──
  {
    id: "ESSA-001",
    ref: "ESSA §1111(b)(1)",
    promiser: "states-ed",
    promisee: "ed-dept",
    body: "Adopt challenging academic standards that align with college- and career-readiness (states choose own standards)",
    domain: "Accountability",
    status: "kept",
    effectiveDate: "2017-08-01",
    note: "ESSA explicitly allows states to choose their own standards — no federal mandate of Common Core. By 2024, ~36 states still use Common Core or closely aligned standards; others developed their own. Standards variation persists but is narrower than pre-NCLB era. The Secretary of Education is explicitly prohibited from mandating specific standards.",
    verification: { method: "data", source: "ED ESSA state plan approvals", frequency: "per-state" },
    depends_on: [],
  },
  {
    id: "ESSA-002",
    ref: "ESSA §1111(c)",
    promiser: "states-ed",
    promisee: "ed-dept",
    body: "Design state accountability systems using multiple measures: academic achievement, graduation rates, English proficiency, and at least one school quality/student success indicator",
    domain: "Accountability",
    status: "kept",
    effectiveDate: "2017-08-01",
    note: "All 50 states + DC submitted and received approval for ESSA accountability plans by 2018. States chose diverse 'fifth indicators': chronic absenteeism (36 states), school climate surveys, access to advanced coursework, college enrollment, etc. More nuanced than AYP but harder to compare across states.",
    verification: { method: "filing", source: "ED ESSA State Plan Dashboard", frequency: "per-state" },
    depends_on: ["ESSA-001", "NCLB-005"],
    outcomeData: [
      { metric: "States with approved ESSA plans", target: 50, actual: "50 + DC", source: "ED" },
    ],
  },
  {
    id: "ESSA-003",
    ref: "ESSA §1111(d)(1)",
    promiser: "states-ed",
    promisee: "students",
    body: "Identify bottom 5% of Title I schools as Comprehensive Support and Improvement (CSI) schools; implement evidence-based interventions",
    domain: "School Improvement",
    status: "partial",
    effectiveDate: "2017-08-01",
    note: "States identified ~6,500 schools for CSI in the first cycle (2018-2019). ESSA requires 'evidence-based' interventions (4-tier evidence framework). Early evidence is mixed — some states are implementing meaningful reforms; others are providing minimal support. COVID-19 disrupted the first full cycle. Second identification cycle (2022-2023) ongoing.",
    verification: { method: "data", source: "ED CSI/TSI school identification data", frequency: "triennial" },
    depends_on: ["ESSA-002"],
    outcomeData: [
      { metric: "CSI schools identified (2018-19)", target: "~5% of Title I schools", actual: "~6,500", source: "ED" },
    ],
  },
  {
    id: "ESSA-004",
    ref: "ESSA §1111(d)(2)",
    promiser: "states-ed",
    promisee: "minority-students",
    body: "Identify schools with consistently underperforming subgroups as Targeted Support and Improvement (TSI) schools",
    domain: "Equity",
    status: "partial",
    note: "TSI identification requires states to identify schools where any subgroup is performing as poorly as the bottom 5% of all schools. Implementation varies — some states set high bars, others low. TSI schools receive additional resources but face less intervention than CSI schools. The equity promise depends on states actually acting on the identifications.",
    verification: { method: "data", source: "ED TSI school identification data", frequency: "triennial" },
    depends_on: ["ESSA-002", "NCLB-004"],
  },
  {
    id: "ESSA-005",
    ref: "ESSA §1111(b)(2)",
    promiser: "states-ed",
    promisee: "students",
    body: "Maintain annual assessments in reading and math (grades 3-8 + once in high school) and science (3 times in K-12)",
    domain: "Assessment",
    status: "kept",
    note: "ESSA preserved NCLB's annual testing requirement. COVID-19 led to blanket waiver in 2020, partial testing in 2021. Testing resumed fully in 2022. NAEP 2022 showed historic declines ('COVID slide'), making the continued assessment mandate critical for tracking recovery. States may also use locally developed assessments through innovative assessment pilot.",
    verification: { method: "data", source: "NCES state assessment participation data", frequency: "annual" },
    depends_on: ["ESSA-001"],
  },
  {
    id: "ESSA-006",
    ref: "ESSA §8526A",
    promiser: "ed-dept",
    promisee: "states-ed",
    body: "Secretary of Education prohibited from mandating or incentivizing specific standards, assessments, or curriculum",
    domain: "Federal Authority",
    status: "kept",
    effectiveDate: "2015-12-10",
    note: "ESSA's explicit guardrails on federal authority were a direct response to Obama-era waiver conditions (which required college-ready standards). The Secretary cannot mandate Common Core, require specific curricula, or condition funding on adopting particular standards. This provision has held across Biden and Trump administrations.",
    verification: { method: "legal", source: "ESSA statutory text / ED guidance", frequency: "retrospective" },
    depends_on: [],
  },
  {
    id: "ESSA-007",
    ref: "ESSA §1003",
    promiser: "congress-114",
    promisee: "districts",
    body: "Provide 7% Title I set-aside for school improvement, with evidence-based intervention requirements",
    domain: "School Improvement",
    status: "kept",
    effectiveDate: "2017-08-01",
    note: "States must reserve 7% of Title I-A funds for school improvement. Interventions must meet ESSA's evidence standards (Tier 1-4). Evidence-based requirement is new — NCLB didn't specify evidence tiers. However, total school improvement funding is modest relative to need (~$1.5B/year nationally vs. thousands of identified schools).",
    verification: { method: "data", source: "ED Title I-A allocations / school improvement grants", frequency: "annual" },
    depends_on: ["ESSA-003"],
    outcomeData: [
      { metric: "Annual school improvement funding", target: "7% of Title I", actual: "~$1.5B", source: "ED" },
    ],
  },

  // ── Cross-cutting: Achievement Outcomes ──
  {
    id: "NCLB-013",
    ref: "NCLB/ESSA cross-cutting",
    promiser: "states-ed",
    promisee: "students",
    body: "Raise high school graduation rates through accountability pressure and dropout prevention",
    domain: "Accountability",
    status: "kept",
    note: "The adjusted cohort graduation rate (ACGR) increased from 73.4% (2005-2006) to 87.0% (2019-2020). One of the clearest positive outcomes associated with NCLB/ESSA era accountability. Graduation rate became an ESSA accountability indicator in all states. However, some inflation concerns — states may have lowered graduation requirements.",
    verification: { method: "data", source: "NCES ACGR data", frequency: "annual" },
    depends_on: ["NCLB-002", "ESSA-002"],
    outcomeData: [
      { metric: "National ACGR (2005-06)", target: ">90%", actual: "73.4%", source: "NCES" },
      { metric: "National ACGR (2019-20)", target: ">90%", actual: "87.0%", source: "NCES" },
      { metric: "National ACGR (2021-22)", target: ">90%", actual: "87.0%", source: "NCES" },
    ],
  },
  {
    id: "NCLB-014",
    ref: "NCLB/ESSA cross-cutting",
    promiser: "states-ed",
    promisee: "ell",
    body: "Improve English language proficiency and academic achievement for English Language Learners",
    domain: "Equity",
    status: "partial",
    note: "ELL population grew from ~4.6M (2002) to ~5.1M (2020). ESSA requires separate English proficiency indicator in accountability. Achievement gaps between ELLs and non-ELLs persist: NAEP 2022 4th grade reading gap is ~35 points. Reclassification rates vary enormously by state. The promise is partially met — ELLs are visible in data but outcomes haven't transformed.",
    verification: { method: "data", source: "NCES ELL data / NAEP", frequency: "annual" },
    depends_on: ["NCLB-004", "ESSA-002"],
  },
  {
    id: "NCLB-015",
    ref: "NCLB/ESSA cross-cutting",
    promiser: "states-ed",
    promisee: "swd",
    body: "Include students with disabilities in general assessments and accountability systems; ensure access to grade-level content",
    domain: "Equity",
    status: "partial",
    note: "NCLB required SWD to be assessed and included in AYP. ESSA caps alternate assessments at 1% of students. Inclusion in accountability forced attention to SWD achievement. But achievement gaps remain large: NAEP 2022 4th grade reading gap between SWD and non-SWD is ~37 points. Participation in assessments is near-universal but outcomes haven't converged.",
    verification: { method: "data", source: "NCES / IDEA data", frequency: "annual" },
    depends_on: ["NCLB-004", "ESSA-002"],
  },
];

// ─── TRAJECTORIES ───
export const NCLB_TRAJECTORIES: Trajectory[] = [
  {
    agentId: "students",
    label: "NAEP 4th Grade Math Proficiency (%)",
    subtitle: "National Assessment of Educational Progress — the 'Nation's Report Card'",
    yAxisLabel: "% Proficient or Above",
    yDomain: [0, 100],
    milestones: [
      { value: 100, label: "NCLB Target", color: "#991b1b" },
    ],
    data: [
      { year: 2000, actual: 26 },
      { year: 2003, actual: 32 },
      { year: 2005, actual: 36 },
      { year: 2007, actual: 39 },
      { year: 2009, actual: 39 },
      { year: 2011, actual: 40 },
      { year: 2013, actual: 42, target: 100 },
      { year: 2015, actual: 40 },
      { year: 2017, actual: 40 },
      { year: 2019, actual: 41 },
      { year: 2022, actual: 36 },
    ],
  },
  {
    agentId: "states-ed",
    label: "High School Graduation Rate (ACGR %)",
    subtitle: "Adjusted Cohort Graduation Rate — all students",
    yAxisLabel: "Graduation Rate %",
    yDomain: [60, 100],
    data: [
      { year: 2006, actual: 73.4 },
      { year: 2008, actual: 74.9 },
      { year: 2010, actual: 78.2 },
      { year: 2012, actual: 80.0 },
      { year: 2014, actual: 82.3 },
      { year: 2016, actual: 84.1 },
      { year: 2018, actual: 85.3, target: 90 },
      { year: 2020, actual: 87.0, target: 90 },
      { year: 2022, actual: 87.0, target: 90 },
    ],
  },
];

// ─── INSIGHTS ───
export const NCLB_INSIGHTS: Insight[] = [
  {
    severity: "critical",
    type: "Cascade",
    title: "The 100% proficiency target was structurally impossible — and its failure cascaded through the entire system",
    body: "NCLB-001's 100% proficiency target by 2014 was always unachievable — no educational system in the world has reached universal proficiency by any meaningful standard. By 2011, 82% of schools were projected to fail AYP, triggering cascading sanctions (NCLB-007, NCLB-008) that overwhelmed districts. The system designed to identify struggling schools ended up labeling nearly all schools as failures, destroying the signal and forcing the Obama administration to issue waivers (NCLB-012) that effectively rewrote the law.",
    promises: ["NCLB-001", "NCLB-002", "NCLB-007", "NCLB-008", "NCLB-012"],
  },
  {
    severity: "positive",
    type: "Working",
    title: "Disaggregated data requirement transformed education policy",
    body: "NCLB-004's requirement to report achievement data by race, income, disability, and English learner status is arguably the law's most important and lasting contribution. Before NCLB, aggregate school data hid enormous gaps. After NCLB, every school report card showed whether Black students, Hispanic students, low-income students, and students with disabilities were being served. This transparency persists under ESSA and reshaped how America talks about educational equity.",
    promises: ["NCLB-004", "NCLB-005", "ESSA-002"],
  },
  {
    severity: "positive",
    type: "Working",
    title: "Graduation rates rose 14 percentage points across the NCLB/ESSA era",
    body: "From 73.4% (2006) to 87.0% (2020), the adjusted cohort graduation rate increased steadily. Accountability pressure, dropout prevention programs, and state-level focus on graduation contributed. This is one of the clearest positive trends associated with standards-based accountability — though causation is debated and some inflation concerns exist.",
    promises: ["NCLB-013", "ESSA-002"],
  },
  {
    severity: "warning",
    type: "Gap",
    title: "State standards variation created a meaningless accountability patchwork",
    body: "NCLB required state standards but didn't define rigor. States set wildly different proficiency bars. In 2007, Mississippi rated 89% of 4th graders proficient in reading; NAEP rated 18%. States could show 'progress' by lowering standards rather than improving teaching. ESSA addressed this partially by allowing state choice but requiring 'challenging' standards — yet the fundamental comparability problem persists.",
    promises: ["NCLB-003", "ESSA-001"],
  },
  {
    severity: "critical",
    type: "Drift",
    title: "COVID-19 reversed a decade of modest achievement gains",
    body: "NAEP 2022 showed historic declines: 4th grade math fell 5 points (largest ever), 4th grade reading fell 3 points. Achievement gaps widened. The gains accumulated through NCLB and ESSA — modest but real — were substantially erased. The 'COVID slide' hit disadvantaged students hardest, widening the very gaps NCLB/ESSA promised to close. Recovery is slow and incomplete.",
    promises: ["NCLB-001", "NCLB-009", "ESSA-005"],
  },
  {
    severity: "warning",
    type: "Conflict",
    title: "Federal accountability vs. local control: the tension ESSA didn't resolve",
    body: "NCLB centralized accountability with rigid federal targets. ESSA swung back toward state flexibility with guardrails (ESSA-006). But the fundamental tension remains: federal mandates drive consistency and equity attention; local control allows adaptation but enables evasion. States with weak accountability systems under-identify struggling schools. States with strong systems generate political backlash. Neither NCLB nor ESSA found the equilibrium.",
    promises: ["NCLB-001", "ESSA-002", "ESSA-006"],
  },
];

// ─── DOMAINS ───
function computeDomainHealth(promises: Promise[], domain: string): number {
  const domainPromises = promises.filter((p) => p.domain === domain);
  if (domainPromises.length === 0) return 0;
  const weights: Record<string, number> = {
    verified: 100, declared: 60, degraded: 30, violated: 0, unverifiable: 20,
    kept: 100, broken: 0, partial: 50, delayed: 40, modified: 55, legally_challenged: 25, repealed: 0,
  };
  const total = domainPromises.reduce((sum, p) => sum + (weights[p.status] ?? 0), 0);
  return Math.round(total / domainPromises.length);
}

export const NCLB_DOMAINS: Domain[] = [
  "Accountability", "Assessment", "Teacher Quality", "School Improvement",
  "Equity", "Funding", "Federal Authority",
].map((name) => ({
  name,
  color: nclbEssaDomainColors[name] ?? "#6b7280",
  promiseCount: NCLB_PROMISES.filter((p) => p.domain === name).length,
  healthScore: computeDomainHealth(NCLB_PROMISES, name),
}));

// ─── ASSEMBLED DASHBOARD ───
const keptCount = NCLB_PROMISES.filter((p) => ["kept", "verified"].includes(p.status)).length;
const brokenCount = NCLB_PROMISES.filter((p) => p.status === "broken").length;
const partialCount = NCLB_PROMISES.filter((p) => p.status === "partial").length;

export const NCLB_DASHBOARD: DashboardData = {
  title: "No Child Left Behind / Every Student Succeeds Act",
  subtitle: "25 Years of Education Accountability — Promise Network Analysis (2001-2025)",
  agents: NCLB_AGENTS,
  promises: NCLB_PROMISES,
  domains: NCLB_DOMAINS,
  insights: NCLB_INSIGHTS,
  trajectories: NCLB_TRAJECTORIES,
  grade: "C-",
  gradeExplanation: `${keptCount} of ${NCLB_PROMISES.length} promises kept. ${brokenCount} broken (including the defining 100% proficiency target), ${partialCount} partial. Disaggregated data and graduation rate gains are real successes. The impossible proficiency target, gaming of standards, and COVID reversal of achievement gains drive the low grade. ESSA's course correction is still playing out.`,
};
