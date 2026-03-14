import { ScenarioConfig } from "../types";

export const supplyStationScenario: ScenarioConfig = {
  id: "supply-station",
  title: "Promise Governor: Supply Station",
  tagline: "Coordinate an orbital resupply hub. You don't control your suppliers.",
  description:
    "You are the Logistics Coordinator of Waypoint Meridian, a UNOSA resupply station at the Earth-Moon L2 point. Half your promises depend on Earth suppliers you cannot control. When they fail, you hold the bag.",
  primaryLesson: "upstream-dependency",
  difficulty: "hard",
  estimatedMinutes: 15,

  setting: {
    location: "Waypoint Meridian, Earth-Moon L2 Lagrange Point",
    role: "Logistics Coordinator",
    organization: "UNOSA (United Nations Orbital Services Administration)",
    timeContext: "Cycle 1, 2089",
    populationLabel: "station personnel",
    populationCount: 340,
    flavorIntro:
      "You are Logistics Coordinator of Waypoint Meridian. Your station is the critical handoff between Earth launch providers and lunar surface operations. You don't build. You don't mine. You receive shipments and forward them. And when suppliers fail — which they will — you hold the manifest.",
    unitLabel: "$",
    unitScale: "B",
  },

  promises: [
    {
      id: "P1",
      body: "Forward 95% of Earth cargo to lunar bases on schedule",
      domain: "Throughput",
      promiseeGroup: "mission-control",
      costPerRound: 1.8,
      isOneTime: false,
      startingProgress: 50,
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 20,
      decayRate: 18,
      fundingEfficiency: 12,
      isFundable: true,
      description:
        "Six lunar bases depend on your throughput. On-time delivery is the primary metric UNOSA Mission Control tracks.",
      verificationNote:
        "Delivery timestamps logged by lunar base receivers. Objectively verifiable by downstream recipients.",
    },
    {
      id: "P2",
      body: "Maintain station habitat at full operational capacity",
      domain: "Operations",
      promiseeGroup: "crew",
      costPerRound: 2.4,
      isOneTime: false,
      startingProgress: 65,
      target: 100,
      degradeThreshold: 55,
      violateThreshold: 25,
      decayRate: 20,
      fundingEfficiency: 10,
      isFundable: true,
      description:
        "340 station personnel require functioning habitat systems — atmospheric, thermal, and pressurization.",
      verificationNote: "Monitored by station sensors. Verifiable.",
    },
    {
      id: "P3",
      body: "Keep fuel reserves above emergency threshold (30%)",
      domain: "Safety",
      promiseeGroup: "crew",
      costPerRound: 1.6,
      isOneTime: false,
      startingProgress: 55,
      target: 100,
      degradeThreshold: 45,
      violateThreshold: 20,
      decayRate: 15,
      fundingEfficiency: 14,
      isFundable: true,
      description:
        "Without adequate fuel, cargo cannot be forwarded to the Moon. Fuel reserves are the operational prerequisite for throughput.",
      verificationNote:
        "Fuel levels continuously monitored. Highly verifiable.",
    },
    {
      id: "P4",
      body: "Process and quality-check all incoming cargo within 48h",
      domain: "Quality",
      promiseeGroup: "both",
      costPerRound: 1.2,
      isOneTime: false,
      startingProgress: 40,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 15,
      decayRate: 12,
      fundingEfficiency: 16,
      isFundable: true,
      description:
        "All cargo must be verified before forwarding. Unchecked cargo creates liability and manifest errors.",
      verificationNote: "Processing timestamps logged. Verifiable.",
    },
    {
      id: "P5",
      body: "Deliver medical supplies to Shackleton Base priority queue",
      domain: "Critical",
      promiseeGroup: "mission-control",
      costPerRound: 0.8,
      isOneTime: false,
      startingProgress: 35,
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 25,
      decayRate: 20,
      fundingEfficiency: 18,
      isFundable: true,
      description:
        "Medical supplies for Shackleton Base are life-critical. Delays have direct health consequences.",
      verificationNote:
        "Delivery confirmation from Shackleton Base medical officer. Verifiable.",
    },
    {
      id: "P6",
      body: "Maintain crew rotation schedule (no tour extensions)",
      domain: "Welfare",
      promiseeGroup: "crew",
      costPerRound: 2.0,
      isOneTime: false,
      startingProgress: 60,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 15,
      decayRate: 10,
      fundingEfficiency: 12,
      isFundable: true,
      description:
        "Extended tours cause psychological harm and increase accident rates. Crew rotation depends on habitat functioning.",
      verificationNote:
        "Rotation records maintained by UNOSA HR. Verifiable.",
    },
    {
      id: "P7",
      body: "Report accurate manifest data to all downstream bases",
      domain: "Transparency",
      promiseeGroup: "both",
      costPerRound: 0.6,
      isOneTime: false,
      startingProgress: 55,
      target: 100,
      degradeThreshold: 45,
      violateThreshold: 20,
      decayRate: 8,
      fundingEfficiency: 20,
      isFundable: true,
      description:
        "Six lunar bases depend on accurate manifests for their own operations. Errors propagate downstream.",
      verificationNote:
        "Verified by downstream recipients. The people your manifests affect know whether they're accurate before you do.",
    },
    {
      id: "P8",
      body: "Stay within UNOSA quarterly budget allocation",
      domain: "Finance",
      promiseeGroup: "mission-control",
      costPerRound: 0,
      isOneTime: false,
      startingProgress: 60,
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 20,
      decayRate: 5,
      fundingEfficiency: 0,
      isFundable: false,
      description:
        "Budget compliance is non-negotiable for UNOSA. But supplier failures create pressure to overspend on mitigation. This is the structural trap.",
      verificationNote:
        "Computed from total spending vs. allocation. Tracked in UNOSA financial systems.",
    },
  ],

  dependencies: [
    {
      upstream: "P3",
      downstream: "P1",
      cascadeThreshold: 40,
      cascadePenaltyFactor: 0.4,
      explanation: "Need fuel to forward cargo to the Moon",
    },
    {
      upstream: "P4",
      downstream: "P1",
      cascadeThreshold: 40,
      cascadePenaltyFactor: 0.35,
      explanation: "Cannot forward unchecked cargo",
    },
    {
      upstream: "P4",
      downstream: "P7",
      cascadeThreshold: 40,
      cascadePenaltyFactor: 0.4,
      explanation: "Accurate manifests require completed quality processing",
    },
    {
      upstream: "P2",
      downstream: "P6",
      cascadeThreshold: 50,
      cascadePenaltyFactor: 0.4,
      explanation: "Hab must function for crew rotation to occur",
    },
    {
      upstream: "P1",
      downstream: "P8",
      cascadeThreshold: 40,
      cascadePenaltyFactor: 0.3,
      explanation:
        "Throughput failures trigger mitigation spending that degrades budget compliance",
    },
    {
      upstream: "P7",
      downstream: "P8",
      cascadeThreshold: 45,
      cascadePenaltyFactor: 0.3,
      explanation:
        "Inaccurate manifests trigger audit costs that degrade budget compliance",
    },
  ],

  structuralConflicts: [
    {
      triggerPromiseId: "P5",
      affectedPromiseId: "P1",
      fundingThreshold: 0.8,
      penaltyPerUnit: 5,
      explanation:
        "Structural conflict detected. Prioritizing medical supply delivery at $[X]B/cycle diverts cargo processing capacity from the general throughput queue, degrading on-time delivery for all other lunar bases. Life-critical cargo crowds out routine cargo. This trade-off is structural — your mandate requires both.",
      realWorldParallel:
        "In Promise Theory, some promises are structurally incompatible. A promise to prioritize one beneficiary's needs is a latent conflict with promises to other beneficiaries. The conflict is visible in the graph before it fires.",
    },
  ],

  budget: {
    startingCapital: 12.0,
    allocationPerRound: 4.0,
    totalAvailableNoRevenue: 36.0,
    totalCostFullFunding: 58.0,
    carryOver: true,
  },

  revenueTriggers: [
    {
      sourcePromiseId: "P1",
      progressThreshold: 60,
      revenuePerRound: 1.0,
      label: "Lunar forwarding fees",
    },
  ],

  computedPromises: [
    {
      promiseId: "P8",
      formula: {
        inputs: [
          { promiseId: "P1", weight: 0.4 },
          { promiseId: "P7", weight: 0.3 },
          { promiseId: "P4", weight: 0.3 },
        ],
        bonuses: [],
      },
    },
  ],

  accountability: {
    overallLabel: "Station Performance",
    overallBlend: { groupAWeight: 0.5, groupBWeight: 0.5 },
    groupA: {
      id: "crew",
      label: "Station Crew Confidence",
      gameOverLabel:
        "CREW WALKOUT — STATION OPERATIONS SUSPENDED PENDING SAFETY REVIEW",
      weights: { P2: 3.0, P3: 2.5, P6: 3.0, P5: 1.5, P7: 0.5 },
    },
    groupB: {
      id: "mission-control",
      label: "UNOSA Mission Control Satisfaction",
      gameOverLabel: "UNOSA REASSIGNMENT — COORDINATOR RECALLED TO EARTH",
      weights: { P1: 3.0, P4: 2.0, P5: 2.5, P7: 2.0, P8: 3.0 },
    },
    gameOverThreshold: 10,
  },

  events: [
    {
      id: "E1-round1",
      name: "Cycle 1 Supplier Reports",
      round: 1,
      budgetImpact: 0,
      promiseEffects: [],
      flavorText: "Incoming supply manifests for Cycle 1.",
      upstreamSupplierEvents: [
        {
          supplierId: "ares-launch",
          supplierName: "Ares Launch Corp",
          promiseToPlayer: "Full manifest delivery",
          outcome: "delivered",
          impactOnPromises: [
            { promiseId: "P1", progressDelta: 10 },
            { promiseId: "P4", progressDelta: 8 },
          ],
          flavorText:
            "Manifest AL-7742 delivered on schedule. 340 tonnes general cargo. All containers intact.",
          playerCanMitigate: false,
        },
        {
          supplierId: "roscosmos",
          supplierName: "Roscosmos Lunar Division",
          promiseToPlayer: "Medical supplies for Shackleton Base",
          outcome: "delayed",
          impactOnPromises: [
            { promiseId: "P5", progressDelta: -15 },
            { promiseId: "P1", progressDelta: -8 },
          ],
          flavorText:
            "Proton-M launch scrubbed due to fueling anomaly. Reschedule: +2 cycles. Medical supplies for Shackleton Base affected.",
          playerCanMitigate: true,
          mitigationCost: 0.5,
        },
      ],
    },
    {
      id: "E1-round2",
      name: "Cycle 2 Supplier Reports",
      round: 2,
      budgetImpact: 0,
      promiseEffects: [],
      flavorText: "Incoming supply manifests for Cycle 2.",
      upstreamSupplierEvents: [
        {
          supplierId: "spacex",
          supplierName: "SpaceX Lunar Freight",
          promiseToPlayer: "Full manifest delivery",
          outcome: "partial",
          impactOnPromises: [
            { promiseId: "P1", progressDelta: -12 },
            { promiseId: "P4", progressDelta: -10 },
          ],
          flavorText:
            "Falcon Heavy delivered 60% of manifest. 4 of 10 containers jettisoned during orbital correction burn. Insurance claim filed.",
          playerCanMitigate: true,
          mitigationCost: 0.6,
        },
        {
          supplierId: "jaxa",
          supplierName: "JAXA Supply Line",
          promiseToPlayer: "Fuel resupply",
          outcome: "delivered",
          impactOnPromises: [{ promiseId: "P3", progressDelta: 12 }],
          flavorText:
            "HTV-X cargo vessel docked successfully. Fuel resupply included.",
          playerCanMitigate: false,
        },
      ],
    },
    {
      id: "E1-round3",
      name: "Cycle 3 Supplier Reports",
      round: 3,
      budgetImpact: -0.5,
      promiseEffects: [],
      flavorText: "Critical incoming supply reports for Cycle 3.",
      upstreamSupplierEvents: [
        {
          supplierId: "ares-launch",
          supplierName: "Ares Launch Corp",
          promiseToPlayer: "Full manifest delivery",
          outcome: "cancelled",
          impactOnPromises: [
            { promiseId: "P1", progressDelta: -25 },
            { promiseId: "P4", progressDelta: -15 },
            { promiseId: "P5", progressDelta: -10 },
          ],
          flavorText:
            "Launch vehicle structural failure on pad. Total loss. Next available window: 3 cycles out. Your throughput promise is now dependent on a rocket that doesn't exist.",
          playerCanMitigate: true,
          mitigationCost: 1.2,
        },
        {
          supplierId: "esa",
          supplierName: "ESA Logistics",
          promiseToPlayer: "Partial medical resupply",
          outcome: "delivered",
          impactOnPromises: [{ promiseId: "P5", progressDelta: 8 }],
          flavorText:
            "Ariane cargo on time. Partial Shackleton medical resupply included.",
          playerCanMitigate: false,
        },
      ],
    },
    {
      id: "E1-round4",
      name: "Cycle 4 Supplier Reports",
      round: 4,
      budgetImpact: 0,
      promiseEffects: [],
      flavorText: "Incoming supply manifests for Cycle 4.",
      upstreamSupplierEvents: [
        {
          supplierId: "spacex",
          supplierName: "SpaceX Lunar Freight",
          promiseToPlayer: "Full manifest",
          outcome: "delivered",
          impactOnPromises: [
            { promiseId: "P1", progressDelta: 15 },
            { promiseId: "P4", progressDelta: 12 },
          ],
          flavorText:
            "Full manifest delivered. Throughput pipeline clear.",
          playerCanMitigate: false,
        },
        {
          supplierId: "roscosmos",
          supplierName: "Roscosmos Lunar Division",
          promiseToPlayer: "Medical supplies",
          outcome: "delayed",
          impactOnPromises: [{ promiseId: "P5", progressDelta: -20 }],
          flavorText:
            "Second consecutive delay. UNOSA files formal concern with Russian delegation. Your medical supply promise is now 2 cycles behind.",
          playerCanMitigate: true,
          mitigationCost: 0.8,
        },
      ],
    },
    {
      id: "E1-round5",
      name: "Cycle 5 — Budget Review",
      round: 5,
      budgetImpact: -0.4,
      promiseEffects: [{ promiseId: "P8", progressDelta: -15 }],
      flavorText:
        "Mid-year budget review. Mission Control notes cumulative overspend on mitigation activities. Budget compliance under scrutiny.",
      upstreamSupplierEvents: [
        {
          supplierId: "ares-sub",
          supplierName: "Ares Launch Corp (Emergency Sub)",
          promiseToPlayer: "Emergency replacement launch",
          outcome: "partial",
          impactOnPromises: [
            { promiseId: "P1", progressDelta: 5 },
            { promiseId: "P4", progressDelta: 5 },
          ],
          flavorText:
            "Emergency replacement launch via subcontractor. 40% of original manifest. Better than nothing.",
          playerCanMitigate: false,
        },
      ],
    },
    {
      id: "E1-round6",
      name: "Final Cycle Assessment",
      round: 6,
      budgetImpact: 0,
      promiseEffects: [],
      flavorText: "End of fiscal cycle. Final deliveries assessed.",
      upstreamSupplierEvents: [],
    },
  ],

  totalRounds: 6,
  roundLabel: "Cycle",

  teachingMoments: [
    {
      id: "tm-network-health",
      type: "network-health",
      title: "STATION PERFORMANCE SCORE",
      trigger: { type: "round", round: 1 },
      headline: "Half your promises depend on agents you cannot control",
      bodyTemplate:
        "Station Performance is the weighted average of all promise statuses across both accountability groups. But unlike other games — half your inputs come from external suppliers. Your score depends on their decisions as much as yours.",
      downstreamEffects: [
        "Crew Confidence weights habitat, fuel, rotation, and medical supplies.",
        "UNOSA Mission Control weights throughput, quality, medical delivery, manifests, and budget.",
      ],
      realWorldParallel:
        "In Promise Theory, promises exist in networks of autonomous agents. Your reliability is only as strong as your dependencies.",
      severity: "info",
      showOnce: true,
    },
    {
      id: "tm-upstream",
      type: "upstream-dependency",
      title: "UPSTREAM FAILURE — YOU OWN THE CONSEQUENCES",
      trigger: { type: "promise-below", promiseId: "P1", threshold: 40 },
      headline: "Throughput failing — but the cause is upstream",
      bodyTemplate:
        "Throughput at {{P1}}. Multiple upstream supplier failures have propagated into your core delivery promise.",
      downstreamEffects: [
        "When a supplier's rocket fails, your on-time delivery promise degrades — and there's nothing you can do except manage the cascade.",
        "This is how promise networks work: your promise-keeping is only as strong as your dependencies.",
        "In Supply Station, you learn to distinguish between failures you caused and failures you inherited.",
      ],
      realWorldParallel:
        "In Oregon's HB 2021, the Public Utility Commission's ability to keep emissions promises depends on utility companies keeping their planning promises. When a utility's plan is rejected, the regulator holds the downstream commitment. They didn't fail — their supplier failed.",
      severity: "critical",
      showOnce: true,
    },
    {
      id: "tm-structural-conflict",
      type: "structural-conflict",
      title: "STRUCTURAL CONFLICT — PRIORITY CARGO vs. THROUGHPUT",
      trigger: { type: "conflict-triggered", conflictIndex: 0 },
      headline: "Medical priority crowds out general throughput",
      bodyTemplate:
        "Prioritizing medical supply delivery above $0.8B/cycle diverts cargo processing capacity from the general throughput queue.",
      downstreamEffects: [
        "Life-critical cargo crowds out routine cargo.",
        "Your mandate requires on-time delivery for all lunar bases AND priority medical supply for Shackleton.",
        "These commitments are structurally incompatible at high medical spending levels.",
      ],
      realWorldParallel:
        "In Promise Theory, some promises are structurally incompatible. A promise to prioritize one beneficiary is a latent conflict with promises to others. The graph makes this visible before it fires.",
      severity: "warning",
      showOnce: false,
    },
    {
      id: "tm-verification-gap",
      type: "verification-gap",
      title: "PROMISEE-SIDE VERIFICATION — MANIFEST ACCURACY",
      trigger: { type: "round", round: 3 },
      headline: "Your manifests are verified by the people who depend on them",
      bodyTemplate:
        "Manifest accuracy for P7 is verified by downstream lunar base recipients — not by this station. The people your manifests affect know whether they're accurate before you do.",
      downstreamEffects: [
        "If quality checks (P4) are degraded, manifest errors may propagate undetected across multiple cycles.",
        "You don't discover errors until a lunar base complains — by which time you've filed more manifests with the same errors compounding.",
      ],
      realWorldParallel:
        "In Promise Theory, the party affected by a commitment is better positioned to evaluate it than the party that made it. A utility company will always report that its emissions plan is on track. The community breathing the air has a different perspective.",
      severity: "warning",
      showOnce: true,
    },
  ],

  briefing: {
    headerLine1: "UNOSA — WAYPOINT MERIDIAN LOGISTICS OPERATIONS",
    headerLine2: "Classification: LOGISTICS COORDINATOR BRIEFING",
    headerLine3: "Date: Cycle 1, 2089 — Earth-Moon L2 Station",
    appointmentText:
      "You are Logistics Coordinator of Waypoint Meridian. Six lunar bases depend on your throughput. You manage a crew of 340 and a pipeline that doesn't stop for supplier failures. You answer to: The station crew (safety threshold: habitat and rotation) and UNOSA Mission Control (performance threshold: throughput and budget). You don't control your suppliers. You own the consequences of their failures.",
    budgetExplanation:
      "Supplier failures will force you to choose between mitigation spending and budget compliance. You cannot do both. That's the mandate.",
    startButtonLabel: "BEGIN LOGISTICS CYCLE",
  },

  verdict: {
    groupAAssessment: {
      header: "UNOSA — WAYPOINT MERIDIAN PERFORMANCE REVIEW",
      recommendations: {
        retain: {
          minOverall: 50,
          minGroupScore: 60,
          label: "Coordinator Retained",
        },
        probation: {
          minOverall: 30,
          minGroupScore: 40,
          label: "Performance Review Required",
        },
        terminate: { label: "Coordinator Recalled" },
      },
    },
    groupBAssessment: {
      header: "STATION CREW CONFIDENCE VOTE",
      retainThreshold: 60,
      retainLabel: "VOTE OF CONFIDENCE",
      recallLabel: "NO CONFIDENCE MOTION",
    },
    postMortemTemplates: {
      cascadeFired:
        "Supplier failures propagated through your dependency graph. In a promise network, your downstream promises are only as strong as your upstream dependencies.",
      verificationGap:
        "Manifest accuracy was verified by your downstream recipients before you knew there were errors. Promisee-side verification: the people affected are better positioned to evaluate your promises than you are.",
      structuralConflict:
        "The conflict between medical priority and general throughput was built into your mandate. You cannot fully serve all beneficiaries simultaneously when resources are scarce and some promises are structurally incompatible.",
      survived:
        "You managed the pipeline despite supplier failures. The dual accountability structure forced you to triage between crew safety and mission control metrics — exactly as real logistics coordinators face.",
    },
  },

  cta: {
    fictionalLine: "Waypoint Meridian is fictional.",
    realLine: "Oregon HB 2021 is not.",
    bridgeText:
      "The upstream dependency mechanic you just experienced — your promises failing because someone else's promises failed — is how real policy networks work. In Oregon's HB 2021, the regulator's ability to enforce emissions targets depends on utilities keeping their planning promises. When a utility fails upstream, the cascade is not the regulator's fault. But they hold the downstream commitment. Promise Pipeline makes these dependency chains visible.",
    primaryCTA: { label: "Explore the HB 2021 Dashboard", href: "/demo/hb2021" },
    secondaryCTAs: [
      { label: "Play Again", href: "" },
      { label: "Try Mars Colony", href: "/games/mars-colony" },
    ],
  },

  theme: {
    bg: "#0f0f1a",
    bgLight: "#1a1a2e",
    bgCard: "#1e1e36",
    accent: "#e2e8f0",
    accentMuted: "#94a3b8",
    terminal: "#22d3ee",
    terminalDim: "#0891b2",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textBright: "#f8fafc",
    danger: "#ef4444",
    border: "#2d2d44",
    scanline: "rgba(226,232,240,0.02)",
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
      Throughput: "#38bdf8",
      Operations: "#a78bfa",
      Safety: "#f87171",
      Quality: "#34d399",
      Critical: "#ef4444",
      Welfare: "#fb923c",
      Transparency: "#e2e8f0",
      Finance: "#fbbf24",
    },
    primaryFont: "mono",
    narrativeFont: "sans",
    nodeShape: "rectangle",
    edgeStyle: "cable",
    transitionStyle: "signal-loss",
    hasScanlines: false,
    hasAmbientParticles: true,
    particleType: "sparks",
  },

  metadata: {
    title: "Promise Governor: Supply Station | Promise Pipeline",
    description:
      "Coordinate an orbital resupply hub. Your promises depend on suppliers you cannot control. Learn why upstream dependency matters.",
  },
};
