import { PromiseNetwork, NetworkAgentType } from "../types/network";
import { createCivicConfig } from "../types/network-presets";
import { hb2021DomainColors } from "../utils/colors";
import {
  HB2021_AGENTS,
  HB2021_PROMISES,
  HB2021_DOMAINS,
  HB2021_INSIGHTS,
  HB2021_TRAJECTORIES,
  HB2021_DASHBOARD,
} from "./hb2021";

/**
 * Convert the HB 2021 raw data into a PromiseNetwork.
 *
 * This is a one-time conversion layer. The raw data stays as-is
 * in hb2021.ts for reference. This file produces the network
 * object that usePromiseNetwork loads for civic scope.
 */
export function createHB2021Network(): PromiseNetwork {
  return {
    id: "net-hb2021",
    name: "Oregon HB 2021 — Clean Energy Targets",
    scope: "civic",
    description:
      "20 promises across 7 domains from Oregon's 100% clean electricity law. 11 agents including utilities, regulators, and communities.",

    agents: HB2021_AGENTS.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type as NetworkAgentType,
      short: a.short,
      active: true,
    })),

    promises: HB2021_PROMISES.map((p) => ({
      id: p.id,
      body: p.body,
      promiser: p.promiser,
      promisee: p.promisee,
      domain: p.domain,
      status: p.status,
      ref: p.ref,
      target: p.target,
      progress: p.progress,
      required: p.required,
      note: p.note,
      verification: p.verification,
      depends_on: p.depends_on,
      networkId: "net-hb2021",
      createdAt: "2021-07-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          from: "declared" as const,
          to: p.status,
          at: "2021-07-01T00:00:00Z",
          reason: "Initial status assessment",
        },
      ],
    })),

    domains: [
      "Emissions",
      "Planning",
      "Verification",
      "Equity",
      "Affordability",
      "Tribal",
      "Workforce",
    ].map((name) => ({
      id: `dom-${name.toLowerCase()}`,
      name,
      color: hb2021DomainColors[name] ?? "#6b7280",
    })),

    config: createCivicConfig(),

    createdAt: "2021-07-01T00:00:00Z",
    updatedAt: new Date().toISOString(),

    parentNetworks: [],
    childNetworks: [],

    _schemaVersion: 1,
  };
}

// Re-export HB 2021-specific data that doesn't map to generic PromiseNetwork
export {
  HB2021_INSIGHTS as insights,
  HB2021_TRAJECTORIES as trajectories,
  HB2021_DASHBOARD as dashboard,
  HB2021_AGENTS as rawAgents,
  HB2021_PROMISES as rawPromises,
  HB2021_DOMAINS as rawDomains,
} from "./hb2021";
