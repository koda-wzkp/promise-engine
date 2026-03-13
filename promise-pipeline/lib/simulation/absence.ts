import {
  NetworkPromise,
  NetworkAgent,
  NetworkConfig,
  AbsenceQuery,
  AbsenceResult,
} from "../types/network";
import { CascadeResult, WhatIfQuery } from "../types/simulation";
import { simulateCascade } from "./cascade";

/**
 * Simulate a team member's absence.
 *
 * 1. Identify all active promises where agentId is the promiser
 * 2. For each, check if deadline falls within absence window
 * 3. Run cascade simulation as if those promises degrade
 * 4. Suggest reassignments based on other agents' capacity
 */
export function simulateAbsence(
  promises: NetworkPromise[],
  agents: NetworkAgent[],
  query: AbsenceQuery,
  config: NetworkConfig
): AbsenceResult {
  const absenceStart = new Date(query.startDate).getTime();
  const absenceEnd = new Date(query.endDate).getTime();

  // Find affected promises
  const activeStatuses = ["declared", "degraded"];
  const agentPromises = promises.filter(
    (p) => (p.promiser === query.agentId || p.assignedTo === query.agentId) && activeStatuses.includes(p.status)
  );

  const affected: AbsenceResult["affectedPromises"] = [];

  for (const p of agentPromises) {
    let risk: "high" | "medium" | "low" = "low";
    let reason = "No deadline conflict";

    if (p.target) {
      const deadline = new Date(p.target).getTime();
      if (deadline >= absenceStart && deadline <= absenceEnd) {
        risk = "high";
        reason = `Deadline ${p.target} falls within absence window`;
      } else if (deadline <= absenceEnd + 7 * 24 * 60 * 60 * 1000) {
        risk = "medium";
        reason = `Deadline ${p.target} is within 7 days of return`;
      }
    } else {
      risk = "medium";
      reason = "No deadline set — progress will stall during absence";
    }

    // Bump risk for critical/high priority
    if (p.priority === "critical" && risk !== "high") risk = "high";
    if (p.priority === "high" && risk === "low") risk = "medium";

    // Check if promise has dependents (makes it more critical)
    const dependentCount = promises.filter((op) => op.depends_on.includes(p.id)).length;
    if (dependentCount > 0 && risk !== "high") {
      risk = risk === "low" ? "medium" : "high";
      reason += ` (${dependentCount} downstream promise${dependentCount > 1 ? "s" : ""} depend on this)`;
    }

    affected.push({ promiseId: p.id, body: p.body, risk, reason });
  }

  // Run cascade simulation for high-risk promises
  const basePromises = promises.map((p) => ({
    id: p.id,
    ref: p.ref,
    promiser: p.promiser,
    promisee: p.promisee,
    body: p.body,
    domain: p.domain,
    status: p.status,
    target: p.target,
    progress: p.progress,
    required: p.required,
    note: p.note ?? "",
    verification: p.verification,
    depends_on: p.depends_on,
  }));

  // Simulate the worst high-risk promise degrading
  const highRisk = affected.filter((a) => a.risk === "high");
  let cascadeEffects: CascadeResult = {
    query: { promiseId: "", newStatus: "degraded" },
    originalNetworkHealth: 0,
    newNetworkHealth: 0,
    affectedPromises: [],
    cascadeDepth: 0,
    domainsAffected: [],
    summary: "No high-risk promises affected.",
  };

  if (highRisk.length > 0) {
    // Simulate the first high-risk promise degrading as representative
    const worstQuery: WhatIfQuery = {
      promiseId: highRisk[0].promiseId,
      newStatus: "degraded",
    };
    cascadeEffects = simulateCascade(basePromises, worstQuery);
  }

  // Suggest reassignments
  const reassignmentSuggestions: AbsenceResult["reassignmentSuggestions"] = [];
  const activeAgents = agents.filter((a) => a.active && a.id !== query.agentId);
  const threshold = config.capacityThreshold ?? 8;

  for (const ap of affected.filter((a) => a.risk !== "low")) {
    const promise = promises.find((p) => p.id === ap.promiseId);
    if (!promise) continue;

    // Find agent with lowest load in same domain
    let bestAgent: NetworkAgent | null = null;
    let bestLoad = Infinity;

    for (const agent of activeAgents) {
      const agentActive = promises.filter(
        (p) => (p.promiser === agent.id || p.assignedTo === agent.id) && activeStatuses.includes(p.status)
      );
      const load = agentActive.length;

      // Prefer agents in the same domain
      const sameDomain = agentActive.some((p) => p.domain === promise.domain);
      const adjustedLoad = sameDomain ? load - 0.5 : load; // slight preference

      if (adjustedLoad < bestLoad) {
        bestLoad = adjustedLoad;
        bestAgent = agent;
      }
    }

    if (bestAgent) {
      const projectedLoad = Math.round(((bestLoad + 1) / threshold) * 100);
      reassignmentSuggestions.push({
        promiseId: ap.promiseId,
        suggestedAgent: bestAgent.id,
        reason: `${bestAgent.name} has lowest load (${Math.round(bestLoad)} active promises)`,
        projectedLoad,
      });
    }
  }

  // Summary
  const agentName = agents.find((a) => a.id === query.agentId)?.name ?? query.agentId;
  const highCount = affected.filter((a) => a.risk === "high").length;
  const medCount = affected.filter((a) => a.risk === "medium").length;

  let summary = `If ${agentName} is absent ${query.startDate} to ${query.endDate}: `;
  summary += `${affected.length} active promise${affected.length !== 1 ? "s" : ""} affected`;
  if (highCount > 0) summary += ` (${highCount} high risk)`;
  if (medCount > 0) summary += ` (${medCount} medium risk)`;
  summary += ".";

  if (reassignmentSuggestions.length > 0) {
    summary += ` ${reassignmentSuggestions.length} reassignment${reassignmentSuggestions.length !== 1 ? "s" : ""} suggested.`;
  }

  return {
    affectedPromises: affected,
    cascadeEffects,
    reassignmentSuggestions,
    summary,
  };
}
