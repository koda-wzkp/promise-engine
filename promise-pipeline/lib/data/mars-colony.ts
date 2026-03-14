import { MarsPromise, MarsEvent } from "../types/mars-game";

// ─── INITIAL PROMISES ───
export function createInitialPromises(): MarsPromise[] {
  return [
    {
      id: "P1",
      body: "Maintain life support at 99.9% uptime",
      domain: "Survival",
      promisee: "colonists",
      costPerQuarter: 2.1,
      isOneTime: false,
      progress: 65,
      status: "declared",
      target: 100,
      degradeThreshold: 60,
      violateThreshold: 30,
      decayRate: 20,
      dependsOn: ["P3"],
      cascadeThreshold: 50,
      fundingEfficiency: 12,
      oneTimeFunded: false,
      description:
        "The colony's life support systems — oxygen generation, atmospheric regulation, thermal management — must maintain near-perfect uptime. A single extended failure is a colony extinction event.",
      verificationNote:
        "Monitored by Helios Corp onboard systems. Uptime logged and transmitted to Earth quarterly. Self-reported.",
    },
    {
      id: "P2",
      body: "Expand hab capacity by 40%",
      domain: "Housing",
      promisee: "colonists",
      costPerQuarter: 3.4,
      isOneTime: true,
      progress: 0,
      status: "declared",
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 15,
      decayRate: 5,
      dependsOn: ["P1"],
      cascadeThreshold: 60,
      fundingEfficiency: 10,
      oneTimeFunded: false,
      description:
        "Current hab modules are operating at 94% occupancy. The colony cannot safely grow without expanded living quarters. Construction requires stable life support and reliable materials supply from Earth.",
      verificationNote:
        "Verified by physical inspection — hab module count and occupancy capacity are measurable. Third-party audit possible during resupply missions.",
    },
    {
      id: "P3",
      body: "Establish water reclamation to 90% efficiency",
      domain: "Resources",
      promisee: "both",
      costPerQuarter: 1.8,
      isOneTime: false,
      progress: 40,
      status: "declared",
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 25,
      decayRate: 15,
      dependsOn: [],
      cascadeThreshold: 0,
      fundingEfficiency: 14,
      oneTimeFunded: false,
      description:
        "Mars has no natural liquid water accessible at the surface. The water reclamation system processes atmosphere, urine, and ice sublimation into usable water. It's the foundation of everything else.",
      verificationNote:
        "Efficiency measurable via input/output sensors. Currently self-reported. Verification auditable during resupply missions.",
    },
    {
      id: "P4",
      body: "Launch mining operations ahead of schedule",
      domain: "Revenue",
      promisee: "shareholders",
      costPerQuarter: 2.6,
      isOneTime: false,
      progress: 15,
      status: "declared",
      target: 100,
      degradeThreshold: 45,
      violateThreshold: 20,
      decayRate: 10,
      dependsOn: ["P3"],
      cascadeThreshold: 50,
      fundingEfficiency: 11,
      oneTimeFunded: false,
      description:
        "Helios Corp's primary revenue justification for the colony. Rare earth extraction from Martian regolith — neodymium, europium, dysprosium — for Earth's clean energy transition. Mining requires water for equipment cooling.",
      verificationNote:
        "Output measured in tonnage and transmitted via P8 (Earth comms). Verifiable but depends on comms uptime.",
    },
    {
      id: "P5",
      body: "Deliver 12% return to shareholders by Q4",
      domain: "Finance",
      promisee: "shareholders",
      costPerQuarter: 0,
      isOneTime: false,
      progress: 0,
      status: "declared",
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 20,
      decayRate: 8,
      dependsOn: ["P4", "P8"],
      cascadeThreshold: 60,
      fundingEfficiency: 0,
      oneTimeFunded: false,
      description:
        "The promise that justifies the entire enterprise to Earth investors. Shareholder return is a function of mining operations (P4) and the transparency of reporting those operations (P8). This promise cannot be directly funded.",
      verificationNote:
        "Computed from P4 (mining output, 70% weight) and P8 (comms transparency, 30% weight). Financial reporting transmitted quarterly.",
    },
    {
      id: "P6",
      body: "Build a colony school by end of term",
      domain: "Community",
      promisee: "colonists",
      costPerQuarter: 1.6,
      isOneTime: true,
      progress: 0,
      status: "declared",
      target: 100,
      degradeThreshold: 35,
      violateThreshold: 10,
      decayRate: 3,
      dependsOn: ["P1"],
      cascadeThreshold: 60,
      fundingEfficiency: 16,
      oneTimeFunded: false,
      description:
        "312 children live in Ares Station. The colony charter guarantees education. Without a school, families cannot consider Mars a permanent home — and without permanent settlers, Helios Corp loses its operational workforce.",
      verificationNote:
        "Physical structure is verifiable. Curriculum quality is not — no external education standards exist on Mars.",
    },
    {
      id: "P7",
      body: "Reduce radiation exposure 50% via shielding",
      domain: "Safety",
      promisee: "colonists",
      costPerQuarter: 2.2,
      isOneTime: false,
      progress: 25,
      status: "unverifiable",
      target: 100,
      degradeThreshold: 40,
      violateThreshold: 20,
      decayRate: 8,
      dependsOn: [],
      cascadeThreshold: 0,
      fundingEfficiency: 12,
      oneTimeFunded: false,
      description:
        "Mars has no magnetosphere. Cosmic radiation and solar particle events are the leading long-term health risk for colonists. Helios Corp contracted a shielding system, but no independent measurement infrastructure exists.",
      verificationNote:
        "UNVERIFIABLE. The sensors that measure shielding effectiveness are owned and operated by Helios Corp. No independent measurement infrastructure exists on Mars. Progress may occur; verification cannot.",
    },
    {
      id: "P8",
      body: "Establish Earth comms uptime at 95%",
      domain: "Transparency",
      promisee: "both",
      costPerQuarter: 0.9,
      isOneTime: false,
      progress: 50,
      status: "declared",
      target: 100,
      degradeThreshold: 50,
      violateThreshold: 25,
      decayRate: 12,
      dependsOn: [],
      cascadeThreshold: 0,
      fundingEfficiency: 22,
      oneTimeFunded: false,
      description:
        "26-minute signal delay each way. Earth comms are the only lifeline for emergency consultation, financial reporting, and colonist contact with families. 95% uptime means reliable transmission windows.",
      verificationNote:
        "Uptime measured by both Earth-side ground stations and colony systems. Most objectively verifiable promise in the portfolio.",
    },
  ];
}

// ─── EVENT DECK ───
export const marsEvents: MarsEvent[] = [
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
    quarter: 1,
  },
  {
    id: "E2",
    name: "Supply Rocket Delayed",
    flavorText:
      "Earth launch window missed due to booster anomaly. Resupply arrival pushed to next transfer orbit. 8-week delay on construction materials.",
    budgetImpact: -0.5,
    promiseEffects: [{ promiseId: "P2", progressDelta: -8 }],
    quarter: 1,
  },
  {
    id: "E3",
    name: "Geological Survey Breakthrough",
    flavorText:
      "Subsurface ice deposit confirmed at grid reference Theta-7. Water reclamation capacity projection revised upward. Engineering team recommends immediate drill site.",
    budgetImpact: 0.4,
    promiseEffects: [{ promiseId: "P3", progressDelta: 20 }],
    quarter: 2,
  },
  {
    id: "E4",
    name: "Helios Corp Audit",
    flavorText:
      "Earth board demands Q2 performance review. Allocate senior staff to reporting obligations. Communications bandwidth prioritized for data transmission.",
    budgetImpact: -0.3,
    promiseEffects: [{ promiseId: "P8", progressDelta: 10 }],
    quarter: 2,
  },
  {
    id: "E5",
    name: "Colonist Petition",
    flavorText:
      "312 colonists sign formal petition demanding school construction timeline. Families coalition cites Section 6 of colony charter. Morale impact noted.",
    budgetImpact: 0,
    promiseEffects: [{ promiseId: "P6", progressDelta: -5 }],
    quarter: 3,
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
    quarter: 3,
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
    quarter: 4,
  },
];

// ─── BUDGET CONFIG ───
export const budgetConfig = {
  startingCapital: 12.0,
  quarterlyAllocation: 5.0,
  miningRevenueBonus: 1.5,
  totalAvailableNoMining: 32.0,
  totalCostFullFunding: 60.0,
};

// ─── DOMAIN COLOR MAP ───
export const marsDomainBorderColors: Record<string, string> = {
  Survival: "#ef4444",
  Housing: "#f59e0b",
  Resources: "#3b82f6",
  Revenue: "#10b981",
  Finance: "#06b6d4",
  Community: "#8b5cf6",
  Safety: "#f97316",
  Transparency: "#64748b",
};
