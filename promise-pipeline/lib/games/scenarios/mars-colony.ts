import { ScenarioConfig } from "../types";

export const marsColonyScenario: ScenarioConfig = {
  id: "mars-colony",
  title: "Promise Governor: Mars Colony",
  tagline: "Govern a corporate Mars colony. Balance survival against profit.",
  description:
    "You are Governor-CEO of Ares Station, a private Mars colony. You answer to 2,847 colonists who want to survive and shareholders who want return on investment. 4 Martian quarters. Structurally impossible budget.",
  primaryLesson: "structural-conflict",
  difficulty: "standard",
  estimatedMinutes: 15,

  setting: {
    location: "Ares Station, Mars",
    role: "Governor-CEO",
    organization: "Helios Corp",
    timeContext: "Q1 2047",
    populationLabel: "colonists",
    populationCount: 2847,
    flavorIntro:
      "You have been appointed Governor-CEO of Ares Station, a Helios Corp joint-venture colony. The colony is operational but underfunded. You answer to two principals who want incompatible things.",
    unitLabel: "$",
    unitScale: "B",
  },

  promises: [
    {
      id: "P1",
      body: "Maintain life support at 99.9% uptime",
      domain: "Survival",
      promiseeGroup: "colonists",
      costPerRound: 2.1,
      isOneTime: false,
      startingProgress: 65,
      target: 100,
      degradeThreshold: 60,
      violateThreshold: 30,
      decayRate: 20,
      fundingEfficiency: 12,
      description:
        "The colony's life support systems must maintain near-perfect uptime. A single extended failure is a colony extinction event.",
      verificationNote: "Monitored by Helios Corp onboard systems. Uptime logged and transmitted to Earth quarterly. Self-reported.",
      isFundable: true,
    },
    {
      id: "P2",
      body: "Expand hab capacity by 40%",
      domain: "Housing",
      promiseeGroup: "colonists",
      costPerRound: 3.4,
      isOneTime: true,
      startingProgress: 0,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 15,
      decayRate: 5,
      fundingEfficiency: 10,
      description:
        "Current hab modules are operating at 94% occupancy. The colony cannot safely grow without expanded living quarters.",
      verificationNote: "Verified by physical inspection — hab module count and capacity are measurable.",
      isFundable: true,
    },
    {
      id: "P3",
      body: "Establish water reclamation to 90% efficiency",
      domain: "Resources",
      promiseeGroup: "both",
      costPerRound: 1.8,
      isOneTime: false,
      startingProgress: 40,
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 25,
      decayRate: 15,
      fundingEfficiency: 14,
      description:
        "Mars has no natural liquid water at the surface. The water reclamation system is the foundation of everything else.",
      verificationNote: "Efficiency measurable via input/output sensors. Currently self-reported.",
      isFundable: true,
    },
    {
      id: "P4",
      body: "Launch mining operations ahead of schedule",
      domain: "Revenue",
      promiseeGroup: "shareholders",
      costPerRound: 2.6,
      isOneTime: false,
      startingProgress: 15,
      target: 100,
      degradeThreshold: 45,
      violateThreshold: 20,
      decayRate: 10,
      fundingEfficiency: 11,
      description:
        "Helios Corp's primary revenue justification for the colony. Rare earth extraction for Earth's clean energy transition. Mining requires water for equipment cooling.",
      verificationNote: "Output measured in tonnage and transmitted via P8 (Earth comms). Verifiable but depends on comms uptime.",
      isFundable: true,
    },
    {
      id: "P5",
      body: "Deliver 12% return to shareholders by Q4",
      domain: "Finance",
      promiseeGroup: "shareholders",
      costPerRound: 0,
      isOneTime: false,
      startingProgress: 0,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 20,
      decayRate: 8,
      fundingEfficiency: 0,
      description:
        "The promise that justifies the entire enterprise. Shareholder return is a function of mining operations and transparent reporting. Cannot be directly funded.",
      verificationNote: "Computed from P4 (mining output, 70%) and P8 (comms transparency, 30%). Financially transmitted quarterly.",
      isFundable: false,
    },
    {
      id: "P6",
      body: "Build a colony school by end of term",
      domain: "Community",
      promiseeGroup: "colonists",
      costPerRound: 1.6,
      isOneTime: true,
      startingProgress: 0,
      target: 100,
      degradeThreshold: 35,
      violateThreshold: 10,
      decayRate: 3,
      fundingEfficiency: 16,
      description:
        "312 children live in Ares Station. The colony charter guarantees education. Without a school, families cannot consider Mars a permanent home.",
      verificationNote: "Physical structure is verifiable. Curriculum quality is not — no external education standards exist on Mars.",
      isFundable: true,
    },
    {
      id: "P7",
      body: "Reduce radiation exposure 50% via shielding",
      domain: "Safety",
      promiseeGroup: "colonists",
      costPerRound: 2.2,
      isOneTime: false,
      startingProgress: 25,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 20,
      decayRate: 8,
      fundingEfficiency: 12,
      description:
        "Mars has no magnetosphere. Cosmic radiation and solar particle events are the leading long-term health risk for colonists. No independent measurement infrastructure exists.",
      verificationNote:
        "UNVERIFIABLE. The sensors that measure shielding effectiveness are owned and operated by Helios Corp. No independent measurement infrastructure exists on Mars.",
      forceStatus: "unverifiable",
      isFundable: true,
    },
    {
      id: "P8",
      body: "Establish Earth comms uptime at 95%",
      domain: "Transparency",
      promiseeGroup: "both",
      costPerRound: 0.9,
      isOneTime: false,
      startingProgress: 50,
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 25,
      decayRate: 12,
      fundingEfficiency: 22,
      description:
        "26-minute signal delay each way. Earth comms are the only lifeline for emergency consultation, financial reporting, and colonist contact with families.",
      verificationNote: "Uptime measured by both Earth-side ground stations and colony systems. Most objectively verifiable promise in the portfolio.",
      isFundable: true,
    },
  ],

  dependencies: [
    {
      upstream: "P3",
      downstream: "P1",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Water recycling is prerequisite for sustained life support",
    },
    {
      upstream: "P1",
      downstream: "P2",
      cascadeThreshold: 60,
      cascadePenaltyFactor: 0.4,
      explanation: "Cannot expand habitat without stable life support",
    },
    {
      upstream: "P1",
      downstream: "P6",
      cascadeThreshold: 60,
      cascadePenaltyFactor: 0.4,
      explanation: "Colonists won't send kids to school if survival is uncertain",
    },
    {
      upstream: "P3",
      downstream: "P4",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Mining operations require water for equipment cooling",
    },
    {
      upstream: "P4",
      downstream: "P5",
      cascadeThreshold: 60,
      cascadePenaltyFactor: 0.4,
      explanation: "No mining revenue, no shareholder return",
    },
    {
      upstream: "P8",
      downstream: "P5",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Shareholders require transparent reporting",
    },
  ],

  structuralConflicts: [
    {
      triggerPromiseId: "P4",
      affectedPromiseId: "P1",
      fundingThreshold: 2.0,
      penaltyPerUnit: 8,
      explanation:
        "Structural conflict detected. Mining operations funded at $[X]B draw [Y]% from colony power reserves — the same capacity maintained for life support surge protection. Maximizing shareholder return puts the colony's survival margin at risk. This conflict was present in your mandate before you took office.",
      realWorldParallel:
        "In Oregon's HB 2021, a cost cap structurally favors electricity rates over emissions reduction. When the clean energy transition becomes expensive, the cost cap triggers, and emissions goals yield to affordability goals.",
    },
  ],

  budget: {
    startingCapital: 12.0,
    allocationPerRound: 5.0,
    totalAvailableNoRevenue: 32.0,
    totalCostFullFunding: 60.0,
    carryOver: true,
  },

  revenueTriggers: [
    {
      sourcePromiseId: "P4",
      progressThreshold: 60,
      revenuePerRound: 1.5,
      label: "Mining revenue",
    },
  ],

  computedPromises: [
    {
      promiseId: "P5",
      formula: {
        inputs: [
          { promiseId: "P4", weight: 0.7 },
          { promiseId: "P8", weight: 0.3 },
        ],
        bonuses: [
          { condition: "mining-active", promiseId: "P4", threshold: 60, bonus: 10 },
        ],
      },
    },
  ],

  accountability: {
    overallLabel: "Colony Integrity",
    overallBlend: { groupAWeight: 0.55, groupBWeight: 0.45 },
    groupA: {
      id: "colonists",
      label: "Colonist Trust",
      gameOverLabel: "MUTINY — GOVERNANCE TERMINATED",
      weights: { P1: 3.0, P2: 1.5, P3: 2.5, P6: 1.5, P7: 2.0, P8: 0.5 },
    },
    groupB: {
      id: "shareholders",
      label: "Shareholder Confidence",
      gameOverLabel: "HELIOS CORP DEFUNDS COLONY — GOVERNANCE TERMINATED",
      weights: { P4: 3.0, P5: 3.0, P8: 2.0, P3: 1.0, P1: 1.0 },
    },
    gameOverThreshold: 10,
  },

  events: [
    {
      id: "E1",
      name: "Dust Storm (Category 4)",
      flavorText:
        "72-hour blackout. Solar arrays at 12% capacity. Emergency power protocols engaged. All non-essential systems suspended pending atmospheric clearance.",
      budgetImpact: -0.7,
      promiseEffects: [
        { promiseId: "P1", progressDelta: -15 },
        { promiseId: "P3", progressDelta: -10 },
      ],
      round: 1,
    },
    {
      id: "E2",
      name: "Supply Rocket Delayed",
      flavorText:
        "Earth launch window missed due to booster anomaly. Resupply arrival pushed to next transfer orbit. 8-week delay on construction materials.",
      budgetImpact: -0.5,
      promiseEffects: [{ promiseId: "P2", progressDelta: -8 }],
      round: 1,
    },
    {
      id: "E3",
      name: "Geological Survey Breakthrough",
      flavorText:
        "Subsurface ice deposit confirmed at grid reference Theta-7. Water reclamation capacity projection revised upward. Engineering team recommends immediate drill site.",
      budgetImpact: 0.4,
      promiseEffects: [{ promiseId: "P3", progressDelta: 20 }],
      round: 2,
    },
    {
      id: "E4",
      name: "Helios Corp Audit",
      flavorText:
        "Earth board demands Q2 performance review. Allocate senior staff to reporting obligations. Communications bandwidth prioritized for data transmission.",
      budgetImpact: -0.3,
      promiseEffects: [{ promiseId: "P8", progressDelta: 10 }],
      round: 2,
    },
    {
      id: "E5",
      name: "Colonist Petition",
      flavorText:
        "312 colonists sign formal petition demanding school construction timeline. Families coalition cites Section 6 of colony charter. Morale impact noted.",
      budgetImpact: 0,
      promiseEffects: [{ promiseId: "P6", progressDelta: -5 }],
      round: 3,
      statusOverride: {
        promiseId: "P6",
        note: "Colonist petition filed. If school remains below 35% progress, colonist trust penalty doubles next quarter.",
      },
    },
    {
      id: "E6",
      name: "Solar Flare Event",
      flavorText:
        "Class X2.4 solar flare. Colony radiation levels spike for 48 hours. Shielding effectiveness under scrutiny. Helios Corp sensors report nominal — but who else is measuring?",
      budgetImpact: -0.2,
      promiseEffects: [{ promiseId: "P7", progressDelta: -20 }],
      round: 3,
      statusOverride: {
        promiseId: "P7",
        note: "Radiation spike detected. Helios Corp's own sensors report shielding held. Independent verification impossible. Status remains: Unverifiable.",
      },
    },
    {
      id: "E7",
      name: "Recruitment Success",
      flavorText:
        "50 specialist colonists arrive on the MV Shackleton. Mining engineers, hydrogeologists, and one (1) schoolteacher. Workforce capacity increased.",
      budgetImpact: 0.6,
      promiseEffects: [{ promiseId: "P4", progressDelta: 12 }],
      round: 4,
    },
  ],

  totalRounds: 4,
  roundLabel: "Quarter",

  teachingMoments: [
    {
      id: "tm-network-health",
      type: "network-health",
      title: "COLONY INTEGRITY SCORE",
      trigger: { type: "round", round: 1 },
      headline: "How Colony Integrity Is Calculated",
      bodyTemplate:
        "Colony Integrity is the weighted average of all promise statuses across both stakeholder groups. It is not about any single commitment — it's the structural health of your entire obligation network.",
      downstreamEffects: [
        "Colonist Trust weights survival and community promises. If it hits zero, the colony mutinies.",
        "Shareholder Confidence weights revenue and transparency promises. If it hits zero, Helios Corp pulls funding.",
      ],
      realWorldParallel:
        "This is how Promise Pipeline models accountability. The same scoring formula powers the Oregon HB 2021 dashboard — where the real promises, real dependencies, and real cascades are playing out now.",
      severity: "info",
      showOnce: true,
    },
    {
      id: "tm-cascade",
      type: "cascade-failure",
      title: "CASCADE DETECTED — WATER RECLAMATION FAILURE",
      trigger: { type: "promise-below", promiseId: "P3", threshold: 50 },
      headline: "Water reclamation below 50% — cascade propagating",
      bodyTemplate:
        "Water reclamation at {{P3}}. Systems below minimum operational threshold.",
      downstreamEffects: [
        "P1 (Life Support): Efficiency dropping. Water is a core life support input.",
        "P2 (Hab Expansion): Halted. Cannot build new quarters while life support is at risk.",
        "P4 (Mining): Operations suspended. Equipment cooling requires water reclamation ≥50%.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, PacifiCorp's rejected clean energy plan cascaded to emissions targets, workforce transition, and equity provisions across three domains. Four consequences from one underfunded promise.",
      severity: "critical",
      showOnce: true,
    },
    {
      id: "tm-verification-gap",
      type: "verification-gap",
      title: "VERIFICATION GAP — RADIATION SHIELDING",
      trigger: { type: "round", round: 3 },
      headline: "Radiation shielding is unverifiable",
      bodyTemplate:
        "Shielding contractor reports {{P7}} reduction in radiation exposure. Independent measurement infrastructure does not exist on Mars.",
      downstreamEffects: [
        "The sensors that measure shielding effectiveness are owned by the same corporation that promised the shielding.",
        "Status: Unverifiable. Not because nothing is being done — but because no one can confirm what's being done.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, equity promises — commitments to environmental justice communities, affordability protections — have no comparable verification infrastructure. Measurable commitments get accountability. Unmeasurable ones get rhetoric.",
      severity: "warning",
      showOnce: true,
    },
    {
      id: "tm-structural-conflict",
      type: "structural-conflict",
      title: "STRUCTURAL CONFLICT — REVENUE vs. SURVIVAL",
      trigger: { type: "conflict-triggered", conflictIndex: 0 },
      headline: "Mining vs. life support power reserves",
      bodyTemplate:
        "Mining operations funded above $2.0B/quarter draw from colony power reserves — the same capacity maintained for life support surge protection.",
      downstreamEffects: [
        "This is not a resource allocation error. This is a structural property of your mandate.",
        "The shareholders who fund the colony require return on investment, and the mining operations that generate that return consume the same power reserves that keep colonists alive.",
        "This conflict was present in your mandate before you took office.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, a cost cap structurally favors electricity rates over emissions reduction. When the clean energy transition becomes expensive, the cost cap triggers, and emissions goals yield to affordability goals. The conflict is architectural.",
      severity: "critical",
      showOnce: false,
    },
  ],

  briefing: {
    headerLine1: "HELIOS CORP — ARES STATION GOVERNANCE PROTOCOL",
    headerLine2: "Classification: GOVERNOR-CEO BRIEFING PACKET",
    headerLine3: "Date: Sol 412, Martian Year 47 (Q1 2047 Terrestrial)",
    appointmentText:
      "You have been appointed Governor-CEO of Ares Station, a Helios Corp joint-venture colony. You answer to two principals: the 2,847 colonists of Ares Station (trust threshold: survival) and the Helios Corp Board of Directors (confidence threshold: return). Your term: 4 Martian quarters (~2 Earth years).",
    budgetExplanation: "You cannot fund everything. Prioritize accordingly.",
    startButtonLabel: "INITIATE GOVERNANCE PROTOCOL",
  },

  verdict: {
    groupAAssessment: {
      header: "HELIOS CORP — ARES STATION PERFORMANCE REVIEW",
      recommendations: {
        retain: { minOverall: 50, minGroupScore: 60, label: "Retain" },
        probation: { minOverall: 30, minGroupScore: 40, label: "Probation" },
        terminate: { label: "Terminate" },
      },
    },
    groupBAssessment: {
      header: "ARES STATION COLONIST REFERENDUM",
      retainThreshold: 60,
      retainLabel: "RETAINED",
      recallLabel: "RECALLED",
    },
    postMortemTemplates: {
      cascadeFired:
        "The cascade from water reclamation to downstream promises was structurally inevitable once P3 dropped below threshold. In a promise network, failure doesn't stay local.",
      verificationGap:
        "You invested in radiation shielding. Whether it worked remains unknown. The verification gap isn't about effort — it's about who controls the measurement.",
      structuralConflict:
        "The conflict between mining revenue and life support was designed into your mandate. No amount of optimization resolves a structural contradiction — it can only be made visible.",
      survived:
        "You kept the colony alive. The dual accountability structure forced a triage that single-constituency governance doesn't require.",
    },
  },

  cta: {
    fictionalLine: "Ares Station is fictional.",
    realLine: "Oregon HB 2021 is not.",
    bridgeText:
      "The same promise schema that modeled your Mars colony models 20 real commitments in Oregon's clean electricity law — with real cascade failures, real verification gaps, and real structural conflicts playing out now. The same cascade engine that showed you what breaks when water reclamation fails shows what breaks when PacifiCorp's clean energy plan is rejected.",
    primaryCTA: { label: "Explore the HB 2021 Dashboard", href: "/demo/hb2021" },
    secondaryCTAs: [
      { label: "Play Again", href: "" },
      { label: "Read the Whitepaper", href: "/about" },
    ],
  },

  theme: {
    bg: "#0a0e1a",
    bgLight: "#111827",
    bgCard: "#1a1f36",
    accent: "#f5a623",
    accentMuted: "#c4841a",
    terminal: "#00ff88",
    terminalDim: "#00cc6a",
    text: "#e5e7eb",
    textMuted: "#9ca3af",
    textBright: "#f9fafb",
    danger: "#ef4444",
    border: "#2d3748",
    scanline: "rgba(255,255,255,0.03)",
    statusColors: {
      verified: "#00ff88",
      declared: "#60a5fa",
      degraded: "#f59e0b",
      violated: "#ef4444",
      unverifiable: "#a78bfa",
    },
    statusBgColors: {
      verified: "rgba(0,255,136,0.12)",
      declared: "rgba(96,165,250,0.12)",
      degraded: "rgba(245,158,11,0.12)",
      violated: "rgba(239,68,68,0.12)",
      unverifiable: "rgba(167,139,250,0.12)",
    },
    domainColors: {
      Survival: "#ef4444",
      Housing: "#f59e0b",
      Resources: "#3b82f6",
      Revenue: "#10b981",
      Finance: "#06b6d4",
      Community: "#8b5cf6",
      Safety: "#f97316",
      Transparency: "#64748b",
    },
    primaryFont: "mono",
    narrativeFont: "serif",
    nodeShape: "hexagon",
    edgeStyle: "tunnel",
    transitionStyle: "fade-black",
    hasScanlines: true,
    hasAmbientParticles: false,
  },

  metadata: {
    title: "Promise Governor: Mars Colony | Promise Pipeline",
    description:
      "Can you keep a Mars colony alive while satisfying shareholders? An interactive simulation teaching cascade failure, verification gaps, and structural conflict.",
  },
};
