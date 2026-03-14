"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  PromiseNetwork,
  NetworkPromise,
  NetworkAgent,
  NetworkDomain,
  NetworkConfig,
  NetworkScope,
  PromiseCreateInput,
  StatusChangeContext,
  ActivityEntry,
  AgentStats,
  PromiseNetworkExport,
  CapacityQuery,
  CapacityResult,
  AbsenceQuery,
  AbsenceResult,
  StatusChange,
} from "../types/network";
import { PromiseStatus } from "../types/promise";
import { NetworkHealthScore, WhatIfQuery, CascadeResult } from "../types/simulation";
import { getConfigForScope, getDomainsForScope } from "../types/network-presets";
import { createStorageEngine, StorageEngine } from "../storage/local";
import { simulateCascade } from "../simulation/cascade";
import { calculateNetworkHealth } from "../simulation/scoring";
import { simulateCapacity } from "../simulation/capacity";
import { simulateAbsence } from "../simulation/absence";

// ─── ID GENERATION ───

function nanoid(len: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function generateNetworkId(): string {
  return `net-${nanoid(10)}`;
}

function generatePromiseId(scope: NetworkScope): string {
  const prefix = scope === "personal" ? "pp" : scope === "team" ? "tp" : scope === "civic" ? "cp" : "np";
  return `${prefix}-${nanoid(8)}`;
}

function generateAgentId(): string {
  return `ag-${nanoid(8)}`;
}

function generateActivityId(): string {
  return `act-${nanoid(8)}`;
}

// ─── SCOPED ID UTILITIES ───

export function createScopedId(networkId: string, promiseId: string): string {
  return `${networkId}:${promiseId}`;
}

export function parseScopedId(scopedId: string): { networkId: string; promiseId: string } | null {
  const parts = scopedId.split(":");
  if (parts.length === 2) {
    return { networkId: parts[0], promiseId: parts[1] };
  }
  return null;
}

export function isScopedId(id: string): boolean {
  return id.includes(":");
}

// ─── CREATE EMPTY NETWORK ───

export function createEmptyNetwork(
  name: string,
  scope: NetworkScope,
  agents?: Omit<NetworkAgent, "id">[],
  domains?: NetworkDomain[],
): PromiseNetwork {
  const now = new Date().toISOString();
  const networkId = generateNetworkId();

  const defaultAgents: NetworkAgent[] = scope === "personal"
    ? [{ id: generateAgentId(), name: "Me", type: "individual", short: "Me", active: true }]
    : (agents ?? []).map((a) => ({ ...a, id: generateAgentId() }));

  return {
    id: networkId,
    name,
    scope,
    agents: defaultAgents,
    promises: [],
    domains: domains ?? getDomainsForScope(scope),
    config: getConfigForScope(scope),
    createdAt: now,
    updatedAt: now,
    createdBy: defaultAgents[0]?.id,
    parentNetworks: [],
    childNetworks: [],
    _schemaVersion: 1,
  };
}

// ─── SIMULATION STATE ───

export interface SimulationState {
  active: boolean;
  query?: WhatIfQuery;
  result?: CascadeResult;
}

// ─── HOOK RETURN TYPE ───

export interface UsePromiseNetworkReturn {
  network: PromiseNetwork;
  isLoaded: boolean;

  // Promise CRUD
  createPromise: (draft: PromiseCreateInput) => NetworkPromise;
  updatePromise: (id: string, updates: Partial<NetworkPromise>) => void;
  updateStatus: (id: string, newStatus: PromiseStatus, context?: StatusChangeContext) => void;
  renegotiatePromise: (id: string, newBody: string, newTarget?: string) => void;
  deletePromise: (id: string) => void;

  // Agent CRUD
  addAgent: (agent: Omit<NetworkAgent, "id">) => NetworkAgent;
  updateAgent: (id: string, updates: Partial<NetworkAgent>) => void;
  deactivateAgent: (id: string) => void;

  // Domain CRUD
  addDomain: (domain: Omit<NetworkDomain, "id">) => NetworkDomain;
  updateDomain: (id: string, updates: Partial<NetworkDomain>) => void;
  removeDomain: (id: string) => void;

  // Simulation
  runCascadeSimulation: (query: WhatIfQuery) => CascadeResult;
  runCapacitySimulation: (query: CapacityQuery) => CapacityResult;
  runAbsenceSimulation: (query: AbsenceQuery) => AbsenceResult;
  simulationState: SimulationState;
  clearSimulation: () => void;

  // Computed
  networkHealth: NetworkHealthScore;
  agentStats: Map<string, AgentStats>;
  domainHealth: Map<string, number>;
  bottlenecks: string[];

  // Filtering
  getPromisesByStatus: (status: PromiseStatus | "all") => NetworkPromise[];
  getPromisesByDomain: (domainId: string | "all") => NetworkPromise[];
  getPromisesByAgent: (agentId: string) => NetworkPromise[];

  // Configuration
  updateConfig: (updates: Partial<NetworkConfig>) => void;

  // Data portability
  exportNetwork: () => PromiseNetworkExport | null;
  importNetwork: (data: PromiseNetworkExport) => { success: boolean; error?: string };

  // Activity
  activity: ActivityEntry[];
}

// ─── THE HOOK ───

export function usePromiseNetwork(
  networkId: string,
  scope: NetworkScope,
  initialNetwork?: PromiseNetwork,
): UsePromiseNetworkReturn {
  const storageRef = useRef<StorageEngine | null>(null);
  const [network, setNetwork] = useState<PromiseNetwork>(() => {
    if (initialNetwork) return initialNetwork;
    return createEmptyNetwork("Loading...", scope);
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState>({ active: false });

  // Initialize storage and load data
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storage = createStorageEngine();
    storageRef.current = storage;

    // If we have an initial network (e.g. civic demo data), use it directly
    if (initialNetwork) {
      setNetwork(initialNetwork);
      setIsLoaded(true);
      return;
    }

    const existing = storage.getNetwork(networkId);
    if (existing) {
      setNetwork(existing);
      setActivity(storage.getActivity(networkId));
    } else {
      // Create a new network with default name based on scope
      const defaultName = scope === "personal" ? "My Promises" : scope === "team" ? "My Team" : "Network";
      const newNetwork = createEmptyNetwork(defaultName, scope);
      // Override the generated ID with the requested one
      newNetwork.id = networkId;
      storage.saveNetwork(newNetwork);
      setNetwork(newNetwork);
    }

    // Track as recent
    const settings = storage.getAppSettings();
    settings.activeNetworkId = networkId;
    if (!settings.recentNetworks.includes(networkId)) {
      settings.recentNetworks.unshift(networkId);
      if (settings.recentNetworks.length > 10) settings.recentNetworks.length = 10;
    }
    storage.saveAppSettings(settings);

    setIsLoaded(true);
  }, [networkId, scope, initialNetwork]);

  // Persist helper
  const persist = useCallback((updated: PromiseNetwork) => {
    setNetwork(updated);
    if (storageRef.current && !initialNetwork) {
      storageRef.current.saveNetwork(updated);
      // Track data change for backup reminder
      try { localStorage.setItem("pp-last-data-change", new Date().toISOString()); } catch { /* ignore */ }
    }
  }, [initialNetwork]);

  // Log activity
  const logActivity = useCallback((action: ActivityEntry["action"], details?: string, promiseId?: string, agentId?: string) => {
    const entry: ActivityEntry = {
      id: generateActivityId(),
      networkId,
      action,
      timestamp: new Date().toISOString(),
      agentId,
      promiseId,
      details,
    };
    setActivity((prev) => [entry, ...prev]);
    if (storageRef.current && !initialNetwork) {
      storageRef.current.appendActivity(networkId, entry);
    }
  }, [networkId, initialNetwork]);

  // ─── PROMISE CRUD ───

  const createPromise = useCallback((draft: PromiseCreateInput): NetworkPromise => {
    const now = new Date().toISOString();
    const id = generatePromiseId(scope);
    const scopedId = createScopedId(networkId, id);

    const promise: NetworkPromise = {
      id: scopedId,
      body: draft.body,
      promiser: draft.promiser,
      promisee: draft.promisee,
      domain: draft.domain,
      status: "declared",
      target: draft.target,
      verification: draft.verification
        ? { method: network.config.defaultVerificationMethod, ...draft.verification }
        : { method: network.config.defaultVerificationMethod },
      depends_on: draft.depends_on ?? [],
      createdAt: now,
      updatedAt: now,
      statusHistory: [],
      networkId,
      priority: draft.priority,
      tags: draft.tags,
      estimatedHours: draft.estimatedHours,
      recurring: draft.recurring,
      quality_evaluation: draft.quality_evaluation,
    };

    persist({
      ...network,
      promises: [promise, ...network.promises],
      updatedAt: now,
    });

    logActivity("created", `Created: "${draft.body.slice(0, 60)}"`, scopedId, draft.promiser);
    return promise;
  }, [network, networkId, scope, persist, logActivity]);

  const updatePromise = useCallback((id: string, updates: Partial<NetworkPromise>) => {
    const now = new Date().toISOString();
    persist({
      ...network,
      promises: network.promises.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: now } : p
      ),
      updatedAt: now,
    });
  }, [network, persist]);

  const updateStatus = useCallback((id: string, newStatus: PromiseStatus, context?: StatusChangeContext) => {
    const now = new Date().toISOString();
    const promise = network.promises.find((p) => p.id === id);
    if (!promise) return;

    const statusChange: StatusChange = {
      from: promise.status,
      to: newStatus,
      at: now,
      reason: context?.reason,
    };

    const isComplete = newStatus === "verified" || newStatus === "violated";

    persist({
      ...network,
      promises: network.promises.map((p) =>
        p.id === id
          ? {
              ...p,
              status: newStatus,
              updatedAt: now,
              completedAt: isComplete ? now : p.completedAt,
              statusHistory: [...p.statusHistory, statusChange],
              reflection: context?.reflection ?? p.reflection,
            }
          : p
      ),
      updatedAt: now,
    });

    logActivity("status_changed", `${promise.status} → ${newStatus}: "${promise.body.slice(0, 40)}"`, id);
  }, [network, persist, logActivity]);

  const renegotiatePromise = useCallback((id: string, newBody: string, newTarget?: string) => {
    const now = new Date().toISOString();
    const promise = network.promises.find((p) => p.id === id);
    if (!promise) return;

    persist({
      ...network,
      promises: network.promises.map((p) =>
        p.id === id
          ? {
              ...p,
              body: newBody,
              target: newTarget ?? p.target,
              renegotiatedFrom: p.renegotiatedFrom ?? p.body,
              renegotiatedAt: now,
              updatedAt: now,
            }
          : p
      ),
      updatedAt: now,
    });

    logActivity("renegotiated", `Renegotiated: "${newBody.slice(0, 60)}"`, id);
  }, [network, persist, logActivity]);

  const deletePromise = useCallback((id: string) => {
    const promise = network.promises.find((p) => p.id === id);
    const now = new Date().toISOString();

    persist({
      ...network,
      promises: network.promises.filter((p) => p.id !== id),
      updatedAt: now,
    });

    if (promise) {
      logActivity("deleted", `Deleted: "${promise.body.slice(0, 60)}"`, id);
    }
  }, [network, persist, logActivity]);

  // ─── AGENT CRUD ───

  const addAgent = useCallback((agent: Omit<NetworkAgent, "id">): NetworkAgent => {
    const newAgent: NetworkAgent = { ...agent, id: generateAgentId() };
    const now = new Date().toISOString();

    persist({
      ...network,
      agents: [...network.agents, newAgent],
      updatedAt: now,
    });

    logActivity("agent_added", `Added agent: ${newAgent.name}`, undefined, newAgent.id);
    return newAgent;
  }, [network, persist, logActivity]);

  const updateAgent = useCallback((id: string, updates: Partial<NetworkAgent>) => {
    const now = new Date().toISOString();
    persist({
      ...network,
      agents: network.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      updatedAt: now,
    });
  }, [network, persist]);

  const deactivateAgent = useCallback((id: string) => {
    const now = new Date().toISOString();
    persist({
      ...network,
      agents: network.agents.map((a) => (a.id === id ? { ...a, active: false } : a)),
      updatedAt: now,
    });

    logActivity("agent_deactivated", undefined, undefined, id);
  }, [network, persist, logActivity]);

  // ─── DOMAIN CRUD ───

  const addDomain = useCallback((domain: Omit<NetworkDomain, "id">): NetworkDomain => {
    const newDomain: NetworkDomain = { ...domain, id: `dom-${nanoid(6)}` };
    const now = new Date().toISOString();

    persist({
      ...network,
      domains: [...network.domains, newDomain],
      updatedAt: now,
    });

    logActivity("domain_added", `Added domain: ${newDomain.name}`);
    return newDomain;
  }, [network, persist, logActivity]);

  const updateDomain = useCallback((id: string, updates: Partial<NetworkDomain>) => {
    const now = new Date().toISOString();
    persist({
      ...network,
      domains: network.domains.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      updatedAt: now,
    });
  }, [network, persist]);

  const removeDomain = useCallback((id: string) => {
    const now = new Date().toISOString();
    persist({
      ...network,
      domains: network.domains.filter((d) => d.id !== id),
      updatedAt: now,
    });

    logActivity("domain_removed", `Removed domain: ${id}`);
  }, [network, persist, logActivity]);

  // ─── SIMULATION ───

  const runCascadeSimulation = useCallback((query: WhatIfQuery): CascadeResult => {
    // Convert NetworkPromise[] to base Promise[] for the cascade engine
    const basePromises = network.promises.map((p) => ({
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

    const result = simulateCascade(basePromises, query);
    setSimulationState({ active: true, query, result });
    return result;
  }, [network.promises]);

  const runCapacitySimulation = useCallback((query: CapacityQuery): CapacityResult => {
    return simulateCapacity(network.promises, network.agents, query, network.config);
  }, [network.promises, network.agents, network.config]);

  const runAbsenceSimulation = useCallback((query: AbsenceQuery): AbsenceResult => {
    return simulateAbsence(network.promises, network.agents, query, network.config);
  }, [network.promises, network.agents, network.config]);

  const clearSimulation = useCallback(() => {
    setSimulationState({ active: false });
  }, []);

  // ─── COMPUTED ───

  const networkHealth = useMemo((): NetworkHealthScore => {
    if (network.promises.length === 0) {
      return { overall: 100, byDomain: {}, byAgent: {}, bottlenecks: [], atRisk: [] };
    }
    const basePromises = network.promises.map((p) => ({
      id: p.id,
      promiser: p.promiser,
      promisee: p.promisee,
      body: p.body,
      domain: p.domain,
      status: p.status,
      note: p.note ?? "",
      verification: p.verification,
      depends_on: p.depends_on,
    }));
    return calculateNetworkHealth(basePromises);
  }, [network.promises]);

  const agentStats = useMemo((): Map<string, AgentStats> => {
    const stats = new Map<string, AgentStats>();
    const threshold = network.config.capacityThreshold ?? 8;

    for (const agent of network.agents) {
      const mine = network.promises.filter((p) => p.promiser === agent.id || p.assignedTo === agent.id);
      const active = mine.filter((p) => p.status === "declared" || p.status === "degraded");
      const completed = mine.filter((p) => p.status === "verified" || p.status === "violated");
      const kept = completed.filter((p) => p.status === "verified");

      const byDomain: Record<string, number> = {};
      for (const p of active) {
        byDomain[p.domain] = (byDomain[p.domain] ?? 0) + 1;
      }

      // Calculate streak
      let streak = 0;
      const sorted = [...completed].sort((a, b) =>
        (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt)
      );
      for (const p of sorted) {
        if (p.status === "verified") streak++;
        else break;
      }

      // Load score
      const base = (active.length / threshold) * 100;
      const loadScore = Math.min(100, Math.round(base));

      // Trend (simple: compare recent half vs older half)
      const mid = Math.floor(completed.length / 2);
      let trend: "improving" | "stable" | "declining" = "stable";
      if (completed.length >= 4) {
        const recentKeptRate = completed.slice(0, mid).filter((p) => p.status === "verified").length / mid;
        const olderKeptRate = completed.slice(mid).filter((p) => p.status === "verified").length / (completed.length - mid);
        if (recentKeptRate > olderKeptRate + 0.1) trend = "improving";
        else if (recentKeptRate < olderKeptRate - 0.1) trend = "declining";
      }

      stats.set(agent.id, {
        agentId: agent.id,
        activePromiseCount: active.length,
        totalPromiseCount: mine.length,
        keptRate: completed.length > 0 ? kept.length / completed.length : 0,
        loadScore,
        trend,
        overloaded: active.length >= threshold,
        promisesByDomain: byDomain,
        averageDaysToComplete: 0, // TODO: compute from completedAt - createdAt
        currentStreak: streak,
      });
    }

    return stats;
  }, [network.promises, network.agents, network.config.capacityThreshold]);

  const domainHealth = useMemo((): Map<string, number> => {
    const health = new Map<string, number>();
    const weights = network.config.statusWeights;

    for (const domain of network.domains) {
      const domainPromises = network.promises.filter((p) => p.domain === domain.id);
      if (domainPromises.length === 0) {
        health.set(domain.id, 100);
        continue;
      }
      const score = Math.round(
        domainPromises.reduce((sum, p) => sum + (weights[p.status] ?? 50), 0) / domainPromises.length
      );
      health.set(domain.id, score);
    }

    return health;
  }, [network.promises, network.domains, network.config.statusWeights]);

  const bottlenecks = useMemo((): string[] => {
    const depCounts = new Map<string, number>();
    for (const p of network.promises) {
      depCounts.set(p.id, 0);
    }
    for (const p of network.promises) {
      for (const depId of p.depends_on) {
        if (depCounts.has(depId)) {
          depCounts.set(depId, (depCounts.get(depId) ?? 0) + 1);
        }
      }
    }
    return Array.from(depCounts.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
  }, [network.promises]);

  // ─── FILTERING ───

  const getPromisesByStatus = useCallback((status: PromiseStatus | "all"): NetworkPromise[] => {
    if (status === "all") return network.promises;
    return network.promises.filter((p) => p.status === status);
  }, [network.promises]);

  const getPromisesByDomain = useCallback((domainId: string | "all"): NetworkPromise[] => {
    if (domainId === "all") return network.promises;
    return network.promises.filter((p) => p.domain === domainId);
  }, [network.promises]);

  const getPromisesByAgent = useCallback((agentId: string): NetworkPromise[] => {
    return network.promises.filter((p) => p.promiser === agentId || p.assignedTo === agentId);
  }, [network.promises]);

  // ─── CONFIGURATION ───

  const updateConfig = useCallback((updates: Partial<NetworkConfig>) => {
    const now = new Date().toISOString();
    persist({
      ...network,
      config: { ...network.config, ...updates },
      updatedAt: now,
    });
    logActivity("config_updated", "Network configuration updated");
  }, [network, persist, logActivity]);

  // ─── DATA PORTABILITY ───

  const exportNetworkFn = useCallback((): PromiseNetworkExport | null => {
    if (!storageRef.current) {
      // Fallback for in-memory (civic) networks
      return {
        format: "promise-network-export",
        version: 1,
        exportedAt: new Date().toISOString(),
        network,
        activity,
      };
    }
    return storageRef.current.exportNetwork(networkId);
  }, [network, activity, networkId]);

  const importNetworkFn = useCallback((data: PromiseNetworkExport): { success: boolean; error?: string } => {
    if (!storageRef.current) return { success: false, error: "Storage not available" };
    const result = storageRef.current.importNetwork(data);
    if (result.success) {
      setNetwork(data.network);
      if (data.activity) setActivity(data.activity);
      logActivity("imported", "Network imported from file");
    }
    return result;
  }, [logActivity]);

  return {
    network,
    isLoaded,
    createPromise,
    updatePromise,
    updateStatus,
    renegotiatePromise,
    deletePromise,
    addAgent,
    updateAgent,
    deactivateAgent,
    addDomain,
    updateDomain,
    removeDomain,
    runCascadeSimulation,
    runCapacitySimulation,
    runAbsenceSimulation,
    simulationState,
    clearSimulation,
    networkHealth,
    agentStats,
    domainHealth,
    bottlenecks,
    getPromisesByStatus,
    getPromisesByDomain,
    getPromisesByAgent,
    updateConfig,
    exportNetwork: exportNetworkFn,
    importNetwork: importNetworkFn,
    activity,
  };
}
