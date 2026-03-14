import { ScenarioConfig } from "../types";

export const deepSeaScenario: ScenarioConfig = {
  id: "deep-sea",
  title: "Promise Governor: Deep Sea Station",
  tagline: "Direct a deep-ocean research station. Six layers deep.",
  description:
    "You are Station Director of Hadal-7, a deep-ocean research station at 8,200 meters. A 48-person crew. A 6-week deep season. A dependency chain 6 layers deep. If the foundation fails, everything above it fails.",
  primaryLesson: "cascade-depth",
  difficulty: "hard",
  estimatedMinutes: 15,

  setting: {
    location: "Hadal-7 Research Station, Mariana Trench",
    role: "Station Director",
    organization: "Pelagic Institute",
    timeContext: "Week 1, Deep Season 2049",
    populationLabel: "crew",
    populationCount: 48,
    flavorIntro:
      "You are Station Director of Hadal-7. Depth: 8,200 meters. Crew: 48. Duration: 6 weeks. The ocean does not negotiate. The board does not wait.",
    unitLabel: "$",
    unitScale: "M",
  },

  promises: [
    {
      id: "P1",
      body: "Maintain hull integrity at rated pressure",
      domain: "Structural",
      promiseeGroup: "crew",
      costPerRound: 4.2,
      isOneTime: false,
      startingProgress: 70,
      target: 100,
      degradeThreshold: 55,
      violateThreshold: 25,
      decayRate: 25,
      fundingEfficiency: 10,
      isFundable: true,
      description:
        "At 8,200 meters, hull integrity is not optional. Micro-fracture propagation under extreme pressure is the primary failure mode. Maintenance cannot be deferred.",
      verificationNote:
        "Acoustic sensors monitor micro-fracture propagation. Periodic manual inspection. Reasonably verifiable.",
    },
    {
      id: "P2",
      body: "Keep pressure regulation within ±0.3 atm tolerance",
      domain: "Environmental",
      promiseeGroup: "crew",
      costPerRound: 3.1,
      isOneTime: false,
      startingProgress: 60,
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 20,
      decayRate: 20,
      fundingEfficiency: 11,
      isFundable: true,
      description:
        "Pressure regulation maintains the breathable environment and prevents explosive decompression events.",
      verificationNote:
        "Measured continuously by pressure sensors. Highly verifiable.",
    },
    {
      id: "P3",
      body: "Maintain breathable atmosphere and CO2 scrubbing",
      domain: "Life Support",
      promiseeGroup: "crew",
      costPerRound: 3.8,
      isOneTime: false,
      startingProgress: 55,
      target: 100,
      degradeThreshold: 55,
      violateThreshold: 25,
      decayRate: 22,
      fundingEfficiency: 10,
      isFundable: true,
      description:
        "CO2 scrubbing systems process the atmosphere continuously. Degradation causes headaches, then cognitive impairment, then death.",
      verificationNote: "CO2 levels measured by sensors. Verifiable.",
    },
    {
      id: "P4",
      body: "Sustain lab operations for all 3 research teams",
      domain: "Operations",
      promiseeGroup: "both",
      costPerRound: 2.5,
      isOneTime: false,
      startingProgress: 45,
      target: 100,
      degradeThreshold: 45,
      violateThreshold: 20,
      decayRate: 15,
      fundingEfficiency: 12,
      isFundable: true,
      description:
        "Three research teams require operational labs: marine biology, geology, and chemistry. Each has separate equipment requirements.",
      verificationNote:
        "Lab utilization rates trackable. Self-reported by team leads.",
    },
    {
      id: "P5",
      body: "Produce 4 dataset packages for surface analysis",
      domain: "Research",
      promiseeGroup: "board",
      costPerRound: 1.8,
      isOneTime: false,
      startingProgress: 20,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 15,
      decayRate: 12,
      fundingEfficiency: 14,
      isFundable: true,
      description:
        "The Institute's funding model requires publishable data. Four dataset packages constitute a successful season.",
      verificationNote:
        "Datasets transmitted to surface for independent verification. Verifiable.",
    },
    {
      id: "P6",
      body: "Submit 2 papers to peer review before season end",
      domain: "Publication",
      promiseeGroup: "board",
      costPerRound: 0.8,
      isOneTime: false,
      startingProgress: 5,
      target: 100,
      degradeThreshold: 35,
      violateThreshold: 10,
      decayRate: 8,
      fundingEfficiency: 18,
      isFundable: true,
      description:
        "Publications are the primary measure of scientific output. Board funding decisions are based on publication counts.",
      verificationNote:
        "Journal submission status is publicly verifiable.",
    },
    {
      id: "P7",
      body: "Maintain emergency ascent capability at all times",
      domain: "Safety",
      promiseeGroup: "crew",
      costPerRound: 2.8,
      isOneTime: false,
      startingProgress: 55,
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 20,
      decayRate: 18,
      fundingEfficiency: 11,
      isFundable: true,
      forceStatus: "unverifiable",
      description:
        "Emergency ascent pods are the crew's only escape route. They cannot be fully tested at operating depth without risk of catastrophic failure.",
      verificationNote:
        "UNVERIFIABLE. Pods last tested pre-deployment at surface pressure. Full-system test at 8,200m would risk pod structural failure. Readiness assessed via component checklist only.",
    },
    {
      id: "P8",
      body: "Crew physical and psychological wellbeing program",
      domain: "Welfare",
      promiseeGroup: "crew",
      costPerRound: 1.2,
      isOneTime: false,
      startingProgress: 50,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 15,
      decayRate: 10,
      fundingEfficiency: 16,
      isFundable: true,
      description:
        "6 weeks at 8,200 meters with 48 people in a confined space. Psychological health deteriorates without active intervention.",
      verificationNote:
        "Assessed by station psychologist. Self-reported wellbeing scores.",
    },
  ],

  dependencies: [
    {
      upstream: "P1",
      downstream: "P2",
      cascadeThreshold: 55,
      cascadePenaltyFactor: 0.4,
      explanation: "Hull integrity is prerequisite for pressure regulation",
    },
    {
      upstream: "P2",
      downstream: "P3",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Pressure regulation required for atmosphere management",
    },
    {
      upstream: "P3",
      downstream: "P4",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Cannot run labs without breathable air",
    },
    {
      upstream: "P4",
      downstream: "P5",
      cascadeThreshold: 45,
      cascadePenaltyFactor: 0.4,
      explanation: "No lab access, no data collection",
    },
    {
      upstream: "P5",
      downstream: "P6",
      cascadeThreshold: 40,
      cascadePenaltyFactor: 0.4,
      explanation: "No data, no papers",
    },
    {
      upstream: "P2",
      downstream: "P7",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Evacuation pods require pressure system functionality",
    },
    {
      upstream: "P3",
      downstream: "P7",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.35,
      explanation: "Crew must be conscious to evacuate",
    },
    {
      upstream: "P3",
      downstream: "P8",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.35,
      explanation: "Wellbeing impossible without stable atmosphere",
    },
    {
      upstream: "P4",
      downstream: "P8",
      cascadeThreshold: 45,
      cascadePenaltyFactor: 0.3,
      explanation: "Crew morale depends on being able to do their work",
    },
  ],

  structuralConflicts: [
    {
      triggerPromiseId: "P4",
      affectedPromiseId: "P1",
      fundingThreshold: 2.5,
      penaltyPerUnit: 6,
      explanation:
        "Structural conflict detected. Full laboratory operations at $[X]M/week generate vibration harmonics that accelerate micro-fracture propagation in the titanium pressure hull. The research that justifies this station's existence is also the thing degrading the structure that keeps everyone alive. This conflict was present in the station's design specifications.",
      realWorldParallel:
        "In Oregon's HB 2021, a cost cap structurally favors electricity rates over emissions reduction. The mechanism that keeps the lights affordable is the same mechanism that slows the clean energy transition. The conflict is architectural.",
    },
  ],

  budget: {
    startingCapital: 18.0,
    allocationPerRound: 4.0,
    totalAvailableNoRevenue: 42.0,
    totalCostFullFunding: 72.0,
    carryOver: true,
  },

  revenueTriggers: [
    {
      sourcePromiseId: "P5",
      progressThreshold: 60,
      revenuePerRound: 1.5,
      label: "Research data licensing",
    },
  ],

  computedPromises: [],

  accountability: {
    overallLabel: "Station Viability",
    overallBlend: { groupAWeight: 0.6, groupBWeight: 0.4 },
    groupA: {
      id: "crew",
      label: "Crew Confidence",
      gameOverLabel: "CREW STRIKE — EMERGENCY SURFACE PROTOCOL INVOKED",
      weights: { P1: 3.0, P2: 2.5, P3: 3.0, P7: 2.5, P8: 2.0, P4: 1.0 },
    },
    groupB: {
      id: "board",
      label: "Institute Board Satisfaction",
      gameOverLabel:
        "SEASON FUNDING REVOKED — STATION PLACED IN HIBERNATION MODE",
      weights: { P5: 3.0, P6: 3.0, P4: 2.0, P1: 1.0, P8: 0.5 },
    },
    gameOverThreshold: 10,
  },

  events: [
    {
      id: "E1",
      name: "Micro-fracture Alert",
      round: 1,
      budgetImpact: -0.8,
      promiseEffects: [{ promiseId: "P1", progressDelta: -12 }],
      flavorText:
        "Acoustic sensors detect micro-fracture propagation in Section 7 hull panel. Engineering recommends immediate inspection protocol.",
    },
    {
      id: "E2",
      name: "Current Shift",
      round: 2,
      budgetImpact: -0.5,
      promiseEffects: [
        { promiseId: "P2", progressDelta: -8 },
        { promiseId: "P3", progressDelta: -5 },
      ],
      flavorText:
        "Deep ocean current pattern shifts unexpectedly. Station drift requires thruster correction. Power reserves diverted.",
    },
    {
      id: "E3",
      name: "Hydrothermal Vent Discovery",
      round: 3,
      budgetImpact: 0.6,
      promiseEffects: [{ promiseId: "P5", progressDelta: 15 }],
      flavorText:
        "New hydrothermal vent field discovered 400m northeast. Unprecedented biological specimens. Research teams request immediate lab access.",
    },
    {
      id: "E4",
      name: "Surface Storm Advisory",
      round: 3,
      budgetImpact: -1.0,
      promiseEffects: [],
      flavorText:
        "Category 3 storm system above dive site. Surface support vessels holding position. Weekly supply pod delayed.",
    },
    {
      id: "E5",
      name: "Crew Psychological Review",
      round: 4,
      budgetImpact: -0.3,
      promiseEffects: [{ promiseId: "P8", progressDelta: -10 }],
      flavorText:
        "Station psychologist flags elevated stress indicators in 12 crew members. Recommends reduced work hours and recreation time.",
    },
    {
      id: "E6",
      name: "Pressure Anomaly",
      round: 5,
      budgetImpact: -0.6,
      promiseEffects: [
        { promiseId: "P2", progressDelta: -15 },
        { promiseId: "P8", progressDelta: -8 },
      ],
      flavorText:
        "Unexplained 0.2 atm pressure fluctuation in hab ring 3. Cause undetermined. Crew relocated to rings 1-2 pending investigation.",
    },
    {
      id: "E7",
      name: "Institute Progress Inquiry",
      round: 6,
      budgetImpact: -0.2,
      promiseEffects: [{ promiseId: "P6", progressDelta: 8 }],
      flavorText:
        "Board requests mid-season publication status update. Emphasize preliminary results in response. Comms time allocated.",
    },
  ],

  totalRounds: 6,
  roundLabel: "Week",

  teachingMoments: [
    {
      id: "tm-network-health",
      type: "network-health",
      title: "STATION VIABILITY SCORE",
      trigger: { type: "round", round: 1 },
      headline: "The dependency chain runs 6 layers deep",
      bodyTemplate:
        "Station Viability is the weighted average of all promise statuses across both accountability groups. Hull integrity underpins everything — if it fails, the cascade runs to pressure, atmosphere, labs, research, publication.",
      downstreamEffects: [
        "Crew Confidence weights structural and safety promises — if it hits zero, emergency surface protocol is invoked.",
        "Institute Board Satisfaction weights research output and publication — if it hits zero, the season ends.",
      ],
      realWorldParallel:
        "The same chain structure exists in HB 2021. Planning decisions cascade to emissions targets, which cascade to workforce, which cascade to equity provisions.",
      severity: "info",
      showOnce: true,
    },
    {
      id: "tm-cascade",
      type: "cascade-depth",
      title: "CASCADE CHAIN — HULL FAILURE PROPAGATING",
      trigger: { type: "promise-below", promiseId: "P1", threshold: 55 },
      headline: "Hull integrity below threshold — 5 downstream promises at risk",
      bodyTemplate:
        "Hull integrity at {{P1}}. Below the cascade threshold of 55%. Cascade propagating through the dependency chain.",
      downstreamEffects: [
        "P2 (Pressure): Regulation degrading. Hull micro-fractures destabilize pressure systems.",
        "P3 (Atmosphere): CO2 scrubbing at risk. Atmosphere requires stable pressure.",
        "P4 (Labs): Research operations halting. Labs require breathable air.",
        "P5 (Research): Data collection suspended. No lab, no data.",
        "P6 (Publication): Paper pipeline empty. No data, no papers.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, a planning approval failure cascades to emissions targets, which cascades to workforce transition, which cascades to equity provisions. The depth of the graph determines the fragility of the network.",
      severity: "critical",
      showOnce: true,
    },
    {
      id: "tm-verification-gap",
      type: "verification-gap",
      title: "VERIFICATION GAP — EMERGENCY EVACUATION",
      trigger: { type: "round", round: 2 },
      headline: "Emergency ascent pods cannot be safely tested",
      bodyTemplate:
        "Emergency ascent system last full-pressure tested: pre-deployment, surface conditions. Full-system test at 8,200m would risk pod structural failure.",
      downstreamEffects: [
        "Readiness assessed via component checklist and diagnostic telemetry only.",
        "Status: Unverifiable. The measurement would destroy the thing being measured.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, equity promises — protections for environmental justice communities — have no verification infrastructure. You can't audit what you can't measure.",
      severity: "warning",
      showOnce: true,
    },
    {
      id: "tm-structural-conflict",
      type: "structural-conflict",
      title: "STRUCTURAL CONFLICT — RESEARCH vs. HULL INTEGRITY",
      trigger: { type: "conflict-triggered", conflictIndex: 0 },
      headline: "Full lab operations accelerate hull fatigue",
      bodyTemplate:
        "Laboratory operations funded above $2.5M/week generate vibration harmonics that accelerate micro-fracture propagation in the titanium pressure hull.",
      downstreamEffects: [
        "The research that justifies this station's existence is also the thing degrading the structure that keeps everyone alive.",
        "This conflict was present in the station's design specifications.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, a cost cap structurally favors electricity rates over emissions reduction. The mechanism that keeps the lights affordable slows the clean energy transition.",
      severity: "critical",
      showOnce: false,
    },
  ],

  briefing: {
    headerLine1: "PELAGIC INSTITUTE — HADAL-7 DEEP SEASON OPERATIONS",
    headerLine2: "Classification: STATION DIRECTOR BRIEFING",
    headerLine3: "Date: Week 1, Deep Season 2049",
    appointmentText:
      "You are Station Director of Hadal-7. Depth: 8,200 meters. Crew: 48. Duration: 6 weeks (deep season window). You answer to: The 48-member crew of Hadal-7 (survival threshold: structural) and the Pelagic Institute Board of Directors (output threshold: publication). The ocean does not negotiate. The board does not wait.",
    budgetExplanation:
      "The numbers do not add up. They were never designed to.",
    startButtonLabel: "BEGIN DEEP SEASON",
  },

  verdict: {
    groupAAssessment: {
      header: "PELAGIC INSTITUTE — PERFORMANCE REVIEW",
      recommendations: {
        retain: { minOverall: 50, minGroupScore: 60, label: "Director Retained" },
        probation: {
          minOverall: 30,
          minGroupScore: 40,
          label: "Performance Review",
        },
        terminate: { label: "Director Relieved" },
      },
    },
    groupBAssessment: {
      header: "HADAL-7 CREW CONFIDENCE VOTE",
      retainThreshold: 60,
      retainLabel: "VOTE OF CONFIDENCE",
      recallLabel: "NO CONFIDENCE",
    },
    postMortemTemplates: {
      cascadeFired:
        "The cascade from hull integrity through the 6-layer dependency chain was structurally inevitable. In a deep dependency graph, foundation failures don't stop — they propagate all the way to the surface.",
      verificationGap:
        "You funded the emergency evacuation system. Whether it would work remains unknown. The gap isn't about effort — it's about whether the measurement would destroy the thing being measured.",
      structuralConflict:
        "The vibration conflict between research operations and hull integrity was designed into the station. The Institute approved it because a station that can't do science would never be funded.",
      survived:
        "You kept the crew alive and produced publishable results. The 6-week constraint forced triage across a dependency chain that isn't flat — it's vertical.",
    },
  },

  cta: {
    fictionalLine: "Hadal-7 is fictional.",
    realLine: "Oregon HB 2021 is not.",
    bridgeText:
      "The dependency chain you just watched collapse — hull to pressure to atmosphere to labs to research to publication — is the same structural pattern in real legislation. In Oregon's clean electricity law, planning approval cascades to emissions targets, which cascade to workforce transition, which cascade to equity provisions. The depth of the graph determines the fragility of the network. Promise Pipeline makes that depth visible before the cascade fires.",
    primaryCTA: { label: "Explore the HB 2021 Dashboard", href: "/demo/hb2021" },
    secondaryCTAs: [
      { label: "Play Again", href: "" },
      { label: "Try Mars Colony", href: "/games/mars-colony" },
    ],
  },

  theme: {
    bg: "#0a1628",
    bgLight: "#0f1f3d",
    bgCard: "#142040",
    accent: "#00b4d8",
    accentMuted: "#0077b6",
    terminal: "#48cae4",
    terminalDim: "#0096c7",
    text: "#caf0f8",
    textMuted: "#90e0ef",
    textBright: "#e0fbfc",
    danger: "#ff6b6b",
    border: "#1a3050",
    scanline: "rgba(72,202,228,0.02)",
    statusColors: {
      verified: "#4ade80",
      declared: "#60a5fa",
      degraded: "#fbbf24",
      violated: "#f87171",
      unverifiable: "#c084fc",
    },
    statusBgColors: {
      verified: "rgba(74,222,128,0.15)",
      declared: "rgba(96,165,250,0.15)",
      degraded: "rgba(251,191,36,0.15)",
      violated: "rgba(248,113,113,0.15)",
      unverifiable: "rgba(192,132,252,0.15)",
    },
    domainColors: {
      Structural: "#64748b",
      Environmental: "#0ea5e9",
      "Life Support": "#22d3ee",
      Operations: "#a78bfa",
      Research: "#34d399",
      Publication: "#fbbf24",
      Safety: "#f87171",
      Welfare: "#fb923c",
    },
    primaryFont: "mono",
    narrativeFont: "serif",
    nodeShape: "circle",
    edgeStyle: "pipe",
    transitionStyle: "pressure-seal",
    hasScanlines: true,
    hasAmbientParticles: true,
    particleType: "bubbles",
  },

  metadata: {
    title: "Promise Governor: Deep Sea Station | Promise Pipeline",
    description:
      "Direct a deep-ocean research station at 8,200 meters. Teach cascade depth — when foundations fail, everything above fails.",
  },
};
